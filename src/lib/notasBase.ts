// ─────────────────────────────────────────────────────────────
// Leer y guardar las NOTAS PRIVADAS en la base (O-74).
//
// La tabla es `notas_musico` (migración 20240022, aplicada el 2026-09-10):
// una fila por usuario y canción, clave `(user_id, sheet_id)`, y cuatro
// políticas que dicen lo mismo —`user_id = auth.uid()`—. O sea: **cada uno
// solo lee y escribe las suyas, y el administrador tampoco ve las de otros.**
//
// Separado de `lib/notas.ts` por lo mismo que `melodiaBase.ts` de `melodia.ts`:
// aquel es lógica pura y lo compila el CI con `tsc` a secas; en cuanto
// importara el cliente de Supabase dejaría de compilar ahí.
//
// ⚠️ NINGUNA DE ESTAS FUNCIONES LANZA. Una nota que no carga no puede tumbar
// la ficha de la canción ni la pantalla del culto: se sigue sin nota.
// ─────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";

import { limpiarNota, notaVacia } from "@/lib/notas";

/** La nota de este usuario en esta canción, o "" si no tiene (o no hay sesión). */
export async function leerNota(supabase: SupabaseClient, sheetId: string): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "";
    // El filtro por usuario sobra —la base ya solo devuelve las propias—, pero
    // se deja para que la consulta se entienda sin ir a leer las políticas.
    const { data } = await supabase
      .from("notas_musico")
      .select("nota")
      .eq("user_id", user.id)
      .eq("sheet_id", sheetId)
      .maybeSingle();
    return (data as { nota?: string } | null)?.nota ?? "";
  } catch {
    return "";
  }
}

/**
 * Guarda la nota. Si queda vacía, **borra la fila** en vez de guardar un blanco.
 * @returns `null` si fue bien, o el mensaje de lo que falló (para decírselo)
 */
export async function guardarNota(
  supabase: SupabaseClient,
  sheetId: string,
  texto: string
): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return "No hay sesión: vuelve a entrar.";
    if (notaVacia(texto)) {
      const { error } = await supabase
        .from("notas_musico")
        .delete()
        .eq("user_id", user.id)
        .eq("sheet_id", sheetId);
      return error ? error.message : null;
    }
    const { error } = await supabase.from("notas_musico").upsert(
      { user_id: user.id, sheet_id: sheetId, nota: limpiarNota(texto), updated_at: new Date().toISOString() },
      { onConflict: "user_id,sheet_id" }
    );
    return error ? error.message : null;
  } catch (e) {
    return e instanceof Error ? e.message : "No se pudo guardar.";
  }
}

/**
 * Las notas de este usuario en varias canciones a la vez, por id — para la
 * pantalla completa y los cultos (se lee en el SERVIDOR, con su sesión).
 * Sin sesión, o si algo falla, un mapa vacío: la pantalla sale sin notas.
 */
export async function notasDe(supabase: SupabaseClient, ids: string[]): Promise<Map<string, string>> {
  const unicos = [...new Set(ids.filter(Boolean))];
  if (!unicos.length) return new Map();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new Map();
    const { data, error } = await supabase
      .from("notas_musico")
      .select("sheet_id, nota")
      .eq("user_id", user.id)
      .in("sheet_id", unicos);
    if (error || !data) return new Map();
    return new Map(
      (data as { sheet_id: string; nota: string }[]).filter((f) => f.nota).map((f) => [f.sheet_id, f.nota])
    );
  } catch {
    return new Map();
  }
}
