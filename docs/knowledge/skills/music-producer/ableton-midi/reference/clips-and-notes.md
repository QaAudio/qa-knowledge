# MIDI clips & the note model

All facts here are verified live against the Extensions SDK (WP0–WP3). For the
authoritative types, `search_knowledge` for the Ableton SDK types (`ableton-sdk/sdk-types.md`).

## Tracks

Create new regular tracks with **`ableton_run_code`**:

```ts
const track = await song.createMidiTrack();
track.name = "Lead";
return { index: song.tracks.indexOf(track), name: track.name };
```

Inserts after the **currently selected** track in Live, or appends; re-scan with
`scan_context` for the authoritative `index` and `addr`. For return tracks or delete/duplicate,
use `run_code` as well. Built-in instruments only:
`await track.insertDevice("Operator", 0)` via `run_code` (no VST/AU/preset loading). A MIDI track
needs an instrument to make sound — see the `ableton-sound-design` skill.

## Creating a clip — two distinct stores (not mirrors!)

Session slots and Arrangement timeline clips are **separate**. Notes in Session clips do **not**
appear in the Arrangement piano roll. `search_knowledge` for the SDK quickstart (Session vs Arrangement section) and check
`scan_context` → `clipPlacement` / `perceiveHints` before writing.

| View | run_code | Args | Notes |
|------|----------|------|-------|
| **Session** | `track.clipSlots[i].createMidiClip(length)` | `length` in beats | scene/slot only |
| **Arrangement** | `track.createMidiClip(startTime, duration)` | beats, beats | on timeline — **prefer** when other tracks use arrangement clips |
| **Both** | Session clip + arrangement clip in one transaction | slot + beat position | two separate clips; tile notes in each as needed |

Both return a `MidiClip` (await them). **Clip length and loop region are fixed at
creation** — there is no setter for `loopStart`/`loopEnd`/`startMarker`/`endMarker` on
MIDI clips (unlike audio `loopSettings`). Pick `lengthBeats` up front.

### Clip length vs loop region (MIDI)

| Concept | SDK field | MIDI behavior |
|---------|-----------|---------------|
| Clip length | `lengthBeats` / `duration` | Set at `createMidiClip`; cannot resize later |
| Loop region | `loopStart`–`loopEnd` | **Always equals the full clip** at creation (read-only) |
| Loop on/off | `looping` | Writable; toggles whether the loop region repeats during playback |

Live's UI can place a **short loop brace inside a long clip** (e.g. 4-beat pattern in a
40-beat clip). The Extensions SDK **does not** expose that for MIDI — no `loopSettings` on
`createMidiClip`, and no setters for loop endpoints. Enabling `looping:true` on a long clip
does **not** shrink the loop region to match a short note pattern.

**Anti-pattern (broken piano roll):**

Creating a 40-beat arrangement clip with notes only in beats 0–4 and `looping: true`
→ `loopEnd === 40`, notes only in 0–4 → Arrangement piano roll shows **40 beats**, mostly
empty. **Not fixable** without delete + recreate.

**Valid patterns:**

1. **Launchable / Session loop** — clip length = pattern length (e.g. 4); notes fill 0–4.
2. **Arrangement section** — clip length = section length; **tile notes in code** across the
   full span (see `ableton-playbooks/eight-bar-loop.md`), or place **separate clips** per
   section (`ableton-arrangement/reference/arrangement-clips.md`).
3. **One-shots** — arrangement clip with `looping: false` (Live defaults arrangement clips to
   looping on; disable when the clip should not repeat).

`looping` only toggles repeat of the **full** clip length — it does not define a shorter loop brace.

```ts
// Session: a 4-beat (1-bar) clip in slot 0 — length matches the pattern
const clip = await track.clipSlots[0].createMidiClip(4);

// Arrangement: 2-bar clip at bar 3 (beat 8); tile notes across all 8 beats
const clip = await track.createMidiClip(8, 8);
clip.looping = false;   // one-shot on the timeline — disable Live's default looping
```

## The note model
`clip.notes` is a get/set array of `NoteDescription`:

| Field | Type | Meaning |
|-------|------|---------|
| `pitch` | 0–127 | MIDI note number (60 = C3 in Live's convention) |
| `startTime` | beats | **clip-relative** position (0 = clip start) |
| `duration` | beats | note length |
| `velocity` | 1–127 | loudness (optional, default ~100) |
| `probability` | 0–1 | chance the note plays (optional) |
| `velocityDeviation` | number | random velocity spread (optional) |
| `muted` | bool | note disabled (optional) |

Setting is **synchronous and wholesale** — assign the full array (read-modify-write
to edit existing notes):
```ts
clip.notes = [
  { pitch: 60, startTime: 0, duration: 1, velocity: 100 },
  { pitch: 64, startTime: 1, duration: 1, velocity: 100 },
  { pitch: 67, startTime: 2, duration: 1, velocity: 100 },
];
return { name: clip.name, noteCount: clip.notes.length };
```
To edit: `const ns = clip.notes.map(n => ({ ...n, velocity: 80 })); clip.notes = ns;`

## Pitch ↔ name
`pitch = (octave + 2) * 12 + pitchClass`, where C=0, C#=1, …, B=11. So C3 = 60,
A3 = 69, A2 (common bass A) = 45. Middle-C labeling differs by DAW; Live shows
MIDI 60 as **C3**.

## Reading back
`ableton_read_clip_notes` with the clip's `addr`:
- Session: `{ kind:"clipSlot", track:<i>, slot:<j> }`
- Arrangement: `{ kind:"arrangementClip", track:<i>, index:<k> }`

Returns clip meta (`startTime`/`endTime`/`duration`/`looping`/`color`) + full `notes[]`
(programmatic/SDK representation). Add `representations: ["notation"]` (or
`drumGrid`, `harmony`, `pianoRoll`) for LLM-friendly text — see **repr-*** skills.
Write back with `ir.parseNotation` / `ir.parseDrumGrid` / `ir.parsePianoRoll` in `run_code`.
Use `responseFormat:"detailed"` to include `loopStart`/`loopEnd` — verify
`loopEnd === duration` for MIDI and that notes cover the intended span (not a short pattern
left in a long clip).

## Grouping edits
`withinTransaction(fn)` groups **independent** mutations into one undo step (it's
synchronous — can't `await` inside; for async use `return Promise.all([...])`).
There is no programmatic undo; rely on Live's native undo.

## run_code syntax note — modern operators work
`??` (nullish coalescing), `?.` (optional chaining), `??=`, numeric separators
(`1_000`), and class fields all run natively (the kernel passes them straight to
its Node ≥24 host; verified live). The explicit equivalents used in some snippets
here (`(a == null ? b : a)`, `(obj && obj.prop)`, `if (!m[k]) m[k]=[]`) are still
correct — use whichever you prefer.
(Historical: these threw `_nullishCoalesce is not defined` before the WP2 follow-up
fix that set sucrase `disableESTransforms: true`.)
