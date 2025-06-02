// sw.js - Service Worker para FuelCalc

// Prefixo para os nomes de cache, ajuda a identificar os caches desta aplicação.
const CACHE_NAME_PREFIX = "fuelcalc-cache";
// VERSÃO DO CACHE: MUITO IMPORTANTE!
// Incremente esta versão CADA VEZ que atualizar qualquer ficheiro em APP_SHELL_ASSETS.
// Isso força o Service Worker a reinstalar e buscar os ficheiros mais recentes.
const CACHE_VERSION = "v1.5.2"; // Sincronizado com a versão da app ou incrementado para forçar atualização.
const CACHE_NAME = `${CACHE_NAME_PREFIX}-${CACHE_VERSION}`;

// Caminho base para os assets, especialmente útil para GitHub Pages.
// Se o seu repositório for https://SEU_USUARIO.github.io/FuelCalc/, então BASE_PATH é "/FuelCalc".
// Se estiver na raiz do domínio, pode ser "" ou "/".
const BASE_PATH = "/FuelCalc";

// Lista de todos os ficheiros essenciais que compõem o "App Shell" da aplicação.
// Estes ficheiros são necessários para que a aplicação funcione offline.
const APP_SHELL_ASSETS = [
  // HTML, CSS, Manifest principais
  `${BASE_PATH}/`, // A raiz da aplicação (geralmente serve o index.html)
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/styles.css`,
  `${BASE_PATH}/manifest.json`,

  // Bibliotecas de terceiros (ex: Chart.js)
  `${BASE_PATH}/libs/chart.min.js`,

  // Módulos JavaScript principais
  `${BASE_PATH}/js/main.js`, // Ponto de entrada da aplicação
  `${BASE_PATH}/js/config.js`,
  `${BASE_PATH}/js/utils.js`,
  `${BASE_PATH}/js/validator.js`,

  // Módulos de Gestores (Managers)
  `${BASE_PATH}/js/managers/AppManager.js`,
  `${BASE_PATH}/js/managers/LanguageManager.js`,
  `${BASE_PATH}/js/managers/UIManager.js`,
  `${BASE_PATH}/js/managers/StorageManager.js`,
  `${BASE_PATH}/js/managers/VehicleManager.js`,
  `${BASE_PATH}/js/managers/FuelCalculator.js`,
  `${BASE_PATH}/js/managers/HistoryManager.js`,
  `${BASE_PATH}/js/managers/StatisticsManager.js`,

  // Ícones principais da aplicação e favicons
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
  // Adicionar aqui outros assets estáticos importantes, como imagens de logo se usadas no HTML inicial.
  // Ex: `${BASE_PATH}/images/logo.svg`,
];

// Evento 'install': é acionado quando o Service Worker é registado pela primeira vez
// ou quando uma nova versão do Service Worker é detetada pelo navegador.
self.addEventListener("install", (event) => {
  console.log(`[SW] Evento: install (Versão do Cache: ${CACHE_NAME})`);
  // event.waitUntil() garante que o Service Worker não será instalado
  // até que o código dentro dele seja concluído com sucesso.
  event.waitUntil(
    caches
      .open(CACHE_NAME) // Abre o cache com o nome versionado.
      .then((cache) => {
        console.log("[SW] A fazer cache do App Shell:", APP_SHELL_ASSETS);
        // Adiciona todos os assets do App Shell ao cache.
        // Se algum asset falhar ao ser cacheado, a promessa de addAll() será rejeitada,
        // e a instalação do Service Worker falhará. Isso é geralmente o desejado para assets críticos.
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        console.log("[SW] App Shell cacheado com sucesso.");
        // Força o novo Service Worker a saltar a fase de 'waiting' e a tornar-se ativo imediatamente.
        // Isto é útil para que as atualizações da aplicação sejam aplicadas mais rapidamente
        // sem que o utilizador precise de fechar todas as abas da aplicação.
        return self.skipWaiting();
      })
      .catch((error) => {
        // Se ocorrer um erro durante o cacheamento, regista-o no console.
        // A instalação do Service Worker falhará, e o Service Worker antigo (se houver) continuará ativo.
        console.error(
          "[SW] Falha ao fazer cache do App Shell durante a instalação:",
          error
        );
      })
  );
});

// Evento 'activate': é acionado após a instalação bem-sucedida do Service Worker
// e quando ele está pronto para assumir o controlo da página (clientes).
// É um bom local para limpar caches antigos que não são mais necessários.
self.addEventListener("activate", (event) => {
  console.log(`[SW] Evento: activate (Versão do Cache Ativo: ${CACHE_NAME})`);
  event.waitUntil(
    caches
      .keys() // Obtém os nomes de todos os caches existentes.
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Verifica se o nome do cache começa com o prefixo da nossa aplicação
            // e se NÃO é o nome do cache atualmente ativo.
            if (
              cacheName.startsWith(CACHE_NAME_PREFIX) &&
              cacheName !== CACHE_NAME
            ) {
              console.log("[SW] A eliminar cache antigo:", cacheName);
              return caches.delete(cacheName); // Elimina o cache antigo.
            }
            return null; // Retorna null para caches que não devem ser eliminados.
          })
        );
      })
      .then(() => {
        console.log("[SW] Caches antigos limpos com sucesso.");
        // Permite que o Service Worker ativado controle os clientes (abas/janelas abertas da aplicação)
        // imediatamente, em vez de esperar que sejam recarregados.
        return self.clients.claim();
      })
      .catch((error) => {
        console.error(
          "[SW] Erro durante a ativação ou limpeza de caches antigos:",
          error
        );
      })
  );
});

// Evento 'fetch': é acionado para cada requisição de rede feita pela página
// (ex: para buscar HTML, CSS, JS, imagens, dados de API).
// Permite intercetar estas requisições e responder com dados do cache ou da rede.
self.addEventListener("fetch", (event) => {
  // Ignora requisições que não são do tipo GET (ex: POST, PUT) ou que são de extensões do Chrome.
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    // Deixa o navegador tratar estas requisições normalmente.
    return;
  }

  // Estratégia: Cache First, com fallback para a Rede.
  // 1. Tenta encontrar a resposta no cache.
  // 2. Se encontrada, retorna a resposta do cache.
  // 3. Se não encontrada, busca na rede.
  // 4. (Opcional) Se a busca na rede for bem-sucedida, armazena a resposta no cache para uso futuro.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // console.log("[SW] Recurso encontrado no cache:", event.request.url);
        return cachedResponse; // Retorna a resposta do cache.
      }

      // console.log("[SW] Recurso não encontrado no cache, a buscar na rede:", event.request.url);
      // Clona a requisição porque ela só pode ser consumida uma vez (pelo fetch e pelo cache.put).
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((networkResponse) => {
          // Verifica se a resposta da rede é válida antes de cachear.
          // Respostas 'basic' são do mesmo domínio. Evita cachear respostas opacas de CDNs de terceiros
          // que podem não ser o que esperamos ou podem levar a um uso excessivo de espaço em disco.
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseToCache = networkResponse.clone(); // Clona a resposta para o cache.
            caches.open(CACHE_NAME).then((cache) => {
              // console.log("[SW] A cachear novo recurso da rede:", event.request.url);
              cache.put(event.request, responseToCache); // Adiciona a resposta ao cache.
            });
          }
          return networkResponse; // Retorna a resposta da rede para a página.
        })
        .catch((error) => {
          console.error(
            "[SW] Erro ao buscar na rede:",
            error,
            "URL:",
            event.request.url
          );
          // Opcional: Se a requisição for para navegação de página e falhar (offline e não em cache),
          // pode-se retornar uma página de fallback offline personalizada.
          // if (event.request.mode === 'navigate') {
          //   return caches.match(`${BASE_PATH}/offline.html`); // Certifique-se de que 'offline.html' está no APP_SHELL_ASSETS.
          // }
          // Para outros tipos de assets, ou se não houver página offline, simplesmente lança o erro.
          throw error;
        });
    })
  );
});

// Opcional: Listener para mensagens enviadas pela página (cliente) para o Service Worker.
// Útil para comandos como forçar o Service Worker a saltar a fase de 'waiting'.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Mensagem SKIP_WAITING recebida. A ativar novo SW.");
    self.skipWaiting();
  }
});
