import test from "node:test";
import assert from "node:assert/strict";
import { diffCorpus, embeddingCompatible } from "./index-state.js";
function fp(contentHash, metaHash = "m") {
    return { contentHash, metaHash };
}
function stateWith(files) {
    return {
        version: 1,
        collection: "qa-core",
        embedding: { provider: "openrouter", model: "m", dimensions: 1536 },
        sources_manifest_hash: "h",
        knowledge_root: "knowledge",
        last_index_at: "now",
        last_full_index_at: "now",
        files: Object.fromEntries(Object.entries(files).map(([id, f]) => [
            id,
            { ...f, chunk_ids: [], chunk_count: 0, indexed_at: "now" },
        ])),
    };
}
test("diffCorpus: classifies unchanged, changed, added, removed", () => {
    const state = stateWith({
        "a.md": { content_hash: "1", meta_hash: "m" },
        "b.md": { content_hash: "2", meta_hash: "m" },
        "gone.md": { content_hash: "3", meta_hash: "m" },
    });
    const current = new Map([
        ["a.md", fp("1")], // unchanged
        ["b.md", fp("2-new")], // changed (content)
        ["c.md", fp("4")], // added
    ]);
    const diff = diffCorpus(current, state, true);
    assert.deepEqual(diff.unchanged, ["a.md"]);
    assert.deepEqual(diff.changed, ["b.md"]);
    assert.deepEqual(diff.added, ["c.md"]);
    assert.deepEqual(diff.removed, ["gone.md"]);
});
test("diffCorpus: meta-only change marks file changed", () => {
    const state = stateWith({ "a.md": { content_hash: "1", meta_hash: "m1" } });
    const current = new Map([["a.md", fp("1", "m2")]]);
    const diff = diffCorpus(current, state, true);
    assert.deepEqual(diff.changed, ["a.md"]);
});
test("diffCorpus: scoped runs skip removal detection", () => {
    const state = stateWith({ "a.md": { content_hash: "1", meta_hash: "m" } });
    const current = new Map();
    const diff = diffCorpus(current, state, false);
    assert.deepEqual(diff.removed, []);
});
test("diffCorpus: no prior state treats everything as added", () => {
    const current = new Map([["a.md", fp("1")], ["b.md", fp("2")]]);
    const diff = diffCorpus(current, null, true);
    assert.deepEqual(diff.added.sort(), ["a.md", "b.md"]);
    assert.deepEqual(diff.unchanged, []);
});
test("embeddingCompatible: detects dimension/model drift", () => {
    const state = stateWith({});
    assert.equal(embeddingCompatible(state, { provider: "openrouter", model: "m", dimensions: 1536 }), true);
    assert.equal(embeddingCompatible(state, { provider: "openrouter", model: "m", dimensions: 768 }), false);
    assert.equal(embeddingCompatible(state, { provider: "ollama", model: "m", dimensions: 1536 }), false);
});
