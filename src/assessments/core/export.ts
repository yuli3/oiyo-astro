export type ExportFormat =
  | "csv"
  | "json"
  | "markdown"
  | "permalink"
  | "png"
  | "soul";

export interface ExportPolicy {
  allowedFormats: ExportFormat[];
  includeResponsesByDefault: boolean;
  permalinkConstructs?: string[];
  sensitiveConstructs: string[];
}
