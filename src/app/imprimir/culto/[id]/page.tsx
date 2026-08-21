import { notFound } from "next/navigation";

import PrintableService from "@/components/services/PrintableService";
import { createClient } from "@/lib/supabase/server";
import { SERVICE_TYPE_META, formatServiceDate, mapPresentSongs } from "@/lib/services";

/**
 * Hoja imprimible del culto: sus canciones con acordes, una por página (O-08).
 *
 * ⚠️ Vive FUERA del panel a propósito. Dentro, el layout usa altura fija y
 * `overflow: hidden` para que la barra lateral no se mueva, y con eso **el
 * navegador no puede paginar**: salía todo en una sola hoja, cortado, y encima
 * con la barra de navegación impresa dentro del PDF.
 *
 * Sigue pidiendo sesión: el middleware protege todo lo que no esté en su lista
 * de rutas públicas.
 */
export default async function ImprimirCultoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, name, service_type, service_date, service_songs(sheet_id, position, key_override, sheet_key_id, sheet_key:sheet_keys(key_signature, content), sheet:sheets(title, composer, key_signature, content, editor_type))"
    )
    .eq("id", params.id)
    .single();

  if (!service) notFound();

  const meta = SERVICE_TYPE_META[service.service_type] ?? SERVICE_TYPE_META.otro;

  return (
    <PrintableService
      title={service.name}
      typeLabel={meta.label}
      dateText={formatServiceDate(service.service_date)}
      songs={mapPresentSongs(service.service_songs)}
      backHref={`/services/${params.id}`}
    />
  );
}
