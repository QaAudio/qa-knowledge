# SDK cheatsheet (production)

Curated surface for music production in `ableton_run_code`. Full types: [`../sdk-types.md`](../sdk-types.md).

## Entry

```ts
const song = context.application.song;
const track = song.tracks[0];           // index from get_context
const dev = track.devices[0];
const slot = track.clipSlots[0];
const clip = track.arrangementClips[0];
```

## Song

| Member | R/W | Notes |
|--------|-----|-------|
| `tracks` | read | Regular tracks only |
| `returnTracks`, `mainTrack` | read | |
| `scenes`, `cuePoints` | read | |
| `tempo` | R/W | BPM |
| `scaleName`, `scaleMode`, `rootNote`, `scaleIntervals` | read | Live scale |
| `createMidiTrack()`, `createAudioTrack()` | write | async |
| `createScene(index)`, `createCuePoint(time)` | write | async |
| `deleteTrack`, `duplicateTrack`, … | write | async |

## Track (AudioTrack | MidiTrack)

| Member | R/W | Notes |
|--------|-----|-------|
| `name`, `mute`, `solo`, `arm` | R/W | |
| `devices` | read | |
| `clipSlots`, `arrangementClips`, `takeLanes` | read | |
| `mixer` | read | `TrackMixer` |
| `insertDevice(name, index)` | write | async; built-in names only |
| `deleteDevice`, `duplicateDevice` | write | async |
| `deleteClip`, `clearClipsInRange` | write | async |
| `createMidiClip(start, duration)` | write | **MidiTrack only**, async |

## Clip / MidiClip / AudioClip

| Member | R/W | Notes |
|--------|-----|-------|
| `name`, `color`, `muted`, `looping` | R/W | |
| `startTime`, `endTime`, `duration` | read | arrangement |
| `loopStart`, `loopEnd` | read | often read-only after create |
| `notes` | R/W | **MidiClip only** — `NoteDescription[]` |
| `filePath`, `warping`, `warpMode`, `warpMarkers` | AudioClip | |

### NoteDescription

```ts
{ pitch: 60, startTime: 0, duration: 1, velocity: 100 }
// pitch 0–127, startTime ≥ 0, duration > 0 (beats)
```

## ClipSlot

| Method | Notes |
|--------|-------|
| `clip` | `Clip \| null` |
| `createMidiClip(length)` | async, beats |
| `createAudioClip({ filePath, isWarped?, loopSettings? })` | async |
| `deleteClip()` | async |

## AudioTrack.createAudioClip

```ts
await track.createAudioClip({
  filePath: string,      // use importIntoProject path
  startTime: number,     // beats
  duration?: number,
  isWarped?: boolean,
  loopSettings?: ClipLoopSettings,
});
```

## Device / DeviceParameter

```ts
dev.name
dev.parameters[]          // DeviceParameter[]
await param.getValue()
await param.setValue(n)   // n in [min, max]; index if isQuantized
param.min, param.max, param.isQuantized, param.valueItems
```

## TrackMixer

```ts
track.mixer.volume, track.mixer.panning
track.mixer.sends[i]      // DeviceParameter
```

## Resources (context.resources)

```ts
await context.resources.importIntoProject(absolutePath)  // → project path
await context.resources.renderPreFxAudio(audioTrack, startBeat, endBeat)  // → wav path
```

Prefer **`ableton_render_audio`** tool over direct render in agent workflows.

## Enums (ableton.*)

```ts
ableton.WarpMode.Beats | Tones | Texture | Repitch | Complex | ComplexPro
ableton.GridQuantization.Bar | Quarter | …
```

## Type guards

```ts
track instanceof ableton.MidiTrack
track instanceof ableton.AudioTrack
clip instanceof ableton.MidiClip
clip instanceof ableton.AudioClip
dev instanceof ableton.DrumRack
```

## Common device names (insertDevice)

`"Reverb"`, `"Delay"`, `"EQ Eight"`, `"Compressor"`, `"Auto Filter"`, `"Utility"`,
`"Drum Rack"`, `"Operator"`, `"Wavetable"`, `"Simpler"`, `"Glue Compressor"`, `"Saturator"`.

Exact spelling matters. No VST/AU.
