"use client";

// ─────────────────────────────────────────────────────────────
// El MOTOR del reproductor de la melodía (O-75, fase 2).
//
// Reproducir · pausar · detener · repetir · tempo · metrónomo, y el reloj que
// dice qué nota va sonando. Las cuentas están en `lib/reproduccion.ts`, que
// cubre el CI; esto solo las lleva al audio del navegador, y por eso no se
// puede probar sin él.
//
// 📌 NO HAY DEPENDENCIA NUEVA: es el sintetizador que ya trae `abcjs` (el mismo
// de la fase 1), cargado con `import()` diferido para que no lo pague quien no
// abre la melodía. Los sonidos, del mismo servidor de fuera que eligió Isaac
// (`SONIDOS`), más la percusión del metrónomo, ~10 KB por golpe.
//
// 🔴 EL RELOJ ES EL DEL AUDIO, no el de la página: la nota que se colorea sale
// de `audioContext.currentTime − startTimeSec`, que es literalmente dónde va
// el sonido. Con un temporizador propio, cualquier retraso al arrancar dejaría
// el color un pelo por detrás de lo que se oye, y el que lee cree que va mal.
// ─────────────────────────────────────────────────────────────

import type { Elemento } from "@/lib/melodia";
import {
  abcParaSonar,
  corcheasDeEntrada,
  duracionTotal,
  lineaDeTiempo,
  momentoEn,
  msPorCorchea,
  multiplicadorVolumen,
  pulsoDe,
  tempoValido,
  type Momento,
} from "@/lib/reproduccion";
import { INSTRUMENTOS, SONIDOS, type Instrumento } from "@/lib/sonido";

export type EstadoReproductor = "parado" | "cargando" | "sonando" | "pausado" | "error";

export type Ajustes = {
  tramos: Elemento[][];
  compas?: string | null;
  tono?: string | null;
  tempo: number;
  instrumento: Instrumento;
  metronomo: boolean;
  repetir: boolean;
  /** Cuánto se mueve lo que suena (el tono del culto en la presentación). */
  semitonos: number;
  /** Un compás de cuenta antes de empezar (fase 3). */
  entrada: boolean;
  /** De 10 a 100 % (fase 3). */
  volumen: number;
};

export type Aviso = {
  estado: EstadoReproductor;
  momento: Momento | null;
  /** De 0 a 1, para la barra de progreso. */
  progreso: number;
  /** Mientras se cuenta la entrada, el pulso por el que va (1, 2, 3…); si no, `null`. */
  cuenta: number | null;
};

/** Lo que se usa del sintetizador de `abcjs` que sus tipos no declaran. */
type Sintetizador = {
  init(p: unknown): Promise<unknown>;
  prime(): Promise<unknown>;
  start(): void;
  pause(): number;
  stop(): number;
  seek(posicion: number, unidades?: string): void;
  startTimeSec?: number;
};

export class Reproductor {
  private sintetizador: Sintetizador | null = null;
  private contexto: AudioContext | null = null;
  private ajustes: Ajustes | null = null;
  private linea: Momento[] = [];
  private total = 0; // en corcheas
  private posicion = 0; // en corcheas, al pausar o detener
  // Lo que dura la cuenta de entrada, en corcheas. El audio empieza con ella;
  // la MELODÍA, después. El reloj la descuenta (fase 3).
  private entrada = 0;
  private estado: EstadoReproductor = "parado";
  private cuadro = 0;
  // Cada preparación lleva su número: si llega tarde —porque el músico ya
  // cambió el tempo otra vez—, se descarta en vez de pisar a la nueva.
  private turno = 0;

  constructor(private avisar: (a: Aviso) => void) {}

  /** Si hay algo que tocar con estos ajustes. */
  static hayQueTocar(ajustes: Pick<Ajustes, "tramos" | "instrumento">): boolean {
    const programa = INSTRUMENTOS.find((i) => i.id === ajustes.instrumento)?.programa;
    return programa != null && lineaDeTiempo(ajustes.tramos).length > 0;
  }

  /** Reproducir, o seguir desde la pausa. */
  async reproducir(ajustes: Ajustes): Promise<void> {
    if (this.estado === "sonando") return;
    const mismo = this.sintetizador && this.ajustes && iguales(this.ajustes, ajustes);
    if (!mismo) {
      const listo = await this.preparar(ajustes);
      if (!listo) return;
    }
    this.arrancar();
  }

  pausar(): void {
    if (this.estado !== "sonando" || !this.sintetizador) return;
    // Pausar durante la cuenta deja la posición en cero: al seguir, se cuenta otra vez.
    this.posicion = Math.max(0, this.ahora());
    this.sintetizador.pause();
    cancelAnimationFrame(this.cuadro);
    this.aviso("pausado", momentoEn(this.linea, this.posicion));
  }

  detener(): void {
    cancelAnimationFrame(this.cuadro);
    try {
      this.sintetizador?.stop();
    } catch {
      /* ya estaba parado */
    }
    this.posicion = 0;
    this.aviso("parado", null);
  }

  /**
   * Cambió algo mientras sonaba —tempo, metrónomo, instrumento—: se rehace el
   * sonido y se sigue **desde la misma nota**, como en flat.io.
   */
  async cambiar(ajustes: Ajustes): Promise<void> {
    const sonaba = this.estado === "sonando";
    // ⚠️ «Cargando» también cuenta como «quería sonar»: si se cambia el tempo
    // mientras bajan los sonidos, la preparación vieja se descarta (por su
    // turno) y sigue la nueva. Si no, arrancaría con el tempo viejo y el color
    // de la nota iría desfasado del sonido.
    const seguir = sonaba || this.estado === "cargando";
    if (sonaba) {
      this.posicion = Math.max(0, this.ahora());
      cancelAnimationFrame(this.cuadro);
      try {
        this.sintetizador?.stop();
      } catch {
        /* ya estaba parado */
      }
    }
    // Repetir no cambia el sonido: basta con recordarlo.
    if (this.sintetizador && this.ajustes && iguales(this.ajustes, ajustes)) {
      this.ajustes = ajustes;
      if (sonaba) this.arrancar();
      return;
    }
    this.sintetizador = null;
    this.ajustes = ajustes;
    if (!seguir) {
      this.turno++;
      return; // se preparará al darle a reproducir
    }
    const listo = await this.preparar(ajustes);
    if (listo) this.arrancar();
  }

  /** Al salir de la pantalla o pasar de canción: que no siga sonando nada. */
  destruir(): void {
    this.turno++;
    this.detener();
    this.sintetizador = null;
  }

  // ── Por dentro ──

  private async preparar(ajustes: Ajustes): Promise<boolean> {
    const turno = ++this.turno;
    this.ajustes = ajustes;
    this.linea = lineaDeTiempo(ajustes.tramos);
    this.total = duracionTotal(this.linea);
    const programa = INSTRUMENTOS.find((i) => i.id === ajustes.instrumento)?.programa;
    if (programa == null || !this.linea.length) {
      this.aviso("parado", null);
      return false;
    }
    this.aviso("cargando", momentoEn(this.linea, this.posicion));
    try {
      const abcjs = await import("abcjs");
      if (!abcjs.synth.supportsAudio()) throw new Error("sin audio");
      // `"*"` = leer la partitura sin dibujarla: lo que se VE son los
      // pentagramas de cada sección; esto es solo para el sonido.
      // El metrónomo va DENTRO del ABC, como segunda voz: ver `vozMetronomo`.
      const [tune] = abcjs.renderAbc(
        "*",
        abcParaSonar({
          tramos: ajustes.tramos,
          compas: ajustes.compas,
          tono: ajustes.tono,
          tempo: ajustes.tempo,
          metronomo: ajustes.metronomo,
          entrada: ajustes.entrada,
        })
      );
      const sintetizador = new abcjs.synth.CreateSynth() as unknown as Sintetizador;
      await sintetizador.init({
        visualObj: tune,
        options: {
          soundFontUrl: SONIDOS,
          program: programa,
          midiTranspose: ajustes.semitonos,
          qpm: tempoValido(ajustes.tempo),
          // El volumen se fija AQUÍ: abcjs lo mezcla al preparar, y cambiarlo
          // obliga a rehacer el sonido (fase 3, ver §9.2 del CLAUDE.md).
          soundFontVolumeMultiplier: multiplicadorVolumen(ajustes.volumen),
        },
      });
      await sintetizador.prime();
      if (turno !== this.turno) return false; // llegó tarde: ya hay otra
      this.sintetizador = sintetizador;
      this.entrada = corcheasDeEntrada(ajustes.compas, ajustes.entrada);
      this.contexto = (abcjs.synth as unknown as { activeAudioContext(): AudioContext }).activeAudioContext();
      return true;
    } catch {
      // ⚠️ Sin internet, sin audio o sin respuesta del servidor de sonidos: se
      // dice, y la partitura sigue ahí para leerla.
      if (turno === this.turno) this.aviso("error", null);
      return false;
    }
  }

  /**
   * @param contar  Si suena la cuenta de entrada. Por defecto, solo al empezar
   *                desde el principio: al SEGUIR desde la pausa o al REPETIR,
   *                se entra directo — así lo hace flat.io.
   */
  private arrancar(contar = this.posicion <= 0): void {
    if (!this.sintetizador || !this.ajustes) return;
    if (this.posicion >= this.total) this.posicion = 0;
    // El audio lleva la cuenta delante: la melodía empieza en `entrada`.
    const enElAudio = contar ? 0 : this.posicion + this.entrada;
    this.sintetizador.seek((enElAudio * msPorCorchea(this.ajustes.tempo)) / 1000, "seconds");
    this.sintetizador.start();
    this.estado = "sonando";
    this.latir();
  }

  /**
   * Dónde va la MELODÍA, en corcheas, leído del reloj del audio.
   * ⚠️ Es NEGATIVO mientras suena la cuenta de entrada: la melodía aún no ha
   * empezado.
   */
  private ahora(): number {
    const s = this.sintetizador;
    if (!s || !this.ajustes || !this.contexto || s.startTimeSec == null) return this.posicion;
    const segundos = this.contexto.currentTime - s.startTimeSec;
    return (segundos * 1000) / msPorCorchea(this.ajustes.tempo) - this.entrada;
  }

  private latir = (): void => {
    const t = this.ahora();
    if (t >= this.total) {
      if (this.ajustes?.repetir) {
        // Vuelta al principio sin volver a preparar: los sonidos ya están.
        this.sintetizador?.stop();
        this.posicion = 0;
        this.arrancar(false); // al repetir no se vuelve a contar
        return;
      }
      this.detener();
      return;
    }
    if (t < 0) {
      // La cuenta: qué pulso va sonando, para enseñarlo en grande.
      const pulso = pulsoDe(this.ajustes?.compas).corcheas;
      this.aviso("sonando", null, 0, Math.floor((t + this.entrada) / pulso) + 1);
    } else {
      this.aviso("sonando", momentoEn(this.linea, t), t);
    }
    this.cuadro = requestAnimationFrame(this.latir);
  };

  private aviso(
    estado: EstadoReproductor,
    momento: Momento | null,
    t = this.posicion,
    cuenta: number | null = null
  ): void {
    this.estado = estado;
    const progreso = this.total ? Math.min(1, Math.max(0, t) / this.total) : 0;
    this.avisar({ estado, momento, progreso, cuenta });
  }
}

/** Si dos ajustes SUENAN igual. Repetir no cuenta: no cambia el sonido. */
function iguales(a: Ajustes, b: Ajustes): boolean {
  return (
    a.tramos === b.tramos &&
    a.compas === b.compas &&
    a.tono === b.tono &&
    a.tempo === b.tempo &&
    a.instrumento === b.instrumento &&
    a.metronomo === b.metronomo &&
    a.semitonos === b.semitonos &&
    a.entrada === b.entrada &&
    a.volumen === b.volumen
  );
}
