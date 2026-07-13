import type {
  AssessmentKind,
  AssessmentStatus,
  EvidenceTier,
} from "./common";

export interface AssessmentRouteBridge {
  blog?: string;
  execution: string;
  wiki?: string;
}

export interface AssessmentManifest {
  analyticsId: string;
  category: string;
  clinical: boolean;
  evidenceTier: EvidenceTier;
  estimatedMinutes: number;
  id: string;
  indexable: boolean;
  kind: AssessmentKind;
  routes: AssessmentRouteBridge;
  status: AssessmentStatus;
  tags: string[];
}
