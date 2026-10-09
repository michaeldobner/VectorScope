# Messlatte für Now

[English version](../en/benchmark.md) · [Übersicht](README.md)

Now wählt aus über tausend Meldungen am Tag fünf Hauptmeldungen. Ob es die richtigen sind, ist keine Geschmacksfrage, sondern eine Messung. Seit Sammlung 0.19.0 muss jede Änderung an der Gewichtung ihre Zahl zeigen.

## Die Referenz

Einmal pro Stunde legt der Sammler die ersten zehn Überschriften von drei Redaktionen ab, in der Reihenfolge ihrer Startseite (`collector/reference.ts`, `reference.json` im Datenordner, 14 Tage):

| Redaktion | Woher |
|---|---|
| Tagesschau | Die Startseite ihrer App, `tagesschau.de/api2u/homepage/` |
| ntv | RSS der Startseite |
| Spiegel | RSS der Schlagzeilen |

Nur Überschriften, keine Texte. Geprüft im Test-Labor (`lab/reference.mjs`).

Ein **Topthema** ist ein Thema, das mindestens zwei der drei gleichzeitig in ihren ersten zehn haben. Eine Redaktion allein kann eine Exklusivmeldung oder ein Steckenpferd haben, zwei sind sich über den Nachrichtenwert einig.

## Das Maß

`collector/benchmark.ts` rechnet Now für jeden stündlichen Stand neu, aus genau den Meldungen, die der Sammler bis dahin gesehen hatte, und prüft, welche Topthemen eine der Hauptmeldungen abdeckt:

| Maß | Bedeutung |
|---|---|
| Recall@5 | Anteil der Topthemen unter den fünf Hauptmeldungen von Now |
| Recall@10 | Anteil unter den ersten zehn |

Ein Thema gilt als abgedeckt, wenn eine Hauptmeldung mindestens zwei Wörter oder Namen mit ihm teilt, in ihren Überschriften oder deren deutscher oder englischer Übersetzung durch den Sammler.

Das Test-Labor misst einmal am Tag und nach jeder Änderung an `intel/src/data` oder `collector`. Das Ergebnis ist `benchmark.md` im Branch `lab-results`, mit der Tabelle pro Stunde und für den letzten Stand jedem Topthema mit seinem Platz in Now oder „missing“.

## Grenzen

* Die Referenz misst Nachrichtenwert für ein breites Publikum. VectorScope schaut auf Sicherheit und Politik. Ein Literaturnobelpreis ist Topthema der Redaktionen und fehlt in Now zu Recht. Der Recall wird nicht 100 % erreichen und soll es nicht. Es zählen der Verlauf und die Lücken, die wehtun (ein Angriff, Schüsse, die Räumung von Kiew).
* Der Abgleich geht über Wörter: Eine Story auf Russisch ohne Übersetzung wird nicht erkannt. Eine Lücke kann also auch eine fehlende Übersetzung sein.
* Die Präzision wird noch nicht gemessen: ob die Hauptmeldungen von Now wichtig sind, wenn die Redaktionen sie nicht haben. Telegram ist oft früher, siehe „Vorsprung“ in [Stories](stories.md). Dafür ist eine kleine, von Hand geprüfte Stichprobe pro Tag geplant.

## Bisherige Ergebnisse

| Datum | Änderung | Recall@5 | Recall@10 |
|---|---|---|---|
| 9. Okt. 2026, 13 Stunden | INTEL 0.13.0, erste Messung nach Korrektur des Abgleichs | 32 % | 42 % |
| 9. Okt. 2026, gleiche Daten | INTEL 0.14.0: ein Platz pro Thema, keine Zusammenfassungen, Breite über Räume, ruhigere Nächte | 45 % | 65 % |
| 9. Okt. 2026, 72 Stunden im Labor | Themen nach Bedeutung (collector/embed.ts), Schwelle 0,8, gegenüber nur Wörtern (44 % / 63 %) | 50 % | 69 % |

Die Zahlen eines Tages schwanken zwischen zwei Läufen um einige Punkte. Belastbar werden sie nach mehreren Tagen.
