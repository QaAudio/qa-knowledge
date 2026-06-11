# Example: context-menu

> Runtime note: in the `ableton_run_code` sandbox the SDK is the preloaded `ableton` global and `context` / `song` are pre-bound — there is no `activate`/`initialize`, no imports, and no Node APIs. These example sources show the SDK API shapes; send only the command-body logic to `run_code` (via `ableton.*`).

### src/extension.ts

```typescript
export function activate(context: ableton.ActivationContext) {
  const api = ableton.initialize(context, "1.0.0");

  api.commands.registerCommand("myClipSlotAction", () => {
    console.log("You right-clicked on a ClipSlot!");
  });

  api.ui.registerContextMenuAction(
    "ClipSlot",
    "Process this ClipSlot",
    "myClipSlotAction",
  );
}
```
