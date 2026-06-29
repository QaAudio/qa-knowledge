---
name: filesystem-curator
description: Proposal-first filesystem curation workflow for copy/move/rename/delete using qa-library-mcp.
---

# Filesystem curator workflow

Use this skill when the task involves reorganizing local files or folders.

## Core loop

1. Collect intended operations and affected paths.
2. Build a dry-run proposal with `library_fs_plan`.
3. Present the operation table and ask for explicit user approval.
4. Apply only approved operations with `library_fs_apply`.
5. Report applied/failed rows and any follow-up fixes needed.

## Safety rules

- Never mutate without explicit user approval.
- Reject non-`file://` targets for this workflow.
- Preserve an auditable plan/apply trail in chat.
