<template>
  <nav class="navbar navbar-light bg-white sticky-top border-bottom">
    <div class="container d-flex align-items-center justify-content-between py-2">
      <NuxtLink to="/" class="d-flex align-items-center text-decoration-none">
        <span class="material-symbols-outlined brand-icon mr-2" aria-hidden="true">health_and_safety</span>
        <span class="title h5 mb-0 text-dark">ProtainCare</span>
      </NuxtLink>

      <div class="d-flex align-items-center" style="gap: 6px">
        <NuxtLink to="/upload" class="btn btn-sm btn-outline-secondary">Upload</NuxtLink>
        <NuxtLink to="/analysis" class="btn btn-sm btn-outline-secondary">Analysis</NuxtLink>
        <NuxtLink to="/dashboard" class="btn btn-sm btn-outline-secondary">Dashboard</NuxtLink>
      </div>
    </div>
  </nav>
</template>
