"use client";

import { cn } from "@/lib/utils";
import type { Acorde } from "@/lib/acordes";

// ─────────────────────────────────────────────────────────────
// El mástil de un bajo de 4 cuerdas, con los trastes 0 a 7.
//
// Se marca FUERTE la nota del bajo y flojo el resto del acorde. El
// bajista casi siempre hace la fundamental, pero ver la quinta y la
// octava al lado le sirve para caminar sin salirse.
//
// 🔴 La nota fuerte NO es siempre la fundamental de lo escrito:
// en `F#m7/b5` el bajo hace F# (la `/b5` es una alteración, no un
// bajo), y en `A/G#m` hace G#. Eso lo resuelve `acordes.ts`; aquí
// solo se dibuja lo que aquel dice.
// ─────────────────────────────────────────────────────────────

/** Cuerdas al aire de un bajo, de la más grave a la más aguda. */
const CUERDAS = [
  { nombre: "G", pitch: 7 },
  { nombre: "D", pitch: 2 },
  { nombre: "A", pitch: 9 },
  { nombre: "E", pitch: 4 },
];
const TRASTES = 7;

const ANCHO_TRASTE = 26;
const ALTO_CUERDA = 15;
const MARGEN_IZQ = 16;
const MARGEN_SUP = 8;

const PITCH: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, "E#": 5, Fb: 4,
  F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10,
  B: 11, "B#": 0, Cb: 11,
};

export default function BassDiagram({
  acorde,
  className,
  leyenda = true,
}: {
  acorde: Acorde;
  className?: string;
  /** Explica qué es cada círculo. Isaac preguntó qué significaban: sin
      esto el dibujo no se entiende solo (2026-08-21). */
  leyenda?: boolean;
}) {
  const bajo = PITCH[acorde.bajo];
  const resto = new Set<number>();
  for (const n of acorde.notas) {
    const p = PITCH[n];
    if (p !== undefined && p !== bajo) resto.add(p);
  }

  const ancho = MARGEN_IZQ + ANCHO_TRASTE * TRASTES + 8;
  const alto = MARGEN_SUP * 2 + ALTO_CUERDA * (CUERDAS.length - 1);

  return (
    <div className={cn("w-full max-w-[260px]", className)}>
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Mástil de bajo con ${acorde.escrito}, nota ${acorde.bajo}`}
    >
      {/* La cejuela: el traste 0 se dibuja más grueso, como en el mástil. */}
      <line
        x1={MARGEN_IZQ} y1={MARGEN_SUP - 3} x2={MARGEN_IZQ} y2={alto - MARGEN_SUP + 3}
        className="stroke-slate-600 dark:stroke-slate-300" strokeWidth={3}
      />
      {Array.from({ length: TRASTES }, (_, t) => (
        <line
          key={`t${t}`}
          x1={MARGEN_IZQ + ANCHO_TRASTE * (t + 1)} y1={MARGEN_SUP - 3}
          x2={MARGEN_IZQ + ANCHO_TRASTE * (t + 1)} y2={alto - MARGEN_SUP + 3}
          className="stroke-slate-300 dark:stroke-slate-600" strokeWidth={1}
        />
      ))}
      {CUERDAS.map((c, i) => {
        const y = MARGEN_SUP + i * ALTO_CUERDA;
        return (
          <g key={c.nombre}>
            <line x1={MARGEN_IZQ} y1={y} x2={ancho - 8} y2={y} className="stroke-slate-400 dark:stroke-slate-500" strokeWidth={1} />
            <text x={2} y={y + 3} className="fill-slate-500 dark:fill-slate-400" fontSize={8}>{c.nombre}</text>
            {Array.from({ length: TRASTES + 1 }, (_, t) => {
              const semi = (c.pitch + t) % 12;
              // El traste 0 (cuerda al aire) se marca sobre la cejuela.
              const x = t === 0 ? MARGEN_IZQ - 6 : MARGEN_IZQ + ANCHO_TRASTE * t - ANCHO_TRASTE / 2;
              if (semi === bajo) return <circle key={t} cx={x} cy={y} r={5} className="fill-brand-500" />;
              if (resto.has(semi)) return <circle key={t} cx={x} cy={y} r={4} className="fill-none stroke-brand-400" strokeWidth={1.2} />;
              return null;
            })}
          </g>
        );
      })}
    </svg>
      {leyenda && (
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><circle cx="5" cy="5" r="4.5" className="fill-brand-500" /></svg>
            lo que toca el bajo
          </span>
          <span className="flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><circle cx="5" cy="5" r="4" className="fill-none stroke-brand-400" strokeWidth="1.4" /></svg>
            resto del acorde
          </span>
        </p>
      )}
    </div>
  );
}
