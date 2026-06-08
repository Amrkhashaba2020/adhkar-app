---
name: EAS Android build fails on SDK-incompatible native module versions
description: Why the Adhkar Expo app's EAS Android builds errored while Metro/web ran fine, and how to prevent it.
---

# EAS native builds break on wrong native-module versions even when dev/web works

The Expo mobile app (`artifacts/mobile`) had `expo-file-system`, `expo-keep-awake`, and
`expo-notifications` pinned to bogus major versions (`^56.x`) that are incompatible with the
installed Expo SDK (54). Metro bundler and the web preview ran fine, so the mismatch was
invisible during development — but every EAS Android build **errored** during the native
(gradle/autolinking) phase. Multiple consecutive build attempts failed for this reason.

**Why:** EAS compiles native modules; SDK-incompatible native package versions fail at the
gradle/autolinking step. The JS bundler (Metro/web) never exercises that path, so a dev server
that "works" tells you nothing about whether the native build will succeed.

**How to apply:** Before any EAS native build, ensure all `expo-*` / native RN packages match the
installed SDK. `npx expo start` prints a "packages should be updated for best compatibility"
warning listing every mismatch — treat that as a build blocker, not a cosmetic warning. Run
`npx expo install --fix` (it rewrites package.json to SDK-compatible versions), then
`pnpm --filter @workspace/mobile install`, verify the versions in `node_modules/<pkg>/package.json`,
restart the expo workflow to confirm a clean Metro bundle, then trigger the EAS build.
Note: `expo install --fix` can hang/time out in this environment even though it has already
rewritten package.json — verify package.json and reinstall rather than assuming it failed.
