'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { QuestionnaireMatrix } from "@/components/ui/questionnaire-matrix";

interface Props { locale?: string; }

type ColorType = "visual-artist" | "color-harmonizer" | "contrast-seeker" | "intuitive-colorist";

const data = {
  ko: {
    title: "컬러 인식 테스트: 나의 색채 감각 유형은?",
    description: "12개의 색채 관련 질문으로 나의 컬러 인식 유형을 알아보세요.",
    questions: [
      { id: "q1", text: "방 인테리어를 고를 때 나는 주로 어떻게 하는가?", type: "color-harmonizer" as ColorType },
      { id: "q2", text: "전시회나 미술관에서 색채를 주로 어떻게 감상하는가?", type: "visual-artist" as ColorType },
      { id: "q3", text: "옷을 고를 때 나의 기준은 무엇인가?", type: "intuitive-colorist" as ColorType },
      { id: "q4", text: "사진을 찍을 때 가장 신경 쓰는 요소는?", type: "contrast-seeker" as ColorType },
      { id: "q5", text: "자연 속에서 특히 눈에 띄는 색은?", type: "visual-artist" as ColorType },
      { id: "q6", text: "친구가 옷 색상 조합을 물어본다. 나는?", type: "color-harmonizer" as ColorType },
      { id: "q7", text: "새로운 브랜드의 로고를 처음 봤을 때 가장 먼저 느끼는 것은?", type: "intuitive-colorist" as ColorType },
      { id: "q8", text: "강렬한 색 대비가 있는 작품을 봤을 때 나의 반응은?", type: "contrast-seeker" as ColorType },
      { id: "q9", text: "감정이 가라앉을 때 나를 위로하는 색은 어떤 계열인가?", type: "intuitive-colorist" as ColorType },
      { id: "q10", text: "봄 정원을 배경으로 사진을 찍는다. 나는 무엇을 강조하는가?", type: "visual-artist" as ColorType },
      { id: "q11", text: "새로운 공간(카페, 숙소 등)에 들어갔을 때 나는?", type: "color-harmonizer" as ColorType },
      { id: "q12", text: "그래픽 디자인 작업에서 색을 사용한다면?", type: "contrast-seeker" as ColorType },
    ],
    options: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
    results: {
      "visual-artist": { emoji: "🎨", title: "비주얼 아티스트형", desc: "당신은 색채를 예술적 언어로 사용합니다. 미묘한 색감 차이를 감지하고 색이 가진 감정적 깊이를 탐구하는 것을 즐깁니다. 창작 활동에서 색채가 핵심 표현 수단이 됩니다." },
      "color-harmonizer": { emoji: "🌈", title: "컬러 하모나이저형", desc: "당신은 색의 조화와 균형을 본능적으로 감지합니다. 공간, 의상, 디자인에서 서로 어우러지는 색 조합을 찾아내는 능력이 뛰어나며, 주변 환경을 아름답게 만드는 감각을 가졌습니다." },
      "contrast-seeker": { emoji: "⚡", title: "콘트라스트 시커형", desc: "당신은 강렬한 대비와 선명한 경계에서 에너지를 얻습니다. 흑과 백, 보색 대비 같은 극명한 색채 조합에 끌리며, 시각적 임팩트를 중시하는 뚜렷한 미적 감각을 가졌습니다." },
      "intuitive-colorist": { emoji: "✨", title: "인튜이티브 컬러리스트형", desc: "당신은 색채를 감정과 직관으로 경험합니다. 이론보다는 느낌으로 색을 선택하며, 색이 만드는 분위기와 감정적 공명에 민감합니다. 색에서 깊은 개인적 의미를 찾는 감성형입니다." },
    },
    retake: "다시하기", resultLabel: "나의 색채 감각 유형",
  },
  en: {
    title: "Color Recognition Test: What's Your Color Sensitivity Type?",
    description: "Find out your color perception type through 12 color-related questions.",
    questions: [
      { id: "q1", text: "When choosing room décor, what do I typically do?", type: "color-harmonizer" as ColorType },
      { id: "q2", text: "How do I appreciate color at exhibitions or galleries?", type: "visual-artist" as ColorType },
      { id: "q3", text: "What is my main criteria when choosing clothes?", type: "intuitive-colorist" as ColorType },
      { id: "q4", text: "What do I pay most attention to when taking photos?", type: "contrast-seeker" as ColorType },
      { id: "q5", text: "Which colors in nature particularly catch my eye?", type: "visual-artist" as ColorType },
      { id: "q6", text: "A friend asks for advice on color combinations for an outfit. I:", type: "color-harmonizer" as ColorType },
      { id: "q7", text: "When I see a new brand's logo for the first time, what do I notice first?", type: "intuitive-colorist" as ColorType },
      { id: "q8", text: "My reaction when I see artwork with strong color contrast is:", type: "contrast-seeker" as ColorType },
      { id: "q9", text: "What color family comforts me when my emotions are low?", type: "intuitive-colorist" as ColorType },
      { id: "q10", text: "Taking a photo in a spring garden, what do I emphasize?", type: "visual-artist" as ColorType },
      { id: "q11", text: "When entering a new space (café, accommodation, etc.), I:", type: "color-harmonizer" as ColorType },
      { id: "q12", text: "If I were using color in a graphic design project:", type: "contrast-seeker" as ColorType },
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    results: {
      "visual-artist": { emoji: "🎨", title: "Visual Artist", desc: "You use color as an artistic language. You enjoy detecting subtle color differences and exploring the emotional depth that colors hold. Color becomes the key expressive medium in your creative activities." },
      "color-harmonizer": { emoji: "🌈", title: "Color Harmonizer", desc: "You instinctively sense color harmony and balance. You excel at finding color combinations that work together in spaces, outfits, and design, with a talent for making your surroundings beautiful." },
      "contrast-seeker": { emoji: "⚡", title: "Contrast Seeker", desc: "You draw energy from intense contrast and sharp edges. You're drawn to striking color combinations like black-and-white or complementary contrasts, and have a strong aesthetic sense that values visual impact." },
      "intuitive-colorist": { emoji: "✨", title: "Intuitive Colorist", desc: "You experience color through emotion and intuition. You choose colors by feeling rather than theory, and are sensitive to the atmosphere and emotional resonance that colors create. You find deep personal meaning in color." },
    },
    retake: "Retake", resultLabel: "Your Color Sensitivity Type",
  },
  ja: {
    title: "カラー認識テスト：あなたの色彩感覚タイプは？",
    description: "12の色に関する質問であなたのカラー認識タイプを調べましょう。",
    questions: [
      { id: "q1", text: "部屋のインテリアを選ぶとき、私は主にどうするか？", type: "color-harmonizer" as ColorType },
      { id: "q2", text: "展覧会や美術館で色彩をどのように鑑賞するか？", type: "visual-artist" as ColorType },
      { id: "q3", text: "服を選ぶときの基準は何か？", type: "intuitive-colorist" as ColorType },
      { id: "q4", text: "写真を撮るとき最も気を配る要素は？", type: "contrast-seeker" as ColorType },
      { id: "q5", text: "自然の中で特に目を引く色は？", type: "visual-artist" as ColorType },
      { id: "q6", text: "友達が服の色の組み合わせを聞いてきた。私は？", type: "color-harmonizer" as ColorType },
      { id: "q7", text: "新しいブランドのロゴを初めて見たとき、最初に感じることは？", type: "intuitive-colorist" as ColorType },
      { id: "q8", text: "強烈な色のコントラストがある作品を見たときの私の反応は？", type: "contrast-seeker" as ColorType },
      { id: "q9", text: "気分が落ち込んだとき、私を慰めてくれる色は？", type: "intuitive-colorist" as ColorType },
      { id: "q10", text: "春の庭を背景に写真を撮る。私は何を強調するか？", type: "visual-artist" as ColorType },
      { id: "q11", text: "新しい空間（カフェ、宿など）に入ったとき、私は？", type: "color-harmonizer" as ColorType },
      { id: "q12", text: "グラフィックデザインの作業で色を使うなら？", type: "contrast-seeker" as ColorType },
    ],
    options: ["全くそう思わない", "そう思わない", "普通", "そう思う", "非常にそう思う"],
    results: {
      "visual-artist": { emoji: "🎨", title: "ビジュアルアーティスト型", desc: "あなたは色彩を芸術的な言語として使います。微妙な色合いの違いを感じ取り、色が持つ感情的な深みを探求することを楽しみます。創作活動において色彩が核心的な表現手段となります。" },
      "color-harmonizer": { emoji: "🌈", title: "カラーハーモナイザー型", desc: "あなたは色の調和とバランスを本能的に感じ取ります。空間、衣装、デザインで互いに調和する色の組み合わせを見つける能力に優れ、周囲の環境を美しくする感覚を持っています。" },
      "contrast-seeker": { emoji: "⚡", title: "コントラストシーカー型", desc: "あなたは強烈な対比と鮮明な境界からエネルギーを得ます。白黒や補色対比のような明確な色彩の組み合わせに惹かれ、視覚的インパクトを重視する明快な美意識を持っています。" },
      "intuitive-colorist": { emoji: "✨", title: "イントゥイティブカラリスト型", desc: "あなたは色彩を感情と直感で経験します。理論よりも感覚で色を選び、色が生み出す雰囲気や感情的な共鳴に敏感です。色に深い個人的な意味を見出す感性型です。" },
    },
    retake: "もう一度", resultLabel: "あなたの色彩感覚タイプ",
  },
  zh: {
    title: "色彩认知测试：你的色彩感知类型是什么？",
    description: "通过12个与色彩相关的问题，了解你的色彩感知类型。",
    questions: [
      { id: "q1", text: "在选择房间装饰时，我通常会怎么做？", type: "color-harmonizer" as ColorType },
      { id: "q2", text: "在展览或美术馆里，我主要如何欣赏色彩？", type: "visual-artist" as ColorType },
      { id: "q3", text: "选衣服时我的主要标准是什么？", type: "intuitive-colorist" as ColorType },
      { id: "q4", text: "拍照时我最在意的元素是什么？", type: "contrast-seeker" as ColorType },
      { id: "q5", text: "在大自然中，特别吸引我目光的颜色是？", type: "visual-artist" as ColorType },
      { id: "q6", text: "朋友向我请教服装配色。我会？", type: "color-harmonizer" as ColorType },
      { id: "q7", text: "第一次看到新品牌的标志时，我最先注意到的是？", type: "intuitive-colorist" as ColorType },
      { id: "q8", text: "看到色彩对比强烈的作品时，我的反应是？", type: "contrast-seeker" as ColorType },
      { id: "q9", text: "情绪低落时，能安慰我的颜色属于哪个色系？", type: "intuitive-colorist" as ColorType },
      { id: "q10", text: "在春天的花园里拍照，我会强调什么？", type: "visual-artist" as ColorType },
      { id: "q11", text: "走进一个新空间（咖啡馆、住宿等）时，我会？", type: "color-harmonizer" as ColorType },
      { id: "q12", text: "如果在平面设计中使用色彩，我会？", type: "contrast-seeker" as ColorType },
    ],
    options: ["完全不符合", "不符合", "一般", "符合", "非常符合"],
    results: {
      "visual-artist": { emoji: "🎨", title: "视觉艺术家型", desc: "你把色彩当作艺术语言来运用。你喜欢察觉细微的色差，探索色彩所蕴含的情感深度。在创作活动中，色彩是你核心的表达手段。" },
      "color-harmonizer": { emoji: "🌈", title: "色彩协调者型", desc: "你能本能地感知色彩的和谐与平衡。在空间、服饰和设计中，你擅长找到相互协调的色彩组合，具有让周围环境变得美丽的天赋。" },
      "contrast-seeker": { emoji: "⚡", title: "对比追寻者型", desc: "你从强烈的对比与鲜明的边界中获得能量。你被黑白或互补色这类分明的色彩组合所吸引，拥有重视视觉冲击力的鲜明审美观。" },
      "intuitive-colorist": { emoji: "✨", title: "直觉色彩师型", desc: "你以情感和直觉来体验色彩。比起理论，你更凭感觉选择颜色，对色彩营造的氛围与情感共鸣十分敏感。你是从色彩中寻找深层个人意义的感性型。" },
    },
    retake: "重新测试", resultLabel: "你的色彩感知类型",
  },
  fr: {
    title: "Test de reconnaissance des couleurs : quel est votre type de sensibilité chromatique ?",
    description: "Découvrez votre type de perception des couleurs à travers 12 questions liées à la couleur.",
    questions: [
      { id: "q1", text: "Quand je choisis la décoration d'une pièce, que fais-je généralement ?", type: "color-harmonizer" as ColorType },
      { id: "q2", text: "Comment est-ce que j'apprécie les couleurs dans les expositions ou les galeries ?", type: "visual-artist" as ColorType },
      { id: "q3", text: "Quel est mon critère principal pour choisir mes vêtements ?", type: "intuitive-colorist" as ColorType },
      { id: "q4", text: "À quoi est-ce que je fais le plus attention en prenant des photos ?", type: "contrast-seeker" as ColorType },
      { id: "q5", text: "Quelles couleurs de la nature attirent particulièrement mon regard ?", type: "visual-artist" as ColorType },
      { id: "q6", text: "Un(e) ami(e) me demande conseil pour associer des couleurs à une tenue. Je :", type: "color-harmonizer" as ColorType },
      { id: "q7", text: "En voyant le logo d'une nouvelle marque pour la première fois, que remarqué-je en premier ?", type: "intuitive-colorist" as ColorType },
      { id: "q8", text: "Ma réaction face à une œuvre au contraste de couleurs marqué :", type: "contrast-seeker" as ColorType },
      { id: "q9", text: "Quelle famille de couleurs me réconforte quand mon moral est bas ?", type: "intuitive-colorist" as ColorType },
      { id: "q10", text: "En photographiant un jardin printanier, qu'est-ce que je mets en valeur ?", type: "visual-artist" as ColorType },
      { id: "q11", text: "En entrant dans un nouvel espace (café, hébergement, etc.), je :", type: "color-harmonizer" as ColorType },
      { id: "q12", text: "Si j'utilisais la couleur dans un projet de design graphique :", type: "contrast-seeker" as ColorType },
    ],
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    results: {
      "visual-artist": { emoji: "🎨", title: "Artiste visuel", desc: "Vous utilisez la couleur comme un langage artistique. Vous aimez percevoir de subtiles nuances et explorer la profondeur émotionnelle des couleurs. La couleur devient le moyen d'expression central de vos créations." },
      "color-harmonizer": { emoji: "🌈", title: "Harmonisateur de couleurs", desc: "Vous sentez instinctivement l'harmonie et l'équilibre des couleurs. Vous excellez à trouver des combinaisons de couleurs cohérentes dans les espaces, les tenues et le design, avec un talent pour embellir votre environnement." },
      "contrast-seeker": { emoji: "⚡", title: "Chercheur de contrastes", desc: "Vous puisez votre énergie dans les contrastes intenses et les frontières nettes. Vous êtes attiré(e) par des combinaisons de couleurs marquantes, comme le noir et blanc ou les contrastes complémentaires, avec un sens esthétique affirmé qui valorise l'impact visuel." },
      "intuitive-colorist": { emoji: "✨", title: "Coloriste intuitif(ve)", desc: "Vous vivez la couleur à travers l'émotion et l'intuition. Vous choisissez les couleurs au ressenti plutôt qu'à la théorie, et êtes sensible à l'atmosphère et à la résonance émotionnelle qu'elles créent. Vous trouvez un sens personnel profond dans la couleur." },
    },
    retake: "Recommencer", resultLabel: "Votre type de sensibilité chromatique",
  },
  es: {
    title: "Test de percepción del color: ¿cuál es tu tipo de sensibilidad cromática?",
    description: "Descubre tu tipo de percepción del color a través de 12 preguntas relacionadas con el color.",
    questions: [
      { id: "q1", text: "Al elegir la decoración de una habitación, ¿qué suelo hacer?", type: "color-harmonizer" as ColorType },
      { id: "q2", text: "¿Cómo aprecio el color en exposiciones o galerías?", type: "visual-artist" as ColorType },
      { id: "q3", text: "¿Cuál es mi criterio principal al elegir ropa?", type: "intuitive-colorist" as ColorType },
      { id: "q4", text: "¿A qué presto más atención al tomar fotos?", type: "contrast-seeker" as ColorType },
      { id: "q5", text: "¿Qué colores de la naturaleza captan especialmente mi atención?", type: "visual-artist" as ColorType },
      { id: "q6", text: "Un(a) amigo(a) me pide consejo sobre combinaciones de color para un look. Yo:", type: "color-harmonizer" as ColorType },
      { id: "q7", text: "Al ver el logo de una marca nueva por primera vez, ¿qué noto primero?", type: "intuitive-colorist" as ColorType },
      { id: "q8", text: "Mi reacción al ver una obra con un contraste de color intenso es:", type: "contrast-seeker" as ColorType },
      { id: "q9", text: "¿Qué familia de colores me reconforta cuando mi ánimo está bajo?", type: "intuitive-colorist" as ColorType },
      { id: "q10", text: "Al fotografiar un jardín primaveral, ¿qué destaco?", type: "visual-artist" as ColorType },
      { id: "q11", text: "Al entrar en un espacio nuevo (cafetería, alojamiento, etc.), yo:", type: "color-harmonizer" as ColorType },
      { id: "q12", text: "Si usara el color en un proyecto de diseño gráfico:", type: "contrast-seeker" as ColorType },
    ],
    options: ["Nunca", "Rara vez", "A veces", "A menudo", "Siempre"],
    results: {
      "visual-artist": { emoji: "🎨", title: "Artista visual", desc: "Usas el color como un lenguaje artístico. Disfrutas detectando sutiles diferencias de color y explorando la profundidad emocional que contienen. El color se convierte en el medio de expresión clave de tu creatividad." },
      "color-harmonizer": { emoji: "🌈", title: "Armonizador del color", desc: "Percibes de forma instintiva la armonía y el equilibrio del color. Destacas encontrando combinaciones que funcionan bien en espacios, atuendos y diseño, con talento para embellecer tu entorno." },
      "contrast-seeker": { emoji: "⚡", title: "Buscador de contrastes", desc: "Obtienes energía de los contrastes intensos y los bordes nítidos. Te atraen combinaciones llamativas como el blanco y negro o los contrastes complementarios, con un sentido estético marcado que valora el impacto visual." },
      "intuitive-colorist": { emoji: "✨", title: "Colorista intuitivo", desc: "Experimentas el color a través de la emoción y la intuición. Eliges los colores por sensación más que por teoría, y eres sensible al ambiente y la resonancia emocional que crean. Encuentras un significado personal profundo en el color." },
    },
    retake: "Repetir", resultLabel: "Tu tipo de sensibilidad cromática",
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

export default function ColorRecognitionTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "color-recognition", title: "ColorRecognitionTest", finished: phase === "result" });

  const types: ColorType[] = ["visual-artist", "color-harmonizer", "contrast-seeker", "intuitive-colorist"];
  const scores = Object.fromEntries(types.map((s) => [s, 0])) as Record<ColorType, number>;
  t.questions.forEach((q) => { if (answers[q.id]) scores[q.type] += answers[q.id]; });
  const topType = (Object.entries(scores) as [ColorType, number][]).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  if (phase === "result") {
    const r = t.results[topType];
    return (
      <div className="not-prose my-10 p-8 bg-card border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-fuchsia-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="p-6 bg-fuchsia-50 rounded-2xl border border-fuchsia-100">
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
