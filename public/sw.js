/**
 * BotanIA Service Worker — Mode Hors-ligne Amélioré
 * =================================================
 * Cache les assets pour usage au jardin sans réseau
 * Strategies:
 * - Cache-First pour assets statiques (JS, CSS, images)
 * - Network-First pour pages (avec fallback offline)
 * - Stale-While-Revalidate pour données météo
 */

const CACHE_NAME = 'botania-v2';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
];

const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|eot|ico)$/;
const NEXT_ASSETS = /\/_next\//;
const IMAGE_ASSETS = /\/images\/|\/cards\/|\/plants\/|\/trees\//;

// ─── Installation ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Pré-cache les assets critiques
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch (err) {
        console.warn('SW: some precache URLs failed', err);
      }
    })
  );
  self.skipWaiting();
});

// ─── Activation ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name.startsWith('botania-'))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Stratégie de routage ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Skip cross-origin (sauf fonts Google, CDN)
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // API routes — network first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, CACHE_NAME));
    return;
  }

  // Météo — stale-while-revalidate
  if (url.pathname.includes('open-meteo.com') || url.pathname.includes('/api/weather')) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }

  // Images de plantes — cache first
  if (IMAGE_ASSETS.test(url.pathname) || url.pathname.includes('/cards/')) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_NAME));
    return;
  }

  // Assets statiques (JS, CSS, fonts) — cache first
  if (STATIC_EXTENSIONS.test(url.pathname) || NEXT_ASSETS.test(url.pathname)) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_NAME));
    return;
  }

  // Pages (navigation) — network first avec offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request, CACHE_NAME));
    return;
  }

  // Tout le reste — cache first
  event.respondWith(cacheFirstWithNetwork(request, CACHE_NAME));
});

// ─── Stratégies de cache ───

/**
 * Cache-First — pour assets statiques qui changent rarement
 */
async function cacheFirstWithNetwork(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || new Response('Asset not available offline', { status: 503 });
  }
}

/**
 * Network-First — pour les pages et API
 */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Network-First avec offline fallback HTML
 */
async function networkFirstWithOfflineFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Try offline page
    const offlinePage = await cache.match(OFFLINE_URL);
    if (offlinePage) return offlinePage;

    // Final fallback — page minimale
    return new Response(
      `<!DOCTYPE html><html><head><title>BotanIA — Hors ligne</title></head>
       <body style="font-family:sans-serif;padding:2rem;text-align:center;background:#faf8f4">
       <h1>🌱 BotanIA</h1>
       <p>Vous êtes hors ligne. Réessayez quand vous aurez du réseau.</p>
       <button onclick="location.reload()" style="padding:0.5rem 1rem;cursor:pointer">
         Réessayer
       </button></body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Stale-While-Revalidate — pour données météo (rapide mais frais)
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise || new Response('{}', { status: 200 });
}

// ─── Notifications Push ───
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    tag: 'botania-notif',
    requireInteraction: data.urgent || false,
    data: { url: data.url || '/' },
    actions: data.actions || [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Ignorer' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🌱 BotanIA', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// ─── Background Sync ───
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-journal') {
    event.waitUntil(syncJournal());
  }
});

async function syncJournal() {
  // Sync journal entries when back online
  // Implementation depends on backend
  console.log('SW: sync-journal event fired');
}
