# User guide

[Deutsche Version](../de/bedienung.md) · [Overview](README.md)

## Views

| Width | Layout |
|---|---|
| iPhone, iPad portrait, Split View | One column with the tabs **Stories**, **Wire**, **Live** and **Sources** (with Places) |
| From 900 points, iPad landscape | Stories or Wire on the left, switch at the top, Live now, Places and Sources on the right |

The logo at the top left leads back to the VectorScope hub. The status shows **LIVE** when sources answered, **LOADING** while the first load runs, **OFFLINE** when nothing could be loaded and **DEMO** in demo mode. The round arrow reloads everything.

## Stories

The default view. Reports from different sources about the same event are one card. At the top three numbers: reports of the last hour, how many of them are unverified, how many stories are developing.

| On the card | Meaning |
|---|---|
| **SIGNAL** grey | One unverified source, for example a single Telegram channel |
| **EMERGING** dashed blue | Several unverified sources |
| **REPORTED** blue | An OSINT or specialist source reported it |
| **CONFIRMED** white | A leading news medium or an authority reported it |
| Time axis | Every report as a dot: hollow grey unverified, blue OSINT or specialist, white confirming |
| `2 unverified · 1 specialist` | How many sources per tier |
| `⏱ RAGE X 1 h 6 min ahead of Tagesschau` | How far the first unverified report came before the first confirming one |
| Show reports in order | Every report with time and source, how the story came about |

**Developing** at the top lists stories with several sources from the last 12 hours, **Latest** below everything else. Details: [Stories](stories.md).

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
| Breaking, Aviation, OSINT, Naval, Defence, DACH, News, Official | Reports of sources in this category, see [Sources](sources.md) |
| `◎ Place ✕` | Only posts that name this place. ✕ removes the filter |

The chosen filter is remembered on the device.

## Live now

The number of military aircraft that broadcast their position worldwide right now, and every aircraft with a live match, together with the headline that names it.

## Places

Places named in the last 24 hours, sorted by how often. The bar shows the share. A tap filters the feed by the place, a second tap removes the filter.

## Sources

Every source with a status dot (blue: answered, red: failed), its channels and the age of its newest post. When a source fails, its error is kept for the next refresh, the other sources keep working.

The version of INTEL is shown at the end of this panel.

## Updates

The feed reloads every five minutes and the live aircraft every two minutes, as long as the app is open. On the next start the last loaded feed appears at once, also without network.
