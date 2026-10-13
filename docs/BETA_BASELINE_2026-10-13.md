# Beta-Basis und Freigabeprüfung – 13. Oktober 2026

Ziel: geschlossene Test-Beta am Samstag, 17. Oktober 2026, zunächst 5–10 Testpersonen.
Diese Prüfung ist eine gezielte Quellcode-/Konfigurationsprüfung, keine vollständige Sicherheitsprüfung oder Live-Abnahme.

## Verbindliche technische Basis

PR #7, Branch `fix/return-flight-display`, geprüfter Funktionsstand:
`03d6c5e425fc662d1bc0d825faaf3618cf18657d`.

PR #1 Vergleichsstand: `89781408558060b00ebbdf17d522304f04344fc5`.
Keinen vollständigen Merge von PR #1 in PR #7 durchführen: unterschiedliche Suchmodelle und Komponentenverträge.
PR #7 führt App-Router-Dateien unter `app/`; übernommene Seiten aus PR #1 müssen entsprechend migriert werden.

Nachweise heute:
- GitHub Actions „Beta checks“, Run 37639600243: completed/success am geprüften Commit.
- Vercel dpl_3SyBRu2jckTFUodp8Yce8SVEveKE: READY; Git-Commit entspricht PR #7.
- Das beweist Build-/Teststatus, keine echten Lieferantenpreise oder Buchbarkeit.
- Keine Funktionsänderung, kein Merge und keine Produktionsfreigabe in dieser Prüfung.

## Abgleich PR #1 / PR #7

| Bereich | Befund | Entscheidung bis Samstag |
|---|---|---|
| Suche, Validierung, unabhängige Fehler, Abbruch/Timeouts | PR #7 besitzt zentrale FlightOffer/HotelOffer-Verträge und gemeinsame Endpunkte | PR #7 behalten |
| Sichere Anbieterlinks, komplette Hin-/Rückflugsegmente | In PR #7 vorhanden | Behalten, live prüfen |
| Gespeicherte Suchen | PR #7: bis zu zehn Suchparameter-Sätze | Beta-Pflichtumfang |
| Alle Flüge | PR #7 normalisiert nur erste 15 Rohangebote; KI/Fallback wählt drei | Pflichtkorrektur: alle validen Angebote der abgefragten Ergebnisse erhalten und anzeigen; KI-Empfehlungen separat. Nicht behaupten, alle Marktangebote abzudecken |
| Hero, Fluganimation, Inspirationskarten | PR #1 enthält sie; PR #7 nicht | Design gezielt portieren, nur wenn Kernablauf geprüft bleibt; Animation optional |
| Budget und Interessen | PR #1 enthält sie für Tagesplanung, keine geprüfte Budget-/Paketpreisberechnung | Nach Kernsuche, keine Budgetgarantie |
| Flug/Hotel merken, Meine Reise, Drucken | PR #1 enthält eigenen SavedTrip-Vertrag, PR #7 nur SavedSearches | Für erste Beta verschieben; spätere Portierung auf aktuelle Offer-Typen, keine zweite parallele Suchlogik |
| KI-Tagesplan | PR #1 besitzt Route und UI; PR #7 nicht | Verschieben; zusätzliche Live-Abnahme und Kostenbegrenzung erforderlich |
| Airbnb | PR #1 enthält nur externen Zielort-Suchlink | Keine Airbnb-Integration für diese Beta |
| Rechts-/Hilfe-/Kontaktseiten | PR #7 enthält Reparaturen | Behalten; Geschäftsangaben und erreichbare Kontaktadresse bestätigen |

## API-Konfiguration – nachgewiesener Stand

Vercel-Projekt: `prj_HWVSQjYHfL9ULaMatVJE2u6c4e0S` (`ai-travelagency`).

Nur Namen und Metadaten geprüft; keine Schlüssel entschlüsselt, ausgegeben oder gespeichert.
- `RAPIDAPI_KEY`: als verschlüsselte Variable vorhanden, Targets development/preview/production.
- `OPENAI_API_KEY`: als verschlüsselte Variable vorhanden, Targets development/preview/production.
- Beide Variablen sind gemeinsam für alle drei Umgebungen hinterlegt, keine getrennten Einträge/Budgets nachgewiesen.
- Kein LiteAPI-Schlüssel in der gelieferten Projektvariablenliste.
- Aktive Suchhandler verwenden Booking COM 18 via RapidAPI, keine LiteAPI-Anbindung.
- Vorhandene Variablen belegen weder gültige Schlüssel noch aktive Abonnements oder erfolgreiche Calls.

Reale Validierung bleibt offen:
1. Aktives RapidAPI-Produkt, Flight-/Hotel-Endpunkte, Parameter und Response-Envelopes abgleichen.
2. Zürich–Berlin, One-way und Roundtrip, ein/zwei Erwachsene mit zukünftigen Daten prüfen.
3. Hotels in Berlin und Lissabon: Ort, Aufenthalt, Zimmer/Personen, CHF und Preisbasis prüfen.
4. Vorhandene Anbieterlinks öffnen und Reiseziel/Daten/Preiszuordnung prüfen.
5. OpenAI: Reisebeschreibung und Ranking testen; manuelles Formular muss bei KI-Ausfall benutzbar bleiben.
6. Bei Eingabe eines Prompts wirft PR #7 dessen API-Fehler aktuell vor Start beider Suchaufgaben; ausdrücklich verständlichen Rückweg zum manuellen Formular prüfen/verbessern.
7. LiteAPI nur nach bestätigtem Zugang und geprüftem Vertrag integrieren; als Alternative evaluieren, nicht ungeprüft die funktionierende Basis ersetzen.

## Vorschauzugang – konkreter Blocker

Vorschau:
https://ai-travelagency-lf3notmh8-visnus-projects.vercel.app

Authentifizierter Vercel-Abruf scheitert mit 403/forbidden beim Lesen der Deployment-Aliase (`read_protection_bypass`).
Metadaten und Projektvariablen sind lesbar, die geschützte Anwendung nicht.
Vercel-CLI ist in dieser Arbeitsumgebung nicht installiert; kein vorhandener CLI-Zugang konnte verwendet werden.
Keine Schutzregeln geändert; kein ungeprüfter Login-/Schlüssel-Workaround.

Erforderlicher nächster Schritt: Vercel-Verbindung für Projekt ai-travelagency und Team visnus-projects prüfen/entsprechenden Zugriff autorisieren.
Anschliessend denselben geschützten Abruf wiederholen und UI/API live abnehmen.
Eine READY-Vorschau ist noch kein für Testpersonen zugänglicher Beta-Link.

## Beta-Pflichtumfang und Freigabe

Pflicht:
- Manuelle Flug-/Hotelsuche (ein Zimmer, 1–9 Erwachsene; Einschränkung klar anzeigen).
- Hin-/Rückreise, echte Anbieterpreise mit verifizierter Preisbasis/Währung.
- Alle validen Angebote aus der abgefragten Ergebnisseite; KI-Empfehlungen separat.
- Teilfehler, leere Ergebnisse, Ladezustand, Abbruch und Timeout verständlich.
- Optionaler Reisewunschtext; manueller Ablauf bleibt ohne KI verfügbar.
- Sichere Anbieterweiterleitung, gespeicherte Suchen, Desktop/Handy.
- Hilfe, Kontakt, verifizierte Geschäftsangaben und passender Datenschutztext.
- Kontrollierter Zugang für 5–10 Testpersonen, API-Quoten/Kostenbegrenzung.
- Grüner CI-Lauf am tatsächlich freigegebenen Commit und Live-Test am dazugehörigen Deployment.

Später:
Konten, gespeicherte Angebots-Reise, KI-Tagesplan, direkte Buchung, Zahlung, Storno/Refund und Airbnb-Angebotsimport.

Offene Freigabepunkte:
- P0: geschützte Vorschau mit aktueller Verbindung nicht zugänglich.
- P0: echte API-Verträge, Preise, Personen-/Aufenthaltsbasis und Links nicht abgenommen.
- P0: Begrenzung auf drei Flüge widerspricht gewünschtem Beta-Umfang.
- P0: endgültiger Beta-Commit noch nicht in main; Integration und Release-Checks offen.
- Vor externen Tests: Anbieter-Nutzungsrechte, Geschäfts-/Kontaktangaben, Quoten/Kosten und Testerzugang bestätigen.
- Deployment-Metadaten beweisen nicht, dass Schlüssel im konkreten Lauf erfolgreich funktionieren.

Terminregel:
Bis Donnerstagabend Live-Abnahme des gewählten Anbieters pro Suchbereich.
Nicht abgenommene Bereiche sichtbar deaktivieren; eingeschränkte Beta entsprechend benennen.
Keine Live-Fähigkeit aus Mocktests ableiten.

## Nächste Arbeitsschritte

1. Vorschauzugang herstellen; danach Live-API-Abnahme.
2. Alle validen Flugangebote erhalten; KI-Auswahl als Empfehlung statt Ergebnisersatz.
3. PR #1 Design gezielt auf PR #7 portieren, soweit bis Freitag prüfbar.
4. CI und echte Desktop-/Handyabläufe am neuen Commit prüfen.
5. Freitag Release-Kandidat fixieren, Samstag geschlossene Test-Beta.
