// ─────────────────────────────────────────────────────────────
// De un acorde escrito ("F#m7/b5", "A/G#m", "Cm7") a las notas que
// se tocan, para dibujarlo en el teclado y en el mástil del bajo.
//
// Todo se CALCULA a partir de la raíz y la calidad: no hay tablas de
// digitaciones ni datos externos. Se midió el 2026-08-21 que las 75
// canciones usan 1.894 acordes de solo 32 calidades, y que 5 cubren
// el 94 % — así que la tabla de abajo llega de sobra.
//
// 🔴 Lo que NO se sabe dibujar, NO se inventa: se devuelve
// `desconocida: true` y la pantalla enseña solo la fundamental. En
// este proyecto un símbolo raro es casi siempre notación de Isaac,
// no un error (el "-" de "por semitonos", la "/" de "b5"...).
// ─────────────────────────────────────────────────────────────

const PITCH: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, "E#": 5, Fb: 4,
  F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10,
  B: 11, "B#": 0, Cb: 11,
};

const NOMBRE_SOSTENIDO = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOMBRE_BEMOL     = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/**
 * Calidad → semitonos desde la fundamental.
 *
 * Se ordenan de MÁS LARGA a más corta al buscar: "maj7" tiene que
 * ganarle a "m", o `Cmaj7` se leería como `Cm` + "aj7".
 */
const CALIDADES: Record<string, number[]> = {
  "":        [0, 4, 7],           // mayor — 873 de los 1.894
  m:         [0, 3, 7],           // menor — 181
  m7:        [0, 3, 7, 10],       // 378
  "7":       [0, 4, 7, 10],       // 287
  maj7:      [0, 4, 7, 11],       // 68
  maj9:      [0, 4, 7, 11, 14],
  m9:        [0, 3, 7, 10, 14],
  "9":       [0, 4, 7, 10, 14],
  "6":       [0, 4, 7, 9],
  m6:        [0, 3, 7, 9],
  sus2:      [0, 2, 7],
  sus4:      [0, 5, 7],
  "4":       [0, 5, 7],           // Isaac escribe "A4" por "Asus4" (2026-08-21)
  dim:       [0, 3, 6],
  "°":       [0, 3, 6],
  dim7:      [0, 3, 6, 9],
  "°7":      [0, 3, 6, 9],
  aug:       [0, 4, 8],
  aug7:      [0, 4, 8, 10],
  add9:      [0, 4, 7, 14],
  add11:     [0, 4, 7, 17],
  m7b5:      [0, 3, 6, 10],       // semidisminuido
  // Menor con segunda añadida. Sale una sola vez, en «No Hay Lugar Más Alto»
  // (`E#m2/b5`), y Isaac trajo la explicación el 2026-08-21: es un menor al
  // que se le agrega la 2ª (o 9ª).
  m2:        [0, 2, 3, 7],
};

/**
 * Alteraciones que pueden ir tras "/" y NO son un bajo (ver `partirBarra`).
 *
 * Hay dos clases y se comportan distinto:
 * - `b5` y `#5` **cambian la quinta** por otra (`quinta: true`).
 * - Las demás **añaden** una nota encima sin quitar nada.
 */
const ALTERACIONES: Record<string, { semitonos: number; quinta?: boolean }> = {
  b5:    { semitonos: 6,  quinta: true },
  "#5":  { semitonos: 8,  quinta: true },
  b9:    { semitonos: 13 },
  "#9":  { semitonos: 15 },
  "#11": { semitonos: 18 },
  b13:   { semitonos: 20 },
};

export type Acorde = {
  /** Nombre tal como lo escribió Isaac, sin tocar. */
  escrito: string;
  /** Notas del acorde, de grave a agudo, en nombres ("C", "Eb"…). */
  notas: string[];
  /** La nota que toca el bajista. */
  bajo: string;
  /** Acorde de abajo cuando se escribe uno sobre otro (`A/G#m`). */
  encima?: { notas: string[]; escrito: string };
  /** No se supo dibujar: solo se conoce la fundamental. */
  desconocida?: boolean;
};

/** Separa la raíz ("F#") de lo que le sigue ("m7/b5"). */
function partirRaiz(texto: string): { raiz: string; resto: string } | null {
  const m = texto.match(/^([A-G][#b]?)(.*)$/);
  return m ? { raiz: m[1], resto: m[2] } : null;
}

/**
 * Decide qué es lo que va detrás de una barra. **Es la regla que Isaac
 * explicó el 2026-08-21 y sin la cual el bajista tocaría una nota que
 * no existe:**
 *
 * - `F/A`, `A/G#m`  → un NOMBRE DE NOTA: es el bajo (y puede traer modo,
 *   y entonces es un acorde sobre otro acorde).
 * - `F#m7/b5`, `Bbmaj7/#9` → una ALTERACIÓN: **no es un bajo**, es una
 *   nota que se añade al acorde. El bajo sigue siendo la fundamental.
 */
function partirBarra(resto: string): { calidad: string; bajo?: string; alteracion?: string } {
  const i = resto.indexOf("/");
  if (i === -1) return { calidad: resto };
  const antes = resto.slice(0, i);
  const despues = resto.slice(i + 1);
  if (despues in ALTERACIONES) return { calidad: antes, alteracion: despues };
  if (/^[A-G][#b]?/.test(despues)) return { calidad: antes, bajo: despues };
  // Ni nota ni alteración conocida: se deja pegado a la calidad y que
  // más abajo se marque como desconocida. Nunca se descarta en silencio.
  return { calidad: resto };
}

function nombrar(semitonos: number, bemoles: boolean): string {
  const tabla = bemoles ? NOMBRE_BEMOL : NOMBRE_SOSTENIDO;
  return tabla[((semitonos % 12) + 12) % 12];
}

/**
 * Lee un acorde escrito y devuelve qué se toca.
 * Devuelve `null` solo si ni siquiera empieza por una nota (A–G).
 */
export function leerAcorde(escrito: string, bemoles = false): Acorde | null {
  const partes = partirRaiz(escrito.trim());
  if (!partes) return null;
  const base = PITCH[partes.raiz];
  if (base === undefined) return null;

  const { calidad, bajo, alteracion } = partirBarra(partes.resto);
  // "m7/b5" y "m7b5" son el mismo acorde escrito de dos maneras.
  const clave = alteracion === "b5" && calidad === "m7" ? "m7b5" : calidad.replace(/\/b5$/, "b5");
  const intervalos = CALIDADES[clave] ?? CALIDADES[calidad];

  if (!intervalos) {
    // Calidad que no está en la tabla (el "m2" de "E#m2/b5", por ejemplo).
    // Se enseña la fundamental y se dice que no se sabe. NO se adivina.
    return { escrito, notas: [nombrar(base, bemoles)], bajo: nombrar(base, bemoles), desconocida: true };
  }

  let grados = [...intervalos];
  if (alteracion && clave !== "m7b5") {
    const alt = ALTERACIONES[alteracion];
    if (alt.quinta) {
      // `b5` y `#5` SUSTITUYEN a la quinta: no se tocan las dos a la vez.
      grados = grados.filter((x) => x % 12 !== 7);
      grados.push(alt.semitonos);
    } else if (!grados.some((x) => x % 12 === alt.semitonos % 12)) {
      grados.push(alt.semitonos);
    }
  }
  const notas = grados.map((g) => nombrar(base + g, bemoles));

  // Sin barra de bajo: manda la fundamental.
  if (!bajo) return { escrito, notas, bajo: notas[0] };

  // Con bajo. Si el bajo trae modo ("G#m") es un ACORDE sobre otro: el
  // bajista toca solo su fundamental, y el pianista reparte los dos
  // entre las manos. Isaac, 2026-08-21: "yo hago A con la derecha y
  // G#m en octavas con la izquierda; el bajo hace G#".
  const abajo = partirRaiz(bajo);
  if (!abajo) return { escrito, notas, bajo: notas[0] };
  const baseAbajo = PITCH[abajo.raiz];
  if (baseAbajo === undefined) return { escrito, notas, bajo: notas[0] };

  const nombreBajo = nombrar(baseAbajo, bemoles);
  const intervalosAbajo = CALIDADES[abajo.resto];
  if (abajo.resto && intervalosAbajo) {
    return {
      escrito,
      notas,
      bajo: nombreBajo,
      encima: { escrito: bajo, notas: intervalosAbajo.map((g) => nombrar(baseAbajo + g, bemoles)) },
    };
  }
  return { escrito, notas, bajo: nombreBajo };
}
