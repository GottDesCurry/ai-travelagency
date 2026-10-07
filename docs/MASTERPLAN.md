# AI Travel Agency: Aufgaben bis zum Endprodukt

Stand: 7. Oktober 2026. Arbeitsplan für GottDesCurry/ai-travelagency.

Ein Hit lässt sich nicht garantieren. Wir können aber konsequent prüfen, ob Menschen damit bessere Reisen finden, der Seite vertrauen, buchen und wiederkommen. Dieser Plan umfasst Produkt, Technik, Lieferanten, Zahlung, Betreuung und Wachstum. Checkboxen sind offene Aufgaben, keine Behauptung, dass etwas bereits erledigt ist. Neue Erkenntnisse und Anbieterfreigaben verändern den Umfang.

## Zielbild und Reihenfolge

Eine Reise aus wenigen Angaben planen, nachvollziehbare echte Angebote vergleichen, die passenden Leistungen zuverlässig buchen und bei Problemen Hilfe bekommen. Die KI erklärt und personalisiert; Preise, Verfügbarkeit, Zahlungsstatus und Buchungsbestätigung kommen aus überprüfbaren Systemen.

| Phase | Ergebnis | Voraussetzung zum Weitergehen |
|---|---|---|
| 0 | Technisch funktionierende Vorschau | Build und kritische Tests grün, echte API-Antworten geprüft |
| 1 | Kleine betreute Testgruppe mit Weiterleitung | Suche verständlich, Links passend, Preise ehrlich dargestellt |
| 2 | Öffentlich nutzbares Planungsprodukt | Nutzen und Nachfrage beobachtet, Betrieb und Datenschutz stehen |
| 3 | Direkte Buchung eines freigegebenen Produkttyps | Lieferantenvertrag, Zahlungsfreigabe, Storno und Support getestet |
| 4 | Mehrere Produkte und vollständige Reiseverwaltung | Fehlfälle und Teilbuchungen beherrscht, Wirtschaftlichkeit belegt |
| 5 | Wachstum | Stabile Qualität, messbare Wiederkehr, tragfähige Akquisekosten |

Prioritäten: P0 blockiert die nächste Freigabe; P1 gehört zum ersten öffentlichen Produkt; P2 verbessert oder erweitert es nach validierter Nachfrage. Jede Aufgabe bekommt Verantwortliche, Abhängigkeiten, Aufwand, Termin, Nachweis und Status. Bei einer Einzelperson werden zuerst P0-Aufgaben beendet. Reiseleistungen und Gebühren werden nicht als bereits gebucht dargestellt, solange der Lieferant sie nicht bestätigt hat.

## 0. Aktuellen Stand fertigstellen — P0

- [ ] T001 Next.js-Sicherheitsupdate abschließen und Vercel-Vorschau erfolgreich bauen.
- [ ] T002 Konsolidierten PR 7 gegen main prüfen, danach integrieren; alte überlappende PRs nachvollziehbar abschließen.
- [ ] T003 Zusätzliche Funktionen aus Draft PR 1 einzeln prüfen: Reiseplan, gespeicherte Reisen, Animationen, Kontakt und Datenschutz.
- [ ] T004 Vorschau und Produktion getrennt konfigurieren; serverseitige API-Schlüssel korrekt hinterlegen.
- [ ] T005 Produktionsdomain, TLS, Redirects und Fehlerseiten prüfen.
- [ ] T006 Alle externen Fetch-Pfade inventarisieren: Zweck, Anbieter, Vertrag, Kosten, Daten, Timeout und Fehlerverhalten.
- [ ] T007 src/app/page.tsx mit echten Flug- und Hotelantworten testen.
- [ ] T008 pages/api/flights-aggregated.ts gegen aktuelle Anbieterantworten testen.
- [ ] T009 src/app/api/flights-booking/route.ts prüfen: Suche/Weiterleitung gegenüber tatsächlicher Buchung klar benennen.
- [ ] T010 src/app/api/hotels-location/route.ts auf Ortsauflösung, Sprache, mehrere Treffer und ungültige Eingaben prüfen.
- [ ] T011 src/lib/flight-offers.ts und BookingLink mit realen, anonymisierten Anbieterfixtures absichern.
- [ ] T012 Hin-/Rückflug, Umstiege, Zeitzonen, Gesamtpreis, mehrere Reisende und Gepäck manuell abnehmen.
- [ ] T013 Leere Ergebnisse, Anbieterfehler, Quotenüberschreitung und langsame Antworten verständlich anzeigen.
- [ ] T014 Verhindern, dass die KI Angebote, Preise, Buchungslinks oder Verfügbarkeit erfindet.
- [ ] T015 Mobile End-to-End-Suche und Weiterleitung auf iOS und Android prüfen.
- [ ] T016 CI für Tests, TypeScript, Lint und Build verbindlich machen.
- [ ] T017 BETA_TESTING.md mit aktueller Vorschau, Testergebnissen und verbleibenden Grenzen aktualisieren.

Abnahme: Ein neuer Nutzer kann eine gültige Suche bis zum passenden Anbieterlink durchführen; Fehler lassen sich reproduzieren und zuordnen. Keine echten Zahlungen in dieser Phase.

## 1. Zielgruppe und überzeugender Nutzen — P0/P1

- [ ] P001 Eine Startzielgruppe auswählen, etwa deutschsprachige Paare mit knappem Zeitbudget; Hypothese schriftlich festhalten.
- [ ] P002 15–20 Gespräche über tatsächlich geplante oder kürzlich gebuchte Reisen führen.
- [ ] P003 Probleme beobachten: Budget, Flugzeiten, Lage, Vertrauen, Vergleichsaufwand und Gruppenabstimmung.
- [ ] P004 Bestehende Alternativen mit denselben Reiseaufgaben vergleichen.
- [ ] P005 Eine konkrete Hauptleistung formulieren und im Test messen.
- [ ] P006 Drei mögliche Differenzierungen testen: Gesamtbudget, verständliche Alternativen, gemeinsam planbare Reise.
- [ ] P007 Festlegen, welche Länder, Sprachen, Währungen und Abflughäfen zuerst unterstützt werden.
- [ ] P008 Angebotsumfang sichtbar machen; keine weltweite Vollständigkeit oder garantierten Tiefstpreise behaupten.
- [ ] P009 Kostenlose Planung, Affiliate-Einnahmen, Beratungsgebühr und spätere Buchungsgebühr wirtschaftlich vergleichen.
- [ ] P010 Zahlungsbereitschaft mit konkreten Leistungen testen.
- [ ] P011 Markenname, Domain und Rechte vor breiter Vermarktung prüfen lassen.
- [ ] P012 Erfolgsdefinition und Abbruchkriterien für jede Phase festlegen.

Abnahme: Nutzer erklären den Nutzen selbst und wählen das Produkt für eine reale Reiseaufgabe. Lob ohne Nutzung reicht nicht.

## 2. Planung, Suche und Bedienung — P1

- [ ] U001 Eingaben für Reiseziel oder Inspiration, Abflugort, Zeitraum, Flexibilität und Reisende anbieten.
- [ ] U002 Budget als Gesamtbudget mit eindeutiger Währung erfassen.
- [ ] U003 Kinderalter, Zimmerverteilung, Barrierefreiheit und relevante Bedürfnisse strukturiert erfassen.
- [ ] U004 Präferenzen zu Gepäck, Umstiegen, Flugzeiten, Lage und Unterkunftsart erfassen.
- [ ] U005 Fehlende Angaben gezielt abfragen; Angaben während der Planung bearbeiten können.
- [ ] U006 Ergebnisliste mit Preisbestandteilen, Quelle, Aktualisierungszeit und Verfügbarkeitsgrenzen gestalten.
- [ ] U007 Unterkunftspreis für den gesamten Aufenthalt und die richtige Belegung anzeigen.
- [ ] U008 Steuern, Reinigung, Resortgebühren und vor Ort fällige Kosten getrennt ausweisen, soweit verfügbar.
- [ ] U009 Vergleich nach Gesamtpreis, Dauer, Lage und Stornierbarkeit ermöglichen.
- [ ] U010 Karte und Lageinformationen mit lizenzierten Daten integrieren.
- [ ] U011 Nachvollziehbare Erklärung geben, warum ein Angebot zu den Angaben passt.
- [ ] U012 Reiseplan mit realistischen Wegen, Öffnungszeiten und Reservierungsbedarf erstellen.
- [ ] U013 Unsichere oder nicht aktuelle KI-Aussagen kennzeichnen und relevante Quellen verlinken.
- [ ] U014 Favoriten, gespeicherte Reisen und Versionsverlauf entwickeln.
- [ ] U015 Teilen und gemeinsames Abstimmen ohne Offenlegung privater Reisedaten ermöglichen.
- [ ] U016 Gastnutzung anbieten; Konto erst verlangen, wenn es einen klaren Nutzen hat.
- [ ] U017 Buchungs- oder Anbieterübergang mit korrekten Daten und eindeutiger Zuständigkeit gestalten.
- [ ] U018 Ladezustände, Abbrechen und erneutes Suchen robust machen.
- [ ] U019 Tastatur, Screenreader, Kontrast und Formulare auf Barrierefreiheit prüfen.
- [ ] U020 Mobile Layouts, kleine Displays und langsame Verbindungen testen.
- [ ] U021 Alle Texte, Datumssysteme, Zeitzonen und Währungen konsistent lokalisieren.
- [ ] U022 Kontakt, Feedback und Problem melden jederzeit erreichbar machen.
- [ ] U023 Bewertungen nur aus erlaubten Quellen nutzen; eigene Bewertungen auf Echtheit prüfen.
- [ ] U024 Preisalarme erst nach Einwilligung und Klärung der Datenrechte anbieten.

## 3. Lieferanten und Integrationen — P0 vor jeder Buchungsfunktion

Ein API-Schlüssel allein belegt weder Verkaufsrechte noch Buchungsfähigkeit. Zuerst schriftlich klären, welche Inhalte angezeigt, verglichen, gespeichert und gebucht werden dürfen. Bestehende RapidAPI-Endpunkte bleiben bis zur Vertrags- und Qualitätsprüfung eine technische Abhängigkeit.

| Produkt | Erst nutzbarer Weg | Ausbau | Freigabe |
|---|---|---|---|
| Flüge | Erlaubte Suche mit Anbieterweiterleitung | Bestätigte Flugorders über geeigneten Partner | Verträge, Ticketing, Zahlungsmodell, Betreuung |
| Hotels | Freigegebene Affiliate-Suche und Weiterleitung | Direkte Unterkunftsbuchung, sofern freigeschaltet | Inventar, Orderzugriff, Gebühren, Storno |
| Airbnb | Zulässige externe Übergabe nach Prüfung | Nur ausdrücklich zugelassene Partnerintegration | Schriftlicher Zugriff und passender Nutzungszweck |
| Ferienwohnungen | Alternativen mit zugelassenen Inventaranbietern | Direkte Buchung | Datenrechte und Reservierungsvertrag |
| Aktivitäten/Transfers | Partnerweiterleitung | Direktbuchung bei Nachfrage | Verfügbarkeiten, Voucher und Refunds |

- [ ] I001 Anbieter anhand von Abdeckung, Qualität, Rechten, Kosten und Support vergleichen.
- [ ] I002 Herkunft und Nutzungsrechte jedes vorhandenen RapidAPI-Produkts überprüfen.
- [ ] I003 Ausfallrisiko und Ersatzstrategie für jeden Hauptanbieter festlegen.
- [ ] I004 Flugpartner für Suche, Repricing, Orders, Ticketing, Änderungen und Erstattungen auswählen.
- [ ] I005 Duffel und andere passende Anbieter konkret auf zugängliches Leistungsangebot prüfen; Auswahl offenlassen.
- [ ] I006 Für jeden Flugpartner klären, wer Tickets ausstellt und Kunden betreut.
- [ ] I007 Hotelpartner auswählen und Partnerzugang beantragen.
- [ ] I008 Booking.com-Zugang und konkret erlaubte Integrationsstufe schriftlich bestätigen lassen.
- [ ] I009 Airbnb-Verwendungszweck mit dem Anbieter klären; keine allgemeine Gästebuchungs-API voraussetzen.
- [ ] I010 Ohne Airbnb-Freigabe eine zulässige externe Übergabe prüfen und deren Grenzen klar beschreiben.
- [ ] I011 Ferienwohnungsalternativen mit verfügbarer Partnerintegration bewerten.
- [ ] I012 Bild-, Marken-, Bewertungs- und Kartendatenrechte dokumentieren.
- [ ] I013 Affiliate-Zuordnung und tatsächliche Vergütungsbedingungen prüfen.
- [ ] I014 Sandbox und Produktionszugang getrennt einrichten.
- [ ] I015 Einheitliche Adapter für Anbieter, Preise, Fehler und Buchungsstatus entwickeln.
- [ ] I016 Vertragstests anhand echter anonymisierter Responses pflegen.
- [ ] I017 API-Versionen, Quoten, Kosten und Änderungshinweise überwachen.
- [ ] I018 Inhalte nur innerhalb erlaubter Cache- und Aufbewahrungsregeln speichern.
- [ ] I019 Angebotsduplikate und gleiche Unterkünfte anbieterübergreifend zuverlässig erkennen.
- [ ] I020 Buchbare Angebote unmittelbar vor dem Abschluss erneut prüfen.

Anbieterquellen, geprüft am 7.10.2026: Booking.com verlangt für die Demand API unter anderem Managed-Affiliate-Status und Partnerzugang nach Vertrag. Airbnb legt Zugriffsbereiche je Programm fest; daraus ergibt sich keine Zusage für unser gewünschtes Gästebuchungsprodukt. Duffel beschreibt Flugorders und dazugehörige Zahlungen; konkrete Verfügbarkeit und Konditionen müssen für unsere Firma bestätigt werden.

- https://developers.booking.com/demand/docs/getting-started/prerequisites
- https://www.airbnb.com/help/article/3418
- https://www.airbnb.com/software-partners
- https://duffel.com/docs/api/v2/orders

## 4. Echte Buchung und Zahlung — P0 vor Geldannahme

Zahlungsannahme, Lieferantenbezahlung und Reisebestätigung sind separate Vorgänge. Eine erfolgreiche Kartenzahlung bestätigt keine Reise. Ein gemeinsamer Flug-und-Hotel-Warenkorb braucht eine ausdrücklich getestete Strategie für Teilfehler.

- [ ] B001 Festlegen, ob wir weiterleiten, vermitteln oder selbst verkaufen; Verantwortlichkeiten vertraglich prüfen.
- [ ] B002 Einen Produkttyp für den ersten direkten Checkout wählen.
- [ ] B003 Zahlungsanbieter auf Firma, Land, Reisegeschäft und Risikomodell prüfen und freigeben lassen.
- [ ] B004 Stripe oder passende Alternative anhand der tatsächlich erlaubten Leistungen auswählen.
- [ ] B005 Zahlungsarten je Zielmarkt bestimmen: Karte, Wallets und gegebenenfalls lokale Methoden.
- [ ] B006 Gastcheckout mit minimal erforderlichen Daten ermöglichen.
- [ ] B007 Reisendennamen und erforderliche Dokumentdaten validieren; sicher korrigieren können.
- [ ] B008 Endpreis, Währung, Steuern, Zusatzleistungen und Servicegebühr vor Zustimmung zeigen.
- [ ] B009 Gepäck, Sitzplätze, Zimmer, Mahlzeiten und Tarifbedingungen eindeutig darstellen.
- [ ] B010 Storno- und Änderungsbedingungen des konkreten Angebots versioniert speichern.
- [ ] B011 Angebot erneut bepreisen und Preisänderung ausdrücklich bestätigen lassen.
- [ ] B012 Buchungszustände modellieren: begonnen, geprüft, autorisiert, angefragt, bestätigt, fehlgeschlagen, ungeklärt, erstattet.
- [ ] B013 Autorisierung und Abbuchung auf die Lieferantenfähigkeit abstimmen.
- [ ] B014 Zahlungsdetails über gehostete oder tokenisierte Felder verarbeiten; keine Rohkartendaten speichern.
- [ ] B015 Zusätzliche Zahlungsbestätigung und abgebrochene Zahlungen sauber behandeln.
- [ ] B016 Doppelklicks, Reloads und Wiederholungen mit stabilen Idempotenzschlüsseln absichern.
- [ ] B017 Webhook-Signaturen prüfen und Ereignisse dauerhaft deduplizieren.
- [ ] B018 Verspätete und ungeordnet eingehende Webhooks verarbeiten.
- [ ] B019 Unklaren Lieferantenstatus abfragen, bevor erneut gebucht wird.
- [ ] B020 Bei erfolgreicher Zahlung und fehlgeschlagener Buchung automatische Klärung oder Erstattung auslösen.
- [ ] B021 Bei bestätigter Buchung und Zahlungsfehler definierten Support- und Stornoprozess ausführen.
- [ ] B022 Flugticketnummer, PNR und Lieferantenreferenz korrekt unterscheiden und speichern.
- [ ] B023 Hotelbestätigung und Voucher inklusive Gäste- und Unterkunftsdaten verifizieren.
- [ ] B024 Nur bestätigte Leistungen in der Erfolgsseite und Bestätigungsmail ausweisen.
- [ ] B025 Rechnung, Zahlungsbeleg und Reisebestätigung korrekt zuordnen.
- [ ] B026 Lieferantenfinanzierung, Guthaben, Auszahlungstermine und Liquiditätsreserve planen.
- [ ] B027 Teilbuchung für Flug plus Hotel definieren: Reihenfolge, Rückabwicklung und Kommunikation.
- [ ] B028 Kein gemeinsames Paket verkaufen, bevor vertragliche und operative Anforderungen geprüft sind.
- [ ] B029 Voll- und Teilerstattung, Gebühren und Währungsdifferenzen implementieren.
- [ ] B030 Chargebacks mit Belegen, Fristen und Verantwortlichen bearbeiten können.
- [ ] B031 Buchhaltung und tägliche Abstimmung zwischen Zahlung, Order und Lieferant aufbauen.
- [ ] B032 Sandboxfälle für Erfolg, Ablehnung, Timeout, Duplikat, Preisänderung und Refund durchtesten.
- [ ] B033 Kontrollierte reale Testbuchung und Erstattung gemäß Anbieterregeln durchführen.
- [ ] B034 Buchung und Zahlung zentral abschaltbar machen, wenn ein kritischer Fehler auftritt.

Abnahme: Jede Zahlung ist einer eindeutig bestätigten Order oder einem vollständig geklärten Fehlerfall zugeordnet. Kunden erhalten keine falsche Bestätigung und werden nicht doppelt belastet.

## 5. Nach der Buchung und Kundendienst — P0/P1

- [ ] S001 Reiseübersicht mit Buchungsstatus, Dokumenten und Ansprechpartner aufbauen.
- [ ] S002 Transaktionsmails mit zuverlässiger Zustellung und Monitoring einrichten.
- [ ] S003 Änderungen, Airline-Umbuchungen und Unterkunftsprobleme aufnehmen und weitergeben.
- [ ] S004 Stornoanforderung mit konkreten Kosten und Bestätigung umsetzen.
- [ ] S005 Refundstatus für Kunden sichtbar machen.
- [ ] S006 Selbsthilfe für Check-in, Gepäck, Voucher und häufige Probleme anbieten.
- [ ] S007 Supportzeiten, Reaktionsziele und Notfallzuständigkeit ehrlich veröffentlichen.
- [ ] S008 Eskalationswege zum Anbieter dokumentieren und testen.
- [ ] S009 Adminansicht mit Suche, Statusverlauf und sicherem Zugriff entwickeln.
- [ ] S010 Sensible Aktionen protokollieren und Rechte begrenzen.
- [ ] S011 Verlorene Bestätigungen und fehlerhafte E-Mail-Adressen sicher korrigieren können.
- [ ] S012 Beschwerden und Qualitätsprobleme systematisch auswerten.
- [ ] S013 Betrugsfälle, Kontoübernahmen und ungewöhnliche Buchungen behandeln können.
- [ ] S014 Urlaub und Ausfall der betreuenden Person organisatorisch abdecken.

## 6. Sicherheit, Datenschutz und rechtliche Freigabe — P0

Dies sind Prüfaufträge an geeignete Fachpersonen, keine Feststellung, dass ein bestimmtes Gesetz oder eine bestimmte Lizenz hier bereits gilt. Sitz, Zielmärkte und Geschäftsmodell müssen zuerst feststehen.

- [ ] R001 Firma, Firmensitz, Zielmärkte und vertragliche Rolle festlegen.
- [ ] R002 Fachlich prüfen lassen, welche Vermittler-, Veranstalter- und Pauschalreiseanforderungen gelten.
- [ ] R003 Pflichtinformationen, Impressum, AGB und konkrete Buchungsbedingungen prüfen lassen.
- [ ] R004 Insolvenzschutz, Versicherung, Gewährleistung und Haftung passend zum Modell prüfen.
- [ ] R005 Steuer-, Mehrwertsteuer- und Rechnungsmodell mit Fachperson festlegen.
- [ ] R006 Zahlungsdienst-, Vermittlungs- und Auszahlungskonstruktion rechtlich prüfen lassen.
- [ ] R007 Datenschutzinventar erstellen: KI, Anbieter, Analytics, Hosting, E-Mail und Support.
- [ ] R008 Auftragsverarbeitung, internationale Transfers und Unterauftragnehmer prüfen.
- [ ] R009 Nur erforderliche Reisedaten erheben; Ausweise und Gesundheitsangaben besonders sorgfältig behandeln.
- [ ] R010 Personenbezogene Daten nicht unnötig an die KI senden.
- [ ] R011 Löschfristen, Auskunft, Export und Kontolöschung umsetzen.
- [ ] R012 Tracking und Marketingeinwilligung getrennt gestalten und Widerruf ermöglichen.
- [ ] R013 Trackingbedingungen für die konkreten Zielmärkte prüfen.
- [ ] R014 Authentifizierung, Sitzungen und serverseitige Autorisierung absichern.
- [ ] R015 Fremde Reise- und Buchungsdaten dürfen nicht über erratbare IDs abrufbar sein.
- [ ] R016 Schlüssel ausschließlich serverseitig speichern und Rotation planen.
- [ ] R017 API- und KI-Missbrauch mit Rate Limits, Kostenlimits und Missbrauchserkennung begrenzen.
- [ ] R018 Eingaben, URLs und Ausgaben validieren; SSRF und Prompt-Injection gezielt testen.
- [ ] R019 KI darf keine unbestätigten Buchungen oder Zahlungen auslösen.
- [ ] R020 Logs, Fehlerberichte und Analytics von vertraulichen Daten bereinigen.
- [ ] R021 Sicherheitsupdates, Abhängigkeitsprüfung und Incident-Ablauf etablieren.
- [ ] R022 Backup und Wiederherstellung testen; Rechte für Produktionssysteme minimieren.
- [ ] R023 Sicherheitsprüfung vor direkter Zahlung durchführen und Befunde beheben.

## 7. Technik und zuverlässiger Betrieb — P0/P1

- [ ] E001 Datenmodell für Nutzer, Reisen, Angebote, Orders, Zahlungen und Ereignisse definieren.
- [ ] E002 Geeignete Datenbank, Migrationen und Transaktionen einrichten.
- [ ] E003 Entwicklung, Sandbox, Vorschau und Produktion sauber trennen.
- [ ] E004 Serverseitige Validierung für alle API-Routen vereinheitlichen.
- [ ] E005 Timeouts, kontrollierte Wiederholungen und Anbieterabschaltung entwickeln.
- [ ] E006 Nur sichere idempotente Vorgänge automatisch wiederholen.
- [ ] E007 Langlaufende Buchungsarbeit mit Jobs und Wiederaufnahme absichern.
- [ ] E008 Korrelations-IDs über Suche, Zahlung und Buchung hinweg verwenden.
- [ ] E009 Monitoring für Verfügbarkeit, Latenz, Fehlerrate und Buchungskonflikte einrichten.
- [ ] E010 Alarmierung mit Verantwortlichen und konkreten Handlungsanweisungen versehen.
- [ ] E011 API-, KI-, Datenbank-, E-Mail- und Hostingkosten budgetieren und begrenzen.
- [ ] E012 Vertraglich erlaubtes Caching und Lastbegrenzung einsetzen.
- [ ] E013 Performance auf günstigen Mobilgeräten und schwachen Netzen messen.
- [ ] E014 Regressionstests für Preis, Währung, Daten, Belegung und Return-Legs ausbauen.
- [ ] E015 Integrationstests, End-to-End-Tests und Zahlungsfehlfälle automatisieren.
- [ ] E016 Lasttests an realistischen Such- und Checkoutspitzen ausrichten.
- [ ] E017 Rollback, Feature-Schalter und Notabschaltung testen.
- [ ] E018 Produktionsmigrationen und Deploymentreihenfolge dokumentieren.
- [ ] E019 Statusseite oder klaren Kanal für Störungen bereitstellen.
- [ ] E020 Datenqualität nach Anbieter und Markt regelmäßig prüfen.

## 8. Vertrauen und Marke — P1

- [ ] V001 Seriöses, wiedererkennbares Erscheinungsbild und klare Startseite entwickeln.
- [ ] V002 In wenigen Sätzen erklären, was die Seite leistet und wer Vertragspartner ist.
- [ ] V003 Echte Firma, Kontaktmöglichkeiten und Supportzuständigkeit sichtbar machen.
- [ ] V004 Geschäftsmodell und Affiliate-Beziehungen transparent erklären.
- [ ] V005 KI-Empfehlungen von bezahlter Platzierung unterscheidbar halten.
- [ ] V006 Angebote mit nachvollziehbaren Quellen statt unbelegten Vertrauenssiegeln zeigen.
- [ ] V007 Keine erfundenen Reviews, Verknappung oder Nutzerzahlen einsetzen.
- [ ] V008 Gebühren und Stornobedingungen vor dem Abschluss erklären.
- [ ] V009 Gute Reisebeispiele mit echten Grenzen und Aktualisierungsdatum veröffentlichen.
- [ ] V010 Nutzertests auf Verständnis und Vertrauen auswerten.

## 9. Messung und Wirtschaftlichkeit — P0/P1

- [ ] M001 Messplan vor Tracking definieren und Datenschutz berücksichtigen.
- [ ] M002 Funnel erfassen: Besuch, gültige Suche, Ergebnis, Favorit, Weiterleitung, Checkout, bestätigte Buchung.
- [ ] M003 Anbieterweiterleitung nicht als bestätigte Buchung zählen.
- [ ] M004 Affiliate-Buchungen nur anhand zulässiger verlässlicher Rückmeldungen zuordnen.
- [ ] M005 Fehlerquote, Suchdauer und leere Ergebnisse nach Markt und Anbieter auswerten.
- [ ] M006 KI-Qualität mit überprüfbaren Reiseaufgaben bewerten.
- [ ] M007 Rückkehrende Nutzer und erneut geplante Reisen als Kohorten beobachten.
- [ ] M008 Deckungsbeitrag je Buchung berechnen: Erlös minus API, KI, Zahlung, Support, Refund und Akquisition.
- [ ] M009 Provisionen erst nach tatsächlicher Bestätigung und unter Berücksichtigung von Storno bewerten.
- [ ] M010 Liquidität separat von Gewinn betrachten.
- [ ] M011 Pro Kanal Akquisekosten, Aktivierung und tatsächlichen Ertrag messen.
- [ ] M012 Zielwerte nach erster Baseline festlegen; keine willkürlichen Erfolgszahlen als Fakten behandeln.
- [ ] M013 Experimente mit Hypothese, Erfolgskriterium und Enddatum dokumentieren.
- [ ] M014 Keine größeren Werbebudgets ausgeben, bevor Buchungs- und Nutzungsdaten zuverlässig sind.

## 10. Erste Nutzer und Vermarktung — P1, Ausbau P2

- [ ] G001 Zehn passende Testpersonen für echte bevorstehende Reisen gewinnen.
- [ ] G002 Erste Nutzung beobachten und konkrete Reibung dokumentieren.
- [ ] G003 Größte drei Nutzungsprobleme nach jedem Testzyklus beheben.
- [ ] G004 Danach auf eine betreute Gruppe von etwa 30–50 Nutzern erweitern; Größe ist Planungsannahme.
- [ ] G005 Warteliste mit Einwilligung und klarer Erwartung aufbauen.
- [ ] G006 Suchmaschinenbasis umsetzen: Indexierung, Sitemap, Canonicals und schnelle Seiten.
- [ ] G007 Nützliche Reiseinhalte für die Startzielgruppe erstellen und pflegen.
- [ ] G008 Keine massenhaft generierten dünnen Ortsseiten veröffentlichen.
- [ ] G009 Reisebeispiele, Budgetvergleiche und Planungsdemonstrationen als Inhalte testen.
- [ ] G010 Mit kleinen passenden Creators und Communities zusammenarbeiten.
- [ ] G011 Werbung und Partnerinhalte korrekt kennzeichnen.
- [ ] G012 Empfehlungsfunktion mit tatsächlichem Nutzen testen und Missbrauch begrenzen.
- [ ] G013 Reisebüros, lokale Anbieter oder Arbeitgeber als mögliche Vertriebspartner prüfen.
- [ ] G014 Kleine bezahlte Kampagnen erst nach brauchbarer Aktivierung starten.
- [ ] G015 Newsletter und Reisealarme nur bei Einwilligung und mit Abmeldung anbieten.
- [ ] G016 Wiederkehr fördern: gespeicherte Reise, relevante Preisänderung, hilfreiche Vorbereitung.
- [ ] G017 Erfahrungsberichte nach realer Nutzung einholen.
- [ ] G018 Kanäle anhand von Qualität und Ertrag priorisieren; schlechte Kanäle beenden.
- [ ] G019 Positionierung anhand beobachteter Nutzung regelmäßig nachschärfen.
- [ ] G020 Öffentlichen Start mit Supportkapazität und Monitoring abstimmen.

## 11. Späterer Ausbau — P2, nur nach Nachfrage

- [ ] X001 Weitere Abflugmärkte, Sprachen und Währungen ergänzen.
- [ ] X002 Flexible Datums- und Zielsuche optimieren.
- [ ] X003 Bahn, Mietwagen und Transfers integrieren, wenn der Nutzerbedarf belegt ist.
- [ ] X004 Aktivitäten mit echter Verfügbarkeit und Voucherverwaltung ergänzen.
- [ ] X005 Versicherungen nur mit passendem Partner und geprüfter Vertriebsrolle anbieten.
- [ ] X006 Gruppenreisen mit Abstimmung und getrennten Zahlungsanforderungen prüfen.
- [ ] X007 Familienfunktionen und Zimmerlogik vertiefen.
- [ ] X008 Barrierefreie Reiseplanung mit verifizierbaren Eigenschaften ausbauen.
- [ ] X009 Treueprogramm oder bezahltes Planungsabo nur bei belegtem Wiederholungsnutzen testen.
- [ ] X010 App oder PWA anhand mobiler Nutzung entscheiden.
- [ ] X011 Klimainformationen nur mit nachvollziehbarer Methodik und Datenbasis anbieten.
- [ ] X012 Dynamische Pakete erst nach vollständiger rechtlicher und operativer Freigabe entwickeln.
- [ ] X013 Airbnb-Direktintegration nur bei ausdrücklicher, passender Anbieterfreigabe realisieren.

## Verbindliche Freigaben

### Erste externe Testgruppe

- [ ] L001 Vorschau funktioniert und kritische Regressionen sind grün.
- [ ] L002 Echte Anbieterantworten und passende Weiterleitungen wurden geprüft.
- [ ] L003 Preisumfang, Datenquelle und Vertragszuständigkeit sind sichtbar.
- [ ] L004 Feedback, Datenschutz und erreichbarer Kontakt stehen.
- [ ] L005 Testnutzer wissen, welche Funktionen bereits belastbar sind.

### Öffentliches Planungsprodukt

- [ ] L006 Kritische Testprobleme sind behoben; mobile Suche ist zuverlässig.
- [ ] L007 Lieferantenrechte, Kostenlimits und Ausfallabläufe sind geklärt.
- [ ] L008 Monitoring, Rückkehr zum vorigen Release und Support funktionieren.
- [ ] L009 Nutzen wurde mit realen Reiseaufgaben beobachtet.
- [ ] L010 Messung erlaubt die Entscheidung, ob und wo weiter investiert wird.

### Erste direkte Zahlung

- [ ] L011 Produktbezogene Verträge, Zahlungsfreigabe und fachliche Rechtsprüfung sind abgeschlossen.
- [ ] L012 Repricing, Zahlung, Order, Bestätigung, Storno und Refund wurden durchgehend getestet.
- [ ] L013 Doppelte und unklare Vorgänge erzeugen keine unkontrollierten Buchungen.
- [ ] L014 Reale kontrollierte Buchung und Rückabwicklung sind dokumentiert.
- [ ] L015 Support, Liquidität, Buchhaltung und Notabschaltung stehen.

### Wachstumsfreigabe

- [ ] L016 Kritische Fehler sind beherrscht und Kundendienst kann zusätzliches Volumen tragen.
- [ ] L017 Deckungsbeitrag und Akquisekosten werden belastbar gemessen.
- [ ] L018 Nutzer kehren zurück oder empfehlen das Produkt aus beobachtetem Nutzen weiter.
- [ ] L019 Infrastruktur und Lieferantenquoten verkraften das geplante Volumen.
- [ ] L020 Es gibt Budget, Verantwortliche und einen Auswertungsrhythmus für Wachstum.

## Die nächsten zehn Aufgaben

1. T001: Vercel-Build reparieren und Vorschau prüfen.
2. T004/T006: Schlüssel, Anbieterrechte und API-Abhängigkeiten klären.
3. T007–T012: Suche mit echten Antworten von Ende zu Ende abnehmen.
4. T002/T003: PRs integrieren und zusätzliche Funktionen geordnet übernehmen.
5. P001–P003: Startzielgruppe und reale Reiseprobleme validieren.
6. U006–U009: Vertrauenswürdige Preis- und Ergebnisdarstellung fertigstellen.
7. L001–L005: Erste betreute Testgruppe starten.
8. I004–I011: Geeignete Flug-/Hotelpartner und Airbnb-Möglichkeiten klären.
9. B001–B005/R001–R006: Geschäftsrolle, Zahlung und rechtliche Voraussetzungen festlegen.
10. Erst danach B006–B034: Einen vollständigen direkten Buchungsfluss bauen.

Kein seriöser Gesamttermin lässt sich festlegen, bevor Anbieterzugänge, rechtliche Rolle und Betatests geklärt sind. Die Aufgaben werden in kleine überprüfbare Releases aufgeteilt. Das erste brauchbare Produkt ist eine zuverlässige Reiseplanung mit ehrlicher Anbieterübergabe; das vollständige Verkaufsprodukt umfasst zusätzlich bestätigte Buchungen, Geldabwicklung und Betreuung nach dem Kauf.
