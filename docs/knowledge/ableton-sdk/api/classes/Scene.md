# Class Scene<Version>

Represents a scene.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#Scene))

-   [DataModelObject](DataModelObject.md)<[Version](#version)\>
    -   Scene

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

Inherited from [DataModelObject](DataModelObject.md).[handle](DataModelObject.md#handle)

### `Static` `Readonly`className

className: "Scene"

## Accessors

### name

-   get name(): string
    
    #### Returns string
    
-   set name(value: string): void
    
    #### Parameters
    
    -   value: string
    
    #### Returns void
    

### parent

-   get parent(): [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns [DataModelObject](DataModelObject.md)<[Version](DataModelObject.md#version)\> | null
    
    Inherited from DataModelObject.parent
    

### signatureDenominator

-   get signatureDenominator(): number
    
    #### Returns number
    

### signatureNumerator

-   get signatureNumerator(): number
    
    #### Returns number
    

### tempo

-   get tempo(): number
    
    #### Returns number
