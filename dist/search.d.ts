import type { KnowledgeConfig, SearchHit, SourceType } from "./types.js";
import { type SearchOptions } from "./qdrant/client.js";
export type KnowledgeSearchOptions = SearchOptions & {
    includeContent?: boolean;
};
/**
 * Semantic search over indexed documentation.
 *
 * @example
 * const hits = await searchKnowledge(config, "trap hi-hat pattern", { limit: 5 });
 */
export declare function searchKnowledge(config: KnowledgeConfig, query: string, options?: KnowledgeSearchOptions): Promise<SearchHit[]>;
export declare function fetchKnowledgeChunk(config: KnowledgeConfig, chunkId: string): Promise<{
    chunk_id: string;
    content: string;
    source_id: string;
    title: string;
} | null>;
export type { SourceType, SearchHit, KnowledgeConfig };
