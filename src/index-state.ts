import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { EmbeddingConfig, IndexState, QdrantConfig } from "./types.js";
import { sha256 } from "./hash.js";

const STATE_VERSION = 1;
/** Versioned index state, committed to git alongside the corpus. */
export const INDEX_STATE_FILE = ".qa-index.json";

/** Absolute path of the index state file for a knowledge root. */
export function indexStatePath(knowledgeRoot: string): string {
  return path.join(knowledgeRoot, INDEX_STATE_FILE);
}

/** Load the index state, or `null` when absent/unreadable. */
export function loadIndexState(filePath: string): IndexState | null {
  if (!existsSync(filePath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as IndexState;
    if (parsed.version !== STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Write the index state with stable key ordering for clean diffs. */
export function saveIndexState(filePath: string, state: IndexState): void {
  writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

/** Fresh empty state stamped with the active collection + embedding config. */
export function emptyIndexState(
  qdrant: QdrantConfig,
  embedding: EmbeddingConfig,
  knowledgeRoot: string,
  sourcesManifestHash: string,
): IndexState {
  const now = new Date().toISOString();
  return {
    version: STATE_VERSION,
    collection: qdrant.collection,
    embedding: {
      provider: embedding.provider,
      model: embedding.model,
      dimensions: embedding.dimensions,
    },
    sources_manifest_hash: sourcesManifestHash,
    knowledge_root: path.basename(knowledgeRoot),
    last_index_at: now,
    last_full_index_at: now,
    files: {},
  };
}

/** True when the stored embedding config is vector-compatible with the current one. */
export function embeddingCompatible(state: IndexState, embedding: EmbeddingConfig): boolean {
  return (
    state.collection !== undefined &&
    state.embedding.provider === embedding.provider &&
    state.embedding.model === embedding.model &&
    state.embedding.dimensions === embedding.dimensions
  );
}

/** SHA-256 of the sources manifest file (detects corpus selection changes). */
export function hashManifestFile(manifestPath: string): string {
  return existsSync(manifestPath) ? sha256(readFileSync(manifestPath, "utf8")) : "";
}

export type CorpusFingerprint = { contentHash: string; metaHash: string };

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
export function diffCorpus(
  current: Map<string, CorpusFingerprint>,
  state: IndexState | null,
  detectRemovals: boolean,
): CorpusDiff {
  const diff: CorpusDiff = { added: [], changed: [], unchanged: [], removed: [] };
  const prev = state?.files ?? {};

  for (const [sourceId, fp] of current) {
    const stored = prev[sourceId];
    if (!stored) {
      diff.added.push(sourceId);
    } else if (stored.content_hash !== fp.contentHash || stored.meta_hash !== fp.metaHash) {
      diff.changed.push(sourceId);
    } else {
      diff.unchanged.push(sourceId);
    }
  }

  if (detectRemovals) {
    for (const sourceId of Object.keys(prev)) {
      if (!current.has(sourceId)) diff.removed.push(sourceId);
    }
  }

  return diff;
}
