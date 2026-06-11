import { QdrantClient } from "@qdrant/js-client-rest";
import type { KnowledgeChunk, QdrantConfig, SearchHit, SourceType } from "../types.js";

export function createQdrantClient(config: QdrantConfig): QdrantClient {
  return new QdrantClient({
    url: config.url,
    apiKey: config.apiKey || undefined,
    // Cloud / reverse-proxy endpoints often fail the startup version probe.
    checkCompatibility: false,
  });
}

/** Payload fields that `search_knowledge` filters on — must be keyword-indexed. */
const KEYWORD_PAYLOAD_FIELDS = ["skill_name", "source_type"] as const;

/** Create the collection when missing, then ensure the filterable payload indexes. */
export async function ensureCollection(
  client: QdrantClient,
  collection: string,
  dimensions: number,
): Promise<void> {
  const collections = await client.getCollections();
  const exists = collections.collections.some((c) => c.name === collection);
  if (!exists) {
    await client.createCollection(collection, {
      vectors: { size: dimensions, distance: "Cosine" },
    });
  }
  await ensurePayloadIndexes(client, collection);
}

/**
 * Create keyword payload indexes for the fields `search_knowledge` filters on.
 * Without these, Qdrant rejects a filtered search with a 400 ("Index required
 * but not found"). Idempotent: re-creating an existing index is a no-op, and any
 * error is swallowed so indexing never fails on index setup.
 */
export async function ensurePayloadIndexes(
  client: QdrantClient,
  collection: string,
): Promise<void> {
  for (const field of KEYWORD_PAYLOAD_FIELDS) {
    try {
      await client.createPayloadIndex(collection, {
        field_name: field,
        field_schema: "keyword",
        wait: true,
      });
    } catch {
      // Index already exists (or backend rejects re-create) — filtering still works.
    }
  }
}

export async function upsertChunks(
  client: QdrantClient,
  collection: string,
  chunks: KnowledgeChunk[],
  vectors: number[][],
): Promise<number> {
  if (chunks.length !== vectors.length) {
    throw new Error(`Chunk/vector count mismatch: ${chunks.length} vs ${vectors.length}`);
  }
  if (chunks.length === 0) return 0;

  const points = chunks.map((chunk, i) => ({
    id: chunk.chunk_id,
    vector: vectors[i]!,
    payload: {
      chunk_id: chunk.chunk_id,
      source_id: chunk.source_id,
      source_type: chunk.source_type,
      title: chunk.title,
      heading_path: chunk.heading_path ?? null,
      skill_name: chunk.skill_name ?? null,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      content_hash: chunk.content_hash,
      indexed_at: chunk.indexed_at,
      license: chunk.license ?? null,
      origin: chunk.origin ?? null,
      source: chunk.source ?? null,
      source_url: chunk.source_url ?? null,
      generated_by: chunk.generated_by ?? null,
      generated_at: chunk.generated_at ?? null,
    },
  }));

  await client.upsert(collection, { wait: true, points });
  return points.length;
}

/** Delete points by their exact ids (precise cleanup before re-indexing a file). */
export async function deleteChunksByIds(
  client: QdrantClient,
  collection: string,
  ids: string[],
): Promise<number> {
  if (ids.length === 0) return 0;
  await client.delete(collection, { wait: true, points: ids });
  return ids.length;
}

/** Drop the entire collection (used by a full re-index). No-op when absent. */
export async function deleteCollection(client: QdrantClient, collection: string): Promise<void> {
  const collections = await client.getCollections();
  if (collections.collections.some((c) => c.name === collection)) {
    await client.deleteCollection(collection);
  }
}

export type SearchOptions = {
  limit?: number;
  sourceTypes?: SourceType[];
  skillName?: string;
};

export async function searchChunks(
  client: QdrantClient,
  collection: string,
  vector: number[],
  options: SearchOptions = {},
): Promise<SearchHit[]> {
  const limit = options.limit ?? 5;
  const filter = buildFilter(options);

  if (!filter) {
    const results = await client.search(collection, { vector, limit, with_payload: true });
    return results.map(toSearchHit);
  }

  try {
    const results = await client.search(collection, { vector, limit, with_payload: true, filter });
    return results.map(toSearchHit);
  } catch {
    // The collection may predate the payload indexes (created lazily in
    // ensureCollection), so Qdrant rejects the server-side filter with a 400.
    // Recover by over-fetching unfiltered and filtering in memory — the agent
    // still gets scoped, relevant results instead of a dead-end error.
    const overfetch = Math.min(Math.max(limit * 8, 64), 256);
    const results = await client.search(collection, {
      vector,
      limit: overfetch,
      with_payload: true,
    });
    return results
      .map(toSearchHit)
      .filter((hit) => matchesFilters(hit, options))
      .slice(0, limit);
  }
}

type RawSearchHit = { id?: unknown; score?: number; payload?: Record<string, unknown> | null };

function toSearchHit(hit: RawSearchHit): SearchHit {
  const payload = (hit.payload ?? {}) as Record<string, unknown>;
  const content = String(payload.content ?? "");
  return {
    chunk_id: String(payload.chunk_id ?? hit.id),
    score: hit.score ?? 0,
    source_id: String(payload.source_id ?? ""),
    source_type: String(payload.source_type ?? "repo_doc") as SourceType,
    title: String(payload.title ?? ""),
    heading_path: payload.heading_path ? String(payload.heading_path) : undefined,
    skill_name: payload.skill_name ? String(payload.skill_name) : undefined,
    excerpt: content.length > 320 ? `${content.slice(0, 320).trim()}…` : content,
    origin: payload.origin ? String(payload.origin) : undefined,
    source: payload.source ? String(payload.source) : undefined,
    source_url: payload.source_url ? String(payload.source_url) : undefined,
    license: payload.license ? String(payload.license) : undefined,
  };
}

/** In-memory equivalent of `buildFilter`, used by the unindexed-filter fallback. */
export function matchesFilters(hit: SearchHit, options: SearchOptions): boolean {
  if (options.sourceTypes?.length && !options.sourceTypes.includes(hit.source_type)) {
    return false;
  }
  const skill = options.skillName?.trim();
  if (skill && hit.skill_name !== skill) {
    return false;
  }
  return true;
}

export async function getChunkById(
  client: QdrantClient,
  collection: string,
  chunkId: string,
): Promise<{ chunk_id: string; content: string; source_id: string; title: string } | null> {
  const points = await client.retrieve(collection, {
    ids: [chunkId],
    with_payload: true,
  });
  const point = points[0];
  if (!point?.payload) return null;
  const payload = point.payload as Record<string, unknown>;
  return {
    chunk_id: String(payload.chunk_id ?? chunkId),
    content: String(payload.content ?? ""),
    source_id: String(payload.source_id ?? ""),
    title: String(payload.title ?? ""),
  };
}

function buildFilter(options: SearchOptions) {
  const must: Array<Record<string, unknown>> = [];
  if (options.sourceTypes?.length) {
    must.push({
      key: "source_type",
      match: { any: options.sourceTypes },
    });
  }
  if (options.skillName?.trim()) {
    must.push({
      key: "skill_name",
      match: { value: options.skillName.trim() },
    });
  }
  if (must.length === 0) return undefined;
  return { must };
}
