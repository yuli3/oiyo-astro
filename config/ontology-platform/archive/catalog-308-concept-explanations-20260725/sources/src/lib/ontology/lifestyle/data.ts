export interface LifestyleMetadata {
  benefitTags: string[];
  category: string;
  elementWeights: {
    earth: number;
    fire: number;
    metal: number;
    water: number;
    wood: number;
  };
  id: string;
  traitAffinities: {
    // MBTI based (Extroversion vs Introversion)
    extroversion: number;
    harmAvoidance: number;
    // TCI based
    noveltySeeking: number;
    persistence: number;
    // Physicality vs Intellect
    physicality: number;
    rewardDependence: number;
  };
}

export const HOBBY_METADATA: LifestyleMetadata[] = [
  {
    benefitTags: ["focus", "tangible-result", "grounding"],
    category: "creative",
    elementWeights: { earth: 0.3, fire: 0, metal: 0, water: 0, wood: 0.7 },
    id: "woodworking",
    traitAffinities: {
      extroversion: 0.2,
      harmAvoidance: 0.2,
      noveltySeeking: 0.4,
      persistence: 0.8,
      physicality: 0.7,
      rewardDependence: 0.3,
    },
  },
  {
    benefitTags: ["stress-relief", "stamina", "confidence"],
    category: "physical",
    elementWeights: { earth: 0, fire: 0.8, metal: 0.2, water: 0, wood: 0 },
    id: "boxing-kickboxing",
    traitAffinities: {
      extroversion: 0.8,
      harmAvoidance: 0.1,
      noveltySeeking: 0.9,
      persistence: 0.7,
      physicality: 1.0,
      rewardDependence: 0.4,
    },
  },
  {
    benefitTags: ["inner-peace", "mindfulness", "purity"],
    category: "mystical",
    elementWeights: { earth: 0.3, fire: 0, metal: 0, water: 0.5, wood: 0.2 },
    id: "tea-ceremony-meditation",
    traitAffinities: {
      extroversion: 0.1,
      harmAvoidance: 0.8,
      noveltySeeking: 0.2,
      persistence: 0.9,
      physicality: 0.1,
      rewardDependence: 0.2,
    },
  },
  {
    benefitTags: ["awe", "technical-skill", "cosmos"],
    category: "mystical",
    elementWeights: { earth: 0, fire: 0, metal: 0.4, water: 0.6, wood: 0 },
    id: "astrophotography",
    traitAffinities: {
      extroversion: 0.1,
      harmAvoidance: 0.3,
      noveltySeeking: 0.6,
      persistence: 0.9,
      physicality: 0.3,
      rewardDependence: 0.3,
    },
  },
  {
    benefitTags: ["life-cycle", "healing", "anti-aging"],
    category: "nature",
    elementWeights: { earth: 0.2, fire: 0, metal: 0, water: 0, wood: 0.8 },
    id: "gardening",
    traitAffinities: {
      extroversion: 0.3,
      harmAvoidance: 0.2,
      noveltySeeking: 0.3,
      persistence: 0.8,
      physicality: 0.6,
      rewardDependence: 0.7,
    },
  },
  {
    benefitTags: ["earth-connection", "focus", "serenity"],
    category: "creative",
    elementWeights: { earth: 0.9, fire: 0, metal: 0.1, water: 0, wood: 0 },
    id: "pottery",
    traitAffinities: {
      extroversion: 0.2,
      harmAvoidance: 0.4,
      noveltySeeking: 0.4,
      persistence: 0.7,
      physicality: 0.6,
      rewardDependence: 0.3,
    },
  },
  {
    benefitTags: ["focus", "decisiveness", "flow"],
    category: "mystical",
    elementWeights: { earth: 0, fire: 0.3, metal: 0.5, water: 0, wood: 0.2 },
    id: "archery-meditation",
    traitAffinities: {
      extroversion: 0.1,
      harmAvoidance: 0.2,
      noveltySeeking: 0.3,
      persistence: 0.9,
      physicality: 0.5,
      rewardDependence: 0.4,
    },
  },
  {
    benefitTags: ["sound-design", "logic", "immersion"],
    category: "creative",
    elementWeights: { earth: 0, fire: 0.4, metal: 0.6, water: 0, wood: 0 },
    id: "analog-synth-patching",
    traitAffinities: {
      extroversion: 0.3,
      harmAvoidance: 0.2,
      noveltySeeking: 0.8,
      persistence: 0.7,
      physicality: 0.2,
      rewardDependence: 0.3,
    },
  },
  {
    benefitTags: ["phytoncide", "vagus-nerve", "clarity"],
    category: "nature",
    elementWeights: { earth: 0.1, fire: 0, metal: 0, water: 0, wood: 0.9 },
    id: "forest-bathing",
    traitAffinities: {
      extroversion: 0.2,
      harmAvoidance: 0.7,
      noveltySeeking: 0.2,
      persistence: 0.4,
      physicality: 0.4,
      rewardDependence: 0.8,
    },
  },
  {
    benefitTags: ["beat", "release", "synchronization"],
    category: "creative",
    elementWeights: { earth: 0, fire: 0.7, metal: 0.1, water: 0, wood: 0.2 },
    id: "drumming",
    traitAffinities: {
      extroversion: 0.9,
      harmAvoidance: 0.1,
      noveltySeeking: 0.9,
      persistence: 0.6,
      physicality: 0.8,
      rewardDependence: 0.6,
    },
  },
];

export const CAREER_METADATA: LifestyleMetadata[] = [
  {
    benefitTags: ["innovation", "logic", "remote-work"],
    category: "Technology",
    elementWeights: { earth: 0, fire: 0, metal: 0.7, water: 0.3, wood: 0 },
    id: "software-engineer",
    traitAffinities: {
      extroversion: 0.2,
      harmAvoidance: 0.4,
      noveltySeeking: 0.7,
      persistence: 0.9,
      physicality: 0.1,
      rewardDependence: 0.3,
    },
  },
  {
    benefitTags: ["structure", "legacy", "vision"],
    category: "Arts & Design",
    elementWeights: { earth: 0.5, fire: 0, metal: 0.1, water: 0, wood: 0.4 },
    id: "architect",
    traitAffinities: {
      extroversion: 0.3,
      harmAvoidance: 0.3,
      noveltySeeking: 0.6,
      persistence: 0.9,
      physicality: 0.2,
      rewardDependence: 0.4,
    },
  },
  {
    benefitTags: ["saving-lives", "expertise", "high-status"],
    category: "Healthcare",
    elementWeights: { earth: 0, fire: 0, metal: 0.7, water: 0, wood: 0.3 },
    id: "physician",
    traitAffinities: {
      extroversion: 0.6,
      harmAvoidance: 0.6,
      noveltySeeking: 0.5,
      persistence: 1.0,
      physicality: 0.4,
      rewardDependence: 0.8,
    },
  },
  {
    benefitTags: ["expression", "influence", "dynamism"],
    category: "Media",
    elementWeights: { earth: 0, fire: 0.8, metal: 0, water: 0, wood: 0.2 },
    id: "content-creator",
    traitAffinities: {
      extroversion: 0.9,
      harmAvoidance: 0.2,
      noveltySeeking: 1.0,
      persistence: 0.6,
      physicality: 0.3,
      rewardDependence: 0.9,
    },
  },
];
