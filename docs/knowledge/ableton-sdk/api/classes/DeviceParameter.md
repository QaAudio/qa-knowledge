# Class DeviceParameter<Version>

Represents a device parameter.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#DeviceParameter))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   DeviceParameter

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: "DeviceParameter"

## Accessors

### defaultValue

-   get defaultValue(): number
    
    #### Returns number
    

### isQuantized

-   get isQuantized(): boolean
    
    #### Returns boolean
    

### max

-   get max(): number
    
    #### Returns number
    

### min

-   get min(): number
    
    #### Returns number
    

### name

-   get name(): string
    
    #### Returns string
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
    

### valueItems

-   get valueItems(): [DeviceParameterValueItem](../interfaces/DeviceParameterValueItem.md)\[\]
    
    #### Returns [DeviceParameterValueItem](../interfaces/DeviceParameterValueItem.md)\[\]
    

## Methods

### getValue

-   getValue(): Promise<number\>
    
    #### Returns Promise<number\>
    

### setValue

-   setValue(value: number): Promise<void\>
    
    #### Parameters
    
    -   value: number
    
    #### Returns Promise<void\>
