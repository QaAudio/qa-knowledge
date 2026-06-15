declare module "turndown-plugin-gfm" {
  import type TurndownService from "turndown";
  export function gfm(service: TurndownService): void;
}

declare module "pdf-parse" {
  type PdfInfo = {
    Title?: string;
  };

  type PdfParseResult = {
    text: string;
    info?: PdfInfo;
  };

  export default function pdfParse(buffer: Buffer): Promise<PdfParseResult>;
}
