# QuantumAgent knowledge base

All documentation exposed to agents lives here. It is chunked, embedded, and indexed into
Qdrant by [`@quantumaudio/qa-knowledge`](../../README.md) and retrieved at runtime through
[qa-knowledge-mcp](https://github.com/QaAudio/qa-knowledge-mcp) (`search_knowledge` / `get_knowledge_chunk`).

This folder is also QuantumAgent's file-tool workspace root (`workspaceDir`), so a search hit's
`source_id` (for example `ableton-sdk/api/classes/Clip.md`) is the exact path the agent can open.

## Layout

```
docs/knowledge/
├── .qa-meta.json          # root provenance defaults
├── .qa-index.json         # versioned index state (what is already in Qdrant)
├── ableton-sdk/           # Ableton Extensions SDK (origin: vendor)
│   ├── guides/            # hand-authored agent guides (quickstart, recipes, cheatsheet)
│   ├── api/               # TypeDoc API reference (generated)
│   ├── reference/         # prose docs site (generated)
│   ├── examples/          # example projects, one markdown file each (generated)
│   └── sdk-types.md       # full .d.ts type surface (generated)
├── skills/                # user-facing agent skills (origin: quantumaudio)
│   └── music-producer/    # MIDI, mixing, sound design, arrangement, playbooks, …
└── community/             # community-contributed techniques (origin: community)
```

All documents are markdown. The vendor SDK docs under `ableton-sdk/{api,reference,examples}` and
`sdk-types.md` are **generated** from `vendor/extensions-sdk-1.0.0-beta.0` — do not edit them by
hand; re-run the converter instead.

## Provenance: per-folder `.qa-meta.json`

Each folder (and subfolder) may carry a hidden `.qa-meta.json` describing where its documents came
from. The indexer merges the chain from this root down to a file's folder, **nearest folder wins**,
and writes the result into each Qdrant chunk's payload (`origin`, `source`, `source_url`, `license`,
`generated_by`, `generated_at`). Add or override only the fields you need at each level.

```json
{
  "source": "Ableton Extensions SDK 1.0.0-beta.0",
  "origin": "vendor",
  "source_url": "https://ableton.github.io/extensions-sdk/",
  "license": "© Ableton AG — converted/derivative; originals not redistributed",
  "generated_by": "scripts/convert-sdk-docs.mts",
  "generated_at": "2026-06-10",
  "last_edited": "2026-06-10",
  "source_type": "sdk_reference",
  "notes": ""
}
```

`origin` is a coarse bucket: `vendor | quantumaudio | community | distilled`. `source_type` feeds the
indexer's chunk type (skills are typed structurally: `SKILL.md` → `skill`, other skill files →
`skill_reference`).

## Indexing

Run from the **qa-knowledge repo root** (requires Qdrant and an embedding provider — see
[README.md](../../README.md)):

| Command | When |
|---------|------|
| `npx qa-knowledge-index` | After editing/adding/removing corpus files — **incremental** |
| `npx qa-knowledge-index --full` | After changing embedding model/dimensions, or full rebuild |

SDK markdown regeneration (`npm run knowledge:convert-sdk`) lives in the private QuantumAudio monorepo when bumping the vendored SDK tgz.

Incremental indexing is driven by **`.qa-index.json`** (committed to git). It records, per file, the
content hash, the merged provenance hash, and the Qdrant chunk ids — so an index run re-embeds only
new or changed files, deletes stale chunks for edited files, and purges chunks for deleted files. A
full re-index is forced automatically when the embedding configuration no longer matches the state.

After editing corpus files, run `npm run knowledge:index` and commit the updated `.qa-index.json`
alongside your changes.
