import { useState, useEffect } from "react";
import { Questionnaire } from "@/components/ui/questionnaire";
import ShareResultButton from "../shared/ShareResultButton";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type OptimismLevel = "high_optimism" | "moderate_optimism" | "realistic" | "moderate_pessimism" | "high_pessimism";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  reverse?: boolean;
}

// Scheier & Carver LOT-R inspired (6 scored + 4 filler → simplified to 10 scored)
const questions: Question[] = [
  { ko: "불확실한 상황에서도 나는 보통 최선을 기대한다", en: "In uncertain times, I usually expect the best", ja: "不確かな状況でも、私はたいてい最善を期待する", zh: "即使在不确定的情况下，我通常也会期待最好的结果", fr: "Même dans l'incertitude, je m'attends généralement au meilleur", es: "Incluso en situaciones inciertas, suelo esperar lo mejor" },
  { ko: "일이 내 방식대로 되지 않으면, 나는 쉽게 체념한다", en: "If things don't go my way, I give up easily", ja: "物事が思い通りにならないと、簡単に諦めてしまう", zh: "如果事情不按我的方式发展，我很容易放弃", fr: "Quand les choses ne se passent pas comme je veux, j'abandonne facilement", es: "Si las cosas no salen como quiero, me rindo con facilidad", reverse: true },
  { ko: "나는 항상 나의 미래에 대해 낙관적이다", en: "I'm always optimistic about my future", ja: "私は自分の将来について常に楽観的だ", zh: "我总是对自己的未来保持乐观", fr: "Je suis toujours optimiste quant à mon avenir", es: "Siempre soy optimista sobre mi futuro" },
  { ko: "나는 내게 좋은 일이 일어날 것이라고 거의 기대하지 않는다", en: "I hardly ever expect good things to happen to me", ja: "私に良いことが起こるとはほとんど期待しない", zh: "我几乎不期待好事会发生在我身上", fr: "Je m'attends rarement à ce que de bonnes choses m'arrivent", es: "Casi nunca espero que me pasen cosas buenas", reverse: true },
  { ko: "전반적으로 나는 나쁜 일보다 좋은 일이 더 많이 일어날 것을 기대한다", en: "Overall, I expect more good things to happen than bad", ja: "全体的に、悪いことより良いことの方が多く起こると期待している", zh: "总体来说，我期待好事比坏事发生得更多", fr: "Dans l'ensemble, je m'attends à vivre plus de bonnes choses que de mauvaises", es: "En general, espero que ocurran más cosas buenas que malas" },
  { ko: "나는 내게 잘못될 것들이 많다고 예상하는 편이다", en: "I expect a lot of things to go wrong for me", ja: "私には多くのことがうまくいかないと予想する方だ", zh: "我倾向于预想到很多事情会出错", fr: "J'ai tendance à penser que beaucoup de choses vont mal tourner pour moi", es: "Tiendo a esperar que muchas cosas me salgan mal", reverse: true },
  { ko: "힘든 상황에서도 나는 보통 긍정적인 면을 찾는다", en: "Even in difficult situations, I usually find the positive side", ja: "辛い状況でも、私はたいてい良い面を見つける", zh: "即使在困难的处境中，我通常也能找到积极的一面", fr: "Même dans les situations difficiles, je trouve généralement le côté positif", es: "Incluso en situaciones difíciles, suelo encontrar el lado positivo" },
  { ko: "새로운 도전을 시작할 때, 나는 실패할 것 같다는 생각이 자주 든다", en: "When starting a new challenge, I often think I'll fail", ja: "新しい挑戦を始めるとき、失敗しそうだという気持ちがよく生じる", zh: "开始新的挑战时，我常常会觉得自己可能会失败", fr: "Quand je commence un nouveau défi, je pense souvent que je vais échouer", es: "Al empezar un nuevo reto, a menudo pienso que voy a fracasar", reverse: true },
  { ko: "문제가 생기면 나는 해결될 것이라고 생각한다", en: "When problems arise, I believe they will be resolved", ja: "問題が生じたとき、解決されると思う", zh: "当问题出现时，我相信它们会得到解决", fr: "Quand des problèmes surviennent, je crois qu'ils finiront par se résoudre", es: "Cuando surgen problemas, creo que se resolverán" },
  { ko: "나는 대체로 일이 잘못될 것을 걱정하며 산다", en: "I generally live with worry that things will go wrong", ja: "私は一般的に物事がうまくいかないことを心配して生活している", zh: "我通常生活在对事情出错的担忧中", fr: "Je vis généralement avec la crainte que les choses tournent mal", es: "Por lo general vivo preocupado por que las cosas salgan mal", reverse: true },
];

const LEVELS: Record<OptimismLevel, {
  emoji: string;
  color: string;
  scoreRange: string;
  ko: { title: string; description: string; strength: string; watch: string; tip: string };
  en: { title: string; description: string; strength: string; watch: string; tip: string };
  ja: { title: string; description: string; strength: string; watch: string; tip: string };
  zh: { title: string; description: string; strength: string; watch: string; tip: string };
  fr: { title: string; description: string; strength: string; watch: string; tip: string };
  es: { title: string; description: string; strength: string; watch: string; tip: string };
}> = {
  high_optimism: {
    emoji: "☀️",
    color: "#f59e0b",
    scoreRange: "38–40",
    ko: {
      title: "강한 낙관주의자",
      description: "당신은 미래에 대해 매우 긍정적인 기대를 가지고 있습니다. 어려움 속에서도 희망을 잃지 않고 긍정적인 면을 찾습니다. 연구에 따르면 낙관주의는 심리적 회복력, 신체 건강, 수명과 양의 상관관계가 있습니다.",
      strength: "회복력, 끈기, 정신·신체 건강, 강한 동기",
      watch: "지나친 낙관이 현실적 위험을 과소평가하게 할 수 있음. '긍정적 환상'이 준비를 소홀히 하게 만들 수 있음",
      tip: "낙관주의를 유지하면서도 '방어적 비관주의(defensive pessimism)'를 가끔 활용해보세요. 최악의 시나리오를 미리 생각하는 것이 실제로는 더 나은 결과를 만들기도 합니다.",
    },
    en: {
      title: "Strong Optimist",
      description: "You have very positive expectations for the future. You don't lose hope in difficult times and always find the bright side. Research shows optimism is positively correlated with psychological resilience, physical health, and longevity.",
      strength: "Resilience, persistence, mental and physical health, strong motivation",
      watch: "Excessive optimism can underestimate real risks; 'positive illusions' can lead to insufficient preparation",
      tip: "While maintaining optimism, occasionally practice 'defensive pessimism' — thinking through worst-case scenarios can actually lead to better outcomes.",
    },
    ja: {
      title: "強い楽観主義者",
      description: "将来に対してとても肯定的な期待を持っています。困難な中でも希望を失わず、良い面を見つけます。研究によれば、楽観主義は心理的回復力、身体的健康、寿命と正の相関があります。",
      strength: "回復力、粘り強さ、心身の健康、強いモチベーション",
      watch: "過度な楽観が現実的なリスクを過小評価させる可能性がある。「ポジティブな幻想」が準備不足を招くことがある",
      tip: "楽観主義を維持しながら、時折「防御的悲観主義（defensive pessimism）」を活用しましょう。最悪のシナリオを事前に考えることが実際にはより良い結果をもたらすこともあります。",
    },
    zh: {
      title: "强烈乐观主义者",
      description: "你对未来抱有非常积极的期待。即使在困难时期，你也不轻易失去希望，并能找到光明的一面。研究显示，乐观主义与心理复原力、身体健康和寿命呈正相关。",
      strength: "复原力、坚持力、身心健康、强烈动机",
      watch: "过度乐观可能会低估现实风险；“积极错觉”可能导致准备不足",
      tip: "在保持乐观的同时，也可以偶尔练习“防御性悲观主义(defensive pessimism)”。提前思考最坏情境，有时反而会带来更好的结果。",
    },
    fr: {
      title: "Fort optimiste",
      description: "Vous avez des attentes très positives pour l'avenir. Même dans les moments difficiles, vous ne perdez pas espoir et vous trouvez le bon côté des choses. Les recherches montrent que l'optimisme est positivement corrélé à la résilience psychologique, à la santé physique et à la longévité.",
      strength: "Résilience, persévérance, santé mentale et physique, forte motivation",
      watch: "Un optimisme excessif peut sous-estimer les risques réels ; les « illusions positives » peuvent conduire à une préparation insuffisante",
      tip: "Tout en gardant votre optimisme, essayez parfois le « pessimisme défensif » (defensive pessimism) : envisager les pires scénarios peut en réalité aider à obtenir de meilleurs résultats.",
    },
    es: {
      title: "Optimista fuerte",
      description: "Tienes expectativas muy positivas sobre el futuro. No pierdes la esperanza en momentos difíciles y sueles encontrar el lado bueno. La investigación muestra que el optimismo se correlaciona positivamente con la resiliencia psicológica, la salud física y la longevidad.",
      strength: "Resiliencia, perseverancia, salud mental y física, motivación fuerte",
      watch: "El optimismo excesivo puede subestimar riesgos reales; las «ilusiones positivas» pueden llevar a una preparación insuficiente",
      tip: "Sin dejar de cultivar el optimismo, prueba de vez en cuando el «pesimismo defensivo» (defensive pessimism): pensar en los peores escenarios puede llevar a mejores resultados.",
    },
  },
  moderate_optimism: {
    emoji: "🌤️",
    color: "#10b981",
    scoreRange: "30–37",
    ko: {
      title: "온건한 낙관주의자",
      description: "당신은 전반적으로 미래를 긍정적으로 바라보지만, 현실적인 시각도 갖추고 있습니다. 이것이 가장 적응적인 낙관주의 수준입니다. 희망을 잃지 않으면서도 현실적인 계획을 세울 수 있습니다.",
      strength: "균형 잡힌 기대, 현실적 계획, 심리적 유연성",
      watch: "특별한 주의 사항 없음 — 이 균형을 잘 유지하세요",
      tip: "이 균형이 매우 귀중합니다. 어려운 시기에도 이 균형을 의식적으로 유지하는 연습을 해보세요.",
    },
    en: {
      title: "Moderate Optimist",
      description: "You generally view the future positively while maintaining a realistic perspective. This is the most adaptive level of optimism — you can make realistic plans without losing hope.",
      strength: "Balanced expectations, realistic planning, psychological flexibility",
      watch: "No special concerns — maintain this balance well",
      tip: "This balance is very valuable. Consciously practice maintaining it even during difficult times.",
    },
    ja: {
      title: "穏やかな楽観主義者",
      description: "全体的に将来を肯定的に見ながら、現実的な視点も持っています。これが最も適応的な楽観主義のレベルです。希望を失わずに現実的な計画を立てることができます。",
      strength: "バランスの取れた期待、現実的な計画、心理的柔軟性",
      watch: "特別な注意事項なし — このバランスをうまく維持してください",
      tip: "このバランスは非常に貴重です。困難な時期にもこのバランスを意識的に維持する練習をしましょう。",
    },
    zh: {
      title: "温和乐观主义者",
      description: "你总体上积极看待未来，同时也保有现实的视角。这是最具适应性的乐观水平：你能在不失去希望的同时制定现实的计划。",
      strength: "平衡的期待、现实的计划、心理灵活性",
      watch: "没有特别需要担心的地方——请好好保持这种平衡",
      tip: "这种平衡非常珍贵。即使在困难时期，也可以有意识地练习维持它。",
    },
    fr: {
      title: "Optimiste modéré",
      description: "Vous envisagez globalement l'avenir de façon positive tout en gardant une perspective réaliste. C'est le niveau d'optimisme le plus adaptatif : vous pouvez faire des plans concrets sans perdre espoir.",
      strength: "Attentes équilibrées, planification réaliste, flexibilité psychologique",
      watch: "Pas de préoccupation particulière — continuez à bien maintenir cet équilibre",
      tip: "Cet équilibre est très précieux. Entraînez-vous à le préserver consciemment, même dans les périodes difficiles.",
    },
    es: {
      title: "Optimista moderado",
      description: "En general ves el futuro de forma positiva, pero mantienes una perspectiva realista. Este es el nivel de optimismo más adaptativo: puedes hacer planes realistas sin perder la esperanza.",
      strength: "Expectativas equilibradas, planificación realista, flexibilidad psicológica",
      watch: "No hay preocupaciones especiales; mantén bien este equilibrio",
      tip: "Este equilibrio es muy valioso. Practica mantenerlo de forma consciente incluso en momentos difíciles.",
    },
  },
  realistic: {
    emoji: "⚖️",
    color: "#6b7280",
    scoreRange: "22–29",
    ko: {
      title: "현실주의자",
      description: "당신은 과도한 낙관이나 비관 없이 현실적으로 상황을 평가합니다. 증거와 현실에 기반한 기대를 가지고 있으며, 좋은 것도 나쁜 것도 있을 수 있다는 균형적 시각을 가집니다.",
      strength: "정확한 상황 평가, 현실적 계획, 실망 리스크 낮음",
      watch: "희망적 사고가 가져다주는 동기와 회복력의 이점을 놓칠 수 있음",
      tip: "현실주의적 사고는 귀중하지만, 의도적으로 '최선의 경우'를 더 자주 상상하는 연습도 가치 있습니다. 낙관주의는 습관으로 만들 수 있습니다.",
    },
    en: {
      title: "Realist",
      description: "You assess situations realistically without excessive optimism or pessimism. You have evidence-based expectations and hold a balanced perspective that acknowledges both good and bad possibilities.",
      strength: "Accurate situation assessment, realistic planning, low disappointment risk",
      watch: "May miss the motivational and resilience benefits of hopeful thinking",
      tip: "Realistic thinking is valuable, but intentionally imagining 'best case' scenarios more often is also worthwhile. Optimism can be cultivated as a habit.",
    },
    ja: {
      title: "現実主義者",
      description: "過度な楽観も悲観もなく、現実的に状況を評価します。証拠と現実に基づいた期待を持ち、良いことも悪いこともあり得るというバランスの取れた視点を持っています。",
      strength: "正確な状況評価、現実的な計画、失望リスクが低い",
      watch: "希望的思考がもたらす動機づけと回復力の恩恵を見逃す可能性がある",
      tip: "現実主義的思考は貴重ですが、意図的に「最善のケース」をより頻繁にイメージする練習も価値があります。楽観主義は習慣として培うことができます。",
    },
    zh: {
      title: "现实主义者",
      description: "你不会过度乐观或悲观，而是现实地评估情况。你的期待基于证据和现实，也能平衡地看见好事与坏事都有可能发生。",
      strength: "准确评估情况、现实规划、较低的失望风险",
      watch: "可能会错过希望性思维带来的动机和复原力益处",
      tip: "现实主义思维很有价值，但有意识地更常想象“最好情况”也同样值得练习。乐观主义可以被培养成一种习惯。",
    },
    fr: {
      title: "Réaliste",
      description: "Vous évaluez les situations de façon réaliste, sans optimisme ni pessimisme excessif. Vos attentes s'appuient sur les faits et la réalité, avec une vision équilibrée qui reconnaît les possibilités positives comme négatives.",
      strength: "Évaluation précise des situations, planification réaliste, faible risque de déception",
      watch: "Peut passer à côté des bénéfices motivationnels et de résilience liés à une pensée pleine d'espoir",
      tip: "La pensée réaliste est précieuse, mais il peut aussi être utile d'imaginer plus souvent, volontairement, le « meilleur scénario ». L'optimisme peut se cultiver comme une habitude.",
    },
    es: {
      title: "Realista",
      description: "Evalúas las situaciones de forma realista, sin optimismo ni pesimismo excesivos. Tus expectativas se basan en la evidencia y en la realidad, con una visión equilibrada que reconoce posibilidades buenas y malas.",
      strength: "Evaluación precisa de la situación, planificación realista, bajo riesgo de decepción",
      watch: "Puedes perder algunos beneficios motivacionales y de resiliencia que aporta el pensamiento esperanzado",
      tip: "El pensamiento realista es valioso, pero también merece la pena imaginar intencionalmente el “mejor caso” con más frecuencia. El optimismo puede cultivarse como hábito.",
    },
  },
  moderate_pessimism: {
    emoji: "🌧️",
    color: "#435D31",
    scoreRange: "14–21",
    ko: {
      title: "온건한 비관주의자",
      description: "당신은 미래에 대한 기대가 다소 낮고, 일이 잘못될 가능성에 더 집중하는 경향이 있습니다. 이것은 때로 방어적 비관주의로 기능하여 더 잘 준비하게 만들 수 있지만, 만성화되면 불안과 동기 저하로 이어질 수 있습니다.",
      strength: "철저한 준비, 위험 관리, 현실적 기대",
      watch: "만성적 비관이 우울감, 낮은 자기 효능감으로 이어질 수 있음",
      tip: "마틴 셀리그만의 낙관주의 학습(Learned Optimism) 기법을 시도해보세요: 나쁜 일을 일시적('지금은')·특정적('이 상황에서')·외부적('이 원인 때문에')으로 설명하는 연습이 도움됩니다.",
    },
    en: {
      title: "Moderate Pessimist",
      description: "You have somewhat low expectations for the future and tend to focus more on the possibility of things going wrong. This can sometimes function as defensive pessimism for better preparation, but if chronic, can lead to anxiety and decreased motivation.",
      strength: "Thorough preparation, risk management, realistic expectations",
      watch: "Chronic pessimism can lead to depression and low self-efficacy",
      tip: "Try Martin Seligman's Learned Optimism technique: explaining bad events as temporary ('for now'), specific ('in this situation'), and external ('because of this cause').",
    },
    ja: {
      title: "穏やかな悲観主義者",
      description: "将来に対する期待がやや低く、物事がうまくいかない可能性により集中する傾向があります。これは時に防御的悲観主義として機能してより良い準備をさせることもありますが、慢性化すると不安や動機の低下につながることがあります。",
      strength: "徹底的な準備、リスク管理、現実的な期待",
      watch: "慢性的な悲観がうつ感と低い自己効力感につながる可能性がある",
      tip: "マーティン・セリグマンの楽観主義の学習（Learned Optimism）技法を試してみましょう：悪いことを一時的（「今は」）・特定的（「この状況では」）・外部的（「この原因のため」）に説明する練習が役立ちます。",
    },
    zh: {
      title: "温和悲观主义者",
      description: "你对未来的期待略低，并倾向于更多关注事情出错的可能性。这有时能作为防御性悲观主义，帮助你准备得更充分；但如果长期持续，可能会带来焦虑和动机下降。",
      strength: "充分准备、风险管理、现实期待",
      watch: "长期悲观可能与抑郁感和较低的自我效能感有关",
      tip: "可以尝试马丁·塞利格曼的习得性乐观(Learned Optimism)技巧：练习把坏事解释为暂时的（“只是现在”）、特定的（“在这个情境中”）和外部的（“因为这个原因”）。",
    },
    fr: {
      title: "Pessimiste modéré",
      description: "Vos attentes pour l'avenir sont un peu basses, et vous avez tendance à vous concentrer davantage sur ce qui pourrait mal tourner. Cela peut parfois fonctionner comme un pessimisme défensif et améliorer votre préparation, mais si cela devient chronique, cela peut nourrir l'anxiété et réduire la motivation.",
      strength: "Préparation approfondie, gestion des risques, attentes réalistes",
      watch: "Un pessimisme chronique peut être lié à une humeur dépressive et à une faible auto-efficacité",
      tip: "Essayez la méthode d'optimisme appris (Learned Optimism) de Martin Seligman : s'entraîner à expliquer les événements négatifs comme temporaires (« pour l'instant »), spécifiques (« dans cette situation ») et externes (« à cause de cette cause »).",
    },
    es: {
      title: "Pesimista moderado",
      description: "Tienes expectativas algo bajas sobre el futuro y tiendes a centrarte más en la posibilidad de que las cosas salgan mal. A veces esto funciona como pesimismo defensivo y ayuda a prepararte mejor, pero si se vuelve crónico puede llevar a ansiedad y menor motivación.",
      strength: "Preparación minuciosa, gestión de riesgos, expectativas realistas",
      watch: "El pesimismo crónico puede relacionarse con estado de ánimo depresivo y baja autoeficacia",
      tip: "Prueba la técnica de optimismo aprendido (Learned Optimism) de Martin Seligman: explicar los eventos negativos como temporales (“por ahora”), específicos (“en esta situación”) y externos (“por esta causa”).",
    },
  },
  high_pessimism: {
    emoji: "🌪️",
    color: "#ef4444",
    scoreRange: "10–13",
    ko: {
      title: "강한 비관주의자",
      description: "현재 미래에 대한 기대가 매우 낮고 부정적인 결과를 강하게 예상하는 경향이 있습니다. 이것은 단순한 성격 특성이 아니라 변화 가능한 사고 패턴입니다.",
      strength: "위험 인식, 방어적 준비",
      watch: "우울, 불안, 낮은 삶의 질, 만성 스트레스와 연관될 수 있음",
      tip: "인지행동치료(CBT)의 인지 재구성이나 마틴 셀리그만의 낙관주의 학습이 효과적으로 도움을 줄 수 있습니다. 전문가의 도움도 고려해보세요.",
    },
    en: {
      title: "Strong Pessimist",
      description: "You currently have very low expectations for the future and strongly anticipate negative outcomes. This is not merely a personality trait — it's a changeable thought pattern.",
      strength: "Risk awareness, defensive preparation",
      watch: "May be associated with depression, anxiety, low quality of life, chronic stress",
      tip: "Cognitive restructuring from CBT or Martin Seligman's Learned Optimism can help effectively. Also consider seeking professional support.",
    },
    ja: {
      title: "強い悲観主義者",
      description: "現在、将来への期待が非常に低く、否定的な結果を強く予想する傾向があります。これは単なる性格特性ではなく、変化可能な思考パターンです。",
      strength: "リスク認識、防御的準備",
      watch: "うつ、不安、低い生活の質、慢性的なストレスと関連する可能性がある",
      tip: "認知行動療法（CBT）の認知再構成やマーティン・セリグマンの楽観主義の学習が効果的に役立ちます。専門家の支援も検討してみましょう。",
    },
    zh: {
      title: "强烈悲观主义者",
      description: "你目前对未来的期待非常低，并强烈预想到负面结果。这并不只是性格特质，而是一种可以改变的思维模式。",
      strength: "风险意识、防御性准备",
      watch: "可能与抑郁、焦虑、较低生活质量和慢性压力有关",
      tip: "认知行为疗法(CBT)中的认知重构，或马丁·塞利格曼的习得性乐观，都可能有效提供帮助。也可以考虑寻求专业支持。",
    },
    fr: {
      title: "Fort pessimiste",
      description: "Vous avez actuellement des attentes très basses pour l'avenir et vous anticipez fortement des résultats négatifs. Ce n'est pas seulement un trait de personnalité : c'est un schéma de pensée qui peut évoluer.",
      strength: "Conscience des risques, préparation défensive",
      watch: "Peut être associé à la dépression, à l'anxiété, à une faible qualité de vie et au stress chronique",
      tip: "La restructuration cognitive issue de la TCC ou l'optimisme appris de Martin Seligman peuvent aider efficacement. Envisagez aussi de chercher un soutien professionnel.",
    },
    es: {
      title: "Pesimista fuerte",
      description: "Actualmente tienes expectativas muy bajas sobre el futuro y anticipas con fuerza resultados negativos. Esto no es solo un rasgo de personalidad: es un patrón de pensamiento que puede cambiar.",
      strength: "Conciencia del riesgo, preparación defensiva",
      watch: "Puede asociarse con depresión, ansiedad, baja calidad de vida y estrés crónico",
      tip: "La reestructuración cognitiva de la TCC o el optimismo aprendido de Martin Seligman pueden ayudar de forma efectiva. También considera buscar apoyo profesional.",
    },
  },
};

const t = {
  ko: {
    title: "낙관주의-비관주의 검사",
    subtitle: "당신은 미래를 어떻게 바라보는가?",
    instruction: "각 문장이 자신에게 얼마나 해당하는지 선택해주세요",
    a1: "전혀 아님", a2: "거의 아님", a3: "보통", a4: "자주 그럼", a5: "항상 그럼",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "낙관-비관 성향 결과",
    yourScore: "점수",
    strength: "강점",
    watch: "주의 사항",
    tip: "성장 팁",
    pessimism: "비관",
    optimism: "낙관",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Optimism-Pessimism Test",
    subtitle: "How Do You View the Future?",
    instruction: "Choose how much each statement applies to you",
    a1: "Not at all", a2: "Rarely", a3: "Sometimes", a4: "Often", a5: "Always",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Optimism-Pessimism Result",
    yourScore: "Score",
    strength: "Strengths",
    watch: "Watch Out For",
    tip: "Growth Tip",
    pessimism: "Pessimism",
    optimism: "Optimism",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "楽観主義-悲観主義テスト",
    subtitle: "あなたは将来をどう見ていますか？",
    instruction: "各文章がどれくらい自分に当てはまるか選んでください",
    a1: "まったく違う", a2: "ほとんど違う", a3: "どちらでもない", a4: "よくそうだ", a5: "いつもそうだ",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "楽観-悲観傾向の結果",
    yourScore: "スコア",
    strength: "強み",
    watch: "注意事項",
    tip: "成長のヒント",
    pessimism: "悲観",
    optimism: "楽観",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "乐观主义-悲观主义测试",
    subtitle: "你如何看待未来？",
    instruction: "请选择每句话在多大程度上符合你",
    a1: "完全不符合", a2: "很少符合", a3: "有时符合", a4: "经常符合", a5: "总是符合",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "乐观-悲观倾向结果",
    yourScore: "分数",
    strength: "优势",
    watch: "注意事项",
    tip: "成长建议",
    pessimism: "悲观",
    optimism: "乐观",
    restart: "重新开始",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test optimisme-pessimisme",
    subtitle: "Comment voyez-vous l'avenir ?",
    instruction: "Choisissez dans quelle mesure chaque phrase vous correspond",
    a1: "Pas du tout", a2: "Rarement", a3: "Parfois", a4: "Souvent", a5: "Toujours",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Résultat optimisme-pessimisme",
    yourScore: "Score",
    strength: "Forces",
    watch: "Points de vigilance",
    tip: "Conseil de progression",
    pessimism: "Pessimisme",
    optimism: "Optimisme",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de optimismo-pesimismo",
    subtitle: "¿Cómo ves el futuro?",
    instruction: "Elige cuánto se aplica a ti cada afirmación",
    a1: "Para nada", a2: "Rara vez", a3: "A veces", a4: "A menudo", a5: "Siempre",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Resultado de optimismo-pesimismo",
    yourScore: "Puntuación",
    strength: "Fortalezas",
    watch: "A tener en cuenta",
    tip: "Consejo de crecimiento",
    pessimism: "Pesimismo",
    optimism: "Optimismo",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

function getLevel(score: number): OptimismLevel {
  if (score >= 38) return "high_optimism";
  if (score >= 30) return "moderate_optimism";
  if (score >= 22) return "realistic";
  if (score >= 14) return "moderate_pessimism";
  return "high_pessimism";
}

export default function OptimismTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ level: OptimismLevel; score: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const op = p.get("op") as OptimismLevel | null;
    const os = p.get("os");
    if (op && os && LEVELS[op]) setResult({ level: op, score: parseInt(os, 10) });
  }, []);

  function pick(rawScore: number) {
    const q = questions[idx];
    const score = q.reverse ? 6 - rawScore : rawScore;
    // 되돌아가서 다시 고르면 그 뒤 응답은 버린다 — 이어붙이기(append)면 되돌리기가 성립하지 않는다.
    const next = answers.slice(0, idx);
    next[idx] = score;

    if (next.length < questions.length) {
      setAnswers(next);
      setTimeout(() => setIdx(idx + 1), 280);
    } else {
      const total = next.reduce((a, b) => a + b, 0);
      const level = getLevel(total);
      setResult({ level, score: total });
      const url = new URL(window.location.href);
      url.searchParams.set("op", level);
      url.searchParams.set("os", String(total));
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0); setAnswers([]); setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("op"); url.searchParams.delete("os");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: tx.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const scoreOpts = [
    { label: tx.a1, value: 1 }, { label: tx.a2, value: 2 }, { label: tx.a3, value: 3 },
    { label: tx.a4, value: 4 }, { label: tx.a5, value: 5 },
  ] as const;

  const maxScore = questions.length * 5;

  if (result) {
    const lv = LEVELS[result.level];
    const ld = lv[locale];
    const pct = Math.round((result.score / maxScore) * 100);

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `${lv.color}12`, border: `1px solid ${lv.color}40` }}>
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{lv.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{ld.title}</h2>
          <p className="mt-2 text-sm text-gray-500">{tx.yourScore}: {result.score} / {maxScore}</p>
          <div className="mx-auto mt-4 max-w-xs">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: lv.color }} />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>{tx.pessimism}</span>
              <span>{tx.optimism}</span>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed">{ld.description}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-green-700">✅ {tx.strength}</h3>
            <p className="mt-1 text-sm text-gray-600">{ld.strength}</p>
          </div>
          <div>
            <h3 className="font-semibold text-orange-600">⚠️ {tx.watch}</h3>
            <p className="mt-1 text-sm text-gray-600">{ld.watch}</p>
          </div>
          <div className="rounded-lg p-4" style={{ background: `${lv.color}10` }}>
            <h3 className="font-semibold" style={{ color: lv.color }}>💡 {tx.tip}</h3>
            <p className="mt-1 text-sm text-gray-700">{ld.tip}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <ShareResultButton locale={locale} heading={tx.resultTitle} emoji={lv.emoji} resultTitle={ld.title} description={`${tx.yourScore}: ${result.score} / ${maxScore}`} />
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">{tx.restart}</button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: lv.color }}>{copied ? tx.copied : tx.share}</button>
        </div>
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
      options={scoreOpts.map((opt) => ({ label: opt.label, value: opt.value }))}
      selectedValue={
        answers[idx] === undefined ? undefined : q.reverse ? 6 - answers[idx] : answers[idx]
      }
      note={tx.instruction}
      previousLabel={locale === "ko" ? "이전 질문" : locale === "ja" ? "前の質問" : "Previous question"}
      onPrevious={idx > 0 ? () => setIdx(idx - 1) : undefined}
      onSelect={pick}
    />
  );
}
