"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Grid2X2, Save } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import { parseSections } from "@/lib/sections";
import ChordToolbar from "@/components/sheets/ChordToolbar";
import ImportControls from "@/components/sheets/ImportControls";
import ChordPasteImport from "@/components/sheets/ChordPasteImport";
import { autoGrow } from "@/components/ui/AutoTextarea";
import { DialogoConfirmar } from "@/components/ui/Dialogo";
import { appendToken, insertToken, deleteTokenBefore } from "@/lib/chordInput";
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

  // Solo los administradores pueden crear canciones.
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // ── La red de seguridad (O-61) ────────────────────────────
  //
  // 🔴 Esta pantalla NO TENIA NINGUNA. Se tecleaba una canción entera —título,
  // tono, compás, categorías y todos los acordes— y al pulsar «volver», el menú
  // o cerrar la pestaña **se perdía sin decir nada**. Y transcribir acordes es
  // el trabajo más caro de este proyecto: 28.203 caracteres en 75 canciones.
  const [salidaPendiente, setSalidaPendiente] = useState<null | (() => void)>(null);
  const hayTrabajo =
    title.trim() !== "" ||
    composer.trim() !== "" ||
    tabNotes.trim() !== "" ||
    categoryIds.length > 0;

  // Aviso del navegador al cerrar o recargar la pestaña.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hayTrabajo || loading) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hayTrabajo, loading]);

  // Y la navegación de dentro: el «volver», el menú lateral, la barra del
  // móvil. Se intercepta el clic en cualquier enlace, igual que en el editor
  // del culto — así entra en la red **cualquier** enlace de la pantalla, sin
  // tener que acordarse de cada uno.
  useEffect(() => {
    if (!hayTrabajo || loading) return;
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
      setSalidaPendiente(() => () => router.push(url.pathname + url.search));
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [hayTrabajo, loading, router]);

  const toggleCategory = (id: string) =>
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        router.replace("/catalog");
        return;
      }
      setAuthorized(true);
    })();
  }, [supabase, router]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, [supabase]);

  // Inserción/borrado en la posición del cursor del textarea.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const pendingCursorRef = useRef<number | null>(null);

  const rememberSelection = () => {
    const ta = textareaRef.current;
    if (ta) selectionRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
  };

  // El textarea crece a lo alto según el texto escrito.
  useEffect(() => {
    autoGrow(textareaRef.current);
  }, [tabNotes]);

  useEffect(() => {
    const pos = pendingCursorRef.current;
    if (pos == null || !textareaRef.current) return;
    pendingCursorRef.current = null;
    const ta = textareaRef.current;
    // preventScroll evita que la página salte al textarea al reenfocar.
    ta.focus({ preventScroll: true });
    ta.setSelectionRange(pos, pos);
    selectionRef.current = { start: pos, end: pos };
  }, [tabNotes]);

  const appendToNotes = (text: string) => {
    const sel = selectionRef.current;
    setTabNotes((prev) => {
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

  const deleteLastNote = () => {
    const sel = selectionRef.current;
    setTabNotes((prev) => {
      const pos = sel ? Math.min(sel.end, prev.length) : prev.length;
      const { value, cursor } = deleteTokenBefore(prev, pos);
      pendingCursorRef.current = cursor;
      return value;
    });
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

  // Mientras verificamos el rol (o si no es admin) no mostramos el formulario.
  if (!authorized) {
    return (
      <div className="flex min-h-full items-center justify-center p-8 text-sm text-slate-400">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-100 dark:bg-slate-950">
      {/* ⚠️ DOS botones, no tres, y es a propósito: aquí «Guardar y salir»
          PUEDE NO SER POSIBLE —sin título no se crea la canción— y un botón que
          a veces no hace nada es P-01, el fallo más caro de este proyecto.
          Las dos opciones que se ofrecen son siempre verdad. */}
      {salidaPendiente && (
        <DialogoConfirmar
          titulo="Salir sin guardar"
          mensaje="Esta canción todavía no se ha creado. Si sales ahora se pierde lo que llevas escrito."
          textoConfirmar="Salir y descartar"
          onConfirmar={() => {
            const salir = salidaPendiente;
            setSalidaPendiente(null);
            salir();
          }}
          onCancelar={() => setSalidaPendiente(null)}
        />
      )}
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link
            href="/catalog"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            aria-label="Volver al catalogo"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">Nueva cancion</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Crea una nueva partitura con acordes.</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-5xl gap-5 px-4 py-6 md:grid-cols-[320px_1fr] md:px-8"
      >
        {/* Panel de metadatos */}
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100">Datos</h2>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Titulo <span className="text-red-500">*</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Nombre de la cancion"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Autor o compositor
            <input
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Nombre"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Tonalidad
              <input
                value={keySignature}
                onChange={(e) => setKeySignature(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                placeholder="C, Dm, F, Bb"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Compas
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                {["4/4", "3/4", "2/4", "6/8", "12/8", "2/2"].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Categorías (selección múltiple) */}
          <div className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Categorias
            <span className="ml-1 text-[10px] font-normal text-slate-400 dark:text-slate-500">(puedes elegir varias)</span>
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
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Grid2X2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display font-semibold text-slate-800 dark:text-slate-100">Notas del grid</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Usa los botones para agregar acordes y alteraciones.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ImportControls
                label="Importar archivo"
                onImported={({ text, title: detectedTitle }) => {
                  setTabNotes((prev) => (prev.trim() ? `${prev}\n${text}` : text));
                  if (!title.trim() && detectedTitle) setTitle(detectedTitle);
                  selectionRef.current = null; // próxima inserción al final
                  setError(null);
                }}
                onError={(msg) => setError(msg)}
              />
              <ChordPasteImport
                onConverted={({ content, key, title: detectedTitle }) => {
                  setTabNotes((prev) => (prev.trim() ? `${prev}\n${content}` : content));
                  if (key) setKeySignature(key);
                  if (!title.trim() && detectedTitle) setTitle(detectedTitle);
                  selectionRef.current = null;
                  setError(null);
                }}
              />
            </div>
          </div>

          <ChordToolbar onInsert={appendToNotes} onDelete={deleteLastNote} />

          <textarea
            ref={textareaRef}
            value={tabNotes}
            onChange={(e) => {
              setTabNotes(e.target.value);
              autoGrow(e.currentTarget);
              rememberSelection();
            }}
            onSelect={rememberSelection}
            onClick={rememberSelection}
            onKeyUp={rememberSelection}
            onFocus={rememberSelection}
            placeholder="Escribe notas o usa los botones. Ejemplo: [Intro]\nC Am F G  ·  texto centrado con <...>"
            rows={6}
            spellCheck={false}
            style={{ overflow: "hidden", resize: "none" }}
            className="w-full min-h-[180px] rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />

          {/* 🔴 Una vista previa POR SECCIONES, igual que la de una canción ya
              guardada. Antes se pintaba `notes={tabNotes}` de golpe, y las
              etiquetas `[Intro]`, `[Coro]`… salían dibujadas DENTRO de la
              rejilla como si fueran acordes, en vez de titular su sección
              (O-44). Lo vio Isaac creando una canción.

              Y usa `parseSections` de `lib/sections.ts`, la misma que las
              otras dos pantallas: era P-09 lo que dejó esta sin secciones —
              la función estaba escrita dos veces y ninguna era «la de todos»,
              así que aquí no había a cuál llamar. */}
          <div className="space-y-4">
            {parseSections(tabNotes)
              // Con el campo vacío, `parseSections` devuelve una sección con un
              // espacio dentro: pintarla dejaría una cuadrícula vacía nada más
              // abrir «nueva canción». Se filtra aquí y no en `parseSections`
              // porque esa función la usan SIETE pantallas y lleva meses con
              // ese contrato — tocarla justo al unificarla sería cambiar dos
              // cosas a la vez.
              .filter((s) => s.title !== undefined || s.content.trim())
              .map((seccion, i) => (
                <TablaturePreview
                  key={i}
                  notes={seccion.content}
                  label={seccion.title}
                  compact
                />
              ))}
          </div>

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
