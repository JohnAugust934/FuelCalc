// sw.js - Service Worker para FuelCalc
const CACHE_NAME_PREFIX = "fuelcalc-cache";
const CACHE_VERSION = "v1.5.4";
const CACHE_NAME = `${CACHE_NAME_PREFIX}-${CACHE_VERSION}`;
const BASE_PATH = "/FuelCalc";

const APP_SHELL_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/styles.css`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/translations.js`,
  `${BASE_PATH}/app.js`,
  `${BASE_PATH}/libs/chart.min.js`,
  `${BASE_PATH}/icons/icon-72x72.png`,
  `${BASE_PATH}/icons/icon-96x96.png`,
  `${BASE_PATH}/icons/icon-128x128.png`,
  `${BASE_PATH}/icons/icon-144x144.png`,
  `${BASE_PATH}/icons/icon-152x152.png`,
  `${BASE_PATH}/icons/icon-192x192.png`,
  `${BASE_PATH}/icons/icon-384x384.png`,
  `${BASE_PATH}/icons/icon-512x512.png`,
  `${BASE_PATH}/icons/favicon.ico`,
  `${BASE_PATH}/icons/favicon-16x16.png`,
  `${BASE_PATH}/icons/favicon-32x32.png`,
];

self.addEventListener("install", (e) => {
  console.log(`[SW] Evento: install (Versão do Cache: ${CACHE_NAME})`);
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) => {
        console.log("[SW] A fazer cache do App Shell:", APP_SHELL_ASSETS);
        return c.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        console.log("[SW] App Shell cacheado com sucesso.");
        return self.skipWaiting();
      })
      .catch((e) => {
        console.error(
          "[SW] Falha ao fazer cache do App Shell durante a instalação:",
          e
        );
      })
  );
});
self.addEventListener("activate", (e) => {
  console.log(`[SW] Evento: activate (Versão do Cache Ativo: ${CACHE_NAME})`);
  e.waitUntil(
    caches
      .keys()
      .then((c) => {
        return Promise.all(
          c.map((n) => {
            if (n.startsWith(CACHE_NAME_PREFIX) && n !== CACHE_NAME) {
              console.log("[SW] A eliminar cache antigo:", n);
              return caches.delete(n);
            }
            return null;
          })
        );
      })
      .then(() => {
        console.log("[SW] Caches antigos limpos com sucesso.");
        return self.clients.claim();
      })
      .catch((e) => {
        console.error(
          "[SW] Erro durante a ativação ou limpeza de caches antigos:",
          e
        );
      })
  );
});
self.addEventListener("fetch", (e) => {
  if (
    e.request.method !== "GET" ||
    e.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((r) => {
      if (r) {
        return r;
      }
      const f = e.request.clone();
      return fetch(f)
        .then((n) => {
          if (n && n.status === 200 && n.type === "basic") {
            const t = n.clone();
            caches.open(CACHE_NAME).then((c) => {
              c.put(e.request, t);
            });
          }
          return n;
        })
        .catch((o) => {
          console.error(
            "[SW] Erro ao buscar na rede:",
            o,
            "URL:",
            e.request.url
          );
          throw o;
        });
    })
  );
});
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
