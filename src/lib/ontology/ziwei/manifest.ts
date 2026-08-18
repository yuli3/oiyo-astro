import { THEME_COLORS } from "@/lib/system/theme";

import type { DomainManifest } from "../manifest-types";

export const ziweiManifest: DomainManifest = {
  component: {
    display: "ZiWeiExplorer",
    path: "ucl/displays/ZiWeiExplorer.tsx",
  },
  correlationWeights: {
    baseWeight: 0.6,
    synergyPairs: {
      hellenistic: 0.3,
      saju: 0.2,
    },
  },
  i18nNamespace: "ontology.ziwei",
  id: "ziwei",
  styling: {
    auraColor: THEME_COLORS.chart[7], // categorical series, was indigo
    frequency: 1.2,
  },
  version: "1.0.0",
};
