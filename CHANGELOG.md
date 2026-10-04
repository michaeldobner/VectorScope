# Changelog

All notable changes to VectorScope. [Deutsch](CHANGELOG.de.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

## 0.1.4 (2026-10-04)

### Improved
* **Own proxy built in:** `https://vectorscope-proxy.vercel.app` is the default data route. Nothing has to be entered in Settings.
* The proxy answers its start address with a short status message, so it can be checked in a browser.

## 0.1.3 (2026-10-04)

### Improved
* **Live data without setup:** if adsb.lol blocks the browser and no own proxy is set, VectorScope automatically tries free public relays (allorigins, codetabs). No account needed. Best effort: if they are slow or down, the own proxy remains the reliable option.
* `BUILTIN_PROXY` in `src/data/feed.ts`: an own proxy address can be built into the app, so nothing has to be entered in Settings.
* Settings show the active data route.

## 0.1.2 (2026-10-04)

### Improved
* **One-tap proxy setup:** opening VectorScope with `?proxy=https://…` (optionally `&token=…`) saves the proxy permanently and cleans the address.
* The CORS banner explains the cause in plain words and links to the setup guide.
* Deploy button for the Vercel proxy in the documentation.

## 0.1.1 (2026-10-04)

### Improved
* **Start diagnostics:** if VectorScope has not started after six seconds, it shows the reason and the first error messages instead of a black screen. If GitHub Pages serves the unbuilt source code, it says how to fix the Pages setting.
* The app background is graphite from the very first frame, before scripts load.

## 0.1.0 (2026-10-04)

First public version.

### New
* **Live radar** around your position with range rings, smooth motion between updates and an air navigation style basemap.
* **Overhead** view: aircraft above you and aircraft that will pass over you in the next ten minutes, with countdown, miss distance, compass direction and elevation angle.
* **Aircraft inspector** with telemetry, route lookup, position relative to you, interest score with reasons, aircraft photo and links to ADS-B Exchange, adsb.lol and Flightradar24.
* **Interest score** from 0 to 100 with a curated catalogue of military roles, rare types, historic aircraft and military callsign groups.
* **Notable now**: military and emergency traffic across Europe, ranked by interest score.
* **Interesting nearby**: ranked list within your radius.
* **Watchlist** for callsign prefixes, type codes, registrations and ICAO addresses, with in-app alerts when a match enters your radius.
* **Search** by callsign, registration or ICAO address.
* **Four layouts**: iPhone portrait with bottom sheet, iPhone landscape with side panel, iPad portrait with split panels, iPad landscape with inspector and three-panel strip.
* **Installable web app** with full screen start, app icon, safe area support and offline app shell.
* **Metric units with German number format**, feet and knots as an option.
* **Demo mode** with synthetic traffic.

### Technical
* React, TypeScript, Vite, MapLibre GL, OpenFreeMap vector tiles, self-hosted Inter and IBM Plex Mono.
* Data from adsb.lol with three transports: direct, proxy and demo. Coordinates rounded to about 1 km before any request.
* Optional CORS proxy for Vercel with a path whitelist and optional token.
* Eleven unit tests for distance, bearing, elevation, closest point of approach and overhead classification.
* GitHub Actions for tests and GitHub Pages deployment.

### Known limitations
* adsb.lol does not send CORS headers on its live endpoints. Browsers may require the proxy.
* On iPhone the selected aircraft can be hidden behind the inspector sheet. Planned for 0.2.0.
* Alerts work only while the app is open.
