# Stories

[Deutsche Version](../de/stories.md) · [Overview](README.md)

A single post says little. Five independent sources that report the same thing within an hour say a lot. INTEL therefore groups reports from different sources into **stories** and shows how far each story is confirmed. The logic is in `src/data/stories.ts`.

## Tiers of the sources

Every source has a tier that says how far its report carries.

| Tier | Shown as | Sources | Meaning |
|---|---|---|---|
| Breaking | Unverified, hollow grey dot | Telegram newsrooms: OSINTdefender, RAGE X, War Monitor, Insider Paper, Clash Report | Fast, often minutes after an event, without verification |
| OSINT | OSINT, blue dot | ItaMilRadar, Bellingcat, ISW, Jakub Janovsky | Open source researchers with a track record |
| Specialist | Specialist, blue dot | The Aviationist, The War Zone, Defense News, Naval News, hartpunkt and others | Specialist media with an editorial process |
| Confirming | Confirming, white dot | Tagesschau, Deutschlandfunk, DW, BBC, Al Jazeera, US DoD | Authorities and leading news media |

## Status of a story

| Status | Condition |
|---|---|
| **Signal** | One unverified source |
| **Emerging** | Several unverified sources, nobody else yet |
| **Reported** | At least one OSINT or specialist source |
| **Confirmed** | At least one confirming source |

There are no percentages on purpose. A figure like "72 %" would suggest a precision that nothing measures yet. The status says exactly who reported, the numbers on the card say how many.

## How reports are grouped

1. For every report INTEL collects its tokens: places, callsigns and aircraft types from headline and excerpt, words from the headline only, because headlines say what happened and excerpts are full of boilerplate. Common words in English and German are ignored, German event words are mapped to English (Pest to plague, Drohne to drone, Explosion to explosion).
2. Each token is weighted by how rare it is among all current reports. A callsign weighs most, then places, then types and words. Tokens that appear in more than 2,5 % of all reports (navy, pentagon, ukraine) count nothing, nor do generic words like week, president or government.
3. Two reports of **different** sources within 36 hours belong together when their shared tokens weigh enough and at least two headline words are among them, or one word together with a callsign. A place alone is never enough.
4. A report joins a story only if it matches the **first** report of that story, and in a larger story at least one more. Loose chains (A like B, B like C, C like D) therefore never grow into one giant story.

Reports of the same source never link directly. A channel that repeats itself is not confirmation.

## Lead time

When a story has an unverified report and a later confirming or specialist one, the card shows how far the first was ahead, for example "RAGE X 1 h 6 min ahead of Tagesschau". This is the measurement the probe collector is about: are the fast channels really ahead, and by how much.

## Card

| Element | Meaning |
|---|---|
| Status chip | Signal, Emerging, Reported, Confirmed |
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
