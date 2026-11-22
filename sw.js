/* ConectaBus · caché de la interfaz para instalaciones HTTPS */
const CACHE_NAME = "conectabus-shell-v29";
const INDEX_URL = new URL("./index.html", self.registration.scope).href;
const CORE_FILES = [INDEX_URL, "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./assets/backrooms-level0.webp?v=2", "./assets/backrooms-level150.svg", "./assets/backrooms-level399.svg", "./assets/backrooms-level-minus1.svg", "./assets/backrooms-level38.svg", "./assets/backrooms-fun.svg", "./assets/backrooms-the-end.svg", "./assets/backrooms-level94.svg", "./assets/conectabus-flower-bg.webp"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("conectabus-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    if (request.destination === "image") {
      event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response && (response.ok || response.type === "opaque")) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })));
    }
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(INDEX_URL, copy));
      return response;
    }).catch(() => caches.match(INDEX_URL)));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  })));
});
