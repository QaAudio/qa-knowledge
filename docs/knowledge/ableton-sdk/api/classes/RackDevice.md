# Class RackDevice<Version>

Represents a rack device.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#RackDevice))

-   [Device](Device.md)<[Version](#version)\>
    -   RackDevice
        -   [DrumRack](DrumRack.md)

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [Device](Device.md).[handle](Device.md#handle)

### `Static` `Readonly`className

className: string = "RackDevice"

Overrides [Device](Device.md).[className](Device.md#classname)

## Accessors

### chains

-   get chains(): [Chain](Chain.md)<[Version](#version)\>\[\]
    
    #### Returns [Chain](Chain.md)<[Version](#version)\>\[\]
    

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
    

## Methods

### insertChain

-   insertChain(index: number): Promise<[Chain](Chain.md)<[Version](#version)\>\>
    
    #### Parameters
    
    -   index: number
        
        0-based insert position in the range `[0, rack.chains.length]`.
        
    
    #### Returns Promise<[Chain](Chain.md)<[Version](#version)\>\>
