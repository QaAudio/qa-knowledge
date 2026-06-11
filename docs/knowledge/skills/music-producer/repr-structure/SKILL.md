---
name: repr-structure
description: >-
  Bar-timeline arrangement view (clip blocks per track) from ableton_scan_context and
  ableton_scan_track. Read-only structure representation for song-form and layout reasoning.
---

# Structure representation (`structure`)

## What it is good for

- **Song form** — where intro/verse/chorus clips sit on the timeline.
- **Layout overview** — session vs arrangement clip placement per track.
- **Planning edits** — which track/region to target before drilling into notes.

## When to use

| Use `structure` | Use something else |
|-----------------|-------------------|
| Multi-track timeline, sections | `notation` for note-level detail |
| `scan_context` / `scan_track` overview | `read_clip_notes` for MIDI content |
| Arrangement planning | `harmony` for tonal analysis inside one clip |

**Not bidirectional** — describes layout, not note content.

## How to read

```json
{ "representations": ["structure"] }
```

on `ableton_scan_context` (all tracks) or `ableton_scan_track` (one track).

Example:

```
# tempo=120 time=4/4 bars=16
ruler  |1234567890123456|
0 Drums         |====........====|
1 Bass          |....========....|
  (session)     |====........====|
```

- `=` MIDI clip, `~` audio clip, `-` other, `.` empty.
- `(session)` row appears when both session and arrangement clips exist.

## Cross-references

- `ableton-arrangement` — executing layout edits
- `repr-notation` / `read_clip_notes` — drill into a clip block
- `scan_context` → `perceiveHints` — session-only MIDI warnings
