// ─────────────────────────────────────────────────────────────
// La MELODÍA de una canción: el modelo y cómo se escribe (O-57).
//
// Isaac, 2026-09-02: «que se pueda escribir la melodía y también las secciones
// para que sepa por dónde va», y eligió escribirla **con el ratón** sobre el
// pentagrama, no tecleando.
//
// 🔴 POR QUÉ ESTO VIVE EN `lib/` Y NO DENTRO DEL EDITOR: es lógica pura, así que
// **la cubren las pruebas del CI** en vez de un arnés suelto — lo mismo que
// `music.ts`, `acordes.ts`, `figuras.ts` y `reparto.ts`. Y hace falta: si al
// guardar se pierde una alteración o una duración, **no salta ningún error**;
// el trompetista lee una nota equivocada en mitad del culto.
//
// 📌 SE GUARDA EN **ABC**, no en JSON, y es una decisión con motivo: es texto
// que se lee, se pega y se corrige a mano, es un formato estándar que abre
// cualquier programa de partituras, y así el día que algo se rompa **la melodía
// no queda atrapada**. El editor de ratón solo es una forma cómoda de teclearlo.
// ─────────────────────────────────────────────────────────────

import { parseSections } from "@/lib/sections";
import type { UserRole } from "@/types";

/**
 * Quién ve la sección de melodía.
 *
 * 🔴 UN SOLO INTERRUPTOR, calcado de `ROLES_LETRAS` (D-22). Isaac lo pidió
 * igual: «que tenga una sección aparte como las letras pero que sea oculta
 * también hasta que funcione bien».
 *
 *   para abrirlo:  ["admin", "musician", "viewer"]
 *
 * ⚠️ Y no es solo esconder botones: la pantalla lo comprueba en el SERVIDOR y
 * la melodía **no sale del servidor** para quien no debe verla (L-87).
 */
export const ROLES_MELODIA: UserRole[] = ["admin"];

export function puedeVerMelodia(rol: UserRole | null | undefined): boolean {
  return Boolean(rol && ROLES_MELODIA.includes(rol));
}

// ── El modelo ──
//
// 📌 La altura se guarda como ESCALÓN DIATÓNICO (0 = el do central), no como
// semitonos. Subir una línea del pentagrama es sumar 1, que es exactamente como
// se piensa mirando una partitura — y es lo que hace que arrastrar la nota con
// el ratón sea una cuenta y no una tabla.
export type Alteracion = "sostenido" | "bemol" | "becuadro" | null;

export type Elemento =
  | { tipo: "nota"; paso: number; alteracion: Alteracion; duracion: number; ligada: boolean }
  | { tipo: "silencio"; duracion: number }
  | { tipo: "barra" };

/** Las duraciones, en corcheas — que es la unidad de ABC (`L:1/8`). */
export const DURACIONES = [
  { valor: 0.5, nombre: "Semicorchea" },
  { valor: 1, nombre: "Corchea" },
  { valor: 1.5, nombre: "Corchea con puntillo" },
  { valor: 2, nombre: "Negra" },
  { valor: 3, nombre: "Negra con puntillo" },
  { valor: 4, nombre: "Blanca" },
  { valor: 6, nombre: "Blanca con puntillo" },
  { valor: 8, nombre: "Redonda" },
] as const;

const LETRAS = ["C", "D", "E", "F", "G", "A", "B"];
const SIGNO: Record<Exclude<Alteracion, null>, string> = {
  sostenido: "^",
  bemol: "_",
  becuadro: "=",
};

/**
 * La duración, como la escribe ABC con `L:1/8`.
 *
 * Entera se pone tal cual (`2` = negra); las que no lo son van en quebrado
 * sobre 2 — la semicorchea es `/2` y la corchea con puntillo `3/2`.
 */
function duracionAbc(d: number): string {
  if (d === 1) return "";
  if (Number.isInteger(d)) return String(d);
  const mitades = Math.round(d * 2);
  return mitades === 1 ? "/2" : `${mitades}/2`;
}

/** Un escalón, a como se escribe en ABC: `C` es el do central, `c` el de arriba. */
export function pasoAbc(paso: number): string {
  const octava = Math.floor(paso / 7);
  const letra = LETRAS[((paso % 7) + 7) % 7];
  if (octava <= -1) return letra + ",".repeat(-octava);
  if (octava === 0) return letra;
  return letra.toLowerCase() + "'".repeat(octava - 1);
}

/** Un elemento suelto, en ABC. */
export function elementoAbc(e: Elemento): string {
  if (e.tipo === "barra") return "|";
  if (e.tipo === "silencio") return "z" + duracionAbc(e.duracion);
  const alt = e.alteracion ? SIGNO[e.alteracion] : "";
  return alt + pasoAbc(e.paso) + duracionAbc(e.duracion) + (e.ligada ? "-" : "");
}

/** La melodía entera, en ABC. Es lo que se guarda en la base. */
export function melodiaAbc(elementos: Elemento[]): string {
  return elementos.map(elementoAbc).join(" ");
}

/**
 * El texto ABC COMPLETO, con su cabecera, listo para dibujar.
 *
 * `L:1/8` no es un capricho: es lo que hace que las duraciones sean números
 * enteros pequeños, y por tanto que el editor no tenga que manejar quebrados
 * más que en la semicorchea.
 */
export function abcCompleto(opciones: {
  elementos: Elemento[];
  compas?: string;
  tono?: string;
  titulo?: string;
}): string {
  const { elementos, compas = "4/4", tono = "C", titulo } = opciones;
  const cuerpo = elementos.length ? melodiaAbc(elementos) : "z8";
  return [
    "X:1",
    titulo ? `T:${titulo}` : null,
    `M:${compas}`,
    "L:1/8",
    `K:${tono}`,
    cuerpo,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * De vuelta: del texto ABC a los elementos, para poder SEGUIR EDITANDO.
 *
 * 🔴 Hace falta de verdad, y no es un extra: sin esto, abrir una melodía ya
 * guardada la dejaría en blanco. Se guarda texto (ver la cabecera del archivo),
 * así que hay que saber volver.
 *
 * ⚠️ Lee **el subconjunto que este editor escribe**, no ABC entero — que es un
 * formato grande. Lo que no reconozca **se salta en silencio** en vez de
 * inventarse una nota: una nota inventada se toca; un hueco se ve.
 */
export function parsearMelodia(texto: string): Elemento[] {
  // Solo el cuerpo: las líneas de cabecera son `X:`, `M:`, `L:`, `K:`, `T:`…
  const cuerpo = texto
    .split(/\r?\n/)
    .filter((l) => !/^[A-Za-z]:/.test(l.trim()))
    .join(" ");

  const elementos: Elemento[] = [];
  // Alteración · nota · comas/apóstrofos de octava · duración · ligadura
  const re = /(\^|_|=)?([A-Ga-gzZ])([,']*)(\d*(?:\/\d+)?|\/\d+)?(-)?|(\|)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(cuerpo))) {
    if (m[6]) {
      elementos.push({ tipo: "barra" });
      continue;
    }
    const letra = m[2];
    const duracion = leerDuracion(m[4]);
    if (letra === "z" || letra === "Z") {
      elementos.push({ tipo: "silencio", duracion });
      continue;
    }
    elementos.push({
      tipo: "nota",
      paso: leerPaso(letra, m[3] ?? ""),
      alteracion: m[1] === "^" ? "sostenido" : m[1] === "_" ? "bemol" : m[1] === "=" ? "becuadro" : null,
      duracion,
      ligada: Boolean(m[5]),
    });
  }
  return elementos;
}

function leerDuracion(txt: string | undefined): number {
  if (!txt) return 1;
  if (txt.startsWith("/")) return 1 / Number(txt.slice(1) || 2);
  const [a, b] = txt.split("/");
  return b ? Number(a) / Number(b) : Number(a);
}

function leerPaso(letra: string, octavas: string): number {
  const mayus = letra === letra.toUpperCase();
  const base = LETRAS.indexOf(letra.toUpperCase());
  let octava = mayus ? 0 : 1;
  for (const c of octavas) {
    if (c === ",") octava -= 1;
    if (c === "'") octava += 1;
  }
  return octava * 7 + base;
}

// ═══════════════════════════════════════════════════════════════
// LA MELODÍA POR SECCIONES
//
// Isaac lo pidió en la misma frase que el pentagrama: «que se pueda escribir la
// melodía **y también las secciones para que sepa por dónde va**». Para un
// trompetista eso no es un adorno — es lo único que le dice si lo que está
// leyendo es la Intro, el coro o el puente.
//
// 📌 SE GUARDA CON LAS MISMAS ETIQUETAS `[A (Cada vez...)]` que los acordes y
// que la letra (D-20). No es por uniformidad: es que así **`parseSections` ya
// sabe partirlo**, y emparejar cada tramo con su sección de acordes sale gratis.
// ═══════════════════════════════════════════════════════════════

export type Tramo = { titulo?: string; abc: string };

/**
 * Parte la melodía guardada en sus tramos, uno por sección.
 *
 * 🔴 REUSA `parseSections`, no copia su lógica. Aquí sí vale —al revés que en
 * la letra, que necesitó la suya— porque `parseSections` junta las líneas con
 * un espacio, y en ABC **el espacio es justo el separador**: una melodía
 * escrita en tres renglones significa lo mismo que en uno.
 *
 * ⚠️ Se filtran los tramos vacíos porque `parseSections("")` **no devuelve una
 * lista vacía**: devuelve una sección con un espacio dentro (contrato real,
 * documentado en O-44). Sin este filtro, una melodía en blanco pintaría un
 * pentagrama fantasma.
 */
export function tramosDe(melodia: string): Tramo[] {
  return parseSections(melodia)
    .map((s) => ({ titulo: s.title, abc: s.content.trim() }))
    .filter((t) => t.titulo || t.abc);
}

/** El camino de vuelta: los tramos, otra vez como un solo texto para guardar. */
export function melodiaDeTramos(tramos: Tramo[]): string {
  return tramos
    .map((t) => (t.titulo ? `[${t.titulo}]\n${t.abc}` : t.abc))
    .join("\n\n")
    .trim();
}

/**
 * El ANDAMIO: las secciones de la canción, ya puestas y vacías.
 *
 * 🔴 Es lo que hace barato el trabajo, igual que con las letras: **las
 * secciones ya están escritas** en los acordes, así que Isaac no arranca de una
 * pantalla en blanco — abre la canción y ya están la Intro, la A, la B y el
 * Final esperando su melodía.
 *
 * ⚠️ Se ofrecen TODAS las secciones, sin decidir cuáles llevan melodía. Isaac
 * ya zanjó esto con las letras: «a veces se repiten estrofas, a veces son
 * instrumentales, a veces solos de guitarra, no es algo fijo». **La que se
 * quede vacía es que no la toca la trompeta** — el dato lo pone él, no una
 * regla que yo me invente.
 */
export function andamioDeMelodia(contenidoAcordes: string): string {
  const secciones = parseSections(contenidoAcordes).filter((s) => s.title);
  if (!secciones.length) return "";
  return secciones.map((s) => `[${s.title}]`).join("\n\n") + "\n";
}

/** Si una canción tiene ya melodía escrita (aunque sea de una sola sección). */
export function tieneMelodia(melodia: string | null | undefined): boolean {
  return tramosDe(melodia ?? "").some((t) => t.abc.length > 0);
}
