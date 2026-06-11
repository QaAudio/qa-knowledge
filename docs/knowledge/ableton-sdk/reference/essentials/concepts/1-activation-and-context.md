# Activation and Context

## The Activate Function

Every extension starts with an `activate` function. This is where you set up your commands, UI actions, and initial state. It is called by the Ableton Live extension host when your extension is loaded.

```ts
export const activate = (activation) => {
  // Initialization logic goes here
};
```

This function receives an `activation` object from the host as the first argument, which you must use to initialize the SDK.

## Initializing the SDK

To gain access to the high-level API, you need to call the `initialize` function provided by the SDK. This requires passing the object received in `activate` and a specific API version string.

```ts
export const activate = (activation) => {
  const context = ableton.initialize(activation, "1.0.0");

  // Now you can use the 'context' object to interact with Live
};
```

Using `initialize` ensures that your extension is compatible with the version of the host it’s running in and provides type-safe access to the SDK’s features.

## The ExtensionContext Object

The object returned by `initialize` is your gateway to the SDK’s capabilities. It exposes several services and namespaces:

### `application`

Provides access to the `Application` instance, the root of the Live object model. From here, you can access the current `song`.

### `commands`

Registry for extension commands. Use `registerCommand` to define actions that can be triggered by the user or the system.

See the [Commands](./3-commands.md) guide for more information.

### `ui`

Manages user interface elements. Use `registerContextMenuAction` to add items to Live’s context menus, `showModalDialog` to open a webview dialog, and `withinProgressDialog` to show progress during long-running tasks.

See the Webviews and [Progress](./5-progress.md) guides for more information.

### `environment`

Provides access to host-specific information:

-   `storageDirectory`: A persistent directory where your extension can safely store data, presets, or configuration.
-   `tempDirectory`: A directory for temporary files, such as audio analysis results or intermediate processing data.
-   `language`: Live’s current UI language as an uppercase ISO 639-1 code (e.g. `"EN"`, `"DE"`, `"JA"`). May be `undefined` if not available.

See the [Resources and Filesystem](./6-resources-and-filesystem.md) guide for details on filesystem access and permissions.

### `resources`

The service for importing files into the project and rendering audio from the arrangement. See the [Resources and Filesystem](./6-resources-and-filesystem.md) guide for more information.

### `getObjectFromHandle`

Resolves a `Handle` into a typed SDK object. See the [Handles](./2-handles.md) guide for more information.

### `withinTransaction`

A helper to wrap multiple state-modifying operations into a single undoable transaction. See the [Transactions](./4-transaction.md) guide for more information.

## Object Model

The Extensions SDK provides a structured object model that represents the state of the Live Set. Understanding this hierarchy is key to navigating and manipulating the set.

### Accessing the Model

You typically start accessing the model via `context.application`.

```ts
const song = context.application.song;
console.log(`The song has ${song.tracks.length} tracks.`);
```

### Polymorphism and Type Guarding

Many objects in the SDK share common base classes. This allows you to write generic code that works across different types of objects, while still being able to “narrow down” to a specific type when you need to access specialised functionality.

Common base classes include:

-   **`Track`**: Base for `AudioTrack` and `MidiTrack`.
-   **`Clip`**: Base for `AudioClip` and `MidiClip`.
-   **`Device`**: Base for `Simpler` and `RackDevice`.
-   **`DataModelObject`**: The base class for *all* objects in the model.

#### Example: Generic Clip Handling

If you want to create a command that renames a clip regardless of whether it is MIDI or Audio, you can resolve the handle using the `Clip` base class.

```ts
const clip = context.getObjectFromHandle(handle, ableton.Clip);

// All clips have a name property.
// It doesn't matter if its audio or midi.
clip.name = "New Name";
```

#### Example: Handling Multiple Selection Types

In some scenarios, like right-clicking in the Arrangement View, the host might provide a list of handles that represent different types of objects. You can use the most generic base class, `DataModelObject`, to resolve them first, and then filter by the types you care about.

```ts
// In a command callback, you might receive a list of handles
context.commands.registerCommand("my-ext.process-selection", (arg) => {
  const selection = arg as ableton.ArrangementSelection;
  const selectedObjects = selection.selected_lanes.map((handle) =>
    context.getObjectFromHandle(handle, ableton.DataModelObject),
  );

  // Filter to only get Tracks or TakeLanes
  const tracksAndLanes = selectedObjects.filter((obj) =>
    obj instanceof ableton.Track || obj instanceof ableton.TakeLane,
  );
});
```

By leveraging polymorphism, you can write cleaner, more reusable code that gracefully handles the various object types found in a Live Set. It can also help you narrow down the types of things from a wider selection, like many clips across MIDI and Audio tracks.
