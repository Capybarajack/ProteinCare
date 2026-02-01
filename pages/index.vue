<template>
  <div class="container py-5">
    <header class="mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h1 class="h3 mb-1 title">ProtainCare</h1>
          <p class="text-muted mb-0">MVP · Image upload & preview</p>
        </div>
        <span class="material-symbols-outlined brand-icon" aria-hidden="true">health_and_safety</span>
      </div>
    </header>

    <section class="card shadow-sm border-0">
      <div class="card-body">
        <div
          class="dropzone"
          :class="{ 'is-dragover': isDragOver }"
          @dragenter.prevent="onDragEnter"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          role="button"
          tabindex="0"
          @click="openFilePicker"
          @keydown.enter="openFilePicker"
        >
          <div class="dropzone-inner">
            <div class="dropzone-icon-wrap">
              <span class="material-symbols-outlined dropzone-icon" aria-hidden="true">cloud_upload</span>
            </div>
            <div class="text-center">
              <div class="font-weight-bold">Drag & drop an image here</div>
              <div class="text-muted small">or click to choose a file (JPG/PNG/WebP/GIF)</div>
              <div class="text-muted small">Max size: {{ maxSizeMb }}MB</div>
            </div>
          </div>

          <input
            ref="fileInput"
            class="d-none"
            type="file"
            accept="image/*"
            @change="onFilePicked"
          />
        </div>

        <div v-if="error" class="alert alert-danger mt-3 mb-0" role="alert">
          {{ error }}
        </div>

        <div v-if="previewUrl" class="preview mt-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="small text-muted">
              <span class="font-weight-bold text-dark">{{ fileName }}</span>
              <span class="mx-2">•</span>
              <span>{{ fileSizeText }}</span>
            </div>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="clear">
              Clear
            </button>
          </div>

          <div class="preview-frame">
            <img :src="previewUrl" alt="Preview" />
          </div>
        </div>
      </div>
    </section>

    <footer class="mt-4 text-center text-muted small">
      Pure frontend. No upload to server.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, computed } from 'vue'

const fileInput = ref<HTMLInputElement | null>(null)

const isDragOver = ref(false)
const error = ref<string>('')

const previewUrl = ref<string>('')
const fileName = ref<string>('')
const fileSizeBytes = ref<number>(0)

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const maxSizeMb = 10

const fileSizeText = computed(() => {
  if (!fileSizeBytes.value) return ''
  const mb = fileSizeBytes.value / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
})

function openFilePicker() {
  fileInput.value?.click()
}

function setError(msg: string) {
  error.value = msg
}

function clearError() {
  error.value = ''
}

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = ''
}

function clear() {
  revokePreview()
  fileName.value = ''
  fileSizeBytes.value = 0
  clearError()
  // reset file input so same file can be selected again
  if (fileInput.value) fileInput.value.value = ''
}

function validateAndPreview(file: File) {
  clearError()

  if (!file.type || !file.type.startsWith('image/')) {
    setError('Please select an image file (image/*).')
    return
  }

  if (file.size > MAX_SIZE_BYTES) {
    setError(`File is too large. Max size is ${maxSizeMb}MB.`)
    return
  }

  revokePreview()
  previewUrl.value = URL.createObjectURL(file)
  fileName.value = file.name
  fileSizeBytes.value = file.size
}

function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  validateAndPreview(file)
}

function onDragEnter() {
  isDragOver.value = true
}

function onDragOver() {
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  validateAndPreview(file)
}

onBeforeUnmount(() => {
  revokePreview()
})
</script>
