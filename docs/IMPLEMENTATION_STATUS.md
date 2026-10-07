# Umsetzung des Masterplans

Stand: 7. Oktober 2026. Verbindliche Aufgabenliste: [MASTERPLAN.md](MASTERPLAN.md).

## Abgeschlossen und lokal geprüft

- T001: Next.js 15.3.9 behebt die bisherige Vercel-Sicherheitsblockade; vorherige Vorschau ist READY.
- 29 Regressionstests, TypeScript, Lint, Produktionsbuild und HTTP-Smoke (Startseite plus zehn API-Fälle) bestehen lokal.
- Flug-Endpunkte teilen denselben Adapter; der Legacy-Endpunkt erstellt keine Buchung.
- Flughafenparameter, Personenanzahl, Daten und KI-Ausgaben werden serverseitig geprüft.
- Hotel-Ortsnamen werden sicher codiert; fehlende Konfiguration, leere Ergebnisse und Anbieterfehler werden getrennt behandelt.
- Suchformular hat sichtbare Feldbeschriftungen und erklärt die Anbieterübergabe.

## Implementiert, Abnahme noch offen

- T016: GitHub Actions prüft Tests, TypeScript, Lint und Build. Die Ausführung im Repository und erforderliche Branch-Regeln müssen noch geprüft werden.
- T009/T010/T014: zusätzliche API-Absicherung und Regressionstests vorhanden; aktuelle Lieferantenantworten bleiben zu prüfen.
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
