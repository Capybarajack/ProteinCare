# Design

## UX Flow
- Upload page:
  - When `previewUrl` exists, show a **primary** CTA: "Analyze with AI".
  - Clicking it navigates to `/analysis?autostart=1`.
  - The existing "前往 Analysis" can be removed or demoted (secondary) to avoid redundant steps.

- Analysis page:
  - On mount, if session exists AND query `autostart=1` AND analysis not already run, automatically call `analyzeWithAI()`.
  - Ensure no auto-call when session missing.
  - Ensure no repeated calls on reactive updates.

## Theme
- Switch accent from green to energetic blue.
- Prefer defining:
  - `--accent` (blue)
  - `--accent-dark` (deeper blue)
  - Optional: `--accent-rgb` for RGBA derivations.
- Replace repeated hard-coded `rgba(134, 163, 143, …)` uses with `rgba(var(--accent-rgb), …)`.

## Notes
- Keep contrast accessible for white text on primary buttons.
- Keep the rest of the neutral UI unchanged.
