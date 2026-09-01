import Link from "next/link";

import { categoryStyle, formatKey } from "@/lib/utils";
import type { SheetCatalogItem, SheetStatus } from "@/types";

const ESTADO: Record<SheetStatus, { label: string; className: string }> = {
  published: { label: "Publicada", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  draft:     { label: "Borrador",  className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  archived:  { label: "Archivada", className: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
};

export default function SheetCard({
  sheet,
  filtro = "",
  esAdmin = false,
}: {
  sheet: SheetCatalogItem;
  /** Filtro activo del catálogo; viaja con el enlace para saber, al poner la
      canción a pantalla completa, cuál es «la siguiente» (O-16). */
  filtro?: string;
  /** El estado (Publicada / Borrador / Archivada) **solo lo ve el admin**.
      A un músico no le dice nada —él solo ve lo publicado— y le mete ruido
      en las 67 tarjetas. Isaac lo pidió probando con una cuenta de lector
      (O-32), igual que el filtro por estado de O-28. */
  esAdmin?: boolean;
}) {
  const estado = esAdmin ? ESTADO[sheet.status] ?? ESTADO.draft : null;

  return (
    <article className="rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* La tarjeta ENTERA es el enlace, así que no hace falta un botón de
          «Ver cancion» dentro: ocupaba una fila completa para repetir lo que
          ya hace el clic (O-35). Fuera también la cabecera que ponía
          «Cancion» en todas: en un catálogo de canciones, eso no informa.
          Entre las dos cosas la tarjeta baja de ~185 px a ~110 px. */}
      <Link href={`/catalog/${sheet.id}${filtro}`} className="flex h-full flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight text-slate-900 dark:text-slate-50">
            {sheet.title}
          </h3>
          {estado && (
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${estado.className}`}
            >
              {estado.label}
            </span>
          )}
        </div>

        {sheet.composer && (
          <p className="-mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{sheet.composer}</p>
        )}

        {/* Categorías, tono y compás en UNA fila que envuelve: es lo que se
            mira para elegir una canción, y cabe junto. */}
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
          {/* TODAS las categorías de la canción, no solo la principal (O-07). */}
          {sheet.categories?.map((cat) => (
            <span key={cat.name} className="category-badge border" style={categoryStyle(cat.color)}>
              {cat.name}
            </span>
          ))}
          {sheet.key_signature && (
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {formatKey(sheet.key_signature)}
            </span>
          )}
          {/* Las otras tonalidades en las que esta escrita (O-48).
              📌 La ORIGINAL se distingue: va arriba en negrita, y estas
              llevan un punto delante y color mas apagado. Sin eso, dos
              tonos sueltos en una tarjeta no dicen cual manda — y
              distinguirla era justo lo que Isaac pidio. */}
          {(sheet as { otros_tonos?: string[] }).otros_tonos?.map((tono) => (
            <span
              key={tono}
              title="También está escrita en este tono"
              className="text-[11px] text-slate-400 dark:text-slate-500"
            >
              · {formatKey(tono)}
            </span>
          ))}
          {sheet.time_signature && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{sheet.time_signature}</span>
          )}
        </div>
      </Link>
    </article>
  );
}
