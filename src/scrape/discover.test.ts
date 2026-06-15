import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSitemapXml } from "./discover.js";

describe("scrape discover", () => {
  it("parses sitemap loc entries", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://docs.example.com/plugins/eq</loc></url>
  <url><loc>https://docs.example.com/plugins/comp</loc></url>
</urlset>`;
    const urls = parseSitemapXml(xml);
    assert.deepEqual(urls, [
      "https://docs.example.com/plugins/eq",
      "https://docs.example.com/plugins/comp",
    ]);
  });
});
