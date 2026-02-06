<script setup lang="ts">
import { onBeforeUnmount, ref, computed } from 'vue'
import { useUploadSession } from '~/composables/useUploadSession'
import { useMealPhotoStorageUpload } from '~/composables/useMealPhotoStorageUpload'

const route = useRoute()

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/upload', icon: 'cloud_upload', label: 'Upload' },
  { to: '/analysis', icon: 'analytics', label: 'Analysis' },
  { to: '/dashboard', icon: 'dashboard', label: 'Log' },
]

definePageMeta({ middleware: 'requireAuth' })

useHead({ title: 'Upload' })

const session = useUploadSession()
const { uploadMealPhoto } = useMealPhotoStorageUpload()

const isUploading = ref(false)
const uploadOk = ref(false)
const uploadError = ref('')

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
  uploadOk.value = false
  uploadError.value = ''
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
  uploadOk.value = false
  uploadError.value = ''

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

  // 1) Upload to Supabase Storage
  isUploading.value = true
  try {
    const { bucket, path } = await uploadMealPhoto(file)

    // 2) Keep dataUrl for now (existing analysis flow) + persist storage refs
    const dataUrl = await fileToDataUrl(file)

    session.value = {
      imageDataUrl: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      createdAt: Date.now(),
      storageBucket: bucket,
      storagePath: path,
      uploadedAt: Date.now(),
    }

    uploadOk.value = true
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    uploadError.value = msg
    uploadOk.value = false
  } finally {
    isUploading.value = false
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

onBeforeUnmount(() => {
  revokePreview()
})
</script>

<template>
  <div class="pc-frame">
    <header class="pc-topbar">
      <div class="pc-topbar-row">
        <button class="pc-iconbtn" type="button" @click="navigateTo('/')" aria-label="Back">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>

        <div style="text-align:center; flex:1">
          <div style="font-weight: 950; letter-spacing: -0.02em">Upload</div>
          <div class="pc-muted" style="font-size: 11px; font-weight: 750">選擇照片 · 一鍵 AI 分析</div>
        </div>

        <div style="width: 40px" aria-hidden="true" />
      </div>
    </header>

    <main class="pc-main">
      <section class="pc-card pc-card-pad">
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
          aria-label="Upload image dropzone"
        >
          <div class="dropzone-inner">
            <div class="dropzone-icon-wrap" aria-hidden="true">
              <span class="material-symbols-outlined dropzone-icon">cloud_upload</span>
            </div>
            <div>
              <div style="font-weight: 950; letter-spacing: -0.02em">拖曳或點擊上傳</div>
              <div class="pc-muted" style="font-size: 12px; font-weight: 650; margin-top: 6px">
                image/* · Max {{ maxSizeMb }}MB
              </div>
            </div>
          </div>

          <input ref="fileInput" class="d-none" type="file" accept="image/*" @change="onFilePicked" />
        </div>

        <div v-if="error" class="pc-card" style="margin-top: 12px; border-radius: 18px; border-color: rgba(239,68,68,0.22); background: rgba(239,68,68,0.06)">
          <div style="padding: 12px 14px; color: rgba(185,28,28,0.95); font-weight: 800; font-size: 13px">
            {{ error }}
          </div>
        </div>

        <div v-if="previewUrl" style="margin-top: 14px">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 10px; margin-bottom: 10px">
            <div style="min-width: 0">
              <div style="font-weight: 950; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ fileName }}
              </div>
              <div class="pc-muted" style="font-size: 12px; font-weight: 750">{{ fileSizeText }}</div>
              <div v-if="isUploading" class="pc-muted" style="font-size: 11px; font-weight: 850; margin-top: 4px">
                Uploading to Storage...
              </div>
              <div v-else-if="uploadOk" style="font-size: 11px; font-weight: 900; margin-top: 4px; color: rgba(16,185,129,0.95)">
                Uploaded ✓ (Supabase Storage)
              </div>
              <div v-else-if="uploadError" style="font-size: 11px; font-weight: 900; margin-top: 4px; color: rgba(239,68,68,0.95)">
                Upload failed: {{ uploadError }}
              </div>
            </div>
            <button class="pc-btn" style="height: 42px; border-radius: 16px; padding: 0 14px" type="button" @click="clear">
              <span class="material-symbols-outlined" style="font-size: 18px">delete</span>
              清除
            </button>
          </div>

          <div class="preview-frame preview-frame--tight">
            <img :src="previewUrl" alt="Preview" />
          </div>

          <div class="pc-muted" style="margin-top: 10px; text-align:center; font-size: 11px; font-weight: 800">
            提示：Analysis 會讀取你這次的 session（localStorage/記憶體）
          </div>
        </div>
      </section>

      <section style="margin-top: 12px">
        <div class="pc-grid2">
          <button
            class="pc-btn"
            type="button"
            @click="openFilePicker"
          >
            <span class="material-symbols-outlined">image</span>
            從相簿選擇
          </button>

          <NuxtLink
            to="/analysis?autostart=1"
            class="pc-btn pc-btn--primary"
            :style="!previewUrl || !uploadOk || isUploading ? 'opacity:0.45; pointer-events:none' : ''"
          >
            <span class="material-symbols-outlined">auto_awesome</span>
            Analyze with AI
          </NuxtLink>
        </div>
      </section>
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
