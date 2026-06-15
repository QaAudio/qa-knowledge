import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { registerSourceInManifest, urlToMdPath, validateSourceId } from "./write.js";

describe("scrape write", () => {
  it("maps URLs to markdown paths", () => {
    const start = new URL("https://docs.example.com/plugins/");
    const page = new URL("https://docs.example.com/plugins/eq-three.html");
    assert.equal(urlToMdPath(page, start, "example"), "eq-three.md");
  });

  it("maps root URL to index.md", () => {
    const start = new URL("https://docs.example.com/");
    const page = new URL("https://docs.example.com/");
    assert.equal(urlToMdPath(page, start, "example"), "index.md");
  });

  it("maps PDF URLs under pdfs/", () => {
    const start = new URL("https://docs.example.com/manual.pdf");
    const page = new URL("https://docs.example.com/manual.pdf");
    assert.equal(urlToMdPath(page, start, "example"), "pdfs/manual.md");
  });

  it("validates source ids", () => {
    assert.doesNotThrow(() => validateSourceId("fabfilter-plugins"));
    assert.throws(() => validateSourceId("Bad_ID"));
  });

  it("registers a new source in manifest", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "qa-scrape-"));
    const configDir = path.join(dir, "config");
    const manifestPath = path.join(configDir, "knowledge.sources.json");
    mkdirSync(configDir, { recursive: true });
    writeFileSync(
      manifestPath,
      JSON.stringify({ sources: [{ id: "skills", type: "glob", paths: ["skills/**/*.md"], enabled: true }] }),
    );

    const changed = registerSourceInManifest(dir, "vendor-docs");
    assert.equal(changed, true);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { sources: { id: string }[] };
    assert.ok(manifest.sources.some((s) => s.id === "vendor-docs"));
    rmSync(dir, { recursive: true, force: true });
  });
});
