import type { AssessmentLocale } from "./common";

export type LocaleReviewStatus = "draft" | "reviewed" | "translated";

export interface AssessmentLocaleContent {
  description: string;
  disclaimer: string;
  name: string;
  seoDescription: string;
  seoTitle: string;
  strings: Record<string, string>;
}

export type AssessmentLocaleBundle = Record<
  AssessmentLocale,
  {
    content: AssessmentLocaleContent;
    status: LocaleReviewStatus;
  }
>;
