// sw.js - Service Worker para FuelCalc
const CACHE_NAME_PREFIX = "fuelcalc-cache";
const CACHE_VERSION = "v1.6.2"; // Incremented version
const STATIC_CACHE_NAME = `${CACHE_NAME_PREFIX}-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME_PREFIX}-dynamic-${CACHE_VERSION}`;
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
  console.log(`[SW] Evento: install (Versão do Cache: ${STATIC_CACHE_NAME})`);
  e.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((c) => {
        console.log("[SW] A fazer cache do App Shell:", APP_SHELL_ASSETS);
        return c.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        console.log("[SW] App Shell cacheado com sucesso.");
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error(
          "[SW] Falha ao fazer cache do App Shell durante a instalação:",
          err
        );
      })
  );
});

self.addEventListener("activate", (e) => {
  console.log(`[SW] Evento: activate (Versão Ativa: ${CACHE_VERSION})`);
  e.waitUntil(
    caches
      .keys()
      .then((c) => {
        return Promise.all(
          c.map((n) => {
            if (
              n.startsWith(CACHE_NAME_PREFIX) &&
              n !== STATIC_CACHE_NAME &&
              n !== DYNAMIC_CACHE_NAME
            ) {
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
      .catch((err) => {
        console.error(
          "[SW] Erro durante a ativação ou limpeza de caches antigos:",
          err
        );
      })
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const isExternal = url.hostname !== self.location.hostname;

  // Estratégia Stale-While-Revalidate para recursos externos (fontes, CDNs)
  if (isExternal) {
    e.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(e.request);
        const fetchedResponsePromise = fetch(e.request)
          .then((networkResponse) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          })
          .catch((err) => {
            console.error("[SW] Erro ao buscar recurso externo na rede:", err);
          });
        return cachedResponse || fetchedResponsePromise;
      })
    );
  }
  // Estratégia Cache-First para recursos locais (App Shell)
  else {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(e.request)
            .then((networkResponse) => {
              // Opcional: Adicionar novos recursos locais ao cache dinâmico se não estiverem no estático.
              // Isso pode ser útil, mas por enquanto, focamos no App Shell estático.
              return networkResponse;
            })
            .catch(() => {
              // Fallback para uma página offline pode ser adicionado aqui se necessário.
              console.error(
                "[SW] Falha ao buscar recurso local na rede e não encontrado em cache:",
                e.request.url
              );
            })
        );
      })
    );
  }
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
