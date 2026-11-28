# Entscheidungen

| Datum | Entscheidung | Grund |
|---|---|---|
| 2026-10 | Nur Booking über RapidAPI + OpenAI für die Beta; Amadeus entfernt | Vorgabe Betreiber; Amadeus-Import hatte den Vercel-Build gebrochen |
| 2026-10 | «Lösung B»: saubere Typen statt abgeschalteter Regeln | Vorgabe Betreiber |
| 2026-10 | KI wählt nur Angebots-IDs, Originaldaten bleiben serverseitig | Keine erfundenen Preise/Zeiten/Links |
| 2026-10 | Alle gültigen Flugangebote anzeigen, KI-Auswahl nur als «Empfohlen» | Beta-Baseline vom 13.10.2026 |
| 2026-11-27 | Basis für die Beta ist PR #7, nicht `main` | `main` baut nicht, PR #7 ist der konsolidierte Stand |
| 2026-11-27 | App Router und Pages Router bleiben nebeneinander | keine Konflikte, Migration ohne technischen Nutzen |
| 2026-11-27 | `no-explicit-any` wieder aktiv; für `*.cjs` (Node-Tests/Skripte) CommonJS-Konfiguration | `require()` ist dort die korrekte Modulsyntax, keine Regelabschaltung für TS-Code |
| 2026-11-27 | Lokale Stadterkennung ohne Teilstring-Raten; KI-Korrektur nur bei Unbekanntem | Weniger KI-Kosten, kein stilles Falsch-Mapping (früher passte z. B. jede Eingabe, die in einem Städtenamen vorkam) |
| 2026-11-27 | In-Memory-Rate-Limit statt externem Store | kostenlos, sofort wirksam; globales Limit (z. B. Vercel KV/Upstash) vor grossem öffentlichem Start nötig, kostet ggf. Geld → Zustimmung |
| 2026-11-27 | Keine Bereinigung der Git-Historie wegen des alten RapidAPI-Schlüssels | destruktiv; Rotation beim Anbieter ist die wirksame Massnahme |
| 2026-11-27 | Airline-Logo, Hotelsterne/Bewertungen/Tags erst nach Live-Schema | Felder dürfen nicht geraten oder erfunden werden |
| 2026-11-28 | Duffel (Flüge) und Nuitée/LiteAPI (Hotels) zusätzlich, vorerst nur Sandbox und nur Suche | Freigabe Betreiber; Ziel: echte Buchbarkeit auf einer Seite und Provision (Nuitée-Aufschlag). RapidAPI bleibt für die Live-Beta. Live-Schlüssel werden im Code ignoriert. |
