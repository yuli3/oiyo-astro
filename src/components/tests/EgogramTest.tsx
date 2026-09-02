import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ShareResultButton from "../shared/ShareResultButton";
import { Questionnaire } from "@/components/ui/questionnaire";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type EgoState = "CP" | "NP" | "A" | "FC" | "AC";

const EGO_STATES: EgoState[] = ["CP", "NP", "A", "FC", "AC"];

const stateInfo: Record<EgoState, Record<SupportedLocale, { name: string; color: string }>> = {
  CP: {
    ko: { name: "비판적 부모(CP)", color: "#ef4444" },
    en: { name: "Critical Parent (CP)", color: "#ef4444" },
    ja: { name: "批判的親(CP)", color: "#ef4444" },
    zh: { name: "批判型父母(CP)", color: "#ef4444" },
    fr: { name: "Parent critique (CP)", color: "#ef4444" },
    es: { name: "Padre crítico (CP)", color: "#ef4444" },
  },
  NP: {
    ko: { name: "양육적 부모(NP)", color: "#10b981" },
    en: { name: "Nurturing Parent (NP)", color: "#10b981" },
    ja: { name: "養育的親(NP)", color: "#10b981" },
    zh: { name: "养育型父母(NP)", color: "#10b981" },
    fr: { name: "Parent nourricier (NP)", color: "#10b981" },
    es: { name: "Padre nutricio (NP)", color: "#10b981" },
  },
  A: {
    ko: { name: "성인(A)", color: "#3b82f6" },
    en: { name: "Adult (A)", color: "#3b82f6" },
    ja: { name: "成人(A)", color: "#3b82f6" },
    zh: { name: "成人(A)", color: "#3b82f6" },
    fr: { name: "Adulte (A)", color: "#3b82f6" },
    es: { name: "Adulto (A)", color: "#3b82f6" },
  },
  FC: {
    ko: { name: "자유로운 아이(FC)", color: "#f59e0b" },
    en: { name: "Free Child (FC)", color: "#f59e0b" },
    ja: { name: "自由な子供(FC)", color: "#f59e0b" },
    zh: { name: "自由型儿童(FC)", color: "#f59e0b" },
    fr: { name: "Enfant libre (FC)", color: "#f59e0b" },
    es: { name: "Niño libre (FC)", color: "#f59e0b" },
  },
  AC: {
    ko: { name: "순응하는 아이(AC)", color: "#435D31" },
    en: { name: "Adapted Child (AC)", color: "#435D31" },
    ja: { name: "順応した子供(AC)", color: "#435D31" },
    zh: { name: "适应型儿童(AC)", color: "#435D31" },
    fr: { name: "Enfant adapté (AC)", color: "#435D31" },
    es: { name: "Niño adaptado (AC)", color: "#435D31" },
  },
};

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  state: EgoState;
}

const questions: Question[] = [
  // CP — Critical Parent
  { ko: "나는 다른 사람의 잘못을 쉽게 지적하는 편이다.", en: "I tend to easily point out others' mistakes.", ja: "他人の間違いを簡単に指摘する方だ。", zh: "我倾向于很容易指出别人的错误。", fr: "J'ai tendance à relever facilement les erreurs des autres.", es: "Tiendo a señalar con facilidad los errores de los demás.", state: "CP" },
  { ko: "규칙이나 원칙을 어기는 사람을 보면 화가 난다.", en: "I get angry when people break rules or principles.", ja: "ルールや原則を破る人を見ると怒りを感じる。", zh: "看到有人违反规则或原则时，我会生气。", fr: "Je me mets en colère quand quelqu'un enfreint les règles ou les principes.", es: "Me enfado cuando las personas rompen reglas o principios.", state: "CP" },
  // NP — Nurturing Parent
  { ko: "어려움에 처한 사람을 보면 돕고 싶은 마음이 자연스럽게 생긴다.", en: "I naturally want to help people in difficulty.", ja: "困っている人を見ると自然と助けたくなる。", zh: "看到遇到困难的人时，我会自然地产生想帮助的心情。", fr: "Quand je vois quelqu'un en difficulté, j'ai naturellement envie de l'aider.", es: "Cuando veo a alguien en dificultad, me nace ayudar de forma natural.", state: "NP" },
  { ko: "주변 사람들의 감정과 상태에 민감하게 반응한다.", en: "I'm sensitive to the feelings and condition of those around me.", ja: "周りの人の感情と状態に敏感に反応する。", zh: "我会敏锐地回应身边人的情绪和状态。", fr: "Je suis sensible aux émotions et à l'état des personnes autour de moi.", es: "Soy sensible a los sentimientos y al estado de quienes me rodean.", state: "NP" },
  // A — Adult
  { ko: "감정보다는 사실과 논리를 바탕으로 결정을 내린다.", en: "I make decisions based on facts and logic rather than emotions.", ja: "感情よりも事実と論理に基づいて決断する。", zh: "相比情绪，我会基于事实和逻辑做决定。", fr: "Je prends mes décisions à partir des faits et de la logique plutôt que des émotions.", es: "Tomo decisiones basándome en hechos y lógica más que en emociones.", state: "A" },
  { ko: "문제가 생기면 원인을 분석하고 해결책을 체계적으로 찾는다.", en: "When problems arise, I analyze causes and systematically find solutions.", ja: "問題が生じたら原因を分析し、体系的に解決策を探す。", zh: "出现问题时，我会分析原因，并系统地寻找解决方案。", fr: "Quand un problème survient, j'en analyse les causes et cherche des solutions de façon structurée.", es: "Cuando surge un problema, analizo las causas y busco soluciones de forma sistemática.", state: "A" },
  // FC — Free Child
  { ko: "새로운 것을 시도하거나 놀이처럼 즐기는 것을 좋아한다.", en: "I enjoy trying new things and approaching life playfully.", ja: "新しいことを試したり、遊びのように楽しむことが好きだ。", zh: "我喜欢尝试新事物，也喜欢像游戏一样享受生活。", fr: "J'aime essayer de nouvelles choses et aborder la vie avec un esprit de jeu.", es: "Disfruto probar cosas nuevas y vivirlas con un enfoque lúdico.", state: "FC" },
  { ko: "감정을 솔직하게 표현하고 기쁨을 드러내는 편이다.", en: "I tend to express my emotions honestly and show my joy freely.", ja: "感情を正直に表現し、喜びを素直に表す方だ。", zh: "我倾向于坦率表达情绪，也会自然地表现喜悦。", fr: "J'ai tendance à exprimer mes émotions avec sincérité et à montrer ma joie librement.", es: "Tiendo a expresar mis emociones con sinceridad y a mostrar mi alegría libremente.", state: "FC" },
  // AC — Adapted Child
  { ko: "다른 사람의 기대에 부응하려고 나의 욕구를 억누를 때가 많다.", en: "I often suppress my own desires to meet others' expectations.", ja: "他人の期待に応えようと自分の欲求を抑えることが多い。", zh: "为了回应别人的期待，我常常压抑自己的需求。", fr: "Je réprime souvent mes propres envies pour répondre aux attentes des autres.", es: "A menudo reprimo mis propios deseos para cumplir con las expectativas de los demás.", state: "AC" },
  { ko: "갈등을 피하기 위해 의견 충돌보다는 타협하거나 양보하는 편이다.", en: "To avoid conflict, I tend to compromise or yield rather than clash.", ja: "葛藤を避けるため、意見の衝突よりも妥協したり譲ることが多い。", zh: "为了避免冲突，我更倾向于妥协或让步，而不是正面争执。", fr: "Pour éviter le conflit, j'ai tendance à faire des compromis ou à céder plutôt qu'à m'opposer.", es: "Para evitar conflictos, tiendo a negociar o ceder antes que enfrentarme.", state: "AC" },
];

const scaleLabels: Record<SupportedLocale, string[]> = {
  ko: ["전혀 아니다", "아니다", "보통", "그렇다", "매우 그렇다"],
  en: ["Not at all", "Not really", "Neutral", "Agree", "Strongly agree"],
  ja: ["全くない", "そうでない", "普通", "そうだ", "とてもそうだ"],
  zh: ["完全不是", "不太是", "一般", "同意", "非常同意"],
  fr: ["Pas du tout", "Pas vraiment", "Neutre", "D'accord", "Tout à fait d'accord"],
  es: ["Para nada", "No mucho", "Neutral", "De acuerdo", "Totalmente de acuerdo"],
};

interface ResultData {
  title: Record<SupportedLocale, string>;
  dominant: EgoState;
  description: Record<SupportedLocale, string>;
  strengths: Record<SupportedLocale, string[]>;
  risks: Record<SupportedLocale, string[]>;
  advice: Record<SupportedLocale, string>;
  affirmation: Record<SupportedLocale, string>;
}

type ProfileKey = "balanced" | "CP_dominant" | "NP_dominant" | "A_dominant" | "FC_dominant" | "AC_dominant";

const profiles: Record<ProfileKey, ResultData> = {
  balanced: {
    title: { ko: "균형잡힌 자아", en: "Balanced Ego", ja: "バランスの取れた自我", zh: "平衡型自我", fr: "Moi équilibré", es: "Ego equilibrado" },
    dominant: "A",
    description: {
      ko: "당신은 5가지 자아 상태가 비교적 균형 있게 발달되어 있습니다. 상황에 따라 부모·성인·아이의 측면을 유연하게 활용하며, 대인관계에서 적응력이 높습니다.",
      en: "Your five ego states are relatively balanced. You flexibly use parent, adult, and child aspects depending on the situation, making you highly adaptable in relationships.",
      ja: "5つの自我状態が比較的バランスよく発達しています。状況に応じて親・成人・子供の側面を柔軟に活用し、対人関係での適応力が高いです。",
      zh: "你的五种自我状态发展得相对平衡。你能根据情境灵活运用父母、成人和儿童的不同面向，在人际关系中适应力较高。",
      fr: "Vos cinq états du moi sont relativement équilibrés. Vous mobilisez avec souplesse les aspects parent, adulte et enfant selon la situation, ce qui vous rend très adaptable dans les relations.",
      es: "Tus cinco estados del ego están relativamente equilibrados. Usas con flexibilidad los aspectos de padre, adulto y niño según la situación, lo que te da una alta capacidad de adaptación en las relaciones.",
    },
    strengths: {
      ko: ["상황 적응력이 뛰어남", "다양한 방식으로 소통 가능", "감정과 이성의 균형"],
      en: ["Highly adaptable to situations", "Can communicate in diverse ways", "Balance between emotion and reason"],
      ja: ["状況への適応力が優れている", "多様な方法でコミュニケーション可能", "感情と理性のバランス"],
      zh: ["对情境的适应力强", "能够用多种方式沟通", "情感与理性的平衡"],
      fr: ["Grande capacité d'adaptation aux situations", "Communication possible de plusieurs façons", "Équilibre entre émotion et raison"],
      es: ["Alta adaptabilidad a las situaciones", "Capacidad para comunicarse de distintas maneras", "Equilibrio entre emoción y razón"],
    },
    risks: {
      ko: ["뚜렷한 강점이 없어 보일 수 있음", "결정적 상황에서 방향 설정이 어려울 수 있음"],
      en: ["May seem to lack a distinct strength", "May struggle to set direction in critical moments"],
      ja: ["際立った強みが見えにくいことがある", "決定的な場面で方向性を定めにくいことがある"],
      zh: ["可能看起来缺少鲜明优势", "在关键时刻可能难以确定方向"],
      fr: ["Peut sembler manquer d'un point fort distinct", "Peut avoir du mal à fixer une direction dans les moments décisifs"],
      es: ["Puede parecer que falta una fortaleza distintiva", "Puede costarte definir una dirección en momentos decisivos"],
    },
    advice: {
      ko: "균형은 큰 장점입니다. 자신의 핵심 가치를 더 명확히 해두면 결정적 순간에 힘이 됩니다.",
      en: "Balance is a great strength. Clarifying your core values will empower you in decisive moments.",
      ja: "バランスは大きな強みです。核心的な価値観をより明確にすることで、決定的な瞬間に力を発揮できます。",
      zh: "平衡本身就是很大的优势。若能进一步明确自己的核心价值，在关键时刻会成为你的力量。",
      fr: "L'équilibre est une grande force. Clarifier vos valeurs centrales vous donnera de l'appui dans les moments décisifs.",
      es: "El equilibrio es una gran fortaleza. Aclarar tus valores centrales te dará más fuerza en los momentos decisivos.",
    },
    affirmation: {
      ko: "나는 다양한 상황에 유연하게 적응하는 능력이 있습니다.",
      en: "I have the ability to flexibly adapt to diverse situations.",
      ja: "私はさまざまな状況に柔軟に適応する能力があります。",
      zh: "我有能力灵活适应各种情境。",
      fr: "J'ai la capacité de m'adapter avec souplesse à des situations diverses.",
      es: "Tengo la capacidad de adaptarme con flexibilidad a situaciones diversas.",
    },
  },
  CP_dominant: {
    title: { ko: "비판적 리더형", en: "Critical Leader", ja: "批判的リーダー型", zh: "批判型领导者", fr: "Leader critique", es: "Líder crítico" },
    dominant: "CP",
    description: {
      ko: "비판적 부모(CP) 자아가 강한 당신은 높은 기준과 원칙을 중요시합니다. 책임감이 강하고 잘못된 것을 바로잡으려는 의지가 있지만, 타인에게 엄격하게 느껴질 수 있습니다.",
      en: "With a dominant Critical Parent (CP) ego, you value high standards and principles. You're responsible and motivated to correct wrongs, but may come across as strict to others.",
      ja: "批判的親(CP)自我が強いあなたは、高い基準と原則を重視します。責任感が強く間違いを正したい意欲がありますが、他人に厳格に感じられることがあります。",
      zh: "批判型父母(CP)自我较强的你，重视高标准和原则。你责任感强，也有纠正错误的意愿，但在他人眼中可能显得严厉。",
      fr: "Avec un Parent critique (CP) dominant, vous accordez beaucoup d'importance aux standards élevés et aux principes. Vous êtes responsable et porté à corriger ce qui ne va pas, mais les autres peuvent vous percevoir comme strict.",
      es: "Con un Padre crítico (CP) dominante, valoras los estándares altos y los principios. Eres responsable y tienes impulso por corregir lo incorrecto, aunque los demás pueden percibirte como estricto.",
    },
    strengths: {
      ko: ["높은 책임감과 원칙 준수", "잘못된 것을 바로잡는 리더십", "일관된 기준 유지"],
      en: ["High responsibility and adherence to principles", "Leadership in correcting wrongs", "Maintaining consistent standards"],
      ja: ["高い責任感と原則の遵守", "間違いを正すリーダーシップ", "一貫した基準の維持"],
      zh: ["高度责任感和原则意识", "纠正错误的领导力", "保持一致标准"],
      fr: ["Fort sens des responsabilités et respect des principes", "Leadership pour corriger ce qui ne va pas", "Maintien de standards cohérents"],
      es: ["Alto sentido de responsabilidad y respeto por los principios", "Liderazgo para corregir lo incorrecto", "Mantenimiento de estándares consistentes"],
    },
    risks: {
      ko: ["지나친 비판으로 관계가 경직될 수 있음", "완벽주의로 인한 스트레스 증가", "상대방이 위축될 수 있음"],
      en: ["Excessive criticism can stiffen relationships", "Perfectionism increases stress", "Others may feel intimidated"],
      ja: ["過度な批判で関係が硬直することがある", "完璧主義によるストレスの増加", "相手が萎縮することがある"],
      zh: ["过度批评可能让关系变得僵硬", "完美主义会增加压力", "对方可能感到被压迫"],
      fr: ["Une critique excessive peut rigidifier les relations", "Le perfectionnisme augmente le stress", "Les autres peuvent se sentir intimidés"],
      es: ["La crítica excesiva puede rigidizar las relaciones", "El perfeccionismo aumenta el estrés", "Los demás pueden sentirse intimidados"],
    },
    advice: {
      ko: "비판 전에 상대의 입장을 먼저 이해하려고 노력해보세요. 칭찬과 인정의 말도 함께 섞어주면 더 효과적인 리더가 됩니다.",
      en: "Try to understand others' perspectives before criticizing. Mixing praise and acknowledgment makes you a more effective leader.",
      ja: "批判する前に相手の立場を理解しようと努力してみてください。称賛と承認の言葉も混ぜると、より効果的なリーダーになれます。",
      zh: "在批评之前，先尝试理解对方的立场。把赞美和认可也一起表达出来，会让你成为更有效的领导者。",
      fr: "Essayez de comprendre le point de vue de l'autre avant de critiquer. En ajoutant aussi des mots de reconnaissance et d'encouragement, vous deviendrez un leader plus efficace.",
      es: "Intenta comprender la perspectiva de la otra persona antes de criticar. Combinar elogio y reconocimiento te convierte en un líder más eficaz.",
    },
    affirmation: {
      ko: "나의 높은 기준은 나와 타인 모두의 성장을 위한 것입니다.",
      en: "My high standards exist to foster growth in myself and others.",
      ja: "私の高い基準は、自分と他人の両方の成長のためです。",
      zh: "我的高标准是为了促进自己和他人的成长。",
      fr: "Mes standards élevés servent à favoriser ma croissance et celle des autres.",
      es: "Mis estándares altos existen para impulsar mi crecimiento y el de los demás.",
    },
  },
  NP_dominant: {
    title: { ko: "따뜻한 돌봄형", en: "Warm Caregiver", ja: "温かい世話型", zh: "温暖照顾者", fr: "Aidant chaleureux", es: "Cuidador cálido" },
    dominant: "NP",
    description: {
      ko: "양육적 부모(NP) 자아가 강한 당신은 타인을 돕고 보살피는 것에서 의미를 찾습니다. 공감 능력이 뛰어나고 주변 사람들에게 따뜻한 지지를 제공하지만, 자신을 잃을 위험도 있습니다.",
      en: "With a dominant Nurturing Parent (NP) ego, you find meaning in helping and caring for others. You have excellent empathy and provide warm support, but risk losing yourself.",
      ja: "養育的親(NP)自我が強いあなたは、他者を助け世話することに意味を見出します。共感力が優れており温かいサポートを提供しますが、自分を見失うリスクもあります。",
      zh: "养育型父母(NP)自我较强的你，会在帮助和照顾他人中找到意义。你共情能力出色，能给身边的人温暖支持，但也有忽略自己的风险。",
      fr: "Avec un Parent nourricier (NP) dominant, vous trouvez du sens dans l'aide et le soin apportés aux autres. Votre empathie est forte et vous offrez un soutien chaleureux, mais vous risquez aussi de vous oublier.",
      es: "Con un Padre nutricio (NP) dominante, encuentras sentido en ayudar y cuidar a los demás. Tienes una gran empatía y ofreces apoyo cálido, aunque también corres el riesgo de perderte de vista.",
    },
    strengths: {
      ko: ["뛰어난 공감 능력", "타인을 위한 희생과 헌신", "신뢰받는 지지자 역할"],
      en: ["Excellent empathy", "Sacrifice and dedication for others", "Role as a trusted supporter"],
      ja: ["優れた共感能力", "他者のための犠牲と献身", "信頼される支援者としての役割"],
      zh: ["出色的共情能力", "为他人付出与奉献", "值得信赖的支持者角色"],
      fr: ["Excellente empathie", "Dévouement et disponibilité pour les autres", "Rôle de soutien digne de confiance"],
      es: ["Excelente empatía", "Entrega y dedicación hacia los demás", "Rol de apoyo confiable"],
    },
    risks: {
      ko: ["자신의 필요를 무시하는 경향", "과도한 돌봄으로 번아웃 위험", "의존적인 관계를 형성할 수 있음"],
      en: ["Tendency to neglect own needs", "Risk of burnout from excessive caring", "May create dependent relationships"],
      ja: ["自分のニーズを無視する傾向", "過度な世話によるバーンアウトのリスク", "依存的な関係を形成することがある"],
      zh: ["倾向于忽视自己的需要", "过度照顾可能导致倦怠", "可能形成依赖型关系"],
      fr: ["Tendance à négliger vos propres besoins", "Risque d'épuisement lié à un soin excessif", "Peut créer des relations dépendantes"],
      es: ["Tendencia a descuidar tus propias necesidades", "Riesgo de agotamiento por cuidar en exceso", "Puede crear relaciones dependientes"],
    },
    advice: {
      ko: "남을 돕는 것만큼 자신을 돌보는 것도 중요합니다. '아니오'라고 말하는 연습을 통해 건강한 경계를 만들어 보세요.",
      en: "Caring for yourself is as important as caring for others. Practice saying 'no' to create healthy boundaries.",
      ja: "自分を大切にすることは、他人を助けることと同じくらい重要です。「ノー」と言う練習をして、健康的な境界線を作りましょう。",
      zh: "照顾自己和帮助别人同样重要。练习说“不”，为自己建立健康的边界。",
      fr: "Prendre soin de vous est aussi important que prendre soin des autres. Entraînez-vous à dire « non » pour créer des limites saines.",
      es: "Cuidarte a ti mismo es tan importante como cuidar a los demás. Practica decir “no” para crear límites saludables.",
    },
    affirmation: {
      ko: "나는 나 자신을 돌볼 때 더 풍요롭게 타인을 도울 수 있습니다.",
      en: "When I care for myself, I can help others more abundantly.",
      ja: "自分を大切にすることで、より豊かに他者を助けることができます。",
      zh: "当我照顾好自己时，就能更丰盛地帮助他人。",
      fr: "Quand je prends soin de moi, je peux aider les autres avec plus d'abondance.",
      es: "Cuando cuido de mí, puedo ayudar a los demás con mayor plenitud.",
    },
  },
  A_dominant: {
    title: { ko: "이성적 분석가형", en: "Rational Analyst", ja: "理性的分析家型", zh: "理性分析者", fr: "Analyste rationnel", es: "Analista racional" },
    dominant: "A",
    description: {
      ko: "성인(A) 자아가 강한 당신은 논리와 사실에 기반해 생각하고 행동합니다. 객관적이고 냉정하게 상황을 분석하는 능력이 뛰어나지만, 때로는 감정적 연결이 부족해 보일 수 있습니다.",
      en: "With a dominant Adult (A) ego, you think and act based on logic and facts. You excel at objective analysis, but may sometimes appear emotionally detached.",
      ja: "成人(A)自我が強いあなたは、論理と事実に基づいて考え行動します。客観的に状況を分析する能力が優れていますが、時に感情的なつながりが不足して見えることがあります。",
      zh: "成人(A)自我较强的你，会基于逻辑和事实思考并行动。你擅长客观、冷静地分析情况，但有时可能显得情感连接不足。",
      fr: "Avec un Adulte (A) dominant, vous pensez et agissez à partir de la logique et des faits. Vous excellez dans l'analyse objective, mais vous pouvez parfois sembler émotionnellement distant.",
      es: "Con un Adulto (A) dominante, piensas y actúas basándote en la lógica y los hechos. Destacas en el análisis objetivo, aunque a veces puedes parecer emocionalmente distante.",
    },
    strengths: {
      ko: ["객관적이고 정확한 판단", "감정에 휘둘리지 않는 안정성", "체계적인 문제 해결 능력"],
      en: ["Objective and accurate judgment", "Stability not swayed by emotions", "Systematic problem-solving ability"],
      ja: ["客観的で正確な判断", "感情に左右されない安定性", "体系的な問題解決能力"],
      zh: ["客观且准确的判断", "不易被情绪左右的稳定性", "系统化解决问题的能力"],
      fr: ["Jugement objectif et précis", "Stabilité peu influencée par les émotions", "Capacité de résolution systématique des problèmes"],
      es: ["Juicio objetivo y preciso", "Estabilidad que no se deja arrastrar por las emociones", "Capacidad sistemática para resolver problemas"],
    },
    risks: {
      ko: ["감정 표현 부족으로 차갑게 보일 수 있음", "직관이나 창의성이 약할 수 있음", "관계에서 감정적 지지가 부족할 수 있음"],
      en: ["May appear cold due to lack of emotional expression", "Intuition or creativity may be weaker", "May lack emotional support in relationships"],
      ja: ["感情表現の不足で冷たく見えることがある", "直感や創造性が弱いことがある", "関係において感情的サポートが不足することがある"],
      zh: ["可能因情感表达不足而显得冷淡", "直觉或创造力可能较弱", "在人际关系中可能缺少情感支持"],
      fr: ["Peut paraître froid par manque d'expression émotionnelle", "L'intuition ou la créativité peuvent être moins présentes", "Peut manquer de soutien émotionnel dans les relations"],
      es: ["Puede parecer frío por falta de expresión emocional", "La intuición o la creatividad pueden estar menos presentes", "Puede faltar apoyo emocional en las relaciones"],
    },
    advice: {
      ko: "분석 능력은 큰 자산입니다. 여기에 감정적 공감을 더하면 더욱 완성된 소통을 할 수 있습니다.",
      en: "Your analytical ability is a great asset. Adding emotional empathy will make your communication even more complete.",
      ja: "分析力は大きな資産です。感情的な共感を加えることで、より完成したコミュニケーションができます。",
      zh: "分析能力是很大的资产。如果再加入情感上的共情，你的沟通会更加完整。",
      fr: "Votre capacité d'analyse est un grand atout. En y ajoutant de l'empathie émotionnelle, votre communication deviendra plus complète.",
      es: "Tu capacidad analítica es un gran recurso. Si le añades empatía emocional, tu comunicación será aún más completa.",
    },
    affirmation: {
      ko: "나의 논리적 사고는 나와 주변 사람들에게 명확함을 선물합니다.",
      en: "My logical thinking is a gift of clarity to myself and those around me.",
      ja: "私の論理的思考は、自分と周りの人に明確さをもたらします。",
      zh: "我的逻辑思维为我和身边的人带来清晰。",
      fr: "Ma pensée logique apporte de la clarté à moi-même et à mon entourage.",
      es: "Mi pensamiento lógico aporta claridad a mí y a quienes me rodean.",
    },
  },
  FC_dominant: {
    title: { ko: "자유로운 창조자형", en: "Free Creator", ja: "自由な創造者型", zh: "自由创造者", fr: "Créateur libre", es: "Creador libre" },
    dominant: "FC",
    description: {
      ko: "자유로운 아이(FC) 자아가 강한 당신은 호기심과 창의성이 넘칩니다. 자발적이고 에너지가 넘치며 삶을 즐기는 능력이 있지만, 때로는 충동적이거나 책임감이 부족해 보일 수 있습니다.",
      en: "With a dominant Free Child (FC) ego, you overflow with curiosity and creativity. You're spontaneous and energetic with a gift for enjoying life, but may sometimes seem impulsive or less responsible.",
      ja: "自由な子供(FC)自我が強いあなたは、好奇心と創造性が溢れています。自発的でエネルギッシュで人生を楽しむ能力がありますが、時に衝動的または責任感が不足して見えることがあります。",
      zh: "自由型儿童(FC)自我较强的你，充满好奇心和创造力。你自发、有活力，也很会享受生活，但有时可能显得冲动或责任感不足。",
      fr: "Avec un Enfant libre (FC) dominant, vous débordez de curiosité et de créativité. Vous êtes spontané, énergique et doué pour profiter de la vie, mais vous pouvez parfois sembler impulsif ou moins responsable.",
      es: "Con un Niño libre (FC) dominante, rebosas curiosidad y creatividad. Eres espontáneo, enérgico y tienes facilidad para disfrutar la vida, aunque a veces puedes parecer impulsivo o menos responsable.",
    },
    strengths: {
      ko: ["높은 창의성과 상상력", "자발적인 즐거움과 유머", "새로운 아이디어 창출 능력"],
      en: ["High creativity and imagination", "Spontaneous joy and humor", "Ability to generate new ideas"],
      ja: ["高い創造性と想像力", "自発的な楽しさとユーモア", "新しいアイデアを生み出す能力"],
      zh: ["高度创造力和想象力", "自发的快乐与幽默感", "产生新想法的能力"],
      fr: ["Grande créativité et imagination", "Joie spontanée et humour", "Capacité à générer de nouvelles idées"],
      es: ["Alta creatividad e imaginación", "Alegría espontánea y humor", "Capacidad para generar nuevas ideas"],
    },
    risks: {
      ko: ["충동적인 결정을 내릴 수 있음", "장기적 계획이나 마무리가 약할 수 있음", "책임 회피로 이어질 수 있음"],
      en: ["May make impulsive decisions", "Long-term planning or follow-through may be weak", "Can lead to avoiding responsibilities"],
      ja: ["衝動的な決断をすることがある", "長期計画や締めくくりが弱いことがある", "責任回避につながることがある"],
      zh: ["可能做出冲动决定", "长期规划或收尾能力可能较弱", "可能发展为回避责任"],
      fr: ["Peut prendre des décisions impulsives", "La planification à long terme ou le suivi peuvent être faibles", "Peut mener à l'évitement des responsabilités"],
      es: ["Puede tomar decisiones impulsivas", "La planificación a largo plazo o el seguimiento pueden ser débiles", "Puede llevar a evitar responsabilidades"],
    },
    advice: {
      ko: "당신의 에너지와 창의성은 세상에 활력을 줍니다. 약간의 구조와 계획을 더하면 그 에너지가 더 큰 결실을 맺을 수 있습니다.",
      en: "Your energy and creativity bring vitality to the world. Adding a bit more structure and planning can help that energy bear greater fruit.",
      ja: "あなたのエネルギーと創造性は世界に活力を与えます。少しの構造と計画を加えることで、そのエネルギーがより大きな実を結ぶことができます。",
      zh: "你的能量和创造力为世界带来活力。加入一点结构和计划，会让这份能量结出更大的成果。",
      fr: "Votre énergie et votre créativité apportent de la vitalité au monde. Un peu plus de structure et de planification peut aider cette énergie à porter davantage de fruits.",
      es: "Tu energía y creatividad aportan vitalidad al mundo. Añadir un poco más de estructura y planificación puede hacer que esa energía dé mejores frutos.",
    },
    affirmation: {
      ko: "나의 창의성과 열정은 세상을 더 풍요롭게 만듭니다.",
      en: "My creativity and passion make the world more vibrant.",
      ja: "私の創造性と情熱は、世界をより豊かにします。",
      zh: "我的创造力和热情让世界更加丰盛。",
      fr: "Ma créativité et ma passion rendent le monde plus vivant.",
      es: "Mi creatividad y mi pasión hacen que el mundo sea más vibrante.",
    },
  },
  AC_dominant: {
    title: { ko: "순응하는 평화주의자형", en: "Peaceful Adapter", ja: "順応する平和主義者型", zh: "平和适应者", fr: "Adaptateur pacifique", es: "Adaptador pacífico" },
    dominant: "AC",
    description: {
      ko: "순응하는 아이(AC) 자아가 강한 당신은 갈등을 피하고 타인의 기대에 맞추려는 경향이 강합니다. 협조적이고 온화하지만, 자신의 진짜 감정을 억누르거나 자기주장이 약할 수 있습니다.",
      en: "With a dominant Adapted Child (AC) ego, you strongly tend to avoid conflict and conform to others' expectations. You're cooperative and gentle, but may suppress your true feelings or lack assertiveness.",
      ja: "順応した子供(AC)自我が強いあなたは、葛藤を避け他者の期待に合わせようとする傾向が強いです。協調的で穏やかですが、本当の感情を抑えたり主張が弱いことがあります。",
      zh: "适应型儿童(AC)自我较强的你，强烈倾向于避免冲突并配合他人的期待。你合作、温和，但可能压抑真实感受，或缺少自我主张。",
      fr: "Avec un Enfant adapté (AC) dominant, vous avez une forte tendance à éviter les conflits et à vous conformer aux attentes des autres. Vous êtes coopératif et doux, mais vous pouvez réprimer vos vrais sentiments ou manquer d'affirmation.",
      es: "Con un Niño adaptado (AC) dominante, tiendes con fuerza a evitar el conflicto y ajustarte a las expectativas de los demás. Eres cooperativo y amable, pero puedes reprimir tus sentimientos reales o mostrar poca asertividad.",
    },
    strengths: {
      ko: ["뛰어난 협동 능력", "갈등 완화에 능숙", "타인을 배려하는 따뜻한 마음"],
      en: ["Excellent cooperation ability", "Skilled at de-escalating conflict", "Warm, considerate heart"],
      ja: ["優れた協調能力", "葛藤の緩和が得意", "他者を思いやる温かい心"],
      zh: ["出色的合作能力", "擅长缓和冲突", "体贴他人的温暖内心"],
      fr: ["Excellente capacité de coopération", "Habileté à apaiser les conflits", "Cœur chaleureux et attentif aux autres"],
      es: ["Excelente capacidad de cooperación", "Habilidad para reducir conflictos", "Corazón cálido y considerado"],
    },
    risks: {
      ko: ["자신의 욕구를 억누르는 경향", "자기 비하나 낮은 자존감", "의존적인 관계 패턴 형성"],
      en: ["Tendency to suppress own desires", "Self-deprecation or low self-esteem", "Forming dependent relationship patterns"],
      ja: ["自分の欲求を抑える傾向", "自己卑下や低い自尊感情", "依存的な関係パターンの形成"],
      zh: ["倾向于压抑自己的需求", "自我贬低或低自尊", "形成依赖型关系模式"],
      fr: ["Tendance à réprimer vos propres désirs", "Auto-dévalorisation ou faible estime de soi", "Formation de schémas relationnels dépendants"],
      es: ["Tendencia a reprimir tus propios deseos", "Autodevaluación o baja autoestima", "Formación de patrones de relación dependientes"],
    },
    advice: {
      ko: "당신의 배려심은 소중한 자산입니다. 자신의 감정과 필요를 표현하는 것이 이기적인 것이 아님을 기억하세요. 작은 것부터 의견을 말하는 연습을 시작해보세요.",
      en: "Your consideration is a precious asset. Remember that expressing your own feelings and needs is not selfish. Start practicing expressing opinions on small things.",
      ja: "あなたの思いやりは貴重な資産です。自分の感情と必要を表現することは自己中心的ではないことを覚えてください。小さなことから意見を言う練習を始めてみましょう。",
      zh: "你的体贴是珍贵的资产。请记住，表达自己的感受和需要并不是自私。可以从小事开始练习说出意见。",
      fr: "Votre considération est un atout précieux. Rappelez-vous qu'exprimer vos sentiments et vos besoins n'est pas égoïste. Commencez à vous exercer à donner votre avis sur de petites choses.",
      es: "Tu consideración es un recurso valioso. Recuerda que expresar tus sentimientos y necesidades no es egoísta. Empieza a practicar dando tu opinión en cosas pequeñas.",
    },
    affirmation: {
      ko: "나는 나의 감정과 필요를 표현할 자격이 있습니다.",
      en: "I deserve to express my feelings and needs.",
      ja: "私は自分の感情と必要を表現する資格があります。",
      zh: "我有资格表达自己的感受和需要。",
      fr: "Je mérite d'exprimer mes sentiments et mes besoins.",
      es: "Merezco expresar mis sentimientos y necesidades.",
    },
  },
};

const ui: Record<SupportedLocale, {
  title: string;
  subtitle: string;
  scale: string;
  progress: string;
  resultTitle: string;
  scores: string;
  strengths: string;
  risks: string;
  advice: string;
  affirmation: string;
  restart: string;
  share: string;
  copied: string;
  note: string;
}> = {
  ko: {
    title: "에고그램 자아 상태 테스트",
    subtitle: "교류분석(TA) 기반의 5가지 자아 상태를 진단합니다",
    scale: "각 항목에 얼마나 동의하시나요?",
    progress: "질문",
    resultTitle: "나의 자아 상태 프로파일",
    scores: "자아 상태별 점수",
    strengths: "강점",
    risks: "주의할 점",
    advice: "성장 조언",
    affirmation: "오늘의 확언",
    restart: "다시 테스트하기",
    share: "결과 공유",
    copied: "링크가 복사되었습니다!",
    note: "이 테스트는 Transactional Analysis(교류분석) 이론에 기반하며, 자기 이해를 위한 참고 자료입니다.",
  },
  en: {
    title: "Egogram Ego State Test",
    subtitle: "Diagnose your 5 ego states based on Transactional Analysis (TA)",
    scale: "How much do you agree with each statement?",
    progress: "Question",
    resultTitle: "My Ego State Profile",
    scores: "Ego State Scores",
    strengths: "Strengths",
    risks: "Watch out for",
    advice: "Growth Advice",
    affirmation: "Today's Affirmation",
    restart: "Retake Test",
    share: "Share Result",
    copied: "Link copied!",
    note: "This test is based on Transactional Analysis theory and is intended as a self-understanding reference.",
  },
  ja: {
    title: "エゴグラム自我状態テスト",
    subtitle: "交流分析(TA)に基づく5つの自我状態を診断します",
    scale: "各項目にどれくらい同意しますか？",
    progress: "質問",
    resultTitle: "私の自我状態プロファイル",
    scores: "自我状態別スコア",
    strengths: "強み",
    risks: "注意点",
    advice: "成長アドバイス",
    affirmation: "今日のアファメーション",
    restart: "もう一度テストする",
    share: "結果を共有",
    copied: "リンクをコピーしました！",
    note: "このテストは交流分析(TA)理論に基づいており、自己理解のための参考資料です。",
  },
  zh: {
    title: "Egogram 自我状态测试",
    subtitle: "基于交流分析(TA)诊断五种自我状态",
    scale: "你对每个项目的同意程度是多少？",
    progress: "问题",
    resultTitle: "我的自我状态画像",
    scores: "各自我状态得分",
    strengths: "强项",
    risks: "需要留意",
    advice: "成长建议",
    affirmation: "今日肯定语",
    restart: "重新测试",
    share: "分享结果",
    copied: "链接已复制！",
    note: "本测试基于 Transactional Analysis（交流分析）理论，旨在作为自我理解的参考资料。",
  },
  fr: {
    title: "Test des états du moi Egogram",
    subtitle: "Diagnostiquez vos 5 états du moi avec l'analyse transactionnelle (AT)",
    scale: "Dans quelle mesure êtes-vous d'accord avec chaque affirmation ?",
    progress: "Question",
    resultTitle: "Mon profil d'états du moi",
    scores: "Scores des états du moi",
    strengths: "Forces",
    risks: "Points de vigilance",
    advice: "Conseil de croissance",
    affirmation: "Affirmation du jour",
    restart: "Refaire le test",
    share: "Partager le résultat",
    copied: "Lien copié !",
    note: "Ce test s'appuie sur la théorie de l'analyse transactionnelle et sert de repère pour mieux se comprendre.",
  },
  es: {
    title: "Test de estados del ego Egogram",
    subtitle: "Diagnostica tus 5 estados del ego con base en el análisis transaccional (AT)",
    scale: "¿Qué tanto estás de acuerdo con cada afirmación?",
    progress: "Pregunta",
    resultTitle: "Mi perfil de estados del ego",
    scores: "Puntuaciones de estados del ego",
    strengths: "Fortalezas",
    risks: "A tener en cuenta",
    advice: "Consejo de crecimiento",
    affirmation: "Afirmación de hoy",
    restart: "Repetir test",
    share: "Compartir resultado",
    copied: "¡Enlace copiado!",
    note: "Este test se basa en la teoría del análisis transaccional y está pensado como una referencia para el autoconocimiento.",
  },
};

function getProfile(scores: Record<EgoState, number>): ProfileKey {
  const max = Math.max(...EGO_STATES.map((s) => scores[s]));
  const dominants = EGO_STATES.filter((s) => scores[s] === max);
  if (dominants.length >= 3) return "balanced";
  const diff = max - Math.min(...EGO_STATES.map((s) => scores[s]));
  if (diff <= 2) return "balanced";
  return `${dominants[0]}_dominant` as ProfileKey;
}

export default function EgogramTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const t = ui[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ProfileKey | null>(null);
  useRecordFinishedTest({ testId: "egogram", title: "EgogramTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eg = params.get("eg") as ProfileKey | null;
    if (eg && eg in profiles) setResult(eg);
  }, []);

  function pick(score: number) {
    const next = answers.slice(0, idx);
    next[idx] = score;
    if (next.length < questions.length) {
      setAnswers(next);
      setTimeout(() => setIdx(next.length), 280);
    } else {
      const scores: Record<EgoState, number> = { CP: 0, NP: 0, A: 0, FC: 0, AC: 0 };
      questions.forEach((q, i) => { scores[q.state] += next[i]; });
      const profileKey = getProfile(scores);
      setAnswers(next);
      setResult(profileKey);
      const url = new URL(window.location.href);
      url.searchParams.set("eg", profileKey);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function previous() {
    if (idx === 0) return;
    setIdx(idx - 1);
  }

  function restart() {
    setIdx(0);
    setAnswers([]);
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("eg");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: t.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (result) {
    const p = profiles[result];
    const scores: Record<EgoState, number> = { CP: 0, NP: 0, A: 0, FC: 0, AC: 0 };
    questions.forEach((q, i) => { scores[q.state] += answers[i] ?? 0; });

    const radarData = EGO_STATES.map((s) => ({
      subject: stateInfo[s][locale].name.split("(")[0].trim(),
      value: scores[s],
      fullMark: 8,
    }));

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{t.resultTitle}</h1>
          <div className="inline-block px-4 py-2 rounded-full text-white font-semibold text-lg"
            style={{ backgroundColor: stateInfo[p.dominant][locale].color }}>
            {p.title[locale]}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm">{t.scores}</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar name="score" dataKey="value" stroke="#5B915F"
                fill="#5B915F" fillOpacity={0.4} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-5 gap-1 mt-2">
            {EGO_STATES.map((s) => (
              <div key={s} className="text-center">
                <div className="text-xs font-semibold" style={{ color: stateInfo[s][locale].color }}>{s}</div>
                <div className="text-lg font-bold text-gray-800">{scores[s]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-gray-200 rounded-xl p-5 space-y-4">
          <p className="text-gray-700 leading-relaxed">{p.description[locale]}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-surface-subtle rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✓ {t.strengths}</h3>
              <ul className="space-y-1">
                {p.strengths[locale].map((s, i) => (
                  <li key={i} className="text-sm text-green-700">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">⚠ {t.risks}</h3>
              <ul className="space-y-1">
                {p.risks[locale].map((r, i) => (
                  <li key={i} className="text-sm text-red-700">• {r}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-1">💡 {t.advice}</h3>
            <p className="text-sm text-blue-700">{p.advice[locale]}</p>
          </div>

          <div className="bg-surface-subtle rounded-lg p-4 text-center">
            <p className="text-sm text-green-600 italic">"{p.affirmation[locale]}"</p>
            <p className="text-xs text-green-400 mt-1">{t.affirmation}</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">{t.note}</p>

        <ShareResultButton
          locale={locale}
          heading={t.resultTitle}
          emoji="🎭"
          resultTitle={p.title[locale]}
          description={radarData.map(d => `${d.subject} ${d.value}/8`).join(' · ')}
        />

        <div className="flex gap-3 justify-center">
          <button onClick={restart}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors text-sm">
            {t.restart}
          </button>
          <button onClick={share}
            className="px-5 py-2 bg-green-600 hover:bg-primary text-primary-foreground rounded-full font-medium transition-colors text-sm">
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
      options={scaleLabels[locale].map((label, i) => ({ label, value: i }))}
      selectedValue={answers[idx]}
      note={t.scale}
      previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
      onPrevious={idx > 0 ? previous : undefined}
      onSelect={pick}
    />
  );
}
