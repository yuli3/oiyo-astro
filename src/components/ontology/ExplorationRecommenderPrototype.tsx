import { useMemo, useState } from "react";

import { recommendExploration, type ExplorationBudget, type ExplorationInput, type ExplorationSocialMode, type ExplorationSpace } from "../../lib/exploration-recommender";

type Props = { locale: "ko" | "en" | "ja" | "zh" | "fr" | "es" };

const PROFILES = {
  balanced: {
    interests: { R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 },
    workEnvironment: { security: 50, achievement: 50, autonomy: 50, service: 50, creativity: 50, status: 50 },
  },
  maker: {
    interests: { R: 90, I: 45, A: 90, S: 35, E: 50, C: 45 },
    workEnvironment: { security: 55, achievement: 90, autonomy: 65, service: 45, creativity: 95, status: 35 },
  },
  social: {
    interests: { R: 25, I: 35, A: 45, S: 100, E: 65, C: 40 },
    workEnvironment: { security: 55, achievement: 55, autonomy: 35, service: 100, creativity: 45, status: 50 },
  },
} satisfies Record<string, Pick<ExplorationInput, "interests" | "workEnvironment">>;

const COPY = {
  ko: { title: "업무환경·취미 탐색 프로토타입", note: "비공개 noindex 실험입니다. 직업·적성·채용 판단이 아니라 되돌릴 수 있는 20분 환경 실험을 비교합니다.", profile: "신호 예시", balanced: "균형", maker: "만들기", social: "협력", time: "시간", budget: "예산", space: "공간", mode: "방식", score: "종합", support: "추천 근거", counter: "반대 근거", trace: "6요소 추적", sources: "원천 ID", budgets: ["무료", "낮음", "보통", "높음"], spaces: ["작은 집", "공용 실내", "야외", "전용 공간"], modes: ["혼자", "함께"] },
  en: { title: "Work-environment exploration prototype", note: "Private noindex prototype. It compares reversible 20-minute environment experiments, not occupations, aptitude, or hiring decisions.", profile: "Signal example", balanced: "Balanced", maker: "Making", social: "Collaborative", time: "Time", budget: "Budget", space: "Space", mode: "Mode", score: "Score", support: "Support", counter: "Counter-evidence", trace: "Six-feature trace", sources: "Source IDs", budgets: ["Free", "Low", "Medium", "High"], spaces: ["Small home", "Shared indoor", "Outdoor", "Specialized"], modes: ["Solo", "Together"] },
  ja: { title: "仕事環境・趣味探索プロトタイプ", note: "非公開noindex実験です。職業・適性・採用判断ではなく、可逆的な20分の環境実験を比較します。", profile: "シグナル例", balanced: "均衡", maker: "制作", social: "協働", time: "時間", budget: "予算", space: "空間", mode: "参加", score: "総合", support: "根拠", counter: "反対根拠", trace: "6要素追跡", sources: "出典ID", budgets: ["無料", "低", "中", "高"], spaces: ["小さな自宅", "共用屋内", "屋外", "専用空間"], modes: ["一人", "一緒"] },
  zh: { title: "工作环境与兴趣探索原型", note: "这是不公开的 noindex 实验，仅比较可逆的20分钟环境尝试，不用于职业、能力或招聘判断。", profile: "信号示例", balanced: "均衡", maker: "创作", social: "协作", time: "时间", budget: "预算", space: "空间", mode: "方式", score: "总分", support: "支持依据", counter: "反向依据", trace: "六要素追踪", sources: "来源ID", budgets: ["免费", "低", "中", "高"], spaces: ["小型居家", "共享室内", "户外", "专用空间"], modes: ["独自", "一起"] },
  fr: { title: "Prototype d’exploration des environnements", note: "Prototype privé noindex. Il compare des expériences réversibles de 20 minutes, sans conclure sur un métier, une aptitude ou un recrutement.", profile: "Exemple de signaux", balanced: "Équilibré", maker: "Création", social: "Coopération", time: "Temps", budget: "Budget", space: "Espace", mode: "Mode", score: "Score", support: "Arguments", counter: "Contre-indices", trace: "Trace des six facteurs", sources: "IDs sources", budgets: ["Gratuit", "Faible", "Moyen", "Élevé"], spaces: ["Petit domicile", "Intérieur partagé", "Extérieur", "Spécialisé"], modes: ["Seul", "Ensemble"] },
  es: { title: "Prototipo de exploración de entornos", note: "Prototipo privado noindex. Compara experimentos reversibles de 20 minutos, no profesiones, aptitudes ni decisiones de contratación.", profile: "Ejemplo de señales", balanced: "Equilibrado", maker: "Creación", social: "Colaboración", time: "Tiempo", budget: "Presupuesto", space: "Espacio", mode: "Modo", score: "Puntuación", support: "A favor", counter: "En contra", trace: "Rastro de seis factores", sources: "IDs de origen", budgets: ["Gratis", "Bajo", "Medio", "Alto"], spaces: ["Hogar pequeño", "Interior compartido", "Exterior", "Especializado"], modes: ["Solo", "En compañía"] },
} as const;

export function ExplorationRecommenderPrototype({ locale }: Props) {
  const c = COPY[locale];
  const [profile, setProfile] = useState<keyof typeof PROFILES>("balanced");
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [budget, setBudget] = useState<ExplorationBudget>("low");
  const [space, setSpace] = useState<ExplorationSpace>("home-small");
  const [socialMode, setSocialMode] = useState<ExplorationSocialMode>("together");
  const result = useMemo(() => recommendExploration({
    ...PROFILES[profile], accessibilityNeeds: [], budget, maxRisk: "low", socialMode, space, timeMinutes,
  }, 3, locale), [budget, locale, profile, socialMode, space, timeMinutes]);

  return <section className="mt-8 rounded-3xl border border-green-200 bg-card p-4 text-slate-800 shadow-sm">
    <h2 className="text-lg font-black text-foreground">🧪 {c.title}</h2>
    <p className="mt-1 text-xs leading-5 text-green-700">{c.note}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-bold">{c.profile}<select className="mt-1 w-full rounded-lg border p-2" value={profile} onChange={(event) => setProfile(event.target.value as keyof typeof PROFILES)}><option value="balanced">{c.balanced}</option><option value="maker">{c.maker}</option><option value="social">{c.social}</option></select></label>
      <label className="text-xs font-bold">{c.time}<select className="mt-1 w-full rounded-lg border p-2" value={timeMinutes} onChange={(event) => setTimeMinutes(Number(event.target.value))}><option value={20}>20m</option><option value={30}>30m</option><option value={60}>60m</option></select></label>
      <label className="text-xs font-bold">{c.budget}<select className="mt-1 w-full rounded-lg border p-2" value={budget} onChange={(event) => setBudget(event.target.value as ExplorationBudget)}>{(["free", "low", "medium", "high"] as const).map((value, index) => <option key={value} value={value}>{c.budgets[index]}</option>)}</select></label>
      <label className="text-xs font-bold">{c.space}<select className="mt-1 w-full rounded-lg border p-2" value={space} onChange={(event) => setSpace(event.target.value as ExplorationSpace)}>{(["home-small", "shared-indoor", "outdoor", "specialized"] as const).map((value, index) => <option key={value} value={value}>{c.spaces[index]}</option>)}</select></label>
      <label className="text-xs font-bold sm:col-span-2">{c.mode}<select className="mt-1 w-full rounded-lg border p-2" value={socialMode} onChange={(event) => setSocialMode(event.target.value as ExplorationSocialMode)}><option value="solo">{c.modes[0]}</option><option value="together">{c.modes[1]}</option></select></label>
    </div>
    <ol className="mt-5 space-y-3" aria-live="polite">
      {result.recommendations.map((item, index) => <li key={item.id} className="rounded-2xl bg-surface-subtle p-3">
        <div className="flex items-start justify-between gap-3"><h3 className="font-black">{index + 1}. {item.environmentToExplore}</h3><span className="shrink-0 rounded-full bg-primary px-2 py-1 text-xs font-black text-primary-foreground">{c.score} {item.score}</span></div>
        <p className="mt-2 text-sm leading-6">{item.experiment20Minutes}</p>
        <p className="mt-2 text-xs"><b>{c.support}:</b> {item.supportingReasons.map((reason) => `${reason.text} (${reason.score})`).join(" · ")}</p>
        <p className="mt-1 text-xs"><b>{c.counter}:</b> {item.counterReasons.map((reason) => `${reason.text} (${reason.score})`).join(" · ")}</p>
        <details className="mt-2 text-xs"><summary className="cursor-pointer font-bold">{c.trace}</summary><ul className="mt-1 space-y-1">{item.featureTrace.map((trace) => <li key={trace.feature}><code>{trace.feature}</code>: {trace.score} × 1/6 = {trace.contribution.toFixed(2)} · input {JSON.stringify(trace.inputEvidence)} · candidate {JSON.stringify(trace.candidateEvidence)}</li>)}</ul><p className="mt-2"><b>{c.sources}:</b> hobby {item.sourceHobbyIds.join(", ")} · career {item.sourceCareerIds.join(", ")}</p></details>
      </li>)}
    </ol>
  </section>;
}
