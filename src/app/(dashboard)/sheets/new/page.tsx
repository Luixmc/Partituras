"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types";

export default function NewSheetPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [hymnNumber, setHymnNumber] = useState("");
  const [keySignature, setKeySignature] = useState("");
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [categoryId, setCategoryId] = useState("");
  const [editorType, setEditorType] = useState<"pdf_upload" | "abc">("pdf_upload");
  const [abcContent, setAbcContent] = useState("X:1\nT:\nM:4/4\nL:1/4\nK:C\n");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let storagePath: string | null = null;

      // Upload PDF if provided
      if (editorType === "pdf_upload" && pdfFile) {
        const ext = pdfFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("sheets")
          .upload(path, pdfFile, { contentType: pdfFile.type });

        if (uploadError) throw uploadError;
        storagePath = path;
      }

      // Insert sheet
      const { data: sheet, error: insertError } = await supabase
        .from("sheets")
        .insert({
          title,
          composer:       composer || null,
          hymn_number:    hymnNumber || null,
          key_signature:  keySignature || null,
          time_signature: timeSignature || null,
          category_id:    categoryId || null,
          editor_type:    editorType,
          content:        editorType === "abc" ? abcContent : null,
          storage_path:   storagePath,
          status:         "draft",
          created_by:     user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/catalog/${sheet.id}`);
    } catch (err: any) {
      setError(err.message ?? "Error al guardar la partitura");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center gap-3">
        <Link href="/catalog"
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <h1 className="font-display font-bold text-slate-900 text-xl">Nueva partitura</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Editor type selector */}
        <div className="grid grid-cols-2 gap-3">
          {(["pdf_upload", "abc"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEditorType(type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all
                ${editorType === type
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                }`}
            >
              {type === "pdf_upload"
                ? <Upload className="w-6 h-6" />
                : <FileText className="w-6 h-6" />
              }
              <span className="text-sm font-semibold">
                {type === "pdf_upload" ? "Subir PDF" : "Editor ABC"}
              </span>
            </button>
          ))}
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-display font-semibold text-slate-800">Información básica</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Nombre de la partitura"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Compositor</label>
              <input
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">N° himno</label>
              <input
                value={hymnNumber}
                onChange={(e) => setHymnNumber(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="HV-042"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tonalidad</label>
              <input
                value={keySignature}
                onChange={(e) => setKeySignature(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="F major"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Compás</label>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {["4/4","3/4","2/4","6/8","12/8","2/2"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-display font-semibold text-slate-800">Contenido</h2>

          {editorType === "pdf_upload" ? (
            <div>
              <label
                htmlFor="pdf-upload"
                className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed
                           rounded-2xl p-8 cursor-pointer transition-all
                           ${pdfFile ? "border-brand-400 bg-brand-50" : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"}`}
              >
                <Upload className={`w-8 h-8 ${pdfFile ? "text-brand-500" : "text-slate-300"}`} />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    {pdfFile ? pdfFile.name : "Toca para seleccionar un PDF"}
                  </p>
                  {!pdfFile && (
                    <p className="text-xs text-slate-400 mt-1">PDF hasta 20 MB</p>
                  )}
                </div>
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Notación ABC
              </label>
              <textarea
                value={abcContent}
                onChange={(e) => setAbcContent(e.target.value)}
                rows={10}
                className="w-full font-mono text-xs border border-slate-200 rounded-xl px-4 py-3
                           focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                spellCheck={false}
              />
              <p className="text-xs text-slate-400 mt-1">
                Notación ABC estándar. El preview se muestra en la vista de detalle.
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3 pb-8">
          <Link
            href="/catalog"
            className="flex-1 py-3 text-center rounded-xl border border-slate-200 text-slate-600
                       text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !title}
            className="flex-1 py-3 bg-brand-600 text-white rounded-xl text-sm font-semibold
                       hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? "Guardando..." : "Guardar borrador"}
          </button>
        </div>
      </form>
    </div>
  );
}
