<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useUploadLog } from '~/composables/useUploadLog'
import { useAuthUser } from '~/composables/useAuth'
import { useSupabase } from '~/composables/useSupabase'

const route = useRoute()

const navItems = [
  { to: '/', icon: 'home', label: 'Home' },
  { to: '/upload', icon: 'cloud_upload', label: 'Upload' },
  { to: '/analysis', icon: 'analytics', label: 'Analysis' },
  { to: '/dashboard', icon: 'dashboard', label: 'Log' },
]

// NOTE: Dashboard must be accessible without login.
// When logged in: load from DB. When not logged in: fallback to localStorage.
useHead({ title: 'Dashboard' })

const supabase = useSupabase()
const user = useAuthUser()

const { logs, load: loadLocal, clear: clearLocal } = useUploadLog()

type DbEntryItem = {
  id: string
  sort_order: number
  name: string
  estimated_portion: string | null
  calories_kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
}

type DbEntry = {
  id: string
  captured_at: string
  image_bucket: string
  image_path: string
  image_mime_type: string | null
  image_file_name: string | null
  image_file_size_bytes: number | null
  ai_summary: string | null
  ai_confidence: number | null
  total_calories_kcal: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fat_g: number | null
  food_entry_items: DbEntryItem[]
}

const isDbLoading = ref(false)
const dbError = ref('')
const dbEntries = ref<DbEntry[]>([])
const signedUrlByEntryId = ref<Record<string, string>>({})

const isAuthed = computed(() => Boolean(user.value?.id))

function sizeMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function clearAll() {
  if (isAuthed.value) {
    alert('已登入模式下：目前只顯示資料庫紀錄。刪除資料庫資料尚未在前端提供（避免誤刪）。')
    return
  }

  const ok = confirm('Clear all saved uploads?')
  if (!ok) return
  clearLocal()
}

async function ensureSignedUrl(entry: DbEntry) {
  if (signedUrlByEntryId.value[entry.id]) return

  const { data, error } = await supabase.storage
    .from(entry.image_bucket)
    .createSignedUrl(entry.image_path, 60 * 60) // 1 hour

  if (error) throw error

  if (data?.signedUrl) {
    signedUrlByEntryId.value = {
      ...signedUrlByEntryId.value,
      [entry.id]: data.signedUrl,
    }
  }
}

async function loadFromDb() {
  dbError.value = ''
  isDbLoading.value = true

  try {
    const u = user.value
    if (!u?.id) {
      dbEntries.value = []
      return
    }

    const { data, error } = await supabase
      .from('food_entries')
      .select(
        [
          'id',
          'captured_at',
          'image_bucket',
          'image_path',
          'image_mime_type',
          'image_file_name',
          'image_file_size_bytes',
          'ai_summary',
          'ai_confidence',
          'total_calories_kcal',
          'total_protein_g',
          'total_carbs_g',
          'total_fat_g',
          'food_entry_items(id,sort_order,name,estimated_portion,calories_kcal,protein_g,carbs_g,fat_g)',
        ].join(',')
      )
      .eq('user_id', u.id)
      .order('captured_at', { ascending: false })
      .order('sort_order', { foreignTable: 'food_entry_items', ascending: true })

    if (error) throw error

    dbEntries.value = (data || []) as unknown as DbEntry[]

    // Preload signed URLs (best-effort)
    for (const entry of dbEntries.value) {
      try {
        await ensureSignedUrl(entry)
      } catch (e) {
        // Ignore signed url failures per-entry; user will still see the record.
        // eslint-disable-next-line no-console
        console.warn('[dashboard] signed url failed', entry.id, e)
      }
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[dashboard] load db failed', e)
    dbError.value = e?.message || '讀取資料庫失敗'
    dbEntries.value = []
  } finally {
    isDbLoading.value = false
  }
}

function loadFromLocal() {
  dbError.value = ''
  dbEntries.value = []
  loadLocal()
}

async function refresh() {
  if (isAuthed.value) {
    // In authed mode: basics come from DB (profiles), not localStorage
    try {
      await loadBasicsFromProfile()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[dashboard] load profiles failed', e)
    }

    await loadFromDb()
  } else {
    loadBasicsFromLocal()
    loadFromLocal()
  }
}

const countText = computed(() => {
  return isAuthed.value ? `${dbEntries.value.length} item(s)` : `${logs.value.length} item(s)`
})

// --- Protein goal / today progress (protein-first UX) ---
const proteinGoalG = ref<number>(120)
const weightKg = ref<number | null>(null)

function loadBasicsFromLocal() {
  try {
    const savedGoal = localStorage.getItem('pc_protein_goal_g')
    const ng = Number(savedGoal)
    if (savedGoal != null && Number.isFinite(ng) && ng > 0) proteinGoalG.value = Math.round(ng)
  } catch {
    // ignore
  }

  try {
    const savedW = localStorage.getItem('pc_weight_kg')
    const nw = Number(savedW)
    if (savedW != null && Number.isFinite(nw) && nw > 0) weightKg.value = Math.round(nw * 10) / 10
  } catch {
    // ignore
  }
}

async function loadBasicsFromProfile() {
  const u = user.value
  if (!u?.id) return

  const { data, error } = await supabase
    .from('profiles')
    .select('weight_kg, protein_goal_g')
    .eq('id', u.id)
    .maybeSingle()

  if (error) throw error

  // If profile row does not exist yet, create a minimal one, then return.
  if (!data) {
    const { error: insertErr } = await supabase.from('profiles').upsert({ id: u.id }, { onConflict: 'id' })
    if (insertErr) throw insertErr
    return
  }

  if (data.protein_goal_g != null) proteinGoalG.value = Math.round(Number(data.protein_goal_g))
  if (data.weight_kg != null) weightKg.value = Math.round(Number(data.weight_kg) * 10) / 10
}

onMounted(() => {
  // Logged-out mode only: keep offline experience via localStorage
  if (!isAuthed.value) loadBasicsFromLocal()
})

function gramsFor(weight: number | null, gPerKg: number) {
  if (!weight) return null
  return Math.round(weight * gPerKg)
}

function gramsRangeFor(weight: number | null, lo: number, hi: number) {
  if (!weight) return null
  const a = Math.round(weight * lo)
  const b = Math.round(weight * hi)
  return a === b ? `${a}` : `${a}–${b}`
}

let saveBasicsTimer: any = null
async function saveBasicsToProfileSoon() {
  const u = user.value
  if (!u?.id) return

  if (saveBasicsTimer) clearTimeout(saveBasicsTimer)
  saveBasicsTimer = setTimeout(async () => {
    try {
      const goal = Number(proteinGoalG.value)
      const weight = weightKg.value == null ? null : Number(weightKg.value)

      const payload: any = {
        // Always include both fields in authed mode so saves are explicit.
        protein_goal_g: Number.isFinite(goal) && goal > 0 ? Math.round(goal) : null,
        weight_kg: weight != null && Number.isFinite(weight) && weight > 0 ? weight : null,
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: u.id, ...payload }, { onConflict: 'id' })
        .select('weight_kg, protein_goal_g')
        .single()
      if (error) throw error

      // Keep UI in sync with the DB values (and verify save succeeded)
      if (data?.protein_goal_g != null) proteinGoalG.value = Math.round(Number(data.protein_goal_g))
      if (data?.weight_kg != null) weightKg.value = Math.round(Number(data.weight_kg) * 10) / 10
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[dashboard] update profiles failed', e)
    }
  }, 350)
}

watch(
  proteinGoalG,
  async (v) => {
    const n = Number(v)
    if (!Number.isFinite(n) || n <= 0) return

    if (isAuthed.value) {
      await saveBasicsToProfileSoon()
      return
    }

    try {
      localStorage.setItem('pc_protein_goal_g', String(Math.round(n)))
    } catch {
      // ignore
    }
  },
  { deep: false }
)

watch(
  weightKg,
  async (v) => {
    if (isAuthed.value) {
      await saveBasicsToProfileSoon()
      return
    }

    try {
      const n = Number(v)
      if (v == null) {
        localStorage.removeItem('pc_weight_kg')
        return
      }
      if (Number.isFinite(n) && n > 0) localStorage.setItem('pc_weight_kg', String(n))
    } catch {
      // ignore
    }
  },
  { deep: false }
)

function isSameLocalDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const todayProteinG = computed(() => {
  const today = new Date()

  if (isAuthed.value) {
    return dbEntries.value
      .filter((e) => isSameLocalDate(new Date(e.captured_at), today))
      .reduce((sum, e) => sum + Number(e.total_protein_g || 0), 0)
  }

  return logs.value
    .filter((e) => isSameLocalDate(new Date(e.createdAt), today))
    .reduce((sum, e) => sum + Number(e.aiResult?.total?.protein_g || 0), 0)
})

const goalPct = computed(() => {
  const goal = Number(proteinGoalG.value || 0)
  if (!goal) return 0
  return Math.max(0, Math.min(1, todayProteinG.value / goal))
})

const todayLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
})

onMounted(async () => {
  await refresh()
})

watch(
  () => route.fullPath,
  async () => {
    await refresh()
  }
)

watch(
  () => user.value?.id,
  async () => {
    await refresh()
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
          <div class="pc-muted" style="font-size: 11px; font-weight: 750">
            <template v-if="isAuthed">Supabase DB · signed images</template>
            <template v-else>Saved uploads · localStorage only</template>
          </div>
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
            :disabled="isAuthed ? true : !logs.length"
            :style="(isAuthed ? true : !logs.length) ? 'opacity:0.4; pointer-events:none' : ''"
          >
            <span class="material-symbols-outlined">delete_sweep</span>
          </button>
        </div>
      </div>
    </header>

    <main class="pc-main">
      <!-- Protein intake guide (g/kg) -->
      <section class="pc-card" style="border-radius: 20px; padding: 12px 14px; margin: 0 0 12px">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 12px">
          <div>
            <div style="font-weight: 950; letter-spacing:-0.03em; font-size: 15px">每公斤體重需要多少蛋白質</div>
            <div class="pc-muted" style="margin-top: 4px; font-size: 12px; font-weight: 750">以「g / kg」為基準（參考範圍）</div>
          </div>
          <div class="pc-pill" style="letter-spacing:0.12em">GUIDE</div>
        </div>

        <div style="margin-top: 10px; overflow:hidden; border-radius: 16px; border: 1px solid rgba(148, 163, 184, 0.18)">
          <table style="width:100%; border-collapse: collapse; font-size: 12px">
            <thead>
              <tr style="background: rgba(148, 163, 184, 0.10)">
                <th style="text-align:left; padding: 10px 12px; font-weight: 950">族群 / 目標</th>
                <th style="text-align:right; padding: 10px 12px; font-weight: 950; white-space: nowrap">建議攝取量</th>
                <th style="text-align:right; padding: 10px 12px; font-weight: 950; white-space: nowrap">
                  <div style="display:flex; align-items:center; justify-content:flex-end; gap: 8px">
                    <span class="pc-muted" style="font-weight: 900">體重</span>
                    <input
                      v-model.number="weightKg"
                      inputmode="decimal"
                      type="number"
                      min="20"
                      max="300"
                      step="0.5"
                      placeholder="kg"
                      aria-label="體重 (kg)"
                      style="width: 72px; height: 28px; padding: 0 10px; border-radius: 10px; border: 1px solid rgba(148, 163, 184, 0.28); background: rgba(255,255,255,0.65); font-weight: 900; outline: none"
                    />
                    <span class="pc-muted" style="font-weight: 900">kg</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 12px; font-weight: 850">一般成人（久坐）</td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 950">0.8 <span class="pc-muted" style="font-weight: 850">g / kg</span></td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 1000">
                  <template v-if="weightKg">
                    {{ gramsFor(weightKg, 0.8) }} <span class="pc-muted" style="font-weight: 900">克/日</span>
                  </template>
                  <template v-else>
                    <span class="pc-muted" style="font-weight: 900">—</span>
                  </template>
                </td>
              </tr>
              <tr style="background: rgba(148, 163, 184, 0.06)">
                <td style="padding: 10px 12px; font-weight: 850">一般有運動</td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 950">1.0–1.2 <span class="pc-muted" style="font-weight: 850">g / kg</span></td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 1000">
                  <template v-if="weightKg">
                    {{ gramsRangeFor(weightKg, 1.0, 1.2) }} <span class="pc-muted" style="font-weight: 900">克/日</span>
                  </template>
                  <template v-else>
                    <span class="pc-muted" style="font-weight: 900">—</span>
                  </template>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; font-weight: 850">重量訓練 / 增肌</td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 950">1.6–2.2 <span class="pc-muted" style="font-weight: 850">g / kg</span></td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 1000">
                  <template v-if="weightKg">
                    {{ gramsRangeFor(weightKg, 1.6, 2.2) }} <span class="pc-muted" style="font-weight: 900">克/日</span>
                  </template>
                  <template v-else>
                    <span class="pc-muted" style="font-weight: 900">—</span>
                  </template>
                </td>
              </tr>
              <tr style="background: rgba(148, 163, 184, 0.06)">
                <td style="padding: 10px 12px; font-weight: 850">減脂期（保肌）</td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 950">1.8–2.4 <span class="pc-muted" style="font-weight: 850">g / kg</span></td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 1000">
                  <template v-if="weightKg">
                    {{ gramsRangeFor(weightKg, 1.8, 2.4) }} <span class="pc-muted" style="font-weight: 900">克/日</span>
                  </template>
                  <template v-else>
                    <span class="pc-muted" style="font-weight: 900">—</span>
                  </template>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; font-weight: 850">高齡者</td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 950">1.2–1.5 <span class="pc-muted" style="font-weight: 850">g / kg</span></td>
                <td style="padding: 10px 12px; text-align:right; font-weight: 1000">
                  <template v-if="weightKg">
                    {{ gramsRangeFor(weightKg, 1.2, 1.5) }} <span class="pc-muted" style="font-weight: 900">克/日</span>
                  </template>
                  <template v-else>
                    <span class="pc-muted" style="font-weight: 900">—</span>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div style="display:flex; align-items:flex-end; justify-content:space-between; padding: 0 4px 10px">
        <div>
          <div style="font-weight: 950; letter-spacing:-0.03em; font-size: 18px">紀錄</div>
          <div class="pc-muted" style="font-size: 12px; font-weight: 750">{{ countText }}</div>
        </div>

        <button
          class="pc-btn"
          style="height: 42px; border-radius: 16px; padding: 0 14px"
          type="button"
          @click="clearAll"
          :disabled="isAuthed ? true : !logs.length"
          :style="(isAuthed ? true : !logs.length) ? 'opacity:0.4; pointer-events:none' : ''"
        >
          <span class="material-symbols-outlined" style="font-size: 18px">delete</span>
          清空
        </button>
      </div>

      <!-- Protein progress (today) -->
      <section class="pc-card" style="border-radius: 20px; padding: 12px 14px; margin: 0 0 12px">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 12px">
          <div style="min-width:0">
            <div class="pc-muted" style="font-size: 11px; font-weight: 900">今日（{{ todayLabel }}）蛋白質累積</div>
            <div style="margin-top: 6px; display:flex; align-items:baseline; gap: 8px">
              <div style="font-weight: 1100; letter-spacing:-0.05em; font-size: 28px; line-height: 1">
                {{ Math.round(todayProteinG) }}
              </div>
              <div class="pc-muted" style="font-size: 12px; font-weight: 900">克</div>
              <div class="pc-muted" style="font-size: 12px; font-weight: 850">/ 目標 {{ proteinGoalG }} 克</div>
            </div>
          </div>

          <div style="text-align:right">
            <div class="pc-muted" style="font-size: 11px; font-weight: 900">達成率</div>
            <div style="margin-top: 6px; font-weight: 1000; letter-spacing:-0.03em">
              {{ Math.round(goalPct * 100) }}%
            </div>
          </div>
        </div>

        <div style="margin-top: 10px">
          <div
            style="height: 10px; border-radius: 999px; background: rgba(148, 163, 184, 0.22); overflow:hidden; border: 1px solid rgba(148, 163, 184, 0.18)"
            aria-label="Protein goal progress"
            role="progressbar"
            :aria-valuemin="0"
            :aria-valuemax="proteinGoalG"
            :aria-valuenow="Math.round(todayProteinG)"
          >
            <div
              :style="`height:100%; width:${Math.round(goalPct * 100)}%; border-radius:999px; background: linear-gradient(90deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95)); box-shadow: 0 10px 22px rgba(16,185,129,0.18); transition: width 220ms ease;`"
            />
          </div>

          <div style="margin-top: 10px; display:flex; align-items:center; justify-content:space-between; gap: 10px">
            <div class="pc-muted" style="font-size: 11px; font-weight: 850">目標蛋白質</div>
            <div style="display:flex; align-items:center; gap: 10px">
              <input
                v-model.number="proteinGoalG"
                type="range"
                min="50"
                max="250"
                step="5"
                aria-label="Protein goal"
                style="width: 160px"
              />
              <div class="pc-pill" style="min-width: 74px; justify-content:center">{{ proteinGoalG }} 克</div>
            </div>
          </div>
        </div>
      </section>

      <!-- DB error -->
      <div v-if="dbError" class="pc-card" style="margin-top: 12px; border-radius: 18px; border-color: rgba(239,68,68,0.22); background: rgba(239,68,68,0.06)">
        <div style="padding: 12px 14px; color: rgba(185,28,28,0.95); font-weight: 800; font-size: 13px">
          {{ dbError }}
        </div>
      </div>

      <!-- Logged-in mode (DB) -->
      <template v-if="isAuthed">
        <div v-if="isDbLoading" class="pc-card pc-card-pad">
          <div class="pc-muted" style="font-size: 13px; font-weight: 750">Loading from database…</div>
        </div>

        <div v-else-if="!dbEntries.length" class="pc-card pc-card-pad">
          <div style="display:flex; gap: 12px; align-items:flex-start">
            <div
              style="width: 46px; height: 46px; border-radius: 16px; display:grid; place-items:center; background: rgba(134,163,143,0.12); border: 1px solid rgba(134,163,143,0.16); color: rgba(108,138,118,0.95)"
              aria-hidden="true"
            >
              <span class="material-symbols-outlined">history</span>
            </div>
            <div style="flex:1">
              <div style="font-weight: 950; letter-spacing: -0.02em">尚無資料庫紀錄</div>
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
          <section v-for="entry in dbEntries" :key="entry.id" class="pc-card pc-card-pad">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap: 10px">
              <div style="min-width: 0">
                <div style="font-weight: 950; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                  {{ entry.image_file_name || entry.id }}
                </div>
                <div class="pc-muted" style="font-size: 12px; font-weight: 750; margin-top: 2px">
                  <template v-if="entry.image_file_size_bytes">{{ sizeMb(entry.image_file_size_bytes) }}</template>
                  <span style="margin: 0 8px; opacity: 0.6">•</span>
                  {{ new Date(entry.captured_at).toLocaleString() }}
                </div>
              </div>
            </div>

            <div class="preview-frame preview-frame--tight" style="margin-top: 12px">
              <img :src="signedUrlByEntryId[entry.id]" :alt="entry.image_file_name || entry.id" />
            </div>

            <div v-if="entry.ai_summary || entry.total_calories_kcal != null" class="pc-card" style="margin-top: 10px; border-radius: 16px; padding: 10px 12px">
              <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px">
                <div style="font-weight: 900; letter-spacing: -0.02em; font-size: 12px">AI Summary</div>
                <div v-if="entry.ai_confidence != null" class="pc-muted" style="font-size: 11px; font-weight: 800">
                  {{ Math.round(entry.ai_confidence * 100) }}%
                </div>
              </div>

              <div v-if="entry.ai_summary" class="pc-muted" style="margin-top: 6px; font-size: 12px; font-weight: 650; line-height: 1.4">
                {{ entry.ai_summary }}
              </div>

              <div v-if="entry.total_protein_g != null" class="pc-card" style="margin-top: 10px; border-radius: 14px; padding: 10px 12px">
                <div style="display:flex; align-items:baseline; justify-content:space-between; gap: 12px">
                  <div class="pc-muted" style="font-size: 11px; font-weight: 900">蛋白質</div>
                  <div style="font-weight: 1000; letter-spacing:-0.04em; font-size: 22px; line-height: 1">
                    {{ entry.total_protein_g }}<span class="pc-muted" style="font-size: 11px; font-weight: 900; margin-left: 6px">克</span>
                  </div>
                </div>

                <div style="margin-top: 10px; display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px">
                  <div class="pc-card" style="border-radius: 12px; padding: 8px 10px; text-align:center">
                    <div class="pc-muted" style="font-size: 10px; font-weight: 900">熱量</div>
                    <div style="font-weight: 950; margin-top: 2px">{{ entry.total_calories_kcal }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">大卡</span></div>
                  </div>
                  <div class="pc-card" style="border-radius: 12px; padding: 8px 10px; text-align:center">
                    <div class="pc-muted" style="font-size: 10px; font-weight: 900">碳水化合物</div>
                    <div style="font-weight: 950; margin-top: 2px">{{ entry.total_carbs_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">克</span></div>
                  </div>
                  <div class="pc-card" style="border-radius: 12px; padding: 8px 10px; text-align:center">
                    <div class="pc-muted" style="font-size: 10px; font-weight: 900">脂肪</div>
                    <div style="font-weight: 950; margin-top: 2px">{{ entry.total_fat_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">克</span></div>
                  </div>
                </div>
              </div>

              <details v-if="entry.food_entry_items?.length" style="margin-top: 10px">
                <summary class="pc-muted" style="font-size: 12px; font-weight: 900; cursor:pointer">Items</summary>
                <div style="margin-top: 10px; display:grid; gap: 8px">
                  <div
                    v-for="it in entry.food_entry_items"
                    :key="it.id"
                    class="pc-card"
                    style="border-radius: 14px; padding: 10px 12px"
                  >
                    <div style="font-weight: 950; letter-spacing: -0.02em">{{ it.name }}</div>
                    <div v-if="it.estimated_portion" class="pc-muted" style="font-size: 12px; font-weight: 750; margin-top: 2px">
                      {{ it.estimated_portion }}
                    </div>

                    <div class="pc-card" style="margin-top: 8px; border-radius: 12px; padding: 8px 10px">
                      <div style="display:flex; align-items:baseline; justify-content:space-between; gap: 10px">
                        <div class="pc-muted" style="font-size: 10px; font-weight: 900">蛋白質</div>
                        <div style="font-weight: 1000; letter-spacing:-0.03em; font-size: 18px; line-height: 1">
                          {{ it.protein_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 5px">克</span>
                        </div>
                      </div>

                      <div style="margin-top: 8px; display:grid; grid-template-columns: repeat(3, 1fr); gap: 6px">
                        <div style="text-align:center">
                          <div class="pc-muted" style="font-size: 10px; font-weight: 900">熱量</div>
                          <div style="font-weight: 900; margin-top: 2px">{{ it.calories_kcal }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">大卡</span></div>
                        </div>
                        <div style="text-align:center">
                          <div class="pc-muted" style="font-size: 10px; font-weight: 900">碳水</div>
                          <div style="font-weight: 900; margin-top: 2px">{{ it.carbs_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">克</span></div>
                        </div>
                        <div style="text-align:center">
                          <div class="pc-muted" style="font-size: 10px; font-weight: 900">脂肪</div>
                          <div style="font-weight: 900; margin-top: 2px">{{ it.fat_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">克</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </section>

          <footer class="pc-muted" style="text-align:center; font-size: 11px; font-weight: 750; margin-top: 4px">
            Source: <code>public.food_entries</code> + <code>public.food_entry_items</code>
          </footer>
        </div>
      </template>

      <!-- Logged-out mode (localStorage) -->
      <template v-else>
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
                <div style="font-weight: 950; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
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

            <div v-if="item.aiResult" class="pc-card" style="margin-top: 10px; border-radius: 16px; padding: 10px 12px">
              <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px">
                <div style="font-weight: 900; letter-spacing: -0.02em; font-size: 12px">AI Summary</div>
                <div class="pc-muted" style="font-size: 11px; font-weight: 800">
                  {{ Math.round(item.aiResult.confidence * 100) }}%
                </div>
              </div>

              <div class="pc-muted" style="margin-top: 6px; font-size: 12px; font-weight: 650; line-height: 1.4">
                {{ item.aiResult.summary }}
              </div>

              <div class="pc-card" style="margin-top: 10px; border-radius: 14px; padding: 10px 12px">
                <div style="display:flex; align-items:baseline; justify-content:space-between; gap: 12px">
                  <div class="pc-muted" style="font-size: 11px; font-weight: 900">蛋白質</div>
                  <div style="font-weight: 1000; letter-spacing:-0.04em; font-size: 22px; line-height: 1">
                    {{ item.aiResult.total.protein_g }}<span class="pc-muted" style="font-size: 11px; font-weight: 900; margin-left: 6px">克</span>
                  </div>
                </div>

                <div style="margin-top: 10px; display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px">
                  <div class="pc-card" style="border-radius: 12px; padding: 8px 10px; text-align:center">
                    <div class="pc-muted" style="font-size: 10px; font-weight: 900">熱量</div>
                    <div style="font-weight: 950; margin-top: 2px">{{ item.aiResult.total.calories_kcal }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">大卡</span></div>
                  </div>
                  <div class="pc-card" style="border-radius: 12px; padding: 8px 10px; text-align:center">
                    <div class="pc-muted" style="font-size: 10px; font-weight: 900">碳水化合物</div>
                    <div style="font-weight: 950; margin-top: 2px">{{ item.aiResult.total.carbs_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">克</span></div>
                  </div>
                  <div class="pc-card" style="border-radius: 12px; padding: 8px 10px; text-align:center">
                    <div class="pc-muted" style="font-size: 10px; font-weight: 900">脂肪</div>
                    <div style="font-weight: 950; margin-top: 2px">{{ item.aiResult.total.fat_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">克</span></div>
                  </div>
                </div>
              </div>

              <details v-if="item.aiResult.items?.length" style="margin-top: 10px">
                <summary class="pc-muted" style="font-size: 12px; font-weight: 900; cursor:pointer">Items</summary>
                <div style="margin-top: 10px; display:grid; gap: 8px">
                  <div
                    v-for="(it, idx) in item.aiResult.items"
                    :key="idx"
                    class="pc-card"
                    style="border-radius: 14px; padding: 10px 12px"
                  >
                    <div style="font-weight: 950; letter-spacing: -0.02em">{{ it.name }}</div>
                    <div v-if="it.estimated_portion" class="pc-muted" style="font-size: 12px; font-weight: 750; margin-top: 2px">
                      {{ it.estimated_portion }}
                    </div>

                    <div class="pc-card" style="margin-top: 8px; border-radius: 12px; padding: 8px 10px">
                      <div style="display:flex; align-items:baseline; justify-content:space-between; gap: 10px">
                        <div class="pc-muted" style="font-size: 10px; font-weight: 900">蛋白質</div>
                        <div style="font-weight: 1000; letter-spacing:-0.03em; font-size: 18px; line-height: 1">
                          {{ it.protein_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 5px">克</span>
                        </div>
                      </div>

                      <div style="margin-top: 8px; display:grid; grid-template-columns: repeat(3, 1fr); gap: 6px">
                        <div style="text-align:center">
                          <div class="pc-muted" style="font-size: 10px; font-weight: 900">熱量</div>
                          <div style="font-weight: 900; margin-top: 2px">{{ it.calories_kcal }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">大卡</span></div>
                        </div>
                        <div style="text-align:center">
                          <div class="pc-muted" style="font-size: 10px; font-weight: 900">碳水</div>
                          <div style="font-weight: 900; margin-top: 2px">{{ it.carbs_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">克</span></div>
                        </div>
                        <div style="text-align:center">
                          <div class="pc-muted" style="font-size: 10px; font-weight: 900">脂肪</div>
                          <div style="font-weight: 900; margin-top: 2px">{{ it.fat_g }}<span class="pc-muted" style="font-size: 10px; font-weight: 900; margin-left: 4px">克</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </section>

          <footer class="pc-muted" style="text-align:center; font-size: 11px; font-weight: 750; margin-top: 4px">
            Storage key: <code>protaincare_upload_logs</code>
          </footer>
        </div>
      </template>
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
