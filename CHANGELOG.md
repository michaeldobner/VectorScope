# Changelog · VectorScope

Changes to the collection as a whole: structure, hub, build, checks, workflows. Changes to a module are in its own changelog: [AIR](air/CHANGELOG.md), [INTEL](intel/CHANGELOG.md), [shared shell](shared/CHANGELOG.md). [Deutsch](CHANGELOG.de.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

## 0.15.2 (2026-10-09)

### Fixed
* Module INTEL 0.10.2.

## 0.15.1 (2026-10-09)

### Fixed
* Translation in the collector: in slices of 20 texts with a pause, a round stops as soon as Google refuses a whole slice, a refused text is asked again after 10 minutes, then three times longer each time, never given up while its report is recent. In the lab a second run in a row was refused for half the texts.
* Module INTEL 0.10.1.

## 0.15.0 (2026-10-09)

### Added
* Collector translates every headline and excerpt of the last 72 hours once into English and German (`collector/translate.ts`, public Google endpoint), keeps them in `translations.json` and hands them to INTEL in `latest.json` and the database.
* Test lab measures the translation of the collector: texts and characters a day per language, how many Google refuses.
* Module AIR 0.4.0 and INTEL 0.10.0, see their changelogs.

## 0.14.0 (2026-10-08)

### Added
* Proxy serves the 12 new feeds of the voices of politics.
* Collector loads sources marked collector only (88 members of the Bundestag on Bluesky, votes of abgeordnetenwatch.de, POLITICO Berlin Playbook) and keeps the votes in the raw archive, one unit per vote.
* Test lab: `lab/voices.mjs` saves samples of the new feeds and APIs and tries the DIP API of the Bundestag. `scripts/members.mjs` writes the member list of the Bundestag from the lab results.
* Module INTEL 0.9.0, see its [changelog](intel/CHANGELOG.md).

## 0.13.0 (2026-10-08)

### Added
* Proxy serves the feeds and Telegram channels of the 20 politics sources, 52 Telegram channels in total.
* Test lab checks candidates for the politics lens and shows items per day and the latest headline of every feed.
* Module INTEL 0.8.0, see its [changelog](intel/CHANGELOG.md).

## 0.12.0 (2026-10-08)

### Added
* `collector/backfill.ts` fills the database of the own server once from the raw archive: every report since 30 September 2026 with its first sight, and every round. The collector runs it on start, a table `meta` remembers it. With `--force` it can be repeated at any time.

## 0.11.2 (2026-10-08)

### Added
* Own server: `/api/diag` shows whether the server reaches adsb.lol, Telegram, the feeds, Bluesky, Google Translate and GitHub, with DNS and times.

### Fixed
* Proxy: every request to a publisher gives up after 15 seconds, a translation after 10. On the own server a hanging connection kept the app loading forever.
* Own server: Node prefers IPv4, because Docker networks often have no working IPv6.

## 0.11.1 (2026-10-07)

### Changed
* Own server: address is `vectorscope.duckdns.org`, an own DuckDNS domain.

## 0.11.0 (2026-10-07)

### Added
* **Own server:** `docker-compose.yaml` for Coolify with web server (app, proxy, collector data, `/api/health`, `/api/reports`), collector every 10 minutes, PostgreSQL 16 and a daily backup of database and raw archive to the host. Docker healthchecks and the service names the status page expects. The app uses the own proxy and collector data when it runs on the own address, GitHub Pages stays unchanged. See [Own server](docs/en/server.md).
* The collector on the server pushes every round file to the branch `collector-raw` (`RAW_PUSH_URL`), named `HHMM-srv.jsonl.gz`.

### Changed
* The collector on GitHub Actions puts its commits on top when the server pushed to `collector-raw` in between, instead of failing until the end of its run.
* `collector/parse.ts` counts versions by distinct content, so a unit stored by two collectors is one version.

## 0.10.0 (2026-10-07)

### Changed
* Probe collector and raw archive run until 31 January 2027 instead of 12 October 2026.

### Added
* Proxy serves Rybar Tactical and Rybar America, 50 Telegram channels in total. The test lab checks both.
* Module INTEL 0.7.0, see its [changelog](intel/CHANGELOG.md).

## 0.9.2 (2026-10-07)

### Fixed
* Raw archive: the round record counts the own sensor among the sources asked, as it already did among those that answered.

## 0.9.1 (2026-10-07)

### Fixed
* Raw archive: Telegram posts no longer count as changed because of the signed view token, reactions or their position on the page, Bluesky posts not because of counters in quoted posts. Replies of Telegram posts are recognised, Bluesky reposts are not reported as parsing problems.

## 0.9.0 (2026-10-07)

### Added
* **Raw archive:** the probe collector keeps every answer of every source as it came, split into units (one post, one item, one event), new or changed units only, one file per round on the branch `collector-raw`. The reports collected since 30 September are kept once as well. See [Raw data](intel/docs/en/raw-data.md).
* `collector/parse.ts` turns the raw archive back into reports with the parsers of INTEL, including forwards, replies, views and links of Telegram posts.
* Checks after every round in `health.json` and in the summary of the run: failing and silent sources, gaps, reports that break an assumption.

## 0.8.1 (2026-10-06)

### Changed
* Probe collector collects every 10 minutes in long runs, because GitHub started the 15 minute schedule only every few hours.

### Fixed
* Probe collector counts a report as new only once and only if it is less than a day old.

### Added
* `collector/eval.ts` evaluates the collected reports.

## 0.8.0 (2026-10-05)

### Added
* Proxy serves ten more Rybar channels, 48 Telegram channels in total.
* Test lab runs a QA pass: every source three times, a Telegram burst, translation batches and a pass in WebKit (Safari engine) with German on.
* Module INTEL 0.5.0, see its [changelog](intel/CHANGELOG.md).

### Fixed
* Proxy translation returns what Google translated and leaves the rest empty instead of failing the whole batch, two requests at a time.

## 0.7.0 (2026-10-05)

### Added
* Proxy serves 38 Telegram channels and the GDACS and FAA feeds for INTEL.
* Test lab checks Telegram candidates for language and machine readable sources.
* Module INTEL 0.4.0, see its [changelog](intel/CHANGELOG.md).

## 0.6.0 (2026-10-05)

### Added
* Proxy route `POST /translate` for the German translations of INTEL (Google Translate, `proxy/lib/translate.js`).
* The probe collector also records the observations of the VectorScope sensor.
* Module INTEL 0.3.0, see its [changelog](intel/CHANGELOG.md).

## 0.5.0 (2026-10-05)

### Added
* **Probe collector** (`collector/collect.ts`, workflow `collector.yml`): every 15 minutes for one week, data on the branch `collector-data`.
* Proxy route `/tg/{channel}` for the Telegram channels of INTEL, five more RSS feeds for the confirming sources.
* Test lab checks Telegram channels and confirmation feeds.
* Module INTEL 0.2.0 with stories, see its [changelog](intel/CHANGELOG.md).

## 0.4.0 (2026-10-05)

### Added
* **Module INTEL 0.1.0:** verified OSINT feed with live match, linked from the hub. See the [changelog of INTEL](intel/CHANGELOG.md).
* Proxy route `/feed/{id}` for the RSS feeds of INTEL, fixed list, cached five minutes.
* Test lab checks OSINT source candidates (Bluesky, RSS, Mastodon, GDELT) for existence, activity and browser access (`lab/osint.mjs`), and opens INTEL with live data.
* Smoke test covers INTEL.

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
