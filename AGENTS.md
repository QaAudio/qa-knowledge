# qa-knowledge — Agent Guide

Package: `@quantumaudio/qa-knowledge`. Corpus in `docs/knowledge/` + Qdrant indexing library.

## Layout

```
qa-knowledge/
├── docs/knowledge/           # markdown corpus + .qa-index.json
├── config/knowledge.sources.json
├── src/
│   ├── chunk.ts, index-builder.ts, search.ts
│   ├── embed/                # ollama | openrouter
│   ├── qdrant/
│   └── cli.ts                # qa-knowledge-index bin
└── package.json
```

## Commands

| Command | When |
|---------|------|
| `npm run typecheck` | After TS edits |
| `npm run build` | Before CLI, tests, or MCP |
| `npm test` | chunk + index-state + qdrant client |
| `npx qa-knowledge-index` | Incremental index (needs Qdrant + embeddings) |
| `npx qa-knowledge-index --full` | Rebuild all chunks |

## Conventions

- `source_id` paths are **relative to `docs/knowledge/`** — agents open files by that path.
- `defaultRepoRoot()` resolves repo root from `dist/` (two levels up).
- Commit `.qa-index.json` with corpus changes when chunks change.
- Nearest `.qa-meta.json` wins for provenance fields.

## Corpus edits

1. Edit markdown under `docs/knowledge/`
2. `npm run build && npx qa-knowledge-index`
3. Commit corpus + updated `.qa-index.json`
4. If MCP is used, restart or rely on live search

Do not hand-edit generated `ableton-sdk/{api,reference,examples}` or `sdk-types.md`.

Security / publish: `.cursor/skills/security-guidelines/SKILL.md`.
