# Community contributions

Placeholder for community-contributed Ableton techniques, device presets, and example
walkthroughs. Everything here is indexed into the QuantumAgent knowledge base and retrieved
through the `qa-knowledge` MCP (`search_knowledge`).

## Adding a contribution

1. Create a folder per contribution (or topic) under `community/`.
2. Write the content as markdown (`.md`).
3. Add a `.qa-meta.json` in the folder recording provenance — at minimum:

```json
{
  "source": "<title or author>",
  "origin": "community",
  "source_url": "<link to the original, if any>",
  "license": "<license of the contribution>",
  "last_edited": "<YYYY-MM-DD>",
  "source_type": "user_note"
}
```

4. Re-index with `npm run knowledge:index` (incremental) so the new files are searchable.

See [`../README.md`](../README.md) for the provenance convention and indexing workflow.
