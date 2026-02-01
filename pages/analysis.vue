<template>
  <div>
    <TopNav />

    <div class="container py-4">
      <header class="mb-3">
        <h1 class="h4 mb-1 title">Analysis</h1>
        <p class="text-muted mb-0">This is a client-side placeholder analysis (no backend).</p>
      </header>

      <div v-if="!session" class="alert alert-warning" role="alert">
        No uploaded image found. Go to <NuxtLink to="/upload">Upload</NuxtLink> first.
      </div>

      <section v-else class="card shadow-sm border-0">
        <div class="card-body">
          <div class="kpi mb-3">
            <div class="kpi-card">
              <div class="kpi-label">Filename</div>
              <div class="kpi-value">{{ session.fileName }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Size</div>
              <div class="kpi-value">{{ sizeText }}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Type</div>
              <div class="kpi-value">{{ session.mimeType }}</div>
            </div>
          </div>

          <div class="preview-frame preview-frame--tight">
            <img :src="session.imageDataUrl" alt="Uploaded" />
          </div>

          <div class="mt-3 d-flex" style="gap: 10px">
            <NuxtLink to="/upload" class="btn btn-outline-secondary">Change image</NuxtLink>
            <button class="btn btn-primary" type="button" @click="saveToLog">Save to Dashboard</button>
          </div>

          <div v-if="saved" class="alert alert-success mt-3 mb-0" role="alert">
            Saved. You can view it in <NuxtLink to="/dashboard">Dashboard</NuxtLink>.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import TopNav from '~/components/TopNav.vue'
import { useUploadSession } from '~/composables/useUploadSession'
import { useUploadLog } from '~/composables/useUploadLog'

const session = useUploadSession()
const { load, add } = useUploadLog()

const saved = ref(false)

const sizeText = computed(() => {
  if (!session.value) return ''
  return `${(session.value.fileSize / (1024 * 1024)).toFixed(2)} MB`
})

function saveToLog() {
  if (!session.value) return
  add(session.value)
  saved.value = true
}

onMounted(() => {
  load()
})
</script>
