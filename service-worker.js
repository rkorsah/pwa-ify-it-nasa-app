const SHELL_CACHE = 'space-explorer-shell-v1';
const API_CACHE = 'space-explorer-apod-v1';
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './js/dateRange.js',
  './js/script.js',
  './js/pwa.js',
  './img/nasa-worm-logo.png',
  './img/icon-192.svg',
  './img/icon-512.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key !== SHELL_CACHE && key !== API_CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method === 'GET'
    && requestUrl.hostname === 'api.nasa.gov'
    && requestUrl.pathname === '/planetary/apod') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (event.request.method === 'GET' && requestUrl.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    return new Response(JSON.stringify({ error: 'Offline and no cached response is available.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  if (request.mode === 'navigate') {
    const cachedPage = await caches.match('./index.html');
    if (cachedPage) return cachedPage;
  }

  return fetch(request);
}