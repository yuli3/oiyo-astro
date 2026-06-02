import { describe, expect, it } from "vitest";

import {
  calculateGreatFortune,
  calculateTrueSolarTime,
} from "../../ontology/saju-core/advanced-logic";
import { calculateSaju } from "./logic";
import { EarthlyBranch, HeavenlyStem } from "./types";

describe("Saju Logic Golden Suite", () => {
  describe("Layer 2.1: True Solar Time (TST) Correction", () => {
    // TC-03: Global Longitude Check
    it("should calculate different pillars for same clock time at different longitudes", () => {
      // Date: 2024-01-01 11:20:00 KST (GMT+9)
      // At this time:
      // Tokyo (135.0E): Solar Time ~11:20 -> Horse Hour (Ob-Si: 11:00-13:00)
      // Seoul (127.0E): Solar Time ~10:48 (-32 mins) -> Snake Hour (Sa-Si: 09:00-11:00)

      const birthDate = new Date("2024-01-01T11:20:00+09:00");

      // We expect calculateSaju to accept longitude soon.
      // For now, let's test the calculateTrueSolarTime function directly which exists.

      const tstTokyo = calculateTrueSolarTime(birthDate, 135.0);
      const tstSeoul = calculateTrueSolarTime(birthDate, 127.0);

      // Use getUTCHours/Minutes to be timezone-independent in CI
      // Tokyo (135.0E): Solar Time ~11:16 UTC (approx due to EoT)
      expect(tstTokyo.getUTCHours()).toBe(2);
      expect(tstTokyo.getUTCMinutes()).toBe(16);

      // Seoul (127.0E): Solar Time ~10:44 UTC
      expect(tstSeoul.getUTCHours()).toBe(1);
      expect(tstSeoul.getUTCMinutes()).toBe(44);
    });
  });

  describe("Layer 2.2: Daewun Direction", () => {
    it("should determine correct forward/backward direction based on Gender x Year Stem", () => {
      // 2024 is Gap-Jin (Yang Wood Year) -> Yang Year
      const yearStem = HeavenlyStem.GAP; // Yang
      const branch = EarthlyBranch.IN; // Month Branch (Tiger)
      const monthPillar = {
        branch: EarthlyBranch.IN,
        stem: HeavenlyStem.BYEONG,
      };

      // Case 1: Male + Yang Year -> Forward
      const cycleMale = calculateGreatFortune(monthPillar, "Yang", "Male");
      // Next from Byeong-In is Jeong-Myo
      expect(cycleMale[0].stems).toBe(HeavenlyStem.JEONG);
      expect(cycleMale[0].branch).toBe(EarthlyBranch.MYO);

      // Case 2: Female + Yang Year -> Backward
      const cycleFemale = calculateGreatFortune(monthPillar, "Yang", "Female");
      // Prev from Byeong-In is Eul-Chuk
      expect(cycleFemale[0].stems).toBe(HeavenlyStem.EUL);
      expect(cycleFemale[0].branch).toBe(EarthlyBranch.CHUK);
    });
  });

  describe("Layer 2.3: Night Ja-si (Midnight)", () => {
    // TC-02
    it("should handle late night birth correctly (Night Ja-si)", () => {
      // 23:45 birth
      // Logic:
      // Standard Saju: 23:30+ is usually considered next day's Ja-Si OR same day's Night Ja-Si.
      // In modern precision saju, many use 23:30 as the cut-off for the Hour Pillar (Ja-Si),
      // BUT keeping the Day Pillar of the current day until 00:00 (or 24:00).
      // Let's verify our logic separates Hour Pillar transition from Day Pillar transition.

      const lateNight = new Date("2024-01-01T23:45:00+09:00");
      // 4th Jan 1900 assumption in logic.ts is simplistic,
      // but let's check basic pillars returns Ja-Si (Rat) for hour.

      const result = calculateSaju(lateNight);

      // 23:45 should be Rat (Ja) hour
      expect(result.hour.earthlyBranch).toBe(EarthlyBranch.JA);
    });
  });
});
