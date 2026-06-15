import test from "node:test";
import assert from "node:assert/strict";
import { isQdrantReady, QdrantNotPreparedError } from "./runtime.js";

test("isQdrantReady returns false when nothing listens", async () => {
  const ready = await isQdrantReady("http://127.0.0.1:59999");
  assert.equal(ready, false);
});

test("QdrantNotPreparedError includes prepare hint", () => {
  const err = new QdrantNotPreparedError();
  assert.match(err.message, /qdrant:prepare/);
});
