<script setup lang="ts">
import { computed } from 'vue'
import { useUploadSession } from '~/composables/useUploadSession'

const supabase = useSupabase()
const user = useAuthUser()

async function signOut() {
  await supabase.auth.signOut()
}

const route = useRoute()

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/upload', icon: 'cloud_upload', label: 'Upload' },
  { to: '/analysis', icon: 'analytics', label: 'Analysis' },
  { to: '/dashboard', icon: 'dashboard', label: 'Log' },
]

const steps = [
  {
    icon: 'photo_camera',
    title: 'Upload a meal photo',
    desc: 'Pick from your library or drag & drop. Preview before saving.',
  },
  {
    icon: 'auto_awesome',
    title: 'AI nutrition breakdown',
    desc: 'Jump to Analysis and extract protein + supporting macros (tokens apply).',
  },
  {
    icon: 'history',
    title: 'Save & review',
    desc: 'Store it in your log so you can track your protein consistency over time.',
  },
]

useHead({ title: 'ProteinCare' })

const session = useUploadSession()

const lastUploadMeta = computed(() => {
  if (!session.value) return null
  const sizeMb = (session.value.fileSize / (1024 * 1024)).toFixed(2)
  return {
    fileName: session.value.fileName,
    sizeText: `${sizeMb} MB`,
  }
})
</script>

<template>
  <div class="pc-frame">
    <header class="pc-topbar">
      <div class="pc-topbar-row">
        <NuxtLink to="/" class="pc-brand" aria-label="ProteinCare Home">
          <div class="pc-brand-mark" aria-hidden="true">
            <span class="material-symbols-outlined">health_and_safety</span>
          </div>
          <div>
            <div class="pc-brand-title">ProteinCare</div>
            <div class="pc-brand-sub">Protein-first tracking · Health-focused</div>
          </div>
        </NuxtLink>

        <div style="display:flex; gap:10px">
          <NuxtLink v-if="!user" to="/login" class="pc-iconbtn" aria-label="Login">
            <span class="material-symbols-outlined">login</span>
          </NuxtLink>
          <button v-else class="pc-iconbtn" type="button" aria-label="Sign out" @click="signOut">
            <span class="material-symbols-outlined">logout</span>
          </button>

          <NuxtLink to="/dashboard" class="pc-iconbtn" aria-label="Open dashboard">
            <span class="material-symbols-outlined">history</span>
          </NuxtLink>
          <NuxtLink to="/upload" class="pc-iconbtn" aria-label="Upload">
            <span class="material-symbols-outlined">add_a_photo</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="pc-main">
      <section class="pc-hero pc-hero--playful">
        <div class="pc-sparkles" aria-hidden="true" />

        <div class="pc-pill">
          <span class="material-symbols-outlined" style="font-size:16px">verified</span>
          QUICK FLOW
        </div>

        <h1 class="pc-h1">
          Snap a meal
          <br />
          hit your protein
        </h1>

        <p class="pc-muted" style="margin: 0; font-weight: 650; line-height: 1.45">
          ProteinCare turns photos into a protein-focused log—simple, fast, and consistent.
          <br />
          Built for protein intake and lightweight health management.
        </p>

        <div class="pc-grid2" style="margin-top: 16px">
          <NuxtLink to="/upload" class="pc-btn pc-btn--primary">
            <span class="material-symbols-outlined">cloud_upload</span>
            Upload now
          </NuxtLink>
          <NuxtLink to="/dashboard" class="pc-btn pc-btn--ghost">
            <span class="material-symbols-outlined">dashboard</span>
            View your log
          </NuxtLink>
        </div>

      </section>

      <section style="margin-top: 16px">
        <div style="display:flex; align-items:flex-end; justify-content:space-between; padding: 0 4px 10px">
          <div>
            <div style="font-weight: 950; letter-spacing:-0.03em; font-size: 18px">Workflow</div>
            <div class="pc-muted" style="font-size: 12px; font-weight: 800">3 steps to log protein</div>
          </div>
          <span class="pc-muted" style="font-size: 11px; font-weight: 900; letter-spacing: 0.08em">MOBILE</span>
        </div>

        <div style="display:grid; gap: 10px">
          <div v-for="(s, idx) in steps" :key="idx" class="pc-card pc-card-pad">
            <div style="display:flex; gap: 12px; align-items:flex-start">
              <div
                style="width: 46px; height: 46px; border-radius: 16px; display:grid; place-items:center;
                  background: rgba(var(--accent-rgb), 0.12);
                  border: 1px solid rgba(var(--accent-rgb), 0.16);
                  color: rgba(var(--accent-dark-rgb), 0.95)"
                aria-hidden="true"
              >
                <span class="material-symbols-outlined">{{ s.icon }}</span>
              </div>
              <div style="flex:1; min-width:0">
                <div style="font-weight: 950; letter-spacing: -0.02em">{{ s.title }}</div>
                <div class="pc-muted" style="font-size: 13px; font-weight: 650; margin-top: 4px; line-height: 1.45">
                  {{ s.desc }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="pc-muted" style="margin-top: 18px; text-align:center; font-size: 11px; font-weight: 800">
        Pure frontend · No upload to server
      </footer>
    </main>

    <nav class="pc-bottombar" aria-label="Bottom navigation">
      <div class="pc-nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="['pc-nav-item', { 'is-active': route.path === item.to }]"
        >
          <span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
          <div class="pc-nav-label">{{ item.label }}</div>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
