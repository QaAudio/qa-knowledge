import { readFileSync } from "node:fs";
import path from "node:path";
import type { KnowledgeConfig } from "./types.js";
import { chunkDocument } from "./chunk.js";
import { embedTexts } from "./embed/index.js";
import {
  buildEmbeddingFile,
  embeddingFileMatches,
  embeddingFilePath,
  pruneOrphanEmbeddingFiles,
  readEmbeddingFile,
  writeEmbeddingFile,
} from "./embedding-files.js";
import { sha256 } from "./hash.js";
import { collectSourceFiles, loadSourcesManifest } from "./sources/loader.js";

export type EmbedCorpusOptions = {
  sourcesFile: string;
  sourceFilter?: string[];
  batchSize?: number;
  full?: boolean;
};

export type EmbedCorpusResult = {
  files: number;
  embedded: number;
  skipped: number;
  pruned: number;
  chunks: number;
};

/**
 * Generate committed sidecar embeddings for corpus files that are missing or stale.
 *
 * Does not touch Qdrant. Skips files whose sidecar SHA-256 and embedding config match.
 *
 * @example
 * await embedCorpus(config, { sourcesFile: "config/knowledge.sources.json" });
 */
export async function embedCorpus(
  config: KnowledgeConfig,
  options: EmbedCorpusOptions,
): Promise<EmbedCorpusResult> {
  const manifestPath = path.isAbsolute(options.sourcesFile)
    ? options.sourcesFile
    : path.resolve(config.repoRoot, options.sourcesFile);
  const manifest = loadSourcesManifest(manifestPath);
  const files = collectSourceFiles(config.knowledgeRoot, manifest, options.sourceFilter);
  const scoped = Boolean(options.sourceFilter && options.sourceFilter.length > 0);
  const full = options.full ?? false;
  const batchSize = options.batchSize ?? 16;

  let embedded = 0;
  let skipped = 0;
  let chunks = 0;

  for (const file of files) {
    const text = readFileSync(file.absolutePath, "utf8");
    const sourceSha256 = sha256(text);
    const sidecarPath = embeddingFilePath(file.absolutePath);
    const existing = readEmbeddingFile(sidecarPath);

    if (!full && existing && embeddingFileMatches(existing, sourceSha256, config.embedding)) {
      skipped += 1;
      continue;
    }

    const knowledgeChunks = chunkDocument({
      sourceId: file.sourceId,
      sourceType: file.sourceType,
      title: file.title,
      skillName: file.skillName,
      provenance: file.provenance,
      text,
      isSdkDts: file.isSdkDts,
    });

    const vectors: number[][] = [];
    for (let i = 0; i < knowledgeChunks.length; i += batchSize) {
      const batch = knowledgeChunks.slice(i, i + batchSize);
      const batchVectors = await embedTexts(
        batch.map((c) => c.content),
        config.embedding,
      );
      vectors.push(...batchVectors);
    }

    const sidecar = buildEmbeddingFile(
      file.sourceId,
      sourceSha256,
      config.embedding,
      knowledgeChunks,
      vectors,
    );
    writeEmbeddingFile(sidecarPath, sidecar);
    embedded += 1;
    chunks += knowledgeChunks.length;
  }

  const pruned = scoped ? 0 : pruneOrphanEmbeddingFiles(config.knowledgeRoot);

  return {
    files: files.length,
    embedded,
    skipped,
    pruned,
    chunks,
  };
}
