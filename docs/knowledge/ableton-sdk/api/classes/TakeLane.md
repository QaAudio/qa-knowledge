# Class TakeLane<Version>

Represents a take lane.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#TakeLane))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   TakeLane

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: "TakeLane"

## Accessors

### clips

-   get clips(): [Clip](Clip.md)<[Version](#version)\>\[\]
    
    #### Returns [Clip](Clip.md)<[Version](#version)\>\[\]
    

### name

-   get name(): string
    
    #### Returns string
    
-   set name(value: string): void
    
    #### Parameters
    
    -   value: string
    
    #### Returns void
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
    

## Methods

### createAudioClip

-   createAudioClip(  
        args: {  
            duration?: number;  
            filePath: string;  
            isWarped?: boolean;  
            loopSettings?: [ClipLoopSettings](../interfaces/ClipLoopSettings.md);  
            startTime: number;  
        },  
    ): Promise<[AudioClip](AudioClip.md)<[Version](#version)\>\>
    
    Creates an audio clip on this take lane. See [AudioTrack.createAudioClip](AudioTrack.md#createaudioclip) for argument semantics.
    
    #### Parameters
    
    -   args: {  
            duration?: number;  
            filePath: string;  
            isWarped?: boolean;  
            loopSettings?: [ClipLoopSettings](../interfaces/ClipLoopSettings.md);  
            startTime: number;  
        }
    
    #### Returns Promise<[AudioClip](AudioClip.md)<[Version](#version)\>\>
    

### createMidiClip

-   createMidiClip(startTime: number, duration: number): Promise<[MidiClip](MidiClip.md)<[Version](#version)\>\>
    
    #### Parameters
    
    -   startTime: number
        
        Position in the arrangement in beats.
        
    -   duration: number
        
        Length of the clip in beats.
        
    
    #### Returns Promise<[MidiClip](MidiClip.md)<[Version](#version)\>\>
