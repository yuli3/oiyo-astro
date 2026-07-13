import type { CanonicalAssessmentResult } from "./result";

export interface ResultMigration<TInput = unknown> {
  fromSchemaVersion: number;
  migrate(input: TInput): CanonicalAssessmentResult | null;
  toSchemaVersion: 2;
}
