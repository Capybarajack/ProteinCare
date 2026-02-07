type LoginPromptState = {
  open: boolean
  nextPath: string
}

function ymdLocal(d = new Date()): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function useLoginPromptOnce() {
  const user = useAuthUser()

  const state = useState<LoginPromptState>('pc-login-prompt', () => ({
    open: false,
    nextPath: '/',
  }))

  function close() {
    state.value.open = false
  }

  async function goLogin() {
    const next = encodeURIComponent(state.value.nextPath || '/')
    close()
    await navigateTo(`/login?next=${next}`)
  }

  /**
   * Returns true if caller may proceed.
   * If user not logged in: shows prompt (only once/day). Subsequent attempts will redirect to login.
   */
  async function ensureAuthedOrPrompt(nextPath: string): Promise<boolean> {
    if (user.value) return true

    if (process.client) {
      const key = 'pc_login_prompt_last_ymd'
      const today = ymdLocal()
      const last = localStorage.getItem(key)

      if (last === today) {
        await navigateTo(`/login?next=${encodeURIComponent(nextPath)}`)
        return false
      }

      localStorage.setItem(key, today)
    }

    state.value.nextPath = nextPath
    state.value.open = true
    return false
  }

  return {
    state,
    close,
    goLogin,
    ensureAuthedOrPrompt,
  }
}
