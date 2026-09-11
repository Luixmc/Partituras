import { notFound } from "next/navigation";

import PrintableService from "@/components/services/PrintableService";
import { createClient } from "@/lib/supabase/server";
import { formatServiceDate, mapPresentSongs, metaDeCulto, type CultoPorEnlace } from "@/lib/services";

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

  // P-02 · Por la función del enlace (migración 023): las tablas ya no se leen
  // sin cuenta. Misma forma de datos que la consulta que había aquí.
  const { data } = await supabase.rpc("culto_por_enlace", { p_token: params.token });
  const service = data as CultoPorEnlace | null;

  if (!service) notFound();

  const meta = metaDeCulto(service.service_type);

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
