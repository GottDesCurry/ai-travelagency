# Roadmap

Ausführlicher Plan: [MASTERPLAN.md](MASTERPLAN.md). Reihenfolge laut Betreiber:

1. **Beta (jetzt):** stabile Suche mit Booking/RapidAPI + OpenAI, Live-Abnahme, Vercel-Production. Kriterien in [PROJECT_STATUS.md](PROJECT_STATUS.md).
2. **Mehrere Anbieter:** Skyscanner, Kiwi, Amadeus, weitere Flug-/Hotel-/Ferienwohnungsanbieter, je nach API-Zugang, Lizenz und Kosten. Gemeinsame Normalisierung (`FlightOffer`/`HotelOffer` sind dafür ausgelegt) und Duplikaterkennung.
3. **Intelligente Reiseoptimierung:** Budgets, flexible Daten, alternative Flughäfen, Gepäck, Pakete Flug+Hotel, Gruppen, Empfehlungen, Reisepläne, Preisalarme, gespeicherte Reisen, Favoriten.
4. **Kommerzialisierung:** Affiliate/Vermittlung, Partnerschaften, Premium. Vorher API-Nutzungsbedingungen, Datenschutz, Recht, Vercel-Tarif prüfen.
5. **Branding/Markteinführung:** Name und Domain offen; bis dahin Vercel-URL. Keine Domain ohne Zustimmung.

Vor öffentlichem Start zusätzlich: globales Rate Limit (geteilter Speicher), getrennte Budgets, Monitoring.
