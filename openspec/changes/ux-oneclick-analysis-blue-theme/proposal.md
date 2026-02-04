# Proposal: One-click "Analyze with AI" + Vibrant Blue Theme

## Intent
Improve the image analysis UX so users can analyze an uploaded image with fewer steps, and refresh the app’s overall color palette to a vibrant blue.

## Problems
1. Current flow requires two separate actions after selecting an image:
   - Go to Analysis
   - Click "Analyze with AI"
   This increases friction and harms UX.
2. Current UI accent palette is a muted green; user wants an energetic blue.

## Scope
- UX:
  - From Upload page, provide a primary CTA that goes directly to AI analysis (one click after selecting an image).
  - Support auto-start analysis when arriving at /analysis via a query flag.
  - Keep current /analysis manual button as a fallback.
- Theme:
  - Update global accent colors in `assets/css/style.css` from green to vibrant blue.
  - Replace hard-coded green RGBA uses with CSS variables (where reasonable) to keep palette consistent.

## Non-goals
- No changes to backend AI endpoint behavior.
- No new auth / storage changes.

## Acceptance Criteria
- After an image is selected on Upload, user can press a single button to start AI analysis without needing to press "前往Analysis" and then "Analyze with AI".
- /analysis supports `?autostart=1` (or equivalent) to trigger analysis automatically when session exists.
- App accent/UI highlights are visibly vibrant blue across pages.
- Existing navigation still works.
