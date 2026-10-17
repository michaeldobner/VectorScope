# Stories and importance

[Deutsche Version](../de/geschichten.md) · [Overview](README.md)

From more than a thousand reports per round NEWS makes about 230 stories, gives them sections and decides what is on top. All in `news/src/data/edition.ts`, without a language model: no AI writes texts, they come from the outlets.

## Which reports count

Reports of the last 36 hours. Not included are broadcast notices ("tagesschau 20:00 Uhr"), weather, ads, bulletins, live notices, podcasts and picture galleries of the week. Two feeds with the same report (NZZ recent and NZZ Schweiz) count once.

## Grouping by meaning

Every headline becomes a vector of the multilingual model `paraphrase-multilingual-MiniLM-L12-v2`, the same as in INTEL (`collector/embed.ts`). The English version of the headline is compared where a translation exists.

* Reports are taken in order of time. A report joins the story whose most similar report has a cosine similarity of at least **0.8**.
* When two vectors were made in different languages because a translation is missing, the bar drops by **0.08**. So "Viele Tote bei Angriff auf Flughafen in Riad" and "Twelve killed in attack on Riyadh airport" meet. In the first real round Riyadh became one story with 16 sources this way.
* When two titles share a long word (9 letters or more, like "meerjarenbegroting" or "schuldenrem"), the bar drops by another **0.1**. Flemish live pages and headlines of the same event sound too different otherwise.
* Two reports of the same feed are never joined by comparing them with each other.
* Without the model, shared words count (Jaccard from 0.5). That only finds reports in the same language.

The id of a story is the link of its first report. So it stays the same across rounds, and the app recognises what is new and what has grown.

## Sections

Every report gets a section when something says so, in this order:

1. The feed is a section (SRF Schweiz, SRF Wirtschaft, NZZ Schweiz, heise, Golem).
2. The address of the article: `/sport/`, `/wirtschaft/`, `/wissen/`, `/kultur/`, `/inland/`, `/schweiz/` and similar, in German and English.
3. The category in the feed, for Tagesschau for example "inland".
4. Words in the title: a result with a sports term becomes Sport, Bundestag, Kanton, ÖVP, Merz, Zürich and similar in a German title become DACH; Vlaanderen, Wallonia, De Wever, N-VA, De Lijn and similar in any title become Belgium, Brussels alone does not, abroad it mostly means the EU. Belgian outlets also by their address (`/binnenland/`, `/belgium/`).

The story takes the section with the most votes, on a tie in the order Sport, Tech, Business, Science, Culture, DACH, Belgium. **A section needs a third of the reports**, else it becomes World. So one business feed among four world reports does not make a business story.

## Importance

Three signals, from the editorial check against ntv, Bild, CNN and CNBC on 11 October 2026: the number of sources alone would have made Riyadh the lead, but the leading newsrooms had the diesel dispute between Trump and Zelensky on top.

**German-speaking** (`score`):

| Signal | Points |
|---|---|
| Agreement | Sum of the weights of all outlets of the story, see [Sources](sources.md) |
| Breadth | 0.5 per country |
| Newsrooms | Tagesschau homepage: places 1 to 3 give 4, to 8 give 2, to 15 give 1. Among the first three reports of ntv and the first five of CNBC World (both ordered by their newsroom, not by time): 1.5. The highest counts |
| DACH relevance | 0.4 per outlet from Germany, Switzerland or Austria (without DW English) |
| Age | minus 0.12 per hour since the newest report |

**Belgium** (`beScore`): the same, with 0.4 per Belgian outlet instead of the DACH relevance and with the headlines of VRT NWS (Hoofdpunten) as newsroom instead of Tagesschau, ntv and CNBC, with the same points per place. From each home region the outlets of the other count together like one: eight Flemish outlets on a Flemish story do not make it big in DACH, and the other way round.

**Global** (`worldScore`): weights and countries of the outlets outside DACH and Belgium only, DW English counts as international, plus 0.2 per outlet from DACH or Belgium and the same age.

The Top page shows the six stories with the highest importance in the chosen perspective. The sections do not repeat the Top stories.

## The other view

| Perspective | The other view shows | Sorted by |
|---|---|---|
| German-speaking | Stories without a DACH source with at least two international ones | Number of sources |
| Belgium | Stories without a Belgian source with at least two international ones | Number of sources |
| Global | Stories without an international source with at least two from DACH or from Belgium | Number of sources |

Every card says how many sources of the other side report: "No DACH source" or "No international source".

## The text of a story

For every language NEWS picks a lead outlet whose headline and teaser are shown on top:

| Reports | Order |
|---|---|
| German | Tagesschau, SRF, ZDFheute, Deutschlandfunk, ORF, NZZ, DW, Der Standard, Die Presse, Spiegel, ntv, heise, Golem |
| English | BBC, The Guardian, NPR, DW, France 24, Euronews, ABC Australia, CNA, Al Jazeera, SCMP, CNBC, Times of India |
| Original | Tagesschau, SRF, BBC, ZDFheute, Deutschlandfunk, ORF, NZZ, The Guardian, DW, Der Standard, Spiegel, NPR, Al Jazeera |

When an outlet reports in the chosen language, the text comes from it, unchanged. Only when none reports in that language, the lead is translated, and the app says "Translated from …". While the translation is missing, the original is shown, unmarked, the next round fetches it. The teaser is cut at about 260 characters at the end of a sentence and left out when it only repeats the title.

## Pictures

1. The picture of the lead outlet, else the first picture of an outlet outside fast news, else any.
2. When the address names the size, NEWS asks for a larger variant: ZDF, DW, SRF, RTS, Spiegel, ntv, ABC, heise and BBC, each checked in the lab (`lab/news-images.ts`).
3. For NZZ, Der Standard, Blick and 20 Minuten the feed picture is not usable: too small with a signed address, or for 20 Minuten up to 5000 pixels and 1 MB. There the picture of the article page counts.
4. When a story still has no picture, the collector reads up to 60 article pages per round and takes their preview picture (`og:image`), kept for three days.
5. A picture an outlet uses for three or more different articles is a logo and is dropped.

Pictures are not copied, the app loads them directly from the outlet.

## Translation

The headlines of all reports are translated into the other languages, and the teasers of the lead outlets, at most 400 texts per language and round, kept for seven days:

1. With **DeepL** when `DEEPL_KEY` is set on the server. DeepL API Free translates 500,000 characters a month at no cost.
2. Else through the public **Google endpoint**, as in INTEL, and when Google refuses, through the proxy.

When that refuses too, reports stay in their language. The app still works, because every story takes its text from an outlet in the chosen language where there is one.
