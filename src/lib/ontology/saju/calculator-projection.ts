import { BRANCHES, BRANCH_ORDER } from "@/manifest/data/saju/branches";
import { STEMS, STEM_ORDER } from "@/manifest/data/saju/stems";

import type { BirthSajuResolution, CanonicalSajuPillars } from "./birth-contract";
import type { SajuPillar } from "./types";

export const CALCULATOR_ELEMENT_ORDER = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;

export type CalculatorElement = (typeof CALCULATOR_ELEMENT_ORDER)[number];

export interface CalculatorPillar {
  branch: number;
  stem: number;
}

export interface CalculatorPillars {
  day: CalculatorPillar;
  hour: CalculatorPillar | null;
  month: CalculatorPillar;
  year: CalculatorPillar;
}

export type SajuCalculatorProjection =
  | Extract<BirthSajuResolution, { status: "needs-offset" }>
  | {
      status: "resolved";
      pillars: CalculatorPillars;
      elementCount: Record<CalculatorElement, number>;
      dominantElement: CalculatorElement;
      sortedElements: CalculatorElement[];
      scarceElements: CalculatorElement[];
      missingElements: CalculatorElement[];
    };

const DISPLAY_ELEMENT: Record<string, CalculatorElement> = {
  earth: "Earth",
  fire: "Fire",
  metal: "Metal",
  water: "Water",
  wood: "Wood",
};

function toNumericPillar(pillar: SajuPillar): CalculatorPillar {
  const stem = STEM_ORDER.indexOf(pillar.heavenlyStem);
  const branch = BRANCH_ORDER.indexOf(pillar.earthlyBranch);
  if (stem < 0 || branch < 0) throw new RangeError("Unknown canonical Saju pillar");
  return { branch, stem };
}

function toNumericPillars(pillars: CanonicalSajuPillars): CalculatorPillars {
  return {
    year: toNumericPillar(pillars.year),
    month: toNumericPillar(pillars.month),
    day: toNumericPillar(pillars.day),
    hour: pillars.hour ? toNumericPillar(pillars.hour) : null,
  };
}

function countElements(pillars: CalculatorPillars): Record<CalculatorElement, number> {
  const counts = {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  } satisfies Record<CalculatorElement, number>;

  for (const pillar of [pillars.year, pillars.month, pillars.day, pillars.hour]) {
    if (!pillar) continue;
    counts[DISPLAY_ELEMENT[STEMS[STEM_ORDER[pillar.stem]].element]] += 1;
    counts[DISPLAY_ELEMENT[BRANCHES[BRANCH_ORDER[pillar.branch]].element]] += 1;
  }
  return counts;
}

/**
 * Pure display adapter for the public calculator.
 *
 * It never recalculates pillars. In particular, an unknown birth time remains
 * a three-pillar result: no noon/default hour is introduced for display or
 * downstream analysis.
 */
export function projectSajuCalculator(
  resolution: BirthSajuResolution,
): SajuCalculatorProjection {
  if (resolution.status === "needs-offset") return resolution;

  const pillars = toNumericPillars(resolution.standard);
  const elementCount = countElements(pillars);
  const sortedElements = [...CALCULATOR_ELEMENT_ORDER].sort(
    (left, right) => elementCount[right] - elementCount[left],
  );
  const scarceElements = [...CALCULATOR_ELEMENT_ORDER].sort(
    (left, right) => elementCount[left] - elementCount[right],
  );

  return {
    status: "resolved",
    pillars,
    elementCount,
    dominantElement: sortedElements[0],
    sortedElements,
    scarceElements,
    missingElements: CALCULATOR_ELEMENT_ORDER.filter((element) => elementCount[element] === 0),
  };
}
