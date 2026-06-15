import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { EmbeddingConfig, EmbeddingFile, EmbeddingFileChunk, KnowledgeChunk } from "./types.js";

export const EMBEDDING_FILE_SUFFIX = ".embedding.json";
const EMBEDDING_FILE_VERSION = 1;

const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", ".venv", "__pycache__"]);

/** Sidecar path for a source file, e.g. `SKILL.md` -> `SKILL.md.embedding.json`. */
export function embeddingFilePath(sourceAbsPath: string): string {
  return `${sourceAbsPath}${EMBEDDING_FILE_SUFFIX}`;
}

/** `source_id` from a sidecar absolute path relative to the knowledge root. */
export function sourceIdFromEmbeddingPath(knowledgeRoot: string, embeddingAbsPath: string): string {
  const rel = path.relative(knowledgeRoot, embeddingAbsPath).replace(/\\/g, "/");
  if (!rel.endsWith(EMBEDDING_FILE_SUFFIX)) {
    throw new Error(`Not an embedding sidecar: ${embeddingAbsPath}`);
  }
  return rel.slice(0, -EMBEDDING_FILE_SUFFIX.length);
}

/** Absolute path of the source markdown file for a sidecar. */
export function sourcePathFromEmbeddingPath(knowledgeRoot: string, embeddingAbsPath: string): string {
  return path.join(knowledgeRoot, sourceIdFromEmbeddingPath(knowledgeRoot, embeddingAbsPath));
}

/** Load a sidecar, or `null` when absent/unreadable. */
export function readEmbeddingFile(filePath: string): EmbeddingFile | null {
  if (!existsSync(filePath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as EmbeddingFile;
    if (parsed.version !== EMBEDDING_FILE_VERSION) return null;
    if (!parsed.source_id || !parsed.sha256 || !Array.isArray(parsed.chunks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** True when the sidecar matches the source hash and active embedding config. */
export function embeddingFileMatches(
  file: EmbeddingFile,
  sourceSha256: string,
  embedding: EmbeddingConfig,
): boolean {
  return (
    file.sha256 === sourceSha256 &&
    file.embedding.provider === embedding.provider &&
    file.embedding.model === embedding.model &&
    file.embedding.dimensions === embedding.dimensions
  );
}

/** Write a sidecar with stable key ordering for clean diffs. */
export function writeEmbeddingFile(filePath: string, file: EmbeddingFile): void {
  writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

export type ScannedEmbeddingFile = {
  absPath: string;
  sourceId: string;
  file: EmbeddingFile;
};

/** Recursively discover all `*.embedding.json` sidecars under the knowledge root. */
export function scanEmbeddingFiles(knowledgeRoot: string): ScannedEmbeddingFile[] {
  const out: ScannedEmbeddingFile[] = [];
  walkEmbeddingFiles(knowledgeRoot, knowledgeRoot, out);
  return out.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}

function walkEmbeddingFiles(knowledgeRoot: string, dir: string, out: ScannedEmbeddingFile[]): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      walkEmbeddingFiles(knowledgeRoot, full, out);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(EMBEDDING_FILE_SUFFIX)) continue;
    const file = readEmbeddingFile(full);
    if (!file) continue;
    out.push({
      absPath: full,
      sourceId: sourceIdFromEmbeddingPath(knowledgeRoot, full),
      file,
    });
  }
}

/** Delete sidecars whose source file no longer exists. */
export function pruneOrphanEmbeddingFiles(
  knowledgeRoot: string,
  sidecars = scanEmbeddingFiles(knowledgeRoot),
): number {
  let pruned = 0;
  for (const sidecar of sidecars) {
    const sourcePath = sourcePathFromEmbeddingPath(knowledgeRoot, sidecar.absPath);
    if (!existsSync(sourcePath)) {
      unlinkSync(sidecar.absPath);
      pruned += 1;
    }
  }
  return pruned;
}

/** Build a sidecar from chunks and their embedding vectors. */
export function buildEmbeddingFile(
  sourceId: string,
  sourceSha256: string,
  embedding: EmbeddingConfig,
  chunks: KnowledgeChunk[],
  vectors: number[][],
): EmbeddingFile {
  if (chunks.length !== vectors.length) {
    throw new Error(`Chunk/vector count mismatch: ${chunks.length} vs ${vectors.length}`);
  }

  const generatedAt = new Date().toISOString();
  const fileChunks: EmbeddingFileChunk[] = chunks.map((chunk, i) => ({
    chunk_id: chunk.chunk_id,
    chunk_index: chunk.chunk_index,
    content_hash: chunk.content_hash,
    title: chunk.title,
    heading_path: chunk.heading_path,
    skill_name: chunk.skill_name,
    source_type: chunk.source_type,
    license: chunk.license,
    origin: chunk.origin,
    source: chunk.source,
    source_url: chunk.source_url,
    generated_by: chunk.generated_by,
    generated_at: chunk.generated_at,
    content: chunk.content,
    vector: vectors[i]!,
  }));

  return {
    version: EMBEDDING_FILE_VERSION,
    source_id: sourceId,
    sha256: sourceSha256,
    embedding: {
      provider: embedding.provider,
      model: embedding.model,
      dimensions: embedding.dimensions,
    },
    generated_at: generatedAt,
    chunk_count: fileChunks.length,
    chunks: fileChunks,
  };
}

/** Convert a sidecar chunk back to a Qdrant payload chunk. */
export function embeddingChunkToKnowledgeChunk(
  sourceId: string,
  chunk: EmbeddingFileChunk,
  indexedAt: string,
): KnowledgeChunk {
  return {
    chunk_id: chunk.chunk_id,
    source_id: sourceId,
    source_type: chunk.source_type,
    title: chunk.title,
    heading_path: chunk.heading_path,
    skill_name: chunk.skill_name,
    chunk_index: chunk.chunk_index,
    content: chunk.content,
    content_hash: chunk.content_hash,
    indexed_at: indexedAt,
    license: chunk.license,
    origin: chunk.origin,
    source: chunk.source,
    source_url: chunk.source_url,
    generated_by: chunk.generated_by,
    generated_at: chunk.generated_at,
  };
}
