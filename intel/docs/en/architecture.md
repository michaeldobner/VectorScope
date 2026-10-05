# Architecture

[Deutsche Version](../de/architektur.md) · [Overview](README.md)

INTEL is module INTEL of the VectorScope collection: a React single page application without its own backend, built with Vite into `dist/intel/`. How it fits into the repository is described in the [architecture of the collection](../../../docs/en/architecture.md).

```
iPhone / iPad
 └─ INTEL (static files from GitHub Pages)
     ├─ public.api.bsky.app ......................... Bluesky posts, directly
     ├─ vectorscope-proxy.vercel.app/feed/{id} ...... RSS feeds, cached five minutes
     └─ vectorscope-proxy.vercel.app/v2/mil ......... live military aircraft from adsb.lol
```

## Modules

```
intel/src/
├─ main.tsx              start: fonts, shared tokens, store, service worker
├─ App.tsx               top bar, tabs, filters, feed, Live now, Places, Sources
├─ styles.css            layout and components, colours from shared/tokens.css
├─ data/
│  ├─ sources.ts         the verified sources
│  ├─ rss.ts             RSS and Atom parser without DOMParser
│  ├─ bluesky.ts         own posts of an account from the public API
│  ├─ text.ts            HTML to text, entities, URL key for deduplication
│  ├─ feed.ts            loading with fallback, merging, live aircraft
│  ├─ entities.ts        callsigns and aircraft types
│  ├─ places.ts          gazetteer of about 100 places
│  ├─ match.ts           live match
│  ├─ demo.ts            synthetic items and aircraft
│  └─ types.ts           Item, Match, EnrichedItem
├─ state/store.ts        state, polling, cache, preferences
└─ ui/                   formatting, layout hook
```

INTEL reuses the callsign catalogue, the aircraft parser and the distance calculation of AIR (`air/src/data/catalog.ts`, `adsblol.ts`, `geo/geo.ts`). Both modules therefore recognise the same callsigns and compute distances the same way.

## Data flow

1. On start the last cached feed is shown at once.
2. Live military aircraft are loaded, then all sources, four at a time.
3. Each source loads its channels in parallel. RSS goes through the proxy and falls back to a direct request. A source fails only when all its channels fail.
4. All items are merged: duplicates by URL (a post and the article it links) become one item, items older than 14 days are dropped.
5. Entities are extracted once per item, matches are computed again whenever items or live aircraft change.
6. The feed reloads every five minutes and the live aircraft every two minutes, only while the page is visible.

## Proxy route

`/feed/{id}` in `proxy/api/proxy.js` serves only the feeds in its fixed list `FEEDS`, so it is not an open proxy. It sends a User-Agent with contact information and caches responses for five minutes at Vercel's edge. A test checks that `FEEDS` and the RSS addresses in `sources.ts` are identical, and that INTEL and AIR use the same proxy.

## Storage

| Key | Contents |
|---|---|
| `vectorscope.intel.v1` | Filter, place filter, time of the last seen item |
| `vectorscope.intel.cache.v1` | The last 300 items, for an instant start and offline use |

Service worker `public/sw.js` with cache `vectorscope-intel-v1` keeps the app shell. Feeds and live data always go to the network.

## Tests

| File | Covers |
|---|---|
| `data/rss.test.ts` | RSS with CDATA and entities, Atom, WordPress footers, dashes, Bluesky parsing, merging, age limit |
| `data/entities.test.ts` | Callsigns, false positives, types, places in English and German, word boundaries, live match rules |
| `data/sources.test.ts` | Unique sources, proxy list equals source list, same proxy as AIR |

The smoke test opens INTEL in demo mode on four device sizes, the test lab opens it with live data and follows the first live match into AIR.
