---
name: ableton-music-producer
description: >-
  Music producer skill subset for qa-ableton-mcp — compose, arrange, mix, and
  sound-design in Ableton Live via MCP scan/read and (mostely) run_code tools.
  Use when the user asks to create or edit musical content in the open Live set
  (MIDI, clips, devices, levels, playbooks).
---

# Music producer (MCP subset)
Load child skills from this directory based on the task. All actions go through the **qa-ableton-mcp** server (`ableton_run_code`, perception tools).

## Child skills

| Skill | When |
|-------|------|
| **ableton-midi** | MIDI clips, notes, chords, melodies, drum patterns, transformations |
| **ableton-arrangement** | Song structure, arrangement clips, automation limits |
| **ableton-sound-design** | Built-in devices, racks, macros, timbre |
| **ableton-mixing** | Levels, routing, sends, mix techniques |
| **ableton-playbooks** | Multi-step recipes (e.g. eight-bar loop) |
| **ableton-safety** | Guardrails, undo/transactions, UI confirm dialogs |
| **ableton-warping** | Audio warping and tempo |
| **music-strategies** | Melody, harmony, rhythm intent (what to write) |
| **repr-notation** | Bar:beat text notation (read + `ir.parseNotation` write) |
| **repr-drum-grid** | Step-sequencer drum grid |
| **repr-harmony** | Per-bar chord/key analysis (read-only) |
| **repr-piano-roll** | ASCII piano-roll matrix |
| **repr-structure** | Bar-timeline across tracks (scan_context/scan_track) |

## Workflow

1. **Scan** — Starts with `ableton_scan_context`, drill-down (`scan_track` for arrangement clips,
   `read_clip_notes` with optional `representations`, `read_device`, `read_drum_rack_map`, …). See umbrella **ableton-mcp** routing.
2. **Plan** — pick the child skill(s) above; keyword skills auto-inject — or call `invoke_skill(name="…")` for the full body; read `reference/*.md` via `file_editor` using paths from the skill footer.
3. **Validate** — `ui.confirm(...)` before destructive or large edits.
4. **Execute** — `ableton_run_code` for all writes (batch in `withinTransaction`). Use
   `ableton_remap_clip_notes` only for batch pitch remaps after `read_drum_rack_map`. On tool error:
   fix and retry that tool — partial fallback, not full SDK pivot.
5. **Verify** — re-scan context or `ableton_read_clip_notes` after edits.

## Prerequisites

Same as extension-dev: kernel dev-run (`npm run ableton-mcp:kernel:dev`), MCP built and registered. Only mutate Live when the user explicitly requests production edits.
