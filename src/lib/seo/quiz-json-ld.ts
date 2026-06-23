export interface QuizJsonLdQuestionInput {
  name: string;
  suggestedAnswers?: string[];
}

export interface QuizJsonLdInput {
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  questionCount?: number;
  questions: QuizJsonLdQuestionInput[];
  outcomeNames?: string[];
}

export interface QuizJsonLdQuestion {
  "@type": "Question";
  name: string;
  suggestedAnswer?: Array<{ "@type": "Answer"; text: string }>;
}

export interface QuizJsonLd {
  "@context": "https://schema.org";
  "@type": "Quiz";
  name: string;
  description: string;
  url: string;
  inLanguage: string;
  numberOfQuestions: number;
  educationalAlignment: {
    "@type": "AlignmentObject";
    alignmentType: "educationalSubject";
    targetName: "Personality assessment";
  };
  hasPart: QuizJsonLdQuestion[];
  assesses?: string[];
}

function nonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function buildQuestion(question: QuizJsonLdQuestionInput): QuizJsonLdQuestion {
  const suggestedAnswers = question.suggestedAnswers?.filter(nonEmpty);
  const schemaQuestion: QuizJsonLdQuestion = {
    "@type": "Question",
    name: question.name,
  };

  if (suggestedAnswers && suggestedAnswers.length > 0) {
    schemaQuestion.suggestedAnswer = suggestedAnswers.map((answer) => ({
      "@type": "Answer",
      text: answer,
    }));
  }

  return schemaQuestion;
}

export function buildQuizJsonLd(input: QuizJsonLdInput): QuizJsonLd {
  const questions = input.questions.filter((question) => nonEmpty(question.name));
  const outcomes = input.outcomeNames?.filter(nonEmpty);

  const quiz: QuizJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: input.inLanguage,
    numberOfQuestions: input.questionCount ?? questions.length,
    educationalAlignment: {
      "@type": "AlignmentObject",
      alignmentType: "educationalSubject",
      targetName: "Personality assessment",
    },
    hasPart: questions.map(buildQuestion),
  };

  if (outcomes && outcomes.length > 0) {
    quiz.assesses = outcomes;
  }

  return quiz;
}
