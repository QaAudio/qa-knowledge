import pdfParse from "pdf-parse";
import type { ExtractedPage } from "./types.js";

/**
 * Convert a PDF buffer to a simple markdown document.
 *
 * @example
 * const page = await pdfToMarkdown(buffer, "User Manual");
 */
export async function pdfToMarkdown(buffer: Buffer, title?: string): Promise<ExtractedPage> {
  const parsed = await pdfParse(buffer);
  const text = parsed.text.replace(/\r\n/g, "\n").trim();
  const docTitle = title || parsed.info?.Title || "PDF document";
  const body = text
    .split(/\n{2,}/)
    .map((p: string) => p.trim())
    .filter(Boolean)
    .join("\n\n");
  const markdown = body ? `# ${docTitle}\n\n${body}` : `# ${docTitle}\n\n_(no extractable text)_`;
  return { title: docTitle, markdown };
}
