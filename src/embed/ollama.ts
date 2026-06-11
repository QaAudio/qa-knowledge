import type { EmbeddingConfig } from "../types.js";

const DEFAULT_OLLAMA = "http://127.0.0.1:11434";

export async function embedOllama(texts: string[], config: EmbeddingConfig): Promise<number[][]> {
  const baseUrl = (config.baseUrl ?? process.env.OLLAMA_HOST ?? DEFAULT_OLLAMA).replace(/\/$/, "");
  const vectors: number[][] = [];

  for (const text of texts) {
    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: config.model, prompt: text }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Ollama embeddings failed (${response.status}): ${detail}`);
    }
    const data = (await response.json()) as { embedding?: number[] };
    if (!data.embedding?.length) {
      throw new Error(`Ollama returned no embedding for model "${config.model}"`);
    }
    vectors.push(data.embedding);
  }

  return vectors;
}
