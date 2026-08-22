import { notFound } from "next/navigation";

import PrintableService from "@/components/services/PrintableService";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_TYPE_META, formatServiceDate, mapPresentSongs } from "@/lib/services";

/**
 * La misma hoja imprimible, para quien recibió el enlace compartido y no tiene
 * cuenta (O-08). Solo funciona si el culto está compartido.
 */
export default async function ImprimirCultoPublicoPage(
  props: {
    params: Promise<{ token: string }>;
  }
) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "name, service_type, service_date, public_token, service_songs(sheet_id, position, key_override, sheet_key_id, sheet_key:sheet_keys(key_signature, content), sheet:sheets(title, composer, key_signature, content, editor_type))"
    )
    .eq("public_token", params.token)
    .eq("is_public", true)
    .single();

  if (!service) notFound();

  const meta = SERVICE_TYPE_META[service.service_type] ?? SERVICE_TYPE_META.otro;

  return (
    <PrintableService
      title={service.name}
      typeLabel={meta.label}
      dateText={formatServiceDate(service.service_date)}
      songs={mapPresentSongs(service.service_songs)}
      backHref={`/s/${params.token}`}
    />
  );
}
