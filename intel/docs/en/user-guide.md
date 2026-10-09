# User guide

[Deutsche Version](../de/bedienung.md) · [Overview](README.md)

## Views

| Width | Layout |
|---|---|
| iPhone, iPad portrait, Split View | One column with the tabs **Stories**, **Wire**, **Map** (with Places below the map), **Live** and **Sources**. The lens switch sits in the top bar. Scrolling down slides the top bar away, scrolling up brings it back |
| From 900 points, iPad landscape | Stories, Wire or Map on the left, switch at the top, Live now, Places and Sources on the right |

The logo at the top left leads back to the VectorScope hub. The status shows **LIVE** when sources answered, **LOADING** while the first load runs, **OFFLINE** when nothing could be loaded and **DEMO** in demo mode, on a phone only as a coloured dot. The magnifier opens the [search](#search), **🌐** the language of the reports, see [Language of the reports](#language-of-the-reports). The round arrow reloads everything.

## Search

The magnifier opens a search field above the filters. Stories and Wire then show only reports that contain every word you type, in the headline, the excerpt, the name of the source, a translation, a named place, actor or member of the Bundestag. Lens and filters still apply. ✕ or Escape close the search and clear it. The search is not remembered.

## Lenses: Security and Politics

Below the top bar a switch chooses the lens. Stories, Wire and Map stay the same views, they show the reports of the lens.

| Lens | Shows | Tiles |
|---|---|---|
| ⚔ **Security** | Attacks, military, incidents, disasters, air activity, as before | Reports last hour, of them unverified, developing stories, air alerts Ukraine |
| 🏛 **Politics** | Governments, parliaments, elections, laws, diplomacy, sanctions, tariffs | Original statements of 24 h, decisions and rulings of 24 h, developing stories, the loudest actor of the last 6 hours |

In the politics lens:

* **Actors** instead of places: Trump, White House, Merz, Bundesregierung, Bundestag, von der Leyen, EU Commission, EU, Putin, Kremlin, Zelensky, NATO, Macron, Starmer, Xi Jinping, Netanyahu, Erdoğan, Khamenei. They appear as chips (◉) on a story. A tap filters by the actor, the chip at the start of the filter row (◉ name ✕) or **All** removes it again.
* **In the original:** if an actor speaks in the own words (Trump on Truth Social, the White House, the Bundestag, the EU Commission, the Kremlin, Zelensky), the story shows the statement on top with source and time. Below it you see who picked it up and when.
* **Signal** (chip at the start of the filter row): only stories with an original statement or at least two independent sources. A tap switches to **Everything**.
* **Map:** capitals as circles for the stories that name their actors, lines between two capitals whose actors one story names, thicker for more stories. A tap on a capital filters by its actors.

**Bridges:** a story can be linked to a story of the other lens that names the same actor or the same city on the same day, for example a sanctions package and a tanker attack. The card then shows "🏛 Politics via ◎ Sochi: …" or "⚔ Security via ◉ Kremlin: …", so you see what ties them. A tap switches the lens and filters by what both share. The actor or city must be rare that day, at most three stories name it: Trump or Washington alone tie nothing.

**Who says what** (since INTEL 0.9.0): if members of the Bundestag post about a story or are named in it, the story shows one group per fraction in its colour, for example "SPD Klingbeil Miersch". A filled name posted about it on Bluesky, an outlined name is named in the reports. A tap on the fraction filters by it, a tap on a name by the member. The fraction chips at the end of the filter row (CDU/CSU, AfD, SPD, Grüne, Linke) do the same for the whole list. In the security lens the members appear as chips on the story.

**Kind** of a report, as a badge next to the status: 🎙 Interview, 🗳 Vote of the Bundestag, 🗣 Speech or debate, 📄 Document. Interviews are recognised by the source (Deutschlandfunk, phoenix persönlich) or by "Interview" in the headline.

The app remembers the lens. Switching starts the new lens without filters.

## Stories

The default view. Reports from different sources about the same event are one card. At the top four tiles, on a phone a slim strip of numbers that scrolls sideways: reports of the last hour, how many of them are unverified, how many stories are developing, and the air alerts of the Ukrainian Air Force in the last hour. **Tapping a tile filters the stories** accordingly, tapping it again removes the filter. The air alerts tile shows the drone and missile tracks of the last 6 hours instead, one line each.

| On the card | Meaning |
|---|---|
| **OBSERVED** light blue | Only measuring systems saw it: earthquake, ADS-B activity, squawk 7700 |
| **SIGNAL** grey | One early or partisan source, for example a single Telegram channel |
| **EMERGING** dashed blue | Several early or partisan sources |
| **REPORTED** blue | An OSINT or specialist source reported it |
| **CONFIRMED** white | A primary source (authority, military, governor) or a leading medium reported it |
| `87 %` | Event confidence, how sure the event is, see [Stories](stories.md#event-confidence). A tap explains status and percentage on the card |
| `21:27 to 21:51 · 4 reports` | When the story ran. With the reports open a time axis shows every report as a dot, shape and colour by class |
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
| Signal \| Everything | Politics lens only, a switch with two sides: Signal shows stories with an original statement or two independent sources, Everything every story |
| All | Everything, newest first |
| Live match | Only posts with a blue LIVE row, the number shows how many |
| Russia, Ukraine, Middle East, DACH, USA | Reports of sources from this region |
| Aviation, Military, Disaster, OSINT, News | Reports of sources on this topic, see [Sources](sources.md) |
| `◎ Place ✕` | Only posts that name this place. ✕ removes the filter |

The chosen filter is remembered on the device.

## Live now

The number of military aircraft that broadcast their position worldwide right now, and every aircraft with a live match, together with the headline that names it.

## Places

Places named in the last 24 hours, sorted by how often. On a phone below the map, on a wide screen on the right. The bar shows the share. A tap filters the feed by the place, a second tap removes the filter.

## Sources

A summary line (sources, answering, not reachable, through the collector), a search field for name, region or fraction, then the sources in groups that open with a tap: security by class, politics by own voices, members of the Bundestag per fraction, parliament and government, media. A group "Needs attention" on top lists every source that failed. Channels of one network (Rybar) are one line that opens to its channels.

Every source has a status dot (blue: answered, red: failed, hollow: comes through the collector), its region, trust and the age of its newest post. When a source fails, the line shows its error in red, for example the HTTP status, and the other sources keep working.

The version of INTEL is shown at the end of this panel.

## Language of the reports

**🌐** at the top right opens three choices for the language of the reports: **Original** shows every report as it came, **English** all in English, **Deutsch** all in German. The button shows the choice: ORIG, EN or DE. The interface stays English. The language is recognised per report, not per source: a Russian quote in a German channel is translated, a German headline stays German in DE.

Since INTEL 0.10.0 the collector translates every headline and excerpt once into English and German (`collector/translate.ts`) and hands the translations to the app with its data. They appear at once, on every device, without a request of their own. Only a report the collector has not seen yet, for example a post of the last minutes, is translated on the device: straight at Google Translate, through the proxy as a fallback. The translation comes from the public Google endpoint (variant A), without a key and without a guarantee: if Google refuses, the original text stays and is asked again later. Callsigns, types and places are always recognised in the original.

## Updates

The feed reloads every five minutes and the live aircraft every two minutes, as long as the app is open. On the next start the last loaded feed appears at once, also without network.
