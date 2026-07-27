const CACHE_NAME = "vv-workbench-v2";
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, "");
const scoped = (path) => `${BASE_PATH}${path}`;
const APP_SHELL = [
  scoped("/"),
  scoped("/manifest.webmanifest"),
  scoped("/icons/vv-workbench.svg"),
  scoped("/icons/vv-workbench-192.png"),
  scoped("/icons/vv-workbench-512.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(scoped("/")))),
  );
});