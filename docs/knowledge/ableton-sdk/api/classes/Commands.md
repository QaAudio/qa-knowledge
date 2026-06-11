# Class Commands<Version>

Registry for extension commands.

Commands are identified by a string ID and can be invoked by Live (e.g. through a context menu action registered via [ExtensionContext.ui](../interfaces/ExtensionContext.md#ui)) or programmatically via [Commands.executeCommand](#executecommand).

#### Type Parameters

-   Version extends ApiVersion

## Methods

### executeCommand

-   executeCommand(commandId: string, ...args: unknown\[\]): void
    
    Programmatically invokes a registered command.
    
    #### Parameters
    
    -   commandId: string
        
        The ID of the command to invoke.
        
    -   ...args: unknown\[\]
        
        Arguments to pass to the command's callback.
        
    
    #### Returns void
    

### registerCommand

-   registerCommand(commandId: string, callback: (...args: unknown\[\]) \=> void): void
    
    Registers a command that can be invoked by Live or via [Commands.executeCommand](#executecommand).
    
    #### Parameters
    
    -   commandId: string
        
        A unique string identifier for this command.
        
    -   callback: (...args: unknown\[\]) \=> void
        
        Called when the command is invoked. May receive arguments passed by the invoker.
        
    
    #### Returns void
