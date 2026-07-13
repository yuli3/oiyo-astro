import type { AssessmentLocale, EvidenceTier } from "./common";
import type { CanonicalAssessmentResult } from "./result";

export type InterpretationScope =
  | "action"
  | "configuration"
  | "cross-assessment"
  | "dimension";

export interface InterpretationFragment {
  actionKeys?: string[];
  bodyKey: string;
  caveatKey?: string;
  evidenceTier: EvidenceTier;
  id: string;
  priority: number;
  scope: InterpretationScope;
  sourceRefs: string[];
  titleKey: string;
}

export interface InterpretationContext {
  locale: AssessmentLocale;
  relatedResults?: CanonicalAssessmentResult[];
}

export interface InterpretationComposer {
  compose(
    result: CanonicalAssessmentResult,
    context: InterpretationContext,
  ): InterpretationFragment[];
  version: string;
}
