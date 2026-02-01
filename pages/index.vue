<template>
  <div>
    <TopNav />

    <div class="container py-4">
      <header class="mb-3">
        <h1 class="h4 mb-1 title">Home</h1>
        <p class="text-muted mb-0">Start by uploading an image, then view analysis and dashboard.</p>
      </header>

      <section class="card shadow-sm border-0">
        <div class="card-body">
          <div class="row">
            <div class="col-12 col-md-6 mb-3">
              <div class="p-3 h-100" style="border: 1px solid rgba(0,0,0,0.06); border-radius: 18px;">
                <div class="d-flex align-items-center mb-2">
                  <span class="material-symbols-outlined mr-2" aria-hidden="true" style="color: var(--accent)">cloud_upload</span>
                  <div class="font-weight-bold">Upload</div>
                </div>
                <div class="text-muted small mb-3">Choose an image (file picker or drag & drop).</div>
                <NuxtLink to="/upload" class="btn btn-primary btn-sm">Go to Upload</NuxtLink>
              </div>
            </div>

            <div class="col-12 col-md-6 mb-3">
              <div class="p-3 h-100" style="border: 1px solid rgba(0,0,0,0.06); border-radius: 18px;">
                <div class="d-flex align-items-center mb-2">
                  <span class="material-symbols-outlined mr-2" aria-hidden="true" style="color: var(--accent)">analytics</span>
                  <div class="font-weight-bold">Analysis</div>
                </div>
                <div class="text-muted small mb-3">Preview your uploaded image and save it to dashboard.</div>
                <NuxtLink to="/analysis" class="btn btn-outline-secondary btn-sm">Go to Analysis</NuxtLink>
              </div>
            </div>

            <div class="col-12">
              <div class="p-3" style="border: 1px solid rgba(0,0,0,0.06); border-radius: 18px;">
                <div class="d-flex align-items-center mb-2">
                  <span class="material-symbols-outlined mr-2" aria-hidden="true" style="color: var(--accent)">dashboard</span>
                  <div class="font-weight-bold">Dashboard</div>
                </div>
                <div class="text-muted small mb-3">View saved uploads (localStorage only).</div>
                <NuxtLink to="/dashboard" class="btn btn-outline-secondary btn-sm">Go to Dashboard</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="mt-4 text-center text-muted small">
        Pure frontend. No upload to server.
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopNav from '~/components/TopNav.vue'
</script>
