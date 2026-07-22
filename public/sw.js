/**
 * Service worker AGRIVO — stratégie prudente pour un SaaS de démonstration :
 * - Précache la coquille minimale (icônes, page hors connexion).
 * - Réseau d'abord pour les pages (jamais de contenu périmé devant le jury),
 *   avec repli cache puis page hors connexion.
 * - Cache d'abord pour les assets immuables de Next (/_next/static) et les images locales.
 * - Ne touche JAMAIS aux routes API ni aux tuiles satellites tierces.
 */
const VERSION = "agrivo-sw-v2";
const PRECACHE = [
  "/hors-connexion",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Assets immuables : cache d'abord.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || url.pathname.startsWith("/filieres/") || url.pathname.startsWith("/textures/")) {
    event.respondWith(
      caches.match(event.request).then(
        (hit) =>
          hit ||
          fetch(event.request).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(event.request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // Navigations : réseau d'abord, repli cache, puis page hors connexion.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(event.request, copy));
          return res;
        })
        .catch(async () => (await caches.match(event.request)) || (await caches.match("/hors-connexion")) || Response.error()),
    );
  }
});
