"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Grid2X2, Save, Type, Image as ImageIcon, FileText } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

export default function NewSheetPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [hymnNumber, setHymnNumber] = useState("");
  const [keySignature, setKeySignature] = useState("C");
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [categoryId, setCategoryId] = useState("");
  const [tabNotes, setTabNotes] = useState("");

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, [supabase]);

  const appendToNotes = (text: string) => {
    setTabNotes((prev) => {
      const modifiers = ["#", "b", "m", "7"];
      const isModifier = modifiers.includes(text);
      const needsSpace = 
        prev.length > 0 && 
        !prev.endsWith(" ") && 
        !prev.endsWith("\n") && 
        !prev.endsWith("[") && 
        !text.startsWith("[") &&
        !isModifier; // No añade espacio si es una alteración
      
      return prev + (needsSpace ? " " : "") + text;
    });
  };

  const handleImageImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Importación dinámica de Tesseract.js
      const Tesseract = await import("tesseract.js");
      
      const result = await Tesseract.recognize(
        file,
        'spa+eng', // Soporta español e inglés para detectar acordes y letras
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

      setTabNotes((prev) => (prev ? `${prev}\n${cleanedText}` : cleanedText));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar la imagen");
    } finally {
      setLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handlePdfImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Importación dinámica de pdfjs-dist
      const pdfjs = await import("pdfjs-dist");
      // Configuración del worker vía CDN para compatibilidad con Next.js
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
        throw new Error("No se encontró texto en el PDF. Si es un escaneo, usa la importación por imagen.");
      }

      setTabNotes((prev) => (prev ? `${prev}\n${cleanedText}` : cleanedText));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al importar el PDF");
    } finally {
      setLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title) return;

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No autenticado");

      const { data: song, error: insertError } = await supabase
        .from("sheets")
        .insert({
          title,
          composer: composer || null,
          hymn_number: hymnNumber || null,
          key_signature: keySignature || null,
          time_signature: timeSignature || null,
          category_id: categoryId || null,
          content: tabNotes,
          status: "published",
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/catalog/${song.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : typeof err === "object" && err && "message" in err
            ? String(err.message)
            : "Error al guardar la tablatura"
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-100">
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            href="/catalog"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 transition-colors hover:bg-slate-200"
            aria-label="Volver al catalogo"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              Nueva tablatura
            </h1>
            <p className="text-sm text-slate-500">
              Escribe las notas y revisalas en un grid continuo.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-5xl gap-5 px-4 py-6 md:grid-cols-[320px_1fr] md:px-8"
      >
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-display font-semibold text-slate-800">
            Datos
          </h2>

          <label className="block text-sm font-medium text-slate-700">
            Titulo <span className="text-red-500">*</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Nombre de la cancion"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Autor o compositor
            <input
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Nombre"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Numero de himno
            <input
              value={hymnNumber}
              onChange={(event) => setHymnNumber(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="HV-042"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <label className="block text-sm font-medium text-slate-700">
              Tonalidad
              <input
                value={keySignature}
                onChange={(event) => setKeySignature(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="C, Dm, F, Bb"
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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Grid2X2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display font-semibold text-slate-800">
                  Notas del grid
                </h2>
                <p className="text-xs text-slate-500">
                  Usa [Seccion] para separar. Ej: [Intro] C G Am F
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                {loading ? "..." : "Imagen (OCR)"}
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
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                <FileText className="h-3.5 w-3.5" />
                {loading ? "Procesando..." : "PDF"}
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

          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
              {["C", "D", "E", "F", "G", "A", "B"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => appendToNotes(n)}
                  className="h-8 w-8 rounded bg-slate-100 text-xs font-bold text-slate-700 hover:bg-brand-500 hover:text-white transition-colors"
                >
                  {n}
                </button>
              ))}
              <div className="mx-1 h-8 w-px bg-slate-200" />
              {["#", "b", "m", "7", "%", "*", "|", "-"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => appendToNotes(m)}
                  className="h-8 w-8 rounded bg-slate-50 text-xs font-medium text-slate-600 border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {["[Intro]", "[Verso]", "[Coro]", "[Puente]", "[Final]"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => appendToNotes(s + "\n")}
                  className="rounded-md bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  {s.replace(/[\[\]]/g, "")}
                </button>
              ))}
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => appendToNotes("(Letra)")}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-colors"
              >
                <Type className="h-3 w-3" />
                Texto / No nota
              </button>
            </div>
          </div>

          <textarea
            value={tabNotes}
            onChange={(event) => setTabNotes(event.target.value)}
            placeholder="[Intro] C G Am F [Verso] C D E..."
            rows={6}
            spellCheck={false}
            className="w-full resize-none rounded-lg border border-slate-200 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <TablaturePreview notes={tabNotes} />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/catalog"
              className="flex-1 rounded-lg border border-slate-200 py-3 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !title}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Guardando..." : "Guardar borrador"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
