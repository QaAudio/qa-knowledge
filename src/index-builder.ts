import path from "node:path";
import type { IndexState, IndexedFileState, KnowledgeChunk, KnowledgeConfig } from "./types.js";
import { embedCorpus, type EmbedCorpusOptions, type EmbedCorpusResult } from "./embed-corpus.js";
import {
  embeddingChunkToKnowledgeChunk,
  scanEmbeddingFiles,
  type ScannedEmbeddingFile,
} from "./embedding-files.js";
import {
  createQdrantClient,
  deleteChunksByIds,
  deleteCollection,
  ensureCollection,
  upsertChunks,
} from "./qdrant/client.js";
import {
  type CorpusFingerprint,
  diffCorpus,
  emptyIndexState,
  embeddingCompatible,
  hashManifestFile,
  indexStatePath,
  loadIndexState,
  saveIndexState,
} from "./index-state.js";
import { collectSourceFiles, loadSourcesManifest } from "./sources/loader.js";

export type IndexEmbeddingsOptions = {
  sourcesFile?: string;
  sourceFilter?: string[];
  batchSize?: number;
  full?: boolean;
};

export type IndexEmbeddingsResult = {
  mode: "incremental" | "full";
  files: number;
  chunks: number;
  added: number;
  updated: number;
  removed: number;
  skipped: number;
  collection: string;
};

export type SyncKnowledgeOptions = EmbedCorpusOptions;

export type SyncKnowledgeResult = {
  embed: EmbedCorpusResult;
  index: IndexEmbeddingsResult;
};

/**
 * Upsert committed sidecar embeddings into Qdrant.
 *
 * Incremental by default: reconciles against `docs/knowledge/.qa-index.json`.
 * Pass `full: true` to drop and rebuild the collection.
 *
 * @example
 * await indexEmbeddings(config);
 */
export async function indexEmbeddings(
  config: KnowledgeConfig,
  options: IndexEmbeddingsOptions = {},
): Promise<IndexEmbeddingsResult> {
  const client = createQdrantClient(config.qdrant);
  const statePath = indexStatePath(config.knowledgeRoot);
  const prevState = loadIndexState(statePath);
  const sourcesFile = options.sourcesFile ?? "config/knowledge.sources.json";
  const manifestPath = path.isAbsolute(sourcesFile)
    ? sourcesFile
    : path.resolve(config.repoRoot, sourcesFile);
  const manifestHash = hashManifestFile(manifestPath);

  const allSidecars = scanEmbeddingFiles(config.knowledgeRoot);
  const sourceFilter = options.sourceFilter;
  const scoped = Boolean(sourceFilter && sourceFilter.length > 0);
  const sidecars = scoped
    ? filterSidecarsByManifest(config, manifestPath, sourceFilter!, allSidecars)
    : allSidecars;

  const incompatible = prevState !== null && !embeddingCompatible(prevState, config.embedding);
  const requestedFull = options.full ?? false;
  const fullRebuild = requestedFull || prevState === null || incompatible;

  if (incompatible && !requestedFull) {
    console.error(
      "[qa-knowledge] embedding config changed since last index — forcing a full rebuild.",
    );
  }

  const batchSize = options.batchSize ?? 16;

  if (fullRebuild) {
    return runFullIndex(config, client, sidecars, statePath, manifestHash, batchSize);
  }
  return runIncrementalIndex(
    config,
    client,
    sidecars,
    prevState!,
    statePath,
    manifestHash,
    batchSize,
    scoped,
  );
}

/**
 * Generate sidecars then upsert them into Qdrant.
 *
 * @example
 * await syncKnowledge(config, { sourcesFile: "config/knowledge.sources.json" });
 */
export async function syncKnowledge(
  config: KnowledgeConfig,
  options: SyncKnowledgeOptions,
): Promise<SyncKnowledgeResult> {
  const embed = await embedCorpus(config, options);
  const index = await indexEmbeddings(config, {
    sourcesFile: options.sourcesFile,
    sourceFilter: options.sourceFilter,
    batchSize: options.batchSize,
    full: options.full,
  });
  return { embed, index };
}

function filterSidecarsByManifest(
  config: KnowledgeConfig,
  manifestPath: string,
  sourceFilter: string[],
  sidecars: ScannedEmbeddingFile[],
): ScannedEmbeddingFile[] {
  const manifest = loadSourcesManifest(manifestPath);
  const allowed = new Set(
    collectSourceFiles(config.knowledgeRoot, manifest, sourceFilter).map((f) => f.sourceId),
  );
  return sidecars.filter((sidecar) => allowed.has(sidecar.sourceId));
}

function sidecarFingerprint(sidecar: ScannedEmbeddingFile): CorpusFingerprint {
  return {
    contentHash: sidecar.file.sha256,
    metaHash: sidecar.file.generated_at,
  };
}

function toFileState(sidecar: ScannedEmbeddingFile): IndexedFileState {
  return {
    content_hash: sidecar.file.sha256,
    meta_hash: sidecar.file.generated_at,
    chunk_ids: sidecar.file.chunks.map((c) => c.chunk_id),
    chunk_count: sidecar.file.chunk_count,
    indexed_at: new Date().toISOString(),
  };
}

async function upsertSidecarChunks(
  config: KnowledgeConfig,
  client: ReturnType<typeof createQdrantClient>,
  sidecars: ScannedEmbeddingFile[],
  batchSize: number,
): Promise<number> {
  let total = 0;
  for (const sidecar of sidecars) {
    const indexedAt = new Date().toISOString();
    const chunks = sidecar.file.chunks.map((chunk) =>
      embeddingChunkToKnowledgeChunk(sidecar.sourceId, chunk, indexedAt),
    );
    const vectors = sidecar.file.chunks.map((chunk) => chunk.vector);

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      const batchVectors = vectors.slice(i, i + batchSize);
      await upsertChunks(client, config.qdrant.collection, batchChunks, batchVectors);
      total += batchChunks.length;
    }
  }
  return total;
}

async function runFullIndex(
  config: KnowledgeConfig,
  client: ReturnType<typeof createQdrantClient>,
  sidecars: ScannedEmbeddingFile[],
  statePath: string,
  manifestHash: string,
  batchSize: number,
): Promise<IndexEmbeddingsResult> {
  await deleteCollection(client, config.qdrant.collection);
  await ensureCollection(client, config.qdrant.collection, config.embedding.dimensions);

  const state = emptyIndexState(config.qdrant, config.embedding, config.knowledgeRoot, manifestHash);
  for (const sidecar of sidecars) {
    state.files[sidecar.sourceId] = toFileState(sidecar);
  }

  const chunks = await upsertSidecarChunks(config, client, sidecars, batchSize);
  saveIndexState(statePath, state);

  return {
    mode: "full",
    files: sidecars.length,
    chunks,
    added: sidecars.length,
    updated: 0,
    removed: 0,
    skipped: 0,
    collection: config.qdrant.collection,
  };
}

async function runIncrementalIndex(
  config: KnowledgeConfig,
  client: ReturnType<typeof createQdrantClient>,
  sidecars: ScannedEmbeddingFile[],
  prevState: IndexState,
  statePath: string,
  manifestHash: string,
  batchSize: number,
  scoped: boolean,
): Promise<IndexEmbeddingsResult> {
  await ensureCollection(client, config.qdrant.collection, config.embedding.dimensions);

  const fingerprints = new Map<string, CorpusFingerprint>();
  const bySourceId = new Map<string, ScannedEmbeddingFile>();
  for (const sidecar of sidecars) {
    bySourceId.set(sidecar.sourceId, sidecar);
    fingerprints.set(sidecar.sourceId, sidecarFingerprint(sidecar));
  }

  const diff = diffCorpus(fingerprints, prevState, !scoped);

  const state: IndexState = {
    ...prevState,
    collection: config.qdrant.collection,
    embedding: {
      provider: config.embedding.provider,
      model: config.embedding.model,
      dimensions: config.embedding.dimensions,
    },
    sources_manifest_hash: manifestHash,
    last_index_at: new Date().toISOString(),
    files: { ...prevState.files },
  };

  for (const sourceId of diff.changed) {
    await deleteChunksByIds(
      client,
      config.qdrant.collection,
      prevState.files[sourceId]?.chunk_ids ?? [],
    );
  }
  for (const sourceId of diff.removed) {
    await deleteChunksByIds(
      client,
      config.qdrant.collection,
      prevState.files[sourceId]?.chunk_ids ?? [],
    );
    delete state.files[sourceId];
  }

  const toIndex = [...diff.added, ...diff.changed];
  const sidecarsToUpsert = toIndex.map((sourceId) => bySourceId.get(sourceId)!);
  for (const sourceId of toIndex) {
    state.files[sourceId] = toFileState(bySourceId.get(sourceId)!);
  }

  const chunks = await upsertSidecarChunks(config, client, sidecarsToUpsert, batchSize);
  saveIndexState(statePath, state);

  return {
    mode: "incremental",
    files: sidecars.length,
    chunks,
    added: diff.added.length,
    updated: diff.changed.length,
    removed: diff.removed.length,
    skipped: diff.unchanged.length,
    collection: config.qdrant.collection,
  };
}

/** Pure diff helper exported for tests — compares sidecar fingerprints to Qdrant state. */
export function diffSidecarsAgainstState(
  sidecars: ScannedEmbeddingFile[],
  prevState: IndexState | null,
  detectRemovals: boolean,
) {
  const fingerprints = new Map<string, CorpusFingerprint>();
  for (const sidecar of sidecars) {
    fingerprints.set(sidecar.sourceId, sidecarFingerprint(sidecar));
  }
  return diffCorpus(fingerprints, prevState, detectRemovals);
}

/** @internal exported for tests */
export function sidecarToChunks(sidecar: ScannedEmbeddingFile): KnowledgeChunk[] {
  const indexedAt = new Date().toISOString();
  return sidecar.file.chunks.map((chunk) =>
    embeddingChunkToKnowledgeChunk(sidecar.sourceId, chunk, indexedAt),
  );
}
