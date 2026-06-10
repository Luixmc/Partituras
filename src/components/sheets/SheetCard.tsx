import Link from "next/link";
import { Eye, Music2, Layout } from "lucide-react";

import TablaturePreview from "@/components/sheets/TablaturePreview";
import type { SheetCatalogItem, SheetStatus } from "@/types";
import { categoryStyle, formatKey } from "@/lib/utils";

const STATUS_BADGE: Record<SheetStatus, { label: string; className: string }> = {
  published: { label: "Publicada", className: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Borrador", className: "bg-slate-200 text-slate-600" },
  archived: { label: "Archivada", className: "bg-amber-50 text-amber-700" },
};

export default function SheetCard({ sheet }: { sheet: SheetCatalogItem }) {
  const hasNotes = Boolean(sheet.content?.trim());
  // Secciones marcadas con [..] o <..>.
  const sectionCount = sheet.content?.match(/\[.*?\]|<.*?>/g)?.length ?? 0;
  const badge = STATUS_BADGE[sheet.status] ?? STATUS_BADGE.draft;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <Link href={`/catalog/${sheet.id}`} className="block">
        <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
              <Music2 className="h-3.5 w-3.5" />
              Cancion
            </span>
            <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
              {badge.label}
            </span>
          </div>

          {hasNotes ? (
            // Mini-vista con el mismo render que el visor (acordes, figuras, etc.).
            <div className="max-h-[80px] overflow-hidden rounded bg-white dark:bg-slate-900">
              <TablaturePreview notes={sheet.content ?? ""} compact fontScale={0.7} />
            </div>
          ) : (
            <div className="flex h-[72px] items-center justify-center border border-dashed border-slate-300 bg-white text-xs text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-500">
              Sin notas
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight text-slate-900 dark:text-slate-50">
              {sheet.title}
            </h3>
            {sheet.composer && (
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
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
            {sectionCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <Layout className="h-3 w-3" />
                {sectionCount} {sectionCount === 1 ? "parte" : "partes"}
              </span>
            )}
          </div>

          <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-200 dark:hover:bg-brand-900">
            <Eye className="h-3.5 w-3.5" />
            Ver cancion
          </div>
        </div>
      </Link>
    </article>
  );
}
