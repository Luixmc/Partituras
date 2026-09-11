import { notFound } from "next/navigation";

import PresentationView from "@/components/services/PresentationView";
import { mapPresentSongs, type CultoPorEnlace } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export default async function PublicServicePresentPage(
  props: {
    params: Promise<{ token: string }>;
  }
) {
  const params = await props.params;
  const supabase = await createClient();

  // P-02 · Por la función del enlace (migración 023): las tablas ya no se leen
  // sin cuenta. Misma forma de datos que la consulta que había aquí.
  const { data } = await supabase.rpc("culto_por_enlace", { p_token: params.token });
  const service = data as CultoPorEnlace | null;

  if (!service) notFound();

  const songs = mapPresentSongs(service.service_songs);

  return (
    <PresentationView title={service.name} songs={songs} backHref={`/s/${params.token}`} />
  );
}
