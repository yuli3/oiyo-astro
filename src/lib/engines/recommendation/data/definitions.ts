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
   */
  scoring: {
    mbti?: {
      traits?: string[]; // e.g. ["E", "N", "T", "J"]
      type?: string[]; // e.g. ["INTJ"]
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
      mbti: {
        traits: ["E", "J"],
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
      mbti: {
        traits: ["N", "T", "J"],
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
      mbti: {
        traits: ["S", "P"],
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
      saju: {
        elementBalance: {
          excess: ["Water"],
        },
      },
    },
    tags: ["Wu Wei", "Peace", "Balance"],
  },
];
