export default defineNuxtPlugin(async () => {
  const supabase = useSupabase()
  const sessionState = useAuthSession()
  const userState = useAuthUser()

  // Initial session (restored from storage if present)
  const { data } = await supabase.auth.getSession()
  sessionState.value = data.session
  userState.value = data.session?.user ?? null

  // Keep state in sync
  supabase.auth.onAuthStateChange((_event, session) => {
    sessionState.value = session
    userState.value = session?.user ?? null
  })
})
