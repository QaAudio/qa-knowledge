---
name: repr-drum-grid
description: >-
  Step-sequencer drum grid (rows = pads/pitches, columns = steps) from qa-ableton-mcp
  perception tools. Bidirectional via ir.parseDrumGrid / ir.toDrumGrid. Best for drum
  patterns, groove, and kit programming.
---

# Drum grid representation (`drumGrid`)

## What it is good for

- **Drum programming** — kick/snare/hat patterns at a glance.
- **Groove editing** — add/remove hits on a fixed step grid.
- **Kit mapping** — row labels use Drum Rack pad names when a rack is on the track.

## When to use

| Use `drumGrid` | Use something else |
|----------------|-------------------|
| Drum loops, percussion | `notation` for pitched melody/chords |
| Step-sequencer thinking | `pianoRoll` for pitched overlap |
| Writing via `ir.parseDrumGrid` | `harmony` for tonal analysis |

## How to read

```json
{ "representations": ["drumGrid"] }
```

on `ableton_read_clip_notes` or `ableton_find_clip`.

Example:

```
# steps=16 resolution=1/16 bars=1
step  |................|
Kick            |x...x...x...x...|
Snare           |....x.......x...|
```

- `x` = normal hit, `X` = accent (vel≥110), `o` = ghost (vel≈60), `.` = rest.
- Resolution auto-picked from shortest note (default 1/16).

For labeled rows, ensure the track has a Drum Rack (pad names come from `read_drum_rack_map`).

## How to write

```ts
const grid = `Kick            |x...x...x...x...|
Snare           |....x.......x...|`;
const notes = ir.parseDrumGrid(grid);
withinTransaction(() => { clip.notes = notes; });
```

Pass pad map from `read_drum_rack_map` when row labels are pad names:

```ts
const map = pads.map(p => ({ receivingNote: p.receivingNote, label: p.sampleLabel ?? p.devices[0]?.name }));
const notes = ir.parseDrumGrid(grid, { drumPadMap: map });
```

## Cross-references

- `repr-notation` — pitched melodic content
- `repr-piano-roll` — pitched matrix view
- `read_drum_rack_map` — pad → MIDI pitch map
