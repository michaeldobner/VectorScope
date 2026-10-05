// Hub service worker. Caches only the hub page and the shared files.
// Modules register their own service worker with a narrower scope (air/sw.js), which takes precedence there.
const CACHE = 'vectorscope-hub-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './shared/tokens.css', './shared/hub.css'];
// Caches of earlier versions: 'vectorscope-v1' belonged to the flights app when it still lived at the root.
const KEEP_PREFIX = 'vectorscope-air-';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && !k.startsWith(KEEP_PREFIX)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope).pathname;
  const rel = url.pathname.slice(scope.length);
  // Only the hub itself and shared files. Module paths go straight to the network or their own worker.
  const isHub = rel === '' || rel === 'index.html' || rel === 'manifest.webmanifest' || rel.startsWith('shared/');
  if (!isHub) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html'))),
  );
});
