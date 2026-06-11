# Interface ClipLoopSettings

Initial region and loop settings for a new audio clip. These values become [Clip.startMarker](../classes/Clip.md#startmarker), [Clip.endMarker](../classes/Clip.md#endmarker), [Clip.loopStart](../classes/Clip.md#loopstart), and [Clip.loopEnd](../classes/Clip.md#loopend) on the created clip.

The API enforces:

-   `startMarker ≤ endMarker`.
-   The loop must be at least 0.25 beats (one 16th note) long.
-   When `looping` is `false`: `loopStart === startMarker` and `loopEnd === endMarker`.
-   When `isWarped` is `false`: positions must be non-negative and `looping` must be `false`.

interface ClipLoopSettings {  
    [endMarker](#endmarker): number;  
    [loopEnd](#loopend): number;  
    [looping](#looping): boolean;  
    [loopStart](#loopstart): number;  
    [startMarker](#startmarker): number;  
}

## Properties

### endMarker

endMarker: number

In beats.

### loopEnd

loopEnd: number

In beats.

### looping

looping: boolean

### loopStart

loopStart: number

In beats.

### startMarker

startMarker: number

In beats.
