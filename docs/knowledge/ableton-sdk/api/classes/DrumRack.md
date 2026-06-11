# Class DrumRack<Version>

Represents a Drum Rack device.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#DrumRack))

-   [RackDevice](RackDevice.md)<[Version](#version)\>
    -   DrumRack

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [RackDevice](RackDevice.md).[handle](RackDevice.md#handle)

### `Static` `Readonly`className

className: "DrumRackDevice"

Overrides [RackDevice](RackDevice.md).[className](RackDevice.md#classname)

## Accessors

### chains

-   get chains(): [DrumChain](DrumChain.md)<[Version](#version)\>\[\]
    
    #### Returns [DrumChain](DrumChain.md)<[Version](#version)\>\[\]
    
    Overrides RackDevice.chains
    

### name

-   get name(): string
    
    #### Returns string
    
    Inherited from RackDevice.name
    

### parameters

-   get parameters(): [DeviceParameter](DeviceParameter.md)<[Version](Device.md#version)\>\[\]
    
    #### Returns [DeviceParameter](DeviceParameter.md)<[Version](Device.md#version)\>\[\]
    
    Inherited from RackDevice.parameters
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from RackDevice.parent
    

## Methods

### insertChain

-   insertChain(index: number): Promise<[Chain](Chain.md)<[Version](#version)\>\>
    
    #### Parameters
    
    -   index: number
        
        0-based insert position in the range `[0, rack.chains.length]`.
        
    
    #### Returns Promise<[Chain](Chain.md)<[Version](#version)\>\>
    
    Inherited from [RackDevice](RackDevice.md).[insertChain](RackDevice.md#insertchain)
