import { notFound, redirect } from "next/navigation";

import PresentationView from "@/components/services/PresentationView";
import { createClient } from "@/lib/supabase/server";
import { mapPresentSongs } from "@/lib/services";
import { melodiasDe } from "@/lib/melodiaBase";
import { puedeVerMelodia } from "@/lib/melodia";
import { puedeVerLetras } from "@/lib/letras";
import { puedeVerCulto } from "@/lib/cultos";

export default async function ServicePresentPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
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

  // La melodia se pide APARTE, y solo a quien le toca verla (ROLES_MELODIA).
  // 🔴 No va dentro del `select` de arriba a proposito: mientras la columna no
  // exista, meterla ahi haria fallar la consulta entera y **el culto saldria
  // vacio en mitad del servicio**. Ver `lib/melodiaBase.ts`.
  if (puedeVerMelodia(perfil?.role)) {
    const melodias = await melodiasDe(supabase, songs.map((s) => s.id));
    for (const cancion of songs) cancion.melody = melodias.get(cancion.id) ?? null;
  }

  return <PresentationView title={service.name} songs={songs} backHref={`/services/${params.id}`} />;
}
