#!/usr/bin/env node
/**
 * Knowledge corpus pipeline: embed sidecars, index to Qdrant, or both.
 *
 * Usage:
 *   qa-knowledge-index embedding [--full] [--sources id1,id2] [--sources-file path]
 *   qa-knowledge-index index [--full] [--sources id1,id2] [--sources-file path]
 *   qa-knowledge-index sync [--full] [--sources id1,id2] [--sources-file path]
 */
import { configFromEnv } from "./config.js";
import { embedCorpus } from "./embed-corpus.js";
import { indexEmbeddings, syncKnowledge } from "./index-builder.js";
import { ensureEmbeddedQdrant } from "./qdrant/runtime.js";

type Command = "embedding" | "index" | "sync";

function parseArgs(argv: string[]) {
  let command: Command = "sync";
  let sourcesFile = process.env.KNOWLEDGE_SOURCES_FILE ?? "config/knowledge.sources.json";
  let sourceFilter: string[] | undefined;
  let full = false;

  const args = [...argv];
  const first = args[0];
  if (first === "embedding" || first === "index" || first === "sync") {
    command = first;
    args.shift();
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--sources-file" && args[i + 1]) {
      sourcesFile = args[++i]!;
    } else if (arg === "--sources" && args[i + 1]) {
      sourceFilter = args[++i]!.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (arg === "--full") {
      full = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(
        `Usage: qa-knowledge-index <embedding|index|sync> [--full] [--sources id1,id2] [--sources-file path]`,
      );
      process.exit(0);
    }
  }

  return { command, sourcesFile, sourceFilter, full };
}

async function main() {
  const { command, sourcesFile, sourceFilter, full } = parseArgs(process.argv.slice(2));
  const config = configFromEnv();

  console.error(`[qa-knowledge] command: ${command}`);
  console.error(`[qa-knowledge] embedding: ${config.embedding.provider}/${config.embedding.model}`);

  if (command === "embedding") {
    const result = await embedCorpus(config, { sourcesFile, sourceFilter, full });
    console.error(
      `[qa-knowledge] embedding done: ${result.files} files — ` +
        `${result.embedded} embedded, ${result.skipped} skipped, ${result.pruned} pruned → ${result.chunks} chunks`,
    );
    return;
  }

  await ensureEmbeddedQdrant();
  console.error(
    `[qa-knowledge] qdrant: ${config.qdrant.url} collection "${config.qdrant.collection}"`,
  );

  if (command === "index") {
    const result = await indexEmbeddings(config, { sourcesFile, sourceFilter, full });
    console.error(
      `[qa-knowledge] index done (${result.mode}): ${result.files} files — ` +
        `+${result.added} added, ~${result.updated} updated, -${result.removed} removed, ` +
        `${result.skipped} unchanged → ${result.chunks} chunks upserted`,
    );
    return;
  }

  const result = await syncKnowledge(config, { sourcesFile, sourceFilter, full });
  console.error(
    `[qa-knowledge] sync embedding: ${result.embed.embedded} embedded, ${result.embed.skipped} skipped, ` +
      `${result.embed.pruned} pruned → ${result.embed.chunks} chunks`,
  );
  console.error(
    `[qa-knowledge] sync index (${result.index.mode}): ${result.index.files} files — ` +
      `+${result.index.added} added, ~${result.index.updated} updated, -${result.index.removed} removed, ` +
      `${result.index.skipped} unchanged → ${result.index.chunks} chunks upserted`,
  );
}

main().catch((err) => {
  console.error("[qa-knowledge] fatal:", err);
  process.exit(1);
});
