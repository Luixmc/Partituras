"use client";

import { RestFigure, FermataFigure, SlurFigure } from "@/components/sheets/MusicFigures";

// Barra de botones compartida para insertar acordes, alteraciones, duraciones,
// silencios, secciones y signos de repetición. La usan el editor y la página
// de nueva canción.

type Props = {
  onInsert: (text: string) => void;
  onDelete: () => void;
};

const ROOT_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const BASIC_ALT = ["#", "b", "m", "7"];
// Los botones dicen y escriben el nombre del acorde ("dim", "dim7"), que es
// como Isaac los busca y como los teclea a mano. El símbolo "°" es cosa de la
// LECTURA: lo pone formatSuffix al dibujar la cuadrícula. Se escribe "dim", se
// lee "°" — decisión suya del 2026-08-20, ver D-08b.
const EXT_ALT = ["maj7", "m7", "m7b5", "dim", "dim7", "aug", "sus2", "sus4", "add9"];
// Duraciones. Cada figura con sus DOS puntillos (O-49):
//   · un puntillo alarga la mitad      · dos puntillos, la mitad más un cuarto
//   semicorchea 0.25 · 0.375 · 0.4375     corchea 0.5 · 0.75 · 0.875
//   negra 1 · 1.5 · 1.75                  blanca 2 · 3 · 3.5      redonda 4 · 6 · 7
//
// 📌 Están TODAS con botón a propósito: `:0.4375` es impracticable de teclear,
// y con el botón da igual — es el mismo criterio que el staccato `!` (D-08),
// que casi nunca se escribe a mano porque tiene el suyo.
const DURATIONS = [
  ":0.25", ":0.375", ":0.4375",
  ":0.5", ":0.75", ":0.875",
  ":1", ":1.5", ":1.75",
  ":2", ":3", ":3.5",
  ":4", ":6", ":7",
];
// Silencios: token de la notación → tiempos que muestra la figura.
const RESTS: { token: string; beats: number; label: string }[] = [
  { token: "Z:4", beats: 4, label: "4" },
  { token: "Z:3", beats: 3, label: "2." },
  { token: "Z:2", beats: 2, label: "2" },
  { token: "Z:1.5", beats: 1.5, label: "1." },
  { token: "Z:1", beats: 1, label: "1" },
  // 🔴 Estos dos NO EXISTÍAN, y hasta el 2026-08-29 tampoco se dibujaban: todo
  // silencio de menos de 2 tiempos salía como silencio de NEGRA, así que un
  // `Z:0.5` se leía como el doble de lo que dura (O-49).
  { token: "Z:0.5", beats: 0.5, label: "1/2" },
  { token: "Z:0.25", beats: 0.25, label: "1/4" },
];
// Secciones de la estructura: "[...]". ("<...>" es texto centrado de la canción.)
const SECTIONS = ["[Intro]", "[Verso]", "[Coro]", "[Puente]", "[Final]"];
// Notas amarillas "<...>": etiquetas que se dibujan como una celda de acorde en
// amarillo, fluyendo con los acordes (partes A–G y secciones).
const LABELS = ["A", "B", "C", "D", "E", "F", "G", "Coro", "Intro", "Puente"];

export default function ChordToolbar({ onInsert, onDelete }: Props) {
  return (
    <div className="space-y-2">
      {/* Fila 1: notas base + alteraciones básicas + borrar */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2 dark:border-slate-700">
        {ROOT_NOTES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onInsert(n)}
            className="h-8 w-8 rounded bg-slate-100 text-xs font-bold text-slate-700 transition-colors hover:bg-brand-500 hover:text-white dark:bg-slate-800 dark:text-slate-200"
          >
            {n}
          </button>
        ))}
        <div className="mx-1 h-8 w-px bg-slate-200" />
        {BASIC_ALT.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onInsert(m)}
            className="h-8 min-w-[32px] rounded border border-slate-200 bg-slate-50 px-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {m}
          </button>
        ))}
        <div className="mx-1 h-8 w-px bg-slate-200" />
        <button
          type="button"
          onClick={onDelete}
          className="h-8 w-8 rounded border border-red-200 bg-red-50 text-xs font-medium text-red-500 transition-colors hover:bg-red-100"
          title="Borrar último"
        >
          ⌫
        </button>
      </div>

      {/* Fila 2: alteraciones extendidas + duración + bajo */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2 dark:border-slate-700">
        <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Alt:</span>
        {EXT_ALT.map((alt) => (
          <button
            key={alt}
            type="button"
            onClick={() => onInsert(alt)}
            className="h-7 rounded border border-brand-100 bg-brand-50 px-1.5 text-[9px] font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-200"
          >
            {/* El botón enseña el NOMBRE del acorde, no el símbolo: es como se
                busca y como se escribe a mano. (La Δ del maj7 ya venía así.) */}
            {alt === "maj7" ? "Δ" : alt}
          </button>
        ))}
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Dur:</span>
        {DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onInsert(d)}
            className="h-7 rounded border border-slate-200 bg-slate-100 px-1.5 text-[9px] font-semibold text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            {d}
          </button>
        ))}
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Bajo:</span>
        <button
          type="button"
          onClick={() => onInsert("/")}
          className="h-7 w-7 rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          /
        </button>
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Silencio:</span>
        {RESTS.map((r) => (
          <button
            key={r.token}
            type="button"
            onClick={() => onInsert(r.token)}
            className="flex h-7 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 text-[9px] font-semibold text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            title={`Silencio de ${r.label} tiempo(s)`}
          >
            <RestFigure beats={r.beats} className="h-4" />
            {r.label}
          </button>
        ))}
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Calderon:</span>
        <button
          type="button"
          onClick={() => onInsert("^")}
          className="flex h-7 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 text-[9px] font-semibold text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          title="Calderón (pausa/alargación) sobre el acorde anterior"
        >
          <FermataFigure className="h-3.5" />
        </button>
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Staccato:</span>
        <button
          type="button"
          onClick={() => onInsert("!")}
          className="flex h-7 w-7 items-end justify-center rounded border border-slate-200 bg-slate-50 pb-1 text-lg font-bold leading-none text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          title="Staccato: punto debajo del acorde anterior (se escribe !)"
        >
          •
        </button>
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Repeticion:</span>
        <button
          type="button"
          onClick={() => onInsert("%")}
          className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          title="Repetición del acorde anterior (se dibuja como acorde)"
        >
          %
        </button>
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Ligado:</span>
        <button
          type="button"
          onClick={() => onInsert("~")}
          className="flex h-7 w-9 items-center justify-center rounded border border-slate-200 bg-slate-50 px-1.5 text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          title="Ligadura: une el acorde anterior con el siguiente por arriba"
        >
          <span className="block h-2 w-6">
            <SlurFigure />
          </span>
        </button>
      </div>

      {/* Fila 3: secciones + repeticiones + barra de compás */}
      <div className="flex flex-wrap items-center gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onInsert(s + "\n")}
            className="rounded-md bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-200 dark:hover:bg-brand-900"
          >
            {s.replace(/[[\]]/g, "")}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => onInsert("|:")}
          className="rounded-md border border-brand-200 px-2.5 py-1 text-[11px] font-bold text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-950/50"
          title="Inicio de repetición"
        >
          𝄆 |:
        </button>
        <button
          type="button"
          onClick={() => onInsert(":|")}
          className="rounded-md border border-brand-200 px-2.5 py-1 text-[11px] font-bold text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-950/50"
          title="Fin de repetición"
        >
          :| 𝄇
        </button>
        <button
          type="button"
          onClick={() => onInsert("|")}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
        >
          | Barra
        </button>
        <button
          type="button"
          onClick={() => onInsert(";")}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
          title="Salto de línea (nueva fila)"
        >
          ↵ Nueva línea
        </button>
      </div>

      {/* Notas de texto amarillas "<...>": se insertan como celda amarilla. */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2 dark:border-slate-700">
        <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Nota:</span>
        {LABELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onInsert(`<${l}>`)}
            className="h-7 min-w-[28px] rounded border border-yellow-300 bg-yellow-50 px-1.5 text-[11px] font-bold text-yellow-700 transition-colors hover:bg-yellow-100 dark:border-yellow-700/60 dark:bg-yellow-950/40 dark:text-yellow-300"
            title={`Insertar nota de texto <${l}>`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Fila 4: recuadros / casillas (final 1 y 2) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Casilla:</span>
        <button
          type="button"
          onClick={() => onInsert("{")}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-slate-500 dark:border-slate-600 dark:text-slate-300"
          title="Abrir recuadro"
        >
          {"{"}
        </button>
        <button
          type="button"
          onClick={() => onInsert("}1")}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-slate-500 dark:border-slate-600 dark:text-slate-300"
          title="Cerrar recuadro (final 1)"
        >
          {"}1"}
        </button>
        <button
          type="button"
          onClick={() => onInsert("}2")}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-slate-500 dark:border-slate-600 dark:text-slate-300"
          title="Cerrar recuadro (final 2)"
        >
          {"}2"}
        </button>

        <span className="ml-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Compas:</span>
        {["2/4", "3/4", "4/4", "6/8", "12/8"].map((ts) => (
          <button
            key={ts}
            type="button"
            onClick={() => onInsert(ts)}
            className="rounded-md border border-slate-300 px-2 py-1 text-[10px] font-bold text-slate-600 transition-colors hover:border-slate-500 dark:border-slate-600 dark:text-slate-300"
            title={`Cambiar a compás ${ts}`}
          >
            {ts}
          </button>
        ))}
      </div>
    </div>
  );
}
