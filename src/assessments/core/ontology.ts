import type { EvidenceTier } from "./common";
import type { CanonicalAssessmentResult } from "./result";

export type OntologySignalValue = number | string | string[];

export interface OntologySignal {
  confidence: number;
  constructId: string;
  evidenceTier: EvidenceTier;
  expiresAt?: string;
  id: string;
  observedAt: string;
  provenance: {
    instrumentVersion: string;
    resultId: string;
    scoringVersion: string;
  };
  scale?: { max: number; min: number };
  sourceAssessmentId: string;
  value: OntologySignalValue;
}

export interface OntologyNodeContribution {
  id: string;
  kind: string;
  labelKey: string;
}

export interface OntologyEdgeContribution {
  from: string;
  kind: string;
  to: string;
  weight: number;
}

export interface OntologyContribution {
  edges: OntologyEdgeContribution[];
  nodes: OntologyNodeContribution[];
  toSignals(result: CanonicalAssessmentResult): OntologySignal[];
}
