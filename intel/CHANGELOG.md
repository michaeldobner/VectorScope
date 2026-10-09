# Changelog · VectorScope Intel

All notable changes to module INTEL. [Deutsch](CHANGELOG.de.md) · [Changelog of the collection](../CHANGELOG.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

## 0.10.0 (2026-10-09)

### Added
* **Language of the reports:** the switch at the top right chooses ORIG (as they came), EN (all in English) or DE (all in German). The interface stays English. Replaces the switch DE, a German choice is kept.
* The language is recognised per report (script, umlauts, common words), not per source.
* Translations come from the collector, made once for every device, and appear at once. The device translates only reports the collector has not seen yet.

### Fixed
* Fraction chips in their own row. On a desktop the filter row scrolled sideways without a scrollbar, Grüne and Linke were out of reach. On a wide screen the chips wrap.

## 0.9.0 (2026-10-08)

### Added
* **Members of the Bundestag:** all 630 members of the 21st Bundestag with their fraction, recognised by name in every report. 27 well known members also by the last name alone.
* **Who says what:** a story in the politics lens shows the members per fraction, those who posted about it themselves marked with ✎. A tap filters by the fraction or the member. Fraction chips CDU/CSU, AfD, SPD, Grüne and Linke in the filter row.
* **Kinds of reports** as badges: 🎙 Interview, 🗳 Vote, 🗣 Speech, 📄 Document.
* **Votes of the Bundestag** from abgeordnetenwatch.de, each a report with its result.
* **100 new sources, 194 in total:** the Bundesregierung, the ministries of the interior and digital affairs, the Federal Court of Justice, BSI and German Customs on the federal Mastodon, the Bundestag on YouTube, Deutschlandfunk Interview der Woche, phoenix persönlich, POLITICO Berlin Playbook, FragDenStaat, abgeordnetenwatch.de votes and 88 members of the Bundestag on Bluesky.
* **Collector only:** sources with many accounts or large feeds come through the collector data, not with every refresh of the app.
* **Source list for many sources:** a summary line, a search field, groups by lens, class and fraction that open with a tap, a group "Needs attention" for failing sources, networks as one line.

### Fixed
* Feeds without a title (Mastodon) take the first sentence as title, podcasts without an episode page link the audio file. Both were dropped before.

## 0.8.0 (2026-10-08)

### Added
* **Politics lens:** a switch between Security and Politics above the views. Politics shows governments, parliaments, elections, laws, diplomacy, sanctions and tariffs.
* **Actors:** 18 people and institutions (Trump, White House, Merz, Bundestag, von der Leyen, EU Commission, Putin, Kremlin, Zelensky, NATO and more) recognised in English, German, Russian and Ukrainian, as chips and as a filter.
* **In the original:** a statement in the own words of an actor stands on top of its story.
* Politics tiles: original statements and decisions of 24 hours, developing stories, the loudest actor of 6 hours. A **Signal** chip shows only stories with an original statement or two independent sources.
* **Map of capitals:** in the politics lens capitals with lines between two capitals whose actors one story names.
* **Bridges** between the lenses: a story shows a linked story of the other lens with the same actor or city on the same day.
* **20 politics sources:** Trump (Truth Social, through trumpstruth.org), White House, Bundestag, European Commission, Council of the EU, Kremlin, Russian Foreign Ministry, Zelensky, UN Press, Tagesschau Inland, Spiegel, Zeit, FAZ, NPR, Handelsblatt, Politico Europe, Politico, Axios. 94 sources in total.

## 0.7.1 (2026-10-08)

### Fixed
* Place filter: the chip to remove it stands first in the filter row, on a phone it was out of view at the end after a tap on the map. All removes a place filter as well.

## 0.7.0 (2026-10-07)

### Added
* Rybar Tactical and Rybar America, found through the forward graph of the raw archive. The Rybar network has thirteen channels, 74 sources in total.

## 0.6.0 (2026-10-07)

### Added
* **Air alerts tile:** the drone and missile tracks of the Ukrainian Air Force have their own tile and list instead of flooding the stories.

### Changed
* Russian incident channels (Baza, Mash, SHOT, 112, ASTRA, Ostorozhno, Sirena) count only with security and crisis topics, like general news media.

## 0.5.1 (2026-10-06)

### Fixed
* Telegram posts that start with a speaker line ("Trump:") take the quote into the headline.
* Ostorozhno, novosti and Ostorozhno, Moskva count as one network.

## 0.5.0 (2026-10-05)

### Added
* **Rybar network:** eleven channels (Russian main channel, English, German, Middle East, Europe, Balkans, Caucasus, Asia, Central Asia, Africa, Latin America). Channels of one network count as one source.

### Changed
* German translation runs straight from the device to Google, the proxy is only the fallback. When Google refuses, the app pauses and retries later instead of giving up.
* Sources that cannot be reached show their error in red in the source list.

### Fixed
* Translations that came back unchanged are no longer kept as final, they are retried.

## 0.4.1 (2026-10-05)

### Fixed
* Russian grouping checked on 1.067 real reports: a place is no longer counted again as word, governors and authorities only count with crisis topics, common Russian words are ignored, short Rosaviatsiya label lines take the next line into the headline.

## 0.4.0 (2026-10-05)

### Added
* **38 more sources**, 62 in total: Russian incident channels (Baza, Mash, SHOT, 112, ASTRA, Ostorozhno), Russian authorities and governors (Rosaviatsiya, MChS, Investigative Committee, Belgorod, Bryansk, Voronezh, Sevastopol, Krasnodar, Moscow), Russian independent media (Meduza, Mediazona, Current Time, Agentstvo, The Bell), partisan military channels (Rybar, WarGonzo, Dva Mayora), Ukrainian Air Force, DeepState, IDF, Middle East Spectator, Abu Ali Express, NEXTA, Liveuamap, NetBlocks.
* **Measuring systems:** earthquakes from USGS and EMSC, alerts from GDACS, extreme weather from the US National Weather Service, ground stops from the FAA. Their reports carry coordinates.
* **Seven classes** instead of four: Physical, Primary, Early, OSINT, Specialist, Perspective (German: Parteiisch) and Confirming. Every source with region, language, trust and perspective.
* **Event confidence** per story from class and trust of its independent sources.
* **Russian and Ukrainian** places and event words are recognised in the original.
* Filters by region (Russia, Ukraine, Middle East, DACH, USA) and topic.

### Changed
* A primary source confirms a story like a leading medium.

### Fixed
* Translation: lines that Google leaves untranslated in a batch are translated on their own.

## 0.3.0 (2026-10-05)

### Added
* **VectorScope Sensor:** air activity (tankers, AWACS, reconnaissance, bombers flying together) and every squawk 7700 become reports of their own and join the stories. New status Observed, lead time also from the sensor.
* **Echo detector:** a report that copies an earlier one of another source counts as echo, not as source.
* **Situation map:** view Map with stories, military aircraft, emergencies and lines from named aircraft to their story.
* **German:** DE translates headlines and excerpts through Google Translate, cached on the device.
* The three tiles above the stories filter on tap.

## 0.2.2 (2026-10-05)

### Added
* The version is shown at the end of Sources.

## 0.2.1 (2026-10-05)

### Fixed
* Stories no longer chain loosely related reports into one giant story: every report must match the first report of its story.
* Leading news media only count with security and crisis topics, culture, sport and podcasts are left out.
* Grouping uses headline words only and needs two shared specific words. Checked on 439 real reports: about four in five stories with several sources are right.
* Headlines without "#BREAKING" prefixes and no longer cut after abbreviations like "USS Harry S.".

## 0.2.0 (2026-10-05)

### Added
* **Stories:** reports from different sources about the same event become one card with status Signal, Emerging, Reported or Confirmed, a time axis and the lead time of the first unverified report. Every report of a story in order on tap.
* **Telegram newsrooms** as tier Breaking, read through the proxy: OSINTdefender, RAGE X, War Monitor, Insider Paper, Clash Report.
* **Confirming sources:** Tagesschau, Deutschlandfunk, DW, BBC World, Al Jazeera.
* **Tiers** for every source: Unverified, OSINT, Specialist, Confirming.
* **Probe collector** on GitHub Actions for one week, INTEL merges its reports.
* Pulse: reports of the last hour, unverified share, developing stories.

### Changed
* The flat feed is now the view **Wire**, Stories is the default.

## 0.1.1 (2026-10-05)

### Fixed
* Endings like "… mehr…" or "Read more" are removed from excerpts.
* Naval News is read through RSS only, its Bluesky feed answered with an error.

## 0.1.0 (2026-10-05)

First version.

### Added
* Feed of 14 verified sources from Bluesky and RSS, checked in the test lab for existence, activity and machine readability.
* Bluesky posts that link an article of the same source are merged with it.
* Recognition of military callsigns, about 45 aircraft types and about 100 places in English and German.
* Live match with military aircraft from adsb.lol: callsign named, or type named near a named place. One tap opens the aircraft in AIR.
* Filters by category and live match, places of the last 24 hours, health of every source.
* New posts since the last visit are marked. The last loaded feed is shown at once on the next start, also offline.
* Demo mode `?demo` with synthetic items.
