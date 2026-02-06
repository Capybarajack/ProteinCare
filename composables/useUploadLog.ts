import type { UploadSession } from './useUploadSession'

export type AiNutritionResult = {
  summary: string
  items: Array<{
    name: string
    estimated_portion: string
    calories_kcal: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }>
  total: {
    calories_kcal: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  confidence: number
  assumptions: string[]
}

export type UploadLogItem = UploadSession & {
  id: string
  aiResult: AiNutritionResult | null
  aiRaw: string | null
  dbEntryId: string | null
}

const STORAGE_KEY = 'protaincare_upload_logs'

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function useUploadLog() {
  const logs = useState<UploadLogItem[]>('uploadLogs', () => [])

  const load = () => {
    if (process.server) return
    const parsed = safeParse<UploadLogItem[]>(localStorage.getItem(STORAGE_KEY))

    logs.value = Array.isArray(parsed)
      ? parsed.map((item: any) => ({
          ...item,
          aiResult: item?.aiResult ?? null,
          aiRaw: item?.aiRaw ?? null,
          dbEntryId: item?.dbEntryId ?? null,
        }))
      : []
  }

  const persist = () => {
    if (process.server) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.value))
  }

  const add = (
    session: UploadSession,
    aiData?: {
      aiResult: AiNutritionResult | null
      aiRaw: string | null
      dbEntryId?: string | null
    }
  ) => {
    const item: UploadLogItem = {
      ...session,
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      aiResult: aiData?.aiResult ?? null,
      aiRaw: aiData?.aiRaw ?? null,
      dbEntryId: aiData?.dbEntryId ?? null,
    }
    logs.value = [item, ...logs.value]
    persist()
  }

  const clear = () => {
    logs.value = []
    persist()
  }

  return { logs, load, add, clear }
}
