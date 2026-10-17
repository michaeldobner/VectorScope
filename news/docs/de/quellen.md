# Quellen

[English version](../en/sources.md) · [Übersicht](README.md)

NEWS liest 42 Feeds von 33 Medien in 13 Ländern: 36 im Test-Labor geprüft, 6 aus Belgien vom eigenen Server geprüft. Die Liste steht in `news/src/data/feeds.ts`. Gewählt wurde nach drei Fragen: Liefert die Quelle zuverlässig und frei, ist sie sachlich oder bringt sie Tempo, und erweitert sie den Blick um ein Land oder eine Sprache.

## Gruppen und Gewichte

| Gruppe | Gewicht | Rolle |
|---|---|---|
| Öffentlich-rechtlich | 1 | Der sachliche Kern aus Deutschland, der Schweiz und Österreich, in drei Landessprachen der Schweiz |
| Qualitätspresse und Sender | 1 | Zweite Stimme mit eigener Gewichtung, ntv mit der Reihenfolge seiner Redaktion |
| International | 1 | Perspektiven aus Großbritannien, USA, Katar, Frankreich, Europa, Australien, Singapur, Hongkong und Indien |
| Wirtschaft | 0,8 | CNBC für Märkte und Unternehmen |
| Fachmedien | 0,7 | heise und Golem für Tech |
| Tempo | 0,4 | 20 Minuten, Blick, watson, HLN: schnell, boulevardnah, sie bestimmen nie, was oben steht, und eine einzelne Meldung von ihnen rückt in einem Ressort nicht nach oben, nur weil sie neu ist |

Belgien, zuerst Flandern, hat einen eigenen Blickwinkel: VRT NWS, De Morgen, De Tijd und HLN, in den Gruppen oben. Die Schlagzeilen von VRT NWS (Hoofdpunten) zählen wie die Tagesschau-Startseite, nur für Belgien. VRT NWS schreibt auch auf Englisch, belgische Geschichten haben deshalb oft einen englischen Text ohne Übersetzung.

Das Gewicht zählt, wenn NEWS die Wichtigkeit einer Geschichte berechnet, siehe [Geschichten und Wichtigkeit](geschichten.md). Jedes Medium zählt einmal, auch wenn es mit mehreren Feeds berichtet.

## Alle Feeds

| Feed | Medium | Land | Sprache | Gruppe | Gewicht | Hinweis |
|---|---|---|---|---|---|---|
| [`tagesschau`](https://www.tagesschau.de/api2u/news/) | Tagesschau | DE | Deutsch | Öffentlich-rechtlich | 1 | JSON-API |
| [`tagesschau-home`](https://www.tagesschau.de/api2u/homepage/) | Tagesschau | DE | Deutsch | Öffentlich-rechtlich | 1 | nur Reihenfolge der Startseite |
| [`zdf`](https://www.zdf.de/rss/zdf/nachrichten) | ZDFheute | DE | Deutsch | Öffentlich-rechtlich | 1 |  |
| [`dlf`](https://www.deutschlandfunk.de/nachrichten-100.rss) | Deutschlandfunk | DE | Deutsch | Öffentlich-rechtlich | 1 |  |
| [`dw-de`](https://rss.dw.com/xml/rss-de-all) | DW | DE | Deutsch | Öffentlich-rechtlich | 1 |  |
| [`srf`](https://www.srf.ch/news/bnf/rss/1646) | SRF | CH | Deutsch | Öffentlich-rechtlich | 1 |  |
| [`srf-schweiz`](https://www.srf.ch/news/bnf/rss/1890) | SRF | CH | Deutsch | Öffentlich-rechtlich | 1 | Ressort DACH |
| [`srf-wirtschaft`](https://www.srf.ch/news/bnf/rss/1926) | SRF | CH | Deutsch | Öffentlich-rechtlich | 1 | Ressort Wirtschaft |
| [`rts`](https://www.rts.ch/info/?format=rss/news) | RTS | CH | Französisch | Öffentlich-rechtlich | 1 |  |
| [`rsi`](https://www.rsi.ch/info/?f=rss) | RSI | CH | Italienisch | Öffentlich-rechtlich | 1 |  |
| [`orf`](https://rss.orf.at/news.xml) | ORF | AT | Deutsch | Öffentlich-rechtlich | 1 |  |
| [`spiegel`](https://www.spiegel.de/schlagzeilen/index.rss) | Spiegel | DE | Deutsch | Qualitätspresse und Sender | 1 |  |
| [`ntv`](https://www.n-tv.de/rss) | ntv | DE | Deutsch | Qualitätspresse und Sender | 1 |  |
| [`nzz`](https://www.nzz.ch/recent.rss) | NZZ | CH | Deutsch | Qualitätspresse und Sender | 1 |  |
| [`nzz-schweiz`](https://www.nzz.ch/schweiz.rss) | NZZ | CH | Deutsch | Qualitätspresse und Sender | 1 | Ressort DACH |
| [`standard`](https://www.derstandard.at/rss) | Der Standard | AT | Deutsch | Qualitätspresse und Sender | 1 |  |
| [`presse`](https://www.diepresse.com/rss) | Die Presse | AT | Deutsch | Qualitätspresse und Sender | 1 |  |
| [`bbc`](https://feeds.bbci.co.uk/news/world/rss.xml) | BBC | GB | Englisch | International | 1 |  |
| [`bbc-africa`](https://feeds.bbci.co.uk/news/world/africa/rss.xml) | BBC | GB | Englisch | International | 1 | Ressort Welt |
| [`guardian`](https://www.theguardian.com/world/rss) | The Guardian | GB | Englisch | International | 1 |  |
| [`npr`](https://feeds.npr.org/1004/rss.xml) | NPR | US | Englisch | International | 1 |  |
| [`aljazeera`](https://www.aljazeera.com/xml/rss/all.xml) | Al Jazeera | QA | Englisch | International | 1 |  |
| [`dw-en`](https://rss.dw.com/xml/rss-en-all) | DW | DE | Englisch | International | 1 |  |
| [`france24`](https://www.france24.com/en/rss) | France 24 | FR | Englisch | International | 1 |  |
| [`euronews`](https://www.euronews.com/rss) | Euronews | EU | Englisch | International | 1 |  |
| [`abc`](https://www.abc.net.au/news/feed/51120/rss.xml) | ABC Australia | AU | Englisch | International | 1 |  |
| [`cna`](https://www.channelnewsasia.com/rssfeeds/8395884) | CNA | SG | Englisch | International | 1 |  |
| [`scmp`](https://www.scmp.com/rss/91/feed) | SCMP | HK | Englisch | International | 1 |  |
| [`toi`](https://timesofindia.indiatimes.com/rssfeedstopstories.cms) | Times of India | IN | Englisch | International | 1 |  |
| [`cnbc`](https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114) | CNBC | US | Englisch | Wirtschaft | 0,8 | Top News, Börse nach Titel ins Ressort Wirtschaft |
| [`cnbc-world`](https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362) | CNBC | US | Englisch | Wirtschaft | 0,8 | World News, mit dem Börsenschluss in New York, Börse nach Titel ins Ressort Wirtschaft |
| [`heise`](https://www.heise.de/rss/heise-atom.xml) | heise | DE | Deutsch | Fachmedien | 0,7 | Ressort Tech |
| [`golem`](https://rss.golem.de/rss.php?feed=RSS2.0) | Golem | DE | Deutsch | Fachmedien | 0,7 | Ressort Tech |
| [`20min`](https://partner-feeds.20min.ch/rss/20minuten) | 20 Minuten | CH | Deutsch | Tempo | 0,4 |  |
| [`blick`](https://www.blick.ch/rss.xml) | Blick | CH | Deutsch | Tempo | 0,4 |  |
| [`watson`](https://www.watson.ch/api/1.0/rss/index.xml) | watson | CH | Deutsch | Tempo | 0,4 |  |
| [`vrt`](https://www.vrt.be/vrtnws/nl.rss.articles.xml) | VRT NWS | BE | Niederländisch | Öffentlich-rechtlich | 1 |  |
| [`vrt-home`](https://www.vrt.be/vrtnws/nl.rss.headlines.xml) | VRT NWS | BE | Niederländisch | Öffentlich-rechtlich | 1 | nur die Reihenfolge der Schlagzeilen |
| [`vrt-en`](https://www.vrt.be/vrtnws/en.rss.articles.xml) | VRT NWS | BE | Englisch | Öffentlich-rechtlich | 1 | dasselbe Medium wie `vrt` |
| [`demorgen`](https://www.demorgen.be/in-het-nieuws/rss.xml) | De Morgen | BE | Niederländisch | Qualitätspresse und Sender | 1 |  |
| [`tijd`](https://www.tijd.be/rss/nieuws.xml) | De Tijd | BE | Niederländisch | Wirtschaft | 0,8 |  |
| [`hln`](https://www.hln.be/home/rss.xml) | HLN | BE | Niederländisch | Tempo | 0,4 |  |

## Geprüft im Test-Labor

Jeder Feed wurde am 11. Oktober 2026 mit `lab/news.mjs` geprüft, im Workflow `lab-news.yml`, der nur von Hand startet und sein Ergebnis nur ins Protokoll des Laufs schreibt. `lab/news-images.ts` misst dort zusätzlich die Größe der Bilder jedes Feeds. Die Prüfung misst pro Feed: Antwort, Format (RSS, Atom, JSON), Zeichensatz, Zahl der Meldungen, Alter der neuesten, Anteil mit Bild und mit Anriss, CORS. Brauchbar ist ein Feed mit Antwort 200, mindestens 5 Meldungen und einer neuesten unter 48 Stunden.

Was das Labor gelehrt hat und der Parser in `news/src/data/parse.ts` beachtet:

* Golem liefert ISO-8859-1, ZDF schreibt Umlaute als HTML-Entities.
* Golem setzt ein Zählpixel, wo ein Bild stehen sollte.
* SRF beginnt jeden Titel mit einer Spitzmarke vor einem Gedankenstrich („Krieg in der Ukraine“, dann der Titel), Deutschlandfunk ebenso mit Bindestrich („Palästinensergebiete - …“), die NZZ mit Etiketten wie „LIVE-TICKER -“.
* BBC liefert Bilder 240 Pixel breit, die Adresse nennt die Größe, NEWS fragt 976 Pixel an.
* Al Jazeera, DW English, Euronews, ORF, Die Presse und NPR liefern im Feed kein Bild. Das Vorschaubild der Artikelseite gab es bei 41 von 47 Proben, NPR und Die Presse nennen dort aber nur ihr Logo.
* Fast kein Feed erlaubt den Abruf aus dem Browser (CORS). Deshalb liest der Sammler auf dem Server, nicht die App.

## Die belgischen Feeds

Die belgischen Feeds (17. Oktober 2026) ließen sich vom Entwicklungsrechner aus nicht prüfen, sein Netz erreicht belgische Seiten nicht. Stattdessen prüft der eigene Server sie in jeder Runde: `/data/news-stats.json` sagt pro Feed, ob er liefert, wie viele Meldungen und welchen Fehler. Ein Feed, der nicht liefert, kostet nichts, die anderen laufen weiter. Die erste Runde am 17. Oktober 2026: VRT NWS (Niederländisch und Englisch), De Morgen und HLN liefern. De Standaard und Het Nieuwsblad (beide Mediahuis) weisen den Server mit 403 ab und sind raus. De Tijd antwortete mit 404, Brussels Times ohne Meldungen. In der zweiten Runde, mit mehreren Adressen nacheinander (`alt` in `feeds.ts`), liefert De Tijd aus `rss/nieuws.xml`, auch die Schlagzeilen von VRT NWS liefern; jede Adresse von Brussels Times antwortet mit ihrer Web-App, einen Feed gibt es nicht. `news-stats.json` nennt die Adresse, die liefert, und wenn keine liefert, den Anfang der Antwort.

## Nicht dabei

| Kandidat | Grund |
|---|---|
| swissinfo | Feed eingestellt, Antwort 410 |
| Tages-Anzeiger | nicht erreichbar |
| CBC | Zeitüberschreitung |
| CNN | antwortet, aber seit 2023 eingefroren |
| De Standaard, Het Nieuwsblad | weisen den eigenen Server ab (403, Mediahuis) |
| Brussels Times | kein Feed, jede Adresse antwortet mit der Web-App |
| Bild | keine Zeitstempel, viel hinter BILDplus, Ton passt nicht zur Blattlinie |
| Reuters, AP | keine offiziellen freien Feeds |

## Eine Quelle hinzufügen

1. Den Feed in `lab/news.mjs` eintragen und das Labor von Hand starten (Actions, Lab news feeds, Run workflow).
2. Ist er brauchbar, in `news/src/data/feeds.ts` mit Medium, Land, Gruppe und Sprache eintragen, bei einem Ressort-Feed mit `ressort`.
3. Gehört das Medium zu den sachlichsten seiner Sprache, in `LEAD_ORDER` aufnehmen.
