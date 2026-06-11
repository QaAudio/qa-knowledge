export type {
  EmbeddingConfig,
  IndexState,
  IndexedFileState,
  KnowledgeChunk,
  KnowledgeConfig,
  Provenance,
  QdrantConfig,
  SearchHit,
  SourceDefinition,
  SourceType,
  SourcesManifest,
} from "./types.js";
export { chunkDocument } from "./chunk.js";
export { sha256, makeChunkId } from "./hash.js";
export { embedTexts, embedQuery } from "./embed/index.js";
export {
  createQdrantClient,
  ensureCollection,
  ensurePayloadIndexes,
  upsertChunks,
  deleteChunksByIds,
  deleteCollection,
  searchChunks,
  matchesFilters,
  getChunkById,
} from "./qdrant/client.js";
export {
  loadSourcesManifest,
  collectSourceFiles,
  resolveProvenance,
  provenanceFingerprint,
} from "./sources/loader.js";
export {
  indexKnowledge,
  type IndexMode,
  type IndexOptions,
  type IndexResult,
} from "./index-builder.js";
export {
  INDEX_STATE_FILE,
  indexStatePath,
  loadIndexState,
  saveIndexState,
  diffCorpus,
  type CorpusDiff,
} from "./index-state.js";
export { searchKnowledge, fetchKnowledgeChunk } from "./search.js";
export {
  configFromEnv,
  defaultRepoRoot,
  defaultKnowledgeRoot,
  resolveEnvPlaceholder,
} from "./config.js";
