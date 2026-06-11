---
name: continue-composition
description: Workflow for developing or finishing existing musical material in Ableton Live via qa-ableton-mcp — extend a loop, write variations, develop motives, add fills/transitions, and build out song sections from what already exists. Use when the user wants to continue, vary, or finish a composition rather than start one.
---

# Workflow: continue / finish a composition

Take what already exists and develop it — variation, motivic development, fills, and
song form. This is where **music-strategies** (what to write) meets **ableton-midi** /
**ableton-arrangement** (how to execute).

## Steps
1. **Perceive** — `ableton_scan_context` for the whole Set; `ableton_scan_track` for
   arrangement clips; `ableton_read_clip_notes` on the existing clips so you develop the
   *actual* material, not a guess.
2. **Source knowledge** — `search_knowledge(query="develop/finish/vary a composition", skill_name="music-strategies")`
   for ideas (contour, motives, voice leading, ghost notes, subtractive arranging); then
   `skill_name="ableton-midi"` for note-level execution and `skill_name="ableton-arrangement"`
   for section/form. `get_knowledge_chunk`/`invoke_skill` for full bodies.
3. **Plan** — decide the development move (variation, answer phrase, fill, new section,
   build/breakdown) and the smallest set of clip edits/creates that realize it.
4. **Validate** — `ui.confirm` with a plan summary before building (see **ableton-safety**);
   confirm once up front for a multi-clip build, not per sub-step.
5. **Execute** — `ableton_run_code`, batched in `withinTransaction` for one-undo. Reuse
   **midi-clip-create** / **midi-clip-edit** / **reorganize-clips** for the concrete edits.
6. **Verify** — re-scan and read back the new/edited clips; check the development reads
   musically against the original.

## Watch out
- Keep edits additive and legible (don't clobber the user's existing clips).
- Develop in the Set's key/scale unless intentionally departing from it.
