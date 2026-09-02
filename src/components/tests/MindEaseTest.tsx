'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { QuestionnaireMatrix } from "@/components/ui/questionnaire-matrix";

interface Props { locale?: string; }

type AnxietyLevel = "very_low" | "low" | "moderate" | "high" | "very_high";

const data = {
  ko: {
    title: "건강 불안 테스트: 나의 건강 걱정 수준은?",
    description: "10개의 질문으로 건강 불안 수준을 측정하세요.",
    questions: [
      { id: "q1", text: "심각한 질병에 걸릴까 봐 걱정하는 빈도는?", reverse: false },
      { id: "q2", text: "신체에 새로운 증상이나 감각이 느껴질 때 얼마나 빨리 심각하게 생각하나요?", reverse: false },
      { id: "q3", text: "건강 정보를 온라인에서 얼마나 자주 검색하나요?", reverse: false },
      { id: "q4", text: "신체 증상이 삶을 즐기는 것을 방해하는 빈도는?", reverse: false },
      { id: "q5", text: "의사에게 건강에 대한 안심을 구하는 빈도는?", reverse: false },
      { id: "q6", text: "몸에서 질병의 징후를 확인하는 빈도는?", reverse: false },
      { id: "q7", text: "의사가 이상 없다고 할 때 안심이 되나요?", reverse: true },
      { id: "q8", text: "건강 걱정이 수면에 영향을 주는 빈도는?", reverse: false },
      { id: "q9", text: "건강에 대한 걱정으로 활동을 피하는 빈도는?", reverse: false },
      { id: "q10", text: "건강에 대해 최악의 시나리오를 상상하는 빈도는?", reverse: false },
    ],
    options: ["전혀 없음", "드물게", "가끔", "자주", "항상"],
    results: {
      very_low: { emoji: "🌈", title: "매우 낮은 건강 불안", desc: "건강에 대해 균형 잡힌 시각을 갖고 있습니다. 일반적인 신체 감각과 잠재적 건강 문제를 잘 구별하며, 건강 걱정이 일상생활을 방해하지 않습니다." },
      low: { emoji: "🌤️", title: "낮은 건강 불안", desc: "가끔 건강 걱정을 할 수 있지만 일상적 기능이나 감정적 웰빙에 크게 영향을 미치지 않습니다. 대체로 건강 걱정을 관점에서 처리하고 넘어갑니다." },
      moderate: { emoji: "⛅", title: "보통 수준의 건강 불안", desc: "평균보다 건강 문제에 대해 더 많이 걱정하는 편이며, 가끔 일상 활동을 방해할 수 있습니다. 마음 챙김 명상과 인터넷 건강 검색 제한이 도움이 될 수 있습니다." },
      high: { emoji: "🌧️", title: "높은 건강 불안", desc: "건강 걱정이 자주 생각을 차지하고 감정적 웰빙과 일상에 크게 영향을 줍니다. 인지행동요법이나 정신 건강 전문가 상담을 고려해보세요." },
      very_high: { emoji: "⛈️", title: "매우 높은 건강 불안", desc: "건강 걱정이 삶의 질에 상당한 영향을 미치고 있습니다. 건강 불안 전문 정신 건강 전문가의 도움을 받는 것을 강력히 권장합니다." },
    },
    retake: "다시하기", resultLabel: "나의 건강 불안 수준",
  },
  en: {
    title: "Health Anxiety Test: What's Your Health Anxiety Level?",
    description: "Measure your health anxiety level with 10 questions.",
    questions: [
      { id: "q1", text: "How often do you worry about having a serious illness?", reverse: false },
      { id: "q2", text: "When you notice a new bodily sensation, how quickly do you think it might be serious?", reverse: false },
      { id: "q3", text: "How much time do you spend researching health information online?", reverse: false },
      { id: "q4", text: "How often do physical symptoms interfere with your ability to enjoy life?", reverse: false },
      { id: "q5", text: "How frequently do you seek reassurance from doctors about your health?", reverse: false },
      { id: "q6", text: "How often do you check your body for signs of illness?", reverse: false },
      { id: "q7", text: "When a doctor tells you nothing is wrong, how reassured do you feel?", reverse: true },
      { id: "q8", text: "How much do health worries affect your sleep?", reverse: false },
      { id: "q9", text: "How often do you avoid activities due to health concerns?", reverse: false },
      { id: "q10", text: "How often do you imagine the worst possible health scenario?", reverse: false },
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    results: {
      very_low: { emoji: "🌈", title: "Very Low Health Anxiety", desc: "You have a balanced perspective on health concerns. You can distinguish between normal bodily sensations and potential health issues, and health worries don't interfere with your daily life." },
      low: { emoji: "🌤️", title: "Low Health Anxiety", desc: "You may occasionally have health concerns, but they don't significantly impact your daily functioning or emotional well-being. You're generally able to put health worries in perspective." },
      moderate: { emoji: "⛅", title: "Moderate Health Anxiety", desc: "You worry about health issues more than average, and these concerns may occasionally interfere with your activities. Mindfulness meditation and limiting health searches can help." },
      high: { emoji: "🌧️", title: "High Health Anxiety", desc: "Health concerns frequently occupy your thoughts and significantly impact your emotional well-being. Consider cognitive-behavioral therapy or consultation with a mental health professional." },
      very_high: { emoji: "⛈️", title: "Very High Health Anxiety", desc: "Health concerns are significantly impacting your quality of life. Seeking help from a mental health professional who specializes in health anxiety is strongly recommended." },
    },
    retake: "Retake", resultLabel: "Your Health Anxiety Level",
  },
  ja: {
    title: "健康不安テスト：あなたの健康に対する不安レベルは？",
    description: "10の質問で健康不安のレベルを測定しましょう。",
    questions: [
      { id: "q1", text: "重い病気にかかるのではないかと心配する頻度は？", reverse: false },
      { id: "q2", text: "体に新しい症状や感覚を感じたとき、どれくらい早く深刻に考えますか？", reverse: false },
      { id: "q3", text: "健康情報をオンラインで検索する頻度は？", reverse: false },
      { id: "q4", text: "身体症状が生活を楽しむことを妨げる頻度は？", reverse: false },
      { id: "q5", text: "医師に健康について安心を求める頻度は？", reverse: false },
      { id: "q6", text: "体に病気の兆候がないか確認する頻度は？", reverse: false },
      { id: "q7", text: "医師に問題ないと言われたとき、安心できますか？", reverse: true },
      { id: "q8", text: "健康の心配が睡眠に影響する頻度は？", reverse: false },
      { id: "q9", text: "健康の心配から活動を避ける頻度は？", reverse: false },
      { id: "q10", text: "健康について最悪のシナリオを想像する頻度は？", reverse: false },
    ],
    options: ["全くない", "まれに", "時々", "よくある", "常に"],
    results: {
      very_low: { emoji: "🌈", title: "非常に低い健康不安", desc: "健康について バランスの取れた見方をしています。通常の身体感覚と潜在的な健康問題をうまく区別でき、健康の心配が日常生活を妨げることはありません。" },
      low: { emoji: "🌤️", title: "低い健康不安", desc: "たまに健康の心配をすることがありますが、日常の機能や感情的な幸福に大きく影響しません。おおむね健康の心配を客観的に捉えて乗り越えられます。" },
      moderate: { emoji: "⛅", title: "中程度の健康不安", desc: "平均より健康問題について心配する傾向があり、時々日常活動を妨げることがあります。マインドフルネス瞑想や健康検索の制限が役立つかもしれません。" },
      high: { emoji: "🌧️", title: "高い健康不安", desc: "健康の心配が頻繁に頭を占め、感情的な幸福と日常生活に大きく影響しています。認知行動療法やメンタルヘルスの専門家への相談を検討してください。" },
      very_high: { emoji: "⛈️", title: "非常に高い健康不安", desc: "健康の心配が生活の質にかなりの影響を及ぼしています。健康不安を専門とするメンタルヘルスの専門家の助けを求めることを強くお勧めします。" },
    },
    retake: "もう一度", resultLabel: "あなたの健康不安レベル",
  },
  zh: {
    title: "健康焦虑测试：你的健康担忧程度是多少？",
    description: "通过10个问题，测量你的健康焦虑水平。",
    questions: [
      { id: "q1", text: "你担心自己患上严重疾病的频率是？", reverse: false },
      { id: "q2", text: "当身体出现新的症状或感觉时，你有多快会往严重的方向想？", reverse: false },
      { id: "q3", text: "你在网上搜索健康信息的频率是？", reverse: false },
      { id: "q4", text: "身体症状妨碍你享受生活的频率是？", reverse: false },
      { id: "q5", text: "你向医生寻求健康方面安慰的频率是？", reverse: false },
      { id: "q6", text: "你检查身体是否有疾病迹象的频率是？", reverse: false },
      { id: "q7", text: "当医生说没有问题时，你会感到安心吗？", reverse: true },
      { id: "q8", text: "健康担忧影响你睡眠的程度是？", reverse: false },
      { id: "q9", text: "因健康担忧而回避活动的频率是？", reverse: false },
      { id: "q10", text: "你想象最坏健康情况的频率是？", reverse: false },
    ],
    options: ["从不", "很少", "有时", "经常", "总是"],
    results: {
      very_low: { emoji: "🌈", title: "健康焦虑程度非常低", desc: "你对健康问题持平衡的看法。你能很好地区分正常的身体感觉与潜在的健康问题，健康担忧不会影响你的日常生活。" },
      low: { emoji: "🌤️", title: "健康焦虑程度较低", desc: "你偶尔会担心健康问题，但不会明显影响日常功能或情绪健康。你通常能理性看待健康担忧并顺利放下。" },
      moderate: { emoji: "⛅", title: "健康焦虑程度中等", desc: "你比一般人更担心健康问题，这些担忧有时会影响你的日常活动。正念冥想和限制健康搜索可能会有所帮助。" },
      high: { emoji: "🌧️", title: "健康焦虑程度较高", desc: "健康担忧频繁占据你的思绪，并显著影响你的情绪健康与日常生活。可以考虑认知行为疗法或咨询心理健康专业人士。" },
      very_high: { emoji: "⛈️", title: "健康焦虑程度非常高", desc: "健康担忧正在显著影响你的生活质量。强烈建议寻求擅长健康焦虑的心理健康专业人士的帮助。" },
    },
    retake: "重新测试", resultLabel: "你的健康焦虑水平",
  },
  fr: {
    title: "Test d'anxiété liée à la santé : quel est votre niveau d'inquiétude pour votre santé ?",
    description: "Mesurez votre niveau d'anxiété liée à la santé à travers 10 questions.",
    questions: [
      { id: "q1", text: "À quelle fréquence vous inquiétez-vous d'avoir une maladie grave ?", reverse: false },
      { id: "q2", text: "Quand vous remarquez une nouvelle sensation corporelle, à quelle vitesse pensez-vous qu'elle pourrait être grave ?", reverse: false },
      { id: "q3", text: "Combien de temps passez-vous à rechercher des informations de santé en ligne ?", reverse: false },
      { id: "q4", text: "À quelle fréquence les symptômes physiques nuisent-ils à votre capacité à profiter de la vie ?", reverse: false },
      { id: "q5", text: "À quelle fréquence recherchez-vous un réconfort auprès des médecins concernant votre santé ?", reverse: false },
      { id: "q6", text: "À quelle fréquence vérifiez-vous votre corps à la recherche de signes de maladie ?", reverse: false },
      { id: "q7", text: "Quand un médecin vous dit que tout va bien, à quel point êtes-vous rassuré(e) ?", reverse: true },
      { id: "q8", text: "Dans quelle mesure les inquiétudes liées à la santé affectent-elles votre sommeil ?", reverse: false },
      { id: "q9", text: "À quelle fréquence évitez-vous des activités à cause de préoccupations de santé ?", reverse: false },
      { id: "q10", text: "À quelle fréquence imaginez-vous le pire scénario possible concernant votre santé ?", reverse: false },
    ],
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    results: {
      very_low: { emoji: "🌈", title: "Anxiété liée à la santé très faible", desc: "Vous avez une perspective équilibrée sur les questions de santé. Vous distinguez bien les sensations corporelles normales des problèmes de santé potentiels, et vos inquiétudes n'interfèrent pas avec votre vie quotidienne." },
      low: { emoji: "🌤️", title: "Anxiété liée à la santé faible", desc: "Vous avez parfois des inquiétudes de santé, mais elles n'affectent pas significativement votre fonctionnement quotidien ni votre bien-être émotionnel. Vous arrivez généralement à relativiser." },
      moderate: { emoji: "⛅", title: "Anxiété liée à la santé modérée", desc: "Vous vous inquiétez des problèmes de santé plus que la moyenne, et ces préoccupations peuvent occasionnellement perturber vos activités. La méditation de pleine conscience et la limitation des recherches en ligne peuvent aider." },
      high: { emoji: "🌧️", title: "Anxiété liée à la santé élevée", desc: "Les préoccupations de santé occupent fréquemment vos pensées et affectent significativement votre bien-être émotionnel et votre quotidien. Envisagez une thérapie cognitivo-comportementale ou une consultation avec un professionnel de santé mentale." },
      very_high: { emoji: "⛈️", title: "Anxiété liée à la santé très élevée", desc: "Les préoccupations de santé affectent significativement votre qualité de vie. Il est vivement recommandé de solliciter l'aide d'un professionnel de santé mentale spécialisé dans l'anxiété liée à la santé." },
    },
    retake: "Recommencer", resultLabel: "Votre niveau d'anxiété liée à la santé",
  },
  es: {
    title: "Test de ansiedad por la salud: ¿cuál es tu nivel de preocupación por la salud?",
    description: "Mide tu nivel de ansiedad por la salud con 10 preguntas.",
    questions: [
      { id: "q1", text: "¿Con qué frecuencia te preocupa tener una enfermedad grave?", reverse: false },
      { id: "q2", text: "Cuando notas una nueva sensación corporal, ¿qué tan rápido piensas que podría ser grave?", reverse: false },
      { id: "q3", text: "¿Cuánto tiempo pasas buscando información de salud en internet?", reverse: false },
      { id: "q4", text: "¿Con qué frecuencia los síntomas físicos interfieren con tu capacidad de disfrutar la vida?", reverse: false },
      { id: "q5", text: "¿Con qué frecuencia buscas tranquilidad de los médicos sobre tu salud?", reverse: false },
      { id: "q6", text: "¿Con qué frecuencia revisas tu cuerpo en busca de señales de enfermedad?", reverse: false },
      { id: "q7", text: "Cuando un médico te dice que no hay ningún problema, ¿qué tan tranquilo(a) te sientes?", reverse: true },
      { id: "q8", text: "¿Cuánto afectan las preocupaciones de salud a tu sueño?", reverse: false },
      { id: "q9", text: "¿Con qué frecuencia evitas actividades por preocupaciones de salud?", reverse: false },
      { id: "q10", text: "¿Con qué frecuencia imaginas el peor escenario posible de salud?", reverse: false },
    ],
    options: ["Nunca", "Rara vez", "A veces", "A menudo", "Siempre"],
    results: {
      very_low: { emoji: "🌈", title: "Ansiedad por la salud muy baja", desc: "Tienes una perspectiva equilibrada sobre las preocupaciones de salud. Distingues bien entre sensaciones corporales normales y posibles problemas de salud, y estas preocupaciones no interfieren con tu vida diaria." },
      low: { emoji: "🌤️", title: "Ansiedad por la salud baja", desc: "Es posible que tengas preocupaciones de salud ocasionales, pero no afectan significativamente tu funcionamiento diario ni tu bienestar emocional. En general, logras poner estas preocupaciones en perspectiva." },
      moderate: { emoji: "⛅", title: "Ansiedad por la salud moderada", desc: "Te preocupas por problemas de salud más de lo habitual, y estas preocupaciones pueden interferir ocasionalmente con tus actividades. La meditación de atención plena y limitar las búsquedas de salud pueden ayudar." },
      high: { emoji: "🌧️", title: "Ansiedad por la salud alta", desc: "Las preocupaciones de salud ocupan tus pensamientos con frecuencia y afectan significativamente tu bienestar emocional y tu vida diaria. Considera la terapia cognitivo-conductual o la consulta con un profesional de salud mental." },
      very_high: { emoji: "⛈️", title: "Ansiedad por la salud muy alta", desc: "Las preocupaciones de salud están afectando significativamente tu calidad de vida. Se recomienda encarecidamente buscar ayuda de un profesional de salud mental especializado en ansiedad por la salud." },
    },
    retake: "Repetir", resultLabel: "Tu nivel de ansiedad por la salud",
  },
};

type SupportedLocale = keyof typeof data;
const SUPPORTED_LOCALES: SupportedLocale[] = ["ko", "en", "ja", "zh", "fr", "es"];
const UI_LABELS: Record<SupportedLocale, {
  completed: (completed: number, total: number) => string;
  unanswered: (count: number) => string;
  submit: string;
  validation: string;
  anxietyIndex: string;
}> = {
  ko: { completed: (c, t) => `${c} / ${t} 응답`, unanswered: (c) => `미응답 ${c}개`, submit: "결과 보기", validation: "응답하지 않은 첫 문항으로 이동했습니다.", anxietyIndex: "불안 지수" },
  en: { completed: (c, t) => `${c} / ${t} answered`, unanswered: (c) => `${c} unanswered`, submit: "See Results", validation: "Moved to the first unanswered question.", anxietyIndex: "Anxiety Index" },
  ja: { completed: (c, t) => `${c} / ${t} 回答済み`, unanswered: (c) => `未回答 ${c}件`, submit: "結果を見る", validation: "未回答の最初の質問に移動しました。", anxietyIndex: "不安指数" },
  zh: { completed: (c, t) => `已回答 ${c} / ${t}`, unanswered: (c) => `未回答 ${c} 题`, submit: "查看结果", validation: "已跳转到第一个未回答的问题。", anxietyIndex: "焦虑指数" },
  fr: { completed: (c, t) => `${c} / ${t} réponses`, unanswered: (c) => `${c} sans réponse`, submit: "Voir les résultats", validation: "Vous avez été redirigé(e) vers la première question sans réponse.", anxietyIndex: "Indice d'anxiété" },
  es: { completed: (c, t) => `${c} / ${t} respondidas`, unanswered: (c) => `${c} sin responder`, submit: "Ver resultados", validation: "Se te ha llevado a la primera pregunta sin responder.", anxietyIndex: "Índice de ansiedad" },
};

export default function MindEaseTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "mind-ease", title: "MindEaseTest", finished: phase === "result" });

  const totalScore = t.questions.reduce((sum, q) => {
    const raw = answers[q.id] ?? 0;
    const score = q.reverse ? 6 - raw : raw;
    return sum + score;
  }, 0);

  const maxScore = t.questions.length * 5;
  const pct = totalScore / maxScore;

  const level: AnxietyLevel =
    pct <= 0.2 ? "very_low" :
    pct <= 0.4 ? "low" :
    pct <= 0.6 ? "moderate" :
    pct <= 0.8 ? "high" :
    "very_high";


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
            <span>{ui.anxietyIndex}</span>
            <span className="font-bold text-green-600">{barPct}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full">
            <div className="h-3 bg-green-500 rounded-full transition-all" style={{ width: `${barPct}%` }} />
          </div>
        </div>
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
