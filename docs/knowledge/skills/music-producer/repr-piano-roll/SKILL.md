---
name: repr-piano-roll
description: >-
  ASCII piano-roll matrix (rows = pitches, columns = time steps) from qa-ableton-mcp
  perception tools. Bidirectional via ir.parsePianoRoll / ir.toPianoRoll. Best for
  visual rhythm, overlap, and sustain checks.
---

# Piano roll representation (`pianoRoll`)

## What it is good for

- **Visual rhythm** — see note density and gaps across time.
- **Overlap detection** — sustain runs (`#` onset, `=` held).
- **Quick sanity check** after edits (compare before/after matrices).

## When to use

| Use `pianoRoll` | Use something else |
|-----------------|-------------------|
| Visual timing/overlap | `notation` for compact chord/melody text |
| Dense polyphonic clips | `drumGrid` for unpitched drums |
| Matrix-style editing | `harmony` for chord labels |

## How to read

```json
{ "representations": ["pianoRoll"] }
```

on `ableton_read_clip_notes` or `ableton_find_clip`.

Example:

```
# steps=16 step=0.25b pitches=3
      |1.......|2.......|
C5    |#.......|........|
E4    |#=======|........|
C4    |#=======|........|
```

- `#` = note onset, `=` = sustained, `.` = empty.
- Rows sorted high pitch → low.

## How to write

```ts
const roll = `C4    |#...#...#...#...|`;
const notes = ir.parsePianoRoll(roll);
withinTransaction(() => { clip.notes = notes; });
```

Sustain runs become single notes with combined duration.

## Cross-references

- `repr-notation` — primary LLM reasoning format
- `repr-drum-grid` — unpitched step patterns
