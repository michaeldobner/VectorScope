# Architecture of the collection

[Deutsche Version](../de/architektur.md) · [Overview](README.md)

VectorScope is a collection of independent modules under one roof: one repository, one address, one design language. Each module answers one question about the situation around you. The hub at the root address lists the modules, the folder `shared/` holds what they have in common.

## Repository structure

```
VectorScope/
├─ index.html              hub: list of modules, static, no build needed
├─ manifest.webmanifest    hub as an installable app
├─ sw.js                   hub service worker (hub and shared/ only)
├─ modules.json            module registry: id, code, status, version, path, description
├─ shared/                 shared shell
│  ├─ tokens.css           colour tokens Graphite with Ice Blue
│  ├─ hub.css              layout of the hub
│  ├─ icons/               collection icons
│  ├─ fonts/               Inter for the hub
│  └─ README, CHANGELOG    own version
├─ air/                    module AIR: live aviation radar (React, TypeScript, MapLibre)
│  ├─ index.html, vite.config.ts, public/, src/
│  ├─ docs/en, docs/de     module documentation
│  └─ README, CHANGELOG    own version
├─ intel/                  module INTEL: verified OSINT feed with live match (React, TypeScript)
├─ proxy/                  CORS proxy on Vercel, shared by all modules
├─ lab/                    test lab with real internet (GitHub Actions)
├─ collector/              probe collector and raw archive for INTEL (GitHub Actions, own server)
├─ server/                 web server, collector loop and image for the own server, see server.md
├─ docker-compose.yaml     the stack for Coolify
├─ scripts/
│  ├─ build.mjs            adds hub and shared files to dist/
│  ├─ serve.mjs            serves dist/ like GitHub Pages
│  ├─ e2e.mjs              smoke test on device sizes
│  ├─ release.mjs          release a module, shared or the collection
│  └─ versions.mjs         every place that states a version
├─ tests/release.test.ts   repository checks
├─ docs/en, docs/de        documentation of the collection
└─ .github/workflows/      tests, e2e, deploy, lab, collector
```

## Modules

| Code | Folder | Status | Technology | Question |
|---|---|---|---|---|
| AIR | `air/` | Live | React 18, TypeScript, Vite, MapLibre GL | What is flying above me right now? |
| INTEL | `intel/` | Live | React 18, TypeScript, Vite | What do verified sources report, and which aircraft in the air does it concern? |

`modules.json` is the single source of truth. The hub links every module with status `live`, the build fails if such a module is missing, and the repository checks compare every stated version with the registry.

### Rules for a module

* Lives in its own folder named after its id, with `index.html` as entry.
* Builds into `dist/<id>/` with a relative base path, so it runs under any address.
* Has its own `README.md`, `README.de.md`, `CHANGELOG.md`, `CHANGELOG.de.md`, `docs/en` and `docs/de` and its own version.
* Registers its own service worker from its folder, with a cache named `vectorscope-<id>-v<n>`.
* Takes its colours from `shared/tokens.css`.
* Stores data in `localStorage` with keys starting with `vectorscope.`.
* Links back to the hub through its logo (`../`).

## Shared shell

`shared/` is versioned on its own, because a change there affects every module.

| File | Contents | Used by |
|---|---|---|
| `tokens.css` | Colour tokens of the Graphite theme: surfaces, text, accent, signal colours, aircraft tones, radii | Hub, AIR, INTEL |
| `hub.css` | Layout of the hub | Hub |
| `icons/` | App icons of the collection | Hub |
| `fonts/` | Inter 400 and 600 for the hub | Hub |

AIR imports `tokens.css` at build time and overrides the colour variables at runtime when a different theme is chosen (`air/src/ui/tokens.ts`). A repository check makes sure that `tokens.css` and the Graphite theme of AIR stay identical.

## Build

```
npm run build
 ├─ tsc --noEmit                         type check of all TypeScript
 ├─ vite build --config air/vite.config.ts   air/ → dist/air/
 ├─ vite build --config intel/vite.config.ts intel/ → dist/intel/
 └─ node scripts/build.mjs               index.html, manifest, sw.js, modules.json, shared/ → dist/
```

One `package.json` in the root holds the dependencies and scripts of all modules. INTEL reuses the callsign catalogue, the aircraft parser and the distance calculation of AIR by importing them from `air/src/`. Vitest finds the tests of all modules and the repository checks (`vitest.config.ts`).

## Addresses and storage

| | Address | Service worker scope | Cache |
|---|---|---|---|
| Hub | `/VectorScope/` | `/VectorScope/` | `vectorscope-hub-v1` |
| AIR | `/VectorScope/air/` | `/VectorScope/air/` | `vectorscope-air-v1` |
| INTEL | `/VectorScope/intel/` | `/VectorScope/intel/` | `vectorscope-intel-v1` |

All parts share one origin (`michaeldobner.github.io`), so `localStorage` is shared. That is why every key carries the prefix `vectorscope.` and a module name where needed. The hub service worker only answers requests for the hub and `shared/`, everything else goes to the network or to the worker of the module.

## Network

```
iPhone / iPad (Safari, installed web app)
 └─ VectorScope (static files from GitHub Pages)
     ├─ AIR ── vectorscope-proxy.vercel.app ── adsb.lol, planespotters.net
     │    ├─ adsbdb.com, hexdb.io ............. routes, airlines, aircraft data
     │    └─ OpenFreeMap ...................... basemap
     └─ INTEL ── public.api.bsky.app ......... Bluesky posts, directly
          ├─ same proxy ...................... RSS feeds (/feed/{id}), Telegram (/tg/{channel}), military aircraft (/v2/mil)
          └─ raw.githubusercontent.com ....... reports of the probe collector
```

There is no own backend. The proxy only forwards a whitelist of read-only paths and stores nothing. Details: [Deployment](deployment.md#cors-proxy-on-vercel).
