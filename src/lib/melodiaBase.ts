// ─────────────────────────────────────────────────────────────
// Leer la MELODÍA de la base, sin poder romper nada (O-57 · R.4).
//
// 🔴 POR QUÉ ESTO ES UNA CONSULTA APARTE Y NO UNA COLUMNA MÁS DEL `select`:
//
// La letra viaja **dentro** de la consulta de la pantalla del culto
// (`sheet:sheets(…, lyrics)`). Meter ahí `melody` mientras la columna no exista
// haría **fallar la consulta entera**, y entonces el culto sale **VACÍO en
// mitad del servicio** — sin error visible, sin nada que leer. Es exactamente
// el catálogo en blanco de los 3 minutos (T-07), pero en la pantalla que se usa
// tocando.
//
// → Se pide aparte, y si la columna no está, **no hay melodías y punto**. Que
// es la verdad, y deja el resto de la pantalla intacto.
//
// 📌 Y por qué el coste es aceptable, que es la otra mitad de la decisión:
// esto es **una consulta, en una pantalla**, y solo para quien puede ver la
// melodía. No es el middleware — allí un viaje a la base cuesta lo mismo en
// cada clic de cada persona, y por eso tumbó la página (T-17).
//
// ⚠️ Vive aquí y no en `lib/melodia.ts` a propósito: aquel es **lógica pura** y
// lo compilan las pruebas del CI con `tsc` a secas. En cuanto importara el
// cliente de Supabase dejaría de compilar ahí — es la misma razón por la que
// `catalogo.ts` nunca entró en esa lista.
// ─────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Lo que hace falta para LEER y OÍR la melodía de una canción.
 *
 * 📌 El compás y el tempo viajan aquí, con la melodía, porque solo hacen falta
 * cuando la hay (O-75, fase 2): el compás para dibujarla bien —antes la
 * presentación la dibujaba **siempre en 4/4**, también las de 6/8 y 2/2— y
 * para el metrónomo; el tempo, para que el reproductor arranque en el suyo.
 */
export type MelodiaDeCancion = { melodia: string; compas: string | null; tempo: number | null };

/**
 * La melodía de estas canciones, por id.
 *
 * Devuelve un mapa vacío si la columna todavía no existe, si no hay ids, o si
 * la consulta falla por lo que sea. **Nunca lanza**: una pantalla de culto no
 * puede caerse porque falte una función que casi nadie usa aún.
 */
export async function melodiasDe(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, MelodiaDeCancion>> {
  const unicos = [...new Set(ids.filter(Boolean))];
  if (!unicos.length) return new Map();

  try {
    const { data, error } = await supabase
      .from("sheets")
      .select("id, melody, time_signature, tempo")
      .in("id", unicos)
      .not("melody", "is", null);

    // `42703` = «esa columna no existe». Cualquier otro error se trata igual:
    // sin melodías, que es como se ha visto la pantalla toda la vida.
    if (error || !data) return new Map();

    type Fila = { id: string; melody: string | null; time_signature: string | null; tempo: number | null };
    return new Map(
      (data as Fila[])
        .filter((f) => f.melody)
        .map((f) => [f.id, { melodia: f.melody as string, compas: f.time_signature, tempo: f.tempo }])
    );
  } catch {
    return new Map();
  }
}

/** Le pone a cada canción su melodía, su compás y su tempo (si tiene melodía). */
export function ponerMelodias(
  canciones: { id: string; melody?: string | null; time_signature?: string | null; tempo?: number | null }[],
  melodias: Map<string, MelodiaDeCancion>
): void {
  for (const cancion of canciones) {
    const m = melodias.get(cancion.id);
    cancion.melody = m?.melodia ?? null;
    cancion.time_signature = m?.compas ?? null;
    cancion.tempo = m?.tempo ?? null;
  }
}
