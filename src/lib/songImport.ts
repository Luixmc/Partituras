// Importación de canciones desde archivos: PDF, imagen (OCR) o texto plano.
// Devuelve el texto extraído y, si se puede, un título sugerido.

export type ImportResult = {
  text: string;
  title: string | null;
};

function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/[ \t]*\n[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractFromPdf(file: File): Promise<ImportResult> {
  const pdfjs = await import("pdfjs-dist");
  // pdfjs-dist v5 usa un worker ESM (.mjs). Servimos una copia local desde
  // /public (mismo origen, funciona sin conexión). Si actualizas pdfjs-dist,
  // vuelve a copiar el worker con: npm run copy-pdf-worker.
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let extracted = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    extracted += content.items.map((item: any) => ("str" in item ? item.str : "")).join(" ") + "\n";
  }

  const text = cleanText(extracted);
  if (!text) {
    throw new Error("El PDF no tiene texto extraíble. Si es un escaneo, impórtalo como imagen.");
  }

  // Título: metadatos del PDF y, si no, el nombre del archivo.
  let title: string | null = null;
  try {
    const meta = await pdf.getMetadata();
    const info = meta?.info as { Title?: string } | undefined;
    if (info?.Title && info.Title.trim()) title = info.Title.trim();
  } catch {
    /* sin metadatos: usamos el nombre del archivo */
  }
  if (!title) title = titleFromFilename(file.name);

  return { text, title };
}

async function extractFromImage(file: File): Promise<ImportResult> {
  const Tesseract = await import("tesseract.js");
  const result = await Tesseract.recognize(file, "spa+eng");
  const text = cleanText(result.data.text);
  if (!text) throw new Error("No se pudo extraer texto de la imagen.");
  return { text, title: titleFromFilename(file.name) };
}

async function extractFromTextFile(file: File): Promise<ImportResult> {
  const text = cleanText(await file.text());
  if (!text) throw new Error("El archivo de texto está vacío.");
  // Primera línea no vacía como posible título (si es razonablemente corta).
  const firstLine = text.split("\n").map((l) => l.trim()).find(Boolean) ?? null;
  const title = firstLine && firstLine.length <= 80 ? firstLine : titleFromFilename(file.name);
  return { text, title };
}

/** Extrae texto + título de un archivo, eligiendo el método según su tipo. */
export async function extractFromFile(file: File): Promise<ImportResult> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return extractFromPdf(file);
  }
  if (type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/.test(name)) {
    return extractFromImage(file);
  }
  if (type.startsWith("text/") || /\.(txt|md|csv|text)$/.test(name)) {
    return extractFromTextFile(file);
  }
  throw new Error("Formato no soportado. Usa PDF, imagen (PNG/JPG) o un archivo de texto.");
}

/** Tipos aceptados por el selector de archivos (atributo accept). */
export const IMPORT_ACCEPT = "application/pdf,image/*,.txt,.md,.csv";
