"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Save, Grid2X2, Moon, Sun, Minus, Plus } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import ChordToolbar from "@/components/sheets/ChordToolbar";
import ImportControls from "@/components/sheets/ImportControls";
import { appendToken, deleteLastToken } from "@/lib/chordInput";
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

export default function SongDetailEditor({ sheet, categories, canEdit }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

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

  // Preferencias de lectura (tamaño de letra y tema) para quien ve los acordes.
  const [fontScale, setFontScale] = useState(1);
  const [dark, setDark] = useState(false);

  // Guardamos el estado original para detectar cambios sin guardar.
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify({
      title: sheet.title,
      composer: sheet.composer ?? "",
      keySignature: sheet.key_signature ?? "C",
      timeSignature: sheet.time_signature ?? "4/4",
      categoryId: sheet.category_id ?? "",
      status: sheet.status,
      content: sheet.content ?? "",
    })
  );

  const currentSnapshot = JSON.stringify({
    title,
    composer,
    keySignature,
    timeSignature,
    categoryId,
    status,
    content,
  });
  const isDirty = currentSnapshot !== savedSnapshot;

  // Aviso al cerrar/recargar la pestaña si hay cambios sin guardar.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const requestLeaveEdit = () => {
    if (isDirty && !window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos?")) {
      return;
    }
    if (isDirty) {
      // Descartar: restauramos los valores guardados.
      const snap = JSON.parse(savedSnapshot);
      setTitle(snap.title);
      setComposer(snap.composer);
      setKeySignature(snap.keySignature);
      setTimeSignature(snap.timeSignature);
      setCategoryId(snap.categoryId);
      setStatus(snap.status);
      setContent(snap.content);
    }
    setMode("view");
  };

  // Cargar/guardar preferencias de lectura en el navegador.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("reading-prefs");
      if (saved) {
        const prefs = JSON.parse(saved);
        if (typeof prefs.fontScale === "number") setFontScale(prefs.fontScale);
        if (typeof prefs.dark === "boolean") setDark(prefs.dark);
      }
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("reading-prefs", JSON.stringify({ fontScale, dark }));
    } catch {
      /* ignore */
    }
  }, [fontScale, dark]);

  const appendToContent = (text: string) => setContent((prev) => appendToken(prev, text));
  const deleteLastEntry = () => setContent((prev) => deleteLastToken(prev));

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
    // Actualizamos el snapshot: ya no hay cambios pendientes.
    setSavedSnapshot(currentSnapshot);
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

          {/* Controles de lectura: tamaño de letra y tema (solo en vista) */}
          {mode === "view" && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setFontScale((s) => Math.max(0.7, +(s - 0.1).toFixed(2)))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900"
                title="Reducir letra"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2.5rem] text-center text-xs font-semibold text-slate-600">
                {Math.round(fontScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setFontScale((s) => Math.min(2, +(s + 0.1).toFixed(2)))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900"
                title="Aumentar letra"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="mx-1 h-5 w-px bg-slate-200" />
              <button
                type="button"
                onClick={() => setDark((d) => !d)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900"
                title={dark ? "Modo claro" : "Modo oscuro"}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          )}

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={requestLeaveEdit}
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
        <div className={`mx-auto max-w-5xl px-4 py-8 md:px-8 ${dark ? "bg-slate-950" : ""}`}>
          <article
            className={`mx-auto min-h-[72vh] w-full max-w-[900px] px-8 py-12 shadow-sm ring-1 md:px-12 ${
              dark ? "bg-slate-900 ring-slate-700" : "bg-white ring-slate-200"
            }`}
          >
            <header className={`mb-8 border-b pb-5 ${dark ? "border-slate-700" : "border-slate-200"}`}>
              <h1 className={`font-display text-3xl font-bold ${dark ? "text-slate-50" : "text-slate-950"}`}>
                {title}
              </h1>
              {composer && (
                <p className={`mt-1 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{composer}</p>
              )}
              <div
                className={`mt-4 flex flex-wrap gap-2 text-xs font-semibold ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
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
                    fontScale={fontScale}
                    dark={dark}
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
              <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Grid2X2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-slate-800">Contenido</h3>
                    <p className="text-[10px] text-slate-500">
                      Usa los botones, escribe directo o importa un archivo.
                    </p>
                  </div>
                </div>
                <ImportControls
                  label="Importar archivo"
                  onImported={({ text, title: detectedTitle }) => {
                    setContent((prev) => (prev.trim() ? `${prev}\n${text}` : text));
                    if (!title.trim() && detectedTitle) setTitle(detectedTitle);
                    setMessage("Archivo importado. Revisa y ajusta el contenido.");
                    setMessageType("ok");
                  }}
                  onError={(msg) => {
                    setMessage(msg);
                    setMessageType("error");
                  }}
                />
              </div>

              <ChordToolbar onInsert={appendToContent} onDelete={deleteLastEntry} />
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full min-h-[180px] rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Escribe notas y secciones. Usa los botones o escribe directo. Ejemplo: <Intro>\nC Am F G"
            />

            {/* Vista previa idéntica al modo lectura: separada por secciones. */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              {content.trim() ? (
                <div className="space-y-4">
                  {parseSections(content).map((section, idx) => (
                    <TablaturePreview key={idx} notes={section.content} label={section.title} compact />
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">La vista previa aparecerá aquí.</p>
              )}
            </div>

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
