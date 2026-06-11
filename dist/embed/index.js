import { embedOllama } from "./ollama.js";
import { embedOpenRouter } from "./openrouter.js";
/**
 * Embed one or more texts using the configured provider.
 *
 * @example
 * const [vector] = await embedTexts(["sidechain compression"], config);
 */
export async function embedTexts(texts, config) {
    if (texts.length === 0)
        return [];
    switch (config.provider) {
        case "ollama":
            return embedOllama(texts, config);
        case "openrouter":
            return embedOpenRouter(texts, config);
        default: {
            const _exhaustive = config.provider;
            throw new Error(`Unknown embedding provider: ${_exhaustive}`);
        }
    }
}
/** Embed a single query string. */
export async function embedQuery(text, config) {
    const [vector] = await embedTexts([text], config);
    if (!vector)
        throw new Error("Embedding provider returned no vector");
    return vector;
}
