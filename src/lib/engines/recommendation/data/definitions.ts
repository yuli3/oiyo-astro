import { RecommendationCategory } from "../contracts";

export interface RecommendationDefinition {
  category: RecommendationCategory;
  icon: string;
  id: string;
  reasoning: {
    primarySource: string;
    secondarySource?: string;
  };
  /**
   * Weights to apply to scoring.
   * If a profile matches these criteria, the score increases.
   * See `../scoring.ts` (`computeMatchScore`) for how these are combined.
   */
  scoring: {
    big5?: {
      high?: Array<"A" | "C" | "E" | "N" | "O">; // dimensions expected to score high, e.g. ["O"]
      low?: Array<"A" | "C" | "E" | "N" | "O">;
    };
    mbti?: {
      traits?: string[]; // e.g. ["E", "N", "T", "J"]
      type?: string[]; // e.g. ["INTJ"]
    };
    riasec?: {
      codes?: string[]; // Holland codes, e.g. ["E", "S"]
    };
    saju?: {
      dominantTenGod?: string[]; // e.g. ["Friend", "Rob Wealth"]
      elementBalance?: {
        deficient?: string[];
        excess?: string[]; // e.g. ["Fire"]
      };
    };
    tci?: {
      highRequest?: string[]; // e.g. ["Novelty Seeking"]
    };
    zodiac?: {
      signs?: string[]; // e.g. ["Aries", "Leo"]
    };
  };
  tags: string[];
}

export const CAREER_DEFINITIONS: RecommendationDefinition[] = [
  {
    category: "career",
    icon: "Users",
    id: "global_leader",
    reasoning: {
      primarySource: "saju",
      secondarySource: "mbti",
    },
    scoring: {
      big5: {
        high: ["E"],
      },
      mbti: {
        traits: ["E", "J"],
      },
      riasec: {
        codes: ["E", "S"],
      },
      saju: {
        dominantTenGod: ["Friend", "Rob Wealth", "Direct Officer", "7 Killing"],
      },
    },
    tags: ["Leadership", "Management", "Social"],
  },
  {
    category: "career",
    icon: "Map",
    id: "strategic_planner",
    reasoning: {
      primarySource: "mbti",
      secondarySource: "saju",
    },
    scoring: {
      big5: {
        high: ["O", "C"],
      },
      mbti: {
        traits: ["N", "T", "J"],
      },
      riasec: {
        codes: ["I", "C"],
      },
      saju: {
        dominantTenGod: ["Direct Resource", "Indirect Resource", "Eating God"],
      },
    },
    tags: ["Strategy", "Analyst", "Vision"],
  },
];

export const HOBBY_DEFINITIONS: RecommendationDefinition[] = [
  {
    category: "hobby",
    icon: "Brain",
    id: "meditation",
    reasoning: {
      primarySource: "saju",
      secondarySource: "tci",
    },
    scoring: {
      big5: {
        high: ["N"],
      },
      saju: {
        elementBalance: {
          excess: ["Fire", "Wood"], // Too much excitement needs cooling
        },
      },
      tci: {
        highRequest: ["Harm Avoidance"],
      },
    },
    tags: ["Wellness", "Calm", "Spirituality"],
  },
  {
    category: "hobby",
    icon: "Mountain",
    id: "hiking",
    reasoning: {
      primarySource: "nordic", // Example from original code
      secondarySource: "saju",
    },
    scoring: {
      big5: {
        high: ["O"],
      },
      mbti: {
        traits: ["S", "P"],
      },
      riasec: {
        codes: ["R"],
      },
      saju: {
        elementBalance: {
          deficient: ["Earth"], // Hiking connects with Earth
        },
      },
    },
    tags: ["Outdoor", "Physical", "Nature"],
  },
];

export const PSYCHOLOGY_DEFINITIONS: RecommendationDefinition[] = [
  {
    category: "psychology",
    icon: "Ghost",
    id: "shadow_work",
    reasoning: {
      primarySource: "analytical_psychology",
      secondarySource: "mbti",
    },
    scoring: {
      big5: {
        high: ["N", "O"],
      },
      mbti: {
        traits: ["I", "N", "F", "J"], // Example
      },
    },
    tags: ["Dark Psychology", "Self-Reflection", "Growth"],
  },
  {
    category: "psychology",
    icon: "Baby",
    id: "inner_child",
    reasoning: {
      primarySource: "psychology",
      secondarySource: "tci",
    },
    scoring: {
      big5: {
        high: ["N"],
      },
      tci: {
        highRequest: ["Harm Avoidance"],
      },
    },
    tags: ["Healing", "Emotional", "Comfort"],
  },
];

export const MYTHOLOGY_DEFINITIONS: RecommendationDefinition[] = [
  {
    category: "mythology",
    icon: "Sword",
    id: "hero_journey",
    reasoning: {
      primarySource: "mythology",
      secondarySource: "saju",
    },
    scoring: {
      saju: {
        dominantTenGod: ["7 Killing", "Direct Officer"],
      },
      zodiac: {
        signs: ["Aries", "Leo", "Sagittarius"], // Fire signs, heroic drive
      },
    },
    tags: ["Campbell", "Archetype", "Purpose"],
  },
  {
    category: "mythology",
    icon: "Sparkles",
    id: "trickster_archetype",
    reasoning: {
      primarySource: "mythology",
      secondarySource: "mbti",
    },
    scoring: {
      mbti: {
        traits: ["E", "N", "T", "P"],
      },
      zodiac: {
        signs: ["Gemini", "Sagittarius", "Aquarius"], // Chaotic, boundary-crossing signs
      },
    },
    tags: ["Chaos", "Innovation", "Change"],
  },
];

export const SCIENCE_DEFINITIONS: RecommendationDefinition[] = [
  {
    category: "science",
    icon: "Zap",
    id: "dopamine_fast",
    reasoning: {
      primarySource: "neuroscience",
      secondarySource: "tci",
    },
    scoring: {
      riasec: {
        codes: ["I"],
      },
      tci: {
        highRequest: ["Novelty Seeking"],
      },
    },
    tags: ["Focus", "Brain Health", "Discipline"],
  },
];

export const SPIRITUALITY_DEFINITIONS: RecommendationDefinition[] = [
  {
    category: "spirituality",
    icon: "Waves",
    id: "taoist_flow",
    reasoning: {
      primarySource: "taoism",
      secondarySource: "saju",
    },
    scoring: {
      big5: {
        high: ["A"],
      },
      saju: {
        elementBalance: {
          excess: ["Water"],
        },
      },
      zodiac: {
        signs: ["Cancer", "Scorpio", "Pisces"], // Water signs, flow-aligned
      },
    },
    tags: ["Wu Wei", "Peace", "Balance"],
  },
];
