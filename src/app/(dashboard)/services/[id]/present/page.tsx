import { notFound } from "next/navigation";

import PresentationView from "@/components/services/PresentationView";
import { createClient } from "@/lib/supabase/server";
import { mapPresentSongs } from "@/lib/services";

export default async function ServicePresentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, name, service_songs(position, key_override, sheet:sheets(title, composer, key_signature, content, editor_type))"
    )
    .eq("id", params.id)
    .single();

  if (!service) notFound();

  const songs = mapPresentSongs(service.service_songs);

  return <PresentationView title={service.name} songs={songs} backHref={`/services/${params.id}`} />;
}
