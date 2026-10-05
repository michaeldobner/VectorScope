# Stories

[English version](../en/stories.md) · [Übersicht](README.md)

Ein einzelner Beitrag sagt wenig. Fünf unabhängige Quellen, die innerhalb einer Stunde dasselbe melden, sagen viel. INTEL bündelt deshalb Meldungen verschiedener Quellen zu **Stories** und zeigt, wie weit jede Story bestätigt ist. Die Logik steht in `src/data/stories.ts`.

## Stufen der Quellen

Jede Quelle hat eine Stufe, die sagt, wie weit ihre Meldung trägt.

| Stufe | Darstellung | Quellen | Bedeutung |
|---|---|---|---|
| Breaking | Unverified, hohler grauer Punkt | Telegram-Eilmelder: OSINTdefender, RAGE X, War Monitor, Insider Paper, Clash Report | Schnell, oft Minuten nach einem Ereignis, ohne Prüfung |
| OSINT | OSINT, blauer Punkt | ItaMilRadar, Bellingcat, ISW, Jakub Janovsky | Open-Source-Rechercheure mit Erfahrung |
| Fachmedium | Specialist, blauer Punkt | The Aviationist, The War Zone, Defense News, Naval News, hartpunkt und weitere | Fachmedien mit Redaktion |
| Bestätigend | Confirming, weißer Punkt | Tagesschau, Deutschlandfunk, DW, BBC, Al Jazeera, US DoD | Behörden und Leitmedien |

## Status einer Story

| Status | Bedingung |
|---|---|
| **Signal** | Eine ungeprüfte Quelle |
| **Emerging** | Mehrere ungeprüfte Quellen, sonst noch niemand |
| **Reported** | Mindestens eine OSINT- oder Fachquelle |
| **Confirmed** | Mindestens eine bestätigende Quelle |

Prozentwerte gibt es bewusst nicht. Eine Zahl wie „72 %“ würde eine Genauigkeit vortäuschen, die noch nichts misst. Der Status sagt genau, wer gemeldet hat, die Zahlen auf der Karte sagen wie viele.

## Wie Meldungen gebündelt werden

1. Für jede Meldung sammelt INTEL ihre Merkmale: Orte, Callsigns, Flugzeugtypen und die Wörter aus Überschrift und Auszug. Häufige Wörter auf Englisch und Deutsch werden ignoriert, deutsche Ereigniswörter auf Englisch abgebildet (Pest zu plague, Drohne zu drone, Explosion zu explosion).
2. Jedes Merkmal wird danach gewichtet, wie selten es unter allen aktuellen Meldungen ist. Ein Callsign wiegt am meisten, dann Orte, dann Typen und Wörter. Merkmale, die in mehr als 8 % aller Meldungen vorkommen, zählen nichts.
3. Zwei Meldungen **verschiedener** Quellen innerhalb von 36 Stunden gehören zusammen, wenn ihre gemeinsamen Merkmale genug wiegen und mindestens ein gewöhnliches Wort darunter ist. Ein Ort allein reicht nicht, in der Ukraine passieren viele Stories.
4. Gruppen werden verkettet: Passt A zu B und B zu C, sind alle drei eine Story.

Meldungen derselben Quelle verbinden sich nie direkt. Ein Kanal, der sich wiederholt, ist keine Bestätigung.

## Vorsprung

Hat eine Story eine ungeprüfte Meldung und eine spätere bestätigende oder Fachmeldung, zeigt die Karte, wie weit die erste vorn lag, zum Beispiel „RAGE X 1 h 6 min ahead of Tagesschau“. Genau das misst der Probe-Sammler: Sind die schnellen Kanäle wirklich vorn, und um wie viel.

## Karte

| Element | Bedeutung |
|---|---|
| Status-Chip | Signal, Emerging, Reported, Confirmed |
| Überschrift | Von der vertrauenswürdigsten Meldung, auf dieser Stufe die früheste |
| Zeitachse | Jede Meldung als Punkt von der ersten bis zur letzten, eingefärbt nach Stufe |
| Leiter | Wie viele Quellen je Stufe, dazu der Vorsprung |
| Chips, LIVE-Zeilen | Entities und Live-Treffer aller Meldungen der Story |
| Show reports in order | Jede Meldung mit Zeit, Quelle und Link: wie die Story entstanden ist |

## Reihenfolge

Oben **Developing**: Stories mit mehreren Quellen und Aktivität in den letzten 12 Stunden, die meisten Quellen zuerst. Darunter **Latest**: alles andere, das Neueste zuerst. Die drei Zahlen darüber zeigen die Meldungen der letzten Stunde, wie viele davon ungeprüft sind und wie viele Stories sich entwickeln.

## Grenzen

* Die Bündelung liest Überschrift und Auszug, nicht den ganzen Artikel. Zwei Meldungen über dasselbe Ereignis in völlig anderen Worten bleiben getrennt.
* Die Übersetzung beschränkt sich auf eine Liste von Ereigniswörtern. Eine deutsche und eine englische Meldung finden vor allem über Orte, Callsigns und Typen zusammen.
* Eine bestätigte Story ist von einer Quelle bestätigt, nicht von INTEL. Auch Leitmedien irren.
