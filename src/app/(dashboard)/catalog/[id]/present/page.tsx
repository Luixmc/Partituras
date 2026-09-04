import { notFound } from "next/navigation";

import PresentationView from "@/components/services/PresentationView";
import { createClient } from "@/lib/supabase/server";
import { puedeVerLetras } from "@/lib/letras";
import { melodiasDe } from "@/lib/melodiaBase";
import { puedeVerMelodia } from "@/lib/melodia";
import { buscarCanciones, filtrosAQuery, type FiltrosCatalogo } from "@/lib/catalogo";
import type { PresentSong } from "@/types";

/**
 * Una canción del catálogo a pantalla completa, con el mismo visor que los
 * cultos (O-11).
 *
 * Se le pasa TODA la lista que el músico estaba viendo —respetando su filtro de
 * categoría y su búsqueda— y se empieza en la canción que abrió, para que las
 * flechas y el deslizar lleven a la siguiente de ESA lista y no del catálogo
 * entero (O-16, D-15).
 */
export default async function SongPresentPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<FiltrosCatalogo>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const supabase = await createClient();

  // 🔴 Si se viene DE UN CULTO, la lista es su repertorio y no el catálogo:
  // tocando en un servicio, «la siguiente» tiene que ser la siguiente del
  // culto (O-33). Si no, la misma consulta que el catálogo, con sus filtros.
  const cultoId = typeof searchParams.culto === "string" ? searchParams.culto : null;

  let lista: { id: string }[] = [];
  if (cultoId) {
    const { data: repertorio } = await supabase
      .from("service_songs")
      .select("sheet_id, position")
      .eq("service_id", cultoId)
      .order("position");
    lista = (repertorio ?? []).map((r) => ({ id: r.sheet_id as string }));
  }
  if (!lista.length) lista = await buscarCanciones(supabase, searchParams);

  const posicion = lista.findIndex((c) => c.id === params.id);

  // El contenido de acordes no viene en la lista del catálogo (se dejó de pedir
  // en O-05 para aligerarla), así que se trae aparte solo el de estas canciones.
  const ids = posicion >= 0 ? lista.map((c) => c.id) : [params.id];
  const { data: contenidos } = await supabase
    .from("sheets")
    .select("id, title, composer, key_signature, content, editor_type, lyrics")
    .in("id", ids);

  if (!contenidos?.length) notFound();

  const porId = new Map(contenidos.map((c: any) => [c.id, c]));

  // Se respeta el orden de la lista del catálogo (por título).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };
  const verLetras = puedeVerLetras(perfil?.role);

  const songs: PresentSong[] = ids
    .map((id) => porId.get(id))
    .filter(Boolean)
    .map((c: any) => ({
      id:           c.id,
      title:        c.title,
      composer:     c.composer ?? null,
      // Sin tono de destino: se presenta en su tonalidad y el músico la mueve
      // con los botones de ± si le hace falta.
      original_key: c.key_signature ?? null,
      target_key:   null,
      content:      c.content ?? null,
      editor_type:  c.editor_type,
      // La letra solo viaja si a este rol le toca verla (ROLES_LETRAS).
      lyrics:       verLetras ? c.lyrics ?? null : null,
    }));

  // La melodia se pide APARTE, y solo a quien le toca verla (ROLES_MELODIA).
  // 🔴 Igual que en la pantalla del culto: meterla en el `select` de arriba
  // haria fallar la consulta entera mientras la columna no exista, y la
  // pantalla saldria vacia. Ver `lib/melodiaBase.ts`.
  if (puedeVerMelodia(perfil?.role)) {
    const melodias = await melodiasDe(supabase, songs.map((s) => s.id));
    for (const cancion of songs) cancion.melody = melodias.get(cancion.id) ?? null;
  }

  const inicio = Math.max(0, songs.findIndex((s) => s.id === params.id));
  if (!songs.length) notFound();

  return (
    <PresentationView
      title={songs[inicio]?.title ?? ""}
      songs={songs}
      startIndex={inicio}
      backHref={`/catalog/${params.id}${cultoId ? `?culto=${cultoId}` : filtrosAQuery(searchParams)}`}
      // Al salir se vuelve a la canción que se está viendo, no a la de entrada
      // (O-40). El sufijo es el mismo: el culto si se vino de uno, y si no el
      // filtro del catálogo, para que «la siguiente» siga respetándolo (D-15).
      volverPorCancion={{
        base: "/catalog",
        sufijo: cultoId ? `?culto=${cultoId}` : filtrosAQuery(searchParams),
      }}
    />
  );
}
