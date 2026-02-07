<template>
  <div class="app-shell">
    <NuxtPage />
    <PcLoginPrompt />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (chunk) => (chunk ? `${chunk} · ProtainCare` : 'ProtainCare'),
})
</script>
