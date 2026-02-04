<script setup lang="ts">
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
      <section class="pc-hero">
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

        <div class="pc-card" style="margin-top: 16px; overflow:hidden">
          <div
            style="height: 170px; position: relative; background:
              radial-gradient(900px 260px at 12% 18%, rgba(var(--accent-rgb), 0.32), transparent 58%),
              radial-gradient(700px 240px at 100% 40%, rgba(var(--accent-dark-rgb), 0.22), transparent 60%),
              linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.00));"
            aria-hidden="true"
          >
            <div style="position:absolute; inset:0; display:flex; align-items:flex-end; justify-content:space-between; padding: 16px">
              <div>
                <div style="font-weight: 950; letter-spacing: -0.03em; font-size: 18px">One-tap Analysis</div>
                <div class="pc-muted" style="font-size: 12px; font-weight: 800">Upload → Analysis(autostart) → Log</div>
              </div>
              <div
                style="width: 56px; height: 56px; border-radius: 20px; background: rgba(255,255,255,0.76); border: 1px solid rgba(18,24,20,0.08); display:grid; place-items:center"
              >
                <span class="material-symbols-outlined" style="color: var(--accent-dark); font-size: 26px">auto_awesome</span>
              </div>
            </div>
          </div>
        </div>
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
