'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { Questionnaire } from "@/components/ui/questionnaire";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type ResilienceFactor = "self_efficacy" | "optimism" | "social_support" | "adaptability";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  factor: ResilienceFactor;
  reversed?: boolean;
}

const likertOptions = {
  ko: ["전혀 동의하지 않음", "동의하지 않음", "보통", "동의함", "매우 동의함"],
  en: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  ja: ["全く同意しない", "同意しない", "普通", "同意する", "強く同意する"],
  zh: ["非常不同意", "不同意", "一般", "同意", "非常同意"],
  fr: ["Pas du tout d'accord", "Pas d'accord", "Neutre", "D'accord", "Tout à fait d'accord"],
  es: ["Muy en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Muy de acuerdo"],
};

const questions: Question[] = [
  { ko: "어려운 상황을 처리할 수 있는 내 능력을 믿는다", en: "I trust my ability to handle difficult situations", ja: "困難な状況を処理できる自分の能力を信じている", zh: "我相信自己有能力处理困难情况", fr: "Je fais confiance à ma capacité à gérer les situations difficiles", es: "Confío en mi capacidad para manejar situaciones difíciles", factor: "self_efficacy" },
  { ko: "발생하는 문제를 해결하는 내 능력을 종종 의심한다", en: "I often doubt my ability to solve the problems that arise", ja: "発生する問題を解決する能力をよく疑う", zh: "我经常怀疑自己解决突发问题的能力", fr: "Je doute souvent de ma capacité à résoudre les problèmes qui se présentent", es: "A menudo dudo de mi capacidad para resolver los problemas que surgen", factor: "self_efficacy", reversed: true },
  { ko: "일반적으로 내 삶에 좋은 일이 일어날 것이라고 기대한다", en: "I generally expect good things to happen in my life", ja: "一般的に自分の人生に良いことが起きると期待している", zh: "通常我期待生活中会发生好事", fr: "En général, je m'attends à ce que de bonnes choses arrivent dans ma vie", es: "Por lo general, espero que ocurran cosas buenas en mi vida", factor: "optimism" },
  { ko: "어려운 시기에도 미래에 대한 희망을 유지한다", en: "I maintain hope for the future even in difficult times", ja: "困難な時期でも未来への希望を維持している", zh: "即使在困难时期，我也会保持对未来的希望", fr: "Je garde espoir pour l'avenir, même dans les périodes difficiles", es: "Mantengo la esperanza en el futuro incluso en los momentos difíciles", factor: "optimism" },
  { ko: "필요할 때 도움을 청할 수 있는 사람들이 있다", en: "I have people I can ask for help when needed", ja: "必要なとき助けを求められる人がいる", zh: "需要时，我身边有人可以求助", fr: "J'ai des personnes à qui demander de l'aide quand j'en ai besoin", es: "Tengo personas a quienes puedo pedir ayuda cuando la necesito", factor: "social_support" },
  { ko: "다른 사람에게 도움을 요청하기 어렵다", en: "I find it difficult to ask others for help", ja: "他の人に助けを求めるのが難しい", zh: "我觉得向别人求助很困难", fr: "J'ai du mal à demander de l'aide aux autres", es: "Me cuesta pedir ayuda a otras personas", factor: "social_support", reversed: true },
  { ko: "변화에 꽤 쉽게 적응할 수 있다", en: "I can adapt to change fairly easily", ja: "変化にかなり簡単に適応できる", zh: "我能比较轻松地适应变化", fr: "Je m'adapte assez facilement au changement", es: "Puedo adaptarme al cambio con bastante facilidad", factor: "adaptability" },
  { ko: "일상이 방해받을 때 어려움을 겪는다", en: "I have difficulty when my routine is disrupted", ja: "日常が乱されると困難を感じる", zh: "当日常节奏被打乱时，我会感到困难", fr: "J'ai des difficultés quand ma routine est perturbée", es: "Me cuesta cuando se interrumpe mi rutina", factor: "adaptability", reversed: true },
  { ko: "도전적인 경험에서 귀중한 교훈을 배운다", en: "I learn valuable lessons from challenging experiences", ja: "困難な経験から貴重な教訓を学ぶ", zh: "我会从充满挑战的经历中学到宝贵经验", fr: "Je tire des leçons précieuses des expériences difficiles", es: "Aprendo lecciones valiosas de las experiencias desafiantes", factor: "optimism" },
  { ko: "스트레스 상황에서 보통 내 감정을 조절할 수 있다", en: "I can usually regulate my emotions in stressful situations", ja: "ストレスの多い状況では通常感情をコントロールできる", zh: "在有压力的情况下，我通常能调节自己的情绪", fr: "Je parviens généralement à réguler mes émotions dans les situations stressantes", es: "Normalmente puedo regular mis emociones en situaciones estresantes", factor: "self_efficacy" },
  { ko: "필요한 일을 하기 위해 나 자신을 믿을 수 있다", en: "I can trust myself to do what needs to be done", ja: "必要なことをするために自分を信頼できる", zh: "我能相信自己会完成需要做的事", fr: "Je peux compter sur moi-même pour faire ce qui doit être fait", es: "Puedo confiar en mí para hacer lo que hay que hacer", factor: "self_efficacy" },
  { ko: "상황이 변할 때 계획을 조정할 수 있다", en: "I can adjust my plans when circumstances change", ja: "状況が変わったとき計画を調整できる", zh: "当情况变化时，我能调整自己的计划", fr: "Je peux ajuster mes plans lorsque les circonstances changent", es: "Puedo ajustar mis planes cuando cambian las circunstancias", factor: "adaptability" },
];

const factorInfo: Record<ResilienceFactor, {
  emoji: string;
  color: string;
  ko: { title: string; high: string; medium: string; low: string };
  en: { title: string; high: string; medium: string; low: string };
  ja: { title: string; high: string; medium: string; low: string };
  zh: { title: string; high: string; medium: string; low: string };
  fr: { title: string; high: string; medium: string; low: string };
  es: { title: string; high: string; medium: string; low: string };
}> = {
  self_efficacy: {
    emoji: "💪",
    color: "#6366f1",
    ko: { title: "자기 효능감", high: "장애물을 극복하는 능력에 강한 자신감이 있습니다.", medium: "일반적으로 자신의 능력을 믿지만 특정 상황에서 의심할 수 있습니다.", low: "자신의 능력에 더 많은 자신감을 갖는 것이 도움이 됩니다." },
    en: { title: "Self-Efficacy", high: "You have strong confidence in your ability to overcome obstacles.", medium: "You generally trust your abilities but may doubt yourself in certain situations.", low: "Building more confidence in your abilities will help you face challenges." },
    ja: { title: "自己効力感", high: "障害を克服する能力に強い自信があります。", medium: "一般的に自分の能力を信じますが、特定の状況では疑うことがあります。", low: "自分の能力にもっと自信を持つことが挑戦に直面するのに役立ちます。" },
    zh: { title: "自我效能感", high: "你对自己克服障碍的能力有很强的信心。", medium: "你通常相信自己的能力，但在某些情况下可能会怀疑自己。", low: "增强对自身能力的信心，会帮助你面对挑战。" },
    fr: { title: "Auto-efficacité", high: "Vous avez une grande confiance dans votre capacité à surmonter les obstacles.", medium: "Vous faites généralement confiance à vos capacités, mais pouvez douter de vous dans certaines situations.", low: "Renforcer la confiance en vos capacités vous aidera à faire face aux défis." },
    es: { title: "Autoeficacia", high: "Tienes una gran confianza en tu capacidad para superar obstáculos.", medium: "Por lo general confías en tus capacidades, aunque puedes dudar de ti en ciertas situaciones.", low: "Fortalecer la confianza en tus capacidades te ayudará a afrontar los desafíos." },
  },
  optimism: {
    emoji: "🌅",
    color: "#f59e0b",
    ko: { title: "낙관주의", high: "어려운 시기에도 긍정적인 전망을 유지합니다.", medium: "사물의 긍정적 면을 볼 수 있지만 때로는 부정적 면에 집중합니다.", low: "더 긍정적인 관점을 개발하면 도전을 헤쳐나가는 데 도움이 됩니다." },
    en: { title: "Optimism", high: "You maintain a positive outlook even in difficult times.", medium: "You can see the positive side but sometimes focus on the negative.", low: "Developing a more positive perspective will help you navigate challenges." },
    ja: { title: "楽観主義", high: "困難な時期でもポジティブな展望を維持しています。", medium: "ポジティブな面を見られますが、時にはネガティブな面に集中することがあります。", low: "より前向きな視点を開発することが課題を乗り越えるのに役立ちます。" },
    zh: { title: "乐观主义", high: "即使在困难时期，你也能保持积极的展望。", medium: "你能看到事物积极的一面，但有时也会关注消极面。", low: "培养更积极的视角，会帮助你应对挑战。" },
    fr: { title: "Optimisme", high: "Vous gardez une perspective positive même dans les périodes difficiles.", medium: "Vous savez voir le positif, mais il vous arrive de vous concentrer sur le négatif.", low: "Développer une perspective plus positive vous aidera à traverser les défis." },
    es: { title: "Optimismo", high: "Mantienes una perspectiva positiva incluso en los momentos difíciles.", medium: "Puedes ver el lado positivo, aunque a veces te enfocas en lo negativo.", low: "Desarrollar una perspectiva más positiva te ayudará a superar los desafíos." },
  },
  social_support: {
    emoji: "🤝",
    color: "#10b981",
    ko: { title: "사회적 지원", high: "도전 중에 도움이 되는 강한 지원 관계를 유지합니다.", medium: "일부 지원 관계가 있지만 네트워크를 강화하면 도움이 됩니다.", low: "더 강한 연결을 구축하면 어려운 시기에 더 많은 지원을 받습니다." },
    en: { title: "Social Support", high: "You maintain strong supportive relationships that help during challenges.", medium: "You have some support relationships but strengthening your network would help.", low: "Building stronger connections will provide more support during difficult times." },
    ja: { title: "社会的支援", high: "困難なとき助けとなる強い支援関係を維持しています。", medium: "いくつかの支援関係がありますが、ネットワークを強化すると助けになります。", low: "より強い繋がりを構築することで困難な時期により多くの支援が得られます。" },
    zh: { title: "社会支持", high: "你维持着强有力的支持关系，能在挑战中帮助你。", medium: "你拥有一些支持关系，但加强人际网络会更有帮助。", low: "建立更牢固的连接，会让你在困难时期获得更多支持。" },
    fr: { title: "Soutien social", high: "Vous entretenez des relations de soutien solides qui vous aident face aux défis.", medium: "Vous avez quelques relations de soutien, mais renforcer votre réseau vous serait utile.", low: "Créer des liens plus solides vous apportera davantage de soutien dans les moments difficiles." },
    es: { title: "Apoyo social", high: "Mantienes relaciones de apoyo sólidas que te ayudan durante los desafíos.", medium: "Tienes algunas relaciones de apoyo, pero fortalecer tu red te ayudaría.", low: "Construir vínculos más sólidos te dará más apoyo en los momentos difíciles." },
  },
  adaptability: {
    emoji: "🌊",
    color: "#06b6d4",
    ko: { title: "적응성", high: "변화하는 환경과 새로운 상황에 잘 적응합니다.", medium: "일부 변화에 적응할 수 있지만 특정 전환이 어려울 수 있습니다.", low: "변화에 더 편안해지면 회복탄력성이 강화됩니다." },
    en: { title: "Adaptability", high: "You adapt well to changing environments and new situations.", medium: "You can adapt to some changes but certain transitions may be difficult.", low: "Becoming more comfortable with change will strengthen your resilience." },
    ja: { title: "適応性", high: "変化する環境と新しい状況によく適応します。", medium: "一部の変化に適応できますが、特定の移行が難しいことがあります。", low: "変化に慣れることでレジリエンスが強化されます。" },
    zh: { title: "适应性", high: "你能很好地适应变化的环境和新的情况。", medium: "你能适应一些变化，但某些过渡可能会比较困难。", low: "对变化更加从容，会增强你的复原力。" },
    fr: { title: "Adaptabilité", high: "Vous vous adaptez bien aux environnements changeants et aux situations nouvelles.", medium: "Vous pouvez vous adapter à certains changements, mais certaines transitions peuvent être difficiles.", low: "Être plus à l'aise avec le changement renforcera votre résilience." },
    es: { title: "Adaptabilidad", high: "Te adaptas bien a entornos cambiantes y situaciones nuevas.", medium: "Puedes adaptarte a algunos cambios, pero ciertas transiciones pueden resultarte difíciles.", low: "Sentirte más cómodo con el cambio fortalecerá tu resiliencia." },
  },
};

const overallLevels = {
  ko: [
    { label: "발전 중인 회복탄력성", description: "회복탄력성 기술을 구축하면 스트레스를 더 잘 관리할 수 있습니다. 좋은 소식은 회복탄력성은 연습으로 개발됩니다.", min: 0, max: 35, emoji: "🌱", color: "#f59e0b" },
    { label: "중간 회복탄력성", description: "몇 가지 좋은 회복탄력성 기술을 개발했습니다. 특정 영역에 집중하면 더 효과적으로 어려운 상황을 헤쳐나갈 수 있습니다.", min: 36, max: 48, emoji: "🌿", color: "#10b981" },
    { label: "높은 회복탄력성", description: "강한 회복탄력성 기술을 보여줍니다. 좌절에서 잘 회복하고 변화에 효과적으로 적응합니다.", min: 49, max: 60, emoji: "🌳", color: "#059669" },
  ],
  en: [
    { label: "Developing Resilience", description: "Building resilience skills will help you manage stress better. The good news is resilience can be developed through practice.", min: 0, max: 35, emoji: "🌱", color: "#f59e0b" },
    { label: "Moderate Resilience", description: "You've developed some good resilience skills. Focusing on specific areas will help you navigate difficult situations more effectively.", min: 36, max: 48, emoji: "🌿", color: "#10b981" },
    { label: "High Resilience", description: "You show strong resilience skills. You recover well from setbacks and adapt effectively to change.", min: 49, max: 60, emoji: "🌳", color: "#059669" },
  ],
  ja: [
    { label: "発展中のレジリエンス", description: "レジリエンスのスキルを構築することでストレスをより上手く管理できます。良いニュースはレジリエンスは練習で開発できます。", min: 0, max: 35, emoji: "🌱", color: "#f59e0b" },
    { label: "中程度のレジリエンス", description: "いくつかのレジリエンススキルを開発しました。特定の領域に集中すると困難な状況をより効果的に乗り越えられます。", min: 36, max: 48, emoji: "🌿", color: "#10b981" },
    { label: "高いレジリエンス", description: "強いレジリエンススキルを示しています。挫折からうまく回復し変化に効果的に適応します。", min: 49, max: 60, emoji: "🌳", color: "#059669" },
  ],
  zh: [
    { label: "发展中的复原力", description: "培养复原力技能会帮助你更好地管理压力。好消息是，复原力可以通过练习来发展。", min: 0, max: 35, emoji: "🌱", color: "#f59e0b" },
    { label: "中等复原力", description: "你已经培养了一些不错的复原力技能。专注于特定领域，会帮助你更有效地应对困难情况。", min: 36, max: 48, emoji: "🌿", color: "#10b981" },
    { label: "高复原力", description: "你展现出很强的复原力技能。你能从挫折中较好恢复，并有效适应变化。", min: 49, max: 60, emoji: "🌳", color: "#059669" },
  ],
  fr: [
    { label: "Résilience en développement", description: "Développer vos compétences de résilience vous aidera à mieux gérer le stress. Bonne nouvelle : la résilience se renforce avec la pratique.", min: 0, max: 35, emoji: "🌱", color: "#f59e0b" },
    { label: "Résilience modérée", description: "Vous avez déjà développé de bonnes compétences de résilience. Vous concentrer sur certains domaines vous aidera à traverser les situations difficiles plus efficacement.", min: 36, max: 48, emoji: "🌿", color: "#10b981" },
    { label: "Forte résilience", description: "Vous montrez de solides compétences de résilience. Vous récupérez bien après les revers et vous vous adaptez efficacement au changement.", min: 49, max: 60, emoji: "🌳", color: "#059669" },
  ],
  es: [
    { label: "Resiliencia en desarrollo", description: "Desarrollar habilidades de resiliencia te ayudará a manejar mejor el estrés. La buena noticia es que la resiliencia puede fortalecerse con práctica.", min: 0, max: 35, emoji: "🌱", color: "#f59e0b" },
    { label: "Resiliencia moderada", description: "Has desarrollado algunas buenas habilidades de resiliencia. Enfocarte en áreas concretas te ayudará a atravesar situaciones difíciles con más eficacia.", min: 36, max: 48, emoji: "🌿", color: "#10b981" },
    { label: "Alta resiliencia", description: "Muestras habilidades sólidas de resiliencia. Te recuperas bien de los contratiempos y te adaptas eficazmente al cambio.", min: 49, max: 60, emoji: "🌳", color: "#059669" },
  ],
};

const ui = {
  ko: { title: "회복탄력성 부스터 테스트", subtitle: "나의 회복 근육은?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "나의 회복탄력성 프로필", factorLabel: "회복탄력성 요소", restart: "다시 하기", share: "결과 공유", copied: "복사됨!" },
  en: { title: "Resilience Boost Test", subtitle: "How strong are my recovery muscles?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "My Resilience Profile", factorLabel: "Resilience Factors", restart: "Restart", share: "Share Result", copied: "Copied!" },
  ja: { title: "レジリエンスブーストテスト", subtitle: "私の回復筋肉は？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "私のレジリエンスプロフィール", factorLabel: "レジリエンス要素", restart: "もう一度", share: "結果をシェア", copied: "コピーされました！" },
  zh: { title: "复原力提升测试", subtitle: "我的恢复肌肉有多强？", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "我的复原力档案", factorLabel: "复原力因素", restart: "重新开始", share: "分享结果", copied: "已复制！" },
  fr: { title: "Test de renforcement de la résilience", subtitle: "Quelle est la force de mes muscles de récupération ?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mon profil de résilience", factorLabel: "Facteurs de résilience", restart: "Recommencer", share: "Partager le résultat", copied: "Copié !" },
  es: { title: "Test de impulso de resiliencia", subtitle: "¿Qué tan fuertes son mis músculos de recuperación?", progress: (c: number, t: number) => `${c} / ${t}`, resultTitle: "Mi perfil de resiliencia", factorLabel: "Factores de resiliencia", restart: "Reiniciar", share: "Compartir resultado", copied: "¡Copiado!" },
};

export default function ResilienceBoostTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = ui[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  function pick(value: number) {
    const score = questions[idx].reversed ? 6 - value : value;
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const next = answers.slice(0, idx);
    next[idx] = score;
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
    if (navigator.share) {
      await navigator.share({ title: tx.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (showResult) {
    const total = answers.reduce((a, b) => a + b, 0);
    const overallLevel = overallLevels[locale].find((l) => total >= l.min && total <= l.max) ?? overallLevels[locale][1];
    const percentage = Math.round((total / 60) * 100);

    const factorScores: Record<ResilienceFactor, number[]> = { self_efficacy: [], optimism: [], social_support: [], adaptability: [] };
    questions.forEach((q, i) => { factorScores[q.factor].push(answers[i] ?? 3); });
    const factorAvg: Record<ResilienceFactor, number> = {
      self_efficacy: factorScores.self_efficacy.reduce((a, b) => a + b, 0) / factorScores.self_efficacy.length,
      optimism: factorScores.optimism.reduce((a, b) => a + b, 0) / factorScores.optimism.length,
      social_support: factorScores.social_support.reduce((a, b) => a + b, 0) / factorScores.social_support.length,
      adaptability: factorScores.adaptability.reduce((a, b) => a + b, 0) / factorScores.adaptability.length,
    };

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${overallLevel.color}18, ${overallLevel.color}08)`, border: `1px solid ${overallLevel.color}30` }}>
          <p className="text-sm font-medium text-gray-500 mb-1">{tx.resultTitle}</p>
          <div className="text-5xl mb-2">{overallLevel.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{overallLevel.label}</h2>
          <p className="text-3xl font-bold mt-1" style={{ color: overallLevel.color }}>{percentage}%</p>
          <p className="mt-3 text-sm text-gray-600">{overallLevel.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-700">{tx.factorLabel}</h3>
          <div className="space-y-4">
            {(Object.keys(factorAvg) as ResilienceFactor[]).map((factor) => {
              const fi = factorInfo[factor];
              const avg = factorAvg[factor];
              const level = avg >= 4 ? "high" : avg >= 3 ? "medium" : "low";
              return (
                <div key={factor}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{fi.emoji} {fi[locale].title}</span>
                    <span className="text-xs text-gray-400">{Math.round(avg * 20)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${avg * 20}%`, backgroundColor: fi.color }} />
                  </div>
                  <p className="text-xs text-gray-500">{fi[locale][level]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">{tx.restart}</button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: overallLevel.color }}>{copied ? tx.copied : tx.share}</button>
        </div>
        <ShareResultButton locale={localeProp ?? 'ko'} heading={tx.title} resultTitle={overallLevel.label} />
      </div>
    );
  }

  const q = questions[idx];
  const opts = likertOptions[locale];

  return (
    <Questionnaire
      title={tx.title}
      subtitle={tx.subtitle}
      question={q[locale]}
      questionLabel={tx.progress(idx + 1, questions.length)}
      progress={Math.round((idx / questions.length) * 100)}
      options={opts.map((label, i) => ({ label, value: i + 1 }))}
      selectedValue={
        answers[idx] === undefined
          ? undefined
          : questions[idx].reversed
            ? 6 - answers[idx]
            : answers[idx]
      }
      previousLabel={locale === "ko" ? "이전 질문" : locale === "ja" ? "前の質問" : "Previous question"}
      onPrevious={idx > 0 ? () => setIdx(idx - 1) : undefined}
      onSelect={pick}
    />
  );
}
