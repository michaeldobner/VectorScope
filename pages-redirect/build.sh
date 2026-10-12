#!/bin/sh
# Builds the farewell of GitHub Pages: every old address forwards to the same path on the own server, and the
# old service workers remove themselves and their caches, so a Home Screen icon of the old address opens the server.
set -e
TARGET="${TARGET:-https://vectorscope.duckdns.org}"
OUT="${1:-pages-out}"
rm -rf "$OUT"
for dir in "" air intel news; do
  mkdir -p "$OUT/$dir"
  path="/${dir:+$dir/}"
  cat > "$OUT/$dir/index.html" <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>VectorScope has moved</title>
<link rel="canonical" href="$TARGET$path">
<meta http-equiv="refresh" content="1; url=$TARGET$path">
<script>location.replace('$TARGET$path' + location.search + location.hash);</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0e13;color:#e6e9ef;font:16px system-ui,sans-serif;text-align:center;padding:16px}a{color:#55bdeb}</style>
</head>
<body><p>VectorScope has moved to<br><a href="$TARGET$path">${TARGET#https://}$path</a></p></body>
</html>
HTML
  cat > "$OUT/$dir/sw.js" <<'JS'
// VectorScope moved to its own server: this service worker removes itself and every cache of the old address.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const key of await caches.keys()) await caches.delete(key);
      await self.registration.unregister();
      for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url);
    })(),
  );
});
JS
done
cp "$OUT/index.html" "$OUT/404.html"
touch "$OUT/.nojekyll"
