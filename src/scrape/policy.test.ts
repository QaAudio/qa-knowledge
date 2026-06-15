import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampMaxPages,
  isAllowedByRobots,
  isInScope,
  normalizePageUrl,
  parseRobotsTxt,
  parseTargetUrl,
} from "./policy.js";

describe("scrape policy", () => {
  it("parses http URLs", () => {
    const url = parseTargetUrl("https://docs.example.com/plugins/");
    assert.equal(url.hostname, "docs.example.com");
  });

  it("rejects file URLs", () => {
    assert.throws(() => parseTargetUrl("file:///etc/passwd"));
  });

  it("normalizes trailing slashes and hashes", () => {
    const a = parseTargetUrl("https://docs.example.com/page/#section");
    const b = parseTargetUrl("https://docs.example.com/page");
    assert.equal(normalizePageUrl(a), normalizePageUrl(b));
  });

  it("enforces path-prefix scope", () => {
    const start = parseTargetUrl("https://docs.example.com/plugins/");
    const inScope = parseTargetUrl("https://docs.example.com/plugins/eq-three");
    const outScope = parseTargetUrl("https://docs.example.com/blog/post");
    assert.equal(isInScope(inScope, start, "path-prefix"), true);
    assert.equal(isInScope(outScope, start, "path-prefix"), false);
  });

  it("allows host scope on same host", () => {
    const start = parseTargetUrl("https://docs.example.com/plugins/");
    const other = parseTargetUrl("https://docs.example.com/blog/post");
    assert.equal(isInScope(other, start, "host"), true);
  });

  it("clamps max pages", () => {
    assert.equal(clampMaxPages(), 200);
    assert.equal(clampMaxPages(5000), 2000);
    assert.equal(clampMaxPages(10), 10);
  });

  it("parses robots disallow rules", () => {
    const rules = parseRobotsTxt(`User-agent: *\nDisallow: /private/\n`);
    assert.equal(isAllowedByRobots("/public/page", rules), true);
    assert.equal(isAllowedByRobots("/private/secret", rules), false);
  });
});
