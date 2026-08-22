// Service worker mínimo para PWA (instalable + caché básica offline).
// Estrategia: network-first para GET del mismo origen, con respaldo en caché.
// No toca peticiones a Supabase ni de tipo no-GET.
// 🔴 La version sale de la PROPIA DIRECCION del service worker: se registra
// como `/sw.js?v=<id del despliegue>` (ver PWARegister). Antes esto era la
// constante "partituras-v1", y como nunca cambiaba, el `activate` de abajo
// —que borra «las claves distintas de CACHE»— **no borraba nada, nunca**.
//
// Consecuencia real, medida el 2026-08-21: el caché acumulaba respuestas desde
// el primer día, y el día que la red falle o vaya lenta —un móvil con datos
// flojos en el culto— el músico recibe una copia que puede ser de hace meses,
// sin ningún aviso.
//
// Se hace por la dirección y no reescribiendo este archivo porque `public/` va
// al repositorio: reescribirlo en cada compilación lo dejaría sucio en cada
// push. Cambiar la dirección basta — el navegador la compara, ve que cambió, e
// instala el service worker nuevo; y ahí `activate` sí encuentra claves
// distintas y limpia.
const VERSION = new URL(self.location).searchParams.get("v") || "v1";
const CACHE = "partituras-" + VERSION;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // deja pasar Supabase, CDNs, etc.

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Respaldo para navegaciones sin conexión.
        if (request.mode === "navigate") {
          const fallback = await caches.match("/catalog");
          if (fallback) return fallback;
        }
        return Response.error();
      })
  );
});
