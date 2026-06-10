import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ServiceEditor, { type CatalogSong } from "@/components/services/ServiceEditor";
import { createClient } from "@/lib/supabase/server";
import type { ServiceWithSongs } from "@/types";

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "*, service_songs(sheet_id, position, key_override, note, sheet:sheets(title, composer, key_signature))"
    )
    .eq("id", params.id)
    .single();

  if (!service) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const canEdit = profile?.role === "admin";

  // Normaliza las canciones embebidas y las ordena por posicion.
  const songs = (service.service_songs ?? [])
    .map((row: any) => ({
      sheet_id:      row.sheet_id,
      position:      row.position,
      key_override:  row.key_override,
      note:          row.note,
      title:         row.sheet?.title ?? "(cancion eliminada)",
      composer:      row.sheet?.composer ?? null,
      key_signature: row.sheet?.key_signature ?? null,
    }))
    .sort((a: any, b: any) => a.position - b.position);

  const serviceWithSongs: ServiceWithSongs = {
    id:           service.id,
    name:         service.name,
    service_type: service.service_type,
    service_date: service.service_date,
    notes:        service.notes,
    created_by:   service.created_by,
    created_at:   service.created_at,
    updated_at:   service.updated_at,
    songs,
  };

  // El catalogo solo se necesita para editar (admin).
  const { data: catalog } = canEdit
    ? await supabase
        .from("sheets")
        .select("id, title, composer, key_signature")
        .order("title", { ascending: true })
    : { data: [] };

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
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-bold text-slate-900 dark:text-slate-50">
              {service.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {canEdit ? "Editor del culto" : "Detalle del culto"}
            </p>
          </div>
        </div>
      </div>

      <ServiceEditor
        service={serviceWithSongs}
        catalog={(catalog ?? []) as CatalogSong[]}
        canEdit={canEdit}
      />
    </div>
  );
}
