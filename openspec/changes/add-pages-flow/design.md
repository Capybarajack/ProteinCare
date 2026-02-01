# Design: Add pages

## Navigation
- Add a small Bootstrap-based `TopNav` component with NuxtLinks.

## State
- `useUploadSession()` holds a data URL and metadata for the currently uploaded image.
- `useUploadLog()` persists an array to localStorage key `protaincare_upload_logs`.

## Pages
- `pages/index.vue`: landing with links to Upload/Analysis/Dashboard
- `pages/upload.vue`: upload + drag&drop + preview; writes session state
- `pages/analysis.vue`: shows session image and metadata; can save to dashboard
- `pages/dashboard.vue`: lists saved items; supports clear-all
