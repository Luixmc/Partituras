"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Music2,
  ScanLine,
  Upload,
  Wand2,
} from "lucide-react";
import LeadSheetComposer from "@/components/sheets/LeadSheetComposer";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

export default function NewSheetPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [hymnNumber, setHymnNumber] = useState("");
  const [keySignature, setKeySignature] = useState("C");
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [categoryId, setCategoryId] = useState("");
  const [editorType, setEditorType] = useState<"pdf_upload" | "musicxml">("musicxml");
  const [musicXmlContent, setMusicXmlContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, [supabase]);

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

      let storagePath: string | null = null;

      if (editorType === "pdf_upload" && pdfFile) {
        const ext = pdfFile.name.split(".").pop() || "pdf";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("sheets")
          .upload(path, pdfFile, { contentType: pdfFile.type });

        if (uploadError) throw uploadError;
        storagePath = path;
      }

      const { data: sheet, error: insertError } = await supabase
        .from("sheets")
        .insert({
          title,
          composer: composer || null,
          hymn_number: hymnNumber || null,
          key_signature: keySignature || null,
          time_signature: timeSignature || null,
          category_id: categoryId || null,
          editor_type: editorType,
          content: editorType === "musicxml" ? musicXmlContent : null,
          storage_path: storagePath,
          status: "draft",
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/catalog/${sheet.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la partitura");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 md:px-8">
        <Link
          href="/catalog"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200"
          aria-label="Volver al catalogo"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">
            Nueva cancion
          </h1>
          <p className="text-sm text-slate-500">
            Crea repertorio con PDF escaneado o cifrado americano.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:px-8"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {(["musicxml", "pdf_upload"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEditorType(type)}
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
                editorType === type
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              {type === "musicxml" ? (
                <Music2 className="h-6 w-6 flex-shrink-0" />
              ) : (
                <ScanLine className="h-6 w-6 flex-shrink-0" />
              )}
              <span>
                <span className="block text-sm font-semibold">
                  {type === "musicxml"
                    ? "Crear partitura MusicXML"
                    : "Escanear o subir PDF"}
                </span>
                <span className="mt-1 block text-xs font-medium opacity-80">
                  {type === "musicxml"
                    ? "Pentagrama, notas, letras y acordes renderizados con OSMD."
                    : "Guarda el PDF original y deja listo el camino para OMR."}
                </span>
              </span>
            </button>
          ))}
        </div>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display font-semibold text-slate-800">
            Informacion basica
          </h2>

          <label className="block text-sm font-medium text-slate-700">
            Titulo <span className="text-red-500">*</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Nombre de la cancion"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Autor o compositor
              <input
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Nombre"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Numero de himno
              <input
                value={hymnNumber}
                onChange={(event) => setHymnNumber(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="HV-042"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="block text-sm font-medium text-slate-700">
              Tonalidad
              <input
                value={keySignature}
                onChange={(event) => setKeySignature(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="C, Dm, F, Bb"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Compas
              <select
                value={timeSignature}
                onChange={(event) => setTimeSignature(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {["4/4", "3/4", "2/4", "6/8", "12/8", "2/2"].map((meter) => (
                  <option key={meter} value={meter}>
                    {meter}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Categoria
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Sin categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display font-semibold text-slate-800">Contenido</h2>

          {editorType === "pdf_upload" ? (
            <div className="space-y-4">
              <label
                htmlFor="pdf-upload"
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all ${
                  pdfFile
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
                }`}
              >
                <Upload
                  className={`h-8 w-8 ${
                    pdfFile ? "text-brand-500" : "text-slate-300"
                  }`}
                />
                <span className="text-center">
                  <span className="block text-sm font-medium text-slate-700">
                    {pdfFile ? pdfFile.name : "Seleccionar PDF escaneado"}
                  </span>
                  {!pdfFile && (
                    <span className="mt-1 block text-xs text-slate-400">
                      PDF hasta 20 MB
                    </span>
                  )}
                </span>
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
              />

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">Flat Embed</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Editor completo: carga MusicXML, edita y exporta MusicXML o MIDI.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">Audiveris OMR</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Motor abierto para convertir PDF o imagen a MusicXML en un servicio aparte.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">VexFlow</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Base para un editor propio con SVG/Canvas cuando necesites mas control.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
                <Wand2 className="h-4 w-4 flex-shrink-0" />
                Escribe acordes por compas. Ejemplo: C | G/B | Am | F.
              </div>
              <LeadSheetComposer
                title={title}
                composer={composer}
                keySignature={keySignature}
                timeSignature={timeSignature}
                musicXmlContent={musicXmlContent}
                onMusicXmlChange={setMusicXmlContent}
              />
            </div>
          )}
        </section>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pb-8">
          <Link
            href="/catalog"
            className="flex-1 rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !title}
            className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar borrador"}
          </button>
        </div>
      </form>
    </div>
  );
}
