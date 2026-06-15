#!/usr/bin/env node
/**
 * Scrape online documentation into docs/knowledge/ (no indexing).
 *
 * Usage: qa-knowledge-scrape --url <url> --source-id <id> [options]
 */
import { runScrape, type ScrapeProgress } from "./run.js";
import type { ScrapeScope } from "./types.js";

function printHelp(): void {
  console.log(`Usage: qa-knowledge-scrape --url <url> --source-id <id> [options]

Options:
  --url <url>           Starting URL (required)
  --source-id <id>      Corpus folder name under docs/knowledge/ (required)
  --scope <mode>        path-prefix | host | sitemap (default: path-prefix)
  --max-pages <n>       Max pages to fetch (default: 200, max: 2000)
  --render <mode>       auto | fetch | playwright (default: auto)
  --no-register         Do not patch config/knowledge.sources.json
  --dry-run             Discover URLs only; do not write files
  --delay-ms <n>        Delay between requests in ms (default: 500)
  -h, --help            Show this help
`);
}

function parseArgs(argv: string[]) {
  let startUrl = "";
  let sourceId = "";
  let scope: ScrapeScope | undefined;
  let maxPages: number | undefined;
  let render: "auto" | "fetch" | "playwright" | undefined;
  let registerSource = true;
  let dryRun = false;
  let requestDelayMs: number | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--url" && argv[i + 1]) {
      startUrl = argv[++i]!;
    } else if (arg === "--source-id" && argv[i + 1]) {
      sourceId = argv[++i]!;
    } else if (arg === "--scope" && argv[i + 1]) {
      scope = argv[++i] as ScrapeScope;
    } else if (arg === "--max-pages" && argv[i + 1]) {
      maxPages = Number(argv[++i]);
    } else if (arg === "--render" && argv[i + 1]) {
      render = argv[++i] as "auto" | "fetch" | "playwright";
    } else if (arg === "--no-register") {
      registerSource = false;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--delay-ms" && argv[i + 1]) {
      requestDelayMs = Number(argv[++i]);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      printHelp();
      process.exit(1);
    }
  }

  if (!startUrl || !sourceId) {
    console.error("Error: --url and --source-id are required\n");
    printHelp();
    process.exit(1);
  }

  return { startUrl, sourceId, scope, maxPages, render, registerSource, dryRun, requestDelayMs };
}

function formatProgress(p: ScrapeProgress): string {
  const parts = [
    `[scrape] ${p.status}`,
    `discovered=${p.pages_discovered}`,
    `fetched=${p.pages_fetched}`,
    `written=${p.pages_written}`,
    `failed=${p.pages_failed}`,
  ];
  if (p.current_url) parts.push(`url=${p.current_url}`);
  return parts.join(" ");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const controller = new AbortController();
  process.on("SIGINT", () => controller.abort(new Error("Interrupted")));

  const result = await runScrape({
    ...args,
    signal: controller.signal,
    onProgress: (p) => console.error(formatProgress(p)),
  });

  console.error(
    `[scrape] done: ${result.pages_written} written, ${result.pages_failed} failed → ${result.output_dir}`,
  );
  if (result.registered) {
    console.error(`[scrape] registered source "${result.source_id}" in knowledge.sources.json`);
  }
  if (result.dry_run) {
    console.error("[scrape] dry-run — no files written");
  }
}

main().catch((err) => {
  console.error("[scrape] fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
