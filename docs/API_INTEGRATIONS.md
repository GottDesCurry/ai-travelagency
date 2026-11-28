# API-Integrationen

Live-Beta: **Booking.com über RapidAPI** und **OpenAI**. Seit 28.11.2026 vom Betreiber freigegeben: **Duffel** (Flüge) und **Nuitée/LiteAPI** (Hotels), vorerst **nur in der Testumgebung** und nur Suche, keine Buchung.

## Umgebungsvariablen

| Variable | Verwendung | Wo |
|---|---|---|
| `RAPIDAPI_KEY` | alle Booking-Aufrufe | `.env.local` lokal, Vercel → Settings → Environment Variables |
| `OPENAI_API_KEY` | parse-trip, ai-correct-city, ai | ebenso |
| `DUFFEL_ACCESS_TOKEN` | Flugsuche über Duffel statt RapidAPI | nur Vercel **Preview**; nur `duffel_test_…` wird verwendet |
| `LITEAPI_KEY` | Hotelsuche über Nuitée statt RapidAPI | nur Vercel **Preview**; nur `sand_…` wird verwendet |

Nur serverseitig, nie mit `NEXT_PUBLIC_`. `.env.example` enthält nur leere Platzhalter. `.env*` ist in `.gitignore`.

## RapidAPI-Hosts im Code

| Host | Endpunkte | Route | Status |
|---|---|---|---|
| `booking-com18.p.rapidapi.com` | `/flights/search` | `/api/flights`, `/api/flights-aggregated`, `/api/search-flights`, `/api/flights-booking` | 403 nicht abonniert (14.10.2026). Antwortschema (`data[].itineraries`, `price.total`) **nicht live bestätigt**. |
| `booking-com18.p.rapidapi.com` | `/stays/auto-complete`, `/stays/search` | `/api/hotels` | 403 nicht abonniert. Felder (`result[].property`, `composite_price_breakdown.gross_amount`) **nicht live bestätigt**. |
| `booking-com.p.rapidapi.com` | `/v1/hotels/locations` | `/api/hotels-location` (Legacy, vom Frontend nicht mehr verwendet) | ungeprüft, separates Produkt |
| `booking-com15.p.rapidapi.com` | – | – | früher in `flights-booking`, heute nicht mehr verwendet |

Gleiche Markennamen auf RapidAPI bedeuten nicht dieselbe API. Vor der Live-Beta muss genau ein abonniertes Produkt pro Suchbereich gewählt und mit echten Antworten abgeglichen werden.

## Sandbox-Anbieter (Testumgebung)

| Anbieter | Endpunkt | Code | Status |
|---|---|---|---|
| Duffel | `POST https://api.duffel.com/air/offer_requests?return_offers=true`, Header `Duffel-Version: v2` | `src/lib/duffel.ts` | Schema aus dem offiziellen JS-SDK (`duffel-api-javascript`), **nicht live bestätigt** |
| Nuitée (LiteAPI) | `POST https://api.liteapi.travel/v3.0/hotels/rates`, Header `X-API-Key`; Ort über `cityName` + `countryCode` | `src/lib/liteapi.ts` | Schema laut Doku docs.nuitee.com, **nicht live bestätigt** (Preisfeld `offerRetailRate`, Hoteldaten in `hotels[]`) |

- Ist ein gültiger Test-/Sandbox-Schlüssel gesetzt, ersetzt der Anbieter die RapidAPI-Suche im jeweiligen Bereich. Live-Schlüssel (`duffel_live_…`, Produktionsschlüssel ohne `sand_`) werden ignoriert, damit nie versehentlich echte Buchungen oder Kosten entstehen.
- Angebote tragen `testData: true` und werden als «Testdaten · nicht buchbar» angezeigt, ohne Buchungslink.
- Duffel liefert keinen Buchungslink; Buchung bräuchte später `POST /air/orders` mit Passagierdaten und Zahlung (Live: ca. 3 USD pro Buchung). Nuitée-Buchung (`/rates/prebook`, `/rates/book`) ist noch nicht eingebaut.
- Nuitée-Sandbox: 5 Anfragen pro Sekunde pro Schlüssel.
- Prüfen nach dem Eintragen: `npm run live-check` bzw. Workflow «Live check (manual)» (je 1 Abfrage).

## OpenAI

| Route | Modell | Zweck | Grenzen |
|---|---|---|---|
| `/api/parse-trip` | gpt-4 | Reiseangaben aus Text | 4000 Zeichen, 15 s, keine Retries, Ausgabe validiert |
| `/api/ai-correct-city` | gpt-4o | Rechtschreibkorrektur von Städten | 120 Zeichen, nur für lokal unbekannte Städte, Cache pro Instanz |
| `/api/ai` | gpt-4o | 3 beste Flüge aus max. 15 Angeboten | nur IDs, Fallback ohne KI |

Kosten pro Suche (Richtwert): 1 parse-trip (nur mit Prompt), 0–2 Korrekturen (nur bei unbekannten Städten), 1 Ranking. Kein echter Kostenwert gemessen, da kein Guthaben.

## Nicht verwendet (bewusst)

Amadeus (eingestellt), Skyscanner, Kiwi und weitere Anbieter. Keine Platzhalter im Code.
