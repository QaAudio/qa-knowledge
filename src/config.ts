import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EmbeddingConfig, KnowledgeConfig, QdrantConfig } from "./types.js";
import { EMBEDDED_QDRANT_REST_URL } from "./qdrant/paths.js";

const DEFAULT_KNOWLEDGE_ROOT_REL = "docs/knowledge";
const SOURCES_MANIFEST_REL = path.join("config", "knowledge.sources.json");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Repo root: nearest ancestor of this module that contains
 * `config/knowledge.sources.json` (standalone qa-knowledge or monorepo root).
 */
export function defaultRepoRoot(): string {
  let dir = __dirname;
  const fsRoot = path.parse(dir).root;
  while (true) {
    if (existsSync(path.join(dir, SOURCES_MANIFEST_REL))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir || dir === fsRoot) break;
    dir = parent;
  }
  return path.resolve(__dirname, "..", "..");
}

/**
 * Corpus root for the knowledge base. `source_id` and globs are relative to this
 * so Qdrant paths match QuantumAgent's `workspaceDir` (docs/knowledge).
 */
export function defaultKnowledgeRoot(repoRoot = defaultRepoRoot()): string {
  return path.resolve(repoRoot, "docs", "knowledge");
}

export function resolveEnvPlaceholder(value: string | undefined, fallback = ""): string {
  if (!value) return fallback;
  const match = value.match(/^\$\{([^}:]+)(?::-(.+))?\}$/);
  if (!match) return value;
  const envValue = process.env[match[1]!];
  if (envValue !== undefined && envValue !== "") return envValue;
  return match[2] ?? "";
}

const DEFAULT_EMBEDDING_PROVIDER = "openrouter";
const DEFAULT_EMBEDDING_MODEL = "openai/text-embedding-3-small";
const DEFAULT_EMBEDDING_DIMENSIONS = 1536;
const DEFAULT_OPENROUTER_BASE = "https://openrouter.ai/api/v1";

/** Build config from environment variables (MCP server and CLI). */
export function configFromEnv(repoRoot = defaultRepoRoot()): KnowledgeConfig {
  const provider =
    (process.env.EMBEDDING_PROVIDER as "ollama" | "openrouter") ?? DEFAULT_EMBEDDING_PROVIDER;
  const embedding: EmbeddingConfig = {
    provider,
    model: process.env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL,
    dimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? String(DEFAULT_EMBEDDING_DIMENSIONS)),
    baseUrl:
      provider === "ollama"
        ? (process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434")
        : resolveEnvPlaceholder(process.env.OPENROUTER_BASE_URL, DEFAULT_OPENROUTER_BASE),
    apiKey: resolveEnvPlaceholder(process.env.OPENROUTER_API_KEY),
  };

  const qdrant: QdrantConfig = {
    url: EMBEDDED_QDRANT_REST_URL,
    collection: process.env.KNOWLEDGE_COLLECTION ?? "qa-core",
  };

  const knowledgeRoot = process.env.KNOWLEDGE_ROOT
    ? path.resolve(repoRoot, process.env.KNOWLEDGE_ROOT)
    : path.resolve(repoRoot, DEFAULT_KNOWLEDGE_ROOT_REL);

  return { repoRoot, knowledgeRoot, qdrant, embedding };
}
