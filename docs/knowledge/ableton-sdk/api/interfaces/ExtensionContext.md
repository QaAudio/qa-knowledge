# Interface ExtensionContext<Version>

Provides access to all SDK functionality. Returned by [initialize](../functions/initialize.md).

interface ExtensionContext<[Version](#version) extends ApiVersion\> {  
    [application](#application): [Application](../classes/Application.md)<[Version](#version)\>;  
    [commands](#commands): [Commands](../classes/Commands.md)<[Version](#version)\>;  
    [environment](#environment): [Environment](../classes/Environment.md)<[Version](#version)\>;  
    [resources](#resources): [Resources](../classes/Resources.md)<[Version](#version)\>;  
    [ui](#ui): [Ui](../classes/Ui.md)<[Version](#version)\>;  
    [getObjectFromHandle](#getobjectfromhandle-1)<[T](#getobjectfromhandlet) extends [DataModelObject](../classes/DataModelObject.md)<[Version](#version)\>\>(  
        handle: [Handle](Handle.md),  
        type: new (...args: never) \=> [T](#getobjectfromhandlet),  
    ): [T](#getobjectfromhandlet);  
    [withinTransaction](#withintransaction-1)<[T](#withintransactiont)\>(fn: () \=> [T](#withintransactiont)): [T](#withintransactiont);  
}

#### Type Parameters

-   Version extends ApiVersion

## Properties

### application

application: [Application](../classes/Application.md)<[Version](#version)\>

### commands

commands: [Commands](../classes/Commands.md)<[Version](#version)\>

### environment

environment: [Environment](../classes/Environment.md)<[Version](#version)\>

### resources

resources: [Resources](../classes/Resources.md)<[Version](#version)\>

### ui

ui: [Ui](../classes/Ui.md)<[Version](#version)\>

## Methods

### getObjectFromHandle

-   getObjectFromHandle<[T](#getobjectfromhandlet) extends [DataModelObject](../classes/DataModelObject.md)<[Version](#version)\>\>(  
        handle: [Handle](Handle.md),  
        type: new (...args: never) \=> [T](#getobjectfromhandlet),  
    ): [T](#getobjectfromhandlet)
    
    Resolves a [Handle](Handle.md) into a typed SDK object.
    
    Pass [DataModelObject](../classes/DataModelObject.md) as `type` when the exact type of the handle is not known in advance, then use `instanceof` to branch on the actual type:
    
    ```
    const obj = context.getObjectFromHandle(handle, DataModelObject);if (obj instanceof ClipSlot) {  // ...}
    Copy
    ```
    
    Objects are cached by handle ID, so the same Live object always returns the same SDK instance.
    
    Throws if the underlying object has been deleted, if it is of a different type than `type`, or if its type is not recognised.
    
    #### Type Parameters
    
    -   T extends [DataModelObject](../classes/DataModelObject.md)<[Version](#version)\>
    
    #### Parameters
    
    -   handle: [Handle](Handle.md)
    -   type: new (...args: never) \=> [T](#getobjectfromhandlet)
    
    #### Returns [T](#getobjectfromhandlet)
    

### withinTransaction

-   withinTransaction<[T](#withintransactiont)\>(fn: () \=> [T](#withintransactiont)): [T](#withintransactiont)
    
    Groups mutations into a single undo step.
    
    Individual mutations are already undoable on their own; use this only to roll several changes into one user-facing undo entry. Nested transactions collapse into the outermost one.
    
    The callback must be synchronous — you cannot `await` inside it — but returning `Promise.all([...])` lets you group multiple async operations (such as creating tracks) into one undo step:
    
    ```
    const tracks = await withinTransaction(() =>  Promise.all([song.createAudioTrack(), song.createAudioTrack()]),);
    Copy
    ```
    
    #### Type Parameters
    
    -   T
    
    #### Parameters
    
    -   fn: () \=> [T](#withintransactiont)
    
    #### Returns [T](#withintransactiont)
