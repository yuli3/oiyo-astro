import type { LocalizedText } from "@/types/manifest";

export type MayanColor = "blue" | "red" | "white" | "yellow";

export interface MayanKin {
  affirmation: string; // Galactic Affirmation
  kinName?: LocalizedText;
  kinNumber: number; // 1-260
  seal: {
    color: MayanColor;
    id: number; // 1-20
    key: string;
    keywords: string[];
    mayanName: string; // Imix, Ik, etc.
    name: string; // Dragon, Wind, etc.
  };
  sealName?: LocalizedText;
  tone: {
    key: string;
    keywords: string[];
    name: string; // Magnetic, Lunar, etc.
    number: number; // 1-13
  };
}

export const SOLAR_SEALS = [
  {
    color: "red",
    id: 1,
    key: "dragon",
    keywords: ["Nurtures", "Birth", "Being"],
    mayanName: "Imix",
    name: "Dragon",
  },
  {
    color: "white",
    id: 2,
    key: "wind",
    keywords: ["Communicates", "Breath", "Spirit"],
    mayanName: "Ik",
    name: "Wind",
  },
  {
    color: "blue",
    id: 3,
    key: "night",
    keywords: ["Dreams", "Intuition", "Abundance"],
    mayanName: "Akbal",
    name: "Night",
  },
  {
    color: "yellow",
    id: 4,
    key: "seed",
    keywords: ["Targets", "Awareness", "Flowering"],
    mayanName: "Kan",
    name: "Seed",
  },
  {
    color: "red",
    id: 5,
    key: "serpent",
    keywords: ["Survives", "Instinct", "Life Force"],
    mayanName: "Chicchan",
    name: "Serpent",
  },
  {
    color: "white",
    id: 6,
    key: "worldbridger",
    keywords: ["Equalizes", "Death", "Opportunity"],
    mayanName: "Cimi",
    name: "Worldbridger",
  },
  {
    color: "blue",
    id: 7,
    key: "hand",
    keywords: ["Knows", "Healing", "Accomplishment"],
    mayanName: "Manik",
    name: "Hand",
  },
  {
    color: "yellow",
    id: 8,
    key: "star",
    keywords: ["Beautifies", "Art", "Elegance"],
    mayanName: "Lamat",
    name: "Star",
  },
  {
    color: "red",
    id: 9,
    key: "moon",
    keywords: ["Purifies", "Flow", "Universal Water"],
    mayanName: "Muluc",
    name: "Moon",
  },
  {
    color: "white",
    id: 10,
    key: "dog",
    keywords: ["Loves", "Heart", "Loyalty"],
    mayanName: "Oc",
    name: "Dog",
  },
  {
    color: "blue",
    id: 11,
    key: "monkey",
    keywords: ["Plays", "Magic", "Illusion"],
    mayanName: "Chuen",
    name: "Monkey",
  },
  {
    color: "yellow",
    id: 12,
    key: "human",
    keywords: ["Influences", "Free Will", "Wisdom"],
    mayanName: "Eb",
    name: "Human",
  },
  {
    color: "red",
    id: 13,
    key: "skywalker",
    keywords: ["Explores", "Space", "Wakefulness"],
    mayanName: "Ben",
    name: "Skywalker",
  },
  {
    color: "white",
    id: 14,
    key: "wizard",
    keywords: ["Enchants", "Timelessness", "Receptivity"],
    mayanName: "Ix",
    name: "Wizard",
  },
  {
    color: "blue",
    id: 15,
    key: "eagle",
    keywords: ["Creates", "Vision", "Mind"],
    mayanName: "Men",
    name: "Eagle",
  },
  {
    color: "yellow",
    id: 16,
    key: "warrior",
    keywords: ["Questions", "Intelligence", "Fearlessness"],
    mayanName: "Cib",
    name: "Warrior",
  },
  {
    color: "red",
    id: 17,
    key: "earth",
    keywords: ["Evolves", "Navigation", "Synchronicity"],
    mayanName: "Caban",
    name: "Earth",
  },
  {
    color: "white",
    id: 18,
    key: "mirror",
    keywords: ["Reflects", "Endlessness", "Order"],
    mayanName: "Etznab",
    name: "Mirror",
  },
  {
    color: "blue",
    id: 19,
    key: "storm",
    keywords: ["Catalyzes", "Energy", "Self-Generation"],
    mayanName: "Cauac",
    name: "Storm",
  },
  {
    color: "yellow",
    id: 20,
    key: "sun",
    keywords: ["Enlightens", "Life", "Universal Fire"],
    mayanName: "Ahau",
    name: "Sun",
  },
] as const;

export const GALACTIC_TONES = [
  {
    key: "magnetic",
    keywords: ["Unify", "Attract", "Purpose"],
    name: "Magnetic",
    number: 1,
  },
  {
    key: "lunar",
    keywords: ["Polarize", "Stabilize", "Challenge"],
    name: "Lunar",
    number: 2,
  },
  {
    key: "electric",
    keywords: ["Activate", "Bond", "Service"],
    name: "Electric",
    number: 3,
  },
  {
    key: "selfExisting",
    keywords: ["Define", "Measure", "Form"],
    name: "Self-Existing",
    number: 4,
  },
  {
    key: "overtone",
    keywords: ["Empower", "Command", "Radiance"],
    name: "Overtone",
    number: 5,
  },
  {
    key: "rhythmic",
    keywords: ["Organize", "Balance", "Equality"],
    name: "Rhythmic",
    number: 6,
  },
  {
    key: "resonant",
    keywords: ["Channel", "Inspire", "Attunement"],
    name: "Resonant",
    number: 7,
  },
  {
    key: "galactic",
    keywords: ["Harmonize", "Model", "Integrity"],
    name: "Galactic",
    number: 8,
  },
  {
    key: "solar",
    keywords: ["Pulse", "Realize", "Intention"],
    name: "Solar",
    number: 9,
  },
  {
    key: "planetary",
    keywords: ["Perfect", "Produce", "Manifestation"],
    name: "Planetary",
    number: 10,
  },
  {
    key: "spectral",
    keywords: ["Dissolve", "Release", "Liberation"],
    name: "Spectral",
    number: 11,
  },
  {
    key: "crystal",
    keywords: ["Dedicate", "Universalize", "Cooperation"],
    name: "Crystal",
    number: 12,
  },
  {
    key: "cosmic",
    keywords: ["Endure", "Transcend", "Presence"],
    name: "Cosmic",
    number: 13,
  },
] as const;
