# Class Environment<Version>

Provides runtime environment information: filesystem paths and the current locale.

#### Type Parameters

-   Version extends ApiVersion

## Accessors

### language

-   get language(): string | undefined
    
    Live's current UI language as an uppercase ISO 639-1 code (e.g. `"EN"`, `"DE"`, `"JA"`).
    
    #### Returns string | undefined
    

### storageDirectory

-   get storageDirectory(): string | undefined
    
    Per-extension directory for persistent storage. Use it for configuration, credentials, and cached state — anything that should survive across Live sessions.
    
    #### Returns string | undefined
    

### tempDirectory

-   get tempDirectory(): string | undefined
    
    Per-extension directory for temporary files, such as intermediate audio or analysis results. May be cleaned up between sessions.
    
    #### Returns string | undefined
