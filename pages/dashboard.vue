<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useUploadLog } from '~/composables/useUploadLog'

const route = useRoute()

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/upload', icon: 'cloud_upload', label: 'Upload' },
  { to: '/analysis', icon: 'analytics', label: 'Analysis' },
  { to: '/dashboard', icon: 'dashboard', label: 'Log' },
]

definePageMeta({ middleware: 'require-auth' })

useHead({ title: 'Dashboard' })

const { logs, load, clear } = useUploadLog()

function sizeMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function clearAll() {
  const ok = confirm('Clear all saved uploads?')
  if (!ok) return
  clear()
}

onMounted(() => {
  load()
})

watch(
  () => route.fullPath,
  () => {
    load()
  }
)
</script>

<template>
  <div class="pc-frame">
    <header class="pc-topbar">
      <div class="pc-topbar-row">
        <button class="pc-iconbtn" type="button" @click="navigateTo('/')" aria-label="Back">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>

        <div style="text-align:center; flex:1">
          <div style="font-weight: 950; letter-spacing: -0.02em">Dashboard</div>
          <div class="pc-muted" style="font-size: 11px; font-weight: 750">Saved uploads · localStorage only</div>
        </div>

        <div style="display:flex; gap: 10px">
          <NuxtLink to="/upload" class="pc-iconbtn" aria-label="New upload">
            <span class="material-symbols-outlined">add_a_photo</span>
          </NuxtLink>
          <button
            class="pc-iconbtn"
            type="button"
            aria-label="Clear all"
            @click="clearAll"
            :disabled="!logs.length"
            :style="!logs.length ? 'opacity:0.4; pointer-events:none' : ''"
          >
            <span class="material-symbols-outlined">delete_sweep</span>
          </button>
        </div>
      </div>
    </header>

    <main class="pc-main">
      <div style="display:flex; align-items:flex-end; justify-content:space-between; padding: 0 4px 10px">
        <div>
          <div style="font-weight: 950; letter-spacing:-0.03em; font-size: 18px">紀錄</div>
          <div class="pc-muted" style="font-size: 12px; font-weight: 750">{{ logs.length }} item(s)</div>
        </div>

        <button
          class="pc-btn"
          style="height: 42px; border-radius: 16px; padding: 0 14px"
          type="button"
          @click="clearAll"
          :disabled="!logs.length"
          :style="!logs.length ? 'opacity:0.4; pointer-events:none' : ''"
        >
          <span class="material-symbols-outlined" style="font-size: 18px">delete</span>
          清空
        </button>
      </div>

      <div v-if="!logs.length" class="pc-card pc-card-pad">
        <div style="display:flex; gap: 12px; align-items:flex-start">
          <div
            style="width: 46px; height: 46px; border-radius: 16px; display:grid; place-items:center; background: rgba(134,163,143,0.12); border: 1px solid rgba(134,163,143,0.16); color: rgba(108,138,118,0.95)"
            aria-hidden="true"
          >
            <span class="material-symbols-outlined">history</span>
          </div>
          <div style="flex:1">
            <div style="font-weight: 950; letter-spacing: -0.02em">尚無保存紀錄</div>
            <div class="pc-muted" style="font-size: 13px; font-weight: 650; margin-top: 6px; line-height: 1.4">
              去 Upload 上傳一張照片，然後在 Analysis 點「Save to Dashboard」。
            </div>
            <div style="margin-top: 12px">
              <NuxtLink to="/upload" class="pc-btn pc-btn--primary" style="height: 48px; border-radius: 18px">
                <span class="material-symbols-outlined">cloud_upload</span>
                前往 Upload
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else style="display:grid; gap: 12px">
        <section v-for="item in logs" :key="item.id" class="pc-card pc-card-pad">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 10px">
            <div style="min-width: 0">
              <div
                style="font-weight: 950; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
              >
                {{ item.fileName }}
              </div>
              <div class="pc-muted" style="font-size: 12px; font-weight: 750; margin-top: 2px">
                {{ sizeMb(item.fileSize) }}
                <span style="margin: 0 8px; opacity: 0.6">•</span>
                {{ new Date(item.createdAt).toLocaleString() }}
              </div>
            </div>
          </div>

          <div class="preview-frame preview-frame--tight" style="margin-top: 12px">
            <img :src="item.imageDataUrl" :alt="item.fileName" />
          </div>
        </section>

        <footer class="pc-muted" style="text-align:center; font-size: 11px; font-weight: 750; margin-top: 4px">
          Storage key: <code>protaincare_upload_logs</code>
        </footer>
      </div>
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
