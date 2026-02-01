# Proposal: Add Upload/Analysis/Dashboard pages

## Intent
Match the template structure (4 pages) by adding functional pages:
- Home (index)
- Upload
- Analysis
- Dashboard

## Scope
- Keep the project frontend-only (no server routes)
- Reuse a simple client-side state to carry the uploaded image from Upload → Analysis
- Persist saved uploads to localStorage for Dashboard

## Non-goals
- No backend upload
- No AI analysis yet (Analysis page is placeholder summary)

## Approach
- Add composables:
  - `useUploadSession()` using Nuxt `useState`
  - `useUploadLog()` using localStorage
- Add pages: `upload.vue`, `analysis.vue`, `dashboard.vue`
- Add a simple `TopNav` for navigation
