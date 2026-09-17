import { notFound } from "next/navigation";

import PrintableService from "@/components/services/PrintableService";
import { createClient } from "@/lib/supabase/server";
import { formatServiceDate, mapPresentSongs, metaDeCulto } from "@/lib/services";
import { melodiasDe, ponerMelodias } from "@/lib/melodiaBase";
import { puedeVerMelodia } from "@/lib/melodia";

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
export default async function ImprimirCultoPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, name, service_type, service_date, service_songs(sheet_id, position, key_override, sheet_key_id, sheet_key:sheet_keys(key_signature, content), sheet:sheets(title, composer, key_signature, content, editor_type))"
    )
    .eq("id", params.id)
    .single();

  if (!service) notFound();

  const meta = metaDeCulto(service.service_type);
  const songs = mapPresentSongs(service.service_songs);

  // La MELODÍA en el PDF (O-86, fase ②).
  //
  // 🔴 Se pide APARTE y solo a quien le toca verla (ROLES_MELODIA), igual que
  // en la pantalla completa. Los dos motivos siguen valiendo aquí:
  //  · **no viaja al navegador de quien no debe verla** — no basta con no
  //    dibujarla, es que no sale del servidor;
  //  · **no va dentro del `select` de arriba**: si la columna faltara, metida
  //    ahí haría fallar la consulta entera y **el culto saldría vacío**, que en
  //    un PDF que alguien va a imprimir el sábado es peor que no tener melodía.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  if (puedeVerMelodia(perfil?.role)) {
    const melodias = await melodiasDe(supabase, songs.map((s) => s.id));
    ponerMelodias(songs, melodias);
  }

  return (
    <PrintableService
      title={service.name}
      typeLabel={meta.label}
      dateText={formatServiceDate(service.service_date)}
      songs={songs}
      backHref={`/services/${params.id}`}
    />
  );
}
