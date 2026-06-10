"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Music2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  type ServiceInput,
} from "@/app/(dashboard)/services/actions";
import { SERVICE_TYPE_META, SERVICE_TYPES, formatServiceDate } from "@/lib/services";
import type { ServiceType, ServiceWithSongs } from "@/types";

export interface CatalogSong {
  id:            string;
  title:         string;
  composer:      string | null;
  key_signature: string | null;
}

interface SongRow {
  sheet_id:      string;
  title:         string;
  composer:      string | null;
  key_signature: string | null;
  key_override:  string;
  note:          string;
}

type Props = {
  service: ServiceWithSongs | null; // null = crear
  catalog: CatalogSong[];
  canEdit: boolean;
};

export default function ServiceEditor({ service, catalog, canEdit }: Props) {
  const router = useRouter();
  const isNew = !service;

  const [name, setName] = useState(service?.name ?? "");
  const [serviceType, setServiceType] = useState<ServiceType>(service?.service_type ?? "viernes");
  const [serviceDate, setServiceDate] = useState(service?.service_date ?? "");
  const [notes, setNotes] = useState(service?.notes ?? "");
  const [songs, setSongs] = useState<SongRow[]>(
    (service?.songs ?? []).map((s) => ({
      sheet_id:      s.sheet_id,
      title:         s.title,
      composer:      s.composer,
      key_signature: s.key_signature,
      key_override:  s.key_override ?? "",
      note:          s.note ?? "",
    }))
  );

  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"ok" | "error">("ok");

  const usedIds = useMemo(() => new Set(songs.map((s) => s.sheet_id)), [songs]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter((c) => !usedIds.has(c.id))
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.composer ?? "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, catalog, usedIds]);

  function addSong(c: CatalogSong) {
    setSongs((prev) => [
      ...prev,
      {
        sheet_id:      c.id,
        title:         c.title,
        composer:      c.composer,
        key_signature: c.key_signature,
        key_override:  "",
        note:          "",
      },
    ]);
    setQuery("");
  }

  function removeSong(id: string) {
    setSongs((prev) => prev.filter((s) => s.sheet_id !== id));
  }

  function move(index: number, dir: -1 | 1) {
    setSongs((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function patchSong(id: string, patch: Partial<SongRow>) {
    setSongs((prev) => prev.map((s) => (s.sheet_id === id ? { ...s, ...patch } : s)));
  }

  async function handleSave() {
    if (!name.trim()) {
      setMessage("El nombre del culto es obligatorio.");
      setMessageType("error");
      return;
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
        key_override: s.key_override || null,
        note:         s.note || null,
      })),
    };

    const res = isNew
      ? await createServiceAction(input)
      : await updateServiceAction(service!.id, input);

    setSaving(false);

    if (res.ok) {
      if (isNew && res.id) {
        router.push(`/services/${res.id}`);
        router.refresh();
        return;
      }
      setMessage(res.message ?? "Guardado.");
      setMessageType("ok");
      router.refresh();
    } else {
      setMessage(res.error ?? "No se pudo guardar.");
      setMessageType("error");
    }
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

  // ── Vista de solo lectura (no admin) ───────────────────────
  if (!canEdit) {
    const meta = SERVICE_TYPE_META[serviceType] ?? SERVICE_TYPE_META.otro;
    const dateText = formatServiceDate(serviceDate || null);
    return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
        <div className="mb-4 flex items-center gap-2">
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
        </div>
        {notes && (
          <p className="mb-4 whitespace-pre-line rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {notes}
          </p>
        )}
        <ol className="space-y-2">
          {songs.map((s, i) => (
            <li key={s.sheet_id}>
              <Link
                href={`/catalog/${s.sheet_id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-900 dark:text-slate-100">
                    {s.title}
                  </span>
                  {s.composer && (
                    <span className="block truncate text-xs text-slate-400">{s.composer}</span>
                  )}
                </span>
                {(s.key_override || s.key_signature) && (
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {s.key_override || s.key_signature}
                  </span>
                )}
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
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Observaciones, responsables, etc."
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
                      </span>
                      {c.composer && (
                        <span className="block truncate text-xs text-slate-400">{c.composer}</span>
                      )}
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

      {/* Lista ordenada */}
      <ol className="mb-6 space-y-2">
        {songs.map((s, i) => (
          <li
            key={s.sheet_id}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-slate-900 dark:text-slate-100">
                {s.title}
              </span>
              {s.composer && (
                <span className="block truncate text-xs text-slate-400">{s.composer}</span>
              )}
            </span>
            <input
              value={s.key_override}
              onChange={(e) => patchSong(s.sheet_id, { key_override: e.target.value })}
              placeholder={s.key_signature ?? "Tono"}
              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              title="Tono para este culto"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
                aria-label="Subir"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === songs.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-800"
                aria-label="Bajar"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeSong(s.sheet_id)}
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
