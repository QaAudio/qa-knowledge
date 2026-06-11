import type { EmbeddingConfig } from "../types.js";
/**
 * Embed one or more texts using the configured provider.
 *
 * @example
 * const [vector] = await embedTexts(["sidechain compression"], config);
 */
export declare function embedTexts(texts: string[], config: EmbeddingConfig): Promise<number[][]>;
/** Embed a single query string. */
export declare function embedQuery(text: string, config: EmbeddingConfig): Promise<number[]>;
