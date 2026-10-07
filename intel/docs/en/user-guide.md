# User guide

[Deutsche Version](../de/bedienung.md) · [Overview](README.md)

## Views

| Width | Layout |
|---|---|
| iPhone, iPad portrait, Split View | One column with the tabs **Stories**, **Wire**, **Map**, **Live** and **Sources** (with Places) |
| From 900 points, iPad landscape | Stories, Wire or Map on the left, switch at the top, Live now, Places and Sources on the right |

The logo at the top left leads back to the VectorScope hub. **DE** shows every headline and excerpt in German, see [German](#german). The status shows **LIVE** when sources answered, **LOADING** while the first load runs, **OFFLINE** when nothing could be loaded and **DEMO** in demo mode. The round arrow reloads everything.

## Stories

The default view. Reports from different sources about the same event are one card. At the top four tiles: reports of the last hour, how many of them are unverified, how many stories are developing, and the air alerts of the Ukrainian Air Force in the last hour. **Tapping a tile filters the stories** accordingly, tapping it again removes the filter. The air alerts tile shows the drone and missile tracks of the last 6 hours instead, one line each.

| On the card | Meaning |
|---|---|
| **OBSERVED** light blue | Only measuring systems saw it: earthquake, ADS-B activity, squawk 7700 |
| **SIGNAL** grey | One early or partisan source, for example a single Telegram channel |
| **EMERGING** dashed blue | Several early or partisan sources |
| **REPORTED** blue | An OSINT or specialist source reported it |
| **CONFIRMED** white | A primary source (authority, military, governor) or a leading medium reported it |
| `87 %` | Event confidence, how sure the event is, see [Stories](stories.md#event-confidence) |
| Time axis | Every report as a dot, shape and colour by class |
| `1 early · 1 perspective · 1 primary` | How many independent sources per class |
| `⏱ Baza 42 min ahead of BBC` | How far the first fast report came before the first confirming one |
| Show reports in order | Every report with time and source, how the story came about |

A light blue square on the time axis and the status **OBSERVED** come from the VectorScope sensor, see [Sensor and map](sensor.md). "1 echo" marks a source that only copied an earlier report.

**Developing** at the top lists stories with several sources from the last 12 hours, **Latest** below everything else. Details: [Stories](stories.md).

## Map

The situation on a map: circles for stories, dots for military aircraft, red for emergencies, dashed lines from named aircraft to their story. Details: [Sensor and map](sensor.md).

## Wire

Every report on its own, newest first, like a news ticker. Every entry shows source, tier (Unverified, OSINT, Specialist, Confirming), channel (Telegram, Bluesky or RSS) and age, then headline and a short excerpt. Tapping the headline opens the article or the post at the publisher. When a Bluesky post linked the article, **Post on Bluesky** opens the post.

Below the text INTEL shows what it recognised:

| Chip | Meaning |
|---|---|
| `FORTE11` in ice blue | Military callsign |
| `KC-135` | Aircraft type |
| `◎ Black Sea` | Place, tap to filter the feed by it |

A blue dot in front of the source marks posts that appeared since your last visit.

## Live match

| Row | Meaning |
|---|---|
| **LIVE** `FORTE11 Q4 15.850 m named in post` | The post names this callsign, and the aircraft is in the air now |
| **LIVE** `NATO03 E3TF 9.150 m 257 km from Baltic Sea` | The post names this type and a place, and an aircraft of this type is near that place now |
| `Airborne now: 2 × C-17` | The type is named and in the air, but not near a named place. A weak hint, shown in grey |

A tap on a row opens AIR with this aircraft selected and followed on the map. Entries with a live match carry a blue line on the left. Only posts of the last 48 hours are matched. How it works: [Matching](matching.md).

## Filters

| Filter | Shows |
|---|---|
| All | Everything, newest first |
| Live match | Only posts with a blue LIVE row, the number shows how many |
| Russia, Ukraine, Middle East, DACH, USA | Reports of sources from this region |
| Aviation, Military, Disaster, OSINT, News | Reports of sources on this topic, see [Sources](sources.md) |
| `◎ Place ✕` | Only posts that name this place. ✕ removes the filter |

The chosen filter is remembered on the device.

## Live now

The number of military aircraft that broadcast their position worldwide right now, and every aircraft with a live match, together with the headline that names it.

## Places

Places named in the last 24 hours, sorted by how often. The bar shows the share. A tap filters the feed by the place, a second tap removes the filter.

## Sources

Every source with a status dot (blue: answered, red: failed), its channels and the age of its newest post. When a source fails, the line shows its error in red, for example the HTTP status, and the other sources keep working.

The version of INTEL is shown at the end of this panel.

## German

**DE** at the top right translates headlines and excerpts into German, including the reports of a story and the headlines under Live now. Only what is on screen is translated, every translation is kept on the device. German sources stay as they are. The translation comes from Google Translate, straight from the device and through the proxy only as a fallback, without a key and without a guarantee: if Google refuses, the original text stays and INTEL tries again later, waiting longer each time up to five minutes. Callsigns, types and places are always recognised in the original.

## Updates

The feed reloads every five minutes and the live aircraft every two minutes, as long as the app is open. On the next start the last loaded feed appears at once, also without network.
