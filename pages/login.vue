<script setup lang="ts">
import { ref, computed } from 'vue'

useHead({ title: 'Login' })

const supabase = useSupabase()
const user = useAuthUser()

const error = ref('')
const isBusy = ref(false)

const nextPath = computed(() => {
  const route = useRoute()
  const next = String(route.query.next || '')
  return next && next.startsWith('/') ? next : '/'
})

async function signInWithGoogle() {
  error.value = ''
  isBusy.value = true

  try {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath.value)}`

    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (e) throw e

    // Redirect happens automatically.
  } catch (e: any) {
    error.value = e?.message || 'Google sign-in failed'
    isBusy.value = false
  }
}

async function signOut() {
  await supabase.auth.signOut()
}
</script>

<template>
  <div class="pc-frame">
    <header class="pc-topbar">
      <div class="pc-topbar-row">
        <button class="pc-iconbtn" type="button" @click="navigateTo('/')" aria-label="Back">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>

        <div style="text-align:center; flex:1">
          <div style="font-weight: 950; letter-spacing: -0.02em">Login</div>
          <div class="pc-muted" style="font-size: 11px; font-weight: 750">Supabase · Google OAuth</div>
        </div>

        <div style="width: 40px" aria-hidden="true" />
      </div>
    </header>

    <main class="pc-main">
      <section class="pc-card pc-card-pad">
        <div style="font-weight: 950; letter-spacing: -0.02em; font-size: 18px">Sign in</div>
        <p class="pc-muted" style="margin-top: 8px; font-size: 13px; font-weight: 650; line-height: 1.45">
          使用 Google 登入後，才能把每日紀錄寫入 Supabase（RLS 會保護你的資料）。
        </p>

        <div v-if="user" class="pc-card" style="margin-top: 12px; border-radius: 18px">
          <div style="padding: 12px 14px">
            <div class="pc-muted" style="font-size: 12px; font-weight: 800">Signed in as</div>
            <div style="font-weight: 950; margin-top: 4px">{{ user.email || user.id }}</div>
            <button class="pc-btn" style="margin-top: 10px; height: 46px; border-radius: 18px" type="button" @click="signOut">
              Sign out
            </button>
          </div>
        </div>

        <div v-else style="margin-top: 14px">
          <button
            class="pc-btn pc-btn--primary"
            type="button"
            style="width: 100%"
            @click="signInWithGoogle"
            :disabled="isBusy"
            :style="isBusy ? 'opacity:0.7; pointer-events:none' : ''"
          >
            <span class="material-symbols-outlined">login</span>
            Continue with Google
          </button>
        </div>

        <div v-if="error" class="pc-card" style="margin-top: 12px; border-radius: 18px; border-color: rgba(239,68,68,0.22); background: rgba(239,68,68,0.06)">
          <div style="padding: 12px 14px; color: rgba(185,28,28,0.95); font-weight: 800; font-size: 13px">
            {{ error }}
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
