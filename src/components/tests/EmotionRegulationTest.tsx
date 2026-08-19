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

type RegStrategy =
  | "reappraisal"
  | "suppression"
  | "acceptance"
  | "rumination"
  | "problem_solving";

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
    type: RegStrategy;
  }[];
}

const questions: Question[] = [
  {
    ko: "스트레스를 받는 상황에서 감정이 밀려올 때 당신은?",
    en: "When emotions surge in a stressful situation, you:",
    ja: "ストレスを受ける状況で感情が押し寄せてくるとき、あなたは？",
    zh: "在压力情境中情绪涌上来时，你会？",
    fr: "Quand les émotions montent dans une situation stressante, vous :",
    es: "Cuando las emociones te invaden en una situación estresante, tú:",
    options: [
      { ko: "상황을 다른 관점으로 보려고 의식적으로 노력한다", en: "Consciously try to see the situation from a different perspective", ja: "状況を別の視点から見ようと意識的に努力する", zh: "有意识地尝试从不同角度看待情况", fr: "Essayer consciemment de voir la situation sous un autre angle", es: "Intentar conscientemente ver la situación desde otra perspectiva", type: "reappraisal" },
      { ko: "감정이 드러나지 않도록 조용히 억누른다", en: "Quietly suppress so emotions don't show", ja: "感情が表れないよう静かに抑える", zh: "默默压住情绪，不让它表现出来", fr: "Les retenir discrètement pour que les émotions ne se voient pas", es: "Reprimirlas en silencio para que no se noten", type: "suppression" },
      { ko: "감정이 있는 그대로 있도록 내버려두고 판단하지 않는다", en: "Let the emotion be as it is without judgment", ja: "感情があるがままにあるよう置いておき、判断しない", zh: "让情绪如其所是地存在，不加评判", fr: "Laisser l'émotion être là telle qu'elle est, sans la juger", es: "Dejar que la emoción esté tal como es, sin juzgarla", type: "acceptance" },
      { ko: "왜 이런 감정이 생겼는지 계속 생각하고 분석한다", en: "Keep thinking and analyzing why this emotion arose", ja: "なぜこんな感情が生じたかを考え続けて分析する", zh: "不断思考并分析为什么会产生这种情绪", fr: "Continuer à réfléchir et à analyser pourquoi cette émotion est apparue", es: "Seguir pensando y analizando por qué surgió esta emoción", type: "rumination" },
      { ko: "감정의 원인이 된 문제를 직접 해결하려 한다", en: "Directly try to solve the problem that caused the emotion", ja: "感情の原因となった問題を直接解決しようとする", zh: "直接尝试解决引发情绪的问题", fr: "Essayer de résoudre directement le problème à l'origine de l'émotion", es: "Intentar resolver directamente el problema que causó la emoción", type: "problem_solving" },
    ],
  },
  {
    ko: "직장에서 상사에게 부당한 대우를 받았을 때 당신은?",
    en: "When treated unfairly by a superior at work, you:",
    ja: "職場で上司から不当な扱いを受けたとき、あなたは？",
    zh: "在职场被上司不公平对待时，你会？",
    fr: "Quand un supérieur vous traite injustement au travail, vous :",
    es: "Cuando un superior te trata injustamente en el trabajo, tú:",
    options: [
      { ko: "'이것은 나를 배우게 하는 상황이다'라고 생각을 전환한다", en: "Shift thinking: 'This situation is teaching me something'", ja: "「これは自分を学ばせる状況だ」と考えを転換する", zh: "转换想法：'这个情况正在让我学到东西'", fr: "Changer de perspective : 'Cette situation m'apprend quelque chose'", es: "Cambiar el enfoque: 'Esta situación me está enseñando algo'", type: "reappraisal" },
      { ko: "화가 나지만 내색하지 않고 표정을 유지한다", en: "Feel angry but maintain composure without showing it", ja: "怒りを感じるが、内に秘めて表情を維持する", zh: "虽然生气，但不表现出来，保持镇定", fr: "Ressentir de la colère, mais garder contenance sans le montrer", es: "Sentir enojo, pero mantener la compostura sin mostrarlo", type: "suppression" },
      { ko: "불편한 감정을 인정하고 그것이 지나가기를 기다린다", en: "Acknowledge the uncomfortable feeling and wait for it to pass", ja: "不快な感情を認め、それが過ぎ去るのを待つ", zh: "承认这种不舒服的感受，并等待它过去", fr: "Reconnaître le malaise et attendre qu'il passe", es: "Reconocer la incomodidad y esperar a que pase", type: "acceptance" },
      { ko: "집에 돌아와서도 그 상황을 계속 머릿속에서 되새긴다", en: "Keep replaying the situation in my head even after getting home", ja: "家に帰ってもその状況を頭の中で繰り返し思い返す", zh: "即使回到家，也不断在脑海中回放那个场景", fr: "Continuer à repasser la scène dans ma tête, même une fois rentré", es: "Seguir repasando la situación en mi cabeza incluso al llegar a casa", type: "rumination" },
      { ko: "상황을 개선하기 위해 직접 대화를 요청하거나 행동을 취한다", en: "Request a direct conversation or take action to improve the situation", ja: "状況を改善するために直接対話を求めるか行動を取る", zh: "主动要求直接沟通，或采取行动改善情况", fr: "Demander une conversation directe ou agir pour améliorer la situation", es: "Pedir una conversación directa o tomar medidas para mejorar la situación", type: "problem_solving" },
    ],
  },
  {
    ko: "중요한 발표나 시험 전에 긴장이 밀려올 때 당신은?",
    en: "When nervousness surges before an important presentation or exam, you:",
    ja: "重要な発表や試験の前に緊張が押し寄せてくるとき、あなたは？",
    zh: "在重要演讲或考试前紧张感涌上来时，你会？",
    fr: "Quand la nervosité monte avant une présentation ou un examen important, vous :",
    es: "Cuando los nervios aparecen antes de una presentación o examen importante, tú:",
    options: [
      { ko: "'이 긴장이 나를 더 잘 준비시켜주고 있다'고 재해석한다", en: "Reinterpret: 'This nervousness is preparing me better'", ja: "「この緊張が自分をより良く準備させてくれている」と再解釈する", zh: "重新理解为：'这种紧张正在让我准备得更好'", fr: "Réinterpréter : 'Cette nervosité m'aide à mieux me préparer'", es: "Reinterpretarlo: 'Estos nervios me están preparando mejor'", type: "reappraisal" },
      { ko: "불안해 보이지 않으려고 태연한 척한다", en: "Pretend to be calm so I don't appear anxious", ja: "不安に見えないように平静を装う", zh: "假装镇定，以免显得焦虑", fr: "Faire semblant d'être calme pour ne pas paraître anxieux", es: "Fingir calma para no parecer ansioso", type: "suppression" },
      { ko: "긴장감을 있는 그대로 인정하고 함께 간다", en: "Acknowledge the nervousness as it is and carry it with me", ja: "緊張感をあるがままに認め、それと一緒に進む", zh: "如实承认紧张感，并带着它继续前进", fr: "Reconnaître la nervosité telle qu'elle est et avancer avec elle", es: "Reconocer los nervios tal como son y seguir adelante con ellos", type: "acceptance" },
      { ko: "만약 실패하면 어떻게 될지 시나리오를 계속 돌린다", en: "Keep running through scenarios of what will happen if I fail", ja: "もし失敗したらどうなるかのシナリオを回し続ける", zh: "不断想象如果失败会发生什么", fr: "Imaginer en boucle ce qui pourrait arriver si j'échoue", es: "Repasar una y otra vez qué pasaría si fracaso", type: "rumination" },
      { ko: "충분히 준비함으로써 긴장의 원인을 줄인다", en: "Reduce the source of nervousness by preparing sufficiently", ja: "十分に準備することで緊張の原因を減らす", zh: "通过充分准备来减少紧张的来源", fr: "Réduire la source de nervosité en me préparant suffisamment", es: "Reducir la causa de los nervios preparándome lo suficiente", type: "problem_solving" },
    ],
  },
  {
    ko: "친한 친구와 심각한 다툼이 생겼을 때 당신은?",
    en: "After a serious argument with a close friend, you:",
    ja: "親しい友人と深刻な言い争いになったとき、あなたは？",
    zh: "和亲密朋友发生严重争执后，你会？",
    fr: "Après une dispute sérieuse avec un ami proche, vous :",
    es: "Después de una discusión seria con un amigo cercano, tú:",
    options: [
      { ko: "'이 갈등이 우리 관계를 더 깊게 해줄 수 있다'고 생각한다", en: "Think: 'This conflict can deepen our relationship'", ja: "「この対立が私たちの関係をより深めてくれる可能性がある」と思う", zh: "认为：'这次冲突也许能让我们的关系更深入'", fr: "Penser : 'Ce conflit peut approfondir notre relation'", es: "Pensar: 'Este conflicto puede profundizar nuestra relación'", type: "reappraisal" },
      { ko: "상처받았지만 상대방에게 그것을 드러내지 않는다", en: "Feel hurt but don't reveal it to the other person", ja: "傷ついても相手にそれを見せない", zh: "虽然受伤，但不向对方表现出来", fr: "Me sentir blessé, mais ne pas le montrer à l'autre personne", es: "Sentirme herido, pero no mostrárselo a la otra persona", type: "suppression" },
      { ko: "화나고 슬픈 감정을 인정하고 그 감정과 함께 있는다", en: "Acknowledge the anger and sadness and sit with those feelings", ja: "怒りと悲しみの感情を認め、その感情とともにいる", zh: "承认愤怒和悲伤，并和这些感受待在一起", fr: "Reconnaître la colère et la tristesse, et rester avec ces émotions", es: "Reconocer el enojo y la tristeza, y quedarme con esos sentimientos", type: "acceptance" },
      { ko: "무슨 말을 잘못했는지 계속 반추하며 후회한다", en: "Continuously ruminate and regret what I said wrong", ja: "何を言い間違えたかを反芻し続けて後悔する", zh: "不断反复想着自己说错了什么，并感到后悔", fr: "Ruminer sans cesse ce que j'ai mal dit et le regretter", es: "Rumiar continuamente qué dije mal y arrepentirme", type: "rumination" },
      { ko: "냉각 기간 후 대화를 통해 해결점을 찾는다", en: "Seek resolution through conversation after a cooling-off period", ja: "冷却期間後に対話を通じて解決点を探す", zh: "冷静一段时间后，通过对话寻找解决办法", fr: "Chercher une solution par le dialogue après un temps d'apaisement", es: "Buscar una solución conversando después de un periodo para calmarse", type: "problem_solving" },
    ],
  },
  {
    ko: "감정을 조절하는 데 가장 도움이 되는 것은 무엇인가요?",
    en: "What helps you regulate emotions most?",
    ja: "感情を調節するのに最も役立つのは何ですか？",
    zh: "什么最能帮助你调节情绪？",
    fr: "Qu'est-ce qui vous aide le plus à réguler vos émotions ?",
    es: "¿Qué te ayuda más a regular tus emociones?",
    options: [
      { ko: "같은 상황을 더 긍정적이거나 중립적으로 보는 방법 찾기", en: "Finding a more positive or neutral way to see the same situation", ja: "同じ状況をより肯定的または中立的に見る方法を探す", zh: "找到更积极或更中性的方式来看待同一情况", fr: "Trouver une façon plus positive ou neutre de voir la même situation", es: "Encontrar una forma más positiva o neutral de ver la misma situación", type: "reappraisal" },
      { ko: "겉으로 차분하게 보이도록 자기 조절 연습", en: "Practicing self-control to appear calm outwardly", ja: "外見上落ち着いて見えるように自己制御を練習する", zh: "练习自我控制，让外表看起来平静", fr: "Pratiquer la maîtrise de soi pour paraître calme extérieurement", es: "Practicar autocontrol para parecer calmado por fuera", type: "suppression" },
      { ko: "감정을 판단 없이 관찰하는 마음챙김 명상", en: "Mindfulness meditation to observe emotions without judgment", ja: "感情を判断なく観察するマインドフルネス瞑想", zh: "用正念冥想不加评判地观察情绪", fr: "Méditer en pleine conscience pour observer les émotions sans jugement", es: "Meditación de atención plena para observar las emociones sin juzgarlas", type: "acceptance" },
      { ko: "이 감정의 원인을 깊이 이해하고 분석하는 것", en: "Deeply understanding and analyzing the cause of this emotion", ja: "この感情の原因を深く理解・分析すること", zh: "深入理解并分析这种情绪的原因", fr: "Comprendre et analyser en profondeur la cause de cette émotion", es: "Comprender y analizar a fondo la causa de esta emoción", type: "rumination" },
      { ko: "감정의 원인이 된 문제를 실제로 해결하는 것", en: "Actually solving the problem that caused the emotion", ja: "感情の原因となった問題を実際に解決すること", zh: "真正解决引发情绪的问题", fr: "Résoudre concrètement le problème qui a provoqué l'émotion", es: "Resolver realmente el problema que causó la emoción", type: "problem_solving" },
    ],
  },
];

const results: Record<RegStrategy, {
  emoji: string;
  color: string;
  effectiveness: string;
  ko: { title: string; description: string; pro: string; con: string; tip: string };
  en: { title: string; description: string; pro: string; con: string; tip: string };
  ja: { title: string; description: string; pro: string; con: string; tip: string };
  zh: { title: string; description: string; pro: string; con: string; tip: string };
  fr: { title: string; description: string; pro: string; con: string; tip: string };
  es: { title: string; description: string; pro: string; con: string; tip: string };
}> = {
  reappraisal: {
    emoji: "🔄",
    color: "#10b981",
    effectiveness: "높음",
    ko: {
      title: "인지 재평가형",
      description: "당신은 상황이나 사건을 다른 관점으로 재해석하여 감정을 조절합니다. 제임스 그로스(James Gross)의 감정 조절 연구에서 가장 효과적인 전략 중 하나로 검증된 방식입니다.",
      pro: "장기적 심리 건강에 매우 유익, 관계에 미치는 부정적 영향 최소, 인지 자원 소모 적음",
      con: "모든 상황에서 재평가가 쉽지 않을 수 있음, 극한 상황에서는 먼저 안정화 필요",
      tip: "재평가는 즉각 가능하지 않을 때도 있습니다. '나중에 돌아봤을 때 이것이 어떤 의미일까?'라고 시간 여유를 두고 질문하는 것도 좋은 방법입니다.",
    },
    en: {
      title: "Cognitive Reappraisal",
      description: "You regulate emotions by reinterpreting situations or events from a different perspective. This is one of the most effective strategies validated in James Gross's emotion regulation research.",
      pro: "Very beneficial for long-term psychological health, minimal negative impact on relationships, low cognitive resource consumption",
      con: "Reappraisal isn't always easy in every situation; stabilization needed first in extreme situations",
      tip: "Reappraisal isn't always immediately possible. Asking 'What meaning will this have when I look back later?' with some time distance is also effective.",
    },
    ja: {
      title: "認知的再評価型",
      description: "状況や出来事を別の視点から再解釈することで感情を調節します。ジェームズ・グロス（James Gross）の感情調節研究で最も効果的な戦略の一つとして検証された方法です。",
      pro: "長期的な心理的健康に非常に有益、関係への悪影響が最小、認知資源の消費が少ない",
      con: "すべての状況で再評価が容易でない場合がある、極限状況では先に安定化が必要",
      tip: "再評価は常にすぐにできるわけではありません。「後で振り返ったとき、これはどんな意味があるか？」と時間を置いて質問するのも良い方法です。",
    },
    zh: {
      title: "认知重评型",
      description: "你通过从不同角度重新解读情境或事件来调节情绪。这是詹姆斯·格罗斯(James Gross)的情绪调节研究中验证过的最有效策略之一。",
      pro: "非常有利于长期心理健康，对关系的负面影响较小，认知资源消耗较低",
      con: "并非所有情境都容易进行重评；在极端情况下需要先稳定下来",
      tip: "认知重评并不总是能立刻做到。也可以留出一点时间，问自己：'以后回头看，这件事会有什么意义？'",
    },
    fr: {
      title: "Réévaluation cognitive",
      description: "Vous régulez vos émotions en réinterprétant les situations ou les événements sous un autre angle. C'est l'une des stratégies les plus efficaces validées par les recherches de James Gross sur la régulation émotionnelle.",
      pro: "Très bénéfique pour la santé psychologique à long terme, impact négatif limité sur les relations, faible coût cognitif",
      con: "La réévaluation n'est pas toujours facile dans toutes les situations ; une stabilisation peut être nécessaire d'abord dans les situations extrêmes",
      tip: "La réévaluation n'est pas toujours possible immédiatement. Se demander avec un peu de recul : 'Quel sens cela aura-t-il quand j'y repenserai plus tard ?' peut aussi aider.",
    },
    es: {
      title: "Reevaluación cognitiva",
      description: "Regulas las emociones reinterpretando situaciones o acontecimientos desde otra perspectiva. Es una de las estrategias más eficaces validadas por la investigación de James Gross sobre regulación emocional.",
      pro: "Muy beneficiosa para la salud psicológica a largo plazo, impacto negativo mínimo en las relaciones, bajo consumo de recursos cognitivos",
      con: "La reevaluación no siempre es fácil en todas las situaciones; en situaciones extremas primero puede ser necesaria la estabilización",
      tip: "La reevaluación no siempre es posible de inmediato. Preguntarte con algo de distancia: '¿Qué significado tendrá esto cuando lo mire más adelante?' también puede ser útil.",
    },
  },
  suppression: {
    emoji: "🎭",
    color: "#f59e0b",
    effectiveness: "중간",
    ko: {
      title: "표현 억제형",
      description: "당신은 감정을 느끼지만 표현을 조절하여 드러내지 않습니다. 단기적으로는 사회적 상황을 관리하는 데 도움이 될 수 있지만, 장기적으로는 내면의 긴장을 높일 수 있습니다.",
      pro: "사회적 상황 관리, 단기적 갈등 예방",
      con: "내면의 스트레스 증가, 친밀한 관계에서 연결감 저하, 장기적 심리 건강에 부정적",
      tip: "억제 대신 '언제 표현할지 선택'하는 전략으로 전환해보세요. 감정을 억누르는 것이 아니라, 적절한 시간과 장소를 선택하는 것입니다.",
    },
    en: {
      title: "Expressive Suppression",
      description: "You feel emotions but regulate their expression without showing them. While this can help manage social situations short-term, it can increase internal tension long-term.",
      pro: "Social situation management, short-term conflict prevention",
      con: "Increased internal stress, decreased sense of connection in intimate relationships, negative long-term psychological health",
      tip: "Shift from suppression to 'choosing when to express.' It's not about suppressing emotions, but choosing the right time and place.",
    },
    ja: {
      title: "表現抑制型",
      description: "感情を感じますが、表現を調節して表に出しません。短期的には社会的状況の管理に役立つことがありますが、長期的には内面の緊張を高める可能性があります。",
      pro: "社会的状況の管理、短期的な対立の予防",
      con: "内面のストレス増加、親密な関係での繋がり感の低下、長期的な心理的健康への悪影響",
      tip: "抑制の代わりに「いつ表現するかを選ぶ」戦略に切り替えましょう。感情を抑え込むのではなく、適切な時間と場所を選ぶことです。",
    },
    zh: {
      title: "表达抑制型",
      description: "你会感受到情绪，但会调节它的表达，不让它显露出来。短期内这可能有助于应对社交情境，但长期来看可能增加内在紧张。",
      pro: "有助于管理社交情境，短期内预防冲突",
      con: "内在压力增加，亲密关系中的连接感下降，对长期心理健康不利",
      tip: "可以从抑制转向'选择何时表达'。重点不是压住情绪，而是选择合适的时间和场合。",
    },
    fr: {
      title: "Suppression expressive",
      description: "Vous ressentez les émotions, mais vous en régulez l'expression pour ne pas les montrer. Cela peut aider à gérer certaines situations sociales à court terme, mais augmenter la tension intérieure à long terme.",
      pro: "Gestion des situations sociales, prévention des conflits à court terme",
      con: "Hausse du stress interne, baisse du sentiment de connexion dans les relations intimes, effet négatif sur la santé psychologique à long terme",
      tip: "Essayez de passer de la suppression à 'choisir quand exprimer'. Il ne s'agit pas d'étouffer les émotions, mais de choisir le bon moment et le bon lieu.",
    },
    es: {
      title: "Supresión expresiva",
      description: "Sientes emociones, pero regulas su expresión para no mostrarlas. Aunque puede ayudar a manejar situaciones sociales a corto plazo, a largo plazo puede aumentar la tensión interna.",
      pro: "Manejo de situaciones sociales, prevención de conflictos a corto plazo",
      con: "Aumento del estrés interno, menor sensación de conexión en relaciones íntimas, efecto negativo en la salud psicológica a largo plazo",
      tip: "Intenta pasar de suprimir a 'elegir cuándo expresar'. No se trata de reprimir emociones, sino de elegir el momento y el lugar adecuados.",
    },
  },
  acceptance: {
    emoji: "🌊",
    color: "#3b82f6",
    effectiveness: "높음",
    ko: {
      title: "수용과 마음챙김형",
      description: "당신은 감정을 변화시키거나 억누르려 하지 않고, 있는 그대로 인정하고 관찰합니다. 수용전념치료(ACT)와 마음챙김 기반 인지치료(MBCT)의 핵심 원리를 자연스럽게 활용합니다.",
      pro: "심리적 유연성, 만성 우울·불안에 효과적, 자기 수용 강화",
      con: "즉각적인 행동이 필요한 상황에서는 충분하지 않을 수 있음",
      tip: "수용이 체념이나 무관심이 아님을 기억하세요. '감정을 느끼면서도 내 가치관에 맞는 행동을 선택할 수 있다'는 것이 수용의 핵심입니다.",
    },
    en: {
      title: "Acceptance & Mindfulness",
      description: "Rather than changing or suppressing emotions, you acknowledge and observe them as they are. You naturally apply the core principles of Acceptance and Commitment Therapy (ACT) and Mindfulness-Based Cognitive Therapy (MBCT).",
      pro: "Psychological flexibility, effective for chronic depression/anxiety, reinforces self-acceptance",
      con: "May not be sufficient in situations requiring immediate action",
      tip: "Remember that acceptance is not resignation or indifference. The core of acceptance is: 'I can feel emotions while still choosing actions aligned with my values.'",
    },
    ja: {
      title: "受容とマインドフルネス型",
      description: "感情を変えようとしたり抑えようとするのではなく、あるがままに認め観察します。受容専念療法（ACT）とマインドフルネス認知療法（MBCT）の核心原理を自然に活用します。",
      pro: "心理的柔軟性、慢性的なうつ・不安に効果的、自己受容の強化",
      con: "即時の行動が必要な状況では不十分な場合がある",
      tip: "受容が諦めや無関心ではないことを覚えておきましょう。「感情を感じながらも自分の価値観に合った行動を選べる」ことが受容の核心です。",
    },
    zh: {
      title: "接纳与正念型",
      description: "你不会试图改变或压抑情绪，而是如实承认并观察它们。你自然地运用了接纳承诺疗法(ACT)和正念认知疗法(MBCT)的核心原则。",
      pro: "心理灵活性高，对慢性抑郁和焦虑有效，强化自我接纳",
      con: "在需要立即行动的情境中，单靠这种方式可能不够",
      tip: "请记住，接纳不是放弃或冷漠。接纳的核心是：'我可以感受情绪，同时仍然选择符合自己价值观的行动。'",
    },
    fr: {
      title: "Acceptation et pleine conscience",
      description: "Plutôt que de modifier ou de réprimer les émotions, vous les reconnaissez et les observez telles qu'elles sont. Vous appliquez naturellement les principes de la thérapie d'acceptation et d'engagement (ACT) et de la thérapie cognitive basée sur la pleine conscience (MBCT).",
      pro: "Flexibilité psychologique, efficacité face à la dépression et l'anxiété chroniques, renforcement de l'acceptation de soi",
      con: "Peut ne pas suffire dans les situations qui exigent une action immédiate",
      tip: "Rappelez-vous que l'acceptation n'est ni résignation ni indifférence. Son coeur est : 'Je peux ressentir des émotions tout en choisissant des actions alignées avec mes valeurs.'",
    },
    es: {
      title: "Aceptación y atención plena",
      description: "En lugar de cambiar o suprimir las emociones, las reconoces y observas tal como son. Aplicas de forma natural los principios de la terapia de aceptación y compromiso (ACT) y la terapia cognitiva basada en mindfulness (MBCT).",
      pro: "Flexibilidad psicológica, eficacia en depresión y ansiedad crónicas, refuerzo de la autoaceptación",
      con: "Puede no ser suficiente en situaciones que requieren acción inmediata",
      tip: "Recuerda que aceptar no es resignarse ni ser indiferente. El núcleo de la aceptación es: 'Puedo sentir emociones y aun así elegir acciones alineadas con mis valores.'",
    },
  },
  rumination: {
    emoji: "🌀",
    color: "#6b7280",
    effectiveness: "낮음",
    ko: {
      title: "반추적 사고형",
      description: "당신은 감정이 생기면 그 원인과 의미를 반복적으로 생각하는 경향이 있습니다. 의도는 이해하는 것이지만, 반추는 불안과 우울을 심화시키는 패턴으로 알려져 있습니다.",
      pro: "문제의 깊은 이해를 원함, 같은 실수를 반복하지 않으려는 의도",
      con: "우울과 불안 심화, 해결 없는 반복적 사고, 현재 순간에서 멀어짐",
      tip: "반추를 알아챘을 때 '이 생각이 나를 해결책으로 이끌고 있는가, 아니면 반복되고 있는가?'를 묻고, 반복된다면 활동(산책, 대화)으로 전환하세요.",
    },
    en: {
      title: "Ruminative Thinking",
      description: "When emotions arise, you tend to repeatedly think about their causes and meaning. While the intention is to understand, rumination is known as a pattern that deepens anxiety and depression.",
      pro: "Seeking deep understanding of problems, intention to avoid repeating mistakes",
      con: "Deepens depression and anxiety, repetitive thinking without resolution, distancing from the present moment",
      tip: "When you notice rumination, ask: 'Is this thought leading me to a solution, or is it just repeating?' If repeating, shift to an activity (walking, conversation).",
    },
    ja: {
      title: "反芻的思考型",
      description: "感情が生じると、その原因と意味を繰り返し考える傾向があります。意図は理解することですが、反芻は不安とうつを深めるパターンとして知られています。",
      pro: "問題の深い理解を求める、同じ失敗を繰り返さないようにしたい意図",
      con: "うつと不安の深化、解決のない反復的思考、現在の瞬間から離れる",
      tip: "反芻に気づいたとき、「この考えは自分を解決策に導いているか、それとも繰り返しているか？」と問い、繰り返しているなら活動（散歩、会話）に切り替えましょう。",
    },
    zh: {
      title: "反刍思维型",
      description: "当情绪出现时，你倾向于反复思考它的原因和意义。你的本意是理解，但反刍被认为是一种会加深焦虑和抑郁的模式。",
      pro: "希望深入理解问题，有避免重复犯错的意图",
      con: "加深抑郁和焦虑，陷入没有解决的重复思考，远离当下",
      tip: "当你觉察到反刍时，问自己：'这个想法是在把我带向解决方案，还是只是在重复？' 如果只是在重复，就转向活动，比如散步或交谈。",
    },
    fr: {
      title: "Pensée ruminative",
      description: "Quand une émotion apparaît, vous avez tendance à réfléchir à plusieurs reprises à ses causes et à son sens. L'intention est de comprendre, mais la rumination est connue comme un schéma qui renforce l'anxiété et la dépression.",
      pro: "Recherche d'une compréhension profonde des problèmes, intention d'éviter de répéter les mêmes erreurs",
      con: "Aggrave la dépression et l'anxiété, pensée répétitive sans résolution, éloignement du moment présent",
      tip: "Quand vous remarquez la rumination, demandez-vous : 'Cette pensée me mène-t-elle vers une solution, ou se répète-t-elle simplement ?' Si elle se répète, passez à une activité comme marcher ou parler à quelqu'un.",
    },
    es: {
      title: "Pensamiento rumiativo",
      description: "Cuando surgen emociones, tiendes a pensar repetidamente en sus causas y significado. Aunque la intención es comprender, la rumiación se conoce como un patrón que profundiza la ansiedad y la depresión.",
      pro: "Búsqueda de comprensión profunda de los problemas, intención de no repetir los mismos errores",
      con: "Profundiza la depresión y la ansiedad, pensamiento repetitivo sin resolución, alejamiento del momento presente",
      tip: "Cuando notes rumiación, pregúntate: '¿Este pensamiento me lleva a una solución o solo se está repitiendo?' Si se repite, cambia a una actividad como caminar o conversar.",
    },
  },
  problem_solving: {
    emoji: "🔧",
    color: "#435D31",
    effectiveness: "높음 (통제 가능 시)",
    ko: {
      title: "문제 해결형",
      description: "당신은 감정의 원인인 문제를 직접 해결함으로써 감정을 조절합니다. 상황이 변화 가능하고 통제 가능할 때 매우 효과적이며, 자기 효능감을 높여줍니다.",
      pro: "실질적 문제 해결, 높은 자기 효능감, 재발 방지",
      con: "통제 불가능한 상황에서 좌절감 증가, 감정 자체를 처리하는 것을 소홀히 할 수 있음",
      tip: "먼저 자신에게 '이것이 내가 변화시킬 수 있는 것인가?'를 물어보세요. 변화 가능하면 행동하고, 불가능하면 수용이나 재평가 전략을 사용하세요.",
    },
    en: {
      title: "Problem-Solving",
      description: "You regulate emotions by directly solving the problem that's causing them. Very effective when situations are changeable and controllable, and boosts self-efficacy.",
      pro: "Practical problem resolution, high self-efficacy, recurrence prevention",
      con: "Increased frustration in uncontrollable situations; may neglect processing emotions themselves",
      tip: "First ask yourself: 'Is this something I can change?' If changeable, act. If not, use acceptance or reappraisal strategies.",
    },
    ja: {
      title: "問題解決型",
      description: "感情の原因となっている問題を直接解決することで感情を調節します。状況が変化可能でコントロール可能なとき非常に効果的で、自己効力感を高めます。",
      pro: "実質的な問題解決、高い自己効力感、再発防止",
      con: "コントロール不可能な状況での挫折感の増加；感情自体の処理を疎かにする可能性",
      tip: "まず自分に「これは自分が変えられるものか？」と問いましょう。変えられるなら行動し、変えられないなら受容や再評価の戦略を使いましょう。",
    },
    zh: {
      title: "问题解决型",
      description: "你通过直接解决引发情绪的问题来调节情绪。当情境可以改变、可以控制时，这种方式非常有效，也能提升自我效能感。",
      pro: "实际解决问题，自我效能感高，预防问题再次发生",
      con: "在无法控制的情境中挫败感可能增加；可能忽视对情绪本身的处理",
      tip: "先问自己：'这是我能改变的事吗？' 如果可以改变，就采取行动；如果不行，就使用接纳或认知重评策略。",
    },
    fr: {
      title: "Résolution de problème",
      description: "Vous régulez vos émotions en résolvant directement le problème qui les provoque. Cette stratégie est très efficace quand la situation peut être changée et contrôlée, et elle renforce le sentiment d'efficacité personnelle.",
      pro: "Résolution concrète des problèmes, fort sentiment d'efficacité personnelle, prévention des récidives",
      con: "Frustration accrue dans les situations incontrôlables ; risque de négliger le traitement des émotions elles-mêmes",
      tip: "Demandez-vous d'abord : 'Est-ce quelque chose que je peux changer ?' Si oui, agissez. Sinon, utilisez des stratégies d'acceptation ou de réévaluation.",
    },
    es: {
      title: "Resolución de problemas",
      description: "Regulas las emociones resolviendo directamente el problema que las causa. Es muy eficaz cuando las situaciones se pueden cambiar y controlar, y aumenta la autoeficacia.",
      pro: "Resolución práctica de problemas, alta autoeficacia, prevención de recurrencias",
      con: "Mayor frustración en situaciones incontrolables; puede descuidar el procesamiento de las emociones en sí",
      tip: "Primero pregúntate: '¿Esto es algo que puedo cambiar?' Si se puede cambiar, actúa. Si no, usa estrategias de aceptación o reevaluación.",
    },
  },
};

const t = {
  ko: {
    title: "감정 조절 방식 테스트",
    subtitle: "나는 어떻게 감정을 다루는가?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "나의 감정 조절 스타일",
    pro: "장점",
    con: "단점",
    tip: "성장 팁",
    scoreLabel: "전략별 점수",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Emotion Regulation Test",
    subtitle: "How Do You Handle Your Emotions?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Your Emotion Regulation Style",
    pro: "Pros",
    con: "Cons",
    tip: "Growth Tip",
    scoreLabel: "Score by Strategy",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "感情調節スタイルテスト",
    subtitle: "あなたはどのように感情を扱いますか？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "あなたの感情調節スタイル",
    pro: "長所",
    con: "短所",
    tip: "成長のヒント",
    scoreLabel: "戦略別スコア",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "情绪调节方式测试",
    subtitle: "你如何处理自己的情绪？",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "你的情绪调节风格",
    pro: "优点",
    con: "局限",
    tip: "成长提示",
    scoreLabel: "各策略得分",
    restart: "重新测试",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test de régulation émotionnelle",
    subtitle: "Comment gérez-vous vos émotions ?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Votre style de régulation émotionnelle",
    pro: "Points forts",
    con: "Limites",
    tip: "Conseil de croissance",
    scoreLabel: "Score par stratégie",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de regulación emocional",
    subtitle: "¿Cómo manejas tus emociones?",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Tu estilo de regulación emocional",
    pro: "Pros",
    con: "Contras",
    tip: "Consejo de crecimiento",
    scoreLabel: "Puntuación por estrategia",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

export default function EmotionRegulationTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<RegStrategy, number>>({ reappraisal: 0, suppression: 0, acceptance: 0, rumination: 0, problem_solving: 0 });
  const [result, setResult] = useState<RegStrategy | null>(null);
  useRecordFinishedTest({ testId: "emotion-regulation", title: "EmotionRegulationTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const er = p.get("er") as RegStrategy | null;
    if (er && results[er]) setResult(er);
  }, []);

  function pick(type: RegStrategy) {
    const next = { ...scores, [type]: scores[type] + 1 };
    const answeredCount = Object.values(next).reduce((a, b) => a + b, 0);
    if (answeredCount < questions.length) {
      setScores(next);
      setTimeout(() => setIdx(answeredCount), 280);
    } else {
      setScores(next);
      const winner = (Object.keys(next) as RegStrategy[]).reduce((a, b) => next[a] >= next[b] ? a : b);
      setResult(winner);
      const url = new URL(window.location.href);
      url.searchParams.set("er", winner);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0); setScores({ reappraisal: 0, suppression: 0, acceptance: 0, rumination: 0, problem_solving: 0 }); setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("er");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: tx.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const typeLabels: Record<RegStrategy, Record<SupportedLocale, string>> = {
    reappraisal: { ko: "재평가", en: "Reappraisal", ja: "再評価", zh: "重评", fr: "Réévaluation", es: "Reevaluación" },
    suppression: { ko: "억제", en: "Suppression", ja: "抑制", zh: "抑制", fr: "Suppression", es: "Supresión" },
    acceptance: { ko: "수용", en: "Acceptance", ja: "受容", zh: "接纳", fr: "Acceptation", es: "Aceptación" },
    rumination: { ko: "반추", en: "Rumination", ja: "反芻", zh: "反刍", fr: "Rumination", es: "Rumiación" },
    problem_solving: { ko: "문제해결", en: "Problem-Solving", ja: "問題解決", zh: "问题解决", fr: "Résolution", es: "Resolución" },
  };

  if (result) {
    const r = results[result];
    const rd = r[locale];
    const radarData = (Object.keys(scores) as RegStrategy[]).map((k) => ({
      subject: typeLabels[k][locale],
      score: scores[k],
      fullMark: questions.length,
    }));

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `${r.color}12`, border: `1px solid ${r.color}40` }}>
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{r.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{rd.title}</h2>
          <p className="mt-3 text-gray-600">{rd.description}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-green-700">✅ {tx.pro}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.pro}</p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-600">⚠️ {tx.con}</h3>
            <p className="mt-1 text-sm text-gray-600">{rd.con}</p>
          </div>
          <div className="rounded-lg p-4" style={{ background: `${r.color}10` }}>
            <h3 className="font-semibold" style={{ color: r.color }}>💡 {tx.tip}</h3>
            <p className="mt-1 text-sm text-gray-700">{rd.tip}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-700">{tx.scoreLabel}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar dataKey="score" stroke={r.color} fill={r.color} fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">{tx.restart}</button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: r.color }}>{copied ? tx.copied : tx.share}</button>
        </div>
        <ShareResultButton locale={locale} heading={tx.title} resultTitle={rd.title} emoji={r.emoji} />
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
      progress={Math.round((idx / questions.length) * 100)}
      options={q.options.map((opt) => ({ label: opt[locale], value: opt.type }))}
      onSelect={pick}
    />
  );
}
