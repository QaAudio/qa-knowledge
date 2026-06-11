# Example: progress-dialog

> Runtime note: in the `ableton_run_code` sandbox the SDK is the preloaded `ableton` global and `context` / `song` are pre-bound — there is no `activate`/`initialize`, no imports, and no Node APIs. These example sources show the SDK API shapes; send only the command-body logic to `run_code` (via `ableton.*`).

### src/extension.ts

```typescript
const delay = (timeout: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, timeout));

export function activate(activation: ableton.ActivationContext) {
  const context = ableton.initialize(activation, "1.0.0");

  context.commands.registerCommand("showProgressDialog", () => {
    void context.ui.withinProgressDialog(
      "Doing some long running task",
      {},
      async (update, signal) => {
        console.log(
          "Progress Dialog is now open. Let's start our long running task.",
        );
        await delay(2000);

        let i = 0;
        try {
          while (i < 100) {
            await delay(100);
            await update("If you want, you can click cancel.", i);
            ++i;
            signal.throwIfAborted();
          }
        } catch {
          console.warn(`Task was likely cancelled at ${i}%`);
          return;
        }

        await update("Cleaning up", undefined);
        await delay(2000);
      },
    );
  });

  context.ui.registerContextMenuAction(
    "AudioTrack",
    "Start long task",
    "showProgressDialog",
  );
}
```
