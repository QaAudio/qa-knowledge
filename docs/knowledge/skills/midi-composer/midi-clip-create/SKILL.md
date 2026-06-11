---
name: midi-clip-create
description: Workflow for creating a new MIDI clip in Ableton Live via qa-ableton-mcp — pick a target (Session clip slot or Arrangement position), set clip length, and seed notes/chords/melody/drum pattern. Use when the task is making a fresh MIDI clip, not editing an existing one.
---

# Workflow: create a MIDI clip

Make a new MIDI clip and write its initial content. Thin checklist — the depth lives
in qdrant + **ableton-midi**.

## Steps
1. **Perceive** — `ableton_scan_context` for tracks, tempo, scale, and free session
   `clipSlots` (or `ableton_scan_track` for the Arrangement timeline). Confirm the
   target track is a MIDI track and the slot/range is empty (don't clobber).
2. **Source knowledge** — `search_knowledge(query="create MIDI clip and write notes", skill_name="ableton-midi")`;
   for arrangement placement use `skill_name="ableton-arrangement"`. For *what* notes to
   write (melody/chords/bassline/drums) `search_knowledge(..., skill_name="music-strategies")`.
   `get_knowledge_chunk` for the full recipe; never guess the clip/note shape.
3. **Plan** — choose **Session** (`clipSlot.createMidiClip(length)`) vs **Arrangement**
   (placed at a beat position). Set `lengthBeats` to the pattern length — clip length &
   loop are **fixed at creation** and can't shrink later. Note `startTime` is clip-relative.
4. **Validate** — `ui.confirm` before writing (see **ableton-safety**).
5. **Execute** — `ableton_run_code`: create the clip then assign `clip.notes = [...]`,
   batched in `withinTransaction` for one-undo.
6. **Verify** — `ableton_read_clip_notes` on the clip's `addr`; check pitches, timing,
   in-key, and clip length vs note span.

## Watch out
- Arrangement clips default to **looping on** — set `looping:false` for one-shots.
- Don't use a long clip + short notes + `looping:true` expecting a tile; the SDK loop
  spans the whole clip. Set `lengthBeats` to the pattern, or write notes across the section.
