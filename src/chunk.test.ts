import test from "node:test";
import assert from "node:assert/strict";
import { chunkDocument } from "./chunk.js";
import { makeChunkId, sha256 } from "./hash.js";

test("sha256 is stable", () => {
  assert.equal(sha256("hello").length, 64);
  assert.equal(sha256("hello"), sha256("hello"));
});

test("makeChunkId is deterministic", () => {
  const hash = sha256("body");
  assert.equal(makeChunkId("a/b.md", 0, hash), makeChunkId("a/b.md", 0, hash));
});

test("chunkDocument splits markdown headings", () => {
  const chunks = chunkDocument({
    sourceId: "test.md",
    sourceType: "skill_reference",
    title: "test.md",
    text:
      "# Title\n\nIntro paragraph with enough text to index.\n\n" +
      "## Section A\n\nContent A with sufficient length for chunk indexing.\n\n" +
      "## Section B\n\nContent B with sufficient length for chunk indexing.",
  });
  assert.ok(chunks.length >= 2);
  assert.ok(chunks.some((c) => c.heading_path?.includes("Section A")));
});
