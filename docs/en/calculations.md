# Calculations

[Deutsche Version](../de/berechnungen.md) · [Overview](README.md)

VectorScope computes everything about your position on the device. The code is in `src/geo/` and is covered by unit tests (`src/geo/geo.test.ts`).

## Distance and bearing

| Quantity | Method |
|---|---|
| Distance | Great circle distance with the haversine formula, earth radius 6,371,008.8 m |
| Bearing | Initial great circle bearing from you to the aircraft, 0° = north, clockwise |
| Compass direction | Bearing rounded to one of 16 points: N, NNE, NE, ENE, E and so on |
| Local offset | For the closest approach the aircraft position is converted into east and north metres in a tangent plane around you. Accurate to well under 0.1 % within 400 km |

## Elevation angle

The elevation angle tells you how high above the horizon an aircraft appears:

```
height  = aircraft altitude − your altitude
drop    = distance² / (2 · earth radius)        curvature of the earth
elevation = atan2(height − drop, distance)
```

Aircraft altitude is the barometric altitude from ADS-B, converted from feet to metres. Your altitude is set in Settings (default 120 m).

| Example | Elevation |
|---|---|
| Airliner at 10,700 m, 3 km away | about 74°, ZENITH |
| Airliner at 10,700 m, 10 km away | about 47°, OVERHEAD |
| Airliner at 10,700 m, 40 km away | about 15° |
| Helicopter at 400 m, 8 km away | about 2°, on the horizon |

## What counts as overhead

VectorScope deliberately does not use a fixed radius. An airliner at 11 km altitude and 8 km distance is high in the sky, a helicopter at 300 m and 8 km distance sits on the horizon. The classes are therefore based on the elevation angle:

| Class | Condition |
|---|---|
| **Zenith** | Elevation now ≥ 70° |
| **Overhead** | Elevation now ≥ 45° |
| **Approaching** | Closest approach within the next 600 s, with an elevation at that point of ≥ 45° |
| **Visible** | Elevation now ≥ 15° and distance ≤ 30 km |
| None | Everything else, and every aircraft on the ground |

The order of the Overhead list is: Zenith (highest first), Overhead, Approaching (soonest first), Visible.

## Closest point of approach

For an aircraft with ground speed `v` and track `θ` at local offset `r = (e, n)`:

```
velocity  v⃗ = (v · sin θ, v · cos θ)
t_cpa     = −(r · v⃗) / |v⃗|²            seconds until the closest point
d_cpa     = | r + v⃗ · t_cpa |           horizontal distance at that point
range rate = (r · v⃗) / |r|              negative = approaching
```

* `t_cpa < 0`: the closest point lies in the past, the aircraft is moving away.
* The altitude at the closest point includes the current vertical rate, limited to ten minutes.
* The bearing at the closest point is the direction to look when it passes.
* The calculation assumes a straight path. Aircraft below 15 m/s ground speed get no closest approach.

The inspector shows this as "Closest in 1:09 at 6,0 km · Look S at 58° elevation". Lists and the inspector count down every second from the time of the last calculation.

## Smooth motion

Positions arrive every few seconds. Between two updates VectorScope moves every aircraft forward along its track at its ground speed (dead reckoning), at most 30 seconds ahead. If ADS-B reports a turn rate, the movement follows an arc. The map is redrawn ten times per second.

## Projected path

The selected aircraft gets a dashed line for the next three minutes, computed in 15-second steps with ground speed, track and turn rate.

## Interest score

Every aircraft gets a score from 0 to 100, capped at 100. The code is in `src/data/score.ts`, the catalogue in `src/data/catalog.ts`.

| Signal | Points | Source |
|---|---|---|
| Squawk 7500 (unlawful interference) or 7700 (emergency) | 60 | ADS-B |
| Squawk 7600 (radio failure) or 7400 (UAV lost link) | 35 | ADS-B |
| Emergency flag without a special squawk | 50 | ADS-B |
| Military | 25 | Database flag of adsb.lol or known military callsign group |
| Role: bomber | 30 | Type catalogue |
| Role: historic aircraft | 25 | Type catalogue |
| Role: ISR, AEW&C, UAV, outsize cargo | 22 | Type catalogue or callsign group |
| Role: government or VIP | 20 | Callsign group or operator name |
| Role: tanker | 18 | Type catalogue (A330 only when military) |
| Role: maritime patrol, fighter, research | 15 | Type catalogue or callsign group |
| Role: strategic airlift | 10 | Type catalogue |
| Role: tactical airlift, very large aircraft | 6 | Type catalogue |
| Rare type | rarity × 20, from rarity 0.5 | Type catalogue |
| Age 50 years or more | 12 | Year built |
| Age 35 to 49 years | 6 | Year built |
| Notable airframe (non-military) | 15 | Database flag of adsb.lol |
| Watchlist match | 30 | Your watchlist |

### Colour on the map

| Colour | Rule |
|---|---|
| Red | Squawk 7500, 7700 or emergency flag |
| Amber | Squawk 7600 or 7400 |
| Cobalt | Watchlist match |
| Ice blue | Score 25 or more |
| Grey | Everything else |

### Notable now

Notable now uses the same score for all military aircraft and every aircraft squawking 7700 reported by adsb.lol, keeps those within 2,500 km of you with a score of at least 25 and shows the top 25.

### What the score cannot know

Special liveries, the number of people watching an aircraft or an unusual route are not part of ADS-B. VectorScope only scores what can be derived from the data. See [Data sources](data-sources.md).
