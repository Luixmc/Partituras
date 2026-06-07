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
]);

/** Añade un token al contenido respetando los espacios de la notación. */
export function appendToken(prev: string, text: string): string {
  // Las barras y signos de repetición siempre van separados por espacios.
  const isBarToken = text === "|" || text === "|:" || text === ":|";
  const isModifier = !isBarToken && (MODIFIERS.has(text) || text.startsWith(":"));
  const needsSpace =
    prev.length > 0 &&
    !prev.endsWith(" ") &&
    !prev.endsWith("\n") &&
    !prev.endsWith("[") &&
    !prev.endsWith("<") &&
    !text.startsWith("[") &&
    !text.startsWith("<") &&
    !isModifier;
  return prev + (needsSpace ? " " : "") + text;
}

/** Borra el último token (acorde/sección) del contenido. */
export function deleteLastToken(prev: string): string {
  const trimmed = prev.replace(/[ \t]+$/g, "");
  const lastBreak = Math.max(trimmed.lastIndexOf(" "), trimmed.lastIndexOf("\n"));
  return lastBreak === -1 ? "" : trimmed.slice(0, lastBreak + 1);
}
