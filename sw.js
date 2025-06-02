// sw.js - Service Worker para FuelCalc

const CACHE_NAME_PREFIX = "fuelcalc-cache";
const CACHE_VERSION = "v1.5.1"; // Incremente esta versão ao atualizar assets (ex: v1.5.0 -> v1.5.1)
const CACHE_NAME = `${CACHE_NAME_PREFIX}-${CACHE_VERSION}`;

// Caminho base para assets no GitHub Pages
const BASE_PATH = "/FuelCalc"; // << IMPORTANTE: Este é o nome do seu repositório

// Lista de arquivos essenciais para o app shell
const APP_SHELL_ASSETS = [
  `${BASE_PATH}/`, // A raiz do app no GitHub Pages
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/styles.css`,
  `${BASE_PATH}/app.js`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/libs/chart.min.js`,
  // Ícones principais
  `${BASE_PATH}/icons/icon-72x72.png`,
  `${BASE_PATH}/icons/icon-96x96.png`,
  `${BASE_PATH}/icons/icon-128x128.png`,
  `${BASE_PATH}/icons/icon-144x144.png`,
  `${BASE_PATH}/icons/icon-152x152.png`,
  `${BASE_PATH}/icons/icon-192x192.png`,
  `${BASE_PATH}/icons/icon-384x384.png`,
  `${BASE_PATH}/icons/icon-512x512.png`,
  `${BASE_PATH}/icons/favicon.ico`, // Adicionado favicon ao cache
  `${BASE_PATH}/icons/favicon-16x16.png`,
  `${BASE_PATH}/icons/favicon-32x32.png`,
];

self.addEventListener("install", (event) => {
  console.log(`[SW] Evento: install (Versão: ${CACHE_VERSION})`);
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Fazendo cache do App Shell:", APP_SHELL_ASSETS);
        // Adiciona todos os assets, ignorando falhas individuais para não quebrar a instalação inteira
        // se um asset opcional falhar (ex: um ícone menos crítico).
        // Para assets críticos, a falha em addAll é preferível.
        const promises = APP_SHELL_ASSETS.map((assetUrl) => {
          return cache.add(assetUrl).catch((err) => {
            console.warn(`[SW] Falha ao cachear ${assetUrl}: ${err}`);
          });
        });
        return Promise.all(promises);
      })
      .then(() => {
        console.log("[SW] App Shell parcialmente ou totalmente cacheado.");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(
          "[SW] Falha crítica ao abrir cache ou skipWaiting:",
          error
        );
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log(`[SW] Evento: activate (Versão: ${CACHE_VERSION})`);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName.startsWith(CACHE_NAME_PREFIX) &&
              cacheName !== CACHE_NAME
            ) {
              console.log("[SW] Deletando cache antigo:", cacheName);
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => {
        console.log("[SW] Caches antigos limpos.");
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  // Estratégia: Cache First, com fallback para Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // Opcional: Adicionar a resposta da rede ao cache dinamicamente
          // Apenas para GETs bem-sucedidos e não opacos (para evitar cache de respostas de erro de CDNs)
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.error(
            "[SW] Erro ao buscar na rede:",
            error,
            event.request.url
          );
          // Para navegação, poderia retornar uma página offline customizada
          // if (event.request.mode === 'navigate') {
          //   return caches.match(`${BASE_PATH}/offline.html`);
          // }
          throw error;
        });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
