<div align="center">

# ◇ VectorScope

**Personal live situational awareness for iPhone and iPad.**

A collection of calm, precise modules under one roof. Each answers one question about what is happening around you, in one design language: deep graphite, ice blue, colour only where it means something.

<h3><a href="https://michaeldobner.github.io/VectorScope/">michaeldobner.github.io/VectorScope</a></h3>

[**▶ Open VectorScope**](https://michaeldobner.github.io/VectorScope/) · [Deutsch](README.de.md) · [Documentation](docs/en/README.md) · [Changelog](CHANGELOG.md)

[![Tests](https://github.com/michaeldobner/VectorScope/actions/workflows/tests.yml/badge.svg)](https://github.com/michaeldobner/VectorScope/actions/workflows/tests.yml)
[![E2E](https://github.com/michaeldobner/VectorScope/actions/workflows/e2e.yml/badge.svg)](https://github.com/michaeldobner/VectorScope/actions/workflows/e2e.yml)
[![Deploy](https://github.com/michaeldobner/VectorScope/actions/workflows/deploy.yml/badge.svg)](https://github.com/michaeldobner/VectorScope/actions/workflows/deploy.yml)

<img src="air/docs/images/iphone-radar.jpg" width="230" alt="Module AIR: radar view on iPhone with range rings around your position">&nbsp;&nbsp;
<img src="air/docs/images/iphone-overhead.jpg" width="230" alt="Module AIR: overhead list with countdown and viewing direction">&nbsp;&nbsp;
<img src="air/docs/images/iphone-score.jpg" width="230" alt="Module AIR: aircraft inspector with interest score and reasons">

</div>

## Modules

| Module | Question | Status | Version |
|---|---|---|---|
| [**AIR**](air/README.md) · Airspace | What is flying above me right now, what passes over next, what is worth a look? | Live · [open](https://michaeldobner.github.io/VectorScope/air/) | 0.5.0 |
| [**INTEL**](intel/README.md) · Intelligence feed | What do verified OSINT sources and defence media report, and which aircraft in the air does it concern? | Live · [open](https://michaeldobner.github.io/VectorScope/intel/) | 0.14.0 |

## Why VectorScope

Flight trackers and news apps show you everything, in colour, with ads. VectorScope does the opposite: every module answers one question very well, and every module looks and behaves the same. No ads, no account, no tracking. Everything runs as a web app on GitHub Pages, personal data stays on your device.

## Install on iPhone or iPad

1. Open **https://michaeldobner.github.io/VectorScope/** in **Safari**.
2. Tap **Share**, then **Add to Home Screen**.
3. Open VectorScope from the Home Screen and pick a module.

To open a module directly, add its own address to the Home Screen: **https://michaeldobner.github.io/VectorScope/air/** or **https://michaeldobner.github.io/VectorScope/intel/**. Safari and the installed app keep separate storage, so set your location inside the installed app.

## Repository structure

```
VectorScope/
├─ index.html              hub: list of modules
├─ modules.json            module registry, the single source of truth for versions
├─ shared/                 shared shell: tokens, hub styles, icons, fonts
├─ air/                    module AIR: live aviation radar
├─ intel/                  module INTEL: verified OSINT feed with live match
├─ proxy/                  CORS proxy on Vercel, shared by all modules
├─ lab/                    test lab with real internet
├─ scripts/                build, local server, smoke test, release
├─ tests/                  repository checks
├─ docs/                   documentation of the collection (en, de)
└─ .github/workflows/      tests, e2e, deploy, lab
```

Details: [Architecture](docs/en/architecture.md).

## Documentation

| Document | Contents |
|---|---|
| [Architecture](docs/en/architecture.md) | Repository structure, module registry, shared shell, build, service workers |
| [Development](docs/en/development.md) | Setup, scripts, checks, smoke test, test lab, releases, adding a module |
| [Deployment](docs/en/deployment.md) | GitHub Pages, CORS proxy on Vercel, troubleshooting |
| [Roadmap](docs/en/roadmap.md) | Next steps, ideas that need a server, deferred ideas |
| [Module AIR](air/docs/en/README.md) | User guide, calculations, data sources, design, architecture |
| [Module INTEL](intel/docs/en/README.md) | User guide, sources, matching, architecture |
| [Shared shell](shared/README.md) | Tokens and hub |

## Quick start for developers

```bash
npm install
npm run dev        # module AIR at http://localhost:5173/
npm run dev:intel  # module INTEL at http://localhost:5173/
npm test           # unit tests of all modules and repository checks
npm run build      # hub and all modules into dist/
npm run preview    # dist/ like GitHub Pages at http://localhost:4173/
```

Every push to `main` is tested and deployed to GitHub Pages.

## Data and credits

Traffic data © [adsb.lol](https://adsb.lol) contributors, licensed under ODbL 1.0. Routes and aircraft data from [adsbdb](https://www.adsbdb.com) and [hexdb.io](https://hexdb.io). Map © [OpenFreeMap](https://openfreemap.org), © OpenMapTiles, © OpenStreetMap contributors. Aircraft photos © the photographers at [planespotters.net](https://www.planespotters.net). Headlines and excerpts in INTEL © their publishers, linked to the original. VectorScope is a personal, non-commercial project and is not affiliated with any of these services.

## Version

Current version: **0.20.0**. See the [changelog](CHANGELOG.md).

Created by Michael Dobner. Licensed under the [MIT licence](LICENSE).
