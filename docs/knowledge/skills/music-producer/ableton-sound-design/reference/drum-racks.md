# Drum Racks (manual ch24.6)

A **Drum Rack** is a rack whose chains each respond to a **single MIDI note** (a
"pad"). The General-MIDI-ish default map starts at **36 = C1 kick, 38 = snare,
42 = closed hat, 46 = open hat** (pads ascend chromatically). Trigger pads by writing
those pitches in a MIDI clip (`ableton-midi`).

## SDK surface
- `DrumRack` extends `RackDevice`: `chains: DrumChain[]`.
- `DrumChain` extends `Chain`: adds **`receivingNote`** (get/set) — the MIDI note that
  triggers this pad. Plus the usual `devices`, `insertDevice`, `mixer`.
- Pad sound = a chain containing a `Simpler` (or `Drum Sampler`/`Impulse`) +
  optional audio effects. `Simpler.replaceSample(filePath)` loads the sample.

## Inspect an existing kit
Prefer **`ableton_read_drum_rack_map`** with the Drum Rack **device** `addr` from
`ableton_scan_context` — returns `pads[].receivingNote`, device names, and `sampleLabel` when
available.

**Worked example** — user says "the drums track":

1. `ableton_scan_context` → find `tracks[]` where `name` matches (e.g. "Drums") → `index: 1`.
2. In `tracks[1].devices[]`, find `type: "DrumRack"` → copy its `addr` (e.g.
   `{ kind: "device", track: 1, index: 0 }`).
3. `ableton_read_drum_rack_map { "addr": { "kind": "device", "track": 1, "index": 0 } }`.

**Wrong:** `track: 1` or `{ track: 1 }` — `addr` must be a **device**, not a bare track index.
On `-32602`, fix `addr` and retry; do not fall back to `run_code` for the whole drum workflow.

Fallback `run_code` probe (only if `read_drum_rack_map` is unavailable):
```ts
const song = context.application.song;
const dr = song.tracks[0].devices.find(d => d.name === "Drum Rack");
return dr.chains.map(ch => ({
  note: ch.receivingNote,
  devices: ch.devices.map(d => d.name),
}));
```

## Build a pad from a sample
```ts
const song = context.application.song;
const track = await song.createMidiTrack(); track.name = "Kit";
const dr = await track.insertDevice("Drum Rack", 0);     // DrumRack
const pad = await dr.insertChain(0);                      // a DrumChain
pad.receivingNote = 36;                                   // C1 = kick pad
const simpler = await pad.insertDevice("Simpler", 0);
await simpler.replaceSample("/absolute/path/to/kick.wav");// needs a real file path
return { pads: dr.chains.length, note: dr.chains[0].receivingNote };
```
**Sample paths:** `replaceSample` needs an accessible absolute file path; the SDK
can't browse Live's library. If you don't have a path, insert `Drum Sampler`/`Simpler`
and set parameters, or ask the user for sample locations.

## Map / remap pads
Set `receivingNote` to change which note a pad answers to (via `run_code`).

To **remap notes in clips** after inspecting the kit (e.g. GM shaker 54 → kit pad 48):
1. `ableton_read_drum_rack_map` on the Drum Rack `addr`
2. Build `pitchMap: [{from:54,to:48}, …]` from source GM pitches and target `receivingNote` values
3. `ableton_remap_clip_notes` with `scope: "trackArrangement"` (all arrangement clips) or `scope: "clip"` for one clip

Use `ableton_find_clip` when you need a clip `addr` by name before remapping a single clip.

## Drums + composition
For *what to program* (linear drumming, ghost notes, 3+3+2, top/bottom), see
`music-strategies/rhythm.md`; for the note arrays + Euclidean/accent helpers, see
`ableton-midi` (`examples.md` recipe 3, `quantize-and-groove.md`).
