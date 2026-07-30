import { useMemo } from "react";

import { FiveElement, TenGod } from "@/lib/ontology/saju/types";
import type { OntologyProfile } from "@/lib/ontology/types";

/**
 * A hook to safely select and memoize specific data points from the universal profile.
 * This encapsulates safety checks and reduces clutter in the main component.
 */
export function useOntologySelectors(
  profile: null | OntologyProfile | undefined,
) {
  // Saju Selectors
  const sajuData = useMemo(
    () => profile?.roots?.universal?.sajuAnalysis?.result,
    [profile],
  );

  const dayMaster = useMemo(() => {
    return sajuData?.dayMaster as FiveElement | undefined;
  }, [sajuData]);

  const dominantElement = useMemo(() => {
    return profile?.roots?.universal?.sajuAnalysis?.dominantElement as
      | FiveElement
      | undefined;
  }, [profile]);

  // Biorhythm Selectors
  const biorhythm = useMemo(() => {
    // Assuming biorhythm might be enriched onto the profile or passed separately.
    // If it's part of the profile structure eventually:
    // return profile?.biorhythm;
    return null;
  }, []);

  // Assessment Status Selectors
  const hasMBTI = useMemo(() => !!profile?.branches?.mbti?.type, [profile]);
  const hasTCI = useMemo(() => !!profile?.branches?.psychology?.tci, [profile]);
  const hasSaju = useMemo(() => !!profile?.roots?.universal?.saju, [profile]);

  // MBTI Type
  const mbtiType = useMemo(() => profile?.branches?.mbti?.type, [profile]);

  return {
    mbti: {
      type: mbtiType,
    },
    // Raw profile access if needed, but discouraged
    raw: profile,
    saju: {
      data: sajuData,
      dayMaster,
      dominantElement,
    },
    status: {
      hasMBTI,
      hasSaju,
      hasTCI,
    },
  };
}
