import test from "node:test";
import assert from "node:assert/strict";
import type { EmbeddingFile, IndexState } from "./types.js";
import { diffSidecarsAgainstState } from "./index-builder.js";
import type { ScannedEmbeddingFile } from "./embedding-files.js";

function sidecar(sourceId: string, sha256: string, generatedAt: string): ScannedEmbeddingFile {
  const file: EmbeddingFile = {
    version: 1,
    source_id: sourceId,
    sha256,
    embedding: { provider: "openrouter", model: "m", dimensions: 1536 },
    generated_at: generatedAt,
    chunk_count: 1,
    chunks: [
      {
        chunk_id: `${sourceId}-0`,
        chunk_index: 0,
        content_hash: "h",
        title: "Doc",
        source_type: "repo_doc",
        content: "body",
        vector: [0.1],
      },
    ],
  };
  return { absPath: `/tmp/${sourceId}.embedding.json`, sourceId, file };
}

function stateWith(files: Record<string, { content_hash: string; meta_hash: string }>): IndexState {
  return {
    version: 1,
    collection: "qa-core",
    embedding: { provider: "openrouter", model: "m", dimensions: 1536 },
    sources_manifest_hash: "h",
    knowledge_root: "knowledge",
    last_index_at: "now",
    last_full_index_at: "now",
    files: Object.fromEntries(
      Object.entries(files).map(([id, f]) => [
        id,
        { ...f, chunk_ids: [`${id}-0`], chunk_count: 1, indexed_at: "now" },
      ]),
    ),
  };
}

test("diffSidecarsAgainstState: classifies unchanged, changed, added, removed", () => {
  const prev = stateWith({
    "a.md": { content_hash: "1", meta_hash: "2026-01-01T00:00:00.000Z" },
    "b.md": { content_hash: "2", meta_hash: "2026-01-01T00:00:00.000Z" },
    "gone.md": { content_hash: "3", meta_hash: "2026-01-01T00:00:00.000Z" },
  });

  const sidecars = [
    sidecar("a.md", "1", "2026-01-01T00:00:00.000Z"),
    sidecar("b.md", "2-new", "2026-01-02T00:00:00.000Z"),
    sidecar("c.md", "4", "2026-01-03T00:00:00.000Z"),
  ];

  const diff = diffSidecarsAgainstState(sidecars, prev, true);
  assert.deepEqual(diff.unchanged, ["a.md"]);
  assert.deepEqual(diff.changed, ["b.md"]);
  assert.deepEqual(diff.added, ["c.md"]);
  assert.deepEqual(diff.removed, ["gone.md"]);
});

test("diffSidecarsAgainstState: scoped runs skip removal detection", () => {
  const prev = stateWith({ "a.md": { content_hash: "1", meta_hash: "t" } });
  const diff = diffSidecarsAgainstState([], prev, false);
  assert.deepEqual(diff.removed, []);
});

test("diffSidecarsAgainstState: sha-only change marks file changed", () => {
  const prev = stateWith({ "a.md": { content_hash: "1", meta_hash: "t1" } });
  const diff = diffSidecarsAgainstState([sidecar("a.md", "2", "t1")], prev, true);
  assert.deepEqual(diff.changed, ["a.md"]);
});
