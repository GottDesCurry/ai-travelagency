# Beta test setup

This branch combines the build, flight contract, hotel contract, booking-link,
error-handling and return-itinerary repairs from PRs #2–#7.

## Local validation

Use the Node version supported by the hosting project. Install with `npm ci`.
Run `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
Start the production application with `npm start`.

Set RAPIDAPI_KEY and OPENAI_API_KEY in an untracked .env.local file for local
integration tests, or in the hosting provider Preview environment. Never commit
credentials. The RapidAPI subscription must authorize booking-com18 endpoints.
Without credentials, manual flight/hotel search and prompt parsing deliberately
report configuration errors; existing mocked regression tests do not require keys.

## Live integration checks still required

- Verify /flights/search, /stays/auto-complete and /stays/search in the subscribed
  RapidAPI playground. The current query names and payload assumptions are not
  independently verified against live responses.
- Test one-way and return travel with 1 and 4 adults. Confirm selected dates and
  passenger counts reach the provider, and both itineraries display correctly.
- Confirm the displayed price/currency matches the provider total; determine
  exactly whether it includes all travelers and fees before beta release.
- Test hotel-only and combined searches; confirm check-in/out, guests and the
  price basis. Verify returned location and hotel envelopes match the adapters.
- Follow actual supplied provider links and check that they lead to the intended
  offer. HTTPS validation alone does not verify availability or matching details.
- Exercise AI prompt parsing and ranking, empty results, invalid input, timeout,
  provider quota/authentication errors, and partial search failure.
- Check phone and desktop layouts and accessibility before inviting 3–5 testers.

## GitHub and hosting status

PR #1 contains additional features (animated homepage, itinerary generation,
saved trips, contact/privacy updates). It overlaps with these repairs and should
be reconciled as a separate feature change; it has not been discarded or merged.
The accumulated repair branch can be reviewed directly against main rather than
merging every dependent PR manually.

Vercel deployment dpl_CtdPgdes95e41vwjbUbhWosidDEV for commit
8c3b7d9e6b3781bb1efea3914b5797bd28df2770 was blocked with
VULNERABLE_NEXTJS_VERSION. Deployment metadata confirms this cause; detailed
logs remain inaccessible under the connected account's team permissions.
Next.js and eslint-config-next are now pinned to 15.5.27, with the lockfile
updated. Verify the replacement deployment before treating this as a working
hosted preview. A local build is not a successful deployment or live API check.
The earlier 15.5.27 route-generation failure is resolved by moving App Router
files from src/app/ to app/ and using alias imports for shared server modules.

## Masterplan implementation block

Run `npm run smoke` after building. It starts the production server on loopback
with RapidAPI/OpenAI credentials removed and checks the page plus ten HTTP API
cases. This is a configuration/error-handling check, not a live supplier test.
GitHub Actions now runs tests, TypeScript, lint, build and this smoke check.
See docs/MASTERPLAN.md, docs/IMPLEMENTATION_STATUS.md and
 docs/PROVIDER_INVENTORY.md for task status and access requirements.
The legacy flights-booking and search-flights paths share the same validated
search adapter as /api/flights. flights-booking creates no order or payment.

## Browser checks and dependency hygiene

After npm ci and npm run build, run npx playwright install chromium and
npm run e2e. GitHub Actions installs Chromium with system dependencies and runs
desktop/mobile checks. No provider credentials or live supplier calls are used.
The local browser archive download failed, so local browser success is not claimed.
Production dependency audit is included in CI. Narrow overrides patch Next.js's
PostCSS and typography's selector parser; inspect their compatibility on upgrades.
All provider contracts and operational/legal release gates remain open.
