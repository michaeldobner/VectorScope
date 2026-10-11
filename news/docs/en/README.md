# VectorScope News · Documentation

[Deutsche Version](../de/README.md) · [Back to the module](../../README.md) · [Concept (German)](../../KONZEPT.md)

## NEWS at a glance

| | |
|---|---|
| Purpose | The news of the day as stories, with the perspectives of many outlets side by side |
| Sources | 35 feeds from 29 outlets in 12 countries, each checked in the test lab |
| Updates | The collector builds a new edition every 10 minutes, the app asks every 5 minutes |
| Language | App in German or English, reports in German, English or the original |
| Address | https://michaeldobner.github.io/VectorScope/news/ |
| Version | 0.1.0 |

## User guide

* **Sections** sit in the bar at the bottom: Top, Other view, DE · CH · AT, World, Business, Tech, Science, Culture, Sport. Swiping left or right turns to the next section. On the iPad they are on the left.
* **Top** shows the lead story, places 2 and 3, the other view as a strip to swipe, and places 4 to 6.
* **Tapping a story** slides in a sheet: headline, teaser, where the text comes from ("From Tagesschau", "Translated from BBC"), the perspectives and every source by group. Pull up for everything, swipe down to close. Every source opens its article.
* **2 min** starts the briefing: ten stories, one per screen, tap for the next, swipe down to stop.
* **The slider icon at the bottom right:** app language, reports, perspective, view.
* **New:** a blue dot marks stories since the last visit, "+3 sources" grown ones, the line "You read up to here" separates new from known. When a new edition brings new stories, a notice appears at the bottom, the content does not jump.

## Sources

| Group | Outlets | Weight |
|---|---|---|
| Public broadcasters | Tagesschau (API and homepage), ZDFheute, Deutschlandfunk, DW, SRF, RTS, RSI, ORF | 1 |
| Quality press and broadcasters | Spiegel, ntv, NZZ, Der Standard, Die Presse | 1 |
| International | BBC, The Guardian, NPR, Al Jazeera, DW English, France 24, Euronews, ABC Australia, CNA, SCMP, Times of India | 1 |
| Business | CNBC | 0.8 |
| Tech media | heise, Golem | 0.7 |
| Fast news | 20 Minuten, Blick, watson | 0.4 |

Checked with `lab/news.mjs` (workflow `lab-news.yml`, results on the branch `lab-news-results`). Not included: swissinfo (feed discontinued), Tages-Anzeiger (not reachable), CBC (timeout), CNN (frozen since 2023), Bild (no timestamps), Reuters and AP (no free feeds).

## Stories and importance

* **Grouping:** every headline becomes a vector of the multilingual model `paraphrase-multilingual-MiniLM-L12-v2` (as in INTEL, `collector/embed.ts`). A report joins the story whose most similar report has a cosine similarity of at least 0.8. Without the model, shared words count.
* **Importance, German-speaking:** sum of the outlet weights, plus 0.5 per country, plus the Tagesschau homepage (places 1 to 3: 4 points, to 8: 2, to 15: 1) and the first three reports of ntv (1.5), plus 0.4 per DACH outlet, minus 0.12 per hour since the last report.
* **Importance, global:** weights and countries of outlets outside DACH only, DACH outlets count 0.2.
* **Section:** from feed, address, category and words of each report. A section needs a third of the reports, else World.
* **Text:** headline and teaser of the most factual outlet, chosen per language (German: Tagesschau, SRF, ZDFheute …, English: BBC, Guardian, NPR …, original: Tagesschau, SRF, BBC …). Translated only when no outlet reports in that language, and the app says so.
* **Picture:** from the feed, else the preview picture of the article page (og:image). A picture an outlet uses for three or more articles is a logo and is dropped.

## Architecture

| Part | File |
|---|---|
| Feeds | `news/src/data/feeds.ts` |
| Reading feeds | `news/src/data/parse.ts` |
| Stories, sections, importance, texts | `news/src/data/edition.ts`, tests in `edition.test.ts` |
| Collector | `collector/news.ts`, workflow `.github/workflows/news.yml` |
| App | `news/src/main.ts`, `news/src/i18n.ts`, `news/src/styles.css` |

The collector writes to the branch `news-data`: `news.json` (the edition), `news-translations.json` (translations, 7 days), `news-og.json` (pictures of article pages, 3 days), `news-stats.json` (state of every feed). Translation uses the public Google endpoint as in INTEL, without a key.

## Legal

NEWS shows headlines, short teasers and preview pictures as the publishers offer them in their feeds and pages, and links every article. Full texts are not stored. The app keeps settings and read status on the device only.
