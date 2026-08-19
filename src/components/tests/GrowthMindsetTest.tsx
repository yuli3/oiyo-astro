import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import ShareResultButton from "../shared/ShareResultButton";
import { Questionnaire } from "@/components/ui/questionnaire";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type MindsetType = "growth" | "mixed_growth" | "mixed_fixed" | "fixed";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  reverse?: boolean; // fixed-mindset phrasing (agree = fixed)
}

// Scoring: 1=strongly disagree → 4=strongly agree
// Normal: agree = growth (4 = growth)
// Reverse: agree = fixed (4 = fixed → convert to 1 for growth score)
const questions: Question[] = [
  { ko: "나는 노력하면 내 지능이나 능력을 상당히 바꿀 수 있다고 생각한다", en: "I believe I can significantly change my intelligence and abilities through effort", ja: "努力すれば、自分の知能や能力をかなり変えられると思う", zh: "我相信通过努力，我可以显著改变自己的智力和能力", fr: "Je crois pouvoir faire évoluer nettement mon intelligence et mes capacités par l'effort", es: "Creo que puedo cambiar de forma significativa mi inteligencia y mis capacidades mediante el esfuerzo" },
  { ko: "사람의 재능은 태어날 때부터 거의 정해져 있다", en: "A person's talents are mostly determined at birth", ja: "人の才能は生まれたときからほぼ決まっている", zh: "一个人的才能基本上从出生时就已经决定了", fr: "Les talents d'une personne sont en grande partie déterminés à la naissance", es: "Los talentos de una persona están determinados en gran parte desde el nacimiento", reverse: true },
  { ko: "실패는 나에 대해 배울 수 있는 기회라고 생각한다", en: "I believe failure is an opportunity to learn about myself", ja: "失敗は自分について学べる機会だと思う", zh: "我认为失败是了解自己的机会", fr: "Je considère l'échec comme une occasion d'en apprendre sur moi-même", es: "Creo que el fracaso es una oportunidad para aprender sobre mí" },
  { ko: "어떤 분야에서 내가 잘하지 못하면, 그것은 그냥 내 능력이 부족한 것이다", en: "If I'm not good at something, it just means I lack that ability", ja: "何かが得意でない場合、それは単に能力が不足しているだけだ", zh: "如果我不擅长某个领域，那只是说明我缺少那方面的能力", fr: "Si je ne suis pas bon dans un domaine, cela veut simplement dire que je n'ai pas cette capacité", es: "Si no soy bueno en algo, simplemente significa que me falta esa capacidad", reverse: true },
  { ko: "도전적인 문제가 쉬운 문제보다 더 흥미롭다", en: "Challenging problems are more interesting to me than easy ones", ja: "難しい問題の方が簡単な問題より面白い", zh: "对我来说，有挑战性的问题比简单的问题更有意思", fr: "Les problèmes stimulants m'intéressent plus que les problèmes faciles", es: "Los problemas desafiantes me resultan más interesantes que los fáciles" },
  { ko: "비판이나 피드백을 받으면 방어적이 되기보다 배울 점을 찾는다", en: "When I receive criticism or feedback, I look for what I can learn rather than becoming defensive", ja: "批判やフィードバックを受けると、防御的になるよりも学べることを探す", zh: "收到批评或反馈时，我会寻找可以学习的地方，而不是变得防御", fr: "Quand je reçois une critique ou un retour, je cherche ce que je peux en apprendre plutôt que de me défendre", es: "Cuando recibo críticas o comentarios, busco qué puedo aprender en lugar de ponerme a la defensiva" },
  { ko: "내 능력은 이미 결정되어 있어서 크게 변하기 어렵다", en: "My abilities are already determined and hard to change significantly", ja: "自分の能力はすでに決まっていて、大きく変えることは難しい", zh: "我的能力已经定型，很难发生大的改变", fr: "Mes capacités sont déjà définies et il est difficile de les changer vraiment", es: "Mis capacidades ya están definidas y es difícil cambiarlas de forma importante", reverse: true },
  { ko: "다른 사람의 성공은 나에게 영감이 된다", en: "Other people's success inspires me", ja: "他人の成功は私へのインスピレーションになる", zh: "他人的成功会给我带来启发", fr: "La réussite des autres m'inspire", es: "El éxito de otras personas me inspira" },
  { ko: "어렵고 오래 걸리는 것보다 내가 잘하는 것을 하는 것이 더 좋다", en: "I prefer doing things I'm already good at rather than difficult long-term challenges", ja: "難しくて時間がかかることより、得意なことをする方が好きだ", zh: "比起困难且需要长期投入的挑战，我更愿意做自己已经擅长的事", fr: "Je préfère faire ce que je sais déjà bien faire plutôt que relever des défis difficiles et longs", es: "Prefiero hacer cosas que ya se me dan bien antes que asumir desafíos difíciles y de largo plazo", reverse: true },
  { ko: "꾸준한 노력이 선천적 재능보다 더 중요하다고 믿는다", en: "I believe consistent effort is more important than innate talent", ja: "継続的な努力が生まれ持った才能より重要だと信じる", zh: "我相信持续努力比天生才能更重要", fr: "Je crois que l'effort régulier compte plus que le talent inné", es: "Creo que el esfuerzo constante es más importante que el talento innato" },
];

const TYPES: Record<MindsetType, {
  emoji: string;
  color: string;
  scoreRange: string;
  ko: { title: string; description: string; traits: string[]; tip: string };
  en: { title: string; description: string; traits: string[]; tip: string };
  ja: { title: string; description: string; traits: string[]; tip: string };
  zh: { title: string; description: string; traits: string[]; tip: string };
  fr: { title: string; description: string; traits: string[]; tip: string };
  es: { title: string; description: string; traits: string[]; tip: string };
}> = {
  growth: {
    emoji: "🌱",
    color: "#10b981",
    scoreRange: "34–40",
    ko: {
      title: "성장 마인드셋",
      description: "당신은 능력과 지능이 노력을 통해 발전할 수 있다고 강하게 믿습니다. 도전을 두려워하지 않고, 실패를 학습의 기회로 보며, 타인의 성공에서 영감을 얻습니다. 이것은 캐럴 드웩이 제시한 이상적인 마인드셋입니다.",
      traits: ["도전을 즐김", "실패에서 배움", "노력을 가치 있게 여김", "비판을 건설적으로 수용", "타인 성공에 영감"],
      tip: "성장 마인드셋을 이미 갖추고 있습니다! 이것을 주변 사람들과 공유하고, 특히 어려운 시기에도 이 관점을 유지하는 연습을 해보세요.",
    },
    en: {
      title: "Growth Mindset",
      description: "You strongly believe that abilities and intelligence can develop through effort. You embrace challenges, see failure as a learning opportunity, and find inspiration in others' success. This is the ideal mindset Carol Dweck describes.",
      traits: ["Embraces challenges", "Learns from failure", "Values effort", "Accepts criticism constructively", "Inspired by others' success"],
      tip: "You already have a growth mindset! Share it with those around you and practice maintaining this perspective even during difficult times.",
    },
    ja: {
      title: "成長マインドセット",
      description: "能力と知能は努力によって発展できると強く信じています。挑戦を恐れず、失敗を学習の機会と見て、他者の成功からインスピレーションを得ます。これはキャロル・ドゥエックが示した理想的なマインドセットです。",
      traits: ["挑戦を楽しむ", "失敗から学ぶ", "努力を価値あるものとして見る", "批判を建設的に受け入れる", "他者の成功にインスピレーションを得る"],
      tip: "すでに成長マインドセットを持っています！これを周りの人と共有し、特に困難な時期にもこの視点を維持する練習をしましょう。",
    },
    zh: {
      title: "成长型思维",
      description: "你非常相信能力和智力可以通过努力发展。你愿意迎接挑战，把失败看作学习机会，也会从他人的成功中获得启发。这正是卡罗尔·德韦克所描述的理想思维模式。",
      traits: ["乐于接受挑战", "从失败中学习", "重视努力", "建设性地接受批评", "从他人的成功中获得启发"],
      tip: "你已经具备成长型思维！可以把这种视角分享给身边的人，并练习在困难时期也保持这种看法。",
    },
    fr: {
      title: "Mentalité de croissance",
      description: "Vous croyez fortement que les capacités et l'intelligence peuvent se développer grâce à l'effort. Vous accueillez les défis, voyez l'échec comme une occasion d'apprendre et trouvez de l'inspiration dans la réussite des autres. C'est la mentalité idéale décrite par Carol Dweck.",
      traits: ["Accueille les défis", "Apprend de l'échec", "Valorise l'effort", "Reçoit les critiques de façon constructive", "S'inspire de la réussite des autres"],
      tip: "Vous avez déjà une mentalité de croissance ! Partagez-la avec votre entourage et entraînez-vous à garder cette perspective, surtout dans les périodes difficiles.",
    },
    es: {
      title: "Mentalidad de crecimiento",
      description: "Crees firmemente que las capacidades y la inteligencia pueden desarrollarse mediante el esfuerzo. Aceptas los desafíos, ves el fracaso como una oportunidad de aprendizaje y encuentras inspiración en el éxito de los demás. Esta es la mentalidad ideal que describe Carol Dweck.",
      traits: ["Acepta desafíos", "Aprende del fracaso", "Valora el esfuerzo", "Recibe críticas de forma constructiva", "Se inspira en el éxito de los demás"],
      tip: "Ya tienes una mentalidad de crecimiento. Compártela con quienes te rodean y practica mantener esta perspectiva incluso en momentos difíciles.",
    },
  },
  mixed_growth: {
    emoji: "🌿",
    color: "#3b82f6",
    scoreRange: "27–33",
    ko: {
      title: "성장 우세 혼합형",
      description: "당신은 대체로 성장 마인드셋을 가지고 있지만, 특정 영역이나 상황에서는 고정 마인드셋이 나타나기도 합니다. 자신의 능력을 믿고 도전을 받아들이지만, 때로는 실패나 비판에 방어적이 될 수 있습니다.",
      traits: ["대부분 도전 수용", "노력을 중요시 여김", "특정 상황에서 방어적", "실패 후 회복 가능"],
      tip: "'아직 못 하는 것'이라는 관점을 연습해보세요. '나는 이것을 못 한다' 대신 '나는 아직 이것을 잘 못 한다'라고 말하는 작은 언어 변화가 큰 차이를 만듭니다.",
    },
    en: {
      title: "Mostly Growth Mindset",
      description: "You generally have a growth mindset, but a fixed mindset can appear in certain areas or situations. You trust your abilities and embrace challenges, but may sometimes become defensive about failures or criticism.",
      traits: ["Generally embraces challenges", "Values effort", "Occasionally defensive in certain situations", "Can recover after failure"],
      tip: "Practice the 'not yet' perspective. The small language shift from 'I can't do this' to 'I can't do this yet' makes a big difference.",
    },
    ja: {
      title: "成長優勢の混合型",
      description: "おおむね成長マインドセットを持っていますが、特定の領域や状況で固定マインドセットが現れることもあります。自分の能力を信じて挑戦を受け入れますが、失敗や批判に防御的になることがあります。",
      traits: ["ほとんどの場合挑戦を受け入れる", "努力を重要視する", "特定の状況で防御的になる", "失敗後の回復が可能"],
      tip: "「まだ」という視点を練習しましょう。「私にはできない」から「私にはまだできない」への小さな言葉の変化が大きな違いを生みます。",
    },
    zh: {
      title: "成长倾向混合型",
      description: "你总体上具备成长型思维，但在某些领域或情境中也可能出现固定型思维。你相信自己的能力并愿意接受挑战，不过有时面对失败或批评会变得防御。",
      traits: ["通常愿意接受挑战", "重视努力", "在特定情境中偶尔防御", "失败后能够恢复"],
      tip: "练习“还不会”的视角。把“我做不到这个”改成“我还做不到这个”，这样小小的语言变化会带来很大不同。",
    },
    fr: {
      title: "Mentalité surtout orientée croissance",
      description: "Vous avez globalement une mentalité de croissance, mais une mentalité fixe peut apparaître dans certains domaines ou certaines situations. Vous faites confiance à vos capacités et acceptez les défis, même si l'échec ou la critique peut parfois vous rendre défensif.",
      traits: ["Accepte généralement les défis", "Valorise l'effort", "Peut être défensif dans certaines situations", "Peut rebondir après un échec"],
      tip: "Entraînez-vous à penser en termes de « pas encore ». Passer de « je ne sais pas faire ça » à « je ne sais pas encore faire ça » peut changer beaucoup de choses.",
    },
    es: {
      title: "Mentalidad mayormente de crecimiento",
      description: "En general tienes una mentalidad de crecimiento, aunque una mentalidad fija puede aparecer en ciertas áreas o situaciones. Confías en tus capacidades y aceptas desafíos, pero a veces puedes ponerte a la defensiva ante el fracaso o la crítica.",
      traits: ["Suele aceptar desafíos", "Valora el esfuerzo", "A veces se defiende en ciertas situaciones", "Puede recuperarse después del fracaso"],
      tip: "Practica la perspectiva del “todavía no”. Cambiar “no puedo hacer esto” por “todavía no puedo hacer esto” marca una diferencia importante.",
    },
  },
  mixed_fixed: {
    emoji: "🌱",
    color: "#f59e0b",
    scoreRange: "20–26",
    ko: {
      title: "고정 우세 혼합형",
      description: "당신은 일부 성장 마인드셋을 가지고 있지만, 자신의 능력이나 재능이 대체로 고정되어 있다고 생각하는 경향이 있습니다. 도전이나 실패 앞에서 포기하거나 회피하는 패턴이 나타날 수 있습니다.",
      traits: ["재능은 타고난다고 믿는 경향", "실패 시 자신을 탓하는 경향", "편안한 영역 선호", "비판에 다소 방어적"],
      tip: "노력의 효과를 작은 것부터 직접 경험해보세요. 새로운 기술을 습득하는 과정에서 '나는 점점 나아지고 있다'고 의식적으로 인식하는 연습이 도움됩니다.",
    },
    en: {
      title: "Mostly Fixed Mindset",
      description: "You have some growth mindset elements, but tend to view your abilities and talents as generally fixed. You may show patterns of giving up or avoiding when facing challenges or failure.",
      traits: ["Tends to believe talent is innate", "Inclined to blame self on failure", "Prefers comfort zones", "Somewhat defensive about criticism"],
      tip: "Experience the effects of effort firsthand, starting small. Consciously recognizing 'I'm getting better' during the process of acquiring new skills is helpful.",
    },
    ja: {
      title: "固定優勢の混合型",
      description: "一部の成長マインドセットを持っていますが、自分の能力や才能がおおむね固定されていると考える傾向があります。挑戦や失敗の前に諦めたり回避したりするパターンが現れることがあります。",
      traits: ["才能は生まれつきだと信じる傾向", "失敗時に自分を責める傾向", "快適な領域を好む", "批判にやや防御的"],
      tip: "小さなことから努力の効果を直接体験してみましょう。新しいスキルを習得する過程で「上手くなっている」と意識的に認識する練習が役立ちます。",
    },
    zh: {
      title: "固定倾向混合型",
      description: "你有一些成长型思维的元素，但倾向于认为自己的能力和才能大体是固定的。面对挑战或失败时，可能会出现放弃或回避的模式。",
      traits: ["倾向于相信才能是天生的", "失败时容易责怪自己", "偏好舒适区", "对批评有些防御"],
      tip: "从小处开始亲身体验努力的效果。在学习新技能的过程中，有意识地注意“我正在变好”，会很有帮助。",
    },
    fr: {
      title: "Mentalité surtout fixe",
      description: "Vous avez certains éléments d'une mentalité de croissance, mais vous avez tendance à voir vos capacités et vos talents comme globalement fixes. Face aux défis ou à l'échec, vous pouvez avoir tendance à abandonner ou à éviter.",
      traits: ["Tend à croire que le talent est inné", "A tendance à se blâmer en cas d'échec", "Préfère les zones de confort", "Peut être assez défensif face aux critiques"],
      tip: "Faites directement l'expérience de l'effet de l'effort, en commençant petit. Pendant l'apprentissage d'une nouvelle compétence, remarquer consciemment « je progresse » peut beaucoup aider.",
    },
    es: {
      title: "Mentalidad mayormente fija",
      description: "Tienes algunos elementos de mentalidad de crecimiento, pero tiendes a ver tus capacidades y talentos como algo generalmente fijo. Ante los desafíos o el fracaso, pueden aparecer patrones de abandono o evitación.",
      traits: ["Tiende a creer que el talento es innato", "Suele culparse cuando falla", "Prefiere las zonas de comodidad", "Algo defensivo ante la crítica"],
      tip: "Experimenta de primera mano los efectos del esfuerzo, empezando por algo pequeño. Al adquirir una nueva habilidad, reconocer conscientemente “estoy mejorando” puede ayudarte.",
    },
  },
  fixed: {
    emoji: "🪨",
    color: "#6b7280",
    scoreRange: "10–19",
    ko: {
      title: "고정 마인드셋",
      description: "당신은 현재 사람의 능력과 지능이 대체로 고정되어 있다고 믿는 경향이 강합니다. 이것은 나쁜 것이 아니라, 단지 더 많은 성장 가능성을 열 수 있는 다른 관점이 있다는 것을 의미합니다.",
      traits: ["재능이 고정적이라고 생각", "도전 회피 경향", "실패를 능력 부족으로 해석", "비판에 방어적"],
      tip: "시작점은 인식입니다. '나는 지금 고정 마인드셋을 보이고 있구나'라고 알아채는 것만으로도 변화가 시작됩니다. 캐럴 드웩의 《마인드셋》을 읽어보시기를 강력히 추천합니다.",
    },
    en: {
      title: "Fixed Mindset",
      description: "You currently have a strong tendency to believe that people's abilities and intelligence are mostly fixed. This isn't bad — it simply means there's a different perspective that can open more growth possibilities.",
      traits: ["Views talent as fixed", "Tends to avoid challenges", "Interprets failure as lack of ability", "Defensive about criticism"],
      tip: "The starting point is awareness. Simply noticing 'I'm showing a fixed mindset right now' begins change. Strongly recommend reading Carol Dweck's 'Mindset.'",
    },
    ja: {
      title: "固定マインドセット",
      description: "現在、人の能力と知能がおおむね固定されていると信じる傾向が強いです。これは悪いことではなく、より多くの成長の可能性を開ける別の視点があることを意味します。",
      traits: ["才能が固定的だと考える", "挑戦を回避する傾向", "失敗を能力不足として解釈する", "批判に防御的"],
      tip: "出発点は認識です。「今、固定マインドセットを見せているな」と気づくだけで変化が始まります。キャロル・ドゥエックの『マインドセット』を読むことを強くお勧めします。",
    },
    zh: {
      title: "固定型思维",
      description: "你目前很倾向于相信人的能力和智力大多是固定的。这并不代表不好，只是意味着还有另一种视角，可以打开更多成长的可能性。",
      traits: ["认为才能是固定的", "倾向于回避挑战", "把失败解释为能力不足", "面对批评时防御"],
      tip: "起点是觉察。只要注意到“我现在表现出了固定型思维”，改变就已经开始。强烈推荐阅读卡罗尔·德韦克的《终身成长》。",
    },
    fr: {
      title: "Mentalité fixe",
      description: "Vous avez actuellement une forte tendance à croire que les capacités et l'intelligence des personnes sont globalement fixes. Ce n'est pas mauvais en soi : cela signifie simplement qu'une autre perspective peut ouvrir davantage de possibilités de croissance.",
      traits: ["Voit le talent comme fixe", "Tend à éviter les défis", "Interprète l'échec comme un manque de capacité", "Se défend face aux critiques"],
      tip: "Le point de départ, c'est la prise de conscience. Remarquer simplement « j'adopte une mentalité fixe en ce moment » amorce déjà le changement. La lecture de Mindset de Carol Dweck est vivement recommandée.",
    },
    es: {
      title: "Mentalidad fija",
      description: "Actualmente tienes una fuerte tendencia a creer que las capacidades y la inteligencia de las personas son, en gran parte, fijas. Esto no es algo malo; simplemente significa que existe otra perspectiva que puede abrir más posibilidades de crecimiento.",
      traits: ["Ve el talento como algo fijo", "Tiende a evitar desafíos", "Interpreta el fracaso como falta de capacidad", "Se pone a la defensiva ante críticas"],
      tip: "El punto de partida es la conciencia. Solo notar “ahora estoy mostrando una mentalidad fija” ya inicia el cambio. Es muy recomendable leer Mindset, de Carol Dweck.",
    },
  },
};

const t = {
  ko: {
    title: "성장 마인드셋 테스트",
    subtitle: "당신의 마인드셋은 고정형인가, 성장형인가?",
    instruction: "각 문장에 얼마나 동의하는지 선택해주세요",
    disagree: "동의 안 함",
    slightly: "약간 동의",
    mostly: "대체로 동의",
    agree: "완전 동의",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "마인드셋 진단 결과",
    yourScore: "성장형 점수",
    traits: "특징",
    tip: "성장 팁",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Growth Mindset Test",
    subtitle: "Fixed or Growth Mindset — Which is Yours?",
    instruction: "Choose how much you agree with each statement",
    disagree: "Disagree",
    slightly: "Slightly agree",
    mostly: "Mostly agree",
    agree: "Fully agree",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Mindset Assessment",
    yourScore: "Growth Score",
    traits: "Traits",
    tip: "Growth Tip",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "成長マインドセットテスト",
    subtitle: "固定型か成長型か — どちらがあなたのマインドセット？",
    instruction: "各文章にどれくらい同意するか選んでください",
    disagree: "同意しない",
    slightly: "少し同意",
    mostly: "ほぼ同意",
    agree: "完全に同意",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "マインドセット診断結果",
    yourScore: "成長スコア",
    traits: "特徴",
    tip: "成長のヒント",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "成长型思维测试",
    subtitle: "你的思维模式是固定型，还是成长型？",
    instruction: "请选择你对每句话的同意程度",
    disagree: "不同意",
    slightly: "稍微同意",
    mostly: "基本同意",
    agree: "完全同意",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "思维模式评估结果",
    yourScore: "成长分数",
    traits: "特征",
    tip: "成长建议",
    restart: "重新开始",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test de mentalité de croissance",
    subtitle: "Mentalité fixe ou de croissance : laquelle est la vôtre ?",
    instruction: "Choisissez votre niveau d'accord avec chaque affirmation",
    disagree: "Pas d'accord",
    slightly: "Plutôt d'accord",
    mostly: "D'accord",
    agree: "Tout à fait d'accord",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Résultat de l'évaluation",
    yourScore: "Score de croissance",
    traits: "Traits",
    tip: "Conseil de croissance",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de mentalidad de crecimiento",
    subtitle: "¿Tu mentalidad es fija o de crecimiento?",
    instruction: "Elige cuánto estás de acuerdo con cada afirmación",
    disagree: "En desacuerdo",
    slightly: "Algo de acuerdo",
    mostly: "Bastante de acuerdo",
    agree: "Totalmente de acuerdo",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Resultado de la evaluación",
    yourScore: "Puntuación de crecimiento",
    traits: "Rasgos",
    tip: "Consejo de crecimiento",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

function getType(score: number): MindsetType {
  if (score >= 34) return "growth";
  if (score >= 27) return "mixed_growth";
  if (score >= 20) return "mixed_fixed";
  return "fixed";
}

export default function GrowthMindsetTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ type: MindsetType; score: number } | null>(null);
  useRecordFinishedTest({ testId: "growth-mindset", title: "GrowthMindsetTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const gm = p.get("gm") as MindsetType | null;
    const gs = p.get("gs");
    if (gm && gs && TYPES[gm]) {
      setResult({ type: gm, score: parseInt(gs, 10) });
    }
  }, []);

  function pick(rawScore: number) {
    const q = questions[idx];
    // For reverse questions: 4→1, 3→2, 2→3, 1→4
    const score = q.reverse ? 5 - rawScore : rawScore;
    const next = answers.slice(0, idx);
    next[idx] = score;

    if (next.length < questions.length) {
      setAnswers(next);
      setTimeout(() => setIdx(next.length), 280);
    } else {
      const total = next.reduce((a, b) => a + b, 0);
      const type = getType(total);
      setResult({ type, score: total });
      const url = new URL(window.location.href);
      url.searchParams.set("gm", type);
      url.searchParams.set("gs", String(total));
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
    url.searchParams.delete("gm");
    url.searchParams.delete("gs");
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
    { label: tx.disagree, value: 1 },
    { label: tx.slightly, value: 2 },
    { label: tx.mostly, value: 3 },
    { label: tx.agree, value: 4 },
  ] as const;

  const maxScore = questions.length * 4;

  if (result) {
    const tp = TYPES[result.type];
    const td = tp[locale];
    const pct = Math.round((result.score / maxScore) * 100);
    const chartLabels: Record<SupportedLocale, { fixed: string; growth: string }> = {
      ko: { fixed: "고정형", growth: "성장형" },
      en: { fixed: "Fixed", growth: "Growth" },
      ja: { fixed: "固定型", growth: "成長型" },
      zh: { fixed: "固定型", growth: "成长型" },
      fr: { fixed: "Fixe", growth: "Croissance" },
      es: { fixed: "Fija", growth: "Crecimiento" },
    };
    const chartData = [
      { name: chartLabels[locale].fixed, value: maxScore - result.score, fill: "#6b7280" },
      { name: chartLabels[locale].growth, value: result.score, fill: "#10b981" },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `${tp.color}12`, border: `1px solid ${tp.color}40` }}>
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{tp.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{td.title}</h2>
          <p className="mt-2 text-sm text-gray-500">{tx.yourScore}: {result.score} / {maxScore}</p>
          <div className="mx-auto mt-4 max-w-xs">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: tp.color }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed">{td.description}</p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-700">🔍 {tx.traits}</h3>
          <div className="flex flex-wrap gap-2">
            {td.traits.map((trait, i) => (
              <span key={i} className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: tp.color }}>
                {trait}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 16 }}>
              <XAxis type="number" domain={[0, maxScore]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={50} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg p-4" style={{ background: `${tp.color}10`, border: `1px solid ${tp.color}30` }}>
          <h3 className="font-semibold" style={{ color: tp.color }}>💡 {tx.tip}</h3>
          <p className="mt-1 text-sm text-gray-700">{td.tip}</p>
        </div>

        <ShareResultButton
          locale={locale}
          heading={tx.resultTitle}
          emoji={tp.emoji}
          resultTitle={td.title}
          description={`${tx.yourScore}: ${result.score} / ${maxScore}`}
        />
        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            {tx.restart}
          </button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: tp.color }}>
            {copied ? tx.copied : tx.share}
          </button>
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
      options={scoreOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
      selectedValue={answers[idx] === undefined ? undefined : q.reverse ? 5 - answers[idx] : answers[idx]}
      note={tx.instruction}
      previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
      onPrevious={idx > 0 ? previous : undefined}
      onSelect={pick}
    />
  );
}
