"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Edit3, Eye, Mic2, Music4, Save, Grid2X2, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import { ChordPopoverProvider } from "@/components/sheets/ChordPopover";
import LetraPanel from "@/components/sheets/LetraPanel";
import MelodiaPanel from "@/components/sheets/MelodiaPanel";
import { puedeVerLetras } from "@/lib/letras";
import { puedeVerMelodia } from "@/lib/melodia";
// 🔴 `parseSections` vivía AQUÍ, copiada. Era P-09, y lo que dejó la
// pantalla de crear canción sin secciones (O-44): al no haber una función
// común, esa tercera pantalla no tenía a cuál llamar. Se comprobó que las
// dos copias eran idénticas antes de quitarla.
import { parseSections } from "@/lib/sections";
import ChordToolbar from "@/components/sheets/ChordToolbar";
import ImportControls from "@/components/sheets/ImportControls";
import ChordPasteImport from "@/components/sheets/ChordPasteImport";
import SongKeyVersions from "@/components/sheets/SongKeyVersions";
import { autoGrow } from "@/components/ui/AutoTextarea";
import Dialogo from "@/components/ui/Dialogo";
import { useTheme } from "@/components/theme/ThemeProvider";
import { appendToken, insertToken, deleteTokenBefore } from "@/lib/chordInput";
import { createClient } from "@/lib/supabase/client";
import type { Category, Sheet, SheetKey, SheetStatus, UserRole } from "@/types";

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
  initialKeys?: SheetKey[];
  canEdit: boolean;
  /** El rol de quien mira. Hace falta aparte de `canEdit` porque quién ve
      las letras y quién puede editar son dos cosas distintas, y van a
      separarse en cuanto Isaac abra las letras a todos (ROLES_LETRAS). */
  rol: UserRole | null;
  /** Filtro activo del catálogo, para que la pantalla completa sepa dentro de
      qué lista está esta canción (O-16). */
  filtro?: string;
  // Vecinas dentro de la lista que se estaba viendo, para pasar de canción sin
  // volver al catálogo (O-20).
  prevHref?: string | null;
  nextHref?: string | null;
  prevTitle?: string | null;
  nextTitle?: string | null;
  posicion?: number | null;
  total?: number;
};

export default function SongDetailEditor({
  sheet,
  categories,
  initialCategoryIds,
  initialKeys = [],
  canEdit,
  rol,
  filtro = "",
  prevHref = null,
  nextHref = null,
  prevTitle = null,
  nextTitle = null,
  posicion = null,
  total = 0,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Con zoom ≤ 90% mostramos 2 secciones por fila y aprovechamos la hoja ancha.
  const { fontScale, incFont, decFont } = useTheme();
  const twoCols = fontScale <= 0.9;

  const startCategoryIds =
    initialCategoryIds && initialCategoryIds.length
      ? initialCategoryIds
      : sheet.category_id
        ? [sheet.category_id]
        : [];

  // `?ver=` dice en qué pestaña se abre la canción. Sirve para dos cosas:
  //  · llegar directamente a la letra desde la sección «Letras» (J.2), y
  //  · 🔴 **no perder la pestaña al pasar de canción** (O-43). Isaac estaba
  //    escribiendo letras, pulsaba «siguiente» y la página lo devolvía a los
  //    acordes: tenía que volver a la pestaña Letra en cada una de las 75.
  //
  // Va en la DIRECCIÓN y no en el navegador porque es exactamente lo que ya
  // hacen el filtro del catálogo y el `?culto=`: contexto de por dónde vas.
  // Así sobrevive además a recargar y al botón «atrás».
  const parametros = useSearchParams();
  // ¿A este usuario le toca ver las letras? Lo decide ROLES_LETRAS.
  const verLetras = puedeVerLetras(rol);
  // Y la melodia, con su propio interruptor (O-57 / D-22 aplicado otra vez).
  const verMelodia = puedeVerMelodia(rol);
  const [mode, setMode] = useState<"view" | "edit" | "letra" | "melodia">(() => {
    const ver = parametros.get("ver");
    if (ver === "letra") return "letra";
    if (ver === "melodia") return "melodia";
    if (ver === "edit" && canEdit) return "edit";
    return "view";
  });

  /** Le pega el modo actual a un enlace, para no perderlo al cambiar de canción. */
  const conModo = (href: string | null | undefined) => {
    if (!href || mode === "view") return href ?? null;
    return `${href}${href.includes("?") ? "&" : "?"}ver=${mode}`;
  };
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
  // La letra (O-18). Se guarda en la misma columna de siempre, con las
  // mismas etiquetas de sección que los acordes (D-20).
  const [lyrics, setLyrics] = useState(sheet.lyrics ?? "");

  // Tono mostrado en modo lectura: "" = original; o el id de una versión guardada.
  const [viewKey, setViewKey] = useState<string>("");
  const activeVersion = viewKey ? initialKeys.find((k) => k.id === viewKey) ?? null : null;
  const viewContent = activeVersion ? activeVersion.content ?? "" : content;
  const viewKeyLabel = activeVersion ? activeVersion.key_signature : keySignature;

  const toggleCategory = (id: string) =>
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

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
      lyrics: sheet.lyrics ?? "",
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
    lyrics,
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

  // Diálogo "guardar o descartar" al salir con cambios sin guardar.
  //
  // 📌 Se declara AQUÍ, antes del efecto que lo usa. Estaba veinte líneas más
  // abajo y funcionaba —los efectos corren después del render, así que para
  // cuando alguien pulsa un enlace ya existe—, pero leyéndolo de arriba abajo
  // parecía que se usaba algo todavía sin declarar. Lo marcó el lint al
  // estrenarlo, y tenía razón: es frágil y no costaba nada ponerlo en orden.
  const [leavePrompt, setLeavePrompt] = useState<{ proceed: () => void } | null>(null);

  // Intercepta la navegación interna (enlaces del menú, "volver", etc.) para
  // mostrar el diálogo de guardar/descartar en vez de salir sin avisar.
  //
  // 🔴 **También en modo LETRA**, y esto no era así: el aviso solo miraba el
  // modo edición, así que **escribir una letra y pulsar «siguiente» la perdía
  // sin decir nada**. Salió al arreglar O-43, y es peor que O-43: Isaac está
  // ahora mismo tecleando las 75 letras.
  useEffect(() => {
    if ((mode !== "edit" && mode !== "letra") || !isDirty) return;
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


  const restoreSnapshot = () => {
    const snap = JSON.parse(savedSnapshot);
    setTitle(snap.title);
    setComposer(snap.composer);
    setKeySignature(snap.keySignature);
    setTimeSignature(snap.timeSignature);
    setCategoryIds(snap.categoryIds ?? []);
    setStatus(snap.status);
    setContent(snap.content);
    // 🔴 Faltaba: la letra entra en el `snapshot` que decide si hay cambios,
    // pero «descartar» no la devolvía. Se descartaba todo menos justo lo que
    // se acababa de escribir.
    setLyrics(snap.lyrics ?? "");
  };

  // Pide salir: si hay cambios, muestra el diálogo; si no, sigue de una.
  const requestLeave = (proceed: () => void) => {
    if ((mode === "edit" || mode === "letra") && isDirty) setLeavePrompt({ proceed });
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

  // Atajos de teclado en MODO VISTA: flechas para pasar de canción (O-20) y
  // + / − para el tamaño de letra (O-21).
  //
  // Solo actúan en modo vista y NUNCA cuando se está escribiendo: en edición las
  // flechas mueven el cursor por los acordes y el "+" tiene que escribirse.
  useEffect(() => {
    if (mode !== "view") return;
    const onKey = (e: KeyboardEvent) => {
      const destino = e.target as HTMLElement | null;
      const escribiendo =
        destino?.tagName === "INPUT" ||
        destino?.tagName === "TEXTAREA" ||
        destino?.tagName === "SELECT" ||
        destino?.isContentEditable;
      if (escribiendo || e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === "ArrowRight" && nextHref) {
        e.preventDefault();
        router.push(conModo(nextHref)!);
      } else if (e.key === "ArrowLeft" && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      } else if (e.key === "+" || e.key === "=" || e.key === "Add") {
        e.preventDefault();
        incFont();
      } else if (e.key === "-" || e.key === "_" || e.key === "Subtract") {
        e.preventDefault();
        decFont();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, nextHref, prevHref, router, incFont, decFont]);

  // Inserción/borrado en la posición del cursor del textarea.
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const pendingCursorRef = useRef<number | null>(null);

  const rememberSelection = () => {
    const ta = textareaRef.current;
    if (ta) selectionRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
  };

  // El textarea de contenido crece a lo alto según el texto (sin scroll interno).
  useEffect(() => {
    autoGrow(textareaRef.current);
  }, [content, mode]);

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
        // Vacío se guarda como NULL, no como cadena vacía: así «no tiene
        // letra» es una sola cosa en la base y no dos.
        lyrics: lyrics.trim() || null,
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
    <div className="flex-1 bg-slate-100 dark:bg-slate-950">
      {/* La SEGUNDA copia de este diálogo, ahora con el componente único (O-60).
          Estaba calcada de `ServiceEditor` salvo una frase — comprobado línea
          por línea antes de unificar, como se hizo con `parseSections`. */}
      {leavePrompt && (
        <Dialogo
          titulo="Cambios sin guardar"
          onCancelar={saving ? undefined : () => setLeavePrompt(null)}
          acciones={[
            { texto: saving ? "Guardando..." : "Guardar y salir", onClick: handleSaveAndLeave, disabled: saving },
            { texto: "Descartar cambios", onClick: handleDiscardAndLeave, estilo: "peligro-suave", disabled: saving },
            { texto: "Cancelar", onClick: () => setLeavePrompt(null), estilo: "suave", disabled: saving },
          ]}
        >
          Tienes cambios sin guardar. ¿Quieres guardarlos antes de salir?
        </Dialogo>
      )}

      {/* Barra superior */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:px-8 dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <div className="flex-1">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              {title || "Cancion sin titulo"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {composer || "Sin autor"} · {keySignature || "Sin tonalidad"} · {timeSignature || "Sin compas"}
            </p>
          </div>

          {/* Pasar de canción sin volver al catálogo, dentro de la lista que se
              estaba viendo. También con las flechas ← → (O-20). */}
          {(prevHref || nextHref) && (
            <div className="flex items-center gap-1">
              <Link
                href={conModo(prevHref) ?? "#"}
                aria-disabled={!prevHref}
                title={prevTitle ? `Anterior: ${prevTitle}  (←)` : "No hay anterior"}
                className={
                  "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition-colors dark:border-slate-700 " +
                  (prevHref
                    ? "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                    : "pointer-events-none bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-700")
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              {posicion !== null && total > 0 && (
                <span className="px-1 text-xs tabular-nums text-slate-400 dark:text-slate-500">
                  {posicion}/{total}
                </span>
              )}
              <Link
                href={conModo(nextHref) ?? "#"}
                aria-disabled={!nextHref}
                title={nextTitle ? `Siguiente: ${nextTitle}  (→)` : "No hay siguiente"}
                className={
                  "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition-colors dark:border-slate-700 " +
                  (nextHref
                    ? "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
                    : "pointer-events-none bg-slate-50 text-slate-300 dark:bg-slate-900 dark:text-slate-700")
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={requestLeaveEdit}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${
                mode === "view"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Edit3 className="h-4 w-4" />
                Edicion
              </button>
            )}
            {/* Letra (O-18). Quién la ve sale de ROLES_LETRAS: hoy solo el
                admin, mientras Isaac escribe las 75. Cuando estén, esa
                constante se abre y aparece para todos sin tocar esto. */}
            {verLetras && (
            <button
              type="button"
              onClick={() => setMode("letra")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${
                mode === "letra"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Mic2 className="h-4 w-4" />
              Letra
            </button>
            )}
            {/* Melodia (O-57). Mismo trato que la letra: quien la ve sale de
                ROLES_MELODIA, hoy solo el admin. */}
            {verMelodia && (
            <button
              type="button"
              onClick={() => setMode("melodia")}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${
                mode === "melodia"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Music4 className="h-4 w-4" />
              Melodia
            </button>
            )}
            {/* Pantalla completa: al lado de Vista (y de Edicion si es admin).
                Disponible para los tres roles (O-11). Solo tiene sentido si la
                cancion tiene acordes escritos. */}
            {viewContent.trim() && (
              <Link
                // Arrastra el culto si se vino de uno: si no, al entrar a
                // pantalla completa se perdería el repertorio y volverían a
                // salir las 75 canciones (O-33).
                href={`/catalog/${sheet.id}/present${
                  parametros.get("culto") ? `?culto=${parametros.get("culto")}` : filtro
                }`}
                title="Ver a pantalla completa"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Maximize2 className="h-4 w-4" />
                Pantalla completa
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MODO MELODIA (O-57) ──
          ⚠️ Va ANTES del modo letra en el `if`, y guarda POR SU CUENTA: meter
          `melody` en el guardado general habria hecho fallar el guardado de la
          cancion entera mientras la columna no exista. Ver `MelodiaPanel`. */}
      {mode === "melodia" ? (
        <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
          <MelodiaPanel
            sheetId={sheet.id}
            contenidoAcordes={viewContent}
            compas={sheet.time_signature}
            tono={sheet.key_signature}
            puedeEscribir={canEdit}
          />
        </div>
      ) : mode === "letra" ? (
        <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
          <LetraPanel
            lyrics={lyrics}
            setLyrics={setLyrics}
            contenidoAcordes={viewContent}
            puedeEscribir={canEdit}
            saving={saving}
            onGuardar={handleSave}
          />
        </div>
      ) : mode === "view" ? (
        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-8">
          <article className="mx-auto min-h-[72vh] w-full max-w-none px-8 py-12 shadow-sm ring-1 md:px-12 bg-white ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
            <header className="mb-8 border-b pb-5 border-slate-200 dark:border-slate-700">
              <h1 className="font-display text-3xl font-bold text-slate-950 dark:text-slate-50">
                {title}
              </h1>
              {composer && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{composer}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {sheet.category && <span>{sheet.category.name}</span>}
                {viewKeyLabel && <span>Tono: {viewKeyLabel}</span>}
                {timeSignature && <span>Compas: {timeSignature}</span>}
              </div>

              {/* Selector de tonalidad: original + versiones guardadas */}
              {initialKeys.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewKey("")}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      viewKey === ""
                        ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                        : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {keySignature ? `Original (${keySignature})` : "Original"}
                  </button>
                  {initialKeys.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => setViewKey(k.id)}
                      title={k.label ?? undefined}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        viewKey === k.id
                          ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                          : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {k.key_signature}
                      {k.label ? ` · ${k.label}` : ""}
                    </button>
                  ))}
                </div>
              )}
            </header>

            {viewContent.trim() ? (
              <div
                className={
                  twoCols
                    ? "grid grid-cols-2 items-start gap-x-6 gap-y-8"
                    : "space-y-8"
                }
              >
                {/* Solo en la VISTA: en edición el clic es para escribir. */}
                <ChordPopoverProvider bemoles={/b/.test(viewKeyLabel || "")}>
                  {parseSections(viewContent).map((section, idx) => (
                    <TablaturePreview
                      key={idx}
                      notes={section.content}
                      label={section.title}
                      compact
                    />
                  ))}
                </ChordPopoverProvider>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center border border-dashed border-slate-300 text-sm text-slate-400 dark:border-slate-600 dark:text-slate-500">
                Sin contenido disponible
              </div>
            )}
          </article>
        </div>
      ) : (
        /* ── MODO EDICIÓN ── */
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 md:grid-cols-[340px_1fr] md:px-8">
          {/* Panel izquierdo: metadatos */}
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100">Datos de la cancion</h3>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Titulo
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Autor o compositor
              <input
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tonalidad
                <input
                  value={keySignature}
                  onChange={(e) => setKeySignature(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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

            {/* Categorías (selección múltiple): la canción puede agruparse en varias */}
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

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Estado
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SheetStatus)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </label>
          </section>

          {/* Panel derecho: contenido */}
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div>
              <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Grid2X2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100">Contenido</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Usa los botones, escribe directo o importa un archivo.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                  <ChordPasteImport
                    onConverted={({ content: imported, key, title: detectedTitle }) => {
                      setContent((prev) => (prev.trim() ? `${prev}\n${imported}` : imported));
                      if (key) setKeySignature(key);
                      if (!title.trim() && detectedTitle) setTitle(detectedTitle);
                      selectionRef.current = null;
                      setMessage("Acordes importados. Ajusta el ritmo (duraciones y compases).");
                      setMessageType("ok");
                    }}
                  />
                </div>
              </div>

              <ChordToolbar onInsert={appendToContent} onDelete={deleteLastEntry} />
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                autoGrow(e.currentTarget);
                rememberSelection();
              }}
              onSelect={rememberSelection}
              onClick={rememberSelection}
              onKeyUp={rememberSelection}
              onFocus={rememberSelection}
              rows={7}
              spellCheck={false}
              style={{ overflow: "hidden", resize: "none" }}
              className="w-full min-h-[180px] rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Escribe notas y secciones. Usa los botones o escribe directo. Ejemplo: [Intro]\nC Am F G  ·  texto centrado con <...>"
            />

            {/* Vista previa idéntica al modo lectura: separada por secciones. */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
              {content.trim() ? (
                <div className="space-y-4">
                  {parseSections(content).map((section, idx) => (
                    <TablaturePreview key={idx} notes={section.content} label={section.title} compact />
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">La vista previa aparecerá aquí.</p>
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

          {/* Versiones en otras tonalidades (ancho completo) */}
          <div className="md:col-span-2">
            <SongKeyVersions
              sheetId={sheet.id}
              baseKey={keySignature || null}
              baseContent={content}
              initialVersions={initialKeys}
              canEdit={canEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
