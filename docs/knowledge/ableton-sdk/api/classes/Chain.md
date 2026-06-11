# Class Chain<Version>

Represents a device chain.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#Chain))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   Chain
        -   [DrumChain](DrumChain.md)

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: string = "Chain"

## Accessors

### devices

-   get devices(): [Device](Device.md)<[Version](#version)\>\[\]
    
    #### Returns [Device](Device.md)<[Version](#version)\>\[\]
    

### mixer

-   get mixer(): [ChainMixer](ChainMixer.md)<[Version](#version)\>
    
    #### Returns [ChainMixer](ChainMixer.md)<[Version](#version)\>
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
    

## Methods

### deleteDevice

-   deleteDevice(device: [Device](Device.md)<[Version](#version)\>): Promise<void\>
    
    Deletes a device from this chain. Await the returned promise to ensure the deletion has been fully processed.
    
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
    
    Inserts a built-in Live device with its default preset into the chain. Only devices native to Live are supported — third-party plug-ins cannot be loaded this way.
    
    #### Parameters
    
    -   deviceName: string
        
        The name of the built-in Live device (e.g. `"Reverb"`, `"Auto Filter"`).
        
    -   index: number
        
        Zero-based position in the device chain at which to insert.
        
    
    #### Returns Promise<[Device](Device.md)<[Version](#version)\>\>
