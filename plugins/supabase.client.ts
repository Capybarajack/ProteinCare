import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin({
  name: 'supabase',
  setup() {
    const config = useRuntimeConfig()

    const supabaseUrl = String(config.public.supabaseUrl || '')
    const supabaseKey = String(config.public.supabasePublishableKey || '')

    if (!supabaseUrl || !supabaseKey) {
      // eslint-disable-next-line no-console
      console.warn('[supabase] Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY')
    }

    // SPA (ssr:false): use localStorage-based auth storage.
    // PKCE verifier must persist across the OAuth redirect.
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })

    return { provide: { supabase } }
  },
})
