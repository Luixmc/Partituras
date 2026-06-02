"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Save, Type, Image as ImageIcon, FileText, Grid2X2 } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import { createClient } from "@/lib/supabase/client";
import type { Category, Sheet, SheetStatus } from "@/types";

type SheetWithCategory = Sheet & {
  category?: {
    name: string;
    color: string;
  } | null;
};

type Props = {
  sheet: SheetWithCategory;
  categories: Category[];
  canEdit: boolean;
};

function parseSections(text: string) {
  const sections: { title?: string; content: string }[] = [];
  const lines = text.split('\n');
  let currentSection: { title?: string; content: string } | null = null;

  lines.forEach(line => {
    const match = line.match(/^\[(.*?)\]/);
    if (match) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: match[1], content: '' };
    } else {
      if (!currentSection) currentSection = { content: '' };
      currentSection.content += line + ' ';
    }
  });
  if (currentSection) sections.push(currentSection);
  return sections;
}

export default function SongDetailEditor({ sheet, categories, canEdit }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState(sheet.title);
  const [composer, setComposer] = useState(sheet.composer ?? "");
  const [hymnNumber, setHymnNumber] = useState(sheet.hymn_number ?? "");
  const [keySignature, setKeySignature] = useState(sheet.key_signature ?? "C");
  const [timeSignature, setTimeSignature] = useState(sheet.time_signature ?? "4/4");
  const [categoryId, setCategoryId] = useState(sheet.category_id ?? "");
  const [status, setStatus] = useState<SheetStatus>(sheet.status);
  const [content, setContent] = useState(sheet.content ?? "");

  const appendToContent = (text: string) => {
    setContent((prev) => {
      const modifiers = ["#", "b", "m", "7"];
      const isModifier = modifiers.includes(text);
      const needsSpace = 
        prev.length > 0 && 
        !prev.endsWith(" ") && 
        !prev.endsWith("\n") && 
        !prev.endsWith("[") && 
        !text.startsWith("[") &&
        !isModifier;

      return prev + (needsSpace ? " " : "") + text;
    });
  };

  const deleteLastEntry = () => {
    setContent((prev) => {
      const trimmed = prev.replace(/[ \t]+$/g, "");
      const lastBreak = Math.max(trimmed.lastIndexOf(" "), trimmed.lastIndexOf("\n"));
      return lastBreak === -1 ? "" : trimmed.slice(0, lastBreak + 1);
    });
  };

  const handleImageImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setMessage(null);

    try {
      const Tesseract = await import("tesseract.js");
      
      const result = await Tesseract.recognize(
        file,
        'spa+eng',
        { logger: m => console.log(m) }
      );

      const extractedText = result.data.text;
      const cleanedText = extractedText
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleanedText) {
        throw new Error("No se pudo extraer texto de la imagen.");
      }

      setContent((prev) => (prev ? `${prev}\n${cleanedText}` : cleanedText));
      setMessage("Texto de imagen procesado correctamente.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error en OCR de imagen");
    } finally {
      setSaving(false);
      if (event.target) event.target.value = "";
    }
  };

  const handlePdfImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setMessage(null);

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText += textContent.items.map((item: any) => item.str).join(" ") + " ";
      }

      const cleanedText = extractedText.replace(/\s+/g, " ").trim();
      
      if (!cleanedText) {
        throw new Error("PDF sin texto extraíble.");
      }

      setContent((prev) => (prev ? `${prev}\n${cleanedText}` : cleanedText));
      setMessage("Texto importado del PDF correctamente.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al importar PDF");
    } finally {
      setSaving(false);
      if (event.target) event.target.value = "";
    }
  };

  async function handleSave() {
    if (!title.trim()) {
      setMessage("El titulo es obligatorio.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("sheets")
      .update({
        title: title.trim(),
        composer: composer.trim() || null,
        hymn_number: hymnNumber.trim() || null,
        key_signature: keySignature.trim() || null,
        time_signature: timeSignature.trim() || null,
        category_id: categoryId || null,
        status,
        editor_type: "abc",
        content,
      })
      .eq("id", sheet.id);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Cancion actualizada.");
    setMode("view");
    router.refresh();
  }

  return (
    <div className="flex-1 bg-slate-100">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {title || "Cancion sin titulo"}
            </h2>
            <p className="text-xs text-slate-500">
              {composer || "Sin autor"} · {keySignature || "Sin tonalidad"} · {timeSignature || "Sin compas"}
            </p>
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMode("view")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${
                mode === "view"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Eye className="h-4 w-4" />
              Vista
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${
                  mode === "edit"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Edit3 className="h-4 w-4" />
                Edicion
              </button>
            )}
          </div>
        </div>
      </div>

      {mode === "view" ? (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          <article className="mx-auto min-h-[72vh] w-full max-w-[900px] bg-white px-8 py-12 shadow-sm ring-1 ring-slate-200 md:px-12">
            <header className="mb-8 border-b border-slate-200 pb-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h1 className="font-display text-3xl font-bold text-slate-950">
                    {title}
                  </h1>
                  {composer && (
                    <p className="mt-1 text-sm text-slate-500">{composer}</p>
                  )}
                </div>
                {hymnNumber && (
                  <span className="rounded border border-slate-200 px-2 py-1 font-mono text-xs text-slate-500">
                    {hymnNumber}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                {sheet.category && <span>{sheet.category.name}</span>}
                {keySignature && <span>Tono: {keySignature}</span>}
                {timeSignature && <span>Compas: {timeSignature}</span>}
              </div>
            </header>

            {content.trim() ? (
              <div className="space-y-8">
                {parseSections(content).map((section, idx) => (
                  <TablaturePreview key={idx} notes={section.content} label={section.title} compact />
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-400">
                Sin contenido disponible
              </div>
            )}
          </article>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 md:grid-cols-[340px_1fr] md:px-8">
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-display font-semibold text-slate-800">
              Datos de la cancion
            </h3>
            <label className="block text-sm font-medium text-slate-700">
              Titulo
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Autor o compositor
              <input
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Numero
              <input
                value={hymnNumber}
                onChange={(event) => setHymnNumber(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <label className="block text-sm font-medium text-slate-700">
                Tonalidad
                <input
                  value={keySignature}
                  onChange={(event) => setKeySignature(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Compas
                <select
                  value={timeSignature}
                  onChange={(event) => setTimeSignature(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {["4/4", "3/4", "2/4", "6/8", "12/8", "2/2"].map((meter) => (
                    <option key={meter} value={meter}>
                      {meter}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Categoria
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Sin categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Estado
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as SheetStatus)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </label>
          </section>

          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Grid2X2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-slate-800">
                      Contenido
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Agrega notas solo con los botones. No edites el campo a mano.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 border border-slate-200"
                  >
                    <ImageIcon className="h-3 w-3" />
                    {saving ? "..." : "Imagen"}
                  </button>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageImport}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 border border-slate-200"
                  >
                    <FileText className="h-3 w-3" />
                    {saving ? "..." : "PDF"}
                  </button>
                  <input
                    type="file"
                    ref={pdfInputRef}
                    onChange={handlePdfImport}
                    accept="application/pdf"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-3">
                  {["C", "D", "E", "F", "G", "A", "B"].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => appendToContent(n)}
                      className="h-7 w-7 rounded bg-slate-100 text-[10px] font-bold text-slate-700 hover:bg-brand-500 hover:text-white transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                  <div className="mx-1 h-7 w-px bg-slate-200" />
                  {["#", "b", "m", "7", "%", "*", "|", "-"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => appendToContent(m)}
                      className="h-7 w-7 rounded bg-slate-50 text-[10px] font-medium text-slate-600 border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
                    >
                      {m}
                    </button>
                  ))}                  <button
                    type="button"
                    onClick={deleteLastEntry}
                    className="h-7 w-7 rounded bg-slate-50 text-[10px] font-medium text-slate-600 border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
                  >
                    ⌫
                  </button>                </div>
                
                <div className="flex flex-wrap gap-2">
                  {["[Intro]", "[Verso]", "[Coro]", "[Puente]", "[Final]"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => appendToContent(s + "\n")}
                      className="rounded-md bg-brand-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                      {s.replace(/[\[\]]/g, "")}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => appendToContent("(Letra)")}
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors"
                  >
                    <Type className="h-2.5 w-2.5" />
                    Texto
                  </button>
                </div>
              </div>
            </div>
            <textarea
              value={content}
              readOnly
              onPaste={(event) => event.preventDefault()}
              rows={7}
              spellCheck={false}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <TablaturePreview notes={content} />
            {message && (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {message}
              </p>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
