<template>
  <div>
    <TopNav />

    <div class="container py-4">
      <header class="mb-3">
        <h1 class="h4 mb-1 title">Upload</h1>
        <p class="text-muted mb-0">Choose an image, preview it, then go to Analysis.</p>
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
                <div class="text-muted small">or click to choose a file (image/*)</div>
                <div class="text-muted small">Max size: {{ maxSizeMb }}MB</div>
              </div>
            </div>

            <input ref="fileInput" class="d-none" type="file" accept="image/*" @change="onFilePicked" />
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
              <div class="d-flex" style="gap: 8px">
                <button class="btn btn-sm btn-outline-secondary" type="button" @click="clear">Clear</button>
                <NuxtLink to="/analysis" class="btn btn-sm btn-primary" @click.native="noop">
                  Continue
                </NuxtLink>
              </div>
            </div>

            <div class="preview-frame preview-frame--tight">
              <img :src="previewUrl" alt="Preview" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, computed } from 'vue'
import TopNav from '~/components/TopNav.vue'
import { useUploadSession } from '~/composables/useUploadSession'

const session = useUploadSession()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const error = ref('')

const previewUrl = ref('')
const fileName = ref('')
const fileSizeBytes = ref(0)

const MAX_SIZE_BYTES = 10 * 1024 * 1024
const maxSizeMb = 10

const fileSizeText = computed(() => {
  if (!fileSizeBytes.value) return ''
  return `${(fileSizeBytes.value / (1024 * 1024)).toFixed(2)} MB`
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
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}

function clear() {
  revokePreview()
  fileName.value = ''
  fileSizeBytes.value = 0
  clearError()
  if (fileInput.value) fileInput.value.value = ''
  session.value = null
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

async function validateAndStore(file: File) {
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

  const dataUrl = await fileToDataUrl(file)
  session.value = {
    imageDataUrl: dataUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    createdAt: Date.now(),
  }
}

async function onFilePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await validateAndStore(file)
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

async function onDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  await validateAndStore(file)
}

function noop() {}

onBeforeUnmount(() => {
  revokePreview()
})
</script>
