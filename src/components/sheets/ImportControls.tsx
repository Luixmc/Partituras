"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, ImageIcon } from "lucide-react";

import { extractFromFile, IMPORT_ACCEPT, IMAGE_ACCEPT, type ImportResult } from "@/lib/songImport";

type Props = {
  /** Se llama con el texto y título extraídos del archivo. */
  onImported: (result: ImportResult) => void;
  onError?: (message: string) => void;
  /** Texto del botón genérico. */
  label?: string;
};

export default function ImportControls({ onImported, onError, label = "Importar archivo" }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | "file" | "image">(null);
  const [progress, setProgress] = useState(0);

  const run = async (file: File | undefined, which: "file" | "image") => {
    if (!file) return;
    setBusy(which);
    setProgress(0);
    try {
      const result = await extractFromFile(file, (ratio) => setProgress(ratio));
      onImported(result);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "No se pudo importar el archivo.");
    } finally {
      setBusy(null);
      setProgress(0);
    }
  };

  const isBusy = busy !== null;
  // Texto del botón de imagen mientras hace OCR (con porcentaje de progreso).
  const imageBusyLabel = progress > 0 ? `OCR ${Math.round(progress * 100)}%` : "Leyendo...";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Botón genérico: PDF, imagen o texto */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isBusy}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        title="Importar desde PDF, imagen o texto"
      >
        {busy === "file" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy === "file" ? "Procesando..." : label}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept={IMPORT_ACCEPT}
        onChange={(e) => {
          run(e.target.files?.[0], "file");
          if (e.target) e.target.value = "";
        }}
        className="hidden"
      />

      {/* Botón dedicado: leer texto de una imagen (OCR) */}
      <button
        type="button"
        onClick={() => imageRef.current?.click()}
        disabled={isBusy}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        title="Leer el texto de una imagen (OCR)"
      >
        {busy === "image" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
        {busy === "image" ? imageBusyLabel : "Imagen (OCR)"}
      </button>
      <input
        ref={imageRef}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={(e) => {
          run(e.target.files?.[0], "image");
          if (e.target) e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
