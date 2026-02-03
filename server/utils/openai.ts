import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

let cachedKey: string | null = null

export async function getOpenAIApiKey(): Promise<string> {
  if (cachedKey) return cachedKey

  // Keep the key on the server only. Do NOT expose this path to clients.
  const keyPath = resolve(process.cwd(), 'assets/api/openai.txt')
  const raw = await readFile(keyPath, 'utf8')
  const key = raw.trim()

  if (!key) throw new Error('OpenAI API key is empty (assets/api/openai.txt)')
  cachedKey = key
  return key
}
