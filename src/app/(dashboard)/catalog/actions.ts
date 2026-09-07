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
