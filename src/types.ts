/** Payload categories stored in Qdrant and returned by search tools. */
export type SourceType =
  | "skill"
  | "skill_reference"
  | "repo_doc"
  | "external_manual"
  | "sdk_reference"
  | "plugin_doc"
  | "user_note";

/**
 * Provenance for a document, sourced from the nearest `.qa-meta.json` ancestor.
 * `origin` is a coarse bucket: `vendor | quantumaudio | community | distilled`.
 */
export type Provenance = {
  source?: string;
  origin?: string;
  source_url?: string;
  license?: string;
  generated_by?: string;
  generated_at?: string;
  last_edited?: string;
  source_type?: SourceType;
  notes?: string;
};

export type KnowledgeChunk = {
  chunk_id: string;
  source_id: string;
  source_type: SourceType;
  title: string;
  heading_path?: string;
  skill_name?: string;
  chunk_index: number;
  content: string;
  content_hash: string;
  indexed_at: string;
  license?: string;
  origin?: string;
  source?: string;
  source_url?: string;
  generated_by?: string;
  generated_at?: string;
};

export type SearchHit = {
  chunk_id: string;
  score: number;
  source_id: string;
  source_type: SourceType;
  title: string;
  heading_path?: string;
  skill_name?: string;
  excerpt: string;
  origin?: string;
  source?: string;
  source_url?: string;
  license?: string;
};

export type EmbeddingConfig = {
  provider: "ollama" | "openrouter";
  model: string;
  dimensions: number;
  baseUrl?: string;
  apiKey?: string;
};

export type QdrantConfig = {
  url: string;
  apiKey?: string;
  collection: string;
};

export type KnowledgeConfig = {
  /** Repo root — used to resolve the sources manifest (e.g. config/knowledge.sources.json). */
  repoRoot: string;
  /** Corpus root — glob base and `source_id` base (default `<repoRoot>/docs/knowledge`). */
  knowledgeRoot: string;
  qdrant: QdrantConfig;
  embedding: EmbeddingConfig;
};

/** Per-file entry recorded in the versioned index state (`.qa-index.json`). */
export type IndexedFileState = {
  content_hash: string;
  meta_hash: string;
  chunk_ids: string[];
  chunk_count: number;
  indexed_at: string;
};

/** Versioned index state: source of truth for what is already in Qdrant. */
export type IndexState = {
  version: number;
  collection: string;
  embedding: { provider: string; model: string; dimensions: number };
  sources_manifest_hash: string;
  knowledge_root: string;
  last_index_at: string;
  last_full_index_at: string;
  files: Record<string, IndexedFileState>;
};

export type SourceDefinition = {
  id: string;
  type: "glob";
  paths: string[];
  source_type?: SourceType;
  license?: string;
  enabled?: boolean;
};

export type SourcesManifest = {
  sources: SourceDefinition[];
};

/** One chunk inside a committed sidecar (`*.embedding.json`). */
export type EmbeddingFileChunk = {
  chunk_id: string;
  chunk_index: number;
  content_hash: string;
  title: string;
  heading_path?: string;
  skill_name?: string;
  source_type: SourceType;
  license?: string;
  origin?: string;
  source?: string;
  source_url?: string;
  generated_by?: string;
  generated_at?: string;
  content: string;
  vector: number[];
};

/** Self-contained embedding sidecar written next to each indexed source file. */
export type EmbeddingFile = {
  version: number;
  source_id: string;
  sha256: string;
  embedding: { provider: string; model: string; dimensions: number };
  generated_at: string;
  chunk_count: number;
  chunks: EmbeddingFileChunk[];
};
