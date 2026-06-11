# Transactions

Transactions allow you to group multiple changes to the Live Set into a single entry in the undo history. This ensures that the user can undo or redo a complex operation in one step.

## Using `withinTransaction`

The primary purpose of `withinTransaction` is to group operations that mutate the state of Live. By default, every individual change (like setting a clip’s name) is its own undoable action.

```ts
// Every track will be renamed in one undo step.
context.withinTransaction(() => {
  context.application.song.tracks.forEach((track, i) => {
    track.name = `Track ${i + 1}`;
  });
});
```

You don’t need to manually call `withinTransaction` everytime you mutate the Live set as this automatically creates an undo step. You only need to use it if you want to group several of these into one undo step.

## Synchronous Logic and Async Operations

`withinTransaction` is strictly synchronous. You cannot `await` anything inside the transaction callback. However, you can *initiate* multiple asynchronous operations (like creating clips or tracks) inside a transaction to ensure their creation is grouped in the undo history.

To do this, return a `Promise.all` of the operations from the transaction and await the transaction call itself.

```ts
// Grouping multiple async track creations into one undo step
const newTracks = await context.withinTransaction(() => {
  return Promise.all([
    context.application.song.createAudioTrack(),
    context.application.song.createAudioTrack()
  ]);
});

// The tracks are now created and ready to use.
// Their creation was grouped as a single undo step in Live.
```

### Chaining Modifications

Because you cannot `await` inside a transaction, you cannot create a track and then modify its properties within the same transaction block (since you need the track instance first). You must perform these as sequential transactions:

```ts
// 1. Create the tracks (grouped in one undo step)
const newTracks = await context.withinTransaction(() => {
  return Promise.all([song.createAudioTrack(), song.createAudioTrack()]);
});

// 2. Modify the tracks (grouped in a second undo step)
context.withinTransaction(() => {
  newTracks.forEach((track, i) => {
    track.name = `Grouped Track ${i + 1}`;
  });
});
```

## Atomic Operations

Using a transaction ensures that your changes are applied “atomically” from the perspective of the user. Live will wait until the transaction completes before updating the UI or the undo history, preventing the user from seeing intermediate states of a complex operation.

## Collapsing Transactions

If you call `withinTransaction` inside another transaction, they will automatically collapse into a single undo step. This allows you to build reusable functions that each use their own transactions while still being able to group them into larger operations.
