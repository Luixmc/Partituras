"use client";

import { createElement, useState } from "react";
import { FileDown } from "lucide-react";

export interface PdfSong {
  title:    string;
  composer: string | null;
  key:      string | null;
}

type Props = {
  name:      string;
  typeLabel: string;
  dateText:  string | null;
  songs:     PdfSong[];
};

/**
 * Exporta el setlist a PDF (nombre, tipo, fecha y canciones con tono) para
 * imprimir o compartir por WhatsApp. @react-pdf/renderer se importa de forma
 * dinámica al pulsar, para no cargarlo en el bundle inicial.
 */
export default function ServicePdfButton({ name, typeLabel, dateText, songs }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");

      const s = StyleSheet.create({
        page:     { paddingVertical: 48, paddingHorizontal: 56, fontSize: 12, color: "#0f172a" },
        title:    { fontSize: 22, fontWeight: 700, marginBottom: 4 },
        meta:     { fontSize: 11, color: "#64748b", marginBottom: 20 },
        row:      { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
        num:      { width: 22, fontSize: 13, fontWeight: 700, color: "#94a3b8" },
        songTit:  { flexGrow: 1, fontSize: 14 },
        composer: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
        key:      { width: 60, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#7c3aed" },
        footer:   { position: "absolute", bottom: 28, left: 56, right: 56, fontSize: 9, color: "#cbd5e1", textAlign: "center" },
      });

      const doc = createElement(
        Document,
        null,
        createElement(
          Page,
          { size: "A4", style: s.page },
          createElement(Text, { style: s.title }, name),
          createElement(
            Text,
            { style: s.meta },
            [typeLabel, dateText].filter(Boolean).join("  ·  ")
          ),
          ...songs.map((song, i) =>
            createElement(
              View,
              { key: i, style: s.row, wrap: false },
              createElement(Text, { style: s.num }, String(i + 1)),
              createElement(
                View,
                { style: { flexGrow: 1 } },
                createElement(Text, { style: s.songTit }, song.title),
                song.composer
                  ? createElement(Text, { style: s.composer }, song.composer)
                  : null
              ),
              createElement(Text, { style: s.key }, song.key || "—")
            )
          ),
          createElement(Text, { style: s.footer }, "La Casa de mi Padre · Cancionero")
        )
      );

      const blob = await pdf(doc as any).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/[^\w\sáéíóúüñ-]/gi, "").trim() || "culto"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <FileDown className="h-4 w-4" />
      {busy ? "Generando..." : "PDF"}
    </button>
  );
}
