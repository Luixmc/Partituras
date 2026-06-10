// Separa el contenido de una canción en secciones (<Intro>, [Coro]...).
// Cada sección se renderiza como un TablaturePreview con su etiqueta.
// (Misma lógica que usa SongDetailEditor en su vista.)
export function parseSections(text: string): { title?: string; content: string }[] {
  const sections: { title?: string; content: string }[] = [];
  const lines = text.split("\n");
  let current: { title?: string; content: string } | null = null;

  lines.forEach((line) => {
    const match = line.match(/^\[(.*?)\]|^<(.*?)>/);
    if (match) {
      const title = match[1] || match[2];
      if (current) sections.push(current);
      current = { title, content: "" };
    } else {
      if (!current) current = { content: "" };
      current.content += line + " ";
    }
  });
  if (current) sections.push(current);
  return sections;
}
