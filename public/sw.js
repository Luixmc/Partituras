// Service worker mínimo para PWA (instalable + caché básica offline).
// Estrategia: network-first para GET del mismo origen, con respaldo en caché.
// No toca peticiones a Supabase ni de tipo no-GET.
const CACHE = "partituras-v1";

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
