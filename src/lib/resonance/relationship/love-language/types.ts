export interface LoveLanguageQuestion {
  id: string;
  pair: [LoveLanguageType, LoveLanguageType];
  texts: {
    [key in LoveLanguageType]?: LocalizedText;
  };
}

import type { LocalizedText } from "@/types/manifest";

export interface LoveLanguageResult {
  primary: LoveLanguageType;
  scores: Record<LoveLanguageType, number>;
  secondary: LoveLanguageType;
  timestamp: number;
}

export type LoveLanguageType = "acts" | "gifts" | "time" | "touch" | "words";
