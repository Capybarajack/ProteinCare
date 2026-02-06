<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useUploadSession } from '~/composables/useUploadSession'
import { useUploadLog, type AiNutritionResult } from '~/composables/useUploadLog'
import { useSupabase } from '~/composables/useSupabase'
import { useAuthUser } from '~/composables/useAuth'

const route = useRoute()

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/upload', icon: 'cloud_upload', label: 'Upload' },
  { to: '/analysis', icon: 'analytics', label: 'Analysis' },
  { to: '/dashboard', icon: 'dashboard', label: 'Log' },
]

definePageMeta({ middleware: 'require-auth' })

useHead({ title: 'Analysis' })

const session = useUploadSession()
const { load, add } = useUploadLog()
const supabase = useSupabase()
const user = useAuthUser()

const saved = ref(false)
const isSaving = ref(false)
const saveError = ref('')
const savedEntryId = ref<string | null>(null)

const isAnalyzing = ref(false)
const aiError = ref('')
const aiResult = ref<AiNutritionResult | null>(null)
const aiRaw = ref('')

async function analyzeWithAI() {
  if (!session.value) return
  aiError.value = ''
  aiResult.value = null
  aiRaw.value = ''
  isAnalyzing.value = true

  try {
    const config = useRuntimeConfig()
    const base = String(config.public.backendBaseUrl || '').replace(/\/$/, '')

    const resp = await $fetch<{ ok: boolean; result: AiNutritionResult | null; rawText: string }>(`${base}/api/vision/analyze`, {
      method: 'POST',
      body: {
        imageDataUrl: session.value.imageDataUrl,
        detail: 'high',
      },
    })

    aiRaw.value = resp.rawText || ''
    aiResult.value = resp.result

    if (!resp.result) {
      aiError.value = 'AI 回傳格式不是 JSON（已保留原始文字，可稍後調整提示詞/格式）'
    }
  } catch (e: any) {
    aiError.value = e?.data?.statusMessage || e?.message || 'AI 分析失敗'
  } finally {
    isAnalyzing.value = false
  }
}

const sizeText = computed(() => {
  if (!session.value) return ''
  return `${(session.value.fileSize / (1024 * 1024)).toFixed(2)} MB`
})

async function saveToLog() {
  if (!session.value) return
  if (saved.value) return

  saveError.value = ''

  const u = user.value
  if (!u?.id) {
    saveError.value = '尚未登入，無法保存到資料庫'
    return
  }

  const bucket = session.value.storageBucket || 'meal-photos'
  const path = session.value.storagePath
  if (!path) {
    saveError.value = '找不到 Storage 路徑：請回到 Upload 重新上傳（確保已成功 Upload 到 Storage）'
    return
  }

  isSaving.value = true
  try {
    // 1) Insert entry
    const { data: entry, error: entryError } = await supabase
      .from('food_entries')
      .insert({
        user_id: u.id,
        captured_at: new Date(session.value.createdAt).toISOString(),
        image_bucket: bucket,
        image_path: path,
        image_mime_type: session.value.mimeType,
        image_file_name: session.value.fileName,
        image_file_size_bytes: session.value.fileSize,

        ai_summary: aiResult.value?.summary ?? null,
        ai_confidence: aiResult.value?.confidence ?? null,
        ai_assumptions: aiResult.value?.assumptions ?? null,

        total_calories_kcal: aiResult.value?.total?.calories_kcal ?? null,
        total_protein_g: aiResult.value?.total?.protein_g ?? null,
        total_carbs_g: aiResult.value?.total?.carbs_g ?? null,
        total_fat_g: aiResult.value?.total?.fat_g ?? null,

        raw_text: aiRaw.value || null,
        result_json: aiResult.value ?? null,
      })
      .select('id')
      .single()

    if (entryError) throw entryError

    // 2) Insert items (optional)
    const items = aiResult.value?.items || []
    if (items.length) {
      const { error: itemsError } = await supabase.from('food_entry_items').insert(
        items.map((it, idx) => ({
          entry_id: entry.id,
          user_id: u.id,
          sort_order: idx,
          name: it.name,
          estimated_portion: it.estimated_portion,
          calories_kcal: it.calories_kcal,
          protein_g: it.protein_g,
          carbs_g: it.carbs_g,
          fat_g: it.fat_g,
        }))
      )
      if (itemsError) throw itemsError
    }

    // 3) Save local dashboard log too
    add(session.value, { aiResult: aiResult.value, aiRaw: aiRaw.value || null, dbEntryId: entry.id })

    savedEntryId.value = entry.id
    saved.value = true
  } catch (e: any) {
    console.error('[save] db failed', e)
    saveError.value = e?.message || '保存到資料庫失敗'
  } finally {
    isSaving.value = false
  }
}

const didAutoStart = ref(false)

onMounted(async () => {
  load()

  const autostart = String(route.query.autostart || '')
  if (!didAutoStart.value && session.value && (autostart === '1' || autostart.toLowerCase() === 'true')) {
    didAutoStart.value = true
    await analyzeWithAI()
  }
})
</script>

<template>
  <div class="pc-frame">
    <header class="pc-topbar">
      <div class="pc-topbar-row">
        <button class="pc-iconbtn" type="button" @click="navigateTo('/upload')" aria-label="Back">
          <span class="material-symbols-outlined">arrow_back</span>
        </button>

        <div style="text-align:center; flex:1">
          <div style="font-weight: 950; letter-spacing: -0.02em">Analysis</div>
          <div class="pc-muted" style="font-size: 11px; font-weight: 750">OpenAI Vision · real analysis</div>
        </div>

        <NuxtLink to="/dashboard" class="pc-iconbtn" aria-label="Dashboard">
          <span class="material-symbols-outlined">dashboard</span>
        </NuxtLink>
      </div>
    </header>

    <main class="pc-main" style="padding-bottom: calc(180px + env(safe-area-inset-bottom))">
      <div v-if="!session" class="pc-card pc-card-pad">
        <div style="display:flex; gap: 12px; align-items:flex-start">
          <div
            style="width: 46px; height: 46px; border-radius: 16px; display:grid; place-items:center; background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.18); color: rgba(180, 83, 9, 0.95)"
            aria-hidden="true"
          >
            <span class="material-symbols-outlined">warning</span>
          </div>
          <div>
            <div style="font-weight: 950; letter-spacing: -0.02em">找不到上傳的圖片</div>
            <div class="pc-muted" style="font-size: 13px; font-weight: 650; margin-top: 6px">
              請先到 Upload 選擇圖片。
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

      <template v-else>
        <section class="pc-card" style="overflow:hidden">
          <div style="padding: 14px 14px 0">
            <div class="pc-pill">
              <span class="material-symbols-outlined" style="font-size:16px">auto_awesome</span>
              READY
            </div>
          </div>

          <div style="padding: 14px">
            <div class="preview-frame preview-frame--tight">
              <img :src="session.imageDataUrl" alt="Uploaded" />
            </div>
          </div>
        </section>

        <section style="margin-top: 12px">
          <div class="kpi">
            <div class="kpi-card">
              <div class="kpi-label">Filename</div>
              <div class="kpi-value" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ session.fileName }}
              </div>
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

          <div v-if="saved" class="pc-card" style="margin-top: 12px; border-radius: 18px; border-color: rgba(134,163,143,0.22); background: rgba(134,163,143,0.10)">
            <div style="padding: 12px 14px; color: rgba(20, 83, 45, 0.95); font-weight: 900; font-size: 13px; display:flex; align-items:center; gap: 10px">
              <span class="material-symbols-outlined">check_circle</span>
              已保存到 Dashboard
              <span v-if="savedEntryId" class="pc-muted" style="font-size: 11px; font-weight: 850">(DB ✓)</span>
            </div>
          </div>

          <div v-if="saveError" class="pc-card" style="margin-top: 12px; border-radius: 18px; border-color: rgba(239,68,68,0.22); background: rgba(239,68,68,0.06)">
            <div style="padding: 12px 14px; color: rgba(185,28,28,0.95); font-weight: 800; font-size: 13px">
              {{ saveError }}
            </div>
          </div>

          <div style="margin-top: 12px">
            <button
              class="pc-btn pc-btn--primary"
              type="button"
              style="width: 100%"
              @click="analyzeWithAI"
              :disabled="isAnalyzing"
              :style="isAnalyzing ? 'opacity:0.7; pointer-events:none' : ''"
            >
              <span class="material-symbols-outlined">auto_awesome</span>
              {{ isAnalyzing ? 'Analyzing…' : 'Analyze with AI' }}
            </button>

            <p class="pc-muted" style="margin: 10px 6px 0; font-size: 11px; font-weight: 750; text-align:center">
              會呼叫 OpenAI Vision API（有 token 成本）。
            </p>
          </div>

          <div v-if="aiError" class="pc-card" style="margin-top: 12px; border-radius: 18px; border-color: rgba(239,68,68,0.22); background: rgba(239,68,68,0.06)">
            <div style="padding: 12px 14px; color: rgba(185,28,28,0.95); font-weight: 800; font-size: 13px">
              {{ aiError }}
            </div>
          </div>

          <div v-if="aiResult" class="pc-card pc-card-pad" style="margin-top: 12px">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 10px">
              <div style="min-width:0">
                <div style="font-weight: 950; letter-spacing: -0.02em">AI 結果</div>
                <div class="pc-muted" style="font-size: 12px; font-weight: 750; margin-top: 4px">
                  Confidence: {{ Math.round(aiResult.confidence * 100) }}%
                </div>
              </div>
              <div class="pc-pill" style="letter-spacing:0.12em">REAL</div>
            </div>

            <div class="pc-muted" style="margin-top: 10px; font-size: 13px; font-weight: 650; line-height: 1.4">
              {{ aiResult.summary }}
            </div>

            <div style="margin-top: 12px; display:grid; gap: 10px">
              <div v-for="(it, idx) in aiResult.items" :key="idx" class="pc-card" style="border-radius: 20px; padding: 12px 14px">
                <div style="font-weight: 950; letter-spacing: -0.02em">{{ it.name }}</div>
                <div class="pc-muted" style="font-size: 12px; font-weight: 750; margin-top: 4px">
                  {{ it.estimated_portion }}
                </div>
                <div style="margin-top: 8px; display:grid; grid-template-columns: repeat(4, 1fr); gap: 8px">
                  <div style="text-align:center">
                    <div style="font-weight: 950">{{ it.calories_kcal }}</div>
                    <div class="pc-muted" style="font-size: 11px; font-weight: 750">kcal</div>
                  </div>
                  <div style="text-align:center">
                    <div style="font-weight: 950">{{ it.protein_g }}</div>
                    <div class="pc-muted" style="font-size: 11px; font-weight: 750">P(g)</div>
                  </div>
                  <div style="text-align:center">
                    <div style="font-weight: 950">{{ it.carbs_g }}</div>
                    <div class="pc-muted" style="font-size: 11px; font-weight: 750">C(g)</div>
                  </div>
                  <div style="text-align:center">
                    <div style="font-weight: 950">{{ it.fat_g }}</div>
                    <div class="pc-muted" style="font-size: 11px; font-weight: 750">F(g)</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="pc-card" style="margin-top: 12px; border-radius: 20px; padding: 12px 14px">
              <div style="font-weight: 950; letter-spacing: -0.02em">Total</div>
              <div class="pc-muted" style="font-size: 12px; font-weight: 750; margin-top: 6px">
                {{ aiResult.total.calories_kcal }} kcal · P {{ aiResult.total.protein_g }}g · C {{ aiResult.total.carbs_g }}g · F {{ aiResult.total.fat_g }}g
              </div>
            </div>

            <div v-if="aiResult.assumptions?.length" style="margin-top: 12px">
              <div class="pc-muted" style="font-size: 12px; font-weight: 900; letter-spacing: -0.02em">Assumptions</div>
              <ul class="pc-muted" style="margin: 8px 0 0; padding-left: 18px; font-size: 12px; font-weight: 650; line-height: 1.5">
                <li v-for="(a, i) in aiResult.assumptions" :key="i">{{ a }}</li>
              </ul>
            </div>
          </div>

          <details v-if="aiRaw" style="margin-top: 10px">
            <summary class="pc-muted" style="font-size: 12px; font-weight: 800; cursor:pointer">Raw response</summary>
            <pre style="white-space: pre-wrap; word-break: break-word; font-size: 12px; margin: 10px 0 0">{{ aiRaw }}</pre>
          </details>
        </section>
      </template>
    </main>

    <div
      v-if="session"
      class="pc-bottombar"
      style="padding-top: 14px"
      aria-label="Actions"
    >
      <div style="display:grid; gap: 10px">
        <button
          class="pc-btn pc-btn--primary"
          type="button"
          @click="saveToLog"
          :disabled="saved || isSaving"
          :style="saved || isSaving ? 'opacity:0.6; pointer-events:none' : ''"
        >
          <span class="material-symbols-outlined">{{ saved ? 'check_circle' : isSaving ? 'progress_activity' : 'add_task' }}</span>
          {{ saved ? 'Saved' : isSaving ? 'Saving…' : 'Save to Dashboard' }}
        </button>
        <div class="pc-grid2">
          <NuxtLink to="/upload" class="pc-btn" style="height: 52px">
            <span class="material-symbols-outlined">camera_enhance</span>
            換一張
          </NuxtLink>
          <NuxtLink to="/dashboard" class="pc-btn" style="height: 52px">
            <span class="material-symbols-outlined">dashboard</span>
            去 Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>

    <nav v-else class="pc-bottombar" aria-label="Bottom navigation">
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
