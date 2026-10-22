// Service worker de Partituras: app instalable y VER SIN INTERNET (O-96).
//
// 📌 Por qué guardar la página basta: cada página llega del servidor con sus
// canciones dentro. Guardada la página, guardada la canción — incluido pasar de
// canción en la presentación de un culto, que va entera en la misma página.
//
// Estrategias, de arriba abajo en el `fetch`:
//   · lo que no es GET o no es de aquí (Supabase, sonidos)  → no se toca
//   · las peticiones internas de Next (`rsc`)               → no se tocan: si
//     fallan, Next recarga la página entera, y esa sí pasa por aquí
//   · lo que guarda el botón (`x-partituras-guardar`)       → directo a la red
//   · `/salir`                                              → borra las copias
//   · `/_next/static/…` (llevan el contenido en el nombre)  → primero la copia
//   · las páginas                                           → primero la red,
//     pero si en ESPERA_RED_MS no contesta, o falla, o da 5xx, la copia
//   · lo demás (iconos, manifiesto)                         → red, y si no, copia
//
// 🔴 La versión sale de la PROPIA DIRECCIÓN del service worker: se registra
// como `/sw.js?v=<id del despliegue>` (ver PWARegister). Antes esto era la
// constante "partituras-v1", y como nunca cambiaba, el `activate` —que borra
// las copias de otros despliegues— no borraba nada, nunca (P-12). Se hace por la
// dirección y no reescribiendo este archivo porque `public/` va al repositorio.
//
// 🔴 Y hasta el 2026-10-22 este archivo NO SE INSTALABA en ningún aparato:
// `PWARegister` esperaba el `load` cuando ya había pasado (L-497).
//
// ⚠️ El prefijo y la marca se repiten en `src/lib/sinInternet.ts`, que es donde
// están probados: si se cambian aquí, se cambian allí.
const VERSION = new URL(self.location).searchParams.get("v") || "v1";
const PREFIJO = "partituras-";
const CACHE = PREFIJO + VERSION;
const MARCA = "/__sin-internet__";

// Cuánto se espera a la red antes de enseñar la copia. Medido el 2026-10-22
// desde La Guajira: una página normal tarda 1,3–2,6 s (la base está en
// Oregón). Con 4 s, un teléfono lento caería en la copia con señal buena.
const ESPERA_RED_MS = 6000;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // De los despliegues anteriores se conserva SOLO la última copia completa
      // (la del botón «Guardar»), hasta que la página baje la de este. Sin esto,
      // abrir la app con señal floja después de un despliegue borraba lo guardado
      // y no daba tiempo a bajarlo otra vez: justo el domingo en la iglesia.
      const viejas = (await caches.keys()).filter((k) => k.startsWith(PREFIJO) && k !== CACHE);
      let quedarse = null;
      let fechaQuedarse = "";
      for (const k of viejas) {
        const marca = await (await caches.open(k)).match(MARCA);
        if (!marca) continue;
        const fecha = (await marca.json().catch(() => ({}))).fecha || "";
        if (fecha >= fechaQuedarse) {
          quedarse = k;
          fechaQuedarse = fecha;
        }
      }
      await Promise.all(viejas.filter((k) => k !== quedarse).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // deja pasar Supabase, sonidos, etc.
  if (request.headers.get("rsc") || url.searchParams.has("_rsc")) return;
  if (request.headers.get("x-partituras-guardar")) return;

  if (url.pathname === "/salir") {
    // Fase 4: al salir de la cuenta no queda nada guardado en el aparato.
    event.waitUntil(borrarTodo());
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(primeroLaCopia(event));
  } else if (request.mode === "navigate") {
    event.respondWith(pagina(event));
  } else {
    event.respondWith(
      deLaRed(event).catch(async () => (await buscar(request)) || Response.error())
    );
  }
});

/** ¿Esta respuesta se puede guardar como la página? Una redirección (al login) no. */
function sirve(r) {
  return r && r.ok && r.type === "basic" && !r.redirected;
}

/** Pide a la red y, si sirve, la guarda — sin que el navegador apague esto a medias. */
function deLaRed(event) {
  let guardado = Promise.resolve();
  const red = fetch(event.request).then((r) => {
    if (sirve(r)) {
      const copia = r.clone();
      guardado = caches.open(CACHE).then((c) => c.put(event.request, copia));
    }
    return r;
  });
  event.waitUntil(red.then(() => guardado).catch(() => {}));
  return red;
}

/** Busca primero en la copia de este despliegue y después en la que se conservó. */
async function buscar(request, opciones) {
  const propia = await (await caches.open(CACHE)).match(request, opciones);
  if (propia) return propia;
  const otras = (await caches.keys()).filter((k) => k.startsWith(PREFIJO) && k !== CACHE);
  for (const k of otras.reverse()) {
    const r = await (await caches.open(k)).match(request, opciones);
    if (r) return r;
  }
  return undefined;
}

async function primeroLaCopia(event) {
  const copia = await buscar(event.request);
  if (copia) return copia;
  return deLaRed(event).catch(() => Response.error());
}

async function pagina(event) {
  const red = deLaRed(event);
  const plazo = new Promise((ok) => setTimeout(() => ok("plazo"), ESPERA_RED_MS));
  const primero = await Promise.race([red.catch(() => "fallo"), plazo]);
  if (primero !== "plazo" && primero !== "fallo" && primero.status < 500) return primero;

  // Sin red, red lenta o el servidor fallando: la copia, si la hay. Si no está
  // esa dirección exacta, la misma sin filtros (`/catalog?categories=…` → `/catalog`).
  const copia =
    (await buscar(event.request)) || (await buscar(event.request, { ignoreSearch: true }));
  if (copia) return copia;
  if (primero !== "plazo" && primero !== "fallo") return primero;
  if (primero === "plazo") {
    try {
      return await red;
    } catch {
      /* cae a la página de abajo */
    }
  }
  return noGuardada(new URL(event.request.url));
}

async function borrarTodo() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith(PREFIJO)).map((k) => caches.delete(k)));
}

/** Lo que se ve sin internet en una página que nunca se guardó (antes: el error del navegador). */
function noGuardada(url) {
  const cancion = url.pathname.match(/^\/catalog\/([0-9a-f-]{36})\/present/);
  const verCancion = cancion
    ? `<a class="b" href="/catalog/${cancion[1]}">Ver la canción</a>`
    : "";
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sin internet · Partituras</title>
<style>
:root{color-scheme:light dark}
body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;
font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f8fafc;color:#0f172a;padding:24px;box-sizing:border-box}
.c{max-width:420px;text-align:center}
h1{font-size:1.4rem;margin:0 0 .5rem}
p{color:#475569;line-height:1.5;margin:.4rem 0}
.bs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:20px}
.b{display:inline-block;padding:10px 16px;border-radius:12px;background:#191c4d;color:#fff;text-decoration:none;font-weight:600;border:0;font-size:1rem;cursor:pointer}
.b2{background:#e2e8f0;color:#0f172a}
@media (prefers-color-scheme:dark){body{background:#020617;color:#f1f5f9}p{color:#94a3b8}.b2{background:#1e293b;color:#f1f5f9}}
</style></head><body><div class="c">
<div style="font-size:2.5rem">📴</div>
<h1>Sin internet</h1>
<p>Esta página no está guardada en este aparato, así que sin conexión no se puede abrir.</p>
<p>Para la próxima: con internet, entra al <b>Catálogo</b> y pulsa <b>«Guardar para tocar sin internet»</b>.</p>
<div class="bs">${verCancion}<a class="b" href="/catalog">Ir al catálogo</a>
<button class="b b2" onclick="history.back()">Volver</button></div>
</div></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
