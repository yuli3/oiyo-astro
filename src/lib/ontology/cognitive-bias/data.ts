import type { BiasDefinition, BiasType, Question } from "./types";

export const questions: Question[] = [
  {
    category: "thinking",
    id: 1,
    options: [
      {
        biases: { "confirmation-bias": 3 },
        emoji: "🔍",
        id: "a",
        text: "options.q1.a",
      },
      { biases: {}, emoji: "🤔", id: "b", text: "options.q1.b" },
      {
        biases: { "availability-heuristic": 2 },
        emoji: "📊",
        id: "c",
        text: "options.q1.c",
      },
    ],
    text: "questions.q1",
  },
  {
    category: "decision",
    id: 2,
    options: [
      {
        biases: { "authority-bias": 3 },
        emoji: "👨‍⚕️",
        id: "a",
        text: "options.q2.a",
      },
      { biases: {}, emoji: "🧪", id: "b", text: "options.q2.b" },
      {
        biases: { "availability-heuristic": 2 },
        emoji: "💬",
        id: "c",
        text: "options.q2.c",
      },
    ],
    text: "questions.q2",
  },
  {
    category: "learning",
    id: 3,
    options: [
      {
        biases: { "dunning-kruger": 3 },
        emoji: "💯",
        id: "a",
        text: "options.q3.a",
      },
      { biases: {}, emoji: "📚", id: "b", text: "options.q3.b" },
      {
        biases: { "dunning-kruger": 1 },
        emoji: "🤷",
        id: "c",
        text: "options.q3.c",
      },
    ],
    text: "questions.q3",
  },
  {
    category: "decision",
    id: 4,
    options: [
      {
        biases: { "anchoring-bias": 3 },
        emoji: "💰",
        id: "a",
        text: "options.q4.a",
      },
      { biases: {}, emoji: "📈", id: "b", text: "options.q4.b" },
      {
        biases: { "anchoring-bias": 2 },
        emoji: "🎲",
        id: "c",
        text: "options.q4.c",
      },
    ],
    text: "questions.q4",
  },
  {
    category: "social",
    id: 5,
    options: [
      {
        biases: { "survivorship-bias": 3 },
        emoji: "🏆",
        id: "a",
        text: "options.q5.a",
      },
      { biases: {}, emoji: "📖", id: "b", text: "options.q5.b" },
      {
        biases: { "survivorship-bias": 2 },
        emoji: "💪",
        id: "c",
        text: "options.q5.c",
      },
    ],
    text: "questions.q5",
  },
  {
    category: "thinking",
    id: 6,
    options: [
      {
        biases: { "confirmation-bias": 2 },
        emoji: "✅",
        id: "a",
        text: "options.q6.a",
      },
      { biases: {}, emoji: "⚖️", id: "b", text: "options.q6.b" },
      {
        biases: { "confirmation-bias": 3 },
        emoji: "🚫",
        id: "c",
        text: "options.q6.c",
      },
    ],
    text: "questions.q6",
  },
  {
    category: "decision",
    id: 7,
    options: [
      {
        biases: { "availability-heuristic": 3 },
        emoji: "📰",
        id: "a",
        text: "options.q7.a",
      },
      { biases: {}, emoji: "📊", id: "b", text: "options.q7.b" },
      {
        biases: { "availability-heuristic": 2 },
        emoji: "💭",
        id: "c",
        text: "options.q7.c",
      },
    ],
    text: "questions.q7",
  },
  {
    category: "learning",
    id: 8,
    options: [
      {
        biases: { "authority-bias": 2 },
        emoji: "🎓",
        id: "a",
        text: "options.q8.a",
      },
      { biases: {}, emoji: "🔬", id: "b", text: "options.q8.b" },
      {
        biases: { "authority-bias": 3 },
        emoji: "📱",
        id: "c",
        text: "options.q8.c",
      },
    ],
    text: "questions.q8",
  },
  {
    category: "social",
    id: 9,
    options: [
      {
        biases: { "availability-heuristic": 3 },
        emoji: "✈️",
        id: "a",
        text: "options.q9.a",
      },
      { biases: {}, emoji: "📊", id: "b", text: "options.q9.b" },
      {
        biases: { "availability-heuristic": 1 },
        emoji: "😨",
        id: "c",
        text: "options.q9.c",
      },
    ],
    text: "questions.q9",
  },
  {
    category: "decision",
    id: 10,
    options: [
      {
        biases: { "anchoring-bias": 3 },
        emoji: "🏷️",
        id: "a",
        text: "options.q10.a",
      },
      { biases: {}, emoji: "🤔", id: "b", text: "options.q10.b" },
      {
        biases: { "anchoring-bias": 2 },
        emoji: "💸",
        id: "c",
        text: "options.q10.c",
      },
    ],
    text: "questions.q10",
  },
  {
    category: "learning",
    id: 11,
    options: [
      {
        biases: { "dunning-kruger": 3 },
        emoji: "😎",
        id: "a",
        text: "options.q11.a",
      },
      { biases: {}, emoji: "🧠", id: "b", text: "options.q11.b" },
      {
        biases: { "dunning-kruger": 2 },
        emoji: "🤷‍♂️",
        id: "c",
        text: "options.q11.c",
      },
    ],
    text: "questions.q11",
  },
  {
    category: "thinking",
    id: 12,
    options: [
      {
        biases: { "survivorship-bias": 3 },
        emoji: "🦄",
        id: "a",
        text: "options.q12.a",
      },
      { biases: {}, emoji: "📉", id: "b", text: "options.q12.b" },
      {
        biases: { "survivorship-bias": 2 },
        emoji: "🎓",
        id: "c",
        text: "options.q12.c",
      },
    ],
    text: "questions.q12",
  },
  // NEW: Hindsight Bias (후견지명 편향)
  {
    category: "thinking",
    id: 13,
    options: [
      {
        biases: { "hindsight-bias": 3 },
        emoji: "🔮",
        id: "a",
        text: "options.q13.a",
      },
      { biases: {}, emoji: "📝", id: "b", text: "options.q13.b" },
      {
        biases: { "hindsight-bias": 2 },
        emoji: "💡",
        id: "c",
        text: "options.q13.c",
      },
    ],
    text: "questions.q13",
  },
  // NEW: Status Quo Bias (현상유지 편향)
  {
    category: "decision",
    id: 14,
    options: [
      {
        biases: { "status-quo-bias": 3 },
        emoji: "🏠",
        id: "a",
        text: "options.q14.a",
      },
      { biases: {}, emoji: "🚀", id: "b", text: "options.q14.b" },
      {
        biases: { "status-quo-bias": 2 },
        emoji: "⚖️",
        id: "c",
        text: "options.q14.c",
      },
    ],
    text: "questions.q14",
  },
  // NEW: Sunk Cost Fallacy (매몰비용 오류)
  {
    category: "decision",
    id: 15,
    options: [
      {
        biases: { "sunk-cost-fallacy": 3 },
        emoji: "💸",
        id: "a",
        text: "options.q15.a",
      },
      { biases: {}, emoji: "🔄", id: "b", text: "options.q15.b" },
      {
        biases: { "sunk-cost-fallacy": 2 },
        emoji: "🎬",
        id: "c",
        text: "options.q15.c",
      },
    ],
    text: "questions.q15",
  },
];

export const biasDefinitions: Record<BiasType, BiasDefinition> = {
  "anchoring-bias": {
    description: "types.anchoring_bias.description",
    emoji: "⚓",
    examples: [
      "types.anchoring_bias.examples.0",
      "types.anchoring_bias.examples.1",
    ],
    howToOvercome: [
      "types.anchoring_bias.overcome.0",
      "types.anchoring_bias.overcome.1",
    ],
    name: "types.anchoring_bias.name",
    relatedBiases: ["availability-heuristic"],
    subtitle: "types.anchoring_bias.subtitle",
  },
  "authority-bias": {
    description: "types.authority_bias.description",
    emoji: "👔",
    examples: [
      "types.authority_bias.examples.0",
      "types.authority_bias.examples.1",
    ],
    howToOvercome: [
      "types.authority_bias.overcome.0",
      "types.authority_bias.overcome.1",
    ],
    name: "types.authority_bias.name",
    relatedBiases: ["confirmation-bias"],
    subtitle: "types.authority_bias.subtitle",
  },
  "availability-heuristic": {
    description: "types.availability_heuristic.description",
    emoji: "📰",
    examples: [
      "types.availability_heuristic.examples.0",
      "types.availability_heuristic.examples.1",
    ],
    howToOvercome: [
      "types.availability_heuristic.overcome.0",
      "types.availability_heuristic.overcome.1",
    ],
    name: "types.availability_heuristic.name",
    relatedBiases: ["confirmation-bias"],
    subtitle: "types.availability_heuristic.subtitle",
  },
  "confirmation-bias": {
    description: "types.confirmation_bias.description",
    emoji: "🔍",
    examples: [
      "types.confirmation_bias.examples.0",
      "types.confirmation_bias.examples.1",
    ],
    howToOvercome: [
      "types.confirmation_bias.overcome.0",
      "types.confirmation_bias.overcome.1",
    ],
    name: "types.confirmation_bias.name",
    relatedBiases: ["availability-heuristic", "anchoring-bias"],
    subtitle: "types.confirmation_bias.subtitle",
  },
  "dunning-kruger": {
    description: "types.dunning_kruger.description",
    emoji: "🤯",
    examples: [
      "types.dunning_kruger.examples.0",
      "types.dunning_kruger.examples.1",
    ],
    howToOvercome: [
      "types.dunning_kruger.overcome.0",
      "types.dunning_kruger.overcome.1",
    ],
    name: "types.dunning_kruger.name",
    relatedBiases: ["confirmation-bias"],
    subtitle: "types.dunning_kruger.subtitle",
  },
  // NEW: Hindsight Bias (후견지명 편향)
  "hindsight-bias": {
    description: "types.hindsight_bias.description",
    emoji: "🔮",
    examples: [
      "types.hindsight_bias.examples.0",
      "types.hindsight_bias.examples.1",
    ],
    howToOvercome: [
      "types.hindsight_bias.overcome.0",
      "types.hindsight_bias.overcome.1",
    ],
    name: "types.hindsight_bias.name",
    relatedBiases: ["confirmation-bias", "anchoring-bias"],
    subtitle: "types.hindsight_bias.subtitle",
  },
  // NEW: Status Quo Bias (현상유지 편향)
  "status-quo-bias": {
    description: "types.status_quo_bias.description",
    emoji: "🏠",
    examples: [
      "types.status_quo_bias.examples.0",
      "types.status_quo_bias.examples.1",
    ],
    howToOvercome: [
      "types.status_quo_bias.overcome.0",
      "types.status_quo_bias.overcome.1",
    ],
    name: "types.status_quo_bias.name",
    relatedBiases: ["anchoring-bias", "sunk-cost-fallacy"],
    subtitle: "types.status_quo_bias.subtitle",
  },
  // NEW: Sunk Cost Fallacy (매몰비용 오류)
  "sunk-cost-fallacy": {
    description: "types.sunk_cost_fallacy.description",
    emoji: "💸",
    examples: [
      "types.sunk_cost_fallacy.examples.0",
      "types.sunk_cost_fallacy.examples.1",
    ],
    howToOvercome: [
      "types.sunk_cost_fallacy.overcome.0",
      "types.sunk_cost_fallacy.overcome.1",
    ],
    name: "types.sunk_cost_fallacy.name",
    relatedBiases: ["status-quo-bias", "anchoring-bias"],
    subtitle: "types.sunk_cost_fallacy.subtitle",
  },
  "survivorship-bias": {
    description: "types.survivorship_bias.description",
    emoji: "🏆",
    examples: [
      "types.survivorship_bias.examples.0",
      "types.survivorship_bias.examples.1",
    ],
    howToOvercome: [
      "types.survivorship_bias.overcome.0",
      "types.survivorship_bias.overcome.1",
    ],
    name: "types.survivorship_bias.name",
    relatedBiases: ["availability-heuristic"],
    subtitle: "types.survivorship_bias.subtitle",
  },
};
