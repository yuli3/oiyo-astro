import { SixLangString } from "../engine.contract";

/**
 * HSP Deep Shard Data
 * HSP level data and life implications separated from logic.
 */

export interface LifeImplications {
  career: SixLangString;
  dailyLife: SixLangString;
  relationships: SixLangString;
  selfCare: SixLangString;
}

export const HSP_LEVEL_DATA: Record<
  string,
  {
    coping: SixLangString[];
    strengths: SixLangString[];
    worldview: SixLangString;
  }
> = {
  high: {
    coping: [
      {
        en: "Build buffer time into your schedule",
        es: "Incluye tiempo de reserva en tu horario",
        fr: "Prévoyez du temps tampon dans votre emploi du temps",
        ja: "スケジュールに余裕（バッファ）を持たせましょう",
        ko: "일정에 완충 시간을 확보하세요",
        zh: "在你的时间表中加入缓冲时间",
      },
      {
        en: "Practice grounding techniques when overwhelmed",
        es: "Practica técnicas de conexión a tierra cuando te sientas abrumado",
        fr: "Pratiquez des techniques d'ancrage lorsque vous êtes submergé",
        ja: "圧倒されたときはグラウンディング（地に足をつける）技法を実践しましょう",
        ko: "압도당할 때 그라운딩 기법을 연습하세요",
        zh: "在感到不知所措时练习扎根技巧",
      },
      {
        en: "Limit exposure to negative news and media",
        es: "Limita la exposición a noticias y medios negativos",
        fr: "Limitez l'exposition aux nouvelles et médias négatifs",
        ja: "ネガティブなニュースやメディアへの接触を制限しましょう",
        ko: "부정적인 뉴스와 미디어 노출을 제한하세요",
        zh: "限制接触负面新闻和媒体",
      },
      {
        en: "Create sensory-safe retreats in your home",
        es: "Crea refugios sensorialmente seguros en tu hogar",
        fr: "Créez des refuges sensoriels sûrs dans votre maison",
        ja: "家の中に感覚的に安全な避難場所を作りましょう",
        ko: "집에 감각적으로 안전한 피신처를 만드세요",
        zh: "在家中创造感官安全的安全屋",
      },
    ],
    strengths: [
      {
        en: "Profound aesthetic appreciation",
        es: "Apreciación estética profunda",
        fr: "Appréciation esthétique profonde",
        ja: "深い美的な鑑賞眼",
        ko: "깊은 미적 감상",
        zh: "深刻的美学欣赏力",
      },
      {
        en: "Strong empathy and emotional intelligence",
        es: "Fuerte empatía e inteligencia emocional",
        fr: "Forte empathie et intelligence émotionnelle",
        ja: "強い共感力と感情的知性（EQ）",
        ko: "강한 공감과 감성 지능",
        zh: "强烈的共情和情感智力",
      },
      {
        en: "Creativity and depth of processing",
        es: "Creatividad y profundidad de procesamiento",
        fr: "Créativité et profondeur de traitement",
        ja: "創造性と処理の深さ",
        ko: "창의성과 처리의 깊이",
        zh: "创造力和处理深度",
      },
      {
        en: "Attention to detail and quality",
        es: "Atención al detalle y la calidad",
        fr: "Attention aux détails et à la qualité",
        ja: "細部と品質へのこだわり",
        ko: "세부 사항과 품질에 대한 주의",
        zh: "对细节和品质的关注",
      },
      {
        en: "Ability to predict and prevent problems",
        es: "Capacidad para predecir y prevenir problemas",
        fr: "Capacité à prédire et prévenir les problèmes",
        ja: "問題を予測し、未然に防ぐ能力",
        ko: "문제를 예측하고 예방하는 능력",
        zh: "预测并防止问题的能力",
      },
    ],
    worldview: {
      en: "The world comes at you with full intensity. Colors are brighter, sounds are louder, and emotions run deeper. This is not a flaw but a different way of being - approximately 15-20% of humans (and many animals) share this trait. Your nervous system processes more thoroughly, which is both a gift and a responsibility to manage.",
      es: "El mundo viene hacia ti con toda su intensidad. Los colores son más brillantes, los sonidos son más fuertes y las emociones son más profundas. Esto no es un defecto sino una forma diferente de ser; aproximadamente el 15-20% de los humanos (y muchos animales) comparten este rasgo. Tu sistema nervioso procesa más a fondo, lo cual es tanto un regalo como una responsabilidad que debes gestionar.",
      fr: "Le monde vous parvient avec une intensité totale. Les couleurs sont plus vives, les sons plus forts et les émotions plus profondes. Ce n'est pas un défaut mais une façon différente d'être - environ 15-20% des humains (et de nombreux animaux) partagent ce trait. Votre système nerveux traite plus en profondeur, ce qui est à la fois un don et une responsabilité à gérer.",
      ja: "世界は全力であなたに迫ってきます。色はより鮮やかに、音はより大きく、感情はより深く感じられます。これは欠点ではなく、異なる在り方です。人類の約15〜20％（そして多くの動物）がこの特性を共有しています。あなたの神経系はより徹底的に処理を行っており、それは贈り物であると同時に、管理すべき責任でもあります。",
      ko: "세상이 당신에게 완전한 강도로 다가옵니다. 색상이 더 밝고, 소리가 더 크고, 감정이 더 깊습니다. 이것은 결함이 아니라 다른 존재 방식입니다 - 인류의 약 15-20%(그리고 많은 동물)가 이 특성을 공유합니다. 신경계가 더 철저하게 처리하며, 이는 관리해야 할 선물이자 책임입니다.",
      zh: "世界以全强度向你袭来。色彩更鲜艳，声音更响亮，情感更深邃。这不是缺陷，而是一种不同的存在方式——大约 15-20% 的人类（以及许多动物）共有这一特质。你的神经系统处理得更彻底，这既是一种天赋，也是一种管理的责任。",
    },
  },
  low: {
    coping: [
      {
        en: "You naturally handle high-stimulation environments well",
        es: "Manejas bien los entornos de alta estimulación de forma natural",
        fr: "Vous gérez naturellement bien les environnements très stimulants",
        ja: "刺激の強い環境を自然にうまく処理できます",
        ko: "높은 자극 환경을 자연스럽게 잘 처리합니다",
        zh: "你天生能很好地应对高刺激环境",
      },
    ],
    strengths: [
      {
        en: "Resilience in chaotic environments",
        es: "Resiliencia en entornos caóticos",
        fr: "Résilience dans les environnements chaotiques",
        ja: "混乱した環境での回復力",
        ko: "혼란스러운 환경에서의 회복탄력성",
        zh: "在混乱环境中的韧性",
      },
      {
        en: "Ability to tune out distractions easily",
        es: "Capacidad para ignorar distracciones fácilmente",
        fr: "Capacité à ignorer facilement les distractions",
        ja: "気を散らすものを簡単に遮断する能力",
        ko: "쉽게 방해 요인을 차단하는 능력",
        zh: "容易排除干扰的能力",
      },
    ],
    worldview: {
      en: "You experience the world at a moderate intensity. You can engage fully without being overwhelmed, though you may sometimes miss subtle cues that sensitive people notice.",
      es: "Experimentas el mundo con una intensidad moderada. Puedes participar plenamente sin abrumarte, aunque a veces puedes perderte señales sutiles que las personas sensibles notan.",
      fr: "Vous faites l'expérience du monde à une intensité modérée. Vous pouvez vous engager pleinement sans être submergé, bien que vous puissiez parfois manquer des signaux subtils que les personnes sensibles remarquent.",
      ja: "世界を適度な強度で経験します。圧倒されることなく完全に関与できますが、敏感な人が気づく微かな合図を逃すことがあります。",
      ko: "세상을 적당한 강도로 경험합니다. 압도당하지 않고 완전히 참여할 수 있지만, 때때로 민감한 사람들이 알아차리는 미묘한 신호를 놓칠 수 있습니다.",
      zh: "你以中等强度体验世界。你可以全身心投入而不感到疲惫，尽管你有时可能会错过敏感者能注意到的微妙迹象。",
    },
  },
  moderate: {
    coping: [
      {
        en: "Schedule regular downtime between activities",
        es: "Programa tiempo de inactividad regular entre actividades",
        fr: "Prévoyez des temps d'arrêt réguliers entre les activités",
        ja: "活動の合間に定期的なダウンタイム（休息時間）を設けましょう",
        ko: "활동 사이에 규칙적인 휴식 시간을 예약하세요",
        zh: "在活动之间安排定期的休息时间",
      },
      {
        en: "Create quiet spaces in your environment",
        es: "Crea espacios tranquilos en tu entorno",
        fr: "Créez des espaces calmes dans votre environnement",
        ja: "身の回りに静かな空間を作りましょう",
        ko: "환경에 조용한 공간을 만드세요",
        zh: "在你的环境中创造安静的空间",
      },
    ],
    strengths: [
      {
        en: "Enhanced perception and intuition",
        es: "Percepción e intuición mejoradas",
        fr: "Perception et intuition améliorées",
        ja: "強化された知覚と直感",
        ko: "향상된 인식과 직관",
        zh: "增强的感知力和直觉",
      },
      {
        en: "Ability to notice what others miss",
        es: "Capacidad para notar lo que otros pasan por alto",
        fr: "Capacité à remarquer ce que les autres manquent",
        ja: "他の人が見逃すことに気づく能力",
        ko: "다른 사람들이 놓치는 것을 알아차리는 능력",
        zh: "察觉他人忽视之处的能力",
      },
      {
        en: "Deep emotional connections",
        es: "Conexiones emocionales profundas",
        fr: "Connexions émotionnelles profondes",
        ja: "深い感情的な繋がり",
        ko: "깊은 감정적 연결",
        zh: "深层的情感连接",
      },
    ],
    worldview: {
      en: "You notice more than most people, processing experiences at a deeper level. This sensitivity is a gift that allows you to appreciate beauty, connect deeply, and understand nuance - but it requires conscious management.",
      es: "Notas más que la mayoría de las personas, procesando las experiencias a un nivel más profundo. Esta sensibilidad es un regalo que te permite apreciar la belleza, conectarte profundamente y entender los matices, pero requiere una gestión consciente.",
      fr: "Vous remarquez plus de choses que la plupart des gens, traitant les expériences à un niveau plus profond. Cette sensibilité est un don qui vous permet d'apprécier la beauté, de vous connecter profondément et de comprendre les nuances - mais elle nécessite une gestion consciente.",
      ja: "大抵の人よりも多くのことに気づき、経験をより深いレベルで処理します。この敏感さは、美しさを味わい、深く繋がり、ニュアンスを理解することを可能にするギフトですが、意識的な管理が必要です。",
      ko: "대부분의 사람들보다 더 많이 알아차리고, 경험을 더 깊은 수준에서 처리합니다. 이 민감성은 아름다움을 감상하고, 깊이 연결하며, 뉘앙스를 이해할 수 있게 하는 선물이지만 - 의식적인 관리가 필요합니다.",
      zh: "你比大多数人注意得更多，在更深层次上处理经验。这种敏感性是一种天赋，让你能欣赏美、进行深度连接并理解细微之处——但它需要有意识的管理。",
    },
  },
  very_high: {
    coping: [
      {
        en: "Prioritize rest and recovery as non-negotiable",
        es: "Prioriza el descanso y la recuperación como algo no negociable",
        fr: "Donnez la priorité au repos et à la récupération comme non négociables",
        ja: "休息と回復を譲れないものとして優先しましょう",
        ko: "휴식과 회복을 타협할 수 없는 것으로 우선시하세요",
        zh: "将休息和恢复视为不可协商的首要任务",
      },
      {
        en: "Develop a 'sensitivity-friendly' lifestyle",
        es: "Desarrolla un estilo de vida 'amigable con la sensibilidad'",
        fr: "Développez un mode de vie 'sensible'",
        ja: "「敏感さに優しい」ライフスタイルを確立しましょう",
        ko: "'민감성 친화적' 라이프스타일을 개발하세요",
        zh: "发展“敏感友好型”的生活方式",
      },
      {
        en: "Choose careers and relationships that honor your sensitivity",
        es: "Elige carreras y relaciones que honren tu sensibilidad",
        fr: "Choisissez des carrières et des relations qui honorent votre sensibilité",
        ja: "自分の敏感さを尊重してくれるキャリアや人間関係を選びましょう",
        ko: "민감성을 존중하는 직업과 관계를 선택하세요",
        zh: "选择尊重你敏感性的职业和人际关系",
      },
      {
        en: "Practice saying no to protect your energy",
        es: "Practica decir no para proteger tu energía",
        fr: "Entraînez-vous à dire non pour protéger votre énergie",
        ja: "エネルギーを守るために「いいえ」と言う練習をしましょう",
        ko: "에너지를 보호하기 위해 '아니오'라고 말하는 연습을 하세요",
        zh: "练习拒绝以保护你的能量",
      },
      {
        en: "Seek out communities of fellow sensitive people",
        es: "Busca comunidades de otras personas sensibles",
        fr: "Recherchez des communautés de personnes sensibles",
        ja: "同じ敏感な人々（HSP）のコミュニティを探しましょう",
        ko: "같은 민감한 사람들의 커뮤니티를 찾으세요",
        zh: "寻找同为敏感者的群体",
      },
    ],
    strengths: [
      {
        en: "Exceptional perception and insight",
        es: "Percepción y conocimiento excepcionales",
        fr: "Perception et perspicacité exceptionnelles",
        ja: "卓越した知覚と洞察力",
        ko: "뛰어난 인식과 통찰력",
        zh: "卓越的感知力和洞见力",
      },
      {
        en: "Rare depth of emotional and aesthetic experience",
        es: "Profundidad excepcional de la experiencia emocional y estética",
        fr: "Profondeur rare de l'expérience émotionnelle et esthétique",
        ja: "稀有なほどの感情的・美的な経験の深さ",
        ko: "드문 감정적, 미적 경험의 깊이",
        zh: "罕见的情感和美学体验深度",
      },
      {
        en: "Natural counselor and healer energy",
        es: "Energía natural de consejero y sanador",
        fr: "Énergie naturelle de conseiller et de guérisseur",
        ja: "天性のカウンセラーやヒーラーのようなエネルギー",
        ko: "자연스러운 상담사와 치유사 에너지",
        zh: "天赋般的顾问和疗愈者能量",
      },
      {
        en: "Ability to detect subtle danger or dishonesty",
        es: "Capacidad para detectar peligros sutiles o falta de honradez",
        fr: "Capacité à détecter un danger subtil ou la malhonnêteté",
        ja: "微かな危険や不誠実さを察知する能力",
        ko: "미묘한 위험이나 부정직을 감지하는 능력",
        zh: "察觉微妙危险或不诚实的能力",
      },
      {
        en: "Profound creative and spiritual capacity",
        es: "Capacidad creativa y espiritual profunda",
        fr: "Profonde capacité créative et spirituelle",
        ja: "深い創造的・精神的な能力",
        ko: "깊은 창의적, 영적 역량",
        zh: "深邃的创造力和精神能力",
      },
    ],
    worldview: {
      en: "You experience life at a level of intensity that most people cannot imagine. This is the extreme of sensory processing sensitivity - a trait that requires significant life design to manage well. When honored, your sensitivity becomes a superpower for insight, creativity, and compassion. When neglected, it leads to overwhelm and burnout. Self-knowledge and self-care are not optional for you; they are survival.",
      es: "Experimentas la vida con un nivel de intensidad que la mayoría de las personas no pueden imaginar. Este es el extremo de la sensibilidad de procesamiento sensorial, un rasgo que requiere un diseño de vida significativo para gestionarse bien. Cuando se honra, tu sensibilidad se convierte en un superpoder para la percepción, la creatividad y la compasión. Cuando se descuida, conduce al agobio y al agotamiento. El autoconocimiento y el autocuidado no son opcionales para ti; son supervivencia.",
      fr: "Vous faites l'expérience de la vie à un niveau d'intensité que la plupart des gens ne peuvent imaginer. C'est l'extrême de la sensibilité du traitement sensoriel - un trait qui nécessite une conception de vie significative pour être bien géré. Lorsqu'elle est honorée, votre sensibilité devient un super-pouvoir pour la perspicacité, la créativité et la compassion. Lorsqu'elle est négligée, elle mène à la submersion et à l'épuisement. La connaissance de soi et les soins personnels ne sont pas facultatifs pour vous ; ils sont une survie.",
      ja: "大抵の人が想像できないほどの強度レベルで人生を経験します。これは感覚処理感受性の極端な状態であり、うまく管理するには大幅なライフデザインが必要です。尊重されれば、あなたの敏感さは洞察、創造性、共感のためのスーパーパワーになります。放っておけば、圧倒され燃え尽き症候群になります。自己理解とセルフケアは、あなたにとって選択肢ではなく、生き残るための手段です。",
      ko: "대부분의 사람들이 상상할 수 없는 강도 수준에서 삶을 경험합니다. 이것은 감각 처리 민감성의 극단입니다 - 잘 관리하기 위해 상당한 삶의 설계가 필요한 특성입니다. 존중받을 때, 민감성은 통찰력, 창의성, 연민의 초능력이 됩니다. 무시하면 압도당하고 번아웃으로 이어집니다. 자기 인식과 자기 돌봄은 당신에게 선택 사항이 아니라 생존입니다.",
      zh: "你以大多数人无法想象的强度水平体验生活。这是感官处理敏感性的极端——一种需要进行重大生活设计才能很好管理的特征。当得到尊重时，你的敏感性将成为洞察力、创造力和共情的超能力。当被忽视时，它会导致不知所措和倦怠。自我认识和自我关怀对你来说不是可选项，而是生存之道。",
    },
  },
};

export const LIFE_IMPLICATIONS: Record<string, LifeImplications> = {
  high: {
    career: {
      en: "Choose work that allows for depth over breadth. Highly stimulating environments (open offices, sales floors) may drain you. Ideal: creative roles, counseling, research, healing professions, or remote work.",
      es: "Elige un trabajo que permita profundidad sobre amplitud. Los entornos altamente estimulantes (oficinas abiertas, departamentos de ventas) pueden agotarte. Ideal: roles creativos, asesoramiento, investigación, profesiones de sanación o trabajo remoto.",
      fr: "Choisissez un travail qui privilégie la profondeur à l'étendue. Les environnements très stimulants (bureaux ouverts, espaces de vente) peuvent vous épuiser. Idéal : rôles créatifs, conseil, recherche, professions de guérison ou télétravail.",
      ja: "広さよりも深さを追求できる仕事を選びましょう。高い刺激を受ける環境（オープンオフィス、営業現場）はあなたを疲弊させる可能性があります。理想：クリエイティブな職種、カウンセリング、研究、癒しの専門職、またはリモートワーク。",
      ko: "폭보다 깊이를 허용하는 일을 선택하세요. 높은 자극 환경(오픈 오피스, 영업 현장)은 당신을 지치게 할 수 있습니다. 이상적: 창의적 역할, 상담, 연구, 치유 전문직, 또는 재택 근무.",
      zh: "选择允许深度而非广度的工作。高刺激环境（开放式办公室、销售层）可能会耗尽你的精力。理想选择：创意角色、顾问、研究、疗愈专业或远程办公。",
    },
    dailyLife: {
      en: "Structure your days with recovery time built in. Morning routines, quiet evenings, and nature exposure are medicine for your nervous system.",
      es: "Estructura tus días incorporando tiempo de recuperación. Las rutinas matinales, las noches tranquilas y la exposición a la naturaleza son medicina para tu sistema nervioso.",
      fr: "Structurez vos journées avec du temps de récupération intégré. Les routines matinales, les soirées calmes et l'exposition à la nature sont des remèdes pour votre système nerveux.",
      ja: "回復時間を組み込んだ一日を構成しましょう。朝のルーティン、静かな夜、自然に触れることは、あなたの神経系にとっての薬になります。",
      ko: "회복 시간이 포함된 하루를 구조화하세요. 아침 루틴, 조용한 저녁, 자연 노출이 신경계의 약입니다.",
      zh: "安排好你的日程，并加入恢复时间。早晨的常规活动、安静的夜晚和接触自然对你的神经系统大有裨益。",
    },
    relationships: {
      en: "You need partners and friends who respect your need for quiet time. You love deeply but need space to recover. Conflict is particularly draining - seek partners who communicate thoughtfully.",
      es: "Necesitas socios y amigos que respeten tu necesidad de tiempo tranquilo. Amas profundamente pero necesitas espacio para recuperarte. El conflicto es particularmente agotador; busca socios que se comuniquen con consideración.",
      fr: "Vous avez besoin de partenaires et d'amis qui respectent votre besoin de temps calme. Vous aimez profondément mais avez besoin d'espace pour récupérer. Les conflits sont particulièrement épuisants - recherchez des partenaires qui communiquent de manière réfléchie.",
      ja: "静かな時間の必要性を尊重してくれるパートナーや友人が必要です。深く愛しますが、回復するためのスペースが必要です。対立は特にあなたを消耗させます。思慮深くコミュニケーションをとるパートナーを探しましょう。",
      ko: "조용한 시간의 필요를 존중하는 파트너와 친구가 필요합니다. 깊이 사랑하지만 회복을 위한 공간이 필요합니다. 갈등이 특히 지치게 합니다 - 사려 깊게 소통하는 파트너를 찾으세요.",
      zh: "你需要尊重你对安静时间需求的伴侣和朋友。你爱得很深，但需要空间来恢复。冲突特别耗费精力——寻找沟通体贴的伴侣。",
    },
    selfCare: {
      en: "Sleep, solitude, and beauty are essential - not luxuries. Protect your nervous system like the valuable instrument it is.",
      es: "El sueño, la soledad y la belleza son esenciales, no lujos. Protege tu sistema nervioso como el valioso instrumento que es.",
      fr: "Le sommeil, la solitude et la beauté sont essentiels - pas des luxes. Protégez votre système nerveux comme l'instrument précieux qu'il est.",
      ja: "睡眠、孤独、そして美しさは贅沢ではなく不可欠なものです。あなたの神経系を、まさに価値のある楽器であるかのように大切に守りましょう。",
      ko: "수면, 고독, 아름다움은 사치가 아니라 필수입니다. 귀중한 악기처럼 신경계를 보호하세요.",
      zh: "睡眠、独处和美感是必不可少的——而非奢侈品。像对待珍贵的乐器一样保护你的神经系统。",
    },
  },
  moderate: {
    career: {
      en: "You can handle stimulating environments but benefit from recovery time. Balance is key - neither too isolated nor too overwhelmed.",
      es: "Puedes manejar entornos estimulantes pero te beneficias del tiempo de recuperación. El equilibrio es clave: ni demasiado aislado ni demasiado abrumado.",
      fr: "Vous pouvez gérer des environnements stimulants mais bénéficiez d'un temps de récupération. L'équilibre est la clé - ni trop isolé ni trop submergé.",
      ja: "刺激的な環境にも対応できますが、回復時間があると役に立ちます。バランスが鍵です。孤立しすぎず、圧倒されすぎないように。",
      ko: "자극적인 환경을 처리할 수 있지만 회복 시간이 도움이 됩니다. 균형이 핵심입니다 - 너무 고립되지도, 너무 압도당하지도 않게.",
      zh: "你可以应对刺激的环境，但从恢复时间中获益。平衡是关键——既不过于孤立，也不过于疲于奔命。",
    },
    dailyLife: {
      en: "Build in some quiet time but you don't require as much as highly sensitive people.",
      es: "Incluye algo de tiempo tranquilo, pero no necesitas tanto como las personas altamente sensibles.",
      fr: "Prévoyez un peu de temps calme mais vous n'avez pas besoin d'autant que les personnes très sensibles.",
      ja: "少し静かな時間を設けましょう。ただし、非常に敏感な人ほど多くの時間は必要ありません。",
      ko: "약간의 조용한 시간을 확보하되 고도로 민감한 사람들만큼 많이 필요하지 않습니다.",
      zh: "建立一些安静的时间，但你不需要像高敏感者那样多的时间。",
    },
    relationships: {
      en: "You connect well with both sensitive and non-sensitive people. Your awareness enriches relationships without overwhelming them.",
      es: "Te conectas bien tanto con personas sensibles como con las que no lo son. Tu conciencia enriquece las relaciones sin abrumarlas.",
      fr: "Vous vous vous connectez bien avec les personnes sensibles et non sensibles. Votre conscience enrichit les relations sans les submerger.",
      ja: "敏感な人ともそうでない人ともうまく繋がることができます。あなたの気づきは、関係を圧倒することなく、より豊かなものにします。",
      ko: "민감한 사람과 민감하지 않은 사람 모두와 잘 연결됩니다. 인식이 관계를 풍요롭게 하되 압도하지 않습니다.",
      zh: "你与敏感和非敏感的人都能很好地建立联系。你的觉察力丰富了人际关系而不会使其变得难以招架。",
    },
    selfCare: {
      en: "Regular self-care supports your well-being but you may have more flexibility in how you structure it.",
      es: "El autocuidado regular apoya tu bienestar, pero puedes tener más flexibilidad en cómo lo estructuras.",
      fr: "Les soins personnels réguliers soutiennent votre bien-être mais vous pouvez avoir plus de flexibilité dans la façon dont vous les structurez.",
      ja: "定期的なセルフケアが幸福を支えますが、その方法を構築する上で、より柔軟に対応できるでしょう。",
      ko: "규칙적인 자기 돌봄이 안녕을 지원하지만 구조화하는 방법에 더 유연성이 있을 수 있습니다.",
      zh: "定期的自我关怀支撑着你的幸福心，但在如何安排上你可能有更多的灵活性。",
    },
  },
};
