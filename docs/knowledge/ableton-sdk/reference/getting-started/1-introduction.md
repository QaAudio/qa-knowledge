# Introduction

The Ableton Extension SDK lets you extend Ableton Live with **JavaScript and TypeScript**. Extensions run in Node.js alongside Live, giving you programmatic access to the Live Set, custom user interfaces, and the entire [npm](https://www.npmjs.com/) ecosystem.

## What You Can Build

### Manipulate the Live Set

Read and modify tracks, clips, devices, and more.

-   **Batch rename** every clip in a project based on a pattern
-   **Create and delete scenes** or **create track templates** with a single command
-   **Read and write clip warp modes**, **edit MIDI notes**, or **change device parameters** across entire projects

See a working example

Explore [`examples/arrangementselection`](./3-examples.md) — it resolves selected tracks, creates MIDI clips at the selection bounds, and registers a context menu action.

### Work with Audio and Files

Import audio into the project, render stems, and read or write files on disk.

-   **Import audio files** and drop them into arrangement
-   **Render stems** from selected tracks in the arrangement
-   **Transform audio files** using intensive offline processes

See working examples

Explore [`examples/strip-silence`](./3-examples.md) — it renders selected audio, analyzes it to detect silent regions, then strips them in a single transaction. Also see [`examples/audio-clips`](./3-examples.md) for importing files and creating clips.

### Build Custom Interfaces

Show modal dialogs using a WebView built with HTML, JS, and CSS.

-   **Data tables** showing clip metadata or project statistics
-   **Multi-step forms** for configuring complex batch operations

See working examples

Explore [`examples/modal-dialog`](./3-examples.md) — it shows a styled HTML form in a modal dialog and receives the result back via `postMessage`. For long-running operations with a progress bar, see [`examples/progress-dialog`](./3-examples.md).

### What Extensions Aren’t Designed For

Extensions are not designed to solve every problem. For building custom devices or realtime processing [Max for Live](https://www.ableton.com/en/live/max-for-live/) is the tool to reach for. If you find you need any of these things:

-   Real-time audio processing
-   MIDI routing or real-time MIDI manipulation
-   Drawing into Live’s native UI
-   Background extensions (running without Live open or persistently)
-   Control Surface integration

Then you may want to use another approach to solve your problem.
