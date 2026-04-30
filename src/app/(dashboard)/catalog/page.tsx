import { createClient } from "@/lib/supabase/server";
import { Search, Filter } from "lucide-react";
import SheetCard from "@/components/sheets/SheetCard";
import type { SheetCatalogItem, Category } from "@/types";

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

  // Load categories for filter
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, color")
    .eq("active", true)
    .order("sort_order");

  // Load sheets using the search function
  const { data: sheets } = await supabase.rpc("search_sheets", {
    query:      q        || null,
    p_category: category || null,
    p_status:   "published",
    p_limit:    50,
    p_offset:   0,
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-5">
        <h1 className="font-display text-2xl font-bold text-slate-900 mb-4">
          Catálogo de partituras
        </h1>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <form>
            <input
              name="q"
              defaultValue={q}
              type="search"
              placeholder="Buscar por título, compositor, número..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white
                         transition-all"
            />
          </form>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <a
            href="/catalog"
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
              ${!category
                ? "bg-brand-600 text-white border-brand-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
              }`}
          >
            Todas
          </a>
          {(categories as Category[])?.map((cat) => (
            <a
              key={cat.id}
              href={`/catalog?category=${cat.id}${q ? `&q=${q}` : ""}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${category === cat.id
                  ? "text-white border-transparent"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
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

      {/* Results */}
      <div className="flex-1 p-4 md:p-8">
        {sheets && sheets.length > 0 ? (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {sheets.length} partitura{sheets.length !== 1 ? "s" : ""} encontrada{sheets.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(sheets as SheetCatalogItem[]).map((sheet) => (
                <SheetCard key={sheet.id} sheet={sheet} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-700 mb-1">
              Sin resultados
            </h3>
            <p className="text-slate-400 text-sm">
              {q
                ? `No se encontraron partituras para "${q}"`
                : "No hay partituras publicadas aún"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
