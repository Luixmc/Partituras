"use client";

import { cn } from "@/lib/utils";
import type { Acorde } from "@/lib/acordes";
import { posicionDe, CUERDAS_GUITARRA } from "@/lib/guitarra";

// ─────────────────────────────────────────────────────────────
// El acorde dibujado en el mástil, como en cualquier libro de partituras:
// seis cuerdas de arriba abajo, los trastes en vertical, un punto
// donde va cada dedo.
//
//   ×  = esa cuerda no se toca
//   ○  = se toca al aire, sin pisar
//   ●  = se pisa ahí
//   ▬  = cejilla: un dedo cruzando varias cuerdas
//
// Si el acorde no se toca en los primeros trastes, sale el número
// del traste a la izquierda — que es como se lee un diagrama de
// verdad, no dibujando veinte trastes vacíos.
//
// 🔴 Si `posicionDe` devuelve `null`, aquí no se dibuja nada. Una
// postura inventada la tocaría alguien en un culto.
// ─────────────────────────────────────────────────────────────

const CUERDAS = 6;
const FILAS = 5;          // trastes visibles
const PASO_X = 15;        // separación entre cuerdas
const PASO_Y = 17;        // separación entre trastes
const MARGEN_X = 16;      // sitio para el número del traste
const MARGEN_Y = 14;      // sitio para los ○ y × de arriba

export default function GuitarDiagram({ acorde, className }: { acorde: Acorde; className?: string }) {
  const pos = posicionDe(acorde);
  if (!pos) return null;

  // Dónde empieza el dibujo. Con acorde al aire se enseña desde el
  // traste 1 y la cejuela va gruesa; si no, desde el traste de la cejilla.
  const alAire = pos.base === 0;
  const primerTraste = alAire ? 1 : pos.base;

  const ancho = MARGEN_X + PASO_X * (CUERDAS - 1) + 12;
  const alto = MARGEN_Y + PASO_Y * FILAS + 6;

  const x = (cuerda: number) => MARGEN_X + cuerda * PASO_X;
  const y = (fila: number) => MARGEN_Y + fila * PASO_Y;

  // La cejilla: si varias cuerdas se pisan justo en el traste base, es
  // un dedo cruzando. Se dibuja como una barra, que es como se agarra.
  const enBase = pos.trastes
    .map((t, i) => (t === pos.base && pos.base > 0 ? i : -1))
    .filter((i) => i >= 0);
  const hayCejilla = enBase.length >= 2;

  return (
    <div className={cn("w-full max-w-[130px]", className)}>
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Guitarra: ${acorde.escrito}${alAire ? " al aire" : ` con cejilla en el traste ${pos.base}`}`}
      >
        {/* Cuerdas */}
        {Array.from({ length: CUERDAS }, (_, i) => (
          <line
            key={`c${i}`}
            x1={x(i)} y1={y(0)} x2={x(i)} y2={y(FILAS)}
            className="stroke-slate-400 dark:stroke-slate-500" strokeWidth={1}
          />
        ))}

        {/* Trastes. El 0 va grueso solo si es la cejuela de verdad. */}
        {Array.from({ length: FILAS + 1 }, (_, f) => (
          <line
            key={`t${f}`}
            x1={x(0)} y1={y(f)} x2={x(CUERDAS - 1)} y2={y(f)}
            className={
              f === 0 && alAire
                ? "stroke-slate-700 dark:stroke-slate-200"
                : "stroke-slate-300 dark:stroke-slate-600"
            }
            strokeWidth={f === 0 && alAire ? 3 : 1}
          />
        ))}

        {/* El traste donde empieza, cuando no es al aire. */}
        {!alAire && (
          <text
            x={2} y={y(0) + PASO_Y / 2 + 3}
            className="fill-slate-500 dark:fill-slate-400"
            fontSize={10} fontWeight={600}
          >
            {pos.base}
          </text>
        )}

        {/* La cejilla, antes que los puntos para que estos queden encima. */}
        {hayCejilla && (
          <rect
            x={x(Math.min(...enBase)) - 4}
            y={y(0) + PASO_Y / 2 - 4}
            width={x(Math.max(...enBase)) - x(Math.min(...enBase)) + 8}
            height={8}
            rx={4}
            className="fill-brand-500"
          />
        )}

        {pos.trastes.map((t, i) => {
          // Cuerda muda: una × encima del mástil.
          if (t === null) {
            return (
              <text
                key={`m${i}`} x={x(i)} y={MARGEN_Y - 4}
                textAnchor="middle" fontSize={9}
                className="fill-slate-400 dark:fill-slate-500"
              >
                ×
              </text>
            );
          }
          // Al aire: un círculo hueco encima, sin pisar nada.
          if (t === 0) {
            return (
              <circle
                key={`a${i}`} cx={x(i)} cy={MARGEN_Y - 7} r={3}
                className="fill-none stroke-slate-500 dark:stroke-slate-400" strokeWidth={1.2}
              />
            );
          }
          const fila = t - primerTraste;
          if (fila < 0 || fila >= FILAS) return null;
          return (
            <circle
              key={`p${i}`} cx={x(i)} cy={y(fila) + PASO_Y / 2} r={4.5}
              className="fill-brand-500"
            />
          );
        })}
      </svg>

      <p className="mt-1 text-center text-[11px] leading-tight text-slate-500 dark:text-slate-400">
        {alAire ? "al aire" : `cejilla en el ${pos.base}`}
        {" · "}
        fundamental en la {pos.cuerdaRaiz}ª
      </p>
    </div>
  );
}
