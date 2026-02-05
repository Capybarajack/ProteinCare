import type { Session, User } from '@supabase/supabase-js'

export function useAuthSession() {
  return useState<Session | null>('authSession', () => null)
}

export function useAuthUser() {
  return useState<User | null>('authUser', () => null)
}
