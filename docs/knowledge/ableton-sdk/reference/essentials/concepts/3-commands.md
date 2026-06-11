# Commands

Commands are the primary way to expose functionality in your extension. They act as named callbacks that can be triggered by the user via the UI or executed programmatically by other parts of your code. In other words, you can use a command to associate some JavaScript code to an action triggered from Live.

## Registering Commands

Commands are typically registered during the `activate` phase of your extension. Each command must have a unique ID, which is used to link it to UI elements like [context menu items](../interface/1-context-menu-items.md).

```ts
context.commands.registerCommand("my-ext.process-clip", (arg) => {
  console.log("Command triggered with:", arg);
});
```

## Registering A Context Menu Command

extension.ts

```js
export const activate = (activation) => {
  const context = ableton.initialize(activation, "1.0.0");

  // First, register the command that will be triggered when the user clicks the menu item.
  // The handle is guaranteed to be an AudioClip because of the scope we register below.
  context.commands.registerCommand("my-ext.increment-warp-mode", (handle) => {
    const clip = context.getObjectFromHandle(handle as ableton.Handle, ableton.AudioClip);
    const modes = [ableton.WarpMode.Beats, ableton.WarpMode.Tones, ableton.WarpMode.Texture, ableton.WarpMode.Repitch, ableton.WarpMode.Complex, ableton.WarpMode.ComplexPro];
    const currentIndex = modes.indexOf(clip.warpMode);
    clip.warpMode = modes[(currentIndex + 1) % modes.length];
  });

  // Then, register a context menu action that is available when right-clicking an AudioClip.
  context.ui.registerContextMenuAction(
    "AudioClip",
    "Increment Warp Mode",
    "my-ext.increment-warp-mode",
  );
}
```

## Command Arguments

The arguments passed to your command callback depend on how the command was triggered.

### Context Menu Arguments

When a command is triggered from a context menu, the host automatically passes information about the target of the right-click:

-   **Object Handles**: Most context menus (e.g., `AudioClip`, `Track`) pass a single `Handle` as the first argument.
-   **Arrangement Selection**: The `ArrangementSelection` scope passes an `ArrangementSelection` object, which contains the time range and a list of selected tracks/lanes.

```ts
// Example: Handling a clip right-click
context.commands.registerCommand("my-ext.rename-clip", (handle) => {
  const clip = context.getObjectFromHandle(handle as ableton.Handle, ableton.Clip);
  clip.name = "Processed Clip";
});

// Example: Handling an arrangement selection
context.commands.registerCommand("my-ext.process-selection", (arg) => {
  const selection = arg as ableton.ArrangementSelection;
  console.log(`Selected from beat ${selection.time_selection_start} to ${selection.time_selection_end}`);
});
```
