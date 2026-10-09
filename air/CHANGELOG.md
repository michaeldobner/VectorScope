# Changelog · VectorScope Air

All notable changes to module AIR. [Deutsch](CHANGELOG.de.md) · [Changelog of the collection](../CHANGELOG.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

## 0.5.0 (2026-10-09)

### Added
* When the map shows an area away from your position, a line at the top says that AIR loads the traffic there, how many aircraft it found and how far that is from you. **◎ Back** returns to your position.

## 0.4.0 (2026-10-09)

### Added
* Traffic follows the map: after panning or zooming to an area away from your position, AIR loads the traffic there as well, up to about 460 km around the middle of the map. Lists and alerts stay with your position.

## 0.3.1 (2026-10-05)

### Added
* **Deep link** `?hex=ae5420` selects and follows this aircraft, used by INTEL to open a live match.

## 0.3.0 (2026-10-05)

### Changed
* **New address:** the module now lives at `https://michaeldobner.github.io/VectorScope/air/`. The previous address opens the VectorScope hub, which links to AIR. Settings, watchlist and proxy are kept.
* The logo in the top bar leads back to the hub.
* Colour tokens now come from `shared/tokens.css`, shared with the hub. The first frame already shows the Graphite colours.
* Service worker cache renamed to `vectorscope-air-v1` and limited to the module folder.
* Installed separately the module is called "VS Air".

## 0.2.3 (2026-10-04)

### Design
* **New default colour scheme Graphite:** neutral dark grey like Apple Maps, white text and white aircraft, ice blue `#55BDEB` as the only accent, cobalt for the watchlist. Chosen after comparing three themes on the live map. `?theme=ice` and `?theme=night` remain available.

## 0.2.2 (2026-10-04)

### Fixed
* **Routes for far more flights:** route databases age differently, so adsbdb and hexdb are both asked and the leg that passes the aircraft wins. Example: EXS95LV over Nuremberg showed no route because adsbdb still had last season's Madeira to Bristol; now it shows Mytilene to Birmingham from hexdb.

### Improved
* Airline from the callsign (EXS gives Jet2.com), owner and type from the aircraft database when the live data has none.
* Readable type names for about 120 common aircraft, for example Boeing 737-800 instead of B738.
* Three colour themes to compare: `?theme=ice` (previous), `?theme=graphite` (neutral like Apple Maps), `?theme=night` (warm aircraft on a deep night chart). The choice is saved per device.

## 0.2.1 (2026-10-04)

### Fixed
* **Bottom sheet stuck halfway on iPhone:** when the content under the finger changed during a swipe, iOS never delivered the end of the gesture. The sheet now listens on the touched element itself.

## 0.2.0 (2026-10-04)

Tested for the first time with real live data, the real map and real touch gestures, in a test lab on GitHub Actions.

### New
* **Routes from adsbdb:** airline, departure and destination with airport code, city and country, shown as a route card. Only shown if the aircraft is plausibly on the way between both airports.
* **Aircraft photos** through the own proxy (planespotters requires a contact address that browsers cannot send).
* **Tap any aircraft, the map follows:** from the map, the lists, Notable now or the search. Aircraft outside your area are drawn on the map and followed live.
* **My location button** and filter button, top right like Apple Maps.

### Improved
* **Readable map:** cities, towns and villages by zoom level, motorways from zoom 6, airport names from zoom 9.
* **Bottom sheet like Apple Maps:** drag it anywhere, flick it, it snaps. Pull down from the top of the content to shrink it.
* **Inspector:** sticky header, photo first, then route, telemetry, position relative to you.
* Notable now loads sequentially every two minutes to stay below adsb.lol's rate limit.

### Fixed
* Routes never appeared: adsb.lol's route service answers with empty responses and blocks browsers.
* Photos never appeared: planespotters blocks browser requests.

## 0.1.5 (2026-10-04)

### Fixed
* **Reliable deploys:** the Pages deploy now waits for GitHub's own branch build and always publishes last, so the unbuilt source can no longer replace the app.

### Improved
* Version number in the error banner and in Settings, plus the active data route and error kind.

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
