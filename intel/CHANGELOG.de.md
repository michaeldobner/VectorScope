# Changelog · VectorScope Intel

Alle wesentlichen Änderungen am Modul INTEL. [English](CHANGELOG.md) · [Changelog der Sammlung](../CHANGELOG.de.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## 0.1.1 (2026-10-05)

### Behoben
* Endungen wie „… mehr…“ oder „Read more“ werden aus den Auszügen entfernt.
* Naval News wird nur noch über RSS gelesen, sein Bluesky-Feed antwortete mit einem Fehler.

## 0.1.0 (2026-10-05)

Erste Version.

### Neu
* Feed aus 14 geprüften Quellen von Bluesky und RSS, im Test-Labor geprüft auf Existenz, Aktivität und maschinelle Lesbarkeit.
* Bluesky-Beiträge, die auf einen Artikel derselben Quelle verlinken, werden mit ihm zusammengeführt.
* Erkennung militärischer Callsigns, rund 45 Flugzeugtypen und rund 100 Orte auf Englisch und Deutsch.
* Live-Abgleich mit Militärflugzeugen von adsb.lol: Callsign genannt, oder Typ nahe einem genannten Ort genannt. Ein Tipp öffnet das Flugzeug in AIR.
* Filter nach Kategorie und Live-Treffer, Orte der letzten 24 Stunden, Zustand jeder Quelle.
* Neue Beiträge seit dem letzten Besuch werden markiert. Der zuletzt geladene Feed erscheint beim nächsten Start sofort, auch offline.
* Demo-Modus `?demo` mit synthetischen Beiträgen.
