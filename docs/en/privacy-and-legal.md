# Privacy and legal

[Deutsche Version](../de/datenschutz-und-recht.md) · [Overview](README.md)

## Privacy

VectorScope is built so that your location is never stored on a server.

| Data | Where it is | Who receives it |
|---|---|---|
| Exact location (GPS or set by you) | Memory and `localStorage` on your device | Nobody |
| Location for queries | Rounded to two decimal places, about 1 km | adsb.lol, and your proxy if used |
| Watchlist, settings | `localStorage` on your device | Nobody |
| Selected aircraft | Memory | adsb.lol (route), planespotters.net (photo) |
| Map section | Memory | OpenFreeMap (tiles for the visible area) |

* No account, no analytics, no cookies, no advertising.
* The repository is public and contains no coordinates, keys or personal settings.
* The optional proxy does not log or store anything itself. Vercel keeps its usual request logs for the project owner.
* Deleting the website data of `michaeldobner.github.io` in Safari removes everything VectorScope stored.

## Licences and attribution

| Component | Licence | Attribution in the app |
|---|---|---|
| VectorScope source code | MIT, see [LICENSE](../../LICENSE) | |
| Traffic data from adsb.lol | Open Database Licence 1.0 | Map attribution and Settings |
| Basemap OpenFreeMap, OpenMapTiles, OpenStreetMap | OpenMapTiles licence, ODbL for OSM data | Map attribution |
| Aircraft photos | Copyright of the photographers, planespotters.net terms | Photographer name and link on every photo |
| MapLibre GL JS | BSD 3-Clause | |
| Inter, IBM Plex Mono | SIL Open Font Licence 1.1 | |

VectorScope does not store adsb.lol data permanently and does not redistribute it as a database. If that changes, the share-alike rule of the ODbL applies to the derived database.

## Legal notes

This is a high-level overview, not legal advice.

* **Receiving ADS-B:** VectorScope does not receive radio signals itself. It uses data published by a community network. ADS-B is broadcast unencrypted for anyone to receive and is widely used by flight tracking services.
* **Terms of use:** adsb.lol, OpenFreeMap and planespotters.net are used through their public interfaces and within their terms. VectorScope does not scrape websites. Flightradar24 and ADS-B Exchange are only linked, not queried.
* **Personal data:** registrations and movements of privately owned aircraft can relate to a natural person (GDPR). VectorScope shows only what the data source publishes, does not build movement profiles of people, keeps track history only in memory for 30 minutes and does not display owner names.
* **PIA and LADD:** aircraft in the FAA privacy programmes carry database flags. VectorScope does not reveal additional information about them.
* **Military aircraft:** VectorScope shows what aircraft broadcast publicly. It does not derive deployments or mission patterns as a product feature.
* **Non-commercial:** VectorScope is a personal project. Commercial use would require separate licences for most data sources.
