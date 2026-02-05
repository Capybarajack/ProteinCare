<script setup lang="ts">
import { ref, onMounted } from 'vue'

useHead({ title: 'Auth Callback' })

const supabase = useSupabase()
const error = ref('')

onMounted(async () => {
  try {
    // Completes the PKCE code exchange and stores the session.
    // supabase-js v2: getSessionFromUrl exists in @supabase/gotrue-js.
    // If your installed version doesn't have it, tell me and I'll adapt.
    // @ts-ignore
    const { data, error: e } = await supabase.auth.getSessionFromUrl({ storeSession: true })
    if (e) throw e

    // If we got a session, route to next (or home)
    const route = useRoute()
    const next = String(route.query.next || '')
    const nextPath = next && next.startsWith('/') ? next : '/'

    if (!data?.session) {
      // Sometimes providers redirect without session if user canceled.
      throw new Error('No session returned from OAuth callback')
    }

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
