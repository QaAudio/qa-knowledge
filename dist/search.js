import { embedQuery } from "./embed/index.js";
import { createQdrantClient, getChunkById, searchChunks } from "./qdrant/client.js";
/**
 * Semantic search over indexed documentation.
 *
 * @example
 * const hits = await searchKnowledge(config, "trap hi-hat pattern", { limit: 5 });
 */
export async function searchKnowledge(config, query, options = {}) {
    const client = createQdrantClient(config.qdrant);
    const vector = await embedQuery(query, config.embedding);
    return searchChunks(client, config.qdrant.collection, vector, options);
}
export async function fetchKnowledgeChunk(config, chunkId) {
    const client = createQdrantClient(config.qdrant);
    return getChunkById(client, config.qdrant.collection, chunkId);
}
