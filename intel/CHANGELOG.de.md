# Changelog · VectorScope Intel

Alle wesentlichen Änderungen am Modul INTEL. [English](CHANGELOG.md) · [Changelog der Sammlung](../CHANGELOG.de.md)

Das Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), die Versionen folgen [Semantic Versioning](https://semver.org/lang/de/).

## 0.9.0 (2026-10-08)

### Neu
* **Bundestagsabgeordnete:** alle 630 Mitglieder des 21. Bundestags mit Fraktion, in jeder Meldung am Namen erkannt. 27 bekannte Abgeordnete auch am Nachnamen allein.
* **Who says what:** Eine Story in der Politik-Linse zeigt die Abgeordneten je Fraktion, wer selbst dazu geschrieben hat, ist mit ✎ markiert. Ein Tipp filtert nach Fraktion oder Person. Fraktions-Chips CDU/CSU, AfD, SPD, Grüne und Linke in der Filterzeile.
* **Arten von Meldungen** als Abzeichen: 🎙 Interview, 🗳 Abstimmung, 🗣 Rede, 📄 Dokument.
* **Abstimmungen des Bundestags** von abgeordnetenwatch.de, jede eine Meldung mit Ergebnis.
* **100 neue Quellen, 194 insgesamt:** Bundesregierung, Innen- und Digitalministerium, Bundesgerichtshof, BSI und Zoll auf dem Mastodon des Bundes, der Bundestag auf YouTube, Deutschlandfunk Interview der Woche, phoenix persönlich, POLITICO Berlin Playbook, FragDenStaat, Abstimmungen von abgeordnetenwatch.de und 88 Bundestagsabgeordnete auf Bluesky.
* **Nur Sammler:** Quellen mit vielen Konten oder großen Feeds kommen über die Sammlerdaten, nicht bei jeder Aktualisierung der App.
* **Quellenliste für viele Quellen:** eine Übersichtszeile, ein Suchfeld, Gruppen nach Linse, Klasse und Fraktion, die ein Tipp öffnet, eine Gruppe „Needs attention“ für ausgefallene Quellen, Netzwerke als eine Zeile.

### Behoben
* Feeds ohne Titel (Mastodon) nehmen den ersten Satz als Titel, Podcasts ohne Episodenseite verlinken die Audiodatei. Beide fielen vorher weg.

## 0.8.0 (2026-10-08)

### Neu
* **Politik-Linse:** ein Umschalter zwischen Security und Politics über den Ansichten. Politics zeigt Regierungen, Parlamente, Wahlen, Gesetze, Diplomatie, Sanktionen und Zölle.
* **Akteure:** 18 Personen und Institutionen (Trump, Weißes Haus, Merz, Bundestag, von der Leyen, EU-Kommission, Putin, Kreml, Selenskyj, NATO und weitere), erkannt auf Englisch, Deutsch, Russisch und Ukrainisch, als Chips und als Filter.
* **Im Original:** Eine Aussage in den eigenen Worten eines Akteurs steht oben in ihrer Story.
* Politik-Kacheln: Originalaussagen und Beschlüsse der letzten 24 Stunden, Stories in Entwicklung, der lauteste Akteur der letzten 6 Stunden. Ein Chip **Signal** zeigt nur Stories mit Originalaussage oder zwei unabhängigen Quellen.
* **Karte der Hauptstädte:** in der Politik-Linse Hauptstädte mit Linien zwischen zwei Hauptstädten, deren Akteure eine Story nennt.
* **Brücken** zwischen den Linsen: Eine Story zeigt eine verbundene Story der anderen Linse mit demselben Akteur oder derselben Stadt am selben Tag.
* **20 Politik-Quellen:** Trump (Truth Social, über trumpstruth.org), Weißes Haus, Bundestag, EU-Kommission, Rat der EU, Kreml, russisches Außenministerium, Selenskyj, UN Press, Tagesschau Inland, Spiegel, Zeit, FAZ, NPR, Handelsblatt, Politico Europe, Politico, Axios. Insgesamt 94 Quellen.

## 0.7.1 (2026-10-08)

### Behoben
* Ort-Filter: Die Schaltfläche zum Aufheben steht vorn in der Filterleiste. Auf dem Handy lag sie nach einem Tipp auf die Karte außer Sicht am Ende. „All“ hebt einen Ort-Filter ebenfalls auf.

## 0.7.0 (2026-10-07)

### Neu
* Rybar Tactical und Rybar America, gefunden über den Weiterleitungs-Graphen des Rohdaten-Archivs. Das Rybar-Netzwerk hat dreizehn Kanäle, insgesamt 74 Quellen.

## 0.6.0 (2026-10-07)

### Neu
* **Kachel Luftalarme:** Die Drohnen- und Raketenspuren der ukrainischen Luftwaffe haben eine eigene Kachel und Liste, statt die Stories zu fluten.

### Geändert
* Russische Ereigniskanäle (Baza, Mash, SHOT, 112, ASTRA, Ostorozhno, Sirena) zählen nur noch bei Sicherheits- und Krisenthemen, wie allgemeine Nachrichtenmedien.

## 0.5.1 (2026-10-06)

### Behoben
* Telegram-Beiträge, die mit einer Sprecherzeile beginnen („Trump:“), nehmen das Zitat in die Überschrift.
* Ostorozhno, novosti und Ostorozhno, Moskva zählen als ein Netzwerk.

## 0.5.0 (2026-10-05)

### Neu
* **Rybar-Netzwerk:** elf Kanäle (russischer Hauptkanal, Englisch, Deutsch, Nahost, Europa, Balkan, Kaukasus, Asien, Zentralasien, Afrika, Lateinamerika). Kanäle eines Netzwerks zählen als eine Quelle.

### Geändert
* Die deutsche Übersetzung läuft direkt vom Gerät zu Google, der Proxy ist nur noch Ersatz. Wenn Google ablehnt, pausiert die App und versucht es später erneut, statt aufzugeben.
* Nicht erreichbare Quellen zeigen ihren Fehler rot in der Quellenliste.

### Behoben
* Übersetzungen, die unverändert zurückkommen, gelten nicht mehr als fertig und werden erneut versucht.

## 0.4.1 (2026-10-05)

### Behoben
* Russische Bündelung an 1.067 echten Meldungen geprüft: Ein Ort zählt nicht mehr zusätzlich als Wort, Gouverneure und Behörden zählen nur bei Krisenthemen, häufige russische Wörter werden ignoriert, kurze Kennzeilen von Rosaviatsiya nehmen die nächste Zeile mit in die Überschrift.

## 0.4.0 (2026-10-05)

### Neu
* **38 weitere Quellen**, insgesamt 62: russische Incident-Kanäle (Baza, Mash, SHOT, 112, ASTRA, Ostorozhno), russische Behörden und Gouverneure (Rosaviatsiya, MChS, Ermittlungskomitee, Belgorod, Brjansk, Woronesch, Sewastopol, Krasnodar, Moskau), unabhängige russische Medien (Meduza, Mediazona, Current Time, Agentstvo, The Bell), parteiische Militärkanäle (Rybar, WarGonzo, Dva Mayora), ukrainische Luftwaffe, DeepState, IDF, Middle East Spectator, Abu Ali Express, NEXTA, Liveuamap, NetBlocks.
* **Messsysteme:** Erdbeben von USGS und EMSC, Warnungen von GDACS, Extremwetter vom US National Weather Service, Ground Stops der FAA. Ihre Meldungen tragen Koordinaten.
* **Sieben Klassen** statt vier: Messung, Primär, Früh, OSINT, Fachmedium, Parteiisch und Bestätigend. Jede Quelle mit Region, Sprache, Trust und Perspektive.
* **Event Confidence** je Story aus Klasse und Trust ihrer unabhängigen Quellen.
* **Russisch und Ukrainisch:** Orte und Ereigniswörter werden im Original erkannt.
* Filter nach Region (Russland, Ukraine, Nahost, DACH, USA) und Thema.

### Geändert
* Eine Primärquelle bestätigt eine Story wie ein Leitmedium.

### Behoben
* Übersetzung: Zeilen, die Google in einem Paket unübersetzt lässt, werden einzeln übersetzt.

## 0.3.0 (2026-10-05)

### Neu
* **VectorScope Sensor:** Luftaktivität (Tanker, AWACS, Aufklärer, Bomber im Verband) und jeder Squawk 7700 werden eigene Meldungen und verbinden sich mit den Stories. Neuer Status Observed, Vorsprung auch durch den Sensor.
* **Echo-Detektor:** Eine Meldung, die eine frühere einer anderen Quelle abschreibt, zählt als Echo, nicht als Quelle.
* **Lagekarte:** Ansicht Map mit Stories, Militärflugzeugen, Notfällen und Linien von genannten Flugzeugen zu ihrer Story.
* **Deutsch:** DE übersetzt Überschriften und Auszüge über Google Translate, gespeichert auf dem Gerät.
* Die drei Kacheln über den Stories filtern auf Tipp.

## 0.2.2 (2026-10-05)

### Neu
* Die Version steht am Ende von Sources.

## 0.2.1 (2026-10-05)

### Behoben
* Stories verketten lose verwandte Meldungen nicht mehr zu einer Riesen-Story: Jede Meldung muss zur ersten Meldung ihrer Story passen.
* Leitmedien zählen nur noch bei Sicherheits- und Krisenthemen, Kultur, Sport und Podcasts bleiben draußen.
* Die Bündelung nutzt nur Wörter der Überschrift und braucht zwei gemeinsame spezielle Wörter. Geprüft an 439 echten Meldungen: Rund vier von fünf Stories mit mehreren Quellen stimmen.
* Überschriften ohne „#BREAKING“-Vorsatz und nicht mehr abgeschnitten nach Abkürzungen wie „USS Harry S.“.

## 0.2.0 (2026-10-05)

### Neu
* **Stories:** Meldungen verschiedener Quellen über dasselbe Ereignis werden eine Karte mit Status Signal, Emerging, Reported oder Confirmed, einer Zeitachse und dem Vorsprung der ersten ungeprüften Meldung. Jede Meldung einer Story auf Tipp in zeitlicher Reihenfolge.
* **Telegram-Eilmelder** als Stufe Breaking, über den Proxy gelesen: OSINTdefender, RAGE X, War Monitor, Insider Paper, Clash Report.
* **Bestätigende Quellen:** Tagesschau, Deutschlandfunk, DW, BBC World, Al Jazeera.
* **Stufen** für jede Quelle: Unverified, OSINT, Specialist, Confirming.
* **Probe-Sammler** auf GitHub Actions für eine Woche, INTEL führt seine Meldungen zusammen.
* Puls: Meldungen der letzten Stunde, Anteil ungeprüft, sich entwickelnde Stories.

### Geändert
* Der flache Feed ist jetzt die Ansicht **Wire**, Stories ist die Standardansicht.

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
