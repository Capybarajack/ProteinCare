import { createBrowserClient } from '@supabase/ssr'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl = String(config.public.supabaseUrl || '')
  const supabaseKey = String(config.public.supabasePublishableKey || '')

  if (!supabaseUrl || !supabaseKey) {
    // Fail loudly in dev; in prod you should set env vars.
    // eslint-disable-next-line no-console
    console.warn('[supabase] Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY')
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseKey)

  return { provide: { supabase } }
})
