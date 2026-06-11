# Class Simpler<Version>

Represents a Simpler device.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#Simpler))

-   [Device](Device.md)<[Version](#version)\>
    -   Simpler

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [Device](Device.md).[handle](Device.md#handle)

### `Static` `Readonly`className

className: "Simpler"

Overrides [Device](Device.md).[className](Device.md#classname)

## Accessors

### name

-   get name(): string
    
    #### Returns string
    
    Inherited from Device.name
    

### parameters

-   get parameters(): [DeviceParameter](DeviceParameter.md)<[Version](Device.md#version)\>\[\]
    
    #### Returns [DeviceParameter](DeviceParameter.md)<[Version](Device.md#version)\>\[\]
    
    Inherited from Device.parameters
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from Device.parent
    

### sample

-   get sample(): [Sample](Sample.md)<[Version](#version)\> | null
    
    #### Returns [Sample](Sample.md)<[Version](#version)\> | null
    

## Methods

### replaceSample

-   replaceSample(filePath: string): Promise<[Sample](Sample.md)<[Version](#version)\>\>
    
    Replaces the loaded sample with the audio file at the given absolute path.
    
    #### Parameters
    
    -   filePath: string
    
    #### Returns Promise<[Sample](Sample.md)<[Version](#version)\>\>
