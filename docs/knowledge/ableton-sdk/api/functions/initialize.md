# Function initialize

-   initialize<[V](#initializev) extends "1.0.0"\>(  
        context: [ActivationContext](../interfaces/ActivationContext.md),  
        apiVersion: [V](#initializev),  
    ): [ExtensionContext](../interfaces/ExtensionContext.md)<[V](#initializev)\>
    
    Initializes the SDK with the Extension Host and returns the API context.
    
    Pass the lowest API version that covers all the features your extension needs. The Extension Host preserves older API versions as Live evolves, so targeting an older version keeps your extension compatible with a wider range of Live releases. Available versions are listed in [EXTENSIONS\_API\_VERSIONS](../variables/EXTENSIONS_API_VERSIONS.md).
    
    Throws if the Extension Host does not support the requested API version.
    
    #### Type Parameters
    
    -   V extends "1.0.0"
    
    #### Parameters
    
    -   context: [ActivationContext](../interfaces/ActivationContext.md)
        
        The activation context passed to your extension's `activate` function.
        
    -   apiVersion: [V](#initializev)
        
        The API version your extension targets (e.g. `"1.0.0"`).
        
    
    #### Returns [ExtensionContext](../interfaces/ExtensionContext.md)<[V](#initializev)\>
    
    An [ExtensionContext](../interfaces/ExtensionContext.md) providing access to Live's object model, commands, and UI.
