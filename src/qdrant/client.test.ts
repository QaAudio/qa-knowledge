import test from "node:test";
import assert from "node:assert/strict";
import type { QdrantClient } from "@qdrant/js-client-rest";
import { matchesFilters, searchChunks } from "./client.js";
import type { SearchHit } from "../types.js";

function hit(overrides: Partial<SearchHit>): SearchHit {
  return {
    chunk_id: "c",
    score: 1,
    source_id: "s",
    source_type: "skill",
    title: "t",
    excerpt: "",
    ...overrides,
  };
}

const point = (id: string, skill: string, source_type = "skill") => ({
  id,
  score: 1,
  payload: { chunk_id: id, skill_name: skill, source_type, content: `body ${id}` },
});

/** Minimal QdrantClient stub: throws on a filtered search, returns points otherwise. */
function stubClient(points: unknown[], opts: { rejectFilter?: boolean } = {}): QdrantClient {
  return {
    async search(_collection: string, params: { filter?: unknown }) {
      if (params.filter && opts.rejectFilter) {
        throw new Error('Bad request: Index required but not found for "skill_name"');
      }
      return points;
    },
  } as unknown as QdrantClient;
}

test("matchesFilters scopes by skill_name and source_type", () => {
  const h = hit({ skill_name: "ableton-midi", source_type: "skill" });
  assert.equal(matchesFilters(h, { skillName: "ableton-midi" }), true);
  assert.equal(matchesFilters(h, { skillName: "ableton-mixing" }), false);
  assert.equal(matchesFilters(h, { sourceTypes: ["skill"] }), true);
  assert.equal(matchesFilters(h, { sourceTypes: ["repo_doc"] }), false);
  assert.equal(matchesFilters(h, {}), true);
});

test("searchChunks falls back to in-memory filter when the server rejects the filter", async () => {
  const client = stubClient(
    [point("a", "ableton-midi"), point("b", "ableton-mixing"), point("c", "ableton-midi")],
    { rejectFilter: true },
  );

  const hits = await searchChunks(client, "qa-core", [0.1], {
    skillName: "ableton-midi",
    limit: 5,
  });

  assert.deepEqual(
    hits.map((h) => h.chunk_id),
    ["a", "c"],
  );
});

test("searchChunks uses the server filter when it succeeds", async () => {
  // Server honors the filter and returns only the matching point.
  const client = stubClient([point("a", "ableton-midi")]);
  const hits = await searchChunks(client, "qa-core", [0.1], { skillName: "ableton-midi" });
  assert.deepEqual(
    hits.map((h) => h.chunk_id),
    ["a"],
  );
});
