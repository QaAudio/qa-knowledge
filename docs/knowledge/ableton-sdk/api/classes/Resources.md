# Class Resources<Version>

Service for importing files into the Live project and rendering audio from the arrangement.

#### Type Parameters

-   Version extends ApiVersion

## Methods

### importIntoProject

-   importIntoProject(filePath: string): Promise<string\>
    
    Copies a file into the Live project folder so that Live manages it. Returns the path to the imported copy. Use the returned path in subsequent API calls, not the original.
    
    #### Parameters
    
    -   filePath: string
    
    #### Returns Promise<string\>
    

### renderPreFxAudio

-   renderPreFxAudio(  
        track: [AudioTrack](AudioTrack.md)<[Version](#version)\>,  
        startTime: number,  
        endTime: number,  
    ): Promise<string\>
    
    Renders the pre-effects audio of a track in the arrangement between two beat positions. Returns a path to a WAV file written to the extension's temp directory.
    
    #### Parameters
    
    -   track: [AudioTrack](AudioTrack.md)<[Version](#version)\>
    -   startTime: number
        
        In beats.
        
    -   endTime: number
        
        In beats.
        
    
    #### Returns Promise<string\>
