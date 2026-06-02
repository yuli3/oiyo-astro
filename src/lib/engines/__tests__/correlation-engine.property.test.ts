import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { CorrelationEngine } from "../correlation-engine";

describe("CorrelationEngine Property-Based Tests", () => {
  const mbtiArbitrary = fc.constantFrom(
    "INTJ",
    "INTP",
    "ENTJ",
    "ENTP",
    "INFJ",
    "INFP",
    "ENFJ",
    "ENFP",
    "ISTJ",
    "ISFJ",
    "ESTJ",
    "ESFJ",
    "ISTP",
    "ISFP",
    "ESTP",
    "ESFP",
  );

  const elementArbitrary = fc.constantFrom(
    "wood",
    "fire",
    "earth",
    "metal",
    "water",
  );

  it("should always return valid insights for any valid Saju Element + MBTI combination", () => {
    fc.assert(
      fc.property(elementArbitrary, mbtiArbitrary, (element, mbti) => {
        // Construct a partial profile mocking the structure expected by the engine
        const mockProfile: any = {
          branches: {
            mbti: { type: mbti },
          },
          roots: {
            primal: {
              saju: { element },
            },
          },
        };

        console.log(`[DEBUG] Property run for ${element} + ${mbti}`);
        const insights = CorrelationEngine.analyze(
          mockProfile,
          null,
          null,
          "ko",
        );

        // Invariants
        expect(Array.isArray(insights)).toBe(true);
        if (insights.length > 0) {
          insights.forEach((insight) => {
            expect(insight).toHaveProperty("id");
            expect(insight).toHaveProperty("insight");
            expect(insight).toHaveProperty("advice");
            expect(insight.resonanceScore).toBeGreaterThanOrEqual(0);
            expect(insight.resonanceScore).toBeLessThanOrEqual(100);
          });
        }
      }),
      { numRuns: 10 },
    );
  });

  /*
  it('should handle garbage input gracefully without crashing', () => {
     fc.assert(
        fc.property(fc.string(), fc.string(), (garbageElement: string, garbageMBTI: string) => {
             const mockProfile: any = {
                roots: {
                  primal: {
                    saju: { element: garbageElement }
                  }
                },
                branches: {
                  mbti: { type: garbageMBTI }
                }
              };

            // Should not throw
            const insights = CorrelationEngine.analyze(mockProfile, null, null, 'ko');
            expect(Array.isArray(insights)).toBe(true);
        })
     ) 
  });
*/
});
