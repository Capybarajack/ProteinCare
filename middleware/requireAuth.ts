export default defineNuxtRouteMiddleware(async (to) => {
  // Allow auth routes
  if (to.path.startsWith('/auth') || to.path === '/login') return

  const user = useAuthUser()

  // If auth state isn't ready yet, give it a tick (supabase-auth plugin runs on client)
  if (process.client && user.value === null) {
    // no-op; fall through
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
