# Class Song<Version>

Represents the current Live Set.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#Song))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   Song

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: "Song"

## Accessors

### cuePoints

-   get cuePoints(): [CuePoint](CuePoint.md)<[Version](#version)\>\[\]
    
    #### Returns [CuePoint](CuePoint.md)<[Version](#version)\>\[\]
    

### gridIsTriplet

-   get gridIsTriplet(): boolean
    
    Whether the arrangement grid uses triplet subdivisions of the current [gridQuantization](#gridquantization) value.
    
    #### Returns boolean
    

### gridQuantization

-   get gridQuantization(): [GridQuantization](../enums/GridQuantization.md)
    
    The current arrangement grid quantization. Use with [gridIsTriplet](#gridistriplet) to determine the full grid setting.
    
    #### Returns [GridQuantization](../enums/GridQuantization.md)
    

### mainTrack

-   get mainTrack(): [Track](Track.md)<[Version](#version)\>
    
    #### Returns [Track](Track.md)<[Version](#version)\>
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
    

### returnTracks

-   get returnTracks(): [Track](Track.md)<[Version](#version)\>\[\]
    
    #### Returns [Track](Track.md)<[Version](#version)\>\[\]
    

### rootNote

-   get rootNote(): number
    
    The root note of the scale currently selected in Live, as a MIDI note number from 0 (C) to 11 (B).
    
    #### Returns number
    

### scaleIntervals

-   get scaleIntervals(): number\[\]
    
    The intervals of the current scale as semitone offsets from the root note.
    
    #### Returns number\[\]
    

### scaleMode

-   get scaleMode(): boolean
    
    Whether Live's Scale Mode is enabled.
    
    #### Returns boolean
    

### scaleName

-   get scaleName(): string
    
    The name of the scale selected in Live, as shown in the Current Scale Name chooser.
    
    #### Returns string
    

### scenes

-   get scenes(): [Scene](Scene.md)<[Version](#version)\>\[\]
    
    #### Returns [Scene](Scene.md)<[Version](#version)\>\[\]
    

### tempo

-   get tempo(): number
    
    #### Returns number
    
-   set tempo(value: number): void
    
    #### Parameters
    
    -   value: number
    
    #### Returns void
    

### tracks

-   get tracks(): [Track](Track.md)<[Version](#version)\>\[\]
    
    Regular tracks only — excludes return tracks and the main track.
    
    #### Returns [Track](Track.md)<[Version](#version)\>\[\]
    

## Methods

### createAudioTrack

-   createAudioTrack(): Promise<[AudioTrack](AudioTrack.md)<[Version](#version)\>\>
    
    Inserted after the last selected track, or appended if no track is selected.
    
    #### Returns Promise<[AudioTrack](AudioTrack.md)<[Version](#version)\>\>
    

### createCuePoint

-   createCuePoint(time: number): Promise<[CuePoint](CuePoint.md)<[Version](#version)\>\>
    
    #### Parameters
    
    -   time: number
        
        Position in the arrangement in beats.
        
    
    #### Returns Promise<[CuePoint](CuePoint.md)<[Version](#version)\>\>
    

### createMidiTrack

-   createMidiTrack(): Promise<[MidiTrack](MidiTrack.md)<[Version](#version)\>\>
    
    Inserted after the last selected track, or appended if no track is selected.
    
    #### Returns Promise<[MidiTrack](MidiTrack.md)<[Version](#version)\>\>
    

### createScene

-   createScene(index: number): Promise<[Scene](Scene.md)<[Version](#version)\>\>
    
    #### Parameters
    
    -   index: number
        
        0-based insert position in the range `[0, song.scenes.length]`. Pass `-1` to append at the end.
        
    
    #### Returns Promise<[Scene](Scene.md)<[Version](#version)\>\>
    

### deleteCuePoint

-   deleteCuePoint(cuePoint: [CuePoint](CuePoint.md)<[Version](#version)\>): Promise<void\>
    
    Deletes a cue point from the song. Await the returned promise to ensure the deletion has been fully processed.
    
    #### Parameters
    
    -   cuePoint: [CuePoint](CuePoint.md)<[Version](#version)\>
    
    #### Returns Promise<void\>
    

### deleteScene

-   deleteScene(scene: [Scene](Scene.md)<[Version](#version)\>): Promise<void\>
    
    Deletes a scene from the song. Await the returned promise to ensure the deletion has been fully processed.
    
    #### Parameters
    
    -   scene: [Scene](Scene.md)<[Version](#version)\>
    
    #### Returns Promise<void\>
    

### deleteTrack

-   deleteTrack(track: [Track](Track.md)<[Version](#version)\>): Promise<void\>
    
    Deletes a track from the song. Await the returned promise to ensure the deletion has been fully processed.
    
    #### Parameters
    
    -   track: [Track](Track.md)<[Version](#version)\>
    
    #### Returns Promise<void\>
    

### duplicateScene

-   duplicateScene(scene: [Scene](Scene.md)<[Version](#version)\>): Promise<[Scene](Scene.md)<[Version](#version)\>\>
    
    Duplicates the scene. The duplicate is inserted immediately after the original.
    
    #### Parameters
    
    -   scene: [Scene](Scene.md)<[Version](#version)\>
    
    #### Returns Promise<[Scene](Scene.md)<[Version](#version)\>\>
    

### duplicateTrack

-   duplicateTrack(track: [Track](Track.md)<[Version](#version)\>): Promise<[Track](Track.md)<[Version](#version)\>\>
    
    Duplicates the track. The duplicate is inserted immediately after the original.
    
    #### Parameters
    
    -   track: [Track](Track.md)<[Version](#version)\>
    
    #### Returns Promise<[Track](Track.md)<[Version](#version)\>\>
