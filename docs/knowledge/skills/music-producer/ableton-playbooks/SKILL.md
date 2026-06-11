---
name: ableton-playbooks
description: End-to-end procedures that build complete musical results in Ableton Live — e.g. "make an 8-bar loop", "sketch a track idea", "build a beat with bass and chords". Use when the user wants a whole multi-part deliverable (loop / groove / track section with drums + bass + chords + lead + a rough mix), not a single atomic edit. Orchestrates the ableton-midi / music-strategies / ableton-sound-design / ableton-arrangement / ableton-mixing skills.
---

# Ableton playbooks

Playbooks are **goal-oriented procedures** that compose the knowledge skills into a
complete, in-key, tempo-coherent deliverable with a rough mix. Use a playbook when the
ask is a *whole thing* ("make me a loop / a beat with bass and chords / a track
sketch"). For a single atomic edit ("write a Cm chord", "add a reverb"), use the WP4
skills directly (`ableton-midi`, `ableton-sound-design`, …).

## Shared workflow (every playbook follows this)
1. **Scan** — `ableton_scan_context`: read the Set's `tempo` and `scale`
   (`rootNote`/`scaleIntervals`); note existing tracks so you don't clobber them.
2. **Plan** — pick the musical content with `music-strategies` (progression, beat,
   bassline, melody) and pass **one key + one tempo** through every part for coherence.
3. **Confirm** — preview the plan with `ui.confirm` before building (every change is
   confirmed — see `ableton-safety`); proceed only on Approve.
4. **Build** — create tracks + instruments (`ableton-sound-design`), then write MIDI
   (`ableton-midi`, in key via `degreeToPitch`) — wrap the mutations in one
   `withinTransaction(() => Promise.all([...]))` so the whole build is a single undo.
5. **Mix** — rough static levels/pan (+ a send if a return exists) with `ableton-mixing`.
6. **Verify** — `ableton_scan_context` / `ableton_read_clip_notes`: tracks + instruments
   present, notes in key.
7. **Report** — what was built, the key/tempo, caveats ("load drum samples to hear the
   kit"), and **"press Cmd-Z to undo"** (one entry if grouped). See `ableton-safety`.

## Playbook library (`playbooks/`)
| Playbook | Builds | Status |
|----------|--------|--------|
| `eight-bar-loop.md` | Drums + Bass + Chords + Lead → one launchable 8-bar Session scene, in key, instruments + light mix | **ready** |
| drum-beat | genre drum patterns on a Drum Rack | pending (WP5b) |
| chords-and-pad | a progression with a pad sound | pending (WP5b) |
| bassline | bass+kick-composite bass with a synth | pending (WP5b) |
| arrange-loop | turn a loop into an arranged track (sections) | pending (WP5b) |
| mix-balance | levels / EQ carve / sends pass | pending (WP5b) |

## Playbook structure (how each file is written)
Goal/when → **Parameters + defaults** (runs with zero input) → **Procedure**
(perceive→plan→build→mix→verify→report, each step naming the skill) → **Consolidated
`run_code`** (the centerpiece) → **Definition of done** → **Variations/knobs** →
**Caveats**. Playbooks **reference** the WP4 skills; they don't restate device params
or theory.

## Cross-cutting caveats (SDK limits that shape every playbook)
- **Drums need samples** — a fresh Drum Rack has no pads loaded and the SDK can't load
  factory kits; write the pattern + tell the user to drop samples, or use a synth-drum
  variation. Melodic parts (synths) always sound.
- **No automation** — static parameter values only (no risers/sweeps/sidechain pumping).
- **Built-in devices only**, **clip length fixed at creation**, **re-perceive after structural edits**.
