import { createHash } from "node:crypto";
/** SHA-256 hex digest of UTF-8 text. */
export function sha256(text) {
    return createHash("sha256").update(text, "utf8").digest("hex");
}
/** Stable point id from source path, chunk index, and content hash. */
export function makeChunkId(sourceId, chunkIndex, contentHash) {
    return sha256(`${sourceId}:${chunkIndex}:${contentHash}`).slice(0, 32);
}
