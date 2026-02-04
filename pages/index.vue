<script setup lang="ts">
import { computed } from 'vue'
import { useUploadSession } from '~/composables/useUploadSession'

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
    title: '上傳餐點照片',
    desc: '從相簿選擇或拖曳上傳，先預覽確認。',
  },
  {
    icon: 'auto_awesome',
    title: '一鍵 AI 分析',
    desc: '自動跳轉到 Analysis 並開始分析（有 token 成本提示）。',
  },
  {
    icon: 'history',
    title: '保存到紀錄',
    desc: '存到 Dashboard，之後可快速回顧。',
  },
]

useHead({ title: 'ProtainCare' })

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
        <NuxtLink to="/" class="pc-brand" aria-label="ProtainCare Home">
          <div class="pc-brand-mark" aria-hidden="true">
            <span class="material-symbols-outlined">health_and_safety</span>
          </div>
          <div>
            <div class="pc-brand-title">ProtainCare</div>
            <div class="pc-brand-sub">時尚手機介面 · 純前端</div>
          </div>
        </NuxtLink>

        <div style="display:flex; gap:10px">
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
          先拍一張
          <br />
          再交給 AI
        </h1>

        <p class="pc-muted" style="margin: 0; font-weight: 650; line-height: 1.45">
          用「手機 App」的方式把上傳、分析、紀錄串起來。
          <br />
          不走 Bootstrap 風，整體保持乾淨、俐落、帶一點科技感。
        </p>

        <div class="pc-grid2" style="margin-top: 16px">
          <NuxtLink to="/upload" class="pc-btn pc-btn--primary">
            <span class="material-symbols-outlined">cloud_upload</span>
            立即上傳
          </NuxtLink>
          <NuxtLink to="/dashboard" class="pc-btn pc-btn--ghost">
            <span class="material-symbols-outlined">dashboard</span>
            查看紀錄
          </NuxtLink>
        </div>

        <section class="pc-card pc-card-pad" style="margin-top: 16px">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 12px">
            <div style="min-width:0">
              <div style="font-weight: 950; letter-spacing: -0.03em; font-size: 16px">最近一次上傳</div>
              <div class="pc-muted" style="font-size: 12px; font-weight: 750; margin-top: 4px">
                你可以從這裡直接繼續分析，不用再找入口。
              </div>
            </div>
            <div class="pc-pill" style="letter-spacing: 0.12em">READY</div>
          </div>

          <div v-if="session" style="margin-top: 12px; display:flex; gap: 12px; align-items: center">
            <div
              style="width: 74px; height: 74px; border-radius: 20px; overflow:hidden; border: 1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.8)"
              aria-label="Last upload thumbnail"
            >
              <img :src="session.imageDataUrl" alt="Last uploaded" style="width:100%; height:100%; object-fit: cover; display:block" />
            </div>

            <div style="flex:1; min-width:0">
              <div style="font-weight: 950; letter-spacing:-0.02em; white-space: nowrap; overflow:hidden; text-overflow: ellipsis">
                {{ lastUploadMeta?.fileName }}
              </div>
              <div class="pc-muted" style="font-size: 12px; font-weight: 800; margin-top: 4px">
                {{ lastUploadMeta?.sizeText }} · {{ session.mimeType }}
              </div>
            </div>
          </div>

          <div v-else style="margin-top: 12px; display:flex; gap: 12px; align-items:flex-start">
            <div
              style="width: 46px; height: 46px; border-radius: 16px; display:grid; place-items:center; background: rgba(var(--accent-warm-rgb), 0.12); border: 1px solid rgba(var(--accent-warm-rgb), 0.18)"
              aria-hidden="true"
            >
              <span class="material-symbols-outlined" style="color: rgba(var(--accent-warm-rgb), 0.95)">info</span>
            </div>
            <div>
              <div style="font-weight: 950; letter-spacing:-0.02em">尚未上傳圖片</div>
              <div class="pc-muted" style="font-size: 13px; font-weight: 650; margin-top: 4px">
                先去 Upload 選一張照片，就能一鍵開始 AI 分析。
              </div>
            </div>
          </div>

          <div style="margin-top: 14px" :style="!session ? 'opacity:0.55' : ''">
            <div class="pc-grid2">
              <NuxtLink
                :to="session ? '/analysis?autostart=1' : '/upload'"
                class="pc-btn pc-btn--primary"
              >
                <span class="material-symbols-outlined">auto_awesome</span>
                {{ session ? '繼續 AI 分析' : '去上傳' }}
              </NuxtLink>
              <NuxtLink to="/dashboard" class="pc-btn pc-btn--ghost">
                <span class="material-symbols-outlined">history</span>
                查看紀錄
              </NuxtLink>
            </div>
          </div>
        </section>
      </section>

      <section style="margin-top: 16px">
        <div style="display:flex; align-items:flex-end; justify-content:space-between; padding: 0 4px 10px">
          <div>
            <div style="font-weight: 950; letter-spacing:-0.03em; font-size: 18px">流程</div>
            <div class="pc-muted" style="font-size: 12px; font-weight: 800">三步完成</div>
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
