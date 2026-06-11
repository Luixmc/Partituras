import { notFound } from "next/navigation";

import PresentationView from "@/components/services/PresentationView";
import { mapPresentSongs } from "@/lib/services";
import { createClient } from "@/lib/supabase/server";

export default async function PublicServicePresentPage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "name, public_token, service_songs(position, key_override, sheet_key_id, sheet_key:sheet_keys(key_signature, content), sheet:sheets(title, composer, key_signature, content, editor_type))"
    )
    .eq("public_token", params.token)
    .eq("is_public", true)
    .single();

  if (!service) notFound();

  const songs = mapPresentSongs(service.service_songs);

  return (
    <PresentationView title={service.name} songs={songs} backHref={`/s/${params.token}`} />
  );
}
