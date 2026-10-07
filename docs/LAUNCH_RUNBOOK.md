# Freigabe und Betrieb der Beta

## Vor jeder Freigabe

- Exakten Commit und Vercel-Deployment-ID dokumentieren.
- CI einschließlich Sicherheitsprüfung, Build, HTTP-Smoke und Browserchecks grün.
- Anbieterabnahme für den verwendeten Live-Vertrag dokumentiert.
- Datenrechte, Firma, Register- und Kontaktdaten fachlich geprüft.
- Vorschau und Produktion verwenden getrennte serverseitige Schlüssel und Budgets.
- Kontaktadresse getestet; keine Nachricht wird durch dieses Runbook automatisch versendet.
- Kein ungetestetes Feature oder Checkout aktiviert.

## Lokale reproduzierbare Prüfung

    npm ci
    npm audit --omit=dev --audit-level=high
    npm test
    npx tsc --noEmit
    npm run lint
    npm run build
    npm run smoke
    npx playwright install chromium
    npm run e2e

HTTP- und Browserchecks entfernen Lieferantenschlüssel; sie prüfen keine echte Verfügbarkeit. Im eingeschränkten Ausführungsnetz kann der Browserdownload fehlschlagen. Der CI-Lauf liefert dann den Browsernachweis.

## Störung

1. Betroffenen Zeitraum, Commit, Route und Fehlercode feststellen; keine vertraulichen Payloads in öffentliche Logs kopieren.
2. Bei einer Regression zur letzten geprüften Version zurückkehren; Vercel-Rollback nur auf das korrekte Projekt und den geprüften Commit richten.
3. Bei einem Anbieterproblem den Suchbereich mit verständlichem Fehler behandeln und andere Suchbereiche weiter betreiben.
4. Bei Schlüsselmissbrauch betroffene Schlüssel beim Anbieter rotieren und serverseitig ersetzen.
5. Ursache reproduzieren, Reparatur mit einem aussagekräftigen Regressionstest absichern und erneut abnehmen.

## Noch vor öffentlichem Wachstum erforderlich

Global wirksame Rate Limits und Kostenlimits, Alarmierung mit tatsächlich erreichbarer Person, Anbieter-Support, bestätigte Geschäftsdaten sowie fachliche Datenschutz-/Vertragsprüfung. Diese Voraussetzungen werden nicht durch grüne lokale Tests ersetzt.
