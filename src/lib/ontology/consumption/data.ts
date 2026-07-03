import { LocalizedText } from "@/types/manifest";

import { ConsumptionTrait } from "./types";

export const CONSUMPTION_QUESTIONS = [
  // 1. Shopping List
  {
    id: "con_1",
    options: [
      {
        id: "v",
        text: {
          zh: "只写必要物品的清单",
          en: "A perfect list of only necessities",
          es: "Una lista perfecta de solo lo necesario",
          fr: "Une liste parfaite des nécessités uniquement",
          ja: "必要なものだけのリスト",
          ko: "필요한 것만 적힌 완벽한 리스트",
        },
        trait: "value_oriented",
      },
      {
        id: "i",
        text: {
          zh: "没有清单，去了再决定",
          en: "No list. Decide when I get there",
          es: "Sin lista. Decido al llegar",
          fr: "Pas de liste. Je décide sur place",
          ja: "リストはない。行ってから決める",
          ko: "리스트는 없다. 가서 결정한다",
        },
        trait: "impulsive",
      },
    ],
    text: {
      zh: "去超市前的购物清单是？",
      en: "Before going to the store, your shopping list is:",
      es: "Lista de compras antes de ir a la tienda:",
      fr: "Liste de courses avant d'aller au magasin :",
      ja: "買い物に行く前のリストは？",
      ko: "마트에 가기 전, 당신의 쇼핑 리스트는?",
    },
  },
  // 2. Limited Edition
  {
    id: "con_2",
    options: [
      {
        id: "e",
        text: {
          zh: "心跳加速，产生收藏欲",
          en: "My heart races, I must have it",
          es: "Mi corazón se acelera, debo tenerlo",
          fr: "Mon cœur s'emballe, je le veux",
          ja: "胸が高鳴り、欲しくなる",
          ko: "가슴이 뛰고 소장 욕구가 솟구친다",
        },
        trait: "emotional_satisfaction",
      },
      {
        id: "v",
        text: {
          zh: "认为只是营销手段，直接跳过",
          en: "Just a marketing trick, I pass",
          es: "Solo un truco de marketing, paso",
          fr: "Juste une ruse marketing, je passe",
          ja: "ただのマーケティングだと思い、通り過ぎる",
          ko: "마케팅 상술일 뿐이라 생각하고 지나친다",
        },
        trait: "value_oriented",
      },
    ],
    text: {
      zh: "看到“限量版”时的反应是？",
      en: 'Your reaction to "Limited Edition":',
      es: 'Reacción a "Edición Limitada":',
      fr: 'Réaction à "Édition Limitée" :',
      ja: "「限定版」という言葉を見た時の反応は？",
      ko: '"한정판"이라는 문구를 보았을 때 반응은?',
    },
  },
  // 3. Gift Buying
  {
    id: "con_3",
    options: [
      {
        id: "p",
        text: {
          zh: "品牌知名度和档次",
          en: "Brand recognition and prestige",
          es: "El reconocimiento de la marca y el prestigio",
          fr: "La reconnaissance de la marque et le prestige",
          ja: "ブランドの認知度と品格",
          ko: "브랜드 인지도와 품격",
        },
        trait: "prestige_seeking",
      },
      {
        id: "e",
        text: {
          zh: "收礼人的喜好和感动",
          en: "Receiver's taste and emotional impact",
          es: "El gusto del receptor y el impacto emocional",
          fr: "Les goûts du destinataire et l'impact émotionnel",
          ja: "相手の好みと感動",
          ko: "받는 사람의 취향과 감동",
        },
        trait: "emotional_satisfaction",
      },
    ],
    text: {
      zh: "送礼物给重要的人时最看重的是？",
      en: "What is most important when giving a gift?",
      es: "Lo más importante al dar un regalo:",
      fr: "Le plus important lors d'un cadeau :",
      ja: "大切な人へのプレゼントで一番大切なのは？",
      ko: "소중한 사람에게 선물을 줄 때 가장 중요하게 생각하는 것은?",
    },
  },
  // 4. Broken Item
  {
    id: "con_4",
    options: [
      {
        id: "s",
        text: {
          zh: "先看能不能修好再用",
          en: "Check if it can be repaired first",
          es: "Comprobar primero si se puede reparar",
          fr: "Vérifier d'abord si cela peut être réparé",
          ja: "直して使えるかまず調べる",
          ko: "고쳐서 쓸 수 있는지 먼저 알아본다",
        },
        trait: "sustainable",
      },
      {
        id: "i",
        text: {
          zh: "立刻买个更好更好的新品",
          en: "Buy a new, better version immediately",
          es: "Comprar una versión nueva y mejor inmediatamente",
          fr: "Acheter immédiatement une version neuve et meilleure",
          ja: "新しくて良い製品をすぐ買う",
          ko: "새롭고 더 좋은 신제품을 바로 산다",
        },
        trait: "impulsive",
      },
    ],
    text: {
      zh: "用很久的东西坏了，你的选择是？",
      en: "An old item is broken. Your choice?",
      es: "Un objeto viejo se ha roto. Tu elección:",
      fr: "Un vieil objet est cassé. Votre choix :",
      ja: "長く使った物が壊れた。あなたの選択は？",
      ko: "오래 쓴 물건이 고장 났다. 당신의 선택은?",
    },
  },
  // 5. Salary Day
  {
    id: "con_5",
    options: [
      {
        id: "v",
        text: {
          zh: "先扣除固定支出和存款",
          en: "Transfer fixed expenses and savings first",
          es: "Transferir primero los gastos fijos y los ahorros",
          fr: "Virer d'abord les charges fixes et l'épargne",
          ja: "固定費と貯蓄額をまず移す",
          ko: "고정 지출과 저축액을 먼저 이체한다",
        },
        trait: "value_oriented",
      },
      {
        id: "e",
        text: {
          zh: "犒劳一下自己（买好吃的等）",
          en: "Buy a small reward for myself",
          es: "Comprarme una pequeña recompensa",
          fr: "M'acheter une petite récompense",
          ja: "自分へのご褒美（美味しいものなど）を買う",
          ko: "나를 위한 작은 보상(맛있는 것 등)을 산다",
        },
        trait: "emotional_satisfaction",
      },
    ],
    text: {
      zh: "发工资了！第一件事做什么？",
      en: "Payday! What's the first thing you do?",
      es: "¡Día de pago! Lo primero que haces:",
      fr: "C'est le jour de paie ! Première chose :",
      ja: "給料が入った！一番最初にする性格は？",
      ko: "월급이 들어왔다! 가장 먼저 하는 일은?",
    },
  },
  // 6. Luxury Brand
  {
    id: "con_6",
    options: [
      {
        id: "p",
        text: {
          zh: "为了彰显社会地位和成功",
          en: "To show social status and success",
          es: "Para mostrar estatus social y éxito",
          fr: "Pour montrer son statut social et sa réussite",
          ja: "社会的地位と成功を示すため",
          ko: "사회적 위치와 성공을 보여주기 위해",
        },
        trait: "prestige_seeking",
      },
      {
        id: "v",
        text: {
          zh: "因为质量好，可以用很久",
          en: "Because the quality is good and it lasts",
          es: "Porque la calidad es buena y dura",
          fr: "Car la qualité est bonne et il dure",
          ja: "品質が良く長く使えるから",
          ko: "품질이 좋아 오래 쓸 수 있어서",
        },
        trait: "value_oriented",
      },
    ],
    text: {
      zh: "买高价名牌包的原因是？",
      en: "Why buy an expensive luxury bag?",
      es: "¿Por qué comprar un bolso de lujo?",
      fr: "Pourquoi acheter un sac de luxe ?",
      ja: "高価なブランドバッグを買う理由は？",
      ko: "고가의 명품 가방을 사는 이유는?",
    },
  },
  // 7. Eco-friendly
  {
    id: "con_7",
    options: [
      {
        id: "s",
        text: {
          zh: "是的。考虑对环境的影响",
          en: "Yes. I consider environmental impact",
          es: "Sí. Considero el impacto ambiental",
          fr: "Oui. Je considère l'impact environnemental",
          ja: "はい。環境への影響を考慮する",
          ko: "그렇다. 환경에 미칠 영향을 고려한다",
        },
        trait: "sustainable",
      },
      {
        id: "v",
        text: {
          zh: "不。性价比优先",
          en: "No. Value for money comes first",
          es: "No. La relación calidad-precio va primero",
          fr: "Non. Le rapport qualité-prix d'abord",
          ja: "いいえ。コスパが優先だ",
          ko: "아니오. 가성비가 우선이다",
        },
        trait: "value_oriented",
      },
    ],
    text: {
      zh: "即使价格更贵，也会选择环保产品吗？",
      en: "Do you choose eco-friendly even if expensive?",
      es: "¿Productos ecológicos aunque sean caros?",
      fr: "Produits éco-responsables même si chers ?",
      ja: "高くてもエコ製品を選ぶ方ですか？",
      ko: "가격이 비싸더라도 친환경 제품을 고르는 편인가?",
    },
  },
  // 8. Stressed Out
  {
    id: "con_8",
    options: [
      {
        id: "i",
        text: {
          zh: "“报复性消费”。冲动之下买东西",
          en: '"Stress-spending". Buy something on impulse',
          es: '"Gasto por estrés". Comprar algo por impulso',
          fr: '"Dépense-stress". Acheter sur un coup de tête',
          ja: "いわゆる「あけおめ費用」。勢いで何かを買う",
          ko: '일명 "시발비용". 홧김에 무언가를 산다',
        },
        trait: "impulsive",
      },
      {
        id: "s",
        text: {
          zh: "反而捂紧钱包，去散步或冥想",
          en: "Close my wallet and walk or meditate",
          es: "Cerrar la cartera y caminar o meditar",
          fr: "Fermer le portefeuille et marcher ou méditer",
          ja: "むしろ財布を閉じて散歩や瞑想をする",
          ko: "오히려 지갑을 닫고 산책이나 명상을 한다",
        },
        trait: "sustainable",
      },
    ],
    text: {
      zh: "压力大时，你的消费习惯是？",
      en: "Spending pattern when stressed?",
      es: "Patrón de gasto bajo estrés:",
      fr: "Mode de consommation sous stress :",
      ja: "ストレスが溜まった時の消費パターンは？",
      ko: "스트레스를 받았을 때, 당신의 소비 패턴은?",
    },
  },
  // 9. Sale Event
  {
    id: "con_9",
    options: [
      {
        id: "v",
        text: {
          zh: "不需要的东西，即使1块钱也不买",
          en: "Don't buy if not needed, even if cheap",
          es: "No comprar si no es necesario, aunque sea barato",
          fr: "Ne pas acheter si inutile, même pas cher",
          ja: "必要なければ1円でも買わない",
          ko: "필요 없는 물건이면 100원이라도 사지 않는다",
        },
        trait: "value_oriented",
      },
      {
        id: "i",
        text: {
          zh: "这是在省钱！先买了再说",
          en: "This is saving money! Just buy it",
          es: "¡Es un ahorro! Comprarlo ya",
          fr: "C'est une économie ! L'acheter tout de suite",
          ja: "これはお得だ！とりあえず買う",
          ko: "이건 돈 버는 거다! 일단 산다",
        },
        trait: "impulsive",
      },
    ],
    text: {
      zh: "原本没打算买的东西正在打五折。",
      en: "Item not planned is now 50% off.",
      es: "Objeto no planeado al 50%:",
      fr: "Objet non prévu à -50% :",
      ja: "買うつもりのなかった物が50%セール中だ。",
      ko: "원래 살 생각이 없던 물건이 50% 세일 중이다.",
    },
  },
  // 10. Dinner Menu
  {
    id: "con_10",
    options: [
      {
        id: "e",
        text: {
          zh: "氛围好、适合发朋友圈的地方",
          en: 'Good vibe and "Instagrammable" place',
          es: 'Buen ambiente y lugar "Instagrameable"',
          fr: 'Bonne ambiance et lieu "Instagrammable"',
          ja: "雰囲気が良く、写真映えする場所",
          ko: "분위기가 좋고 인스타 감성이 넘치는 곳",
        },
        trait: "emotional_satisfaction",
      },
      {
        id: "v",
        text: {
          zh: "好吃、量大、价格公道的地方",
          en: "Tasty, large portions, and fair price",
          es: "Sabroso, raciones grandes y precio justo",
          fr: "Savoureux, copieux et prix juste",
          ja: "美味しくて量が多く、価格が安い場所",
          ko: "맛있고 양 푸짐하고 가격 착한 곳",
        },
        trait: "value_oriented",
      },
    ],
    text: {
      zh: "选择晚餐菜单时的标准是？",
      en: "When choosing dinner menu with friends:",
      es: "Criterios para la cena:",
      fr: "Critères pour le dîner :",
      ja: "夕食のメニューを選ぶ時の基準は？",
      ko: "저녁 식사 메뉴를 고를 때 당신의 기준은?",
    },
  },
  // 11. Trend
  {
    id: "con_11",
    options: [
      {
        id: "p",
        text: {
          zh: "必须抢先体验才痛快",
          en: "Must try it before anyone else",
          es: "Debo probarlo antes que nadie",
          fr: "Dois l'essayer avant tout le monde",
          ja: "誰よりも早く使ってみたい",
          ko: "누구보다 먼저 써봐야 직성이 풀린다",
        },
        trait: "prestige_seeking",
      },
      {
        id: "v",
        text: {
          zh: "仔细考量配置和性价比",
          en: "Check specs and value carefully",
          es: "Verificar cuidadosamente las especificaciones y el valor",
          fr: "Vérifier soigneusement les spécificités et la valeur",
          ja: "スペックとコスパをじっくり検討する",
          ko: "스펙과 가성비를 꼼꼼히 따져본다",
        },
        trait: "value_oriented",
      },
    ],
    text: {
      zh: "流行的最新电子产品上市了。",
      en: "Latest trendy gadget released.",
      es: "Último gadget de moda lanzado:",
      fr: "Dernier gadget tendance sorti :",
      ja: "流行の最新電子機器が発売された。",
      ko: "유행하는 최신 전자기기가 출시되었다.",
    },
  },
  // 12. Investment vs Pleasure
  {
    id: "con_12",
    options: [
      {
        id: "s",
        text: {
          zh: "捐赠或赞助等让世界更好的钱",
          en: "Donations for a better world",
          es: "Donaciones para un mundo mejor",
          fr: "Dons pour un monde meilleur",
          ja: "寄付や支援など、より良い世界のための金",
          ko: "기부나 후원 등 더 나은 세상을 위한 돈",
        },
        trait: "sustainable",
      },
      {
        id: "e",
        text: {
          zh: "提高生活质量的艺术和文化生活",
          en: "Art and culture for quality of life",
          es: "Arte y cultura para la calidad de vida",
          fr: "Art et culture pour la qualité de vie",
          ja: "生活の質を高める藝術や文化生活",
          ko: "삶의 질을 높여주는 예술과 문화 생활",
        },
        trait: "emotional_satisfaction",
      },
    ],
    text: {
      zh: "认为最有价值的支出是？",
      en: "Most valuable spending?",
      es: "Gasto más valioso:",
      fr: "Dépense la plus précieuse :",
      ja: "最も価値があると思う支出は？",
      ko: "가장 가치 있다고 생각하는 지출은?",
    },
  },
  // 13. Unexpected Income
  {
    id: "con_13",
    options: [
      {
        id: "i",
        text: {
          zh: "立刻买下想买的小玩意",
          en: "Buy a small item I wanted immediately",
          es: "Comprar inmediatamente algo pequeño que quería",
          fr: "Acheter tout de suite un petit truc voulu",
          ja: "欲しかった小物をすぐ買う",
          ko: "사고 싶었던 소소한 물건을 바로 산다",
        },
        trait: "impulsive",
      },
      {
        id: "v",
        text: {
          zh: "先存进银行，以后再说",
          en: "Put it in bank and think later",
          es: "Ponerlo en el banco y pensar después",
          fr: "Mettre à la banque et réfléchir plus tard",
          ja: "とりあえず口座に入れ、後で考える",
          ko: "일단 통장에 넣어두고 나중에 생각한다",
        },
        trait: "value_oriented",
      },
    ],
    text: {
      zh: "如果意外得到100块钱？",
      en: "If you got unexpected $100?",
      es: "100€ inesperados, ¿qué haces?",
      fr: "100€ imprévus, que faites-vous ?",
      ja: "予想外の1万円が手に入ったら？",
      ko: "예상치 못한 공돈 10만원이 생겼다면?",
    },
  },
  // 14. Subscription Service
  {
    id: "con_14",
    options: [
      {
        id: "v",
        text: {
          zh: "仅体验免费期并立即取消",
          en: "Use free trial and cancel immediately",
          es: "Prueba gratuita y cancelación inmediata",
          fr: "Essai gratuit et annulation immédiate",
          ja: "無料体験だけしてすぐ解約予約する",
          ko: "무료 체험만 하고 바로 해지 예약한다",
        },
        trait: "value_oriented",
      },
      {
        id: "e",
        text: {
          zh: "为了便利和快乐持续订阅",
          en: "Keep it for convenience and joy",
          es: "Mantenerlo por conveniencia y alegría",
          fr: "Garder pour la commodité et la joie",
          ja: "便利さと楽しさのために継続する",
          ko: "삶의 편리함과 즐거움을 위해 계속 유지한다",
        },
        trait: "emotional_satisfaction",
      },
    ],
    text: {
      zh: "订阅服务时，你会？",
      en: "When signing up for subscriptions:",
      es: "Al suscribirte:",
      fr: "Lors d'un abonnement :",
      ja: "サブスクに加入する時、あなたは？",
      ko: "구독 서비스를 가입할 때 당신은?",
    },
  },
  // 15. New Travel Destination
  {
    id: "con_15",
    options: [
      {
        id: "p",
        text: {
          zh: "别人不常去的特别且高档的地方",
          en: "Unique, expensive place others don't go",
          es: "Lugar único y caro donde otros no van",
          fr: "Lieu unique et cher où les autres ne vont pas",
          ja: "他の人が行かない特別で高価な場所",
          ko: "남들이 잘 안 가는 특별하고 비싼 곳",
        },
        trait: "prestige_seeking",
      },
      {
        id: "s",
        text: {
          zh: "能与自然共存并寻找意义的地方",
          en: "Meaningful place coexisting with nature",
          es: "Lugar significativo en coexistencia con la naturaleza",
          fr: "Lieu significatif en coexistence avec la nature",
          ja: "自然と共存し、意味を見出せる場所",
          ko: "자연과 공존하며 의미를 찾을 수 있는 곳",
        },
        trait: "sustainable",
      },
    ],
    text: {
      zh: "确定旅游目的地时最重要的标准是？",
      en: "Most important factor for travel?",
      es: "Factor más importante para viajar:",
      fr: "Critère de voyage le plus important :",
      ja: "旅行先を決める一番の基準は？",
      ko: "여행지를 정할 때 가장 중요한 기준은?",
    },
  },
];
export const CONSUMPTION_RESULTS: Record<
  ConsumptionTrait,
  { description: LocalizedText; title: LocalizedText; wisdom: LocalizedText }
> = {
  emotional_satisfaction: {
    description: {
      zh: "比起拥有，更看重物品带来的情绪体验和安慰。消费是你的治愈仪式。",
      en: "You treasure emotional experience and comfort. Consumption is a healing ritual.",
      ja: "所有よりも、それが与える情緒的経験と慰めを大切にします。",
      ko: "소유보다 그 물건이 주는 정서적 경험과 위로를 소중히 여깁니다. 당신에게 소비는 치유의 의식입니다.",
    },
    title: {
      zh: "购买幸福的浪漫主义者",
      en: "Romantic Buyer of Happiness",
      ja: "幸せを買う浪漫派",
      ko: "행복을 사는 낭만가",
    },
    wisdom: {
      zh: "瞬间的安慰固然好，但为未来的自己储蓄也是一种爱。",
      en: "Momentary comfort is good, but saving for the future is also love.",
      ja: "瞬間の慰めも良いですが、未来の自分への貯蓄も一つの愛です。",
      ko: "순간의 위로도 좋지만, 미래의 당신을 위한 저축도 하나의 사랑입니다.",
    },
  },
  impulsive: {
    description: {
      zh: "根据此刻的吸引力和直觉果断决定。你的生活充满了多彩的体验。",
      en: "You decide boldly based on intuition. Your life is full of colorful experiences.",
      ja: "今この瞬間の直感に従い決断します。人生は多彩な経験に満ちています。",
      ko: "지금 이 순간의 끌림과 직관에 따라 과감하게 결정합니다. 당신의 삶은 다채로운 경험으로 가득 차 있습니다.",
    },
    title: {
      zh: "直觉冒险家",
      en: "Intuitive Adventurer",
      ja: "直感的な冒険家",
      ko: "직관적인 모험가",
    },
    wisdom: {
      zh: "直觉有时会带来惊喜，但也请尝试“72小时法则”。",
      en: "Intuition leads to discovery, but try the 72-hour rule.",
      ja: "直感は時に驚きの発見をくれますが、72時間の法則を試してください。",
      ko: "직관은 때로 놀라운 발견을 주지만, 72시간의 법칙을 실천해보세요.",
    },
  },
  prestige_seeking: {
    description: {
      zh: "高度评价作为表现手段的消费价值。你的物品体现了你的地位。",
      en: "You value consumption as expression. Your possessions speak of your status.",
      ja: "自己表現としての消費を重視します。持ち物があなたの地位を語ります。",
      ko: "자신을 표현하는 수단으로서의 소비 가치를 높게 평가합니다. 당신의 물건은 당신의 지위를 말해줍니다.",
    },
    title: {
      zh: "高雅鉴赏家",
      en: "Dignified Connoisseur",
      ja: "品格ある美食家",
      ko: "품격 있는 미식가",
    },
    wisdom: {
      zh: "真正的档次不在于拥有的物品，而在于你的行为。",
      en: "True dignity comes from actions, not possessions.",
      ja: "真の品格は持ち物ではなく、あなたの行動から生まれます。",
      ko: "진정한 품격은 소유한 물건이 아니라 당신의 행동에서 나옵니다.",
    },
  },
  sustainable: {
    description: {
      zh: "首先考虑消费对世界的影响。你的钱包就是改变世界的选票。",
      en: "You consider world impact first. Your wallet is a ballot to change the world.",
      ja: "消費が世界に与える影響をまず考えます。財布は世界を変える投票用紙です。",
      ko: "나의 소비가 세상에 미칠 영향을 먼저 고민합니다. 당신의 지갑은 세상을 바꾸는 투표용지와 같습니다.",
    },
    title: {
      zh: "深谋远虑的共生者",
      en: "Thoughtful Coexistor",
      ja: "思慮深い共生派",
      ko: "사려 깊은 공생가",
    },
    wisdom: {
      zh: "你的善良意图终将汇聚成更大的浪潮。",
      en: "Your good intentions will return as a larger wave.",
      ja: "あなたの善意が、いつか大きな波となって返ってくるでしょう。",
      ko: "당신의 선한 의지가 더 큰 물결이 되어 돌아올 것입니다.",
    },
  },
  value_oriented: {
    description: {
      zh: "根据数据寻找最佳效率。对你来说，“浪费”是不可原谅的。",
      en: 'You find optimal efficiency based on data. To you, "waste" is an unacceptable sin.',
      ja: "データに基づき最適な効率を追求します。無駄は許されざる罪です。",
      ko: '데이터와 수치를 바탕으로 최적의 소비 효율을 찾아냅니다. 당신에게 "낭비"란 용납할 수 없는 죄악입니다.',
    },
    title: {
      zh: "理性效率派",
      en: "Rational Efficiency Hunter",
      ja: "合理的効率主義者",
      ko: "이성적인 효율가",
    },
    wisdom: {
      zh: "效率固然重要，但偶尔不理性的快乐会让生活更丰富。",
      en: "Efficiency is key, but sometimes irrational joy enriches life.",
      ja: "効率も大切ですが、時には非合理な楽しみが人生を豊かにします。",
      ko: "효율도 중요하지만, 가끔은 비합리적인 즐거움이 삶을 풍요롭게 합니다.",
    },
  },
};
