# Design: MVP Image Upload

## Nuxt scaffold
Match reference `threezero-frontend`:
- Nuxt 4 + Vue 3
- `nuxt.config.ts` with:
  - Bootstrap CSS via CDN
  - Google Fonts via CDN (optional)
  - `css: ['~/assets/css/style.css']`

## UI
- `pages/index.vue` contains:
  - header/title
  - drop zone
  - hidden file input
  - preview card
  - error banner

## Client logic
- Use `URL.createObjectURL(file)` for preview.
- Revoke old object URLs to avoid leaks.
- Validation:
  - mime starts with `image/`
  - size <= 10MB (config constant)
