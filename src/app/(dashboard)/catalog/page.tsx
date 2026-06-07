import { Filter, Search } from "lucide-react";

import SheetCard from "@/components/sheets/SheetCard";
import CatalogFilters from "@/components/sheets/CatalogFilters";
import { createClient } from "@/lib/supabase/server";
import type { Category, SheetCatalogItem } from "@/types";

interface SearchParams {
  q?: string;
  categories?: string;
  // legacy single-category param
  category?: string;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { q, categories: categoriesParam, category: legacyCategory } = searchParams;

  // Soporte para múltiples categorías separadas por coma. Validamos que sean
  // UUIDs para poder usarlas con seguridad en el filtro in() de PostgREST.
  const UUID_RE = /^[0-9a-fA-F-]{36}$/;
  const rawCategories = categoriesParam ?? legacyCategory ?? "";
  const selectedIds = rawCategories
    ? rawCategories.split(",").map((s) => s.trim()).filter((s) => UUID_RE.test(s))
    : [];

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, color")
    .eq("active", true)
    .order("sort_order");

  let sheetsQuery = supabase
    .from("sheets")
    .select(
      // Desambiguamos el embed con !category_id: ahora hay 2 relaciones entre
      // sheets y categories (la FK directa y la tabla de unión sheet_categories).
      "id, title, composer, hymn_number, key_signature, time_signature, editor_type, content, status, thumbnail_path, drive_file_id, page_count, created_at, category:categories!category_id(name, color, icon)"
    )
    .order("title", { ascending: true })
    .limit(50);

  if (selectedIds.length) {
    // Una canción coincide si su categoría principal está seleccionada O si
    // está vinculada a alguna de ellas en la tabla de unión (varias categorías).
    const { data: links } = await supabase
      .from("sheet_categories")
      .select("sheet_id")
      .in("category_id", selectedIds);
    const linkedIds = Array.from(new Set((links ?? []).map((l) => l.sheet_id as string)));

    const orParts = [`category_id.in.(${selectedIds.join(",")})`];
    if (linkedIds.length) orParts.push(`id.in.(${linkedIds.join(",")})`);
    sheetsQuery = sheetsQuery.or(orParts.join(","));
  }

  if (q) {
    // Saneamos la búsqueda: las comas y paréntesis rompen la sintaxis del filtro
    // .or() de PostgREST, y %/_ son comodines de ilike. Los neutralizamos.
    const safeQ = q
      .replace(/[,()]/g, " ")
      .replace(/[%_]/g, "\\$&")
      .trim();
    if (safeQ) {
      sheetsQuery = sheetsQuery.or(
        `title.ilike.%${safeQ}%,composer.ilike.%${safeQ}%,hymn_number.ilike.%${safeQ}%`
      );
    }
  }

  const { data: sheetsData } = await sheetsQuery;

  const sheets = (sheetsData ?? []).map((sheet: any) => ({
    ...sheet,
    category_name: sheet.category?.name ?? null,
    category_color: sheet.category?.color ?? null,
    category_icon: sheet.category?.icon ?? null,
    tags: null,
    created_by_name: null,
    published_at: null,
  })) as SheetCatalogItem[];

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-5 md:px-8">
        <h1 className="mb-4 font-display text-2xl font-bold text-slate-900">
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
              className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
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
            <p className="mb-4 text-sm text-slate-500">
              {sheets.length} cancion{sheets.length !== 1 ? "es" : ""} encontrada{sheets.length !== 1 ? "s" : ""}
              {selectedIds.length > 0 && (
                <span className="ml-1 text-brand-600">
                  · {selectedIds.length} categoria{selectedIds.length !== 1 ? "s" : ""} activa{selectedIds.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sheets.map((sheet) => (
                <SheetCard key={sheet.id} sheet={sheet} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Filter className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="mb-1 font-display text-lg font-semibold text-slate-700">
              Sin resultados
            </h3>
            <p className="text-sm text-slate-400">
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
