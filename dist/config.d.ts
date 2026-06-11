import type { KnowledgeConfig } from "./types.js";
/** Repo root when resolved from packages/qa-knowledge/dist or src. */
export declare function defaultRepoRoot(): string;
/**
 * Corpus root for the knowledge base. `source_id` and globs are relative to this
 * so Qdrant paths match QuantumAgent's `workspaceDir` (docs/knowledge).
 */
export declare function defaultKnowledgeRoot(repoRoot?: string): string;
export declare function resolveEnvPlaceholder(value: string | undefined, fallback?: string): string;
/** Build config from environment variables (MCP server and CLI). */
export declare function configFromEnv(repoRoot?: string): KnowledgeConfig;
