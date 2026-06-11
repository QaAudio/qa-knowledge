---
name: midi-tracks
description: Workflow for managing MIDI tracks in Ableton Live via qa-ableton-mcp — create, rename, reorder, route (I/O), arm, group/ungroup, and delete MIDI tracks so clips have a home. Use when the task is about the tracks themselves rather than the clips or notes on them.
---

# Workflow: manage MIDI tracks

The track layer — make and organize the MIDI tracks that hold clips. Clip/note work
lives in **midi-clip-create** / **midi-clip-edit**.

## Steps
1. **Perceive** — `ableton_scan_context` for the current tracks, their types, names,
   order, and routing. Know what exists before adding or deleting.
2. **Source knowledge** — `search_knowledge(query="create/rename/route/group MIDI tracks in run_code", skill_name="ableton-midi")`;
   the track recipes also live in the MCP run_code recipes (`search_knowledge(query="tracks recipe createMidiTrack")`).
   `get_knowledge_chunk` for the exact API; never guess method/property names.
3. **Plan** — the smallest set of track ops: `song.createMidiTrack()`, set `track.name`,
   reorder/group, set I/O routing, arm. New tracks insert after the selected track or append.
4. **Validate** — `ui.confirm` before creating, renaming, regrouping, or **deleting**
   tracks (`danger:true` for deletes — see **ableton-safety**). Deleting a track destroys
   its clips; confirm explicitly.
5. **Execute** — `ableton_run_code`, batched in `withinTransaction` for one-undo (e.g.
   rename every track in one step).
6. **Verify** — re-`ableton_scan_context`; track indices/handles shift after add/delete,
   so re-scan before referencing tracks by index.

## Watch out
- Handles are ephemeral — never reuse a track index across a structural edit.
- Built-in routing/devices only; no transport control. Confirm routing targets via qdrant
  before relying on names.
