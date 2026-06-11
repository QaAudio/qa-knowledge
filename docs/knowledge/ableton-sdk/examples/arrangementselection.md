# Example: arrangementselection

> Runtime note: in the `ableton_run_code` sandbox the SDK is the preloaded `ableton` global and `context` / `song` are pre-bound — there is no `activate`/`initialize`, no imports, and no Node APIs. These example sources show the SDK API shapes; send only the command-body logic to `run_code` (via `ableton.*`).

### src/extension.ts

```typescript
export function activate(activation: ableton.ActivationContext) {
  const api = ableton.initialize(activation, "1.0.0");

  api.ui.registerContextMenuAction(
    "MidiTrack.ArrangementSelection",
    "Process selection",
    "myExtension.processSelection",
  );

  api.commands.registerCommand(
    "myExtension.processSelection",
    async (arg: unknown) => {
      const selection = arg as ableton.ArrangementSelection;

      const selectedObjects = selection.selected_lanes.map((handle) =>
        api.getObjectFromHandle(handle, ableton.DataModelObject),
      );
      const selectedTrackOrLanes = selectedObjects.filter(
        (obj): obj is ableton.Track<"1.0.0"> | ableton.TakeLane<"1.0.0"> =>
          obj instanceof ableton.Track || obj instanceof ableton.TakeLane,
      );

      console.log(
        `You right-clicked in Arrangement View with a selection from beat ${selection.time_selection_start} to beat ${selection.time_selection_end}.`,
      );

      const selectedNames = selectedTrackOrLanes.map((obj) => obj.name);
      console.log(
        `The names of the selected tracks / take lanes are: ${selectedNames.join(", ")}`,
      );

      const midiLanes = selectedTrackOrLanes.filter(
        (obj): obj is ableton.MidiTrack<"1.0.0"> | ableton.TakeLane<"1.0.0"> =>
          obj instanceof ableton.MidiTrack ||
          (obj instanceof ableton.TakeLane && obj.parent instanceof ableton.MidiTrack),
      );

      if (midiLanes.length > 0) {
        console.log("I'll add a MIDI clip to each MIDI track/lane that's selected.");
        const newClips = await Promise.all(
          midiLanes.map((lane) =>
            lane.createMidiClip(
              selection.time_selection_start,
              selection.time_selection_end - selection.time_selection_start,
            ),
          ),
        );
        newClips.forEach((clip, i) => {
          clip.name = `New Clip ${i + 1}`;
        });
      }
    },
  );
}
```
