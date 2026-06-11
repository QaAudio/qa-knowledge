import type { KnowledgeConfig } from "./types.js";
export type IndexMode = "incremental" | "full";
export type IndexOptions = {
    sourcesFile: string;
    sourceFilter?: string[];
    batchSize?: number;
    mode?: IndexMode;
};
export type IndexResult = {
    mode: IndexMode;
    files: number;
    chunks: number;
    added: number;
    updated: number;
    removed: number;
    skipped: number;
    collection: string;
};
/**
 * Index markdown and SDK sources into Qdrant.
 *
 * Incremental by default: only new/changed files are embedded, stale chunks are
 * deleted, and removed files are purged, tracked via `docs/knowledge/.qa-index.json`.
 * Pass `mode: "full"` to rebuild the collection from scratch.
 *
 * @example
 * await indexKnowledge(config, { sourcesFile: "config/knowledge.sources.json" });
 *
 * NOTE: the live Qdrant upsert/delete + `.qa-index.json` round-trip was not
 * exercised in the agent env (Docker daemon down). Verify with
 * `npm run knowledge:index:full` then `npm run knowledge:index` — see TODOLLIST.md
 * "Qdrant knowledge stack — index + search e2e".
 */
export declare function indexKnowledge(config: KnowledgeConfig, options: IndexOptions): Promise<IndexResult>;
