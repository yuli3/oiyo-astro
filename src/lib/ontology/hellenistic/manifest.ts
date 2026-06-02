import { THEME_COLORS } from "@/lib/system/theme";

import { DomainManifest } from "../manifest-types";

export const hellenisticManifest: DomainManifest = {
  component: {
    display: "HellenisticCard",
    path: "ucl/cards/HellenisticCard.tsx",
  },
  correlationWeights: {
    baseWeight: 0.6,
    synergyPairs: {
      vedic: 0.4,
      western: 0.8,
    },
  },
  i18nNamespace: "ontology.hellenistic",
  id: "hellenistic",
  styling: {
    auraColor: "#DAA520", // GoldenRod - classical gold
    frequency: 1.2,
    icon: "Citadel", // Classic Greek architecture vibe
  },
  version: "1.0.0",
};
