# Bedienung

[English version](../en/user-guide.md) · [Übersicht](README.md)

## Ansichten

| Breite | Aufbau |
|---|---|
| iPhone, iPad hoch, Split View | Eine Spalte mit den Reitern **Stories**, **Wire**, **Map** (mit Places unter der Karte), **Live** und **Sources**. Der Linsen-Schalter sitzt in der oberen Leiste. Beim Scrollen nach unten gleitet die Leiste weg, nach oben kommt sie zurück |
| Ab 900 Punkten, iPad quer | Links Stories, Wire oder Map, oben umschaltbar, rechts Live now, Places und Sources |

Das Logo oben links führt zurück zur VectorScope-Startseite. Der Status zeigt **LIVE**, wenn Quellen geantwortet haben, **LOADING** beim ersten Laden, **OFFLINE**, wenn nichts geladen werden konnte, und **DEMO** im Demo-Modus, am Handy nur als farbiger Punkt. Die Lupe öffnet die [Suche](#suche), **🌐** die Sprache der Meldungen, siehe [Sprache der Meldungen](#sprache-der-meldungen). Der runde Pfeil lädt alles neu.

## Suche

Die Lupe öffnet ein Suchfeld über den Filtern. Stories und Wire zeigen dann nur Meldungen, die jedes eingegebene Wort enthalten, in Überschrift, Auszug, Name der Quelle, einer Übersetzung, einem genannten Ort, Akteur oder Bundestagsabgeordneten. Linse und Filter gelten weiter. ✕ oder Escape schließen die Suche und leeren sie. Die Suche wird nicht gespeichert.

## Now

INTEL öffnet mit **◉ Now**, dem ersten Platz des Schalters neben Security und Politics. Now ist kein Thema, sondern der Überblick über beide Linsen:

* **Die Hauptmeldungen:** die fünf gewichtigsten Stories beider Linsen, jede mit ⚔ Security oder 🏛 Politics (ein Tipp öffnet diese Linse) und dem Grund, warum sie oben steht, etwa „EU Commission in the original · growing“. Das Gewicht kommt aus Status und Zahl unabhängiger Quellen, einer Originalaussage, Staats- und Regierungschefs, einem schweren Ereignis mit Ort (Angriff, Explosion, Absturz, Tote) oder einer Entscheidung, neuen Meldungen der letzten Stunde und darin genannten Live-Flugzeugen. Es halbiert sich alle drei Stunden ohne neue Meldung, nach einem Tag ist eine Story draußen. Einzelne ungeprüfte Beiträge sind nie Hauptmeldung.
* **⚡ Early, unconfirmed:** Stories der letzten zwei Stunden, die nur frühe oder parteiische Quellen tragen, wenn zwei Kanäle dasselbe innerhalb von 15 Minuten melden oder einer ein schweres Ereignis mit Ort. Gestrichelt, mit Quelle und Perspektive. Bestätigt eine Quelle sie, können sie in die Hauptmeldungen aufsteigen.
* **Since your last visit:** wie viele der Hauptmeldungen neu sind.

Am Handy sind die Reiter in Now: Now, Live und Sources, Filter gelten dort nicht. Die Suche wechselt in die Linsen-Ansichten. Code: `src/data/headlines.ts`.

## Linsen: Security und Politics

Unter der oberen Leiste wählt ein Umschalter die Linse. Stories, Wire und Map bleiben dieselben Ansichten, sie zeigen die Meldungen der Linse.

| Linse | Zeigt | Kacheln |
|---|---|---|
| ⚔ **Security** | Angriffe, Militär, Zwischenfälle, Katastrophen, Luftaktivität, wie bisher | Meldungen der letzten Stunde, davon ungeprüft, Stories in Entwicklung, Luftalarme Ukraine |
| 🏛 **Politics** | Regierungen, Parlamente, Wahlen, Gesetze, Diplomatie, Sanktionen, Zölle | Originalaussagen der letzten 24 h, Beschlüsse und Urteile der letzten 24 h, Stories in Entwicklung, der lauteste Akteur der letzten 6 Stunden |

In der Politik-Linse:

* **Akteure** statt Orte: Trump, Weißes Haus, Merz, Bundesregierung, Bundestag, von der Leyen, EU-Kommission, EU, Putin, Kreml, Selenskyj, NATO, Macron, Starmer, Xi Jinping, Netanjahu, Erdoğan, Chamenei. Sie erscheinen als Chips (◉) an einer Story. Ein Tipp filtert nach dem Akteur, die Schaltfläche am Anfang der Filterleiste (◉ Name ✕) oder **All** hebt den Filter wieder auf.
* **Im Original** (In the original): Spricht ein Akteur selbst (Trump auf Truth Social, das Weiße Haus, der Bundestag, die EU-Kommission, der Kreml, Selenskyj), zeigt die Story die Aussage oben mit Quelle und Uhrzeit. Darunter sieht man, wer sie wann aufgegriffen hat.
* **Signal** (Chip am Anfang der Filterleiste): nur Stories mit Originalaussage oder mindestens zwei unabhängigen Quellen. Ein Tipp schaltet auf **Everything**, also alles.
* **Karte:** Hauptstädte als Kreise für die Stories, die ihre Akteure nennen, Linien zwischen zwei Hauptstädten, deren Akteure eine Story nennt, dicker bei mehr Stories. Ein Tipp auf eine Hauptstadt filtert nach ihren Akteuren.

**Brücken:** Eine Story kann mit einer Story der anderen Linse verbunden sein, die am selben Tag denselben Akteur oder dieselbe Stadt nennt, etwa ein Sanktionspaket und ein Tankerangriff. Die Karte zeigt dann „🏛 Politics via ◎ Sotschi: …“ oder „⚔ Security via ◉ Kremlin: …“, also auch, was beide verbindet. Ein Tipp wechselt die Linse und filtert nach dem Gemeinsamen. Der Akteur oder die Stadt muss an diesem Tag selten sein, höchstens drei Stories nennen sie: Trump oder Washington allein verbinden nichts.

**Who says what** (seit INTEL 0.9.0): Schreiben Bundestagsabgeordnete über eine Story oder werden sie darin genannt, zeigt die Story eine Gruppe pro Fraktion in ihrer Farbe, etwa „SPD Klingbeil Miersch“. Ein gefüllter Name hat selbst auf Bluesky dazu geschrieben, ein umrandeter wird in den Meldungen genannt. Ein Tipp auf die Fraktion filtert nach ihr, ein Tipp auf einen Namen nach der Person. Die Fraktions-Chips am Ende der Filterzeile (CDU/CSU, AfD, SPD, Grüne, Linke) tun dasselbe für die ganze Liste. In der Security-Linse erscheinen Abgeordnete als Chips an der Story.

**Art** einer Meldung, als Abzeichen neben dem Status: 🎙 Interview, 🗳 Abstimmung im Bundestag, 🗣 Rede oder Debatte, 📄 Dokument. Interviews erkennt INTEL an der Quelle (Deutschlandfunk, phoenix persönlich) oder an „Interview“ in der Überschrift.

Die App merkt sich die Linse. Ein Wechsel startet die neue Linse ohne Filter.

## Stories

Die Standardansicht. Meldungen verschiedener Quellen über dasselbe Ereignis bilden eine Karte. Oben stehen vier Kacheln, am Handy eine schmale Zahlenleiste, die seitlich scrollt: Meldungen der letzten Stunde, wie viele davon ungeprüft sind, wie viele Stories sich entwickeln und die Luftalarme der ukrainischen Luftwaffe der letzten Stunde. **Ein Tipp auf eine Kachel filtert die Stories** entsprechend, ein zweiter Tipp hebt den Filter auf. Die Kachel Luftalarme zeigt stattdessen die Drohnen- und Raketenspuren der letzten 6 Stunden, eine Zeile je Spur.

| Auf der Karte | Bedeutung |
|---|---|
| **OBSERVED** hellblau | Nur Messsysteme haben es gesehen: Erdbeben, ADS-B-Aktivität, Squawk 7700 |
| **SIGNAL** grau | Eine frühe oder parteiische Quelle, zum Beispiel ein einzelner Telegram-Kanal |
| **EMERGING** blau gestrichelt | Mehrere frühe oder parteiische Quellen |
| **REPORTED** blau | Eine OSINT- oder Fachquelle hat berichtet |
| **CONFIRMED** weiß | Eine Primärquelle (Behörde, Militär, Gouverneur) oder ein Leitmedium hat berichtet |
| `87 %` | Event Confidence, wie sicher das Ereignis ist, siehe [Stories](stories.md#event-confidence). Ein Tipp erklärt Status und Prozentwert auf der Karte |
| `21:27 to 21:51 · 4 reports` | Wann die Story lief. Mit geöffneten Meldungen zeigt eine Zeitachse jede Meldung als Punkt, Form und Farbe nach Klasse |
| `1 early · 1 perspective · 1 primary` | Wie viele unabhängige Quellen je Klasse, mit DE auf Deutsch (früh, parteiisch, primär) |
| `⏱ Baza 42 min ahead of BBC` | Wie weit die erste schnelle Meldung vor der ersten bestätigenden lag |
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
| Signal \| Everything | Nur Politik-Linse, ein Schalter mit zwei Seiten: Signal zeigt Stories mit Originalaussage oder zwei unabhängigen Quellen, Everything jede Story |
| All | Alles, das Neueste zuerst |
| Live match | Nur Beiträge mit blauer LIVE-Zeile, die Zahl zeigt wie viele |
| Russia, Ukraine, Middle East, DACH, USA | Meldungen von Quellen aus dieser Region |
| Aviation, Military, Disaster, OSINT, News | Meldungen von Quellen zu diesem Thema, siehe [Quellen](quellen.md) |
| `◎ Ort ✕` | Nur Beiträge, die diesen Ort nennen. ✕ entfernt den Filter |

Der gewählte Filter bleibt auf dem Gerät gespeichert.

## Live now

Die Zahl der Militärflugzeuge, die gerade weltweit ihre Position senden, und jedes Flugzeug mit Live-Treffer, zusammen mit der Überschrift, die es nennt.

## Places

Orte, die in den letzten 24 Stunden genannt wurden, sortiert nach Häufigkeit. Am Handy unter der Karte, auf breiten Bildschirmen rechts. Der Balken zeigt den Anteil. Ein Tipp filtert den Feed nach dem Ort, ein zweiter Tipp hebt den Filter auf.

## Sources

Eine Zeile mit der Übersicht (Quellen, antworten, nicht erreichbar, über den Sammler), ein Suchfeld für Name, Region oder Fraktion, dann die Quellen in Gruppen, die ein Tipp öffnet: Security nach Klasse, Politik nach eigenen Stimmen, Abgeordneten je Fraktion, Parlament und Regierung, Medien. Oben listet die Gruppe „Needs attention“ jede Quelle, die ausgefallen ist. Kanäle eines Netzwerks (Rybar) sind eine Zeile, die sich zu ihren Kanälen öffnet.

Jede Quelle hat einen Statuspunkt (blau: hat geantwortet, rot: fehlgeschlagen, hohl: kommt über den Sammler), Region, Trust und das Alter ihres neuesten Beitrags. Fällt eine Quelle aus, zeigt die Zeile ihren Fehler rot an, etwa den HTTP-Status, und die anderen arbeiten weiter.

Am Ende dieses Bereichs steht die Version von INTEL.

## Sprache der Meldungen

**🌐** oben rechts öffnet drei Möglichkeiten für die Sprache der Meldungen: **Original** zeigt jede Meldung, wie sie kam, **English** alles auf Englisch, **Deutsch** alles auf Deutsch. Der Knopf zeigt die Wahl: ORIG, EN oder DE. Die Oberfläche bleibt Englisch. Die Sprache wird pro Meldung erkannt, nicht pro Quelle: Ein russisches Zitat in einem deutschen Kanal wird übersetzt, eine deutsche Überschrift bleibt in DE deutsch.

Seit INTEL 0.10.0 übersetzt der Sammler jede Überschrift und jeden Auszug einmal ins Englische und Deutsche (`collector/translate.ts`) und gibt die Übersetzungen mit seinen Daten an die App. Sie erscheinen sofort, auf jedem Gerät, ohne eigene Anfrage. Nur eine Meldung, die der Sammler noch nicht kennt, etwa ein Beitrag der letzten Minuten, übersetzt das Gerät selbst: direkt bei Google Translate, ersatzweise über den Proxy. Die Übersetzung kommt vom öffentlichen Google-Zugang (Variante A), ohne Schlüssel und ohne Garantie: Lehnt Google ab, bleibt der Originaltext stehen und wird später erneut angefragt. Callsigns, Typen und Orte werden immer im Original erkannt.

## Aktualisierung

Der Feed lädt alle fünf Minuten neu, die Live-Flugzeuge alle zwei Minuten, solange die App geöffnet ist. Beim nächsten Start erscheint der zuletzt geladene Feed sofort, auch ohne Netz.
