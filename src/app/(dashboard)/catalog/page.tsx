import { Filter, Search } from "lucide-react";

import SheetCard from "@/components/sheets/SheetCard";
import CatalogFilters from "@/components/sheets/CatalogFilters";
import { createClient } from "@/lib/supabase/server";
import { buscarCanciones, categoriasElegidas, filtrosAQuery, type FiltrosCatalogo } from "@/lib/catalogo";
import type { Category } from "@/types";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: FiltrosCatalogo;
}) {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, color")
    .eq("active", true)
    .order("sort_order");

  // La consulta vive en lib/catalogo para que la pantalla completa de una
  // canción devuelva EXACTAMENTE esta misma lista (O-16).
  const sheets = await buscarCanciones(supabase, searchParams);
  const selectedIds = categoriasElegidas(searchParams);
  const q = searchParams.q;
  // El filtro viaja con cada canción, para que al abrirla y ponerla a pantalla
  // completa se sepa dentro de qué lista está.
  const filtro = filtrosAQuery(searchParams);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 md:px-8 dark:border-slate-700 dark:bg-slate-900">
        <h1 className="mb-4 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
          Catalogo de canciones
        </h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <form>
            <input
              name="q"
              defaultValue={q}
              type="search"
              placeholder="Buscar por titulo, compositor..."
              className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </form>
        </div>

        <CatalogFilters
          categories={(categories ?? []) as Category[]}
          selectedIds={selectedIds}
          q={q}
        />
      </div>

      <div className="flex-1 p-4 md:p-8">
        {sheets && sheets.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {sheets.length} cancion{sheets.length !== 1 ? "es" : ""} encontrada{sheets.length !== 1 ? "s" : ""}
              {selectedIds.length > 0 && (
                <span className="ml-1 text-brand-600">
                  · {selectedIds.length} categoria{selectedIds.length !== 1 ? "s" : ""} activa{selectedIds.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sheets.map((sheet) => (
                <SheetCard key={sheet.id} sheet={sheet} filtro={filtro} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Filter className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="mb-1 font-display text-lg font-semibold text-slate-700 dark:text-slate-200">
              Sin resultados
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {q
                ? `No se encontraron canciones para "${q}"`
                : "No hay canciones disponibles aun"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
