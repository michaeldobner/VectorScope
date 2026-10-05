# Roadmap

[Deutsche Version](../de/roadmap.md) · [Overview](README.md)

VectorScope grows module by module. Everything runs on GitHub Pages and the existing proxy on Vercel, without an own server. Ideas that need a permanently running server are listed separately.

## Now

| Step | Module | Contents | Status |
|---|---|---|---|
| 1 | Collection | Repository as a collection: hub, `shared/`, module AIR in `air/`, release script, repository checks, smoke test on device sizes | Done in 0.3.0 |
| 2 | INTEL | Compile and verify the source list: Bluesky, Mastodon, RSS and GDELT, each source checked for existence, activity and machine readability | Done, 14 sources |
| 3 | INTEL | Stage A: feed of the verified sources, recognition of callsigns, types and places, live match with military aircraft, deep link into AIR | Done in INTEL 0.1.0 |
| 4 | INTEL | Telegram newsrooms, confirming media, stories with status and lead time | Done in INTEL 0.2.0 |
| 5 | INTEL | Probe collector for one week, then evaluation: volume, speed, lead time, noise per source. Decision on a permanent collector | Running until 12 October 2026 |
| 6 | INTEL | Own sensor in live flight data, echo detector, situation map, German translation | Done in INTEL 0.3.0 |

## Next

| Module | Contents |
|---|---|
| INTEL | Map of the places named in the last 24 hours together with the matched aircraft. Second check of GDELT. Registrations and ICAO addresses in posts |
| AIR | Compass mode with the motion sensor of the device, area watch with polygons |

## Later, needs a server

| Idea | Why a server |
|---|---|
| Push notifications for watchlist hits | Someone has to watch while the app is closed. Possible with ntfy and a scheduled worker |
| INTEL stages B and C: history and correlation | Posts and positions have to be collected continuously to recognise patterns over hours |

## Deferred

| Idea | Reason |
|---|---|
| Voice output in German | Deferred by decision |
| Events layer (USGS earthquakes, GDACS disasters, NASA FIRMS fires) | Only worthwhile together with more modules |
| Ships (AIS) | No free source that works from a browser |
| Trending, most tracked | No public source. Flightradar24 and ADS-B Exchange offer no API for it, scraping is not allowed |
