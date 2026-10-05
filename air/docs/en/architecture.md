# Architecture

[Deutsche Version](../de/architektur.md) · [Overview](README.md)

## Overview

VectorScope Air is module AIR of the VectorScope collection and a single page application without its own backend. How it fits into the repository (hub, `shared/`, build, service worker scopes) is described in the [architecture of the collection](../../../docs/en/architecture.md). It is built with Vite into static files and served by GitHub Pages. Everything personal stays in the browser. The only optional server component is a small proxy that adds CORS headers to adsb.lol responses.

```
iPhone / iPad (Safari, installed web app)
 └─ VectorScope (static files from GitHub Pages)
     ├─ adsb.lol ............ live positions, military, emergencies, search, routes
     │    └─ optional: Vercel proxy (proxy/) when the browser blocks direct access
     ├─ OpenFreeMap ......... vector tiles and fonts for the basemap
     └─ planespotters.net ... aircraft photos
```

Core principle: **feed → store → derived state → view.** Geometry and scoring are pure functions without access to the document, so they are tested in Node.js.

## Modules

```
src/
├─ main.tsx              start: fonts, styles, traffic store, service worker
├─ App.tsx               layouts, top bar, search, map controls, bottom sheet, error banner, notices
├─ styles.css            layouts and components, colours from shared/tokens.css
├─ geo/
│  ├─ geo.ts             distance, bearing, destination, local offset, elevation, closest approach, projection
│  ├─ overhead.ts        sky geometry per aircraft, overhead classes, sort order
│  └─ geo.test.ts        unit tests
├─ data/
│  ├─ types.ts           normalised Aircraft model, database flags
│  ├─ adsblol.ts         parser for readsb v2 JSON and route responses
│  ├─ feed.ts            transports (direct, proxy, demo), requests, route and photo cache
│  ├─ demo.ts            synthetic traffic for demo mode and screenshots
│  ├─ catalog.ts         roles, rarity, callsign groups, government operators
│  └─ score.ts           interest score, tone (colour meaning), display name of the type
├─ state/
│  ├─ settings.ts        settings in localStorage, URL flags
│  ├─ traffic.ts         live store: polling, history, alerts, selection, location
│  └─ watch.ts           watchlist matching
├─ map/
│  ├─ MapView.tsx        MapLibre map, overlay layers, animation loop, interaction
│  ├─ style.ts           basemap style
│  └─ icons.ts           aircraft and helicopter glyphs
├─ lib/format.ts         German number format, units
└─ ui/
   ├─ Inspector.tsx      aircraft inspector
   ├─ Lists.tsx          Airspace now, Nearby, Overhead, Notable, Watchlist
   ├─ SettingsSheet.tsx  settings
   ├─ useLayout.ts       layout choice, one-second tick
   └─ tokens.ts          colours for the map
```

## Data flow of one update

1. `traffic.ts` calls `fetchNearby(lat, lon, radius)` every `pollSec` seconds while the page is visible.
2. `feed.ts` chooses the transport. In **auto** mode it tries adsb.lol directly. If the browser blocks the request (CORS) or adsb.lol answers 403 and a proxy is configured, it switches to the proxy and remembers this for the session.
3. `adsblol.ts` normalises the readsb JSON into `Aircraft` objects: upper-case hex, altitude in feet or `onGround`, position source, time of the position.
4. `ingest()` in `traffic.ts` builds the new aircraft map. For each aircraft it
   * appends the position to the history (only after 60 m of movement, kept for 30 minutes),
   * matches the watchlist,
   * computes the interest score (`score.ts`),
   * computes the sky geometry (`overhead.ts`),
   * creates a notice if a watchlist match or a special squawk enters the radius.
5. The store emits a new version. React components subscribed with `useSyncExternalStore` re-render.
6. `MapView` redraws the overlay sources. Independently, an animation loop moves every aircraft forward by dead reckoning ten times per second.

Notable now runs the same way every 60 seconds with `/v2/mil` and `/v2/sqk/7700`.

## State

| Store | Contents | Persistence |
|---|---|---|
| `settings.ts` | Location, GPS on or off, your altitude, radius, data source, proxy, refresh interval, units, watchlist, filter | `localStorage` key `vectorscope.settings.v1` |
| `traffic.ts` | Observer position, aircraft with history, score and geometry, status, errors, transport, Notable now, selection, notices | Memory only |

Both stores are small observable modules without a framework. Components read them with `useSyncExternalStore`.

## Map rendering

`MapView.tsx` creates one MapLibre map and adds overlay sources and layers as soon as the style is parsed, without waiting for basemap tiles. If the tile server fails, aircraft still appear.

| Layer | Type | Content |
|---|---|---|
| `rings`, `ring-labels` | line, symbol | Range rings and their labels |
| `trails` | line | Five-minute trails of interesting aircraft |
| `sel-trail`, `sel-trail-old` | line | Track of the selected aircraft, solid and dotted |
| `projection` | line | Dashed projection for three minutes |
| `ac-watch-ring`, `ac-selected` | circle | Watchlist ring, selection halo |
| `ac-icon` | symbol | Aircraft glyph, tinted, rotated, sorted by importance |
| `ac-label-std`, `ac-label-hi` | symbol | Labels for regular (from zoom 9.5) and highlighted aircraft |
| `observer-ring`, `observer-dot` | circle | Your position |

A tap queries a 32 × 32 pixel box and selects the most important aircraft under the finger.

## Layouts

`useLayout()` returns one of four layouts from the window size:

| Layout | Condition |
|---|---|
| `wide` | Width ≥ 1000 and width ≥ height, or width ≥ 700 in landscape |
| `tablet-portrait` | Width ≥ 700 and height > width |
| `phone-landscape` | Landscape with height < 560 |
| `phone-portrait` | Everything else |

`App.tsx` composes the same building blocks (map, Airspace now, lists, inspector) differently for each layout. Map padding follows the layout, so the radius is framed in the visible part of the map.

## Offline and updates

`public/sw.js` caches the app shell in `vectorscope-air-v1`. It is registered from `air/` and therefore only controls this module. Page requests go to the network first and fall back to the cache. Hashed assets are served from the cache. Live data, tiles and photos are never cached by the service worker.

## Proxy

`proxy/api/proxy.js` is a Vercel serverless function. It only forwards a whitelist of read-only adsb.lol paths, sets a User-Agent with contact information as adsb.lol asks, adds CORS headers, optionally checks a shared token and caches GET responses for two seconds at the edge. Details: [Deployment](../../../docs/en/deployment.md#cors-proxy-on-vercel).
