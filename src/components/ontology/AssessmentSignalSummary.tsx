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
  attachment: string;
  attachmentRole: string;
  attachmentAnxiety: string;
  attachmentAvoidance: string;
  attachmentCaveat: string;
  careerValues: string;
  careerValuesRole: string;
  careerValuesCaveat: string;
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
  ko: { title: "검사로 본 나", subtitle: "성격·선호·흥미·관계 경향은 서로 다른 층입니다. 점수를 합치지 않고 각각 보여드려요.", big5: "Big Five", big5Role: "성격 특성", big5Caveat: "행동 경향을 연속 점수로 본 결과이며 능력이나 고정 정체성이 아닙니다.", mbti: "MBTI", mbtiRole: "선호 경향", mbtiCaveat: "16유형은 네 선호축에서 파생한 자기성찰용 요약이며 공식 MBTI® 검사나 진단이 아닙니다.", riasec: "RIASEC", riasecRole: "직업 흥미", riasecCaveat: "현재 끌리는 활동 환경을 나타내며 직업 적합성·능력·채용 판단이 아닙니다.", attachment: "성인 애착", attachmentRole: "관계 경향", attachmentAnxiety: "불안", attachmentAvoidance: "회피", attachmentCaveat: "관계 맥락에 따라 달라지는 자기보고 경향이며 고정 유형·진단·관계 안전 판정이 아닙니다.", careerValues: "Career Values", careerValuesRole: "선택한 가치", careerValuesCaveat: "지금 중요하게 여기는 우선순위를 보여주며 직업 적합성·연봉·성공 여부를 판정하지 않습니다.", boundary: "경계", evidence: "근거 수준", observed: "측정", strength: "신호 강도", details: "버전 정보", latest: "가장 최근 결과", low: "낮음", reference: "참고", medium: "보통", research: "연구 이론 기반 OIYO 간편검사", reflective: "자기성찰 프레임워크" },
  en: { title: "Me through assessments", subtitle: "Traits, preferences, interests, and relationship tendencies are separate layers, never one combined score.", big5: "Big Five", big5Role: "Personality traits", big5Caveat: "Continuous behavioral tendencies, not ability ratings or a fixed identity.", mbti: "MBTI", mbtiRole: "Preference patterns", mbtiCaveat: "The 16-type code is a reflective summary derived from four axes, not the official MBTI® assessment or a diagnosis.", riasec: "RIASEC", riasecRole: "Vocational interests", riasecCaveat: "Describes activities that currently appeal to you, not ability, hiring fitness, or career destiny.", attachment: "Adult attachment", attachmentRole: "Relationship tendencies", attachmentAnxiety: "Anxiety", attachmentAvoidance: "Avoidance", attachmentCaveat: "A context-dependent self-report tendency, not a fixed type, diagnosis, or assessment of relationship safety.", careerValues: "Career Values", careerValuesRole: "Chosen values", careerValuesCaveat: "Shows priorities that matter to you now, not job fitness, salary, or a success verdict.", boundary: "boundary", evidence: "Evidence", observed: "Observed", strength: "Signal strength", details: "Version details", latest: "latest result", low: "low", reference: "reference", medium: "moderate", research: "OIYO brief assessment inspired by research theory", reflective: "reflective framework" },
  ja: { title: "テストから見た私", subtitle: "性格・好み・興味・関係傾向は別の層です。一つの点数に混ぜません。", big5: "Big Five", big5Role: "性格特性", big5Caveat: "行動傾向の連続スコアで、能力や固定された正体ではありません。", mbti: "MBTI", mbtiRole: "選好傾向", mbtiCaveat: "16タイプは4軸から導いた自己省察用の要約で、公式MBTI®検査や診断ではありません。", riasec: "RIASEC", riasecRole: "職業興味", riasecCaveat: "今ひかれる活動環境を示し、能力・採用適性・職業の運命を判定しません。", attachment: "成人愛着", attachmentRole: "関係傾向", attachmentAnxiety: "不安", attachmentAvoidance: "回避", attachmentCaveat: "関係状況で変わる自己報告傾向で、固定タイプ・診断・関係の安全判定ではありません。", careerValues: "Career Values", careerValuesRole: "選んだ価値", careerValuesCaveat: "今重視している優先順位を示すもので、職業適性・年収・成功を判定しません。", boundary: "境界", evidence: "根拠", observed: "測定", strength: "信号の強さ", details: "バージョン", latest: "最新結果", low: "低い", reference: "参考", medium: "中程度", research: "研究理論に基づくOIYO簡易テスト", reflective: "自己省察フレーム" },
  zh: { title: "测验中的我", subtitle: "特质、偏好、兴趣和关系倾向属于不同层次，不合并为一个分数。", big5: "Big Five", big5Role: "人格特质", big5Caveat: "这是连续的行为倾向，不代表能力或固定身份。", mbti: "MBTI", mbtiRole: "偏好倾向", mbtiCaveat: "16型是由四个偏好轴衍生的自我反思摘要，并非官方MBTI®测评或诊断。", riasec: "RIASEC", riasecRole: "职业兴趣", riasecCaveat: "表示目前吸引你的活动环境，不判断能力、招聘适配或职业命运。", attachment: "成人依恋", attachmentRole: "关系倾向", attachmentAnxiety: "焦虑", attachmentAvoidance: "回避", attachmentCaveat: "这是随关系情境变化的自我报告倾向，不是固定类型、诊断或关系安全判断。", careerValues: "Career Values", careerValuesRole: "所选价值", careerValuesCaveat: "展示你目前重视的优先事项，不判断职业适配、薪资或成功与否。", boundary: "边界", evidence: "依据", observed: "测量", strength: "信号强度", details: "版本信息", latest: "最新结果", low: "低", reference: "参考", medium: "中等", research: "基于研究理论的OIYO简短测验", reflective: "自我反思框架" },
  fr: { title: "Moi à travers les évaluations", subtitle: "Traits, préférences, intérêts et tendances relationnelles restent des couches distinctes.", big5: "Big Five", big5Role: "Traits de personnalité", big5Caveat: "Des tendances comportementales continues, pas une mesure d’aptitude ni une identité fixe.", mbti: "MBTI", mbtiRole: "Préférences", mbtiCaveat: "Le type à 16 lettres est un résumé réflexif dérivé de quatre axes, pas le test MBTI® officiel ni un diagnostic.", riasec: "RIASEC", riasecRole: "Intérêts professionnels", riasecCaveat: "Décrit les activités qui vous attirent, sans juger aptitude, recrutement ou destin professionnel.", attachment: "Attachement adulte", attachmentRole: "Tendances relationnelles", attachmentAnxiety: "Anxiété", attachmentAvoidance: "Évitement", attachmentCaveat: "Tendance auto-rapportée dépendante du contexte, sans type fixe, diagnostic ni évaluation de sécurité.", careerValues: "Career Values", careerValuesRole: "Valeurs choisies", careerValuesCaveat: "Montre vos priorités actuelles, sans juger l’adéquation au poste, le salaire ou la réussite.", boundary: "limite", evidence: "Niveau de preuve", observed: "Mesuré", strength: "Force du signal", details: "Version", latest: "résultat récent", low: "faible", reference: "indicatif", medium: "modérée", research: "outil bref OIYO inspiré de la recherche", reflective: "cadre de réflexion" },
  es: { title: "Yo a través de las evaluaciones", subtitle: "Rasgos, preferencias, intereses y tendencias relacionales son capas distintas.", big5: "Big Five", big5Role: "Rasgos de personalidad", big5Caveat: "Tendencias conductuales continuas, no una medida de capacidad ni una identidad fija.", mbti: "MBTI", mbtiRole: "Preferencias", mbtiCaveat: "El tipo de 16 letras es un resumen reflexivo derivado de cuatro ejes, no la prueba MBTI® oficial ni un diagnóstico.", riasec: "RIASEC", riasecRole: "Intereses vocacionales", riasecCaveat: "Describe actividades que te atraen, no capacidad, idoneidad de contratación ni destino profesional.", attachment: "Apego adulto", attachmentRole: "Tendencias relacionales", attachmentAnxiety: "Ansiedad", attachmentAvoidance: "Evitación", attachmentCaveat: "Tendencia autoinformada dependiente del contexto, no tipo fijo, diagnóstico ni evaluación de seguridad.", careerValues: "Career Values", careerValuesRole: "Valores elegidos", careerValuesCaveat: "Muestra las prioridades que te importan ahora, sin evaluar idoneidad laboral, salario o éxito.", boundary: "límite", evidence: "Evidencia", observed: "Medido", strength: "Fuerza de señal", details: "Versión", latest: "resultado reciente", low: "baja", reference: "orientativa", medium: "moderada", research: "evaluación breve OIYO inspirada en investigación", reflective: "marco de reflexión" },
};

const EDUCATIONAL_LABEL: Record<Lang, string> = {
  ko: "검토 전 OIYO 성찰 문항",
  en: "draft OIYO reflection prompts",
  ja: "検討前のOIYO内省項目",
  zh: "待审查的OIYO反思题目",
  fr: "questions de réflexion OIYO provisoires",
  es: "preguntas de reflexión OIYO provisionales",
};

const ATTACHMENT_DRAFT_CAVEAT: Record<Lang, string> = {
  ko: "관계 맥락에 따라 달라지는 검토 전 자기보고 경향입니다. 1–5는 평균 응답 위치이며 백분위·검증 점수·고정 유형·진단·관계 안전 판정이 아닙니다.",
  en: "A draft, context-dependent self-report tendency. The 1–5 value is a mean response position—not a percentile, validated score, fixed type, diagnosis, or safety assessment.",
  ja: "関係状況で変わる検討前の自己報告傾向です。1–5は平均回答位置で、百分位・検証済みスコア・固定タイプ・診断・安全判定ではありません。",
  zh: "这是随关系情境变化的待审查自我报告倾向。1–5仅为平均作答位置，不是百分位、验证分数、固定类型、诊断或安全判断。",
  fr: "Tendance auto-rapportée provisoire et dépendante du contexte. La valeur 1–5 est une moyenne de réponse, sans percentile, score validé, type fixe, diagnostic ni évaluation de sécurité.",
  es: "Tendencia autoinformada provisional y dependiente del contexto. El valor 1–5 es una media de respuesta, no un percentil, puntuación validada, tipo fijo, diagnóstico ni evaluación de seguridad.",
};

const BIG5 = ["O", "C", "E", "A", "N"] as const;
const RIASEC = ["R", "I", "A", "S", "E", "C"] as const;
const MBTI = { EI: ["E", "I"], SN: ["S", "N"], TF: ["T", "F"], JP: ["J", "P"] } as const;
const ATTACHMENT = ["anxiety", "avoidance"] as const;
const CAREER_VALUES = ["security", "achievement", "autonomy", "service", "creativity", "status"] as const;

const CAREER_VALUE_LABELS: Record<Lang, Record<(typeof CAREER_VALUES)[number], string>> = {
  ko: { security: "안정성", achievement: "성취", autonomy: "자율성", service: "기여", creativity: "창의성", status: "인정" },
  en: { security: "Security", achievement: "Achievement", autonomy: "Autonomy", service: "Contribution", creativity: "Creativity", status: "Recognition" },
  ja: { security: "安定性", achievement: "達成", autonomy: "自律性", service: "貢献", creativity: "創造性", status: "承認" },
  zh: { security: "稳定", achievement: "成就", autonomy: "自主", service: "贡献", creativity: "创造", status: "认可" },
  fr: { security: "Sécurité", achievement: "Accomplissement", autonomy: "Autonomie", service: "Contribution", creativity: "Créativité", status: "Reconnaissance" },
  es: { security: "Seguridad", achievement: "Logro", autonomy: "Autonomía", service: "Contribución", creativity: "Creatividad", status: "Reconocimiento" },
};

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
  const tier = signals[0]?.evidenceTier;
  const evidence = tier === "educational"
    ? EDUCATIONAL_LABEL[lang]
    : tier === "reflective-framework" ? t.reflective : t.research;
  const instrumentVersion = signals[0]?.provenance.instrumentVersion ?? "";
  const itemCount = instrumentVersion.match(/(?:^|-)\d+(?=-|$)/)?.[0];
  const date = observedAt ? new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(new Date(observedAt)) : "—";
  return (
    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-bold text-green-700">
      <span className="rounded-full bg-surface-subtle px-2 py-1">{t.evidence}: {evidence}</span>
      <span className="rounded-full bg-surface-subtle px-2 py-1">{t.strength}: {strengthLabel(confidence, t)}</span>
      <span className="rounded-full bg-surface-subtle px-2 py-1">{t.observed}: {date} · {t.latest}</span>
      {itemCount && <span className="rounded-full bg-surface-subtle px-2 py-1">{itemCount}Q</span>}
    </div>
  );
}

function Bar({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] font-black text-slate-600"><span>{label}</span><span>{Math.round(value)}%{suffix}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function AttachmentBar({ label, value }: { label: string; value: number }) {
  const mean = (1 + (value * 4) / 100).toFixed(1);
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] font-black text-slate-600"><span>{label}</span><span>{mean} / 5.0</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
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
    attachment: ATTACHMENT.map((dimension) => byConstruct(signals, `relationship.attachment.${dimension}`)).filter(Boolean) as OntologySignal[],
    careerValues: CAREER_VALUES.map((dimension) => byConstruct(signals, `values.work.${dimension}`)).filter(Boolean) as OntologySignal[],
  }), [signals]);

  const hasCompleteGroup = groups.big5.length === BIG5.length
    || groups.mbti.length === Object.keys(MBTI).length
    || groups.riasec.length === RIASEC.length
    || groups.attachment.length === ATTACHMENT.length
    || groups.careerValues.length === CAREER_VALUES.length;
  if (!hasCompleteGroup) return null;

  const mbtiType = Object.entries(MBTI).map(([axis, poles]) => (valueOf(byConstruct(groups.mbti, `personality.mbti.preference.${axis}`)) ?? 50) >= 50 ? poles[0] : poles[1]).join("");
  const riasecCode = [...RIASEC].sort((left, right) =>
    (valueOf(byConstruct(groups.riasec, `vocation.riasec.${right}`)) ?? 0) - (valueOf(byConstruct(groups.riasec, `vocation.riasec.${left}`)) ?? 0)
    || RIASEC.indexOf(left) - RIASEC.indexOf(right)
  ).slice(0, 3).join("");

  return (
    <section className="mt-8 rounded-[28px] border border-green-100 bg-green-50/40 p-4 shadow-sm">
      <h2 className="text-lg font-black text-foreground">🧩 {t.title}</h2>
      <p className="mt-1 text-xs leading-5 text-green-700">{t.subtitle}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {groups.big5.length === BIG5.length && <article className="rounded-2xl border border-green-100 bg-card p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{t.big5Role}</p>
          <h3 className="mt-0.5 text-lg font-black text-slate-900">{t.big5}</h3>
          <div className="mt-3 space-y-2">{BIG5.map((dimension) => <Bar key={dimension} label={dimension} value={valueOf(byConstruct(groups.big5, `psychology.big5.${dimension}`)) ?? 0} />)}</div>
          <AssessmentMeta signals={groups.big5} lang={lang} t={t} />
          <p className="mt-3 text-[11px] leading-5 text-slate-500">{t.big5Caveat}</p>
          <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer font-bold">{t.details}</summary><p className="mt-1 break-all">{groups.big5[0].provenance.instrumentVersion}</p></details>
        </article>}

        {groups.mbti.length === Object.keys(MBTI).length && <article className="rounded-2xl border border-green-100 bg-card p-4">
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

        {groups.riasec.length === RIASEC.length && <article className="rounded-2xl border border-green-100 bg-card p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{t.riasecRole}</p>
          <h3 className="mt-0.5 text-lg font-black text-slate-900">{t.riasec} <span className="ml-1 rounded-full bg-surface-subtle px-2 py-0.5 text-sm text-green-800">{riasecCode}</span></h3>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">{RIASEC.map((dimension) => <Bar key={dimension} label={dimension} value={valueOf(byConstruct(groups.riasec, `vocation.riasec.${dimension}`)) ?? 0} />)}</div>
          <AssessmentMeta signals={groups.riasec} lang={lang} t={t} />
          <p className="mt-3 text-[11px] leading-5 text-slate-500">{t.riasecCaveat}</p>
          <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer font-bold">{t.details}</summary><p className="mt-1 break-all">{groups.riasec[0].provenance.instrumentVersion}</p></details>
        </article>}

        {groups.attachment.length === ATTACHMENT.length && <article className="rounded-2xl border border-green-100 bg-card p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{t.attachmentRole}</p>
          <h3 className="mt-0.5 text-lg font-black text-slate-900">{t.attachment}</h3>
          <div className="mt-3 space-y-3">
            <AttachmentBar label={t.attachmentAnxiety} value={valueOf(byConstruct(groups.attachment, "relationship.attachment.anxiety")) ?? 0} />
            <AttachmentBar label={t.attachmentAvoidance} value={valueOf(byConstruct(groups.attachment, "relationship.attachment.avoidance")) ?? 0} />
          </div>
          <AssessmentMeta signals={groups.attachment} lang={lang} t={t} />
          <p className="mt-3 text-[11px] leading-5 text-slate-500">{ATTACHMENT_DRAFT_CAVEAT[lang]}</p>
          <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer font-bold">{t.details}</summary><p className="mt-1 break-all">{groups.attachment[0].provenance.instrumentVersion}</p></details>
        </article>}

        {groups.careerValues.length === CAREER_VALUES.length && <article className="rounded-2xl border border-green-100 bg-card p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-green-600">{t.careerValuesRole}</p>
          <h3 className="mt-0.5 text-lg font-black text-slate-900">{t.careerValues}</h3>
          <div className="mt-3 space-y-2">{CAREER_VALUES.map((dimension) => <Bar key={dimension} label={CAREER_VALUE_LABELS[lang][dimension]} value={valueOf(byConstruct(groups.careerValues, `values.work.${dimension}`)) ?? 0} />)}</div>
          <AssessmentMeta signals={groups.careerValues} lang={lang} t={t} />
          <p className="mt-3 text-[11px] leading-5 text-slate-500">{t.careerValuesCaveat}</p>
          <details className="mt-2 text-[10px] text-slate-400"><summary className="cursor-pointer font-bold">{t.details}</summary><p className="mt-1 break-all">{groups.careerValues[0].provenance.instrumentVersion}</p></details>
        </article>}
      </div>
    </section>
  );
}
