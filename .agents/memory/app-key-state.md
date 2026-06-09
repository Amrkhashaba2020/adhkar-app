---
name: App key state
description: Current AsyncStorage keys, versionCode, and rules for bumping them.
---

## Current values (as of last edit)
- `ADHKAR_KEY = "@adhkar_v17"` — bump whenever DEFAULT_MORNING or DEFAULT_EVENING changes
- `RECORDINGS_KEY = "@recordings_v1"` — bump only if recordings schema changes
- `versionCode = 17` (app.json) — bump before every EAS build

## Bump rules
- **ADHKAR_KEY**: any add/remove/edit in DEFAULT_MORNING or DEFAULT_EVENING forces old cached adhkar to be discarded and rebuilt from defaults on next app launch.
- **versionCode**: must increment before each `eas build` command (never reuse).
- **RECORDINGS_KEY**: only if the shape of the recordings Record changes.

**Why:** AsyncStorage persists across updates. If the default list changes but the key stays the same, users keep the old list and never see the new defaults.
