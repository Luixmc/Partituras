// ─────────────────────────────────────────────────────────────
// Las NOTAS PRIVADAS de cada músico en una canción (O-74, opción D).
//
// Isaac, 2026-09-07, eligiendo qué debe poder hacer un músico que un lector
// no: «las notas privadas». Son las suyas —«yo la toco en G», «entro en el
// segundo compás», «aquí subo una octava»— y no las ve nadie más.
//
// Y el 2026-09-10 decidió los detalles:
//   · QUIÉN: el músico y el administrador. El lector no.
//   · DÓNDE: se escriben en la ficha de la canción y salen a pantalla
//     completa y en los cultos, como un aviso pequeño arriba.
//
// 🔴 QUE SEAN PRIVADAS NO LO DECIDE ESTE ARCHIVO: lo decide la BASE. La tabla
// `notas_musico` (migración 20240022) solo deja leer y escribir las propias
// —`user_id = auth.uid()`—, y **el administrador tampoco ve las de otros**.
// Aquí solo se decide quién ve el recuadro (L-87: la interfaz no es un
// permiso).
//
// Vive en `lib/` y sin Supabase para que lo cubra el CI; lo que habla con la
// base está en `lib/notasBase.ts`.
// ─────────────────────────────────────────────────────────────

import type { UserRole } from "@/types";

/** Quién tiene notas propias. Un solo interruptor, como `ROLES_LETRAS`. */
export const ROLES_NOTAS: UserRole[] = ["admin", "musician"];

export function puedeTenerNotas(rol: UserRole | null | undefined): boolean {
  return Boolean(rol && ROLES_NOTAS.includes(rol));
}

/**
 * Hasta dónde se guarda. Es una nota para leer tocando, no un diario: con
 * 1.000 caracteres caben de sobra varias indicaciones, y un pegado sin querer
 * de algo enorme no llena la pantalla del culto.
 */
export const LARGO_MAXIMO_NOTA = 1000;

/**
 * La nota tal como se guarda: saltos de línea de un solo tipo, sin espacios
 * sobrantes al principio ni al final, y cortada al máximo.
 *
 * 📌 No toca lo de dentro —ni mayúsculas, ni signos—: es SU texto.
 */
export function limpiarNota(texto: string | null | undefined): string {
  return (texto ?? "").replace(/\r\n?/g, "\n").trim().slice(0, LARGO_MAXIMO_NOTA);
}

/** Una nota vacía no se guarda: se BORRA la fila, para no dejar filas en blanco. */
export function notaVacia(texto: string | null | undefined): boolean {
  return limpiarNota(texto) === "";
}
