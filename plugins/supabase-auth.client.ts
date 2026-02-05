export default defineNuxtPlugin({
  name: 'supabase-auth',
  dependsOn: ['supabase'],
  async setup() {
    const { $supabase } = useNuxtApp()
    const sessionState = useAuthSession()
    const userState = useAuthUser()

    if (!$supabase?.auth) {
      // eslint-disable-next-line no-console
      console.warn('[supabase-auth] Missing $supabase client; auth state will not initialize')
      return
    }

    // Initial session (restored from storage if present)
    const { data } = await $supabase.auth.getSession()
    sessionState.value = data.session
    userState.value = data.session?.user ?? null

    // Keep state in sync
    $supabase.auth.onAuthStateChange((_event, session) => {
      sessionState.value = session
      userState.value = session?.user ?? null
    })
  },
})
