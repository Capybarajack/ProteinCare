# Change: Nuxt upload to Supabase Storage (meal-photos)

## Goal
Make the Nuxt app upload the selected image file to Supabase Storage bucket `meal-photos` for the authenticated user, and store the resulting `{ bucket, path }` (and optionally a URL) into the existing upload session so Analysis can use it later.

## Non-goals (this change)
- Persisting analysis results to DB tables.
- Switching backend analyze flow to fetch from signed URL.

## Acceptance criteria
- When user selects/drops an image in `/upload`, the app uploads it to `meal-photos` via `supabase.storage.from('meal-photos').upload(...)`.
- Upload path is namespaced by user id (e.g. `<userId>/<uuid>.<ext>`).
- UI shows a clear success indicator and any upload error.
- The upload session (`useUploadSession`) includes `storageBucket` and `storagePath` when upload succeeds.

## Notes / assumptions
- Bucket `meal-photos` exists.
- Storage RLS/policies allow authenticated users to upload into their own `<userId>/` prefix.
