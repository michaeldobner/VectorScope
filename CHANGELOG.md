# Changelog · VectorScope

Changes to the collection as a whole: structure, hub, build, checks, workflows. Changes to a module are in its own changelog: [AIR](air/CHANGELOG.md), [shared shell](shared/CHANGELOG.md). [Deutsch](CHANGELOG.de.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

## 0.3.0 (2026-10-05)

### Added
* **VectorScope becomes a collection.** The repository holds independent modules under one roof. The flights app becomes module AIR in `air/`, the intelligence feed INTEL follows.
* **Hub** at the root address: lists the modules, works without a build, installs as its own app.
* **`modules.json`:** module registry and single source of truth for versions.
* **`shared/`:** shared shell with colour tokens, hub styles, icons and fonts, versioned on its own.
* **Release script** `npm run release -- <target> <x.y.z>`: turns the unreleased changelog sections into a version and updates every place that states it.
* **Repository checks** in `tests/release.test.ts`: versions, module structure, hub, bilingual documentation, links, writing style, design tokens.
* **Smoke test on device sizes** (`scripts/e2e.mjs`, workflow `e2e.yml`): iPhone 15 portrait and landscape, iPhone SE, iPad Pro 11 landscape, in Chromium and WebKit.
* Documentation of the collection in English and German: architecture, development, deployment, roadmap.

### Changed
* Deployment documentation moved from the module to the collection, because GitHub Pages and the proxy serve all modules.
* The test lab opens AIR under `/air/`.

## 0.2.3 and earlier

Versions up to 0.2.3 were the flights app alone. Their history is in the [changelog of AIR](air/CHANGELOG.md).
