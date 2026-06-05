import { describe, expect, it } from "vitest";

import { loadOntologyShard } from "@/manifest/ontology/loader";
import { analyzeGenericFaction } from "./factions";

describe("ontology synthesis shards", () => {
  it("loads month and element specific biography shards", async () => {
    const [stones, flowers, hobbies] = await Promise.all([
      loadOntologyShard("BIRTHSTONES"),
      loadOntologyShard("BIRTHFLOWERS"),
      loadOntologyShard("HOBBIES"),
    ]);

    const month = 2;
    const element = "WOOD";

    expect(stones.some((stone) => stone.month === month)).toBe(true);
    expect(flowers.some((flower) => flower.month === month)).toBe(true);
    expect(
      stones.find(
        (stone) => stone.month === month && stone.elementMapping === element,
      )?.id,
    ).toBe("amethyst");
    expect(
      flowers.find(
        (flower) => flower.month === month && flower.elementMapping === element,
      )?.id,
    ).toBe("violet");
    expect(hobbies.some((hobby) => hobby.tags.elements.includes(element))).toBe(
      true,
    );
  });

  it("uses element and MBTI inputs to select ontology factions", async () => {
    const economicSchools = await loadOntologyShard("ECONOMIC_SCHOOLS");
    const result = analyzeGenericFaction(economicSchools, "WOOD", "INTJ");

    expect(result.innateFaction?.id).toBe("ECON_KEYNESIAN");
    expect(result.behavioralFaction?.id).toBe("ECON_CLASSICAL");
    expect(result.faction?.id).toBe("ECON_CLASSICAL");
    expect(result.divergence).toBeGreaterThan(0);
  });
});
