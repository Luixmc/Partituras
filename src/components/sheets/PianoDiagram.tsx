"use client";

import { cn } from "@/lib/utils";
import { semitonoDe, type Acorde } from "@/lib/acordes";

// ─────────────────────────────────────────────────────────────
// El acorde marcado sobre un teclado.
//
// CUÁNTAS OCTAVAS — lo decidió Isaac el 2026-08-21 viéndolo en pantalla:
//
//   · UNA octava cuando el bajo es la fundamental. Vale igual para los
//     acordes complicados: `E#m2/b5` en una octava está bien.
//   · DOS cuando el bajo es OTRA nota (`F/A`, `A/G#m`), porque entonces
//     hay dos manos y hay que ver dónde cae cada una. Sus palabras:
//     «aquí sí es necesario que salga en dos o tres octavas».
//
// Antes se dibujaban siempre dos, y sobraba una en el 95 % de los casos.
// ─────────────────────────────────────────────────────────────

/** Semitonos de las 7 blancas dentro de una octava. */
const BLANCAS = [0, 2, 4, 5, 7, 9, 11];
/** Semitono de cada negra y a qué blanca se pega por la izquierda. */
const NEGRAS = [
  { semi: 1, tras: 0 }, { semi: 3, tras: 1 },
  { semi: 6, tras: 3 }, { semi: 8, tras: 4 }, { semi: 10, tras: 5 },
];

// Teclas blancas de CONTEXTO a cada lado, sin marcar. Isaac, 2026-08-21:
// «que salga más teclas a los lados… pero que solo marque el acorde». Sirven
// para situar la mano: un acorde suelto sobre siete teclas no dice en qué
// parte del teclado cae.
//
// Empezó en 4 y él lo bajó el mismo día: «sobran muchas teclas, que no sean
// tantas, tanto de izquierda como de derecha».
const RELLENO = 2;

const ANCHO_BLANCA = 14;
const ALTO_BLANCA = 58;
const ANCHO_NEGRA = 9;
const ALTO_NEGRA = 36;


const semi = semitonoDe;

/**
 * Coloca las notas en el teclado de verdad, con su octava.
 *
 * Devuelve posiciones ABSOLUTAS (0 = do de la octava de abajo). No basta
 * con la clase de nota: en `A/G#m` el `G#` de la izquierda y el de la
 * derecha son teclas distintas, y ahí está justo lo que hay que ver.
 */
function colocar(acorde: Acorde): { derecha: Set<number>; izquierda: Set<number>; bajo: number | null; octavas: 1 | 3 } {
  const raiz = semi(acorde.notas[0]);
  const notaBajo = semi(acorde.bajo);
  const hayOtroBajo = notaBajo !== null && notaBajo !== raiz;

  // Sin bajo distinto: todo cabe en una octava y se deja tal cual, que es
  // como Isaac lo aprobó el 2026-08-21.
  if (!hayOtroBajo) {
    const derecha = new Set<number>();
    for (const n of acorde.notas) {
      const p = semi(n);
      if (p !== null) derecha.add(p);
    }
    return { derecha, izquierda: new Set(), bajo: raiz, octavas: 1 };
  }

  // ───────────────────────────────────────────────────────────
  // Con bajo distinto: TRES octavas.
  //
  // Con dos no salía bien y por eso faltaba la octava del bajo: en `F/A`, el
  // `A` de arriba de la izquierda y el `A` de la derecha son **la misma
  // tecla**, así que una tapaba a la otra y la octava desaparecía del dibujo.
  // Con tres, la izquierda ocupa las dos de abajo y la derecha la de arriba,
  // que además es como se toca de verdad.
  // ───────────────────────────────────────────────────────────
  // ── La mano izquierda: SIEMPRE fundamental, quinta y octava ──
  //
  // Isaac, 2026-08-21: «nada más primero, quinta y octava; no importa lo que
  // diga el acorde que se toca en la derecha, que sea así, no metas tercera».
  //
  // Es la forma abierta de toda la vida, y va igual tanto si debajo hay un
  // acorde (`A/G#m`) como si es una nota sola (`F/A`). **La quinta se pone
  // aunque no esté en el acorde de la derecha** —en `F/A` el mi no está en
  // `F A C`—: es decisión suya, y tocando suena bien.
  //
  // La tercera se llegó a poner y él la quitó: era lo que llevaba la calidad
  // del acorde de abajo, así que `A/G#m` deja de enseñar su «m» en la mano
  // izquierda. Queda dicho para que nadie lo «arregle» creyéndolo un olvido.
  const izquierda = new Set<number>();
  const abajo = notaBajo as number;
  izquierda.add(abajo);
  izquierda.add(abajo + 7);
  izquierda.add(abajo + 12);

  // La derecha, en la octava de arriba. Se colocan por su nota, NO restando la
  // fundamental: restarla movía todos los acordes a empezar en do, y `F/A`
  // salía dibujando C E G en vez de F A C. Lo cazó `scratchpad/piano.mjs`.
  const derecha = new Set<number>();
  for (const n of acorde.notas) {
    const p = semi(n);
    if (p !== null) derecha.add(24 + p);
  }

  return { derecha, izquierda, bajo: abajo, octavas: 3 };
}

export default function PianoDiagram({ acorde, className }: { acorde: Acorde; className?: string }) {
  const { derecha, izquierda, bajo, octavas } = colocar(acorde);

  // El teclado se recorta a LO QUE SE USA, más `RELLENO` teclas a cada lado.
  //
  // Antes se dibujaban octavas enteras, y en los acordes con bajo eso dejaba
  // media octava vacía entre las dos manos: mucho teclado para cinco notas.
  // Ahora el dibujo empieza justo antes de la primera tecla marcada y acaba
  // justo después de la última.
  // `Array.from` y no `[...set]`: el `tsconfig` del proyecto apunta a una
  // versión de JavaScript que no deja recorrer un Set con puntos suspensivos.
  const marcadas = Array.from(derecha).concat(Array.from(izquierda));
  const desde = marcadas.reduce((a, b) => Math.min(a, b), Infinity);
  const hasta = marcadas.reduce((a, b) => Math.max(a, b), -Infinity);

  /** Índice de tecla blanca en la que cae un semitono, o la de justo debajo. */
  const blancaDebajo = (x: number) => {
    const oct = Math.floor(x / 12);
    const r = x - 12 * oct;
    let i = 0;
    for (let k = 0; k < BLANCAS.length; k++) if (BLANCAS[k] <= r) i = k;
    return 7 * oct + i;
  };
  /** La misma idea, pero la tecla blanca de justo encima. */
  const blancaEncima = (x: number) => {
    const oct = Math.floor(x / 12);
    const r = x - 12 * oct;
    for (let k = 0; k < BLANCAS.length; k++) if (BLANCAS[k] >= r) return 7 * oct + k;
    return 7 * oct + 7;
  };

  const primera = blancaDebajo(desde) - RELLENO;
  const ultima = blancaEncima(hasta) + RELLENO;
  const anchoTotal = ANCHO_BLANCA * (ultima - primera + 1);

  /** Semitono absoluto de una tecla blanca, contando desde el do de abajo. */
  const semiBlanca = (w: number) => 12 * Math.floor(w / 7) + BLANCAS[((w % 7) + 7) % 7];

  const blancas: { x: number; abs: number }[] = [];
  const negras: { x: number; abs: number }[] = [];
  for (let w = primera; w <= ultima; w++) {
    const x = (w - primera) * ANCHO_BLANCA;
    blancas.push({ x, abs: semiBlanca(w) });
    // Llevan negra detrás do, re, fa, sol y la. Mi y si no: ahí es donde el
    // teclado deja dos blancas juntas, y es lo que hace reconocible el dibujo.
    const grado = ((w % 7) + 7) % 7;
    if (NEGRAS.some((n) => n.tras === grado) && w < ultima) {
      negras.push({ x: x + ANCHO_BLANCA - ANCHO_NEGRA / 2, abs: semiBlanca(w) + 1 });
    }
  }

  const mano = (abs: number): "derecha" | "izquierda" | null =>
    derecha.has(abs) ? "derecha" : izquierda.has(abs) ? "izquierda" : null;

  return (
    <svg
      viewBox={`0 0 ${anchoTotal} ${ALTO_BLANCA}`}
      className={cn("h-auto w-full", octavas === 1 ? "max-w-[190px]" : "max-w-[330px]", className)}
      role="img"
      aria-label={`Teclado con el acorde ${acorde.escrito}`}
    >
      {blancas.map((b, i) => {
        const m = mano(b.abs);
        return (
          <rect
            key={`b${i}`}
            x={b.x} y={0} width={ANCHO_BLANCA} height={ALTO_BLANCA}
            className={cn(
              "stroke-slate-400 dark:stroke-slate-600",
              m === "derecha" && "fill-brand-500",
              m === "izquierda" && "fill-brand-300 dark:fill-brand-700",
              !m && "fill-white dark:fill-slate-200"
            )}
            strokeWidth={1}
          />
        );
      })}
      {negras.map((n, i) => {
        const m = mano(n.abs);
        return (
          <rect
            key={`n${i}`}
            x={n.x} y={0} width={ANCHO_NEGRA} height={ALTO_NEGRA} rx={1.5}
            className={cn(
              "stroke-slate-700 dark:stroke-slate-900",
              m === "derecha" && "fill-brand-500",
              m === "izquierda" && "fill-brand-300 dark:fill-brand-700",
              !m && "fill-slate-800 dark:fill-slate-900"
            )}
            strokeWidth={1}
          />
        );
      })}
      {/* Punto bajo la tecla del bajo: es la que sostiene el acorde. */}
      {blancas.map((b, i) =>
        bajo !== null && b.abs === bajo ? (
          <circle key={`p${i}`} cx={b.x + ANCHO_BLANCA / 2} cy={ALTO_BLANCA - 7} r={2.6} className="fill-slate-900 dark:fill-slate-950" />
        ) : null
      )}
    </svg>
  );
}
