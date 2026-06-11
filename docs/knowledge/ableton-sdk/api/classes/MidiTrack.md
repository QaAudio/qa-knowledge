# Class MidiTrack<Version>

Represents a MIDI track.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#MidiTrack))

-   [Track](Track.md)<[Version](#version)\>
    -   MidiTrack

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [Track](Track.md).[handle](Track.md#handle)

### `Static` `Readonly`className

className: "MidiTrack"

Overrides [Track](Track.md).[className](Track.md#classname)

## Accessors

### arm

-   get arm(): boolean
    
    #### Returns boolean
    
    Inherited from Track.arm
    
-   set arm(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    
    Inherited from Track.arm
    

### arrangementClips

-   get arrangementClips(): [Clip](Clip.md)<[Version](Track.md#version)\>\[\]
    
    #### Returns [Clip](Clip.md)<[Version](Track.md#version)\>\[\]
    
    Inherited from Track.arrangementClips
    

### clipSlots

-   get clipSlots(): [ClipSlot](ClipSlot.md)<[Version](Track.md#version)\>\[\]
    
    #### Returns [ClipSlot](ClipSlot.md)<[Version](Track.md#version)\>\[\]
    
    Inherited from Track.clipSlots
    

### devices

-   get devices(): [Device](Device.md)<[Version](Track.md#version)\>\[\]
    
    #### Returns [Device](Device.md)<[Version](Track.md#version)\>\[\]
    
    Inherited from Track.devices
    

### groupTrack

-   get groupTrack(): [Track](Track.md)<[Version](Track.md#version)\> | null
    
    #### Returns [Track](Track.md)<[Version](Track.md#version)\> | null
    
    Inherited from Track.groupTrack
    

### mixer

-   get mixer(): [TrackMixer](TrackMixer.md)<[Version](Track.md#version)\>
    
    #### Returns [TrackMixer](TrackMixer.md)<[Version](Track.md#version)\>
    
    Inherited from Track.mixer
    

### mute

-   get mute(): boolean
    
    #### Returns boolean
    
    Inherited from Track.mute
    
-   set mute(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    
    Inherited from Track.mute
    

### mutedViaSolo

-   get mutedViaSolo(): boolean
    
    #### Returns boolean
    
    Inherited from Track.mutedViaSolo
    

### name

-   get name(): string
    
    #### Returns string
    
    Inherited from Track.name
    
-   set name(value: string): void
    
    #### Parameters
    
    -   value: string
    
    #### Returns void
    
    Inherited from Track.name
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from Track.parent
    

### solo

-   get solo(): boolean
    
    #### Returns boolean
    
    Inherited from Track.solo
    
-   set solo(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    
    Inherited from Track.solo
    

### takeLanes

-   get takeLanes(): [TakeLane](TakeLane.md)<[Version](Track.md#version)\>\[\]
    
    #### Returns [TakeLane](TakeLane.md)<[Version](Track.md#version)\>\[\]
    
    Inherited from Track.takeLanes
    

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
    
    Inherited from [Track](Track.md).[clearClipsInRange](Track.md#clearclipsinrange)
    

### createMidiClip

-   createMidiClip(startTime: number, duration: number): Promise<[MidiClip](MidiClip.md)<[Version](#version)\>\>
    
    #### Parameters
    
    -   startTime: number
        
        Position in the arrangement in beats.
        
    -   duration: number
        
        Length of the clip in beats.
        
    
    #### Returns Promise<[MidiClip](MidiClip.md)<[Version](#version)\>\>
    

### createTakeLane

-   createTakeLane(): Promise<[TakeLane](TakeLane.md)<[Version](#version)\>\>
    
    Appended to the end of [takeLanes](#takelanes).
    
    #### Returns Promise<[TakeLane](TakeLane.md)<[Version](#version)\>\>
    
    Inherited from [Track](Track.md).[createTakeLane](Track.md#createtakelane)
    

### deleteClip

-   deleteClip(clip: [Clip](Clip.md)<[Version](#version)\>): Promise<void\>
    
    Deletes an arrangement clip. For session clips, use [ClipSlot.deleteClip](ClipSlot.md#deleteclip). Await the returned promise to ensure the deletion has been fully processed.
    
    #### Parameters
    
    -   clip: [Clip](Clip.md)<[Version](#version)\>
    
    #### Returns Promise<void\>
    
    Inherited from [Track](Track.md).[deleteClip](Track.md#deleteclip)
    

### deleteDevice

-   deleteDevice(device: [Device](Device.md)<[Version](#version)\>): Promise<void\>
    
    Deletes a device from this track's device chain. Await the returned promise to ensure the deletion has been fully processed.
    
    #### Parameters
    
    -   device: [Device](Device.md)<[Version](#version)\>
    
    #### Returns Promise<void\>
    
    Inherited from [Track](Track.md).[deleteDevice](Track.md#deletedevice)
    

### duplicateDevice

-   duplicateDevice(device: [Device](Device.md)<[Version](#version)\>): Promise<[Device](Device.md)<[Version](#version)\>\>
    
    The duplicate is inserted directly after the original in the device chain.
    
    #### Parameters
    
    -   device: [Device](Device.md)<[Version](#version)\>
    
    #### Returns Promise<[Device](Device.md)<[Version](#version)\>\>
    
    Inherited from [Track](Track.md).[duplicateDevice](Track.md#duplicatedevice)
    

### insertDevice

-   insertDevice(deviceName: string, index: number): Promise<[Device](Device.md)<[Version](#version)\>\>
    
    Inserts a built-in Live device with its default preset into the track's device chain. Only devices native to Live are supported — third-party plug-ins cannot be loaded this way.
    
    #### Parameters
    
    -   deviceName: string
        
        The name of the built-in Live device (e.g. `"Reverb"`, `"Auto Filter"`).
        
    -   index: number
        
        Zero-based position in the device chain at which to insert.
        
    
    #### Returns Promise<[Device](Device.md)<[Version](#version)\>\>
    
    Inherited from [Track](Track.md).[insertDevice](Track.md#insertdevice)
