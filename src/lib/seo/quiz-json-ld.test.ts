import { describe, expect, it } from "vitest";

import { buildQuizJsonLd } from "./quiz-json-ld";

describe("buildQuizJsonLd", () => {
  it("builds a schema.org Quiz graph with questions, answers, and scoring outcomes", () => {
    const quiz = buildQuizJsonLd({
      name: "MBTI Personality Test",
      description: "Answer 16 questions to map your four personality preferences.",
      url: "https://oiyo.net/en/mbti/test",
      inLanguage: "en",
      questionCount: 2,
      questions: [
        {
          name: "When your energy is low, you usually...",
          suggestedAnswers: [
            "Recharge by talking with people",
            "Recharge through quiet time alone",
          ],
        },
        {
          name: "When you meet new information, what grabs you first?",
          suggestedAnswers: [
            "Concrete facts and real examples",
            "Patterns, meanings, and possibilities",
          ],
        },
      ],
      outcomeNames: ["INTJ", "ENFP"],
    });

    expect(quiz["@context"]).toBe("https://schema.org");
    expect(quiz["@type"]).toBe("Quiz");
    expect(quiz.name).toBe("MBTI Personality Test");
    expect(quiz.url).toBe("https://oiyo.net/en/mbti/test");
    expect(quiz.inLanguage).toBe("en");
    expect(quiz.numberOfQuestions).toBe(2);
    expect(quiz.educationalAlignment).toEqual(
      expect.objectContaining({
        "@type": "AlignmentObject",
        alignmentType: "educationalSubject",
        targetName: "Personality assessment",
      }),
    );
    expect(quiz.hasPart).toHaveLength(2);
    expect(quiz.hasPart[0]).toEqual({
      "@type": "Question",
      name: "When your energy is low, you usually...",
      suggestedAnswer: [
        { "@type": "Answer", text: "Recharge by talking with people" },
        { "@type": "Answer", text: "Recharge through quiet time alone" },
      ],
    });
    expect(quiz.assesses).toEqual(["INTJ", "ENFP"]);
  });

  it("omits empty optional fields instead of emitting invalid blank schema values", () => {
    const quiz = buildQuizJsonLd({
      name: "Short Test",
      description: "A short quiz.",
      url: "https://oiyo.net/en/short-test",
      inLanguage: "en",
      questions: [{ name: "Pick one" }],
    });

    expect(quiz.numberOfQuestions).toBe(1);
    expect(quiz.assesses).toBeUndefined();
    expect(quiz.hasPart[0].suggestedAnswer).toBeUndefined();
  });
});
