---
name: midi-clip-edit
description: Workflow for editing the notes inside an existing MIDI clip in Ableton Live via qa-ableton-mcp — add/remove notes, transpose, quantize, humanize, apply groove, or reproduce Live's MIDI transformations. Use when changing the contents of a clip that already exists, not creating one.
---

# Workflow: edit a MIDI clip

Change the notes in a clip that already exists. Thin checklist — depth in qdrant +
**ableton-midi**.

## Steps
1. **Perceive** — `ableton_scan_context` to locate the track/clip; `ableton_read_clip_notes`
   on the clip `addr` to read the current notes before changing them.
2. **Source knowledge** — `search_knowledge(query="…", skill_name="ableton-midi")` for the
   operation: transpose/scale-lock → scales-and-harmony; arpeggiate/strum/ornament →
   midi-transformations; quantize/swing/humanize → quantize-and-groove. `get_knowledge_chunk`
   for the exact note-array recipe. Live's interactive MIDI Tools are **not** in the SDK —
   reproduce their effect on the note array.
3. **Plan** — operate on the read-back note array; preserve notes you aren't changing.
   For batch **pitch** remaps (e.g. drum-rack re-mapping) prefer `ableton_remap_clip_notes`.
4. **Validate** — `ui.confirm` before overwriting an existing clip's notes (see **ableton-safety**).
5. **Execute** — `ableton_run_code`: assign the new `clip.notes`, batched in
   `withinTransaction` for one-undo.
6. **Verify** — `ableton_read_clip_notes` again; confirm only the intended notes changed.

## Watch out
- Note `startTime` is clip-relative (beats from clip start), not arrangement time.
- Handles are ephemeral — re-scan after structural edits; clip length/loop can't change
  (to "resize" you must delete and recreate — that's **midi-clip-create**).
