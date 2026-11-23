import { describe, expect, it } from "vitest";
import { SEASON_QUIZZES } from "@/data/season-quizzes";
import { majorityType, QUIZ_LANGS } from "@/data/season-quizzes/types";

describe("season type quizzes", () => {
  it("has twenty-three quizzes with unique slugs and ids", () => {
    expect(SEASON_QUIZZES).toHaveLength(23);
    expect(new Set(SEASON_QUIZZES.map((q) => q.slug)).size).toBe(SEASON_QUIZZES.length);
    expect(new Set(SEASON_QUIZZES.map((q) => q.id)).size).toBe(SEASON_QUIZZES.length);
  });

  for (const q of SEASON_QUIZZES) {
    describe(q.slug, () => {
      it("every locale has 8 questions, each covering all 5 types once", () => {
        expect(q.types).toHaveLength(5);
        for (const l of QUIZ_LANGS) {
          expect(q.questions[l]).toHaveLength(8);
          for (const item of q.questions[l]) {
            expect(item.text.trim()).not.toBe("");
            expect(item.options.map(([, t]) => t).sort()).toEqual([...q.types].sort());
            for (const [label] of item.options) expect(label.trim()).not.toBe("");
          }
        }
      });
      it("every type has a full result in 6 languages and a different, valid match", () => {
        for (const t of q.types) {
          for (const l of QUIZ_LANGS) {
            const r = q.results[t][l];
            for (const v of [r.emoji, r.title, r.tagline, r.description, r.tip]) expect(v.trim()).not.toBe("");
            expect(r.match).not.toBe(t);
            expect(q.types).toContain(r.match);
            expect(r.match).toBe(q.results[t].ko.match);
          }
        }
      });
      it("has UI and page copy with FAQs in 6 languages", () => {
        for (const l of QUIZ_LANGS) {
          expect(q.ui[l].title.trim()).not.toBe("");
          expect(q.page[l].faqs.length).toBeGreaterThanOrEqual(3);
          expect(q.page[l].intro.length).toBeGreaterThan(40);
        }
      });
    });
  }

  it("majority wins; ties go to the most recent answer", () => {
    expect(majorityType(["a", "a", "b"])).toBe("a");
    expect(majorityType(["a", "b"])).toBe("b");
    expect(majorityType(["a", "b", "b", "a"])).toBe("a");
  });
});
