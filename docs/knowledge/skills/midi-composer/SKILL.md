---
name: midi-composer
description: MIDI composition workflows for Ableton Live via qa-ableton-mcp — manage MIDI tracks, create and edit MIDI clips, write and transform notes, continue or finish existing compositions, and reorganize a track's clips. Knowledge-first: route to qa-knowledge-mcp (qdrant) and the deep ableton-* reference skills before composing or running code. Use whenever the task is making or editing MIDI musical content in the open Live set.
---

# MIDI composer (workflow router)

This is the **entry point** for MIDI composition in Live. It does not carry the deep
technique itself — it names the **workflow**, then sends you to source the real
reference from **qa-knowledge-mcp** (qdrant) and correct skills.

## Workflow children (this directory)
Pick the workflow that matches the request; each one is a short checklist that points
back to qdrant + the reference skill it depends on.

| Workflow skill | Use when |
|----------------|----------|
| **midi-clip-create** | Make a new MIDI clip (Session slot or Arrangement) and seed notes |
| **midi-clip-edit** | Change notes in an existing clip — add/remove, transpose, quantize, transform |
| **continue-composition** | Develop or finish existing material: variations, motives, fills, new sections |
| **reorganize-clips** | Duplicate/move/reorder a track's clips; Session↔Arrangement; build song form |
| **midi-tracks** | Create / rename / route / arm / group / delete MIDI tracks |

## Reference skills (linked via agents.json → music-producer)
Reach these through qdrant (`search_knowledge` / `get_knowledge_chunk`) or
`invoke_skill`; their keyword triggers also auto-inject on a match.

| Reference skill | Layer it provides |
|-----------------|-------------------|
| **ableton-midi** | Clip & note model, scales/harmony, MIDI transformations, quantize/groove, recipes |
| **ableton-arrangement** | Arrangement timeline, song structure, automation limits |
| **music-strategies** | *What* to write — melody, harmony, rhythm, finishing intent |
| **ableton-safety** | Confirm-before-change, one-undo grouping, don't-clobber rules |

## The loop (flexible, not linear)
1. **Intent** — clarify the musical goal; explain before mutating if the user asked "why".
2. **Perceive** — `ableton_scan_context` (tracks, tempo, scale, session slots; `representations: ["structure"]` for timeline); `ableton_scan_track` for arrangement clips; `ableton_read_clip_notes` with `representations: ["notation"]` (or `drumGrid` / `harmony`) to read existing notes.
3. **Source knowledge** — `search_knowledge` for the technique/recipe/limit (skill-filtered). Loop back here whenever you're unsure.
4. **Plan** — smallest change that satisfies the goal.
5. **Validate** — `ui.confirm` before any change (see **ableton-safety**); `danger:true` for deletes/overwrites.
6. **Execute** — `ableton_run_code` for all writes, batched in `withinTransaction` for one-undo; `ableton_remap_clip_notes` only for batch pitch remaps.
7. **Verify** — re-scan / `ableton_read_clip_notes`; handles are ephemeral after structural edits.

## Hard limits (always design around)
MIDI clip length/loop is fixed at creation; note `startTime` is clip-relative; no
programmatic automation or undo; no transport control; built-in devices only. Confirm
the specifics with `search_knowledge` (skill_name `ableton-midi` / `ableton-arrangement`)
before relying on them.
