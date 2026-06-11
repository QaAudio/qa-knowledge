# Interface Handle

An opaque reference to a Live object, assigned by the Extension Host.

Handles are received in various contexts — for example, when a command is invoked it may carry a handle representing the object the action was triggered on. Use [ExtensionContext.getObjectFromHandle](ExtensionContext.md#getobjectfromhandle) to resolve a handle into a typed SDK object.

```
commands.registerCommand("myAction", (...args) => {  const handle = args[0] as Handle;  const obj = context.getObjectFromHandle(handle, DataModelObject);  if (obj instanceof ClipSlot) {    // ...  }});
Copy
```

The `id` is an arbitrary number assigned by the host — never construct a Handle yourself. Only handles received from the host are valid.

interface Handle {  
    [id](#id): bigint;  
}

## Properties

### id

id: bigint
