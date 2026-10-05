# Roadmap

[Deutsche Version](../de/roadmap.md) · [Overview](README.md)

VectorScope grows module by module. Everything runs on GitHub Pages and the existing proxy on Vercel, without an own server. Ideas that need a permanently running server are listed separately.

## Now

| Step | Module | Contents | Status |
|---|---|---|---|
| 1 | Collection | Repository as a collection: hub, `shared/`, module AIR in `air/`, release script, repository checks, smoke test on device sizes | Done in 0.3.0 |
| 2 | INTEL | Compile and verify the source list: Bluesky, Mastodon, RSS and GDELT, each source checked for existence, activity and machine readability | In progress |

## Next

| Module | Contents |
|---|---|
| INTEL, stage A | Feed of verified sources, fetched on demand through the proxy. Recognition of callsigns, registrations, aircraft types and places in posts. Matching with live aircraft from AIR, for example a post about an RCH callsign that is currently in the air |
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
