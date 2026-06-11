# Class Ui<Version>

Service for UI interactions: context menus, modal dialogs, and progress dialogs.

#### Type Parameters

-   Version extends ApiVersion

## Methods

### registerContextMenuAction

-   registerContextMenuAction(  
        scope: [ContextMenuScope](../types/ContextMenuScope.md)<[Version](#version)\>,  
        title: string,  
        commandId: string,  
    ): Promise<() \=> Promise<void\>\>
    
    Registers a context menu action in the given [ContextMenuScope](../types/ContextMenuScope.md).
    
    When the user triggers the action, Live invokes the command identified by `commandId`. Depending on the scope, the command receives either the triggered object's [Handle](../interfaces/Handle.md), an [ArrangementSelection](../interfaces/ArrangementSelection.md), or a [ClipSlotSelection](../interfaces/ClipSlotSelection.md) as its first argument.
    
    Returns a function that unregisters the action when called.
    
    #### Parameters
    
    -   scope: [ContextMenuScope](../types/ContextMenuScope.md)<[Version](#version)\>
    -   title: string
    -   commandId: string
    
    #### Returns Promise<() \=> Promise<void\>\>
    

### showModalDialog

-   showModalDialog(url: string, width: number, height: number): Promise<string\>
    
    Opens a modal dialog that loads the given URL. Supported URL schemes are `file:`, `data:`, `https:`, and `http://localhost`.
    
    To return a result and close the dialog, the dialog's HTML must post the message `{ method: "close_and_send", params: [resultString] }` to the host's message handler — `window.webkit.messageHandlers.live.postMessage` on macOS or `window.chrome.webview.postMessage` on Windows. The returned promise resolves with that string.
    
    Rejects if `url` is malformed or an unexpected error occurred.
    
    #### Parameters
    
    -   url: string
    -   width: number
    -   height: number
    
    #### Returns Promise<string\>
    

### withinProgressDialog

-   withinProgressDialog(  
        text: string,  
        options: { progress?: number },  
        callback: (  
            update: (updateText: string, progress?: number) \=> Promise<void\>,  
            abortSignal: AbortSignal,  
        ) \=> Promise<unknown\>,  
    ): Promise<unknown\>
    
    Shows a progress dialog while `callback` runs. The callback receives an `update` function to change the text/progress (progress is a percentage, 0–100), and an `AbortSignal` that fires if the user cancels the dialog. The dialog closes automatically when the callback resolves or rejects.
    
    #### Parameters
    
    -   text: string
    -   options: { progress?: number }
    -   callback: (  
            update: (updateText: string, progress?: number) \=> Promise<void\>,  
            abortSignal: AbortSignal,  
        ) \=> Promise<unknown\>
    
    #### Returns Promise<unknown\>
    
    #### Example
    
    ```
    const wavPath = await ui.withinProgressDialog(  "Rendering audio…",  { progress: 0 },  async (update, signal) => {    await update("Analysing…", 30);    if (signal.aborted) return;    await update("Rendering…", 70);    return await resources.renderPreFxAudio(track, startBeat, endBeat);  },);
    Copy
    ```
