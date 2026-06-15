import type { ScrapeRenderMode } from "./types.js";
import { extractHtmlContent, isSpaShell } from "./html.js";
import { pdfToMarkdown } from "./pdf.js";
import { isPdfUrl } from "./policy.js";
import { USER_AGENT } from "./discover.js";
import type { ExtractedPage } from "./types.js";

export type FetchPageResult = {
  contentType: string;
  page: ExtractedPage | null;
  usedPlaywright: boolean;
};

export type FetchPageOptions = {
  render: ScrapeRenderMode;
  signal?: AbortSignal;
};

async function fetchBuffer(url: string, signal?: AbortSignal): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(url, {
    signal,
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/pdf,*/*" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}

async function fetchHtmlWithPlaywright(url: string): Promise<string> {
  let playwright: typeof import("playwright");
  try {
    playwright = await import("playwright");
  } catch {
    throw new Error(
      "Playwright is required for JS-rendered pages. Install with: npm install playwright -w @quantumaudio/qa-knowledge",
    );
  }
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    return await page.content();
  } finally {
    await browser.close();
  }
}

/**
 * Fetch a page and extract markdown content.
 *
 * @example
 * const { page } = await fetchPage('https://docs.example.com/guide', { render: 'auto' });
 */
export async function fetchPage(url: string, options: FetchPageOptions): Promise<FetchPageResult> {
  const parsed = new URL(url);
  const { buffer, contentType } = await fetchBuffer(url, options.signal);
  const lowerType = contentType.toLowerCase();

  if (lowerType.includes("pdf") || isPdfUrl(parsed)) {
    const page = await pdfToMarkdown(buffer);
    return { contentType, page, usedPlaywright: false };
  }

  const html = buffer.toString("utf8");
  let usedPlaywright = false;
  let workingHtml = html;

  const needsPlaywright =
    options.render === "playwright" ||
    (options.render === "auto" && (isSpaShell(html) || !extractHtmlContent(html, url)));

  if (needsPlaywright) {
    if (options.render === "fetch") {
      return { contentType, page: extractHtmlContent(html, url), usedPlaywright: false };
    }
    workingHtml = await fetchHtmlWithPlaywright(url);
    usedPlaywright = true;
  }

  const page = extractHtmlContent(workingHtml, url);
  return { contentType, page, usedPlaywright };
}

/** Lightweight text fetch for discovery and robots.txt. */
export async function fetchText(url: string, signal?: AbortSignal): Promise<string> {
  const { buffer } = await fetchBuffer(url, signal);
  return buffer.toString("utf8");
}
