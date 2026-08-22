// ─────────────────────────────────────────────────────────────
// Transpositor de acordes para la cuadrícula de texto.
// Mueve solo la nota raíz (y el bajo tras "/") N semitonos,
// conservando la calidad (m, 7, sus4...), la duración (:n), el
// calderón (^), la ligadura (~) y todo lo demás intacto.
// ─────────────────────────────────────────────────────────────

const PITCH_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const PITCH_FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Nombre de nota → clase de altura (0–11).
const NOTE_TO_PITCH: Record<string, number> = {
  C: 0, "B#": 0,
  "C#": 1, Db: 1,
  D: 2,
  "D#": 3, Eb: 3,
  E: 4, Fb: 4,
  F: 5, "E#": 5,
  "F#": 6, Gb: 6,
  G: 7,
  "G#": 8, Ab: 8,
  A: 9,
  "A#": 10, Bb: 10,
  B: 11, Cb: 11,
};

// Tonos seleccionables para el campo "Tono" de cada canción del culto.
// `flats` decide si la salida transpuesta usa bemoles o sostenidos.
export const KEY_OPTIONS: { value: string; pitch: number; flats: boolean }[] = [
  { value: "C",  pitch: 0,  flats: false },
  // 🔴 Db y NO C#, aunque sea la misma tecla. **C# mayor tiene SIETE
  // sostenidos** —incluido un mi sostenido y un si sostenido— y no la toca
  // nadie; **Db mayor tiene cinco bemoles** y es la que se lee. Lo cazo una
  // prueba de `pruebas/musica.test.mjs` el 2026-08-21, no un músico.
  // Comprobado antes de tocarlo: **ninguna de las 75 canciones, ningún culto y
  // ninguna versión** usaban esa altura, así que no hay dato que migrar.
  // (En MENOR es al reves y la tabla de abajo ya lo tiene bien: `C#m` son 4
  // sostenidos y `Dbm` serian 8, asi que alli manda el sostenido.)
  { value: "Db", pitch: 1,  flats: true  },
  { value: "D",  pitch: 2,  flats: false },
  { value: "Eb", pitch: 3,  flats: true  },
  { value: "E",  pitch: 4,  flats: false },
  { value: "F",  pitch: 5,  flats: true  },
  { value: "F#", pitch: 6,  flats: false },
  { value: "G",  pitch: 7,  flats: false },
  { value: "Ab", pitch: 8,  flats: true  },
  { value: "A",  pitch: 9,  flats: false },
  { value: "Bb", pitch: 10, flats: true  },
  { value: "B",  pitch: 11, flats: false },
];

// Centros tonales menores (Am, Em...). La transposición funciona igual (movemos
// las raíces N semitonos); `flats` define la ortografía de la salida según la
// armadura relativa de cada tono menor.
export const KEY_OPTIONS_MINOR: { value: string; pitch: number; flats: boolean }[] = [
  { value: "Am",  pitch: 9,  flats: false },
  { value: "Bbm", pitch: 10, flats: true  },
  { value: "Bm",  pitch: 11, flats: false },
  { value: "Cm",  pitch: 0,  flats: true  },
  { value: "C#m", pitch: 1,  flats: false },
  { value: "Dm",  pitch: 2,  flats: true  },
  { value: "D#m", pitch: 3,  flats: false },
  { value: "Em",  pitch: 4,  flats: false },
  { value: "Fm",  pitch: 5,  flats: true  },
  { value: "F#m", pitch: 6,  flats: false },
  { value: "Gm",  pitch: 7,  flats: true  },
  { value: "G#m", pitch: 8,  flats: false },
];

// Todas las opciones (mayores + menores) para buscar ortografía/altura.
export const ALL_KEY_OPTIONS = [...KEY_OPTIONS, ...KEY_OPTIONS_MINOR];

export const KEY_VALUES = KEY_OPTIONS.map((k) => k.value);

/** Extrae la clase de altura (0–11) de un nombre de tono o tonalidad. */
export function keyToPitch(key: string | null | undefined): number | null {
  if (!key) return null;
  const m = key.trim().match(/^([A-Ga-g])([#b]?)/);
  if (!m) return null;
  const note = m[1].toUpperCase() + m[2];
  const pitch = NOTE_TO_PITCH[note];
  return pitch === undefined ? null : pitch;
}

/**
 * ¿El tono es MENOR? Reconoce "Am", "Bbm", "C#m" y también "A minor".
 *
 * Hace falta porque al transponer solo se mueve la NOTA: `keyToPitch("Bm")`
 * devuelve la altura de si, y al volver a escribirla salía "B" a secas. El modo
 * hay que llevarlo aparte y devolverlo al final, o "Bm" se lee como "B" y son
 * dos tonalidades distintas.
 */
export function esMenor(key: string | null | undefined): boolean {
  if (!key) return false;
  const t = key.trim();
  return /minor$/i.test(t) || /^[A-G][#b]?m$/i.test(t);
}

/** ¿El tono destino prefiere bemoles? (Eb, F, Ab, Bb, Dm, Cm...) */
export function prefersFlats(targetKey: string | null | undefined): boolean {
  if (!targetKey) return false;
  const opt = ALL_KEY_OPTIONS.find((k) => k.value === targetKey);
  if (opt) return opt.flats;
  return /b/.test(targetKey); // tono libre con bemol
}

/**
 * ¿Este tono se escribe con bemoles o con sostenidos? (T-14)
 *
 * 🔴 Se le pregunta por el tono **AL QUE SE LLEGA**, no por el de partida. Era
 * el fallo que vio Isaac: bajó una canción de `F` a `E` y los acordes salieron
 * `Dbm`, `Gbm7`, `Abm7` — la ortografía de `F`, que es de bemoles— cuando en
 * `E` son `C#m`, `F#m7`, `G#m7`. La barra decía «Tono: E» y la partitura
 * estaba escrita **como si fuera Fb**. Y nadie toca en Fb.
 *
 * No hay regla que inventar: `KEY_OPTIONS` y `KEY_OPTIONS_MINOR` **ya la
 * tienen escrita**, tonalidad por tonalidad. Es el círculo de quintas de toda
 * la vida — Sol, Re, La, Mi, Si llevan sostenidos; Fa, Si♭, Mi♭, La♭, Re♭
 * llevan bemoles—. Aquí solo se busca por altura y modo.
 *
 * @param pitch  0–11, la altura del tono destino.
 * @param menor  Si el tono es menor: `Dm` lleva bemoles y `D` no.
 */
export function ortografiaDe(pitch: number, menor: boolean): boolean {
  const p = ((pitch % 12) + 12) % 12;
  const tabla = menor ? KEY_OPTIONS_MINOR : KEY_OPTIONS;
  const opt = tabla.find((k) => k.pitch === p);
  return opt ? opt.flats : false;
}

/**
 * Semitonos para pasar de `fromKey` (tonalidad original de la canción, p. ej.
 * "C major") a `toKey` (tono elegido para el culto, p. ej. "Eb"). 0–11.
 * Devuelve null si falta alguno (no se transpone).
 */
export function semitonesBetween(
  fromKey: string | null | undefined,
  toKey: string | null | undefined
): number | null {
  const from = keyToPitch(fromKey);
  const to = keyToPitch(toKey);
  if (from === null || to === null) return null;
  return ((to - from) % 12 + 12) % 12;
}

function shiftNote(note: string, semitones: number, flats: boolean): string {
  const pitch = NOTE_TO_PITCH[note];
  if (pitch === undefined) return note;
  const next = (((pitch + semitones) % 12) + 12) % 12;
  return (flats ? PITCH_FLAT : PITCH_SHARP)[next];
}

/** Transpone un único token si es un acorde; si no, lo deja igual. */
function transposeToken(token: string, semitones: number, flats: boolean): string {
  // Solo acordes (empiezan por A–G). Silencios (Z), %, ~, compases (6/8),
  // letras "(...)" y secciones "<...>" no empiezan por A–G.
  if (!/^[A-G]/.test(token)) return token;

  // Raíz al inicio.
  let out = token.replace(/^([A-G])([#b]?)/, (_m, r: string, acc: string) =>
    shiftNote(r + (acc || ""), semitones, flats)
  );
  // Bajo después de "/".
  out = out.replace(/\/([A-G])([#b]?)/, (_m, r: string, acc: string) =>
    "/" + shiftNote(r + (acc || ""), semitones, flats)
  );
  return out;
}

/**
 * Transpone todo el contenido de acordes N semitonos. Procesa línea por línea
 * y token por token para no tocar secciones, letras ni símbolos.
 */
export function transposeContent(
  content: string,
  semitones: number,
  flats = false
): string {
  if (!content || !semitones) return content;
  return content
    .split("\n")
    .map((line) => {
      // No transponer las líneas de sección (<Coro>, [Intro]...).
      if (/^\s*[<[]/.test(line)) return line;
      return line.replace(/\S+/g, (tok) => transposeToken(tok, semitones, flats));
    })
    .join("\n");
}
