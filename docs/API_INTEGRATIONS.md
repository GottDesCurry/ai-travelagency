# API-Integrationen

Beta-Umfang: ausschliesslich **Booking.com über RapidAPI** und **OpenAI**. Weitere Anbieter erst nach der Beta (siehe [ROADMAP.md](ROADMAP.md)).

## Umgebungsvariablen

| Variable | Verwendung | Wo |
|---|---|---|
| `RAPIDAPI_KEY` | alle Booking-Aufrufe | `.env.local` lokal, Vercel → Settings → Environment Variables |
| `OPENAI_API_KEY` | parse-trip, ai-correct-city, ai | ebenso |

Nur serverseitig, nie mit `NEXT_PUBLIC_`. `.env.example` enthält nur leere Platzhalter. `.env*` ist in `.gitignore`.

## RapidAPI-Hosts im Code

| Host | Endpunkte | Route | Status |
|---|---|---|---|
| `booking-com18.p.rapidapi.com` | `/flights/search` | `/api/flights`, `/api/flights-aggregated`, `/api/search-flights`, `/api/flights-booking` | 403 nicht abonniert (14.10.2026). Antwortschema (`data[].itineraries`, `price.total`) **nicht live bestätigt**. |
| `booking-com18.p.rapidapi.com` | `/stays/auto-complete`, `/stays/search` | `/api/hotels` | 403 nicht abonniert. Felder (`result[].property`, `composite_price_breakdown.gross_amount`) **nicht live bestätigt**. |
| `booking-com.p.rapidapi.com` | `/v1/hotels/locations` | `/api/hotels-location` (Legacy, vom Frontend nicht mehr verwendet) | ungeprüft, separates Produkt |
| `booking-com15.p.rapidapi.com` | – | – | früher in `flights-booking`, heute nicht mehr verwendet |

Gleiche Markennamen auf RapidAPI bedeuten nicht dieselbe API. Vor der Live-Beta muss genau ein abonniertes Produkt pro Suchbereich gewählt und mit echten Antworten abgeglichen werden.

## OpenAI

| Route | Modell | Zweck | Grenzen |
|---|---|---|---|
| `/api/parse-trip` | gpt-4 | Reiseangaben aus Text | 4000 Zeichen, 15 s, keine Retries, Ausgabe validiert |
| `/api/ai-correct-city` | gpt-4o | Rechtschreibkorrektur von Städten | 120 Zeichen, nur für lokal unbekannte Städte, Cache pro Instanz |
| `/api/ai` | gpt-4o | 3 beste Flüge aus max. 15 Angeboten | nur IDs, Fallback ohne KI |

Kosten pro Suche (Richtwert): 1 parse-trip (nur mit Prompt), 0–2 Korrekturen (nur bei unbekannten Städten), 1 Ranking. Kein echter Kostenwert gemessen, da kein Guthaben.

## Nicht verwendet (bewusst)

Amadeus, Skyscanner, Kiwi, LiteAPI und weitere Anbieter. Keine Platzhalter im Code.
