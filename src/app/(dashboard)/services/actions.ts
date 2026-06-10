"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ServiceType } from "@/types";

export type ActionResult = { ok: boolean; error?: string; message?: string; id?: string };

const SERVICE_TYPES: ServiceType[] = ["viernes", "domingo", "ayuno", "santa_cena", "otro"];

export interface ServiceInput {
  name:         string;
  service_type: ServiceType;
  service_date: string | null;          // YYYY-MM-DD o null
  notes:        string | null;
  songs: {
    sheet_id:     string;
    key_override: string | null;
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

  // De-duplica canciones conservando el primer orden y reasigna position.
  const seen = new Set<string>();
  const songs = (input.songs ?? [])
    .filter((s) => s.sheet_id && !seen.has(s.sheet_id) && seen.add(s.sheet_id))
    .map((s, i) => ({
      sheet_id:     s.sheet_id,
      position:     i,
      key_override: s.key_override?.trim() || null,
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

/** Reescribe la lista ordenada de canciones de un culto. */
async function replaceSongs(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  serviceId: string,
  songs: ReturnType<typeof cleanInput>["songs"]
) {
  const { error: delErr } = await supabase
    .from("service_songs")
    .delete()
    .eq("service_id", serviceId);
  if (delErr) throw delErr;

  if (songs.length) {
    const rows = songs.map((s) => ({ service_id: serviceId, ...s }));
    const { error: insErr } = await supabase.from("service_songs").insert(rows);
    if (insErr) throw insErr;
  }
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
