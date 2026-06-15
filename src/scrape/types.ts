import type { Provenance } from "../types.js";

export type ScrapeScope = "path-prefix" | "host" | "sitemap";

export type ScrapeRenderMode = "auto" | "fetch" | "playwright";

export type ScrapeStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type ScrapeOptions = {
  /** Starting URL to scrape. */
  startUrl: string;
  /** Corpus folder name under docs/knowledge/. */
  sourceId: string;
  /** Crawl boundary; defaults to path-prefix from startUrl pathname. */
  scope?: ScrapeScope;
  /** Maximum pages to fetch; default 200, hard cap 2000. */
  maxPages?: number;
  /** How to render pages; default auto. */
  render?: ScrapeRenderMode;
  /** Patch knowledge.sources.json when true (default). */
  registerSource?: boolean;
  /** Merged into the source folder .qa-meta.json. */
  provenance?: Partial<Provenance>;
  /** Corpus root; defaults to defaultKnowledgeRoot(repoRoot). */
  knowledgeRoot?: string;
  /** Repo root for manifest resolution; defaults to defaultRepoRoot(). */
  repoRoot?: string;
  /** Milliseconds between HTTP requests; default 500. */
  requestDelayMs?: number;
  /** Discover URLs only; do not write files. */
  dryRun?: boolean;
};

export type ScrapeProgress = {
  job_id: string;
  status: ScrapeStatus;
  pages_discovered: number;
  pages_fetched: number;
  pages_written: number;
  pages_failed: number;
  current_url?: string;
  started_at: string;
  finished_at?: string;
  error_message?: string;
};

export type ScrapeRunOptions = ScrapeOptions & {
  signal?: AbortSignal;
  onProgress?: (progress: ScrapeProgress) => void;
};

export type ScrapeResult = {
  job_id: string;
  source_id: string;
  output_dir: string;
  pages_discovered: number;
  pages_fetched: number;
  pages_written: number;
  pages_failed: number;
  dry_run: boolean;
  registered: boolean;
};

/** URL → relative markdown path map persisted between runs. */
export type ScrapeState = {
  version: 1;
  source_id: string;
  start_url: string;
  scraped_at: string;
  url_to_path: Record<string, string>;
};

export type ExtractedPage = {
  title: string;
  markdown: string;
};
