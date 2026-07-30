import { THEME_COLORS } from "@/lib/system/theme";

import type { DomainManifest } from "../manifest-types";

export const sajuManifest: DomainManifest = {
  component: {
    display: "SajuResultDisplay",
    path: "ontology/saju/SajuResultDisplay.tsx",
  },
  correlationWeights: {
    baseWeight: 0.9,
    synergyPairs: {
      mbti: 0.6,
      tci: 0.4,
    },
  },
  i18nNamespace: "ontology.saju",
  id: "saju",
  styling: {
    auraColor: THEME_COLORS.warning, // Gold/Amber
    frequency: 1.2,
    icon: "Sun",
  },
  version: "1.0.0",
};
