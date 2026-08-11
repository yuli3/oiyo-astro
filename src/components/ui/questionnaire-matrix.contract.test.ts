import { describe, expect, it } from "vitest";

import { getQuestionnaireMatrixStatus } from "./questionnaire-matrix";

const questions = [
  { id: "q1", text: "One" },
  { id: "q2", text: "Two" },
  { id: "q3", text: "Three" },
];

describe("QuestionnaireMatrix status", () => {
  it("starts at zero and identifies the first missing question", () => {
    expect(getQuestionnaireMatrixStatus(questions, {})).toEqual({
      completed: 0,
      firstMissingIndex: 0,
      isComplete: false,
      progress: 0,
    });
  });

  it("counts non-sequential answers and jumps to the first missing question", () => {
    expect(getQuestionnaireMatrixStatus(questions, { q1: 1, q3: 5 })).toEqual({
      completed: 2,
      firstMissingIndex: 1,
      isComplete: false,
      progress: 67,
    });
  });

  it("allows submission only after every question is answered", () => {
    expect(getQuestionnaireMatrixStatus(questions, { q1: -3, q2: 0, q3: 5 })).toEqual({
      completed: 3,
      firstMissingIndex: -1,
      isComplete: true,
      progress: 100,
    });
  });
});
