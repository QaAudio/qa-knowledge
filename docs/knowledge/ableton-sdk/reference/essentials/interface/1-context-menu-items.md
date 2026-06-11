# Context Menu Items

Context menu actions are one of the most common ways users interact with extensions. They allow you to add custom entries to various right-click menus in Ableton Live.

## Registering an Action

You can register actions for specific object types in Live. This is usually done inside the [`activate` function](../concepts/1-activation-and-context.md).

```ts
context.ui.registerContextMenuAction(
  "AudioClip", // The scope
  "Process Audio", // The label shown to the user
  "my-extension.process-audio" // The ID of the command to trigger
);
```

When a user selects your action, the [command](../concepts/3-commands.md) identified by the ID will be executed, and the `Handle` of the object that was right-clicked will be passed as the first argument.

## Scopes

The scope determines where your action appears. You can use any of the following object classes as a scope:

### Object Scopes

These scopes correspond to specific objects in the Live Set. When triggered, your command receives the `Handle` of the clicked object.

-   `AudioClip`
-   `MidiClip`
-   `AudioTrack`
-   `MidiTrack`
-   `ClipSlot`
-   `Scene`
-   `Simpler`
-   `Sample`
-   `DrumRack`

### Selection Scopes

These scopes represent general areas rather than specific objects.

-   **`AudioTrack.ArrangementSelection`** and **`MidiTrack.ArrangementSelection`**: Triggered when right-clicking on a time selection in the Arrangement View on an audio or MIDI track respectively. Instead of a single handle, the command receives an `ArrangementSelection` object containing the time range and selected lanes.
-   **`ClipSlotSelection`**: Triggered when right-clicking a selection of clip slots in Session View. The command receives a `ClipSlotSelection` object with a `selected_clip_slots` array of clip slot handles.

```ts
context.commands.registerCommand("my-ext.process-selection", (selection) => {
  const { time_selection_start, time_selection_end, selected_lanes } = selection as ableton.ArrangementSelection;

  // Resolve the handles into Track objects
  const tracks = selected_lanes.map(h => context.getObjectFromHandle(h, ableton.Track));

  console.log(`Selected ${time_selection_end - time_selection_start} beats across ${tracks.length} tracks.`);
});
```

## Unregistering Actions

The `registerContextMenuAction` method returns a Promise that resolves to an unregister function. This is useful if you need to remove an action dynamically.

```ts
const unregister = await context.ui.registerContextMenuAction(
  "AudioClip",
  "Temporary Action",
  "my-ext.temp-cmd"
);

// Later, to remove the action:
await unregister();
```
