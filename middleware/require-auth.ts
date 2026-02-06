export default defineNuxtRouteMiddleware(async (to) => {
  // Allow auth routes
  if (to.path.startsWith('/auth') || to.path === '/login') return

  const supabase = useSupabase()
  const userState = useAuthUser()
  const sessionState = useAuthSession()

  // If we already have a user, allow immediately.
  if (userState.value) return

  // Middleware can run before the auth plugin finishes initializing.
  // Query Supabase directly to avoid false redirects ("buttons do nothing").
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[requireAuth] getSession failed', error)
  }

  sessionState.value = data.session
  userState.value = data.session?.user ?? null

  if (!userState.value) {
    const next = encodeURIComponent(to.fullPath || '/')
    return navigateTo(`/login?next=${next}`)
  }
})
