import type { LocalizedContent } from "@/types/manifest";

export interface ConsumptionResult {
  description: LocalizedContent;
  financialWisdom: LocalizedContent;
  primaryStyle: ConsumptionTrait;
  title: LocalizedContent;
  traits: Record<ConsumptionTrait, number>;
}

export type ConsumptionTrait =
  | "emotional_satisfaction"
  | "impulsive"
  | "prestige_seeking"
  | "sustainable"
  | "value_oriented";
