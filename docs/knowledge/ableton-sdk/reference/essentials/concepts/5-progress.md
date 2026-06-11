# Progress

For operations that take more than a few milliseconds you should use `withinProgressDialog`. This displays a standard Ableton Live progress bar and provides feedback to the user.

## Using `withinProgressDialog`

The `withinProgressDialog` method takes an asynchronous callback that receives an `update` function and an `AbortSignal`.

```ts
  // Do some work
  await someLongRunningTask();
  await update("Halfway there", 50);

  if (signal.aborted) {
    // The user cancelled
    return;
  }

  // Finish up
  await anotherTask();
  await update("Done!", 100);
});
```

### How it Works

-   **Automatic Lifecycle**: The dialog opens when `withinProgressDialog` is called and automatically closes when your async callback resolves or throws.
-   **The `update` function**: Takes a string (the status message) and a number from 0 to 100 (the progress percentage). This is what controls the progress of the modal.
-   **Concurrency**: While the progress dialog is open, the user is generally blocked from interacting with the rest of the Live UI, ensuring the state doesn’t change unexpectedly while your operation is running.

## Combining Transactions and Progress

A common pattern is to use a progress dialog for a long-running async task, but wrap the final state changes in a [transaction](./4-transaction.md) to ensure they are undoable as a single unit.

If your modifications are asynchronous (like creating clips), you must return the promises from the transaction and await them.

```ts
await context.withinProgressDialog("Analyzing audio...", { progress: 10 }, async (update) => {
  const silenceRanges = await analyzeAudio();

  await update("Applying changes...", 90);

  // 1. Initiate modifications in a transaction to group them
  const modifications = context.withinTransaction(() => {
    return silenceRanges.map(range => {
        return track.clearClipsInRange(range.start, range.end);
    });
  });

  // 2. Await the results before the dialog closes
  await Promise.all(modifications);
});
```

Because `withinProgressDialog` allows for asynchronous code, it is the perfect place to coordinate complex workflows that involve both fetching data (async) and modifying the Live Set (sync transactions).

## Modal vs. Progress Dialogs

| Feature | Modal Dialog | Progress Dialog |
| :-- | :-- | :-- |
| **Primary Use** | Custom UI, User Input, Forms | Background tasks, Feedback |
| **Content** | Custom HTML/Webview | Standard Live Progress Bar |
| **Blocking** | Yes (Extension is suspended) | Yes (User UI is blocked) |
| **Best for…** | Selecting a file, renaming things | Analyzing audio, batch creation |

If you need to show a custom interface, see the User Interface with Webviews guide.
