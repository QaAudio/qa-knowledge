#!/usr/bin/env node
/**
 * Index QuantumAudio documentation into Qdrant.
 *
 * Incremental by default (only changed/new/removed files). Use --full to rebuild.
 * Usage: qa-knowledge-index [--full] [--sources id1,id2] [--sources-file path]
 */
import { configFromEnv } from "./config.js";
import { indexKnowledge } from "./index-builder.js";
function parseArgs(argv) {
    let sourcesFile = process.env.KNOWLEDGE_SOURCES_FILE ?? "config/knowledge.sources.json";
    let sourceFilter;
    let mode = "incremental";
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === "--sources-file" && argv[i + 1]) {
            sourcesFile = argv[++i];
        }
        else if (arg === "--sources" && argv[i + 1]) {
            sourceFilter = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
        }
        else if (arg === "--full") {
            mode = "full";
        }
        else if (arg === "--help" || arg === "-h") {
            console.log(`Usage: qa-knowledge-index [--full] [--sources id1,id2] [--sources-file path]`);
            process.exit(0);
        }
    }
    return { sourcesFile, sourceFilter, mode };
}
async function main() {
    const { sourcesFile, sourceFilter, mode } = parseArgs(process.argv.slice(2));
    const config = configFromEnv();
    console.error(`[qa-knowledge] ${mode} index into ${config.qdrant.url} collection "${config.qdrant.collection}"`);
    console.error(`[qa-knowledge] embedding: ${config.embedding.provider}/${config.embedding.model}`);
    const result = await indexKnowledge(config, { sourcesFile, sourceFilter, mode });
    console.error(`[qa-knowledge] done (${result.mode}): ${result.files} files — ` +
        `+${result.added} added, ~${result.updated} updated, -${result.removed} removed, ` +
        `${result.skipped} unchanged → ${result.chunks} chunks embedded`);
}
main().catch((err) => {
    console.error("[qa-knowledge] fatal:", err);
    process.exit(1);
});
