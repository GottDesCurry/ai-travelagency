# Changelog

## 2026-11-27 – Branch `claude/ux-improvements`

- Merkliste: Herz auf Flug- und Hotelkarten, Liste unter den Ergebnissen, nur im Browser (localStorage, validiert, max. 30). Gespeichert wird nur, was die Karte zeigt; Preise sind als Stand beim Merken markiert.
- «Günstigste Kombination Flug + Hotel»: Summe echter Anbieterpreise, nur bei gleicher Währung und vorhandenem Hotelpreis, ohne Umrechnung, mit Hinweis zur Preisbasis.
- Startseite: «Wohin zieht es dich?» mit dem Suchformular steht zuoberst (Seitentitel h1); der Bildbereich folgt weiter unten. Nach dem Intro erhält der Suchtitel den Fokus.
- Kalender: Hinreise ab heute (Zeitzone Zürich), Rückreise frühestens am Hinreisedatum.
- PRs #1–#7 geschlossen (durch #8 ersetzt).

## 2026-11-27 – Branch `claude/beta-stabilization`

- `any` vollständig entfernt, `no-explicit-any` wieder aktiv; `eslint .` sauber (auch Tests/Skripte).
- Sicherheitsupdates: Next.js 15.5.29 (kritische Lücken in ≤15.5.28), axios 1.21, transitive Pakete; `npm audit` 0.
- Rate Limiting/Kostenbremse für alle OpenAI- und RapidAPI-Routen.
- Lokale Stadt-/Flughafenerkennung (112 Flughäfen, Aliase), KI-Korrektur nur bei Unbekanntem, Server-Cache; klare Meldung bei unbekannten/mehrdeutigen Städten statt stillem Falsch-Mapping.
- Reisewunsch: sichtbarer Hinweis, wenn Angaben aus dem Formular übernommen werden; Prompt präzisiert (Gruppenangaben, fehlendes Jahr, ungültige Daten).
- Client prüft `/api/parse-trip`-Antworten zur Laufzeit.
- Neue Tests: Stadterkennung, Rate Limit, Browserfälle für Korrektur und unbekannte Stadt.
- Dokumentation: CLAUDE.md, docs/PROJECT_STATUS, ARCHITECTURE, API_INTEGRATIONS, DECISIONS, TESTING, DEPLOYMENT, ROADMAP, PROJECT_OVERVIEW.

## 2026-10-06 bis 2026-10-14 – PR #7

Build repariert, Amadeus/Kiwi entfernt, gemeinsame Angebotsverträge, KI-Ranking nur über IDs, Hin-/Rückflug, Fehlerbehandlung, Timeouts, neues Design, gespeicherte Suchen, CI. Details: `git log` und `docs/IMPLEMENTATION_STATUS.md`.
