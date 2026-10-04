# User guide

[Deutsche Version](../de/bedienung.md) · [Overview](README.md)

## First start

1. Open VectorScope. The browser asks for your location. Allow it, or decline and set a location in **Settings** later.
2. Until a location is known, VectorScope shows the airspace around Frankfurt.
3. The map frames your radius automatically. The status in the top bar shows **LIVE** (data is current), **CONNECTING**, **OFFLINE** or **DEMO**.

On iPhone and iPad, install VectorScope to the Home Screen (Safari, Share, Add to Home Screen) and set the location inside the installed app. Safari and the installed app keep separate storage.

## Screen layout

| Device | Layout |
|---|---|
| iPhone portrait | Map in full screen. At the bottom a sheet with three heights: a peek with the number of aircraft and the most interesting one, half height with the lists, full height. Drag the handle or tap it |
| iPhone landscape | Map on the left, panel on the right with Airspace now and the lists. The inspector replaces the lists |
| iPad portrait | Map on top. Below, on the left the lists, on the right the inspector or Notable now |
| iPad landscape | Map with the inspector or Overhead on the right. Below, a strip with Notable now, Interesting nearby and Watchlist |

The layout follows the space actually available, so it also adapts in Split View and Slide Over.

<img src="../images/ipad-portrait.jpg" width="360" alt="iPad portrait">&nbsp;
<img src="../images/iphone-landscape.jpg" width="440" alt="iPhone landscape">

## Map controls

| Control | Function |
|---|---|
| **5 · 10 · 25 · 50 · 100 · 200 KM** | Radius. The map frames it, the lists count only aircraft inside it |
| **◎** | Centre the map on your position and the radius again |
| **◆** | Show only interesting aircraft. Regular traffic is hidden |
| Tap an aircraft | Opens the inspector. The aircraft gets a halo, its track and a dashed projection for the next three minutes |
| Tap empty map | Closes the inspector |
| Pinch, drag | Zoom and pan. The map does not rotate, north is always up |

## Reading the map

| Symbol | Meaning |
|---|---|
| Small grey aircraft | Regular traffic. Labels appear only when you zoom in |
| Ice blue aircraft with label | Interesting aircraft (interest score 25 or more), with a short trail |
| Cobalt ring around an aircraft | Watchlist match |
| Amber aircraft | Event, for example squawk 7600 (radio failure) |
| Red aircraft with red label | Emergency, squawk 7700 or 7500 |
| Bright ice blue with halo | Selected aircraft |
| ◎ with fine rings | Your position, inner ring at half the radius |
| Grey circles with ICAO codes | Airports, with runway outlines from zoom 9 |

The label shows callsign and altitude. Altitude is barometric, in metres by default.

## Airspace now

The summary at the top of the panel shows how many aircraft are inside your radius, how many of them are interesting, how many are military and how many trigger an alert, plus the time of the last update.

## Overhead

The list answers "what is above me". It is sorted in this order:

| Label | Meaning |
|---|---|
| **ZENITH** | The aircraft is at least 70° above the horizon, practically straight up |
| **OVERHEAD** | At least 45° above the horizon |
| **IN 2:40** | It will pass you within ten minutes and will then be at least 45° high. The countdown runs live |
| **VISIBLE** | At least 15° high and within 30 km, so visible to the naked eye in good weather |

Each row shows type, altitude and where to look: an arrow, the compass direction and the elevation angle. For aircraft still approaching, the direction is the one at the closest point. How this is calculated: [Calculations](calculations.md).

## Nearby

Interesting aircraft inside your radius, sorted by interest score: rank, colour bar, callsign, type, altitude, distance and score.

## Notable now

Military and emergency traffic within 2,500 km, ranked by interest score and refreshed every minute. Each entry shows the score, the type, the three strongest reasons and the distance and direction from you. Tap an entry to open the inspector even if the aircraft is far away.

<img src="../images/iphone-notable.jpg" width="260" alt="Notable now on iPhone">

## Aircraft inspector

| Section | Contents |
|---|---|
| Header | Callsign, star for the watchlist, LIVE or age of the last position, operator, type |
| Banner | Only for special squawks: 7700, 7600, 7500, 7400 |
| Photo | From planespotters.net with the photographer's name. Tap to open the original |
| Identity | ICAO address, registration, callsign, ICAO type code |
| Telemetry | Altitude with flight level, ground speed, track, vertical speed |
| Route | Departure and destination if a plausible route is known. Military flights show "Route not published" |
| Relative to you | Distance, compass direction, elevation angle, squawk, plus the closest approach: time, distance and where to look |
| Interest score | Score from 0 to 100 and every reason with its points |
| Details | Role, callsign group, description, year built, emitter category, position source, data source |
| Links | Open the aircraft on ADS-B Exchange, adsb.lol or Flightradar24 |

The star adds the aircraft to the watchlist (by registration, otherwise by ICAO address) or removes it.

<img src="../images/iphone-inspector.jpg" width="260" alt="Inspector header and telemetry">&nbsp;
<img src="../images/iphone-score.jpg" width="260" alt="Relative position, interest score and details">

## Watchlist

The watchlist knows four kinds of rules:

| Kind | Matches | Example |
|---|---|---|
| Callsign prefix | Every callsign starting with the value | `FORTE`, `RCH`, `NATO`, `GAF` |
| Type code | ICAO type designator, exact | `C17`, `B52`, `A400`, `E3TF`, `A124` |
| Registration | Exact, spaces ignored | `D-ABYA`, `05-5142` |
| ICAO hex | Exact, six characters | `AE146C` |

Matches appear at the top of the watchlist under **In range now**, get a cobalt ring on the map and 30 extra points on the interest score. When a match enters your radius, a notice appears at the top of the screen. FORTE, NATO, B52 and A124 are preset and can be removed.

## Search

The search field in the top bar accepts a callsign, a registration, an ICAO address or a type code. VectorScope first searches the aircraft already loaded. If nothing matches, it asks adsb.lol worldwide and shows a result list.

## Settings

Open with the gear in the top bar.

| Section | Options |
|---|---|
| Location | Use device location, pick on the map, enter coordinates, your altitude above sea level (for the elevation angle) |
| Radius | Quick choice or any value from 2 to 400 km |
| Units | m · km/h · m/s or ft · kt · fpm. Numbers always use the German format |
| Map | Show only interesting aircraft |
| Data source | Auto, Direct, Proxy, Demo. Proxy URL, optional token, refresh interval 3, 5, 10 or 20 seconds |

<img src="../images/iphone-settings.jpg" width="260" alt="Settings">

## Alerts

VectorScope shows a notice at the top of the screen when

* an aircraft with an emergency or event squawk enters your radius, or
* a watchlist match enters your radius.

Tap the notice to open the aircraft. Notices disappear after eight seconds. They only work while VectorScope is open; push notifications in the background are planned.

## Demo mode

Without data access, or to explore the app, choose **Demo** in the settings or in the error banner. VectorScope then simulates about 50 aircraft around your position, including an RQ-4 Global Hawk, a C-17, a KC-135, a NATO E-3, an A400M, a Ju 52, a rescue helicopter and an A321 squawking 7700. The status shows **DEMO**.
