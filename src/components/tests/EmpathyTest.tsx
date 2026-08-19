import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from "@/components/ui/questionnaire";
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import RelatedReading from '../shared/RelatedReading';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { gaEvent } from '@/lib/analytics/ga-event';
import {
  buildEmpathyProfile,
  EMPATHY_MAX_DIMENSION_SCORE,
  scoreEmpathyAnswers,
  type EmpathyDimension,
} from '@/lib/empathy-profile';

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type EmpathyType = EmpathyDimension;
type EmpathyResult = EmpathyType | "balanced";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  type: EmpathyType;
}

const questions: Question[] = [
  // Cognitive empathy — understanding perspective
  { ko: "나는 상대방의 입장에서 상황을 이해하려고 의식적으로 노력한다.", en: "I consciously try to understand situations from the other person's perspective.", ja: "相手の立場から状況を理解しようと意識的に努力する。", zh: "我会有意识地努力从对方的角度理解情况。", fr: "Je fais consciemment l'effort de comprendre la situation du point de vue de l'autre personne.", es: "Intento conscientemente entender las situaciones desde la perspectiva de la otra persona.", type: "cognitive" },
  { ko: "나는 대화할 때 상대가 무슨 말을 하려는지 파악하는 데 능숙하다.", en: "I'm good at figuring out what someone is trying to say in conversation.", ja: "会話の中で、相手が何を言おうとしているかを把握するのが得意だ。", zh: "在对话中，我善于把握对方真正想表达什么。", fr: "Je suis doué pour saisir ce que quelqu'un cherche à dire dans une conversation.", es: "Se me da bien captar lo que alguien intenta decir en una conversación.", type: "cognitive" },
  { ko: "나는 의견이 다른 사람도 그 사람의 논리로 이해하려고 노력한다.", en: "Even with someone who disagrees, I try to understand them through their own logic.", ja: "意見が違う人でも、その人の論理で理解しようと努力する。", zh: "即使对方意见不同，我也会尝试按对方的逻辑去理解。", fr: "Même avec quelqu'un qui n'est pas d'accord, j'essaie de comprendre son raisonnement de l'intérieur.", es: "Incluso con alguien que no está de acuerdo, intento entenderlo desde su propia lógica.", type: "cognitive" },
  { ko: "나는 복잡한 감정 상황에서도 상대의 감정 이유를 분석할 수 있다.", en: "Even in complex emotional situations, I can analyze why the other person feels that way.", ja: "複雑な感情状況でも、相手の感情の理由を分析できる。", zh: "即使在复杂的情绪情境中，我也能分析对方为什么会那样感受。", fr: "Même dans des situations émotionnelles complexes, je peux analyser pourquoi l'autre personne ressent cela.", es: "Incluso en situaciones emocionales complejas, puedo analizar por qué la otra persona se siente así.", type: "cognitive" },
  // Affective empathy — feeling with
  { ko: "나는 다른 사람이 슬퍼하면 나도 감정이 흔들린다.", en: "When others are sad, my own emotions are affected too.", ja: "他の人が悲しむと、自分も感情が揺れる。", zh: "当别人难过时，我自己的情绪也会受到影响。", fr: "Quand les autres sont tristes, mes propres émotions sont aussi touchées.", es: "Cuando otras personas están tristes, mis propias emociones también se ven afectadas.", type: "affective" },
  { ko: "타인의 감동적인 이야기나 영상을 보면 쉽게 눈물이 나온다.", en: "I easily tear up watching touching stories or videos about others.", ja: "他者の感動的な話や映像を見ると、すぐに涙が出る。", zh: "看到关于他人的感人故事或视频时，我很容易流泪。", fr: "Je suis facilement ému aux larmes devant des histoires ou des vidéos touchantes sur les autres.", es: "Se me saltan las lágrimas fácilmente al ver historias o videos conmovedores sobre otras personas.", type: "affective" },
  { ko: "주변 사람이 불안하거나 초조하면 나도 덩달아 긴장된다.", en: "When people around me are anxious or nervous, I feel tense too.", ja: "周りの人が不安や焦りを感じていると、自分も緊張する。", zh: "当身边的人焦虑或紧张时，我也会跟着紧绷起来。", fr: "Quand les personnes autour de moi sont anxieuses ou nerveuses, je me tends moi aussi.", es: "Cuando las personas a mi alrededor están ansiosas o nerviosas, yo también me tenso.", type: "affective" },
  { ko: "나는 감정 표현이 풍부하고 상대의 기분에 쉽게 공명한다.", en: "I'm emotionally expressive and easily resonate with others' moods.", ja: "感情表現が豊かで、相手の気分に簡単に共鳴する。", zh: "我的情感表达比较丰富，也很容易与他人的情绪产生共鸣。", fr: "J'exprime facilement mes émotions et j'entre vite en résonance avec l'humeur des autres.", es: "Expreso mucho mis emociones y conecto fácilmente con el estado de ánimo de los demás.", type: "affective" },
  // Compassionate empathy — action-oriented care
  { ko: "나는 힘든 사람을 보면 어떻게든 도움이 되고 싶어 행동으로 옮긴다.", en: "When I see someone struggling, I act to help them in some way.", ja: "辛そうな人を見ると、何とか役に立とうと行動に移す。", zh: "看到有人处境艰难时，我会行动起来，想办法帮上忙。", fr: "Quand je vois quelqu'un en difficulté, je passe à l'action pour l'aider d'une manière ou d'une autre.", es: "Cuando veo a alguien pasándolo mal, actúo para ayudarle de alguna manera.", type: "compassionate" },
  { ko: "상대의 감정을 공감한 후 실질적인 도움을 주려고 노력한다.", en: "After empathizing with someone's feelings, I strive to offer practical help.", ja: "相手の感情に共感した後、実質的な助けを提供しようと努力する。", zh: "在共情对方的感受之后，我会努力提供实际帮助。", fr: "Après avoir accueilli les émotions de quelqu'un, je cherche à lui offrir une aide concrète.", es: "Después de empatizar con los sentimientos de alguien, intento ofrecer ayuda práctica.", type: "compassionate" },
  { ko: "나는 힘든 친구에게 먼저 연락해서 안부를 묻는 편이다.", en: "I tend to reach out first to friends who are having a hard time.", ja: "辛い友人に先に連絡して様子を聞く方だ。", zh: "对于正在经历困难的朋友，我通常会先联系他们，问问近况。", fr: "J'ai tendance à prendre des nouvelles en premier des amis qui traversent une période difficile.", es: "Suelo contactar primero con amigos que lo están pasando mal para preguntar cómo están.", type: "compassionate" },
  { ko: "고통받는 사람을 위해 내가 희생하거나 불편을 감수하는 것을 두려워하지 않는다.", en: "I don't fear sacrifice or inconvenience for the sake of someone in pain.", ja: "苦しんでいる人のために自分が犠牲になったり不便を我慢することを恐れない。", zh: "为了正在痛苦中的人，我不害怕付出牺牲或承受不便。", fr: "Je n'ai pas peur de faire des sacrifices ou d'accepter des contraintes pour quelqu'un qui souffre.", es: "No temo sacrificarme o asumir incomodidades por alguien que está sufriendo.", type: "compassionate" },
];

const scaleLabels: Record<SupportedLocale, string[]> = {
  ko: ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"],
  en: ["Not at all", "Rarely", "Neutral", "Often", "Very much so"],
  ja: ["全くない", "ほとんどない", "普通", "よくある", "とてもそうだ"],
  zh: ["完全不是", "不太是", "一般", "比较符合", "非常符合"],
  fr: ["Pas du tout", "Rarement", "Neutre", "Souvent", "Tout à fait"],
  es: ["Para nada", "Rara vez", "Neutral", "A menudo", "Totalmente"],
};

interface TypeInfo {
  name: Record<SupportedLocale, string>;
  color: string;
  description: Record<SupportedLocale, string>;
  strengths: Record<SupportedLocale, string[]>;
  risks: Record<SupportedLocale, string[]>;
  growth: Record<SupportedLocale, string>;
}

const typeInfo: Record<EmpathyType, TypeInfo> = {
  cognitive: {
    name: { ko: "인지적 공감", en: "Cognitive Empathy", ja: "認知的共感", zh: "认知共情", fr: "Empathie cognitive", es: "Empatía cognitiva" },
    color: "#3b82f6",
    description: {
      ko: "인지적 공감이 강한 당신은 타인의 입장과 생각을 이성적으로 이해하는 능력이 뛰어납니다. 감정에 휩쓸리지 않고 상황을 객관적으로 파악하며, 복잡한 인간관계에서 중재자 역할을 잘 합니다.",
      en: "With strong cognitive empathy, you excel at rationally understanding others' perspectives and thoughts. You objectively grasp situations without being swept up in emotions and are great at mediating complex relationships.",
      ja: "認知的共感が強いあなたは、他者の立場や考えを理性的に理解する能力が優れています。感情に流されず状況を客観的に把握し、複雑な人間関係で仲裁者の役割を果たすのが得意です。",
      zh: "认知共情较强的你，擅长理性地理解他人的立场和想法。你不容易被情绪卷走，能客观把握情况，也很适合在复杂的人际关系中担任调解者。",
      fr: "Avec une forte empathie cognitive, vous comprenez très bien les points de vue et les pensées des autres de façon rationnelle. Vous saisissez les situations avec objectivité sans vous laisser emporter par l'émotion, et vous jouez facilement un rôle de médiateur dans les relations complexes.",
      es: "Con una empatía cognitiva fuerte, destacas al comprender racionalmente las perspectivas y pensamientos de los demás. Captas las situaciones con objetividad sin dejarte arrastrar por las emociones, y se te da bien mediar en relaciones complejas.",
    },
    strengths: {
      ko: ["갈등 상황에서 중립적 시각 유지", "복잡한 관계를 객관적으로 분석", "감정에 치우치지 않는 의사결정"],
      en: ["Maintaining neutral perspective in conflicts", "Objectively analyzing complex relationships", "Making decisions without emotional bias"],
      ja: ["葛藤状況での中立的な視点の維持", "複雑な関係の客観的な分析", "感情に偏らない意思決定"],
      zh: ["在冲突中保持中立视角", "客观分析复杂关系", "做出不被情绪偏见左右的决策"],
      fr: ["Maintien d'un point de vue neutre dans les conflits", "Analyse objective des relations complexes", "Décisions moins influencées par les biais émotionnels"],
      es: ["Mantener una perspectiva neutral en los conflictos", "Analizar objetivamente relaciones complejas", "Tomar decisiones sin sesgo emocional"],
    },
    risks: {
      ko: ["감정적 공감이 부족해 차갑게 보일 수 있음", "타인의 고통에 지나치게 무감각해질 수 있음"],
      en: ["May appear cold due to lack of emotional empathy", "Can become overly desensitized to others' pain"],
      ja: ["感情的共感が不足して冷たく見えることがある", "他者の苦痛に過度に無感覚になることがある"],
      zh: ["可能因情感共情不足而显得冷淡", "可能对他人的痛苦变得过于迟钝"],
      fr: ["Peut paraître froid par manque d'empathie émotionnelle", "Peut devenir trop insensible à la souffrance des autres"],
      es: ["Puede parecer frío por falta de empatía emocional", "Puede volverse demasiado insensible al dolor ajeno"],
    },
    growth: {
      ko: "이해를 넘어 감정적 연결을 시도해보세요. 분석보다 먼저 '나도 그렇게 느낄 수 있겠구나'라고 말해보는 것이 관계를 더 깊게 만들어 줍니다.",
      en: "Try moving beyond understanding to emotional connection. Saying 'I can imagine feeling that way too' before analyzing helps deepen relationships.",
      ja: "理解を超えて感情的なつながりを試みてください。分析より先に「私もそう感じるかもしれない」と言うことが、関係をより深めてくれます。",
      zh: "试着从理解再往前一步，建立情感连接。在分析之前先说“我也能想象自己会那样感受”，会让关系变得更深。",
      fr: "Essayez d'aller au-delà de la compréhension pour créer un lien émotionnel. Dire « je peux imaginer ressentir cela moi aussi » avant d'analyser aide à approfondir les relations.",
      es: "Intenta ir más allá de la comprensión y crear conexión emocional. Decir \"puedo imaginar que yo también me sentiría así\" antes de analizar ayuda a profundizar las relaciones.",
    },
  },
  affective: {
    name: { ko: "정서적 공감", en: "Affective Empathy", ja: "情動的共感", zh: "情感共情", fr: "Empathie affective", es: "Empatía afectiva" },
    color: "#ec4899",
    description: {
      ko: "정서적 공감이 강한 당신은 타인의 감정을 자신의 것처럼 느끼는 능력이 뛰어납니다. 주변 사람들의 감정에 깊이 공명하며, 존재만으로도 상대에게 위로가 됩니다. 다만 감정 소진에 주의가 필요합니다.",
      en: "With strong affective empathy, you feel others' emotions as if they were your own. You deeply resonate with those around you and your presence alone is comforting. Watch out for emotional exhaustion, however.",
      ja: "情動的共感が強いあなたは、他者の感情を自分のものように感じる能力が優れています。周りの人の感情に深く共鳴し、存在するだけで相手への慰めになります。ただし、感情消耗に注意が必要です。",
      zh: "情感共情较强的你，擅长像感受自己的情绪一样感受他人的情绪。你会与身边人的情感深深共鸣，光是你的存在就能带来安慰。不过，也需要留意情绪耗竭。",
      fr: "Avec une forte empathie affective, vous ressentez les émotions des autres presque comme les vôtres. Vous résonnez profondément avec les personnes autour de vous, et votre simple présence peut réconforter. Attention toutefois à l'épuisement émotionnel.",
      es: "Con una empatía afectiva fuerte, sientes las emociones de los demás como si fueran propias. Resuenas profundamente con quienes te rodean y tu sola presencia puede reconfortar. Aun así, conviene cuidar el agotamiento emocional.",
    },
    strengths: {
      ko: ["타인의 감정에 즉각적으로 반응", "존재만으로도 위로가 되는 따뜻함", "깊은 정서적 유대감 형성"],
      en: ["Immediate response to others' emotions", "Warmth that comforts through mere presence", "Forming deep emotional bonds"],
      ja: ["他者の感情への即座の反応", "存在だけで慰めになる温かさ", "深い情動的絆の形成"],
      zh: ["能即时回应他人的情绪", "仅凭存在就能带来安慰的温暖", "建立深层情感联结"],
      fr: ["Réponse immédiate aux émotions des autres", "Chaleur qui réconforte par la simple présence", "Création de liens émotionnels profonds"],
      es: ["Respuesta inmediata a las emociones de los demás", "Calidez que reconforta con la sola presencia", "Formación de vínculos emocionales profundos"],
    },
    risks: {
      ko: ["타인의 부정적 감정에 쉽게 전염될 수 있음", "감정 소진과 번아웃 위험", "자신의 감정과 타인의 감정 구분이 어려울 수 있음"],
      en: ["Easily affected by others' negative emotions", "Risk of emotional exhaustion and burnout", "May struggle to distinguish own feelings from others'"],
      ja: ["他者のネガティブな感情に簡単に感染することがある", "感情消耗とバーンアウトのリスク", "自分の感情と他者の感情の区別が難しいことがある"],
      zh: ["容易受到他人负面情绪影响", "有情绪耗竭和倦怠风险", "可能难以区分自己的情绪和他人的情绪"],
      fr: ["Facilement affecté par les émotions négatives des autres", "Risque d'épuisement émotionnel et de burnout", "Difficulté possible à distinguer ses propres émotions de celles des autres"],
      es: ["Se ve afectado fácilmente por las emociones negativas de otros", "Riesgo de agotamiento emocional y burnout", "Puede costarle distinguir sus propios sentimientos de los ajenos"],
    },
    growth: {
      ko: "감정적 공감은 소중한 선물이지만 나를 지키는 것도 중요합니다. '공감'과 '감정 흡수'를 구분하고, 정기적으로 혼자만의 회복 시간을 가져보세요.",
      en: "Affective empathy is a precious gift, but protecting yourself matters too. Learn to distinguish 'empathy' from 'emotional absorption,' and take regular time alone to recover.",
      ja: "情動的共感は貴重な贈り物ですが、自分を守ることも重要です。「共感」と「感情吸収」を区別し、定期的に一人で回復する時間を持ちましょう。",
      zh: "情感共情是一份珍贵的礼物，但保护自己同样重要。学会区分“共情”和“情绪吸收”，并定期留出独处恢复的时间。",
      fr: "L'empathie affective est un don précieux, mais vous protéger compte aussi. Apprenez à distinguer « empathie » et « absorption émotionnelle », et prenez régulièrement du temps seul pour récupérer.",
      es: "La empatía afectiva es un don valioso, pero protegerte también importa. Aprende a distinguir la \"empatía\" de la \"absorción emocional\" y reserva tiempo a solas para recuperarte.",
    },
  },
  compassionate: {
    name: { ko: "자비적 공감", en: "Compassionate Empathy", ja: "思いやり的共感", zh: "慈悲共情", fr: "Empathie compassionnelle", es: "Empatía compasiva" },
    color: "#10b981",
    description: {
      ko: "자비적 공감이 강한 당신은 이해와 감정을 넘어 실제 행동으로 타인을 돕는 능력이 뛰어납니다. 공감을 행동으로 전환하는 능력이 있어, 힘든 사람에게 실질적인 변화를 만들어 줄 수 있습니다.",
      en: "With strong compassionate empathy, you excel at helping others through action, beyond just understanding or feeling. Your ability to translate empathy into action creates real change for people in need.",
      ja: "思いやり的共感が強いあなたは、理解や感情を超えて実際の行動で他者を助ける能力が優れています。共感を行動に転換する能力があり、困っている人に実質的な変化をもたらすことができます。",
      zh: "慈悲共情较强的你，不只停留在理解或感受，而是擅长通过实际行动帮助他人。你能把共情转化为行动，为有困难的人带来真实改变。",
      fr: "Avec une forte empathie compassionnelle, vous excellez à aider les autres par l'action, au-delà de la simple compréhension ou du ressenti. Votre capacité à transformer l'empathie en action peut créer un vrai changement pour les personnes en difficulté.",
      es: "Con una empatía compasiva fuerte, destacas al ayudar a otros mediante la acción, más allá de comprender o sentir. Tu capacidad para convertir la empatía en acción puede generar cambios reales para quienes lo necesitan.",
    },
    strengths: {
      ko: ["공감을 행동으로 전환하는 능력", "타인의 실질적 변화에 기여", "신뢰와 존경을 받는 관계 형성"],
      en: ["Ability to translate empathy into action", "Contributing to real change for others", "Building relationships built on trust and respect"],
      ja: ["共感を行動に転換する能力", "他者の実質的な変化への貢献", "信頼と尊敬に基づく関係の形成"],
      zh: ["把共情转化为行动的能力", "为他人的实际改变做出贡献", "建立基于信任与尊重的关系"],
      fr: ["Capacité à transformer l'empathie en action", "Contribution à un changement concret pour les autres", "Relations construites sur la confiance et le respect"],
      es: ["Capacidad para convertir la empatía en acción", "Contribuir a cambios reales en los demás", "Construir relaciones basadas en confianza y respeto"],
    },
    risks: {
      ko: ["과도한 돌봄으로 번아웃 위험", "자신의 필요를 뒤로 미루는 경향", "도움에 대한 기대나 의존 관계 형성 가능"],
      en: ["Risk of burnout from excessive caregiving", "Tendency to postpone own needs", "May create expectations or dependency in relationships"],
      ja: ["過度な世話によるバーンアウトのリスク", "自分のニーズを後回しにする傾向", "助けに対する期待や依存関係が生まれることがある"],
      zh: ["因过度照顾他人而产生倦怠风险", "倾向于把自己的需要往后放", "可能在关系中形成对帮助的期待或依赖"],
      fr: ["Risque de burnout lié à un soin excessif des autres", "Tendance à remettre ses propres besoins à plus tard", "Peut créer des attentes ou une dépendance dans les relations"],
      es: ["Riesgo de burnout por cuidar en exceso", "Tendencia a posponer las propias necesidades", "Puede crear expectativas o dependencia en las relaciones"],
    },
    growth: {
      ko: "당신의 행동하는 공감은 세상을 바꿉니다. 다만 자신을 먼저 채워야 더 많이 줄 수 있습니다. 도움의 경계를 설정하는 것이 이기적인 것이 아님을 기억하세요.",
      en: "Your compassion in action changes the world. But you need to fill yourself first to give more. Remember that setting boundaries for helping is not selfish.",
      ja: "行動する共感は世界を変えます。しかし、自分を満たしてこそより多く与えられます。助けの境界線を設定することは自己中心的ではないことを覚えてください。",
      zh: "你付诸行动的共情能改变世界。不过，先照顾好自己，才能给予更多。请记住，为帮助设定边界并不是自私。",
      fr: "Votre compassion en action change le monde. Mais vous devez d'abord vous ressourcer pour pouvoir donner davantage. Rappelez-vous que poser des limites à l'aide que vous offrez n'est pas égoïste.",
      es: "Tu compasión en acción cambia el mundo. Pero necesitas cuidarte primero para poder dar más. Recuerda que poner límites a la ayuda no es egoísta.",
    },
  },
};

const ui: Record<SupportedLocale, {
  title: string;
  subtitle: string;
  scale: string;
  progress: string;
  resultTitle: string;
  yourType: string;
  allTypes: string;
  growth: string;
  restart: string;
  share: string;
  copied: string;
  note: string;
}> = {
  ko: {
    title: "공감 능력 유형 테스트",
    subtitle: "나의 공감 방식 — 인지형, 정서형, 자비형",
    scale: "이 문장에 얼마나 동의하시나요?",
    progress: "질문",
    resultTitle: "나의 공감 유형",
    yourType: "주요 공감 유형",
    allTypes: "유형별 점수",
    growth: "성장 포인트",
    restart: "다시 테스트하기",
    share: "결과 공유",
    copied: "링크가 복사되었습니다!",
    note: "이 테스트는 세 가지 공감 유형(인지적·정서적·자비적 공감)에 기반하며, 자기 이해를 위한 참고 자료입니다.",
  },
  en: {
    title: "Empathy Type Test",
    subtitle: "My empathy style — Cognitive, Affective, or Compassionate",
    scale: "How much do you agree with this statement?",
    progress: "Question",
    resultTitle: "My Empathy Type",
    yourType: "Primary Empathy Type",
    allTypes: "Scores by Type",
    growth: "Growth Point",
    restart: "Retake Test",
    share: "Share Result",
    copied: "Link copied!",
    note: "This test is based on three empathy types (cognitive, affective, and compassionate empathy) and is intended as a self-understanding reference.",
  },
  ja: {
    title: "共感能力タイプテスト",
    subtitle: "私の共感スタイル — 認知型、情動型、思いやり型",
    scale: "この文章にどれくらい同意しますか？",
    progress: "質問",
    resultTitle: "私の共感タイプ",
    yourType: "主要共感タイプ",
    allTypes: "タイプ別スコア",
    growth: "成長ポイント",
    restart: "もう一度テストする",
    share: "結果を共有",
    copied: "リンクをコピーしました！",
    note: "このテストは3つの共感タイプ（認知的・情動的・思いやり的共感）に基づいており、自己理解のための参考資料です。",
  },
  zh: {
    title: "共情能力类型测试",
    subtitle: "我的共情风格 — 认知型、情感型或慈悲型",
    scale: "你在多大程度上同意这句话？",
    progress: "问题",
    resultTitle: "我的共情类型",
    yourType: "主要共情类型",
    allTypes: "各类型得分",
    growth: "成长重点",
    restart: "重新测试",
    share: "分享结果",
    copied: "链接已复制！",
    note: "本测试基于三种共情类型（认知共情、情感共情和慈悲共情），仅作为自我理解的参考资料。",
  },
  fr: {
    title: "Test du type d'empathie",
    subtitle: "Mon style d'empathie — cognitive, affective ou compassionnelle",
    scale: "Dans quelle mesure êtes-vous d'accord avec cette phrase ?",
    progress: "Question",
    resultTitle: "Mon type d'empathie",
    yourType: "Type d'empathie principal",
    allTypes: "Scores par type",
    growth: "Point de progression",
    restart: "Refaire le test",
    share: "Partager le résultat",
    copied: "Lien copié !",
    note: "Ce test s'appuie sur trois types d'empathie (cognitive, affective et compassionnelle) et sert de repère pour mieux se comprendre.",
  },
  es: {
    title: "Test de tipo de empatía",
    subtitle: "Mi estilo de empatía — cognitiva, afectiva o compasiva",
    scale: "¿Qué tanto estás de acuerdo con esta afirmación?",
    progress: "Pregunta",
    resultTitle: "Mi tipo de empatía",
    yourType: "Tipo principal de empatía",
    allTypes: "Puntuaciones por tipo",
    growth: "Punto de crecimiento",
    restart: "Repetir test",
    share: "Compartir resultado",
    copied: "¡Enlace copiado!",
    note: "Este test se basa en tres tipos de empatía (cognitiva, afectiva y compasiva) y está pensado como referencia para el autoconocimiento.",
  },
};

const resultUi: Record<SupportedLocale, {
  strengths: string;
  watchOut: string;
  score: string;
  outOf: string;
  mixedTitle: string;
  mixedBody: string;
  sharedTitle: string;
  sharedBody: string;
  back: string;
  progressLabel: string;
  clearProfileNote: string;
}> = {
  ko: {
    strengths: "강점", watchOut: "주의할 점", score: "점수", outOf: "16점 만점",
    mixedTitle: "여러 공감 방식이 함께 두드러집니다",
    mixedBody: "상위 경향들의 점수 차이가 {gap}점 이내입니다. 하나의 고정 유형보다 강조된 경향을 함께 읽어보세요. 이는 통계적 신뢰구간이 아니라 과도한 단정을 피하기 위한 해석 기준입니다.",
    sharedTitle: "공유된 유형 요약",
    sharedBody: "이 링크에는 원답변이나 세부 점수가 포함되지 않습니다. 아래 내용은 공유된 균형·혼합 프로필의 일반 요약이며, 정확한 점수표를 보려면 이 기기에서 테스트를 완료하세요.",
    back: "이전 질문", progressLabel: "공감 테스트 진행률", clearProfileNote: "현재 답변에서는 이 경향이 상대적으로 더 두드러졌습니다. 상황에 따라 달라질 수 있는 자기보고 요약입니다.",
  },
  en: {
    strengths: "Strengths", watchOut: "Watch out", score: "Score", outOf: "out of 16",
    mixedTitle: "Multiple empathy styles stand out together",
    mixedBody: "The leading scores are within {gap} points. Read the highlighted tendencies together rather than treating one as a fixed type. This is an interpretation guardrail, not a statistical confidence interval.",
    sharedTitle: "Shared type summary",
    sharedBody: "This link contains no item responses or detailed scores. The text below is a general summary of a shared balanced or mixed profile. Complete the test on this device to see a score profile.",
    back: "Previous question", progressLabel: "Empathy test progress", clearProfileNote: "In your current answers, this tendency stood out relative to the others. It is a context-sensitive self-report summary.",
  },
  ja: {
    strengths: "強み", watchOut: "注意点", score: "スコア", outOf: "16点満点",
    mixedTitle: "複数の共感スタイルがともに目立ちます",
    mixedBody: "上位傾向の差は{gap}点以内です。一つの固定タイプではなく、強調された傾向を合わせて読んでください。これは統計的信頼区間ではなく、断定を避けるための解釈基準です。",
    sharedTitle: "共有されたタイプの要約",
    sharedBody: "このリンクには回答や詳細スコアは含まれません。以下は共有されたバランス型・混合プロファイルの一般的な要約です。スコア表を見るには、この端末でテストを完了してください。",
    back: "前の質問", progressLabel: "共感テストの進捗", clearProfileNote: "現在の回答では、この傾向が他より相対的に目立ちました。状況によって変わる自己報告の要約です。",
  },
  zh: {
    strengths: "优势", watchOut: "注意点", score: "得分", outOf: "满分16分",
    mixedTitle: "多种共情方式同时突出",
    mixedBody: "领先倾向的分差在{gap}分以内。请同时理解突出倾向，而不要把其中一种当作固定类型。这只是避免过度断言的解释规则，并非统计置信区间。",
    sharedTitle: "分享的类型摘要",
    sharedBody: "此链接不包含原始回答或详细分数。以下内容只是对分享的均衡或混合特征的一般说明；如需查看分数概况，请在此设备上完成测试。",
    back: "上一题", progressLabel: "共情测试进度", clearProfileNote: "在你当前的回答中，这种倾向相对更突出。这是一份会随情境变化的自我报告摘要。",
  },
  fr: {
    strengths: "Points forts", watchOut: "Points de vigilance", score: "Score", outOf: "sur 16",
    mixedTitle: "Plusieurs styles d’empathie ressortent ensemble",
    mixedBody: "Les tendances principales se situent à {gap} points d’écart au maximum. Lisez-les ensemble plutôt que d’en faire un type fixe. Il s’agit d’un garde-fou d’interprétation, pas d’un intervalle de confiance statistique.",
    sharedTitle: "Résumé du type partagé",
    sharedBody: "Ce lien ne contient ni réponses ni scores détaillés. Le texte ci-dessous résume de façon générale un profil équilibré ou mixte partagé. Terminez le test sur cet appareil pour voir le profil chiffré.",
    back: "Question précédente", progressLabel: "Progression du test d’empathie", clearProfileNote: "Dans vos réponses actuelles, cette tendance ressort relativement aux autres. Il s’agit d’un résumé auto-déclaré sensible au contexte.",
  },
  es: {
    strengths: "Fortalezas", watchOut: "A tener en cuenta", score: "Puntuación", outOf: "de 16",
    mixedTitle: "Varios estilos de empatía destacan juntos",
    mixedBody: "Las tendencias principales están a un máximo de {gap} puntos. Léelas juntas en vez de tratar una como tipo fijo. Es una cautela interpretativa, no un intervalo de confianza estadístico.",
    sharedTitle: "Resumen del tipo compartido",
    sharedBody: "Este enlace no contiene respuestas ni puntuaciones detalladas. El texto siguiente resume de forma general un perfil equilibrado o mixto compartido. Completa el test en este dispositivo para ver el perfil de puntuaciones.",
    back: "Pregunta anterior", progressLabel: "Progreso del test de empatía", clearProfileNote: "En tus respuestas actuales, esta tendencia destaca en relación con las demás. Es un resumen autoinformado que depende del contexto.",
  },
};

export default function EmpathyTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const t = ui[locale];
  const rt = resultUi[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<EmpathyResult | null>(null);
  useRecordFinishedTest({ testId: "empathy", title: "EmpathyTest", finished: Boolean(result) });
  const [sharedSummary, setSharedSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const em = params.get("em") as EmpathyResult | null;
    if (em === "balanced" || (em && em in typeInfo)) {
      setResult(em);
      setSharedSummary(true);
    }
  }, []);

  function pick(score: number) {
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const next = answers.slice(0, idx);
    next[idx] = score;
    if (next.length < questions.length) {
      setAnswers(next);
      setIdx(idx + 1);
    } else {
      const scores = scoreEmpathyAnswers(next, questions.map((q) => q.type));
      if (!scores) return;
      const profile = buildEmpathyProfile(scores);
      const shareResult: EmpathyResult = profile.isClose ? "balanced" : profile.primary;
      setAnswers(next);
      setResult(shareResult);
      setSharedSummary(false);
      gaEvent("test_completed", { test_id: "empathy", instrument_version: "empathy-oiyo-12-v1" });
      const url = new URL(window.location.href);
      url.searchParams.set("em", shareResult);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function goBack() {
    if (idx === 0 || result) return;
    setIdx(idx - 1);
  }

  function restart() {
    setIdx(0);
    setAnswers([]);
    setResult(null);
    setSharedSummary(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("em");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    gaEvent("share_click", { test_id: "empathy", instrument_version: "empathy-oiyo-12-v1" });
    if (navigator.share) {
      await navigator.share({ title: t.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (result) {
    const scores = answers.length === questions.length
      ? scoreEmpathyAnswers(answers, questions.map((q) => q.type))
      : null;
    const profile = scores ? buildEmpathyProfile(scores) : null;
    const leadingDimension = profile?.isClose ? null : profile?.primary ?? (result === "balanced" ? null : result);
    const info = leadingDimension ? typeInfo[leadingDimension] : null;
    const chartData = profile?.ranked.map(({ dimension, score, percent }) => ({
      dimension,
      name: typeInfo[dimension].name[locale],
      value: score,
      percent,
      fill: typeInfo[dimension].color,
    })) ?? [];
    const resultLabel = profile?.isClose
      ? profile.closeDimensions.map((dimension) => typeInfo[dimension].name[locale]).join(" + ")
      : info?.name[locale] ?? rt.mixedTitle;

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{t.resultTitle}</h1>
          <div className="inline-flex max-w-full justify-center whitespace-normal px-4 py-2 rounded-2xl text-white font-semibold text-lg"
            style={{ backgroundColor: info?.color ?? "#A1A578" }}>
            {resultLabel}
          </div>
        </div>

        {sharedSummary && !profile && (
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4" role="note">
            <h2 className="font-semibold text-sky-950">{rt.sharedTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-sky-800">{rt.sharedBody}</p>
          </div>
        )}

        {profile && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">{t.allTypes}</h2>
            <div className="h-36 w-full" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 12 }}>
                  <XAxis type="number" domain={[0, EMPATHY_MAX_DIMENSION_SCORE]} hide />
                  <YAxis type="category" dataKey="name" width={104} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={((value: number) => [`${value} ${rt.outOf}`, rt.score]) as any} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <dl className="mt-3 grid gap-2 sm:grid-cols-3">
              {chartData.map((item) => (
                <div key={item.dimension} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <dt className="text-xs font-medium text-gray-600">{item.name}</dt>
                  <dd className="mt-1 font-bold text-gray-900">
                    {item.value} {rt.outOf} <span className="text-xs font-medium text-gray-500">({item.percent}%)</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {profile?.isClose && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4" role="note">
            <h2 className="font-semibold text-green-950">{rt.mixedTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-green-800">{rt.mixedBody.replace("{gap}", String(profile.closeGap))}</p>
          </div>
        )}

        {info && !profile?.isClose && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{rt.clearProfileNote}</p>
          <p className="text-gray-700 leading-relaxed">{info.description[locale]}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✓ {rt.strengths}</h3>
              <ul className="space-y-1">
                {info.strengths[locale].map((s, i) => (
                  <li key={i} className="text-sm text-green-700">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-2">⚠ {rt.watchOut}</h3>
              <ul className="space-y-1">
                {info.risks[locale].map((r, i) => (
                  <li key={i} className="text-sm text-amber-700">• {r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-1">🌱 {t.growth}</h3>
            <p className="text-sm text-blue-700">{info.growth[locale]}</p>
          </div>
        </div>
        )}

        <p className="text-xs text-gray-400 text-center">{t.note}</p>
        <ShareResultButton
          locale={locale}
          heading={t.title}
          resultTitle={resultLabel}
          emoji={leadingDimension === 'cognitive' ? '🧠' : leadingDimension === 'affective' ? '💗' : leadingDimension === 'compassionate' ? '🤝' : '🧭'}
          description={profile?.isClose ? rt.mixedBody.replace("{gap}", String(profile.closeGap)) : info?.description[locale] ?? rt.sharedBody}
          onShareClick={() => gaEvent("share_click", { test_id: "empathy", instrument_version: "empathy-oiyo-12-v1" })}
        />
        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${locale}/eq/test`, label: locale === 'ko' ? '💛 감성 지능 테스트' : locale === 'ja' ? '💛 感情知性テスト' : locale === 'zh' ? '💛 情绪智力测试' : locale === 'fr' ? '💛 Test d’intelligence émotionnelle' : locale === 'es' ? '💛 Test de inteligencia emocional' : '💛 Emotional intelligence test' },
            { href: `/${locale}/attachment-style/test`, label: locale === 'ko' ? '🔗 애착 유형 테스트' : locale === 'ja' ? '🔗 愛着スタイルテスト' : locale === 'zh' ? '🔗 依恋类型测试' : locale === 'fr' ? '🔗 Test du style d’attachement' : locale === 'es' ? '🔗 Test de estilo de apego' : '🔗 Attachment style test' },
            { href: `/${locale}/ontology/personality`, label: locale === 'ko' ? '🧭 성격 온톨로지' : locale === 'ja' ? '🧭 性格オントロジー' : locale === 'zh' ? '🧭 人格本体论' : locale === 'fr' ? '🧭 Ontologie de la personnalité' : locale === 'es' ? '🧭 Ontología de la personalidad' : '🧭 Personality ontology' },
          ]}
        />
        <RelatedReading locale={locale} topic="empathy" />

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={restart}
            className="min-h-11 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700">
            {t.restart}
          </button>
          <button onClick={share}
            className="min-h-11 px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-medium transition-colors text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-700">
            {copied ? t.copied : t.share}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[idx];

  return (
    <Questionnaire
      title={t.title}
      subtitle={t.subtitle}
      question={q[locale]}
      questionLabel={`${t.progress} ${idx + 1} / ${questions.length}`}
      progress={Math.round(((idx + 1) / questions.length) * 100)}
      options={scaleLabels[locale].map((label, i) => ({ label, value: i + 1 }))}
      selectedValue={answers[idx] === undefined ? undefined : answers[idx] + 1}
      note={t.scale}
      previousLabel={rt.back}
      onPrevious={idx > 0 ? goBack : undefined}
      onSelect={(value) => pick(value - 1)}
    />
  );
}
