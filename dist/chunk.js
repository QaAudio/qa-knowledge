import { makeChunkId, sha256 } from "./hash.js";
const MAX_CHUNK_CHARS = 1800;
const MIN_CHUNK_CHARS = 200;
const OVERLAP_CHARS = 80;
/** Split markdown or SDK types into retrieval-sized chunks with heading + provenance metadata. */
export function chunkDocument(input) {
    const sections = input.isSdkDts ? splitSdkDts(input.text) : splitMarkdown(input.text);
    const indexedAt = new Date().toISOString();
    const provenance = input.provenance ?? {};
    const chunks = [];
    for (let i = 0; i < sections.length; i += 1) {
        const section = sections[i];
        const content = section.body.trim();
        if (content.length < 40)
            continue;
        const parts = content.length > MAX_CHUNK_CHARS ? splitWithOverlap(content) : [content];
        for (let j = 0; j < parts.length; j += 1) {
            const part = parts[j];
            const contentHash = sha256(part);
            const chunkIndex = chunks.length;
            chunks.push({
                chunk_id: makeChunkId(input.sourceId, chunkIndex, contentHash),
                source_id: input.sourceId,
                source_type: input.sourceType,
                title: section.title || input.title,
                heading_path: section.headingPath,
                skill_name: input.skillName,
                chunk_index: chunkIndex,
                content: part,
                content_hash: contentHash,
                indexed_at: indexedAt,
                license: provenance.license,
                origin: provenance.origin,
                source: provenance.source,
                source_url: provenance.source_url,
                generated_by: provenance.generated_by,
                generated_at: provenance.generated_at,
            });
        }
    }
    return chunks;
}
function splitMarkdown(text) {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const sections = [];
    let currentTitle = "";
    let currentPath = [];
    let buffer = [];
    function flush() {
        const body = buffer.join("\n").trim();
        if (body) {
            sections.push({
                title: currentTitle || "Document",
                headingPath: currentPath.length > 0 ? currentPath.join(" > ") : undefined,
                body,
            });
        }
        buffer = [];
    }
    for (const line of lines) {
        const h3 = line.match(/^###\s+(.+)/);
        const h2 = line.match(/^##\s+(.+)/);
        const h1 = line.match(/^#\s+(.+)/);
        if (h1 || h2 || h3) {
            flush();
            const label = (h1?.[1] ?? h2?.[1] ?? h3?.[1] ?? "").trim();
            if (h1)
                currentPath = [label];
            else if (h2)
                currentPath = [currentPath[0] ?? "", label].filter(Boolean);
            else if (h3)
                currentPath = [...currentPath.slice(0, 2), label].filter(Boolean);
            currentTitle = label;
            buffer.push(line);
            continue;
        }
        buffer.push(line);
    }
    flush();
    if (sections.length === 0) {
        return [{ title: "Document", body: text }];
    }
    return sections;
}
function splitSdkDts(text) {
    const sections = [];
    const blocks = text.split(/(?=^export (?:declare )?(?:class|interface|type|enum|function|const|namespace)\s)/m);
    for (const block of blocks) {
        const trimmed = block.trim();
        if (trimmed.length < 40)
            continue;
        const nameMatch = trimmed.match(/^export (?:declare )?(?:class|interface|type|enum|function|const|namespace)\s+(\w+)/m);
        const title = nameMatch?.[1] ?? "SDK";
        sections.push({ title, headingPath: title, body: trimmed });
    }
    if (sections.length === 0) {
        return [{ title: "SDK", body: text }];
    }
    return sections;
}
function splitWithOverlap(text) {
    const parts = [];
    let start = 0;
    while (start < text.length) {
        let end = Math.min(start + MAX_CHUNK_CHARS, text.length);
        if (end < text.length) {
            const breakAt = text.lastIndexOf("\n\n", end);
            if (breakAt > start + MIN_CHUNK_CHARS)
                end = breakAt;
        }
        parts.push(text.slice(start, end).trim());
        if (end >= text.length)
            break;
        start = Math.max(end - OVERLAP_CHARS, start + MIN_CHUNK_CHARS);
    }
    return parts.filter((p) => p.length >= 40);
}
