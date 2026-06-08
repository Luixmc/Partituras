"use server";

import { revalidatePath } from "next/cache";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

export type ActionResult = { ok: boolean; error?: string; message?: string };

const ROLES: UserRole[] = ["admin", "musician", "viewer"];

/** Verifica que quien llama sea admin. Devuelve su id. */
async function requireAdmin(): Promise<string> {
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
  return user.id;
}

function fail(error: unknown): ActionResult {
  return { ok: false, error: error instanceof Error ? error.message : "Error inesperado." };
}

/** Crea un usuario (email + contraseña) y le asigna nombre y rol. */
export async function createUserAction(input: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
}): Promise<ActionResult> {
  try {
    await requireAdmin();

    const email = input.email.trim().toLowerCase();
    const firstName = input.firstName.trim();
    if (!email) throw new Error("El email es obligatorio.");
    if (!firstName) throw new Error("El nombre es obligatorio.");
    if (input.password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
    if (!ROLES.includes(input.role)) throw new Error("Rol no válido.");

    const admin = await createAdminClient();

    // Crea el usuario ya confirmado para que pueda iniciar sesión de inmediato.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { first_name: firstName },
    });
    if (error) throw error;
    const newId = data.user?.id;
    if (!newId) throw new Error("No se pudo crear el usuario.");

    // El trigger handle_new_user ya creó el perfil (rol viewer); ajustamos datos.
    const { error: pErr } = await admin
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: input.lastName?.trim() || null,
        role: input.role,
        email,
      })
      .eq("id", newId);
    if (pErr) throw pErr;

    revalidatePath("/admin");
    return { ok: true, message: `Usuario ${email} creado.` };
  } catch (e) {
    return fail(e);
  }
}

/** Cambia la contraseña de un usuario. */
export async function setPasswordAction(userId: string, password: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");

    const admin = await createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) throw error;

    return { ok: true, message: "Contraseña actualizada." };
  } catch (e) {
    return fail(e);
  }
}

/** Cambia el rol de un usuario. No permite que el admin se quite su propio rol. */
export async function setRoleAction(userId: string, role: UserRole): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin();
    if (!ROLES.includes(role)) throw new Error("Rol no válido.");
    if (userId === adminId && role !== "admin") {
      throw new Error("No puedes quitarte tu propio rol de administrador.");
    }

    const admin = await createAdminClient();
    const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
    if (error) throw error;

    revalidatePath("/admin");
    return { ok: true, message: "Rol actualizado." };
  } catch (e) {
    return fail(e);
  }
}

/** Activa o desactiva un usuario (no permite desactivarse a sí mismo). */
export async function setActiveAction(userId: string, active: boolean): Promise<ActionResult> {
  try {
    const adminId = await requireAdmin();
    if (userId === adminId && !active) {
      throw new Error("No puedes desactivar tu propia cuenta.");
    }

    const admin = await createAdminClient();
    const { error } = await admin.from("profiles").update({ active }).eq("id", userId);
    if (error) throw error;

    revalidatePath("/admin");
    return { ok: true, message: active ? "Usuario activado." : "Usuario desactivado." };
  } catch (e) {
    return fail(e);
  }
}
