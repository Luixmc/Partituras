import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ServiceEditor, { type CatalogSong } from "@/components/services/ServiceEditor";
import { createClient } from "@/lib/supabase/server";

export default async function NewServicePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  // Solo los administradores pueden crear cultos.
  if (profile?.role !== "admin") redirect("/services");

  const { data: catalogRows } = await supabase
    .from("sheets")
    .select("id, title, composer, key_signature, category:categories!category_id(name, color)")
    .order("title", { ascending: true });

  const catalog = (catalogRows ?? []).map((c: any) => ({
    id: c.id,
    title: c.title,
    composer: c.composer,
    key_signature: c.key_signature,
    category_name: c.category?.name ?? null,
    category_color: c.category?.color ?? null,
  }));

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href="/services"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            aria-label="Volver a cultos"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
              Nuevo culto
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Arma el setlist del servicio
            </p>
          </div>
        </div>
      </div>

      <ServiceEditor service={null} catalog={catalog as CatalogSong[]} canEdit />
    </div>
  );
}
