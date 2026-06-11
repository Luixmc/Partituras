"use client";

import { useMemo, useState } from "react";
import { Music4, Plus, Save, Trash2, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import AutoTextarea from "@/components/ui/AutoTextarea";
import { parseSections } from "@/lib/sections";
import { createClient } from "@/lib/supabase/client";
import {
  KEY_OPTIONS,
  KEY_OPTIONS_MINOR,
  semitonesBetween,
  prefersFlats,
  transposeContent,
} from "@/lib/music";
import type { SheetKey } from "@/types";

type Props = {
  sheetId: string;
  /** Tonalidad original de la canción (sheet.key_signature). */
  baseKey: string | null;
  /** Contenido base actual de la canción (para inicializar nuevas versiones). */
  baseContent: string;
  initialVersions: SheetKey[];
  canEdit: boolean;
};

/** Transpone el contenido base al tono destino como punto de partida. */
function seedContent(baseKey: string | null, baseContent: string, targetKey: string): string {
  const semis = semitonesBetween(baseKey, targetKey);
  if (semis === null || semis === 0) return baseContent;
  return transposeContent(baseContent, semis, prefersFlats(targetKey));
}

export default function SongKeyVersions({
  sheetId,
  baseKey,
  baseContent,
  initialVersions,
  canEdit,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [versions, setVersions] = useState<SheetKey[]>(
    [...initialVersions].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null); // id de la versión en proceso
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState<string>("");
  const [message, setMessage] = useState<{ text: string; type: "ok" | "error" } | null>(null);

  const usedKeys = useMemo(() => new Set(versions.map((v) => v.key_signature)), [versions]);

  function toggleOpen(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function patchLocal(id: string, patch: Partial<SheetKey>) {
    setVersions((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  async function handleAdd() {
    if (!newKey) return;
    setAdding(true);
    setMessage(null);
    const content = seedContent(baseKey, baseContent, newKey);

    const { data, error } = await supabase
      .from("sheet_keys")
      .insert({
        sheet_id: sheetId,
        key_signature: newKey,
        content,
        sort_order: versions.length,
      })
      .select("*")
      .single();

    setAdding(false);
    if (error || !data) {
      setMessage({ text: error?.message ?? "No se pudo crear la versión.", type: "error" });
      return;
    }
    setVersions((prev) => [...prev, data as SheetKey]);
    setOpen((prev) => new Set(prev).add((data as SheetKey).id));
    setNewKey("");
    setMessage({ text: `Versión en ${newKey} creada. Ajusta los acordes si hace falta.`, type: "ok" });
  }

  async function handleSave(v: SheetKey) {
    setBusy(v.id);
    setMessage(null);
    const { error } = await supabase
      .from("sheet_keys")
      .update({ content: v.content, label: v.label?.trim() || null })
      .eq("id", v.id);
    setBusy(null);
    if (error) {
      setMessage({ text: error.message, type: "error" });
      return;
    }
    setMessage({ text: `Versión en ${v.key_signature} guardada.`, type: "ok" });
  }

  async function handleDelete(v: SheetKey) {
    if (!confirm(`¿Eliminar la versión en ${v.key_signature}?`)) return;
    setBusy(v.id);
    const { error } = await supabase.from("sheet_keys").delete().eq("id", v.id);
    setBusy(null);
    if (error) {
      setMessage({ text: error.message, type: "error" });
      return;
    }
    setVersions((prev) => prev.filter((x) => x.id !== v.id));
  }

  /** Reemplaza el contenido de la versión por una transposición fresca del base. */
  function reseed(v: SheetKey) {
    if (!confirm(`Regenerar los acordes en ${v.key_signature} desde la versión base? Se perderán los ajustes manuales de esta versión.`)) return;
    patchLocal(v.id, { content: seedContent(baseKey, baseContent, v.key_signature) });
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Music4 className="h-4 w-4" />
        </span>
        <div>
          <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100">
            Tonalidades guardadas
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Versiones de la canción en otros tonos, con acordes editables.
          </p>
        </div>
      </div>

      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-xs ${
            message.type === "error"
              ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300"
              : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
          }`}
        >
          {message.text}
        </p>
      )}

      {versions.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-400 dark:border-slate-700">
          Aún no hay versiones en otras tonalidades.
        </p>
      )}

      <ul className="space-y-2">
        {versions.map((v) => {
          const isOpen = open.has(v.id);
          return (
            <li
              key={v.id}
              className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={() => toggleOpen(v.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  )}
                  <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {v.key_signature}
                  </span>
                  {v.label && (
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">{v.label}</span>
                  )}
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleDelete(v)}
                    disabled={busy === v.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-950"
                    aria-label="Eliminar versión"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isOpen && (
                <div className="space-y-3 p-3">
                  {canEdit && (
                    <input
                      value={v.label ?? ""}
                      onChange={(e) => patchLocal(v.id, { label: e.target.value })}
                      placeholder="Etiqueta (opcional): voz femenina, banda..."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                  )}

                  {canEdit ? (
                    <AutoTextarea
                      value={v.content ?? ""}
                      onChange={(e) => patchLocal(v.id, { content: e.target.value })}
                      rows={5}
                      spellCheck={false}
                      className="w-full min-h-[120px] rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                  ) : null}

                  {/* Vista previa de la versión */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    {(v.content ?? "").trim() ? (
                      <div className="space-y-4">
                        {parseSections(v.content ?? "").map((section, idx) => (
                          <TablaturePreview key={idx} notes={section.content} label={section.title} compact />
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-xs text-slate-400">Sin acordes en esta versión.</p>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSave(v)}
                        disabled={busy === v.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {busy === v.id ? "Guardando..." : "Guardar versión"}
                      </button>
                      <button
                        type="button"
                        onClick={() => reseed(v)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Regenerar los acordes transponiendo la versión base"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Regenerar desde base
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Agregar nueva tonalidad */}
      {canEdit && (
        <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Nueva tonalidad
            <select
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="mt-1 block w-28 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Elegir...</option>
              <optgroup label="Mayores">
                {KEY_OPTIONS.map((k) => (
                  <option key={k.value} value={k.value} disabled={usedKeys.has(k.value)}>
                    {k.value}
                    {usedKeys.has(k.value) ? " ✓" : ""}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Menores">
                {KEY_OPTIONS_MINOR.map((k) => (
                  <option key={k.value} value={k.value} disabled={usedKeys.has(k.value)}>
                    {k.value}
                    {usedKeys.has(k.value) ? " ✓" : ""}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newKey || adding}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <Plus className="h-3.5 w-3.5" />
            {adding ? "Creando..." : "Agregar versión"}
          </button>
          {!baseKey && (
            <p className="w-full text-[10px] text-amber-600 dark:text-amber-400">
              Sugerencia: define la tonalidad original de la canción para transponer automáticamente al crear versiones.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
