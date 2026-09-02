import { useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import { BALANCE_QUESTIONS } from "../../lib/ontology/balance/data";
import { calculateBalance } from "../../lib/ontology/balance/logic";
import type {
  BalanceCategoryKey,
  BalanceResult,
} from "../../lib/ontology/balance/types";

/**
 * Wheel of Life — surfaces the unwired `balance` ontology engine (8-area life
 * balance Likert assessment). ko/en authored; engine option/recommendation text
 * for ja/zh/fr/es is English placeholder (data translation pending).
 */

type LC = Record<string, string> | string | undefined;
function loc(c: LC, locale: Locale): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c[locale] ?? (locale === "zh" ? c.cn : undefined) ?? c.en ?? c.ko ?? "";
}
type L<T> = Partial<Record<Locale, T>>;
const tt = <T,>(m: L<T>, locale: Locale): T => (m[locale] ?? m.en) as T;

const CAT: Record<BalanceCategoryKey, L<string>> = {
  health: { ko: "건강", en: "Health", ja: "健康", zh: "健康", fr: "Santé", es: "Salud" },
  relationships: { ko: "인간관계", en: "Relationships", ja: "人間関係", zh: "人际关系", fr: "Relations", es: "Relaciones" },
  career: { ko: "커리어", en: "Career", ja: "キャリア", zh: "事业", fr: "Carrière", es: "Carrera" },
  finance: { ko: "재정", en: "Finance", ja: "お金", zh: "财务", fr: "Finances", es: "Finanzas" },
  personal: { ko: "자기계발", en: "Personal growth", ja: "自己成長", zh: "个人成长", fr: "Développement", es: "Crecimiento" },
  environment: { ko: "환경·공간", en: "Environment", ja: "環境・空間", zh: "环境", fr: "Environnement", es: "Entorno" },
  fun: { ko: "여가·재미", en: "Fun", ja: "余暇・楽しみ", zh: "休闲娱乐", fr: "Loisirs", es: "Diversión" },
  contribution: { ko: "기여·의미", en: "Contribution", ja: "貢献・意味", zh: "贡献", fr: "Contribution", es: "Contribución" },
};

const LEVEL: Record<string, L<string>> = {
  "well-balanced": { ko: "균형 잡힘", en: "Well balanced", ja: "バランス良好", zh: "均衡良好", fr: "Bien équilibré", es: "Bien equilibrado" },
  "moderately-balanced": { ko: "비교적 균형", en: "Moderately balanced", ja: "まずまず", zh: "较为均衡", fr: "Modérément équilibré", es: "Moderado" },
  "needs-attention": { ko: "주의 필요", en: "Needs attention", ja: "要注意", zh: "需要关注", fr: "À surveiller", es: "Requiere atención" },
  "critical-imbalance": { ko: "불균형 심함", en: "Critical imbalance", ja: "深刻な偏り", zh: "严重失衡", fr: "Déséquilibre critique", es: "Desequilibrio crítico" },
};

const UI: Record<string, L<string>> = {
  title: { ko: "삶의 균형 진단 (Wheel of Life)", en: "Wheel of Life — Balance Check", ja: "人生のバランス診断", zh: "生活平衡测评", fr: "Roue de la vie", es: "Rueda de la vida" },
  intro: { ko: "8개 삶의 영역에 대한 만족도를 답하면, 전체 균형과 보완할 영역을 알려드립니다.", en: "Rate your satisfaction across 8 life areas to see your overall balance and where to focus.", ja: "人生の8領域の満足度に答えると、全体バランスと改善点が分かります。", zh: "对生活的8个领域评分，了解整体平衡与需改善之处。", fr: "Évaluez 8 domaines de vie pour voir votre équilibre global et vos priorités.", es: "Evalúa 8 áreas de vida para ver tu equilibrio general y dónde enfocarte." },
  question: { ko: "질문", en: "Question", ja: "質問", zh: "问题", fr: "Question", es: "Pregunta" },
  overall: { ko: "전체 균형 점수", en: "Overall balance", ja: "総合バランス", zh: "整体平衡", fr: "Équilibre global", es: "Equilibrio general" },
  byArea: { ko: "영역별 점수", en: "By area", ja: "領域別", zh: "各领域", fr: "Par domaine", es: "Por área" },
  strongest: { ko: "강한 영역", en: "Strongest", ja: "強い領域", zh: "最强", fr: "Points forts", es: "Más fuertes" },
  improve: { ko: "보완할 영역", en: "Focus here", ja: "改善領域", zh: "需改善", fr: "À améliorer", es: "A mejorar" },
  recs: { ko: "추천 실천", en: "Suggestions", ja: "おすすめ", zh: "建议", fr: "Suggestions", es: "Sugerencias" },
  restart: { ko: "다시 하기", en: "Restart", ja: "もう一度", zh: "重新开始", fr: "Recommencer", es: "Reiniciar" },
  disclaimer: { ko: "자기 점검용 참고 도구이며 의학·심리 진단이 아닙니다.", en: "A self-check reference, not a medical or psychological diagnosis.", ja: "セルフチェック用の参考であり、医学・心理診断ではありません。", zh: "供自我检查参考，并非医学或心理诊断。", fr: "Outil d'auto-évaluation, pas un diagnostic médical ou psychologique.", es: "Herramienta de autoevaluación, no un diagnóstico médico ni psicológico." },
};

const CAT_ORDER: BalanceCategoryKey[] = ["health", "relationships", "career", "finance", "personal", "environment", "fun", "contribution"];

export default function BalanceWheel({ locale = "ko" }: { locale?: Locale }) {
  const u = (k: string) => tt(UI[k], locale);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const total = BALANCE_QUESTIONS.length;
  const done = step >= total;
  const result: BalanceResult | null = useMemo(
    () => (done ? calculateBalance(answers) : null),
    [done, answers],
  );

  const pick = (qId: string, optId: string) => {
    setAnswers((a) => ({ ...a, [qId]: optId }));
    setStep((s) => s + 1);
  };
  const restart = () => { setAnswers({}); setStep(0); };
  const q = !done ? BALANCE_QUESTIONS[step] : null;

  return (
    <div className="rounded-2xl border border-green-100 bg-card p-5">
      <h1 className="text-2xl font-bold text-foreground">{u("title")}</h1>
      {!done && step === 0 && <p className="mt-2 leading-7 text-green-700">{u("intro")}</p>}

      {q && (
        <div className="mt-5">
          <div className="mb-3 flex items-center gap-3 text-xs text-green-500">
            <span>{u("question")} {step + 1} / {total}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-green-100">
              <div className="h-full bg-green-500" style={{ width: `${(step / total) * 100}%` }} />
            </div>
          </div>
          <p className="text-xs font-semibold text-green-500">{tt(CAT[q.category], locale)}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{loc(q.text as LC, locale)}</p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt) => (
              <button key={opt.id} type="button" onClick={() => pick(q.id, opt.id)}
                className="flex w-full items-center justify-between rounded-xl border border-green-100 bg-green-50/40 px-4 py-2.5 text-left text-sm text-green-900 transition-colors hover:border-green-300 hover:bg-green-50">
                <span>{loc(opt.text as LC, locale)}</span>
                <span className="text-xs text-green-400">{opt.score}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {done && result && (
        <div className="mt-5 space-y-5">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
            <p className="text-xs font-semibold text-green-600">{u("overall")}</p>
            <p className="mt-1 text-4xl font-bold text-green-700">{Math.round(result.overallBalance)}</p>
            <p className="mt-1 text-sm font-semibold text-green-800">{tt(LEVEL[result.balanceLevel], locale)}</p>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-green-800">{u("byArea")}</p>
            <div className="space-y-1.5">
              {CAT_ORDER.map((k) => {
                const v = Math.round((result.scores as Record<string, number>)[k] ?? 0);
                return (
                  <div key={k} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-xs text-green-700">{tt(CAT[k], locale)}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-green-100">
                      <div className="h-full bg-green-500" style={{ width: `${v}%` }} />
                    </div>
                    <span className="w-7 text-right text-xs text-green-500">{v}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-green-100 bg-green-50/50 p-3">
              <p className="text-xs font-semibold text-green-600">✓ {u("strongest")}</p>
              <p className="mt-1 text-sm text-green-900">{result.strongestAreas.map((a) => tt(CAT[a], locale)).join(", ")}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-700">△ {u("improve")}</p>
              <p className="mt-1 text-sm text-amber-900">{result.improvementAreas.map((a) => tt(CAT[a], locale)).join(", ")}</p>
            </div>
          </div>

          {result.recommendations.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-bold text-green-800">{u("recs")}</p>
              <ul className="space-y-1.5">
                {result.recommendations.slice(0, 4).map((r, i) => (
                  <li key={i} className="rounded-lg bg-green-50 px-3 py-2 text-sm leading-6 text-green-800">{loc(r as LC, locale)}</li>
                ))}
              </ul>
            </div>
          )}

          <button type="button" onClick={restart} className="rounded-full border border-green-300 px-5 py-2 text-sm font-medium text-green-700 hover:bg-green-50">{u("restart")}</button>
          <p className="text-[11px] leading-5 text-green-400">{u("disclaimer")}</p>
        </div>
      )}
    </div>
  );
}
