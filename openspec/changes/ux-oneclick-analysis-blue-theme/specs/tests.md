# Test Plan

## Manual
- T1: Upload an image → "Analyze with AI" button appears → click it → navigates to /analysis and auto starts.
- T2: Open /analysis with a valid session but without `autostart=1` → no auto call; user can manually click Analyze.
- T3: Open /analysis?autostart=1 without a session → no call; warning UI shown.
- T4: Visual check that primary buttons, nav active background, pills, and dropzone highlights are blue.
