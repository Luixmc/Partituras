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
import { algunoContiene } from "@/lib/texto";
import { misFavoritos } from "@/lib/favoritos";

/** Los filtros que viajan por la dirección web. */
export interface FiltrosCatalogo {
  q?: string;
  categories?: string;
  /** Nombre antiguo del parámetro, cuando solo se podía elegir una categoría. */
  category?: string;
  /** Estado de la canción. **Solo lo usan los administradores** (O-28). */
  estado?: string;
  /** «1» para ver SOLO los favoritos de quien mira (O-73). */
  favoritos?: string;
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
  if (filtros.favoritos === "1") p.set("favoritos", "1");
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
  "sheet_categories(category:categories(name, color)), " +
  // Las versiones en otras tonalidades (O-48). Son 7 filas en toda la base,
  // asi que traerlas no cuesta nada — y evita una segunda consulta por tarjeta,
  // que con 75 canciones si se notaria.
  "sheet_keys(key_signature)";

// 🔴 La LETRA solo se pide cuando hay algo escrito en la busqueda (O-72).
//
// Antes la letra no se traia nunca: la buscaba la base con `ilike`. Ahora el
// filtro se hace aqui, asi que hace falta tenerla — pero **solo entonces**.
// Medido: las 72 canciones con sus letras son **39 KB**, y sin ellas **7 KB**.
// Cargar el catalogo sin buscar nada es lo que se hace el 90 % de las veces, y
// esa sigue costando 7 KB.
const CAMPOS_CON_LETRA = CAMPOS + ", lyrics";

/**
 * Devuelve las canciones del catálogo que cumplen los filtros, ordenadas por
 * título. Sin tope: salen todas (O-10).
 */
export async function buscarCanciones(
  supabase: SupabaseClient,
  filtros: FiltrosCatalogo
): Promise<SheetCatalogItem[]> {
  const seleccionadas = categoriasElegidas(filtros);

  const hayBusqueda = Boolean((filtros.q ?? "").trim());
  let consulta = supabase
    .from("sheets")
    .select(hayBusqueda ? CAMPOS_CON_LETRA : CAMPOS)
    .order("title", { ascending: true });

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

  // 🔴 LA BUSQUEDA POR TEXTO YA NO LA HACE LA BASE (O-72), y el motivo es
  // concreto: `ilike` **no ignora las tildes**, y **23 de los 72 titulos llevan
  // tilde o ñ**. Isaac lo pidio asi: «que las canciones con tildes me aparezcan
  // buscandolo asi sea sin tilde».
  //
  // Para que lo hiciera la base haria falta la extension `unaccent`, que es una
  // MIGRACION — y hoy no hay via para aplicarlas (§9.1). Asi que se filtra abajo,
  // en el servidor, sobre lo que la consulta devuelve.
  //
  // 📌 **A este tamaño sale barato, y esta MEDIDO: 39 KB** las 72 canciones con
  // sus letras (7 KB sin ellas). Y no es una idea nueva: el codigo ya decia que
  // «con 75 canciones la diferencia no se nota». Cambia DONDE se filtra, no la
  // idea. El dia que haya acceso a la base, esto se mueve alli sin que cambie
  // nada de lo que ve nadie.
  //
  // ⚠️ Los demas filtros —categoria y estado— **siguen en la base**: esos si
  // recortan filas de verdad y no tienen problema de tildes.

  const { data } = await consulta;

  // Aqui se aplica la busqueda, sin tildes y sin mayusculas: titulo, autor y
  // LETRA (J.3) — «¿como se llama la que dice...?» es lo que mas se pregunta.
  // Los favoritos de quien mira, solo si se han pedido: con el filtro apagado
  // no se hace ni una consulta de mas.
  const soloFavoritos = filtros.favoritos === "1";
  const favoritos = soloFavoritos ? await misFavoritos(supabase) : null;

  const filtradas = (data ?? []).filter((cancion) => {
    const c = cancion as unknown as { id: string; title?: string; composer?: string | null; lyrics?: string | null };
    if (favoritos && !favoritos.has(c.id)) return false;
    return algunoContiene([c.title, c.composer, c.lyrics], filtros.q ?? "");
  });

  return filtradas.map((cancion: any) => {
    // Todas las categorías, con la principal delante y sin repetir.
    const principal: CategoryBadge | null = cancion.category
      ? { name: cancion.category.name, color: cancion.category.color }
      : null;
    const resto: CategoryBadge[] = (cancion.sheet_categories ?? [])
      .map((fila: any) => fila.category)
      .filter((c: any) => c && c.name !== principal?.name)
      .map((c: any) => ({ name: c.name as string, color: c.color as string }))
      .sort((a: CategoryBadge, b: CategoryBadge) => a.name.localeCompare(b.name, "es"));

    // Las otras tonalidades en las que existe la canción (O-48). Se quita la
    // que ya es la original: repetirla al lado no dice nada, y lo que él pidió
    // fue **distinguir** cuál es la original de las demás.
    const otrosTonos: string[] = Array.from(
      new Set(
        (cancion.sheet_keys ?? [])
          .map((k: any) => k?.key_signature)
          .filter((k: any): k is string => typeof k === "string" && k !== cancion.key_signature)
      )
    );

    return {
      ...cancion,
      otros_tonos: otrosTonos,
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
