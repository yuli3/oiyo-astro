'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { QuestionnaireMatrix } from "@/components/ui/questionnaire-matrix";

interface Props { locale?: string; }

type Strength = "creator" | "analyzer" | "connector" | "achiever" | "healer" | "leader";

const data = {
  ko: {
    title: "강점 발견 테스트: 나의 숨겨진 강점은?",
    description: "12개의 상황 질문으로 당신의 핵심 강점 유형을 발견하세요.",
    questions: [
      { id: "q1", text: "새로운 아이디어나 방법을 떠올릴 때 가장 에너지가 넘친다.", type: "creator" as Strength },
      { id: "q2", text: "복잡한 문제를 데이터와 논리로 분석하는 것이 즐겁다.", type: "analyzer" as Strength },
      { id: "q3", text: "사람들이 연결되고 협력하도록 돕는 역할이 자연스럽다.", type: "connector" as Strength },
      { id: "q4", text: "목표를 세우고 끝까지 완수하는 것에서 만족을 느낀다.", type: "achiever" as Strength },
      { id: "q5", text: "누군가 힘들어할 때 먼저 감지하고 위로를 건넨다.", type: "healer" as Strength },
      { id: "q6", text: "그룹이 나아갈 방향을 제시하는 것이 편안하다.", type: "leader" as Strength },
      { id: "q7", text: "기존 방식보다 더 나은 방법을 항상 탐색한다.", type: "creator" as Strength },
      { id: "q8", text: "정보를 수집하고 패턴을 찾아내는 것이 자연스럽다.", type: "analyzer" as Strength },
      { id: "q9", text: "다양한 배경의 사람들과 쉽게 친해진다.", type: "connector" as Strength },
      { id: "q10", text: "마감과 책임감이 나를 더 집중하게 만든다.", type: "achiever" as Strength },
      { id: "q11", text: "타인의 감정 변화를 빠르게 알아채는 편이다.", type: "healer" as Strength },
      { id: "q12", text: "팀이 어려울 때 앞에 나서서 결정을 내린다.", type: "leader" as Strength },
    ],
    options: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
    results: {
      creator: { emoji: "🎨", title: "창조자 (Creator)", desc: "새로운 아이디어와 독창적인 해결책을 만드는 것이 당신의 본질입니다. 변화와 혁신의 씨앗을 뿌리는 사람입니다." },
      analyzer: { emoji: "🔍", title: "분석자 (Analyzer)", desc: "데이터와 논리로 문제의 본질을 꿰뚫는 능력을 가졌습니다. 복잡한 것을 단순하게 만드는 귀재입니다." },
      connector: { emoji: "🤝", title: "연결자 (Connector)", desc: "사람과 아이디어를 연결하는 타고난 네트워커입니다. 당신이 있는 곳에서 협력이 일어납니다." },
      achiever: { emoji: "🏆", title: "실행자 (Achiever)", desc: "목표를 향해 끊임없이 나아가는 추진력의 소유자입니다. 계획을 현실로 만드는 것이 강점입니다." },
      healer: { emoji: "💚", title: "치유자 (Healer)", desc: "타인의 고통에 공감하고 회복을 돕는 깊은 인간미를 가졌습니다. 당신 곁에 있으면 마음이 편안해집니다." },
      leader: { emoji: "⭐", title: "리더 (Leader)", desc: "방향을 제시하고 사람들을 이끄는 자연스러운 리더십을 가졌습니다. 위기에서 빛나는 사람입니다." },
    },
    retake: "다시하기", resultLabel: "나의 핵심 강점",
  },
  en: {
    title: "Strengths Discovery Test: What's Your Hidden Strength?",
    description: "Discover your core strength type through 12 situational questions.",
    questions: [
      { id: "q1", text: "I feel most energized when coming up with new ideas or approaches.", type: "creator" as Strength },
      { id: "q2", text: "I enjoy analyzing complex problems using data and logic.", type: "analyzer" as Strength },
      { id: "q3", text: "Helping people connect and collaborate comes naturally to me.", type: "connector" as Strength },
      { id: "q4", text: "I find deep satisfaction in setting goals and seeing them through.", type: "achiever" as Strength },
      { id: "q5", text: "I sense when someone is struggling and naturally offer comfort.", type: "healer" as Strength },
      { id: "q6", text: "I feel comfortable pointing a group in the right direction.", type: "leader" as Strength },
      { id: "q7", text: "I'm always looking for better ways to do things.", type: "creator" as Strength },
      { id: "q8", text: "Gathering information and finding patterns is second nature to me.", type: "analyzer" as Strength },
      { id: "q9", text: "I make friends easily with people from different backgrounds.", type: "connector" as Strength },
      { id: "q10", text: "Deadlines and responsibility make me more focused.", type: "achiever" as Strength },
      { id: "q11", text: "I quickly notice emotional shifts in others.", type: "healer" as Strength },
      { id: "q12", text: "When a team is in trouble, I step up and make decisions.", type: "leader" as Strength },
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    results: {
      creator: { emoji: "🎨", title: "Creator", desc: "Generating new ideas and original solutions is your essence. You are the seed of change and innovation." },
      analyzer: { emoji: "🔍", title: "Analyzer", desc: "You have the ability to pierce through the core of problems with data and logic. A master at simplifying the complex." },
      connector: { emoji: "🤝", title: "Connector", desc: "You're a born networker who connects people and ideas. Collaboration happens wherever you are." },
      achiever: { emoji: "🏆", title: "Achiever", desc: "You possess the drive to relentlessly move toward goals. Your strength is turning plans into reality." },
      healer: { emoji: "💚", title: "Healer", desc: "You have deep humanity — empathizing with others' pain and helping them recover. You bring comfort." },
      leader: { emoji: "⭐", title: "Leader", desc: "You have a natural leadership that sets direction and guides people. You shine brightest in a crisis." },
    },
    retake: "Retake", resultLabel: "Your Core Strength",
  },
  ja: {
    title: "強み発見テスト：あなたの隠れた強みは？",
    description: "12の状況質問であなたの核心的な強みタイプを発見しましょう。",
    questions: [
      { id: "q1", text: "新しいアイデアや方法を思いつくとき、最もエネルギーが湧く。", type: "creator" as Strength },
      { id: "q2", text: "複雑な問題をデータと論理で分析するのが楽しい。", type: "analyzer" as Strength },
      { id: "q3", text: "人々がつながり協力し合うのを助ける役割が自然にできる。", type: "connector" as Strength },
      { id: "q4", text: "目標を立てて最後までやり遂げることに満足を感じる。", type: "achiever" as Strength },
      { id: "q5", text: "誰かが辛そうにしているとき、まず気づいて慰めの言葉をかける。", type: "healer" as Strength },
      { id: "q6", text: "グループが進むべき方向を示すことに違和感がない。", type: "leader" as Strength },
      { id: "q7", text: "既存のやり方よりも良い方法を常に探している。", type: "creator" as Strength },
      { id: "q8", text: "情報を集めてパターンを見つけ出すのが自然にできる。", type: "analyzer" as Strength },
      { id: "q9", text: "さまざまな背景の人と簡単に親しくなれる。", type: "connector" as Strength },
      { id: "q10", text: "締め切りと責任感が私をより集中させる。", type: "achiever" as Strength },
      { id: "q11", text: "他人の感情の変化に素早く気づく方だ。", type: "healer" as Strength },
      { id: "q12", text: "チームが困難なとき、前に出て決断を下す。", type: "leader" as Strength },
    ],
    options: ["全くそう思わない", "そう思わない", "普通", "そう思う", "非常にそう思う"],
    results: {
      creator: { emoji: "🎨", title: "クリエイター (Creator)", desc: "新しいアイデアと独創的な解決策を生み出すことがあなたの本質です。変化と革新の種をまく人です。" },
      analyzer: { emoji: "🔍", title: "アナライザー (Analyzer)", desc: "データと論理で問題の本質を見抜く力を持っています。複雑なものを単純化する達人です。" },
      connector: { emoji: "🤝", title: "コネクター (Connector)", desc: "人とアイデアをつなぐ生まれながらのネットワーカーです。あなたがいる場所で協力が生まれます。" },
      achiever: { emoji: "🏆", title: "アチーバー (Achiever)", desc: "目標に向かって絶えず前進する推進力の持ち主です。計画を現実にすることが強みです。" },
      healer: { emoji: "💚", title: "ヒーラー (Healer)", desc: "他者の痛みに共感し、回復を助ける深い人間味を持っています。あなたのそばにいると心が安らぎます。" },
      leader: { emoji: "⭐", title: "リーダー (Leader)", desc: "方向を示し人々を導く自然なリーダーシップを持っています。危機の中で輝く人です。" },
    },
    retake: "もう一度", resultLabel: "あなたの核心的な強み",
  },
  zh: {
    title: "优势发现测试：你隐藏的优势是什么？",
    description: "通过12个情境问题，发现你的核心优势类型。",
    questions: [
      { id: "q1", text: "想出新点子或新方法时，我最有干劲。", type: "creator" as Strength },
      { id: "q2", text: "用数据和逻辑分析复杂问题让我感到愉快。", type: "analyzer" as Strength },
      { id: "q3", text: "帮助人们建立联系与协作，对我来说很自然。", type: "connector" as Strength },
      { id: "q4", text: "设定目标并坚持完成让我感到深深的满足。", type: "achiever" as Strength },
      { id: "q5", text: "有人遇到困难时，我会最先察觉并主动安慰。", type: "healer" as Strength },
      { id: "q6", text: "为团队指明方向让我感到自在。", type: "leader" as Strength },
      { id: "q7", text: "我总是在寻找比现有方式更好的方法。", type: "creator" as Strength },
      { id: "q8", text: "收集信息并发现规律对我来说是自然而然的事。", type: "analyzer" as Strength },
      { id: "q9", text: "我很容易和不同背景的人交上朋友。", type: "connector" as Strength },
      { id: "q10", text: "截止日期和责任感让我更加专注。", type: "achiever" as Strength },
      { id: "q11", text: "我能很快察觉他人情绪上的变化。", type: "healer" as Strength },
      { id: "q12", text: "团队陷入困境时，我会挺身而出做出决定。", type: "leader" as Strength },
    ],
    options: ["完全不符合", "不符合", "一般", "符合", "非常符合"],
    results: {
      creator: { emoji: "🎨", title: "创造者 (Creator)", desc: "创造新想法和独创的解决方案是你的本质。你是播下变革与创新种子的人。" },
      analyzer: { emoji: "🔍", title: "分析者 (Analyzer)", desc: "你拥有用数据和逻辑洞察问题本质的能力，是把复杂事物化繁为简的高手。" },
      connector: { emoji: "🤝", title: "连接者 (Connector)", desc: "你是天生的联络者，善于连接人与想法。协作总在你所在之处发生。" },
      achiever: { emoji: "🏆", title: "执行者 (Achiever)", desc: "你拥有不断朝目标前进的推动力，将计划变为现实是你的强项。" },
      healer: { emoji: "💚", title: "治愈者 (Healer)", desc: "你拥有共情他人痛苦、助其恢复的深厚人情味。有你在身边，人会感到安心。" },
      leader: { emoji: "⭐", title: "领导者 (Leader)", desc: "你拥有指明方向、带领他人的天生领导力，是在危机中闪耀的人。" },
    },
    retake: "重新测试", resultLabel: "你的核心优势",
  },
  fr: {
    title: "Test de découverte des forces : quelle est votre force cachée ?",
    description: "Découvrez votre type de force fondamentale à travers 12 questions situationnelles.",
    questions: [
      { id: "q1", text: "Je me sens le plus énergique quand j'imagine de nouvelles idées ou approches.", type: "creator" as Strength },
      { id: "q2", text: "J'aime analyser des problèmes complexes avec des données et de la logique.", type: "analyzer" as Strength },
      { id: "q3", text: "Aider les gens à se connecter et à collaborer me vient naturellement.", type: "connector" as Strength },
      { id: "q4", text: "Je ressens une profonde satisfaction à me fixer des objectifs et à les mener à bien.", type: "achiever" as Strength },
      { id: "q5", text: "Je sens quand quelqu'un traverse une période difficile et lui offre naturellement du réconfort.", type: "healer" as Strength },
      { id: "q6", text: "Je me sens à l'aise pour indiquer la bonne direction à un groupe.", type: "leader" as Strength },
      { id: "q7", text: "Je cherche toujours de meilleures façons de faire les choses.", type: "creator" as Strength },
      { id: "q8", text: "Rassembler des informations et repérer des tendances est une seconde nature pour moi.", type: "analyzer" as Strength },
      { id: "q9", text: "Je me lie facilement avec des personnes d'horizons différents.", type: "connector" as Strength },
      { id: "q10", text: "Les délais et le sens des responsabilités me rendent plus concentré(e).", type: "achiever" as Strength },
      { id: "q11", text: "Je remarque rapidement les changements émotionnels chez les autres.", type: "healer" as Strength },
      { id: "q12", text: "Quand une équipe est en difficulté, je prends les devants et je décide.", type: "leader" as Strength },
    ],
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    results: {
      creator: { emoji: "🎨", title: "Créateur (Creator)", desc: "Générer de nouvelles idées et des solutions originales, c'est votre essence. Vous semez les graines du changement et de l'innovation." },
      analyzer: { emoji: "🔍", title: "Analyste (Analyzer)", desc: "Vous avez la capacité de percer le cœur des problèmes grâce aux données et à la logique. Un maître pour simplifier ce qui est complexe." },
      connector: { emoji: "🤝", title: "Connecteur (Connector)", desc: "Vous êtes un(e) réseauteur(se) né(e) qui relie les gens et les idées. La collaboration se produit partout où vous êtes." },
      achiever: { emoji: "🏆", title: "Réalisateur (Achiever)", desc: "Vous possédez la volonté d'avancer sans relâche vers vos objectifs. Votre force est de transformer les plans en réalité." },
      healer: { emoji: "💚", title: "Guérisseur (Healer)", desc: "Vous avez une profonde humanité — vous compatissez à la douleur des autres et les aidez à se rétablir. Vous apportez du réconfort." },
      leader: { emoji: "⭐", title: "Leader (Leader)", desc: "Vous avez un leadership naturel qui fixe le cap et guide les gens. Vous brillez le plus en temps de crise." },
    },
    retake: "Recommencer", resultLabel: "Votre force fondamentale",
  },
  es: {
    title: "Test de descubrimiento de fortalezas: ¿cuál es tu fortaleza oculta?",
    description: "Descubre tu tipo de fortaleza central a través de 12 preguntas situacionales.",
    questions: [
      { id: "q1", text: "Me siento con más energía cuando se me ocurren ideas o enfoques nuevos.", type: "creator" as Strength },
      { id: "q2", text: "Disfruto analizando problemas complejos con datos y lógica.", type: "analyzer" as Strength },
      { id: "q3", text: "Ayudar a que la gente se conecte y colabore me sale de forma natural.", type: "connector" as Strength },
      { id: "q4", text: "Siento una profunda satisfacción al fijarme metas y llevarlas hasta el final.", type: "achiever" as Strength },
      { id: "q5", text: "Percibo cuando alguien lo está pasando mal y le ofrezco consuelo de forma natural.", type: "healer" as Strength },
      { id: "q6", text: "Me siento cómodo(a) marcando el rumbo para un grupo.", type: "leader" as Strength },
      { id: "q7", text: "Siempre estoy buscando mejores formas de hacer las cosas.", type: "creator" as Strength },
      { id: "q8", text: "Recopilar información y encontrar patrones es algo natural para mí.", type: "analyzer" as Strength },
      { id: "q9", text: "Hago amigos fácilmente con personas de orígenes distintos.", type: "connector" as Strength },
      { id: "q10", text: "Los plazos y la responsabilidad me hacen concentrarme más.", type: "achiever" as Strength },
      { id: "q11", text: "Noto rápidamente los cambios emocionales en los demás.", type: "healer" as Strength },
      { id: "q12", text: "Cuando un equipo tiene problemas, doy un paso al frente y tomo decisiones.", type: "leader" as Strength },
    ],
    options: ["Nunca", "Rara vez", "A veces", "A menudo", "Siempre"],
    results: {
      creator: { emoji: "🎨", title: "Creador (Creator)", desc: "Generar ideas nuevas y soluciones originales es tu esencia. Eres quien siembra el cambio y la innovación." },
      analyzer: { emoji: "🔍", title: "Analista (Analyzer)", desc: "Tienes la capacidad de llegar al fondo de los problemas con datos y lógica. Un maestro simplificando lo complejo." },
      connector: { emoji: "🤝", title: "Conector (Connector)", desc: "Eres un(a) conector(a) nato(a) que une a personas e ideas. La colaboración surge allí donde estás." },
      achiever: { emoji: "🏆", title: "Realizador (Achiever)", desc: "Posees el impulso para avanzar sin descanso hacia tus metas. Tu fortaleza es convertir los planes en realidad." },
      healer: { emoji: "💚", title: "Sanador (Healer)", desc: "Tienes una profunda humanidad: te compadeces del dolor ajeno y ayudas a que otros se recuperen. Aportas consuelo." },
      leader: { emoji: "⭐", title: "Líder (Leader)", desc: "Tienes un liderazgo natural que marca el rumbo y guía a las personas. Brillas más en las crisis." },
    },
    retake: "Repetir", resultLabel: "Tu fortaleza central",
  },
};

type SupportedLocale = keyof typeof data;
const SUPPORTED_LOCALES: SupportedLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const UI_LABELS: Record<SupportedLocale, {
  completed: (completed: number, total: number) => string;
  unanswered: (count: number) => string;
  submit: string;
  validation: string;
}> = {
  ko: { completed: (c, t) => `${c} / ${t} 응답`, unanswered: (c) => `미응답 ${c}개`, submit: "결과 보기", validation: "응답하지 않은 첫 문항으로 이동했습니다." },
  en: { completed: (c, t) => `${c} / ${t} answered`, unanswered: (c) => `${c} unanswered`, submit: "See Results", validation: "Moved to the first unanswered question." },
  ja: { completed: (c, t) => `${c} / ${t} 回答済み`, unanswered: (c) => `未回答 ${c}件`, submit: "結果を見る", validation: "未回答の最初の質問に移動しました。" },
  zh: { completed: (c, t) => `已回答 ${c} / ${t}`, unanswered: (c) => `未回答 ${c} 题`, submit: "查看结果", validation: "已跳转到第一个未回答的问题。" },
  fr: { completed: (c, t) => `${c} / ${t} réponses`, unanswered: (c) => `${c} sans réponse`, submit: "Voir les résultats", validation: "Vous avez été redirigé(e) vers la première question sans réponse." },
  es: { completed: (c, t) => `${c} / ${t} respondidas`, unanswered: (c) => `${c} sin responder`, submit: "Ver resultados", validation: "Se te ha llevado a la primera pregunta sin responder." },
};

export default function StrengthSageTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "strength-sage", title: "StrengthSageTest", finished: phase === "result" });

  const scores = Object.fromEntries(
    (["creator", "analyzer", "connector", "achiever", "healer", "leader"] as Strength[]).map((s) => [s, 0])
  ) as Record<Strength, number>;

  t.questions.forEach((q) => {
    if (answers[q.id]) scores[q.type] += answers[q.id];
  });

  const topStrength = (Object.entries(scores) as [Strength, number][]).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  if (phase === "result") {
    const r = t.results[topStrength];
    return (
      <div className="not-prose my-10 p-8 bg-card border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-green-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="p-6 bg-surface-subtle rounded-2xl border border-green-100">
          <p className="text-slate-700 text-base leading-relaxed">{r.desc}</p>
        </div>
        <button onClick={() => { setAnswers({}); setPhase("quiz"); }} className="text-slate-400 text-sm hover:underline">{t.retake}</button>
        <ShareResultButton locale={lang} heading={t.title} resultTitle={r.title} emoji={r.emoji} />
      </div>
    );
  }

  return (
    <QuestionnaireMatrix
      title={t.title}
      description={t.description}
      questions={t.questions}
      options={t.options}
      answers={answers}
      completedLabel={ui.completed}
      unansweredLabel={ui.unanswered}
      submitLabel={ui.submit}
      validationLabel={ui.validation}
      onAnswer={(questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }))}
      onSubmit={() => setPhase("result")}
    />
  );
}
