/**
 * Universal Profile Engine (UPE) - Main Entry Point
 *
 * This is THE ONLY function you need to call.
 * Input: { birthDate, fullName, gender, bloodType }
 * Output: Everything. All wisdom traditions. All lucky attributes. All social compatibility.
 *
 * Usage:
 *   const profile = createUniversalProfile({ birthDate: new Date('1990-05-15'), fullName: '홍길동' });
 *   console.log(profile.saju);           // Four Pillars
 *   console.log(profile.luckyColor);     // "Green"
 *   console.log(profile.noblePerson);    // "Water Element People"
 */

import { generateGrandOracleReport } from "@/lib/engines/grand-oracle/logic";
import {
  OntologyBranches,
  OntologyProfile,
  OntologyRoots,
  OntologySynthesis,
} from "@/lib/ontology/types";

import { calculateUniversalCorrelation } from "./logic";
import { SocialAnalysis, UniversalInput, UniversalProfile } from "./types";

export interface ProfileInput {
  birthDate: Date;
  bloodType?: "A" | "AB" | "B" | "O";
  fullName?: string;
  gender?: "female" | "male";
  isLunarCalendar?: boolean;
  longitude?: number;
}

/**
 * Aggregates data from user's history into a structured Ontology Profile
 * (Migrated from engine.ts)
 */
export async function aggregateOntology(
  history: any[],
  locale: string = "en",
): Promise<OntologyProfile> {
  const findResult = (id: string) => history.find((h) => h.test_id === id);

  // 1. Extract Roots (Universal Origin)
  const universalData = findResult("primal-origin"); // Keep ID for legacy data compatibility
  const roots: OntologyRoots = {
    isComplete: !!universalData,
    universal: universalData?.result_data,
  };

  // 3. Branches (Psychology & Vocation)
  const tci = findResult("tci");
  const hexaco = findResult("hexaco");
  const hsp = findResult("hsp");
  const perfectionism = findResult("perfectionism");
  const enneagram = findResult("enneagram");
  const riasec = findResult("riasec");

  const branches: OntologyBranches = {
    enneagram: enneagram?.result_data,
    isComplete: !!(tci && hexaco && enneagram && riasec),
    psychology: {
      hexaco: hexaco?.result_data,
      hsp: hsp?.result_data,
      perfectionism: perfectionism?.result_data,
      tci: tci?.result_data,
      traits: {
        perfectionism: perfectionism?.result_data?.score || 0,
        sensitivity: hsp?.result_data?.score || 0,
      },
    },
    riasec: riasec?.result_data,
  };

  // 3. Synthesis
  const synthesis = await synthesizePersona(roots, branches, locale);

  return {
    branches,
    lastUpdated: Date.now(),
    roots,
    synthesis: {
      ...synthesis,
    },
  };
}

// Re-export types for convenience
export type { SocialAnalysis, UniversalInput, UniversalProfile };

/**
 * THE SINGLE ENTRY POINT.
 * Call this. Get everything.
 */
export function createUniversalProfile(input: ProfileInput): UniversalProfile {
  const universalInput: UniversalInput = {
    birthDate: input.birthDate,
    bloodType: input.bloodType,
    fullName: input.fullName,
    gender: input.gender,
    isLunarCalendar: input.isLunarCalendar,
    longitude: input.longitude,
  };

  return calculateUniversalCorrelation(universalInput);
}

/**
 * The Ontology Engine
 * Synthesizes a unified persona ("The Unified Truth") from Roots (Nature) and Branches (Nurture).
 */
export async function synthesizePersona(
  roots: OntologyRoots,
  branches: OntologyBranches,
  locale: string = "en",
): Promise<OntologySynthesis> {
  // Use Grand Oracle Engine for the heavy lifting of narrative synthesis
  const oracleReport = await generateGrandOracleReport({
    cosmic: roots.universal?.cosmic || null,
    enneagram: branches.enneagram || null,
    locale,
    mbti: branches.mbti || null,
    mythos: roots.universal?.mythos
      ? {
          celtic: roots.universal.mythos.celtic,
          egyptian: roots.universal.mythos.egyptian,
          symbols: roots.universal.mythos.symbols,
        }
      : { celtic: null, egyptian: null, symbols: null },
    riasec: (branches.riasec as any) || null,
    saju: roots.universal?.saju || null,
    tci: branches.psychology?.tci || null,
  });

  return {
    coreAura: oracleReport.summary,
    destinyPath: oracleReport.sections.elementalBlueprint.content,
    paradox: oracleReport.synthesis.paradoxResolution,
    summary: oracleReport.sections.cosmicEntry.content,
  };
}
