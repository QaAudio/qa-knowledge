import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractHtmlContent, extractLinksFromHtml, isSpaShell } from "./html.js";

const sampleHtml = `<!DOCTYPE html>
<html>
  <head><title>EQ Three | Example Docs</title></head>
  <body>
    <nav>skip me</nav>
    <main class="sl-markdown-content">
      <h1>EQ Three</h1>
      <p>Three-band equalizer plugin.</p>
      <a href="/plugins/compressor.html">Compressor</a>
      <a href="https://other.example.com/nope">External</a>
    </main>
  </body>
</html>`;

describe("scrape html", () => {
  it("extracts main content to markdown", () => {
    const page = extractHtmlContent(sampleHtml, "https://docs.example.com/plugins/eq-three.html");
    assert.ok(page);
    assert.match(page!.markdown, /# EQ Three/);
    assert.match(page!.markdown, /Three-band equalizer/);
    assert.doesNotMatch(page!.markdown, /skip me/);
  });

  it("rewrites internal html links to md", () => {
    const page = extractHtmlContent(sampleHtml, "https://docs.example.com/plugins/eq-three.html");
    assert.match(page!.markdown, /compressor\.md/);
  });

  it("extracts same-site links", () => {
    const base = new URL("https://docs.example.com/plugins/eq-three.html");
    const links = extractLinksFromHtml(sampleHtml, base);
    assert.ok(links.some((l) => l.includes("/plugins/compressor")));
    assert.ok(!links.some((l) => l.includes("other.example.com")));
  });

  it("detects SPA shell", () => {
    const shell = "<html><body><div id='root'></div></body></html>";
    assert.equal(isSpaShell(shell), true);
    assert.equal(isSpaShell(sampleHtml), false);
  });
});
