import { DECISION_MAKING_QUESTIONS } from "./data";
import {
  DECISION_MAKING_DESCRIPTIONS,
  DECISION_MAKING_STRENGTHS,
  DECISION_MAKING_TRAITS,
  DecisionMakingResult,
  DecisionMakingType,
} from "./types";

export function calculateDecisionMakingResult(
  answers: Record<string, string>,
  locale: string = "en",
): DecisionMakingResult {
  const scores: Record<DecisionMakingType, number> = {
    analytical: 0,
    cautious: 0,
    collaborative: 0,
    creative: 0,
    decisive: 0,
    intuitive: 0,
  };

  Object.entries(answers).forEach(([questionId, optionId]) => {
    // Type-safe locale lookup
    const questions =
      locale in DECISION_MAKING_QUESTIONS
        ? DECISION_MAKING_QUESTIONS[
            locale as keyof typeof DECISION_MAKING_QUESTIONS
          ]
        : DECISION_MAKING_QUESTIONS.en;

    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const option = question.options.find((o) => o.id === optionId);
      if (option) {
        Object.entries(option.scores).forEach(([type, score]) => {
          scores[type as DecisionMakingType] += score as number;
        });
      }
    }
  });

  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0,
  );
  const percentages: Record<DecisionMakingType, number> = {} as Record<
    DecisionMakingType,
    number
  >;

  Object.entries(scores).forEach(([type, score]) => {
    percentages[type as DecisionMakingType] = Math.round(
      (score / totalScore) * 100,
    );
  });

  const sortedTypes = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([type]) => type as DecisionMakingType);

  const primary = sortedTypes[0];
  const secondary = sortedTypes[1];

  const challenges: Record<DecisionMakingType, string[]> = {
    analytical: [
      "May suffer from analysis paralysis",
      "Could miss time-sensitive opportunities",
      "Might overlook intuitive insights",
      "Can be seen as slow by others",
    ],
    cautious: [
      "May miss opportunities due to over-analysis",
      "Could be seen as indecisive or slow",
      "Might resist necessary changes",
      "May focus too much on potential negatives",
    ],
    collaborative: [
      "Can be time-consuming to reach consensus",
      "May dilute accountability for outcomes",
      "Could be swayed by group dynamics",
      "Might avoid necessary unpopular decisions",
    ],
    creative: [
      "May propose solutions that are too unconventional",
      "Could overlook practical constraints",
      "Might struggle with routine decisions",
      "May not appeal to risk-averse stakeholders",
    ],
    decisive: [
      "May make hasty decisions without full consideration",
      "Could appear impulsive or reckless",
      "Might not consider all stakeholder impacts",
      "May struggle with complex, nuanced decisions",
    ],
    intuitive: [
      "May make decisions without sufficient information",
      "Could struggle to explain reasoning to others",
      "Might be inconsistent in decision quality",
      "May ignore important data points",
    ],
  };

  const idealSituations: Record<DecisionMakingType, string[]> = {
    analytical: [
      "Complex strategic planning decisions",
      "Investment and financial choices",
      "Technical problem-solving scenarios",
      "High-stakes decisions requiring justification",
    ],
    cautious: [
      "Safety and compliance decisions",
      "Large financial investments",
      "Decisions with significant consequences",
      "Situations requiring risk management",
    ],
    collaborative: [
      "Team-building and organizational change",
      "Decisions affecting multiple stakeholders",
      "Building consensus and buy-in",
      "Complex group dynamics situations",
    ],
    creative: [
      "Innovation and product development",
      "Problem-solving for unique challenges",
      "Artistic and design decisions",
      "Breakthrough thinking requirements",
    ],
    decisive: [
      "Crisis management and emergency situations",
      "Competitive business environments",
      "Leadership roles requiring quick action",
      "Opportunities with tight time windows",
    ],
    intuitive: [
      "People-related decisions and hiring",
      "Creative and innovative challenges",
      "Time-sensitive crisis situations",
      "Situations requiring reading between the lines",
    ],
  };

  const improvementTips: Record<DecisionMakingType, string[]> = {
    analytical: [
      "Set time limits for analysis to avoid paralysis",
      "Practice making quick decisions on low-stakes issues",
      "Include intuitive factors in your analysis framework",
      "Learn to communicate your reasoning clearly to others",
    ],
    cautious: [
      "Practice making small decisions quickly to build confidence",
      "Set deadlines for decision-making to avoid endless analysis",
      "Focus on potential positive outcomes, not just risks",
      "Develop comfort with calculated risk-taking",
    ],
    collaborative: [
      "Learn to make individual decisions when time is limited",
      "Practice guiding groups toward efficient consensus",
      "Develop skills in managing difficult conversations",
      "Balance inclusion with accountability",
    ],
    creative: [
      "Learn to evaluate the feasibility of creative solutions",
      "Practice explaining unconventional ideas in practical terms",
      "Develop skills in implementing creative solutions",
      "Balance innovation with practical constraints",
    ],
    decisive: [
      "Build in brief reflection time before major decisions",
      "Develop systems for gathering quick but essential information",
      "Practice considering stakeholder impacts more thoroughly",
      "Learn to communicate the reasoning behind quick decisions",
    ],
    intuitive: [
      "Validate important decisions with some data analysis",
      "Practice articulating your reasoning process",
      "Seek feedback on decision outcomes to calibrate intuition",
      "Balance gut feelings with logical considerations",
    ],
  };

  return {
    challenges: challenges[primary],
    description: (
      (locale in DECISION_MAKING_DESCRIPTIONS
        ? DECISION_MAKING_DESCRIPTIONS[
            locale as keyof typeof DECISION_MAKING_DESCRIPTIONS
          ]
        : DECISION_MAKING_DESCRIPTIONS.en) as Record<DecisionMakingType, string>
    )[primary],
    idealSituations: idealSituations[primary],
    improvementTips: improvementTips[primary],
    percentages,
    primary,
    scores,
    secondary,
    strengths: DECISION_MAKING_STRENGTHS[primary],
    traits: DECISION_MAKING_TRAITS[primary],
  };
}
