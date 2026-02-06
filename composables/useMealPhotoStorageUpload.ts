import { useSupabase } from '~/composables/useSupabase'

const DEFAULT_BUCKET = 'meal-photos'

function extFromMime(mime: string) {
  const m = (mime || '').toLowerCase()
  if (m === 'image/jpeg') return 'jpg'
  if (m === 'image/png') return 'png'
  if (m === 'image/webp') return 'webp'
  if (m === 'image/gif') return 'gif'
  if (m === 'image/heic') return 'heic'
  if (m === 'image/heif') return 'heif'
  return ''
}

function safeRandomId() {
  // Prefer crypto.randomUUID() in modern browsers.
  // Fallback keeps it simple and unique enough for file paths.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis.crypto
  if (c?.randomUUID) return c.randomUUID() as string
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function useMealPhotoStorageUpload() {
  const supabase = useSupabase()

  async function uploadMealPhoto(file: File, opts?: { bucket?: string }) {
    const bucket = opts?.bucket || DEFAULT_BUCKET

    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr) throw userErr
    const user = userRes.user
    if (!user) throw new Error('Not authenticated')

    const name = file.name || ''
    const fromName = name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''
    const ext = fromName || extFromMime(file.type) || 'jpg'

    const path = `${user.id}/${safeRandomId()}.${ext}`

    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    })

    if (uploadErr) throw uploadErr

    return { bucket, path }
  }

  return { uploadMealPhoto }
}
