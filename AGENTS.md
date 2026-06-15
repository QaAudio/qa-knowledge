# qa-knowledge — Agent Guide

Package: `@quantumaudio/qa-knowledge`. Corpus in `docs/knowledge/` + Qdrant indexing library.

## Layout

```
qa-knowledge/
├── docs/knowledge/           # markdown corpus + *.embedding.json sidecars + .qa-index.json
├── config/knowledge.sources.json
├── src/
│   ├── chunk.ts, embed-corpus.ts, index-builder.ts, embedding-files.ts, search.ts
│   ├── embed/                # ollama | openrouter
│   ├── qdrant/
│   ├── scrape/               # online doc scraper (HTML/PDF/Playwright)
│   └── cli.ts                # qa-knowledge-index bin
└── package.json
```

## Commands

| Command | When |
|---------|------|
| `npm run typecheck` | After TS edits |
| `npm run build` | Before CLI, tests, or MCP |
| `npm test` | chunk + index-state + embedding-files + index-builder + qdrant client |
| `npx qa-knowledge-index embedding` | Generate missing/stale `*.embedding.json` sidecars (needs embedding provider) |
| `npx qa-knowledge-index index` | Upsert sidecars into Qdrant (incremental; needs embedded Qdrant) |
| `npx qa-knowledge-index sync` | Embedding then index |
| `npx qa-knowledge-index … --full` | Force re-embed and/or full Qdrant rebuild |
| `npx qa-knowledge-scrape --url … --source-id …` | Scrape online docs to `docs/knowledge/` (no embedding) |

## Conventions

- `source_id` paths are **relative to `docs/knowledge/`** — agents open files by that path.
- Each indexed file has a committed sidecar: `SKILL.md` → `SKILL.md.embedding.json` (SHA-256 of source + chunk vectors + payload).
- `defaultRepoRoot()` resolves repo root from `dist/` (two levels up).
- Commit `*.embedding.json` and `.qa-index.json` with corpus changes.
- Nearest `.qa-meta.json` wins for provenance fields.

## Corpus edits

1. Edit markdown under `docs/knowledge/`
2. `npm run build && npx qa-knowledge-index sync` (or `embedding` then `index`)
3. Commit corpus + updated sidecars + `.qa-index.json`
4. If MCP is used, restart or rely on live search

Do not hand-edit generated `ableton-sdk/{api,reference,examples}` or `sdk-types.md`.

Security / publish: `.cursor/skills/security-guidelines/SKILL.md`.
