export type SourceKind =
  | "clinical-guideline"
  | "critique"
  | "norm-study"
  | "original-theory"
  | "translation-study"
  | "validation-study";

export interface SourceRecord {
  accessedAt: string;
  citation: string;
  doi?: string;
  id: string;
  kind: SourceKind;
  population?: string;
  reviewedAt: string;
  url?: string;
}

export interface SourceBundle {
  itemRefs: string[];
  license: {
    note: string;
    status: "licensed" | "original" | "permission" | "public-domain";
  };
  normRefs: string[];
  records: SourceRecord[];
  reviewer?: string;
  scoringRefs: string[];
  theoryRefs: string[];
}
