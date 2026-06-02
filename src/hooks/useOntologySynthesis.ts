import { useEffect, useMemo, useState } from "react";

import {
  analyzeGenericFaction,
  GenericFactionAnalysis,
} from "@/lib/ontology/engine/factions";
import {
  Birthflower,
  Birthstone,
  Hobby,
} from "@/manifest/ontology/core/schemas";
import { loadOntologyShard, ShardData } from "@/manifest/ontology/loader";

interface SynthesisResult {
  economicSchool: GenericFactionAnalysis | null;
  error: Error | null;
  loading: boolean;
  luckyFlowers: Birthflower[];
  luckyStones: Birthstone[];
  politicalTendency: GenericFactionAnalysis | null;
  recommendedHobbies: Hobby[];
}

export function useOntologySynthesis(
  userMonth: number,
  userElement: string,
  userMbti?: string,
): SynthesisResult {
  const [stones, setStones] = useState<Birthstone[]>([]);
  const [flowers, setFlowers] = useState<Birthflower[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [economicSchool, setEconomicSchool] =
    useState<GenericFactionAnalysis | null>(null);
  const [politicalTendency, setPoliticalTendency] =
    useState<GenericFactionAnalysis | null>(null);

  useEffect(() => {
    const mounted = true;

    async function synthesize() {
      try {
        setLoading(true);
        setError(null);

        // JIT Loading of Shards
        const [stoneShard, flowerShard, hobbyShard, econShard, polShard] =
          await Promise.all([
            loadOntologyShard("BIRTHSTONES"),
            loadOntologyShard("BIRTHFLOWERS"),
            loadOntologyShard("HOBBIES"),
            loadOntologyShard("ECONOMIC_SCHOOLS"),
            loadOntologyShard("POLITICAL_TENDENCIES"),
          ]);

        if (!mounted) return;

        // 1. Precise Matching using Month AND Element Mapping
        const myStones = stoneShard.filter((s) => s.month === userMonth);
        const bestStone =
          myStones.find((s) => s.elementMapping === userElement) || myStones[0];

        const myFlowers = flowerShard.filter((f) => f.month === userMonth);
        const bestFlower =
          myFlowers.find((f) => f.elementMapping === userElement) ||
          myFlowers[0];

        // 2. Synergy Filtering (Cross-Onotology)
        // Find hobbies that match User's Element OR MBTI
        const synergyHobbies = hobbyShard.filter((h) => {
          const elementMatch = h.tags.elements.includes(userElement as any);
          const mbtiMatch = userMbti && h.tags.mbti?.includes(userMbti);
          return elementMatch || mbtiMatch;
        });

        const econAnalysis = analyzeGenericFaction(
          econShard,
          userElement,
          userMbti,
        );
        const polAnalysis = analyzeGenericFaction(
          polShard,
          userElement,
          userMbti,
        );

        if (bestStone) setStones([bestStone]);
        if (bestFlower) setFlowers([bestFlower]);
        setHobbies(synergyHobbies);
        setEconomicSchool(econAnalysis);
        setPoliticalTendency(polAnalysis);
      } catch (err) {
        if (mounted) {
          console.error("Ontology Synthesis Failed", err);
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to load ontology data"),
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (userMonth && userElement) {
      synthesize();
    }
  }, [userMonth, userElement, userMbti]);

  return {
    economicSchool,
    error,
    loading,
    luckyFlowers: flowers,
    luckyStones: stones,
    politicalTendency,
    recommendedHobbies: hobbies,
  };
}
