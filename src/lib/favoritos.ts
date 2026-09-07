// ─────────────────────────────────────────────────────────────
// Los favoritos de CADA músico (O-73).
//
// Isaac, 2026-09-05, al elegir por dónde empezar de las tres del roadmap:
// «pienso que primero sería la de favoritos, y que sean para cada músico».
//
// 🔴 LA TABLA YA EXISTÍA, y se COMPROBÓ contra la base antes de escribir una
// línea — porque T-01 avisa de que las migraciones del repositorio no son la
// verdad de la base. Esta vez sí lo eran:
//
//   · leer los míos con sesión ......... 200
//   · guardar un favorito mío .......... la política deja
//   · guardar uno A NOMBRE DE OTRO ..... 403 · 42501, bloqueado
//
// Esa última línea es la que hace que esto sea «de cada músico» **de verdad**:
// no lo impide la pantalla, lo impide la base. Un músico no puede meter
// favoritos en la cuenta de otro ni llamando a la API directamente.
//
// 📌 Y por eso los favoritos son lo único aprobado que NO está bloqueado por el
// primo: no hace falta migración.
// ─────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Los identificadores de las canciones que este usuario tiene marcadas.
 *
 * Devuelve un `Set` porque quien lo usa solo pregunta «¿está esta?» una vez por
 * tarjeta: con 72 canciones en pantalla, buscar en una lista sería 72 recorridos.
 *
 * ⚠️ **Sin sesión devuelve un conjunto vacío, no un error.** El catálogo lo
 * pinta igual para quien no ha entrado; simplemente no hay corazones marcados.
 */
export async function misFavoritos(supabase: SupabaseClient): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  // No hace falta filtrar por usuario: la política de la base ya devuelve
  // SOLO las filas propias (`user_id = auth.uid()`). Se deja el filtro de todas
  // formas porque el día que alguien mire esta consulta suelta, tiene que
  // entenderse sin ir a leer las políticas.
  const { data } = await supabase.from("favorites").select("sheet_id").eq("user_id", user.id);
  return new Set((data ?? []).map((f: { sheet_id: string }) => f.sheet_id));
}
