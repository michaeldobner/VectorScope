# Data sources

[Deutsche Version](../de/datenquellen.md) · [Overview](README.md)

VectorScope does not run its own receiver and has no database of its own. All data comes from public, free services and is processed on the device.

## Overview

| Data | Source | Refresh | Licence |
|---|---|---|---|
| Live positions around you | adsb.lol `/v2/point` | every 5 s (configurable 3 to 20 s) | ODbL 1.0 |
| Military traffic worldwide | adsb.lol `/v2/mil` | every 60 s | ODbL 1.0 |
| Emergencies worldwide | adsb.lol `/v2/sqk/7700` | every 60 s | ODbL 1.0 |
| Search | adsb.lol `/v2/callsign`, `/v2/reg`, `/v2/hex` | on demand | ODbL 1.0 |
| Departure and destination | adsb.lol `/api/0/routeset` | when the inspector opens, cached 30 min | ODbL 1.0 |
| Aircraft photo | planespotters.net public photo API | when the inspector opens | Photographer credit and link required |
| Basemap | OpenFreeMap vector tiles and fonts | while panning and zooming | OpenMapTiles, OpenStreetMap (ODbL) |
| Roles, rarity, callsign groups | Curated catalogue in `src/data/catalog.ts` | with each release | Part of VectorScope |

## Why adsb.lol

adsb.lol is a community network of ADS-B receivers. It is free, needs no key, does not filter military aircraft and publishes its data under the Open Database Licence. Other services were evaluated in the project phase:

| Service | Reason it is not the primary source |
|---|---|
| airplanes.live | API only reachable from feeder IP addresses since 2026 |
| adsb.fi | Personal use only, no CORS headers |
| OpenSky Network | Operational use in a live product requires a written agreement, 5 to 10 s latency |
| ADS-B Exchange | 10,000 requests per month on the smallest plan |
| Flightradar24 API | Paid, filtered, no "most tracked" endpoint |
| FlightAware AeroAPI | Paid per request, personal tier only |

## adsb.lol in detail

### Requests

| Request | Purpose |
|---|---|
| `GET /v2/point/{lat}/{lon}/{radius_nm}` | Aircraft within a radius in nautical miles, at most 250 |
| `GET /v2/mil` | All aircraft flagged as military |
| `GET /v2/sqk/{squawk}` | All aircraft with a given squawk |
| `GET /v2/callsign/{cs}`, `/v2/reg/{reg}`, `/v2/hex/{hex}` | Search |
| `POST /api/0/routeset` | Plausible routes for up to 100 callsigns, body `{"planes":[{"callsign","lat","lng"}]}` |

VectorScope queries a radius 25 % larger than the one displayed plus 2 km, so approaching aircraft are known early. Coordinates are rounded to two decimal places (about 1 km) before every request.

### Fields used

| readsb field | Meaning | In VectorScope |
|---|---|---|
| `hex` | 24-bit ICAO address | Identity, key |
| `flight` | Callsign | Label, watchlist, route lookup |
| `r` | Registration | Inspector, watchlist |
| `t`, `desc` | ICAO type designator and description | Type, role, rarity |
| `ownOp`, `year` | Operator, year built | Inspector, age |
| `dbFlags` | 1 military, 2 interesting, 4 PIA, 8 LADD | Score |
| `category` | ADS-B emitter category, A7 = rotorcraft | Helicopter symbol |
| `lat`, `lon`, `seen_pos` | Position and its age | Map, geometry |
| `alt_baro`, `alt_geom` | Barometric and geometric altitude in feet, `"ground"` on the ground | Altitude, elevation |
| `gs`, `track`, `track_rate` | Ground speed in knots, track, turn rate | Motion, closest approach |
| `baro_rate`, `geom_rate` | Vertical rate in ft/min | Vertical speed |
| `squawk`, `emergency` | Transponder code, emergency status | Alerts, colour |
| `type` | Message source: adsb, mlat, tisb | Position source |

Positions older than 60 seconds are discarded.

### Rate limits and access

adsb.lol uses dynamic rate limits and announces that API keys for feeders will be required in the future. VectorScope reacts to HTTP 429 by doubling the interval up to twelve times the base value and only polls while the app is visible. Its `/v2` endpoints send no CORS headers, so browsers may block direct requests. In that case the [proxy](../../../docs/en/deployment.md#cors-proxy-on-vercel) is needed.

## What ADS-B provides and what it does not

| Directly from ADS-B | Added from databases | Not available |
|---|---|---|
| ICAO address, callsign, position, altitude, ground speed, track, vertical rate, squawk, emergency status, emitter category | Registration, type, operator, year built, military and privacy flags, plausible route | Flight number of military flights, routes of military and private flights, special liveries, number of people watching an aircraft, aircraft without a transponder or with ADS-B switched off |

Routes are estimates: adsb.lol matches the callsign against a route database and checks whether the current position is plausible. VectorScope only shows routes marked as plausible and never asks for routes of military aircraft.

## Photos

The planespotters.net public API returns a photo for an ICAO address if one exists. VectorScope shows the large thumbnail with the photographer's name and links to the photo page, as the terms of use require.

## Basemap

OpenFreeMap serves OpenMapTiles vector tiles without a key and without a request limit. VectorScope uses its own style (see [Design](design.md#map)) and only these layers: water, waterways, built-up areas, borders, motorways, aerodromes, runways and place names. If OpenFreeMap is unreachable, the map stays dark but aircraft, rings and your position are still drawn.

## Curated catalogue

`src/data/catalog.ts` contains public, well-known information:

* 61 ICAO type designators with role and rarity (0 to 1), for example `K35R` tanker, `E3TF` AEW&C, `Q4` UAV, `B52` bomber, `A124` outsize cargo, `JU52` historic,
* 37 military, government and research callsign groups, for example `FORTE` (RQ-4), `RCH` (Air Mobility Command), `NATO` (AEW&C), `GAF` (German Air Force), `SAM` (Special Air Mission),
* operator name patterns for government transport.

How to extend it: [Development](development.md#extending-the-catalogue).
