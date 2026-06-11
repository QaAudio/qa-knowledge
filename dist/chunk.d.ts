import type { KnowledgeChunk, Provenance, SourceType } from "./types.js";
type ChunkInput = {
    sourceId: string;
    sourceType: SourceType;
    title: string;
    skillName?: string;
    provenance?: Provenance;
    text: string;
    isSdkDts?: boolean;
};
/** Split markdown or SDK types into retrieval-sized chunks with heading + provenance metadata. */
export declare function chunkDocument(input: ChunkInput): KnowledgeChunk[];
export {};
