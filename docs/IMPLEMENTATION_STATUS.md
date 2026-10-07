# Umsetzung des Masterplans

Stand: 7. Oktober 2026. Verbindliche Aufgabenliste: [MASTERPLAN.md](MASTERPLAN.md).

## Abgeschlossen und lokal geprüft

- T001: Next.js wurde auf 15.5.27 aktualisiert. App-Routen liegen jetzt unter app/, wodurch der zuvor beobachtete Fehler bei generierten Routentypen umgangen wird.
- 34 Regressionstests, TypeScript, Lint, Produktionsbuild und HTTP-Smoke (Startseite plus fünf Infoseiten und zehn API-Fälle) bestehen lokal.
- Flug-Endpunkte teilen denselben Adapter; der Legacy-Endpunkt erstellt keine Buchung.
- Flughafenparameter, Personenanzahl, Daten und KI-Ausgaben werden serverseitig geprüft.
- Hotel-Ortsnamen werden sicher codiert; fehlende Konfiguration, leere Ergebnisse und Anbieterfehler werden getrennt behandelt.
- Suchformular hat sichtbare Feldbeschriftungen und erklärt die Anbieterübergabe.

- U018: Suche abbrechen und passende Zeitlimits für die zweistufige Hotelsuche.
- U014: bis zu zehn Suchen lokal speichern, übernehmen und löschen; keine Kontosynchronisierung.
- U022/S006: Hilfeseite und ehrlicher E-Mail-Kontakt statt eines funktionslosen Formulars.
- Navigation: fehlende Footerziele und AGB-Anker repariert; fiktive Telefonnummern entfernt.
- Metadaten: fehlendes OG-Bild entfernt, absolute Basis gesetzt, doppelte Head-Tags entfernt.

- Produktionsabhängigkeiten: npm audit --omit=dev meldet nach Updates und eng begrenzten Overrides keine bekannten Schwachstellen (7.10.2026). Das ist keine vollständige Sicherheitsfreigabe.

## Implementiert, Abnahme noch offen

- T016: GitHub Actions prüft Tests, TypeScript, Lint und Build. Der erste CI-Lauf bestand; der aktuelle Lauf mit Sicherheits- und Browserprüfungen muss beobachtet werden. Erforderliche Branch-Regeln sind nicht eingerichtet.
- T009/T010/T014: zusätzliche API-Absicherung und Regressionstests vorhanden; aktuelle Lieferantenantworten bleiben zu prüfen.
- E015: acht Browserfälle (Desktop/Mobil) für Speichern, Wiederherstellung, Suchfehler, Abbruch und Kontakt vorbereitet. Lokaler Chromium-Download ist am Netzwerkarchiv gescheitert; CI führt sie aus.
- U019: Formularbeschriftungen verbessert; vollständige Barrierefreiheitsprüfung bleibt offen.

## Externe Voraussetzungen

| Voraussetzung | Benötigter Nachweis | Abhängige Arbeiten |
|---|---|---|
| RapidAPI-Zugriff | Gültiger, serverseitig hinterlegter Schlüssel und aktive Abonnements für die genutzten Produkte | Reale Suche und Vertragsfixtures |
| Daten- und Verkaufsrechte | Schriftlich erlaubte Anzeige, Vergleich und gegebenenfalls Buchung | Öffentliche Nutzung und Checkout |
| OpenAI-Zugriff | Serverseitiger Schlüssel und Kostenbudget | Live-Prüfung der optionalen KI |
| Vercel-Berechtigung | Zugriff der verbundenen Identität auf Projekt und Team visnus-projects | Geschützte Vorschau und Buildlogs |
| Geschäftsmodell | Sitz, Zielmärkte, Vermittler-/Verkäuferrolle | Rechtsprüfung und Zahlungsfreigabe |
| Lieferant für direkte Orders | Zugang zu Buchung, Storno, Refund und Support | Echte Direktbuchung |
| Zahlungsfreigabe | Anbieterzulassung für Firma und Reisegeschäft | Geldannahme |
| Airbnb | Schriftliche Freigabe für den konkret gewünschten Anwendungsfall | Airbnb-Direktintegration |

Keine Schlüssel in GitHub, Dokumente oder Chat kopieren. Schlüssel im Hosting als serverseitige Variablen konfigurieren. Fehlende Zugänge werden nicht durch erfundene Angebote ersetzt.

## Reparatur- und Freigabereihenfolge

1. Neue Vorschau und CI prüfen; mit realen anonymisierten Anbieterantworten Suchvertrag abnehmen.
2. Konsolidierte Reparatur integrieren und Features aus PR 1 einzeln übernehmen.
3. Betatests durchführen und die größten Nutzungsprobleme beheben.
4. Anbieter, Geschäftsrolle und Zahlungsfreigabe sichern.
5. Einen Produkttyp inklusive bestätigter Order, Refund und Support vollständig implementieren.
6. Erst nach durchgängiger Abnahme mehr Produkte und Wachstum freigeben.

Ein grüner Build belegt keine buchbare Reise. Geldannahme ist bis zur durchgängigen Buchungs- und Zahlungsabnahme offen.

Firmen-, Register- und Kontaktangaben stammen aus dem vorhandenen Repository und sind vor öffentlicher Freigabe zu bestätigen. Die Datenschutzerklärung wurde an die tatsächlichen Dienste und lokale Speicherung angepasst; eine fachliche Rechtsprüfung ist noch offen.

Entwicklungstools: Der vollständige Audit meldete zusätzliche Befunde unter anderem in Glob-/Brace-Abhängigkeiten. Sie gehören zur Entwicklungswerkzeugkette; kein erzwungenes Framework-Downgrade oder ungeprüftes Major-Upgrade wurde dafür durchgeführt. Separat weiter prüfen.

Vorbereitet: BETA_FEEDBACK.md, LAUNCH_RUNBOOK.md und BOOKING_DESIGN.md enthalten ausführbare Prüfabläufe sowie den Entwurf für eine später freigegebene Direktbuchung.
