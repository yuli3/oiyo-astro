import type { LikertQuestion } from "@/lib/engines/likert-score";
import { THEME_COLORS } from "@/lib/system/theme";

import type { TCIDimension } from "./types";

export interface TCIQuestion extends LikertQuestion<TCIDimension> {
  options?: {
    color?: string;
    id: string;
    textKey: string;
    value: number;
  }[];
  subDimension?: string; // e.g. "NS1", "HA2"
  textKey: string;
}

export const TCI_DIMENSION_MAP: Record<
  TCIDimension,
  { color: string; labelKey: string }
> = {
  C: {
    color: THEME_COLORS.primary,
    labelKey: "ontology.tci.dimensions.C.label",
  },
  HA: {
    color: THEME_COLORS.info,
    labelKey: "ontology.tci.dimensions.HA.label",
  },
  NS: {
    color: THEME_COLORS.danger,
    labelKey: "ontology.tci.dimensions.NS.label",
  },
  P: {
    color: THEME_COLORS.success,
    labelKey: "ontology.tci.dimensions.P.label",
  },
  RD: {
    color: THEME_COLORS.secondary,
    labelKey: "ontology.tci.dimensions.RD.label",
  },
  SD: {
    color: THEME_COLORS.warning,
    labelKey: "ontology.tci.dimensions.SD.label",
  },
  ST: {
    color: THEME_COLORS.cyan,
    labelKey: "ontology.tci.dimensions.ST.label",
  },
};

const TCI_OPTIONS = [
  { color: "bg-red-500", id: "1", textKey: "ontology.tci.options.1", value: 1 },
  {
    color: "bg-orange-400",
    id: "2",
    textKey: "ontology.tci.options.2",
    value: 2,
  },
  {
    color: "bg-green-600/60",
    id: "3",
    textKey: "ontology.tci.options.3",
    value: 3,
  },
  {
    color: "bg-green-400",
    id: "4",
    textKey: "ontology.tci.options.4",
    value: 4,
  },
  {
    color: "bg-green-500",
    id: "5",
    textKey: "ontology.tci.options.5",
    value: 5,
  },
];

export const TCI_QUESTIONS: TCIQuestion[] = [
  // NS (Novelty Seeking)
  {
    dimension: "NS",
    id: "tci_1",
    isReversed: false,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_1",
  },
  {
    dimension: "NS",
    id: "tci_2",
    isReversed: true,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_2",
  },

  // HA (Harm Avoidance)
  {
    dimension: "HA",
    id: "tci_3",
    isReversed: false,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_3",
  },
  {
    dimension: "HA",
    id: "tci_4",
    isReversed: true,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_4",
  },

  // RD (Reward Dependence)
  {
    dimension: "RD",
    id: "tci_5",
    isReversed: false,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_5",
  },
  {
    dimension: "RD",
    id: "tci_6",
    isReversed: true,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_6",
  },

  // P (Persistence)
  {
    dimension: "P",
    id: "tci_7",
    isReversed: false,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_7",
  },
  {
    dimension: "P",
    id: "tci_8",
    isReversed: true,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_8",
  },

  // SD (Self-Directedness)
  {
    dimension: "SD",
    id: "tci_9",
    isReversed: false,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_9",
  },
  {
    dimension: "SD",
    id: "tci_10",
    isReversed: true,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_10",
  },

  // C (Cooperativeness)
  {
    dimension: "C",
    id: "tci_11",
    isReversed: false,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_11",
  },
  {
    dimension: "C",
    id: "tci_12",
    isReversed: true,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_12",
  },

  // ST (Self-Transcendence)
  {
    dimension: "ST",
    id: "tci_13",
    isReversed: false,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_13",
  },
  {
    dimension: "ST",
    id: "tci_14",
    isReversed: true,
    options: TCI_OPTIONS,
    textKey: "ontology.tci.questions.tci_14",
  },
];
