'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from "@/components/ui/questionnaire";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  reversed?: boolean;
}

const questions: Question[] = [
  {
    ko: "일반적으로, 나는 스스로를 어떻게 생각하나요?",
    en: "In general, I consider myself:",
    ja: "一般的に、私は自分自身を：",
    zh: "一般来说，我认为自己是：",
    fr: "De manière générale, je me considère comme :",
    es: "En general, me considero:",
    reversed: false,
  },
  {
    ko: "대부분의 또래와 비교했을 때, 나는 스스로를:",
    en: "Compared to most of my peers, I consider myself:",
    ja: "ほとんどの同年代と比べて、私は自分を：",
    zh: "与大多数同龄人相比，我认为自己：",
    fr: "Par rapport à la plupart des personnes de mon âge, je me considère comme :",
    es: "En comparación con la mayoría de mis pares, me considero:",
    reversed: false,
  },
  {
    ko: "어떤 사람들은 일반적으로 매우 행복해요. 무슨 일이 있어도 삶을 즐기며 모든 것에서 기쁨을 얻어요. 이 특성이 당신을 얼마나 잘 설명하나요?",
    en: "Some people are generally very happy. They enjoy life regardless of what is happening and are always getting the most out of everything. To what extent does this characterization describe you?",
    ja: "とても幸せな人がいます。何があっても人生を楽しみすべてから最大限を得ます。この特徴はどの程度あなたを表していますか？",
    zh: "有些人通常非常快乐。无论发生什么，他们都会享受生活，并总能从各种事情中获得乐趣。这个描述在多大程度上符合你？",
    fr: "Certaines personnes sont généralement très heureuses. Elles profitent de la vie quoi qu'il arrive et tirent toujours le meilleur de chaque situation. Dans quelle mesure cette description vous correspond-elle ?",
    es: "Algunas personas suelen ser muy felices. Disfrutan la vida sin importar lo que ocurra y siempre sacan lo mejor de todo. ¿En qué medida esta descripción se parece a ti?",
    reversed: false,
  },
  {
    ko: "어떤 사람들은 일반적으로 별로 행복하지 않아요. 우울하지는 않지만, 가능한 만큼 행복해 보이지 않아요. 이 특성이 당신을 얼마나 잘 설명하나요?",
    en: "Some people are generally not very happy. Although they are not depressed, they never seem as happy as they might be. To what extent does this characterization describe you?",
    ja: "あまり幸せでない人もいます。落ち込んではいませんが、なれるほど幸せではない。この特徴はどの程度あなたを表していますか？",
    zh: "有些人通常并不怎么快乐。虽然他们并不抑郁，但似乎总没有达到自己可以拥有的快乐程度。这个描述在多大程度上符合你？",
    fr: "Certaines personnes ne sont généralement pas très heureuses. Sans être déprimées, elles ne semblent jamais aussi heureuses qu'elles pourraient l'être. Dans quelle mesure cette description vous correspond-elle ?",
    es: "Algunas personas, en general, no son muy felices. Aunque no están deprimidas, nunca parecen tan felices como podrían estarlo. ¿En qué medida esta descripción se parece a ti?",
    reversed: true,
  },
];

const scaleOptions = {
  normal: {
    ko: ["매우 불행한 사람", "다소 불행한 사람", "약간 불행한 사람", "보통인 사람", "약간 행복한 사람", "다소 행복한 사람", "매우 행복한 사람"],
    en: ["Very unhappy person", "Somewhat unhappy person", "Slightly unhappy person", "Neutral person", "Slightly happy person", "Somewhat happy person", "Very happy person"],
    ja: ["とても不幸な人", "やや不幸な人", "少し不幸な人", "普通の人", "少し幸せな人", "やや幸せな人", "とても幸せな人"],
    zh: ["非常不快乐的人", "有些不快乐的人", "稍微不快乐的人", "普通的人", "稍微快乐的人", "比较快乐的人", "非常快乐的人"],
    fr: ["Personne très malheureuse", "Personne plutôt malheureuse", "Personne légèrement malheureuse", "Personne neutre", "Personne légèrement heureuse", "Personne plutôt heureuse", "Personne très heureuse"],
    es: ["Persona muy infeliz", "Persona algo infeliz", "Persona ligeramente infeliz", "Persona neutral", "Persona ligeramente feliz", "Persona bastante feliz", "Persona muy feliz"],
  },
  peer: {
    ko: ["훨씬 덜 행복함", "덜 행복함", "약간 덜 행복함", "비슷함", "약간 더 행복함", "더 행복함", "훨씬 더 행복함"],
    en: ["Much less happy", "Less happy", "Slightly less happy", "About the same", "Slightly happier", "Happier", "Much happier"],
    ja: ["ずっと不幸", "不幸", "少し不幸", "同じくらい", "少し幸せ", "幸せ", "ずっと幸せ"],
    zh: ["快乐程度低很多", "快乐程度较低", "快乐程度稍低", "差不多", "稍微更快乐", "更快乐", "快乐程度高很多"],
    fr: ["Beaucoup moins heureux", "Moins heureux", "Légèrement moins heureux", "À peu près pareil", "Légèrement plus heureux", "Plus heureux", "Beaucoup plus heureux"],
    es: ["Mucho menos feliz", "Menos feliz", "Un poco menos feliz", "Más o menos igual", "Un poco más feliz", "Más feliz", "Mucho más feliz"],
  },
  degree: {
    ko: ["전혀 그렇지 않음", "매우 조금", "약간 조금", "보통", "어느 정도", "상당히", "매우 많이"],
    en: ["Not at all", "Very little", "A little", "Somewhat", "A fair amount", "Quite a bit", "Very much"],
    ja: ["全くそうでない", "ほんの少し", "少し", "ある程度", "かなり", "相当", "非常に"],
    zh: ["完全不符合", "非常少", "有一点", "有些符合", "相当符合", "很符合", "非常符合"],
    fr: ["Pas du tout", "Très peu", "Un peu", "Dans une certaine mesure", "Assez", "Beaucoup", "Énormément"],
    es: ["Para nada", "Muy poco", "Un poco", "Algo", "Bastante", "Mucho", "Muchísimo"],
  },
};

const resultLevels = {
  ko: [
    { min: 1, max: 2.5, emoji: "😔", label: "낮은 행복도", description: "지금 어려운 시기를 보내고 있을 수 있습니다. 작은 기쁨의 순간부터 주의를 기울여보세요.", color: "#ef4444" },
    { min: 2.5, max: 4, emoji: "😐", label: "보통 행복도", description: "긍정적인 감정과 부정적인 감정이 섞여 있습니다. 기쁨을 주는 활동을 더 자주 찾아보세요.", color: "#f59e0b" },
    { min: 4, max: 5.5, emoji: "🙂", label: "높은 행복도", description: "행복하게 지내고 있습니다. 이 긍정적인 에너지를 주변과 나눠보세요.", color: "#10b981" },
    { min: 5.5, max: 7, emoji: "😄", label: "매우 높은 행복도", description: "예외적으로 높은 행복도를 보여줍니다. 뛰어난 감정적 회복력을 가지고 있습니다.", color: "#059669" },
  ],
  en: [
    { min: 1, max: 2.5, emoji: "😔", label: "Low Happiness", description: "You may be going through a difficult time. Start paying attention to small moments of joy.", color: "#ef4444" },
    { min: 2.5, max: 4, emoji: "😐", label: "Moderate Happiness", description: "You have a mix of positive and negative emotions. Try to seek out activities that bring joy more often.", color: "#f59e0b" },
    { min: 4, max: 5.5, emoji: "🙂", label: "High Happiness", description: "You are living happily. Share this positive energy with those around you.", color: "#10b981" },
    { min: 5.5, max: 7, emoji: "😄", label: "Very High Happiness", description: "You show exceptionally high happiness. You have outstanding emotional resilience.", color: "#059669" },
  ],
  ja: [
    { min: 1, max: 2.5, emoji: "😔", label: "低い幸福度", description: "今困難な時期かもしれません。小さな喜びの瞬間に注目してみてください。", color: "#ef4444" },
    { min: 2.5, max: 4, emoji: "😐", label: "普通の幸福度", description: "ポジティブとネガティブな感情が混在しています。喜びをもたらす活動をより多く探しましょう。", color: "#f59e0b" },
    { min: 4, max: 5.5, emoji: "🙂", label: "高い幸福度", description: "幸せに暮らしています。このポジティブなエネルギーを周りと分かち合いましょう。", color: "#10b981" },
    { min: 5.5, max: 7, emoji: "😄", label: "非常に高い幸福度", description: "例外的に高い幸福度を示しています。優れた感情的回復力があります。", color: "#059669" },
  ],
  zh: [
    { min: 1, max: 2.5, emoji: "😔", label: "幸福感较低", description: "你可能正处在一段不容易的时期。可以先留意生活中细小的快乐时刻。", color: "#ef4444" },
    { min: 2.5, max: 4, emoji: "😐", label: "幸福感中等", description: "你的积极情绪和消极情绪都有一些。试着更常安排能带来愉悦感的活动。", color: "#f59e0b" },
    { min: 4, max: 5.5, emoji: "🙂", label: "幸福感较高", description: "你整体过得比较快乐。把这份积极能量也分享给身边的人吧。", color: "#10b981" },
    { min: 5.5, max: 7, emoji: "😄", label: "幸福感非常高", description: "你展现出格外高的幸福感，也具备出色的情绪复原力。", color: "#059669" },
  ],
  fr: [
    { min: 1, max: 2.5, emoji: "😔", label: "Bonheur faible", description: "Vous traversez peut-être une période difficile. Commencez par prêter attention aux petits moments de joie.", color: "#ef4444" },
    { min: 2.5, max: 4, emoji: "😐", label: "Bonheur modéré", description: "Vos émotions positives et négatives se mélangent. Essayez de rechercher plus souvent les activités qui vous apportent de la joie.", color: "#f59e0b" },
    { min: 4, max: 5.5, emoji: "🙂", label: "Bonheur élevé", description: "Vous vivez avec un bon niveau de bonheur. Partagez cette énergie positive avec votre entourage.", color: "#10b981" },
    { min: 5.5, max: 7, emoji: "😄", label: "Bonheur très élevé", description: "Vous montrez un niveau de bonheur exceptionnellement élevé et une excellente résilience émotionnelle.", color: "#059669" },
  ],
  es: [
    { min: 1, max: 2.5, emoji: "😔", label: "Felicidad baja", description: "Puede que estés pasando por un momento difícil. Empieza prestando atención a pequeños momentos de alegría.", color: "#ef4444" },
    { min: 2.5, max: 4, emoji: "😐", label: "Felicidad moderada", description: "Tienes una mezcla de emociones positivas y negativas. Intenta buscar con más frecuencia actividades que te den alegría.", color: "#f59e0b" },
    { min: 4, max: 5.5, emoji: "🙂", label: "Felicidad alta", description: "Estás viviendo con un buen nivel de felicidad. Comparte esta energía positiva con quienes te rodean.", color: "#10b981" },
    { min: 5.5, max: 7, emoji: "😄", label: "Felicidad muy alta", description: "Muestras un nivel de felicidad excepcionalmente alto y una gran resiliencia emocional.", color: "#059669" },
  ],
};

const tips = {
  ko: ["감사한 것을 매일 세 가지씩 적어보세요", "소셜 연결이 행복과 강하게 연관되어 있습니다", "타인을 돕는 것이 자신의 행복을 높입니다", "의미 있는 활동에 완전히 몰입해보세요"],
  en: ["Write three things you are grateful for every day", "Social connection is strongly linked to happiness", "Helping others increases your own happiness", "Fully immerse yourself in meaningful activities"],
  ja: ["毎日3つの感謝することを書きましょう", "社会的つながりは幸福と強く関連しています", "他人を助けることが自分の幸福を高めます", "意味のある活動に完全に没頭しましょう"],
  zh: ["每天写下三件让你感恩的事", "社会连接与幸福感有很强的关联", "帮助他人也会提升自己的幸福感", "全身心投入有意义的活动"],
  fr: ["Notez chaque jour trois choses pour lesquelles vous êtes reconnaissant", "Les liens sociaux sont fortement associés au bonheur", "Aider les autres augmente aussi votre propre bonheur", "Immergez-vous pleinement dans des activités qui ont du sens"],
  es: ["Escribe cada día tres cosas por las que sientes gratitud", "La conexión social está muy relacionada con la felicidad", "Ayudar a los demás también aumenta tu propia felicidad", "Sumérgete por completo en actividades significativas"],
};

const tx = {
  ko: { title: "행복 지수 테스트", subtitle: "나의 행복 온도는?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "나의 행복 점수", score: "행복 점수", restart: "다시 하기", share: "결과 공유", copied: "복사됨!", tipsTitle: "행복 향상 팁", scale: "1(매우 낮음) ~ 7(매우 높음)" },
  en: { title: "Happiness Meter Test", subtitle: "What is my happiness temperature?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "My Happiness Score", score: "Happiness Score", restart: "Restart", share: "Share Result", copied: "Copied!", tipsTitle: "Happiness Tips", scale: "1 (very low) ~ 7 (very high)" },
  ja: { title: "幸福度テスト", subtitle: "私の幸福温度は？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "私の幸福スコア", score: "幸福スコア", restart: "もう一度", share: "結果をシェア", copied: "コピーされました！", tipsTitle: "幸福向上のヒント", scale: "1(非常に低い) ~ 7(非常に高い)" },
  zh: { title: "幸福指数测试", subtitle: "我的幸福温度是多少？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "我的幸福得分", score: "幸福得分", restart: "重新开始", share: "分享结果", copied: "已复制！", tipsTitle: "提升幸福感的小建议", scale: "1（非常低）~ 7（非常高）" },
  fr: { title: "Test du niveau de bonheur", subtitle: "Quelle est ma température de bonheur ?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mon score de bonheur", score: "Score de bonheur", restart: "Recommencer", share: "Partager le résultat", copied: "Copié !", tipsTitle: "Conseils pour cultiver le bonheur", scale: "1 (très bas) ~ 7 (très élevé)" },
  es: { title: "Test de felicidad", subtitle: "¿Cuál es mi temperatura de felicidad?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mi puntuación de felicidad", score: "Puntuación de felicidad", restart: "Reiniciar", share: "Compartir resultado", copied: "¡Copiado!", tipsTitle: "Consejos para aumentar la felicidad", scale: "1 (muy bajo) ~ 7 (muy alto)" },
};

function getOptionSet(qIdx: number, locale: SupportedLocale) {
  if (qIdx === 0) return scaleOptions.normal[locale];
  if (qIdx === 1) return scaleOptions.peer[locale];
  return scaleOptions.degree[locale];
}

export default function HappinessMeterTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const ui = tx[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  useRecordFinishedTest({ testId: "happiness-meter", title: "HappinessMeterTest", finished: Boolean(showResult) });

  function pick(value: number) {
    const actualValue = questions[idx].reversed ? 8 - value : value;
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const next = answers.slice(0, idx);
    next[idx] = actualValue;
    if (next.length < questions.length) {
      setAnswers(next);
      setTimeout(() => setIdx(idx + 1), 280);
    } else {
      setAnswers(next);
      setShowResult(true);
    }
  }

  function restart() {
    setIdx(0);
    setAnswers([]);
    setShowResult(false);
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: ui.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (showResult) {
    const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
    const level = resultLevels[locale].find((l) => avg >= l.min && avg < l.max) ?? resultLevels[locale][2];
    const displayScore = avg.toFixed(1);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${level.color}18, ${level.color}08)`, border: `1px solid ${level.color}30` }}>
          <p className="text-sm font-medium text-gray-500 mb-1">{ui.resultTitle}</p>
          <div className="text-5xl mb-2">{level.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{level.label}</h2>
          <p className="text-3xl font-bold mt-1" style={{ color: level.color }}>{displayScore} / 7</p>
          <p className="mt-3 text-sm text-gray-600">{level.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">{ui.tipsTitle}</h3>
          <div className="space-y-2">
            {tips[locale].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            {ui.restart}
          </button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: level.color }}>
            {copied ? ui.copied : ui.share}
          </button>
        </div>
        <ShareResultButton locale={localeProp ?? 'ko'} heading={tx.title} resultTitle={level.label} />
      </div>
    );
  }

  const q = questions[idx];
  const options = getOptionSet(idx, locale);

  return (
    <Questionnaire
      title={ui.title}
      subtitle={ui.subtitle}
      question={q[locale]}
      questionLabel={ui.progress(idx + 1, questions.length)}
      progress={Math.round((idx / questions.length) * 100)}
      options={options.map((label, i) => ({ label, value: i + 1 }))}
      selectedValue={
        answers[idx] === undefined
          ? undefined
          : questions[idx].reversed
            ? 8 - answers[idx]
            : answers[idx]
      }
      note={ui.scale}
      previousLabel={locale === "ko" ? "이전 질문" : locale === "ja" ? "前の質問" : "Previous question"}
      onPrevious={idx > 0 ? () => setIdx(idx - 1) : undefined}
      onSelect={pick}
    />
  );
}
