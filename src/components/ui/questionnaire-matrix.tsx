import * as React from "react";

import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/system/utils";

export type QuestionnaireMatrixQuestion = {
  id: string;
  text: string;
  options?: Array<{ label: string; value: number }>;
  columns?: 1 | 2;
};

type QuestionnaireMatrixProps = {
  title: string;
  description: string;
  questions: QuestionnaireMatrixQuestion[];
  options?: string[];
  answers: Record<string, number>;
  beforeQuestions?: React.ReactNode;
  completedLabel: (completed: number, total: number) => string;
  unansweredLabel: (count: number) => string;
  submitLabel: string;
  validationLabel: string;
  onAnswer: (questionId: string, value: number) => void;
  onSubmit: () => void;
};

export function getQuestionnaireMatrixStatus(
  questions: QuestionnaireMatrixQuestion[],
  answers: Record<string, number>,
) {
  const firstMissingIndex = questions.findIndex((question) => answers[question.id] == null);
  const completed = questions.filter((question) => answers[question.id] != null).length;

  return {
    completed,
    firstMissingIndex,
    isComplete: firstMissingIndex === -1,
    progress: questions.length === 0 ? 0 : Math.round((completed / questions.length) * 100),
  };
}

export function QuestionnaireMatrix({
  title,
  description,
  questions,
  options,
  answers,
  beforeQuestions,
  completedLabel,
  unansweredLabel,
  submitLabel,
  validationLabel,
  onAnswer,
  onSubmit,
}: QuestionnaireMatrixProps) {
  const [showValidation, setShowValidation] = React.useState(false);
  const legendsRef = React.useRef<Array<HTMLLegendElement | null>>([]);
  const status = getQuestionnaireMatrixStatus(questions, answers);
  const unanswered = questions.length - status.completed;

  function submit() {
    if (!status.isComplete) {
      setShowValidation(true);
      legendsRef.current[status.firstMissingIndex]?.focus({ preventScroll: true });
      legendsRef.current[status.firstMissingIndex]?.scrollIntoView({ block: "center", behavior: "auto" });
      return;
    }
    onSubmit();
  }

  return (
    <section className="not-prose mx-auto my-10 max-w-2xl space-y-8 rounded-2xl border bg-card p-4 shadow-sm sm:p-8" aria-labelledby="questionnaire-matrix-title">
      <header className="space-y-2 text-center">
        <h1 id="questionnaire-matrix-title" className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span aria-live="polite">{completedLabel(status.completed, questions.length)}</span>
          <span>{status.progress}%</span>
        </div>
        <Progress value={status.progress} aria-label={completedLabel(status.completed, questions.length)} className="bg-muted" indicatorClassName="bg-green-600 motion-reduce:transition-none" />
        <p className="text-right text-xs text-muted-foreground">{unansweredLabel(unanswered)}</p>
      </div>

      {beforeQuestions}

      <div className="space-y-5">
        {questions.map((question, questionIndex) => {
          const questionOptions = question.options ?? (options ?? []).map((label, index) => ({ label, value: index + 1 }));
          return (
            <FieldSet key={question.id} className={cn("rounded-xl border bg-background p-4 sm:p-5", showValidation && answers[question.id] == null && "border-destructive")}>
              <FieldLegend ref={(node) => { legendsRef.current[questionIndex] = node; }} tabIndex={-1} className="text-left text-base">
                {questionIndex + 1}. {question.text}
              </FieldLegend>
              <FieldGroup
                className={cn(
                  "grid-cols-1",
                  question.columns === 1
                    ? "sm:grid-cols-1"
                    : question.options
                      ? "sm:grid-cols-2"
                      : "sm:grid-cols-5",
                )}
                aria-label={question.text}
              >
                {questionOptions.map((option, optionIndex) => {
                  const value = option.value;
                  const selected = answers[question.id] === value;
                  return (
                    <button
                      key={`${option.label}-${optionIndex}`}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => { onAnswer(question.id, value); setShowValidation(false); }}
                      className={cn(
                        "min-h-12 rounded-lg border bg-muted/40 px-2 py-2 text-xs text-muted-foreground outline-none transition-colors motion-reduce:transition-none",
                        "hover:border-green-500 hover:bg-surface-subtle focus-visible:border-green-600 focus-visible:ring-2 focus-visible:ring-green-600/30",
                        selected && "border-green-600 bg-green-600 font-semibold text-white hover:bg-green-700",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </FieldGroup>
            </FieldSet>
          );
        })}
      </div>

      {showValidation && !status.isComplete ? (
        <p role="alert" className="text-center text-sm font-medium text-destructive">{validationLabel}</p>
      ) : null}

      <div className="flex justify-center pt-2">
        <Button type="button" size="lg" variant={status.isComplete ? "default" : "secondary"} onClick={submit}>
          {submitLabel}
        </Button>
      </div>
    </section>
  );
}
