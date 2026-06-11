# Class DataModelObject<Version>

Base class for all SDK objects.

When the exact type of a received handle is not known in advance, pass `DataModelObject` as the `type` argument to [ExtensionContext.getObjectFromHandle](../interfaces/ExtensionContext.md#getobjectfromhandle) — see that method for details.

#### Type Parameters

-   Version extends ApiVersion

#### Hierarchy ([View Summary](../hierarchy.md#DataModelObject))

-   DataModelObject
    -   [Application](Application.md)
    -   [Clip](Clip.md)
    -   [Track](Track.md)
    -   [Song](Song.md)
    -   [ClipSlot](ClipSlot.md)
    -   [CuePoint](CuePoint.md)
    -   [TakeLane](TakeLane.md)
    -   [Chain](Chain.md)
    -   [ChainMixer](ChainMixer.md)
    -   [Device](Device.md)
    -   [DeviceParameter](DeviceParameter.md)
    -   [TrackMixer](TrackMixer.md)
    -   [Sample](Sample.md)
    -   [Scene](Scene.md)

## Properties

### `Readonly`handle

handle: [Handle](../interfaces/Handle.md)

## Accessors

### parent

-   get parent(): DataModelObject<[Version](#version)\> | null
    
    The canonical parent of this object in Live's object hierarchy, or `null` if it has none.
    
    #### Returns DataModelObject<[Version](#version)\> | null
