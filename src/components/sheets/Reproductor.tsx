"use client";

// ─────────────────────────────────────────────────────────────
// La BARRA del reproductor de la melodía (O-75, fase 2).
//
// Isaac: «botones de reproducir, pausar, metrónomo y demás herramientas que
// tiene por ejemplo la página de flat.io». Aquí: ▶/⏸ · ⏹ · tempo · metrónomo ·
// repetir · el instrumento, y una barra de progreso. La nota que suena se
// colorea en el pentagrama (eso lo hace `Pentagrama` con lo que se le avisa).
//
// Sirve para el editor Y para la presentación: el que la usa le pasa las
// secciones y le dice qué hacer con la nota que suena.
// ─────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Pause, Play, Plus, Repeat, Square, Volume2 } from "lucide-react";

import type { Elemento } from "@/lib/melodia";
import {
  TEMPO_MAXIMO,
  TEMPO_MINIMO,
  VOLUMEN_MAXIMO,
  VOLUMEN_MINIMO,
  tempoValido,
  type Momento,
} from "@/lib/reproduccion";
import { Reproductor as Motor, type Ajustes, type Aviso } from "@/lib/reproductor";
import {
  INSTRUMENTOS,
  guardarEntrada,
  guardarInstrumento,
  guardarVolumen,
  useEntrada,
  useInstrumento,
  useVolumen,
  type Instrumento,
} from "@/lib/sonido";
import { cn } from "@/lib/utils";

type Props = {
  /** Las secciones, ya leídas. Las vacías se respetan: no suenan. */
  tramos: Elemento[][];
  compas?: string | null;
  tono?: string | null;
  /** El tempo de la canción, si lo tiene. Si no, 80. */
  tempoInicial?: number | null;
  /** Cuánto se mueve lo que SUENA (el tono del culto en la presentación). */
  semitonos?: number;
  /** La nota que suena, o `null`. Solo se llama cuando CAMBIA. */
  onMomento?: (m: Momento | null) => void;
  /**
   * La cabecera fija que hay encima, si la hay (un selector): la barra se pega
   * JUSTO DEBAJO de ella. Sin esto se metería por detrás.
   */
  debajoDe?: string;
  className?: string;
};

const PASO_TEMPO = 5;

export default function Reproductor({
  tramos,
  compas,
  tono,
  tempoInicial,
  semitonos = 0,
  onMomento,
  debajoDe,
  className,
}: Props) {
  const instrumento = useInstrumento();
  // Fase 3: la cuenta de entrada y el volumen, recordados en el aparato.
  const entrada = useEntrada();
  const volumen = useVolumen();

  // ── La barra se queda PEGADA arriba mientras se baja por la partitura ──
  //
  // 🔴 Visto en la primera prueba (2026-09-10): para enseñar la nota que suena
  // la página baja sola, y la barra se iba por arriba — no había forma de
  // pausar sin volver a subir. En el editor hay además una cabecera fija, así
  // que se mide su alto (cambia: en el teléfono los botones van en dos filas).
  // 📌 Se mide con `ResizeObserver`, que avisa también al empezar: así no hace
  // falta llamar a `setState` dentro del efecto.
  const [arriba, setArriba] = useState(0);
  useEffect(() => {
    const cabecera = debajoDe ? document.querySelector<HTMLElement>(debajoDe) : null;
    if (!cabecera) return;
    const observador = new ResizeObserver(() => setArriba(cabecera.getBoundingClientRect().height));
    observador.observe(cabecera);
    return () => observador.disconnect();
  }, [debajoDe]);
  const [tempo, setTempo] = useState(() => tempoValido(tempoInicial));
  const [metronomo, setMetronomo] = useState(false);
  const [repetir, setRepetir] = useState(false);
  const [aviso, setAviso] = useState<Aviso>({ estado: "parado", momento: null, progreso: 0, cuenta: null });

  // El que avisa se guarda en una referencia: cambia en cada pintado del padre,
  // y el motor no puede rehacerse por eso.
  const avisarFuera = useRef(onMomento);
  useEffect(() => {
    avisarFuera.current = onMomento;
  }, [onMomento]);

  const motor = useRef<Motor | null>(null);
  useEffect(() => {
    let ultimo: Aviso = { estado: "parado", momento: null, progreso: 0, cuenta: null };
    const clave = (m: Momento | null) => (m ? `${m.tramo}:${m.orden}` : "");
    const m = new Motor((a) => {
      const cambioNota = clave(a.momento) !== clave(ultimo.momento);
      // 🔴 Se avisa SOLO cuando cambia algo que se ve: el motor late 60 veces
      // por segundo, y pintar la pantalla entera a ese ritmo ahoga una tablet.
      if (cambioNota) avisarFuera.current?.(a.momento);
      if (
        cambioNota ||
        a.estado !== ultimo.estado ||
        a.cuenta !== ultimo.cuenta ||
        Math.abs(a.progreso - ultimo.progreso) > 0.005
      ) {
        ultimo = a;
        setAviso(a);
      }
    });
    motor.current = m;
    return () => {
      m.destruir();
      avisarFuera.current?.(null);
    };
  }, []);

  const ajustes: Ajustes = useMemo(
    () => ({ tramos, compas, tono, tempo, instrumento, metronomo, repetir, semitonos, entrada, volumen }),
    [tramos, compas, tono, tempo, instrumento, metronomo, repetir, semitonos, entrada, volumen]
  );

  // Si cambia algo mientras suena, se sigue desde la misma nota.
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    void motor.current?.cambiar(ajustes);
  }, [ajustes]);

  const sinSonido = instrumento === "silencio";
  const hayNotas = Motor.hayQueTocar({ tramos, instrumento: "piano" });
  const { estado, progreso } = aviso;
  const sonando = estado === "sonando";

  const alternar = () => {
    if (sonando) motor.current?.pausar();
    else void motor.current?.reproducir(ajustes);
  };

  const boton =
    "inline-flex items-center justify-center rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800";
  const activo = "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950 dark:text-brand-300";

  if (!hayNotas) return null;

  return (
    <div
      className={cn(
        "sticky z-[5] rounded-xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95",
        className
      )}
      style={{ top: arriba + 8 }}
      data-reproductor={estado}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={alternar}
          disabled={sinSonido || estado === "cargando"}
          title={sonando ? "Pausar" : "Reproducir"}
          aria-label={sonando ? "Pausar" : "Reproducir"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sonando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        {/* El pulso de la CUENTA DE ENTRADA, en grande: «1, 2, 3, 4» y entra
            la melodía. `data-cuenta` es para poder medirlo (§2.3-bis). */}
        {aviso.cuenta != null && (
          <span
            data-cuenta={aviso.cuenta}
            aria-live="polite"
            className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-amber-400 px-2 text-lg font-bold tabular-nums text-slate-900"
          >
            {aviso.cuenta}
          </span>
        )}
        <button
          type="button"
          onClick={() => motor.current?.detener()}
          disabled={estado === "parado"}
          title="Detener"
          aria-label="Detener"
          className={boton}
        >
          <Square className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1" title="Tempo, en negras por minuto">
          <button
            type="button"
            onClick={() => setTempo((t) => tempoValido(t - PASO_TEMPO))}
            disabled={tempo <= TEMPO_MINIMO}
            aria-label="Más lento"
            className={boton}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[4.5rem] text-center text-sm tabular-nums text-slate-700 dark:text-slate-200">
            ♩ = {tempo}
          </span>
          <button
            type="button"
            onClick={() => setTempo((t) => tempoValido(t + PASO_TEMPO))}
            disabled={tempo >= TEMPO_MAXIMO}
            aria-label="Más rápido"
            className={boton}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMetronomo((v) => !v)}
          aria-pressed={metronomo}
          className={cn(boton, metronomo && activo)}
        >
          Metrónomo
        </button>
        <button
          type="button"
          onClick={() => guardarEntrada(!entrada)}
          aria-pressed={entrada}
          title="Un compás de golpes antes de empezar"
          className={cn(boton, entrada && activo)}
        >
          Cuenta
        </button>
        <button
          type="button"
          onClick={() => setRepetir((v) => !v)}
          aria-pressed={repetir}
          title="Volver a empezar al terminar"
          className={cn(boton, "gap-1.5", repetir && activo)}
        >
          <Repeat className="h-4 w-4" />
          Repetir
        </button>

        <div className="flex items-center gap-1" title="Volumen">
          <button
            type="button"
            onClick={() => guardarVolumen(volumen - 10)}
            disabled={volumen <= VOLUMEN_MINIMO}
            aria-label="Bajar el volumen"
            className={boton}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="inline-flex min-w-[4.5rem] items-center justify-center gap-1 text-sm tabular-nums text-slate-700 dark:text-slate-200">
            <Volume2 className="h-4 w-4" aria-hidden />
            {volumen} %
          </span>
          <button
            type="button"
            onClick={() => guardarVolumen(volumen + 10)}
            disabled={volumen >= VOLUMEN_MAXIMO}
            aria-label="Subir el volumen"
            className={boton}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <select
          value={instrumento}
          onChange={(e) => guardarInstrumento(e.target.value as Instrumento)}
          aria-label="Instrumento"
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          {INSTRUMENTOS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.icono} {i.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 h-1 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
        <div className="h-full bg-brand-500" style={{ width: `${Math.round(progreso * 1000) / 10}%` }} />
      </div>

      {(sinSonido || estado === "cargando" || estado === "error") && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {sinSonido
            ? "Está en «Sin sonido»: elige 🎺 trompeta o 🎹 piano para oírla."
            : estado === "cargando"
              ? "Cargando los sonidos…"
              : "No se pudo cargar el sonido. ¿Hay internet?"}
        </p>
      )}
    </div>
  );
}
