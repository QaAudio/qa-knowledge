# Ableton MCP — quickstart

This is an Ableton Extensions SDK guide in the QuantumAgent knowledge base. Retrieve it (and the
related guides below) with the `qa-knowledge` MCP `search_knowledge` tool; the sibling files live in
`ableton-sdk/guides/`.

## Mandatory read order (before your first `ableton_run_code`)

1. **This file** — perceive→act loop, tool routing, `run_code` sandbox.
2. [`recipes.md`](recipes.md) — copy-paste snippets for tracks, MIDI, devices, mixer, media.
3. On demand: [`cheatsheet.md`](cheatsheet.md) → [`../sdk-types.md`](../sdk-types.md) for edge types.

If you skip these and guess SDK shapes, `ableton_run_code` will fail at runtime.

## The loop

1. **Scan** — `ableton_scan_context`, then narrower `ableton_scan_*` / `ableton_read_*` tools.
2. **Read / find** — drill into tracks, clips, devices, drum maps, or selection as needed.
3. **Plan** — map intent to SDK steps; read recipes when writing code.
4. **Validate** — `ui.confirm(...)` before destructive or large edits.
5. **Execute** — `ableton_run_code` for all writes; `ableton_remap_clip_notes` only for batch pitch remaps.
6. **Verify** — re-scan context after structural edits (handles are ephemeral).

## Tool routing — perception

Use scan and read tools to perceive Live state. **Do not re-implement reads in `run_code`** when a scan/read tool exists.

`scan_context` is bounded: Session `clipSlots`, device **metadata**, mixer — not arrangement clip details or notes.

| Need | Tool chain |
|------|------------|
| Set overview, session clips, clipPlacement, perceiveHints, device addrs | `ableton_scan_context` |
| Arrangement timeline clips | `ableton_scan_track { addr: { kind: "track", index: N } }` |
| MIDI notes | `ableton_read_clip_notes { addr: clipSlot \| arrangementClip }` |
| Clip by exact name | `ableton_find_clip { track, name, view? }` |
| Drum Rack pad map | `scan_context` → DrumRack `devices[].addr` → `read_drum_rack_map { addr }` |
| Device parameters | `ableton_read_device { addr: device }` |
| User selection | `ableton_read_selection` (after Send to Agent in Live) |

## Tool routing — writes

| Need | Use |
|------|-----|
| Tracks, MIDI clips/notes, devices, mixer, arrangement edits, import audio | **`ableton_run_code`** |
| Batch drum pitch remap | `ableton_remap_clip_notes` (after `read_drum_rack_map`) |
| Pre-FX WAV export | `ableton_render_audio { addr, startBeat, endBeat }` |

**Rule:** scan and read with scan/read/find tools. After a tool error, fix and retry that call — do not pivot reads into `run_code`.

## Address shapes

Copy addrs from scan/read responses verbatim.

| `kind` | Shape | Used for |
|--------|-------|----------|
| `track` | `{ kind: "track", index: N, name?: "…" }` | `scan_track`, `render_audio` |
| `device` | `{ kind: "device", track: N, index: D, chain?: […] }` | `read_device`, **`read_drum_rack_map`** |
| `clipSlot` | `{ kind: "clipSlot", track: N, slot: S }` | `read_clip_notes`, MIDI write via `run_code` |
| `arrangementClip` | `{ kind: "arrangementClip", track: N, index: K }` | `read_clip_notes`, MIDI write via `run_code` |

**Wrong:** bare `1`, `track: 1`, or `{ track: 1 }` unless the tool schema uses a flat `track` field.

### Flat `track` exceptions

| Tool | Params |
|------|--------|
| `find_clip` | `track`, `name`, optional `view` |
| `remap_clip_notes` | `track` when `scope: "trackArrangement"` |

### Drum Rack resolution

1. Resolve track index `N` from `scan_context`.
2. In `tracks[N].devices[]`, find `type: "DrumRack"`.
3. Pass that device's `addr` to `read_drum_rack_map` — e.g. `{ "addr": { "kind": "device", "track": 1, "index": 0 } }`.

## When a tool fails

One failed call ≠ abandon scan/read tools.

1. Read the error — `-32602` = wrong args (check schema). Kernel errors often end with `Next:`.
2. Re-scan `scan_context` after structural edits.
3. **Retry the same tool** with corrected args.
4. Fix `run_code` for write failures — do not re-implement reads in `run_code`.

| Anti-pattern | Do instead |
|--------------|------------|
| `read_drum_rack_map` fails → full `run_code` workflow | Fix `addr` → retry; use `remap_clip_notes` or `run_code` for notes |
| `scan_context` missing arrangement clips → `run_code` | `scan_track` → `read_clip_notes` |
| Any error → "SDK for everything" | Fix the failing step only |

## Writing `ableton_run_code`

**Primary mutation path** — execute JavaScript/TypeScript against the live Ableton Extensions SDK.

### Sandbox bindings (always available — no imports)

| Binding | Role |
|---------|------|
| `context` | `ExtensionContext` — `application.song`, `resources` (import/render), `environment` (storage/temp), `ui` (kernel wraps confirm/progress) |
| `song` | Shorthand for `context.application.song` |
| `ableton` | SDK namespace — `instanceof` + enums (`ableton.MidiClip`, `ableton.WarpMode`, …); **not** Live's object tree |
| `log` / `console` | Captured in response `logs` |
| `withinTransaction(fn)` | One undo step; sync callback; return `Promise.all([…])` to group async creates |
| `ui.confirm(opts)` | In-Live confirm dialog → `boolean`; pauses timeout |
| `ui.progress(text, cb)` | Progress dialog; `cb(update, signal)`; pauses timeout |
| `sleep(ms)` | Async delay |
| `signal` | `AbortSignal` for cancellation |

Use `return` to send a JSON-serializable value back.

**Not in scope:** `import`, `require`, `process`, `Buffer`, `fs`, `path` (shadowed/undefined).

### Object model

```
song (Song)
├── tracks[]              (AudioTrack | MidiTrack)
│   ├── devices[]         (Simpler, RackDevice, DrumRack, …)
│   ├── clipSlots[]       (ClipSlot → clip | null)
│   ├── arrangementClips[] (AudioClip | MidiClip)
│   ├── takeLanes[]
│   └── mixer             (volume, panning, sends[])
├── returnTracks[], mainTrack, scenes[], cuePoints[]
```

Narrow with `instanceof ableton.*` — e.g. `clip instanceof ableton.MidiClip` → `clip.notes`; `ableton.AudioClip` → `warping`, `warpMode`.

| Base | Subtypes |
|------|----------|
| `ableton.Track` | `AudioTrack`, `MidiTrack` |
| `ableton.Clip` | `AudioClip`, `MidiClip` |
| `ableton.Device` | `Simpler`, `RackDevice`, `DrumRack` |

### Resolving targets inside `run_code`

- **Indices:** navigate `song.tracks[N]` with the same `N` from `scan_context` — MCP addrs are not SDK objects.
- **Drum Rack:** rack is a **device** on a track — use device addr for `read_drum_rack_map`, not track addr.
- **Async writes:** `createMidiTrack`, `insertDevice`, `createAudioClip`, `setValue`, … return Promises — always `await`.
- **Handles:** don't cache references across `run_code` calls or after structural edits — re-scan and resolve fresh indices.

### Transactions

Every mutation creates an undo step unless grouped.

```ts
// Sync properties — one undo
withinTransaction(() => {
  song.tracks.forEach((t, i) => { t.name = `T${i + 1}`; });
});

// Async creates — one undo (cannot await inside callback)
const tracks = await withinTransaction(() =>
  Promise.all([song.createMidiTrack(), song.createAudioTrack()]),
);
```

Nested `withinTransaction` calls collapse into one undo step.

### UI helpers

```ts
const ok = await ui.confirm({
  title: "Apply changes?",
  summary: "Insert Reverb on Drums",
  items: ["Track: Drums", "Device: Reverb"],
  danger: false,
});
if (!ok) return { cancelled: true };
```

Use `ui.confirm` before destructive or large edits.

### Error recovery

| Symptom | Fix |
|---------|-----|
| `[transpile]` | Syntax/types — no imports; use `ableton.*` classes |
| `[runtime]` | Wrong property/method — read [`cheatsheet.md`](cheatsheet.md); re-scan context |
| `[timeout]` | Smaller batches, `ui.progress`, raise `timeoutMs` (max 120000) |
| "not a midi track" | Pick `type: "midi"` from scan_context or `await song.createMidiTrack()` |
| Stale object | Re-run `scan_context`, resolve fresh index |

### Examples

```ts
return context.application.song.tempo;
```

```ts
const track = song.tracks[0]; // index from scan_context
const dev = await track.insertDevice("Reverb", track.devices.length);
return { device: dev.name, params: dev.parameters.length };
```

```ts
const track = await song.createMidiTrack();
track.name = "Agent";
const clip = await track.clipSlots[0].createMidiClip(4);
clip.notes = [
  { pitch: 60, startTime: 0, duration: 1, velocity: 100 },
  { pitch: 64, startTime: 1, duration: 1, velocity: 100 },
];
return { created: clip.name, notes: clip.notes.length };
```

More recipes: [`recipes.md`](recipes.md). Full member list: [`cheatsheet.md`](cheatsheet.md).

### Hard limits

- Handles are ephemeral — re-scan after structural edits.
- Transactions: sync callback, no `await` inside; no programmatic undo beyond Live's stack.
- Built-in Live devices via `track.insertDevice("Reverb", 0)` — no VST/AU or preset loading.
- No transport/playback control; no on-demand selection (Send to Agent + `read_selection`).
- Clip timing/loop set **only at creation** for MIDI; audio loop via `createAudioClip` args.
- No programmatic automation — set current parameter values only.
- Render/export: prefer `ableton_render_audio` (pre-FX, audio track); see media section in [`recipes.md`](recipes.md).

## Session View vs Arrangement View (MIDI clips)

Live keeps **separate clip stores**. Session clip slots and Arrangement timeline clips are not mirrors — writing to one does **not** update the other.

| Created with | Visible in Session piano roll | Visible in Arrangement piano roll |
|--------------|------------------------------|-----------------------------------|
| Session clip slot | Yes (that slot) | **No** |
| `track.createMidiClip(startBeat, length)` | No (unless duplicated) | Yes (that timeline region) |

**Common failure:** agent creates Session clips; user edits in Arrangement view → empty piano roll even though `read_clip_notes` on the session addr returns notes.

**Scan before writing:** `scan_context` → per track `clipPlacement.status` and top-level `perceiveHints` when the set is arrangement-heavy. `scan_track` → `arrangementClips[]`.

| Situation | Use |
|-----------|-----|
| User mentions timeline, sections, cue points, or other tracks have arrangement clips | `track.createMidiClip(startBeat, length)` on the arrangement timeline |
| User explicitly wants Session/scene launching | `track.clipSlots[slot].createMidiClip(length)` |

**Reading notes back** — pass the view-specific addr: Session `{ kind:"clipSlot", track, slot }`; Arrangement `{ kind:"arrangementClip", track, index }`.
