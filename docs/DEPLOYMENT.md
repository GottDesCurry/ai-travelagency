# Deployment

Vercel-Projekt `ai-travelagency`, Team `visnus-projects`. Production folgt `main`, jeder PR bekommt ein Preview-Deployment.

## Ablauf

1. Prüfungen lokal oder in CI: siehe [TESTING.md](TESTING.md) und `CLAUDE.md`.
2. Branch pushen, PR gegen `main` öffnen → Vercel baut eine Vorschau. Prüfen, dass das Deployment den **Commit-Hash des PR-Kopfs** zeigt (frühere Fehler: Vercel baute wiederholt den alten Commit dac2b9d).
3. Vorschau testen (manuelle Suche, KI-Suche, Fehlerfälle, Handy). Hinweis: Vorschauen sind geschützt; zum Testen eingeloggt sein oder einen Freigabelink erstellen.
4. Erst dann mergen → Production. Production-URL und Commit hier eintragen.

## Umgebungsvariablen in Vercel

`RAPIDAPI_KEY`, `OPENAI_API_KEY` für Production und Preview. Empfohlen: getrennte Schlüssel/Budgets für Preview und Production.

## Status

| Datum | Commit | Umgebung | Ergebnis |
|---|---|---|---|
| bis 2025-08 | dac2b9d | Production | Build-Fehler `@/lib/amadeus` |
| 2026-10-13 | 03d6c5e (PR #7) | Preview | READY, Zugriff geschützt |
| 2026-10-14 | 2ac5325 (PR #7) | Preview | READY, Live-APIs 403/429 |
| 2026-11-27 | `claude/beta-stabilization` | PR #8 | gemergt (3c2b397), Production-Deployment erfolgreich |
| 2026-11-27 | `claude/ux-improvements` | neuer PR | Vorschau-Deployment, Merge erst nach Freigabe |

Rollback: in Vercel das letzte geprüfte Deployment «Promote to Production».
