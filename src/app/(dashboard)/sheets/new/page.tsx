"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Grid2X2, Save } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import ChordToolbar from "@/components/sheets/ChordToolbar";
import ImportControls from "@/components/sheets/ImportControls";
import { appendToken, deleteLastToken } from "@/lib/chordInput";
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
  const [keySignature, setKeySignature] = useState("C");
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tabNotes, setTabNotes] = useState("");

  const toggleCategory = (id: string) =>
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, [supabase]);

  const appendToNotes = (text: string) => setTabNotes((prev) => appendToken(prev, text));
  const deleteLastNote = () => setTabNotes((prev) => deleteLastToken(prev));

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
          key_signature: keySignature || null,
          time_signature: timeSignature || null,
          category_id: categoryIds[0] ?? null,
          content: tabNotes,
          status: "published",
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Vinculamos todas las categorías elegidas (best-effort: si la migración
      // 010 no está aplicada, la canción se crea igual con su categoría principal).
      if (categoryIds.length) {
        await supabase
          .from("sheet_categories")
          .insert(categoryIds.map((category_id) => ({ sheet_id: song.id, category_id })));
      }

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
            <h1 className="font-display text-xl font-bold text-slate-900">Nueva cancion</h1>
            <p className="text-sm text-slate-500">Crea una nueva partitura con acordes.</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-5xl gap-5 px-4 py-6 md:grid-cols-[320px_1fr] md:px-8"
      >
        {/* Panel de metadatos */}
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-display font-semibold text-slate-800">Datos</h2>

          <label className="block text-sm font-medium text-slate-700">
            Titulo <span className="text-red-500">*</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Nombre de la cancion"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Autor o compositor
            <input
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Nombre"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <label className="block text-sm font-medium text-slate-700">
              Tonalidad
              <input
                value={keySignature}
                onChange={(e) => setKeySignature(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="C, Dm, F, Bb"
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

          {/* Categorías (selección múltiple) */}
          <div className="block text-sm font-medium text-slate-700">
            Categorias
            <span className="ml-1 text-[10px] font-normal text-slate-400">(puedes elegir varias)</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCategoryIds([])}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  categoryIds.length === 0
                    ? "bg-slate-700 text-white border-slate-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-400"
                }`}
              >
                Sin categoria
              </button>
              {categories.map((cat) => {
                const selected = categoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      selected
                        ? "text-white border-transparent"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                    style={selected ? { backgroundColor: cat.color, borderColor: cat.color } : undefined}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Panel de contenido */}
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Grid2X2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display font-semibold text-slate-800">Notas del grid</h2>
                <p className="text-xs text-slate-500">
                  Usa los botones para agregar acordes y alteraciones.
                </p>
              </div>
            </div>
            <ImportControls
              label="Importar archivo"
              onImported={({ text, title: detectedTitle }) => {
                setTabNotes((prev) => (prev.trim() ? `${prev}\n${text}` : text));
                if (!title.trim() && detectedTitle) setTitle(detectedTitle);
                setError(null);
              }}
              onError={(msg) => setError(msg)}
            />
          </div>

          <ChordToolbar onInsert={appendToNotes} onDelete={deleteLastNote} />

          <textarea
            value={tabNotes}
            onChange={(e) => setTabNotes(e.target.value)}
            placeholder="Escribe notas o usa los botones. Ejemplo: <Intro>\nC Am F G"
            rows={6}
            spellCheck={false}
            className="w-full min-h-[180px] rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <TablaturePreview notes={tabNotes} />

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
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
              {loading ? "Guardando..." : "Guardar cancion"}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
