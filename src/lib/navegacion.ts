// ─────────────────────────────────────────────────────────────
// Las secciones del panel, EN UN SOLO SITIO.
//
// 🔴 Antes estaban escritas dos veces: una en la barra lateral del
// ordenador (`Sidebar`) y otra en la barra de abajo del teléfono
// (`MobileNav`). Y pasó lo que tenía que pasar: al añadir «Letras»
// se puso solo en una, así que en el ordenador aparecía y **en el
// teléfono no** — lo vio Isaac el 2026-08-21 con el móvil en la mano,
// porque en el ordenador no se nota.
//
// Es la tercera vez en este proyecto que dos listas que hacen lo mismo
// se separan (P-09): ya pasó con `parseSections` y con la consulta del
// catálogo. Con una sola, añadir una sección es escribir una línea aquí
// y sale **en los dos sitios a la vez**.
//
// Los rótulos van en dos tamaños porque en el teléfono el sitio es el
// que es: «Nueva cancion» no cabe debajo de un icono, «Nueva» sí.
// ─────────────────────────────────────────────────────────────

import { CalendarDays, LayoutGrid, Mic2, PlusCircle, Settings, type LucideIcon } from "lucide-react";

import { ROLES_LETRAS } from "@/lib/letras";
import type { UserRole } from "@/types";

export type SeccionPanel = {
  href: string;
  /** Rótulo largo, para la barra lateral del ordenador. */
  label: string;
  /** Rótulo corto, para la barra de abajo del teléfono. */
  corto: string;
  icon: LucideIcon;
  roles: readonly UserRole[];
};

const TODOS: readonly UserRole[] = ["admin", "musician", "viewer"];

export const SECCIONES: SeccionPanel[] = [
  { href: "/catalog",   label: "Canciones",     corto: "Canciones", icon: LayoutGrid,  roles: TODOS },
  { href: "/services",  label: "Cultos",        corto: "Cultos",    icon: CalendarDays, roles: TODOS },
  // Quién ve «Letras» sale de ROLES_LETRAS: hoy solo el admin, mientras
  // Isaac escribe las 75 (D-22). Abrirlo es cambiar esa constante.
  { href: "/letras",    label: "Letras",        corto: "Letras",    icon: Mic2,        roles: ROLES_LETRAS },
  { href: "/sheets/new", label: "Nueva cancion", corto: "Nueva",     icon: PlusCircle,  roles: ["admin"] },
  { href: "/admin",     label: "Administrar",   corto: "Admin",     icon: Settings,    roles: ["admin"] },
];

/** Las secciones que le tocan a este rol, en orden. */
export function seccionesDe(rol: UserRole): SeccionPanel[] {
  return SECCIONES.filter((s) => s.roles.includes(rol));
}
