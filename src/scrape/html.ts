import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import type { ExtractedPage } from "./types.js";

const CONTENT_SELECTORS = [".sl-markdown-content", ".col-content", "main", "article", "[role='main']"];

const STRIP_SELECTORS = [
  "script",
  "style",
  "svg",
  ".tsd-breadcrumb",
  ".tsd-anchor-icon",
  ".tsd-toolbar-contents",
  ".tsd-page-navigation",
  ".tsd-index-panel",
  ".col-sidebar",
  "nav",
  "footer",
  ".copy",
  ".sl-heading-wrapper a.sl-anchor-link",
];

let turndown: TurndownService | undefined;

function createTurndown(): TurndownService {
  if (turndown) return turndown;
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });
  td.use(gfm);
  td.addRule("removeWbr", {
    filter: (node) => node.nodeName === "WBR",
    replacement: () => "",
  });
  turndown = td;
  return td;
}

function pageTitle(document: Document): string {
  return (document.querySelector("title")?.textContent ?? "")
    .split("|")[0]!
    .trim();
}

function normalizeCodeBlocks(document: Document, root: Element): void {
  root.querySelectorAll("pre").forEach((pre) => {
    const lineEls = pre.querySelectorAll(".ec-line, .line");
    const code =
      lineEls.length > 0
        ? Array.from(lineEls).map((el) => el.textContent ?? "").join("\n")
        : (pre.textContent ?? "");

    const lang =
      pre.getAttribute("data-language") ??
      pre.closest("figure,[data-language]")?.getAttribute("data-language") ??
      "";

    const codeEl = document.createElement("code");
    if (lang) codeEl.className = `language-${lang}`;
    codeEl.textContent = code.replace(/\n+$/, "");
    pre.replaceChildren(codeEl);
  });
}

/** Rewrite relative doc links from .html to .md where applicable. */
export function rewriteInternalLinks(root: Element, baseUrl?: string): void {
  root.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("//")) return;
    if (/^[a-z]+:/i.test(href)) {
      if (baseUrl) {
        try {
          const resolved = new URL(href, baseUrl);
          if (resolved.pathname.endsWith(".html")) {
            a.setAttribute("href", resolved.pathname.replace(/\.html$/, ".md"));
          }
        } catch {
          /* keep original */
        }
      }
      return;
    }
    a.setAttribute("href", href.replace(/\.html(?=$|#|\?)/, ".md"));
  });
}

function extractWithSelectors(document: Document): Element | null {
  for (const selector of CONTENT_SELECTORS) {
    const node = document.querySelector(selector);
    if (node) return node;
  }
  return null;
}

function extractWithReadability(document: Document, pageUrl?: string): Element | null {
  const article = new Readability(document, { charThreshold: 80 }).parse();
  if (!article?.content) return null;
  const wrapper = document.createElement("div");
  wrapper.innerHTML = article.content;
  if (article.title && !document.querySelector("title")) {
    const title = document.createElement("title");
    title.textContent = article.title;
    document.head.appendChild(title);
  }
  void pageUrl;
  return wrapper;
}

function withTitleHeading(title: string, markdown: string): string {
  if (/^#\s/.test(markdown) || !title) return markdown;
  return `# ${title}\n\n${markdown}`;
}

/**
 * Extract main content from HTML and convert to markdown.
 *
 * @example
 * const page = extractHtmlContent('<html>…</html>', 'https://docs.example.com/page');
 */
export function extractHtmlContent(html: string, pageUrl?: string): ExtractedPage | null {
  const dom = new JSDOM(html, pageUrl ? { url: pageUrl } : undefined);
  const { document } = dom.window;

  let node = extractWithSelectors(document);
  if (!node) {
    node = extractWithReadability(document, pageUrl);
  }
  if (!node) return null;

  const clone = node.cloneNode(true) as Element;
  for (const selector of STRIP_SELECTORS) {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  }

  normalizeCodeBlocks(document, clone);
  rewriteInternalLinks(clone, pageUrl);

  const markdown = createTurndown().turndown(clone.innerHTML).trim();
  if (!markdown) return null;

  const title = pageTitle(document) || clone.querySelector("h1")?.textContent?.trim() || "";
  return { title, markdown: withTitleHeading(title, markdown) };
}

/** Heuristic: page body looks like an empty JS SPA shell. */
export function isSpaShell(html: string): boolean {
  const dom = new JSDOM(html);
  const body = dom.window.document.body;
  if (!body) return true;
  const text = (body.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text.length > 200) return false;
  const rootIds = ["root", "app", "__next", "__nuxt"];
  for (const id of rootIds) {
    const el = body.querySelector(`#${id}`);
    if (el && (el.textContent ?? "").trim().length < 80) return true;
  }
  return text.length < 40;
}

/** Extract same-site links from HTML for crawl discovery. */
export function extractLinksFromHtml(html: string, baseUrl: URL): string[] {
  const dom = new JSDOM(html, { url: baseUrl.href });
  const links = new Set<string>();
  dom.window.document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("javascript:")) {
      return;
    }
    try {
      const resolved = new URL(href, baseUrl.href);
      if (
        (resolved.protocol === "http:" || resolved.protocol === "https:") &&
        resolved.hostname === baseUrl.hostname
      ) {
        links.add(resolved.href);
      }
    } catch {
      /* skip invalid */
    }
  });
  return [...links];
}
