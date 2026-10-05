# Development

[Deutsche Version](../de/entwicklung.md) · [Overview](README.md)

## Requirements

* Node.js 22 or newer, npm 10
* A modern browser. For testing on devices: iPhone or iPad with Safari

## Running locally

Everything runs from the repository root, which holds the single `package.json` for all modules.

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/`. Useful URL flags:

| Flag | Effect |
|---|---|
| `?demo` | Synthetic traffic, no network access to adsb.lol |
| `?lat=50.11&lon=8.68` | Fixed location, GPS off |
| `?shot` | Keeps the WebGL buffer readable for automated screenshots |

Flags can be combined: `?demo&lat=48.35&lon=11.79`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server for this module with hot reload |
| `npm run typecheck` | TypeScript check without output |
| `npm test` | Unit tests of all modules and the repository checks |
| `npm run build` | Type check, this module into `dist/air/`, then hub and shared files into `dist/` |
| `npm run preview` | Serve `dist/` like GitHub Pages at `http://localhost:4173/`, this module under `/air/` |
| `npm run e2e` | Smoke test on iPhone and iPad sizes against the build |
| `npm run release -- air x.y.z` | Release this module, see [Development of the collection](../../../docs/en/development.md#releases) |

## Tests

`src/geo/geo.test.ts` covers the calculations everything else depends on, `src/data/enrich.test.ts` the route choice with recorded real answers from adsbdb and hexdb:

| Test | Checks |
|---|---|
| Distance Frankfurt to Munich | Haversine result between 300 and 308 km |
| Destination and bearing | Round trip within metres and one degree |
| Elevation | 90° straight up, 45° at equal distance and height |
| Closest approach head-on | Time to closest point and miss distance under 50 m, approaching |
| Closest approach with offset | Miss distance and side |
| Receding aircraft | Negative time, positive range rate |
| Projection with turn | Quarter turn ends in the right sector |
| Sky classes | Zenith, approaching, low helicopter on a crossing course, ground traffic |
| Route choice | The route database whose leg passes the aircraft wins (EXS95LV: Mytilene to Birmingham, not the stale Madeira to Bristol) |

GitHub Actions runs the type check, the tests and the build on every push and pull request (`.github/workflows/tests.yml`), plus the smoke test on device sizes and the test lab with real data, see [Development of the collection](../../../docs/en/development.md).

### Also check by hand

1. All four layouts: iPhone portrait and landscape, iPad portrait and landscape, iPad Split View.
2. Bottom sheet: drag, tap, open the inspector, close it.
3. Overhead countdown runs, aircraft glide smoothly.
4. Watchlist: add, remove, star in the inspector, notice on entry.
5. Settings: pick on the map, coordinates, units, data source, radius slider.
6. Error banner without network and the switch to demo mode.
7. Install to the Home Screen, start in full screen, notch and home indicator.

## Testing on an iPhone or iPad

1. Run `npm run dev -- --host` on the computer.
2. On the iPhone open `http://<computer-ip>:5173/` in Safari.

Without HTTPS the browser does not grant the location and the service worker does not start. Use the coordinates in Settings or `?lat=…&lon=…`, or test through the published address.

**Debugging with a Mac:** on the iPhone turn on Settings > Apps > Safari > Advanced > Web Inspector, connect with a cable, then in Safari on the Mac: Develop > name of the iPhone > choose the page.

## Screenshots for the documentation

The images in `docs/images/` are taken in demo mode with Playwright and Chromium at device sizes (iPhone 393 × 852 at 3×, iPad 1180 × 820 at 2×). Headless Chromium does not include the WebGL canvas in screenshots, so the script copies the canvas into an image first. The page must be opened with `?demo&shot`.

## Conventions

* TypeScript strict mode, no unused variables or parameters.
* Pure logic (`geo/`, `data/score.ts`, `data/adsblol.ts`) never touches the document.
* Colours only through tokens (`styles.css`, `ui/tokens.ts`). No new colour without a meaning.
* Numbers through `lib/format.ts`, so the German number format and the unit setting are applied everywhere.
* Texts in the interface are English. Documentation in English and German, both always updated together.
* No dashes as punctuation in texts.
* Each change gets an entry in `CHANGELOG.md` and `CHANGELOG.de.md`.

## Extending the catalogue

### New type

In `src/data/catalog.ts` add an entry to `TYPE_CATALOG`:

```ts
P8: { role: 'maritime-patrol', rarity: 0.6, name: 'Boeing P-8 Poseidon' },
```

* `role` decides the role points and the label in the inspector.
* `rarity` from 0 to 1. From 0.5 it adds `rarity × 20` points.
* Types that are only special when military (A330 MRTT, Global Express) get `rarity: 0` and an entry in `MILITARY_ONLY_ROLE` in `score.ts`.

### New callsign group

Add an entry to `CALLSIGN_PREFIX`:

```ts
HOMER: { label: 'US Navy P-8 Poseidon', role: 'maritime-patrol' },
```

The longest matching prefix of at least three letters wins. Every callsign group except DLR and NASA counts as military.

### New view or data source

1. Add the request to `data/feed.ts` with all three transports in mind (direct, proxy, demo).
2. Add the path to the whitelist in `proxy/api/proxy.js`.
3. Extend demo data in `data/demo.ts`, so screenshots and offline development keep working.
4. Document it in both languages.

## Roadmap

| Version | Planned |
|---|---|
| 0.4 | Compass mode with the device's motion sensor, area watch with polygons |
| 0.5 | Push notifications through ntfy and a scheduled worker |

The intelligence feed from Bluesky and RSS becomes its own module INTEL, see the [roadmap of the collection](../../../docs/en/roadmap.md).
