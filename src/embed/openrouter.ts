import { resolveEnvPlaceholder } from "../config.js";
import type { EmbeddingConfig } from "../types.js";

const DEFAULT_OPENROUTER = "https://openrouter.ai/api/v1";

export async function embedOpenRouter(texts: string[], config: EmbeddingConfig): Promise<number[][]> {
  const apiKey =
    resolveEnvPlaceholder(config.apiKey) ||
    resolveEnvPlaceholder(process.env.OPENROUTER_API_KEY);
  if (!apiKey?.trim()) {
    throw new Error("OPENROUTER_API_KEY is required for openrouter embedding provider");
  }
  const baseUrl = (config.baseUrl ?? DEFAULT_OPENROUTER).replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: config.model, input: texts }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter embeddings failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as {
    data?: Array<{ embedding?: number[]; index?: number }>;
  };
  const rows = data.data ?? [];
  if (rows.length !== texts.length) {
    throw new Error(`OpenRouter returned ${rows.length} embeddings for ${texts.length} inputs`);
  }
  return rows
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((row) => {
      if (!row.embedding?.length) throw new Error("OpenRouter returned empty embedding");
      return row.embedding;
    });
}
