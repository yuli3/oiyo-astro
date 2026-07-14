import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/engines/ai/oracle-voice", () => ({
  generateResonanceNarrative: vi.fn(),
}));
vi.mock("@/lib/resonance/mbti-resonance/engine", () => ({
  calculateMBTIResonance: vi.fn(),
}));

import { calculateSacredResonance } from "./engine";

const ORIGINAL_TZ = process.env.TZ;

describe("sacred resonance birth date boundary", () => {
  afterEach(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it("keeps civil-date dimensions stable across runtime timezones", () => {
    const snapshots = ["UTC", "Asia/Seoul", "America/New_York"].map((tz) => {
      process.env.TZ = tz;
      const result = calculateSacredResonance(
        { birthDate: "1990-01-01", bloodType: "A", gender: "female" },
        { birthDate: "1990-12-31", bloodType: "O", gender: "male", name: "Partner" },
      );
      return result.dimensions
        .filter(({ id }) => ["celtic", "cosmic", "egyptian", "mayan"].includes(id))
        .map(({ id, isSimulated, score }) => ({ id, isSimulated, score }));
    });

    expect(snapshots[1]).toEqual(snapshots[0]);
    expect(snapshots[2]).toEqual(snapshots[0]);
  });

  it("does not invent exact Saju from civil dates and wall-clock strings", () => {
    const unresolved = calculateSacredResonance(
      { birthDate: "1990-05-15", birthTime: { hour: 9, minute: 0 }, gender: "female" },
      { birthDate: "1991-06-16", birthTime: "09:00", gender: "male", name: "Partner" },
    );
    expect(unresolved.dimensions.find(({ id }) => id === "saju")?.isSimulated).toBe(true);

    const resolved = calculateSacredResonance(
      {
        birthDate: "1990-05-15",
        birthInstant: new Date("1990-05-15T00:00:00.000Z"),
        birthLongitude: 126.978,
        gender: "female",
      },
      {
        birthDate: "1991-06-16",
        birthInstant: new Date("1991-06-16T00:00:00.000Z"),
        birthLongitude: 139.6503,
        gender: "male",
        name: "Partner",
      },
    );
    expect(resolved.dimensions.find(({ id }) => id === "saju")?.isSimulated).toBe(false);
  });
});
