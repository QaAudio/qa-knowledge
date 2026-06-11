import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import type { Provenance, SourceType, SourcesManifest } from "../types.js";

const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", ".venv", "__pycache__"]);
/** Per-folder provenance marker (not itself indexed). */
const META_FILE = ".qa-meta.json";

/** Load and validate a sources manifest JSON file. */
export function loadSourcesManifest(filePath: string): SourcesManifest {
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as SourcesManifest;
  if (!Array.isArray(parsed.sources)) {
    throw new Error(`Invalid sources manifest: ${filePath}`);
  }
  return parsed;
}

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
export function collectSourceFiles(
  knowledgeRoot: string,
  manifest: SourcesManifest,
  sourceFilter?: string[],
): SourceFile[] {
  const enabled = manifest.sources.filter((s) => s.enabled !== false);
  const selected =
    sourceFilter && sourceFilter.length > 0
      ? enabled.filter((s) => sourceFilter.includes(s.id))
      : enabled;

  const files: SourceFile[] = [];
  const seen = new Set<string>();
  const metaCache = new Map<string, Provenance | null>();

  for (const source of selected) {
    if (source.type !== "glob") continue;
    for (const pattern of source.paths) {
      const matches = expandGlob(knowledgeRoot, pattern);
      for (const abs of matches) {
        const rel = path.relative(knowledgeRoot, abs).replace(/\\/g, "/");
        if (seen.has(rel)) continue;
        seen.add(rel);

        const provenance = resolveProvenance(knowledgeRoot, abs, metaCache);
        files.push({
          absolutePath: abs,
          sourceId: rel,
          sourceType: resolveSourceType(rel, provenance, source.source_type),
          title: path.basename(abs),
          skillName: inferSkillName(rel),
          provenance,
          isSdkDts: rel.endsWith(".d.ts"),
        });
      }
    }
  }

  return files.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}

function expandGlob(root: string, pattern: string): string[] {
  const normalized = pattern.replace(/\\/g, "/");
  if (!normalized.includes("*")) {
    const abs = path.resolve(root, normalized);
    return existsSync(abs) && statSync(abs).isFile() ? [abs] : [];
  }

  const parts = normalized.split("/");
  const starIndex = parts.findIndex((p) => p.includes("*"));
  if (starIndex < 0) return [];

  const prefix = parts.slice(0, starIndex);
  const suffix = parts.slice(starIndex + 1);
  const startDir = path.resolve(root, ...prefix);
  if (!existsSync(startDir)) return [];

  const matches: string[] = [];
  walkGlob(startDir, suffix, matches);
  return matches;
}

function walkGlob(dir: string, suffixParts: string[], out: string[]): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  if (suffixParts.length === 0) {
    for (const entry of entries) {
      if (entry.isFile()) out.push(path.join(dir, entry.name));
    }
    return;
  }

  const [head, ...rest] = suffixParts;
  if (!head) return;

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      if (matchSegment(entry.name, head)) {
        walkGlob(full, rest, out);
      } else if (head.includes("*")) {
        walkGlob(full, suffixParts, out);
      }
      continue;
    }
    if (rest.length === 0 && entry.isFile() && matchSegment(entry.name, head)) {
      out.push(full);
    }
  }
}

function matchSegment(name: string, pattern: string): boolean {
  if (pattern === "**") return true;
  if (pattern.startsWith("*.")) {
    return name.endsWith(pattern.slice(1));
  }
  if (pattern.includes("*")) {
    const re = new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`);
    return re.test(name);
  }
  return name === pattern;
}

/**
 * Merge the `.qa-meta.json` chain from the knowledge root down to the file's
 * folder. Nearest folder wins; the root provides defaults.
 */
export function resolveProvenance(
  knowledgeRoot: string,
  fileAbs: string,
  cache: Map<string, Provenance | null>,
): Provenance {
  const rootResolved = path.resolve(knowledgeRoot);
  const dirs: string[] = [];
  let dir = path.dirname(path.resolve(fileAbs));
  while (true) {
    dirs.push(dir);
    if (dir === rootResolved) break;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  let merged: Provenance = {};
  for (let i = dirs.length - 1; i >= 0; i -= 1) {
    const meta = readMetaForDir(dirs[i]!, cache);
    if (meta) merged = { ...merged, ...stripEmpty(meta) };
  }
  return merged;
}

/** Stable string used to detect provenance changes for incremental indexing. */
export function provenanceFingerprint(provenance: Provenance): string {
  return JSON.stringify(provenance, Object.keys(provenance).sort());
}

function readMetaForDir(dir: string, cache: Map<string, Provenance | null>): Provenance | null {
  const cached = cache.get(dir);
  if (cached !== undefined) return cached;
  const metaPath = path.join(dir, META_FILE);
  let meta: Provenance | null = null;
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(readFileSync(metaPath, "utf8")) as Provenance;
    } catch {
      meta = null;
    }
  }
  cache.set(dir, meta);
  return meta;
}

function stripEmpty(meta: Provenance): Provenance {
  const out: Provenance = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value !== undefined && value !== null && value !== "") {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

/**
 * Resolve the chunk `source_type`. Structural rules win for skills (SKILL.md vs
 * its reference files); otherwise the manifest override, then provenance, then
 * a path-based fallback.
 */
function resolveSourceType(
  relPath: string,
  provenance: Provenance,
  manifestType?: SourceType,
): SourceType {
  if (relPath.endsWith("/SKILL.md")) return "skill";
  if (relPath.startsWith("skills/")) return "skill_reference";
  return manifestType ?? provenance.source_type ?? inferSourceType(relPath);
}

function inferSourceType(relPath: string): SourceType {
  if (relPath.startsWith("ableton-sdk/")) return "sdk_reference";
  if (relPath.startsWith("community/")) return "user_note";
  if (relPath.endsWith(".d.ts")) return "sdk_reference";
  return "repo_doc";
}

function inferSkillName(relPath: string): string | undefined {
  const match = relPath.match(/^skills\/[^/]+\/([^/]+)\//);
  return match?.[1];
}
