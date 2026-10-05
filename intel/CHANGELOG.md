# Changelog · VectorScope Intel

All notable changes to module INTEL. [Deutsch](CHANGELOG.de.md) · [Changelog of the collection](../CHANGELOG.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

## 0.2.1 (2026-10-05)

### Fixed
* Stories no longer chain loosely related reports into one giant story: every report must match the first report of its story.
* Leading news media only count with security and crisis topics, culture, sport and podcasts are left out.
* Grouping uses headline words only and needs two shared specific words. Checked on 439 real reports: about four in five stories with several sources are right.
* Headlines without "#BREAKING" prefixes and no longer cut after abbreviations like "USS Harry S.".

## 0.2.0 (2026-10-05)

### Added
* **Stories:** reports from different sources about the same event become one card with status Signal, Emerging, Reported or Confirmed, a time axis and the lead time of the first unverified report. Every report of a story in order on tap.
* **Telegram newsrooms** as tier Breaking, read through the proxy: OSINTdefender, RAGE X, War Monitor, Insider Paper, Clash Report.
* **Confirming sources:** Tagesschau, Deutschlandfunk, DW, BBC World, Al Jazeera.
* **Tiers** for every source: Unverified, OSINT, Specialist, Confirming.
* **Probe collector** on GitHub Actions for one week, INTEL merges its reports.
* Pulse: reports of the last hour, unverified share, developing stories.

### Changed
* The flat feed is now the view **Wire**, Stories is the default.

## 0.1.1 (2026-10-05)

### Fixed
* Endings like "… mehr…" or "Read more" are removed from excerpts.
* Naval News is read through RSS only, its Bluesky feed answered with an error.

## 0.1.0 (2026-10-05)

First version.

### Added
* Feed of 14 verified sources from Bluesky and RSS, checked in the test lab for existence, activity and machine readability.
* Bluesky posts that link an article of the same source are merged with it.
* Recognition of military callsigns, about 45 aircraft types and about 100 places in English and German.
* Live match with military aircraft from adsb.lol: callsign named, or type named near a named place. One tap opens the aircraft in AIR.
* Filters by category and live match, places of the last 24 hours, health of every source.
* New posts since the last visit are marked. The last loaded feed is shown at once on the next start, also offline.
* Demo mode `?demo` with synthetic items.
