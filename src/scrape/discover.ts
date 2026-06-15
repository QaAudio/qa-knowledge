import type { ScrapeScope } from "./types.js";
import { extractLinksFromHtml } from "./html.js";
import { isInScope, isPdfUrl, normalizePageUrl, parseTargetUrl, shouldSkipUrl } from "./policy.js";

const USER_AGENT = "qa-knowledge-scrape/0.1 (+https://github.com/QaAudio/qa-knowledge)";

export type DiscoverContext = {
  startUrl: URL;
  scope: ScrapeScope;
  maxPages: number;
  robotsDisallow: string[];
  fetchText: (url: string) => Promise<string>;
};

/** Parse sitemap XML and return loc URLs. */
export function parseSitemapXml(xml: string): string[] {
  const urls: string[] = [];
  const locRe = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = locRe.exec(xml)) !== null) {
    urls.push(match[1]!);
  }
  return urls;
}

function isAllowedPath(pathname: string, robotsDisallow: string[]): boolean {
  for (const rule of robotsDisallow) {
    if (rule === "/") return false;
    if (pathname.startsWith(rule)) return false;
  }
  return true;
}

function enqueue(
  queue: string[],
  seen: Set<string>,
  raw: string,
  ctx: DiscoverContext,
): void {
  if (seen.size >= ctx.maxPages) return;
  let parsed: URL;
  try {
    parsed = parseTargetUrl(raw);
  } catch {
    return;
  }
  if (!isInScope(parsed, ctx.startUrl, ctx.scope)) return;
  if (!isAllowedPath(parsed.pathname, ctx.robotsDisallow)) return;
  const normalized = normalizePageUrl(parsed);
  if (seen.has(normalized)) return;
  seen.add(normalized);
  queue.push(normalized);
}

/**
 * Discover crawl URLs via sitemap and/or BFS link extraction.
 *
 * @example
 * const urls = await discoverUrls({ startUrl, scope: 'path-prefix', maxPages: 50, ... });
 */
export async function discoverUrls(ctx: DiscoverContext): Promise<string[]> {
  const seen = new Set<string>();
  const queue: string[] = [];
  enqueue(queue, seen, ctx.startUrl.href, ctx);

  if (ctx.scope === "sitemap") {
    const sitemapUrl = new URL("/sitemap.xml", ctx.startUrl.origin).href;
    try {
      const xml = await ctx.fetchText(sitemapUrl);
      for (const loc of parseSitemapXml(xml)) {
        enqueue(queue, seen, loc, ctx);
        if (seen.size >= ctx.maxPages) break;
      }
    } catch {
      /* fall through to BFS */
    }
  }

  const ordered: string[] = [];
  const visited = new Set<string>();

  while (queue.length > 0 && ordered.length < ctx.maxPages) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    ordered.push(current);

    let currentUrl: URL;
    try {
      currentUrl = parseTargetUrl(current);
    } catch {
      continue;
    }

    if (isPdfUrl(currentUrl) || shouldSkipUrl(currentUrl)) continue;

    let html: string;
    try {
      html = await ctx.fetchText(current);
    } catch {
      continue;
    }

    for (const link of extractLinksFromHtml(html, currentUrl)) {
      enqueue(queue, seen, link, ctx);
      if (seen.size >= ctx.maxPages) break;
    }
  }

  return ordered.slice(0, ctx.maxPages);
}

export { USER_AGENT };
