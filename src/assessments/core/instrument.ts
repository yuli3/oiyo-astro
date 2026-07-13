import type { AssessmentResponses, PrimitiveAnswer } from "./common";

export type ResponseScaleKind =
  | "boolean"
  | "likert"
  | "multi-select"
  | "numeric"
  | "single-select";

export interface ResponseOption {
  labelKey: string;
  value: PrimitiveAnswer;
}

export interface ResponseScale {
  id: string;
  kind: ResponseScaleKind;
  max?: number;
  min?: number;
  options?: ResponseOption[];
}

export interface AssessmentItem {
  constructId: string;
  id: string;
  promptKey: string;
  required: boolean;
  responseScaleId: string;
  reverse?: boolean;
  sourceRef?: string;
  weight?: number;
}

export interface InstrumentDefinition {
  items: AssessmentItem[];
  responseScales: ResponseScale[];
  version: string;
}

export interface ResponseValidation {
  complete: boolean;
  errors: string[];
  responses: AssessmentResponses;
  warnings: string[];
}
