# Sensor and map

[Deutsche Version](../de/sensor.md) · [Overview](README.md)

INTEL does not only read what others report. It watches the live flight data itself and reports what it sees as the source **VectorScope Sensor**. The logic is in `src/data/sensor.ts`, the map in `src/ui/IntelMap.tsx`.

## Measuring systems

Besides its own sensor INTEL reads measuring systems and machine readable warnings (`src/data/physical.ts`):

| Source | What | Filter |
|---|---|---|
| USGS, EMSC | Earthquakes worldwide | Magnitude 5 and more |
| GDACS | Floods, cyclones, earthquakes, volcanoes, fires (UN and EU) | Orange and red alerts |
| US National Weather Service | Tornado, hurricane, tsunami and similar warnings | Severity Extreme |
| FAA | US airports | Ground stops |

Their reports carry coordinates, so they appear on the map at the exact place and meet reports about the same event.

## Air activity

Military aircraft from `/v2/mil` of adsb.lol are checked every two minutes. Aircraft of these roles count, by their ICAO type designator in the catalogue of AIR:

| Role | Examples |
|---|---|
| Tanker | KC-135, KC-46, A330 MRTT |
| AWACS | E-3, E-7 |
| Reconnaissance | RC-135, E-8, U-2 |
| Maritime patrol | P-8, P-3 |
| Drone | RQ-4, MQ-9 |
| Bomber | B-52, B-1, B-2 |

Aircraft within 350 km of each other form a group. The sensor reports a group when it has

* at least three aircraft of at least two roles, for example tanker, AWACS and reconnaissance, or
* at least two bombers, or
* a bomber together with a tanker.

The report reads like a headline: "Air activity over Baltic Sea: 1 AWACS, 1 tanker, 1 reconnaissance", with the callsigns in the text. The area is the place of the gazetteer whose area contains the group most centrally. Every area and combination of roles is one report per day, so a long mission is not reported again with every refresh.

## Emergencies

Every aircraft that squawks 7700 becomes a report: "Emergency squawk 7700: British Airways BAW2PD, Boeing 777-200 over Switzerland". For about 40 larger airlines the ICAO code of the callsign is replaced by the airline name, because news reports name the airline, not the callsign. That way an emergency and the first report about it meet in one story.

## In the stories

Sensor reports are grouped like every other report. They have their own tier **Sensor**:

| Situation | Status |
|---|---|
| Only the sensor saw it | **Observed** |
| Sensor plus reports | Status of the reports, the sensor appears as "1 sensor" on the ladder |
| Sensor before a confirming source | Lead time, for example "VectorScope Sensor 40 min ahead of BBC" |

The sensor runs in the app and in the probe collector, so its observations keep their time also while the app is closed.

## Map

The view **Map** shows the situation on the basemap of AIR:

| Element | Meaning |
|---|---|
| Circle | The stories at one place, at the place most of their reports name. Size by number of independent sources |
| Colour of the circle | White confirmed, blue reported or emerging, grey unverified, light blue observed |
| Grey dot | Military aircraft broadcasting now |
| Blue dot with callsign | Aircraft named by a story |
| Red dot | Squawk 7700 |
| Dashed line | From a named aircraft to the place of its story |

Tapping a circle shows its stories, tapping a dot opens the aircraft in AIR. Filters and tiles apply to the map as well.
