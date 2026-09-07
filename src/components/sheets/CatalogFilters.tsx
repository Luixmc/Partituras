"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { ESTADOS } from "@/lib/catalogo";
import type { Category } from "@/types";

type Props = {
  categories: Category[];
  selectedIds: string[];
  q?: string;
  /** Estado elegido (O-28). Solo llega si quien mira es administrador. */
  estado?: string | null;
  /** Si está puesto el filtro «Solo mis favoritos» (O-73). */
  soloFavoritos?: boolean;
  /** Enseña la fila de estados. **A músicos y lectores no les aparece.** */
  esAdmin?: boolean;
  /** A qué pantalla vuelve al filtrar. `/letras` reutiliza este mismo
      componente en vez de tener su propia copia: dos filtros que hacen lo
      mismo acaban separándose (P-09). */
  base?: string;
};

export default function CatalogFilters({
  categories,
  selectedIds,
  q,
  estado = null,
  soloFavoritos = false,
  esAdmin = false,
  base = "/catalog",
}: Props) {
  const router = useRouter();

  function buildUrl(
    newSelectedIds: string[],
    nuevoEstado: string | null = estado,
    favoritos: boolean = soloFavoritos
  ) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (favoritos) params.set("favoritos", "1");
    if (newSelectedIds.length > 0) params.set("categories", newSelectedIds.join(","));
    // El estado se conserva al cambiar de categoría, y al revés: son dos
    // filtros que se combinan, no uno que sustituye al otro.
    if (nuevoEstado) params.set("estado", nuevoEstado);
    const query = params.toString();
    return `${base}${query ? `?${query}` : ""}`;
  }

  function toggleCategory(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((c) => c !== id)
      : [...selectedIds, id];
    router.push(buildUrl(next));
  }

  function clearAll() {
    router.push(buildUrl([]));
  }

  /** Pulsar el estado que ya está elegido lo quita: vuelven a salir todas. */
  function alternarEstado(valor: string) {
    router.push(buildUrl(selectedIds, estado === valor ? null : valor));
  }

  return (
    <div className="space-y-2">
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {/* 🔴 O-73 · Va DELANTE de «Todas» a propósito: es el filtro que un músico
          usa cada domingo, y en un catálogo de 72 canciones es el atajo a las
          suyas. Pulsarlo otra vez lo quita, como los demás. */}
      <button
        onClick={() => router.push(buildUrl(selectedIds, estado, !soloFavoritos))}
        aria-pressed={soloFavoritos}
        className={`flex flex-shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
          soloFavoritos
            ? "border-rose-500 bg-rose-500 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        <Heart className="h-3.5 w-3.5" fill={soloFavoritos ? "currentColor" : "none"} />
        Mis favoritas
      </button>
      <button
        onClick={clearAll}
        className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
          selectedIds.length === 0
            ? "border-brand-600 bg-brand-600 text-white"
            : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => {
        const active = selectedIds.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              active
                ? "border-transparent text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
            style={active ? { backgroundColor: cat.color, borderColor: cat.color } : undefined}
          >
            {cat.name}
          </button>
        );
      })}
    </div>

    {/* Fila de estados: SOLO para administradores (O-28). Va aparte de las
        categorías porque no es lo mismo —una canción tiene categorías Y un
        estado—, y mezclarlas haría creer que se excluyen. */}
    {esAdmin && (
      <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto pb-1">
        <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Estado
        </span>
        {ESTADOS.map((e) => {
          const activo = estado === e.valor;
          return (
            <button
              key={e.valor}
              onClick={() => alternarEstado(e.valor)}
              aria-pressed={activo}
              className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                activo
                  ? "border-slate-700 bg-slate-700 text-white dark:border-slate-300 dark:bg-slate-300 dark:text-slate-900"
                  : "border-dashed border-slate-300 bg-transparent text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400"
              }`}
            >
              {e.nombre}
            </button>
          );
        })}
      </div>
    )}
    </div>
  );
}
