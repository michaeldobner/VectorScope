# Sources

[Deutsche Version](../de/quellen.md) · [Overview](README.md)

NEWS reads 36 feeds from 29 outlets in 12 countries. The list is in `news/src/data/feeds.ts`. Each was chosen by three questions: does it deliver reliably and freely, is it factual or does it bring speed, and does it widen the view by a country or a language.

## Groups and weights

| Group | Weight | Role |
|---|---|---|
| Public broadcasters | 1 | The factual core from Germany, Switzerland and Austria, in three of Switzerland's languages |
| Quality press and broadcasters | 1 | A second voice with its own weighting, ntv with the order of its newsroom |
| International | 1 | Perspectives from the United Kingdom, the USA, Qatar, France, Europe, Australia, Singapore, Hong Kong and India |
| Business | 0.8 | CNBC for markets and companies |
| Tech media | 0.7 | heise and Golem for tech |
| Fast news | 0.4 | 20 Minuten, Blick, watson: fast, close to tabloid, they never decide what is on top |

The weight counts when NEWS computes the importance of a story, see [Stories and importance](stories.md). Every outlet counts once, even when it reports with several feeds.

## All feeds

| Feed | Outlet | Country | Language | Group | Weight | Note |
|---|---|---|---|---|---|---|
| [`tagesschau`](https://www.tagesschau.de/api2u/news/) | Tagesschau | DE | German | Public broadcaster | 1 | JSON API |
| [`tagesschau-home`](https://www.tagesschau.de/api2u/homepage/) | Tagesschau | DE | German | Public broadcaster | 1 | order of the homepage only |
| [`zdf`](https://www.zdf.de/rss/zdf/nachrichten) | ZDFheute | DE | German | Public broadcaster | 1 |  |
| [`dlf`](https://www.deutschlandfunk.de/nachrichten-100.rss) | Deutschlandfunk | DE | German | Public broadcaster | 1 |  |
| [`dw-de`](https://rss.dw.com/xml/rss-de-all) | DW | DE | German | Public broadcaster | 1 |  |
| [`srf`](https://www.srf.ch/news/bnf/rss/1646) | SRF | CH | German | Public broadcaster | 1 |  |
| [`srf-schweiz`](https://www.srf.ch/news/bnf/rss/1890) | SRF | CH | German | Public broadcaster | 1 | section DACH |
| [`srf-wirtschaft`](https://www.srf.ch/news/bnf/rss/1926) | SRF | CH | German | Public broadcaster | 1 | section Business |
| [`rts`](https://www.rts.ch/info/?format=rss/news) | RTS | CH | French | Public broadcaster | 1 |  |
| [`rsi`](https://www.rsi.ch/info/?f=rss) | RSI | CH | Italian | Public broadcaster | 1 |  |
| [`orf`](https://rss.orf.at/news.xml) | ORF | AT | German | Public broadcaster | 1 |  |
| [`spiegel`](https://www.spiegel.de/schlagzeilen/index.rss) | Spiegel | DE | German | Quality press and broadcaster | 1 |  |
| [`ntv`](https://www.n-tv.de/rss) | ntv | DE | German | Quality press and broadcaster | 1 |  |
| [`nzz`](https://www.nzz.ch/recent.rss) | NZZ | CH | German | Quality press and broadcaster | 1 |  |
| [`nzz-schweiz`](https://www.nzz.ch/schweiz.rss) | NZZ | CH | German | Quality press and broadcaster | 1 | section DACH |
| [`standard`](https://www.derstandard.at/rss) | Der Standard | AT | German | Quality press and broadcaster | 1 |  |
| [`presse`](https://www.diepresse.com/rss) | Die Presse | AT | German | Quality press and broadcaster | 1 |  |
| [`bbc`](https://feeds.bbci.co.uk/news/world/rss.xml) | BBC | GB | English | International | 1 |  |
| [`bbc-africa`](https://feeds.bbci.co.uk/news/world/africa/rss.xml) | BBC | GB | English | International | 1 | section World |
| [`guardian`](https://www.theguardian.com/world/rss) | The Guardian | GB | English | International | 1 |  |
| [`npr`](https://feeds.npr.org/1004/rss.xml) | NPR | US | English | International | 1 |  |
| [`aljazeera`](https://www.aljazeera.com/xml/rss/all.xml) | Al Jazeera | QA | English | International | 1 |  |
| [`dw-en`](https://rss.dw.com/xml/rss-en-all) | DW | DE | English | International | 1 |  |
| [`france24`](https://www.france24.com/en/rss) | France 24 | FR | English | International | 1 |  |
| [`euronews`](https://www.euronews.com/rss) | Euronews | EU | English | International | 1 |  |
| [`abc`](https://www.abc.net.au/news/feed/51120/rss.xml) | ABC Australia | AU | English | International | 1 |  |
| [`cna`](https://www.channelnewsasia.com/rssfeeds/8395884) | CNA | SG | English | International | 1 |  |
| [`scmp`](https://www.scmp.com/rss/91/feed) | SCMP | HK | English | International | 1 |  |
| [`toi`](https://timesofindia.indiatimes.com/rssfeedstopstories.cms) | Times of India | IN | English | International | 1 |  |
| [`cnbc`](https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114) | CNBC | US | English | Business | 0.8 | Top News, markets to Business by title |
| [`cnbc-world`](https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362) | CNBC | US | English | Business | 0.8 | World News, with the close of Wall Street, markets to Business by title |
| [`heise`](https://www.heise.de/rss/heise-atom.xml) | heise | DE | German | Tech media | 0.7 | section Tech |
| [`golem`](https://rss.golem.de/rss.php?feed=RSS2.0) | Golem | DE | German | Tech media | 0.7 | section Tech |
| [`20min`](https://partner-feeds.20min.ch/rss/20minuten) | 20 Minuten | CH | German | Fast news | 0.4 |  |
| [`blick`](https://www.blick.ch/rss.xml) | Blick | CH | German | Fast news | 0.4 |  |
| [`watson`](https://www.watson.ch/api/1.0/rss/index.xml) | watson | CH | German | Fast news | 0.4 |  |

## Checked in the test lab

Every feed was checked on 11 October 2026 with `lab/news.mjs`, in the workflow `lab-news.yml`, which starts by hand only and writes its result only to the log of the run. `lab/news-images.ts` there also measures the size of the pictures of every feed. Per feed the check measures: answer, format (RSS, Atom, JSON), charset, number of reports, age of the newest, share with picture and with teaser, CORS. A feed is usable with answer 200, at least 5 reports and a newest one under 48 hours.

What the lab taught, and the parser in `news/src/data/parse.ts` follows:

* Golem delivers ISO-8859-1, ZDF writes umlauts as HTML entities.
* Golem puts a counting pixel where a picture should be.
* SRF starts every title with a kicker before a dash ("Krieg in der Ukraine", then the title), Deutschlandfunk too with a hyphen ("Palästinensergebiete - …"), NZZ with labels like "LIVE-TICKER -".
* BBC delivers pictures 240 pixels wide, the address names the size, NEWS asks for 976 pixels.
* Al Jazeera, DW English, Euronews, ORF, Die Presse and NPR deliver no picture in the feed. The preview picture of the article page was there for 41 of 47 samples, but NPR and Die Presse only name their logo there.
* Almost no feed allows reading from the browser (CORS). So the collector on the server reads, not the app.

## Not included

| Candidate | Reason |
|---|---|
| swissinfo | Feed discontinued, answer 410 |
| Tages-Anzeiger | not reachable |
| CBC | timeout |
| CNN | answers, but frozen since 2023 |
| Bild | no timestamps, much behind BILDplus, tone does not fit the editorial line |
| Reuters, AP | no official free feeds |

## Adding a source

1. Add the feed to `lab/news.mjs` and start the lab by hand (Actions, Lab news feeds, Run workflow).
2. If it is usable, add it to `news/src/data/feeds.ts` with outlet, country, group and language, for a section feed with `ressort`.
3. If the outlet is among the most factual of its language, add it to `LEAD_ORDER`.
