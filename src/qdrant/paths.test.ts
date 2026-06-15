import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  EMBEDDED_QDRANT_GRPC_PORT,
  EMBEDDED_QDRANT_HTTP_PORT,
  EMBEDDED_QDRANT_REST_URL,
  qdrantBinaryPath,
  resolveQdrantDataDir,
} from "./paths.js";

test("embedded Qdrant uses dedicated loopback ports", () => {
  assert.equal(EMBEDDED_QDRANT_HTTP_PORT, 6433);
  assert.equal(EMBEDDED_QDRANT_GRPC_PORT, 6434);
  assert.equal(EMBEDDED_QDRANT_REST_URL, "http://127.0.0.1:6433");
});

test("resolveQdrantDataDir honors QA_QDRANT_DATA_DIR", () => {
  const prev = process.env.QA_QDRANT_DATA_DIR;
  const expected = path.join(os.tmpdir(), "qa-qdrant-test");
  process.env.QA_QDRANT_DATA_DIR = expected;
  try {
    assert.equal(resolveQdrantDataDir(), path.resolve(expected));
    assert.match(qdrantBinaryPath(), /qdrant(\.exe)?$/);
  } finally {
    if (prev === undefined) {
      delete process.env.QA_QDRANT_DATA_DIR;
    } else {
      process.env.QA_QDRANT_DATA_DIR = prev;
    }
  }
});
