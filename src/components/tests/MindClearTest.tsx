'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { QuestionnaireMatrix } from "@/components/ui/questionnaire-matrix";

interface Props { locale?: string; }

type ClarityLevel = "crystal" | "focused" | "foggy" | "overloaded";

const data = {
  ko: {
    title: "마음 명확도 테스트: 내 마음은 얼마나 맑은가?",
    description: "10개의 질문으로 현재 정신적 명확도와 인지 부하 수준을 측정합니다.",
    questions: [
      { id: "q1", text: "아침에 일어났을 때 오늘 해야 할 일이 선명하게 떠오른다.", reverse: false },
      { id: "q2", text: "하나의 생각에서 다른 생각으로 자주 뛰어다닌다.", reverse: true },
      { id: "q3", text: "대화 중 상대방의 말을 처음부터 끝까지 잘 집중해서 듣는다.", reverse: false },
      { id: "q4", text: "머릿속에 처리되지 않은 걱정이나 미결 사항이 많이 쌓여 있다.", reverse: true },
      { id: "q5", text: "중요한 결정을 내릴 때 무엇을 원하는지 분명히 안다.", reverse: false },
      { id: "q6", text: "간단한 일도 시작하기가 버겁게 느껴질 때가 있다.", reverse: true },
      { id: "q7", text: "하루 일과를 마치고 나면 성취감이 든다.", reverse: false },
      { id: "q8", text: "생각이 많아서 잠들기 어려운 날이 자주 있다.", reverse: true },
      { id: "q9", text: "지금 이 순간에 집중하는 것이 자연스럽다.", reverse: false },
      { id: "q10", text: "해야 할 일들이 머릿속에서 충돌하는 느낌이 든다.", reverse: true },
    ],
    options: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
    results: {
      crystal: { emoji: "💎", title: "수정처럼 맑은 마음 (Crystal Clear)", desc: "현재 정신적 명확도가 매우 높습니다. 생각이 잘 정리되어 있고 집중력과 결정력이 좋습니다. 지금의 루틴을 유지하세요." },
      focused: { emoji: "🔆", title: "집중된 마음 (Focused)", desc: "대체로 명확하지만 가끔 흐릿해지는 순간이 있습니다. 짧은 마음 정리 시간(일기, 명상)으로 더 선명해질 수 있습니다." },
      foggy: { emoji: "🌫️", title: "안개 낀 마음 (Foggy)", desc: "처리되지 않은 생각들이 명확도를 흐리고 있습니다. 할 일 목록 작성, 디지털 디톡스, 충분한 수면이 도움이 됩니다." },
      overloaded: { emoji: "⚡", title: "과부하 상태 (Overloaded)", desc: "현재 인지 부하가 매우 높습니다. 즉시 중요한 것 3가지만 남기고 나머지를 내려놓는 연습이 필요합니다." },
    },
    retake: "다시하기", resultLabel: "나의 마음 명확도",
  },
  en: {
    title: "Mind Clear Test: How Clear Is Your Mind?",
    description: "Measure your current mental clarity and cognitive load with 10 questions.",
    questions: [
      { id: "q1", text: "When I wake up, I have a clear picture of what I need to do today.", reverse: false },
      { id: "q2", text: "My thoughts frequently jump from one thing to another.", reverse: true },
      { id: "q3", text: "During conversations, I can focus on what the other person is saying from start to finish.", reverse: false },
      { id: "q4", text: "There are many unprocessed worries or unfinished tasks piling up in my head.", reverse: true },
      { id: "q5", text: "When making important decisions, I clearly know what I want.", reverse: false },
      { id: "q6", text: "Even simple tasks sometimes feel overwhelming to start.", reverse: true },
      { id: "q7", text: "At the end of the day, I feel a sense of accomplishment.", reverse: false },
      { id: "q8", text: "I often have trouble falling asleep because my mind is too active.", reverse: true },
      { id: "q9", text: "Focusing on the present moment comes naturally to me.", reverse: false },
      { id: "q10", text: "The things I need to do feel like they're colliding in my head.", reverse: true },
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    results: {
      crystal: { emoji: "💎", title: "Crystal Clear", desc: "Your mental clarity is very high right now. Your thoughts are well-organized and you have good focus and decisiveness. Keep your current routine." },
      focused: { emoji: "🔆", title: "Focused", desc: "Generally clear, but occasionally cloudy. Short mind-clearing sessions (journaling, meditation) can sharpen your clarity." },
      foggy: { emoji: "🌫️", title: "Foggy", desc: "Unprocessed thoughts are clouding your clarity. Writing to-do lists, digital detoxes, and sufficient sleep will help." },
      overloaded: { emoji: "⚡", title: "Overloaded", desc: "Your cognitive load is very high. Practice keeping only the 3 most important things and letting the rest go." },
    },
    retake: "Retake", resultLabel: "Your Mind Clarity Level",
  },
  ja: {
    title: "心の明晰度テスト：あなたの心はどれくらい澄んでいる？",
    description: "10の質問で、現在の精神的明晰度と認知負荷レベルを測定します。",
    questions: [
      { id: "q1", text: "朝起きたとき、今日やるべきことがはっきりと思い浮かぶ。", reverse: false },
      { id: "q2", text: "ある考えから別の考えへと頻繁に飛び移る。", reverse: true },
      { id: "q3", text: "会話中、相手の話を最初から最後までしっかり集中して聞ける。", reverse: false },
      { id: "q4", text: "頭の中に処理できていない心配事や未解決の事柄がたくさん溜まっている。", reverse: true },
      { id: "q5", text: "重要な決定を下すとき、自分が何を望んでいるかはっきりわかる。", reverse: false },
      { id: "q6", text: "簡単なことでも始めるのが億劫に感じることがある。", reverse: true },
      { id: "q7", text: "一日を終えると達成感を感じる。", reverse: false },
      { id: "q8", text: "考え事が多くて眠りにつきにくい日がよくある。", reverse: true },
      { id: "q9", text: "今この瞬間に集中することが自然にできる。", reverse: false },
      { id: "q10", text: "やるべきことが頭の中でぶつかり合っているように感じる。", reverse: true },
    ],
    options: ["全くそう思わない", "そう思わない", "普通", "そう思う", "非常にそう思う"],
    results: {
      crystal: { emoji: "💎", title: "水晶のように澄んだ心 (Crystal Clear)", desc: "現在の精神的明晰度は非常に高いです。考えがよく整理されており、集中力と決断力に優れています。今のルーティンを維持しましょう。" },
      focused: { emoji: "🔆", title: "集中した心 (Focused)", desc: "おおむね明晰ですが、時々曇る瞬間があります。短い心の整理時間（日記、瞑想）でより鮮明になります。" },
      foggy: { emoji: "🌫️", title: "霧がかかった心 (Foggy)", desc: "処理されていない考えが明晰さを曇らせています。To-Doリストの作成、デジタルデトックス、十分な睡眠が助けになります。" },
      overloaded: { emoji: "⚡", title: "過負荷状態 (Overloaded)", desc: "現在の認知負荷が非常に高い状態です。すぐに重要なこと3つだけを残し、残りを手放す練習が必要です。" },
    },
    retake: "もう一度", resultLabel: "あなたの心の明晰度",
  },
  zh: {
    title: "心智清晰度测试：你的头脑有多清晰？",
    description: "通过10个问题，测量你当前的心智清晰度和认知负荷水平。",
    questions: [
      { id: "q1", text: "早上醒来时，我能清楚地想到今天要做的事情。", reverse: false },
      { id: "q2", text: "我的思绪常常从一个念头跳到另一个念头。", reverse: true },
      { id: "q3", text: "在对话中，我能从头到尾集中精力听对方说话。", reverse: false },
      { id: "q4", text: "脑海中积压了很多未处理的担忧或未完成的事项。", reverse: true },
      { id: "q5", text: "做重要决定时，我清楚地知道自己想要什么。", reverse: false },
      { id: "q6", text: "即使是简单的事，有时也会觉得难以开始。", reverse: true },
      { id: "q7", text: "结束一天后，我会感到有成就感。", reverse: false },
      { id: "q8", text: "我常常因为想法太多而难以入睡。", reverse: true },
      { id: "q9", text: "专注于当下对我来说很自然。", reverse: false },
      { id: "q10", text: "我感觉要做的事情在脑海中相互冲突。", reverse: true },
    ],
    options: ["完全不符合", "不符合", "一般", "符合", "非常符合"],
    results: {
      crystal: { emoji: "💎", title: "水晶般清澈的心 (Crystal Clear)", desc: "你当前的心智清晰度非常高。思绪井然有序，专注力和决断力都很出色。请保持现在的作息。" },
      focused: { emoji: "🔆", title: "专注的心 (Focused)", desc: "大体清晰，但偶尔会有些模糊的时刻。短暂的整理时间（写日记、冥想）能让你更加清晰。" },
      foggy: { emoji: "🌫️", title: "迷雾般的心 (Foggy)", desc: "未处理的想法正在模糊你的清晰度。列待办清单、数字排毒和充足睡眠会有所帮助。" },
      overloaded: { emoji: "⚡", title: "超负荷状态 (Overloaded)", desc: "你当前的认知负荷非常高。需要练习只保留3件最重要的事，放下其余的。" },
    },
    retake: "重新测试", resultLabel: "你的心智清晰度",
  },
  fr: {
    title: "Test de clarté mentale : à quel point votre esprit est-il clair ?",
    description: "Mesurez votre clarté mentale actuelle et votre charge cognitive à travers 10 questions.",
    questions: [
      { id: "q1", text: "Au réveil, j'ai une image claire de ce que je dois faire aujourd'hui.", reverse: false },
      { id: "q2", text: "Mes pensées passent fréquemment d'un sujet à l'autre.", reverse: true },
      { id: "q3", text: "Pendant une conversation, je peux me concentrer sur ce que dit l'autre personne du début à la fin.", reverse: false },
      { id: "q4", text: "Beaucoup de soucis non traités ou de tâches inachevées s'accumulent dans ma tête.", reverse: true },
      { id: "q5", text: "En prenant des décisions importantes, je sais clairement ce que je veux.", reverse: false },
      { id: "q6", text: "Même des tâches simples me semblent parfois difficiles à commencer.", reverse: true },
      { id: "q7", text: "À la fin de la journée, je ressens un sentiment d'accomplissement.", reverse: false },
      { id: "q8", text: "J'ai souvent du mal à m'endormir parce que mon esprit est trop actif.", reverse: true },
      { id: "q9", text: "Me concentrer sur le moment présent me vient naturellement.", reverse: false },
      { id: "q10", text: "J'ai l'impression que les choses à faire s'entrechoquent dans ma tête.", reverse: true },
    ],
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    results: {
      crystal: { emoji: "💎", title: "Clair comme le cristal (Crystal Clear)", desc: "Votre clarté mentale est actuellement très élevée. Vos pensées sont bien organisées et vous avez une bonne concentration et un bon pouvoir de décision. Gardez votre routine actuelle." },
      focused: { emoji: "🔆", title: "Esprit concentré (Focused)", desc: "Généralement clair, mais parfois un peu brumeux. De courtes sessions de clarification mentale (journal, méditation) peuvent affiner votre clarté." },
      foggy: { emoji: "🌫️", title: "Esprit brumeux (Foggy)", desc: "Des pensées non traitées brouillent votre clarté. Faire des listes de tâches, une désintoxication numérique et un sommeil suffisant vous aideront." },
      overloaded: { emoji: "⚡", title: "Surcharge (Overloaded)", desc: "Votre charge cognitive est actuellement très élevée. Entraînez-vous à ne garder que les 3 choses les plus importantes et à lâcher le reste." },
    },
    retake: "Recommencer", resultLabel: "Votre niveau de clarté mentale",
  },
  es: {
    title: "Test de claridad mental: ¿cuán clara está tu mente?",
    description: "Mide tu claridad mental actual y tu carga cognitiva con 10 preguntas.",
    questions: [
      { id: "q1", text: "Al despertar, tengo una imagen clara de lo que debo hacer hoy.", reverse: false },
      { id: "q2", text: "Mis pensamientos saltan con frecuencia de una cosa a otra.", reverse: true },
      { id: "q3", text: "Durante una conversación, puedo concentrarme en lo que dice la otra persona de principio a fin.", reverse: false },
      { id: "q4", text: "Se acumulan muchas preocupaciones sin resolver o tareas pendientes en mi cabeza.", reverse: true },
      { id: "q5", text: "Al tomar decisiones importantes, sé claramente lo que quiero.", reverse: false },
      { id: "q6", text: "Incluso tareas sencillas a veces se sienten abrumadoras de empezar.", reverse: true },
      { id: "q7", text: "Al terminar el día, siento una sensación de logro.", reverse: false },
      { id: "q8", text: "A menudo me cuesta conciliar el sueño porque mi mente está demasiado activa.", reverse: true },
      { id: "q9", text: "Concentrarme en el momento presente me resulta natural.", reverse: false },
      { id: "q10", text: "Siento que las cosas que debo hacer chocan entre sí en mi cabeza.", reverse: true },
    ],
    options: ["Nunca", "Rara vez", "A veces", "A menudo", "Siempre"],
    results: {
      crystal: { emoji: "💎", title: "Claro como el cristal (Crystal Clear)", desc: "Tu claridad mental es muy alta en este momento. Tus pensamientos están bien organizados y tienes buena concentración y capacidad de decisión. Mantén tu rutina actual." },
      focused: { emoji: "🔆", title: "Mente enfocada (Focused)", desc: "Generalmente clara, pero a veces algo nublada. Sesiones breves de orden mental (diario, meditación) pueden aumentar tu claridad." },
      foggy: { emoji: "🌫️", title: "Mente nublada (Foggy)", desc: "Pensamientos sin procesar están nublando tu claridad. Hacer listas de tareas, una desintoxicación digital y dormir lo suficiente te ayudarán." },
      overloaded: { emoji: "⚡", title: "Sobrecarga (Overloaded)", desc: "Tu carga cognitiva es muy alta en este momento. Practica quedarte solo con las 3 cosas más importantes y soltar el resto." },
    },
    retake: "Repetir", resultLabel: "Tu nivel de claridad mental",
  },
};

type SupportedLocale = keyof typeof data;
const SUPPORTED_LOCALES: SupportedLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const UI_LABELS: Record<SupportedLocale, {
  completed: (completed: number, total: number) => string;
  unanswered: (count: number) => string;
  submit: string;
  validation: string;
  clarityIndex: string;
}> = {
  ko: { completed: (c, t) => `${c} / ${t} 응답`, unanswered: (c) => `미응답 ${c}개`, submit: "결과 보기", validation: "응답하지 않은 첫 문항으로 이동했습니다.", clarityIndex: "명확도 지수" },
  en: { completed: (c, t) => `${c} / ${t} answered`, unanswered: (c) => `${c} unanswered`, submit: "See Results", validation: "Moved to the first unanswered question.", clarityIndex: "Clarity Index" },
  ja: { completed: (c, t) => `${c} / ${t} 回答済み`, unanswered: (c) => `未回答 ${c}件`, submit: "結果を見る", validation: "未回答の最初の質問に移動しました。", clarityIndex: "明晰度指数" },
  zh: { completed: (c, t) => `已回答 ${c} / ${t}`, unanswered: (c) => `未回答 ${c} 题`, submit: "查看结果", validation: "已跳转到第一个未回答的问题。", clarityIndex: "清晰度指数" },
  fr: { completed: (c, t) => `${c} / ${t} réponses`, unanswered: (c) => `${c} sans réponse`, submit: "Voir les résultats", validation: "Vous avez été redirigé(e) vers la première question sans réponse.", clarityIndex: "Indice de clarté" },
  es: { completed: (c, t) => `${c} / ${t} respondidas`, unanswered: (c) => `${c} sin responder`, submit: "Ver resultados", validation: "Se te ha llevado a la primera pregunta sin responder.", clarityIndex: "Índice de claridad" },
};

export default function MindClearTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "mind-clear", title: "MindClearTest", finished: phase === "result" });

  const totalScore = t.questions.reduce((sum, q) => {
    const raw = answers[q.id] ?? 0;
    const score = q.reverse ? 6 - raw : raw;
    return sum + score;
  }, 0);

  const maxScore = t.questions.length * 5;
  const pct = totalScore / maxScore;

  const level: ClarityLevel =
    pct >= 0.8 ? "crystal" :
    pct >= 0.6 ? "focused" :
    pct >= 0.4 ? "foggy" :
    "overloaded";


  if (phase === "result") {
    const r = t.results[level];
    const barPct = Math.round(pct * 100);
    return (
      <div className="not-prose my-10 p-8 bg-card border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-green-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>{ui.clarityIndex}</span>
            <span className="font-bold text-green-600">{barPct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full">
            <div className="h-3 bg-green-500 rounded-full transition-all" style={{ width: `${barPct}%` }} />
          </div>
        </div>
        <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
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
