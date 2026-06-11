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

- **Qdrant** — e.g. `docker run -p 6333:6333 qdrant/qdrant`
- **Embeddings** — Ollama locally or OpenRouter API key

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `QDRANT_URL` | `http://127.0.0.1:6333` | Qdrant HTTP API |
| `QDRANT_API_KEY` | — | Cloud Qdrant auth |
| `KNOWLEDGE_COLLECTION` | `qa-core` | Collection name |
| `KNOWLEDGE_ROOT` | `docs/knowledge` | Corpus root (relative to repo root) |
| `KNOWLEDGE_SOURCES_FILE` | `config/knowledge.sources.json` | Source globs |
| `EMBEDDING_PROVIDER` | `openrouter` | `ollama` \| `openrouter` |
| `EMBEDDING_MODEL` | `openai/text-embedding-3-small` | Model id |
| `EMBEDDING_DIMENSIONS` | `1536` | Vector size |
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | When provider is `ollama` |
| `OPENROUTER_API_KEY` | — | When provider is `openrouter` |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | OpenRouter endpoint |

## Index the corpus

```bash
npm ci
npm run build

# Incremental (only changed files)
npx qa-knowledge-index

# Full rebuild
npx qa-knowledge-index --full

# Subset of sources
npx qa-knowledge-index --sources ableton-sdk,skills
```

Incremental state is stored in `docs/knowledge/.qa-index.json` — commit it after indexing so teammates skip unchanged files.

## Programmatic API

```ts
import { configFromEnv, indexKnowledge, searchKnowledge } from "@quantumaudio/qa-knowledge";

const config = configFromEnv();
await indexKnowledge(config, { mode: "incremental" });

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

Add corpus under `docs/knowledge/` following existing `.qa-meta.json` conventions. Run index + commit `.qa-index.json`. See [AGENTS.md](AGENTS.md).
