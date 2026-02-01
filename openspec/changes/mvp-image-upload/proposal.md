# Proposal: MVP Image Upload (Nuxt)

## Intent
Create a Nuxt (Vue 3) single-page style website that lets the user upload an image and preview it.

## Scope
- Nuxt project scaffold matching `F:\nodejs\nuxt3\threezero-frontend` conventions (Nuxt 4, Bootstrap CDN, project CSS).
- One primary page with:
  - File picker (accept image/*)
  - Drag & drop area
  - Client-side preview
  - Basic validation (file type + size)

## Non-goals
- No backend upload, no cloud storage, no auth
- No server routes

## Approach
- Use Nuxt pages and composables.
- Store the selected file as an object URL for preview.
- Keep styling consistent with Bootstrap + a light custom CSS layer.
