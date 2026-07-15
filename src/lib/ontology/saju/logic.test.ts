import { afterEach, describe, expect, it } from "vitest";

import { getSolarTermDate } from "../kernel/astronomy";
import {
  calculateGreatFortune,
  calculateTrueSolarTime,
} from "../../ontology/saju-core/advanced-logic";
import { calculateSaju } from "./logic";
import { EarthlyBranch, HeavenlyStem } from "./types";

// The golden data below is cut in KST, but nothing in the engine may depend on the
// runtime timezone — the "Timezone independence" block flips process.env.TZ to prove
// it. Node re-reads TZ on assignment, so always restore it.
const ORIGINAL_TZ = process.env.TZ;

describe("Saju Logic Golden Suite", () => {
  afterEach(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  describe("Layer 2.1: True Solar Time (TST) Correction", () => {
    // TC-03: Global Longitude Check
    it("should derive the solar clock from the birth longitude, not the runtime timezone", () => {
      // Birth instant: 2024-01-01 11:40 KST (= 02:40 UTC).
      // TST = UTC + longitude x 4min + EoT (EoT ~ -3.5min on Jan 1), and the TST
      // wall clock is carried in the returned Date's UTC fields.
      // Hour branches here run on the 30-minute-shifted convention (Sa = 09:30-11:29,
      // O = 11:30-13:29), so this instant straddles the Sa/O boundary:
      //   Tokyo (135.0E): 02:40 + 9h00m - 3.5m ~ 11:36 -> O (Horse)
      //   Seoul (127.0E): 02:40 + 8h28m - 3.5m ~ 11:04 -> Sa (Snake)
      const birthDate = new Date("2024-01-01T11:40:00+09:00");

      const tstTokyo = calculateTrueSolarTime(birthDate, 135.0);
      const tstSeoul = calculateTrueSolarTime(birthDate, 127.0);

      expect(tstTokyo.getUTCHours()).toBe(11);
      expect(tstTokyo.getUTCMinutes()).toBe(36);

      expect(tstSeoul.getUTCHours()).toBe(11);
      expect(tstSeoul.getUTCMinutes()).toBe(4);

      // The 32-minute Seoul/Tokyo meridian gap must still move the hour pillar.
      expect(calculateSaju(birthDate, false, "male", 135.0).hour.earthlyBranch).toBe(
        EarthlyBranch.O, // Horse
      );
      expect(calculateSaju(birthDate, false, "male", 127.0).hour.earthlyBranch).toBe(
        EarthlyBranch.SA, // Snake
      );
    });
  });

  describe("Layer 2.4: Timezone independence (regression guard)", () => {
    // The engine used to derive the standard meridian from the *runtime* timezone
    // (date.getTimezoneOffset()), so the same birth data produced different pillars
    // for a visitor in Seoul and a visitor in New York. The pillars must depend on
    // the birth instant and the birth longitude only.
    const ZONES = ["Asia/Seoul", "UTC", "America/New_York", "Asia/Kolkata"];

    const pillarsOf = (date: Date, longitude: number) => {
      const r = calculateSaju(date, false, "male", longitude);
      return [r.year, r.month, r.day, r.hour]
        .map((p) => `${p.heavenlyStem}-${p.earthlyBranch}`)
        .join(" ");
    };

    // Birth instants spread across hour-pillar boundaries, seasons and decades.
    const BIRTHS = [
      "1985-03-21T00:10:00+09:00",
      "1990-06-15T14:30:00+09:00",
      "2000-05-15T07:45:00+09:00",
      "2012-11-07T13:00:00+09:00",
      "2024-01-01T23:45:00+09:00",
    ];

    it.each(BIRTHS)("yields identical pillars in every timezone: %s", (iso) => {
      const date = new Date(iso);

      for (const longitude of [135.0, 127.0]) {
        const offsets: number[] = [];
        const results = ZONES.map((tz) => {
          process.env.TZ = tz;
          offsets.push(new Date(iso).getTimezoneOffset());
          return pillarsOf(date, longitude);
        });
        process.env.TZ = ORIGINAL_TZ;

        // Guard: if flipping process.env.TZ did not actually move the runtime clock,
        // the equality below would pass vacuously and prove nothing.
        expect(new Set(offsets).size).toBe(ZONES.length);

        // Every zone must agree with Asia/Seoul, the frame the golden data was cut in.
        expect(new Set(results).size).toBe(1);
      }
    });
  });

  describe("Layer 2.5: Year pillar correctness (absolute anchors)", () => {
    // The suite above only proves every timezone agrees — it cannot catch an
    // engine that is consistently wrong. It was: getSolarTermDate(y, 0) returned
    // the *following* year's Ipchun, so `birthDate < ipchun` was always true and
    // every year pillar came out one sexagenary year early. These anchors are
    // external facts, not engine output.
    const SEOUL = 126.98;
    const pillarOf = (utcMs: number) => {
      const r = calculateSaju(new Date(utcMs), false, "male", SEOUL);
      return `${r.year.heavenlyStem}-${r.year.earthlyBranch}`;
    };

    it("pins known sexagenary years (well clear of the Ipchun cut)", () => {
      // 1984 갑자 · 2000 경진 · 2024 갑진
      expect(pillarOf(Date.UTC(1984, 5, 1, 3))).toBe("GAP-JA");
      expect(pillarOf(Date.UTC(2000, 5, 1, 3))).toBe("GYEONG-JIN");
      expect(pillarOf(Date.UTC(2024, 5, 1, 3))).toBe("GAP-JIN");
    });

    it("switches the year pillar at Ipchun, not at New Year", () => {
      // Ipchun 2024 falls on Feb 4.
      expect(pillarOf(Date.UTC(2024, 1, 1, 3))).toBe("GYE-MYO"); // before → 2023
      expect(pillarOf(Date.UTC(2024, 1, 10, 3))).toBe("GAP-JIN"); // after → 2024
    });

    it("places Ipchun in the year it was asked for", () => {
      const ipchun = getSolarTermDate(2024, 0);
      expect(ipchun.getUTCFullYear()).toBe(2024);
      expect(ipchun.getUTCMonth()).toBe(1); // February
    });
  });

  describe("Layer 2.6: Month pillar correctness (절기 anchors)", () => {
    // Month branch is set by the sun's longitude, not the calendar date. A prior
    // fix moved 소한/대한 into January of the *same* Gregorian year, which made the
    // old descending getSolarTermDate scan collapse every mid-year month pillar to
    // 축월 (Ox). These are external 만세력 facts across all four seasons.
    const full = (iso: string) => {
      const r = calculateSaju(new Date(iso), false, "male", 135.0);
      return `${r.year.heavenlyStem}-${r.year.earthlyBranch} ${r.month.heavenlyStem}-${r.month.earthlyBranch}`;
    };

    it("pins known year+month pillars across the seasons", () => {
      expect(full("2000-05-15T11:00:00+09:00")).toBe("GYEONG-JIN SIN-SA"); // 입하~소만, 巳月
      expect(full("2024-06-01T11:00:00+09:00")).toBe("GAP-JIN GI-SA"); //   소만~망종, 巳月
      expect(full("2024-08-31T11:00:00+09:00")).toBe("GAP-JIN IM-SIN"); //  처서, 申月
      expect(full("2024-12-25T11:00:00+09:00")).toBe("GAP-JIN BYEONG-JA"); // 동지, 子月
      expect(full("2024-01-10T11:00:00+09:00")).toBe("GYE-MYO EUL-CHUK"); // 소한, 丑月 (前 입춘)
    });

    it("switches the month branch at the seasonal node, not the calendar month", () => {
      // Ipchun (315 deg) opens 寅月; a birth on Ipchun evening is already In/Tiger.
      expect(full("2024-02-04T18:00:00+09:00")).toBe("GAP-JIN BYEONG-IN");
      // The day before is still the previous (丑/Ox) month — and the previous year.
      expect(full("2024-02-03T18:00:00+09:00")).toBe("GYE-MYO EUL-CHUK");
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
