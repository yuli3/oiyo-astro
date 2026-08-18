export type ExportFormat =
  | "csv"
  | "json"
  | "markdown"
  | "permalink"
  | "png";

export interface ExportPolicy {
  allowedFormats: ExportFormat[];
  includeResponsesByDefault: boolean;
  permalinkConstructs?: string[];
  sensitiveConstructs: string[];
}
