import type { EmbeddingConfig } from "../types.js";
export declare function embedOllama(texts: string[], config: EmbeddingConfig): Promise<number[][]>;
