export interface ProviderFailure {
  status: number
  code: 'PROVIDER_ACCESS_UNAVAILABLE' | 'PROVIDER_RATE_LIMITED' | 'PROVIDER_TIMEOUT' | 'PROVIDER_INVALID_RESPONSE'
  message: string
}

// Never forward upstream bodies, request headers or credentials to the browser/logs.
export function providerFailure(error: unknown, label: 'Flug' | 'Hotel'): ProviderFailure {
  const value = error && typeof error === 'object' ? error as { code?: unknown; response?: { status?: unknown } } : {}
  const status = value.response?.status
  if (status === 401 || status === 403) return { status: 503, code: 'PROVIDER_ACCESS_UNAVAILABLE', message: `Die ${label === 'Flug' ? 'Flug' : 'Hotel'}suche ist aktuell nicht verfügbar. Bitte später erneut versuchen.` }
  if (status === 429) return { status: 429, code: 'PROVIDER_RATE_LIMITED', message: 'Der Suchanbieter hat sein Anfragelimit erreicht. Bitte später erneut versuchen.' }
  if (value.code === 'ECONNABORTED' || value.code === 'ETIMEDOUT') return { status: 504, code: 'PROVIDER_TIMEOUT', message: 'Der Suchanbieter antwortet zu langsam. Bitte erneut versuchen.' }
  return { status: 502, code: 'PROVIDER_INVALID_RESPONSE', message: `Der ${label}anbieter hat keine gültige Antwort geliefert. Bitte später erneut versuchen.` }
}

export function aiInputFailure(error: unknown): { status: number; code: string; message: string } {
  const value = error && typeof error === 'object' ? error as { status?: unknown; code?: unknown } : {}
  if (value.status === 429 && (value.code === 'insufficient_quota' || value.code === 'credit_balance_exhausted')) return { status: 503, code: 'AI_QUOTA_UNAVAILABLE', message: 'Die KI ist aktuell nicht verfügbar. Bitte die Felder direkt ausfüllen.' }
  if (value.status === 429) return { status: 429, code: 'AI_RATE_LIMITED', message: 'Die KI ist gerade ausgelastet. Bitte die Felder direkt ausfüllen oder später erneut versuchen.' }
  return { status: 502, code: 'AI_INVALID_RESPONSE', message: 'Die KI hat keine gültigen Reiseangaben geliefert. Bitte die Felder direkt ausfüllen.' }
}
