# Bedienung

[English version](../en/user-guide.md) · [Übersicht](README.md)

## Ansichten

| Breite | Aufbau |
|---|---|
| iPhone, iPad hoch, Split View | Eine Spalte mit den Reitern **Stories**, **Wire**, **Map**, **Live** und **Sources** (mit Places) |
| Ab 900 Punkten, iPad quer | Links Stories, Wire oder Map, oben umschaltbar, rechts Live now, Places und Sources |

Das Logo oben links führt zurück zur VectorScope-Startseite. **DE** zeigt alle Überschriften und Auszüge auf Deutsch, siehe [Deutsch](#deutsch). Der Status zeigt **LIVE**, wenn Quellen geantwortet haben, **LOADING** beim ersten Laden, **OFFLINE**, wenn nichts geladen werden konnte, und **DEMO** im Demo-Modus. Der runde Pfeil lädt alles neu.

## Stories

Die Standardansicht. Meldungen verschiedener Quellen über dasselbe Ereignis bilden eine Karte. Oben stehen drei Kacheln: Meldungen der letzten Stunde, wie viele davon ungeprüft sind, wie viele Stories sich entwickeln. **Ein Tipp auf eine Kachel filtert die Stories** entsprechend, ein zweiter Tipp hebt den Filter auf.

| Auf der Karte | Bedeutung |
|---|---|
| **SIGNAL** grau | Eine ungeprüfte Quelle, zum Beispiel ein einzelner Telegram-Kanal |
| **EMERGING** blau gestrichelt | Mehrere ungeprüfte Quellen |
| **REPORTED** blau | Eine OSINT- oder Fachquelle hat berichtet |
| **CONFIRMED** weiß | Ein Leitmedium oder eine Behörde hat berichtet |
| Zeitachse | Jede Meldung als Punkt: hohl grau ungeprüft, blau OSINT oder Fachmedium, weiß bestätigend |
| `2 unverified · 1 specialist` | Wie viele Quellen je Stufe |
| `⏱ RAGE X 1 h 6 min ahead of Tagesschau` | Wie weit die erste ungeprüfte Meldung vor der ersten bestätigenden lag |
| Show reports in order | Jede Meldung mit Zeit und Quelle, wie die Story entstanden ist |

Ein hellblaues Quadrat auf der Zeitachse und der Status **OBSERVED** kommen vom VectorScope-Sensor, siehe [Sensor und Karte](sensor.md). „1 echo“ markiert eine Quelle, die nur eine frühere Meldung abgeschrieben hat.

**Developing** oben listet Stories mit mehreren Quellen aus den letzten 12 Stunden, **Latest** darunter alles andere. Einzelheiten: [Stories](stories.md).

## Map

Die Lage auf einer Karte: Kreise für Stories, Punkte für Militärflugzeuge, rot für Notfälle, gestrichelte Linien von genannten Flugzeugen zu ihrer Story. Einzelheiten: [Sensor und Karte](sensor.md).

## Wire

Jede Meldung einzeln, die neueste zuerst, wie ein Nachrichtenticker. Jeder Eintrag zeigt Quelle, Stufe (Unverified, OSINT, Specialist, Confirming), Kanal (Telegram, Bluesky oder RSS) und Alter, darunter Überschrift und einen kurzen Auszug. Ein Tipp auf die Überschrift öffnet den Artikel oder Beitrag beim Herausgeber. Hat ein Bluesky-Beitrag auf den Artikel verlinkt, öffnet **Post on Bluesky** den Beitrag.

Unter dem Text zeigt INTEL, was es erkannt hat:

| Chip | Bedeutung |
|---|---|
| `FORTE11` in Ice Blue | Militärisches Callsign |
| `KC-135` | Flugzeugtyp |
| `◎ Black Sea` | Ort, antippen filtert den Feed danach |

Ein blauer Punkt vor der Quelle markiert Beiträge, die seit deinem letzten Besuch erschienen sind.

## Live-Treffer

| Zeile | Bedeutung |
|---|---|
| **LIVE** `FORTE11 Q4 15.850 m named in post` | Der Beitrag nennt dieses Callsign, und das Flugzeug ist gerade in der Luft |
| **LIVE** `NATO03 E3TF 9.150 m 257 km from Baltic Sea` | Der Beitrag nennt diesen Typ und einen Ort, und ein Flugzeug dieses Typs ist gerade in der Nähe dieses Orts |
| `Airborne now: 2 × C-17` | Der Typ ist genannt und in der Luft, aber nicht nahe einem genannten Ort. Ein schwacher Hinweis, grau dargestellt |

Ein Tipp auf eine Zeile öffnet AIR mit diesem Flugzeug ausgewählt und auf der Karte verfolgt. Einträge mit Live-Treffer tragen links eine blaue Linie. Abgeglichen werden nur Beiträge der letzten 48 Stunden. Wie es funktioniert: [Abgleich](abgleich.md).

## Filter

| Filter | Zeigt |
|---|---|
| All | Alles, das Neueste zuerst |
| Live match | Nur Beiträge mit blauer LIVE-Zeile, die Zahl zeigt wie viele |
| Breaking, Aviation, OSINT, Naval, Defence, DACH, News, Official | Meldungen der Quellen dieser Kategorie, siehe [Quellen](quellen.md) |
| `◎ Ort ✕` | Nur Beiträge, die diesen Ort nennen. ✕ entfernt den Filter |

Der gewählte Filter bleibt auf dem Gerät gespeichert.

## Live now

Die Zahl der Militärflugzeuge, die gerade weltweit ihre Position senden, und jedes Flugzeug mit Live-Treffer, zusammen mit der Überschrift, die es nennt.

## Places

Orte, die in den letzten 24 Stunden genannt wurden, sortiert nach Häufigkeit. Der Balken zeigt den Anteil. Ein Tipp filtert den Feed nach dem Ort, ein zweiter Tipp hebt den Filter auf.

## Sources

Jede Quelle mit Statuspunkt (blau: hat geantwortet, rot: fehlgeschlagen), ihren Kanälen und dem Alter ihres neuesten Beitrags. Fällt eine Quelle aus, arbeiten die anderen weiter.

Am Ende dieses Bereichs steht die Version von INTEL.

## Deutsch

**DE** oben rechts übersetzt Überschriften und Auszüge ins Deutsche, auch die Meldungen einer Story und die Überschriften unter Live now. Übersetzt wird nur, was auf dem Bildschirm steht, jede Übersetzung bleibt auf dem Gerät gespeichert. Deutsche Quellen bleiben, wie sie sind. Die Übersetzung kommt von Google Translate über den Proxy, ohne Schlüssel und ohne Garantie: Klappt sie nicht, bleibt der Originaltext stehen, und INTEL versucht es eine Minute später erneut. Callsigns, Typen und Orte werden immer im Original erkannt.

## Aktualisierung

Der Feed lädt alle fünf Minuten neu, die Live-Flugzeuge alle zwei Minuten, solange die App geöffnet ist. Beim nächsten Start erscheint der zuletzt geladene Feed sofort, auch ohne Netz.
