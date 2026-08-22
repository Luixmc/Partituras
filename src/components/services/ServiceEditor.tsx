"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GripVertical,
  CalendarDays,
  Check,
  Copy,
  Music2,
  Play,
  Plus,
  Save,
  Search,
  Share2,
  Trash2,
  X,
  Send,
} from "lucide-react";

import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  setServiceShareAction,
  setServiceStatusAction,
  type ServiceInput,
} from "@/app/(dashboard)/services/actions";
import ServicePdfButton from "@/components/services/ServicePdfButton";
import ShareBox from "@/components/services/ShareBox";
import EstadoCulto from "@/components/services/EstadoCulto";
import AutoTextarea from "@/components/ui/AutoTextarea";
import { SERVICE_TYPE_META, SERVICE_TYPES, formatServiceDate } from "@/lib/services";
import { KEY_OPTIONS, KEY_OPTIONS_MINOR } from "@/lib/music";
import type { ServiceType, ServiceWithSongs, SheetKeyOption, SheetStatus } from "@/types";

export interface CatalogSong {
  id:             string;
  title:          string;
  composer:       string | null;
  key_signature:  string | null;
  category_name:  string | null;
  category_color: string | null;
  available_keys: SheetKeyOption[];
}

interface SongRow {
  /** Clave de ESTA fila. No es la canción: una misma canción puede estar varias
      veces en el culto (O-09), así que sheet_id ya no vale para identificarla. */
  uid:            string;
  sheet_id:       string;
  title:          string;
  composer:       string | null;
  key_signature:  string | null;
  category_name:  string | null;
  category_color: string | null;
  key_override:   string;
  sheet_key_id:   string;             // versión guardada elegida (vacío = ninguna)
  available_keys: SheetKeyOption[];
  note:           string;
}

type Props = {
  service: ServiceWithSongs | null; // null = crear
  catalog: CatalogSong[];
  canEdit: boolean;
};

/** Chip con la categoría de la canción (color de la categoría). */
function CategoryBadge({ name, color }: { name: string | null; color: string | null }) {
  if (!name) return null;
  const c = color ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: c + "20", color: c, borderColor: c + "40" }}
    >
      {name}
    </span>
  );
}

/** Clave única para una fila del culto. Solo vive en el navegador: la base
    genera la suya al guardar. */
let contadorFilas = 0;
const nuevaFila = () => `fila-${Date.now()}-${contadorFilas++}`;

export default function ServiceEditor({ service, catalog, canEdit }: Props) {
  const router = useRouter();
  const isNew = !service;

  const [name, setName] = useState(service?.name ?? "");
  const [serviceType, setServiceType] = useState<ServiceType>(service?.service_type ?? "viernes");
  const [serviceDate, setServiceDate] = useState(service?.service_date ?? "");
  const [notes, setNotes] = useState(service?.notes ?? "");
  const [songs, setSongs] = useState<SongRow[]>(
    (service?.songs ?? []).map((s) => ({
      uid:            nuevaFila(),
      sheet_id:       s.sheet_id,
      title:          s.title,
      composer:       s.composer,
      key_signature:  s.key_signature,
      category_name:  s.category_name,
      category_color: s.category_color,
      key_override:   s.key_override ?? "",
      sheet_key_id:   s.sheet_key_id ?? "",
      available_keys: s.available_keys ?? [],
      note:           s.note ?? "",
    }))
  );

  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"ok" | "error">("ok");

  const [isPublic, setIsPublic] = useState(service?.is_public ?? false);

  const [sharing, setSharing] = useState(false);

  const [estado, setEstado] = useState<SheetStatus>(service?.status ?? "draft");
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  async function cambiarEstado(nuevo: SheetStatus) {
    if (!service) return;
    setCambiandoEstado(true);
    const res = await setServiceStatusAction(service.id, nuevo);
    setCambiandoEstado(false);
    if (res.ok) {
      setEstado(nuevo);
      setMessage(res.message ?? "Estado actualizado.");
      setMessageType("ok");
    } else {
      setMessage(res.error ?? "No se pudo cambiar el estado.");
      setMessageType("error");
    }
  }




  async function toggleShare() {
    if (!service) return;
    setSharing(true);
    const res = await setServiceShareAction(service.id, !isPublic);
    setSharing(false);
    if (res.ok) {
      setIsPublic(!isPublic);
    } else {
      setMessage(res.error ?? "No se pudo cambiar el enlace.");
      setMessageType("error");
    }
  }

  // ── Detección de cambios sin guardar ───────────────────────
  // Guardamos el estado de referencia (último guardado) para comparar.
  type SavedState = {
    name: string;
    serviceType: ServiceType;
    serviceDate: string;
    notes: string;
    songs: SongRow[];
  };
  const serializeState = (st: SavedState) =>
    JSON.stringify({
      name: st.name,
      serviceType: st.serviceType,
      serviceDate: st.serviceDate,
      notes: st.notes,
      songs: st.songs.map((s) => ({
        sheet_id: s.sheet_id,
        key_override: s.key_override,
        sheet_key_id: s.sheet_key_id,
        note: s.note,
      })),
    });

  const [saved, setSaved] = useState<SavedState>(() => ({
    name,
    serviceType,
    serviceDate,
    notes,
    songs,
  }));
  const [leavePrompt, setLeavePrompt] = useState<{ proceed: () => void } | null>(null);

  const currentSnapshot = serializeState({ name, serviceType, serviceDate, notes, songs });
  const isDirty = canEdit && currentSnapshot !== serializeState(saved);

  const restoreSaved = () => {
    setName(saved.name);
    setServiceType(saved.serviceType);
    setServiceDate(saved.serviceDate);
    setNotes(saved.notes);
    setSongs(saved.songs);
  };

  // Aviso del navegador al cerrar/recargar la pestaña con cambios sin guardar.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Intercepta la navegación interna (menú, "volver", "presentar"...) para
  // mostrar el diálogo de guardar/descartar en vez de salir sin avisar.
  useEffect(() => {
    if (!isDirty) return;
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
  }, [isDirty, router]);

  const handleDiscardAndLeave = () => {
    const proceed = leavePrompt?.proceed;
    restoreSaved();
    setLeavePrompt(null);
    proceed?.();
  };

  const handleSaveAndLeave = async () => {
    const proceed = leavePrompt?.proceed;
    const ok = await handleSave();
    if (!ok) return; // si falla, no salimos (se muestra el error)
    setLeavePrompt(null);
    proceed?.();
  };

  // Cuántas veces está ya cada canción en el culto. NO se usa para esconderla
  // del buscador —ahora se puede repetir a propósito (O-09)—, solo para avisar
  // de que ya está puesta.
  const vecesPuesta = useMemo(() => {
    const cuenta = new Map<string, number>();
    for (const s of songs) cuenta.set(s.sheet_id, (cuenta.get(s.sheet_id) ?? 0) + 1);
    return cuenta;
  }, [songs]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.composer ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, catalog]);

  function addSong(c: CatalogSong) {
    setSongs((prev) => [
      ...prev,
      {
        uid:            nuevaFila(),
        sheet_id:       c.id,
        title:          c.title,
        composer:       c.composer,
        key_signature:  c.key_signature,
        category_name:  c.category_name,
        category_color: c.category_color,
        key_override:   "",
        sheet_key_id:   "",
        available_keys: c.available_keys ?? [],
        note:           "",
      },
    ]);
    setQuery("");
  }

  function removeSong(uid: string) {
    setSongs((prev) => prev.filter((s) => s.uid !== uid));
  }

  /**
   * Mueve una cancion del puesto `desde` al puesto `hasta` (O-37).
   *
   * 🔴 Saca la fila y la INSERTA donde toca; no intercambia dos. El
   * intercambio era correcto para «sube una», pero arrastrando la 1 hasta la 5
   * dejaria la 5 en el puesto 1. Arrastrar corre un puesto a las de en medio.
   */
  function moverA(desde: number, hasta: number) {
    setSongs((prev) => {
      if (desde === hasta || hasta < 0 || hasta >= prev.length) return prev;
      const next = [...prev];
      const [fila] = next.splice(desde, 1);
      next.splice(hasta, 0, fila);
      return next;
    });
  }

  // ── Arrastrar para ordenar (O-37) ──────────────────────────
  // Con PointerEvent, NO con el arrastrar-y-soltar de HTML5: aquel no dispara
  // nada con el dedo, y los cultos Isaac los arma desde el telefono.
  const filas = useRef<Array<HTMLLIElement | null>>([]);
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  function agarrar(e: React.PointerEvent<HTMLElement>, uid: string) {
    // Sin capturar el puntero, en cuanto el dedo se sale del asa —28 pixeles—
    // se dejan de recibir los movimientos y el arrastre se corta a mitad.
    e.currentTarget.setPointerCapture(e.pointerId);
    setArrastrando(uid);
  }

  function arrastrar(e: React.PointerEvent<HTMLElement>) {
    if (!arrastrando) return;
    const y = e.clientY;
    const destino = filas.current.findIndex((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return y >= r.top && y <= r.bottom;
    });
    if (destino < 0) return;
    const origen = songs.findIndex((x) => x.uid === arrastrando);
    if (origen >= 0 && origen !== destino) moverA(origen, destino);
  }

  // `pointercancel` tambien: una llamada entrante o un gesto del sistema
  // cancelan el puntero sin soltarlo, y la fila se quedaria pegada al dedo.
  function soltar() {
    setArrastrando(null);
  }

  function patchSong(uid: string, patch: Partial<SongRow>) {
    setSongs((prev) => prev.map((s) => (s.uid === uid ? { ...s, ...patch } : s)));
  }

  async function handleSave(): Promise<boolean> {
    if (!name.trim()) {
      setMessage("El nombre del culto es obligatorio.");
      setMessageType("error");
      return false;
    }
    setSaving(true);
    setMessage(null);

    const input: ServiceInput = {
      name,
      service_type: serviceType,
      service_date: serviceDate || null,
      notes: notes || null,
      songs: songs.map((s) => ({
        sheet_id:     s.sheet_id,
        // Si hay versión guardada elegida, ignora el override (mutuamente excl.).
        key_override: s.sheet_key_id ? null : s.key_override || null,
        sheet_key_id: s.sheet_key_id || null,
        note:         s.note || null,
      })),
    };

    const res = isNew
      ? await createServiceAction(input)
      : await updateServiceAction(service!.id, input);

    setSaving(false);

    if (res.ok) {
      // Estado de referencia actualizado: ya no hay cambios pendientes.
      setSaved({ name, serviceType, serviceDate, notes, songs });
      if (isNew && res.id) {
        router.push(`/services/${res.id}`);
        router.refresh();
        return true;
      }
      setMessage(res.message ?? "Guardado.");
      setMessageType("ok");
      router.refresh();
      return true;
    }
    setMessage(res.error ?? "No se pudo guardar.");
    setMessageType("error");
    return false;
  }

  async function handleDelete() {
    if (!service) return;
    if (!confirm(`¿Eliminar el culto "${service.name}"? Esta accion no se puede deshacer.`)) return;
    setDeleting(true);
    const res = await deleteServiceAction(service.id);
    if (res.ok) {
      router.push("/services");
      router.refresh();
    } else {
      setDeleting(false);
      setMessage(res.error ?? "No se pudo eliminar.");
      setMessageType("error");
    }
  }

  const meta = SERVICE_TYPE_META[serviceType] ?? SERVICE_TYPE_META.otro;
  const dateText = formatServiceDate(serviceDate || null);


  // ── Vista de solo lectura (no admin) ───────────────────────
  if (!canEdit) {
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label}
          </span>
          {dateText && (
            <span className="flex items-center gap-1.5 text-sm capitalize text-slate-500 dark:text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" />
              {dateText}
            </span>
          )}
          {service && songs.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <Link
                href={`/services/${service.id}/present`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <Play className="h-4 w-4" />
                Presentar
              </Link>
              <ServicePdfButton href={`/imprimir/culto/${service!.id}`} />
            </div>
          )}
        </div>
        {notes && (
          <p className="mb-4 whitespace-pre-line rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {notes}
          </p>
        )}

        <ol className="space-y-2">
          {songs.map((s, i) => (
            <li key={s.uid}>
              <Link
                // Se dice DE QUÉ CULTO viene: sin eso, la vista y la pantalla
                // completa cogen el catálogo entero, y las flechas recorren
                // las 75 canciones en vez de las del repertorio (O-33). Y el
                // «volver» apunta al catálogo en vez de al culto (O-34).
                href={`/catalog/${s.sheet_id}?culto=${service.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-900 dark:text-slate-100">
                    {s.title}
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <CategoryBadge name={s.category_name} color={s.category_color} />
                    {s.composer && (
                      <span className="truncate text-xs text-slate-400">{s.composer}</span>
                    )}
                  </span>
                </span>
                {(() => {
                  const savedKey = s.sheet_key_id
                    ? s.available_keys.find((k) => k.id === s.sheet_key_id)?.key_signature
                    : null;
                  const key = savedKey || s.key_override || s.key_signature;
                  return key ? (
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {key}
                    </span>
                  ) : null;
                })()}
              </Link>
              {s.note && <p className="mt-1 pl-10 text-xs text-slate-400">{s.note}</p>}
            </li>
          ))}
          {songs.length === 0 && (
            <li className="py-10 text-center text-sm text-slate-400">Este culto no tiene canciones.</li>
          )}
        </ol>
      </div>
    );
  }

  // ── Editor (admin) ─────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
      {/* Diálogo: guardar o descartar cambios al salir */}
      {leavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-slate-800">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">Cambios sin guardar</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tienes cambios sin guardar en el culto. ¿Quieres guardarlos antes de salir?
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
                className="inline-flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={
            "mb-4 rounded-xl px-4 py-2.5 text-sm " +
            (messageType === "ok"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300")
          }
        >
          {message}
        </div>
      )}

      {/* Datos del culto */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Nombre del culto
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Servicio Viernes"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Tipo
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SERVICE_TYPE_META[t].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Fecha (opcional)
          </label>
          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Notas (opcional)
          </label>
          <AutoTextarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Observaciones, responsables, etc."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Buscador de canciones */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Agregar canciones
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por titulo o compositor..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          {results.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => addSong(c)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50 dark:hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4 flex-shrink-0 text-brand-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900 dark:text-slate-100">
                        {c.title}
                        {/* Ya está en el culto: se avisa, pero NO se impide
                            volver a añadirla (O-09). */}
                        {(vecesPuesta.get(c.id) ?? 0) > 0 && (
                          <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                            ya está{(vecesPuesta.get(c.id) ?? 0) > 1 ? ` ×${vecesPuesta.get(c.id)}` : ""}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <CategoryBadge name={c.category_name} color={c.category_color} />
                        {c.composer && (
                          <span className="truncate text-xs text-slate-400">{c.composer}</span>
                        )}
                      </span>
                    </span>
                    {c.key_signature && (
                      <span className="text-xs text-slate-400">{c.key_signature}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Lista ordenada. Mientras se arrastra se corta la seleccion de texto:
          si no, el gesto va subrayando los titulos por el camino. */}
      <ol className={`mb-6 space-y-2 ${arrastrando ? "select-none" : ""}`}>
        {songs.map((s, i) => (
          <li
            key={s.uid}
            ref={(el) => {
              filas.current[i] = el;
            }}
            className={`flex flex-wrap items-center gap-2 rounded-xl border bg-white p-2.5 dark:bg-slate-900 ${
              arrastrando === s.uid
                ? "border-brand-400 shadow-md dark:border-brand-500"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            {/* El asa. `touch-none` es imprescindible: sin ella el navegador
                del movil se queda el gesto para hacer scroll y lo que baja es
                la pagina, no la cancion (O-37).

                Recibe el foco y ↑/↓ la mueven, para que se pueda ordenar sin
                arrastrar — sin devolver a la pantalla los botones que Isaac
                quitó. */}
            <button
              type="button"
              onPointerDown={(e) => agarrar(e, s.uid)}
              onPointerMove={arrastrar}
              onPointerUp={soltar}
              onPointerCancel={soltar}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  moverA(i, i - 1);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  moverA(i, i + 1);
                }
              }}
              className="flex h-7 w-7 flex-shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:bg-slate-800"
              aria-label={`Mover ${s.title}. Arrastra, o usa las flechas arriba y abajo`}
              title="Arrastra para cambiar el orden"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {i + 1}
            </span>
            {/* El admin también abre la canción desde aquí (O-36). Antes esto
                era texto suelto y el único que NO podía entrar a una canción
                desde su culto era justo el que más entra.

                🔴 El enlace envuelve SOLO el texto, nunca la fila: al lado hay
                un <select> de tono y tres botones, y un enlace por encima se
                comería sus clics.

                Y va con `?culto=` como la lista del lector, para que las
                flechas recorran el repertorio y el «volver» apunte al culto
                (O-33, O-34).

                Siendo un <Link> de verdad, el aviso de «cambios sin guardar»
                lo cubre solo: el editor intercepta los clics en cualquier <a>.
                Con un onClick + router.push se habría saltado, y se perderían
                los cambios en silencio. */}
            {service ? (
              <Link
                href={`/catalog/${s.sheet_id}?culto=${service.id}`}
                className="group min-w-0 flex-1"
                title="Abrir la cancion"
              >
                <span className="block truncate font-medium text-slate-900 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">
                  {s.title}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <CategoryBadge name={s.category_name} color={s.category_color} />
                  {s.composer && (
                    <span className="truncate text-xs text-slate-400">{s.composer}</span>
                  )}
                </span>
              </Link>
            ) : (
              /* Culto sin guardar: no hay culto al que volver ni repertorio
                 guardado que recorrer, así que tampoco hay enlace. */
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-slate-900 dark:text-slate-100">
                  {s.title}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <CategoryBadge name={s.category_name} color={s.category_color} />
                  {s.composer && (
                    <span className="truncate text-xs text-slate-400">{s.composer}</span>
                  )}
                </span>
              </span>
            )}
            <select
              value={s.sheet_key_id ? `k:${s.sheet_key_id}` : s.key_override ? `t:${s.key_override}` : ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v.startsWith("k:")) patchSong(s.uid, { sheet_key_id: v.slice(2), key_override: "" });
                else if (v.startsWith("t:")) patchSong(s.uid, { sheet_key_id: "", key_override: v.slice(2) });
                else patchSong(s.uid, { sheet_key_id: "", key_override: "" });
              }}
              className="min-w-[6rem] max-w-[11rem] rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              title="Tono para este culto: versión guardada de la canción o transposición al vuelo"
            >
              <option value="">{s.key_signature ? `Orig. ${s.key_signature}` : "Tono original"}</option>
              {s.available_keys.length > 0 && (
                <optgroup label="Versiones guardadas">
                  {s.available_keys.map((k) => (
                    <option key={k.id} value={`k:${k.id}`}>
                      {k.key_signature}
                      {k.label ? ` · ${k.label}` : ""}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Transponer · mayores">
                {KEY_OPTIONS.map((k) => (
                  <option key={k.value} value={`t:${k.value}`}>
                    {k.value}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Transponer · menores">
                {KEY_OPTIONS_MINOR.map((k) => (
                  <option key={k.value} value={`t:${k.value}`}>
                    {k.value}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => removeSong(s.uid)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                aria-label="Quitar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {songs.length === 0 && (
          <li className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
            <Music2 className="mb-2 h-6 w-6 text-slate-300" />
            Busca canciones arriba para armar el culto.
          </li>
        )}
      </ol>

      {/* Presentar / exportar (solo cultos ya guardados con canciones) */}
      {!isNew && songs.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Link
            href={`/services/${service!.id}/present`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Play className="h-4 w-4" />
            Modo presentacion
          </Link>
          <ServicePdfButton href={`/imprimir/culto/${service!.id}`} />
        </div>
      )}

      {/* Estado del culto (O-31). Solo el admin, y solo si ya existe. */}
      {canEdit && !isNew && (
        <EstadoCulto estado={estado} onCambiar={cambiarEstado} cambiando={cambiandoEstado} />
      )}

      {/* Compartir: enlace público de solo lectura (O-24) */}
      <ShareBox
        publicToken={service?.public_token ?? null}
        isPublic={isPublic}
        canEdit={canEdit}
        serviceName={name}
        serviceDate={serviceDate || null}
        onToggle={toggleShare}
        toggling={sharing}
      />

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : isNew ? "Crear culto" : "Guardar cambios"}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
          >
            <X className="h-4 w-4" />
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        )}
      </div>
    </div>
  );
}
