import type { KnowledgeConfig, SearchHit, SourceType } from "./types.js";
import { embedQuery } from "./embed/index.js";
import { createQdrantClient, getChunkById, searchChunks, type SearchOptions } from "./qdrant/client.js";

export type KnowledgeSearchOptions = SearchOptions & {
  includeContent?: boolean;
};

/**
 * Semantic search over indexed documentation.
 *
 * @example
 * const hits = await searchKnowledge(config, "trap hi-hat pattern", { limit: 5 });
 */
export async function searchKnowledge(
  config: KnowledgeConfig,
  query: string,
  options: KnowledgeSearchOptions = {},
): Promise<SearchHit[]> {
  const client = createQdrantClient(config.qdrant);
  const vector = await embedQuery(query, config.embedding);
  return searchChunks(client, config.qdrant.collection, vector, options);
}

export async function fetchKnowledgeChunk(
  config: KnowledgeConfig,
  chunkId: string,
): Promise<{ chunk_id: string; content: string; source_id: string; title: string } | null> {
  const client = createQdrantClient(config.qdrant);
  return getChunkById(client, config.qdrant.collection, chunkId);
}

export type { SourceType, SearchHit, KnowledgeConfig };
