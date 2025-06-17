const CACHE_NAME = 'mi-conexion-interna-v4';
const STATIC_CACHE_NAME = 'static-v4';

// URLs principales para cachear
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  // No incluir archivos de Next.js aquí - se manejan automáticamente
];

// Recursos estáticos para cachear
const staticResources = [
  '/icon-192x192.png',
  '/icon-512x512.png',
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

  // Estrategia para páginas HTML
  if (request.destination === 'document') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Servir desde caché pero intentar actualizar en background
          fetch(request).then((response) => {
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response.clone());
              });
            }
          }).catch(() => {
            // Falló la actualización, no hacer nada
          });
          return cachedResponse;
        }

        // No está en caché, intentar red
        return fetch(request).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        }).catch(() => {
          // Si falla completamente, devolver página principal si existe
          return caches.match('/');
        });
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
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir app',
        icon: '/icon-192x192.png'
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