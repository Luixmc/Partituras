"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

import { extractFromFile, IMPORT_ACCEPT, type ImportResult } from "@/lib/songImport";

type Props = {
  /** Se llama con el texto y título extraídos del archivo. */
  onImported: (result: ImportResult) => void;
  onError?: (message: string) => void;
  /** Texto del botón. */
  label?: string;
};

export default function ImportControls({ onImported, onError, label = "Importar archivo" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const result = await extractFromFile(file);
      onImported(result);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "No se pudo importar el archivo.");
    } finally {
      setBusy(false);
      if (event.target) event.target.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        title="Importar desde PDF, imagen o texto"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {busy ? "Procesando..." : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={IMPORT_ACCEPT}
        onChange={handleFile}
        className="hidden"
      />
    </>
  );
}
