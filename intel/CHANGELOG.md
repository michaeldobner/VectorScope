# Changelog · VectorScope Intel

All notable changes to module INTEL. [Deutsch](CHANGELOG.de.md) · [Changelog of the collection](../CHANGELOG.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

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
