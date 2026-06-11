import { readFileSync } from "node:fs";
import path from "node:path";
import { chunkDocument } from "./chunk.js";
import { sha256 } from "./hash.js";
import { embedTexts } from "./embed/index.js";
import { collectSourceFiles, loadSourcesManifest, provenanceFingerprint, } from "./sources/loader.js";
import { createQdrantClient, deleteChunksByIds, deleteCollection, ensureCollection, upsertChunks, } from "./qdrant/client.js";
import { diffCorpus, emptyIndexState, embeddingCompatible, hashManifestFile, indexStatePath, loadIndexState, saveIndexState, } from "./index-state.js";
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
export async function indexKnowledge(config, options) {
    const manifestPath = path.isAbsolute(options.sourcesFile)
        ? options.sourcesFile
        : path.resolve(config.repoRoot, options.sourcesFile);
    const manifest = loadSourcesManifest(manifestPath);
    const files = collectSourceFiles(config.knowledgeRoot, manifest, options.sourceFilter);
    const client = createQdrantClient(config.qdrant);
    const statePath = indexStatePath(config.knowledgeRoot);
    const prevState = loadIndexState(statePath);
    const manifestHash = hashManifestFile(manifestPath);
    const scoped = Boolean(options.sourceFilter && options.sourceFilter.length > 0);
    const incompatible = prevState !== null && !embeddingCompatible(prevState, config.embedding);
    const requestedFull = options.mode === "full";
    const fullRebuild = requestedFull || prevState === null || incompatible;
    if (incompatible && !requestedFull) {
        console.error("[qa-knowledge] embedding config changed since last index — forcing a full rebuild.");
    }
    const batchSize = options.batchSize ?? 16;
    if (fullRebuild) {
        return runFullIndex(config, client, files, statePath, manifestHash, batchSize);
    }
    return runIncrementalIndex(config, client, files, prevState, statePath, manifestHash, batchSize, scoped);
}
/** Read a file, chunk it, and stamp content + provenance fingerprints. */
function buildFileChunks(file) {
    const text = readFileSync(file.absolutePath, "utf8");
    const chunks = chunkDocument({
        sourceId: file.sourceId,
        sourceType: file.sourceType,
        title: file.title,
        skillName: file.skillName,
        provenance: file.provenance,
        text,
        isSdkDts: file.isSdkDts,
    });
    return {
        chunks,
        fingerprint: {
            contentHash: sha256(text),
            metaHash: sha256(provenanceFingerprint(file.provenance)),
        },
    };
}
/** Embed and upsert a flat chunk list in batches. */
async function embedAndUpsert(config, client, chunks, batchSize) {
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const vectors = await embedTexts(batch.map((c) => c.content), config.embedding);
        await upsertChunks(client, config.qdrant.collection, chunks.slice(i, i + batchSize), vectors);
    }
}
async function runFullIndex(config, client, files, statePath, manifestHash, batchSize) {
    await deleteCollection(client, config.qdrant.collection);
    await ensureCollection(client, config.qdrant.collection, config.embedding.dimensions);
    const state = emptyIndexState(config.qdrant, config.embedding, config.knowledgeRoot, manifestHash);
    const allChunks = [];
    for (const file of files) {
        const { chunks, fingerprint } = buildFileChunks(file);
        allChunks.push(...chunks);
        state.files[file.sourceId] = toFileState(chunks, fingerprint);
    }
    await embedAndUpsert(config, client, allChunks, batchSize);
    saveIndexState(statePath, state);
    return {
        mode: "full",
        files: files.length,
        chunks: allChunks.length,
        added: files.length,
        updated: 0,
        removed: 0,
        skipped: 0,
        collection: config.qdrant.collection,
    };
}
async function runIncrementalIndex(config, client, files, prevState, statePath, manifestHash, batchSize, scoped) {
    await ensureCollection(client, config.qdrant.collection, config.embedding.dimensions);
    const built = new Map();
    const fingerprints = new Map();
    for (const file of files) {
        const result = buildFileChunks(file);
        built.set(file.sourceId, result);
        fingerprints.set(file.sourceId, result.fingerprint);
    }
    const diff = diffCorpus(fingerprints, prevState, !scoped);
    // Carry forward the previous state, then apply the diff.
    const state = {
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
    // Delete stale chunks for changed and removed files.
    for (const sourceId of diff.changed) {
        await deleteChunksByIds(client, config.qdrant.collection, prevState.files[sourceId]?.chunk_ids ?? []);
    }
    for (const sourceId of diff.removed) {
        await deleteChunksByIds(client, config.qdrant.collection, prevState.files[sourceId]?.chunk_ids ?? []);
        delete state.files[sourceId];
    }
    // Embed + upsert added and changed files.
    const toIndex = [...diff.added, ...diff.changed];
    const newChunks = [];
    for (const sourceId of toIndex) {
        const result = built.get(sourceId);
        newChunks.push(...result.chunks);
        state.files[sourceId] = toFileState(result.chunks, result.fingerprint);
    }
    await embedAndUpsert(config, client, newChunks, batchSize);
    saveIndexState(statePath, state);
    return {
        mode: "incremental",
        files: files.length,
        chunks: newChunks.length,
        added: diff.added.length,
        updated: diff.changed.length,
        removed: diff.removed.length,
        skipped: diff.unchanged.length,
        collection: config.qdrant.collection,
    };
}
function toFileState(chunks, fingerprint) {
    return {
        content_hash: fingerprint.contentHash,
        meta_hash: fingerprint.metaHash,
        chunk_ids: chunks.map((c) => c.chunk_id),
        chunk_count: chunks.length,
        indexed_at: new Date().toISOString(),
    };
}
