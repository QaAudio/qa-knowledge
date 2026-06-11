# Class AudioClip<Version>

Represents an audio clip.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#AudioClip))

-   [Clip](Clip.md)<[Version](#version)\>
    -   AudioClip

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [Clip](Clip.md).[handle](Clip.md#handle)

### `Static` `Readonly`className

className: "AudioClip"

Overrides [Clip](Clip.md).[className](Clip.md#classname)

## Accessors

### color

-   get color(): number
    
    #### Returns number
    
    Inherited from Clip.color
    
-   set color(value: number): void
    
    #### Parameters
    
    -   value: number
    
    #### Returns void
    
    Inherited from Clip.color
    

### duration

-   get duration(): number
    
    #### Returns number
    
    Inherited from Clip.duration
    

### endMarker

-   get endMarker(): number
    
    #### Returns number
    
    Inherited from Clip.endMarker
    

### endTime

-   get endTime(): number
    
    #### Returns number
    
    Inherited from Clip.endTime
    

### filePath

-   get filePath(): string
    
    #### Returns string
    

### loopEnd

-   get loopEnd(): number
    
    #### Returns number
    
    Inherited from Clip.loopEnd
    

### looping

-   get looping(): boolean
    
    Whether the clip is looped. Enabling looping on an unwarped audio clip automatically enables warping.
    
    #### Returns boolean
    
    Inherited from Clip.looping
    
-   set looping(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    
    Inherited from Clip.looping
    

### loopStart

-   get loopStart(): number
    
    #### Returns number
    
    Inherited from Clip.loopStart
    

### muted

-   get muted(): boolean
    
    #### Returns boolean
    
    Inherited from Clip.muted
    
-   set muted(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    
    Inherited from Clip.muted
    

### name

-   get name(): string
    
    #### Returns string
    
    Inherited from Clip.name
    
-   set name(name: string): void
    
    #### Parameters
    
    -   name: string
    
    #### Returns void
    
    Inherited from Clip.name
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from Clip.parent
    

### startMarker

-   get startMarker(): number
    
    #### Returns number
    
    Inherited from Clip.startMarker
    

### startTime

-   get startTime(): number
    
    #### Returns number
    
    Inherited from Clip.startTime
    

### warping

-   get warping(): boolean
    
    #### Returns boolean
    
-   set warping(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    

### warpMarkers

-   get warpMarkers(): [WarpMarker](../interfaces/WarpMarker.md)\[\]
    
    #### Returns [WarpMarker](../interfaces/WarpMarker.md)\[\]
    

### warpMode

-   get warpMode(): [WarpMode](../enums/WarpMode.md)
    
    #### Returns [WarpMode](../enums/WarpMode.md)
    
-   set warpMode(warpMode: [WarpMode](../enums/WarpMode.md)): void
    
    #### Parameters
    
    -   warpMode: [WarpMode](../enums/WarpMode.md)
    
    #### Returns void
