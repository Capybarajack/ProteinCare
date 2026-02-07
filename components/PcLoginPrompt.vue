<script setup lang="ts">
const { state, close, goLogin } = useLoginPromptOnce()
</script>

<template>
  <Teleport to="body">
    <div v-if="state.open" class="pc-modal" role="dialog" aria-modal="true" aria-label="Login prompt">
      <div class="pc-modal-backdrop" @click="close" />

      <div class="pc-modal-card">
        <div class="pc-modal-badge" aria-hidden="true">
          <span class="material-symbols-outlined">verified</span>
        </div>

        <div class="pc-modal-title">登入一下，體驗更完整</div>
        <div class="pc-modal-desc">
          你目前尚未登入。登入後可以把上傳與分析結果同步到你的紀錄中，追蹤更方便。
        </div>

        <div class="pc-modal-actions">
          <button class="pc-modal-btn pc-modal-btn--ghost" type="button" @click="close">
            先不要
          </button>
          <button class="pc-modal-btn pc-modal-btn--primary" type="button" @click="goLogin">
            是，去登入
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.pc-modal {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: grid;
  place-items: center;
  padding: 22px;
}

.pc-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(10, 14, 12, 0.45);
  backdrop-filter: blur(10px);
}

.pc-modal-card {
  position: relative;
  width: min(420px, 100%);
  border-radius: 28px;
  border: 1px solid rgba(18, 24, 20, 0.10);
  background:
    radial-gradient(800px 300px at 18% 0%, rgba(var(--accent-rgb), 0.18), transparent 55%),
    radial-gradient(700px 320px at 92% 0%, rgba(var(--accent-2-rgb), 0.14), transparent 56%),
    rgba(255, 255, 255, 0.94);
  box-shadow: 0 28px 90px rgba(18, 24, 20, 0.24);
  padding: 18px 18px 16px;
  overflow: hidden;
}

.pc-modal-card::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(120deg, rgba(var(--accent-rgb), 0), rgba(var(--accent-rgb), 0.16), rgba(var(--accent-2-rgb), 0.10), rgba(255, 255, 255, 0));
  filter: blur(18px);
  opacity: 0.9;
  pointer-events: none;
}

.pc-modal-card > * {
  position: relative;
  z-index: 1;
}

.pc-modal-badge {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: rgba(var(--accent-dark-rgb), 0.95);
  background: rgba(var(--accent-rgb), 0.14);
  border: 1px solid rgba(var(--accent-rgb), 0.18);
  margin-bottom: 10px;
}

.pc-modal-title {
  font-weight: 1000;
  letter-spacing: -0.03em;
  font-size: 18px;
}

.pc-modal-desc {
  margin-top: 8px;
  color: var(--muted);
  font-weight: 750;
  font-size: 13px;
  line-height: 1.5;
}

.pc-modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}

.pc-modal-btn {
  height: 48px;
  border-radius: 18px;
  border: 1px solid rgba(18, 24, 20, 0.10);
  font-weight: 950;
  letter-spacing: -0.01em;
}

.pc-modal-btn--ghost {
  background: rgba(255, 255, 255, 0.85);
}

.pc-modal-btn--primary {
  border-color: rgba(var(--accent-rgb), 0.35);
  color: #fff;
  background: linear-gradient(180deg, rgba(var(--accent-rgb), 1), rgba(var(--accent-dark-rgb), 1));
  box-shadow: 0 18px 40px rgba(var(--accent-rgb), 0.22);
}

.pc-modal-btn:active {
  transform: scale(0.99);
}
</style>
