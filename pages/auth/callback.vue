<script setup lang="ts">
import { ref, onMounted } from 'vue'

useHead({ title: 'Auth Callback' })

const supabase = useSupabase()
const error = ref('')

onMounted(async () => {
  try {
    // Supabase OAuth (PKCE) returns `?code=...`.
    // supabase-js v2 uses exchangeCodeForSession.
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')

    if (!code) {
      throw new Error('Missing OAuth code in callback URL')
    }

    const { error: e } = await supabase.auth.exchangeCodeForSession(code)
    if (e) throw e

    const route = useRoute()
    const next = String(route.query.next || '')
    const nextPath = next && next.startsWith('/') ? next : '/'

    await navigateTo(nextPath)
  } catch (e: any) {
    error.value = e?.message || 'OAuth callback failed'
  }
})
</script>

<template>
  <div class="pc-frame">
    <main class="pc-main">
      <section class="pc-card pc-card-pad">
        <div style="font-weight: 950; letter-spacing:-0.02em">Signing you in…</div>
        <div v-if="error" class="pc-muted" style="margin-top: 10px; font-size: 13px; font-weight: 650">
          {{ error }}
        </div>
        <div v-if="error" style="margin-top: 12px">
          <NuxtLink to="/login" class="pc-btn pc-btn--primary" style="height: 48px; border-radius: 18px">
            Back to login
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>
