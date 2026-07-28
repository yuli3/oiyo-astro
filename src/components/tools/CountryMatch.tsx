import { useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import {
  COUNTRY_QUESTIONS,
  COUNTRIES_DATABASE,
} from "../../lib/ontology/country/data";
import { calculateCountryPreference } from "../../lib/ontology/country/logic";
import type {
  CountryArchetype,
  CountryPreferenceResult,
} from "../../lib/ontology/country/types";

/**
 * "Which country fits you?" — surfaces the unwired `country` ontology engine
 * (archetype quiz → best-match countries). ko/en authored; ja/zh/fr/es text in
 * the engine data is currently English placeholder (translation pending).
 */

type LC = Record<string, string> | string | undefined;
function loc(c: LC, locale: Locale): string {
  if (!c) return "";
  if (typeof c === "string") return c;
  return c[locale] ?? (locale === "zh" ? c.cn : undefined) ?? c.en ?? c.ko ?? "";
}

type L<T> = Partial<Record<Locale, T>>;
const tt = <T,>(m: L<T>, locale: Locale): T => (m[locale] ?? m.en) as T;

const ARCHETYPE: Record<CountryArchetype, L<string>> = {
  coastal: { ko: "해안형", en: "Coastal", ja: "海岸型", zh: "海岸型", fr: "Côtier", es: "Costero" },
  cosmopolitan: { ko: "코스모폴리탄형", en: "Cosmopolitan", ja: "コスモポリタン型", zh: "国际都会型", fr: "Cosmopolite", es: "Cosmopolita" },
  cultural: { ko: "문화·역사형", en: "Cultural", ja: "文化・歴史型", zh: "文化历史型", fr: "Culturel", es: "Cultural" },
  mediterranean: { ko: "지중해형", en: "Mediterranean", ja: "地中海型", zh: "地中海型", fr: "Méditerranéen", es: "Mediterráneo" },
  modern: { ko: "현대·도시형", en: "Modern", ja: "現代・都市型", zh: "现代都市型", fr: "Moderne", es: "Moderno" },
  mountainous: { ko: "산악·자연형", en: "Mountainous", ja: "山岳・自然型", zh: "山地自然型", fr: "Montagnard", es: "Montañoso" },
  nordic: { ko: "북유럽형", en: "Nordic", ja: "北欧型", zh: "北欧型", fr: "Nordique", es: "Nórdico" },
  tropical: { ko: "열대형", en: "Tropical", ja: "熱帯型", zh: "热带型", fr: "Tropical", es: "Tropical" },
};

const UI: Record<string, L<string>> = {
  title: { ko: "나에게 맞는 나라 찾기", en: "Find Your Country Match", ja: "自分に合う国を探す", zh: "找到适合你的国家", fr: "Trouvez votre pays idéal", es: "Encuentra tu país ideal" },
  intro: {
    ko: "라이프스타일 취향 몇 가지에 답하면, 당신과 가장 잘 맞는 나라를 찾아드립니다.",
    en: "Answer a few lifestyle preferences and we'll find the countries that fit you best.",
    ja: "いくつかのライフスタイルの好みに答えると、あなたに最も合う国を見つけます。",
    zh: "回答几个生活方式偏好，我们就能找出最适合你的国家。",
    fr: "Répondez à quelques préférences de style de vie et nous trouverons les pays qui vous correspondent.",
    es: "Responde algunas preferencias de estilo de vida y encontraremos los países que mejor te encajan.",
  },
  question: { ko: "질문", en: "Question", ja: "質問", zh: "问题", fr: "Question", es: "Pregunta" },
  result: { ko: "결과", en: "Result", ja: "結果", zh: "结果", fr: "Résultat", es: "Resultado" },
  yourType: { ko: "당신의 여행·정착 유형", en: "Your travel & settle type", ja: "あなたの旅・定住タイプ", zh: "你的旅行·定居类型", fr: "Votre profil voyage & installation", es: "Tu tipo de viaje y residencia" },
  topMatches: { ko: "가장 잘 맞는 나라", en: "Your top matches", ja: "最も合う国", zh: "最匹配的国家", fr: "Vos meilleures correspondances", es: "Tus mejores coincidencias" },
  match: { ko: "일치", en: "match", ja: "一致", zh: "匹配", fr: "compatibilité", es: "coincidencia" },
  pros: { ko: "장점", en: "Pros", ja: "長所", zh: "优点", fr: "Avantages", es: "Pros" },
  cons: { ko: "단점", en: "Cons", ja: "短所", zh: "缺点", fr: "Inconvénients", es: "Contras" },
  vibe: { ko: "분위기", en: "Vibe", ja: "雰囲気", zh: "氛围", fr: "Ambiance", es: "Ambiente" },
  restart: { ko: "다시 하기", en: "Restart", ja: "もう一度", zh: "重新开始", fr: "Recommencer", es: "Reiniciar" },
  metricsLabel: { ko: "삶의 질·안전·의료", en: "Quality / Safety / Healthcare", ja: "生活の質・安全・医療", zh: "生活质量·安全·医疗", fr: "Qualité / Sécurité / Santé", es: "Calidad / Seguridad / Salud" },
  disclaimer: {
    ko: "재미와 참고용 라이프스타일 매칭입니다. 실제 이주·여행 결정은 공식 정보를 확인하세요.",
    en: "A fun lifestyle match for reference. Verify official information for real relocation or travel decisions.",
    ja: "楽しみと参考のためのライフスタイル診断です。実際の移住・旅行は公式情報をご確認ください。",
    zh: "这是供娱乐与参考的生活方式匹配。实际移居·旅行请查证官方信息。",
    fr: "Un test ludique à titre de référence. Vérifiez les informations officielles pour toute décision réelle.",
    es: "Una coincidencia de estilo de vida con fines de referencia. Verifica la información oficial para decisiones reales.",
  },
};

export default function CountryMatch({ locale = "ko" }: { locale?: Locale }) {
  const u = (k: string) => tt(UI[k], locale);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const total = COUNTRY_QUESTIONS.length;
  const done = step >= total;
  const result: CountryPreferenceResult | null = useMemo(
    () => (done ? calculateCountryPreference(answers) : null),
    [done, answers],
  );

  const pick = (qId: string, optId: string) => {
    setAnswers((a) => ({ ...a, [qId]: optId }));
    setStep((s) => s + 1);
  };
  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  const q = !done ? COUNTRY_QUESTIONS[step] : null;

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-5">
      <h1 className="text-2xl font-bold text-green-950">{u("title")}</h1>
      {!done && step === 0 && (
        <p className="mt-2 leading-7 text-green-700">{u("intro")}</p>
      )}

      {/* Quiz */}
      {q && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between text-xs text-green-500">
            <span>
              {u("question")} {step + 1} / {total}
            </span>
            <div className="ml-3 h-1.5 flex-1 overflow-hidden rounded-full bg-green-100">
              <div
                className="h-full bg-green-500"
                style={{ width: `${(step / total) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-lg font-semibold text-green-950">
            <span className="mr-1">{q.emoji}</span>
            {loc(q.text as LC, locale)}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => pick(q.id, opt.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-green-100 bg-green-50/40 px-4 py-3 text-left text-sm text-green-900 transition-colors hover:border-green-300 hover:bg-green-50"
              >
                <span className="text-lg">{opt.emoji}</span>
                <span>{loc(opt.text as LC, locale)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {done && result && (
        <div className="mt-5 space-y-5">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-semibold text-green-600">
              {u("yourType")}
            </p>
            <p className="mt-1 text-xl font-bold text-green-950">
              {tt(ARCHETYPE[result.primaryArchetype], locale)}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-bold text-green-800">
              {u("topMatches")}
            </p>
            <div className="space-y-3">
              {result.topCountries.slice(0, 3).map(({ code, data, match }) => (
                <div
                  key={code}
                  className="rounded-2xl border border-green-100 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-950">
                      <span className="mr-2">{data.flag}</span>
                      {loc(data.name as LC, locale)}
                    </span>
                    <span className="rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white">
                      {Math.round(match)}% {u("match")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-green-700">
                    {loc(data.vibe as LC, locale)}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold text-green-600">
                        ✓ {u("pros")}
                      </p>
                      <ul className="mt-1 space-y-0.5 text-xs text-green-800">
                        {(data.pros as LC[]).slice(0, 3).map((p, i) => (
                          <li key={i}>· {loc(p, locale)}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-rose-500">
                        △ {u("cons")}
                      </p>
                      <ul className="mt-1 space-y-0.5 text-xs text-green-800">
                        {(data.cons as LC[]).slice(0, 3).map((p, i) => (
                          <li key={i}>· {loc(p, locale)}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-green-400">
                    {u("metricsLabel")}: {data.metrics.qualityOfLife} /{" "}
                    {data.metrics.safety} / {data.metrics.healthcare}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={restart}
            className="rounded-full border border-green-300 px-5 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
          >
            {u("restart")}
          </button>
          <p className="text-[11px] leading-5 text-green-400">
            {u("disclaimer")}
          </p>
        </div>
      )}
    </div>
  );
}
