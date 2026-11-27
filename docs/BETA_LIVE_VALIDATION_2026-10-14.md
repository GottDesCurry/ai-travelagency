# Live-Abnahme – 14. Oktober 2026

Ziel: geschlossene Test-Beta am 17. Oktober. Diese Prüfung dokumentiert echte HTTP-Antworten; sie ist keine erfolgreiche Anbieterabnahme.

## Nachgewiesener Stand

| Dienst / Aufruf | Tatsächliches Ergebnis | Konsequenz |
|---|---|---|
| Booking COM 18 /flights/search | HTTP 403; `You are not subscribed to this API.` | Die aktuelle RapidAPI-App ist für dieses Produkt nicht abonniert. Keine Flugangebote, Preise, Parameter oder Links verifiziert. |
| Booking COM 18 /stays/auto-complete | HTTP 403; `You are not subscribed to this API.` | Auch die Hotel-Ortssuche ist blockiert. /stays/search wurde deshalb nicht aufgerufen. |
| OpenAI /v1/chat/completions, gpt-4 | HTTP 429; code `credit_balance_exhausted`, type `insufficient_quota`; kein Guthaben vorhanden | Kein erfolgreicher KI-Aufruf. Formular-/Ranking-Fallback bleibt die geprüfte technische Alternative. |
| Neue Vercel-Vorschau am UI-Commit 2ac5325 | READY, dpl_DNS7X8623W3BiQg1VSgCc6oBnLox | Deployment gebaut. Geschützter Inhaltsabruf weiterhin 403 beim Zugriff auf Deployment-Aliase. |

Live-Fluganfrage: ZRH → BER, 10.–14. November 2026, eine erwachsene Person, Economy, CHF.
Hotel-Ortssuche: Berlin. KI-Test: kurze Extraktion derselben Reise für zwei Erwachsene, maximal 100 Ausgabe-Tokens.
Genau ein Aufruf pro oben genanntem externen Test; keine Wiederholungen nach bestätigtem Zugangs-/Guthabenfehler.
Entwicklungsschlüssel wurden sicher über die bestehende Vercel-Verbindung verwendet. Keine Schlüssel in Dateien, Chat, Git oder Reports gespeichert.

Vorschau des geprüften UI-Commits:
https://ai-travelagency-p1fhesy6g-visnus-projects.vercel.app

## Umgesetzte Fehlerbehandlung

- Flug- und Hotelanbieter: 401/403 → 503 (aktuell nicht verfügbar), 429 → 429 (Anfragelimit), Timeout → 504, andere Fehler/ungültige Antwort → 502.
- KI-Eingabe: bestätigte Guthabenerschöpfung → 503; temporäres 429 → 429; andere Fehler → 502.
- Serverseitige Logs enthalten nur fest definierte Fehlerklassen. Upstream-Body, Schlüssel, Anfrageheader und Billingdetails werden nicht ausgegeben.
- Der vorhandene Client setzt bei KI-Eingabefehlern mit den Formularfeldern fort; KI-Rankingfehler entfernen keine realen Suchangebote.
- Tests prüfen insbesondere, dass private Lieferanten- und Billingdetails nicht in Browserantworten gelangen.

## Was der Betreiber erledigen muss

1. RapidAPI: das zur hinterlegten API-App gehörende Konto und das Produkt Booking COM 18 prüfen. Falls dieses Produkt verwendet werden soll, ein passendes Abonnement mit bewusst festgelegtem Kostenlimit aktivieren. Ein allgemeines RapidAPI-Konto oder ein Schlüssel allein reicht nicht.
2. Alternativ: bewusster Anbieterwechsel. LiteAPI-Konto existiert, aber LiteAPI ist weder im aktuellen Code noch mit einem Projekt-Schlüssel angebunden. Ein Wechsel ersetzt keine geprüfte Flug-API.
3. OpenAI: falls KI zur ersten Beta gehört, API-Guthaben/Kostenbudget des zur hinterlegten API-Key gehörenden Projekts herstellen. Kein funktionierender Zugang ist aus einem ChatGPT-Abonnement ableitbar.
4. Vercel-Verbindung: Zugriff auf Projekt ai-travelagency und Team visnus-projects autorisieren. Danach genau die zum freigegebenen Commit gehörende Vorschau testen.
5. Geschäfts-/Kontaktangaben und erlaubte Anzeige/Weiterleitung von Anbieterdaten bestätigen.

Keine Abonnements oder Guthaben wurden gekauft; keine Kostenbudgets oder Schutzregeln geändert.

## Verbindliche Wiederaufnahme nach Zugang

- Echte Antworten für One-way/Roundtrip und eine/mehrere Personen erfassen und deren Schema gegen die Adapter prüfen.
- Preisbasis: alle Personen, Gepäck/Gebühren, alle Nächte/Zimmer und Währung abnehmen.
- Hotel-Stadtauflösung, Aufenthalt, Zimmerbelegung, Bilder und Links prüfen.
- Buchungslinks müssen zum beabsichtigten Angebot und den passenden Reisedaten führen.
- Anbieterverträge, Quoten/Kosten und gegebenenfalls globales Rate-Limit freigeben.
- Testerzugang und Produktionsdeployment am gleichen geprüften Commit bestätigen.

Bis dahin ist die Live-Beta nicht freigegeben. Mock-/Browsertests belegen die Bedienung und Fehlerbehandlung, keine echte Reiseverfügbarkeit.
