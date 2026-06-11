# Class Device<Version>

Represents a device.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#Device))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   Device
        -   [RackDevice](RackDevice.md)
        -   [Simpler](Simpler.md)

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: string = "Device"

## Accessors

### name

-   get name(): string
    
    #### Returns string
    

### parameters

-   get parameters(): [DeviceParameter](DeviceParameter.md)<[Version](#version)\>\[\]
    
    #### Returns [DeviceParameter](DeviceParameter.md)<[Version](#version)\>\[\]
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
