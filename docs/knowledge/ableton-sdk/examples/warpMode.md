# Example: warpMode

> Runtime note: in the `ableton_run_code` sandbox the SDK is the preloaded `ableton` global and `context` / `song` are pre-bound — there is no `activate`/`initialize`, no imports, and no Node APIs. These example sources show the SDK API shapes; send only the command-body logic to `run_code` (via `ableton.*`).

### src/extension.ts

```typescript
export function activate(activation: ableton.ActivationContext) {
  const api = ableton.initialize(activation, "1.0.0");

  api.commands.registerCommand("myCommand", (arg: unknown) => {
    const clip = api.getObjectFromHandle(arg as ableton.Handle, ableton.Clip);
    if (!(clip instanceof ableton.AudioClip)) {
      console.error("The selected clip is not an AudioClip.");
      return;
    }

    clip.warpMode = ((clip.warpMode + 1) % 3) as ableton.WarpMode;
  });

  api.ui.registerContextMenuAction(
    "Audio track",
    "Save track as",
    "intricator.bounce.to.existing.track",
  );
}
```
