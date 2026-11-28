// Duffel (flights) and Nuitée/LiteAPI (hotels) are approved by the operator for the
// sandbox/test environment only (2026-11-28). Live keys stay off until explicitly released:
// a non-test key is ignored, so it can never create real bookings or costs by accident.
type Env = Record<string, string | undefined>

export function duffelTestToken(env: Env = process.env): string | null {
  const token = env.DUFFEL_ACCESS_TOKEN?.trim()
  return token && token.startsWith('duffel_test_') ? token : null
}

export function liteApiSandboxKey(env: Env = process.env): string | null {
  const key = env.LITEAPI_KEY?.trim()
  return key && key.startsWith('sand_') ? key : null
}
