# Changelog · VectorScope News

All notable changes to the module NEWS. [Deutsch](CHANGELOG.de.md) · [Changelog of the collection](../CHANGELOG.md)

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [Semantic Versioning](https://semver.org/).

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
