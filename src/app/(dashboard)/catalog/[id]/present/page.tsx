import { notFound } from "next/navigation";

import PresentationView from "@/components/services/PresentationView";
import { createClient } from "@/lib/supabase/server";
import type { PresentSong } from "@/types";

/**
 * Una canción suelta a pantalla completa, con el mismo visor que los cultos
 * (O-11). PresentationView recibe una LISTA de canciones: aquí se le pasa una
 * sola, así que las flechas y el deslizar no llevan a ninguna parte, pero el
 * resto —pantalla completa, columnas, tamaño, transposición en vivo— funciona
 * igual que en el culto.
 */
export default async function SongPresentPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: sheet } = await supabase
    .from("sheets")
    .select("title, composer, key_signature, content, editor_type")
    .eq("id", params.id)
    .single();

  if (!sheet) notFound();

  // Sin tono de destino: se presenta en su tonalidad original y el músico la
  // mueve con los botones de ± si le hace falta.
  const song: PresentSong = {
    id:           params.id,
    title:        sheet.title,
    composer:     sheet.composer ?? null,
    original_key: sheet.key_signature ?? null,
    target_key:   null,
    content:      sheet.content ?? null,
    editor_type:  sheet.editor_type,
  };

  return (
    <PresentationView
      title={sheet.title}
      songs={[song]}
      backHref={`/catalog/${params.id}`}
    />
  );
}
