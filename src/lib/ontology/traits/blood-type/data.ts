import { THEME_COLORS } from "@/lib/system/theme";

import type { BloodType, BloodTypePersonality } from "./types";

export const BLOOD_TYPE_DATA: Record<BloodType, BloodTypePersonality> = {
  A: {
    color: THEME_COLORS.info,
    compatibility: {
      best: ["AB"],
      challenging: ["B"],
      good: ["A", "O"],
    },
    percentage: 34.4,
    type: "A",
  },
  AB: {
    color: THEME_COLORS.primary,
    compatibility: {
      best: ["AB"],
      challenging: ["O"],
      good: ["A", "B"],
    },
    percentage: 11.2,
    type: "AB",
  },
  B: {
    color: THEME_COLORS.danger,
    compatibility: {
      best: ["AB"],
      challenging: ["A"],
      good: ["B", "O"],
    },
    percentage: 27.4,
    type: "B",
  },
  O: {
    color: THEME_COLORS.warning,
    compatibility: {
      best: ["O"],
      challenging: ["AB"],
      good: ["A", "B"],
    },
    percentage: 27.0,
    type: "O",
  },
};
