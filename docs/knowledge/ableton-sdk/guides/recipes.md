# ableton_run_code recipes

Copy-paste snippets for the **run_code sandbox**. Prerequisites: read [`quickstart.md`](quickstart.md).
Resolve track indices from `ableton_scan_context` before each snippet.

**Anti-patterns**

- No `import` — use `ableton.MidiTrack`, `ableton.AudioClip`, `ableton.WarpMode`, etc.
- Do not guess API shapes — see [`cheatsheet.md`](cheatsheet.md).
- Use scan/read tools for perception; use `run_code` for all writes (tracks, MIDI, devices, mixer).

---

## tracks

Create a MIDI track and return its index:

```ts
const song = context.application.song;
const track = await song.createMidiTrack();
track.name = "Lead";
return { index: song.tracks.indexOf(track), name: track.name };
```

Rename every track in one undo step.

```ts
const song = context.application.song;
withinTransaction(() => {
  song.tracks.forEach((track, i) => {
    track.name = `Track ${i + 1}`;
  });
});
return { renamed: song.tracks.length };
```

---

## midi

Session clip + notes in one transaction:

```ts
const song = context.application.song;
const track = song.tracks[0]; // MIDI track index from scan_context
const clip = await track.clipSlots[0].createMidiClip(4);
clip.notes = [
  { pitch: 60, startTime: 0, duration: 1, velocity: 100 },
  { pitch: 64, startTime: 1, duration: 1, velocity: 100 },
];
return { name: clip.name, noteCount: clip.notes.length };
```

Arrangement clip at beat 8, 2 bars long:

```ts
const track = context.application.song.tracks[0];
const clip = await track.createMidiClip(8, 8);
clip.looping = false;
clip.notes = [{ pitch: 36, startTime: 0, duration: 0.5, velocity: 110 }];
return { name: clip.name, startBeat: 8, noteCount: clip.notes.length };
```

Batch pitch remap: prefer `ableton_remap_clip_notes` after `read_drum_rack_map`.

---

## devices

Insert built-in Reverb at end of chain on track index `N` (from scan_context).

```ts
const song = context.application.song;
const N = 0; // replace from scan_context
const track = song.tracks[N];
const dev = await track.insertDevice("Reverb", track.devices.length);
return { name: dev.name, paramCount: dev.parameters.length };
```

Exact device names: `"Auto Filter"`, `"EQ Eight"`, `"Compressor"`, `"Drum Rack"`, `"Reverb"`, `"Delay"`, etc.
Built-in Live only — no VST/AU.

Delete a device by index:

```ts
const track = context.application.song.tracks[0];
const dev = track.devices[1];
await track.deleteDevice(dev);
return { deleted: dev.name };
```

---

## parameters

Read/set a device parameter. **Prefer read:** `ableton_read_device { addr }` lists names, min/max, current values.

```ts
const song = context.application.song;
const track = song.tracks[0];
const dev = track.devices[0];
const param = dev.parameters.find(p => p.name === "Dry/Wet") ?? dev.parameters[0];
const before = await param.getValue();
await param.setValue(0.5);
return { param: param.name, min: param.min, max: param.max, before, after: await param.getValue() };
```

Quantized params: set the **index** (0-based), not the label — check `valueItems` via `read_device`.

Introspect first 20 params after inserting an unknown device:

```ts
const track = context.application.song.tracks[0];
const dev = await track.insertDevice("Roar", track.devices.length);
const params = await Promise.all(
  dev.parameters.slice(0, 20).map(async p => ({
    name: p.name,
    min: p.min,
    max: p.max,
    q: p.isQuantized,
    value: await p.getValue(),
  })),
);
return params;
```

---

## mixer

Set volume and pan on track index `N`.

```ts
const track = context.application.song.tracks[0];
const vol = track.mixer.volume;
const pan = track.mixer.panning;
await vol.setValue(0.85);
await pan.setValue(0.0);
return { volume: await vol.getValue(), panning: await pan.getValue() };
```

Send to return track (index 0 = first send):

```ts
const track = context.application.song.tracks[0];
const send = track.mixer.sends[0];
await send.setValue(0.3);
return { send0: await send.getValue() };
```

Mute/solo/arm are synchronous properties: `track.mute = true`, `track.solo = false`, `track.arm = true`.

---

## transactions

Group async creates into **one undo step** — callback is sync; return `Promise.all`:

```ts
const song = context.application.song;
const newTracks = await withinTransaction(() =>
  Promise.all([song.createMidiTrack(), song.createAudioTrack()]),
);
newTracks[0].name = "Agent MIDI";
newTracks[1].name = "Agent Audio";
return { names: newTracks.map(t => t.name) };
```

You **cannot** `await` inside the transaction callback. Create first, then modify in a second transaction if needed.

Sync property batch:

```ts
withinTransaction(() => {
  context.application.song.tracks.forEach(t => { t.mute = false; });
});
return { ok: true };
```

---

## media

Quick import + session clip:

```ts
const track = context.application.song.tracks[0];
if (!(track instanceof ableton.AudioTrack)) return { error: "need audio track" };
const imported = await context.resources.importIntoProject("/absolute/path/sample.wav");
const clip = await track.clipSlots[0].createAudioClip({ filePath: imported, isWarped: false });
return { clip: clip.name };
```

**Prefer tool:** `ableton_render_audio` for WAV export (no `fs` in sandbox).

---

## arrangement

Delete clips in a beat range on a track:

```ts
const track = context.application.song.tracks[0];
await track.clearClipsInRange(0, 16);
return { cleared: "0–16 beats" };
```

Delete one arrangement clip:

```ts
const track = context.application.song.tracks[0];
const clip = track.arrangementClips[0];
await track.deleteClip(clip);
return { deleted: clip.name };
```

Create MIDI on the arrangement timeline via `track.createMidiClip(startBeat, duration)` — see **midi** section above.

---

## tempo and song meta

```ts
const song = context.application.song;
return {
  tempo: song.tempo,
  scaleName: song.scaleName,
  scaleMode: song.scaleMode,
  rootNote: song.rootNote,
  cuePoints: song.cuePoints.map(c => ({ time: c.time, name: c.name })),
};
```

Set tempo:

```ts
context.application.song.tempo = 128;
return { tempo: context.application.song.tempo };
```

---

## safety

Confirm before destructive batch:

```ts
const ok = await ui.confirm({
  title: "Delete devices?",
  summary: "Remove all devices from track 1",
  items: ["Reverb", "EQ Eight"],
  danger: true,
});
if (!ok) return { cancelled: true };
// … mutations …
return { done: true };
```

Long work with progress (pauses timeout while open):

```ts
return await ui.progress("Working…", async (update, signal) => {
  await update("Step 1", 30);
  if (signal.aborted) return { aborted: true };
  await sleep(100);
  await update("Done", 100);
  return { ok: true };
});
```

---

## read-only probes

Use scan/read tools instead when possible. Quick tempo check:

```ts
return context.application.song.tempo;
```

List device names on a track:

```ts
const track = context.application.song.tracks[0];
return track.devices.map((d, i) => ({ index: i, name: d.name }));
```
