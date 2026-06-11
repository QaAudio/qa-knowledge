# Class ClipSlot<Version>

A slot in the Session View grid that can hold a clip.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#ClipSlot))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   ClipSlot

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: "ClipSlot"

## Accessors

### clip

-   get clip(): [Clip](Clip.md)<[Version](#version)\> | null
    
    #### Returns [Clip](Clip.md)<[Version](#version)\> | null
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
    

## Methods

### createAudioClip

-   createAudioClip(  
        args: {  
            filePath: string;  
            isWarped?: boolean;  
            loopSettings?: [ClipLoopSettings](../interfaces/ClipLoopSettings.md);  
        },  
    ): Promise<[AudioClip](AudioClip.md)<[Version](#version)\>\>
    
    Creates an audio clip in this session slot.
    
    #### Parameters
    
    -   args: { filePath: string; isWarped?: boolean; loopSettings?: [ClipLoopSettings](../interfaces/ClipLoopSettings.md) }
        -   ##### filePath: string
            
            Absolute path to the audio file.
            
        -   ##### `Optional`isWarped?: boolean
            
            See [AudioTrack.createAudioClip](AudioTrack.md#createaudioclip).
            
        -   ##### `Optional`loopSettings?: [ClipLoopSettings](../interfaces/ClipLoopSettings.md)
            
            See [AudioTrack.createAudioClip](AudioTrack.md#createaudioclip).
            
    
    #### Returns Promise<[AudioClip](AudioClip.md)<[Version](#version)\>\>
    

### createMidiClip

-   createMidiClip(length: number): Promise<[MidiClip](MidiClip.md)<[Version](#version)\>\>
    
    #### Parameters
    
    -   length: number
        
        Length of the clip in beats.
        
    
    #### Returns Promise<[MidiClip](MidiClip.md)<[Version](#version)\>\>
    

### deleteClip

-   deleteClip(): Promise<void\>
    
    Deletes the clip in this slot. Await the returned promise to ensure the deletion has been fully processed.
    
    #### Returns Promise<void\>
