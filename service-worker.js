// ViVuTraVinh Service Worker
// Version 1.0.0

const CACHE_NAME = 'vivutravinh-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './aobaom-8-1024x588.jpg',
  './Thoi-gian-dep-de-di-du-lich-bien-ba-dong.webp',
  './bun-nuoc-leo-tra-vinh-1-1739012793.jpeg',
  // CDN resources (cache for performance)
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 [Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ [Service Worker] Installation complete');
        return self.skipWaiting(); // Force activate immediately
      })
      .catch((err) => {
        console.error('❌ [Service Worker] Installation failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 [Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ [Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ [Service Worker] Activation complete');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Chrome extensions and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('💾 [Service Worker] Serving from cache:', event.request.url);
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache new resources dynamically
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache images and common resources
              if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|css|js)$/i)) {
                console.log('💾 [Service Worker] Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch((err) => {
          console.error('❌ [Service Worker] Fetch failed:', err);
          
          // Return offline page or placeholder
          if (event.request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#f1f5f9" width="400" height="300"/><text x="50%" y="50%" fill="#94a3b8" font-size="16" text-anchor="middle">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        });
      })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ [Service Worker] Skip waiting');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ [Service Worker] Clearing cache');
    caches.delete(CACHE_NAME).then(() => {
      console.log('✅ [Service Worker] Cache cleared');
    });
  }
});

console.log('📱 [Service Worker] Loaded and ready!');
