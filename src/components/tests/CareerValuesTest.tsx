import { useRef, useState } from "react";

import {
  CAREER_VALUE_IDS,
  CAREER_VALUES_INSTRUMENT,
  buildCareerValuesResult,
  careerValuesCopy,
  careerValuesPrompts,
  rankedCareerValueGroups,
  recordAssessmentResult,
  type AssessmentLocale,
  type CareerValueId,
} from "@/assessments";
import { gaEvent } from "@/lib/analytics/ga-event";
import { recordTestResult } from "@/lib/user/test-results";
import { Questionnaire } from "@/components/ui/questionnaire";

const LOCALES: AssessmentLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const COLORS: Record<CareerValueId, string> = {
  security: "#2563eb", achievement: "#dc2626", autonomy: "#d97706",
  service: "#16a34a", creativity: "#435D31", status: "#ea580c",
};
const ANALYTICS_PARAMS = { test_id: "career-values", instrument_version: CAREER_VALUES_INSTRUMENT.version } as const;

function localizedLocale(value?: string): AssessmentLocale {
  const normalized = value?.toLowerCase() ?? "en";
  return LOCALES.includes(normalized as AssessmentLocale) ? normalized as AssessmentLocale : "en";
}

export default function CareerValuesTest({ locale: localeProp }: { locale?: string }) {
  const locale = localizedLocale(localeProp);
  const copy = careerValuesCopy(locale);
  const prompts = careerValuesPrompts(locale);
  const started = useRef(false);
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [resultScores, setResultScores] = useState<Record<string, number> | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");

  function pick(value: number) {
    if (!started.current) {
      gaEvent("test_started", ANALYTICS_PARAMS);
      started.current = true;
    }
    const item = CAREER_VALUES_INSTRUMENT.items[current];
    const next = { ...responses, [item.id]: value };
    setResponses(next);
    if (current + 1 < CAREER_VALUES_INSTRUMENT.items.length) {
      setCurrent(current + 1);
      return;
    }

    const result = buildCareerValuesResult(next, { locale, sourcePath: `/${locale}/career-values-test` });
    recordAssessmentResult(result);
    const top = result.classifications.map((entry) => entry.label);
    recordTestResult({
      kind: "preference", locale, sourcePath: `/${locale}/career-values-test`, testId: "career-values",
      title: copy.title, resultLabel: top.join(" · "), result: { topDimensions: result.classifications.map((entry) => entry.constructId), normalizedScores: result.scores.normalized },
    });
    gaEvent("test_completed", ANALYTICS_PARAMS);
    setResultScores(result.scores.normalized);
  }

  function restart() {
    setCurrent(0);
    setResponses({});
    setResultScores(null);
    setShareStatus("idle");
    started.current = false;
  }

  async function share() {
    if (!resultScores) return;
    gaEvent("share_click", ANALYTICS_PARAMS);
    const top = rankedCareerValueGroups(resultScores)[0] ?? [];
    const text = `${copy.resultTitle}: ${top.map((id) => copy.dimensions[id].name).join(" · ")}\n${window.location.href}`;
    try {
      if (navigator.share) await navigator.share({ title: copy.title, text, url: window.location.href });
      else { await navigator.clipboard.writeText(text); setShareStatus("copied"); }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("failed");
    }
  }

  if (!resultScores) {
    const progress = Math.round((current / CAREER_VALUES_INSTRUMENT.items.length) * 100);
    return (
      <Questionnaire
        title={copy.title}
        subtitle={copy.subtitle}
        question={prompts[current]}
        questionLabel={copy.questionOf(current + 1, CAREER_VALUES_INSTRUMENT.items.length)}
        progress={progress}
        options={copy.scaleLabels.map((label, index) => ({ label, value: index + 1 }))}
        selectedValue={responses[CAREER_VALUES_INSTRUMENT.items[current].id]}
        note={copy.disclaimer}
        previousLabel={copy.previous}
        onPrevious={current > 0 ? () => setCurrent((value) => value - 1) : undefined}
        onSelect={pick}
      />
    );
  }

  const groups = rankedCareerValueGroups(resultScores);
  const topGroup = groups[0] ?? [];
  const sorted = groups.flat();
  return (
    <div className="space-y-7">
      <header className="space-y-3 text-center">
        <p className="text-sm text-slate-600">{copy.resultTitle}</p>
        <h2 className="text-xl font-bold">{copy.topGroup}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {topGroup.map((id) => <span key={id} className="rounded-full px-4 py-2 font-bold text-white" style={{ backgroundColor: COLORS[id] }}>{copy.dimensions[id].name}</span>)}
        </div>
        <p className="text-xs text-slate-500">{copy.tieNote}</p>
      </header>

      <section className="space-y-3 rounded-xl border bg-card p-5">
        <h3 className="font-bold">{copy.profile}</h3>
        {sorted.map((id) => {
          const score = resultScores[id] ?? 0;
          return <div key={id} className="space-y-1"><div className="flex justify-between text-sm"><span>{copy.dimensions[id].name}</span><span>{score}/100</span></div><div role="progressbar" aria-label={copy.dimensions[id].name} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full" style={{ width: `${score}%`, backgroundColor: COLORS[id] }} /></div></div>;
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {topGroup.map((id) => <article key={id} className="rounded-xl border bg-card p-5"><h3 className="text-lg font-bold" style={{ color: COLORS[id] }}>{copy.dimensions[id].name}</h3><p className="mt-2 text-sm leading-6 text-slate-700">{copy.dimensions[id].description}</p><h4 className="mt-4 text-sm font-semibold">{copy.environments}</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{copy.dimensions[id].environments.map((item) => <li key={item}>{item}</li>)}</ul></article>)}
      </section>

      <p className="rounded-xl bg-surface-subtle p-4 text-sm leading-6 text-foreground">{copy.reflection}</p>
      <p className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-900">{copy.disclaimer}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={restart} className="rounded-lg border bg-card px-5 py-2.5 text-sm font-semibold">{copy.restart}</button>
        <button type="button" onClick={share} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{copy.share}</button>
      </div>
      <p aria-live="polite" className="text-center text-xs text-slate-600">{shareStatus === "copied" ? copy.copied : shareStatus === "failed" ? copy.shareFailed : ""}</p>
    </div>
  );
}
