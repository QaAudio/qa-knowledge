# Class TrackMixer<Version>

Represents the mixer of a track.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#TrackMixer))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   TrackMixer

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: "MixerDevice"

## Accessors

### panning

-   get panning(): [DeviceParameter](DeviceParameter.md)<[Version](#version)\>
    
    #### Returns [DeviceParameter](DeviceParameter.md)<[Version](#version)\>
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
    

### sends

-   get sends(): [DeviceParameter](DeviceParameter.md)<[Version](#version)\>\[\]
    
    #### Returns [DeviceParameter](DeviceParameter.md)<[Version](#version)\>\[\]
    

### volume

-   get volume(): [DeviceParameter](DeviceParameter.md)<[Version](#version)\>
    
    #### Returns [DeviceParameter](DeviceParameter.md)<[Version](#version)\>
