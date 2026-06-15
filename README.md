# @quantumaudio/qa-knowledge

Documentation **corpus** (`docs/knowledge/`) plus a TypeScript library to **chunk, embed, and search** it via [Qdrant](https://qdrant.tech/). Powers the [qa-knowledge-mcp](https://github.com/QaAudio/qa-knowledge-mcp) server and QuantumAgent-style agent workspaces.

License: [Apache-2.0](LICENSE).

## What's in this repo

| Path | Role |
|------|------|
| `docs/knowledge/` | Markdown corpus — Ableton SDK docs, music-producer skills, community notes |
| `config/knowledge.sources.json` | Glob definitions for indexing |
| `src/` | Chunker, embedders (Ollama / OpenRouter), Qdrant client, CLI |
| `dist/` | Compiled library + `qa-knowledge-index` binary |

Corpus layout is documented in [`docs/knowledge/README.md`](docs/knowledge/README.md).

## Install (library only)

```bash
npm install @quantumaudio/qa-knowledge
```

For the full stack (corpus + MCP), clone this repo or use it as a git submodule.

## Prerequisites (indexing / search)

- **Embedded Qdrant** — QuantumAgent manages a local Qdrant binary on `127.0.0.1:6433` (REST) / `6434` (gRPC). One-time setup from the monorepo root:

  ```bash
  npm run qdrant:prepare
  ```

  Binary and storage live under `{Electron userData}/qdrant/` (override with `QA_QDRANT_DATA_DIR`). Docker/cloud Qdrant is no longer used.
- **Embeddings** — Ollama locally or OpenRouter API key

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `QA_QDRANT_DATA_DIR` | `{userData}/qdrant` | Embedded Qdrant binary + storage |
| `KNOWLEDGE_COLLECTION` | `qa-core` | Collection name |
| `KNOWLEDGE_ROOT` | `docs/knowledge` | Corpus root (relative to repo root) |
| `KNOWLEDGE_SOURCES_FILE` | `config/knowledge.sources.json` | Source globs |
| `EMBEDDING_PROVIDER` | `openrouter` | `ollama` \| `openrouter` |
| `EMBEDDING_MODEL` | `openai/text-embedding-3-small` | Model id |
| `EMBEDDING_DIMENSIONS` | `1536` | Vector size |
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | When provider is `ollama` |
| `OPENROUTER_API_KEY` | — | When provider is `openrouter` |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | OpenRouter endpoint |

## Embed and index the corpus

Embeddings are versioned in the repo as self-contained sidecars (`*.embedding.json`) next to each source file. Qdrant indexing reads only those sidecars.

```bash
npm ci
npm run build

# Generate missing/stale sidecars (no Qdrant)
npx qa-knowledge-index embedding

# Upsert sidecars into Qdrant (incremental)
npx qa-knowledge-index index

# Both steps
npx qa-knowledge-index sync

# Full re-embed and/or Qdrant rebuild (after model/dimension change)
npx qa-knowledge-index sync --full

# Subset of manifest sources
npx qa-knowledge-index sync --sources ableton-sdk,skills
```

From the QuantumAudio monorepo: `npm run knowledge:embedding`, `knowledge:index`, or `knowledge:sync`.

Commit `*.embedding.json` sidecars and `docs/knowledge/.qa-index.json` after indexing so teammates skip unchanged work.

## Scrape online documentation

Fetch wikis, doc sites, PDFs, and JS-rendered pages into `docs/knowledge/<source-id>/` as markdown. **Scrape only** — does not index into Qdrant.

```bash
npx qa-knowledge-scrape \
  --url "https://docs.example.com/plugins/" \
  --source-id example-plugins \
  --scope path-prefix \
  --max-pages 150
```

| Flag | Purpose |
|------|---------|
| `--render auto\|fetch\|playwright` | HTTP fetch with optional Playwright fallback |
| `--no-register` | Skip patching `config/knowledge.sources.json` |
| `--dry-run` | Discover URLs without writing files |

From the QuantumAudio monorepo: `npm run knowledge:scrape -- …`

Programmatic use: `runScrape()` from `@quantumaudio/qa-knowledge` (progress callbacks + `AbortSignal` for future UI integration).

## Programmatic API

```ts
import { configFromEnv, syncKnowledge, searchKnowledge } from "@quantumaudio/qa-knowledge";

const config = configFromEnv();
await syncKnowledge(config, { sourcesFile: "config/knowledge.sources.json" });

const hits = await searchKnowledge(config, "create a MIDI clip in arrangement");
// hits[].source_id is relative to docs/knowledge/
```

## Provenance

Per-folder `.qa-meta.json` files describe document origin (vendor SDK, QuantumAudio skills, community). The indexer merges nearest-wins metadata into each Qdrant chunk payload (`origin`, `source`, `license`, …).

## Development

```bash
git clone https://github.com/QaAudio/qa-knowledge.git
cd qa-knowledge
npm ci
npm run typecheck
npm run build
npm test
```

## Related packages

| Package | Repo |
|---------|------|
| `@quantumaudio/knowledge-mcp` | [qa-knowledge-mcp](https://github.com/QaAudio/qa-knowledge-mcp) |
| `@quantumaudio/ableton-mcp` | [qa-ableton-mcp](https://github.com/QaAudio/qa-ableton-mcp) — pair for Live + docs |

SDK markdown under `ableton-sdk/` is generated from Ableton's Extensions SDK; regenerate from the QuantumAudio monorepo with `npm run knowledge:convert-sdk` when bumping the vendored SDK.

## Contributing

Add corpus under `docs/knowledge/` following existing `.qa-meta.json` conventions. Run `sync` (or `embedding` + `index`) and commit sidecars + `.qa-index.json`. See [AGENTS.md](AGENTS.md).
