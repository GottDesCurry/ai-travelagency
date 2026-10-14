# Externe Aufrufe und Freigabegrenzen

| Route | Dienst | Verwendung | Technische Grenzen |
|---|---|---|---|
| /api/flights, /api/flights-aggregated, /api/search-flights, /api/flights-booking | booking-com18.p.rapidapi.com/flights/search | Flugangebote; kein Ticketing | 15 s Timeout, zentrale Validierung und Normalisierung, Return-Legs erforderlich bei Roundtrip |
| /api/hotels | booking-com18.p.rapidapi.com/stays/auto-complete und /stays/search | Hotelangebote | Zwei Anfragen, jeweils 15 s Timeout; normalisierte Angebote |
| /api/hotels-location | booking-com.p.rapidapi.com/v1/hotels/locations | Legacy-Ortssuche | Separates Anbieterprodukt; 15 s Timeout, codierter Ortsname, geprüftes Array |
| /api/parse-trip | OpenAI gpt-4 | Reiseangaben aus Text | 4000 Zeichen, 15 s Timeout, keine Retries, serverseitige Prüfung der Ausgabe |
| /api/ai-correct-city | OpenAI gpt-4o | Optionaler Ortskorrekturvorschlag | 120 Zeichen, 15 s Timeout, keine Retries |
| /api/ai | OpenAI gpt-4o | Reihenfolge vorhandener Flugangebote | Höchstens 15 Angebote; KI darf nur vorhandene IDs auswählen; Fallback bewahrt Originalangebote |
| app/page.tsx | Eigene /api-Routen | Suche aus Formular | Anbieterangebote werden erst nach Serverantwort angezeigt |

Alle RapidAPI-Verträge sind anhand des jeweiligen aktiven Produkts zu bestätigen. Gleiche Markennamen auf RapidAPI bedeuten nicht denselben API-Vertrag oder autorisierte Direktbuchungen. Der konkrete Suchpfad und die Response-Envelope sind noch nicht mit Live-Zugang geprüft.

## Vor externer Beta zu prüfen

- Korrekte Parameter, Antwortformate und Preise für Erwachsene, Aufenthalt und Roundtrip.
- Gesamtsumme gegenüber pro Person/pro Nacht; enthaltene Gebühren und Gepäck.
- Datenrechte für Anzeige, KI-Verarbeitung, Caching, Bilder und Deep Links.
- Quoten, wiederkehrende Kosten, erlaubte Nutzung und Ersatz bei Ausfall.
- Ortssuche bei mehreren Treffern; derzeit wird der erste Treffer verwendet.
- API- und KI-Rate-Limits vor öffentlichem Zugang. Ein lokales Speicherlimit wäre auf Vercel keine verlässliche globale Begrenzung.
