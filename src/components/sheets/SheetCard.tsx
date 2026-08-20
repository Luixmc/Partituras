import Link from "next/link";
import { Eye, Music2 } from "lucide-react";

import type { SheetCatalogItem, SheetStatus } from "@/types";
import { categoryStyle, formatKey } from "@/lib/utils";

const STATUS_BADGE: Record<SheetStatus, { label: string; className: string }> = {
  published: { label: "Publicada", className: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Borrador", className: "bg-slate-200 text-slate-600" },
  archived: { label: "Archivada", className: "bg-amber-50 text-amber-700" },
};

export default function SheetCard({
  sheet,
  filtro = "",
}: {
  sheet: SheetCatalogItem;
  /** Filtro activo del catálogo; viaja con el enlace para saber, al poner la
      canción a pantalla completa, cuál es «la siguiente» (O-16). */
  filtro?: string;
}) {
  const badge = STATUS_BADGE[sheet.status] ?? STATUS_BADGE.draft;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <Link href={`/catalog/${sheet.id}${filtro}`} className="block">
        {/* Cabecera: tipo de contenido y estado. La miniatura de acordes se
            quitó a propósito (O-05): la tarjeta dice QUÉ es la canción, y los
            acordes se ven al abrirla. Quitarla también permitió dejar de traer
            el texto de cada canción, que era lo que obligaba a topar la lista. */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800/60">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-300">
            <Music2 className="h-3.5 w-3.5" />
            Cancion
          </span>
          <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
            {badge.label}
          </span>
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
            {/* TODAS las categorías de la canción, no solo la principal (O-07). */}
            {sheet.categories?.map((cat) => (
              <span key={cat.name} className="category-badge border" style={categoryStyle(cat.color)}>
                {cat.name}
              </span>
            ))}
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

          <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-50 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-200 dark:hover:bg-brand-900">
            <Eye className="h-3.5 w-3.5" />
            Ver cancion
          </div>
        </div>
      </Link>
    </article>
  );
}
