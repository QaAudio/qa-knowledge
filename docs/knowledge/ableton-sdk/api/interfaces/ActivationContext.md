# Interface ActivationContext

The context passed to your extension's `activate` function. Pass it to [initialize](../functions/initialize.md) to set up the SDK.

interface ActivationContext {  
    [hostApiVersion](#hostapiversion): string;  
}

## Properties

### hostApiVersion

hostApiVersion: string

The latest API version the Extension Host supports.
