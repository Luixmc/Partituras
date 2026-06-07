import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import SongDetailEditor from "@/components/sheets/SongDetailEditor";
import { createClient } from "@/lib/supabase/server";
import type { Category, Sheet } from "@/types";

type SheetWithCategory = Sheet & {
  category?: {
    name: string;
    color: string;
  } | null;
};

export default async function SheetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: sheet } = await supabase
    .from("sheets")
    .select("*, category:categories!category_id(name, color)")
    .eq("id", params.id)
    .single();

  if (!sheet) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  // Categorías asignadas a esta canción (tabla de unión). Si la tabla aún no
  // existe (migración 010 sin aplicar), caemos en la categoría única.
  const { data: sheetCategoryRows } = await supabase
    .from("sheet_categories")
    .select("category_id")
    .eq("sheet_id", params.id);

  const initialCategoryIds =
    sheetCategoryRows && sheetCategoryRows.length
      ? sheetCategoryRows.map((r) => r.category_id as string)
      : sheet.category_id
        ? [sheet.category_id]
        : [];

  const canEdit =
    profile?.role === "admin" ||
    (profile?.role === "musician" && sheet.created_by === user?.id);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link
            href="/catalog"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors hover:bg-slate-200"
            aria-label="Volver al catalogo"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-bold text-slate-900">
              {sheet.title}
            </h1>
            <p className="text-sm text-slate-500">
              Vista de cancion y editor de contenido
            </p>
          </div>
        </div>
      </div>

      <SongDetailEditor
        sheet={sheet as SheetWithCategory}
        categories={(categories ?? []) as Category[]}
        initialCategoryIds={initialCategoryIds}
        canEdit={canEdit}
      />
    </div>
  );
}
