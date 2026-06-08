"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Eye, Save, Grid2X2, Moon, Sun, Minus, Plus } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import ChordToolbar from "@/components/sheets/ChordToolbar";
import ImportControls from "@/components/sheets/ImportControls";
import { appendToken, insertToken, deleteTokenBefore } from "@/lib/chordInput";
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
  initialCategoryIds?: string[];
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

export default function SongDetailEditor({ sheet, categories, initialCategoryIds, canEdit }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const startCategoryIds =
    initialCategoryIds && initialCategoryIds.length
      ? initialCategoryIds
      : sheet.category_id
        ? [sheet.category_id]
        : [];

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"ok" | "error">("ok");

  const [title, setTitle] = useState(sheet.title);
  const [composer, setComposer] = useState(sheet.composer ?? "");
  const [keySignature, setKeySignature] = useState(sheet.key_signature ?? "C");
  const [timeSignature, setTimeSignature] = useState(sheet.time_signature ?? "4/4");
  const [categoryIds, setCategoryIds] = useState<string[]>(startCategoryIds);
  const [status, setStatus] = useState<SheetStatus>(sheet.status);
  const [content, setContent] = useState(sheet.content ?? "");

  const toggleCategory = (id: string) =>
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

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
      categoryIds: [...startCategoryIds].sort(),
      status: sheet.status,
      content: sheet.content ?? "",
    })
  );

  const currentSnapshot = JSON.stringify({
    title,
    composer,
    keySignature,
    timeSignature,
    categoryIds: [...categoryIds].sort(),
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

  // Intercepta la navegación interna (enlaces del menú, "volver", etc.) para
  // mostrar el diálogo de guardar/descartar en vez de salir sin avisar.
  useEffect(() => {
    if (mode !== "edit" || !isDirty) return;
    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      e.preventDefault();
      e.stopPropagation();
      setLeavePrompt({ proceed: () => router.push(url.pathname + url.search) });
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [mode, isDirty, router]);

  // Diálogo "guardar o descartar" al salir con cambios sin guardar.
  const [leavePrompt, setLeavePrompt] = useState<{ proceed: () => void } | null>(null);

  const restoreSnapshot = () => {
    const snap = JSON.parse(savedSnapshot);
    setTitle(snap.title);
    setComposer(snap.composer);
    setKeySignature(snap.keySignature);
    setTimeSignature(snap.timeSignature);
    setCategoryIds(snap.categoryIds ?? []);
    setStatus(snap.status);
    setContent(snap.content);
  };

  // Pide salir: si hay cambios, muestra el diálogo; si no, sigue de una.
  const requestLeave = (proceed: () => void) => {
    if (mode === "edit" && isDirty) setLeavePrompt({ proceed });
    else proceed();
  };

  const requestLeaveEdit = () => requestLeave(() => setMode("view"));

  const handleDiscardAndLeave = () => {
    const proceed = leavePrompt?.proceed;
    restoreSnapshot();
    setLeavePrompt(null);
    proceed?.();
  };

  const handleSaveAndLeave = async () => {
    const proceed = leavePrompt?.proceed;
    const ok = await handleSave();
    if (!ok) return; // si falla el guardado, no salimos (se muestra el error)
    setLeavePrompt(null);
    proceed?.();
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

  // Inserción/borrado en la posición del cursor del textarea.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const pendingCursorRef = useRef<number | null>(null);

  const rememberSelection = () => {
    const ta = textareaRef.current;
    if (ta) selectionRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
  };

  // Tras actualizar el contenido, restauramos el foco y el cursor.
  useEffect(() => {
    const pos = pendingCursorRef.current;
    if (pos == null || !textareaRef.current) return;
    pendingCursorRef.current = null;
    const ta = textareaRef.current;
    // preventScroll evita que la página salte al textarea al reenfocar.
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(pos, pos);
    selectionRef.current = { start: pos, end: pos };
  }, [content]);

  const appendToContent = (text: string) => {
    const sel = selectionRef.current;
    setContent((prev) => {
      if (!sel) {
        const v = appendToken(prev, text);
        pendingCursorRef.current = v.length;
        return v;
      }
      const start = Math.min(sel.start, prev.length);
      const end = Math.min(sel.end, prev.length);
      const { value, cursor } = insertToken(prev, text, start, end);
      pendingCursorRef.current = cursor;
      return value;
    });
  };

  const deleteLastEntry = () => {
    const sel = selectionRef.current;
    setContent((prev) => {
      const pos = sel ? Math.min(sel.end, prev.length) : prev.length;
      const { value, cursor } = deleteTokenBefore(prev, pos);
      pendingCursorRef.current = cursor;
      return value;
    });
  };

  async function handleSave(): Promise<boolean> {
    if (!title.trim()) {
      setMessage("El titulo es obligatorio.");
      setMessageType("error");
      return false;
    }

    setSaving(true);
    setMessage(null);

    // La categoría principal (para el catálogo) es la primera seleccionada.
    const primaryCategory = categoryIds[0] ?? null;

    const { error } = await supabase
      .from("sheets")
      .update({
        title: title.trim(),
        composer: composer.trim() || null,
        key_signature: keySignature.trim() || null,
        time_signature: timeSignature.trim() || null,
        category_id: primaryCategory,
        status,
        editor_type: "abc",
        content,
      })
      .eq("id", sheet.id);

    if (error) {
      setSaving(false);
      setMessage(error.message);
      setMessageType("error");
      return false;
    }

    // Sincronizamos la tabla de unión (varias categorías). Si la migración 010
    // no está aplicada, el guardado principal ya quedó hecho: avisamos sin romper.
    let categoryWarning = "";
    const { error: delError } = await supabase
      .from("sheet_categories")
      .delete()
      .eq("sheet_id", sheet.id);
    if (delError) {
      categoryWarning = " (No se pudieron guardar varias categorías: aplica la migración 010.)";
    } else if (categoryIds.length) {
      const { error: insError } = await supabase
        .from("sheet_categories")
        .insert(categoryIds.map((category_id) => ({ sheet_id: sheet.id, category_id })));
      if (insError) {
        categoryWarning = " (No se pudieron guardar varias categorías: aplica la migración 010.)";
      }
    }

    setSaving(false);
    setMessage("Cambios guardados correctamente." + categoryWarning);
    setMessageType(categoryWarning ? "error" : "ok");
    // Actualizamos el snapshot: ya no hay cambios pendientes.
    setSavedSnapshot(currentSnapshot);
    // Nos quedamos en modo edición para poder seguir editando
    router.refresh();
    return !categoryWarning;
  }

  return (
    <div className="flex-1 bg-slate-100">
      {/* Diálogo: guardar o descartar cambios al salir */}
      {leavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-display text-lg font-bold text-slate-900">Cambios sin guardar</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tienes cambios sin guardar. ¿Quieres guardarlos antes de salir?
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSaveAndLeave}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar y salir"}
              </button>
              <button
                type="button"
                onClick={handleDiscardAndLeave}
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Descartar cambios
              </button>
              <button
                type="button"
                onClick={() => setLeavePrompt(null)}
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Categorías (selección múltiple): la canción puede agruparse en varias */}
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
                    selectionRef.current = null; // próxima inserción al final
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
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                rememberSelection();
              }}
              onSelect={rememberSelection}
              onClick={rememberSelection}
              onKeyUp={rememberSelection}
              onFocus={rememberSelection}
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
