// Bump when the caching strategy changes; old caches are deleted on activate.
const CACHE_NAME = "pebblesum-v2";
const urlsToCache = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // It's okay if some URLs fail to cache
        console.log("Some URLs failed to cache during install");
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

function cacheResponse(request, response) {
  if (response && response.status === 200 && response.type !== "error") {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Always ask the server which build is live.
  if (url.pathname === "/version.json") return;

  // Pages: network first so a refresh picks up a new deploy; cache is the offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Static assets (content-hashed by Next.js): cache first.
  event.respondWith(
    caches.match(request).then(
      (cached) => cached || fetch(request).then((response) => cacheResponse(request, response)).catch(() => caches.match(request))
    )
  );
});
