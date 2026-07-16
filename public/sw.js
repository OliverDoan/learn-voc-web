// VocaLearn service worker — minimal offline shell + Dictionary API cache.
const CACHE_VERSION = "v2";
const SHELL_CACHE = `vocalearn-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `vocalearn-runtime-${CACHE_VERSION}`;
const DICT_CACHE = `vocalearn-dict-${CACHE_VERSION}`;

const SHELL_URLS = ["/", "/decks", "/stats", "/achievements", "/icons/icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.all(
        SHELL_URLS.map((url) =>
          cache.add(url).catch(() => {
            // Một số route động (đăng nhập, ...) có thể fail offline-install — bỏ qua.
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => ![SHELL_CACHE, RUNTIME_CACHE, DICT_CACHE].includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isApi(url) {
  return url.pathname.startsWith("/api/");
}

function isDictionaryProxy(url) {
  return url.pathname.startsWith("/api/dictionary");
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Bỏ qua RSC payload / prefetch điều hướng của Next.js: để trình duyệt tự xử lý.
  // Các request này có query ?_rsc=<hash> khác nhau nên không bao giờ hit cache —
  // đi qua SW chỉ nhân đôi request và làm nghẽn hàng đợi kết nối.
  if (url.searchParams.has("_rsc") || req.headers.get("RSC") === "1") return;

  if (isDictionaryProxy(url)) {
    event.respondWith(
      caches.open(DICT_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached ?? new Response(JSON.stringify({ error: "offline" }), { status: 503 }));
        return cached ?? network;
      })
    );
    return;
  }

  if (isApi(url)) return;

  if (req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          const shell = await caches.match("/");
          return shell ?? new Response("Offline", { status: 503 });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res.ok && (req.destination === "style" || req.destination === "script" || req.destination === "image" || req.destination === "font")) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached ?? new Response("", { status: 504 }));
    })
  );
});
