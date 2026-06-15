import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import type { EmbeddingFile } from "./types.js";
import {
  EMBEDDING_FILE_SUFFIX,
  buildEmbeddingFile,
  embeddingFileMatches,
  embeddingFilePath,
  pruneOrphanEmbeddingFiles,
  readEmbeddingFile,
  scanEmbeddingFiles,
  sourceIdFromEmbeddingPath,
  writeEmbeddingFile,
} from "./embedding-files.js";

function sampleEmbeddingFile(sourceId: string, sha256: string): EmbeddingFile {
  return {
    version: 1,
    source_id: sourceId,
    sha256,
    embedding: { provider: "openrouter", model: "m", dimensions: 1536 },
    generated_at: "2026-01-01T00:00:00.000Z",
    chunk_count: 1,
    chunks: [
      {
        chunk_id: "abc",
        chunk_index: 0,
        content_hash: "h",
        title: "Doc",
        source_type: "repo_doc",
        content: "hello",
        vector: [0.1, 0.2],
      },
    ],
  };
}

test("embeddingFilePath keeps full source filename", () => {
  assert.equal(embeddingFilePath("/tmp/SKILL.md"), "/tmp/SKILL.md.embedding.json");
});

test("sourceIdFromEmbeddingPath strips suffix", () => {
  assert.equal(
    sourceIdFromEmbeddingPath("/knowledge", "/knowledge/skills/foo/SKILL.md.embedding.json"),
    "skills/foo/SKILL.md",
  );
});

test("writeEmbeddingFile and readEmbeddingFile round-trip", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "qa-embed-"));
  const sidecarPath = path.join(dir, "doc.md.embedding.json");
  const file = sampleEmbeddingFile("doc.md", "sha");
  writeEmbeddingFile(sidecarPath, file);
  assert.equal(readFileSync(sidecarPath, "utf8").endsWith("\n"), true);
  assert.deepEqual(readEmbeddingFile(sidecarPath), file);
  rmSync(dir, { recursive: true, force: true });
});

test("embeddingFileMatches checks sha256 and embedding config", () => {
  const file = sampleEmbeddingFile("doc.md", "sha");
  assert.equal(
    embeddingFileMatches(file, "sha", { provider: "openrouter", model: "m", dimensions: 1536 }),
    true,
  );
  assert.equal(
    embeddingFileMatches(file, "other", { provider: "openrouter", model: "m", dimensions: 1536 }),
    false,
  );
  assert.equal(
    embeddingFileMatches(file, "sha", { provider: "ollama", model: "m", dimensions: 1536 }),
    false,
  );
});

test("scanEmbeddingFiles discovers nested sidecars", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "qa-embed-scan-"));
  const nested = path.join(root, "skills", "foo");
  mkdirSync(nested, { recursive: true });
  writeFileSync(path.join(nested, "SKILL.md"), "# Skill\n");
  writeEmbeddingFile(path.join(nested, "SKILL.md.embedding.json"), sampleEmbeddingFile("skills/foo/SKILL.md", "1"));
  writeFileSync(path.join(root, "orphan.md.embedding.json"), "{}");

  const found = scanEmbeddingFiles(root);
  assert.equal(found.length, 1);
  assert.equal(found[0]!.sourceId, "skills/foo/SKILL.md");
  rmSync(root, { recursive: true, force: true });
});

test("pruneOrphanEmbeddingFiles removes sidecars without source", () => {
  const root = mkdtempSync(path.join(os.tmpdir(), "qa-embed-prune-"));
  const sidecar = path.join(root, "gone.md.embedding.json");
  writeEmbeddingFile(sidecar, sampleEmbeddingFile("gone.md", "x"));
  assert.equal(pruneOrphanEmbeddingFiles(root), 1);
  assert.equal(existsSync(sidecar), false);
  rmSync(root, { recursive: true, force: true });
});

test("buildEmbeddingFile maps chunk vectors", () => {
  const file = buildEmbeddingFile(
    "a.md",
    "sha",
    { provider: "openrouter", model: "m", dimensions: 2 },
    [
      {
        chunk_id: "id",
        source_id: "a.md",
        source_type: "repo_doc",
        title: "A",
        chunk_index: 0,
        content: "text",
        content_hash: "h",
        indexed_at: "now",
      },
    ],
    [[1, 2]],
  );
  assert.equal(file.chunk_count, 1);
  assert.deepEqual(file.chunks[0]!.vector, [1, 2]);
});

test("EMBEDDING_FILE_SUFFIX is .embedding.json", () => {
  assert.equal(EMBEDDING_FILE_SUFFIX, ".embedding.json");
});
