// ─────────────────────────────────────────────────────────────
// Ver la página SIN INTERNET (O-96): las cuentas, sin navegador.
//
// Isaac, 2026-10-22: «¿se puede ver la página de Partituras sin internet…?
// poder abrir las canciones (y el culto del domingo) en la tablet o el
// teléfono aunque no haya conexión». Eligió guardar TODO EL CATÁLOGO.
//
// 📌 Cómo funciona, en una línea: las páginas llegan del servidor CON las
// canciones dentro, así que guardar la página es guardar la canción. Lo hace
// el service worker (`public/sw.js`) con lo que se visita, y
// `lib/guardarSinInternet.ts` con todo de una vez, solo, al abrir la página (O-97).
//
// Aquí vive lo que se puede probar sin navegador: qué páginas se guardan,
// qué archivos del programa necesitan, cuándo hay que volver a bajarlo y
// cómo se dice de cuándo es la copia. El `sw.js` no puede importar esto
// (no pasa por el compilador), así que el prefijo y la marca se repiten
// allí — si se cambian aquí, se cambian allí.
// ─────────────────────────────────────────────────────────────

/** Todas las copias de la página empiezan así. Se borran solo las nuestras (L-373). */
export const PREFIJO_CACHE = "partituras-";

/** Dentro de una copia, la entrada que dice «esta copia está COMPLETA». */
export const MARCA_COMPLETA = "/__sin-internet__";

/** Dónde recuerda el aparato que se pidió guardar, de cuándo y para quién. */
export const CLAVE_GUARDADO = "partituras-sin-internet";

/**
 * Cada despliegue tiene su copia, con el id del despliegue en el nombre: el
 * HTML de un despliegue pide los archivos del programa de ESE despliegue, así
 * que las dos cosas tienen que ir juntas.
 */
export function nombreCache(build: string): string {
  return PREFIJO_CACHE + build;
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

function idsTras(html: string, ruta: string): string[] {
  const patron = new RegExp(`${ruta}/(${UUID})`, "g");
  return Array.from(new Set(Array.from(html.matchAll(patron), (m) => m[1])));
}

/** Las canciones que enlaza una página (el catálogo): solo las que quien mira puede ver. */
export function cancionesEn(html: string): string[] {
  return idsTras(html, "/catalog");
}

/** Los cultos que enlaza una página (la lista de cultos). */
export function cultosEn(html: string): string[] {
  return idsTras(html, "/services");
}

/** Las secciones de lectura que el menú le enseña a quien mira (Letras y Melodía dependen del rol). */
export function seccionesEn(html: string): string[] {
  return ["/letras", "/melodias"].filter((ruta) => html.includes(`href="${ruta}"`));
}

/**
 * Lo que se guarda de una vez, EN ESTE ORDEN: si la descarga se corta a medias
 * —se cerró la app, se fue la señal—, lo que ya bajó se queda, así que primero
 * va lo que se toca el domingo: los cultos con su presentación.
 *
 * 🔴 O-98 (Isaac, 2026-10-22): **también la pantalla completa de cada canción**.
 * En O-96 se dejó fuera por peso —lleva el catálogo entero dentro para pasar a
 * «la siguiente», 233 KB cada una, ~23 MB las 98— y él la usa justo así: le
 * salía «no está guardada» canción por canción. Él decide el peso: ~33 MB en
 * total en el aparato, ~4–5 MB de datos por descarga.
 */
export function paginasAGuardar(canciones: string[], cultos: string[], secciones: string[] = []): string[] {
  return [
    "/catalog",
    "/services",
    ...cultos.flatMap((id) => [`/services/${id}/present`, `/services/${id}`]),
    ...secciones,
    "/novedades",
    ...canciones.map((id) => `/catalog/${id}`),
    ...canciones.map((id) => `/catalog/${id}/present`),
  ];
}

/**
 * Los archivos del programa (JS, CSS, letras) que pide una página. Sin ellos,
 * sin internet se vería el texto pero no se podría pasar de canción.
 *
 * Salen de las etiquetas y también del texto que Next mete en la página para
 * React, donde van entre comillas escapadas: por eso se corta en `\`.
 */
export function estaticosEn(html: string): string[] {
  return Array.from(new Set(html.match(/\/_next\/static\/[^"'\s\\)<>,]+/g) ?? []));
}

/** Lo que el aparato recuerda de la última vez que se guardó. */
export type Guardado = {
  /** Cuándo terminó de guardarse (ISO). */
  fecha: string;
  /** De qué despliegue es la copia. */
  build: string;
  /** Para quién: otra cuenta en la misma tablet no hereda la descarga. */
  usuario: string;
  canciones: number;
  cultos: number;
  /** Lo que ocupa en el aparato, en KB. */
  kb: number;
};

export function leerGuardado(texto: string | null): Guardado | null {
  if (!texto) return null;
  try {
    const g = JSON.parse(texto);
    if (!g || typeof g.fecha !== "string" || typeof g.build !== "string" || typeof g.usuario !== "string") return null;
    if (Number.isNaN(Date.parse(g.fecha))) return null;
    return {
      fecha: g.fecha,
      build: g.build,
      usuario: g.usuario,
      canciones: Number(g.canciones) || 0,
      cultos: Number(g.cultos) || 0,
      kb: Number(g.kb) || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Cada cuánto se vuelve a bajar lo guardado aunque no haya despliegue nuevo:
 * Isaac corrige canciones sin publicar código, y una copia de hace una semana
 * le enseñaría al músico la versión vieja. Una vez al día, como mucho.
 */
export const REFRESCO_MS = 24 * 60 * 60 * 1000;

/**
 * ¿Hay que bajar lo guardado? Desde O-97 se guarda SOLO, sin botón (Isaac,
 * 2026-10-22: «quiero que lo guarde apenas uno abra la pagina»), así que sí
 * cuando: ESTA cuenta no tiene copia en este aparato (nunca, o es de otra
 * cuenta de la misma tablet), hay despliegue nuevo, o la copia tiene más de un
 * día. Si no, no: cada apertura no puede gastarle datos al músico.
 */
export function hayQueRefrescar(
  g: Guardado | null,
  build: string,
  usuario: string,
  ahora: number
): boolean {
  if (!g || g.usuario !== usuario) return true;
  if (g.build !== build) return true;
  return ahora - Date.parse(g.fecha) > REFRESCO_MS;
}

/**
 * A partir de cuánto una página es «una copia» y no la de ahora. Se compara la
 * hora a la que el servidor la armó con la del aparato, y los relojes de los
 * teléfonos no siempre van en hora: con menos margen saldría el aviso solo.
 */
export const COPIA_VIEJA_MS = 5 * 60 * 1000;

export function esCopia(generado: string, ahora: number): boolean {
  const t = Date.parse(generado);
  if (Number.isNaN(t)) return false;
  return ahora - t > COPIA_VIEJA_MS;
}

/** «hoy, 8:15 p. m.», «ayer, 9:02 a. m.» o «sáb 18 oct, 7:40 p. m.». */
export function fechaCorta(fecha: string, ahora: number): string {
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  const hora = d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
  const dia = (x: Date) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
  const hoy = new Date(ahora);
  const ayer = new Date(ahora - 24 * 60 * 60 * 1000);
  if (dia(d) === dia(hoy)) return `hoy, ${hora}`;
  if (dia(d) === dia(ayer)) return `ayer, ${hora}`;
  const fechaTexto = d
    .toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\./g, "")
    .replace(/,/g, "");
  return `${fechaTexto}, ${hora}`;
}
