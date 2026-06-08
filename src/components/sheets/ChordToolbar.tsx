"use client";

import { RestFigure } from "@/components/sheets/MusicFigures";

// Barra de botones compartida para insertar acordes, alteraciones, duraciones,
// silencios, secciones y signos de repetición. La usan el editor y la página
// de nueva canción.

type Props = {
  onInsert: (text: string) => void;
  onDelete: () => void;
};

const ROOT_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const BASIC_ALT = ["#", "b", "m", "7"];
const EXT_ALT = ["maj7", "m7", "m7b5", "dim", "dim7", "aug", "sus2", "sus4", "add9"];
const DURATIONS = [":0.5", ":1", ":2", ":3", ":4"];
// Silencios: token de la notación → tiempos que muestra la figura.
const RESTS: { token: string; beats: number; label: string }[] = [
  { token: "Z:4", beats: 4, label: "4" },
  { token: "Z:2", beats: 2, label: "2" },
  { token: "Z:1", beats: 1, label: "1" },
];
const SECTIONS = ["<Intro>", "<Verso>", "<Coro>", "<Puente>", "<Final>"];

export default function ChordToolbar({ onInsert, onDelete }: Props) {
  return (
    <div className="space-y-2">
      {/* Fila 1: notas base + alteraciones básicas + borrar */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
        {ROOT_NOTES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onInsert(n)}
            className="h-8 w-8 rounded bg-slate-100 text-xs font-bold text-slate-700 transition-colors hover:bg-brand-500 hover:text-white"
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
            className="h-8 min-w-[32px] rounded border border-slate-200 bg-slate-50 px-1 text-xs font-medium text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600"
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
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2">
        <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Alt:</span>
        {EXT_ALT.map((alt) => (
          <button
            key={alt}
            type="button"
            onClick={() => onInsert(alt)}
            className="h-7 rounded border border-brand-100 bg-brand-50 px-1.5 text-[9px] font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            {alt}
          </button>
        ))}
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Dur:</span>
        {DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onInsert(d)}
            className="h-7 rounded border border-slate-200 bg-slate-100 px-1.5 text-[9px] font-semibold text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            {d}
          </button>
        ))}
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Bajo:</span>
        <button
          type="button"
          onClick={() => onInsert("/")}
          className="h-7 w-7 rounded border border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600"
        >
          /
        </button>
        <span className="mx-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Silencio:</span>
        {RESTS.map((r) => (
          <button
            key={r.token}
            type="button"
            onClick={() => onInsert(r.token)}
            className="flex h-7 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 text-[9px] font-semibold text-slate-600 transition-colors hover:border-brand-500 hover:text-brand-600"
            title={`Silencio de ${r.label} tiempo(s)`}
          >
            <RestFigure beats={r.beats} className="h-4" />
            {r.label}
          </button>
        ))}
      </div>

      {/* Fila 3: secciones + repeticiones + barra de compás */}
      <div className="flex flex-wrap items-center gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onInsert(s + "\n")}
            className="rounded-md bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 transition-colors hover:bg-brand-100"
          >
            {s.replace(/[<>]/g, "")}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => onInsert("|:")}
          className="rounded-md border border-brand-200 px-2.5 py-1 text-[11px] font-bold text-brand-600 transition-colors hover:bg-brand-50"
          title="Inicio de repetición"
        >
          𝄆 |:
        </button>
        <button
          type="button"
          onClick={() => onInsert(":|")}
          className="rounded-md border border-brand-200 px-2.5 py-1 text-[11px] font-bold text-brand-600 transition-colors hover:bg-brand-50"
          title="Fin de repetición"
        >
          :| 𝄇
        </button>
        <button
          type="button"
          onClick={() => onInsert("|")}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:border-slate-400"
        >
          | Barra
        </button>
      </div>

      {/* Fila 4: recuadros / casillas (final 1 y 2) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Casilla:</span>
        <button
          type="button"
          onClick={() => onInsert("{")}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-slate-500"
          title="Abrir recuadro"
        >
          {"{"}
        </button>
        <button
          type="button"
          onClick={() => onInsert("}1")}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-slate-500"
          title="Cerrar recuadro (final 1)"
        >
          {"}1"}
        </button>
        <button
          type="button"
          onClick={() => onInsert("}2")}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors hover:border-slate-500"
          title="Cerrar recuadro (final 2)"
        >
          {"}2"}
        </button>
      </div>
    </div>
  );
}
