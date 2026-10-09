<div align="center">

# ◇ VectorScope Intel

**Geprüfte OSINT- und Verteidigungsnachrichten, abgeglichen mit Flugzeugen, die gerade in der Luft sind.** Modul INTEL der [VectorScope-Sammlung](../README.de.md).

<h3><a href="https://michaeldobner.github.io/VectorScope/intel/">michaeldobner.github.io/VectorScope/intel</a></h3>

[**▶ VectorScope Intel öffnen**](https://michaeldobner.github.io/VectorScope/intel/) · [English](README.md) · [Dokumentation](docs/de/README.md) · [Changelog](CHANGELOG.de.md)

<img src="docs/images/iphone-feed.png" width="230" alt="Stories auf dem iPhone: eine Story aus drei Quellen mit Status, Zeitachse, Vorsprung und Live-Treffer">&nbsp;&nbsp;
<img src="docs/images/ipad-landscape.png" width="480" alt="iPad quer: links die Stories, rechts Live-Treffer, Orte und Quellen">

</div>

## Warum INTEL

Schnelle Telegram-Eilmelder melden zuerst, Fachmedien ordnen ein, Leitmedien bestätigen. Flugdaten zeigen, wer gerade fliegt. INTEL bringt alles zusammen: Es bündelt Meldungen verschiedener Quellen über dasselbe Ereignis zu **Stories**, zeigt, wie weit jede Story bestätigt ist und wie weit die schnellen Kanäle vorn lagen. Außerdem Es liest eine kurze Liste geprüfter Quellen, erkennt in jedem Beitrag Callsigns, Flugzeugtypen und Orte und gleicht sie mit den Militärflugzeugen ab, die in diesem Moment senden. Erscheint ein Artikel über eine RQ-4 über dem Schwarzen Meer, während FORTE11 dort kreist, zeigt INTEL das, und ein Tipp öffnet das Flugzeug in AIR.

## Highlights

| | |
|---|---|
| **Stories** | Meldungen verschiedener Quellen über dasselbe Ereignis werden eine Karte mit Status Signal, Emerging, Reported oder Confirmed, einer Zeitachse aller Meldungen und dem Vorsprung der ersten ungeprüften Meldung |
| **194 geprüfte Quellen in sieben Klassen** | Messung (USGS, EMSC, GDACS), primär (Rosaviatsiya, MChS, Gouverneure, ukrainische Luftwaffe, IDF, NWS, FAA), früh (Baza, Mash, SHOT, 112, ASTRA, OSINTdefender), OSINT, Fachmedium, parteiisch (Rybar, WarGonzo, Middle East Spectator) und bestätigend (Tagesschau, BBC, Meduza). Jede im Test-Labor geprüft, jede mit Region, Sprache, Trust und Perspektive |
| **Politik-Linse** | Ein Umschalter zwischen Security und Politics. Politics zeigt Regierungen, Parlamente, Gesetze und Diplomatie, mit Akteuren (Trump, Bundestag, Kreml …) statt Orten, der Originalaussage oben in der Story, Kacheln für Originalaussagen und Beschlüsse, einer Karte der Hauptstädte mit Linien dazwischen und Brücken zu Stories der Sicherheits-Linse |
| **Event Confidence** | Jede Story erhält einen Prozentwert aus Klassen und Trust ihrer unabhängigen Quellen, getrennt vom Trust einer einzelnen Quelle |
| **Probe-Sammler** | Bis Ende Januar 2027 hält ein Sammler auf GitHub Actions alle 10 Minuten jede Meldung fest, damit nichts verloren geht, während die App geschlossen ist, und baut ein Rohdaten-Archiv für Auswertungen auf |
| **VectorScope Sensor** | INTEL wird selbst zur Quelle: Tanker, AWACS, Aufklärer und Bomber, die gemeinsam fliegen, und jeder Squawk 7700 werden Meldungen, die sich mit den Stories verbinden |
| **Echo-Detektor** | Ein Kanal, der einen anderen wörtlich abschreibt, zählt nicht als Quelle |
| **Lagekarte** | Stories als Kreise an ihren Orten, Militärflugzeuge, Notfälle, Linien von genannten Flugzeugen zu ihrer Story |
| **Deutsch** | DE übersetzt jede Überschrift und jeden Auszug ins Deutsche |
| **Wire** | Jede Meldung einzeln, die neueste zuerst, mit ihrer Stufe |
| **Erkennung** | Militärische Callsigns (FORTE11, RCH419, NATO03), rund 45 Flugzeugtypen in mehreren Schreibweisen (KC-135, KC135R, Stratotanker), rund 100 Orte auf Englisch und Deutsch (Ostsee, Black Sea, Rzeszów, Ramstein) |
| **Live-Treffer** | Callsign im Beitrag genannt und gerade in der Luft, oder Typ genannt und ein Flugzeug dieses Typs nahe dem genannten Ort. Hervorgehoben in Ice Blue, ein Tipp öffnet es in AIR |
| **Orte** | Welche Orte in den letzten 24 Stunden genannt wurden, ein Tipp filtert den Feed |
| **Zustand der Quellen** | Jede Quelle mit Status und Alter ihres neuesten Beitrags |
| **Ruhig und privat** | Keine Bilder, kein Tracking, kein Konto. Der Lesestand bleibt auf dem Gerät |

## Bedienung

1. INTEL öffnen. **Stories** zeigt oben Stories mit mehreren Quellen, darunter alles andere. Neue Meldungen seit dem letzten Besuch tragen einen blauen Punkt.
2. **Show reports in order** antippen zeigt, wie eine Story entstanden ist. **Wire** zeigt jede Meldung einzeln.
3. Nach **Live match**, **Breaking**, **Aviation**, **OSINT**, **Naval**, **Defence**, **DACH**, **News** oder **Official** filtern.
4. Eine blaue **LIVE**-Zeile bedeutet: Dieses Flugzeug ist gerade in der Luft, und der Beitrag nennt es oder seinen Typ nahe seiner Position. Antippen öffnet das Flugzeug in AIR.
5. Einen Ort antippen zeigt nur Meldungen, die ihn nennen.

Ausführliche Anleitung: [Bedienung](docs/de/bedienung.md).

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [Bedienung](docs/de/bedienung.md) | Ansichten, Filter, Live-Treffer, Orte, Quellen |
| [Stories](docs/de/stories.md) | Stufen, Status, Bündelung, Echo-Detektor, Vorsprung |
| [Sensor und Karte](docs/de/sensor.md) | Eigene Beobachtungen in den Live-Flugdaten, Lagekarte |
| [Quellen](docs/de/quellen.md) | Die geprüften Quellen, wie sie geprüft wurden, verworfene Quellen und warum |
| [Probe-Sammler](docs/de/sammler.md) | Sammeln auf GitHub Actions bis Ende Januar 2027 |
| [Abgleich](docs/de/abgleich.md) | Erkennung von Callsigns, Typen und Orten, Regeln des Live-Treffers |
| [Architektur](docs/de/architektur.md) | Module, Datenfluss, Proxy-Route, Speicher |
| [Datenschutz und Recht](docs/de/datenschutz-und-recht.md) | Was von wo geladen wird, Auszüge und Links, Lizenzen |

## Schnellstart für Entwickler

```bash
npm install            # im Hauptordner des Repositorys
npm run dev:intel      # dieses Modul unter http://localhost:5173/
npm test               # Unit-Tests aller Module und Prüfungen des Repositorys
```

`?demo` zeigt synthetische Beiträge und Flugzeuge, als Demo gekennzeichnet.

## Version

Aktuelle Version: **0.10.0**. Siehe [Changelog](CHANGELOG.de.md).

Erstellt von Michael Dobner. Lizenziert unter der [MIT-Lizenz](../LICENSE).
