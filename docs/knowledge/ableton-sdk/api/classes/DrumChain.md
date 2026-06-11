# Class DrumChain<Version>

Represents a drum chain.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#DrumChain))

-   [Chain](Chain.md)<[Version](#version)\>
    -   DrumChain

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [Chain](Chain.md).[handle](Chain.md#handle)

### `Static` `Readonly`className

className: "DrumChain"

Overrides [Chain](Chain.md).[className](Chain.md#classname)

## Accessors

### devices

-   get devices(): [Device](Device.md)<[Version](Chain.md#version)\>\[\]
    
    #### Returns [Device](Device.md)<[Version](Chain.md#version)\>\[\]
    
    Inherited from Chain.devices
    

### mixer

-   get mixer(): [ChainMixer](ChainMixer.md)<[Version](Chain.md#version)\>
    
    #### Returns [ChainMixer](ChainMixer.md)<[Version](Chain.md#version)\>
    
    Inherited from Chain.mixer
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from Chain.parent
    

### receivingNote

-   get receivingNote(): number
    
    #### Returns number
    
-   set receivingNote(value: number): void
    
    #### Parameters
    
    -   value: number
    
    #### Returns void
    

## Methods

### deleteDevice

-   deleteDevice(device: [Device](Device.md)<[Version](#version)\>): Promise<void\>
    
    Deletes a device from this chain. Await the returned promise to ensure the deletion has been fully processed.
    
    #### Parameters
    
    -   device: [Device](Device.md)<[Version](#version)\>
    
    #### Returns Promise<void\>
    
    Inherited from [Chain](Chain.md).[deleteDevice](Chain.md#deletedevice)
    

### duplicateDevice

-   duplicateDevice(device: [Device](Device.md)<[Version](#version)\>): Promise<[Device](Device.md)<[Version](#version)\>\>
    
    The duplicate is inserted directly after the original in the device chain.
    
    #### Parameters
    
    -   device: [Device](Device.md)<[Version](#version)\>
    
    #### Returns Promise<[Device](Device.md)<[Version](#version)\>\>
    
    Inherited from [Chain](Chain.md).[duplicateDevice](Chain.md#duplicatedevice)
    

### insertDevice

-   insertDevice(deviceName: string, index: number): Promise<[Device](Device.md)<[Version](#version)\>\>
    
    Inserts a built-in Live device with its default preset into the chain. Only devices native to Live are supported — third-party plug-ins cannot be loaded this way.
    
    #### Parameters
    
    -   deviceName: string
        
        The name of the built-in Live device (e.g. `"Reverb"`, `"Auto Filter"`).
        
    -   index: number
        
        Zero-based position in the device chain at which to insert.
        
    
    #### Returns Promise<[Device](Device.md)<[Version](#version)\>\>
    
    Inherited from [Chain](Chain.md).[insertDevice](Chain.md#insertdevice)
