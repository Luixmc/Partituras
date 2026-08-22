"use client";

import type { SheetStatus } from "@/types";
import { ESTADO_CULTO, ESTADOS_CULTO } from "@/lib/cultos";

// ─────────────────────────────────────────────────────────────
// Borrador · Publicado · Archivado, para el culto (O-31).
//
// **Solo lo ve el administrador**, y solo tiene sentido en un culto que ya
// existe: uno que se está creando todavía no tiene fila que marcar.
//
// Va aparte del botón de «Guardar» a propósito. Publicar un culto no es lo
// mismo que corregirle el nombre o mover una canción de sitio: si compartieran
// botón, retocar cualquier detalle lo publicaría sin querer.
//
// Debajo se dice **qué significa cada estado en la práctica** —quién ve el
// culto—, porque «archivado» no se explica solo: Isaac ya preguntó qué querían
// decir los círculos del bajo, y la respuesta fue ponerle leyenda.
// ─────────────────────────────────────────────────────────────

type Props = {
  estado: SheetStatus;
  onCambiar: (nuevo: SheetStatus) => void | Promise<void>;
  cambiando?: boolean;
};

const EXPLICACION: Record<SheetStatus, string> = {
  draft:     "En borrador: lo ves solo tú, mientras lo armas.",
  published: "Publicado: lo ven los músicos y los lectores.",
  archived:  "Archivado: deja de verlo todo el mundo menos tú.",
};

export default function EstadoCulto({ estado, onCambiar, cambiando = false }: Props) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Estado
        </span>
        {ESTADOS_CULTO.map((e) => {
          const activo = estado === e;
          return (
            <button
              key={e}
              type="button"
              onClick={() => !activo && onCambiar(e)}
              disabled={cambiando}
              aria-pressed={activo}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
                activo
                  ? "border-slate-700 bg-slate-700 text-white dark:border-slate-300 dark:bg-slate-300 dark:text-slate-900"
                  : "border-dashed border-slate-300 bg-transparent text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400"
              }`}
            >
              {ESTADO_CULTO[e].label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{EXPLICACION[estado]}</p>
    </div>
  );
}
