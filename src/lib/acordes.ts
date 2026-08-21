// ─────────────────────────────────────────────────────────────
// De un acorde escrito ("F#m7/b5", "A/G#m", "Cm7") a las notas que
// se tocan, para dibujarlo en el teclado y en el mástil del bajo.
//
// 🔴 LAS NOTAS SE NOMBRAN POR GRADOS, NO POR SEMITONOS.
//
// Un acorde no es una lista de semitonos: es una fundamental y unos
// GRADOS sobre ella. La tercera de `Bb` es un `D` porque está dos
// letras más arriba (si→do→re), y la quinta es `F`. Contando solo
// semitonos hay que elegir entre `A#` y `Bb`, y esa elección no se
// puede acertar sin saber de dónde viene la nota.
//
// Por eso cada grado lleva DOS números: cuántos semitonos sube y
// cuántas LETRAS sube. Con eso el nombre sale solo y siempre bien:
//
//     Bb   → Bb · D · F     (no A# · D · F)
//     Gm   → G · Bb · D     (no G · A# · D)
//     E#m2 → E# · F## · G#  (las letras mi, fa, sol seguidas)
//
// Isaac lo vio el 2026-08-21: «el acorde Bb menciona que tiene A# D F,
// tiene que ser Bb D F». Y acertó también con la causa: **solo pasaba
// con los bemoles**, porque antes se nombraba con una tabla de
// sostenidos. Preguntó si había que mirar el centro tonal de la
// canción; no hace falta — **el propio acorde ya lo dice**.
//
// Todo se CALCULA: no hay tablas de digitaciones ni datos externos.
// Se midió que las 75 canciones usan 1.894 acordes de solo 32
// calidades, y que 5 cubren el 94 %.
//
// 🔴 Lo que NO se sabe dibujar, NO se inventa: se devuelve
// `desconocida: true` y la pantalla enseña solo la fundamental. En
// este proyecto un símbolo raro es casi siempre notación de Isaac,
// no un error (el "-" de "por semitonos", la "/" de "b5").
// ─────────────────────────────────────────────────────────────

/** Las siete letras y en qué semitono cae cada una. */
const LETRAS = ["C", "D", "E", "F", "G", "A", "B"];
const SEMITONO_LETRA = [0, 2, 4, 5, 7, 9, 11];

/**
 * Un grado: cuántos SEMITONOS sube y cuántas LETRAS sube.
 *
 * Las dos cosas hacen falta. La tercera mayor y la cuarta disminuida
 * son el mismo salto en semitonos (4) y notas distintas: `C→E` sube
 * dos letras, `C→Fb` sube tres.
 */
type Grado = readonly [semitonos: number, letras: number];

const UNISONO:  Grado = [0, 0];
const SEG_MAY:  Grado = [2, 1];
const TER_MEN:  Grado = [3, 2];
const TER_MAY:  Grado = [4, 2];
const CUARTA:   Grado = [5, 3];
const QUI_DIS:  Grado = [6, 4];
const QUINTA:   Grado = [7, 4];
const QUI_AUM:  Grado = [8, 4];
const SEXTA:    Grado = [9, 5];
const SEP_MEN:  Grado = [10, 6];
const SEP_MAY:  Grado = [11, 6];
// Compuestos: suben una octava, así que además de los semitonos suman
// 7 letras. Sin eso, la novena de `Bb` saldría como un do rarísimo.
const NOVENA:   Grado = [14, 8];
const NOV_MEN:  Grado = [13, 8];
const NOV_AUM:  Grado = [15, 8];
const ONCENA:   Grado = [17, 10];
const ONC_AUM:  Grado = [18, 10];
const TRE_MEN:  Grado = [20, 12];

/** Calidad → los grados que la forman. */
const CALIDADES: Record<string, readonly Grado[]> = {
  "":     [UNISONO, TER_MAY, QUINTA],                    // mayor — 873 de 1.894
  m:      [UNISONO, TER_MEN, QUINTA],                    // menor — 181
  m7:     [UNISONO, TER_MEN, QUINTA, SEP_MEN],           // 378
  "7":    [UNISONO, TER_MAY, QUINTA, SEP_MEN],           // 287
  maj7:   [UNISONO, TER_MAY, QUINTA, SEP_MAY],           // 68
  maj9:   [UNISONO, TER_MAY, QUINTA, SEP_MAY, NOVENA],
  m9:     [UNISONO, TER_MEN, QUINTA, SEP_MEN, NOVENA],
  "9":    [UNISONO, TER_MAY, QUINTA, SEP_MEN, NOVENA],
  "6":    [UNISONO, TER_MAY, QUINTA, SEXTA],
  m6:     [UNISONO, TER_MEN, QUINTA, SEXTA],
  sus2:   [UNISONO, SEG_MAY, QUINTA],
  sus4:   [UNISONO, CUARTA, QUINTA],
  "4":    [UNISONO, CUARTA, QUINTA],   // Isaac escribe "A4" por "Asus4"
  dim:    [UNISONO, TER_MEN, QUI_DIS],
  "°":    [UNISONO, TER_MEN, QUI_DIS],
  dim7:   [UNISONO, TER_MEN, QUI_DIS, SEXTA],
  "°7":   [UNISONO, TER_MEN, QUI_DIS, SEXTA],
  aug:    [UNISONO, TER_MAY, QUI_AUM],
  aug7:   [UNISONO, TER_MAY, QUI_AUM, SEP_MEN],
  add9:   [UNISONO, TER_MAY, QUINTA, NOVENA],
  add11:  [UNISONO, TER_MAY, QUINTA, ONCENA],
  m7b5:   [UNISONO, TER_MEN, QUI_DIS, SEP_MEN],          // semidisminuido
  // Menor con la segunda añadida. Sale una vez, en «No Hay Lugar Más Alto»
  // (`E#m2/b5`); Isaac trajo la explicación el 2026-08-21.
  m2:     [UNISONO, SEG_MAY, TER_MEN, QUINTA],
};

/**
 * Alteraciones que pueden ir tras "/" y NO son un bajo.
 * `b5` y `#5` **cambian la quinta**; las demás **añaden** una nota.
 */
const ALTERACIONES: Record<string, { grado: Grado; quinta?: boolean }> = {
  b5:    { grado: QUI_DIS, quinta: true },
  "#5":  { grado: QUI_AUM, quinta: true },
  b9:    { grado: NOV_MEN },
  "#9":  { grado: NOV_AUM },
  "#11": { grado: ONC_AUM },
  b13:   { grado: TRE_MEN },
};

export type Acorde = {
  /** Nombre tal como lo escribió Isaac, sin tocar. */
  escrito: string;
  /** Notas del acorde, de grave a agudo, ya bien escritas ("Bb", no "A#"). */
  notas: string[];
  /** La nota que toca el bajista. */
  bajo: string;
  /** Acorde de abajo cuando se escribe uno sobre otro (`A/G#m`). */
  encima?: { notas: string[]; escrito: string };
  /** No se supo dibujar: solo se conoce la fundamental. */
  desconocida?: boolean;
};

/** Una nota partida en su letra y sus alteraciones. */
type Nota = { letra: number; alteracion: number };

/** Lee "Bb", "F#", "F##"… Devuelve `null` si no empieza por A–G. */
function leerNota(texto: string): { nota: Nota; resto: string } | null {
  const m = texto.match(/^([A-G])([#b]*)(.*)$/);
  if (!m) return null;
  const letra = LETRAS.indexOf(m[1]);
  const alteracion = m[2].split("").reduce((a, c) => a + (c === "#" ? 1 : -1), 0);
  return { nota: { letra, alteracion }, resto: m[3] };
}

/** En qué semitono suena una nota (0–11). Exportado: lo usan los dibujos. */
export function semitonoDe(nombre: string): number | null {
  const l = leerNota(nombre);
  if (!l || l.nota.letra < 0) return null;
  return (((SEMITONO_LETRA[l.nota.letra] + l.nota.alteracion) % 12) + 12) % 12;
}

/** Escribe las alteraciones: 1 → "#", -2 → "bb". */
function alteracionATexto(n: number): string {
  return n > 0 ? "#".repeat(n) : "b".repeat(-n);
}

/**
 * El nombre de la nota que está a `grado` de la fundamental.
 *
 * Se elige primero LA LETRA —subiendo las que diga el grado— y solo
 * después la alteración que hace falta para caer en el semitono justo.
 * Ese orden es lo que hace que `Bb` tenga un `D` y no un `C##`.
 */
function nombrarGrado(raiz: Nota, [semitonos, letras]: Grado): string {
  const indice = raiz.letra + letras;
  const destino = ((indice % 7) + 7) % 7;
  const octavas = Math.floor(indice / 7);
  const natural = SEMITONO_LETRA[destino] + 12 * octavas;
  const buscado = SEMITONO_LETRA[raiz.letra] + raiz.alteracion + semitonos;
  const alteracion = buscado - natural;

  // Más de dos alteraciones no lo escribe nadie: ahí se prefiere el
  // nombre corto aunque la letra no sea la "correcta" en teoría.
  if (Math.abs(alteracion) > 2) {
    const semi = (((buscado % 12) + 12) % 12);
    const tabla = raiz.alteracion < 0
      ? ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
      : ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return tabla[semi];
  }
  return LETRAS[destino] + alteracionATexto(alteracion);
}

/**
 * Decide qué es lo que va detrás de una barra. **Es la regla que Isaac
 * explicó el 2026-08-21 y sin la cual el bajista tocaría una nota que
 * no existe:**
 *
 * - `F/A`, `A/G#m` → un NOMBRE DE NOTA: es el bajo (y puede traer modo,
 *   y entonces es un acorde sobre otro acorde).
 * - `F#m7/b5`, `Bbmaj7/#9` → una ALTERACIÓN: **no es un bajo**, es una
 *   nota que se añade. El bajo sigue siendo la fundamental.
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

/**
 * Lee un acorde escrito y devuelve qué se toca.
 * Devuelve `null` solo si ni siquiera empieza por una nota (A–G).
 *
 * **No recibe la tonalidad de la canción, y no le hace falta:** cómo se
 * escriben las notas lo decide la fundamental del propio acorde.
 */
export function leerAcorde(escrito: string): Acorde | null {
  const partido = leerNota(escrito.trim());
  if (!partido || partido.nota.letra < 0) return null;
  const raiz = partido.nota;

  const { calidad, bajo, alteracion } = partirBarra(partido.resto);
  // "m7/b5" y "m7b5" son el mismo acorde escrito de dos maneras.
  const clave = alteracion === "b5" && calidad === "m7" ? "m7b5" : calidad;
  const grados = CALIDADES[clave];

  if (!grados) {
    // Calidad que no está en la tabla. Se enseña la fundamental y se dice
    // que no se sabe. NO se adivina.
    const soloRaiz = nombrarGrado(raiz, UNISONO);
    return { escrito, notas: [soloRaiz], bajo: soloRaiz, desconocida: true };
  }

  let lista: Grado[] = [...grados];
  if (alteracion && clave !== "m7b5") {
    const alt = ALTERACIONES[alteracion];
    if (alt.quinta) {
      // `b5` y `#5` SUSTITUYEN a la quinta: no suenan las dos a la vez.
      lista = lista.filter((g) => g !== QUINTA);
      lista.push(alt.grado);
    } else if (!lista.includes(alt.grado)) {
      lista.push(alt.grado);
    }
  }
  lista.sort((a, b) => a[0] - b[0]);
  const notas = lista.map((g) => nombrarGrado(raiz, g));

  // Sin barra de bajo: manda la fundamental.
  if (!bajo) return { escrito, notas, bajo: notas[0] };

  // Con bajo. Si trae modo ("G#m") es un ACORDE sobre otro: el bajista
  // toca solo su fundamental, y el pianista reparte los dos entre las
  // manos. Isaac, 2026-08-21: "yo hago A con la derecha y G#m en octavas
  // con la izquierda; el bajo hace G#".
  const abajo = leerNota(bajo);
  if (!abajo || abajo.nota.letra < 0) return { escrito, notas, bajo: notas[0] };

  // El bajo se escribe TAL COMO lo puso Isaac, sin renombrarlo.
  const nombreBajo = LETRAS[abajo.nota.letra] + alteracionATexto(abajo.nota.alteracion);
  const gradosAbajo = CALIDADES[abajo.resto];
  if (abajo.resto && gradosAbajo) {
    return {
      escrito,
      notas,
      bajo: nombreBajo,
      encima: { escrito: bajo, notas: gradosAbajo.map((g) => nombrarGrado(abajo.nota, g)) },
    };
  }
  return { escrito, notas, bajo: nombreBajo };
}
