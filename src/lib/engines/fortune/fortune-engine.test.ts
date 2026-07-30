import { describe, expect, it } from "vitest";

import type { UniversalProfile } from "@/lib/ontology/engine/types";

import { FortuneEngine } from "./fortune-engine";

describe("FortuneEngine Tier Verification", () => {
  const mockProfile: UniversalProfile = {
    animalZodiac: { element: "Fire", id: "horse", name: "Horse" },
    input: {
      birthDate: new Date("1990-01-01"),
      birthTime: "12:00",
      fullName: "Test User",
      gender: "male",
      type: "person",
    },
    saju: {
      day: { earthlyBranch: "IN" as any, heavenlyStem: "GAP" as any },
      dayMaster: "GAP" as any,
      gender: "male",
      hour: { earthlyBranch: "SA" as any, heavenlyStem: "JEONG" as any },
      isLunar: false,
      month: { earthlyBranch: "JA" as any, heavenlyStem: "BYEONG" as any },
      year: { earthlyBranch: "O" as any, heavenlyStem: "GYEONG" as any },
    },
    westernZodiac: {
      element: "Earth",
      id: "capricorn",
      modality: "Cardinal",
      name: "Capricorn",
      season: "Winter",
    },
  } as any;

  it("should return Deterministic content for FREE tier", async () => {
    const result = await FortuneEngine.getDailyFortune(
      mockProfile,
      "en",
      "FREE",
    );

    expect(result.title).toMatch(
      /The Silent Flow|Deterministic Wisdom|Cosmic Origin|ORACLE_SECTION_COSMIC_ENTRY_TITLE/,
    );
    expect(result.description).toMatch(
      /Analysis based purely on your elemental coordinates|Your cosmic fingerprint revealed|ORACLE_SUMMARY/,
    );
  });

  it("should return Mock/AI content for OFFERING tier (when no API Key)", async () => {
    // Assuming no API key in test env
    const result = await FortuneEngine.getDailyFortune(
      mockProfile,
      "en",
      "OFFERING",
    );

    // The mock output title is "The Silent Stars"
    expect(result.title).toBe("The Silent Stars");
    expect(result.description).toBe(
      "Even when the skies are quiet, your heart beats with purpose.",
    );
  });

  it("should return Mock/AI content for SUBSCRIBER tier (when no API Key)", async () => {
    const result = await FortuneEngine.getDailyFortune(
      mockProfile,
      "en",
      "SUBSCRIBER",
    );

    expect(result.title).toBe("The Silent Stars");
  });
});
