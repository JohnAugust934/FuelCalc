// Nome do cache e lista de arquivos a serem armazenados em cache
const CACHE_NAME = "fuel-calc-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/icon-256x256.png",
  "/icon-512x512.png",
];

// Evento de instalação do Service Worker
self.addEventListener("install", (event) => {
  // Espera até que todos os arquivos sejam armazenados em cache
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Evento de busca (fetch) do Service Worker
self.addEventListener("fetch", (event) => {
  // Responde com o recurso em cache ou faz uma requisição de rede
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
