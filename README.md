# AI TravelAgency

KI-gestützte Reisesuche für Flüge und Hotels (Beta). Anbieter in der Beta: Booking.com über RapidAPI; OpenAI für Reisewunsch-Erkennung, Stadtkorrektur und Angebotsauswahl.

## Start

```bash
npm ci
cp .env.example .env.local   # RAPIDAPI_KEY und OPENAI_API_KEY eintragen, nie committen
npm run dev
```

Ohne Schlüssel startet die Seite trotzdem; Suchen melden dann verständlich, dass der Dienst nicht konfiguriert ist.

## Prüfen

```bash
npm test && npx tsc --noEmit && npx eslint . && npm run build && npm run smoke && npm run e2e
```

## Dokumentation

- [CLAUDE.md](CLAUDE.md) – Regeln für KI-Agenten
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) – aktueller Stand und Blocker
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API_INTEGRATIONS.md](docs/API_INTEGRATIONS.md), [docs/DECISIONS.md](docs/DECISIONS.md)
- [docs/TESTING.md](docs/TESTING.md), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), [docs/ROADMAP.md](docs/ROADMAP.md), [docs/CHANGELOG.md](docs/CHANGELOG.md)
