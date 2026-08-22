// ─────────────────────────────────────────────────────────────
// El ESTADO de un culto, en un solo sitio (O-31).
//
// Isaac, el 2026-08-21: «que sea como las canciones, que yo puedo crear una,
// pero por ejemplo si está en archivado o borrador que no lo pueda ver ni el
// lector ni el músico, solamente el admin, y ya si está público que lo puedan
// ver los otros dos roles».
//
// Son LOS MISMOS tres estados de las canciones (`sheet_status`), no un invento
// nuevo (D-23). Y no tiene nada que ver con `is_public`, que es otra cosa: el
// enlace para quien NO tiene cuenta (migración 013). Un culto puede estar
// publicado y sin enlace, o al revés — aunque lo segundo, tras la migración,
// deja de servir de nada: la base ya no le enseña un borrador a nadie.
//
// 🔴 `estadoDe` devuelve `published` cuando la columna no viene. NO es una
// tolerancia perezosa: es la regla de T-07. Primero se publica el código y
// DESPUÉS se toca la base, así que hay un rato en el que producción ejecuta
// esto contra una tabla que todavía no tiene la columna. Si en ese rato un
// culto sin `status` contara como borrador, **los 3 cultos reales
// desaparecerían** de la vista de los músicos, sin error y sin aviso.
// ─────────────────────────────────────────────────────────────

import type { SheetStatus } from "@/types";

/** Los tres estados, con su etiqueta. **Solo se le enseñan al admin** (O-32). */
export const ESTADO_CULTO: Record<SheetStatus, { label: string; className: string }> = {
  published: { label: "Publicado", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  draft:     { label: "Borrador",  className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  archived:  { label: "Archivado", className: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
};

export const ESTADOS_CULTO: SheetStatus[] = ["draft", "published", "archived"];

/** El estado de un culto. Lo que no se reconoce cuenta como publicado (ver arriba). */
export function estadoDe(culto: { status?: string | null } | null | undefined): SheetStatus {
  const v = culto?.status;
  return v === "draft" || v === "archived" ? v : "published";
}

/**
 * ¿Este culto lo puede ver quien está mirando?
 *
 * El admin lo ve todo; los demás, solo lo publicado. Es la misma regla que la
 * de las canciones, y **también está escrita en la base** (D-25): esto de aquí
 * es para que la pantalla no enseñe una tarjeta que luego no abre, no es el
 * permiso. La interfaz nunca es el permiso (L-87).
 */
export function puedeVerCulto(
  culto: { status?: string | null } | null | undefined,
  esAdmin: boolean
): boolean {
  return esAdmin || estadoDe(culto) === "published";
}
