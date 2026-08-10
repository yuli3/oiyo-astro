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
};

export function Questionnaire<TValue extends QuestionnaireValue = number>({
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
}: QuestionnaireProps<TValue>) {
  const legendRef = React.useRef<HTMLLegendElement>(null);

  React.useEffect(() => {
    legendRef.current?.focus({ preventScroll: true });
  }, [question]);

  return (
    <section className="space-y-6" aria-labelledby="questionnaire-title">
      <header className="space-y-2 text-center">
        <h1 id="questionnaire-title" className="text-2xl font-bold">
          {title}
        </h1>
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
          indicatorClassName="bg-green-600 motion-reduce:transition-none"
        />
      </div>

      <FieldSet className="rounded-xl border bg-card p-4 sm:p-6">
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
                onClick={() => onSelect(option.value)}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-lg border bg-background px-4 py-3 text-left text-sm outline-none transition-colors motion-reduce:transition-none",
                  "hover:border-green-500 hover:bg-green-50 focus-visible:border-green-600 focus-visible:ring-2 focus-visible:ring-green-600/30",
                  selected && "border-green-600 bg-green-50 text-green-950",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-6 flex-none items-center justify-center rounded-full border-2 border-green-600 text-xs font-bold text-green-700",
                    selected && "bg-green-600 text-white",
                  )}
                >
                  {typeof option.value === "number" ? option.value : selected ? "✓" : ""}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </FieldGroup>
      </FieldSet>

      {onPrevious && previousLabel ? (
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onPrevious}>
          {previousLabel}
        </Button>
      ) : null}

      {note ? <FieldDescription className="text-center">{note}</FieldDescription> : null}
    </section>
  );
}
