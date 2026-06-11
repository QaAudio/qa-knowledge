/** SHA-256 hex digest of UTF-8 text. */
export declare function sha256(text: string): string;
/** Stable point id from source path, chunk index, and content hash. */
export declare function makeChunkId(sourceId: string, chunkIndex: number, contentHash: string): string;
