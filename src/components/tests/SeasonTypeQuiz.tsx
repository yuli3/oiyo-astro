// 시즌 유형 테스트 공용 화면 (2026-11-22). 문항·결과는 data/season-quizzes/*.ts.
// 페이지가 해당 언어 몫만 잘라서 props로 넘긴다 — 6개 언어 전체를 번들에 싣지 않기 위해서다.
import { useState } from "react";
import { Questionnaire } from "@/components/ui/questionnaire";
import { gaEvent } from "@/lib/analytics/ga-event";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { majorityType, type QuizLang, type QuizQuestion, type QuizResult, type QuizUi } from "@/data/season-quizzes/types";
import ShareResultButton from "../shared/ShareResultButton";

const COMMON: Record<QuizLang, { prev: string; mix: string; restart: string }> = {
  ko: { prev: "이전 질문", mix: "내 답의 구성", restart: "다시 하기" },
  en: { prev: "Previous question", mix: "Your answers", restart: "Take it again" },
  ja: { prev: "前の質問", mix: "回答の内訳", restart: "もう一度" },
  zh: { prev: "上一题", mix: "你的答案构成", restart: "再测一次" },
  fr: { prev: "Question précédente", mix: "Vos réponses", restart: "Recommencer" },
  es: { prev: "Pregunta anterior", mix: "Tus respuestas", restart: "Repetir" },
};

export interface SeasonTypeQuizProps {
  testId: string;
  locale: string;
  lang: QuizLang;
  types: string[];
  ui: QuizUi;
  questions: QuizQuestion<string>[];
  results: Record<string, QuizResult<string>>;
}

export default function SeasonTypeQuiz({ testId, locale, lang, types, ui, questions, results }: SeasonTypeQuizProps) {
  const c = COMMON[lang];
  const [current, setCurrent] = useState(0);
  const [votes, setVotes] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  useRecordFinishedTest({ testId, title: ui.title, finished: Boolean(result) });

  function pick(type: string) {
    if (current === 0 && votes.length === 0) gaEvent("test_started", { test_id: testId });
    // 되돌아가 다시 고르면 그 뒤 응답은 버린다.
    const next = votes.slice(0, current);
    next[current] = type;
    setVotes(next);
    if (current + 1 >= questions.length) {
      const r = majorityType(next);
      setResult(r);
      gaEvent("test_completed", { test_id: testId, result: r });
    }
    setCurrent(current + 1);
  }

  if (!result) {
    const q = questions[current];
    return (
      <Questionnaire<string>
        title={ui.title}
        subtitle={ui.subtitle}
        question={q.text}
        questionLabel={`${current + 1} / ${questions.length}`}
        progress={Math.round((current / questions.length) * 100)}
        options={q.options.map(([label, value]) => ({ label, value }))}
        selectedValue={votes[current]}
        note={ui.note}
        previousLabel={c.prev}
        onPrevious={current > 0 ? () => setCurrent(current - 1) : undefined}
        onSelect={(v) => pick(v)}
      />
    );
  }

  const r = results[result];
  const m = results[r.match];
  const counts = types.map((k) => ({ k, n: votes.filter((v) => v === k).length }));
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">{ui.your}</p>
        <h1 className="text-3xl font-black text-foreground">
          <span aria-hidden="true">{r.emoji}</span> {r.title}
        </h1>
        <p className="font-bold text-primary">{r.tagline}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{r.description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold text-foreground">{ui.tip}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{r.tip}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-bold text-foreground">{ui.match}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{m.emoji} {m.title} · {m.tagline}</p>
        </div>
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold text-foreground">{c.mix}</h2>
        {counts.map(({ k, n }) => (
          <div key={k} className="flex items-center gap-2 text-xs">
            <span className="w-32 shrink-0 text-foreground">{results[k].emoji} {results[k].title}</span>
            <progress className="h-2 flex-1 accent-primary" value={n} max={questions.length} aria-label={results[k].title} />
            <span className="w-8 text-right text-muted-foreground">{n}/{questions.length}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => { setVotes([]); setCurrent(0); setResult(null); }}
        className="min-h-11 w-full rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground hover:bg-accent"
      >
        {c.restart}
      </button>
      <ShareResultButton locale={locale} heading={ui.title} resultTitle={r.title} emoji={r.emoji} description={r.tagline} analyticsId={testId} />
    </div>
  );
}
