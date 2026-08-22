// ─────────────────────────────────────────────────────────────
// Instrumentos TRANSPOSITORES: los que suenan en un tono distinto del que leen.
//
// Isaac, el 2026-08-22: «que le aparezca transpuesto al trompetista, para que
// no lea nada de mente» (D-28).
//
// 🔴 EL PROBLEMA QUE ESTO RESUELVE, y que llevaba ahí sin que nadie lo dijera:
// la trompeta es **en Bb**, o sea que **suena un tono más grave de lo que
// lee**. Si en la página pone `D` y el trompetista toca su `D`, **suena `C`** —
// un tono por debajo del resto del grupo. Para que suene `D` tiene que leer
// `E`. O lo estaba haciendo de cabeza cada domingo, o llevaba tiempo sonando
// raro sin que nadie localizara por qué.
//
// La cuenta la hace la página. Es la misma idea de siempre aquí: lo que se
// puede calcular no se le pide a alguien en mitad de un culto.
// ─────────────────────────────────────────────────────────────

export type Transpositor = {
  id: string;
  /** Cómo se llama en el selector. */
  nombre: string;
  /**
   * Cuántos semitonos hay que SUBIR lo escrito para que suene lo que toca el
   * resto. Un instrumento en Bb suena un tono por debajo, así que su parte
   * se escribe un tono por encima: +2.
   *
   * 🔴 Y las notas se nombran SIEMPRE en cifrado americano —C, D, E, F, G, A,
   * B—, aquí y en cualquier texto del proyecto. Lo pidió Isaac el 2026-08-22:
   * es el idioma en el que están escritas las 75 canciones, y mezclarlo con
   * «si bemol» obliga a traducir mentalmente justo a quien menos tiempo tiene.
   */
  semitonos: number;
  /** Qué instrumentos son. Sale debajo del selector, para no tener que saberlo. */
  ejemplos?: string;
};

export const TRANSPOSITORES: Transpositor[] = [
  {
    id: "do",
    nombre: "Como suena",
    semitonos: 0,
    ejemplos: "piano, guitarra, bajo, voz",
  },
  {
    id: "sib",
    nombre: "Trompeta",
    semitonos: 2,
    ejemplos: "trompeta (en Bb). También vale para clarinete y saxo tenor",
  },
];

export const TRANSPOSITOR_POR_DEFECTO = "do";

/** Cuántos semitonos suma este instrumento. Lo que no se reconoce, 0. */
export function semitonosDe(id: string | null | undefined): number {
  return TRANSPOSITORES.find((t) => t.id === id)?.semitonos ?? 0;
}

// La elección se guarda POR MÚSICO, en su navegador: es de quien lee, no de la
// canción. Igual que el tamaño de letra (D-09b), el modo de recorrer las
// columnas (O-26) y el instrumento del acorde (O-42). Sin migración.
const CLAVE = "lectura-transpositor";

export function leerTranspositor(): string {
  try {
    const v = window.localStorage.getItem(CLAVE);
    return TRANSPOSITORES.some((t) => t.id === v) ? (v as string) : TRANSPOSITOR_POR_DEFECTO;
  } catch {
    return TRANSPOSITOR_POR_DEFECTO; // ventana privada o almacenamiento bloqueado
  }
}

export function guardarTranspositor(id: string) {
  try {
    window.localStorage.setItem(CLAVE, id);
  } catch {
    /* almacenamiento lleno o bloqueado: se sigue sin guardar */
  }
}
