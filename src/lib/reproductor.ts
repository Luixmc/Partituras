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
  duracionTotal,
  lineaDeTiempo,
  momentoEn,
  msPorCorchea,
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
};

export type Aviso = {
  estado: EstadoReproductor;
  momento: Momento | null;
  /** De 0 a 1, para la barra de progreso. */
  progreso: number;
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
    this.posicion = this.ahora();
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
      this.posicion = this.ahora();
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
        },
      });
      await sintetizador.prime();
      if (turno !== this.turno) return false; // llegó tarde: ya hay otra
      this.sintetizador = sintetizador;
      this.contexto = (abcjs.synth as unknown as { activeAudioContext(): AudioContext }).activeAudioContext();
      return true;
    } catch {
      // ⚠️ Sin internet, sin audio o sin respuesta del servidor de sonidos: se
      // dice, y la partitura sigue ahí para leerla.
      if (turno === this.turno) this.aviso("error", null);
      return false;
    }
  }

  private arrancar(): void {
    if (!this.sintetizador || !this.ajustes) return;
    if (this.posicion >= this.total) this.posicion = 0;
    this.sintetizador.seek((this.posicion * msPorCorchea(this.ajustes.tempo)) / 1000, "seconds");
    this.sintetizador.start();
    this.estado = "sonando";
    this.latir();
  }

  /** Dónde va el sonido, en corcheas, leído del reloj del audio. */
  private ahora(): number {
    const s = this.sintetizador;
    if (!s || !this.ajustes || !this.contexto || s.startTimeSec == null) return this.posicion;
    const segundos = this.contexto.currentTime - s.startTimeSec;
    return Math.max(0, (segundos * 1000) / msPorCorchea(this.ajustes.tempo));
  }

  private latir = (): void => {
    const t = this.ahora();
    if (t >= this.total) {
      if (this.ajustes?.repetir) {
        // Vuelta al principio sin volver a preparar: los sonidos ya están.
        this.sintetizador?.stop();
        this.posicion = 0;
        this.arrancar();
        return;
      }
      this.detener();
      return;
    }
    this.aviso("sonando", momentoEn(this.linea, t), t);
    this.cuadro = requestAnimationFrame(this.latir);
  };

  private aviso(estado: EstadoReproductor, momento: Momento | null, t = this.posicion): void {
    this.estado = estado;
    this.avisar({ estado, momento, progreso: this.total ? Math.min(1, t / this.total) : 0 });
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
    a.semitonos === b.semitonos
  );
}
