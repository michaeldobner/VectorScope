# VectorScope Intel · Documentation

[Deutsche Version](../de/README.md) · [Back to the module](../../README.md)

This documentation describes module INTEL: how to use it, which sources it reads and why, how it recognises callsigns, types and places, how the live match works and how it is built. Hosting, proxy and development of the collection are described in the [documentation of the collection](../../../docs/en/README.md).

| Document | Contents | Audience |
|---|---|---|
| [User guide](user-guide.md) | Views, filters, live matches, places, sources, new posts | Everyone |
| [Stories](stories.md) | Tiers of the sources, status of a story, grouping, lead time | Everyone |
| [Sensor and map](sensor.md) | Own observations in live flight data: air activity, emergencies, the situation map | Everyone |
| [Sources](sources.md) | The 94 verified sources, the check, rejected candidates | Everyone |
| [Matching](matching.md) | Recognition of callsigns, types and places, rules and limits of the live match | Everyone, development |
| [Architecture](architecture.md) | Modules, data flow, proxy routes, storage, tests | Development |
| [Probe collector](collector.md) | Collecting on GitHub Actions until the end of January 2027, files, evaluation | Everyone, development |
| [Raw data](raw-data.md) | The raw archive: structure, record format, parsing, checks, analysis with DuckDB and Gephi, how to continue | Development, analysis |
| [Privacy and legal](privacy-and-legal.md) | Requests, storage, excerpts and links, licences | Everyone |

## INTEL at a glance

| | |
|---|---|
| Purpose | Verified OSINT and defence news, matched to aircraft in the air right now |
| Views | Stories, Wire, Map, Live now, Places, Sources |
| Sources | 94 in seven classes, from Telegram, Bluesky, RSS and measuring systems |
| Live data | Military aircraft from adsb.lol (ODbL), every two minutes |
| Refresh | Feed every five minutes while the app is open |
| Language | English interface, reports in their original language or translated into German with **DE** |
| Address | https://michaeldobner.github.io/VectorScope/intel/ |
| Version | 0.8.0 |
