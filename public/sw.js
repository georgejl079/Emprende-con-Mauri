// Service Worker básico para EMPRENDE CON MAURI
const CACHE_NAME = 'emprende-mauri-v1'
const urlsToCache = [
  '/',
  '/sites/ruta/',
  '/shared/css/styles.css',
  '/shared/js/app.js'
]

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Install')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache opened')
        return cache.addAll(urlsToCache)
      })
      .catch(err => {
        console.log('[SW] Cache addAll failed:', err)
      })
  )
  self.skipWaiting()
})

// Activar Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activate')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Delete old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Interceptar requests
self.addEventListener('fetch', event => {
  // Solo interceptar GET requests
  if (event.request.method !== 'GET') return
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response
        }
        
        // Clone the request
        const fetchRequest = event.request.clone()
        
        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // Clone the response
          const responseToCache = response.clone()
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache)
            })
          
          return response
        }).catch(() => {
          // If fetch fails, return offline fallback
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/sites/ruta/')
          }
        })
      })
  )
})