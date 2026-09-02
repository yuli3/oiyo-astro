import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from "@/components/ui/questionnaire";
import ShareResultButton from '../shared/ShareResultButton'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type BoundaryStyle = "porous" | "rigid" | "flexible" | "contextual" | "empathic";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  options: {
    ko: string;
    en: string;
    ja: string;
    zh: string;
    fr: string;
    es: string;
    scores: Partial<Record<BoundaryStyle, number>>;
  }[];
}

const questions: Question[] = [
  {
    ko: "친한 친구가 갑자기 도움을 요청할 때 당신은?",
    en: "A close friend suddenly asks for help. You:",
    ja: "親しい友人が突然助けを求めてきたとき、あなたは？",
    zh: "亲近的朋友突然向你求助时，你会？",
    fr: "Un ami proche vous demande soudain de l'aide. Vous :",
    es: "Un amigo cercano te pide ayuda de repente. Tú:",
    options: [
      { ko: "거절하는 게 어려워 힘들어도 대부분 들어준다", en: "Find it hard to refuse and usually help even when it's difficult", ja: "断るのが難しく、辛くても大体引き受ける", zh: "很难拒绝，即使自己吃力也大多会答应", fr: "J'ai du mal à refuser et j'aide souvent, même quand c'est difficile", es: "Me cuesta negarme y suelo ayudar aunque me resulte difícil", scores: { porous: 2 } },
      { ko: "내 일정과 에너지 상태를 보고 가능하면 한다고 말한다", en: "Check my schedule and energy and say I can if possible", ja: "自分のスケジュールとエネルギー状態を見て、可能なら手伝うと言う", zh: "先看自己的日程和精力，如果可以就答应", fr: "Je vérifie mon emploi du temps et mon énergie, puis j'accepte si possible", es: "Reviso mi horario y mi energía, y digo que puedo si es posible", scores: { flexible: 2, contextual: 1 } },
      { ko: "사전에 약속하지 않은 건 원칙적으로 거절한다", en: "Principally refuse anything not pre-arranged", ja: "事前に約束していないことは原則的に断る", zh: "原则上拒绝没有提前约好的事", fr: "Je refuse par principe ce qui n'a pas été prévu à l'avance", es: "Por principio rechazo lo que no se acordó con anticipación", scores: { rigid: 2 } },
      { ko: "어떤 친구냐에 따라 다르다 — 가까운 정도에 따라 판단한다", en: "Depends on which friend — I judge based on how close we are", ja: "どの友人かによる — 親密さの程度によって判断する", zh: "要看是哪位朋友——我会根据亲近程度判断", fr: "Cela dépend de l'ami : je juge selon notre degré de proximité", es: "Depende de qué amigo sea: decido según lo cercanos que seamos", scores: { contextual: 2, flexible: 1 } },
      { ko: "친구가 힘들 것 같아 내 상황이 어렵더라도 먼저 나선다", en: "Sense my friend is struggling and step up even if it's hard for me", ja: "友人が大変そうだと感じて、自分が辛くても先に動く", zh: "觉得朋友很难受，即使自己也不容易也会先伸手帮忙", fr: "Je sens que mon ami va mal et je me mobilise, même si c'est dur pour moi", es: "Siento que mi amigo lo está pasando mal y doy un paso al frente aunque me cueste", scores: { empathic: 2, porous: 1 } },
    ],
  },
  {
    ko: "누군가 당신의 개인 정보나 사생활에 대해 물어볼 때?",
    en: "When someone asks about your personal life or private information:",
    ja: "誰かがあなたの個人情報やプライバシーについて聞いてきたとき？",
    zh: "当有人询问你的个人生活或隐私信息时：",
    fr: "Quand quelqu'un vous interroge sur votre vie personnelle ou des informations privées :",
    es: "Cuando alguien pregunta por tu vida personal o información privada:",
    options: [
      { ko: "불편해도 자세히 답하는 편이다 — 거절이 불편하다", en: "Answer in detail even if uncomfortable — refusal feels awkward", ja: "不快でも詳しく答える方 — 断ることが不快", zh: "即使不舒服也会详细回答——拒绝让我尴尬", fr: "Je réponds en détail même si je suis mal à l'aise ; refuser me gêne", es: "Respondo con detalle aunque me incomode; negarme se siente incómodo", scores: { porous: 2 } },
      { ko: "나누고 싶은 만큼만 공유하고 편안하게 선을 긋는다", en: "Share only what I want to and comfortably draw the line", ja: "共有したい分だけ共有して、気楽に一線を引く", zh: "只分享自己愿意说的部分，并自然地划清界限", fr: "Je partage seulement ce que je souhaite et je pose la limite sereinement", es: "Comparto solo lo que quiero y marco el límite con comodidad", scores: { flexible: 2 } },
      { ko: "사생활은 거의 공유하지 않는다 — 모르는 게 낫다고 생각한다", en: "Rarely share private info — I think it's better they don't know", ja: "プライバシーはほとんど共有しない — 知らない方がいいと思う", zh: "很少分享隐私——我觉得对方不知道更好", fr: "Je partage rarement ma vie privée ; je préfère qu'on ne sache pas", es: "Casi no comparto información privada; creo que es mejor que no lo sepan", scores: { rigid: 2 } },
      { ko: "관계와 상황에 따라 다르게 대응한다", en: "Respond differently depending on the relationship and situation", ja: "関係性と状況によって異なる対応をする", zh: "会根据关系和情境采取不同回应", fr: "Je réponds différemment selon la relation et la situation", es: "Respondo de forma distinta según la relación y la situación", scores: { contextual: 2 } },
      { ko: "상대가 왜 궁금한지 이해하려고 하고, 그 감정에 맞게 반응한다", en: "Try to understand why they're curious and respond to their feelings", ja: "相手がなぜ気になるのか理解しようとして、その感情に合わせて反応する", zh: "会试着理解对方为什么好奇，并照顾对方的感受来回应", fr: "J'essaie de comprendre pourquoi la personne est curieuse et je réponds à son ressenti", es: "Intento entender por qué tiene curiosidad y respondo teniendo en cuenta sus emociones", scores: { empathic: 2 } },
    ],
  },
  {
    ko: "직장이나 학교에서 내가 원하지 않는 역할을 맡게 됐을 때?",
    en: "You're assigned a role at work or school that you don't want:",
    ja: "職場や学校で望まない役割を任されたとき？",
    zh: "在工作或学校中被分配到你不想承担的角色时：",
    fr: "On vous confie au travail ou à l'école un rôle que vous ne voulez pas :",
    es: "Te asignan en el trabajo o la escuela un rol que no quieres:",
    options: [
      { ko: "싫어도 거절하지 못하고 맡는다", en: "Don't want it but can't refuse and take it on", ja: "嫌でも断れず引き受ける", zh: "虽然不愿意，但无法拒绝，只好接下这个角色", fr: "Je n'en ai pas envie, mais je n'arrive pas à refuser et j'accepte", es: "No lo quiero, pero no puedo negarme y lo acepto", scores: { porous: 2 } },
      { ko: "솔직하게 이유를 말하고 재조율을 요청한다", en: "Honestly explain my reasons and request a re-arrangement", ja: "正直に理由を伝えて再調整をお願いする", zh: "坦诚说明理由，并请求重新协调", fr: "J'explique honnêtement mes raisons et je demande un réajustement", es: "Explico honestamente mis razones y pido reorganizarlo", scores: { flexible: 2 } },
      { ko: "내 역할 범위를 분명히 하고 그 이상은 하지 않는다", en: "Clearly define my role scope and won't do anything beyond it", ja: "自分の役割範囲を明確にして、それ以上はしない", zh: "明确自己的职责范围，不做超出范围的事", fr: "Je définis clairement le périmètre de mon rôle et je ne vais pas au-delà", es: "Defino claramente el alcance de mi rol y no hago más que eso", scores: { rigid: 2 } },
      { ko: "상황과 기회에 따라 수락 여부를 판단한다", en: "Decide whether to accept based on circumstances and opportunity", ja: "状況と機会に応じて受け入れるかどうか判断する", zh: "根据情境和机会判断是否接受", fr: "Je décide d'accepter ou non selon le contexte et l'occasion", es: "Decido si aceptar según las circunstancias y la oportunidad", scores: { contextual: 2 } },
      { ko: "팀에게 필요한 일이면 내가 희생할 수 있다고 생각한다", en: "Think I can sacrifice myself if it's what the team needs", ja: "チームに必要なことなら自分が犠牲になれると思う", zh: "如果这是团队需要的事，我觉得自己可以牺牲一下", fr: "Si l'équipe en a besoin, je pense pouvoir me sacrifier", es: "Si es lo que el equipo necesita, pienso que puedo sacrificarme", scores: { empathic: 2, porous: 1 } },
    ],
  },
  {
    ko: "연인이나 가족이 당신에게 감정적으로 크게 의존할 때?",
    en: "A partner or family member relies on you heavily for emotional support:",
    ja: "恋人や家族が感情的に大きくあなたに依存するとき？",
    zh: "伴侣或家人在情感上高度依赖你时：",
    fr: "Un partenaire ou un membre de votre famille dépend fortement de vous sur le plan émotionnel :",
    es: "Una pareja o familiar depende mucho de ti para recibir apoyo emocional:",
    options: [
      { ko: "내가 지치더라도 버팀목이 되어주려 한다", en: "Try to be their pillar even if it exhausts me", ja: "自分が疲れても支えになろうとする", zh: "即使自己很累，也会努力成为对方的支撑", fr: "J'essaie d'être son pilier, même si cela m'épuise", es: "Intento ser su apoyo aunque eso me agote", scores: { porous: 2, empathic: 1 } },
      { ko: "내가 줄 수 있는 것과 없는 것을 솔직하게 이야기한다", en: "Honestly talk about what I can and cannot give", ja: "自分が与えられることと与えられないことを正直に話す", zh: "坦诚说明自己能给什么、不能给什么", fr: "Je parle honnêtement de ce que je peux donner et de ce que je ne peux pas donner", es: "Hablo honestamente de lo que puedo y no puedo dar", scores: { flexible: 2 } },
      { ko: "과도한 의존은 관계에 좋지 않다고 거리를 둔다", en: "Keep distance, believing excessive dependence isn't good for the relationship", ja: "過度な依存は関係に良くないと距離を置く", zh: "认为过度依赖不利于关系，所以会保持距离", fr: "Je prends de la distance, car je pense qu'une dépendance excessive nuit à la relation", es: "Tomo distancia porque creo que la dependencia excesiva no es buena para la relación", scores: { rigid: 2 } },
      { ko: "시기와 상황에 따라 수용 정도를 조절한다", en: "Adjust how much I accept depending on timing and circumstances", ja: "時期と状況に応じて受け入れる程度を調整する", zh: "根据时机和具体情况调整自己能接纳的程度", fr: "J'ajuste ce que j'accepte selon le moment et les circonstances", es: "Ajusto cuánto acepto según el momento y las circunstancias", scores: { contextual: 2 } },
      { ko: "상대의 고통이 내 고통으로 느껴져 함께 힘들어진다", en: "Their pain feels like my pain and I struggle alongside them", ja: "相手の苦しみが自分の苦しみのように感じられ、一緒に辛くなる", zh: "对方的痛苦像是我的痛苦，我也会一起难受", fr: "Sa douleur ressemble à la mienne, et je souffre avec lui ou elle", es: "Su dolor se siente como el mío y sufro junto a esa persona", scores: { empathic: 2, porous: 1 } },
    ],
  },
  {
    ko: "혼자만의 시간(충전 시간)이 필요할 때 당신은?",
    en: "When you need alone time to recharge:",
    ja: "一人だけの時間（充電時間）が必要なとき、あなたは？",
    zh: "当你需要独处时间来恢复能量时：",
    fr: "Quand vous avez besoin de temps seul pour recharger vos batteries :",
    es: "Cuando necesitas tiempo a solas para recargar energía:",
    options: [
      { ko: "다른 사람이 필요로 하면 내 시간을 포기하는 편이다", en: "Tend to give up my time if someone else needs me", ja: "他の人が必要とするなら自分の時間を諦める方だ", zh: "如果别人需要我，我往往会放弃自己的时间", fr: "J'ai tendance à renoncer à mon temps si quelqu'un a besoin de moi", es: "Tiendo a renunciar a mi tiempo si alguien me necesita", scores: { porous: 2 } },
      { ko: "이 시간이 필요하다고 말하고 확보한다", en: "Say I need this time and secure it", ja: "この時間が必要だと伝えて確保する", zh: "说明我需要这段时间，并把它留出来", fr: "Je dis que j'ai besoin de ce temps et je le protège", es: "Digo que necesito ese tiempo y lo aseguro", scores: { flexible: 2 } },
      { ko: "혼자 있는 시간을 지키기 위해 강하게 선을 긋는다", en: "Draw firm lines to protect my alone time", ja: "一人でいる時間を守るために強く一線を引く", zh: "为了保护独处时间，会坚定地划清界限", fr: "Je pose des limites fermes pour protéger mon temps seul", es: "Marco límites firmes para proteger mi tiempo a solas", scores: { rigid: 2 } },
      { ko: "상황에 따라 다르다 — 꼭 필요한 때만 요청한다", en: "Depends on the situation — I only ask when truly necessary", ja: "状況による — 本当に必要なときだけお願いする", zh: "视情况而定——只有真正需要时才会提出", fr: "Cela dépend de la situation ; je ne le demande que lorsque c'est vraiment nécessaire", es: "Depende de la situación; solo lo pido cuando es realmente necesario", scores: { contextual: 2 } },
      { ko: "주변 사람들이 괜찮다면 혼자 있는 시간을 갖는다", en: "Take alone time only if the people around me are okay", ja: "周りの人が大丈夫なら一人の時間を持つ", zh: "如果身边的人都没问题，我才会安排独处时间", fr: "Je prends du temps seul seulement si les personnes autour de moi vont bien", es: "Tomo tiempo a solas solo si las personas a mi alrededor están bien", scores: { empathic: 2, porous: 1 } },
    ],
  },
  {
    ko: "누군가 당신의 가치관과 다른 행동을 반복할 때?",
    en: "Someone repeatedly behaves in ways that conflict with your values:",
    ja: "誰かがあなたの価値観と異なる行動を繰り返すとき？",
    zh: "当某人反复做出与你价值观冲突的行为时：",
    fr: "Quelqu'un agit de façon répétée à l'encontre de vos valeurs :",
    es: "Alguien se comporta repetidamente de formas que chocan con tus valores:",
    options: [
      { ko: "불편하지만 직접적으로 말하지 못하고 참는다", en: "Feel uncomfortable but can't say anything directly and endure", ja: "不快だが直接言えず我慢する", zh: "感到不舒服，但说不出口，只能忍着", fr: "Je suis mal à l'aise, mais je n'arrive pas à le dire directement et je prends sur moi", es: "Me incomoda, pero no puedo decirlo directamente y lo aguanto", scores: { porous: 2 } },
      { ko: "나의 가치관을 명확히 전달하고 변화를 요청한다", en: "Clearly communicate my values and request change", ja: "自分の価値観を明確に伝えて変化を求める", zh: "清楚表达自己的价值观，并请求对方做出改变", fr: "J'exprime clairement mes valeurs et je demande un changement", es: "Comunico claramente mis valores y pido un cambio", scores: { flexible: 2 } },
      { ko: "그런 사람과는 관계를 줄이거나 끊는다", en: "Reduce or end the relationship with such a person", ja: "そのような人とは関係を減らすか断ち切る", zh: "会减少或结束与这种人的关系", fr: "Je réduis ou je mets fin à la relation avec ce type de personne", es: "Reduzco o termino la relación con una persona así", scores: { rigid: 2 } },
      { ko: "어떤 관계냐에 따라 대응 방법을 다르게 한다", en: "Respond differently depending on what kind of relationship it is", ja: "どのような関係かによって対応方法を変える", zh: "根据这是什么关系来调整应对方式", fr: "Je réagis différemment selon le type de relation", es: "Respondo de forma distinta según el tipo de relación", scores: { contextual: 2 } },
      { ko: "왜 그렇게 하는지 이해하려 노력하며 판단을 유보한다", en: "Try to understand why they act that way and reserve judgment", ja: "なぜそうするのか理解しようと努め、判断を保留する", zh: "会努力理解对方为什么这样做，并暂缓评判", fr: "J'essaie de comprendre pourquoi la personne agit ainsi et je suspends mon jugement", es: "Intento entender por qué actúa así y dejo el juicio en pausa", scores: { empathic: 2 } },
    ],
  },
];

const results: Record<
  BoundaryStyle,
  {
    emoji: string;
    color: string;
    ko: { title: string; description: string; strength: string; weakness: string; tip: string };
    en: { title: string; description: string; strength: string; weakness: string; tip: string };
    ja: { title: string; description: string; strength: string; weakness: string; tip: string };
    zh: { title: string; description: string; strength: string; weakness: string; tip: string };
    fr: { title: string; description: string; strength: string; weakness: string; tip: string };
    es: { title: string; description: string; strength: string; weakness: string; tip: string };
  }
> = {
  porous: {
    emoji: "🌊",
    color: "#60a5fa",
    ko: {
      title: "경계 희박형",
      description: "당신은 타인의 필요와 감정을 내 것처럼 느끼며, 경계를 긋는 것이 불편합니다. 거절하는 것을 두려워하고, 결국 자신의 에너지를 과도하게 소진하는 경향이 있습니다. 관계에서 깊은 연결을 원하지만, 자기 자신을 잃어버릴 위험이 있습니다.",
      strength: "공감 능력 뛰어남, 관계에서 높은 헌신도, 타인의 필요에 민감",
      weakness: "번아웃 위험 높음, 자기 필요 무시, 관계에서 착취당할 수 있음",
      tip: "거절은 관계를 끊는 것이 아니라 관계를 지속 가능하게 만드는 것입니다. '이번엔 안 돼' 한 마디를 연습하세요. 당신이 잘 돌봐져야 타인도 잘 도울 수 있습니다.",
    },
    en: {
      title: "Porous Boundaries",
      description: "You feel others' needs and emotions as your own and find it uncomfortable to set limits. You fear saying no and tend to excessively drain your own energy. You want deep connection in relationships but risk losing yourself.",
      strength: "Excellent empathy, high dedication in relationships, sensitive to others' needs",
      weakness: "High burnout risk, neglect of own needs, vulnerable to exploitation in relationships",
      tip: "Saying no isn't ending a relationship — it's making it sustainable. Practice saying 'not this time.' You can only help others well when you're well cared for yourself.",
    },
    ja: {
      title: "境界希薄型",
      description: "他者のニーズと感情を自分のものとして感じ、境界を引くことが不快です。断ることを恐れ、最終的に自分のエネルギーを過度に消耗する傾向があります。関係で深いつながりを望みますが、自分自身を失うリスクがあります。",
      strength: "共感能力に優れる、関係における高い献身度、他者のニーズに敏感",
      weakness: "バーンアウトリスクが高い、自分のニーズを無視、関係で搾取される可能性",
      tip: "断ることは関係を断ち切ることではなく、関係を持続可能にすることです。「今回はダメ」という一言を練習しましょう。自分がよく世話されてこそ、他者もよく助けられます。",
    },
    zh: {
      title: "边界稀薄型",
      description: "你会把他人的需要和情绪感受得像自己的事一样，也会觉得划清界限很不自在。你害怕说不，容易过度消耗自己的能量。你渴望关系中的深度连接，但也有失去自我的风险。",
      strength: "共情能力出色，在关系中投入度高，对他人的需要敏感",
      weakness: "倦怠风险高，忽视自己的需要，可能在关系中被过度索取",
      tip: "拒绝并不是切断关系，而是让关系更可持续。练习说一句“这次不行”。只有你自己被好好照顾，才能更好地帮助别人。",
    },
    fr: {
      title: "Limites poreuses",
      description: "Vous ressentez les besoins et les émotions des autres comme s'ils étaient les vôtres, et poser une limite vous met mal à l'aise. Vous craignez de dire non et vous avez tendance à épuiser votre propre énergie. Vous recherchez des liens profonds, mais vous risquez de vous perdre dans la relation.",
      strength: "Grande empathie, fort engagement dans les relations, sensibilité aux besoins des autres",
      weakness: "Risque élevé d'épuisement, oubli de vos propres besoins, vulnérabilité à l'exploitation relationnelle",
      tip: "Dire non ne met pas fin à une relation ; cela la rend durable. Entraînez-vous à dire « pas cette fois ». Vous aidez mieux les autres lorsque vous prenez aussi soin de vous.",
    },
    es: {
      title: "Límites porosos",
      description: "Sientes las necesidades y emociones de los demás como si fueran tuyas, y te resulta incómodo poner límites. Temes decir que no y tiendes a agotar demasiado tu propia energía. Quieres una conexión profunda en las relaciones, pero corres el riesgo de perderte a ti mismo.",
      strength: "Excelente empatía, alta dedicación en las relaciones, sensibilidad a las necesidades de los demás",
      weakness: "Alto riesgo de agotamiento, descuido de tus propias necesidades, vulnerabilidad a ser aprovechado en las relaciones",
      tip: "Decir que no no termina una relación; la vuelve sostenible. Practica decir “esta vez no”. Solo puedes ayudar bien a otros cuando tú también estás bien cuidado.",
    },
  },
  rigid: {
    emoji: "🧱",
    color: "#64748b",
    ko: {
      title: "경계 강직형",
      description: "당신은 명확하고 강한 경계를 유지합니다. 자신의 공간과 에너지를 철저히 보호하지만, 때로는 친밀감과 취약성을 허용하기 어렵습니다. 독립성이 강점이지만, 깊은 연결이 필요할 때 벽이 될 수 있습니다.",
      strength: "명확한 자기 보호, 소진 없는 에너지 관리, 조종 당하지 않음",
      weakness: "친밀감 형성 어려움, 취약성 허용 어려움, 지나치게 거리감 있어 보일 수 있음",
      tip: "안전한 관계에서 작은 취약성을 허용해보세요. 경계는 필요하지만, 가끔은 낮은 담장이 더 좋은 이웃을 만듭니다. 신뢰를 쌓아가며 경계를 조금씩 유연하게 해보세요.",
    },
    en: {
      title: "Rigid Boundaries",
      description: "You maintain clear, firm limits. You thoroughly protect your space and energy, but sometimes find it hard to allow closeness and vulnerability. Independence is a strength, but limits can become walls when deep connection is needed.",
      strength: "Clear self-protection, energy management without burnout, not easily manipulated",
      weakness: "Difficulty forming intimacy, hard to allow vulnerability, may appear too distant",
      tip: "Allow small vulnerabilities in safe relationships. Limits are necessary, but occasionally a lower fence makes for better neighbors. Build trust gradually and allow limits to become a little more flexible.",
    },
    ja: {
      title: "境界強直型",
      description: "明確で強い境界を維持します。自分のスペースとエネルギーを徹底的に守りますが、時に親密さや脆弱性を許すことが難しいです。独立性が強みですが、深いつながりが必要なときに壁になる可能性があります。",
      strength: "明確な自己保護、消耗のないエネルギー管理、操られにくい",
      weakness: "親密さの形成が難しい、脆弱性を許すのが難しい、距離感があると見られることも",
      tip: "安全な関係で小さな脆弱性を許してみましょう。境界は必要ですが、時には低い塀の方が良い隣人を作ります。信頼を積み重ねながら境界を少しずつ柔軟にしてみましょう。",
    },
    zh: {
      title: "边界僵硬型",
      description: "你会保持清晰而坚定的界限。你很重视保护自己的空间和能量，但有时也较难允许亲密和脆弱。独立性是你的优势，不过在需要深度连接时，界限也可能变成一堵墙。",
      strength: "清晰的自我保护，不易耗竭的能量管理，不容易被操控",
      weakness: "较难建立亲密感，难以允许脆弱，可能显得距离感过强",
      tip: "可以在安全的关系中允许一点小小的脆弱。界限是必要的，但有时低一些的围栏更容易带来好邻居。试着在建立信任的过程中，让界限一点点变得更有弹性。",
    },
    fr: {
      title: "Limites rigides",
      description: "Vous maintenez des limites claires et fermes. Vous protégez fortement votre espace et votre énergie, mais vous pouvez avoir du mal à laisser place à l'intimité et à la vulnérabilité. Votre indépendance est une force, mais vos limites peuvent devenir des murs quand un lien profond est nécessaire.",
      strength: "Protection de soi claire, gestion de l'énergie sans épuisement, faible vulnérabilité à la manipulation",
      weakness: "Difficulté à créer de l'intimité, difficulté à accepter la vulnérabilité, impression possible de distance excessive",
      tip: "Autorisez de petites vulnérabilités dans les relations sûres. Les limites sont nécessaires, mais une clôture plus basse fait parfois de meilleurs voisins. Construisez la confiance peu à peu et laissez vos limites gagner en souplesse.",
    },
    es: {
      title: "Límites rígidos",
      description: "Mantienes límites claros y firmes. Proteges muy bien tu espacio y tu energía, pero a veces te cuesta permitir la cercanía y la vulnerabilidad. La independencia es una fortaleza, aunque los límites pueden convertirse en muros cuando se necesita una conexión profunda.",
      strength: "Autoprotección clara, gestión de energía sin agotamiento, poca facilidad para ser manipulado",
      weakness: "Dificultad para formar intimidad, dificultad para permitir vulnerabilidad, puede parecer demasiada distancia",
      tip: "Permite pequeñas vulnerabilidades en relaciones seguras. Los límites son necesarios, pero a veces una cerca más baja crea mejores vecinos. Construye confianza poco a poco y deja que tus límites se vuelvan algo más flexibles.",
    },
  },
  flexible: {
    emoji: "🌿",
    color: "#10b981",
    ko: {
      title: "유연 경계형",
      description: "당신은 상황에 맞게 자신의 필요를 표현하고, 타인의 요청에도 합리적으로 반응합니다. '아니오'와 '예스' 사이에서 자신의 가치와 에너지를 기준으로 판단합니다. 건강한 경계를 가진 가장 균형 잡힌 유형입니다.",
      strength: "자기 존중과 타인 배려의 균형, 소통 능력 탁월, 관계 지속 가능성 높음",
      weakness: "항상 유지하기 위한 에너지 필요, 상황 판단이 복잡할 수 있음",
      tip: "현재의 방식을 유지하세요. 경계를 긋는 것이 자연스럽고 편안하다는 것 자체가 큰 강점입니다. 다만, 피로할 때 경계가 흐려지지 않도록 자기 상태를 꾸준히 점검하세요.",
    },
    en: {
      title: "Flexible Boundaries",
      description: "You express your needs appropriately for each situation and respond reasonably to others' requests. You judge between 'no' and 'yes' based on your values and energy. This is the most balanced type with healthy limits.",
      strength: "Balance of self-respect and consideration for others, excellent communication, high relationship sustainability",
      weakness: "Requires energy to maintain consistently, situational judgment can be complex",
      tip: "Keep doing what you're doing. The fact that setting limits feels natural and comfortable is itself a great strength. Just regularly check your state so limits don't blur when you're tired.",
    },
    ja: {
      title: "柔軟境界型",
      description: "状況に合わせて自分のニーズを表現し、他者の要求にも合理的に反応します。「ノー」と「イエス」の間で、自分の価値観とエネルギーを基準に判断します。健全な境界を持つ最もバランスのとれた類型です。",
      strength: "自己尊重と他者への配慮のバランス、コミュニケーション能力が優れている、関係の持続可能性が高い",
      weakness: "維持するためのエネルギーが必要、状況判断が複雑になることも",
      tip: "現在のやり方を続けてください。境界を引くことが自然で快適であること自体が大きな強みです。ただ、疲れているときに境界が曖昧にならないよう、自分の状態を定期的にチェックしましょう。",
    },
    zh: {
      title: "灵活边界型",
      description: "你能根据情境表达自己的需要，也能合理回应他人的请求。你会在“不”和“可以”之间，以自己的价值观和能量为标准做判断。这是拥有健康界限的最均衡类型。",
      strength: "自我尊重与体贴他人的平衡，沟通能力出色，关系可持续性高",
      weakness: "需要持续投入精力来维持，情境判断有时会很复杂",
      tip: "请保持现在的方式。能自然、舒服地划定界限，本身就是很大的优势。只是要定期检查自己的状态，避免在疲惫时界限变得模糊。",
    },
    fr: {
      title: "Limites flexibles",
      description: "Vous exprimez vos besoins selon la situation et vous répondez raisonnablement aux demandes des autres. Entre « non » et « oui », vous décidez à partir de vos valeurs et de votre énergie. C'est le type le plus équilibré, avec des limites saines.",
      strength: "Équilibre entre respect de soi et considération des autres, excellente communication, forte durabilité relationnelle",
      weakness: "Demande de l'énergie pour rester constant, le jugement situationnel peut être complexe",
      tip: "Continuez dans cette voie. Le fait que poser des limites vous semble naturel et confortable est déjà une grande force. Vérifiez simplement votre état régulièrement pour éviter que vos limites ne deviennent floues quand vous êtes fatigué.",
    },
    es: {
      title: "Límites flexibles",
      description: "Expresas tus necesidades de forma adecuada según la situación y respondes razonablemente a las peticiones de los demás. Entre el “no” y el “sí”, decides según tus valores y tu energía. Es el tipo más equilibrado, con límites saludables.",
      strength: "Equilibrio entre respeto propio y consideración por los demás, excelente comunicación, alta sostenibilidad en las relaciones",
      weakness: "Requiere energía para mantenerse de forma constante, el juicio situacional puede ser complejo",
      tip: "Sigue con tu forma actual. Que poner límites se sienta natural y cómodo ya es una gran fortaleza. Solo revisa regularmente cómo estás para que tus límites no se vuelvan difusos cuando estés cansado.",
    },
  },
  contextual: {
    emoji: "🎭",
    color: "#f59e0b",
    ko: {
      title: "상황 맥락형",
      description: "당신의 경계는 관계와 상황에 따라 달라집니다. 직장 동료에게는 명확한 경계를 유지하면서 가족에게는 열려있거나 그 반대일 수 있습니다. 유연성이 강점이지만, 일관성이 부족할 때 관계에서 혼란을 줄 수 있습니다.",
      strength: "상황 적응력 탁월, 다양한 관계 유형 관리 능숙, 세심한 상황 판단",
      weakness: "일관성 부족으로 혼란 가능, 복잡한 판단으로 인한 에너지 소모, 타인이 예측하기 어려울 수 있음",
      tip: "핵심 가치에 기반한 '불변의 경계'를 한두 가지 정해보세요. 상황에 따라 유연하되, 기본이 되는 원칙이 있으면 관계에서 더 일관된 신뢰를 줄 수 있습니다.",
    },
    en: {
      title: "Contextual Boundaries",
      description: "Your limits vary by relationship and situation. You might maintain clear limits with coworkers while being open with family, or vice versa. Flexibility is a strength, but lack of consistency can cause confusion in relationships.",
      strength: "Excellent situational adaptability, skilled at managing diverse relationship types, nuanced situational judgment",
      weakness: "Possible confusion from inconsistency, energy drain from complex judgment, may be hard for others to predict",
      tip: "Define one or two 'unchanging limits' based on core values. Being flexible by situation is fine, but having foundational principles allows others to trust you more consistently.",
    },
    ja: {
      title: "状況文脈型",
      description: "境界は関係性と状況によって変わります。職場の同僚には明確な境界を維持しながら家族には開放的だったり、その逆だったりします。柔軟性が強みですが、一貫性が欠けると関係で混乱を招く可能性があります。",
      strength: "状況適応力に優れる、多様な関係タイプの管理が上手、細やかな状況判断",
      weakness: "一貫性の欠如による混乱の可能性、複雑な判断によるエネルギー消耗、他者が予測しにくいことも",
      tip: "核心的な価値観に基づいた「不変の境界」を一つか二つ決めてみましょう。状況によって柔軟であっても、基本となる原則があれば、関係においてより一貫した信頼を与えられます。",
    },
    zh: {
      title: "情境边界型",
      description: "你的界限会随着关系和情境而变化。你可能对同事保持清晰边界，却对家人更加开放，或正好相反。灵活性是你的优势，但如果缺少一致性，也可能让关系中的人感到困惑。",
      strength: "情境适应力出色，善于管理不同类型的关系，判断细腻",
      weakness: "可能因缺乏一致性而造成混乱，复杂判断会消耗能量，别人可能难以预测你的反应",
      tip: "试着基于核心价值，确定一两个“不变的界限”。根据情境保持灵活没有问题，但如果有基本原则，关系中会更容易建立稳定的信任。",
    },
    fr: {
      title: "Limites contextuelles",
      description: "Vos limites changent selon la relation et la situation. Vous pouvez garder des limites claires avec des collègues tout en étant plus ouvert avec la famille, ou l'inverse. La flexibilité est une force, mais le manque de constance peut créer de la confusion dans les relations.",
      strength: "Excellente adaptation aux situations, aisance avec différents types de relations, jugement nuancé du contexte",
      weakness: "Confusion possible liée à l'inconstance, fatigue due aux décisions complexes, réactions parfois difficiles à prévoir",
      tip: "Définissez une ou deux « limites non négociables » fondées sur vos valeurs essentielles. Être flexible selon la situation est utile, mais des principes de base donnent aux autres une confiance plus stable.",
    },
    es: {
      title: "Límites contextuales",
      description: "Tus límites cambian según la relación y la situación. Puedes mantener límites claros con compañeros de trabajo y ser más abierto con la familia, o al revés. La flexibilidad es una fortaleza, pero la falta de consistencia puede generar confusión en las relaciones.",
      strength: "Excelente adaptación situacional, habilidad para manejar distintos tipos de relación, juicio contextual matizado",
      weakness: "Posible confusión por inconsistencia, desgaste por decisiones complejas, puede ser difícil para otros predecirte",
      tip: "Define uno o dos “límites no negociables” basados en tus valores centrales. Ser flexible según la situación está bien, pero tener principios de base permite que los demás confíen en ti con más constancia.",
    },
  },
  empathic: {
    emoji: "💚",
    color: "#435D31",
    ko: {
      title: "공감 경계형",
      description: "당신은 타인의 감정에 깊이 공감하며 그들의 상태를 기준으로 경계를 설정합니다. 상대가 힘들면 내 경계도 낮아지고, 상대가 괜찮으면 자기를 챙깁니다. 높은 공감력이 강점이지만, 공감에 의해 경계가 결정되면 자기 필요가 일관되게 충족되지 않을 수 있습니다.",
      strength: "깊은 공감과 정서적 민감성, 타인의 상태를 빠르게 파악함, 관계에서 깊은 신뢰 형성",
      weakness: "공감 피로(Empathy Fatigue) 위험, 자기 필요의 비일관적 충족, 감정적 조종에 취약할 수 있음",
      tip: "공감은 당신의 선물이지만, 공감에 의해 경계가 완전히 결정되면 지칩니다. '공감하지만 지금 내가 도울 수 없어'라는 것도 정직한 반응입니다. 자기 필요를 타인과 동등하게 대우하는 연습을 해보세요.",
    },
    en: {
      title: "Empathic Boundary-Setter",
      description: "You deeply empathize with others and set limits based on their state. When they struggle, your limits lower; when they're fine, you take care of yourself. High empathy is a strength, but when limits are entirely determined by empathy, your own needs may not be consistently met.",
      strength: "Deep empathy and emotional sensitivity, quick to read others' states, builds deep trust in relationships",
      weakness: "Risk of empathy fatigue, inconsistent fulfillment of own needs, potentially vulnerable to emotional manipulation",
      tip: "Empathy is your gift, but letting empathy entirely determine your limits will exhaust you. 'I empathize, but I can't help right now' is also an honest response. Practice treating your own needs as equal to others'.",
    },
    ja: {
      title: "共感境界型",
      description: "他者の感情に深く共感し、その状態を基準に境界を設定します。相手が辛いと自分の境界も低くなり、相手が大丈夫なら自分を大切にします。高い共感力が強みですが、共感によって境界が完全に決まると自分のニーズが一貫して満たされないことがあります。",
      strength: "深い共感と感情的敏感さ、他者の状態を素早く把握、関係での深い信頼形成",
      weakness: "共感疲労リスク、自分のニーズの不一致な充足、感情的操作に弱い可能性",
      tip: "共感はあなたの贈り物ですが、共感によって境界が完全に決まると疲弊します。「共感するけど今は助けられない」というのも正直な反応です。自分のニーズを他者と同等に扱う練習をしてみましょう。",
    },
    zh: {
      title: "共情边界型",
      description: "你会深深共情他人的感受，并根据对方的状态来设定界限。对方痛苦时，你的界限会降低；对方还好时，你才更能照顾自己。高度共情是优势，但如果界限完全由共情决定，你自己的需要可能无法稳定得到满足。",
      strength: "深度共情和情绪敏感度，能快速读懂他人的状态，在关系中建立深层信任",
      weakness: "有共情疲劳(Empathy Fatigue)风险，自己的需要满足不稳定，可能容易受到情绪操控",
      tip: "共情是你的礼物，但如果界限完全由共情决定，你会被耗尽。“我理解你，但现在我帮不了”也是诚实的回应。练习把自己的需要和他人的需要放在同等位置。",
    },
    fr: {
      title: "Limites empathiques",
      description: "Vous ressentez profondément les émotions des autres et vous posez vos limites à partir de leur état. Quand l'autre souffre, vos limites baissent ; quand l'autre va bien, vous prenez soin de vous. Une forte empathie est une force, mais si elle décide entièrement de vos limites, vos propres besoins risquent de ne pas être satisfaits de façon régulière.",
      strength: "Empathie profonde et sensibilité émotionnelle, lecture rapide de l'état des autres, création d'une confiance forte dans les relations",
      weakness: "Risque de fatigue empathique (Empathy Fatigue), satisfaction irrégulière de vos propres besoins, vulnérabilité possible à la manipulation émotionnelle",
      tip: "L'empathie est un don, mais si elle décide entièrement de vos limites, elle vous épuisera. « Je comprends, mais je ne peux pas aider maintenant » est aussi une réponse honnête. Entraînez-vous à traiter vos besoins comme égaux à ceux des autres.",
    },
    es: {
      title: "Límites empáticos",
      description: "Empatizas profundamente con las emociones de los demás y estableces límites según su estado. Cuando la otra persona sufre, tus límites bajan; cuando está bien, cuidas más de ti. La alta empatía es una fortaleza, pero si tus límites dependen por completo de ella, tus propias necesidades pueden no cubrirse de forma constante.",
      strength: "Empatía profunda y sensibilidad emocional, rapidez para leer el estado de otros, construcción de confianza profunda en las relaciones",
      weakness: "Riesgo de fatiga por empatía (Empathy Fatigue), satisfacción irregular de tus propias necesidades, posible vulnerabilidad a la manipulación emocional",
      tip: "La empatía es tu don, pero dejar que determine por completo tus límites te agotará. “Empatizo contigo, pero ahora no puedo ayudar” también es una respuesta honesta. Practica tratar tus necesidades como igual de importantes que las de los demás.",
    },
  },
};

const t = {
  ko: {
    title: "경계 설정 스타일 테스트",
    subtitle: "나는 어떻게 경계를 긋는가?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "나의 경계 설정 스타일",
    strength: "강점",
    weakness: "약점",
    tip: "성장 팁",
    radarLabel: "스타일별 경향",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Boundary Style Test",
    subtitle: "How Do You Set Limits?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Your Boundary Style",
    strength: "Strengths",
    weakness: "Weaknesses",
    tip: "Growth Tip",
    radarLabel: "Tendencies by Style",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "境界設定スタイルテスト",
    subtitle: "あなたはどのように境界を引きますか？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "あなたの境界設定スタイル",
    strength: "強み",
    weakness: "弱点",
    tip: "成長のヒント",
    radarLabel: "スタイル別の傾向",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "边界风格测试",
    subtitle: "你会如何设定界限？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "你的边界设定风格",
    strength: "优势",
    weakness: "弱点",
    tip: "成长建议",
    radarLabel: "各风格倾向",
    restart: "重新开始",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test du style de limites",
    subtitle: "Comment posez-vous vos limites ?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Votre style de limites",
    strength: "Forces",
    weakness: "Points faibles",
    tip: "Conseil de croissance",
    radarLabel: "Tendances par style",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de estilo de límites",
    subtitle: "¿Cómo estableces límites?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Tu estilo de límites",
    strength: "Fortalezas",
    weakness: "Debilidades",
    tip: "Consejo de crecimiento",
    radarLabel: "Tendencias por estilo",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

export default function BoundaryStyleTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<BoundaryStyle, number>>({
    porous: 0,
    rigid: 0,
    flexible: 0,
    contextual: 0,
    empathic: 0,
  });
  const [answered, setAnswered] = useState(0);
  const [result, setResult] = useState<BoundaryStyle | null>(null);
  useRecordFinishedTest({ testId: "boundary-style", title: "BoundaryStyleTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const bs = p.get("bs") as BoundaryStyle | null;
    if (bs && results[bs]) setResult(bs);
  }, []);

  function pick(partialScores: Partial<Record<BoundaryStyle, number>>) {
    const next = { ...scores };
    for (const [k, v] of Object.entries(partialScores)) {
      next[k as BoundaryStyle] = (next[k as BoundaryStyle] ?? 0) + (v ?? 0);
    }
    const nextAnswered = answered + 1;

    if (nextAnswered < questions.length) {
      setScores(next);
      setAnswered(nextAnswered);
      setTimeout(() => setIdx(nextAnswered), 280);
    } else {
      setScores(next);
      setAnswered(nextAnswered);
      const winner = (Object.keys(next) as BoundaryStyle[]).reduce((a, b) =>
        next[a] >= next[b] ? a : b
      );
      setResult(winner);
      const url = new URL(window.location.href);
      url.searchParams.set("bs", winner);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0);
    setAnswered(0);
    setScores({ porous: 0, rigid: 0, flexible: 0, contextual: 0, empathic: 0 });
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("bs");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: tx.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const styleLabels: Record<BoundaryStyle, string> = {
    porous: locale === "ko" ? "희박형" : locale === "ja" ? "希薄型" : locale === "zh" ? "稀薄型" : locale === "fr" ? "Poreux" : locale === "es" ? "Poroso" : "Porous",
    rigid: locale === "ko" ? "강직형" : locale === "ja" ? "強直型" : locale === "zh" ? "僵硬型" : locale === "fr" ? "Rigide" : locale === "es" ? "Rígido" : "Rigid",
    flexible: locale === "ko" ? "유연형" : locale === "ja" ? "柔軟型" : locale === "zh" ? "灵活型" : locale === "fr" ? "Flexible" : locale === "es" ? "Flexible" : "Flexible",
    contextual: locale === "ko" ? "맥락형" : locale === "ja" ? "文脈型" : locale === "zh" ? "情境型" : locale === "fr" ? "Contextuel" : locale === "es" ? "Contextual" : "Contextual",
    empathic: locale === "ko" ? "공감형" : locale === "ja" ? "共感型" : locale === "zh" ? "共情型" : locale === "fr" ? "Empathique" : locale === "es" ? "Empático" : "Empathic",
  };

  if (result) {
    const r = results[result];
    const rd = r[locale];
    const maxScore = Math.max(...Object.values(scores), 1);
    const radarData = (Object.keys(scores) as BoundaryStyle[]).map((k) => ({
      style: styleLabels[k],
      value: Math.round((scores[k] / maxScore) * 100),
      fullMark: 100,
    }));

    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-50 p-6 text-center">
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{r.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{rd.title}</h2>
          <p className="mt-3 text-gray-600">{rd.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-green-700">✅ {tx.strength}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.strength}</p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-600">⚠️ {tx.weakness}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.weakness}</p>
          </div>
          <div className="rounded-lg bg-surface-subtle p-4">
            <h3 className="font-semibold text-green-700">💡 {tx.tip}</h3>
            <p className="mt-1 text-sm text-green-800">{rd.tip}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm">
          <h3 className="mb-2 font-semibold text-gray-700">{tx.radarLabel}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="style" tick={{ fontSize: 12 }} />
              <Radar
                name="score"
                dataKey="value"
                stroke={r.color}
                fill={r.color}
                fillOpacity={0.3}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {tx.restart}
          </button>
          <button
            onClick={share}
            className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary"
          >
            {copied ? tx.copied : tx.share}
          </button>
        </div>
        <ShareResultButton locale={localeProp ?? 'ko'} heading={tx.title} resultTitle={rd.title} emoji={r.emoji} />
      </div>
    );
  }

  const q = questions[idx];

  return (
    <Questionnaire<number>
      title={tx.title}
      subtitle={tx.subtitle}
      question={q[locale]}
      questionLabel={tx.progress(idx + 1, questions.length)}
      progress={Math.round((idx / questions.length) * 100)}
      options={q.options.map((opt, i) => ({ label: opt[locale], value: i + 1 }))}
      onSelect={(value) => pick(q.options[value - 1].scores)}
    />
  );
}
