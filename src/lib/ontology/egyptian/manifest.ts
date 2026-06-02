import { THEME_COLORS } from "@/lib/system/theme";

import { DomainManifest } from "../manifest-types";

export const egyptianManifest: DomainManifest = {
  component: {
    display: "EgyptianDisplay",
    path: "ucl/displays/AncientCoordinateCard.tsx",
  },
  correlationWeights: {
    baseWeight: 0.5,
    synergyPairs: {
      hellenistic: 0.2,
      vedic: 0.4,
    },
  },
  i18nNamespace: "ontology.egyptian",
  id: "egyptian",
  styling: {
    auraColor: THEME_COLORS.warning, // Amber
    frequency: 0.8,
  },
  version: "1.0.0",
};
