# Stories

[English version](../en/stories.md) · [Übersicht](README.md)

Ein einzelner Beitrag sagt wenig. Fünf unabhängige Quellen, die innerhalb einer Stunde dasselbe melden, sagen viel. INTEL bündelt deshalb Meldungen verschiedener Quellen zu **Stories** und zeigt, wie weit jede Story bestätigt ist. Die Logik steht in `src/data/stories.ts`.

## Klassen der Quellen

Jede Quelle gehört zu einer von sieben Klassen, die vollständige Liste steht unter [Quellen](quellen.md):

| Klasse | Zeitachse | Beispiele |
|---|---|---|
| Messung | hellblaues Quadrat | USGS, EMSC, GDACS, VectorScope Sensor |
| Primär | weißer Punkt mit blauem Ring | Rosaviatsiya, MChS, Gouverneure, ukrainische Luftwaffe, IDF, NWS, FAA |
| Früh | hohler grauer Punkt | Baza, Mash, SHOT, 112, ASTRA, OSINTdefender, RAGE X |
| OSINT | blauer Punkt | Bellingcat, ISW, DeepState, NetBlocks |
| Fachmedium | blauer Punkt | The Aviationist, The War Zone, Mediazona |
| Parteiisch | gestrichelter grauer Punkt | Rybar, WarGonzo, Dva Mayora, Middle East Spectator |
| Bestätigend | weißer Punkt | Tagesschau, BBC, DW, Meduza, Current Time |

## Status einer Story

| Status | Bedingung |
|---|---|
| **Observed** | Nur Messsysteme haben es gesehen, noch niemand hat berichtet |
| **Signal** | Eine frühe oder parteiische Quelle |
| **Emerging** | Mehrere frühe oder parteiische Quellen, sonst noch niemand |
| **Reported** | Mindestens eine OSINT- oder Fachquelle |
| **Confirmed** | Mindestens eine primäre oder bestätigende Quelle |

## Event Confidence

Neben dem Status zeigt jede Karte einen Prozentwert: wie sicher das Ereignis ist. Er wird aus den unabhängigen Quellen der Story berechnet, Echos zählen nicht:

1. Jede Quelle senkt den verbleibenden Zweifel um **Gewicht der Klasse mal Trust**. Gewichte: Primär 0,7, Messung 0,6, Bestätigend 0,55, Fachmedium 0,45, OSINT 0,4, Früh 0,3, Parteiisch 0,2.
2. Eine zweite Quelle derselben Klasse zählt 60 %, eine dritte 36 %: Stimmen einer Art wiederholen sich gern.
3. Übereinstimmung über Klassen hinweg nimmt weitere 10 % des verbleibenden Zweifels bei zwei Klassen, 25 % bei drei und mehr.
4. Der Wert übersteigt nie 99 %.

Beispiel: Ein Incident-Kanal meldet eine Explosion in Voronezh (rund 15 %), ein parteiischer Kanal zieht nach (rund 30 %), der Gouverneur bestätigt (rund 75 %), ein Leitmedium berichtet (87 %). Genau dieser Fall ist ein Test in `data/physical.test.ts`. Die Gewichte sind ein Startwert. Nach der Probewoche werden sie daran geprüft, wie oft jede Klasse richtig lag.

## Was zählt

Quellen mit breitem Themenfeld zählen nur bei Sicherheits- und Krisenthemen (Angriffe, Explosionen, Brände, Unfälle, Militär, Festnahmen wegen Landesverrat und Ähnliches): allgemeine Nachrichtenmedien, Behörden mit allgemeinen Aufgaben wie Gouverneure und die russischen Ereigniskanäle Baza, Mash, SHOT, 112, ASTRA, Ostorozhno und Sirena. Ohne diesen Filter bildeten die russischen Kanäle Stories mehrerer Quellen über Promis und Betrug. Geprüft an einem Tag des Probe-Sammlers: 180 von 326 Beiträgen dieser Kanäle fielen weg, die Stories über Angriffe und Brände blieben.

Die Drohnen- und Raketenspuren der ukrainischen Luftwaffe (mehrere Hundert am Tag) sind Live-Verfolgung, keine Ereignisse. Sie bleiben aus den Stories heraus und haben eine eigene Kachel, siehe [Bedienung](bedienung.md). Starts strategischer Bomber und die Morgenbilanz bleiben normale Meldungen.

## Wie Meldungen gebündelt werden

1. Für jede Meldung sammelt INTEL ihre Merkmale: Orte, Callsigns und Flugzeugtypen aus Überschrift und Auszug, Wörter nur aus der Überschrift, weil Überschriften sagen, was passiert ist, und Auszüge voller Floskeln sind. Häufige Wörter auf Englisch und Deutsch werden ignoriert, deutsche Ereigniswörter auf Englisch abgebildet (Pest zu plague, Drohne zu drone, Explosion zu explosion).
2. Jedes Merkmal wird danach gewichtet, wie selten es unter allen aktuellen Meldungen ist. Ein Callsign wiegt am meisten, dann Orte, dann Typen und Wörter. Merkmale, die in mehr als 2,5 % aller Meldungen vorkommen (navy, pentagon, ukraine), zählen nichts, ebenso allgemeine Wörter wie week, president oder government.
3. Zwei Meldungen **verschiedener** Quellen innerhalb von 36 Stunden gehören zusammen, wenn ihre gemeinsamen Merkmale genug wiegen und mindestens zwei Wörter der Überschrift darunter sind, oder ein Wort zusammen mit einem Callsign. Ein Ort allein reicht nie.
4. Eine Meldung kommt nur dann in eine Story, wenn sie zur **ersten** Meldung dieser Story passt, in einer größeren Story zusätzlich zu mindestens einer weiteren. Lose Ketten (A ähnlich B, B ähnlich C, C ähnlich D) wachsen dadurch nie zu einer Riesen-Story.

Meldungen derselben Quelle verbinden sich nie direkt. Ein Kanal, der sich wiederholt, ist keine Bestätigung.

## Echo-Detektor

Telegram-Kanäle schreiben oft voneinander ab. Eine spätere Meldung einer anderen Quelle, die mit einer früheren mindestens 60 % aller Wörter teilt, ist ein **Echo**: Sie bleibt in der Story, zählt aber nicht als Quelle, weder für den Status noch für die Zahl der Quellen. Die Karte zeigt „1 echo“, die Liste der Meldungen markiert die Kopie. Kanäle eines Netzwerks, etwa die dreizehn Rybar-Kanäle, zählen ebenfalls nur einmal: Der erste zählt, die anderen erscheinen als Echo.

## Vorsprung

Hat eine Story eine frühe, parteiische oder gemessene Meldung und eine spätere bestätigende oder Fachmeldung, zeigt die Karte, wie weit die erste vorn lag, zum Beispiel „RAGE X 1 h 6 min ahead of Tagesschau“. Genau das misst der Probe-Sammler: Sind die schnellen Kanäle wirklich vorn, und um wie viel.

## Karte

| Element | Bedeutung |
|---|---|
| Status-Chip | Observed, Signal, Emerging, Reported, Confirmed |
| Prozentwert | Event Confidence |
| Überschrift | Von der vertrauenswürdigsten Meldung, auf dieser Stufe die früheste |
| Zeitachse | Jede Meldung als Punkt von der ersten bis zur letzten, eingefärbt nach Stufe |
| Leiter | Wie viele Quellen je Stufe, dazu der Vorsprung |
| Chips, LIVE-Zeilen | Entities und Live-Treffer aller Meldungen der Story |
| Show reports in order | Jede Meldung mit Zeit, Quelle und Link: wie die Story entstanden ist |

## Reihenfolge

Oben **Developing**: Stories mit mehreren Quellen und Aktivität in den letzten 12 Stunden, die meisten Quellen zuerst. Darunter **Latest**: alles andere, das Neueste zuerst. Die drei Zahlen darüber zeigen die Meldungen der letzten Stunde, wie viele davon ungeprüft sind und wie viele Stories sich entwickeln.

## Qualität an echten Daten

Geprüft an 439 echten Meldungen vom 05.10.2026: Von 36 Stories mit mehreren Quellen stimmten rund vier von fünf, zum Beispiel der Abzug der B-1-Bomber aus RAF Fairford (zuerst Insider Paper auf Telegram, dann The War Zone, ItaMilRadar, bestätigt von der BBC) oder IRIS-T SLM für die Fregatten F125 (hartpunkt, Naval News, The War Zone). Die falschen teilen zwei spezielle Wörter, ohne dasselbe Ereignis zu sein, etwa zwei verschiedene Angriffe auf Boote.

## Grenzen

* Die Bündelung liest Überschrift und Auszug, nicht den ganzen Artikel. Zwei Meldungen über dasselbe Ereignis in völlig anderen Worten bleiben getrennt.
* Die Übersetzung beschränkt sich auf eine Liste von Ereigniswörtern. Eine deutsche und eine englische Meldung finden vor allem über Orte, Callsigns und Typen zusammen.
* Eine bestätigte Story ist von einer Quelle bestätigt, nicht von INTEL. Auch Leitmedien irren.
