import type { EmbeddingConfig, IndexState, QdrantConfig } from "./types.js";
/** Versioned index state, committed to git alongside the corpus. */
export declare const INDEX_STATE_FILE = ".qa-index.json";
/** Absolute path of the index state file for a knowledge root. */
export declare function indexStatePath(knowledgeRoot: string): string;
/** Load the index state, or `null` when absent/unreadable. */
export declare function loadIndexState(filePath: string): IndexState | null;
/** Write the index state with stable key ordering for clean diffs. */
export declare function saveIndexState(filePath: string, state: IndexState): void;
/** Fresh empty state stamped with the active collection + embedding config. */
export declare function emptyIndexState(qdrant: QdrantConfig, embedding: EmbeddingConfig, knowledgeRoot: string, sourcesManifestHash: string): IndexState;
/** True when the stored embedding config is vector-compatible with the current one. */
export declare function embeddingCompatible(state: IndexState, embedding: EmbeddingConfig): boolean;
/** SHA-256 of the sources manifest file (detects corpus selection changes). */
export declare function hashManifestFile(manifestPath: string): string;
export type CorpusFingerprint = {
    contentHash: string;
    metaHash: string;
};
export type CorpusDiff = {
    added: string[];
    changed: string[];
    unchanged: string[];
    removed: string[];
};
/**
 * Categorize current corpus files against the stored state.
 * `detectRemovals` is disabled for scoped (`--sources`) runs so unrelated files
 * are not deleted.
 */
export declare function diffCorpus(current: Map<string, CorpusFingerprint>, state: IndexState | null, detectRemovals: boolean): CorpusDiff;
