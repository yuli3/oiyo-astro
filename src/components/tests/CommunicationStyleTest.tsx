import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
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

type CommStyle = "assertive" | "aggressive" | "passive" | "passive_aggressive" | "analytical";

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
    scores: Partial<Record<CommStyle, number>>;
  }[];
}

const questions: Question[] = [
  {
    ko: "회의에서 당신의 의견이 무시당했습니다. 어떻게 반응하십니까?",
    en: "Your idea was ignored in a meeting. How do you respond?",
    ja: "会議であなたの意見が無視されました。どう反応しますか？",
    zh: "在会议中，你的意见被忽视了。你会如何回应？",
    fr: "Votre idée a été ignorée en réunion. Comment réagissez-vous ?",
    es: "Tu idea fue ignorada en una reunión. ¿Cómo respondes?",
    options: [
      { ko: "직접적으로 '제 의견도 고려해주셨으면 합니다'라고 말한다", en: "Directly say 'I'd appreciate if my idea was considered'", ja: "直接的に「私の意見も考慮してほしい」と言う", zh: "直接说“也希望大家考虑一下我的意见”", fr: "Dire directement : « J'aimerais que mon idée soit aussi prise en compte »", es: "Decir directamente: «Me gustaría que también se considerara mi idea»", scores: { assertive: 2 } },
      { ko: "목소리를 높이거나 강하게 주장해 관심을 끈다", en: "Raise my voice or push strongly to get attention", ja: "声を大きくするか強く主張して注目を集める", zh: "提高音量或强势坚持来引起注意", fr: "Hausser le ton ou insister fortement pour attirer l'attention", es: "Alzar la voz o insistir con fuerza para llamar la atención", scores: { aggressive: 2 } },
      { ko: "그냥 넘어가고 다음 기회를 기다린다", en: "Let it go and wait for the next chance", ja: "そのまま流して次の機会を待つ", zh: "算了，等待下一次机会", fr: "Laisser passer et attendre la prochaine occasion", es: "Dejarlo pasar y esperar la próxima oportunidad", scores: { passive: 2 } },
      { ko: "겉으론 괜찮은 척하지만 나중에 협력을 줄인다", en: "Appear fine but reduce cooperation later", ja: "表面上は平気なふりをするが後で協力を減らす", zh: "表面装作没事，但之后减少配合", fr: "Faire comme si tout allait bien, puis coopérer moins ensuite", es: "Aparentar que está bien, pero colaborar menos después", scores: { passive_aggressive: 2 } },
      { ko: "왜 무시당했는지 데이터와 논리로 분석한다", en: "Analyze logically why the idea was overlooked", ja: "なぜ無視されたかをデータと論理で分析する", zh: "用数据和逻辑分析为什么被忽视", fr: "Analyser avec logique pourquoi l'idée a été ignorée", es: "Analizar con lógica por qué se pasó por alto la idea", scores: { analytical: 2 } },
    ],
  },
  {
    ko: "친구가 약속 시간에 30분 늦었습니다. 당신은?",
    en: "A friend is 30 minutes late. What do you do?",
    ja: "友人が約束の時間に30分遅刻しました。あなたは？",
    zh: "朋友约会迟到了30分钟。你会怎么做？",
    fr: "Un ami a 30 minutes de retard. Que faites-vous ?",
    es: "Un amigo llega 30 minutos tarde. ¿Qué haces?",
    options: [
      { ko: "'늦으면 미리 알려줬으면 좋겠어'라고 솔직히 말한다", en: "Honestly say 'I'd like a heads-up when you're running late'", ja: "「遅れるなら事前に知らせてほしい」と正直に伝える", zh: "坦诚地说“如果会迟到，希望你提前告诉我”", fr: "Dire franchement : « J'aimerais être prévenu quand tu es en retard »", es: "Decir con honestidad: «Me gustaría que avisaras si vas a llegar tarde»", scores: { assertive: 2 } },
      { ko: "짜증난 티를 내며 잔소리한다", en: "Show irritation and lecture them", ja: "イライラを見せて小言を言う", zh: "表现出不耐烦并开始数落对方", fr: "Montrer mon irritation et lui faire la leçon", es: "Mostrar irritación y darle un sermón", scores: { aggressive: 2 } },
      { ko: "괜찮다고 하면서 속으로 삭인다", en: "Say it's fine while suppressing feelings inside", ja: "大丈夫と言いながら心の中で我慢する", zh: "说没关系，但把情绪压在心里", fr: "Dire que ce n'est pas grave tout en gardant mes sentiments pour moi", es: "Decir que no pasa nada mientras me lo guardo por dentro", scores: { passive: 2 } },
      { ko: "말은 안 하지만 다음번엔 일부러 늦거나 자리를 피한다", en: "Say nothing but purposely arrive late or avoid them next time", ja: "何も言わないが次回は意図的に遅れたり避けたりする", zh: "什么也不说，但下次故意迟到或避开对方", fr: "Ne rien dire, mais arriver exprès en retard ou l'éviter la prochaine fois", es: "No decir nada, pero llegar tarde a propósito o evitarlo la próxima vez", scores: { passive_aggressive: 2 } },
      { ko: "교통 상황 등 맥락을 파악하고 패턴인지 확인한다", en: "Check the context (traffic etc.) and assess whether it's a pattern", ja: "交通状況などの文脈を把握し、パターンかどうか確認する", zh: "了解交通等背景，并判断这是否是惯常模式", fr: "Examiner le contexte, comme la circulation, et voir si c'est récurrent", es: "Revisar el contexto, como el tráfico, y ver si es un patrón", scores: { analytical: 2 } },
    ],
  },
  {
    ko: "상대방이 당신과 다른 의견을 강하게 주장할 때 당신은?",
    en: "Someone strongly asserts an opinion different from yours. You:",
    ja: "相手があなたとは異なる意見を強く主張するとき、あなたは？",
    zh: "当对方强烈坚持与你不同的意见时，你会？",
    fr: "Quelqu'un défend fermement une opinion différente de la vôtre. Vous :",
    es: "Alguien defiende con fuerza una opinión distinta a la tuya. Tú:",
    options: [
      { ko: "상대 의견을 인정하면서도 내 시각을 명확하게 제시한다", en: "Acknowledge their view while clearly presenting your own", ja: "相手の意見を認めつつ、自分の視点を明確に示す", zh: "认可对方观点，同时清楚表达自己的看法", fr: "Reconnaître son point de vue tout en présentant clairement le mien", es: "Reconocer su punto de vista y presentar claramente el mío", scores: { assertive: 2 } },
      { ko: "내 의견이 옳다고 더 강하게 밀어붙인다", en: "Push my opinion harder, asserting I'm right", ja: "自分の意見が正しいとより強く押し進める", zh: "更强硬地坚持自己的意见是对的", fr: "Insister encore plus en affirmant que j'ai raison", es: "Presionar más, afirmando que tengo razón", scores: { aggressive: 2 } },
      { ko: "갈등을 피하려 상대 의견에 동의해버린다", en: "Agree with them to avoid conflict", ja: "争いを避けるため相手の意見に同意してしまう", zh: "为了避免冲突，直接同意对方", fr: "Être d'accord avec lui pour éviter le conflit", es: "Estar de acuerdo para evitar el conflicto", scores: { passive: 2 } },
      { ko: "겉으로는 동의하지만 뒤에서 다른 행동을 한다", en: "Agree on the surface but act differently behind the scenes", ja: "表面上は同意するが裏では異なる行動をとる", zh: "表面同意，但背后采取不同做法", fr: "Être d'accord en apparence, mais agir autrement en coulisses", es: "Aceptar en apariencia, pero actuar distinto por detrás", scores: { passive_aggressive: 2 } },
      { ko: "근거를 요청하고 객관적으로 어느 쪽이 옳은지 따진다", en: "Ask for evidence and objectively determine who is correct", ja: "根拠を求め、客観的にどちらが正しいか議論する", zh: "要求依据，并客观判断哪一方更正确", fr: "Demander des preuves et déterminer objectivement qui a raison", es: "Pedir evidencias y determinar objetivamente quién tiene razón", scores: { analytical: 2 } },
    ],
  },
  {
    ko: "중요한 이메일을 쓸 때 당신의 스타일은?",
    en: "When writing an important email, your style is:",
    ja: "重要なメールを書くとき、あなたのスタイルは？",
    zh: "写重要邮件时，你的风格是？",
    fr: "Quand vous écrivez un e-mail important, votre style est :",
    es: "Cuando escribes un correo importante, tu estilo es:",
    options: [
      { ko: "명확하고 직접적으로, 원하는 것을 구체적으로 쓴다", en: "Clear and direct, specifically stating what you want", ja: "明確で直接的に、望むことを具体的に書く", zh: "清晰直接，具体写明自己想要什么", fr: "Clair et direct, en précisant concrètement ce que je veux", es: "Claro y directo, indicando específicamente lo que quiero", scores: { assertive: 2 } },
      { ko: "강경한 어조로 빠른 대응을 요구한다", en: "Use a firm tone demanding quick response", ja: "強硬なトーンで迅速な対応を求める", zh: "用强硬语气要求快速回应", fr: "Utiliser un ton ferme en exigeant une réponse rapide", es: "Usar un tono firme exigiendo una respuesta rápida", scores: { aggressive: 2 } },
      { ko: "정중하게 부탁하면서 불편을 드려 죄송하다고 한다", en: "Politely ask while apologizing for any inconvenience", ja: "丁寧にお願いしながらご不便をおかけして申し訳ないと言う", zh: "礼貌请求，并为可能造成的不便道歉", fr: "Demander poliment en m'excusant pour le dérangement", es: "Pedirlo con cortesía y disculparme por las molestias", scores: { passive: 2 } },
      { ko: "표면적으론 협력적이지만 애매한 표현을 써서 책임을 회피한다", en: "Appear cooperative but use vague language to avoid accountability", ja: "表面上は協力的だが曖昧な表現を使って責任を回避する", zh: "表面显得配合，但用含糊表达回避责任", fr: "Paraître coopératif, mais employer des formulations vagues pour éviter la responsabilité", es: "Parecer colaborativo, pero usar lenguaje ambiguo para evitar responsabilidad", scores: { passive_aggressive: 2 } },
      { ko: "배경 설명, 데이터, 결론 순서로 체계적으로 작성한다", en: "Write systematically: background, data, conclusion", ja: "背景説明、データ、結論の順で体系的に書く", zh: "按背景、数据、结论的顺序系统撰写", fr: "Rédiger de façon structurée : contexte, données, conclusion", es: "Escribir de forma sistemática: contexto, datos, conclusión", scores: { analytical: 2 } },
    ],
  },
  {
    ko: "팀원이 계속 같은 실수를 반복합니다. 당신은?",
    en: "A teammate keeps making the same mistake. You:",
    ja: "チームメンバーが同じミスを繰り返しています。あなたは？",
    zh: "团队成员不断重复同样的错误。你会？",
    fr: "Un membre de l'équipe répète la même erreur. Vous :",
    es: "Un compañero de equipo repite el mismo error. Tú:",
    options: [
      { ko: "조용히 불러서 '이 부분이 계속 문제가 되고 있어요'라고 말한다", en: "Call them aside and say 'this keeps becoming an issue'", ja: "こっそり呼んで「この部分が繰り返し問題になっています」と伝える", zh: "私下叫对方谈，说“这个部分一直在出问题”", fr: "Le prendre à part et dire : « Ce point devient régulièrement problématique »", es: "Hablar en privado y decir: «Esta parte sigue causando problemas»", scores: { assertive: 2 } },
      { ko: "회의에서 공개적으로 지적하거나 강하게 비판한다", en: "Publicly point it out in a meeting or criticize strongly", ja: "会議で公に指摘するか強く批判する", zh: "在会议上公开指出或严厉批评", fr: "Le signaler publiquement en réunion ou critiquer fortement", es: "Señalarlo públicamente en una reunión o criticarlo con dureza", scores: { aggressive: 2 } },
      { ko: "내가 대신 처리하거나 그냥 참는다", en: "Handle it myself or just put up with it", ja: "自分が代わりにやったり、ただ我慢する", zh: "自己代为处理，或者干脆忍着", fr: "M'en charger moi-même ou simplement prendre sur moi", es: "Encargarme yo mismo o simplemente aguantar", scores: { passive: 2 } },
      { ko: "그 사람이 관련된 프로젝트 참여를 은근히 줄인다", en: "Subtly reduce their involvement in related projects", ja: "その人が関わるプロジェクトへの参加をひそかに減らす", zh: "暗中减少对方参与相关项目的机会", fr: "Réduire discrètement sa participation aux projets concernés", es: "Reducir sutilmente su participación en proyectos relacionados", scores: { passive_aggressive: 2 } },
      { ko: "실수의 원인을 분석하고 개선 프로세스를 제안한다", en: "Analyze the root cause and propose an improvement process", ja: "ミスの原因を分析し、改善プロセスを提案する", zh: "分析错误根因，并提出改进流程", fr: "Analyser la cause profonde et proposer un processus d'amélioration", es: "Analizar la causa raíz y proponer un proceso de mejora", scores: { analytical: 2 } },
    ],
  },
  {
    ko: "상대방이 당신에게 불합리한 부탁을 했습니다. 당신은?",
    en: "Someone makes an unreasonable request of you. You:",
    ja: "相手があなたに不合理なお願いをしました。あなたは？",
    zh: "有人向你提出不合理的请求。你会？",
    fr: "Quelqu'un vous fait une demande déraisonnable. Vous :",
    es: "Alguien te hace una petición poco razonable. Tú:",
    options: [
      { ko: "명확하게 '그건 어렵습니다'라고 거절하면서 이유를 설명한다", en: "Clearly refuse: 'That's difficult,' and explain why", ja: "明確に「それは難しいです」と断りつつ理由を説明する", zh: "明确拒绝：“这有困难”，并说明原因", fr: "Refuser clairement : « Ce sera difficile », puis expliquer pourquoi", es: "Rechazar con claridad: «Eso es difícil», y explicar por qué", scores: { assertive: 2 } },
      { ko: "화를 내거나 상대를 비난한다", en: "Get angry or blame them", ja: "怒ったり相手を非難する", zh: "生气或责怪对方", fr: "Me mettre en colère ou lui faire des reproches", es: "Enojarme o culpar a la otra persona", scores: { aggressive: 2 } },
      { ko: "내키지 않아도 수락한다", en: "Accept even though I don't want to", ja: "気が進まなくても受け入れる", zh: "即使不情愿也接受", fr: "Accepter même si je n'en ai pas envie", es: "Aceptar aunque no quiera hacerlo", scores: { passive: 2 } },
      { ko: "수락하는 척하고 제대로 이행하지 않는다", en: "Pretend to accept but don't follow through", ja: "受け入れるふりをして適切に実行しない", zh: "假装接受，但不认真执行", fr: "Faire semblant d'accepter, mais ne pas vraiment aller au bout", es: "Fingir que acepto, pero no cumplir realmente", scores: { passive_aggressive: 2 } },
      { ko: "해당 부탁이 왜 불합리한지 논리적으로 분석하고 설명한다", en: "Logically analyze and explain why the request is unreasonable", ja: "なぜ不合理かを論理的に分析して説明する", zh: "逻辑分析并说明为什么这个请求不合理", fr: "Analyser logiquement et expliquer pourquoi la demande est déraisonnable", es: "Analizar con lógica y explicar por qué la petición no es razonable", scores: { analytical: 2 } },
    ],
  },
  {
    ko: "당신의 소통 방식에서 가장 중요하게 여기는 것은?",
    en: "What do you value most in your communication style?",
    ja: "あなたのコミュニケーションスタイルで最も重要視することは？",
    zh: "在你的沟通方式中，最重视的是什么？",
    fr: "Qu'est-ce qui compte le plus dans votre style de communication ?",
    es: "¿Qué valoras más en tu estilo de comunicación?",
    options: [
      { ko: "나도 존중받고 상대도 존중하는 상호성", en: "Mutual respect — both myself and the other person", ja: "自分も相手も尊重する相互性", zh: "我和对方都被尊重的相互性", fr: "Le respect mutuel, pour moi comme pour l'autre personne", es: "El respeto mutuo, tanto hacia mí como hacia la otra persona", scores: { assertive: 2 } },
      { ko: "내 의견을 분명하게 관철시키는 것", en: "Getting my point across clearly and firmly", ja: "自分の意見をはっきりと通すこと", zh: "清楚而坚定地表达并贯彻我的观点", fr: "Faire passer mon point de vue clairement et fermement", es: "Transmitir mi punto de vista con claridad y firmeza", scores: { aggressive: 2 } },
      { ko: "관계의 조화와 갈등 최소화", en: "Harmony in relationships and minimizing conflict", ja: "関係の調和と対立の最小化", zh: "关系和谐，并尽量减少冲突", fr: "L'harmonie relationnelle et la réduction des conflits", es: "La armonía en las relaciones y minimizar el conflicto", scores: { passive: 2 } },
      { ko: "겉으론 모르게 내가 원하는 방향으로 유도하기", en: "Guiding things my way without others knowing", ja: "表面上わからないように自分が望む方向に誘導すること", zh: "不露痕迹地把事情引向我想要的方向", fr: "Orienter les choses dans mon sens sans que cela se voie", es: "Guiar las cosas a mi manera sin que los demás lo noten", scores: { passive_aggressive: 2 } },
      { ko: "정확한 정보 전달과 논리적 설득", en: "Accurate information delivery and logical persuasion", ja: "正確な情報伝達と論理的説得", zh: "准确传达信息和进行逻辑说服", fr: "La transmission précise d'informations et la persuasion logique", es: "La transmisión precisa de información y la persuasión lógica", scores: { analytical: 2 } },
    ],
  },
];

const results: Record<
  CommStyle,
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
  assertive: {
    emoji: "🤝",
    color: "#10b981",
    ko: {
      title: "주장형 (Assertive)",
      description: "당신은 자신의 생각과 감정을 명확하게 표현하면서도 상대방을 존중합니다. 나 전달법(I-message)을 자연스럽게 사용하고, 갈등을 회피하지 않으면서도 공격적이지 않습니다. 이것이 가장 건강한 소통 방식입니다.",
      strength: "상호 존중, 신뢰 형성, 명확한 경계 설정, 갈등의 건설적 해결",
      weakness: "때로는 너무 직접적으로 느껴져 상대방이 당황할 수 있음",
      tip: "이미 훌륭한 소통 방식을 갖추고 있습니다. 상대방의 소통 스타일에 맞춰 유연하게 조정하는 법을 연습해보세요.",
    },
    en: {
      title: "Assertive",
      description: "You express your thoughts and feelings clearly while respecting others. You naturally use I-messages, neither avoiding conflict nor being aggressive. This is the healthiest communication style.",
      strength: "Mutual respect, trust-building, clear boundary-setting, constructive conflict resolution",
      weakness: "Sometimes can feel too direct, which may catch others off guard",
      tip: "You already have an excellent communication style. Practice adapting flexibly to others' communication styles.",
    },
    ja: {
      title: "主張型（アサーティブ）",
      description: "相手を尊重しながら自分の考えや感情を明確に表現します。Iメッセージを自然に使い、対立を避けることなく攻撃的でもありません。これが最も健全なコミュニケーション方法です。",
      strength: "相互尊重、信頼構築、明確な境界設定、建設的な対立解決",
      weakness: "時に直接的すぎると感じられ、相手を戸惑わせることがある",
      tip: "すでに優れたコミュニケーションスタイルを持っています。相手のコミュニケーションスタイルに合わせて柔軟に調整する方法を練習しましょう。",
    },
    zh: {
      title: "坚定表达型 (Assertive)",
      description: "你能清楚表达自己的想法和感受，同时尊重他人。你会自然地使用“我”信息，不逃避冲突，也不会带有攻击性。这是最健康的沟通方式。",
      strength: "相互尊重、建立信任、清晰设定边界、建设性解决冲突",
      weakness: "有时可能显得过于直接，让对方一时不知如何回应",
      tip: "你已经拥有很好的沟通风格。可以继续练习根据对方的沟通方式灵活调整表达。",
    },
    fr: {
      title: "Assertif",
      description: "Vous exprimez clairement vos pensées et vos émotions tout en respectant les autres. Vous utilisez naturellement les messages en « je », sans éviter le conflit ni devenir agressif. C'est le style de communication le plus sain.",
      strength: "Respect mutuel, construction de la confiance, limites claires, résolution constructive des conflits",
      weakness: "Peut parfois sembler trop direct et prendre les autres au dépourvu",
      tip: "Vous avez déjà un excellent style de communication. Entraînez-vous à l'adapter avec souplesse au style des autres.",
    },
    es: {
      title: "Asertivo",
      description: "Expresas tus pensamientos y sentimientos con claridad mientras respetas a los demás. Usas de forma natural los mensajes en primera persona, sin evitar el conflicto ni ser agresivo. Es el estilo de comunicación más saludable.",
      strength: "Respeto mutuo, construcción de confianza, límites claros, resolución constructiva de conflictos",
      weakness: "A veces puede parecer demasiado directo y tomar a otros por sorpresa",
      tip: "Ya tienes un excelente estilo de comunicación. Practica adaptarte con flexibilidad al estilo de comunicación de los demás.",
    },
  },
  aggressive: {
    emoji: "🔥",
    color: "#ef4444",
    ko: {
      title: "공격형 (Aggressive)",
      description: "당신은 자신의 의견을 강하게 표현하고 원하는 것을 얻어내는 데 능숙하지만, 때로는 상대방이 위협받거나 무시당한다고 느낄 수 있습니다. 단기적으로 목표를 달성할 수 있지만 장기적 관계에 영향을 줄 수 있습니다.",
      strength: "강한 자기주장, 목표 달성력, 리더십 잠재력",
      weakness: "관계 손상, 상대방의 방어적 반응 유발, 협력 저해",
      tip: "'이기기'가 목표가 아니라 '문제 해결'이 목표임을 기억하세요. 상대방의 관점을 먼저 인정하는 연습이 도움이 됩니다.",
    },
    en: {
      title: "Aggressive",
      description: "You're skilled at expressing your opinions forcefully and getting what you want, but others may sometimes feel threatened or dismissed. You can achieve goals short-term, but it may affect long-term relationships.",
      strength: "Strong self-assertion, goal achievement, leadership potential",
      weakness: "Relationship damage, triggering others' defensiveness, hindering cooperation",
      tip: "Remember the goal is 'problem solving,' not 'winning.' Practicing acknowledging the other person's perspective first can help.",
    },
    ja: {
      title: "攻撃型（アグレッシブ）",
      description: "自分の意見を強く表現し、欲しいものを得ることが得意ですが、相手が脅かされたり無視されたりと感じることがあります。短期的に目標を達成できますが、長期的な関係に影響を与える可能性があります。",
      strength: "強い自己主張、目標達成力、リーダーシップの潜在力",
      weakness: "関係の損傷、相手の防御的反応の誘発、協力の阻害",
      tip: "「勝つこと」ではなく「問題解決」が目標であることを覚えておきましょう。相手の視点をまず認める練習が役立ちます。",
    },
    zh: {
      title: "攻击型 (Aggressive)",
      description: "你擅长强烈表达自己的意见并争取想要的结果，但有时会让他人感到被威胁或被否定。短期内可能达成目标，却可能影响长期关系。",
      strength: "强烈的自我主张、目标达成力、领导潜力",
      weakness: "损害关系、引发他人的防御反应、阻碍合作",
      tip: "请记住，目标不是“赢”，而是“解决问题”。先承认对方的视角，会很有帮助。",
    },
    fr: {
      title: "Agressif",
      description: "Vous savez exprimer vos opinions avec force et obtenir ce que vous voulez, mais les autres peuvent parfois se sentir menacés ou ignorés. Cela peut atteindre des objectifs à court terme, mais nuire aux relations durables.",
      strength: "Forte affirmation de soi, capacité à atteindre les objectifs, potentiel de leadership",
      weakness: "Relations abîmées, réactions défensives chez les autres, coopération freinée",
      tip: "Rappelez-vous que l'objectif n'est pas de « gagner », mais de résoudre le problème. Commencer par reconnaître le point de vue de l'autre peut aider.",
    },
    es: {
      title: "Agresivo",
      description: "Eres hábil expresando tus opiniones con fuerza y obteniendo lo que quieres, pero a veces los demás pueden sentirse amenazados o ignorados. Puedes lograr objetivos a corto plazo, aunque esto afecte las relaciones a largo plazo.",
      strength: "Fuerte autoafirmación, capacidad para alcanzar metas, potencial de liderazgo",
      weakness: "Daño en las relaciones, respuestas defensivas de otros, dificultad para cooperar",
      tip: "Recuerda que el objetivo no es “ganar”, sino resolver el problema. Practicar reconocer primero la perspectiva de la otra persona puede ayudar.",
    },
  },
  passive: {
    emoji: "🌸",
    color: "#435D31",
    ko: {
      title: "수동형 (Passive)",
      description: "당신은 갈등을 피하고 관계의 조화를 중시합니다. 상대방의 필요를 자신보다 앞세우는 경향이 있으며, 속마음을 잘 드러내지 않습니다. 좋은 사람으로 여겨지지만 내면에 불만이 쌓일 수 있습니다.",
      strength: "공감 능력, 협력적 분위기 조성, 타인 배려",
      weakness: "자기 권리 포기, 내면 불만 축적, 결국 관계 피로",
      tip: "'노'라고 말하는 것은 이기적인 것이 아닙니다. '저는 ~할 때 불편합니다'처럼 감정을 표현하는 작은 연습부터 시작하세요.",
    },
    en: {
      title: "Passive",
      description: "You prioritize avoiding conflict and maintaining relational harmony. You tend to put others' needs before your own and rarely reveal your true feelings. Others see you as kind, but resentment may build inside.",
      strength: "Empathy, creating a cooperative atmosphere, consideration for others",
      weakness: "Surrendering your rights, accumulating internal resentment, eventual relationship fatigue",
      tip: "Saying 'no' isn't selfish. Start with small practice: expressing feelings like 'I feel uncomfortable when...'",
    },
    ja: {
      title: "受動型（パッシブ）",
      description: "対立を避け、関係の調和を重視します。相手のニーズを自分より優先させる傾向があり、本音を表に出しにくいです。良い人と見られますが、内面に不満が蓄積する可能性があります。",
      strength: "共感能力、協力的な雰囲気の醸成、他者への配慮",
      weakness: "自分の権利の放棄、内面の不満の蓄積、最終的な関係疲労",
      tip: "「ノー」と言うことは利己的ではありません。「私は〜のとき不快に感じます」のように感情を表現する小さな練習から始めましょう。",
    },
    zh: {
      title: "被动型 (Passive)",
      description: "你优先避免冲突并维持关系和谐。你倾向于把他人的需要放在自己之前，也很少表达真实感受。别人可能觉得你很好相处，但内心的不满可能逐渐累积。",
      strength: "共情能力、营造合作氛围、体贴他人",
      weakness: "放弃自己的权利、积累内在不满、最终导致关系疲惫",
      tip: "说“不”并不自私。可以从小练习开始，比如表达“当……时，我会感到不舒服”。",
    },
    fr: {
      title: "Passif",
      description: "Vous privilégiez l'évitement du conflit et l'harmonie relationnelle. Vous avez tendance à faire passer les besoins des autres avant les vôtres et à peu montrer vos vrais sentiments. Les autres vous voient comme gentil, mais le ressentiment peut s'accumuler.",
      strength: "Empathie, création d'une atmosphère coopérative, attention portée aux autres",
      weakness: "Renoncement à vos droits, ressentiment accumulé, fatigue relationnelle à long terme",
      tip: "Dire « non » n'est pas égoïste. Commencez par de petits exercices, comme exprimer : « Je me sens mal à l'aise quand... »",
    },
    es: {
      title: "Pasivo",
      description: "Priorizas evitar el conflicto y mantener la armonía en las relaciones. Tiendes a poner las necesidades de los demás por encima de las tuyas y rara vez muestras lo que sientes de verdad. Los demás pueden verte como amable, pero el resentimiento puede acumularse por dentro.",
      strength: "Empatía, creación de un ambiente cooperativo, consideración hacia los demás",
      weakness: "Renunciar a tus derechos, acumular resentimiento interno, cansancio relacional con el tiempo",
      tip: "Decir “no” no es egoísta. Empieza con pequeñas prácticas, como expresar: “Me siento incómodo cuando...”.",
    },
  },
  passive_aggressive: {
    emoji: "🌫️",
    color: "#f59e0b",
    ko: {
      title: "수동공격형 (Passive-Aggressive)",
      description: "당신은 직접적인 갈등을 피하면서도 불만을 간접적으로 표현합니다. 비꼬기, 지각, 말은 Yes 행동은 No 같은 패턴을 보일 수 있습니다. 이 방식은 관계에서 만성적인 긴장을 만들 수 있습니다.",
      strength: "공개적 갈등 회피, 감정 보호",
      weakness: "신뢰 손상, 관계의 만성적 긴장, 자신도 불만족스러운 상태",
      tip: "안전하다고 느끼는 환경에서 직접 표현해보세요. '화가 나지 않아'가 아니라 '~할 때 화가 났어'처럼 직접적으로 말하는 연습이 필요합니다.",
    },
    en: {
      title: "Passive-Aggressive",
      description: "You avoid direct conflict while expressing dissatisfaction indirectly. Patterns may include sarcasm, lateness, or saying 'yes' while doing 'no.' This style can create chronic tension in relationships.",
      strength: "Avoiding open conflict, protecting yourself emotionally",
      weakness: "Damaged trust, chronic relationship tension, personal dissatisfaction",
      tip: "Practice expressing directly in environments where you feel safe. Practice saying 'I got angry when...' instead of 'I'm not angry.'",
    },
    ja: {
      title: "受動攻撃型（パッシブアグレッシブ）",
      description: "直接的な対立を避けながら、不満を間接的に表現します。嫌味、遅刻、「はい」と言いながら「いいえ」の行動をするなどのパターンが見られます。このスタイルは関係に慢性的な緊張を生み出す可能性があります。",
      strength: "公開的な対立の回避、感情的自己保護",
      weakness: "信頼の損傷、関係の慢性的緊張、自己不満",
      tip: "安全だと感じる環境で直接表現してみましょう。「怒っていない」ではなく「〜したとき怒った」のように直接的に言う練習が必要です。",
    },
    zh: {
      title: "被动攻击型 (Passive-Aggressive)",
      description: "你会避免直接冲突，却以间接方式表达不满。可能出现讽刺、迟到，或嘴上说“Yes”行动却是“No”的模式。这种风格会在关系中制造长期紧张。",
      strength: "避免公开冲突、保护自己的情绪",
      weakness: "损害信任、关系长期紧张、自己也处于不满意状态",
      tip: "在让你感到安全的环境中练习直接表达。不要说“我没生气”，而是练习说“当……时，我生气了”。",
    },
    fr: {
      title: "Passif-agressif",
      description: "Vous évitez le conflit direct tout en exprimant votre insatisfaction de manière indirecte. Cela peut prendre la forme de sarcasme, de retards, ou d'un « oui » verbal accompagné d'un « non » dans les actes. Ce style peut créer une tension chronique dans les relations.",
      strength: "Évitement du conflit ouvert, protection émotionnelle",
      weakness: "Confiance abîmée, tension relationnelle chronique, insatisfaction personnelle",
      tip: "Entraînez-vous à vous exprimer directement dans les environnements où vous vous sentez en sécurité. Dites plutôt « Je me suis mis en colère quand... » que « Je ne suis pas en colère ».",
    },
    es: {
      title: "Pasivo-agresivo",
      description: "Evitas el conflicto directo mientras expresas la insatisfacción de forma indirecta. Puede aparecer como sarcasmo, retrasos, o decir “sí” mientras tus acciones dicen “no”. Este estilo puede crear tensión crónica en las relaciones.",
      strength: "Evitar el conflicto abierto, protegerte emocionalmente",
      weakness: "Confianza dañada, tensión crónica en las relaciones, insatisfacción personal",
      tip: "Practica expresarte directamente en entornos donde te sientas seguro. En lugar de “no estoy enojado”, prueba decir “me enojé cuando...”.",
    },
  },
  analytical: {
    emoji: "🔬",
    color: "#3b82f6",
    ko: {
      title: "분석형 (Analytical)",
      description: "당신은 데이터와 논리에 기반한 소통을 선호합니다. 감정보다 사실과 근거를 중시하며, 체계적이고 정확한 전달을 추구합니다. 문제 해결에 탁월하지만 감정적 연결이 부족하게 느껴질 수 있습니다.",
      strength: "명확한 논리, 오해 방지, 문제 해결 능력, 신뢰성",
      weakness: "감정적 연결 부족, 냉정하게 보일 수 있음, 인간적인 면이 가려질 수 있음",
      tip: "분석 앞에 감정 인정을 추가해보세요. '그것은 불합리합니다' 전에 '그 상황이 답답하셨겠네요'처럼 공감을 먼저 표현하면 훨씬 효과적입니다.",
    },
    en: {
      title: "Analytical",
      description: "You prefer communication based on data and logic. You value facts and evidence over emotions, pursuing systematic and accurate delivery. You're excellent at problem-solving but may come across as lacking emotional connection.",
      strength: "Clear logic, preventing misunderstandings, problem-solving ability, reliability",
      weakness: "Lack of emotional connection, can appear cold, human side may be hidden",
      tip: "Add emotional acknowledgment before analysis. Expressing empathy first — 'That must have been frustrating' before 'That's illogical' — is much more effective.",
    },
    ja: {
      title: "分析型（アナリティカル）",
      description: "データと論理に基づいたコミュニケーションを好みます。感情より事実と根拠を重視し、体系的で正確な伝達を追求します。問題解決に優れていますが、感情的なつながりが欠けていると感じられることがあります。",
      strength: "明確な論理、誤解の防止、問題解決能力、信頼性",
      weakness: "感情的なつながりの欠如、冷たく見える可能性、人間的な面が隠れる可能性",
      tip: "分析の前に感情的な承認を追加しましょう。「それは不合理です」の前に「その状況はもどかしかったですね」のように共感を先に表現するとはるかに効果的です。",
    },
    zh: {
      title: "分析型 (Analytical)",
      description: "你偏好基于数据和逻辑的沟通。相比情绪，你更重视事实和依据，并追求系统、准确地传达信息。你很擅长解决问题，但可能让人感觉缺少情感连接。",
      strength: "清晰逻辑、避免误解、解决问题能力、可靠性",
      weakness: "情感连接不足、可能显得冷淡、人性化的一面可能被遮住",
      tip: "在分析之前加入情绪认可。先表达共情，比如在说“这不合逻辑”之前说“那种情况一定很让人郁闷”，会更有效。",
    },
    fr: {
      title: "Analytique",
      description: "Vous préférez une communication fondée sur les données et la logique. Vous accordez plus d'importance aux faits et aux preuves qu'aux émotions, avec une transmission structurée et précise. Vous excellez dans la résolution de problèmes, mais pouvez sembler manquer de lien émotionnel.",
      strength: "Logique claire, prévention des malentendus, capacité de résolution de problèmes, fiabilité",
      weakness: "Manque de connexion émotionnelle, impression de froideur, dimension humaine parfois moins visible",
      tip: "Ajoutez une reconnaissance émotionnelle avant l'analyse. Dire d'abord « Cela a dû être frustrant » avant « Ce n'est pas logique » est bien plus efficace.",
    },
    es: {
      title: "Analítico",
      description: "Prefieres una comunicación basada en datos y lógica. Valoras los hechos y las evidencias por encima de las emociones, y buscas transmitir de manera sistemática y precisa. Eres muy bueno resolviendo problemas, pero puedes parecer poco conectado emocionalmente.",
      strength: "Lógica clara, prevención de malentendidos, capacidad para resolver problemas, fiabilidad",
      weakness: "Falta de conexión emocional, puede parecer frío, el lado humano puede quedar oculto",
      tip: "Añade reconocimiento emocional antes del análisis. Expresar empatía primero, como “eso debió ser frustrante”, antes de “eso no es lógico”, resulta mucho más efectivo.",
    },
  },
};

type UiText = {
  title: string;
  subtitle: string;
  progress: (cur: number, total: number) => string;
  resultTitle: string;
  strength: string;
  weakness: string;
  tip: string;
  scoreLabel: string;
  restart: string;
  share: string;
  copied: string;
};

const t: Record<SupportedLocale, UiText> = {
  ko: {
    title: "소통 스타일 테스트",
    subtitle: "당신은 어떻게 소통하십니까?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "나의 소통 스타일",
    strength: "강점",
    weakness: "약점",
    tip: "성장 팁",
    scoreLabel: "스타일별 점수",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Communication Style Test",
    subtitle: "How Do You Communicate?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Your Communication Style",
    strength: "Strengths",
    weakness: "Weaknesses",
    tip: "Growth Tip",
    scoreLabel: "Score by Style",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "コミュニケーションスタイルテスト",
    subtitle: "あなたはどのようにコミュニケーションをとりますか？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "あなたのコミュニケーションスタイル",
    strength: "強み",
    weakness: "弱点",
    tip: "成長のヒント",
    scoreLabel: "スタイル別スコア",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "沟通风格测试",
    subtitle: "你是如何沟通的？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "你的沟通风格",
    strength: "优势",
    weakness: "弱点",
    tip: "成长建议",
    scoreLabel: "各风格得分",
    restart: "重新开始",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test de style de communication",
    subtitle: "Comment communiquez-vous ?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Votre style de communication",
    strength: "Forces",
    weakness: "Faiblesses",
    tip: "Conseil de progression",
    scoreLabel: "Score par style",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de estilo de comunicación",
    subtitle: "¿Cómo te comunicas?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Tu estilo de comunicación",
    strength: "Fortalezas",
    weakness: "Debilidades",
    tip: "Consejo de crecimiento",
    scoreLabel: "Puntuación por estilo",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

export default function CommunicationStyleTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<CommStyle, number>>({
    assertive: 0,
    aggressive: 0,
    passive: 0,
    passive_aggressive: 0,
    analytical: 0,
  });
  const [result, setResult] = useState<CommStyle | null>(null);
  useRecordFinishedTest({ testId: "communication-style", title: "CommunicationStyleTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const cs = p.get("cs") as CommStyle | null;
    if (cs && results[cs]) setResult(cs);
  }, []);



  function finalize(s: Record<CommStyle, number>) {
    setScores(s);
    const winner = (Object.keys(s) as CommStyle[]).reduce((a, b) => s[a] >= s[b] ? a : b);
    setResult(winner);
    const url = new URL(window.location.href);
    url.searchParams.set("cs", winner);
    window.history.replaceState({}, "", url.toString());
  }

  function handlePick(opt: Question["options"][number]) {
    const next = { ...scores };
    for (const [k, v] of Object.entries(opt.scores)) {
      next[k as CommStyle] = (next[k as CommStyle] ?? 0) + (v ?? 0);
    }
    const newIdx = idx + 1;
    if (newIdx < questions.length) {
      setScores(next);
      setTimeout(() => setIdx(newIdx), 280);
    } else {
      finalize(next);
    }
  }

  function restart() {
    setIdx(0);
    setScores({ assertive: 0, aggressive: 0, passive: 0, passive_aggressive: 0, analytical: 0 });
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("cs");
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

  const styleLabels: Record<CommStyle, string> = {
    assertive: locale === "ko" ? "주장형" : locale === "ja" ? "主張型" : locale === "zh" ? "坚定表达型" : locale === "fr" ? "Assertif" : locale === "es" ? "Asertivo" : "Assertive",
    aggressive: locale === "ko" ? "공격형" : locale === "ja" ? "攻撃型" : locale === "zh" ? "攻击型" : locale === "fr" ? "Agressif" : locale === "es" ? "Agresivo" : "Aggressive",
    passive: locale === "ko" ? "수동형" : locale === "ja" ? "受動型" : locale === "zh" ? "被动型" : locale === "fr" ? "Passif" : locale === "es" ? "Pasivo" : "Passive",
    passive_aggressive: locale === "ko" ? "수동공격형" : locale === "ja" ? "受動攻撃型" : locale === "zh" ? "被动攻击型" : locale === "fr" ? "Passif-agressif" : locale === "es" ? "Pasivo-agresivo" : "Passive-Agg.",
    analytical: locale === "ko" ? "분석형" : locale === "ja" ? "分析型" : locale === "zh" ? "分析型" : locale === "fr" ? "Analytique" : locale === "es" ? "Analítico" : "Analytical",
  };

  if (result) {
    const r = results[result];
    const rd = r[locale];
    const radarData = (Object.keys(scores) as CommStyle[]).map((k) => ({
      subject: styleLabels[k],
      score: scores[k],
      fullMark: questions.length,
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
          <h3 className="mb-4 font-semibold text-gray-700">{tx.scoreLabel}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar
                dataKey="score"
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
            className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-medium text-white transition hover:bg-green-700"
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
    <Questionnaire
      title={tx.title}
      subtitle={tx.subtitle}
      question={q[locale]}
      questionLabel={tx.progress(idx + 1, questions.length)}
      progress={(idx / questions.length) * 100}
      options={q.options.map((opt, optionIndex) => ({ label: opt[locale], value: optionIndex + 1 }))}
      onSelect={(value) => handlePick(q.options[value - 1])}
    />
  );
}
