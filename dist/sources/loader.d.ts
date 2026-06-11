import type { Provenance, SourceType, SourcesManifest } from "../types.js";
/** Load and validate a sources manifest JSON file. */
export declare function loadSourcesManifest(filePath: string): SourcesManifest;
export type SourceFile = {
    absolutePath: string;
    /** Path relative to the knowledge root (Qdrant `source_id`; matches the agent file tool root). */
    sourceId: string;
    sourceType: SourceType;
    title: string;
    skillName?: string;
    provenance: Provenance;
    isSdkDts: boolean;
};
/**
 * Expand enabled glob sources into concrete files under the knowledge root.
 * `sourceId` and glob bases are relative to `knowledgeRoot` so retrieved paths
 * line up with QuantumAgent's workspace (docs/knowledge).
 */
export declare function collectSourceFiles(knowledgeRoot: string, manifest: SourcesManifest, sourceFilter?: string[]): SourceFile[];
/**
 * Merge the `.qa-meta.json` chain from the knowledge root down to the file's
 * folder. Nearest folder wins; the root provides defaults.
 */
export declare function resolveProvenance(knowledgeRoot: string, fileAbs: string, cache: Map<string, Provenance | null>): Provenance;
/** Stable string used to detect provenance changes for incremental indexing. */
export declare function provenanceFingerprint(provenance: Provenance): string;
