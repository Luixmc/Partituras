// Lógica compartida para escribir acordes en la cuadrícula (editor y "nueva canción").

// Modificadores que NO llevan espacio antes (se pegan al acorde anterior).
export const MODIFIERS = new Set([
  "#", "b", "m", "7",
  "maj7", "maj9", "m7", "m9",
  "sus2", "sus4",
  "dim", "dim7",
  "aug", "aug7",
  "add9", "add11",
  "m7b5",
  ":0.5", ":1", ":2", ":3", ":4",
  "^", // calderón: se pega al acorde anterior (E^)
]);

// Las secciones (<...> o [...]) empiezan en su propia línea.
function startsNewLine(text: string) {
  return text.startsWith("<") || text.startsWith("[");
}

/** Añade un token al final del contenido respetando los espacios de la notación. */
export function appendToken(prev: string, text: string): string {
  // Las secciones van en una línea nueva.
  if (startsNewLine(text) && prev.length > 0 && !prev.endsWith("\n")) {
    return prev.replace(/[ \t]+$/g, "") + "\n" + text;
  }
  // Las barras y signos de repetición siempre van separados por espacios.
  const isBarToken = text === "|" || text === "|:" || text === ":|";
  const isModifier = !isBarToken && (MODIFIERS.has(text) || text.startsWith(":"));
  const needsSpace =
    prev.length > 0 &&
    !prev.endsWith(" ") &&
    !prev.endsWith("\n") &&
    !prev.endsWith("[") &&
    !prev.endsWith("<") &&
    !startsNewLine(text) &&
    !isModifier;
  return prev + (needsSpace ? " " : "") + text;
}

/**
 * Inserta un token en la posición del cursor (selStart..selEnd), respetando los
 * espacios tanto con lo anterior como con lo siguiente. Devuelve el nuevo valor
 * y la posición donde debe quedar el cursor.
 */
export function insertToken(
  value: string,
  text: string,
  selStart: number,
  selEnd: number
): { value: string; cursor: number } {
  const before = value.slice(0, selStart);
  const after = value.slice(selEnd);

  // Reutilizamos appendToken para el espaciado con lo anterior.
  const merged = appendToken(before, text);
  const cursor = merged.length;

  // Separación con lo que sigue, si hace falta (evita pegar "GAm").
  const needTrailing =
    after.length > 0 &&
    !after.startsWith(" ") &&
    !after.startsWith("\n") &&
    !merged.endsWith(" ") &&
    !merged.endsWith("\n");

  const result = needTrailing ? `${merged} ${after}` : merged + after;
  return { value: result, cursor };
}

/** Borra el último token (acorde/sección) del contenido. */
export function deleteLastToken(prev: string): string {
  const trimmed = prev.replace(/[ \t]+$/g, "");
  const lastBreak = Math.max(trimmed.lastIndexOf(" "), trimmed.lastIndexOf("\n"));
  return lastBreak === -1 ? "" : trimmed.slice(0, lastBreak + 1);
}

/**
 * Borra el token inmediatamente anterior a la posición `pos` (borrado tipo
 * "palabra"). Devuelve el nuevo valor y la posición del cursor.
 */
export function deleteTokenBefore(value: string, pos: number): { value: string; cursor: number } {
  const before = value.slice(0, pos);
  const after = value.slice(pos);
  const trimmed = before.replace(/[ \t]+$/g, "");
  const lastBreak = Math.max(trimmed.lastIndexOf(" "), trimmed.lastIndexOf("\n"));
  const newBefore = lastBreak === -1 ? "" : trimmed.slice(0, lastBreak + 1);
  return { value: newBefore + after, cursor: newBefore.length };
}
