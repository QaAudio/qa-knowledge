---
name: repr-notation
description: >-
  Compact bar:beat note notation (ABC-inspired) returned by qa-ableton-mcp perception tools
  and parsed back via ir.parseNotation in run_code. Best for melody, chords, bass lines,
  and harmonic reasoning. Use when raw JSON note arrays are hard to scan.
---

# Notation representation (`notation`)

## What it is good for

- **Reasoning** about melody, harmony, and timing in natural musical units (bars, beats, note names).
- **Composing** new material in text, then writing with `ir.parseNotation` → `clip.notes`.
- **Comparing** clips by eye (chord voicings, rhythmic placement).

## When to use (vs other representations)

| Use `notation` | Use something else |
|----------------|-------------------|
| Melody, chords, bass, harmonic edits | `drumGrid` for step-sequencer drums |
| Writing notes via `ir.parseNotation` | `harmony` for chord/key analysis only |
| Compact event list | `pianoRoll` for visual overlap/rhythm checks |
| Clip-level detail | `structure` for multi-track timeline |

## How to read

```json
{ "representations": ["notation"] }
```

on `ableton_read_clip_notes`, `ableton_find_clip`.

Example output:

```
# tempo=120 key=Minor(9) time=4/4 length=16b clip="Chords"
bar 1:
  1:1 [A3 C4 E4] q
  2:1 [F3 A3 C4] q
```

- Positions are `bar:beat` (1-based).
- Durations: `w` `h` `q` `8` `16` `32` (beats) or `Nb` for N beats.
- Chords: `[C4 E4 G4]` at one onset.
- `vel=` and `prob=` only when non-default.

## How to write (bidirectional)

```ts
const text = `bar 1:
  1:1 C4 q
  1:2 E4 8
  1:2.5 G4 8`;
const notes = ir.parseNotation(text);
withinTransaction(() => { clip.notes = notes; });
```

Re-encode for verification: `ir.toNotation(clip.notes, ctx)` — build a minimal `ctx` with tempo/time signature from `scan_context` if needed; the parser uses bar:beat positions, not the header.

## Cross-references

- `repr-drum-grid` — drum patterns on a step grid
- `repr-harmony` — per-bar chord/key analysis (read-only)
- `repr-piano-roll` — ASCII matrix for rhythm/overlap
- `repr-structure` — arrangement timeline across tracks
- Default SDK JSON — programmatic assertions (`notes[]` with pitch/startTime/duration)
