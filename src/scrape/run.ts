import { randomUUID } from "node:crypto";
import { defaultKnowledgeRoot, defaultRepoRoot } from "../config.js";
import { discoverUrls } from "./discover.js";
import { fetchPage, fetchText } from "./fetch.js";
import {
  clampMaxPages,
  defaultScopeForUrl,
  isAllowedByRobots,
  normalizePageUrl,
  parseRobotsTxt,
  parseTargetUrl,
} from "./policy.js";
import type { ScrapeProgress, ScrapeResult, ScrapeRunOptions } from "./types.js";
import {
  cleanupStaleFiles,
  registerSourceInManifest,
  saveScrapeState,
  sourceOutputDir,
  urlToMdPath,
  validateSourceId,
  writeMarkdownFile,
  writeSourceMeta,
} from "./write.js";

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error("Scrape cancelled"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new Error("Scrape cancelled"));
      },
      { once: true },
    );
  });
}

function emitProgress(
  onProgress: ScrapeRunOptions["onProgress"],
  progress: ScrapeProgress,
): void {
  onProgress?.(progress);
}

/**
 * Scrape online documentation into docs/knowledge/<sourceId>/.
 * Does not run knowledge indexing.
 *
 * @example
 * const result = await runScrape({
 *   startUrl: 'https://docs.example.com/plugins/',
 *   sourceId: 'example-plugins',
 *   onProgress: (p) => console.log(p.current_url),
 * });
 */
export async function runScrape(options: ScrapeRunOptions): Promise<ScrapeResult> {
  validateSourceId(options.sourceId);

  const repoRoot = options.repoRoot ?? defaultRepoRoot();
  const knowledgeRoot = options.knowledgeRoot ?? defaultKnowledgeRoot(repoRoot);
  const startUrl = parseTargetUrl(options.startUrl);
  const scope = options.scope ?? defaultScopeForUrl(startUrl);
  const maxPages = clampMaxPages(options.maxPages);
  const render = options.render ?? "auto";
  const registerSource = options.registerSource !== false;
  const dryRun = options.dryRun === true;
  const requestDelayMs = options.requestDelayMs ?? 500;

  const jobId = randomUUID();
  const startedAt = new Date().toISOString();

  const progress: ScrapeProgress = {
    job_id: jobId,
    status: "running",
    pages_discovered: 0,
    pages_fetched: 0,
    pages_written: 0,
    pages_failed: 0,
    started_at: startedAt,
  };
  emitProgress(options.onProgress, progress);

  if (options.signal?.aborted) {
    throw options.signal.reason ?? new Error("Scrape cancelled");
  }

  let robotsDisallow: string[] = [];
  try {
    const robotsText = await fetchText(new URL("/robots.txt", startUrl.origin).href, options.signal);
    robotsDisallow = parseRobotsTxt(robotsText).disallow;
  } catch {
    robotsDisallow = [];
  }

  if (!isAllowedByRobots(startUrl.pathname, { disallow: robotsDisallow })) {
    throw new Error(`robots.txt disallows scraping ${startUrl.pathname}`);
  }

  const urls = await discoverUrls({
    startUrl,
    scope,
    maxPages,
    robotsDisallow,
    fetchText: (url) => fetchText(url, options.signal),
  });

  progress.pages_discovered = urls.length;
  emitProgress(options.onProgress, { ...progress });

  const urlToPath: Record<string, string> = {};
  const activeRelPaths = new Set<string>();

  if (!dryRun) {
    writeSourceMeta(knowledgeRoot, options.sourceId, startUrl, options.provenance);
  }

  for (const rawUrl of urls) {
    if (options.signal?.aborted) {
      progress.status = "cancelled";
      progress.finished_at = new Date().toISOString();
      emitProgress(options.onProgress, { ...progress });
      throw options.signal.reason ?? new Error("Scrape cancelled");
    }

    const pageUrl = parseTargetUrl(rawUrl);
    const normalized = normalizePageUrl(pageUrl);
    progress.current_url = normalized;
    emitProgress(options.onProgress, { ...progress });

    if (!isAllowedByRobots(pageUrl.pathname, { disallow: robotsDisallow })) {
      progress.pages_failed += 1;
      continue;
    }

    try {
      const { page } = await fetchPage(normalized, { render, signal: options.signal });
      progress.pages_fetched += 1;

      if (!page?.markdown.trim()) {
        progress.pages_failed += 1;
        continue;
      }

      const relPath = urlToMdPath(pageUrl, startUrl, options.sourceId);
      urlToPath[normalized] = relPath;
      activeRelPaths.add(relPath);

      if (!dryRun) {
        writeMarkdownFile(knowledgeRoot, options.sourceId, relPath, page.markdown);
        progress.pages_written += 1;
      }
    } catch (err) {
      progress.pages_failed += 1;
      if (progress.pages_fetched === 0 && urls.length === 1) {
        progress.status = "failed";
        progress.error_message = err instanceof Error ? err.message : String(err);
        progress.finished_at = new Date().toISOString();
        emitProgress(options.onProgress, { ...progress });
        throw err;
      }
    }

    emitProgress(options.onProgress, { ...progress });
    if (requestDelayMs > 0) {
      await sleep(requestDelayMs, options.signal);
    }
  }

  let registered = false;
  if (!dryRun) {
    cleanupStaleFiles(knowledgeRoot, options.sourceId, activeRelPaths);
    saveScrapeState(knowledgeRoot, options.sourceId, startUrl, urlToPath);
    if (registerSource) {
      registered = registerSourceInManifest(
        repoRoot,
        options.sourceId,
        options.provenance?.source_type ?? "external_manual",
      );
    }
  }

  progress.status = "completed";
  progress.current_url = undefined;
  progress.finished_at = new Date().toISOString();
  emitProgress(options.onProgress, { ...progress });

  return {
    job_id: jobId,
    source_id: options.sourceId,
    output_dir: sourceOutputDir(knowledgeRoot, options.sourceId),
    pages_discovered: progress.pages_discovered,
    pages_fetched: progress.pages_fetched,
    pages_written: progress.pages_written,
    pages_failed: progress.pages_failed,
    dry_run: dryRun,
    registered,
  };
}

export type { ScrapeOptions, ScrapeProgress, ScrapeResult, ScrapeRunOptions } from "./types.js";
