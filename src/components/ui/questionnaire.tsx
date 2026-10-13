import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/system/utils";

export type QuestionnaireValue = string | number;

export type QuestionnaireOption<TValue extends QuestionnaireValue = number> = {
  label: string;
  value: TValue;
  indicator?: React.ReactNode;
};

type QuestionnaireProps<TValue extends QuestionnaireValue = number> = {
  title: string;
  subtitle: string;
  question: string;
  questionLabel: string;
  progress: number;
  options: QuestionnaireOption<TValue>[];
  selectedValue?: TValue;
  note?: string;
  previousLabel?: string;
  onPrevious?: () => void;
  onSelect: (value: TValue) => void;
  /**
   * 2026-09-28: 페이지에 이미 h1 이 있는데 검사를 그 안에 끼워 넣을 때만 2로 준다
   * (fr 수면 계산기 페이지). 기본 1 — 대부분 검사에서 이 제목이 유일한 h1 이다.
   */
  headingLevel?: 1 | 2;
};

export function Questionnaire<TValue extends QuestionnaireValue = number>(props: QuestionnaireProps<TValue>) {
  // 2026-10-09: answer updates are not a new question. Remount only at the displayed step boundary,
  // so delayed parents stay locked while identical-text consecutive questions and previous steps unlock.
  return <QuestionnaireStep key={JSON.stringify([props.questionLabel, props.question])} {...props} />;
}

function QuestionnaireStep<TValue extends QuestionnaireValue = number>({
  title,
  subtitle,
  question,
  questionLabel,
  progress,
  options,
  selectedValue,
  note,
  previousLabel,
  onPrevious,
  onSelect,
  headingLevel = 1,
}: QuestionnaireProps<TValue>) {
  const Heading = headingLevel === 2 ? "h2" : "h1";
  const legendRef = React.useRef<HTMLLegendElement>(null);
  const selectionRef = React.useRef(false);
  const [pending, setPending] = React.useState(false);

  function select(value: TValue) {
    // 2026-10-09: a state-only disabled flag commits after the event; the ref also blocks same-tick clicks.
    if (selectionRef.current) return;
    selectionRef.current = true;
    setPending(true);
    try {
      onSelect(value);
    } catch (error) {
      selectionRef.current = false;
      setPending(false);
      throw error;
    }
  }

  React.useEffect(() => {
    legendRef.current?.focus({ preventScroll: true });
  }, [question]);

  return (
    <section className="space-y-6" aria-labelledby="questionnaire-title">
      <header className="space-y-2 text-center">
        <Heading id="questionnaire-title" className="text-2xl font-bold">
          {title}
        </Heading>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <div className="space-y-2" aria-label={questionLabel}>
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span aria-live="polite">{questionLabel}</span>
          <span>{progress}%</span>
        </div>
        <Progress
          value={progress}
          aria-label={questionLabel}
          className="bg-muted"
          indicatorClassName="bg-primary motion-reduce:transition-none"
        />
      </div>

      <FieldSet disabled={pending} aria-busy={pending} className="rounded-xl border bg-card p-4 sm:p-6">
        <FieldLegend ref={legendRef} tabIndex={-1}>
          {question}
        </FieldLegend>
        <FieldGroup aria-label={question}>
          {options.map((option) => {
            const selected = option.value === selectedValue;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                disabled={pending}
                onClick={() => select(option.value)}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-lg border bg-background px-4 py-3 text-left text-sm outline-none transition-colors motion-reduce:transition-none",
                  "hover:border-green-500 hover:bg-surface-subtle focus-visible:border-green-600 focus-visible:ring-2 focus-visible:ring-green-600/30",
                  selected && "border-green-600 bg-surface-subtle text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-6 flex-none items-center justify-center rounded-full border-2 border-green-600 text-xs font-bold text-primary",
                    selected && "bg-primary text-primary-foreground",
                  )}
                >
                  {option.indicator ?? (typeof option.value === "number" ? option.value : selected ? "✓" : "")}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </FieldGroup>
      </FieldSet>

      {onPrevious && previousLabel ? (
        <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={pending} onClick={() => {
          if (!selectionRef.current) onPrevious();
        }}>
          {previousLabel}
        </Button>
      ) : null}

      {note ? <FieldDescription className="text-center">{note}</FieldDescription> : null}
    </section>
  );
}
