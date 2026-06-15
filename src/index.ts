export type {
  EmbeddingConfig,
  EmbeddingFile,
  EmbeddingFileChunk,
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
  EMBEDDING_FILE_SUFFIX,
  embeddingFilePath,
  readEmbeddingFile,
  writeEmbeddingFile,
  scanEmbeddingFiles,
  pruneOrphanEmbeddingFiles,
  buildEmbeddingFile,
  embeddingFileMatches,
  embeddingChunkToKnowledgeChunk,
  type ScannedEmbeddingFile,
} from "./embedding-files.js";
export { embedCorpus, type EmbedCorpusOptions, type EmbedCorpusResult } from "./embed-corpus.js";
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
  EMBEDDED_QDRANT_REST_URL,
  EMBEDDED_QDRANT_GRPC_URL,
  EMBEDDED_QDRANT_HOST,
  EMBEDDED_QDRANT_HTTP_PORT,
  EMBEDDED_QDRANT_GRPC_PORT,
  resolveQdrantDataDir,
  qdrantBinaryPath,
  ensureEmbeddedQdrant,
  stopEmbeddedQdrant,
  isQdrantReady,
  waitForQdrantReady,
  QdrantNotPreparedError,
} from "./qdrant/runtime.js";
export {
  loadSourcesManifest,
  collectSourceFiles,
  resolveProvenance,
  provenanceFingerprint,
} from "./sources/loader.js";
export {
  indexEmbeddings,
  syncKnowledge,
  diffSidecarsAgainstState,
  type IndexEmbeddingsOptions,
  type IndexEmbeddingsResult,
  type SyncKnowledgeOptions,
  type SyncKnowledgeResult,
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
export {
  runScrape,
  type ScrapeOptions,
  type ScrapeProgress,
  type ScrapeRenderMode,
  type ScrapeResult,
  type ScrapeRunOptions,
  type ScrapeScope,
  type ScrapeState,
  type ScrapeStatus,
  extractHtmlContent,
  isSpaShell,
  urlToMdPath,
  registerSourceInManifest,
  validateSourceId,
} from "./scrape/index.js";
