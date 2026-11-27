// Best-effort abuse and cost protection for paid upstream APIs (OpenAI, RapidAPI).
// State lives in the memory of one serverless instance: it slows down a single abusive
// client and caps spend per instance, but it is not a global quota. A shared store
// (e.g. Vercel KV / Upstash) is needed before a large public launch.

export type RateLimitScope = 'ai' | 'provider'

interface Window { count: number; resetAt: number }

const WINDOW_MS = 10 * 60 * 1000
const LIMITS: Record<RateLimitScope, { perClient: number; perInstance: number }> = {
  // One search can trigger parse-trip + up to two city corrections + one ranking call.
  ai: { perClient: 40, perInstance: 400 },
  // One search triggers at most one flight and two hotel provider requests.
  provider: { perClient: 30, perInstance: 300 },
}
const MAX_TRACKED_CLIENTS = 5000

const clients = new Map<string, Window>()
const instance = new Map<RateLimitScope, Window>()

function hit(store: Map<string, Window>, key: string, limit: number, now: number): boolean {
  const current = store.get(key)
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (current.count >= limit) return false
  current.count += 1
  return true
}

function prune(now: number) {
  if (clients.size < MAX_TRACKED_CLIENTS) return
  for (const [key, value] of clients) if (value.resetAt <= now) clients.delete(key)
  // Still full: drop the oldest entries instead of growing without bound.
  for (const key of clients.keys()) {
    if (clients.size < MAX_TRACKED_CLIENTS) break
    clients.delete(key)
  }
}

/** Returns the client identifier from proxy headers, as set by Vercel. */
export function clientKey(forwardedFor: string | string[] | null | undefined, realIp?: string | string[] | null): string {
  const pick = (value: string | string[] | null | undefined) => (Array.isArray(value) ? value[0] : value) ?? ''
  const first = pick(forwardedFor).split(',')[0]?.trim()
  return first || pick(realIp).trim() || 'unknown'
}

/** Client key for a Pages API request (NextApiRequest). */
export function pagesClient(req: { headers?: Record<string, string | string[] | undefined> }): string {
  return clientKey(req.headers?.['x-forwarded-for'], req.headers?.['x-real-ip'])
}

/** Client key for an App Router request (NextRequest). */
export function routeClient(req: { headers?: Pick<Headers, 'get'> }): string {
  return clientKey(req.headers?.get('x-forwarded-for'), req.headers?.get('x-real-ip'))
}

/** true when the request may proceed. */
export function allowRequest(scope: RateLimitScope, client: string, now = Date.now()): boolean {
  prune(now)
  const limits = LIMITS[scope]
  const instanceWindow = instance.get(scope)
  if (instanceWindow && instanceWindow.resetAt > now && instanceWindow.count >= limits.perInstance) return false
  if (!hit(clients, `${scope}:${client}`, limits.perClient, now)) return false
  if (!instanceWindow || instanceWindow.resetAt <= now) instance.set(scope, { count: 1, resetAt: now + WINDOW_MS })
  else instanceWindow.count += 1
  return true
}

export const RATE_LIMIT_MESSAGE = 'Zu viele Anfragen in kurzer Zeit. Bitte in einigen Minuten erneut versuchen.'

/** Test helper. */
export function resetRateLimits() {
  clients.clear()
  instance.clear()
}
