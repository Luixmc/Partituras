"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ServiceType, SheetStatus } from "@/types";

export type ActionResult = { ok: boolean; error?: string; message?: string; id?: string };

const SERVICE_TYPES: ServiceType[] = ["viernes", "domingo", "ayuno", "santa_cena", "otro"];

const ESTADOS: SheetStatus[] = ["draft", "published", "archived"];

const MENSAJE_ESTADO: Record<SheetStatus, string> = {
  draft:     "Culto en borrador: solo lo ves tú.",
  published: "Culto publicado: ya lo ven los músicos.",
  archived:  "Culto archivado: deja de verlo todo el mundo menos tú.",
};

export interface ServiceInput {
  name:         string;
  service_type: ServiceType;
  service_date: string | null;          // YYYY-MM-DD o null
  notes:        string | null;
  songs: {
    sheet_id:     string;
    key_override: string | null;
    sheet_key_id: string | null;
    note:         string | null;
  }[];
}

/** Verifica sesión + rol admin. Devuelve el cliente y el id del usuario. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("No tienes permisos de administrador.");
  return { supabase, userId: user.id };
}

function fail(error: unknown): ActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "Error inesperado." };
}

/** Normaliza y valida los campos comunes del culto. */
function cleanInput(input: ServiceInput) {
  const name = input.name.trim();
  if (!name) throw new Error("El nombre del culto es obligatorio.");
  if (!SERVICE_TYPES.includes(input.service_type)) throw new Error("Tipo de culto no válido.");

  const service_date = input.service_date && input.service_date.trim() ? input.service_date : null;

  // Se conserva el orden y se renumera la posición. Ya NO se quitan las
  // repetidas: una misma canción puede ir varias veces en el culto (O-09), y
  // cada aparición lleva su propio tono y su propia nota. Antes se borraban en
  // silencio, sin avisar de nada.
  const songs = (input.songs ?? [])
    .filter((s) => s.sheet_id)
    .map((s, i) => ({
      sheet_id:     s.sheet_id,
      position:     i,
      sheet_key_id: s.sheet_key_id || null,
      // Versión guardada y override son mutuamente excluyentes.
      key_override: s.sheet_key_id ? null : s.key_override?.trim() || null,
      note:         s.note?.trim() || null,
    }));

  return {
    name,
    service_type: input.service_type,
    service_date,
    notes: input.notes?.trim() || null,
    songs,
  };
}

/**
 * Reescribe la lista ordenada de canciones de un culto.
 *
 * 🔴 Va por una FUNCIÓN DE LA BASE, y no borrando e insertando desde aquí, por
 * una razón que no se puede resolver en TypeScript: borrar e insertar son
 * **dos peticiones distintas**, y entre una y otra el culto está vacío. Si la
 * segunda fallaba —la conexión que se cae, el móvil que pierde cobertura
 * mientras se guarda— el repertorio se perdía y no había vuelta atrás (P-04).
 *
 * Dentro de la base eso sale gratis: la función corre en UNA transacción, así
 * que si el insert falla, el borrado se deshace solo.
 *
 * 📌 Aquí hubo un respaldo —el borrar-e-insertar de siempre— para que publicar
 * el código no rompiera nada mientras la migración `20240018` esperaba
 * permiso. **Se quitó el 2026-08-28**, con la función ya seis días en pie.
 * Estaba anotado con dueño y fecha a propósito: un respaldo temporal sin dueño
 * se queda para siempre.
 */
async function replaceSongs(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  serviceId: string,
  songs: ReturnType<typeof cleanInput>["songs"]
) {
  const { error } = await supabase.rpc("reemplazar_canciones_culto", {
    p_service_id: serviceId,
    p_canciones: songs,
  });
  if (error) throw error;
}

/** Crea un culto con su lista de canciones. */
export async function createServiceAction(input: ServiceInput): Promise<ActionResult> {
  try {
    const { supabase, userId } = await requireAdmin();
    const data = cleanInput(input);

    const { data: created, error } = await supabase
      .from("services")
      .insert({
        name: data.name,
        service_type: data.service_type,
        service_date: data.service_date,
        notes: data.notes,
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw error;

    await replaceSongs(supabase, created.id, data.songs);

    revalidatePath("/services");
    return { ok: true, id: created.id, message: "Culto creado." };
  } catch (e) {
    return fail(e);
  }
}

/** Actualiza los datos y la lista de canciones de un culto. */
export async function updateServiceAction(id: string, input: ServiceInput): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = cleanInput(input);

    const { error } = await supabase
      .from("services")
      .update({
        name: data.name,
        service_type: data.service_type,
        service_date: data.service_date,
        notes: data.notes,
      })
      .eq("id", id);
    if (error) throw error;

    await replaceSongs(supabase, id, data.songs);

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);
    return { ok: true, id, message: "Culto actualizado." };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Cambia el estado de un culto: borrador · publicado · archivado (O-31).
 *
 * Va en su propia acción, como el enlace público, y NO dentro de «guardar»:
 * publicar un culto es una decisión aparte de corregirle el nombre o mover una
 * canción de sitio, y meterla en el mismo botón haría que se publicara sin
 * querer al retocar cualquier otra cosa.
 *
 * 🔴 El estado NO se toca al crear (`createServiceAction` no lo manda): lo pone
 * el defecto de la columna, que es `draft`. Un culto nace en borrador y se
 * publica cuando está armado — que es justo lo que Isaac describió.
 */
export async function setServiceStatusAction(
  id: string,
  status: SheetStatus
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!ESTADOS.includes(status)) throw new Error("Estado no válido.");

    const { error } = await supabase.from("services").update({ status }).eq("id", id);
    if (error) throw error;

    revalidatePath("/services");
    revalidatePath(`/services/${id}`);
    return { ok: true, message: MENSAJE_ESTADO[status] };
  } catch (e) {
    return fail(e);
  }
}

/** Activa o desactiva el enlace público de solo lectura de un culto. */
export async function setServiceShareAction(id: string, enabled: boolean): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("services")
      .update({ is_public: enabled })
      .eq("id", id);
    if (error) throw error;

    revalidatePath(`/services/${id}`);
    return { ok: true, message: enabled ? "Enlace público activado." : "Enlace público desactivado." };
  } catch (e) {
    return fail(e);
  }
}

/** Elimina un culto (sus canciones se borran en cascada). */
export async function deleteServiceAction(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/services");
    return { ok: true, message: "Culto eliminado." };
  } catch (e) {
    return fail(e);
  }
}
