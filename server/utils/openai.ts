import { useRuntimeConfig } from '#imports'

let cachedKey: string | null = null

export async function getOpenAIApiKey(): Promise<string> {
  if (cachedKey) return cachedKey

  // Server-only: use runtimeConfig / env var.
  // Do NOT read secrets from assets/ (risk of accidental bundling/exposure).
  const config = useRuntimeConfig()
  const key = String(config.openaiApiKey || process.env.OPENAI_API_KEY || '').trim()

  if (!key) {
    throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY (runtimeConfig.openaiApiKey).')
  }

  cachedKey = key
  return key
}
