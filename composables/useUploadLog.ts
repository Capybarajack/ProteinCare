import type { UploadSession } from './useUploadSession'

export type UploadLogItem = UploadSession & {
  id: string
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
    logs.value = Array.isArray(parsed) ? parsed : []
  }

  const persist = () => {
    if (process.server) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.value))
  }

  const add = (session: UploadSession) => {
    const item: UploadLogItem = {
      ...session,
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
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
