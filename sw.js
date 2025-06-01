// sw.js - Service Worker para FuelCalc

// Nome do cache (IMPORTANTE: mude a versão para forçar a atualização do cache)
const CACHE_NAME_PREFIX = "fuelcalc-cache";
const CACHE_VERSION = "v3.0.0"; // Incremente esta versão ao atualizar assets
const CACHE_NAME = `${CACHE_NAME_PREFIX}-${CACHE_VERSION}`;

// Lista de arquivos essenciais para o app shell (funcionamento básico offline)
// Adicione aqui todos os arquivos que seu app precisa para iniciar.
const APP_SHELL_ASSETS = [
  "/", // A raiz do app (geralmente serve index.html)
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/libs/chart.min.js", // Assumindo que Chart.js está local
  // Ícones principais (adicione todos os tamanhos importantes referenciados no manifest)
  "/icons/icon-72x72.png",
  "/icons/icon-96x96.png",
  "/icons/icon-128x128.png",
  "/icons/icon-144x144.png",
  "/icons/icon-152x152.png",
  "/icons/icon-192x192.png",
  "/icons/icon-384x384.png",
  "/icons/icon-512x512.png",
  // Adicione uma imagem de logo/splash se usada no HTML inicial
  // "/images/logo.svg",
];

// Evento de instalação: chamado quando o SW é registrado pela primeira vez ou atualizado.
self.addEventListener("install", (event) => {
  console.log(`[Service Worker] Evento: install (Versão: ${CACHE_VERSION})`);
  // Espera até que o cache do app shell seja preenchido.
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log(
          "[Service Worker] Fazendo cache do App Shell:",
          APP_SHELL_ASSETS
        );
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        console.log("[Service Worker] App Shell cacheado com sucesso.");
        // Força o novo Service Worker a se tornar ativo imediatamente.
        // Útil para que as atualizações sejam aplicadas mais rapidamente.
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(
          "[Service Worker] Falha ao fazer cache do App Shell:",
          error
        );
      })
  );
});

// Evento de ativação: chamado após a instalação e quando o SW assume o controle.
// É um bom lugar para limpar caches antigos.
self.addEventListener("activate", (event) => {
  console.log(`[Service Worker] Evento: activate (Versão: ${CACHE_VERSION})`);
  // Espera até que os caches antigos sejam removidos.
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Deleta caches que não são o CACHE_NAME atual e pertencem a este app.
            if (
              cacheName.startsWith(CACHE_NAME_PREFIX) &&
              cacheName !== CACHE_NAME
            ) {
              console.log(
                "[Service Worker] Deletando cache antigo:",
                cacheName
              );
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
      .then(() => {
        console.log("[Service Worker] Caches antigos limpos.");
        // Permite que o Service Worker ativado controle os clientes (abas abertas) imediatamente.
        return self.clients.claim();
      })
  );
});

// Evento de fetch: intercepta todas as requisições de rede da página.
self.addEventListener("fetch", (event) => {
  // Ignora requisições que não são GET (ex: POST) ou de extensões do Chrome.
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  // Estratégia: Cache First, com fallback para Network para assets do App Shell.
  // Para outras requisições, pode-se usar Network First ou Stale-While-Revalidate.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Se o recurso estiver no cache, retorna-o.
      if (cachedResponse) {
        // console.log("[Service Worker] Recurso encontrado no cache:", event.request.url);
        return cachedResponse;
      }

      // Se não estiver no cache, busca na rede.
      // console.log("[Service Worker] Recurso não encontrado no cache, buscando na rede:", event.request.url);
      return fetch(event.request)
        .then((networkResponse) => {
          // Opcional: Adicionar a resposta da rede ao cache dinamicamente para futuras requisições.
          // Cuidado ao cachear tudo, pode encher o cache rapidamente.
          // Melhor para assets que não mudam frequentemente ou para uma estratégia Stale-While-Revalidate.
          // if (networkResponse && networkResponse.status === 200) {
          //   const responseToCache = networkResponse.clone();
          //   caches.open(CACHE_NAME).then((cache) => {
          //     cache.put(event.request, responseToCache);
          //   });
          // }
          return networkResponse;
        })
        .catch((error) => {
          console.error(
            "[Service Worker] Erro ao buscar na rede:",
            error,
            event.request.url
          );
          // Opcional: Retornar uma página de fallback offline genérica se a busca falhar.
          // if (event.request.mode === 'navigate') { // Se for uma navegação de página
          //   return caches.match('/offline.html'); // Você precisaria criar e cachear offline.html
          // }
          // Retorna um erro para que o navegador lide com ele.
          throw error;
        });
    })
  );
});

// Opcional: Listener para mensagens do cliente (ex: para acionar skipWaiting de uma UI)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
