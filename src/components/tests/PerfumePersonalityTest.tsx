'use client';
import ShareResultButton from '../shared/ShareResultButton'

import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { QuestionnaireMatrix } from "@/components/ui/questionnaire-matrix";

interface Props { locale?: string; }

type ScentType = "floral" | "woody" | "fresh" | "oriental";

const data = {
  ko: {
    title: "향수 퍼스낼리티 테스트: 나의 향수 성격은?",
    description: "12개의 질문으로 나의 향기 취향과 감각 성격을 발견하세요.",
    questions: [
      { id: "q1", text: "자연 속에서 가장 좋아하는 향은 꽃밭의 달콤한 향이다.", type: "floral" as ScentType },
      { id: "q2", text: "숲 속 나무 냄새나 흙 내음 같은 자연적이고 깊은 향에 끌린다.", type: "woody" as ScentType },
      { id: "q3", text: "상쾌하고 가벼운 시트러스나 민트 향을 선호한다.", type: "fresh" as ScentType },
      { id: "q4", text: "따뜻하고 이국적인 향신료나 바닐라 같은 깊은 향에 매력을 느낀다.", type: "oriental" as ScentType },
      { id: "q5", text: "장미나 재스민 같은 클래식한 플로럴 향의 향수를 좋아한다.", type: "floral" as ScentType },
      { id: "q6", text: "나무, 머스크, 앰버 같은 무게감 있는 베이스 향을 선호한다.", type: "woody" as ScentType },
      { id: "q7", text: "상큼하고 깨끗한 느낌의 향수가 나의 일상과 잘 어울린다.", type: "fresh" as ScentType },
      { id: "q8", text: "향수에서 관능적이고 미스터리한 느낌이 나는 것을 좋아한다.", type: "oriental" as ScentType },
      { id: "q9", text: "봄여름에는 화사하고 꽃 향기 나는 향수를 쓰고 싶다.", type: "floral" as ScentType },
      { id: "q10", text: "야외 활동이나 스포츠 후에는 시원하고 상쾌한 향이 잘 어울린다.", type: "fresh" as ScentType },
      { id: "q11", text: "가을겨울에는 따뜻하고 깊은 우드 계열의 향수가 좋다.", type: "woody" as ScentType },
      { id: "q12", text: "특별한 날에는 독특하고 기억에 남는 오리엔탈 향수를 고른다.", type: "oriental" as ScentType },
    ],
    options: ["전혀 아니다", "아니다", "보통이다", "그렇다", "매우 그렇다"],
    results: {
      floral: { emoji: "🌸", title: "플로럴 로맨티스트 (Floral Romanticist)", desc: "당신은 꽃처럼 아름답고 감성적인 향기를 가진 사람입니다. 로맨틱하고 따뜻한 성격으로 주변 사람들을 편안하게 만드는 능력이 있습니다. 장미, 피오니, 재스민 계열이 잘 어울립니다." },
      woody: { emoji: "🌲", title: "우디 어스 소울 (Woody Earth Soul)", desc: "당신은 대지처럼 안정적이고 깊은 내면의 힘을 가진 사람입니다. 진정성과 자연스러움을 중시하며 신뢰감을 줍니다. 샌달우드, 시더, 베티버 계열이 당신의 개성을 살려줍니다." },
      fresh: { emoji: "💨", title: "프레시 프리 스피릿 (Fresh Free Spirit)", desc: "당신은 청명하고 활기찬 에너지로 가득한 자유로운 영혼입니다. 깨끗하고 솔직한 성격으로 언제나 상쾌한 인상을 줍니다. 시트러스, 아쿠아틱, 그린 계열이 잘 맞습니다." },
      oriental: { emoji: "✨", title: "오리엔탈 미스틱 (Oriental Mystic)", desc: "당신은 깊고 관능적인 매력으로 사람들을 끌어당기는 신비로운 존재입니다. 독특한 미적 감각과 이국적인 취향이 당신을 특별하게 만듭니다. 바닐라, 앰버, 우드 스파이시 계열이 어울립니다." },
    },
    retake: "다시하기", resultLabel: "나의 향수 성격",
  },
  en: {
    title: "Perfume Personality Test: What's Your Fragrance Personality?",
    description: "Discover your scent preference and sensory personality through 12 questions.",
    questions: [
      { id: "q1", text: "My favorite natural scent is the sweet fragrance of a flower field.", type: "floral" as ScentType },
      { id: "q2", text: "I'm drawn to the deep, natural scent of forest wood or earth.", type: "woody" as ScentType },
      { id: "q3", text: "I prefer fresh and light citrus or mint fragrances.", type: "fresh" as ScentType },
      { id: "q4", text: "I find warm, exotic spices or vanilla-like deep scents appealing.", type: "oriental" as ScentType },
      { id: "q5", text: "I love classic floral fragrances like rose or jasmine.", type: "floral" as ScentType },
      { id: "q6", text: "I prefer weighty base notes like wood, musk, and amber.", type: "woody" as ScentType },
      { id: "q7", text: "Fresh and clean-smelling perfumes suit my daily life well.", type: "fresh" as ScentType },
      { id: "q8", text: "I like perfumes that feel sensual and mysterious.", type: "oriental" as ScentType },
      { id: "q9", text: "In spring and summer, I want to wear bright, floral fragrances.", type: "floral" as ScentType },
      { id: "q10", text: "After outdoor activities or sports, a cool and fresh scent suits me well.", type: "fresh" as ScentType },
      { id: "q11", text: "In fall and winter, I prefer warm and deep woody fragrances.", type: "woody" as ScentType },
      { id: "q12", text: "For special occasions, I choose a unique and memorable oriental perfume.", type: "oriental" as ScentType },
    ],
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    results: {
      floral: { emoji: "🌸", title: "Floral Romanticist", desc: "You have a fragrant personality as beautiful and emotional as flowers. Your romantic and warm nature puts people at ease. Rose, peony, and jasmine families suit you perfectly." },
      woody: { emoji: "🌲", title: "Woody Earth Soul", desc: "You have a stable, grounded personality with deep inner strength like the earth. You value authenticity and naturalness, radiating trustworthiness. Sandalwood, cedar, and vetiver families highlight your character." },
      fresh: { emoji: "💨", title: "Fresh Free Spirit", desc: "You are a free spirit filled with clear and vibrant energy. Your clean and honest personality always makes a refreshing impression. Citrus, aquatic, and green families suit you well." },
      oriental: { emoji: "✨", title: "Oriental Mystic", desc: "You are a mysterious presence who draws people in with deep and sensual allure. Your unique aesthetic sense and exotic tastes make you special. Vanilla, amber, and woody spicy families suit you." },
    },
    retake: "Retake", resultLabel: "Your Fragrance Personality",
  },
  ja: {
    title: "香水パーソナリティテスト：あなたの香りの個性は？",
    description: "12の質問であなたの香りの好みと感覚的な個性を発見しましょう。",
    questions: [
      { id: "q1", text: "自然の中で一番好きな香りは、花畑の甘い香りだ。", type: "floral" as ScentType },
      { id: "q2", text: "森の木の匂いや土の香りのような、自然で深みのある香りに惹かれる。", type: "woody" as ScentType },
      { id: "q3", text: "爽やかで軽いシトラスやミントの香りが好みだ。", type: "fresh" as ScentType },
      { id: "q4", text: "温かくエキゾチックなスパイスやバニラのような深い香りに魅力を感じる。", type: "oriental" as ScentType },
      { id: "q5", text: "バラやジャスミンのようなクラシックなフローラルの香水が好きだ。", type: "floral" as ScentType },
      { id: "q6", text: "ウッド、ムスク、アンバーのような重みのあるベースノートを好む。", type: "woody" as ScentType },
      { id: "q7", text: "爽やかで清潔感のある香水が日常によく合う。", type: "fresh" as ScentType },
      { id: "q8", text: "官能的でミステリアスな雰囲気の香水が好きだ。", type: "oriental" as ScentType },
      { id: "q9", text: "春夏には華やかで花のような香りの香水をつけたい。", type: "floral" as ScentType },
      { id: "q10", text: "屋外活動やスポーツの後には、涼しくて爽やかな香りがよく合う。", type: "fresh" as ScentType },
      { id: "q11", text: "秋冬には温かく深みのあるウッド系の香水が好きだ。", type: "woody" as ScentType },
      { id: "q12", text: "特別な日には、独特で記憶に残るオリエンタルの香水を選ぶ。", type: "oriental" as ScentType },
    ],
    options: ["全くそう思わない", "そう思わない", "普通", "そう思う", "非常にそう思う"],
    results: {
      floral: { emoji: "🌸", title: "フローラル・ロマンティスト (Floral Romanticist)", desc: "あなたは花のように美しく感情豊かな香りを持つ人です。ロマンティックで温かい性格で、周りの人を安心させる力があります。ローズ、ピオニー、ジャスミン系がよく似合います。" },
      woody: { emoji: "🌲", title: "ウッディ・アース・ソウル (Woody Earth Soul)", desc: "あなたは大地のように安定した、深い内なる力を持つ人です。誠実さと自然体を大切にし、信頼感を与えます。サンダルウッド、シダー、ベチバー系があなたの個性を引き立てます。" },
      fresh: { emoji: "💨", title: "フレッシュ・フリー・スピリット (Fresh Free Spirit)", desc: "あなたは澄んだ活気あるエネルギーに満ちた自由な魂の持ち主です。清潔で率直な性格で、いつも爽やかな印象を与えます。シトラス、アクアティック、グリーン系がよく合います。" },
      oriental: { emoji: "✨", title: "オリエンタル・ミスティック (Oriental Mystic)", desc: "あなたは深く官能的な魅力で人を惹きつける、神秘的な存在です。独特の美意識とエキゾチックな趣味があなたを特別な存在にします。バニラ、アンバー、ウッディスパイシー系が似合います。" },
    },
    retake: "もう一度", resultLabel: "あなたの香水パーソナリティ",
  },
  zh: {
    title: "香水人格测试：你的香氛性格是什么？",
    description: "通过12个问题，发现你的香氛喜好与感官性格。",
    questions: [
      { id: "q1", text: "在大自然中我最喜欢的香气是花田般的甜美香气。", type: "floral" as ScentType },
      { id: "q2", text: "我被森林木质气息或泥土香气般自然而深沉的气味所吸引。", type: "woody" as ScentType },
      { id: "q3", text: "我偏爱清爽轻盈的柑橘或薄荷香气。", type: "fresh" as ScentType },
      { id: "q4", text: "温暖异域的香料或香草般深沉的香气对我很有吸引力。", type: "oriental" as ScentType },
      { id: "q5", text: "我喜欢玫瑰或茉莉这类经典花香香水。", type: "floral" as ScentType },
      { id: "q6", text: "我偏爱木质、麝香、琥珀这类厚重的基调香气。", type: "woody" as ScentType },
      { id: "q7", text: "清新干净的香水很适合我的日常生活。", type: "fresh" as ScentType },
      { id: "q8", text: "我喜欢带有性感神秘气息的香水。", type: "oriental" as ScentType },
      { id: "q9", text: "春夏时节我想使用明亮的花香香水。", type: "floral" as ScentType },
      { id: "q10", text: "户外活动或运动之后，清凉清爽的香气很适合我。", type: "fresh" as ScentType },
      { id: "q11", text: "秋冬时节我偏爱温暖深沉的木质香水。", type: "woody" as ScentType },
      { id: "q12", text: "特别的日子里，我会选择独特而令人难忘的东方调香水。", type: "oriental" as ScentType },
    ],
    options: ["完全不符合", "不符合", "一般", "符合", "非常符合"],
    results: {
      floral: { emoji: "🌸", title: "花香浪漫主义者 (Floral Romanticist)", desc: "你拥有像花朵一样美丽而富有情感的香氛气质。你浪漫温暖的性格总能让身边的人感到安心。玫瑰、牡丹、茉莉系列非常适合你。" },
      woody: { emoji: "🌲", title: "木质大地灵魂 (Woody Earth Soul)", desc: "你拥有如大地般稳定、深厚的内在力量。你重视真诚与自然，散发出可靠的气质。檀香、雪松、岩兰草系列能凸显你的个性。" },
      fresh: { emoji: "💨", title: "清新自由灵魂 (Fresh Free Spirit)", desc: "你是一个充满清澈活力能量的自由灵魂。你干净坦率的性格总能给人清爽的印象。柑橘、水生、绿意系列很适合你。" },
      oriental: { emoji: "✨", title: "东方神秘主义者 (Oriental Mystic)", desc: "你以深邃性感的魅力吸引着人们，是一个神秘的存在。独特的审美与异域情调让你与众不同。香草、琥珀、木质辛香系列很适合你。" },
    },
    retake: "重新测试", resultLabel: "你的香氛性格",
  },
  fr: {
    title: "Test de personnalité olfactive : quel est votre parfum de personnalité ?",
    description: "Découvrez votre préférence olfactive et votre personnalité sensorielle à travers 12 questions.",
    questions: [
      { id: "q1", text: "Mon parfum naturel préféré est la douce fragrance d'un champ de fleurs.", type: "floral" as ScentType },
      { id: "q2", text: "Je suis attiré(e) par les odeurs profondes et naturelles du bois de forêt ou de la terre.", type: "woody" as ScentType },
      { id: "q3", text: "Je préfère les fragrances fraîches et légères, comme les agrumes ou la menthe.", type: "fresh" as ScentType },
      { id: "q4", text: "Je trouve les épices exotiques et chaudes ou les senteurs profondes comme la vanille très attirantes.", type: "oriental" as ScentType },
      { id: "q5", text: "J'adore les parfums floraux classiques comme la rose ou le jasmin.", type: "floral" as ScentType },
      { id: "q6", text: "Je préfère les notes de fond marquées comme le bois, le musc et l'ambre.", type: "woody" as ScentType },
      { id: "q7", text: "Les parfums frais et propres correspondent bien à mon quotidien.", type: "fresh" as ScentType },
      { id: "q8", text: "J'aime les parfums qui dégagent une impression sensuelle et mystérieuse.", type: "oriental" as ScentType },
      { id: "q9", text: "Au printemps et en été, j'aime porter des parfums floraux et lumineux.", type: "floral" as ScentType },
      { id: "q10", text: "Après une activité en plein air ou du sport, un parfum frais et vivifiant me convient bien.", type: "fresh" as ScentType },
      { id: "q11", text: "En automne et en hiver, je préfère des parfums boisés, chauds et profonds.", type: "woody" as ScentType },
      { id: "q12", text: "Pour les occasions spéciales, je choisis un parfum oriental unique et mémorable.", type: "oriental" as ScentType },
    ],
    options: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
    results: {
      floral: { emoji: "🌸", title: "Romantique floral(e) (Floral Romanticist)", desc: "Votre personnalité olfactive est aussi belle et sensible qu'une fleur. Votre nature romantique et chaleureuse met les gens à l'aise. Les familles rose, pivoine et jasmin vous vont à merveille." },
      woody: { emoji: "🌲", title: "Âme boisée et terrienne (Woody Earth Soul)", desc: "Vous avez une personnalité stable et ancrée, avec une force intérieure profonde comme la terre. Vous valorisez l'authenticité et le naturel, ce qui inspire confiance. Le santal, le cèdre et le vétiver mettent votre caractère en valeur." },
      fresh: { emoji: "💨", title: "Esprit libre et frais (Fresh Free Spirit)", desc: "Vous êtes un esprit libre débordant d'une énergie claire et vibrante. Votre nature propre et honnête donne toujours une impression rafraîchissante. Les familles agrumes, aquatiques et vertes vous conviennent bien." },
      oriental: { emoji: "✨", title: "Mystique oriental(e) (Oriental Mystic)", desc: "Vous êtes une présence mystérieuse qui attire les gens par un charme profond et sensuel. Votre sens esthétique unique et vos goûts exotiques vous rendent spécial(e). Les familles vanille, ambre et boisée-épicée vous vont bien." },
    },
    retake: "Recommencer", resultLabel: "Votre personnalité olfactive",
  },
  es: {
    title: "Test de personalidad del perfume: ¿cuál es tu personalidad olfativa?",
    description: "Descubre tu preferencia de aroma y tu personalidad sensorial a través de 12 preguntas.",
    questions: [
      { id: "q1", text: "Mi aroma natural favorito es la dulce fragancia de un campo de flores.", type: "floral" as ScentType },
      { id: "q2", text: "Me atrae el aroma profundo y natural de la madera del bosque o la tierra.", type: "woody" as ScentType },
      { id: "q3", text: "Prefiero las fragancias frescas y ligeras, como los cítricos o la menta.", type: "fresh" as ScentType },
      { id: "q4", text: "Me atraen las especias exóticas y cálidas o los aromas profundos como la vainilla.", type: "oriental" as ScentType },
      { id: "q5", text: "Me encantan los perfumes florales clásicos como la rosa o el jazmín.", type: "floral" as ScentType },
      { id: "q6", text: "Prefiero las notas de fondo intensas como la madera, el almizcle y el ámbar.", type: "woody" as ScentType },
      { id: "q7", text: "Los perfumes frescos y limpios encajan bien con mi vida diaria.", type: "fresh" as ScentType },
      { id: "q8", text: "Me gustan los perfumes con un aire sensual y misterioso.", type: "oriental" as ScentType },
      { id: "q9", text: "En primavera y verano, quiero usar perfumes florales y luminosos.", type: "floral" as ScentType },
      { id: "q10", text: "Después de actividades al aire libre o deporte, me sienta bien un aroma fresco y vigorizante.", type: "fresh" as ScentType },
      { id: "q11", text: "En otoño e invierno, prefiero perfumes amaderados, cálidos y profundos.", type: "woody" as ScentType },
      { id: "q12", text: "Para ocasiones especiales, elijo un perfume oriental único y memorable.", type: "oriental" as ScentType },
    ],
    options: ["Nunca", "Rara vez", "A veces", "A menudo", "Siempre"],
    results: {
      floral: { emoji: "🌸", title: "Romántico floral (Floral Romanticist)", desc: "Tienes una personalidad olfativa tan bella y emotiva como una flor. Tu naturaleza romántica y cálida hace que los demás se sientan cómodos. Las familias de rosa, peonía y jazmín te sientan a la perfección." },
      woody: { emoji: "🌲", title: "Alma de madera y tierra (Woody Earth Soul)", desc: "Tienes una personalidad estable y arraigada, con una fuerza interior profunda como la tierra. Valoras la autenticidad y la naturalidad, transmitiendo confianza. El sándalo, el cedro y el vetiver realzan tu carácter." },
      fresh: { emoji: "💨", title: "Espíritu libre y fresco (Fresh Free Spirit)", desc: "Eres un espíritu libre lleno de energía clara y vibrante. Tu naturaleza limpia y honesta siempre deja una impresión refrescante. Las familias cítrica, acuática y verde te sientan bien." },
      oriental: { emoji: "✨", title: "Místico oriental (Oriental Mystic)", desc: "Eres una presencia misteriosa que atrae a la gente con un encanto profundo y sensual. Tu sentido estético único y tus gustos exóticos te hacen especial. Las familias de vainilla, ámbar y madera especiada te sientan bien." },
    },
    retake: "Repetir", resultLabel: "Tu personalidad olfativa",
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

export default function PerfumePersonalityTest({ locale: localeProp }: Props) {

  const lang = (SUPPORTED_LOCALES.includes(localeProp as SupportedLocale) ? localeProp : "en") as SupportedLocale;
  const t = data[lang];
  const ui = UI_LABELS[lang];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  useRecordFinishedTest({ testId: "perfume-personality", title: "PerfumePersonalityTest", finished: phase === "result" });

  const types: ScentType[] = ["floral", "woody", "fresh", "oriental"];
  const scores = Object.fromEntries(types.map((s) => [s, 0])) as Record<ScentType, number>;
  t.questions.forEach((q) => { if (answers[q.id]) scores[q.type] += answers[q.id]; });
  const topType = (Object.entries(scores) as [ScentType, number][]).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

  if (phase === "result") {
    const r = t.results[topType];
    return (
      <div className="not-prose my-10 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl max-w-2xl mx-auto text-center space-y-6">
        <p className="text-xs font-bold text-pink-500 uppercase tracking-widest">{t.resultLabel}</p>
        <div className="text-6xl">{r.emoji}</div>
        <h3 className="text-3xl font-black text-slate-900">{r.title}</h3>
        <div className="p-6 bg-pink-50 rounded-2xl border border-pink-100">
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
