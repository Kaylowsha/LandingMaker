const CACHE = 'ap3d-v3';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/assets/logo.png',
  '/assets/hero-bg.jpg',
  '/assets/portfolio-1.jpg',
  '/assets/portfolio-2.jpg',
  '/assets/portfolio-3.jpg',
  '/assets/portfolio-5.jpg',
  '/assets/portfolio-6.jpg',
  '/assets/og-image.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
    )
  );
});
