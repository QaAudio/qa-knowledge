# Class Track<Version>

Represents a track.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#Track))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   Track
        -   [MidiTrack](MidiTrack.md)
        -   [AudioTrack](AudioTrack.md)

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: string = "Track"

## Accessors

### arm

-   get arm(): boolean
    
    #### Returns boolean
    
-   set arm(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    

### arrangementClips

-   get arrangementClips(): [Clip](Clip.md)<[Version](#version)\>\[\]
    
    #### Returns [Clip](Clip.md)<[Version](#version)\>\[\]
    

### clipSlots

-   get clipSlots(): [ClipSlot](ClipSlot.md)<[Version](#version)\>\[\]
    
    #### Returns [ClipSlot](ClipSlot.md)<[Version](#version)\>\[\]
    

### devices

-   get devices(): [Device](Device.md)<[Version](#version)\>\[\]
    
    #### Returns [Device](Device.md)<[Version](#version)\>\[\]
    

### groupTrack

-   get groupTrack(): Track<[Version](#version)\> | null
    
    #### Returns Track<[Version](#version)\> | null
    

### mixer

-   get mixer(): [TrackMixer](TrackMixer.md)<[Version](#version)\>
    
    #### Returns [TrackMixer](TrackMixer.md)<[Version](#version)\>
    

### mute

-   get mute(): boolean
    
    #### Returns boolean
    
-   set mute(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    

### mutedViaSolo

-   get mutedViaSolo(): boolean
    
    #### Returns boolean
    

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
    

### solo

-   get solo(): boolean
    
    #### Returns boolean
    
-   set solo(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    

### takeLanes

-   get takeLanes(): [TakeLane](TakeLane.md)<[Version](#version)\>\[\]
    
    #### Returns [TakeLane](TakeLane.md)<[Version](#version)\>\[\]
    

## Methods

### clearClipsInRange

-   clearClipsInRange(startTime: number, endTime: number): Promise<void\>
    
    Deletes clips within the range. Clips that overlap a boundary are truncated to the range edge rather than fully deleted.
    
    #### Parameters
    
    -   startTime: number
        
        Start of the range in beats.
        
    -   endTime: number
        
        End of the range in beats.
        
    
    #### Returns Promise<void\>
    

### createTakeLane

-   createTakeLane(): Promise<[TakeLane](TakeLane.md)<[Version](#version)\>\>
    
    Appended to the end of [takeLanes](#takelanes).
    
    #### Returns Promise<[TakeLane](TakeLane.md)<[Version](#version)\>\>
    

### deleteClip

-   deleteClip(clip: [Clip](Clip.md)<[Version](#version)\>): Promise<void\>
    
    Deletes an arrangement clip. For session clips, use [ClipSlot.deleteClip](ClipSlot.md#deleteclip). Await the returned promise to ensure the deletion has been fully processed.
    
    #### Parameters
    
    -   clip: [Clip](Clip.md)<[Version](#version)\>
    
    #### Returns Promise<void\>
    

### deleteDevice

-   deleteDevice(device: [Device](Device.md)<[Version](#version)\>): Promise<void\>
    
    Deletes a device from this track's device chain. Await the returned promise to ensure the deletion has been fully processed.
    
    #### Parameters
    
    -   device: [Device](Device.md)<[Version](#version)\>
    
    #### Returns Promise<void\>
    

### duplicateDevice

-   duplicateDevice(device: [Device](Device.md)<[Version](#version)\>): Promise<[Device](Device.md)<[Version](#version)\>\>
    
    The duplicate is inserted directly after the original in the device chain.
    
    #### Parameters
    
    -   device: [Device](Device.md)<[Version](#version)\>
    
    #### Returns Promise<[Device](Device.md)<[Version](#version)\>\>
    

### insertDevice

-   insertDevice(deviceName: string, index: number): Promise<[Device](Device.md)<[Version](#version)\>\>
    
    Inserts a built-in Live device with its default preset into the track's device chain. Only devices native to Live are supported — third-party plug-ins cannot be loaded this way.
    
    #### Parameters
    
    -   deviceName: string
        
        The name of the built-in Live device (e.g. `"Reverb"`, `"Auto Filter"`).
        
    -   index: number
        
        Zero-based position in the device chain at which to insert.
        
    
    #### Returns Promise<[Device](Device.md)<[Version](#version)\>\>
