// Búsqueda de canciones del catálogo, con sus filtros.
//
// Vive aquí porque la usan DOS pantallas y tienen que devolver exactamente la
// misma lista, en el mismo orden: el catálogo (`/catalog`) y la pantalla
// completa de una canción (`/catalog/[id]/present`), que necesita saber cuál es
// «la siguiente» dentro de lo que el músico estaba viendo (O-16, D-15).
// Si cada una tuviera su copia de la consulta, con el tiempo se separarían y
// «la siguiente» dejaría de coincidir con lo que se ve en la lista.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryBadge, SheetCatalogItem } from "@/types";

/** Los filtros que viajan por la dirección web. */
export interface FiltrosCatalogo {
  q?: string;
  categories?: string;
  /** Nombre antiguo del parámetro, cuando solo se podía elegir una categoría. */
  category?: string;
  /** Estado de la canción. **Solo lo usan los administradores** (O-28). */
  estado?: string;
  /** De qué culto se viene, si se llegó desde uno (O-33). NO es un filtro
      del catálogo: no entra en la consulta ni en `filtrosAQuery`; sirve para
      saber que la lista de «la siguiente» es el repertorio de ese culto. */
  culto?: string;
}

/** Los tres estados que admite la base (`sheet_status`, migración 20240001). */
export const ESTADOS = [
  { valor: "published", nombre: "Publicado" },
  { valor: "draft",     nombre: "Borrador" },
  { valor: "archived",  nombre: "Archivado" },
] as const;

/** El estado pedido, si es uno de los tres de verdad. */
export function estadoElegido(filtros: FiltrosCatalogo): string | null {
  const v = filtros.estado;
  return v && ESTADOS.some((e) => e.valor === v) ? v : null;
}

/** Convierte los filtros en el texto que va detrás de la "?" (sin la "?"). */
export function filtrosAQuery(filtros: FiltrosCatalogo): string {
  const p = new URLSearchParams();
  if (filtros.q) p.set("q", filtros.q);
  const cats = filtros.categories ?? filtros.category;
  if (cats) p.set("categories", cats);
  const est = estadoElegido(filtros);
  if (est) p.set("estado", est);
  const texto = p.toString();
  return texto ? `?${texto}` : "";
}

/** Categorías elegidas, validando que sean identificadores de verdad. */
export function categoriasElegidas(filtros: FiltrosCatalogo): string[] {
  // Se validan para poder usarlas sin miedo dentro del filtro `in()`.
  const UUID_RE = /^[0-9a-fA-F-]{36}$/;
  const crudo = filtros.categories ?? filtros.category ?? "";
  return crudo
    ? crudo.split(",").map((s) => s.trim()).filter((s) => UUID_RE.test(s))
    : [];
}

// Campos que necesita la tarjeta del catálogo. No se pide `content`: la tarjeta
// dejó de enseñar la miniatura de acordes (O-05) y ese texto era lo que obligaba
// a limitar la lista. Tampoco `hymn_number`: Isaac no lo quiere ver en ningún
// sitio (D-16), así que ni se muestra ni se busca por él.
const CAMPOS =
  "id, title, composer, key_signature, time_signature, editor_type, status, " +
  "thumbnail_path, drive_file_id, page_count, created_at, " +
  "category:categories!category_id(name, color, icon), " +
  "sheet_categories(category:categories(name, color))";

/**
 * Devuelve las canciones del catálogo que cumplen los filtros, ordenadas por
 * título. Sin tope: salen todas (O-10).
 */
export async function buscarCanciones(
  supabase: SupabaseClient,
  filtros: FiltrosCatalogo
): Promise<SheetCatalogItem[]> {
  const seleccionadas = categoriasElegidas(filtros);

  let consulta = supabase.from("sheets").select(CAMPOS).order("title", { ascending: true });

  // Filtro por estado (O-28). Solo la pantalla se lo pasa cuando quien mira es
  // administrador; y aunque alguien lo escribiera a mano en la dirección, no
  // vería nada nuevo: las políticas de la base ya le esconden los borradores.
  const estado = estadoElegido(filtros);
  if (estado) consulta = consulta.eq("status", estado);

  if (seleccionadas.length) {
    // Una canción entra si su categoría principal está elegida O si está
    // vinculada a alguna de ellas en la tabla de unión (varias categorías).
    const { data: enlaces } = await supabase
      .from("sheet_categories")
      .select("sheet_id")
      .in("category_id", seleccionadas);
    const vinculadas = Array.from(new Set((enlaces ?? []).map((l) => l.sheet_id as string)));

    const partes = [`category_id.in.(${seleccionadas.join(",")})`];
    if (vinculadas.length) partes.push(`id.in.(${vinculadas.join(",")})`);
    consulta = consulta.or(partes.join(","));
  }

  if (filtros.q) {
    // Se sanea la búsqueda: las comas y paréntesis rompen la sintaxis del filtro
    // `.or()`, y % y _ son comodines. Se neutralizan.
    const seguro = filtros.q
      .replace(/[,()]/g, " ")
      .replace(/[%_]/g, "\\$&")
      .trim();
    if (seguro) {
      // También por LETRA (J.3). Es la pregunta que más se hace en un grupo
      // de alabanza: «¿cómo se llama la que dice...?». La columna `lyrics`
      // existía desde la primera migración y no la usaba nadie.
      //
      // Se usa `ilike` y no el índice de texto completo a propósito: con 75
      // canciones la diferencia no se nota, y `ilike` encuentra trozos de
      // palabra —«naveg» encuentra «navegaré»—, que es como se busca cuando
      // uno se acuerda a medias de una frase.
      consulta = consulta.or(
        `title.ilike.%${seguro}%,composer.ilike.%${seguro}%,lyrics.ilike.%${seguro}%`
      );
    }
  }

  const { data } = await consulta;

  return (data ?? []).map((cancion: any) => {
    // Todas las categorías, con la principal delante y sin repetir.
    const principal: CategoryBadge | null = cancion.category
      ? { name: cancion.category.name, color: cancion.category.color }
      : null;
    const resto: CategoryBadge[] = (cancion.sheet_categories ?? [])
      .map((fila: any) => fila.category)
      .filter((c: any) => c && c.name !== principal?.name)
      .map((c: any) => ({ name: c.name as string, color: c.color as string }))
      .sort((a: CategoryBadge, b: CategoryBadge) => a.name.localeCompare(b.name, "es"));

    return {
      ...cancion,
      categories: principal ? [principal, ...resto] : resto,
      category_name: cancion.category?.name ?? null,
      category_color: cancion.category?.color ?? null,
      category_icon: cancion.category?.icon ?? null,
      tags: null,
      created_by_name: null,
      published_at: null,
    };
  }) as SheetCatalogItem[];
}
