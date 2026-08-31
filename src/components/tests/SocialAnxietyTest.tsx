import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { ScreeningQuestionnaire } from '@/components/ui/screening-questionnaire';
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import RelatedReading from '../shared/RelatedReading';

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type AnxietyLevel = "minimal" | "mild" | "moderate" | "severe";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
}

const questions: Question[] = [
  { ko: "낯선 사람들이 많은 모임에 가는 것이 두렵다", en: "I feel afraid of attending gatherings with many strangers", ja: "見知らぬ人が多い集まりに行くことが怖い", zh: "我害怕参加有很多陌生人的聚会", fr: "J'ai peur d'aller à des rassemblements où il y a beaucoup d'inconnus", es: "Me da miedo asistir a reuniones con muchas personas desconocidas" },
  { ko: "다른 사람들 앞에서 말하거나 발표할 때 극도로 긴장한다", en: "I get extremely nervous speaking or presenting in front of others", ja: "人前で話したり発表したりするとき極度に緊張する", zh: "在别人面前说话或做展示时，我会极度紧张", fr: "Je deviens extrêmement nerveux quand je parle ou présente devant les autres", es: "Me pongo extremadamente nervioso al hablar o presentar frente a otras personas" },
  { ko: "사람들이 나를 판단하거나 비판할까봐 걱정된다", en: "I worry that people will judge or criticize me", ja: "人が私を判断したり批判したりすることを心配する", zh: "我担心别人会评判或批评我", fr: "Je crains que les autres me jugent ou me critiquent", es: "Me preocupa que la gente me juzgue o me critique" },
  { ko: "새로운 사람을 만날 때 어색함이나 불안을 느낀다", en: "I feel awkward or anxious when meeting new people", ja: "新しい人に会うとき、ぎこちなさや不安を感じる", zh: "认识新朋友时，我会感到尴尬或不安", fr: "Je me sens mal à l'aise ou anxieux quand je rencontre de nouvelles personnes", es: "Me siento incómodo o ansioso cuando conozco gente nueva" },
  { ko: "내가 무언가 창피한 행동을 할까봐 두렵다", en: "I fear I'll do something embarrassing", ja: "恥ずかしいことをしてしまうのではないかと怖い", zh: "我害怕自己会做出尴尬的举动", fr: "J'ai peur de faire quelque chose d'embarrassant", es: "Temo hacer algo vergonzoso" },
  { ko: "파티나 사교 모임을 피하는 경향이 있다", en: "I tend to avoid parties or social gatherings", ja: "パーティーや社交的な集まりを避ける傾向がある", zh: "我倾向于回避派对或社交聚会", fr: "J'ai tendance à éviter les fêtes ou les rencontres sociales", es: "Tiendo a evitar fiestas o reuniones sociales" },
  { ko: "전화통화보다 문자나 이메일을 훨씬 선호한다", en: "I strongly prefer texting or email over phone calls", ja: "電話よりもテキストやメールをはるかに好む", zh: "相比打电话，我更强烈地偏好短信或电子邮件", fr: "Je préfère nettement les messages ou les e-mails aux appels téléphoniques", es: "Prefiero claramente los mensajes de texto o el correo electrónico a las llamadas telefónicas" },
  { ko: "식당에서 주문하거나 점원과 말하는 것이 불편하다", en: "I feel uncomfortable ordering at a restaurant or talking to staff", ja: "レストランで注文したり店員と話したりするのが不快だ", zh: "在餐厅点餐或和店员说话时，我会感到不自在", fr: "Je me sens mal à l'aise quand je commande au restaurant ou parle au personnel", es: "Me siento incómodo al pedir en un restaurante o hablar con el personal" },
  { ko: "사람들이 있는 곳에서 식사하거나 글씨 쓰는 것이 불편하다", en: "I feel uncomfortable eating or writing with people watching", ja: "人がいる場所で食事したり字を書いたりするのが不快だ", zh: "有人看着时吃饭或写字，我会感到不自在", fr: "Je me sens mal à l'aise de manger ou d'écrire quand des gens me regardent", es: "Me siento incómodo al comer o escribir cuando otras personas me miran" },
  { ko: "사회적 상황에서 홍조, 떨림, 발한 등 신체 증상이 나타난다", en: "I experience physical symptoms (blushing, trembling, sweating) in social situations", ja: "社会的状況で紅潮、震え、発汗などの身体症状が現れる", zh: "在社交场合中，我会出现脸红、发抖、出汗等身体症状", fr: "Dans les situations sociales, j'ai des symptômes physiques comme rougir, trembler ou transpirer", es: "En situaciones sociales tengo síntomas físicos como rubor, temblores o sudoración" },
  { ko: "대화 중 무슨 말을 해야 할지 몰라 침묵이 두렵다", en: "I fear silences in conversation because I don't know what to say", ja: "会話中に何を言えばいいかわからず、沈黙が怖い", zh: "谈话中因为不知道该说什么，我会害怕沉默", fr: "Je redoute les silences dans une conversation parce que je ne sais pas quoi dire", es: "Temo los silencios en una conversación porque no sé qué decir" },
  { ko: "사교적 상황 전에 미리 걱정하거나 뒤에 반추하는 경향이 있다", en: "I tend to worry beforehand and ruminate after social situations", ja: "社会的状況の前に心配し、後に反芻する傾向がある", zh: "在社交场合前我会提前担心，事后也容易反复回想", fr: "J'ai tendance à m'inquiéter avant les situations sociales et à les ressasser ensuite", es: "Tiendo a preocuparme antes de las situaciones sociales y a darles vueltas después" },
];

const LEVELS: Record<AnxietyLevel, {
  emoji: string;
  color: string;
  scoreRange: string;
  ko: { title: string; description: string; impact: string; action: string };
  en: { title: string; description: string; impact: string; action: string };
  ja: { title: string; description: string; impact: string; action: string };
  zh: { title: string; description: string; impact: string; action: string };
  fr: { title: string; description: string; impact: string; action: string };
  es: { title: string; description: string; impact: string; action: string };
}> = {
  minimal: {
    emoji: "😌",
    color: "#10b981",
    scoreRange: "0–12",
    ko: {
      title: "최소 수준 (거의 없음)",
      description: "사회적 상황에서 불안감이 거의 없습니다. 새로운 사람을 만나거나 공개 발언을 하는 데 큰 어려움을 느끼지 않습니다.",
      impact: "사교 활동에 큰 제약이 없으며, 사회적 관계를 비교적 자유롭게 맺을 수 있습니다.",
      action: "현재 상태를 유지하면서 마음챙김 연습을 통해 사회적 편안함을 더욱 발전시킬 수 있습니다.",
    },
    en: {
      title: "Minimal (Little to None)",
      description: "You experience little anxiety in social situations. Meeting new people or public speaking presents no significant difficulty.",
      impact: "No major restrictions on social activities; you can form social relationships relatively freely.",
      action: "Maintain current state and consider mindfulness practices to further develop social comfort.",
    },
    ja: {
      title: "最小（ほとんどなし）",
      description: "社会的状況でほとんど不安を感じません。新しい人に会ったり、人前で話したりすることに大きな困難を感じません。",
      impact: "社交活動に大きな制約はなく、比較的自由に社会的関係を築けます。",
      action: "現状を維持しながら、マインドフルネスの練習で社会的快適さをさらに発展させましょう。",
    },
    zh: {
      title: "最低水平（几乎没有）",
      description: "你在社交场合中几乎不会感到焦虑。认识新朋友或公开发言通常不会带来明显困难。",
      impact: "社交活动基本不受限制，你可以相对自由地建立人际关系。",
      action: "保持当前状态，并可以通过正念练习进一步提升社交中的自在感。",
    },
    fr: {
      title: "Minimal (peu ou pas)",
      description: "Vous ressentez peu d'anxiété dans les situations sociales. Rencontrer de nouvelles personnes ou parler en public ne présente pas de difficulté importante.",
      impact: "Vos activités sociales ne sont pas vraiment limitées, et vous pouvez nouer des relations assez librement.",
      action: "Maintenez cet équilibre et envisagez des pratiques de pleine conscience pour renforcer encore votre aisance sociale.",
    },
    es: {
      title: "Mínimo (poco o nada)",
      description: "Experimentas poca ansiedad en situaciones sociales. Conocer gente nueva o hablar en público no supone una dificultad importante.",
      impact: "No hay grandes restricciones en tus actividades sociales; puedes formar relaciones con relativa libertad.",
      action: "Mantén tu estado actual y considera prácticas de atención plena para desarrollar aún más tu comodidad social.",
    },
  },
  mild: {
    emoji: "😐",
    color: "#f59e0b",
    scoreRange: "13–24",
    ko: {
      title: "경미한 수준",
      description: "사회적 상황에서 가끔 불안이나 불편함을 느끼지만, 일상생활에 큰 지장은 없습니다. 특정 상황(발표, 첫 만남 등)에서 더 강하게 느껴질 수 있습니다.",
      impact: "일부 사회적 상황을 피하거나 불편함을 느낄 수 있지만, 기능적으로는 잘 대처할 수 있습니다.",
      action: "점진적 노출 연습(불안한 상황에 조금씩 익숙해지기), 사회 기술 향상, 자기 자신을 더 친절하게 대하는 자기 연민이 도움됩니다.",
    },
    en: {
      title: "Mild Level",
      description: "You occasionally feel anxiety or discomfort in social situations, but it doesn't significantly interfere with daily life. It may feel stronger in specific situations (presentations, first meetings, etc.).",
      impact: "You may avoid some social situations or feel discomfort, but you can cope functionally.",
      action: "Gradual exposure practice (slowly becoming comfortable with anxiety-inducing situations), social skills improvement, and self-compassion help.",
    },
    ja: {
      title: "軽度のレベル",
      description: "社会的状況でときどき不安や不快感を感じますが、日常生活に大きな支障はありません。特定の状況（発表、初対面など）でより強く感じることがあります。",
      impact: "一部の社会的状況を避けたり不快感を感じることがありますが、機能的には対処できます。",
      action: "段階的な曝露練習（不安な状況に少しずつ慣れること）、社会的スキルの向上、自己への思いやりが役立ちます。",
    },
    zh: {
      title: "轻度水平",
      description: "你在社交场合中偶尔会感到焦虑或不适，但通常不会明显影响日常生活。在某些情境中（如演讲、初次见面等）感受可能更强。",
      impact: "你可能会回避部分社交场合或感到不自在，但整体功能上仍能应对。",
      action: "循序渐进的暴露练习（逐步适应会引发焦虑的情境）、提升社交技能，以及对自己保持自我慈悲都会有帮助。",
    },
    fr: {
      title: "Niveau léger",
      description: "Vous ressentez parfois de l'anxiété ou de l'inconfort dans les situations sociales, sans que cela perturbe fortement votre vie quotidienne. Cela peut être plus marqué dans certaines situations, comme les présentations ou les premières rencontres.",
      impact: "Vous pouvez éviter certaines situations sociales ou vous y sentir mal à l'aise, tout en restant capable de fonctionner.",
      action: "L'exposition progressive aux situations anxiogènes, le développement des compétences sociales et l'autocompassion peuvent aider.",
    },
    es: {
      title: "Nivel leve",
      description: "A veces sientes ansiedad o incomodidad en situaciones sociales, pero no interfiere de forma importante con tu vida diaria. Puede sentirse más intenso en situaciones específicas, como presentaciones o primeros encuentros.",
      impact: "Puedes evitar algunas situaciones sociales o sentir incomodidad, pero logras afrontarlas de manera funcional.",
      action: "La exposición gradual a situaciones que provocan ansiedad, la mejora de habilidades sociales y la autocompasión pueden ayudarte.",
    },
  },
  moderate: {
    emoji: "😟",
    color: "#f97316",
    scoreRange: "25–36",
    ko: {
      title: "중간 수준",
      description: "사회적 불안이 일상생활에 눈에 띄는 영향을 미치고 있습니다. 많은 사회적 상황을 피하거나 극도의 불편함을 느끼며, 이로 인해 기회를 놓치거나 관계 형성에 어려움을 겪을 수 있습니다.",
      impact: "경력, 친구 관계, 로맨틱 관계, 일상적인 활동 등 여러 영역에서 제약을 경험할 수 있습니다.",
      action: "인지행동치료(CBT)나 노출 치료가 높은 효과를 보입니다. 전문 상담사와의 상담을 고려해보시기 바랍니다.",
    },
    en: {
      title: "Moderate Level",
      description: "Social anxiety is having a noticeable impact on your daily life. You may avoid many social situations or feel extreme discomfort, leading to missed opportunities and difficulties forming relationships.",
      impact: "You may experience restrictions in multiple areas: career, friendships, romantic relationships, and everyday activities.",
      action: "Cognitive-behavioral therapy (CBT) or exposure therapy shows high effectiveness. Consider consulting a professional counselor.",
    },
    ja: {
      title: "中程度のレベル",
      description: "社会不安が日常生活に目に見える影響を与えています。多くの社会的状況を避けたり極度の不快感を感じ、機会を逃したり関係構築に困難を感じることがあります。",
      impact: "キャリア、友人関係、ロマンティックな関係、日常活動など複数の領域で制約を経験する可能性があります。",
      action: "認知行動療法（CBT）や曝露療法が高い効果を示します。専門のカウンセラーへの相談を検討してください。",
    },
    zh: {
      title: "中度水平",
      description: "社交焦虑已经对你的日常生活产生明显影响。你可能会回避许多社交场合，或感到强烈不适，从而错过机会，或在人际关系建立上遇到困难。",
      impact: "你可能在职业、友谊、亲密关系和日常活动等多个方面感到受限。",
      action: "认知行为疗法（CBT）或暴露疗法通常具有较高效果。建议考虑咨询专业心理咨询师。",
    },
    fr: {
      title: "Niveau modéré",
      description: "L'anxiété sociale a un effet visible sur votre vie quotidienne. Vous pouvez éviter de nombreuses situations sociales ou y ressentir un inconfort intense, ce qui peut vous faire manquer des occasions et compliquer la création de liens.",
      impact: "Vous pouvez rencontrer des limitations dans plusieurs domaines : carrière, amitiés, relations amoureuses et activités du quotidien.",
      action: "La thérapie cognitivo-comportementale (TCC) ou la thérapie d'exposition montrent une bonne efficacité. Envisagez de consulter un professionnel.",
    },
    es: {
      title: "Nivel moderado",
      description: "La ansiedad social está teniendo un impacto notable en tu vida diaria. Puedes evitar muchas situaciones sociales o sentir una incomodidad intensa, lo que puede llevarte a perder oportunidades y dificultar la formación de relaciones.",
      impact: "Puedes experimentar limitaciones en varias áreas: carrera, amistades, relaciones románticas y actividades cotidianas.",
      action: "La terapia cognitivo-conductual (TCC) o la terapia de exposición suelen ser eficaces. Considera consultar con un profesional.",
    },
  },
  severe: {
    emoji: "😰",
    color: "#ef4444",
    scoreRange: "37–48",
    ko: {
      title: "심각한 수준",
      description: "사회적 불안이 일상생활에 심각한 영향을 미치고 있습니다. 많은 상황을 극도로 회피하거나 큰 고통을 경험하고 있을 수 있습니다.",
      impact: "사회적 고립, 경력 제한, 우울감 증가 등 전반적인 삶의 질에 영향을 미칠 수 있습니다.",
      action: "전문 심리치료사의 도움이 강력히 권장됩니다. CBT, 노출 반응 방지(ERP), 경우에 따라 약물치료가 효과적입니다. 한국 심리상담 위기 지원: 자살예방상담전화 1393",
    },
    en: {
      title: "Severe Level",
      description: "Social anxiety is significantly impacting your daily life. You may be experiencing extreme avoidance of many situations or significant distress.",
      impact: "May affect overall quality of life: social isolation, career limitations, increased depression.",
      action: "Professional psychotherapy is strongly recommended. CBT, exposure and response prevention (ERP), and in some cases medication are effective. Please reach out to a mental health professional.",
    },
    ja: {
      title: "重度のレベル",
      description: "社会不安が日常生活に深刻な影響を与えています。多くの状況を極度に回避したり、大きな苦痛を経験している可能性があります。",
      impact: "社会的孤立、キャリア制限、うつ感の増加など、全体的な生活の質に影響する可能性があります。",
      action: "専門の心理療法士の支援が強く推奨されます。CBT、曝露反応妨害法（ERP）、場合によっては薬物療法が効果的です。精神保健の専門家に相談してください。",
    },
    zh: {
      title: "严重水平",
      description: "社交焦虑正在严重影响你的日常生活。你可能在极力回避许多情境，或正在经历明显痛苦。",
      impact: "这可能影响整体生活质量，例如社交孤立、职业受限、抑郁感增加等。",
      action: "强烈建议寻求专业心理治疗师的帮助。CBT、暴露与反应预防（ERP），以及在某些情况下的药物治疗，都可能有效。请联系心理健康专业人士。",
    },
    fr: {
      title: "Niveau sévère",
      description: "L'anxiété sociale affecte fortement votre vie quotidienne. Vous pouvez éviter de nombreuses situations de manière extrême ou vivre une détresse importante.",
      impact: "Elle peut toucher votre qualité de vie globale : isolement social, limites professionnelles, augmentation de l'humeur dépressive.",
      action: "Un accompagnement par un psychothérapeute est fortement recommandé. La TCC, l'exposition avec prévention de la réponse (ERP) et, dans certains cas, un traitement médicamenteux peuvent être efficaces. Contactez un professionnel de santé mentale.",
    },
    es: {
      title: "Nivel severo",
      description: "La ansiedad social está afectando de forma significativa tu vida diaria. Puede que estés evitando muchas situaciones de manera extrema o experimentando un malestar importante.",
      impact: "Puede afectar tu calidad de vida general: aislamiento social, limitaciones profesionales y aumento del ánimo depresivo.",
      action: "Se recomienda firmemente buscar apoyo de un psicoterapeuta profesional. La TCC, la exposición con prevención de respuesta (EPR) y, en algunos casos, la medicación pueden ser eficaces. Ponte en contacto con un profesional de salud mental.",
    },
  },
};

const t = {
  ko: {
    title: "사회불안 자가 진단",
    subtitle: "사회적 상황에서 느끼는 불안 수준 측정",
    instruction: "지난 2주간의 경험을 기준으로 응답해주세요",
    never: "전혀 없음",
    rarely: "거의 없음",
    sometimes: "가끔",
    often: "자주",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "진단 결과",
    yourScore: "총점",
    impact: "생활 영향",
    action: "권장 행동",
    disclaimer: "이 테스트는 임상 진단이 아니며, 전문 진단을 대체할 수 없습니다.",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Social Anxiety Self-Assessment",
    subtitle: "Measure Your Social Anxiety Level",
    instruction: "Answer based on your experiences over the past 2 weeks",
    never: "Never",
    rarely: "Rarely",
    sometimes: "Sometimes",
    often: "Often",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Assessment Result",
    yourScore: "Total Score",
    impact: "Life Impact",
    action: "Recommended Action",
    disclaimer: "This test is not a clinical diagnosis and cannot replace professional assessment.",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "社会不安自己評価",
    subtitle: "社会的状況での不安レベルを測定",
    instruction: "過去2週間の経験に基づいて回答してください",
    never: "まったくない",
    rarely: "ほとんどない",
    sometimes: "ときどき",
    often: "よく",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "診断結果",
    yourScore: "合計点",
    impact: "生活への影響",
    action: "推奨アクション",
    disclaimer: "このテストは臨床診断ではなく、専門的な評価に代わるものではありません。",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "社交焦虑自我评估",
    subtitle: "测量你在社交场合中的焦虑水平",
    instruction: "请根据过去2周的经历作答",
    never: "从不",
    rarely: "很少",
    sometimes: "有时",
    often: "经常",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "评估结果",
    yourScore: "总分",
    impact: "生活影响",
    action: "建议行动",
    disclaimer: "本测试不是临床诊断，不能替代专业评估。",
    restart: "重新开始",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Auto-évaluation de l'anxiété sociale",
    subtitle: "Mesurez votre niveau d'anxiété sociale",
    instruction: "Répondez d'après vos expériences des 2 dernières semaines",
    never: "Jamais",
    rarely: "Rarement",
    sometimes: "Parfois",
    often: "Souvent",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Résultat de l'évaluation",
    yourScore: "Score total",
    impact: "Impact sur la vie",
    action: "Action recommandée",
    disclaimer: "Ce test n'est pas un diagnostic clinique et ne remplace pas une évaluation professionnelle.",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Autoevaluación de ansiedad social",
    subtitle: "Mide tu nivel de ansiedad social",
    instruction: "Responde según tus experiencias de las últimas 2 semanas",
    never: "Nunca",
    rarely: "Rara vez",
    sometimes: "A veces",
    often: "A menudo",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Resultado de la evaluación",
    yourScore: "Puntuación total",
    impact: "Impacto en la vida",
    action: "Acción recomendada",
    disclaimer: "Este test no es un diagnóstico clínico y no sustituye una evaluación profesional.",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

const nextStepLabels: Record<SupportedLocale, {
  breathing: string;
  selfEsteem: string;
  innerStrength: string;
}> = {
  ko: {
    breathing: "🫁 호흡 타이머",
    selfEsteem: "🌿 자존감 테스트",
    innerStrength: "🧠 내면 강점 테스트",
  },
  en: {
    breathing: "🫁 Breathing timer",
    selfEsteem: "🌿 Self-esteem test",
    innerStrength: "🧠 Inner strength test",
  },
  ja: {
    breathing: "🫁 呼吸タイマー",
    selfEsteem: "🌿 自尊感情テスト",
    innerStrength: "🧠 内面の強さテスト",
  },
  zh: {
    breathing: "🫁 呼吸计时器",
    selfEsteem: "🌿 自尊测试",
    innerStrength: "🧠 内在力量测试",
  },
  fr: {
    breathing: "🫁 Minuteur de respiration",
    selfEsteem: "🌿 Test d'estime de soi",
    innerStrength: "🧠 Test de force intérieure",
  },
  es: {
    breathing: "🫁 Temporizador de respiración",
    selfEsteem: "🌿 Test de autoestima",
    innerStrength: "🧠 Test de fortaleza interior",
  },
};

function getLevel(score: number): AnxietyLevel {
  if (score <= 12) return "minimal";
  if (score <= 24) return "mild";
  if (score <= 36) return "moderate";
  return "severe";
}

export default function SocialAnxietyTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ level: AnxietyLevel; score: number } | null>(null);
  useRecordFinishedTest({ testId: "social-anxiety", title: "SocialAnxietyTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const sa = p.get("sa") as AnxietyLevel | null;
    const ss = p.get("ss");
    if (sa && ss && LEVELS[sa]) {
      setResult({ level: sa, score: parseInt(ss, 10) });
    }
  }, []);

  function pick(score: number) {
    const next = [...answers, score];
    if (next.length < questions.length) {
      setAnswers(next);
      setTimeout(() => setIdx(next.length), 280);
    } else {
      const total = next.reduce((a, b) => a + b, 0);
      const level = getLevel(total);
      setResult({ level, score: total });
      const url = new URL(window.location.href);
      url.searchParams.set("sa", level);
      url.searchParams.set("ss", String(total));
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0);
    setAnswers([]);
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("sa");
    url.searchParams.delete("ss");
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

  const scoreOptions = [
    { label: tx.never, value: 0 },
    { label: tx.rarely, value: 1 },
    { label: tx.sometimes, value: 2 },
    { label: tx.often, value: 3 },
  ] as const;

  const maxScore = questions.length * 3;

  if (result) {
    const lv = LEVELS[result.level];
    const ld = lv[locale];
    const pct = Math.round((result.score / maxScore) * 100);
    const nextLabels = nextStepLabels[locale];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `${lv.color}12`, border: `1px solid ${lv.color}40` }}>
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{lv.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{ld.title}</h2>
          <p className="mt-2 text-sm text-gray-500">{tx.yourScore}: {result.score} / {maxScore}</p>

          <div className="mx-auto mt-4 max-w-xs">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: lv.color }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>{LEVELS.minimal[locale].title.split(" ")[0]}</span>
              <span>{LEVELS.severe[locale].title.split(" ")[0]}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed">{ld.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">📊 {tx.impact}</h3>
            <p className="mt-1 text-sm text-gray-600">{ld.impact}</p>
          </div>
          <div className="rounded-lg p-4" style={{ background: `${lv.color}10` }}>
            <h3 className="font-semibold" style={{ color: lv.color }}>💡 {tx.action}</h3>
            <p className="mt-1 text-sm text-gray-700">{ld.action}</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">{tx.disclaimer}</p>
        <ShareResultButton
          locale={locale}
          heading={tx.title}
          resultTitle={ld.title}
          emoji={lv.emoji}
          description={ld.description}
        />
        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${locale}/breathing/timer/`, label: nextLabels.breathing },
            { href: `/${locale}/self-esteem/test/`, label: nextLabels.selfEsteem },
            { href: `/${locale}/inner-strength/test/`, label: nextLabels.innerStrength },
          ]}
        />
        <RelatedReading locale={locale} topic="social-anxiety" />

        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            {tx.restart}
          </button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: lv.color }}>
            {copied ? tx.copied : tx.share}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const progress = Math.round((idx / questions.length) * 100);

  return (
    <ScreeningQuestionnaire
      title={tx.title}
      subtitle={tx.subtitle}
      question={q[locale]}
      questionLabel={tx.progress(idx + 1, questions.length)}
      progress={progress}
      options={scoreOptions.map(({ label, value }) => ({ label, value }))}
      screeningNote={tx.disclaimer}
      supportMessage={tx.instruction}
      onSelect={pick}
    />
  );
}
