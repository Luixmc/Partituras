"use client";

import { useState } from "react";
import { ClipboardPaste, Wand2, X } from "lucide-react";

import { convertChordSheet, type ChordImportResult } from "@/lib/chordImport";

type Props = {
  /** Se llama con el contenido convertido (cuadrícula), tono y título. */
  onConverted: (result: ChordImportResult) => void;
  label?: string;
};

/**
 * Pega el texto de una canción en formato "acordes sobre la letra" (LaCuerda,
 * etc.) y lo convierte a la cuadrícula de la app: tono + secciones + acordes.
 * El ritmo (duraciones y compases) se ajusta luego en el editor.
 */
export default function ChordPasteImport({ onConverted, label = "Pegar de web" }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const preview = text.trim() ? convertChordSheet(text) : null;
  const sectionCount = preview ? (preview.content.match(/<[^>]+>/g)?.length ?? 0) : 0;
  const chordCount = preview
    ? preview.content
        .replace(/<[^>]+>/g, " ")
        .split(/\s+/)
        .filter(Boolean).length
    : 0;

  function handleApply() {
    if (!preview || !preview.content.trim()) return;
    onConverted(preview);
    setText("");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        title="Pegar acordes desde una web (LaCuerda, etc.) y convertir"
      >
        <ClipboardPaste className="h-3.5 w-3.5" />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                Importar acordes desde texto
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                Copia la canción de la web (acordes sobre la letra) y pégala aquí. Se detectan el
                tono, las secciones y los acordes. El ritmo se ajusta luego en el editor.
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                autoFocus
                spellCheck={false}
                placeholder={"Tono: G\n\nIntro: G  C  G  D\n\n       G            C\nCuando todo cambió..."}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />

              {preview && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <p className="mb-1 font-semibold">Detectado:</p>
                  <ul className="space-y-0.5">
                    <li>Tono: <span className="font-medium">{preview.key ?? "—"}</span></li>
                    <li>Título: <span className="font-medium">{preview.title ?? "—"}</span></li>
                    <li>{sectionCount} sección{sectionCount !== 1 ? "es" : ""} · {chordCount} acorde{chordCount !== 1 ? "s" : ""}</li>
                  </ul>
                  {preview.content.trim() && (
                    <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-white p-2 font-mono text-[11px] text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {preview.content}
                    </pre>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!preview || !preview.content.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
              >
                <Wand2 className="h-4 w-4" />
                Convertir e insertar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
