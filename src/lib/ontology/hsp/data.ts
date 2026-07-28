import { LocalizedText } from "@/types/manifest";

import { HSPDimension, HSPQuestion } from "./types";

const HSP_OPTIONS = [
  {
    color: "bg-red-500",
    id: "1",
    text: {
      zh: "一点也不",
      en: "Not at all",
      es: "Para nada",
      fr: "Pas du tout",
      ja: "全くそうではない",
      ko: "전혀 아니다",
    },
    value: 1,
  },
  {
    color: "bg-orange-400",
    id: "2",
    text: {
      zh: "稍微有点",
      en: "Slightly",
      es: "Ligeramente",
      fr: "Légèrement",
      ja: "少しそう思う",
      ko: "약간 그렇다",
    },
    value: 2,
  },
  {
    color: "bg-green-600/60",
    id: "3",
    text: {
      zh: "适中",
      en: "Moderately",
      es: "Moderadamente",
      fr: "Modérément",
      ja: "ある程度そう思う",
      ko: "보통이다",
    },
    value: 3,
  },
  {
    color: "bg-green-400",
    id: "4",
    text: {
      zh: "非常",
      en: "Very",
      es: "Mucho",
      fr: "Très",
      ja: "とてもそう思う",
      ko: "매우 그렇다",
    },
    value: 4,
  },
  {
    color: "bg-green-500",
    id: "5",
    text: {
      zh: "极其",
      en: "Extremely",
      es: "Extremadamente",
      fr: "Extrêmement",
      ja: "非常にそう思う",
      ko: "극도로 그렇다",
    },
    value: 5,
  },
];

export const HSP_QUESTIONS: HSPQuestion[] = [
  // D: Depth of Processing
  {
    dimension: "D",
    id: "hsp_1",
    options: HSP_OPTIONS,
    text: {
      zh: "我有丰富而复杂的内心世界。",
      en: "I have a rich, complex inner life.",
      es: "Tengo una vida interior rica y compleja.",
      fr: "J'ai une vie intérieure riche et complexe.",
      ja: "私は豊かで複雑な内面を持っています。",
      ko: "나는 풍부하고 복잡한 내면 세계를 가지고 있다.",
    },
  },
  {
    dimension: "D",
    id: "hsp_2",
    options: HSP_OPTIONS,
    text: {
      zh: "我深受艺术或音乐的感动。",
      en: "I am deeply moved by the arts or music.",
      es: "Me conmueven profundamente las artes o la música.",
      fr: "Je suis profondément ému par les arts ou la musique.",
      ja: "私は芸術や音楽に深く感動します。",
      ko: "나는 예술이나 음악에 깊은 감동을 받는다.",
    },
  },

  // O: Overstimulation
  {
    dimension: "O",
    id: "hsp_3",
    options: HSP_OPTIONS,
    text: {
      zh: "我容易被强烈的感官输入所淹没。",
      en: "I am easily overwhelmed by strong sensory input.",
      es: "Me siento fácilmente abrumado por estímulos sensoriales fuertes.",
      fr: "Je suis facilement submergé par des stimuli sensoriels forts.",
      ja: "私は強い感覚刺激に圧倒されやすいです。",
      ko: "나는 강한 감각 자극에 쉽게 압도된다.",
    },
  },
  {
    dimension: "O",
    id: "hsp_4",
    options: HSP_OPTIONS,
    text: {
      zh: "当别人让我一次做太多事情时，我会很恼火。",
      en: "I am annoyed when people try to get me to do too many things at once.",
      es: "Me molesta cuando la gente intenta que haga demasiadas cosas a la vez.",
      fr: "Je suis agacé quand les gens essaient de me faire faire trop de choses à la fois.",
      ja: "一度に多くのことをさせられるとイライラします。",
      ko: "한 번에 너무 많은 일을 시키면 짜증이 난다.",
    },
  },

  // E: Emotional Reactivity
  {
    dimension: "E",
    id: "hsp_5",
    // Check logic: S is Sensing Subtlety.
    // Let's use S for this.
    options: HSP_OPTIONS,
    text: {
      zh: "我能注意到周围环境的细微变化。",
      en: "I notice subtleties in my environment.",
      es: "Noto las sutilezas en mi entorno.",
      fr: "Je remarque les subtilités de mon environnement.",
      ja: "私は環境の微妙な変化によく気づきます。",
      ko: "나는 환경의 미묘한 변화를 잘 알아차린다. (Note: Often also S, but categorized as E/D in some models. Sticking to S for Sensing usually, but let's map to DOES structure)",
    },
  },

  // S: Sensing the Subtle
  {
    dimension: "S",
    id: "hsp_6",
    options: HSP_OPTIONS,
    text: {
      zh: "我能注意到周围环境的细微变化。",
      en: "I notice subtleties in my environment.",
      es: "Noto las sutilezas en mi entorno.",
      fr: "Je remarque les subtilités de mon environnement.",
      ja: "私は環境の微妙な変化によく気づきます。",
      ko: "나는 환경의 미묘한 변화를 잘 알아차린다.",
    },
  },
  {
    dimension: "S",
    id: "hsp_7",
    options: HSP_OPTIONS,
    text: {
      zh: "我容易受别人情绪的影响。",
      en: "I am affected by other people's moods.",
      es: "Me afectan los estados de ánimo de otras personas.",
      fr: "Je suis affecté par l'humeur des autres.",
      ja: "私は他人の気分に影響されやすいです。",
      ko: "나는 다른 사람들의 기분에 쉽게 영향을 받는다.",
    },
  },
];

export const HSP_INSIGHTS = {
  heavenlyAntenna: {
    zh: "你拥有“天之触角”。你的敏感是一种罕见的天赋，让你能感知世间神圣的细微之处。",
    en: "You possess the 'Heavenly Antenna'. Your sensitivity is a rare gift that allows you to perceive the divine subtleties of the world.",
    es: "Posees la 'Antena Celestial'. Tu sensibilidad es un don raro que te permite percibir las sutilezas divinas del mundo.",
    fr: "Vous possédez « l'Antenne Céleste ». Votre sensibilité est un don rare qui vous permet de percevoir les subtilités divines du monde.",
    ja: "あなたは「天上のアンテナ」を持っています。あなたの繊細さは、世界の神聖な機微を感じ取る稀有な才能です。",
    ko: "당신은 '천상의 안테나'를 지녔습니다. 당신의 섬세함은 세상의 신성한 결을 읽어내는 희귀한 축복입니다.",
  },
  high: {
    zh: "你具有高度的敏感性。你感受深刻，看到别人错过的东西，但也可能需要更多的休息。",
    en: "You operate with high sensitivity. You feel deeply and see what others miss, but may need more rest.",
    es: "Operas con alta sensibilidad. Sientes profundamente y ves lo que otros pierden, pero puedes necesitar más descanso.",
    fr: "Vous fonctionnez avec une grande sensibilité. Vous ressentez profondément et voyez ce que les autres manquent, mais vous pouvez avoir besoin de plus de repos.",
    ja: "あなたは高い感受性を持っています。他人が見逃すものを見て深く感じますが、その分休息が必要です。",
    ko: "당신은 높은 민감성을 가지고 살아갑니다. 남들이 놓치는 것을 보고 깊이 느끼지만, 그만큼 휴식이 필요합니다.",
  },
  low: {
    zh: "你很有韧性，很坚强。小干扰很少打扰你，让你能勇往直前。",
    en: "You are resilient and tough. Small disturbances rarely bother you, allowing you to push forward.",
    es: "Eres resistente y duro. Las pequeñas perturbaciones rara vez te molestan, permitiéndote seguir adelante.",
    fr: "Vous êtes résilient et dur. Les petites perturbations vous dérangent rarement, vous permettant d'avancer.",
    ja: "あなたはたくましく、タフです。些細なことには動じず、前に進む力があります。",
    ko: "당신은 무던하고 강인합니다. 웬만해서는 동요하지 않으며 앞으로 나아가는 힘이 있습니다.",
  },
  medium: {
    zh: "你的敏感度适中。你可以欣赏清晰的细节，而不会轻易感到不知所措。",
    en: "You have a balanced level of sensitivity. You can appreciate clear details without being easily overwhelmed.",
    es: "Tienes un nivel equilibrado de sensibilidad. Puedes apreciar detalles claros sin sentirte abrumado fácilmente.",
    fr: "Vous avez un niveau de sensibilité équilibré. Vous pouvez apprécier des détails clairs sans être facilement submergé.",
    ja: "あなたはバランスの取れた感受性を持っています。圧倒されることなく、明確な詳細を評価できます。",
    ko: "당신은 균형 잡힌 민감성을 가지고 있습니다. 쉽게 압도되지 않으면서도 세상을 명확히 인식합니다.",
  },
};
