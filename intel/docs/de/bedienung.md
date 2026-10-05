# Bedienung

[English version](../en/user-guide.md) · [Übersicht](README.md)

## Ansichten

| Breite | Aufbau |
|---|---|
| iPhone, iPad hoch, Split View | Eine Spalte mit den Reitern **Feed**, **Live**, **Places** und **Sources** |
| Ab 900 Punkten, iPad quer | Links der Feed, rechts Live now, Places und Sources |

Das Logo oben links führt zurück zur VectorScope-Startseite. Der Status zeigt **LIVE**, wenn Quellen geantwortet haben, **LOADING** beim ersten Laden, **OFFLINE**, wenn nichts geladen werden konnte, und **DEMO** im Demo-Modus. Der runde Pfeil lädt alles neu.

## Feed

Jeder Eintrag zeigt Quelle, Kategorie, Kanal (Bluesky oder RSS) und Alter, darunter Überschrift und einen kurzen Auszug. Ein Tipp auf die Überschrift öffnet den Artikel oder Beitrag beim Herausgeber. Hat ein Bluesky-Beitrag auf den Artikel verlinkt, öffnet **Post on Bluesky** den Beitrag.

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
| Aviation, OSINT, Naval, Defence, DACH, Official | Beiträge der Quellen dieser Kategorie, siehe [Quellen](quellen.md) |
| `◎ Ort ✕` | Nur Beiträge, die diesen Ort nennen. ✕ entfernt den Filter |

Der gewählte Filter bleibt auf dem Gerät gespeichert.

## Live now

Die Zahl der Militärflugzeuge, die gerade weltweit ihre Position senden, und jedes Flugzeug mit Live-Treffer, zusammen mit der Überschrift, die es nennt.

## Places

Orte, die in den letzten 24 Stunden genannt wurden, sortiert nach Häufigkeit. Der Balken zeigt den Anteil. Ein Tipp filtert den Feed nach dem Ort, ein zweiter Tipp hebt den Filter auf.

## Sources

Jede Quelle mit Statuspunkt (blau: hat geantwortet, rot: fehlgeschlagen), ihren Kanälen und dem Alter ihres neuesten Beitrags. Fällt eine Quelle aus, arbeiten die anderen weiter.

## Aktualisierung

Der Feed lädt alle fünf Minuten neu, die Live-Flugzeuge alle zwei Minuten, solange die App geöffnet ist. Beim nächsten Start erscheint der zuletzt geladene Feed sofort, auch ohne Netz.
