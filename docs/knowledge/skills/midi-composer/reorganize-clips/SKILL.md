---
name: reorganize-clips
description: Workflow for reorganizing a MIDI track's clips in Ableton Live via qa-ableton-mcp — duplicate, move, reorder, and clear clips across Session slots and the Arrangement timeline to build or rework song structure. Use when laying out clips in time, not when writing the notes inside them.
---

# Workflow: reorganize a track's clips

The *over-time* layer — move clips around to build song form. Contents of the clips
belong to **midi-clip-edit**; this places them in time. Depth in **ableton-arrangement**.

## Steps
1. **Perceive** — `ableton_scan_context` for Session `clipSlots`/scenes; **`ableton_scan_track`**
   for `arrangementClips` (they are **not** on `scan_context`). Map what's where before moving.
2. **Source knowledge** — `search_knowledge(query="place/duplicate/move/clear arrangement clips, song structure", skill_name="ableton-arrangement")`;
   `get_knowledge_chunk` for the exact placement recipe and the automation/clip-envelope limits.
3. **Plan** — decide section layout (intro/verse/chorus/breakdown/outro) and beat
   positions (bar N in 4/4 starts at beat `(N-1)*4`). Clip length/loop is fixed at
   creation — plan section lengths up front.
4. **Validate** — `ui.confirm` before moving/duplicating/clearing the user's clips
   (`danger:true` for clears/overwrites — see **ableton-safety**).
5. **Execute** — `ableton_run_code`: duplicate/place/clear ranges, add cue points,
   batched in `withinTransaction` for one-undo.
6. **Verify** — `ableton_scan_track` `arrangementClips` / `ableton_read_clip_notes {kind:"arrangementClip", …}`.

## Watch out
- No clip fades and no programmatic automation in the SDK (you can `setValue` a current
  parameter value, not write time-varying automation) — confirm via qdrant before promising.
- Re-scan after structural edits; indices/handles shift.
