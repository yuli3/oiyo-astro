import { THEME_COLORS } from "@/lib/system/theme";

import { DomainManifest } from "../manifest-types";

export const mayanManifest: DomainManifest = {
  component: {
    display: "MayanCard",
    path: "ucl/cards/MayanCard.tsx",
  },
  correlationWeights: {
    baseWeight: 0.7,
    synergyPairs: {
      celtic: 0.3,
      tci: 0.5,
    },
  },
  i18nNamespace: "ontology.mayan",
  id: "mayan",
  styling: {
    auraColor: THEME_COLORS.success, // Emerald
    frequency: 1.5,
  },
  version: "1.0.0",
};
