# Type Alias ContextMenuScope<V>

ContextMenuScope: [V](#v) extends "1.0.0"  
    ? | "AudioClip"  
    | "AudioTrack"  
    | "ClipSlot"  
    | "DrumRack"  
    | "MidiClip"  
    | "MidiTrack"  
    | "Sample"  
    | "Scene"  
    | "Simpler"  
    | "ClipSlotSelection"  
    | "AudioTrack.ArrangementSelection"  
    | "MidiTrack.ArrangementSelection"  
    : never

The scope in which a context menu action is shown.

Scopes that pass the triggered object's [Handle](../interfaces/Handle.md) as the first command argument: `"AudioClip"`, `"AudioTrack"`, `"ClipSlot"`, `"DrumRack"`, `"MidiClip"`,`"MidiTrack"`, `"Sample"`, `"Scene"`, `"Simpler"`.

Scopes that pass a selection context as the first command argument: `"ClipSlotSelection"` ([ClipSlotSelection](../interfaces/ClipSlotSelection.md)), `"AudioTrack.ArrangementSelection"` and `"MidiTrack.ArrangementSelection"` ([ArrangementSelection](../interfaces/ArrangementSelection.md)).

#### Type Parameters

-   V extends ApiVersion
