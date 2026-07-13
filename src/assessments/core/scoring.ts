import type { AssessmentResponses } from "./common";
import type { InstrumentDefinition, ResponseValidation } from "./instrument";

export interface ScoreSet {
  normalized: Record<string, number>;
  percentile?: Record<string, number>;
  raw: Record<string, number>;
}

export interface ScoringContext {
  instrument: InstrumentDefinition;
  normSetId?: string;
}

export interface AssessmentScorer {
  score(responses: AssessmentResponses, context: ScoringContext): ScoreSet;
  validateResponses(
    responses: AssessmentResponses,
    instrument: InstrumentDefinition,
  ): ResponseValidation;
  version: string;
}
