import { Questionnaire, type QuestionnaireOption } from "@/components/ui/questionnaire";

type ScreeningQuestionnaireProps = {
  title: string;
  subtitle: string;
  question: string;
  questionLabel: string;
  progress: number;
  options: QuestionnaireOption<number>[];
  screeningNote: string;
  supportMessage?: string;
  onSelect: (value: number) => void;
};

export function ScreeningQuestionnaire({
  title,
  subtitle,
  question,
  questionLabel,
  progress,
  options,
  screeningNote,
  supportMessage,
  onSelect,
}: ScreeningQuestionnaireProps) {
  return (
    <section className="space-y-4" aria-label={title}>
      {supportMessage ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-xs leading-relaxed text-green-900">{supportMessage}</p>
        </div>
      ) : null}
      <Questionnaire
        title={title}
        subtitle={subtitle}
        question={question}
        questionLabel={questionLabel}
        progress={progress}
        options={options}
        note={screeningNote}
        onSelect={onSelect}
      />
    </section>
  );
}
