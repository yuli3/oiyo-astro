import { SixLangString } from "../engine.contract";

/**
 * TCI Deep Shard Data
 * Temperament and Character dimension narratives separated from logic.
 */

export const TEMPERAMENT_DATA: Record<
  string,
  Record<string, { challenges: SixLangString; interpretation: SixLangString }>
> = {
  HA: {
    // Harm Avoidance
    high: {
      challenges: {
        en: "Anxiety, pessimism, fatigue; may avoid beneficial risks.",
        es: "Ansiedad, pesimismo, fatiga; puede evitar riesgos beneficiosos.",
        fr: "Anxiété, pessimisme, fatigue ; peut éviter les risques bénéfiques.",
        ja: "不安、悲観主義、疲労。有益なリスクを避けることがあります。",
        ko: "불안, 비관주의, 피로; 유익한 위험을 피할 수 있습니다.",
        zh: "焦虑、悲观、疲劳；可能规避有益的风险。",
      },
      interpretation: {
        en: "You are cautious, sensitive, and anticipate potential problems. Your vigilance protects you from danger but may also cause excessive worry. You feel emotions deeply and need time to recover from stress.",
        es: "Eres cauteloso, sensible y anticipas problemas potenciales. Tu vigilancia te protege del peligro pero también puede causar preocupación excesiva. Sientes las emociones profundamente y necesitas tiempo para recuperarte del estrés.",
        fr: "Vous êtes prudent, sensible et anticipez les problèmes potentiels. Votre vigilance vous protège du danger mais peut aussi causer une inquiétude excessive. Vous ressentez les émotions profondément et avez besoin de temps pour vous remettre du stress.",
        ja: "用心深く、敏感で、潜在的な問題を予測します。あなたの警戒心は危険から守ってくれますが、過度な心配を引き起こすこともあります。感情を深く感じ、ストレスから回復する時間が必要です。",
        ko: "신중하고, 민감하며, 잠재적 문제를 예상합니다. 경계심이 위험으로부터 보호하지만 과도한 걱정을 일으킬 수 있습니다. 감정을 깊이 느끼고 스트레스에서 회복하는 데 시간이 필요합니다.",
        zh: "你很审慎、敏感，并能预见潜在问题。你的警觉保护你免受危险，但也可能导致过度忧虑。你深刻感受情绪，并需要时间从压力中恢复。",
      },
    },
    low: {
      challenges: {
        en: "May take unnecessary risks or dismiss valid concerns from others.",
        es: "Puede tomar riesgos innecesarios o desestimar preocupaciones válidas de otros.",
        fr: "Peut prendre des risques inutiles ou rejeter les préoccupations valables des autres.",
        ja: "不必要なリスクを取ったり、他者の妥当な懸念を無視したりすることがあります。",
        ko: "불필요한 위험을 감수하거나 다른 사람들의 유효한 우려를 무시할 수 있습니다.",
        zh: "可能冒不必要的风险，或忽视他人合理的担忧。",
      },
      interpretation: {
        en: "You are bold, confident, and energetic. You approach challenges without excessive worry and recover quickly from setbacks. This makes you resilient but you may underestimate genuine risks.",
        es: "Eres audaz, seguro de ti mismo y enérgico. Abordas los desafíos sin preocupación excesiva y te recuperas rápido de los contratiempos. Esto te hace resiliente pero puedes subestimar riesgos genuinos.",
        fr: "Vous êtes audacieux, confiant et énergique. Vous abordez les défis sans inquiétude excessive et vous remettez rapidement des revers. Cela vous rend résilient, mais vous pouvez sous-estimer les risques réels.",
        ja: "大胆で自信に満ち、精力的です。過度な心配をせずに困難に立ち向かい、挫折から素早く回復します。これは回復力につながりますが、真のリスクを過小評価する可能性があります。",
        ko: "대담하고, 자신감 있으며, 에너지가 넘칩니다. 과도한 걱정 없이 도전에 접근하고 좌절에서 빠르게 회복합니다. 이것이 회복탄력성을 주지만 진정한 위험을 과소평가할 수 있습니다.",
        zh: "你大胆、自信且充满活力。你应对挑战时不会过度忧虑，并能从挫折中迅速恢复。这使你具有韧性，但你可能低估真正的风险。",
      },
    },
    moderate: {
      challenges: {
        en: "Context-dependent anxiety may still arise in stressful periods.",
        es: "La ansiedad dependiente del contexto aún puede surgir en períodos estresantes.",
        fr: "L'anxiété dépendante du contexte peut encore survenir en période de stress.",
        ja: "ストレスの多い時期には、状況に応じた不安が生じることがあります。",
        ko: "스트레스 기간에 상황에 따른 불안이 여전히 발생할 수 있습니다.",
        zh: "在压力时期，仍可能出现随特定情境而生的焦虑。",
      },
      interpretation: {
        en: "You have a healthy balance of caution and confidence. You can assess risks accurately without being paralyzed by fear. This groundedness helps you make sound decisions.",
        es: "Tienes un equilibrio saludable entre precaución y confianza. Puedes evaluar riesgos de manera precisa sin paralizarte por el miedo. Esta base te ayuda a tomar decisiones sólidas.",
        fr: "Vous avez un équilibre sain entre prudence et confiance. Vous pouvez évaluer les risques avec précision sans être paralysé par la peur. Cet ancrage vous aide à prendre des décisions judicieuses.",
        ja: "慎重さと自信の健全なバランスが取れています。恐怖に麻痺することなく、リスクを正確に評価できます。この安定感は適切な決定を下すのに役立ちます。",
        ko: "신중함과 자신감의 건강한 균형을 가지고 있습니다. 두려움에 마비되지 않고 위험을 정확하게 평가할 수 있습니다. 이 안정감이 현명한 결정을 내리는 데 도움이 됩니다.",
        zh: "你在审慎与自信之间保持健康的平衡。你能准确评估风险而不被恐惧困扰。这种稳健有助于你做出明智的决定。",
      },
    },
  },
  NS: {
    // Novelty Seeking
    high: {
      challenges: {
        en: "Impulsivity, difficulty with routine, may seek stimulation to avoid discomfort.",
        es: "Impulsividad, dificultad con la rutina, puede buscar estimulación para evitar la incomodidad.",
        fr: "Impulsivité, difficulté avec la routine, peut rechercher la stimulation pour éviter l'inconfort.",
        ja: "衝動性、ルーチンの難しさ、不快感を避けるために刺激を求めることがあります。",
        ko: "충동성, 일상의 어려움, 불편함을 피하기 위해 자극을 추구할 수 있습니다.",
        zh: "冲动、难以应对常规，可能为了逃避不适而寻求刺激。",
      },
      interpretation: {
        en: "You are drawn to new experiences, quick to explore, and easily excited by novelty. Your enthusiasm energizes others but you may struggle with routine. Impulsivity can lead to exciting discoveries or regrettable decisions.",
        es: "Te atraen las nuevas experiencias, eres rápido para explorar y te emocionas fácilmente con la novedad. Tu entusiasmo energiza a otros pero puedes tener dificultades con la rutina. La impulsividad puede llevar a descubrimientos emocionantes o decisiones lamentables.",
        fr: "Vous êtes attiré par de nouvelles expériences, prompt à explorer et facilement excité par la nouveauté. Votre enthousiasme dynamise les autres mais vous pouvez avoir du mal avec la routine. L'impulsivité peut mener à des découvertes passionnantes ou à des décisions regrettables.",
        ja: "新しい経験に惹かれ、素早く探索し、新しさに簡単に興奮します。あなたの熱意は他者にエネルギーを与えますが、ルーチンワークに苦労することがあります。衝動性は刺激的な発見や後悔する決定につながる可能性があります。",
        ko: "새로운 경험에 이끌리고, 빠르게 탐구하며, 새로움에 쉽게 흥분합니다. 열정이 다른 사람들에게 에너지를 주지만 일상에서 어려움을 겪을 수 있습니다. 충동성이 흥미로운 발견이나 후회할 결정으로 이어질 수 있습니다.",
        zh: "你向往新体验，探索迅速，容易对新奇事物感到兴奋。你的热情激励他人，但你可能在常规事务中挣扎。冲动可能导致令人兴奋的发现或令人遗憾的决定。",
      },
    },
    low: {
      challenges: {
        en: "May become rigid or miss spontaneous opportunities for joy and connection.",
        es: "Puede volverse rígido o perder oportunidades espontáneas de alegría y conexión.",
        fr: "Peut devenir rigide ou manquer des occasions spontanées de joie et de connexion.",
        ja: "硬直的になったり、喜びや繋がりのための自発的な機会を逃したりすることがあります。",
        ko: "경직되거나 기쁨과 연결을 위한 자발적인 기회를 놓칠 수 있습니다.",
        zh: "可能变得僵化，或错过自发的快乐与连接机会。",
      },
      interpretation: {
        en: "You are deliberate, orderly, and frugal. You prefer stability over excitement and carefully consider before acting. This makes you reliable but you may miss opportunities that require quick action.",
        es: "Eres deliberado, ordenado y frugal. Prefieres la estabilidad sobre la emoción y consideras cuidadosamente antes de actuar. Esto te hace confiable pero puedes perder oportunidades que requieran acción rápida.",
        fr: "Vous êtes délibéré, ordonné et économe. Vous préférez la stabilité à l'excitation et réfléchissez soigneusement avant d'agir. Cela vous rend fiable, mais vous pouvez manquer des opportunités nécessitant une action rapide.",
        ja: "慎重で秩序立ち、節約家です。刺激より安定を好み、行動する前によく考えます。これは信頼性につながりますが、素早い行動が必要な機会を逃す可能性があります。",
        ko: "신중하고, 질서 있으며, 검소합니다. 흥분보다 안정을 선호하고 행동 전에 신중하게 고려합니다. 이것이 당신을 신뢰할 수 있게 하지만 빠른 행동이 필요한 기회를 놓칠 수 있습니다.",
        zh: "你审慎、有序且节俭。你偏好稳定而非兴奋，行动前会仔细考虑。这使你可靠，但可能错过需要快速行动的机会。",
      },
    },
    moderate: {
      challenges: {
        en: "May sometimes feel pulled between stability and adventure.",
        es: "A veces puede sentirse atraído entre la estabilidad y la aventura.",
        fr: "Peut parfois se sentir tiraillé entre stabilité et aventure.",
        ja: "時々、安定と冒険の間で板挟みになるように感じることがあります。",
        ko: "때때로 안정과 모험 사이에서 끌려다니는 느낌을 받을 수 있습니다.",
        zh: "有时可能在稳定与冒险之间感到左右为难。",
      },
      interpretation: {
        en: "You balance curiosity with caution. You can appreciate novelty without being impulsive, and maintain stability without becoming rigid. This flexibility serves you well in varied situations.",
        es: "Equilibras la curiosidad con la precaución. Puedes apreciar la novedad sin ser impulsivo, y mantener la estabilidad sin volverte rígido. Esta flexibilidad te sirve en situaciones variadas.",
        fr: "Vous équilibrez curiosité et prudence. Vous pouvez apprécier la nouveauté sans être impulsif et maintenir la stabilité sans devenir rigide. Cette flexibilité vous sert bien dans des situations variées.",
        ja: "好奇心と慎重さのバランスが取れています。衝動的にならずに新しさを楽しみ、硬直的にならずに安定を維持できます。この柔軟性は様々な状況で役立ちます。",
        ko: "호기심과 신중함의 균형을 맞춥니다. 충동적이지 않으면서 새로움을 감상하고, 경직되지 않으면서 안정을 유지할 수 있습니다. 이 유연성이 다양한 상황에서 도움이 됩니다.",
        zh: "你在好奇心与谨慎之间保持平衡。你能欣赏新奇而不冲动，维持稳定而不僵化。这种灵活性使你在各种情况下都能应对自如。",
      },
    },
  },
  P: {
    // Persistence
    high: {
      challenges: {
        en: "May persist in futile efforts or become a perfectionist workaholic.",
        es: "Puede persistir en esfuerzos fútiles o convertirse en un adicto al trabajo perfeccionista.",
        fr: "Peut persister dans des efforts futiles ou devenir un bourreau de travail perfectionniste.",
        ja: "無駄な努力を続けたり、完璧主義的な仕事中毒になったりすることがあります。",
        ko: "헛된 노력에 지속하거나 완벽주의 워커홀릭이 될 수 있습니다.",
        zh: "可能在徒劳的努力中坚持，或成为完美主义的工作狂。",
      },
      interpretation: {
        en: "You are industrious, determined, and don't give up easily. When you commit to something, you see it through despite obstacles. This tenacity drives achievement but may become stubbornness.",
        es: "Eres industrioso, decidido y no te rindes fácilmente. Cuando te comprometes con algo, lo llevas a cabo a pesar de los obstáculos. Esta tenacidad impulsa el éxito pero puede convertirse en terquedad.",
        fr: "Vous êtes travailleur, déterminé et n'abandonnez pas facilement. Lorsque vous vous engagez dans quelque chose, vous allez jusqu'au bout malgré les obstacles. Cette ténacité favorise la réussite mais peut devenir de l'entêtement.",
        ja: "勤勉で決断力があり、簡単には諦めません。何かにコミットすると、障害に直面しても最後までやり遂げます。この粘り強さは達成を促進しますが、頑固さになることもあります。",
        ko: "근면하고, 결단력 있으며, 쉽게 포기하지 않습니다. 무언가에 헌신하면 장애물에도 불구하고 완수합니다. 이 끈기가 성취를 이끌지만 고집이 될 수 있습니다.",
        zh: "你很勤奋、果断且不轻易放弃。当你承诺某事时，你会克服障碍将其完成。这种坚韧推动了成就，但也可能演变成顽固。",
      },
    },
    low: {
      challenges: {
        en: "May abandon worthwhile goals when obstacles appear.",
        es: "Puede abandonar metas valiosas cuando aparecen obstáculos.",
        fr: "Peut abandonner des objectifs valables lorsque des obstacles apparaissent.",
        ja: "障害が現れると、価値のある目標を放棄することがあります。",
        ko: "장애물이 나타나면 가치 있는 목표를 포기할 수 있습니다.",
        zh: "当出现障碍时，可能放弃有价值的目标。",
      },
      interpretation: {
        en: "You are flexible and know when to let go. You don't persist beyond reason and can adapt to changing circumstances. This adaptability is useful but may sometimes lead to giving up too soon.",
        es: "Eres flexible y sabes cuándo dejar ir. No persistes más allá de la razón y puedes adaptarte a las circunstancias cambiantes. Esta adaptabilidad es útil pero a veces puede llevar a rendirse demasiado pronto.",
        fr: "Vous êtes flexible et savez quand lâcher prise. Vous ne persistez pas au-delà de la raison et pouvez vous adapter aux circonstances changeantes. Cette adaptabilité est utile mais peut parfois mener à abandonner trop tôt.",
        ja: "柔軟で、いつ手放すべきかを知っています。理屈を超えて固執することなく、変化する状況に適応できます。この適応力は有用ですが、時に早く諦めすぎることがあります。",
        ko: "유연하고 언제 놓아야 하는지 압니다. 이유 없이 고집하지 않고 변화하는 상황에 적응할 수 있습니다. 이 적응력은 유용하지만 때때로 너무 빨리 포기하게 만들 수 있습니다.",
        zh: "你很灵活，知道何时放手。你不会无理坚持，并能适应变化的情况。这种适应能力很有用，但有时可能导致过早放弃。",
      },
    },
    moderate: {
      challenges: {
        en: "Determining when to persist versus when to pivot can still be challenging.",
        es: "Determinar cuándo persistir versus cuándo pivotar aún puede ser un desafío.",
        fr: "Déterminer quand persévérer par rapport à quand pivoter peut encore être un défi.",
        ja: "いつ継続し、いつピボット（転換）すべきかを判断するのは、依然として難しい場合があります。",
        ko: "언제 지속하고 언제 전환할지 결정하는 것은 여전히 어려울 수 있습니다.",
        zh: "决定何时坚持与何时转向仍可能具有挑战性。",
      },
      interpretation: {
        en: "You can persist through challenges while recognizing when to change direction. This balanced persistence helps you achieve goals without burning out.",
        es: "Puedes persistir a través de los desafíos mientras reconoces cuándo cambiar de dirección. Esta persistencia equilibrada te ayuda a lograr metas sin agotarte.",
        fr: "Vous pouvez persévérer à travers les défis tout en reconnaissant quand changer de direction. Cette persistance équilibrée vous aide à atteindre vos objectifs sans vous épuiser.",
        ja: "いつ方向転換すべきかを認識しながら、困難を乗り越えて継続できます。このバランスの取れた持続性は、燃え尽きることなく目標を達成するのに役立ちます。",
        ko: "언제 방향을 바꿔야 하는지 인식하면서 도전을 통해 지속할 수 있습니다. 이 균형 잡힌 지속성이 번아웃 없이 목표를 달성하는 데 도움이 됩니다.",
        zh: "你能在面对挑战时坚持，同时也意识到何时该改变方向。这种平衡的坚持有助于你在不倦怠的情况下达成目标。",
      },
    },
  },
  RD: {
    // Reward Dependence
    high: {
      challenges: {
        en: "May over-rely on approval from others or have difficulty with solitude.",
        es: "Puede depender demasiado de la aprobación de los demás o tener dificultades con la soledad.",
        fr: "Peut trop compter sur l'approbation des autres ou avoir des difficultés avec la solitude.",
        ja: "他者からの承認に過度に依存したり、孤独に苦しんだりすることがあります。",
        ko: "다른 사람들의 승인에 과도하게 의존하거나 고독에 어려움을 겪을 수 있습니다.",
        zh: "可能过度依赖他人的认可，或在独处时感到困难。",
      },
      interpretation: {
        en: "You are warm, sensitive to others, and thrive on connection. You are attuned to social cues and find meaning in relationships. This sociability enriches your life but may make you vulnerable to rejection.",
        es: "Eres cálido, sensible a los demás y prosperas con la conexión. Estás sintonizado con las señales sociales y encuentras sentido en las relaciones. Esta sociabilidad enriquece tu vida pero puede hacerte vulnerable al rechazo.",
        fr: "Vous êtes chaleureux, sensible aux autres et épanoui dans la connexion. Vous êtes attentif aux signaux sociaux et trouvez du sens dans les relations. Cette sociabilité enrichit votre vie mais peut vous rendre vulnérable au rejet.",
        ja: "温かく、他者に敏感で、繋がりの中で繁栄します。社会的合図に敏感で、人間関係に意味を見出します。この社交性は人生を豊かにしますが、拒絶に弱くなる可能性があります。",
        ko: "따뜻하고, 다른 사람들에게 민감하며, 연결에서 번성합니다. 사회적 신호에 민감하고 관계에서 의미를 찾습니다. 이 사교성이 삶을 풍요롭게 하지만 거절에 취약하게 만들 수 있습니다.",
        zh: "你很温和，对他人的情绪敏感，在连接中茁壮成长。你关注社交信号，并在人际关系中寻找意义。这种社交性丰富了你的生活，但也可能使你容易受到拒绝的影响。",
      },
    },
    low: {
      challenges: {
        en: "May struggle with intimacy or appear detached to others.",
        es: "Puede tener dificultades con la intimidad o parecer distante ante los demás.",
        fr: "Peut avoir du mal avec l'intimité ou sembler détaché aux autres.",
        ja: "親密さに苦労したり、他者に無関心に見えたりすることがあります。",
        ko: "친밀감에 어려움을 겪거나 다른 사람들에게 분리된 것처럼 보일 수 있습니다.",
        zh: "可能在亲密关系中挣扎，或在他人眼中显得疏离。",
      },
      interpretation: {
        en: "You are independent and self-contained. You don't need external validation and can work alone effectively. This self-reliance is valuable but may lead to isolation or appearing cold.",
        es: "Eres independiente y contenido. No necesitas validación externa y puedes trabajar solo de manera efectiva. Esta autosuficiencia es valiosa pero puede llevar al aislamiento o a parecer frío.",
        fr: "Vous êtes indépendant et autonome. Vous n'avez pas besoin de validation externe et pouvez travailler seul efficacement. Cette autonomie est précieuse mais peut mener à l'isolement ou paraître froid.",
        ja: "独立心が強く、自己完結しています。外部の承認を必要とせず、一人で効果的に働けます。この自立心は価値がありますが、孤立したり冷淡に見えたりする可能性があります。",
        ko: "독립적이고 자급자족합니다. 외부 검증이 필요하지 않고 혼자서 효과적으로 일할 수 있습니다. 이 자립심은 가치 있지만 고립이나 차가워 보이는 것으로 이어질 수 있습니다.",
        zh: "你独立且自足。你不需要外部认可，能有效地独立工作。这种自立很有价值，但可能导致孤立或显得冷漠。",
      },
    },
    moderate: {
      challenges: {
        en: "May sometimes feel tension between personal needs and social expectations.",
        es: "A veces puede sentir tensión entre las necesidades personales y las expectativas sociales.",
        fr: "Peut parfois ressentir une tension entre les besoins personnels et les attentes sociales.",
        ja: "時々、個人的なニーズと社会的な期待の間で緊張を感じることがあります。",
        ko: "때때로 개인적 필요와 사회적 기대 사이에서 긴장을 느낄 수 있습니다.",
        zh: "有时可能在个人需求与社会期待之间感到紧张。",
      },
      interpretation: {
        en: "You value relationships while maintaining healthy independence. You appreciate recognition without being dependent on it. This balance makes you adaptable in social and solitary contexts.",
        es: "Valoras las relaciones mientras mantienes una independencia saludable. Aprecias el reconocimiento sin depender de él. Este equilibrio te hace adaptable en contextos sociales y solitarios.",
        fr: "Vous valorisez les relations tout en maintenant une saine indépendance. Vous appréciez la reconnaissance sans en dépendre. Cet équilibre vous rend adaptable dans les contextes sociaux et solitaires.",
        ja: "健全な独立性を維持しながら人間関係を大切にします。承認に依存することなくそれを評価します。このバランスにより、社会的状況でも孤独な状況でも適応できます。",
        ko: "건강한 독립성을 유지하면서 관계를 소중히 여깁니다. 인정에 의존하지 않으면서 감사합니다. 이 균형이 사회적, 고독한 상황에서 적응력을 갖게 합니다.",
        zh: "你重视人际关系，同时也保持健康的独立。你欣赏认可但不依赖它。这种平衡使你在社交和独处环境中都能很好适应。",
      },
    },
  },
};

export const CHARACTER_DATA: Record<
  string,
  Record<string, { growthPath: SixLangString; interpretation: SixLangString }>
> = {
  C: {
    // Cooperativeness
    high: {
      growthPath: {
        en: "Ensure you also care for yourself. Your gift of empathy should not come at the cost of your own needs.",
        es: "Asegúrate de cuidarte también a ti mismo. Tu don de empatía no debe ser a costa de tus propias necesidades.",
        fr: "Assurez-vous de prendre également soin de vous. Votre don d'empathie ne doit pas se faire au détriment de vos propres besoins.",
        ja: "自分自身のケアも忘れないようにしてください。共感という才能が、自分自身のニーズを犠牲にしてもたらされるべきではありません。",
        ko: "자신도 돌보도록 하세요. 공감의 선물이 자신의 필요를 희생시켜서는 안 됩니다.",
        zh: "确保你也照顾好自己。你的同理心天赋不应以牺牲自己的需求为代价。",
      },
      interpretation: {
        en: "You are naturally empathetic, supportive, and invest in the well-being of others. You have strong social principles and contribute positively to your communities.",
        es: "Eres naturalmente empático, solidario e inviertes en el bienestar de los demás. Tienes fuertes principios sociales y contribuyes positivamente a tus comunidades.",
        fr: "Vous êtes naturellement empathique, solidaire et investissez dans le bien-être des autres. Vous avez de forts principes sociaux et contribuez positivement à vos communautés.",
        ja: "本来的に共感的で、支持的であり、他者の幸福を大切にします。強い社会原則を持ち、コミュニティに良い影響を与えます。",
        ko: "자연스럽게 공감적이고, 지지적이며, 다른 사람들의 안녕에 투자합니다. 강한 사회적 원칙을 가지고 있고 지역 사회에 긍정적으로 기여합니다.",
        zh: "你天生具有同理心、给予支持，并致力于他人的福祉。你具有强烈的社会原则，并为你的社区做出积极贡献。",
      },
    },
    low: {
      growthPath: {
        en: "Practice active listening and perspective-taking. Volunteer or engage in service to develop compassion.",
        es: "Practica la escucha activa y la toma de perspectiva. Haz voluntariado o participa en servicios para desarrollar compasión.",
        fr: "Pratiquez l'écoute active et la prise de perspective. Faites du bénévolat ou engagez-vous dans le service pour développer la compassion.",
        ja: "積極的傾聴と視点の取得を練習してください。ボランティアや奉仕活動に従事して思いやりを育みましょう。",
        ko: "적극적 경청과 관점 취하기를 연습하세요. 자원봉사나 봉사에 참여하여 연민을 개발하세요.",
        zh: "练习积极倾听和换位思考。参与志愿者活动或服务以培养同理心。",
      },
      interpretation: {
        en: "You may be self-focused, competitive, or have difficulty empathizing with others. Relationships might feel transactional rather than mutually supportive.",
        es: "Puede que estés centrado en ti mismo, seas competitivo o tengas dificultades para empatizar con los demás. Las relaciones pueden sentirse transaccionales en lugar de ser de apoyo mutuo.",
        fr: "Vous pouvez être centré sur vous-même, compétitif ou avoir du mal à sympathiser avec les autres. Les relations peuvent sembler transactionnelles plutôt que mutuellement favorables.",
        ja: "自己中心的であったり、競争心が強かったり、他者に共感するのが難しかったりすることがあります。人間関係が相互支援的ではなく取引のように感じられるかもしれません。",
        ko: "자기 중심적이거나, 경쟁적이거나, 다른 사람들에게 공감하기 어려울 수 있습니다. 관계가 상호 지원적이기보다 거래적으로 느껴질 수 있습니다.",
        zh: "你可能以自我为中心、具有竞争心，或难以与他人产生共情。人际关系可能感觉像是一场交易，而非相互支持。",
      },
    },
    moderate: {
      growthPath: {
        en: "Continue cultivating empathy while maintaining your boundaries. Explore deeper service to community.",
        es: "Continúa cultivando la empatía mientras mantienes tus límites. Explora un servicio más profundo a la comunidad.",
        fr: "Continuez à cultiver l'empathie tout en maintenant vos limites. Explorez un service plus profond à la communauté.",
        ja: "境界線を維持しながら共感力を養い続けてください。地域社会へのより深い奉仕活動を探求してください。",
        ko: "경계를 유지하면서 공감을 계속 배양하세요. 지역 사회에 대한 더 깊은 봉사를 탐구하세요.",
        zh: "在保持界限的同时继续培养共情。探索对社区的深层服务。",
      },
      interpretation: {
        en: "You can cooperate with others and generally show empathy, though you also maintain healthy boundaries. Your social relationships are reasonably balanced.",
        es: "Puedes cooperar con los demás y generalmente muestras empatía, aunque también mantienes límites saludables. Tus relaciones sociales están razonablemente equilibradas.",
        fr: "Vous pouvez coopérer avec les autres et faire preuve d'empathie en général, bien que vous mainteniez également des limites saines. Vos relations sociales sont raisonnablement équilibrées.",
        ja: "他者と協力でき、概ね共感を示しますが、健全な境界線も維持しています。社会的な関係は適度にバランスが取れています。",
        ko: "다른 사람들과 협력할 수 있고 일반적으로 공감을 보이지만, 건강한 경계도 유지합니다. 사회적 관계가 적당히 균형 잡혀 있습니다.",
        zh: "你能与他人合作，通常能表现出共情，但也保持健康的界限。你的社交关系相当平衡。",
      },
    },
  },
  SD: {
    // Self-Directedness
    high: {
      growthPath: {
        en: "Continue nurturing your sense of purpose. Help others develop their self-direction.",
        es: "Continúa nutriendo tu sentido de propósito. Ayuda a otros a desarrollar su autodirección.",
        fr: "Continuez à nourrir votre sens du but. Aidez les autres à développer leur autodétermination.",
        ja: "目的意識を養い続けてください。他者が自己志向性を開発するのを助けましょう。",
        ko: "목적 의식을 계속 양육하세요. 다른 사람들이 자기 주도성을 개발하도록 도와주세요.",
        zh: "继续培养你的使命感。帮助他人发展他们的自我导向能力。",
      },
      interpretation: {
        en: "You have strong self-acceptance, clear purpose, and take responsibility for your life. You pursue meaningful goals and have developed a mature sense of personal identity.",
        es: "Tienes una fuerte autoaceptación, un propósito claro y asumes la responsabilidad de tu vida. Persigues metas significativas y has desarrollado un sentido maduro de identidad personal.",
        fr: "Vous avez une forte acceptation de vous-même, un but clair et prenez la responsabilité de votre vie. Vous poursuivez des objectifs significatifs et avez développé un sens mature de l'identité personnelle.",
        ja: "強い自己受容、明確な目的を持ち、自分の人生に責任を持っています。意味のある目標を追求し、成熟した個人のアイデンティティを確立しています。",
        ko: "강한 자기 수용, 명확한 목적을 가지고 있으며 삶에 대한 책임을 집니다. 의미 있는 목표를 추구하고 성숙한 개인 정체성을 개발했습니다.",
        zh: "你具有强烈的自我接纳感、明确的目标，并能为自己的生活负责。你追求有意义的目标，并已发展出成熟的个人身份感。",
      },
    },
    low: {
      growthPath: {
        en: "Focus on self-understanding, setting small achievable goals, and practicing personal accountability. Therapy or coaching can help develop self-direction.",
        es: "Enfócate en el autoconocimiento, establece pequeñas metas alcanzables y practica la responsabilidad personal. La terapia o el coaching pueden ayudar a desarrollar la autodirección.",
        fr: "Concentrez-vous sur la compréhension de vous-même, fixez de petits objectifs réalisables et pratiquez la responsabilité personnelle. La thérapie ou le coaching peuvent aider à développer l'autodétermination.",
        ja: "自己理解、達成可能な小さな目標の設定、個人的なアカウンタビリティの実践に焦点を当ててください。セラピーやコーチングが自己志向性の向上に役立ちます。",
        ko: "자기 이해에 집중하고, 작고 달성 가능한 목표를 설정하며, 개인적 책임을 연습하세요. 치료나 코칭이 자기 주도성을 개발하는 데 도움이 될 수 있습니다.",
        zh: "专注于自我理解，设定小的、可实现的目标，并练习个人责任感。治疗或教导有助于培养自我导向能力。",
      },
      interpretation: {
        en: "You may struggle with unclear identity, blaming external factors for problems, and difficulty following through on goals. This suggests limited self-acceptance and personal responsibility.",
        es: "Puede tener dificultades con una identidad poco clara, culpar a factores externos por los problemas y dificultad para seguir adelante con las metas. Esto sugiere una autoaceptación y responsabilidad personal limitadas.",
        fr: "Vous pouvez avoir des difficultés avec une identité floue, blâmer des facteurs externes pour les problèmes et avoir du mal à suivre vos objectifs. Cela suggère une acceptation de soi et une responsabilité personnelle limitées.",
        ja: "アイデンティティの不明確さ、問題の原因を外部要因のせいにすること、目標達成の難しさに苦労することがあります。これは、制限された自己受容と個人的責任を示唆しています。",
        ko: "불명확한 정체성, 문제에 대해 외부 요인을 탓하는 것, 목표 완수의 어려움으로 고생할 수 있습니다. 이는 제한된 자기 수용과 개인적 책임을 시사합니다.",
        zh: "你可能深受身份模糊、将问题归咎于外部因素以及难以贯彻目标所困。这表明自我接纳和个人责任感有限。",
      },
    },
    moderate: {
      growthPath: {
        en: "Continue building self-awareness. Challenge yourself to take ownership in difficult situations.",
        es: "Continúa construyendo la autoconciencia. Desafíate a tomar posesión en situaciones difíciles.",
        fr: "Continuez à développer la conscience de soi. Mettez-vous au défi de prendre vos responsabilités dans les situations difficiles.",
        ja: "自己理解を深め続けてください。困難な状況でも自己責任を持つように自分自身を律しましょう。",
        ko: "자기 인식을 계속 구축하세요. 어려운 상황에서 주인의식을 갖도록 도전하세요.",
        zh: "继续建立自我意识。挑战自己在困难情况下承担起责任。",
      },
      interpretation: {
        en: "You have reasonable self-acceptance and can take responsibility for your life. You set goals and generally follow through, though consistency may vary with stress or context.",
        es: "Tienes una autoaceptación razonable y puedes asumir la responsabilidad de tu vida. Estableces metas y generalmente las sigues, aunque la consistencia puede variar con el estrés o el contexto.",
        fr: "Vous avez une acceptation raisonnable de vous-même et pouvez prendre la responsabilité de votre vie. Vous fixez des objectifs et les poursuivez généralement, bien que la cohérence puisse varier selon le stress ou le contexte.",
        ja: "合理的な自己受容があり、自分の人生に責任を持つことができます。目標を立て、概ねやり遂げますが、一貫性はストレスや状況によって変わることがあります。",
        ko: "합리적인 자기 수용을 가지고 있고 삶에 대한 책임을 질 수 있습니다. 목표를 설정하고 일반적으로 완수하지만, 일관성은 스트레스나 상황에 따라 다를 수 있습니다.",
        zh: "你具有合理的自我接纳能力，并能为自己的生活负责。你设定目标并通常能坚持完成，尽管一致性可能随压力或环境的变化而波动。",
      },
    },
  },
  ST: {
    // Self-Transcendence
    high: {
      growthPath: {
        en: "Ground your transcendent insights in practical action. Help others access the meaning you have found.",
        es: "Fundamenta tus conocimientos trascendentes en acciones prácticas. Ayuda a otros a acceder al significado que has encontrado.",
        fr: "Ancrez vos idées transcendantes dans l'action pratique. Aidez les autres à accéder au sens que vous avez trouvé.",
        ja: "超越的な洞察を実用的な行動に反映させてください。発見した意味を他の人が理解できるように助けましょう。",
        ko: "초월적 통찰력을 실용적 행동에 기반을 두세요. 다른 사람들이 당신이 발견한 의미에 접근하도록 도와주세요.",
        zh: "将你的超越性见解落实到实际行动中。帮助他人获得你所发现的意义。",
      },
      interpretation: {
        en: "You are drawn to spiritual, philosophical, or transcendent experiences. You feel connected to something larger than yourself and find meaning in the mystical dimensions of life.",
        es: "Te atraen las experiencias espirituales, filosóficas o trascendentes. Te sientes conectado con algo más grande que tú mismo y encuentras sentido en las dimensiones místicas de la vida.",
        fr: "Vous êtes attiré par les expériences spirituelles, philosophiques ou transcendantes. Vous vous sentez connecté à quelque chose de plus grand que vous-même et trouvez du sens dans les dimensions mystiques de la vie.",
        ja: "精神的、哲学的、または超越的な経験に惹かれます。自分よりも大きな何かとの繋がりを感じ、人生の神秘的な次元に意味を見出します。",
        ko: "영적, 철학적, 또는 초월적 경험에 이끌립니다. 자신보다 더 큰 것과 연결되어 있다고 느끼고 삶의 신비로운 차원에서 의미를 찾습니다.",
        zh: "你向往精神、哲学或超越性的体验。你感到与超越自我的某种事物相连，并在生活的神秘维度中寻找意义。",
      },
    },
    low: {
      growthPath: {
        en: "Explore nature, art, or mindfulness practices. Connection to something larger can add meaning to practical pursuits.",
        es: "Explora la naturaleza, el arte o las prácticas de mindfulness. La conexión con algo más grande puede agregar significado a las actividades prácticas.",
        fr: "Explorez la nature, l'art ou les pratiques de pleine conscience. La connexion à quelque chose de plus grand peut ajouter du sens aux activités pratiques.",
        ja: "自然、芸術、マインドフルネスの実践を探索してください。より大きなものとの繋がりは、実用的な探求に意味を加えることができます。",
        ko: "자연, 예술, 또는 마음챙김 연습을 탐구하세요. 더 큰 것과의 연결이 실용적 추구에 의미를 더할 수 있습니다.",
        zh: "探索自然、艺术或正念练习。与更宏大事务的连接可以为务实的追求增添意义。",
      },
      interpretation: {
        en: "You are grounded in concrete, practical reality. Spirituality and abstract meaning may seem irrelevant or uninteresting to you. This keeps you focused but may limit your sense of connection to something larger.",
        es: "Estás arraigado en la realidad concreta y práctica. La espiritualidad y el significado abstracto pueden parecerte irrelevantes o carentes de interés. Esto te mantiene enfocado pero puede limitar tu sentido de conexión con algo más grande.",
        fr: "Vous êtes ancré dans la réalité concète et pratique. La spiritualité et le sens abstrait peuvent vous sembler non pertinents ou inintéressants. Cela vous permet de rester concentré mais peut limiter votre sentiment de connexion à quelque chose de plus grand.",
        ja: "具体的で、実用的な現実に根ざしています。スピリチュアリティや抽象的な意味は、あなたにとって無関係か、興味のないものに見えるかもしれません。これは集中力を維持するのに役立ちますが、より大きなものとの繋がりの感覚を制限する可能性があります。",
        ko: "구체적이고 실용적인 현실에 기반을 두고 있습니다. 영성과 추상적 의미가 당신에게 무관하거나 흥미롭지 않게 보일 수 있습니다. 이것이 집중력을 유지하게 하지만 더 큰 것과의 연결 감각을 제한할 수 있습니다.",
        zh: "你扎根于具体的现实。灵性和抽象意义对你来说可能显得无关宏旨或毫无趣味。这使你保持集中，但可能限制你与更宏大事物建立联系的感觉。",
      },
    },
    moderate: {
      growthPath: {
        en: "Deepen your spiritual or philosophical explorations. Balance transcendence with practical engagement.",
        es: "Profundiza tus exploraciones espirituales o filosóficas. Equilibra la trascendencia con el compromiso práctico.",
        fr: "Approfondissez vos explorations spirituelles ou philosophiques. Équilibrez la transcendance avec l'engagement pratique.",
        ja: "精神的または哲学的な探索を深めてください。超越と実用的な関与のバランスを取ってください。",
        ko: "영적 또는 철학적 탐구를 심화하세요. 초월과 실용적 참여의 균형을 맞추세요.",
        zh: "深化你的精神或哲学探索。在超越性与实际参与之间寻求平衡。",
      },
      interpretation: {
        en: "You have some capacity for spiritual or philosophical reflection while staying grounded. You can appreciate transcendent experiences without losing touch with practical reality.",
        es: "Tienes cierta capacidad para la reflexión espiritual o filosófica mientras te mantienes conectado a tierra. Puedes apreciar las experiencias trascendentes sin perder el contacto con la realidad práctica.",
        fr: "Vous avez une certaine capacité de réflexion spirituelle ou philosophique tout en restant ancré. Vous pouvez apprécier les expériences transcendantes sans perdre contact avec la réalité pratique.",
        ja: "地に足を付けつつ、精神的または哲学的な省察を行う能力を持っています。実用的な現実との接触を失うことなく、超越的な経験を評価することができます。",
        ko: "현실에 기반을 유지하면서 영적 또는 철학적 성찰의 능력이 있습니다. 실용적 현실과의 접촉을 잃지 않으면서 초월적 경험을 감상할 수 있습니다.",
        zh: "你在保持稳健的同时，具有一定的精神或哲学思考能力。你能欣赏超越性的体验，而不与实际现实脱节。",
      },
    },
  },
};
