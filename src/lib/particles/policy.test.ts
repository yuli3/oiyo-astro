import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SCREENING_TEST_IDS, revealPresetFor } from "./policy";
import { particleAlpha, spawnReveal, stepParticles } from "./engine";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("reveal policy", () => {
  it("never celebrates a screening result", () => {
    for (const testId of SCREENING_TEST_IDS) {
      expect(revealPresetFor({ testId, kind: "psychometric" })).toBeNull();
    }
  });

  it("covers every screening component the questionnaire audit knows", () => {
    // 두 목록이 갈라지면 새 선별검사에 축하 연출이 붙는다.
    const audit = readFileSync(resolve(root, "scripts/audit-questionnaire-cohorts.mjs"), "utf8");
    const block = audit.match(/const SCREENING = new Set\(\[([\s\S]*?)\]\)/)?.[1] ?? "";
    const files = [...block.matchAll(/"([A-Za-z]+\.tsx)"/g)].map((m) => m[1]);
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const src = readFileSync(resolve(root, "src/components/tests", file), "utf8");
      const ids = [...src.matchAll(/testId:\s*["']([^"']+)["']/g)].map((m) => m[1]);
      expect(ids.length, file).toBeGreaterThan(0);
      for (const id of ids) expect(SCREENING_TEST_IDS.has(id), `${file} → ${id}`).toBe(true);
    }
  });

  it("picks stardust for mystic and fortune, bloom otherwise", () => {
    expect(revealPresetFor({ testId: "tarot", kind: "mystic" })).toBe("stardust");
    expect(revealPresetFor({ testId: "daily", kind: "fortune" })).toBe("stardust");
    expect(revealPresetFor({ testId: "mbti", kind: "psychometric" })).toBe("bloom");
  });

  it("ignores events without a result", () => {
    expect(revealPresetFor(undefined)).toBeNull();
    expect(revealPresetFor({})).toBeNull();
  });
});

describe("reveal particles", () => {
  it("burn out within a few seconds", () => {
    for (const preset of ["bloom", "stardust"] as const) {
      const particles = spawnReveal(preset, 800, 600, () => 0.5);
      let alive = true;
      let t = 0;
      while (alive && t < 10) {
        alive = stepParticles(particles, 1 / 60, preset);
        t += 1 / 60;
      }
      expect(t).toBeLessThan(4);
      for (const p of particles) expect(particleAlpha(p)).toBe(0);
    }
  });
});
