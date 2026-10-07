# Architecture

[Deutsche Version](../de/architektur.md) · [Overview](README.md)

INTEL is module INTEL of the VectorScope collection: a React single page application without its own backend, built with Vite into `dist/intel/`. How it fits into the repository is described in the [architecture of the collection](../../../docs/en/architecture.md).

```
iPhone / iPad
 └─ INTEL (static files from GitHub Pages)
     ├─ public.api.bsky.app ......................... Bluesky posts, directly
     ├─ vectorscope-proxy.vercel.app/tg/{channel} ... Telegram channels, cached one minute
     ├─ raw.githubusercontent.com ................... reports of the probe collector, branch collector-data
     ├─ vectorscope-proxy.vercel.app/feed/{id} ...... RSS feeds, cached five minutes
     └─ vectorscope-proxy.vercel.app/v2/mil ......... live military aircraft from adsb.lol
```

## Modules

```
intel/src/
├─ main.tsx              start: fonts, shared tokens, store, service worker
├─ App.tsx               top bar, tabs, filters, Stories, Wire, Live now, Places, Sources
├─ styles.css            layout and components, colours from shared/tokens.css
├─ data/
│  ├─ sources.ts         the verified sources
│  ├─ rss.ts             RSS and Atom parser without DOMParser
│  ├─ bluesky.ts         own posts of an account from the public API
│  ├─ telegram.ts        posts of a channel from the web preview t.me/s
│  ├─ stories.ts         grouping into stories, echo detector, status, lead time
│  ├─ sensor.ts          own observations: air activity, squawk 7700
│  ├─ physical.ts        USGS, EMSC, GDACS, NWS, FAA
│  ├─ text.ts            HTML to text, entities, URL key for deduplication
│  ├─ feed.ts            loading with fallback, merging, live aircraft
│  ├─ entities.ts        callsigns and aircraft types
│  ├─ places.ts          gazetteer of about 100 places
│  ├─ match.ts           live match
│  ├─ demo.ts            synthetic items and aircraft
│  └─ types.ts           Item, Match, EnrichedItem
├─ state/store.ts        state, polling, cache, preferences
├─ state/translate.ts    German translations: queue, batches, cache on the device
└─ ui/                   formatting, layout hook, IntelMap.tsx (situation map, loaded on demand)
```

INTEL reuses the callsign catalogue, the aircraft parser and the distance calculation of AIR (`air/src/data/catalog.ts`, `adsblol.ts`, `geo/geo.ts`). Both modules therefore recognise the same callsigns and compute distances the same way.

## Data flow

1. On start the last cached feed is shown at once.
2. Live military aircraft are loaded, then all sources four at a time, together with the reports of the probe collector.
3. Each source loads its channels in parallel. RSS goes through the proxy and falls back to a direct request. A source fails only when all its channels fail.
4. All items are merged: duplicates by URL (a post and the article it links) become one item, items older than 14 days are dropped.
5. Entities are extracted once per item, matches and stories are computed again whenever items or live aircraft change.
6. The feed reloads every five minutes and the live aircraft every two minutes, only while the page is visible.

## Proxy routes

`POST /translate` in `proxy/api/proxy.js` translates up to 60 texts of 600 characters through Google Translate (`proxy/lib/translate.js`), joined line by line into few requests. `/feed/{id}` and `/tg/{channel}` serve only the feeds in `FEEDS` and the channels in `TELEGRAM`, so the proxy is not an open proxy. It sends a User-Agent with contact information and caches responses for five minutes at Vercel's edge. A test checks that `FEEDS` and `TELEGRAM` match the sources in `sources.ts`, and that INTEL and AIR use the same proxy.

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
| `data/sources.test.ts` | Unique sources, proxy lists equal source list, same proxy as AIR |
| `data/physical.test.ts` | Earthquakes, GDACS, NWS, FAA, coordinates as place, event confidence, the Voronezh case in Russian |
| `data/sensor.test.ts` | Area of a point, activity groups, emergencies with airline, sensor in stories, echo detector |
| `tests/translate.test.ts` | Google answer, chunks, order, fallback per text |
| `data/stories.test.ts` | Telegram web preview, grouping, status, lead time, order, no self confirmation |

The probe collector `collector/collect.ts` uses the same modules in Node.js, see [Probe collector](collector.md). Through `LoadOptions.onRaw` it receives every answer unchanged and keeps it in the raw archive, see [Raw data](raw-data.md).

The smoke test opens INTEL in demo mode on four device sizes, the test lab opens it with live data and follows the first live match into AIR.
