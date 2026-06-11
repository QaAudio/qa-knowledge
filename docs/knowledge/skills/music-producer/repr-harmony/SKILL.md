---
name: repr-harmony
description: >-
  Per-bar harmonic summary (detected chords, key fit, pitch-class profile) from
  qa-ableton-mcp perception tools. Read-only analysis representation — use for
  harmonic reasoning without parsing raw note JSON.
---

# Harmony representation (`harmony`)

## What it is good for

- **Harmonic analysis** — what chords appear per bar.
- **Key checking** — which notes are in/out of the Set scale (`scan_context` → `scale`).
- **Arrangement decisions** — spotting wrong notes or chord clashes before editing.

## When to use

| Use `harmony` | Use something else |
|---------------|-------------------|
| Chord/key analysis, Roman numerals | `notation` to read/write exact notes |
| Quick tonal audit | `drumGrid` for unpitched drums |
| Read-only summary | `pianoRoll` for timing detail |

**Not bidirectional** — cannot write notes from harmony text. Use `notation` or SDK JSON to edit.

## How to read

```json
{ "representations": ["harmony"] }
```

on `ableton_read_clip_notes` or `ableton_find_clip`.

Example:

```
# key=Minor root=9 time=4/4
bar 1: Am (A3 C4 E4) in-key
bar 2: F (F3 A3 C4) in-key
out-of-key:
  G#3 at 1:2.5
pitch-class profile: A:8 C:6 E:4 F:2
```

Chord detection is heuristic (pitch-class sets per bar). Cross-check with `notation` for voicing detail.

## Cross-references

- `repr-notation` — exact pitches and write path
- `ableton-midi` → `reference/scales-and-harmony.md` — scale helpers for `run_code`
- `music-strategies` — harmonic intent and progressions
