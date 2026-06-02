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
  const lines = text.split("\n");
  let currentSection: { title?: string; content: string } | null = null;

  lines.forEach((line) => {
    const match = line.match(/^\[(.*?)\]|^<(.*?)>/);
    if (match) {
      const title = match[1] || match[2];
      if (currentSection) sections.push(currentSection);
      currentSection = { title, content: "" };
    } else {
      if (!currentSection) currentSection = { content: "" };
      currentSection.content += line + " ";
    }
  });
  if (currentSection) sections.push(currentSection);
  return sections;
}

// Modifiers que NO llevan espacio antes
const MODIFIERS = new Set([
  "#", "b", "m", "7",
  "maj7", "maj9", "m7", "m9",
  "sus2", "sus4",
  "dim", "dim7",
  "aug", "aug7",
  "add9", "add11",
  "m7b5",
  ":1", ":2", ":3", ":4", ":0.5",
]);

export default function SongDetailEditor({ sheet, categories, canEdit }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"ok" | "error">("ok");

  const [title, setTitle] = useState(sheet.title);
  const [composer, setComposer] = useState(sheet.composer ?? "");
  const [keySignature, setKeySignature] = useState(sheet.key_signature ?? "C");
  const [timeSignature, setTimeSignature] = useState(sheet.time_signature ?? "4/4");
  const [categoryId, setCategoryId] = useState(sheet.category_id ?? "");
  const [status, setStatus] = useState<SheetStatus>(sheet.status);
  const [content, setContent] = useState(sheet.content ?? "");

  const appendToContent = (text: string) => {
    setContent((prev) => {
      const isModifier = MODIFIERS.has(text) || text.startsWith(":");
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
      const result = await Tesseract.recognize(file, "spa+eng", {
        logger: (m) => console.log(m),
      });
      const cleanedText = result.data.text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      if (!cleanedText) throw new Error("No se pudo extraer texto de la imagen.");
      setContent((prev) => (prev ? `${prev}\n${cleanedText}` : cleanedText));
      setMessage("Texto de imagen procesado correctamente.");
      setMessageType("ok");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error en OCR de imagen");
      setMessageType("error");
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
      if (!cleanedText) throw new Error("PDF sin texto extraíble.");
      setContent((prev) => (prev ? `${prev}\n${cleanedText}` : cleanedText));
      setMessage("Texto importado del PDF correctamente.");
      setMessageType("ok");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al importar PDF");
      setMessageType("error");
    } finally {
      setSaving(false);
      if (event.target) event.target.value = "";
    }
  };

  async function handleSave() {
    if (!title.trim()) {
      setMessage("El titulo es obligatorio.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("sheets")
      .update({
        title: title.trim(),
        composer: composer.trim() || null,
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
      setMessageType("error");
      return;
    }

    setMessage("Cambios guardados correctamente.");
    setMessageType("ok");
    // Nos quedamos en modo edición para poder seguir editando
    router.refresh();
  }

  return (
    <div className="flex-1 bg-slate-100">
      {/* Barra superior */}
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

      {/* ── MODO VISTA ── */}
      {mode === "view" ? (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          <article className="mx-auto min-h-[72vh] w-full max-w-[900px] bg-white px-8 py-12 shadow-sm ring-1 ring-slate-200 md:px-12">
            <header className="mb-8 border-b border-slate-200 pb-5">
              <h1 className="font-display text-3xl font-bold text-slate-950">{title}</h1>
              {composer && <p className="mt-1 text-sm text-slate-500">{composer}</p>}
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                {sheet.category && <span>{sheet.category.name}</span>}
                {keySignature && <span>Tono: {keySignature}</span>}
                {timeSignature && <span>Compas: {timeSignature}</span>}
              </div>
            </header>

            {content.trim() ? (
              <div className="space-y-8">
                {parseSections(content).map((section, idx) => (
                  <TablaturePreview
                    key={idx}
                    notes={section.content}
                    label={section.title}
                    compact
                  />
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
        /* ── MODO EDICIÓN ── */
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 md:grid-cols-[340px_1fr] md:px-8">
          {/* Panel izquierdo: metadatos */}
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="font-display font-semibold text-slate-800">Datos de la cancion</h3>

            <label className="block text-sm font-medium text-slate-700">
              Titulo
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Autor o compositor
              <input
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <label className="block text-sm font-medium text-slate-700">
                Tonalidad
                <input
                  value={keySignature}
                  onChange={(e) => setKeySignature(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Compas
                <select
                  value={timeSignature}
                  onChange={(e) => setTimeSignature(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {["4/4", "3/4", "2/4", "6/8", "12/8", "2/2"].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Categoría como pills */}
            <div className="block text-sm font-medium text-slate-700">
              Categoria
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategoryId("")}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    !categoryId
                      ? "bg-slate-700 text-white border-slate-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  Sin categoria
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id === categoryId ? "" : cat.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      cat.id === categoryId
                        ? "text-white border-transparent"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                    style={
                      cat.id === categoryId
                        ? { backgroundColor: cat.color, borderColor: cat.color }
                        : undefined
                    }
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Estado
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SheetStatus)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </label>
          </section>

          {/* Panel derecho: contenido */}
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Grid2X2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-slate-800">Contenido</h3>
                    <p className="text-[10px] text-slate-500">
                      Usa los botones para insertar acordes, secciones y texto.
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
                  <input type="file" ref={imageInputRef} onChange={handleImageImport} accept="image/*" className="hidden" />
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 border border-slate-200"
                  >
                    <FileText className="h-3 w-3" />
                    {saving ? "..." : "PDF"}
                  </button>
                  <input type="file" ref={pdfInputRef} onChange={handlePdfImport} accept="application/pdf" className="hidden" />
                </div>
              </div>

              <div className="space-y-2 mt-3">
                {/* Fila 1: Notas base */}
                <div className="flex flex-wrap gap-1 pb-2 border-b border-slate-100">
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
                  {/* Alteraciones básicas */}
                  {["#", "b", "m", "7"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => appendToContent(m)}
                      className="h-7 min-w-[28px] rounded bg-slate-50 px-1 text-[10px] font-medium text-slate-600 border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
                    >
                      {m}
                    </button>
                  ))}
                  <div className="mx-1 h-7 w-px bg-slate-200" />
                  <button
                    type="button"
                    onClick={deleteLastEntry}
                    className="h-7 w-7 rounded bg-red-50 text-[10px] font-medium text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    ⌫
                  </button>
                </div>

                {/* Fila 2: Alteraciones extendidas */}
                <div className="flex flex-wrap gap-1 pb-2 border-b border-slate-100">
                  <span className="self-center text-[9px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Alt:</span>
                  {["maj7", "m7", "m7b5", "dim", "dim7", "aug", "sus2", "sus4", "add9"].map((alt) => (
                    <button
                      key={alt}
                      type="button"
                      onClick={() => appendToContent(alt)}
                      className="h-6 rounded bg-brand-50 px-1.5 text-[9px] font-semibold text-brand-700 border border-brand-100 hover:bg-brand-100 transition-colors"
                    >
                      {alt}
                    </button>
                  ))}
                  <span className="self-center text-[9px] text-slate-400 font-semibold uppercase tracking-wider mx-1">Dur:</span>
                  {[":1", ":2", ":3", ":4"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => appendToContent(d)}
                      className="h-6 rounded bg-slate-100 px-1.5 text-[9px] font-semibold text-slate-600 border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                  {/* Barra de bajo */}
                  <span className="self-center text-[9px] text-slate-400 font-semibold uppercase tracking-wider mx-1">Bajo:</span>
                  <button
                    type="button"
                    onClick={() => appendToContent("/")}
                    className="h-6 w-6 rounded bg-slate-50 text-[10px] font-medium text-slate-600 border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
                  >
                    /
                  </button>
                </div>

                {/* Fila 3: Secciones + texto */}
                <div className="flex flex-wrap gap-2">
                  {["<Intro>", "<Verso>", "<Coro>", "<Puente>", "<Final>"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => appendToContent(s + "\n")}
                      className="rounded-md bg-brand-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-700 hover:bg-brand-100 transition-colors"
                    >
                      {s.replace(/[<>]/g, "")}
                    </button>
                  ))}
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => appendToContent("(Letra)")}
                    className="inline-flex items-center gap-1 rounded-md border border-dashed border-amber-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 hover:border-amber-400 hover:bg-amber-50 transition-colors"
                  >
                    <Type className="h-2.5 w-2.5" />
                    Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => appendToContent("|")}
                    className="rounded-md border border-slate-200 px-2 py-0.5 text-[9px] font-bold text-slate-500 hover:border-slate-400 transition-colors"
                  >
                    | Barra
                  </button>
                </div>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full min-h-[180px] rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Escribe notas y secciones. Usa los botones o escribe directo. Ejemplo: <Intro>\nC Am F G"
            />

            <TablaturePreview notes={content} />

            {message && (
              <p className={`rounded-lg px-4 py-3 text-sm ${
                messageType === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
              }`}>
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
