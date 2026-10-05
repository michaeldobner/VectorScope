<div align="center">

# ◇ VectorScope Intel

**Geprüfte OSINT- und Verteidigungsnachrichten, abgeglichen mit Flugzeugen, die gerade in der Luft sind.** Modul INTEL der [VectorScope-Sammlung](../README.de.md).

<h3><a href="https://michaeldobner.github.io/VectorScope/intel/">michaeldobner.github.io/VectorScope/intel</a></h3>

[**▶ VectorScope Intel öffnen**](https://michaeldobner.github.io/VectorScope/intel/) · [English](README.md) · [Dokumentation](docs/de/README.md) · [Changelog](CHANGELOG.de.md)

<img src="docs/images/iphone-feed.png" width="230" alt="Feed auf dem iPhone mit einem Beitrag über eine Drohne, die gerade in der Luft ist">&nbsp;&nbsp;
<img src="docs/images/ipad-landscape.png" width="480" alt="iPad quer: links der Feed, rechts Live-Treffer, Orte und Quellen">

</div>

## Warum INTEL

OSINT-Accounts und Fachmedien melden, was in der Luft passiert, oft vor allen anderen. Flugdaten zeigen, wer gerade fliegt. INTEL bringt beides zusammen: Es liest eine kurze Liste geprüfter Quellen, erkennt in jedem Beitrag Callsigns, Flugzeugtypen und Orte und gleicht sie mit den Militärflugzeugen ab, die in diesem Moment senden. Erscheint ein Artikel über eine RQ-4 über dem Schwarzen Meer, während FORTE11 dort kreist, zeigt INTEL das, und ein Tipp öffnet das Flugzeug in AIR.

## Highlights

| | |
|---|---|
| **14 geprüfte Quellen** | ItaMilRadar, The Aviationist, The War Zone, Bellingcat, ISW, Defense News, Naval News, hartpunkt, Augen geradeaus! und weitere. Jede im Test-Labor geprüft auf Existenz, Aktivität und maschinelle Lesbarkeit |
| **Bluesky und RSS in einer Liste** | Ein Beitrag, der auf einen Artikel verlinkt, ist dieselbe Meldung: Sie erscheint einmal, mit beiden Links |
| **Erkennung** | Militärische Callsigns (FORTE11, RCH419, NATO03), rund 45 Flugzeugtypen in mehreren Schreibweisen (KC-135, KC135R, Stratotanker), rund 100 Orte auf Englisch und Deutsch (Ostsee, Black Sea, Rzeszów, Ramstein) |
| **Live-Treffer** | Callsign im Beitrag genannt und gerade in der Luft, oder Typ genannt und ein Flugzeug dieses Typs nahe dem genannten Ort. Hervorgehoben in Ice Blue, ein Tipp öffnet es in AIR |
| **Orte** | Welche Orte in den letzten 24 Stunden genannt wurden, ein Tipp filtert den Feed |
| **Zustand der Quellen** | Jede Quelle mit Status und Alter ihres neuesten Beitrags |
| **Ruhig und privat** | Keine Bilder, kein Tracking, kein Konto. Der Lesestand bleibt auf dem Gerät |

## Bedienung

1. INTEL öffnen. Der Feed lädt alle Quellen, die neuesten zuerst. Neue Beiträge seit dem letzten Besuch tragen einen blauen Punkt.
2. Nach **Live match**, **Aviation**, **OSINT**, **Naval**, **Defence**, **DACH** oder **Official** filtern.
3. Eine blaue **LIVE**-Zeile bedeutet: Dieses Flugzeug ist gerade in der Luft, und der Beitrag nennt es oder seinen Typ nahe seiner Position. Antippen öffnet das Flugzeug in AIR.
4. Einen Ort antippen zeigt nur Beiträge, die ihn nennen.

Ausführliche Anleitung: [Bedienung](docs/de/bedienung.md).

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [Bedienung](docs/de/bedienung.md) | Ansichten, Filter, Live-Treffer, Orte, Quellen |
| [Quellen](docs/de/quellen.md) | Die geprüften Quellen, wie sie geprüft wurden, verworfene Quellen und warum |
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

Aktuelle Version: **0.1.1**. Siehe [Changelog](CHANGELOG.de.md).

Erstellt von Michael Dobner. Lizenziert unter der [MIT-Lizenz](../LICENSE).
