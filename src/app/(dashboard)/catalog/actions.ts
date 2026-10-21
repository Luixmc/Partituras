"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type ResultadoFavorito = { ok: boolean; favorito: boolean; error?: string };

/**
 * Marca o desmarca una canción como favorita del músico que la pulsa (O-73).
 *
 * 🔴 EL USUARIO NO VIENE DEL NAVEGADOR, se pregunta aquí. Si el identificador
 * viajara en la llamada, cualquiera podría mandar el de otro y meterle
 * favoritos en su cuenta. Se coge de la sesión y punto.
 *
 * 📌 Aun así, **la base también lo impide** —la política solo deja escribir
 * filas con `user_id = auth.uid()`, comprobado con un 403 el 2026-09-07—. Son
 * dos cerrojos, y el que vale es el de la base: la pantalla se puede saltar.
 *
 * @param sheetId La canción
 * @param marcar  `true` para marcarla, `false` para quitarla
 */
export async function alternarFavorito(
  sheetId: string,
  marcar: boolean
): Promise<ResultadoFavorito> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, favorito: !marcar, error: "Hay que entrar para guardar favoritos." };

    if (marcar) {
      // `upsert` y no `insert`: si se pulsa dos veces seguidas —o desde dos
      // pestañas— el segundo daría error de clave repetida, y para el músico
      // eso sería un fallo donde no lo hay. Marcar lo ya marcado no es un error.
      const { error } = await supabase
        .from("favorites")
        .upsert({ user_id: user.id, sheet_id: sheetId }, { onConflict: "user_id,sheet_id" });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("sheet_id", sheetId);
      if (error) throw error;
    }

    // El catálogo se vuelve a pintar con el corazón como quedó.
    revalidatePath("/catalog");
    return { ok: true, favorito: marcar };
  } catch (e) {
    // Se devuelve el estado CONTRARIO al pedido para que el botón vuelva a
    // donde estaba: si falló, el corazón no se puede quedar como si hubiera ido.
    return {
      ok: false,
      favorito: !marcar,
      error: e instanceof Error ? e.message : "No se pudo guardar el favorito.",
    };
  }
}

// ── Eliminar una canción (O-95) ─────────────────────────────

/**
 * Comprueba que quien llama es administrador. Va aquí y no importada de
 * `services/actions.ts` porque en un archivo `"use server"` todo lo que se
 * exporta se puede llamar desde el navegador: exportarla la convertiría en
 * una acción más.
 */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("No tienes permisos de administrador.");
  return supabase;
}

export type ResultadoCultos = { ok: boolean; cultos: string[]; error?: string };

/**
 * Los cultos donde está la canción, por nombre, para que el diálogo de
 * borrar diga de cuáles se va a caer. Se pregunta al ABRIR el diálogo, no al
 * cargar la ficha: así está al día aunque la ficha lleve rato abierta.
 *
 * 📌 Las notas privadas y los favoritos de los músicos también se borran, pero
 * no se pueden contar: la base solo le enseña a cada uno los suyos, también al
 * administrador. El diálogo los nombra sin número.
 */
export async function cultosDeLaCancion(sheetId: string): Promise<ResultadoCultos> {
  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase
      .from("service_songs")
      .select("services(name)")
      .eq("sheet_id", sheetId);
    if (error) throw error;
    const nombres = (data ?? [])
      .map((f) => {
        const s = f.services as { name: string } | { name: string }[] | null;
        return Array.isArray(s) ? s[0]?.name : s?.name;
      })
      .filter((n): n is string => !!n);
    return { ok: true, cultos: [...new Set(nombres)] };
  } catch (e) {
    return { ok: false, cultos: [], error: e instanceof Error ? e.message : "No se pudieron leer los cultos." };
  }
}

export type ResultadoEliminar = { ok: boolean; error?: string };

/**
 * Borra la canción. La base se lleva con ella, en cascada, todo lo que cuelga
 * de `sheets`: su sitio en los cultos, sus versiones por tono, las notas
 * privadas y los favoritos de los músicos y sus categorías. Por eso solo la
 * llama el diálogo que lo dice antes.
 *
 * Isaac, 2026-10-20: si está en un culto, *se deja borrar avisando*.
 *
 * 🔴 Se pide la fila borrada de vuelta (`select`). Si la seguridad de la base
 * no deja borrar, Supabase NO da error: borra cero filas y calla. Sin esto, la
 * página diría «eliminada» y la canción seguiría ahí.
 */
export async function eliminarCancion(sheetId: string): Promise<ResultadoEliminar> {
  try {
    const supabase = await requireAdmin();
    const { data, error } = await supabase.from("sheets").delete().eq("id", sheetId).select("id");
    if (error) throw error;
    if (!data?.length) throw new Error("La base no borró la canción (¿ya no existía, o falta permiso?).");
    revalidatePath("/catalog");
    revalidatePath("/services");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "No se pudo eliminar la canción." };
  }
}
