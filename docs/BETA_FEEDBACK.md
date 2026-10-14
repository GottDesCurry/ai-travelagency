# Betatest: Aufgaben und Auswertung

Ziel: Prüfen, ob die Website eine konkrete Reiseplanung verständlicher macht. Keine Zahlung und keine Buchung durch Book Repeat im aktuellen Testumfang.

## Voraussetzung

Build, HTTP- und Browserchecks bestehen. Die Lieferantenantworten und Datenrechte sind separat geprüft. Testpersonen erhalten einen funktionierenden Vorschauzugang. Keine Ausweise, Kartendaten oder echten Buchungen für einen Bedienungstest anfordern.

## Testaufgaben

Für den ersten Zyklus: 5–10 Personen, jeweils etwa 20 Minuten. Hälfte am Handy, Hälfte am Computer; mindestens eine Person nutzt Tastatur statt Maus. Die ersten zwei Tests gemeinsam beobachten, ohne die Bedienung vorzugeben. Pilotumfang: Erwachsene, Flüge/Hotels, Anbieterweiterleitung, keine direkte Buchung. Das Flugvideo und zusätzliche Reiseplanung sind kein Erfolgskriterium dieses Zyklus.

Vor jedem Test festhalten: Test-ID, geprüfter Commit, genaue Vorschau-URL, Gerät und Browser. Erfolgreiche automatisierte Checks am selben Commit und erfolgreicher Zugang mit dem tatsächlichen Testerkonto sind Voraussetzung. Falls Lieferanten weiterhin blockiert sind, nur einen klar benannten Bedienungstest durchführen; keine Reiseverfügbarkeit oder brauchbare Preise bewerten.

1. Plane eine tatsächlich bevorstehende Reise mit Abflugort, Ziel, Zeitraum und Erwachsenen.
2. Suche zuerst Flüge und Hotels, dann nur eines der Produkte.
3. Vergleiche die Ergebnisse: Welche Kosten und Einschränkungen verstehst du? Welche Angaben fehlen?
4. Öffne ein Angebot und prüfe, ob Reisedaten und Preisumfang beim Anbieter passen. Breche vor einem Kauf ab.
5. Speichere die Suche, lade die Seite neu, übernimm sie und ändere ein Datum.
6. Lösche die gespeicherte Suche und überprüfe die Löschung nach einem Reload.
7. Brich eine laufende Anfrage ab und starte erneut.
8. Suche Hilfe: Wo würdest du ein Problem mit der Website und wo eines mit einer Anbieterbuchung melden?

## Beobachtungsprotokoll

- Test-ID statt unnötiger personenbezogener Angaben.
- Gerät/Browser, Aufgabe, erfolgreich/gescheitert, benötigte Hilfe.
- Dauer und konkrete Stelle der Verwirrung.
- Fehlermeldung, Anbieter, passende anonymisierte Suchparameter.
- Verstandener Preisumfang und erwartete Vertragszuständigkeit.
- Ob die Person das Produkt für diese Reise erneut nutzen würde und warum.
- Bewertung zuerst offen erfragen; keine positive Antwort vorgeben.

## Nachgespräch

- Wie hast du deine letzte Reise gebucht?
- Was war der aufwendigste Teil?
- Was hat Book Repeat erleichtert, was erschwert?
- Welches Ergebnis würdest du wählen und warum?
- Welche Information fehlt für eine Entscheidung?
- Für welche konkrete zusätzliche Leistung würdest du bezahlen?

## Auswertung

Pro Testzyklus die drei größten wiederkehrenden Probleme bearbeiten. Lob, Weiterleitung und bestätigte Buchung getrennt zählen. Zuerst eine Baseline aufbauen; Zielwerte und Werbebudget anhand beobachteter Nutzung festlegen. Der erste Erfolg ist eine abgeschlossene verständliche Reiseaufgabe, kein hoher Besuchszähler.

## Vorlage pro Test

| Aufgabe | Ohne Hilfe geschafft? | Dauer | Konkretes Problem / Fehlermeldung | Priorität |
|---|---|---|---|---|
| Reisedaten und Suchoptionen | | | | |
| Angebote und Preisumfang verstehen | | | | |
| Sortierung / Direktflugfilter | | | | |
| Passende Anbieterweiterleitung | | | | |
| Speichern / Wiederherstellen / Löschen | | | | |
| Abbrechen / neue Suche | | | | |
| Hilfe / Feedback finden | | | | |

Prioritäten: P0 = verhindert Suche oder führt zur falschen Reise; P1 = Aufgabe gelingt nur mit Hilfe; P2 = Komfort oder Gestaltung. Pro Problem Reproduktionsschritte, betroffene Test-IDs und nächsten konkreten Fix festhalten. Keine personenbezogenen Angaben oder Buchungsunterlagen in GitHub hochladen.

## Abschluss pro Zyklus

- Anzahl gestarteter Tests und ohne Hilfe abgeschlossener Reiseaufgaben.
- Häufigste drei Probleme, jeweils mit beobachtetem Beispiel.
- Verstanden die Tester, dass Buchung und Zahlung beim Anbieter erfolgen?
- Welche Anbieter-/Zugangsfehler verhindern eine aussagekräftige Bewertung?
- Entscheidung: Fix und erneut testen, Umfang reduzieren oder nächsten Testzyklus starten. Ein positiver Bedienungstest ersetzt keine Anbieterabnahme.
