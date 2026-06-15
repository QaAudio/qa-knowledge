import type { ScrapeScope } from "./types.js";

const DEFAULT_MAX_PAGES = 200;
const HARD_MAX_PAGES = 2000;

const PRIVATE_IPV4 =
  /^(?:10\.|127\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|0\.)/;

const SKIP_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".webp",
  ".ico",
  ".css",
  ".js",
  ".mjs",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".zip",
  ".tar",
  ".gz",
  ".mp4",
  ".mp3",
  ".wav",
  ".xml",
]);

export function clampMaxPages(maxPages?: number): number {
  const value = maxPages ?? DEFAULT_MAX_PAGES;
  return Math.min(Math.max(1, value), HARD_MAX_PAGES);
}

/** Parse and validate a scrape target URL. */
export function parseTargetUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid URL: ${raw}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Only http(s) URLs are allowed: ${raw}`);
  }
  assertPublicHost(parsed);
  return parsed;
}

function assertPublicHost(url: URL): void {
  if (process.env.QA_DEV === "1") return;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error(`Localhost URLs require QA_DEV=1: ${url.href}`);
  }
  if (PRIVATE_IPV4.test(host)) {
    throw new Error(`Private network URLs require QA_DEV=1: ${url.href}`);
  }
  if (host.includes(":")) {
    throw new Error(`IPv6 URLs are not supported: ${url.href}`);
  }
}

/** Normalize URL for deduplication (strip hash, trailing slash on path). */
export function normalizePageUrl(url: URL): string {
  const copy = new URL(url.href);
  copy.hash = "";
  if (copy.pathname !== "/" && copy.pathname.endsWith("/")) {
    copy.pathname = copy.pathname.slice(0, -1);
  }
  return copy.href;
}

export function isPdfUrl(url: URL): boolean {
  return url.pathname.toLowerCase().endsWith(".pdf");
}

export function shouldSkipUrl(url: URL): boolean {
  const lower = url.pathname.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return false;
  return SKIP_EXTENSIONS.has(lower.slice(dot));
}

/** Whether `candidate` is within the crawl scope relative to `start`. */
export function isInScope(candidate: URL, start: URL, scope: ScrapeScope): boolean {
  if (candidate.protocol !== start.protocol) return false;
  if (candidate.hostname !== start.hostname) return false;
  if (shouldSkipUrl(candidate)) return false;

  if (scope === "host" || scope === "sitemap") {
    return true;
  }

  const prefix = start.pathname === "/" ? "/" : start.pathname.replace(/\/$/, "");
  if (prefix === "/") return true;
  return candidate.pathname === prefix || candidate.pathname.startsWith(`${prefix}/`);
}

type RobotsRules = {
  disallow: string[];
};

/** Minimal robots.txt parser for User-agent: * rules. */
export function parseRobotsTxt(text: string): RobotsRules {
  const lines = text.split(/\r?\n/);
  const disallow: string[] = [];
  let inWildcard = false;

  for (const raw of lines) {
    const line = raw.split("#")[0]!.trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (key === "user-agent") {
      inWildcard = value === "*";
      continue;
    }
    if (inWildcard && key === "disallow" && value) {
      disallow.push(value);
    }
  }

  return { disallow };
}

export function isAllowedByRobots(pathname: string, rules: RobotsRules): boolean {
  if (rules.disallow.length === 0) return true;
  for (const rule of rules.disallow) {
    if (rule === "/") return false;
    if (pathname.startsWith(rule)) return false;
  }
  return true;
}

export function defaultScopeForUrl(start: URL): ScrapeScope {
  return "path-prefix";
}
