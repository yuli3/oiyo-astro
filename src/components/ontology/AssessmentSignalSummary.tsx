"use client";

import { useEffect, useMemo, useState } from "react";

import {
  collectAssessmentSignals,
  OIYO_ASSESSMENT_RESULTS_UPDATED_EVENT,
  type OntologySignal,
} from "@/assessments";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const LANGS: Lang[] = ["ko", "en", "ja", "zh", "fr", "es"];

const COPY: Record<Lang, {
  title: string;
  subtitle: string;
  big5: string;
  big5Role: string;
  big5Caveat: string;
  mbti: string;
  mbtiRole: string;
  mbtiCaveat: string;
  riasec: string;
  riasecRole: string;
  riasecCaveat: string;
  boundary: string;
  evidence: string;
  observed: string;
  strength: string;
  details: string;
  latest: string;
  low: string;
  reference: string;
  medium: string;
  research: string;
  reflective: string;
}> = {
  ko: { title: "검사로 본 나", subtitle: "성격 특성·선호 방식·직업 흥미는 서로 다른 층입니다. 점수를 합치지 않고 각각 보여드려요.", big5: "Big Five", big5Role: "성격 특성", big5Caveat: "행동 경향을 연속 점수로 본 결과이며 능력이나 고정 정체성이 아닙니다.", mbti: "MBTI", mbtiRole: "선호 경향", mbtiCaveat: "16유형은 네 선호축에서 파생한 자기성찰용 요약이며 공식 MBTI® 검사나 진단이 아닙니다.", riasec: "RIASEC", riasecRole: "직업 흥미", riasecCaveat: "현재 끌리는 활동 환경을 나타내며 직업 적합성·능력·채용 판단이 아닙니다.", boundary: "경계", evidence: "근거 수준", observed: "측정", strength: "신호 강도", details: "버전 정보", latest: "가장 최근 결과", low: "낮음", reference: "참고", medium: "보통", research: "연구 이론 기반 OIYO 간편검사", reflective: "자기성찰 프레임워크" },
  en: { title: "Me through assessments", subtitle: "Traits, preferences, and vocational interests are different layers. They are shown separately, never combined into one score.", big5: "Big Five", big5Role: "Personality traits", big5Caveat: "Continuous behavioral tendencies, not ability ratings or a fixed identity.", mbti: "MBTI", mbtiRole: "Preference patterns", mbtiCaveat: "The 16-type code is a reflective summary derived from four axes, not the official MBTI® assessment or a diagnosis.", riasec: "RIASEC", riasecRole: "Vocational interests", riasecCaveat: "Describes activities that currently appeal to you, not ability, hiring fitness, or career destiny.", boundary: "boundary", evidence: "Evidence", observed: "Observed", strength: "Signal strength", details: "Version details", latest: "latest result", low: "low", reference: "reference", medium: "moderate", research: "OIYO brief assessment inspired by research theory", reflective: "reflective framework" },
  ja: { title: "テストから見た私", subtitle: "性格特性・好み・職業興味は別の層です。一つの点数に混ぜず表示します。", big5: "Big Five", big5Role: "性格特性", big5Caveat: "行動傾向の連続スコアで、能力や固定された正体ではありません。", mbti: "MBTI", mbtiRole: "選好傾向", mbtiCaveat: "16タイプは4軸から導いた自己省察用の要約で、公式MBTI®検査や診断ではありません。", riasec: "RIASEC", riasecRole: "職業興味", riasecCaveat: "今ひかれる活動環境を示し、能力・採用適性・職業の運命を判定しません。", boundary: "境界", evidence: "根拠", observed: "測定", strength: "信号の強さ", details: "バージョン", latest: "最新結果", low: "低い", reference: "参考", medium: "中程度", research: "研究理論に基づくOIYO簡易テスト", reflective: "自己省察フレーム" },
  zh: { title: "测验中的我", subtitle: "人格特质、偏好方式与职业兴趣属于不同层次，不合并为一个分数。", big5: "Big Five", big5Role: "人格特质", big5Caveat: "这是连续的行为倾向，不代表能力或固定身份。", mbti: "MBTI", mbtiRole: "偏好倾向", mbtiCaveat: "16型是由四个偏好轴衍生的自我反思摘要，并非官方MBTI®测评或诊断。", riasec: "RIASEC", riasecRole: "职业兴趣", riasecCaveat: "表示目前吸引你的活动环境，不判断能力、招聘适配或职业命运。", boundary: "边界", evidence: "依据", observed: "测量", strength: "信号强度", details: "版本信息", latest: "最新结果", low: "低", reference: "参考", medium: "中等", research: "基于研究理论的OIYO简短测验", reflective: "自我反思框架" },
  fr: { title: "Moi à travers les évaluations", subtitle: "Traits, préférences et intérêts professionnels sont des couches distinctes, jamais fusionnées en un score.", big5: "Big Five", big5Role: "Traits de personnalité", big5Caveat: "Des tendances comportementales continues, pas une mesure d’aptitude ni une identité fixe.", mbti: "MBTI", mbtiRole: "Préférences", mbtiCaveat: "Le type à 16 lettres est un résumé réflexif dérivé de quatre axes, pas le test MBTI® officiel ni un diagnostic.", riasec: "RIASEC", riasecRole: "Intérêts professionnels", riasecCaveat: "Décrit les activités qui vous attirent, sans juger aptitude, recrutement ou destin professionnel.", boundary: "limite", evidence: "Niveau de preuve", observed: "Mesuré", strength: "Force du signal", details: "Version", latest: "résultat récent", low: "faible", reference: "indicatif", medium: "modérée", research: "outil bref OIYO inspiré de la recherche", reflective: "cadre de réflexion" },
  es: { title: "Yo a través de las evaluaciones", subtitle: "Rasgos, preferencias e intereses vocacionales son capas distintas; nunca se fusionan en una puntuación.", big5: "Big Five", big5Role: "Rasgos de personalidad", big5Caveat: "Tendencias conductuales continuas, no una medida de capacidad ni una identidad fija.", mbti: "MBTI", mbtiRole: "Preferencias", mbtiCaveat: "El tipo de 16 letras es un resumen reflexivo derivado de cuatro ejes, no la prueba MBTI® oficial ni un diagnóstico.", riasec: "RIASEC", riasecRole: "Intereses vocacionales", riasecCaveat: "Describe actividades que te atraen, no capacidad, idoneidad de contratación ni destino profesional.", boundary: "límite", evidence: "Evidencia", observed: "Medido", strength: "Fuerza de señal", details: "Versión", latest: "resultado reciente", low: "baja", reference: "orientativa", medium: "moderada", research: "evaluación breve OIYO inspirada en investigación", reflective: "marco de reflexión" },
};

const BIG5 = ["O", "C", "E", "A", "N"] as const;
const RIASEC = ["R", "I", "A", "S", "E", "C"] as const;
const MBTI = { EI: ["E", "I"], SN: ["S", "N"], TF: ["T", "F"], JP: ["J", "P"] } as const;

function byConstruct(signals: OntologySignal[], id: string) {
  return signals.find((signal) => signal.constructId === id);
}

function valueOf(signal: OntologySignal | undefined): number | undefined {
  return typeof signal?.value === "number" ? Math.max(0, Math.min(100, signal.value)) : undefined;
}

function strengthLabel(confidence: number, t: typeof COPY.en) {
  return confidence < 0.4 ? t.low : confidence < 0.6 ? t.reference : t.medium;
}

function AssessmentMeta({ signals, lang, t }: { signals: OntologySignal[]; lang: Lang; t: typeof COPY.en }) {
  const confidence = signals.reduce((sum, signal) => sum + signal.confidence, 0) / signals.length;
  const observedAt = signals.reduce((latest, signal) => signal.observedAt > latest ? signal.observedAt : latest, "");
  const evidence = signals[0]?.evidenceTier === "reflective-framework" ? t.reflective : t.research;
  const instrumentVersion = signals[0]?.provenance.instrumentVersion ?? "";
  const itemCount = instrumentVersion.match(/(?:^|-)\d+(?=-|$)/)?.[0];
  const date = observedAt ? new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(observedAt)) : "—";
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold text-green-700">
      <span className="rounded-full bg-green-50 px-2 py-1">{t.evidence}: {evidence}</span>
      <span className="rounded-full bg-green-50 px-2 py-1">{t.strength}: {strengthLabel(confidence, t)}</span>
      <span className="rounded-full bg-green-50 px-2 py-1">{t.observed}: {date} · {t.latest}</span>
      {itemCount && <span className="rounded-full bg-green-50 px-2 py-1">{itemCount}Q</span>}
    </div>
  );
}

function Bar({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] font-black text-slate-600"><span>{label}</span><span>{Math.round(value)}%{suffix}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-green-600" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function AssessmentSignalSummary({ locale }: { locale: string }) {
  const lang = (LANGS.includes(locale as Lang) ? locale : "en") as Lang;
  const t = COPY[lang];
  const [signals, setSignals] = useState<OntologySignal[]>([]);

  useEffect(() => {
    const refresh = () => setSignals(collectAssessmentSignals());
    refresh();
    window.addEventListener(OIYO_ASSESSMENT_RESULTS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(OIYO_ASSESSMENT_RESULTS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const groups = useMemo(() => ({
    big5: BIG5.map((dimension) => byConstruct(signals, `psychology.big5.${dimension}`)).filter(Boolean) as OntologySignal[],
    mbti: Object.keys(MBTI).map((axis) => byConstruct(signals, `personality.mbti.preference.${axis}`)).filter(Boolean) as OntologySignal[],
    riasec: RIASEC.map((dimension) => byConstruct(signals, `vocation.riasec.${dimension}`)).filter(Boolean) as OntologySignal[],
  }), [signals]);

  const hasCompleteGroup = groups.big5.length === BIG5.length
    || groups.mbti.length === Object.keys(MBTI).length
    || groups.riasec.length === RIASEC.length;
  if (!hasCompleteGroup) return null;

  const mbtiType = Object.entries(MBTI).map(([axis, poles]) => (valueOf(byConstruct(groups.mbti, `personality.mbti.preference.${axis}`)) ?? 50) >= 50 ? poles[0] : poles[1]).join("");
  const riasecCode = [...RIASEC].sort((left, right) =>
    (valueOf(byConstruct(groups.riasec, `vocation.riasec.${right}`)) ?? 0) - (valueOf(byConstruct(groups.riasec, `vocation.riasec.${left}`)) ?? 0)
    || RIASEC.indexOf(left) - RIASEC.indexOf(right)
  ).slice(0, 3).join("");

  return (
    <section className="mt-8 rounded-[28px] border border-green-100 bg-green-50/40 p-4 shadow-sm">
      <h2 className="text-lg font-black text-green-950">🧩 {t.title}</h2>
      <p className="mt-1 text-xs leading-5 text-green-700">{t.subtitle}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {groups.big5.length === BIG5.length && <article className="rounded-2xl border border-green-100 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{t.big5Role}</p>
          <h3 className="mt-0.5 text-lg font-black text-slate-900">{t.big5}</h3>
          <div className="mt-3 space-y-2">{BIG5.map((dimension) => <Bar key={dimension} label={dimension} value={valueOf(byConstruct(groups.big5, `psychology.big5.${dimension}`)) ?? 0} />)}</div>
          <AssessmentMeta signals={groups.big5} lang={lang} t={t} />
          <p className="mt-3 text-[11px] leading-5 text-slate-500">{t.big5Caveat}</p>
          <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer font-bold">{t.details}</summary><p className="mt-1 break-all">{groups.big5[0].provenance.instrumentVersion}</p></details>
        </article>}

        {groups.mbti.length === Object.keys(MBTI).length && <article className="rounded-2xl border border-green-100 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{t.mbtiRole}</p>
          <h3 className="mt-0.5 text-lg font-black text-slate-900">{t.mbti} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-sm">{mbtiType}</span></h3>
          <div className="mt-3 space-y-2">{Object.entries(MBTI).map(([axis, poles]) => {
            const value = valueOf(byConstruct(groups.mbti, `personality.mbti.preference.${axis}`)) ?? 50;
            const boundary = value >= 37.5 && value <= 62.5 ? ` · ${t.boundary}` : "";
            return <Bar key={axis} label={`${poles[0]}–${poles[1]}`} value={value} suffix={boundary} />;
          })}</div>
          <AssessmentMeta signals={groups.mbti} lang={lang} t={t} />
          <p className="mt-3 text-[11px] leading-5 text-slate-500">{t.mbtiCaveat}</p>
          <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer font-bold">{t.details}</summary><p className="mt-1 break-all">{groups.mbti[0].provenance.instrumentVersion}</p></details>
        </article>}

        {groups.riasec.length === RIASEC.length && <article className="rounded-2xl border border-green-100 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{t.riasecRole}</p>
          <h3 className="mt-0.5 text-lg font-black text-slate-900">{t.riasec} <span className="ml-1 rounded-full bg-cyan-50 px-2 py-0.5 text-sm text-cyan-800">{riasecCode}</span></h3>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">{RIASEC.map((dimension) => <Bar key={dimension} label={dimension} value={valueOf(byConstruct(groups.riasec, `vocation.riasec.${dimension}`)) ?? 0} />)}</div>
          <AssessmentMeta signals={groups.riasec} lang={lang} t={t} />
          <p className="mt-3 text-[11px] leading-5 text-slate-500">{t.riasecCaveat}</p>
          <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer font-bold">{t.details}</summary><p className="mt-1 break-all">{groups.riasec[0].provenance.instrumentVersion}</p></details>
        </article>}
      </div>
    </section>
  );
}
