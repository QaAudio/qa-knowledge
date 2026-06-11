---
name: ableton-midi
description: Compose and edit MIDI in Ableton Live through the qa-ableton-mcp MCP tools — create MIDI clips (Session or Arrangement), write notes/chords/melodies/basslines/drum patterns, work in a key/scale, and apply transformations (arpeggiate, strum, quantize, humanize, groove). Use whenever the task is making or editing MIDI musical content in Live via run_code.
---

# Ableton MIDI composition & editing

You drive Live through the **qa-ableton-mcp** MCP tools (`ableton_run_code`,
`ableton_scan_context`, `ableton_read_clip_notes`, `ableton_read_device`, …). This
skill is the *musical knowledge* layer; the MCP server is the *action* layer.

## Workflow
1. **Scan** — `ableton_scan_context` for tracks, session `clipSlots`, scenes, tempo, and
   scale. Arrangement timeline clips require **`ableton_scan_track`**. Every object carries a
   stable `addr`.
2. **Decide what to make** — for melody/harmony/rhythm intent, consult the
   **`music-strategies`** skill (contour, motives, voice leading, 3+3+2, ghost
   notes, etc.). This skill is the *how-to-execute*; that one is the *what-to-write*.
3. **Validate** — confirm destructive or large edits with `ui.confirm`.
4. **Execute** — `ableton_run_code` for all writes; `ableton_remap_clip_notes` only for batch pitch remaps after `read_drum_rack_map`. If a scan/read tool errors, fix args and **retry that tool** — do not re-implement reads in `run_code`.
5. **Verify** — `ableton_read_clip_notes` on the clip's `addr` to confirm pitches,
   timing, in-key notes, and **clip length vs note span** (see hard limits below).
   Prefer `representations: ["notation"]` (or `drumGrid` / `harmony`) for readable
   verification; use raw `notes[]` when asserting exact SDK values.

## Reference (read on demand)
| File | When |
|------|------|
| `reference/clips-and-notes.md` | Creating clips (Session vs Arrangement), the note model, reading back |
| `repr-notation` / `repr-drum-grid` / `repr-harmony` / `repr-piano-roll` | Intermediate representations on `read_clip_notes` |
| `reference/scales-and-harmony.md` | Pitch numbers, scales/modes, building chords & progressions, voice leading — as run_code helpers |
| `reference/midi-transformations.md` | Reproduce Live's MIDI Tools (arpeggiate, strum, ornament, recombine, …) on note arrays |
| `reference/quantize-and-groove.md` | Quantize to grid, swing/groove, humanize timing & velocity |
| `examples.md` | Copy-paste run_code recipes (progression, scale-locked melody, drum beat, arpeggio) |

For raw SDK types, `search_knowledge` for the Ableton SDK types (`ableton-sdk/sdk-types.md`); for
bindings/limits, `search_knowledge` for the SDK quickstart.

## Hard limits (design around these)
- **Clip length and loop region are fixed at creation.** For MIDI, `loopStart`/`loopEnd`
  always equal the full clip — the SDK cannot set a shorter loop brace inside a long clip.
  Do **not** use `lengthBeats=40` + notes in 0–4 + `looping:true` expecting a 4-beat tile;
  either set `lengthBeats` to the pattern length, or **write notes across the full section
  length**. See `reference/clips-and-notes.md` § “Clip length vs loop region”.
- **Arrangement clips default to looping on** in Live — set `looping: false` for one-shots.
  The `looping` flag repeats the **entire** clip length, not a short musical pattern.
- **Note `startTime` is clip-relative** (beats from the clip's start), not arrangement time.
- **Handles are ephemeral**; indices shift after add/delete. Re-`scan_context` after structural edits.
- **No transport/playback** and **no programmatic undo** — rely on Live's native undo. Make edits legible.
- **Before overwriting an existing clip's notes** (or writing into an occupied slot): confirm + report "Cmd-Z to undo" — see **`ableton-safety`**.
- Live's interactive **MIDI Tools / Groove Pool / tuning systems are not in the SDK** —
  reproduce their effect in `run_code` (see the transformation/groove references).
- Work in **12TET MIDI pitches** (0–127); respect the Set's scale when composing tonal material.
