# Class Clip<Version>

Represents a clip.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#Clip))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   Clip
        -   [MidiClip](MidiClip.md)
        -   [AudioClip](AudioClip.md)

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: string = "Clip"

## Accessors

### color

-   get color(): number
    
    #### Returns number
    
-   set color(value: number): void
    
    #### Parameters
    
    -   value: number
    
    #### Returns void
    

### duration

-   get duration(): number
    
    #### Returns number
    

### endMarker

-   get endMarker(): number
    
    #### Returns number
    

### endTime

-   get endTime(): number
    
    #### Returns number
    

### loopEnd

-   get loopEnd(): number
    
    #### Returns number
    

### looping

-   get looping(): boolean
    
    Whether the clip is looped. Enabling looping on an unwarped audio clip automatically enables warping.
    
    #### Returns boolean
    
-   set looping(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    

### loopStart

-   get loopStart(): number
    
    #### Returns number
    

### muted

-   get muted(): boolean
    
    #### Returns boolean
    
-   set muted(value: boolean): void
    
    #### Parameters
    
    -   value: boolean
    
    #### Returns void
    

### name

-   get name(): string
    
    #### Returns string
    
-   set name(name: string): void
    
    #### Parameters
    
    -   name: string
    
    #### Returns void
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
    

### startMarker

-   get startMarker(): number
    
    #### Returns number
    

### startTime

-   get startTime(): number
    
    #### Returns number
