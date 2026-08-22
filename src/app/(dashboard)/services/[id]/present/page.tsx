import { notFound, redirect } from "next/navigation";

import PresentationView from "@/components/services/PresentationView";
import { createClient } from "@/lib/supabase/server";
import { mapPresentSongs } from "@/lib/services";
import { puedeVerLetras } from "@/lib/letras";
import { puedeVerCulto } from "@/lib/cultos";

export default async function ServicePresentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "*, service_songs(sheet_id, position, key_override, sheet_key_id, sheet_key:sheet_keys(key_signature, content), sheet:sheets(title, composer, key_signature, content, editor_type, lyrics))"
    )
    .eq("id", params.id)
    .single();

  if (!service) notFound();

  // La letra solo viaja al navegador si a este rol le toca verla
  // (ROLES_LETRAS). Así el botón de la presentación no aparece, pero sobre
  // todo: la letra NO SALE del servidor para quien no debe verla.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  // Un culto que no está publicado solo lo presenta el admin (O-31), tampoco
  // llegando por una dirección guardada.
  if (!puedeVerCulto(service, perfil?.role === "admin")) redirect("/services");

  const songs = mapPresentSongs(service.service_songs, puedeVerLetras(perfil?.role));

  return <PresentationView title={service.name} songs={songs} backHref={`/services/${params.id}`} />;
}
