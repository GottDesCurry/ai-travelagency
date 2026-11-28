// Which features are switched on in this deployment. Only checks whether a key is set;
// it never calls a paid provider and never exposes key values.
export interface ServiceStatus { search: boolean; ai: boolean }

const configured = (value: string | undefined) => typeof value === 'string' && value.trim().length > 0

export function serviceStatus(env: Record<string, string | undefined> = process.env): ServiceStatus {
  return { search: configured(env.RAPIDAPI_KEY), ai: configured(env.OPENAI_API_KEY) }
}

export function isServiceStatus(value: unknown): value is ServiceStatus {
  return !!value && typeof value === 'object' && 'search' in value && typeof value.search === 'boolean' && 'ai' in value && typeof value.ai === 'boolean'
}
