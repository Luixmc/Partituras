// ─────────────────────────────────────────────────────────────
// Guardar para tocar sin internet (O-96), SOLO y en silencio (O-97).
//
// Baja el catálogo, la lista de cultos, cada canción y cada culto con su
// presentación, más los archivos del programa que esas páginas piden, y lo
// deja en la MISMA copia que usa el service worker (`partituras-<despliegue>`).
// Las cuentas puras —qué se guarda, cuándo se refresca— están en
// `lib/sinInternet.ts`, con pruebas; esto es la parte que necesita navegador.
//
// 🔴 Isaac, 2026-10-22, cambiando de opinión sobre el botón: «quiero que lo
// guarde apenas uno abra la pagina… que no esté ese botón y que no salga
// ningún aviso de que se hizo el guardado». Lo lanza `AvisoSinInternet` al
// abrir cualquier página con sesión; aquí no se pinta nada.
//
// 📌 Se hace desde la página y no desde el service worker porque la página
// sabe de quién es la sesión y se entera de que venció. Las peticiones
// llevan `x-partituras-guardar` para que el service worker las deje pasar a la
// red sin meterse: si no, con señal floja podría devolver la copia vieja y se
// «guardaría» lo mismo que ya había.
// ─────────────────────────────────────────────────────────────

import {
  CLAVE_GUARDADO,
  MARCA_COMPLETA,
  PREFIJO_CACHE,
  cancionesEn,
  cultosEn,
  seccionesEn,
  estaticosEn,
  leerGuardado,
  nombreCache,
  paginasAGuardar,
  type Guardado,
} from "@/lib/sinInternet";
import { algunoContiene } from "@/lib/texto";

/** El despliegue de esta página: el mismo con el que se registra el service worker. */
export const BUILD = process.env.NEXT_PUBLIC_BUILD_ID || "dev";

/** Cuántas páginas se bajan a la vez: más rápido que de una en una sin ahogar un teléfono. */
const A_LA_VEZ = 6;

/** Los archivos sueltos que la app instalada pide al abrir. */
const SUELTOS = ["/manifest.json", "/icon-192.png", "/icon-512.png", "/favicon.ico"];

export class SesionVencida extends Error {
  constructor() {
    super("La sesión venció: vuelve a entrar con tu cuenta y guarda otra vez.");
  }
}

export function puedeGuardar(): boolean {
  return typeof window !== "undefined" && "caches" in window && "serviceWorker" in navigator;
}

// ── Lo que el aparato recuerda ──

export function guardadoActual(): Guardado | null {
  try {
    return leerGuardado(localStorage.getItem(CLAVE_GUARDADO));
  } catch {
    return null;
  }
}

/** Lo guardado, más cuántas páginas no se pudieron bajar. */
export type Resultado = Guardado & { fallidas: number };

let enCurso: Promise<Resultado> | null = null;

// ── Guardar ──

async function bajar(ruta: string): Promise<Response> {
  const r = await fetch(ruta, {
    headers: { "x-partituras-guardar": "1" },
    redirect: "manual",
    credentials: "same-origin",
    cache: "no-store",
  });
  // Sin sesión, el servidor redirige a /login: eso NO se guarda como la página.
  if (r.type === "opaqueredirect" || (r.status >= 300 && r.status < 400)) throw new SesionVencida();
  if (!r.ok) throw new Error(`${ruta} respondió ${r.status}`);
  return r;
}

async function enTandas<T>(cosas: T[], hacer: (cosa: T) => Promise<void>) {
  let i = 0;
  const obrero = async () => {
    while (i < cosas.length) await hacer(cosas[i++]);
  };
  await Promise.all(Array.from({ length: Math.min(A_LA_VEZ, cosas.length) }, obrero));
}

/**
 * Baja todo y lo deja guardado. Si ya hay una descarga en marcha (dos pestañas
 * de la app montan el aviso a la vez), devuelve esa misma en vez de empezar otra.
 */
export function guardarTodo(usuario: string): Promise<Resultado> {
  if (!enCurso) {
    enCurso = guardar(usuario).finally(() => {
      enCurso = null;
    });
  }
  return enCurso;
}

async function guardar(usuario: string): Promise<Resultado> {
  if (!puedeGuardar()) throw new Error("Este navegador no permite guardar páginas.");
  if (!navigator.onLine) throw new Error("Sin internet no se puede guardar: hace falta conexión para bajarlo.");

  const cache = await caches.open(nombreCache(BUILD));
  const estaticos = new Set<string>(SUELTOS);
  let bytes = 0;
  let fallidas = 0;

  const guardarPagina = async (ruta: string, r: Response) => {
    const html = await r.clone().text();
    estaticosEn(html).forEach((e) => estaticos.add(e));
    bytes += html.length;
    await cache.put(ruta, r);
    return html;
  };

  const catalogo = await guardarPagina("/catalog", await bajar("/catalog"));
  const cultos = await guardarPagina("/services", await bajar("/services"));

  const idsCanciones = cancionesEn(catalogo);
  const idsCultos = cultosEn(cultos);
  const resto = paginasAGuardar(idsCanciones, idsCultos, seccionesEn(catalogo)).slice(2);

  await enTandas(resto, async (ruta) => {
    try {
      await guardarPagina(ruta, await bajar(ruta));
    } catch {
      // Una página suelta que no llega (o que a este rol lo manda a otra parte)
      // no tumba el resto: si la sesión de verdad venció, ya habría fallado el
      // catálogo, que va primero.
      fallidas++;
    }
  });

  // Los archivos del programa: los que ya estén (los guardó el service worker al
  // navegar) no se vuelven a bajar — llevan el contenido en el nombre y no cambian.
  const faltan: string[] = [];
  for (const e of estaticos) if (!(await cache.match(e))) faltan.push(e);
  await enTandas(faltan, async (ruta) => {
    try {
      const r = await fetch(ruta, { credentials: "same-origin" });
      if (r.ok) {
        bytes += Number(r.headers.get("content-length")) || (await r.clone().blob()).size;
        await cache.put(ruta, r);
      }
    } catch {
      /* un icono que no llega no impide tocar */
    }
  });

  if (fallidas > 0 && fallidas === resto.length) throw new Error("No se pudo bajar ninguna canción.");

  const guardado: Guardado = {
    fecha: new Date().toISOString(),
    build: BUILD,
    usuario,
    canciones: idsCanciones.length,
    cultos: idsCultos.length,
    kb: Math.round(bytes / 1024),
  };
  // La marca dice «esta copia está completa»: el service worker de un despliegue
  // nuevo NO borra la última copia completa hasta que haya otra (sw.js, activate).
  await cache.put(MARCA_COMPLETA, new Response(JSON.stringify(guardado), {
    headers: { "content-type": "application/json" },
  }));
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(guardado));
  } catch {
    /* sin localStorage sigue sirviendo; solo no se refrescará solo */
  }

  // Ya hay copia completa de ESTE despliegue: las de despliegues anteriores sobran.
  for (const k of await caches.keys()) {
    if (k.startsWith(PREFIJO_CACHE) && k !== nombreCache(BUILD)) await caches.delete(k);
  }
  // Que el navegador no la borre por falta de espacio (en Chrome, si la app
  // está instalada; Safari lo ignora y ahí lo que vale es instalarla).
  navigator.storage?.persist?.().catch(() => {});

  return { ...guardado, fallidas };
}

/**
 * Borra TODO lo guardado de la página en este aparato (Fase 4): «Salir» lo
 * llama, para que una tablet compartida no siga enseñando canciones sin sesión.
 */
export async function borrarCopias(): Promise<void> {
  try {
    if ("caches" in window) {
      for (const k of await caches.keys()) if (k.startsWith(PREFIJO_CACHE)) await caches.delete(k);
    }
  } catch {
    /* si no se puede borrar, se sigue cerrando la sesión */
  }
  try {
    localStorage.removeItem(CLAVE_GUARDADO);
  } catch {
    /* igual */
  }
}

// ── La búsqueda del catálogo, sin internet ──

/**
 * Sin internet, buscar en el catálogo no puede ir al servidor: se filtran las
 * tarjetas que ya están en pantalla, por título y autor (la letra no viene en
 * la tarjeta). Devuelve `false` si en esta pantalla no hay tarjetas que filtrar.
 */
export function filtrarSinInternet(busqueda: string): boolean {
  const tarjetas = document.querySelectorAll<HTMLElement>("[data-buscar]");
  if (!tarjetas.length) return false;
  tarjetas.forEach((t) => {
    t.hidden = !algunoContiene([t.dataset.buscar], busqueda);
  });
  return true;
}

/** Al volver la conexión, la lista la vuelve a hacer el servidor: nada escondido a mano. */
export function mostrarTodasLasTarjetas() {
  document.querySelectorAll<HTMLElement>("[data-buscar][hidden]").forEach((t) => {
    t.hidden = false;
  });
}
