# Entwurf für den späteren direkten Buchungsfluss

Status: Architekturvorbereitung. Keine Buchungs- oder Zahlungsfunktion aktiviert. Provider, Datenbank und Zahlungsmodell werden nach schriftlicher Zugangsfreigabe gewählt.

## Verantwortlichkeiten vor Implementierung

Für einen Produkttyp zuerst klären: Verkäufer/Vermittler, Kundengeldempfänger, Lieferantenfinanzierung, Ticketing/Reservierung, Erstattung und Betreuung nach dem Kauf. Ein Flug-Suchendpunkt oder Stripe-Schlüssel ist keine Buchungsfreigabe.

## Minimaler Datensatz

- Interne Order-ID, Nutzer-/Gastzugriff, Status und Änderungszeit.
- Angebots-ID beim Anbieter, geprüfter Preis mit Währung, Ablauf und Tarifbedingungen.
- Erforderliche Reisendendaten, getrennt von Logs und KI-Verarbeitung.
- Zahlungsreferenz, Autorisierungs-/Abbuchtstatus und Refundreferenzen.
- Lieferanten-Orderreferenz und gegebenenfalls Ticket-/Voucherreferenz.
- Idempotenzschlüssel pro Vorgang, Ereignis-ID und nachvollziehbarer Statusverlauf.

Keine Rohkartendaten speichern. Zugriff auf eine Order braucht eine überprüfte Berechtigung; erratbare IDs genügen nicht.

## Übergänge

Entwurf → Angebot geprüft → Kundenzustimmung → Zahlungsautorisierung → Lieferantenanfrage → bestätigte Order → passend zum Lieferantenmodell Abbuchung → bestätigte Reiseunterlagen.

Die Reihenfolge ist anbieterabhängig: Autorisierung/Hold/Capture dürfen erst anhand tatsächlich unterstützter Funktionen festgelegt werden. Ein ungeklärter Status nach Timeout muss über die Lieferantenreferenz abgefragt werden, bevor erneut gebucht oder belastet wird.

## Fehlfälle und Abnahme

- Angebot abgelaufen oder Preis geändert: neuen Endpreis bestätigen lassen.
- Zahlung abgelehnt/abgebrochen: keine unbestätigte Reise versprechen.
- Zahlung erfolgreich, Lieferant fehlgeschlagen: definierte Klärung oder vollständige Erstattung.
- Lieferant bestätigt, Zahlung ungeklärt: Abgleich und festgelegter Support-/Stornoprozess.
- Doppelklick, Reload, wiederholter Webhook: derselbe Vorgang darf keine zweite Order erzeugen.
- Verspäteter oder ungeordneter Webhook: Ereignis dauerhaft deduplizieren und tatsächlichen Status abgleichen.
- Storno/Teilrefund: konkrete Gebühren prüfen, Vorgang versionieren und Zahlungs-/Lieferantenabgleich dokumentieren.
- Bestätigungsmail fehlgeschlagen: bestätigte Order erhalten und Dokumente sicher erneut zustellen können.

Für Flug plus Hotel braucht es eine eigene Strategie für Teilbuchung und Rückabwicklung. Der erste direkte Checkout sollte daher einen Produkttyp vollständig beherrschen.

## Freigabe

Sandboxfälle, kontrollierte reale Order und Rückabwicklung, Rechnung, Kundenbestätigung, Support, Liquidität und Notabschaltung dokumentieren. Erst dann Geldannahme freigeben. Offene Verträge und fachliche Prüfungen stehen in IMPLEMENTATION_STATUS.md.
