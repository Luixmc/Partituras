import Link from "next/link";
import { Eye, Music2 } from "lucide-react";

import type { SheetCatalogItem } from "@/types";
import { categoryStyle, formatKey } from "@/lib/utils";

function parsePreviewNotes(content?: string | null) {
  return (content ?? "")
    .replace(/[|\n\r\t]/g, " ")
    .split(/\s+/)
    .map((note) => note.trim())
    .filter(Boolean)
    .slice(0, 14);
}

export default function SheetCard({ sheet }: { sheet: SheetCatalogItem }) {
  const notes = parsePreviewNotes(sheet.content);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/catalog/${sheet.id}`} className="block">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200">
              <Music2 className="h-3.5 w-3.5" />
              Cancion
            </span>
            <span
              className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                sheet.status === "published"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {sheet.status === "published" ? "Publicada" : "Borrador"}
            </span>
          </div>

          {notes.length > 0 ? (
            <div className="grid grid-cols-7 border-l border-t border-slate-300 bg-white font-mono text-[11px] text-slate-950">
              {notes.map((note, index) => (
                <div
                  key={`${note}-${index}`}
                  className="flex h-9 items-end border-b border-r border-slate-300 px-1 pb-0.5"
                >
                  {note}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[72px] items-center justify-center border border-dashed border-slate-300 bg-white text-xs text-slate-400">
              Sin notas
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight text-slate-900">
              {sheet.title}
            </h3>
            {sheet.composer && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {sheet.composer}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sheet.category_name && (
              <span
                className="category-badge border"
                style={categoryStyle(sheet.category_color ?? "#6b7280")}
              >
                {sheet.category_name}
              </span>
            )}
            {sheet.key_signature && (
              <span className="text-[11px] font-medium text-slate-500">
                {formatKey(sheet.key_signature)}
              </span>
            )}
            {sheet.time_signature && (
              <span className="text-[11px] text-slate-400">
                {sheet.time_signature}
              </span>
            )}
          </div>

          <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100">
            <Eye className="h-3.5 w-3.5" />
            Ver cancion
          </div>
        </div>
      </Link>
    </article>
  );
}
