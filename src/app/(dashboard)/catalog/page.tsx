import { Filter, Search } from "lucide-react";

import SheetCard from "@/components/sheets/SheetCard";
import { createClient } from "@/lib/supabase/server";
import type { Category, SheetCatalogItem } from "@/types";

interface SearchParams {
  q?: string;
  category?: string;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { q, category } = searchParams;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, color")
    .eq("active", true)
    .order("sort_order");

  let sheetsQuery = supabase
    .from("sheets")
    .select(
      "id, title, composer, hymn_number, key_signature, time_signature, editor_type, content, status, thumbnail_path, drive_file_id, page_count, created_at, category:categories(name, color, icon)"
    )
    .order("title", { ascending: true })
    .limit(50);

  if (category) {
    sheetsQuery = sheetsQuery.eq("category_id", category);
  }

  if (q) {
    sheetsQuery = sheetsQuery.or(
      `title.ilike.%${q}%,composer.ilike.%${q}%,hymn_number.ilike.%${q}%`
    );
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
              placeholder="Buscar por titulo, compositor, numero..."
              className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </form>
        </div>

        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          <a
            href="/catalog"
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              !category
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
            }`}
          >
            Todas
          </a>
          {(categories as Category[])?.map((cat) => (
            <a
              key={cat.id}
              href={`/catalog?category=${cat.id}${q ? `&q=${q}` : ""}`}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                category === cat.id
                  ? "border-transparent text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
              style={
                category === cat.id
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : undefined
              }
            >
              {cat.name}
            </a>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8">
        {sheets && sheets.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {sheets.length} cancion{sheets.length !== 1 ? "es" : ""} encontrada{sheets.length !== 1 ? "s" : ""}
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
