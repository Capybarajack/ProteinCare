<template>
  <div>
    <TopNav />

    <div class="container py-4">
      <header class="mb-3">
        <h1 class="h4 mb-1 title">Dashboard</h1>
        <p class="text-muted mb-0">Saved uploads (localStorage only).</p>
      </header>

      <div class="d-flex align-items-center justify-content-between mb-3">
        <div class="text-muted small">{{ logs.length }} item(s)</div>
        <div class="d-flex" style="gap: 8px">
          <NuxtLink to="/upload" class="btn btn-sm btn-primary">New upload</NuxtLink>
          <button class="btn btn-sm btn-outline-danger" type="button" @click="clearAll" :disabled="!logs.length">
            Clear all
          </button>
        </div>
      </div>

      <div v-if="!logs.length" class="alert alert-info" role="alert">
        No saved uploads yet. Go to <NuxtLink to="/upload">Upload</NuxtLink>.
      </div>

      <div v-else class="row">
        <div v-for="item in logs" :key="item.id" class="col-12 col-md-6 mb-3">
          <div class="card shadow-sm border-0">
            <div class="card-body">
              <div class="small text-muted mb-2">
                <span class="font-weight-bold text-dark">{{ item.fileName }}</span>
                <span class="mx-2">•</span>
                <span>{{ (item.fileSize / (1024 * 1024)).toFixed(2) }} MB</span>
              </div>
              <div class="preview-frame preview-frame--tight">
                <img :src="item.imageDataUrl" :alt="item.fileName" />
              </div>
              <div class="mt-2 small text-muted">
                {{ new Date(item.createdAt).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="mt-4 text-center text-muted small">
        Storage key: <code>protaincare_upload_logs</code>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TopNav from '~/components/TopNav.vue'
import { useUploadLog } from '~/composables/useUploadLog'

const { logs, load, clear } = useUploadLog()

function clearAll() {
  const ok = confirm('Clear all saved uploads?')
  if (!ok) return
  clear()
}

onMounted(() => {
  load()
})
</script>
