/* Paintoor service worker — the offline shell for the PWA build.
   Strategy: page navigations are network-first with a cached-copy then
   /offline fallback; same-origin static assets (scripts, styles, images,
   fonts) are stale-while-revalidate. Bump the cache name on every release
   so old shells retire on the next activate. */
const CACHE = "paintoor-v1";
const SHELL = ["/offline", "/paintoor-mark.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const c = await caches.open(CACHE);
      await c.addAll(SHELL);
      /* The offline page's own script/style chunks are not in the SHELL
         list — pull them out of its HTML so the fallback page still
         hydrates when the network is gone. Best-effort, never fatal. */
      try {
        const res = await fetch("/offline");
        const html = await res.text();
        const urls = [...html.matchAll(/(?:src|href)="(\/_next\/[^"]+)"/g)].map((m) => m[1]);
        await Promise.all(urls.map((u) => c.add(u).catch(() => {})));
      } catch {
        /* keep the shell even if the parse fails */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* Pages: try the network first, remember the good copy, fall back to
     whatever we cached for that URL, then to the offline page. */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          const hit = await caches.match(req, { ignoreSearch: true });
          return hit || (await caches.match("/offline"));
        }),
    );
    return;
  }

  /* Statics: serve from cache instantly, refresh in the background. */
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    /\.(png|jpe?g|svg|webp|woff2?|css|js)$/.test(url.pathname);
  if (!isStatic) return;
  event.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    }),
  );
});