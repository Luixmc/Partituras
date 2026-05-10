export type NoteCell = {
  note: string;
};

export function parseNotes(input: string): NoteCell[] {
  return input
    .replace(/[|\n\r\t]/g, " ") // Reemplaza barras y saltos de línea por espacios
    .split(/\s+/)               // Divide por cualquier cantidad de espacios
    .filter((n) => n.trim() !== "") // Elimina elementos vacíos
    .map((n) => ({ note: n }));
}