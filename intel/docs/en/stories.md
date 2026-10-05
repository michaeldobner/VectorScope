# Stories

[Deutsche Version](../de/stories.md) · [Overview](README.md)

A single post says little. Five independent sources that report the same thing within an hour say a lot. INTEL therefore groups reports from different sources into **stories** and shows how far each story is confirmed. The logic is in `src/data/stories.ts`.

## Classes of the sources

Every source belongs to one of seven classes, see [Sources](sources.md) for the full list:

| Class | Time axis | Examples |
|---|---|---|
| Physical | light blue square | USGS, EMSC, GDACS, VectorScope Sensor |
| Primary | white dot with blue ring | Rosaviatsiya, MChS, governors, Ukrainian Air Force, IDF, NWS, FAA |
| Early | hollow grey dot | Baza, Mash, SHOT, 112, ASTRA, OSINTdefender, RAGE X |
| OSINT | blue dot | Bellingcat, ISW, DeepState, NetBlocks |
| Specialist | blue dot | The Aviationist, The War Zone, Mediazona |
| Perspective (DE: Parteiisch) | dashed grey dot | Rybar, WarGonzo, Dva Mayora, Middle East Spectator |
| Confirming | white dot | Tagesschau, BBC, DW, Meduza, Current Time |

## Status of a story

| Status | Condition |
|---|---|
| **Observed** | Only measuring systems saw it, nobody reported it yet |
| **Signal** | One early or partisan source |
| **Emerging** | Several early or partisan sources, nobody else yet |
| **Reported** | At least one OSINT or specialist source |
| **Confirmed** | At least one primary or confirming source |

## Event confidence

Next to the status every card shows a percentage: how sure the event is. It is calculated from the independent sources of the story, echoes left out:

1. Every source lowers the remaining doubt by its **class weight times its trust**. Weights: primary 0,7, physical 0,6, confirming 0,55, specialist 0,45, OSINT 0,4, early 0,3, perspective 0,2.
2. A second source of the same class counts 60 %, a third 36 %: voices of one kind tend to repeat each other.
3. Agreement across classes removes another 10 % of the remaining doubt for two classes, 25 % for three or more.
4. The value never exceeds 99 %.

Example: an incident channel reports an explosion in Voronezh (about 15 %), a partisan channel follows (about 30 %), the governor confirms (about 75 %), a leading medium reports (87 %). This exact case is a test in `data/physical.test.ts`. The weights are a starting point. After the probe week they are checked against how often each class was right.

## How reports are grouped

1. For every report INTEL collects its tokens: places, callsigns and aircraft types from headline and excerpt, words from the headline only, because headlines say what happened and excerpts are full of boilerplate. Common words in English and German are ignored, German event words are mapped to English (Pest to plague, Drohne to drone, Explosion to explosion).
2. Each token is weighted by how rare it is among all current reports. A callsign weighs most, then places, then types and words. Tokens that appear in more than 2,5 % of all reports (navy, pentagon, ukraine) count nothing, nor do generic words like week, president or government.
3. Two reports of **different** sources within 36 hours belong together when their shared tokens weigh enough and at least two headline words are among them, or one word together with a callsign. A place alone is never enough.
4. A report joins a story only if it matches the **first** report of that story, and in a larger story at least one more. Loose chains (A like B, B like C, C like D) therefore never grow into one giant story.

Reports of the same source never link directly. A channel that repeats itself is not confirmation.

## Echo detector

Telegram channels often copy each other. A later report of another source that shares at least 60 % of all its words with an earlier report is an **echo**: it stays in the story, but it does not count as a source, neither for the status nor for the number of sources. The card shows "1 echo", the list of reports marks the copy. Channels of one network, such as the eleven Rybar channels, count once as well: the first one counts, the others are shown as echoes.

## Lead time

When a story has an early, partisan or measured report and a later confirming or specialist one, the card shows how far the first was ahead, for example "RAGE X 1 h 6 min ahead of Tagesschau". This is the measurement the probe collector is about: are the fast channels really ahead, and by how much.

## Card

| Element | Meaning |
|---|---|
| Status chip | Observed, Signal, Emerging, Reported, Confirmed |
| Percentage | Event confidence |
| Headline | Of the most trustworthy report, the earliest at that tier |
| Time axis | Every report as a dot from the first to the last, coloured by tier |
| Ladder | How many sources per tier, and the lead time |
| Chips, LIVE rows | Entities and live matches of all reports of the story |
| Show reports in order | Every report with time, source and link: how the story came about |

## Order

**Developing** at the top: stories with several sources and activity in the last 12 hours, the most sources first. Below **Latest**: everything else, newest first. The three numbers above show reports of the last hour, how many of them are unverified, and how many stories are developing.

## Quality on real data

Checked on 439 real reports of 2026-10-05: of 36 stories with several sources about four in five were right, for example B-1 bombers leaving RAF Fairford (Insider Paper on Telegram first, then The War Zone, ItaMilRadar, confirmed by the BBC) or the F125 frigates getting IRIS-T SLM (hartpunkt, Naval News, The War Zone). The wrong ones share two specific words without being the same event, like two different strikes on boats.

## Limits

* Grouping reads headline and excerpt, not the full article. Two reports about the same event in completely different words stay apart.
* Translation is limited to a list of event words. A German and an English report meet mostly through places, callsigns and types.
* A confirmed story is confirmed by a source, not by INTEL. Leading media also err.
