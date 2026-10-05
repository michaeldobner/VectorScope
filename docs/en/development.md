# Development of the collection

[Deutsche Version](../de/entwicklung.md) · [Overview](README.md)

This page covers what applies to every module: setup, scripts, checks, releases and conventions. Module specific topics (URL flags, catalogue, screenshots) are in the documentation of each module, for AIR in [Development of AIR](../../air/docs/en/development.md).

## Requirements

* Node.js 22 or newer, npm 10
* For device tests: iPhone or iPad with Safari

## Setup

```bash
npm install
npm run dev        # module AIR at http://localhost:5173/
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server for AIR with hot reload |
| `npm run dev:intel` | Development server for INTEL with hot reload |
| `npm run typecheck` | TypeScript check of all modules |
| `npm test` | Unit tests of all modules and repository checks |
| `npm run build` | Type check, all modules, hub and shared files into `dist/` |
| `npm run preview` | Serves `dist/` like GitHub Pages at `http://localhost:4173/` |
| `npm run e2e` | Smoke test on device sizes against `npm run preview` |
| `npm run release -- <target> <x.y.z>` | Release a module, `shared` or `collection` |

## Checks

### Unit tests

Every module keeps its tests next to the code (`air/src/**/*.test.ts`, `intel/src/**/*.test.ts`). `vitest.config.ts` collects them together with the repository checks.

### Repository checks

`tests/release.test.ts` keeps the collection consistent. It fails when:

| Check | Fails when |
|---|---|
| Versions | A README, a documentation overview, the hub, `package.json` or a changelog states a different version than `modules.json` |
| Changelogs | The English and German changelog of a part list different versions |
| Module structure | A live module lacks `index.html`, build config, manifest, service worker, README or changelog in both languages, or documentation in both languages |
| Service worker | The cache of a module is not named `vectorscope-<id>-v<n>` |
| Hub | A live module is not linked, or a planned module is linked |
| Documentation | English and German documentation have a different number of pages, or a README has no German counterpart |
| Links | A relative link or image in any Markdown file points to a missing file |
| Writing style | A Markdown or HTML file contains a dash as punctuation |
| Tokens | `shared/tokens.css` and the Graphite theme of AIR differ |

### Smoke test on device sizes

`scripts/e2e.mjs` opens the build with Playwright at the sizes of iPhone 15 portrait and landscape, iPhone SE and iPad Pro 11 landscape. It checks that the hub links every live module, that AIR starts in demo mode with aircraft, that INTEL shows items with live matches, that no page scrolls sideways and that no errors appear in the console. Screenshots go to `e2e-out/`.

```bash
npm run build
npm run preview &
npm run e2e                       # Chromium
E2E_BROWSER=webkit npm run e2e    # WebKit, the engine of Safari
```

The workflow `e2e.yml` runs both browsers on every push and keeps the screenshots as an artifact.

### Test lab with real data

`lab/run.mjs` runs in the workflow `lab.yml` on GitHub Actions, where the internet is open. It records real responses of every data source and takes screenshots of AIR with live traffic. The results are pushed to the branch `lab-results`. This is the only place where the real data sources are tested end to end.

## Releases

Every part has its own version: the collection, `shared` and each module. Changes are first written under `## Unreleased` in `CHANGELOG.md` and under `## Unveröffentlicht` in `CHANGELOG.de.md` of that part. Then:

```bash
npm run release -- air 0.3.1
npm test
```

The script turns both sections into the new version with today's date and updates every place that states the version: `modules.json`, READMEs, documentation overviews, the hub and for the collection `package.json`. The list of these places lives in `scripts/versions.mjs`, so the release script and the checks use the same list.

| Change | Version step |
|---|---|
| Fix without visible change of behaviour | Patch, 0.3.0 to 0.3.1 |
| New feature, new view, changed behaviour | Minor, 0.3.1 to 0.4.0 |
| Change of address or stored data that needs action on the device | Minor before 1.0, major after |

## Adding a module

1. Add an entry to `modules.json` with status `planned`.
2. Create the folder with `index.html`, build config, `public/manifest.webmanifest`, `public/sw.js` with cache `vectorscope-<id>-v1`, README, changelog and `docs/en`, `docs/de` in both languages.
3. Add the build of the module to the `build` script in `package.json` and its tests to `vitest.config.ts`.
4. Add a card to the hub (`index.html`) with `data-module` and `data-version`, and a row to the module tables of both root READMEs.
5. Set the status to `live`. From then on the checks require everything above.

## Conventions

* Texts and documentation in English and German, both always updated together.
* No dashes as punctuation. Use a comma, a full stop, a colon or rephrase.
* Interface texts in English, German number format, metric units by default.
* TypeScript strict mode, no unused variables or parameters.
* Pure logic never touches the document and is tested in Node.js.
* Colours only through tokens, no new colour without a meaning.
* No secrets and no personal coordinates in the repository, it is public.
* Every change gets an entry in the changelogs of the part it changes.
