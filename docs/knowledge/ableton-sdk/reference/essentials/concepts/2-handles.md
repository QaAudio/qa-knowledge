# Handles

In the Extensions SDK, objects like Tracks, Clips, and Devices are not passed around as full data structures. Instead, they are referenced using **Handles**. You can think of a handle as a unique address for an object **at the moment in time that you receive the handle**.

## What is a Handle?

A handle is a lightweight numeric identifier that points to a specific object within Ableton Live’s internal data model. Technically, a handle is an object containing a unique number:

```ts
interface ableton.Handle {
  id: bigint;
}
```

## Resolving Handles

Because a handle is just an ID, it doesn’t have any properties like `.name` or methods like `.createMidiClip()`. To interact with the object, you must “resolve” the handle into a high-level SDK object using `context.getObjectFromHandle`.

```ts
context.commands.registerCommand("myExtension.doSomething", (handle) => {
  // Turn the ID into a Track object
  const track = context.getObjectFromHandle(handle as ableton.Handle, ableton.Track);

  // Now you can access its properties
  console.log(`Working with track: ${track.name}`);
});
```

### Type Safety

When resolving a handle, you must provide the expected class (e.g., `Track`, `Clip`, `AudioClip`). The SDK will verify that the object pointed to by the handle matches that type. If you’re unsure of the specific type, you can use a more generic base class like `Clip` or even `DataModelObject` and narrow the type with `instanceof` checks. See the [Object Model](./1-activation-and-context.md#object-model) section for more details.

## Why do we use handles?

You might be thinking: *“why do we need to use handles?”*. On the surface, they seem to add complexity to your code, but actually, they prevent a lot of shooting yourself in the foot. One of the most important concepts to understand is that **handles are not permanent**. A handle can become invalid in several ways:

1.  **Deletion**: If a user deletes a track or clip in Live, any handle pointing to that object becomes invalid. Attempting to use a resolved SDK object with an invalid handle will throw an exception.
2.  **Moving Objects**: Currently, when a user moves a track or clip to a new position in the Live Set, a **new handle is allocated** for that object. This means any existing handles or SDK objects you have cached for that item will become invalid.
3.  **Session Changes**: Closing a Live Set or loading a new one invalidates all handles from the previous session.

So having handles is useful, because we can always ensure that we are referring to valid data that exists in the Live session and data model.

Tip

Avoid long-term caching of SDK objects or handles. It is usually safer to resolve handles as needed or re-query the model to ensure you are working with valid references.
