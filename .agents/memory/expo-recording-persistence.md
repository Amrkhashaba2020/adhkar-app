---
name: Expo audio recording persistence
description: Why user voice recordings silently stop playing after app restart, and how to persist them
---

# Expo recording persistence

`expo-av` `Audio.Recording.getURI()` returns a URI in the **cache directory**, which the OS purges. Persisting that URI in storage means playback works right after recording but silently fails after an app restart/cache eviction (errors are usually swallowed in catch blocks).

**Rule:** copy the recording out of cache into the persistent document directory on save, store that persistent URI, and delete the file on delete. Also validate stored URIs on startup (`File.exists`) and drop dead ones so cards can fall back to bundled audio instead of failing silently.

**How to apply:** SDK 54 uses `expo-file-system` v19 new class API — `import { Directory, File, Paths } from "expo-file-system"`; `new Directory(Paths.document, "recordings")`, `dir.create({ intermediates: true, idempotent: true })`, `new File(uri).copy(dest)`, `file.extension`, `file.exists`, `file.delete()` — all synchronous. Legacy API (`documentDirectory`, `copyAsync`) lives at `expo-file-system/legacy`.

**Why:** the Adhkar app's recorded-voice feature for Quran cards appeared broken because recordings were stored as cache URIs that disappeared.
