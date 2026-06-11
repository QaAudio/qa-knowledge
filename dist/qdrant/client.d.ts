import { QdrantClient } from "@qdrant/js-client-rest";
import type { KnowledgeChunk, QdrantConfig, SearchHit, SourceType } from "../types.js";
export declare function createQdrantClient(config: QdrantConfig): QdrantClient;
/** Create the collection when missing, then ensure the filterable payload indexes. */
export declare function ensureCollection(client: QdrantClient, collection: string, dimensions: number): Promise<void>;
/**
 * Create keyword payload indexes for the fields `search_knowledge` filters on.
 * Without these, Qdrant rejects a filtered search with a 400 ("Index required
 * but not found"). Idempotent: re-creating an existing index is a no-op, and any
 * error is swallowed so indexing never fails on index setup.
 */
export declare function ensurePayloadIndexes(client: QdrantClient, collection: string): Promise<void>;
export declare function upsertChunks(client: QdrantClient, collection: string, chunks: KnowledgeChunk[], vectors: number[][]): Promise<number>;
/** Delete points by their exact ids (precise cleanup before re-indexing a file). */
export declare function deleteChunksByIds(client: QdrantClient, collection: string, ids: string[]): Promise<number>;
/** Drop the entire collection (used by a full re-index). No-op when absent. */
export declare function deleteCollection(client: QdrantClient, collection: string): Promise<void>;
export type SearchOptions = {
    limit?: number;
    sourceTypes?: SourceType[];
    skillName?: string;
};
export declare function searchChunks(client: QdrantClient, collection: string, vector: number[], options?: SearchOptions): Promise<SearchHit[]>;
/** In-memory equivalent of `buildFilter`, used by the unindexed-filter fallback. */
export declare function matchesFilters(hit: SearchHit, options: SearchOptions): boolean;
export declare function getChunkById(client: QdrantClient, collection: string, chunkId: string): Promise<{
    chunk_id: string;
    content: string;
    source_id: string;
    title: string;
} | null>;
