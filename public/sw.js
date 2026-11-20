// Sube el número de versión cada vez que cambies la estrategia de caché o agregues pantallas
const CACHE_NAME = 'mi-conexion-interna-v23';
const STATIC_CACHE_NAME = 'static-v23';

// URLs principales para cachear
const urlsToCache = [
  '/',
  '/dashboard',
  '/historial',
  '/manifest.json',
  // No incluir archivos de Next.js aquí - se manejan automáticamente
];

// Recursos estáticos para cachear
const staticResources = [
  '/icon-72x72.png?v=2',
  '/icon-96x96.png?v=2',
  '/icon-128x128.png?v=2',
  '/icon-144x144.png?v=2',
  '/icon-152x152.png?v=2',
  '/icon-192x192.png?v=2',
  '/icon-384x384.png?v=2',
  '/icon-512x512.png?v=2',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
      }),
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(staticResources);
      })
    ])
  );
  // Activar inmediatamente
  self.skipWaiting();
});

// Activación - limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediatamente
  self.clients.claim();
});

// Estrategia de caché
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia para páginas HTML: RED PRIMERO (siempre la versión más nueva).
  // La caché solo se usa si no hay internet.
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copia = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, copia);
            });
          }
          return response;
        })
        .catch(() => {
          // Sin conexión: página guardada, o la principal como último recurso
          return caches.match(request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // Estrategia para recursos estáticos (imágenes, íconos)
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.status === 200) {
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Para otros recursos, usar estrategia de red primero
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Manejo de notificaciones push (preparado para futuro)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png?v=2',
    badge: '/icon-72x72.png?v=2',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir app',
        icon: '/icon-192x192.png?v=2'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Mi Conexión Interna', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});