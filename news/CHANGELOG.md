# Changelog · VectorScope News

All notable changes to the module NEWS. [Deutsch](CHANGELOG.de.md) · [Changelog of the collection](../CHANGELOG.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

## 0.3.0 (2026-10-17)

### Added
* **Belgium, Flanders first:** VRT NWS (Dutch and English), De Standaard, De Morgen, De Tijd, Brussels Times, HLN and Het Nieuwsblad. On trial: the development machine cannot reach Belgian sites, the own server checks the feeds in every round.
* **Perspective Belgium** with its own importance (`beScore`), the section Belgium and its own other view. A device set to Dutch or to Belgium starts with English and Belgium. The outlets of the other home region count together like one, so Flemish stories do not crowd the German-speaking Top and the other way round.
* **`/data/news-stats.json`** on the own server: per feed of the last round whether it delivers, how many reports and which error.

### Fixed
* The explanations under Reports and Perspective in the settings showed as a dark box in the middle of the screen: the hint of the briefing used the same name.

## 0.2.4 (2026-10-12)

### Fixed
* The close of Wall Street stays in Business: the first five reports of CNBC World count like the first three of ntv (1.5), as both feeds are ordered by their newsroom, not by time. A single CNBC report never stayed in an edition before, not with 20 places per section either: measured in the test lab on 12 October 2026, "S&P 500 closes near flat" is now place 4 of Business.

## 0.2.3 (2026-10-12)

### Fixed
* NEWS updates while open: a new edition appears at once when you are at the top of the list and no story is open, also on return to the app. Before, every edition with a new story waited behind the notice "↑ new stories", often hidden under an open story, so the app looked frozen until it was closed and opened again. While you read, the notice stays, and the waiting edition comes in as soon as you are back at the top. Also checks on `pageshow` and `focus`, for Home Screen apps that iOS restores from memory.

## 0.2.2 (2026-10-12)

### Added
* Feed CNBC World News: it carries the close of Wall Street ("S&P 500 closes near flat …"), Top News does not. Checked in the test lab on 12 October 2026, 13 CNBC feeds compared.

### Changed
* CNBC reports go to the section Business by their title, only when they are about markets and companies (S&P 500, Wall Street, earnings, rates, oil, deals). Since 0.2.1 every CNBC report did, also politics.

## 0.2.1 (2026-10-12)

### Fixed
* CNBC shows up: its reports belong to the section Business. Its links name no section, so a single CNBC report, mostly markets, counted as world news and never ranked high enough to be shown, although the feed was read every round.

## 0.2.0 (2026-10-11)

### Added
* **2-minute briefing rebuilt:** visible Back and Next buttons with "3 / 10", swiping sideways, touch and hold to pause, a hint on the first opening. On the iPad in landscape picture and text side by side.
* **Sharing:** in the briefing and in every story, through the share sheet of the device, with headline and link to the original article.

### Changed
* **Pictures are never cut:** the whole picture in a 16:9 frame on a blurred copy of itself, for the lead story, in the story and in the briefing. Small pictures are not blown up.
* **Better resolution:** larger variants for ZDF, DW, SRF, RTS, Spiegel, ntv, ABC and heise, the article page's picture for NZZ, Der Standard, Blick and 20 Minuten, measured with the new `lab/news-images.ts`. The Guardian gives its largest variant from the feed.

## 0.1.1 (2026-10-11)

### Changed
* Documentation like the other modules: overview, user guide, sources with every feed, stories and importance, architecture, privacy and legal, in English and German, with screenshots.
* Settings and read status are stored under `vectorscope.news.` like in every module, instead of `vs-news-`. Settings made before are set once more.

## 0.1.0 (2026-10-11)

### Added
* **First version.** News from 35 feeds in 12 countries, each checked in the test lab, as stories with perspectives, sections, the other view and the 2-minute briefing.
* **Collector** `collector/news.ts` on the own server, after every round of INTEL, every 10 minutes: read the feeds, group reports into stories by meaning, find section and importance, fetch missing translations, pictures from article pages, drop logos. The edition is in `/data/news/` and reaches the app as `/data/news.json`. None of it goes to GitHub.
* **Importance from three signals:** independent outlets from many countries, the Tagesschau homepage and the first reports of ntv, and relevance for DACH. The global perspective counts outlets outside DACH.
* **No language model:** headline and teaser of a story come from its most factual outlet, chosen per language, translated only where no outlet reports in that language.
* **Settings:** app language German or English, reports in German, English or the original, perspective German-speaking or global, view calm or pictures. The first start follows the language of the device, times are shown in its time zone.
* **New and grown:** a blue dot for new stories, "+3 sources" for grown ones, the line "You read up to here", new stories come in only after a tap on the notice at the bottom.
* **Offline** NEWS shows the last edition loaded, with a notice.
* **Translation** with DeepL when `DEEPL_KEY` is set on the server, else through the public Google endpoint, directly or through the proxy.
