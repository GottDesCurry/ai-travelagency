# Beta testing – current setup

Target: closed beta for 5–10 testers on 17 October 2026. PR #7 / fix/return-flight-display is the consolidated implementation base. No main merge or public release is implied.

## Implemented and verified

- Current landing design and destination choice ported from PR #1 onto the repaired search flow.
- Every valid offer in the flight provider response is preserved; recommendations are additional, not an offer replacement.
- Price/stops sorting, roundtrip-aware direct-flight filter, desktop/mobile layout and keyboard submission.
- Independent flight/hotel errors, cancellation, bounded requests, saved searches, manual fallback on AI input/ranking errors.
- GitHub Actions at UI commit 2ac532561df05b4f68ec342d2b4788319661668c succeeded: 37 regression tests, TypeScript, lint, build, HTTP smoke and 14 browser cases. Desktop/mobile screenshots visually inspected.
- Additional provider error classification is covered by new regression tests; consult the CI run at the actual release commit for final validation.

## Live release blockers: confirmed on 14 October

See [docs/BETA_LIVE_VALIDATION_2026-10-14.md](docs/BETA_LIVE_VALIDATION_2026-10-14.md).

- Booking COM 18 flight and hotel-location endpoints return 403: not subscribed to this API.
- OpenAI returns 429 / credit_balance_exhausted: API credits exhausted.
- Current Vercel preview is READY but the connected identity cannot fetch its protected contents (403).
- No real offer schema, prices, passenger/room/stay basis or supplier links have passed live validation.
- Supplier rights, verified business/contact details, tester access and quota/cost controls remain release gates.
- LiteAPI is not implemented or configured. PR #1 saved trips and day planning remain separate follow-up work.

## Local checks without paid provider calls

    npm ci
    npm test
    npx tsc --noEmit
    npm run lint
    npm run build
    npm run smoke
    npx playwright install chromium
    npm run e2e

HTTP/browser checks deliberately remove RapidAPI/OpenAI credentials. CI uploads browser screenshots/traces as beta-browser-results. These checks do not establish live availability.

## After the actual API access is restored

Use server-side development/Preview variables; never commit secrets or use NEXT_PUBLIC_ keys.
Verify the subscribed product's endpoints and response envelopes before altering adapters. Test One-way/Roundtrip, one/multiple adults, hotel-only/combined searches, price/currency/fees, location matching and supplied HTTPS provider links. Keep Preview/Production budgets appropriately scoped.

Publish only the exact commit whose CI and live deployment checks passed. Invite testers only after an actual accessible beta link and the release gates are verified. See docs/LAUNCH_RUNBOOK.md and docs/BETA_FEEDBACK.md.
