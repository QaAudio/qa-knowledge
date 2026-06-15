import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { Provenance, SourceDefinition, SourcesManifest } from "../types.js";
import { loadSourcesManifest } from "../sources/loader.js";
import type { ScrapeState } from "./types.js";

const META_FILE = ".qa-meta.json";
const STATE_FILE = ".qa-scrape-state.json";
const GENERATED_BY = "qa-knowledge-scrape";

function slugify(segment: string): string {
  return segment
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Map a page URL to a relative markdown path under the source folder.
 *
 * @example
 * urlToMdPath(new URL('https://x.com/plugins/eq'), start, 'vendor-docs');
 * // → 'plugins/eq.md'
 */
export function urlToMdPath(url: URL, startUrl: URL, sourceId: string): string {
  void sourceId;
  let pathname = url.pathname;
  if (pathname.endsWith("/")) pathname = `${pathname}index`;
  if (pathname.toLowerCase().endsWith(".html")) {
    pathname = pathname.slice(0, -".html".length);
  }
  if (pathname.toLowerCase().endsWith(".pdf")) {
    const base = path.basename(pathname, ".pdf");
    return path.posix.join("pdfs", `${slugify(base) || "document"}.md`);
  }

  const startPath = startUrl.pathname.replace(/\/$/, "") || "/";
  let relative = pathname;
  if (startPath !== "/" && pathname.startsWith(startPath)) {
    relative = pathname.slice(startPath.length) || "/index";
  }

  const segments = relative
    .split("/")
    .filter(Boolean)
    .map((s) => slugify(s) || "page");

  if (segments.length === 0) return "index.md";
  const last = segments[segments.length - 1]!;
  if (!last.endsWith(".md")) {
    segments[segments.length - 1] = `${last}.md`;
  }
  return segments.join("/");
}

export function sourceOutputDir(knowledgeRoot: string, sourceId: string): string {
  return path.join(knowledgeRoot, sourceId);
}

export function writeMarkdownFile(
  knowledgeRoot: string,
  sourceId: string,
  relPath: string,
  markdown: string,
): string {
  const outPath = path.join(knowledgeRoot, sourceId, relPath);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${markdown.trimEnd()}\n`, "utf8");
  return relPath.replace(/\\/g, "/");
}

export function writeSourceMeta(
  knowledgeRoot: string,
  sourceId: string,
  startUrl: URL,
  provenance?: Partial<Provenance>,
): void {
  const meta: Provenance = {
    source: provenance?.source ?? startUrl.hostname,
    origin: provenance?.origin ?? "vendor",
    source_url: provenance?.source_url ?? startUrl.href,
    source_type: provenance?.source_type ?? "external_manual",
    generated_by: GENERATED_BY,
    generated_at: new Date().toISOString().slice(0, 10),
    ...provenance,
  };
  const metaPath = path.join(knowledgeRoot, sourceId, META_FILE);
  mkdirSync(path.dirname(metaPath), { recursive: true });
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
}

export function loadScrapeState(knowledgeRoot: string, sourceId: string): ScrapeState | null {
  const statePath = path.join(knowledgeRoot, sourceId, STATE_FILE);
  if (!existsSync(statePath)) return null;
  try {
    return JSON.parse(readFileSync(statePath, "utf8")) as ScrapeState;
  } catch {
    return null;
  }
}

export function saveScrapeState(
  knowledgeRoot: string,
  sourceId: string,
  startUrl: URL,
  urlToPath: Record<string, string>,
): void {
  const state: ScrapeState = {
    version: 1,
    source_id: sourceId,
    start_url: startUrl.href,
    scraped_at: new Date().toISOString(),
    url_to_path: urlToPath,
  };
  const statePath = path.join(knowledgeRoot, sourceId, STATE_FILE);
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

/** Remove markdown files no longer present in the latest url→path map. */
export function cleanupStaleFiles(
  knowledgeRoot: string,
  sourceId: string,
  activeRelPaths: Set<string>,
): number {
  const root = path.join(knowledgeRoot, sourceId);
  if (!existsSync(root)) return 0;

  let removed = 0;
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith(".md")) continue;
      const rel = path.relative(root, full).replace(/\\/g, "/");
      if (!activeRelPaths.has(rel)) {
        rmSync(full);
        removed += 1;
      }
    }
  };
  walk(root);
  return removed;
}

function sourcesManifestPath(repoRoot: string): string {
  return path.join(repoRoot, "config", "knowledge.sources.json");
}

/**
 * Add or update a glob source entry in knowledge.sources.json.
 *
 * @returns true when the manifest was changed.
 */
export function registerSourceInManifest(
  repoRoot: string,
  sourceId: string,
  sourceType: Provenance["source_type"] = "external_manual",
): boolean {
  const manifestPath = sourcesManifestPath(repoRoot);
  const manifest = loadSourcesManifest(manifestPath);
  const globPath = `${sourceId}/**/*.md`;
  const existing = manifest.sources.find((s) => s.id === sourceId);

  if (existing) {
    const paths = new Set(existing.paths);
    if (paths.has(globPath) && existing.source_type === sourceType && existing.enabled !== false) {
      return false;
    }
    existing.paths = [...new Set([...existing.paths, globPath])];
    existing.source_type = sourceType;
    existing.enabled = true;
  } else {
    const entry: SourceDefinition = {
      id: sourceId,
      type: "glob",
      paths: [globPath],
      source_type: sourceType,
      enabled: true,
    };
    manifest.sources.push(entry);
  }

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return true;
}

export function validateSourceId(sourceId: string): void {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(sourceId)) {
    throw new Error(
      `Invalid source-id "${sourceId}" — use lowercase letters, numbers, and hyphens`,
    );
  }
}

export function listMdFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".md") && statSync(full).isFile()) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out;
}
