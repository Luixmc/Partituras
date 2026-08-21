// ─────────────────────────────────────────────────────────────
// La letra de una canción: cómo se guarda, cómo se arma el andamio
// para escribirla y cómo se parte en estrofas.
//
// SE GUARDA EN `sheets.lyrics` (D-20), texto plano, con LAS MISMAS
// etiquetas de sección que los acordes:
//
//     [A (Cristo yo te amo...)]
//     Cristo yo te amo, y quiero servirte
//     ...
//
//     [B]
//     ...
//
// Tres motivos, y los tres pesan:
//  · La columna existe desde la primera migración → **sin migración**.
//  · Ya está en el índice de búsqueda en español → buscar por letra no
//    exige nada nuevo en la base.
//  · Las etiquetas son las mismas que las de los acordes, así que cada
//    estrofa se puede emparejar con su sección sin inventar nada.
//
// 🔴 EL ANDAMIO NO DECIDE QUÉ SE CANTA. Isaac lo dejó claro el
// 2026-08-21 sobre las secciones sin pista: «a veces se repiten
// estrofas a cantar, a veces son instrumentales, a veces solos de
// guitarra; no es algo fijo». → Se ofrecen TODAS las secciones, y
// **la que se quede vacía es que no se canta**. El dato lo pone él al
// escribir; aquí no se adivina nada.
// ─────────────────────────────────────────────────────────────

import { parseSections } from "@/lib/sections";
import type { UserRole } from "@/types";

export type Estrofa = {
  /** La etiqueta tal cual, como en los acordes: "A (Cristo yo te amo...)". */
  titulo?: string;
  /** Lo que se canta. Vacío = esa sección no lleva letra. */
  texto: string;
};

/**
 * La pista de LETRA que Isaac ya dejó escrita entre paréntesis:
 * "(Ven señor...)" → "Ven señor".
 *
 * 🔴 SOLO cuenta si acaba en puntos suspensivos, y eso NO es un capricho:
 * entre paréntesis hay dos cosas distintas mezcladas, y se midió sobre las
 * 75 canciones —**276 de 284 acaban en puntos**—:
 *
 *   · `(Ven señor...)`  → una frase CORTADA: es el arranque de la letra.
 *   · `(Brass x4)`, `(Voces)` → una anotación del arreglo. **No se canta.**
 *
 * Sin este filtro, el andamio metía «Brass x4» como si fuera un verso —lo
 * vio Isaac al probarlo en «Aceleración»—, y esa sección pasaba a contar
 * como cantada y a salirle a quien canta.
 *
 * ⚠️ El precio, dicho claro: **4 secciones pierden su relleno** porque su
 * letra es una frase corta sin puntos («El señor está sentado», «Su gloria
 * está aquí», «Pedimos gracias», «Jeeee»). Se asume a propósito:
 * **contenido equivocado que parece escrito es peor que un hueco vacío.**
 */
export function pistaDe(titulo: string | undefined): string {
  const m = titulo?.match(/\(([^)]*)\)/);
  if (!m) return "";
  const dentro = m[1].trim();
  if (!/(\.{2,}|…)$/.test(dentro)) return "";
  return dentro.replace(/\s*(\.{2,}|…)$/, "").trim();
}

/**
 * Arma el punto de partida para escribir la letra: una entrada por cada
 * sección de los acordes, con su etiqueta y —si la había— su primera
 * frase ya puesta.
 *
 * Esto es lo que hace el trabajo asumible: son ~284 estrofas en 75
 * canciones, y **cada una ya trae escrito su arranque**.
 *
 * Aquí `parseSections` sí vale: se está leyendo el texto de ACORDES, y
 * de él solo interesan las etiquetas.
 */
export function andamioDesdeAcordes(contenido: string): string {
  const secciones = parseSections(contenido).filter((s) => s.title);
  if (!secciones.length) return "";
  const bloques = secciones.map((s) => `[${s.title}]\n${pistaDe(s.title)}`);
  return bloques.join("\n\n") + "\n";
}

/**
 * Parte la letra guardada en estrofas.
 *
 * 🔴 NO se usa `parseSections`, aunque el formato de las etiquetas sea el
 * mismo: aquel junta las líneas con espacios (`content += line + " "`),
 * que para acordes está bien porque van separados por espacios, pero
 * **en una letra destrozaría los versos** — quedaría todo en un
 * párrafo. Aquí los saltos de línea SON el contenido.
 */
export function estrofasDe(letra: string): Estrofa[] {
  if (!letra.trim()) return [];

  const estrofas: Estrofa[] = [];
  let actual: Estrofa | null = null;

  for (const linea of letra.split("\n")) {
    const etiqueta = linea.match(/^\s*\[(.*?)\]\s*$/);
    if (etiqueta) {
      if (actual) estrofas.push(actual);
      actual = { titulo: etiqueta[1], texto: "" };
    } else {
      if (!actual) actual = { texto: "" };
      actual.texto += (actual.texto ? "\n" : "") + linea;
    }
  }
  if (actual) estrofas.push(actual);

  return estrofas
    .map((e) => ({ ...e, texto: e.texto.trim() }))
    .filter((e) => e.titulo || e.texto);
}

/** ¿Esta canción tiene letra escrita? */
export function tieneLetra(letra: string | null | undefined): boolean {
  return Boolean(letra && letra.trim());
}

/**
 * Cuántas estrofas se cantan de verdad: las que tienen texto debajo.
 * Sirve para decir cuánto lleva escrito cada canción sin contar las
 * secciones instrumentales, que se quedan vacías a propósito.
 */
export function estrofasCantadas(letra: string | null | undefined): number {
  if (!tieneLetra(letra)) return 0;
  return estrofasDe(letra as string).filter((e) => e.texto).length;
}

// ─────────────────────────────────────────────────────────────
// QUIÉN VE LAS LETRAS — el interruptor único
//
// Isaac, 2026-08-21: «quiero primero montar las letras y luego que todo
// el panel de la letra se haga público… mientras tanto que aparezca
// solo al admin, como la sección de ajustes; y ya cuando quede montado
// todas las canciones te diría para que quede público».
//
// Tiene sentido: una sección donde 73 de 75 canciones dicen «sin
// escribir» no ayuda a nadie, y encima haría dudar de la página.
//
// 🔴 PARA ABRIRLO A TODOS, CAMBIAR SOLO ESTA LÍNEA:
//        ["admin"]  →  ["admin", "musician", "viewer"]
// y ya está: la barra lateral, la pestaña de la canción, la pantalla
// /letras y el botón de la presentación miran todos aquí.
// ─────────────────────────────────────────────────────────────
export const ROLES_LETRAS: UserRole[] = ["admin"];

/**
 * ¿Este rol ve las letras?
 *
 * ⚠️ Esconder el botón NO es un permiso: la pantalla `/letras` **también**
 * lo comprueba en el servidor, o cualquiera escribiría la dirección a
 * mano y entraría. Es la lección L-87 `[PART]`, que en este proyecto ya
 * se pagó con el botón de «desactivar usuario».
 */
export function puedeVerLetras(rol: UserRole | null | undefined): boolean {
  return Boolean(rol && ROLES_LETRAS.includes(rol));
}
