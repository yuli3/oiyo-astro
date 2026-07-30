import type { LocalizedText } from "@/types/manifest";

import type { Big5Dimension, Big5Question } from "./types";

const BIG5_OPTIONS = [
  {
    color: "bg-red-500",
    id: "1",
    text: {
      zh: "非常不同意",
      en: "Strongly Disagree",
      es: "Totalmente en desacuerdo",
      fr: "Pas du tout d'accord",
      ja: "強くそう思わない",
      ko: "매우 그렇지 않다",
    },
    value: 1,
  },
  {
    color: "bg-orange-400",
    id: "2",
    text: {
      zh: "不同意",
      en: "Disagree",
      es: "En desacuerdo",
      fr: "Pas d'accord",
      ja: "そう思わない",
      ko: "그렇지 않다",
    },
    value: 2,
  },
  {
    color: "bg-green-600/60",
    id: "3",
    text: {
      zh: "中立",
      en: "Neutral",
      es: "Neutral",
      fr: "Neutre",
      ja: "どちらでもない",
      ko: "보통이다",
    },
    value: 3,
  },
  {
    color: "bg-green-400",
    id: "4",
    text: {
      zh: "同意",
      en: "Agree",
      es: "De acuerdo",
      fr: "D'accord",
      ja: "そう思う",
      ko: "그렇다",
    },
    value: 4,
  },
  {
    color: "bg-green-500",
    id: "5",
    text: {
      zh: "非常同意",
      en: "Strongly Agree",
      es: "Totalmente de acuerdo",
      fr: "Tout à fait d'accord",
      ja: "強くそう思う",
      ko: "매우 그렇다",
    },
    value: 5,
  },
];

export const BIG5_QUESTIONS: Big5Question[] = [
  // Openness (개방성)
  {
    dimension: "openness",
    id: "o1",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "我的想象力很丰富。",
      en: "I have a vivid imagination.",
      es: "Tengo una imaginación muy viva.",
      fr: "J'ai une imagination débordante.",
      ja: "私は想像力が豊かです。",
      ko: "나는 상상력이 풍부합니다.",
    },
  },
  {
    dimension: "openness",
    id: "o2",
    isReversed: true,
    options: BIG5_OPTIONS,
    text: {
      zh: "我对抽象的想法不感兴趣。",
      en: "I am not interested in abstract ideas.",
      es: "No me interesan las ideas abstractas.",
      fr: "Je ne suis pas intéressé par les idées abstraites.",
      ja: "私は抽象的なアイデアには興味がありません。",
      ko: "나는 추상적인 아이디어에 관심이 없습니다.",
    },
  },
  {
    dimension: "openness",
    id: "o3",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "I love to think up new ways of doing things.",
      en: "I love to think up new ways of doing things.",
      es: "I love to think up new ways of doing things.",
      fr: "I love to think up new ways of doing things.",
      ja: "I love to think up new ways of doing things.",
      ko: "나는 새로운 방식을 고안해내는 것을 좋아합니다.",
    },
  },

  // Conscientiousness (성실성)
  {
    dimension: "conscientiousness",
    id: "c1",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "我会立即做家务。",
      en: "I get chores done right away.",
      es: "Hago las tareas de inmediato.",
      fr: "Je fais mes corvées tout de suite.",
      ja: "私は家事をすぐに片付けます。",
      ko: "나는 집안일을 즉시 처리합니다.",
    },
  },
  {
    dimension: "conscientiousness",
    id: "c2",
    isReversed: true,
    options: BIG5_OPTIONS,
    text: {
      zh: "我经常忘记把东西放回原处。",
      en: "I often forget to put things back in their proper place.",
      es: "A menudo olvido poner las cosas en su lugar.",
      fr: "J'oublie souvent de remettre les choses à leur place.",
      ja: "私はよく物を元の場所に戻すのを忘れます。",
      ko: "나는 종종 물건을 제자리에 두는 것을 깜빡합니다.",
    },
  },
  {
    dimension: "conscientiousness",
    id: "c3",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "I like order.",
      en: "I like order.",
      es: "I like order.",
      fr: "I like order.",
      ja: "I like order.",
      ko: "나는 질서를 좋아합니다.",
    },
  },

  // Extraversion (외향성)
  {
    dimension: "extraversion",
    id: "e1",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "我是聚会的核心人物。",
      en: "I am the life of the party.",
      es: "Soy el alma de la fiesta.",
      fr: "Je suis l'âme de la fête.",
      ja: "私はパーティーの中心人物です。",
      ko: "나는 파티의 분위기 메이커입니다.",
    },
  },
  {
    dimension: "extraversion",
    id: "e2",
    isReversed: true,
    options: BIG5_OPTIONS,
    text: {
      zh: "我不怎么说话。",
      en: "I do not talk a lot.",
      es: "No hablo mucho.",
      fr: "Je ne parle pas beaucoup.",
      ja: "私はあまり話しません。",
      ko: "나는 말을 많이 하지 않는 편입니다.",
    },
  },
  {
    dimension: "extraversion",
    id: "e3",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "I feel comfortable around people.",
      en: "I feel comfortable around people.",
      es: "I feel comfortable around people.",
      fr: "I feel comfortable around people.",
      ja: "I feel comfortable around people.",
      ko: "나는 사람들과 함께 있을 때 편안함을 느낍니다.",
    },
  },

  // Agreeableness (우호성)
  {
    dimension: "agreeableness",
    id: "a1",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "我同情别人的感受。",
      en: "I sympathize with others' feelings.",
      es: "Simpatizo con los sentimientos de los demás.",
      fr: "Je sympathise avec les sentiments des autres.",
      ja: "私は他人の感情に共感します。",
      ko: "나는 다른 사람의 감정에 공감합니다.",
    },
  },
  {
    dimension: "agreeableness",
    id: "a2",
    isReversed: true,
    options: BIG5_OPTIONS,
    text: {
      zh: "我很少关心别人。",
      en: "I feel little concern for others.",
      es: "Siento poca preocupación por los demás.",
      fr: "Je me soucie peu des autres.",
      ja: "私は他人に関心があまりありません。",
      ko: "나는 다른 사람들에게 별로 관심이 없습니다.",
    },
  },
  {
    dimension: "agreeableness",
    id: "a3",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "I take time out for others.",
      en: "I take time out for others.",
      es: "I take time out for others.",
      fr: "I take time out for others.",
      ja: "I take time out for others.",
      ko: "나는 다른 사람들을 위해 시간을 냅니다.",
    },
  },

  // Neuroticism (신경증)
  {
    dimension: "neuroticism",
    id: "n1",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "我很容易感到压力。",
      en: "I get stressed out easily.",
      es: "Me estreso fácilmente.",
      fr: "Je suis facilement stressé.",
      ja: "私はすぐにストレスを感じます。",
      ko: "나는 쉽게 스트레스를 받습니다.",
    },
  },
  {
    dimension: "neuroticism",
    id: "n2",
    isReversed: true,
    options: BIG5_OPTIONS,
    text: {
      zh: "我大部分时间都很放松。",
      en: "I am relaxed most of the time.",
      es: "Estoy relajado la mayor parte del tiempo.",
      fr: "Je suis détendu la plupart du temps.",
      ja: "私はほとんどの時間リラックスしています。",
      ko: "나는 대부분의 시간 동안 편안함을 느낍니다.",
    },
  },
  {
    dimension: "neuroticism",
    id: "n3",
    isReversed: false,
    options: BIG5_OPTIONS,
    text: {
      zh: "I worry about things.",
      en: "I worry about things.",
      es: "I worry about things.",
      fr: "I worry about things.",
      ja: "I worry about things.",
      ko: "나는 걱정을 많이 하는 편입니다.",
    },
  },
];

export const BIG5_INSIGHTS: Record<
  Big5Dimension,
  { high: LocalizedText; low: LocalizedText }
> = {
  agreeableness: {
    high: {
      zh: "你的心是一扇敞开的门。你的仁慈是疲惫世界的治愈之香。",
      en: "Your heart is an open door. Your kindness is a healing balm to a weary world.",
      es: "Tu corazón es una puerta abierta. Tu amabilidad es un bálsamo curativo para un mundo cansado.",
      fr: "Votre cœur est une porte ouverte. Votre gentillesse est un baume apaisant pour un monde fatigué.",
      ja: "あなたの心は開かれた扉のようです。あなたの親切は、疲れた世界への癒しのバームです。",
      ko: "당신의 마음은 열린 문과 같습니다. 당신의 친절은 지친 세상에 치유의 연고가 됩니다.",
    } as LocalizedText,
    low: {
      zh: "你拥有真理之剑。为了逻辑公正，你不怕孤军奋斗。",
      en: "You possess the sword of truth. You are not afraid to stand alone for what is logical and just.",
      es: "Posees la espada de la verdad. No tienes miedo de estar solo por lo que es lógico y justo.",
      fr: "Vous possédez l'épée de la vérité. Vous n'avez pas peur de vous tenir seul pour ce qui est logique et juste.",
      ja: "あなたは真実の剣を持っています。論理的で正しいことのために、一人で立つことを恐れません。",
      ko: "당신은 진실의 검을 가지고 있습니다. 논리와 정의를 위해 홀로 서는 것을 두려워하지 않습니다.",
    } as LocalizedText,
  },
  conscientiousness: {
    high: {
      zh: "你是命运的建筑师。你对细节的关注和自律铸就了伟大的事业。",
      en: "You are the architect of your destiny. Your attention to detail and discipline builds great things.",
      es: "Eres el arquitecto de tu destino. Tu atención al detalle y tu disciplina construyen grandes cosas.",
      fr: "Vous êtes l'architecte de votre destin. Votre attention aux détails et votre discipline construisent de grandes choses.",
      ja: "あなたは運命の設計者です。あなたの細部への注意と自己規律が偉大なものを築き上げます。",
      ko: "당신은 운명의 설계자입니다. 당신의 꼼꼼함과 규율이 위대한 것들을 만들어냅니다.",
    } as LocalizedText,
    low: {
      zh: "你像水一样流动，自发且适应力强。你在别人看到混乱的地方发现令人喜悦的惊喜。",
      en: "You flow like water, spontaneous and adaptable. You find joyful surprises where others see disorder.",
      es: "Fluyes como el agua, espontáneo y adaptable. Encuentras sorpresas alegres donde otros ven desorden.",
      fr: "Vous coulez comme l'eau, spontané et adaptable. Vous trouvez des surprises joyeuses là où d'autres voient le désordre.",
      ja: "あなたは水のように流れ、即興的で適応力があります。他の人が無秩序を見るところに、楽しい驚きを見出します。",
      ko: "당신은 물처럼 흐르며 즉흥적이고 적응력이 뛰어납니다. 남들이 무질서를 볼 때 즐거운 놀라움을 발견합니다.",
    } as LocalizedText,
  },
  extraversion: {
    high: {
      zh: "你像太阳一样发光，从连接中汲取能量。你的存在温暖了周围的人。",
      en: "You shine like the sun, drawing energy from connection. Your presence warms those around you.",
      es: "Brillas como el sol, extrayendo energía de la conexión. Tu presencia calienta a quienes te rodean.",
      fr: "Vous brillez comme le soleil, puisant votre énergie dans les connexions. Votre présence réchauffe ceux qui vous entourent.",
      ja: "あなたは太陽のように輝き、つながりからエネルギーを得ます。あなたの存在は周囲の人々を温めます。",
      ko: "당신은 태양처럼 빛나며 연결 속에서 에너지를 얻습니다. 당신의 존재는 주변 사람들을 따뜻하게 합니다.",
    } as LocalizedText,
    low: {
      zh: "你就像深夜的月光，沉思而深邃。你的内心世界丰富而广阔。",
      en: "You are like the deep moonlit night, contemplative and profound. Your inner world is rich and vast.",
      es: "Eres como la profunda noche a la luz de la luna, contemplativo y profundo. Tu mundo interior es rico y vasto.",
      fr: "Vous êtes comme une nuit de pleine lune, contemplatif et profond. Votre monde intérieur est riche et vaste.",
      ja: "あなたは深い月夜のように瞑想的で深遠です。あなたの内面世界は豊かで広大です。",
      ko: "당신은 깊은 달밤처럼 사색적이고 심오합니다. 당신의 내면 세계는 풍요롭고 광활합니다.",
    } as LocalizedText,
  },
  neuroticism: {
    high: {
      zh: "你强烈地感受着世界。你的敏感让你能够感知到他人错过的深度。",
      en: "You feel the world intensely. Your sensitivity allows you to perceive depths that others miss.",
      es: "Sientes el mundo intensamente. Tu sensibilidad te permite percibir profundidades que otros pasan por alto.",
      fr: "Vous ressentez le monde intensément. Votre sensibilité vous permet de percevoir des profondeurs qui échappent aux autres.",
      ja: "あなたは世界を強烈に感じます。あなたの感受性は、他の人が見落とす深みを感知することを可能にします。",
      ko: "당신은 세상을 강렬하게 느낍니다. 당신의 예민함은 남들이 놓치는 깊이를 감지하게 해줍니다.",
    } as LocalizedText,
    low: {
      zh: "你是暴风雨中平静的中心。你不可动摇且宁静，给混乱带来和平。",
      en: "You are the calm eye of the storm. Unshakable and serene, you bring peace to chaos.",
      es: "Eres el ojo tranquilo de la tormenta. Inquebrantable y sereno, traes paz al caos.",
      fr: "Vous êtes le calme au centre de la tempête. Inébranlable et serein, vous apportez la paix au chaos.",
      ja: "あなたは嵐の目のような穏やかさを持っています。揺るぎない平穏さで、混迷の中に平和をもたらします。",
      ko: "당신은 폭풍의 눈처럼 평온합니다. 흔들리지 않는 고요함으로 혼돈 속에 평화를 가져옵니다.",
    } as LocalizedText,
  },
  openness: {
    high: {
      zh: "你的思想是充满好奇的大海。你像在新鲜画布上作画的艺术家一样拥抱新体验。",
      en: "Your mind is a vast ocean of curiosity. You embrace new experiences like an artist painting on a fresh canvas.",
      es: "Tu mente es un vasto océano de curiosidad. Abrazas nuevas experiencias como un artista pintando en un lienzo fresco.",
      fr: "Votre esprit est un vaste océan de curiosité. Vous accueillez les nouvelles expériences comme un artiste peignant sur une toile vierge.",
      ja: "あなたの心は好奇心の広大な海のようです。新しい体験を、真っ白なキャンバスに描く芸術家のように受け入れます。",
      ko: "당신의 마음은 호기심의 넓은 바다와 같습니다. 새로운 경험을 캔버스 위의 화가처럼 받아들입니다.",
    } as LocalizedText,
    low: {
      zh: "你重视传统和一致性。你是不断变化的世界中提供稳定性的基石。",
      en: "You value tradition and consistency. You are the rock that provides stability in a changing world.",
      es: " Valoras la tradición y la coherencia. Eres la roca que proporciona estabilidad en un mundo cambiante.",
      fr: "Vous valorisez la tradition et la cohérence. Vous êtes le rocher qui apporte la stabilité dans un monde en mouvement.",
      ja: "あなたは伝統と一貫性を大切にします。変化する世界の中で安定をもたらす岩のような存在です。",
      ko: "당신은 전통과 일관성을 소중히 여깁니다. 변화하는 세상에서 안정감을 주는 바위와 같습니다.",
    } as LocalizedText,
  },
};
