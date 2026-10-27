export type FactionKey = 'dongin' | 'seoin' | 'namin' | 'bukin' | 'noron' | 'soron'
export const FACTIONS: Record<FactionKey, {
  ko: { name: string; desc: string; traits: string[]; history: string; color: string; emoji: string }
  en: { name: string; desc: string; traits: string[]; history: string; color: string; emoji: string }
}> = {
  dongin: {
    ko: { name: '동인 (東人)', desc: '학문의 순수성과 이상 사회를 꿈꾸는 원칙주의자. 도덕적 신념이 강하고 타협보다 원칙을 선택합니다.', traits: ['이상주의', '원칙 중시', '학문적', '도덕적 신념 강함'], history: '이황의 제자들 중심. 남인과 북인으로 분화되며, 정여립의 난 이후 서인에게 압박받았습니다.', color: 'blue', emoji: '📜' },
    en: { name: 'Dongin (Eastern)', desc: 'A principled idealist who dreams of scholarly purity and an ideal society. Strong moral convictions and prefers principle over compromise.', traits: ['Idealism', 'Principle-oriented', 'Scholarly', 'Strong morality'], history: 'Centered around disciples of Yi Hwang. Split into Namin and Bukin; pressured by Seoin after the Jeong Yeo-rip rebellion.', color: 'blue', emoji: '📜' },
  },
  seoin: {
    ko: { name: '서인 (西人)', desc: '현실적 효율과 체계적 질서를 중시하는 실용주의자. 논리적이고 제도 안에서 최대 성과를 추구합니다.', traits: ['현실주의', '효율적', '체계적', '논리적'], history: '이이의 제자들 중심. 노론과 소론으로 분화되며, 17세기 이후 정치 주도권을 잡았습니다.', color: 'amber', emoji: '⚖️' },
    en: { name: 'Seoin (Western)', desc: 'A pragmatist who values realistic efficiency and systematic order. Logical and seeks maximum results within established systems.', traits: ['Realism', 'Efficient', 'Systematic', 'Logical'], history: 'Centered around disciples of Yi I. Split into Noron and Soron; dominated politics after the 17th century.', color: 'amber', emoji: '⚖️' },
  },
  namin: {
    ko: { name: '남인 (南人)', desc: '학문적 깊이와 절제된 균형을 추구하는 온건파. 극단을 피하고 조화와 포용을 중시합니다.', traits: ['조화 추구', '학문적 깊이', '온건', '포용력'], history: '동인에서 분리. 숙종 시대 권력을 잡았으나 갑술환국으로 몰락. 실학자들이 많이 배출되었습니다.', color: 'green', emoji: '🌿' },
    en: { name: 'Namin (Southern)', desc: 'A moderate who seeks scholarly depth and restrained balance. Avoids extremes and values harmony and inclusivity.', traits: ['Harmony', 'Scholarly depth', 'Moderate', 'Inclusive'], history: 'Split from Dongin. Rose to power during Sukjong\'s reign but fell during the Gapsul Hwanguk. Produced many Silhak scholars.', color: 'green', emoji: '🌿' },
  },
  bukin: {
    ko: { name: '북인 (北人)', desc: '강한 실천의식과 과감한 개혁 정신을 가진 행동파. 신념에 따른 결과를 중시하고 변화를 두려워하지 않습니다.', traits: ['실천적', '개혁 정신', '단호함', '결과 지향'], history: '동인에서 분리. 광해군을 지지하며 집권했으나, 인조반정으로 몰락하여 이후 정치에서 완전히 배제되었습니다.', color: 'red', emoji: '⚡' },
    en: { name: 'Bukin (Northern)', desc: 'An activist with strong conviction and bold reformist spirit. Values results over process and embraces change.', traits: ['Action-oriented', 'Reformist', 'Decisive', 'Results-driven'], history: 'Split from Dongin. Supported King Gwanghaegun and rose to power, but fell during the Injo Coup and was permanently excluded from politics.', color: 'red', emoji: '⚡' },
  },
  noron: {
    ko: { name: '노론 (老論)', desc: '전통 질서와 정당성을 수호하는 보수파. 탄탄한 논리와 조직력으로 안정을 추구하며, 검증된 방식을 신뢰합니다.', traits: ['전통 수호', '조직적', '보수적', '안정 추구'], history: '서인에서 분리. 송시열을 중심으로 강력한 세력을 형성하고, 조선 후기 정치를 170년 이상 주도했습니다.', color: 'purple', emoji: '🏛️' },
    en: { name: 'Noron (Old Doctrine)', desc: 'A conservative who guards traditional order and legitimacy. Seeks stability through strong logic and organization; trusts proven methods.', traits: ['Tradition', 'Organized', 'Conservative', 'Stability-seeking'], history: 'Split from Seoin. Formed a strong force around Song Si-yeol and dominated late Joseon politics for over 170 years.', color: 'purple', emoji: '🏛️' },
  },
  soron: {
    ko: { name: '소론 (少論)', desc: '유연한 사고와 진보적 개방성을 가진 실용적 개혁파. 다양한 목소리를 수용하며 의미 있는 변화를 선도합니다.', traits: ['유연성', '진보적', '개방적', '실용적'], history: '서인에서 분리. 경종을 지지하며 노론에 대항했으나, 영조 시대 이후 정치적 영향력을 잃었습니다.', color: 'teal', emoji: '🌊' },
    en: { name: 'Soron (Young Doctrine)', desc: 'A pragmatic progressive with flexible thinking and openness. Embraces diverse voices and leads meaningful change.', traits: ['Flexibility', 'Progressive', 'Open-minded', 'Pragmatic'], history: 'Split from Seoin. Supported King Gyeongjong against Noron, but lost political influence after King Yeongjo\'s reign.', color: 'teal', emoji: '🌊' },
  },
}


type Copy = typeof FACTIONS.dongin.ko
type TranslatedLocale = "ja" | "zh" | "fr" | "es"
const translations: Record<TranslatedLocale, Record<FactionKey, Copy>> = {
  "ja": {
    "dongin": {
      "name": "東人（トンイン）",
      "desc": "学問と理想を大切にし、妥協よりも原則を選ぶタイプです。",
      "traits": [
        "理想を重視",
        "原則を大切にする",
        "学問への関心",
        "道徳的信念"
      ],
      "history": "李滉の学統と関わりの深い勢力です。のちに南人と北人に分かれ、鄭汝立事件の後には西人の圧力を受けました。",
      "color": "blue",
      "emoji": "📜"
    },
    "seoin": {
      "name": "西人（ソイン）",
      "desc": "現実的な効率と秩序を重視し、制度の中で成果を目指すタイプです。",
      "traits": [
        "現実的",
        "効率を重視",
        "体系的",
        "論理的"
      ],
      "history": "李珥の学統と関わりの深い勢力です。のちに老論と少論に分かれ、17世紀以降の政治で大きな力を持ちました。",
      "color": "amber",
      "emoji": "⚖️"
    },
    "namin": {
      "name": "南人（ナミン）",
      "desc": "学びの深さとバランスを求め、極端な立場を避けて調和を大切にするタイプです。",
      "traits": [
        "調和を重視",
        "深く学ぶ",
        "穏健",
        "包容力"
      ],
      "history": "東人から分かれた勢力です。粛宗の時代に政権を担いましたが、甲戌換局で失脚しました。実学者も多く生まれました。",
      "color": "green",
      "emoji": "🌿"
    },
    "bukin": {
      "name": "北人（プギン）",
      "desc": "信念を行動に移し、大胆な改革や変化を恐れずに進むタイプです。",
      "traits": [
        "行動的",
        "改革志向",
        "決断力",
        "成果を重視"
      ],
      "history": "東人から分かれた勢力です。光海君を支持して政権を担いましたが、仁祖反正で失脚し、その後は政治の中心から排除されました。",
      "color": "red",
      "emoji": "⚡"
    },
    "noron": {
      "name": "老論（ノロン）",
      "desc": "伝統と正統性を守り、論理と組織力で安定を目指すタイプです。",
      "traits": [
        "伝統を守る",
        "組織的",
        "保守的",
        "安定を重視"
      ],
      "history": "西人から分かれ、宋時烈を中心に勢力を形成しました。朝鮮後期の政治を長く主導しました。",
      "color": "purple",
      "emoji": "🏛️"
    },
    "soron": {
      "name": "少論（ソロン）",
      "desc": "柔軟に考え、さまざまな声を受け入れて変化を目指すタイプです。",
      "traits": [
        "柔軟",
        "変革に前向き",
        "開放的",
        "実用的"
      ],
      "history": "西人から分かれた勢力です。景宗を支持して老論と対立しましたが、英祖の時代以降は政治的影響力が弱まりました。",
      "color": "teal",
      "emoji": "🌊"
    }
  },
  "zh": {
    "dongin": {
      "name": "东人",
      "desc": "重视学问与理想，面对分歧时倾向于坚持原则。",
      "traits": [
        "理想主义",
        "重视原则",
        "热爱学问",
        "道德信念"
      ],
      "history": "这一派系与李滉的学统关系密切，后来分为南人和北人。郑汝立事件后，东人受到西人的压制。",
      "color": "blue",
      "emoji": "📜"
    },
    "seoin": {
      "name": "西人",
      "desc": "重视现实效率与秩序，善于在现有制度中追求成果。",
      "traits": [
        "务实",
        "重视效率",
        "系统思考",
        "讲究逻辑"
      ],
      "history": "这一派系与李珥的学统关系密切，后来分为老论和少论。17世纪以后，西人在政治中占据重要地位。",
      "color": "amber",
      "emoji": "⚖️"
    },
    "namin": {
      "name": "南人",
      "desc": "追求深入学习与适度平衡，重视包容和协调。",
      "traits": [
        "追求和谐",
        "深入学习",
        "温和",
        "包容"
      ],
      "history": "南人从东人分化而来，曾在肃宗时期执政，后因甲戌换局失势。许多实学学者出自这一派系。",
      "color": "green",
      "emoji": "🌿"
    },
    "bukin": {
      "name": "北人",
      "desc": "愿意把信念付诸行动，敢于推动改革与变化。",
      "traits": [
        "行动力",
        "改革精神",
        "果断",
        "重视成果"
      ],
      "history": "北人从东人分化而来，支持光海君并掌权，后在仁祖反正中失势，此后被排除在政治权力中心之外。",
      "color": "red",
      "emoji": "⚡"
    },
    "noron": {
      "name": "老论",
      "desc": "重视传统与正统性，依靠逻辑和组织力追求稳定。",
      "traits": [
        "维护传统",
        "组织能力",
        "保守",
        "追求稳定"
      ],
      "history": "老论从西人分化而来，以宋时烈为中心形成强大势力，长期主导朝鲜后期政治。",
      "color": "purple",
      "emoji": "🏛️"
    },
    "soron": {
      "name": "少论",
      "desc": "思考灵活，愿意倾听不同声音，并以务实方式推动改变。",
      "traits": [
        "灵活",
        "倾向改革",
        "开放",
        "务实"
      ],
      "history": "少论从西人分化而来，支持景宗并与老论对立。英祖时期以后，其政治影响力逐渐减弱。",
      "color": "teal",
      "emoji": "🌊"
    }
  },
  "fr": {
    "dongin": {
      "name": "Dongin (faction orientale)",
      "desc": "Vous privilégiez les principes, les convictions morales et un idéal nourri par l’étude.",
      "traits": [
        "Idéalisme",
        "Principes",
        "Goût de l’étude",
        "Convictions morales"
      ],
      "history": "Liés à la tradition intellectuelle de Yi Hwang, les Dongin se divisèrent en Namin et Bukin. Après l’affaire Jeong Yeo-rip, ils subirent la pression des Seoin.",
      "color": "blue",
      "emoji": "📜"
    },
    "seoin": {
      "name": "Seoin (faction occidentale)",
      "desc": "Vous recherchez des solutions efficaces et un ordre cohérent, en vous appuyant sur les institutions existantes.",
      "traits": [
        "Réalisme",
        "Efficacité",
        "Méthode",
        "Logique"
      ],
      "history": "Liés à la tradition intellectuelle de Yi I, les Seoin se divisèrent en Noron et Soron. Ils occupèrent une place dominante dans la politique à partir du XVIIe siècle.",
      "color": "amber",
      "emoji": "⚖️"
    },
    "namin": {
      "name": "Namin (faction méridionale)",
      "desc": "Vous recherchez la profondeur et l’équilibre, en privilégiant la modération et l’ouverture aux autres.",
      "traits": [
        "Harmonie",
        "Approfondissement",
        "Modération",
        "Ouverture"
      ],
      "history": "Issus des Dongin, les Namin exercèrent le pouvoir sous Sukjong avant de le perdre lors du renversement politique de 1694, dit Gapsul Hwanguk. Plusieurs penseurs du Silhak en sont issus.",
      "color": "green",
      "emoji": "🌿"
    },
    "bukin": {
      "name": "Bukin (faction septentrionale)",
      "desc": "Vous passez volontiers des convictions à l’action et osez proposer des réformes.",
      "traits": [
        "Action",
        "Réforme",
        "Détermination",
        "Résultats"
      ],
      "history": "Issus des Dongin, les Bukin soutinrent Gwanghaegun et accédèrent au pouvoir. Renversés lors du coup d’État qui porta Injo au trône, ils furent ensuite écartés du centre du pouvoir.",
      "color": "red",
      "emoji": "⚡"
    },
    "noron": {
      "name": "Noron (ancienne doctrine)",
      "desc": "Vous privilégiez la stabilité, la tradition et la légitimité, en vous appuyant sur la logique et l’organisation.",
      "traits": [
        "Tradition",
        "Organisation",
        "Conservatisme",
        "Stabilité"
      ],
      "history": "Issus des Seoin, les Noron se structurèrent autour de Song Si-yeol et dominèrent longtemps la politique de la fin de Joseon.",
      "color": "purple",
      "emoji": "🏛️"
    },
    "soron": {
      "name": "Soron (jeune doctrine)",
      "desc": "Vous accueillez des points de vue variés et cherchez à faire évoluer les choses avec souplesse et pragmatisme.",
      "traits": [
        "Souplesse",
        "Réforme",
        "Ouverture",
        "Pragmatisme"
      ],
      "history": "Issus des Seoin, les Soron soutinrent Gyeongjong contre les Noron. Leur influence politique diminua à partir du règne de Yeongjo.",
      "color": "teal",
      "emoji": "🌊"
    }
  },
  "es": {
    "dongin": {
      "name": "Dongin (facción oriental)",
      "desc": "Das prioridad a los principios, las convicciones morales y los ideales que cultivas mediante el estudio.",
      "traits": [
        "Idealismo",
        "Principios",
        "Interés por el estudio",
        "Convicciones morales"
      ],
      "history": "Vinculados a la tradición intelectual de Yi Hwang, los Dongin se dividieron en Namin y Bukin. Tras el caso de Jeong Yeo-rip, sufrieron la presión de los Seoin.",
      "color": "blue",
      "emoji": "📜"
    },
    "seoin": {
      "name": "Seoin (facción occidental)",
      "desc": "Buscas soluciones eficaces y un orden coherente dentro de las instituciones existentes.",
      "traits": [
        "Realismo",
        "Eficiencia",
        "Organización",
        "Lógica"
      ],
      "history": "Vinculados a la tradición intelectual de Yi I, los Seoin se dividieron en Noron y Soron. Tuvieron un papel dominante en la política a partir del siglo XVII.",
      "color": "amber",
      "emoji": "⚖️"
    },
    "namin": {
      "name": "Namin (facción meridional)",
      "desc": "Buscas profundidad y equilibrio, y valoras la moderación y la inclusión.",
      "traits": [
        "Armonía",
        "Estudio profundo",
        "Moderación",
        "Inclusión"
      ],
      "history": "Los Namin surgieron de los Dongin. Gobernaron durante el reinado de Sukjong, pero perdieron el poder en el cambio político de 1694, conocido como Gapsul Hwanguk. De esta facción procedieron varios pensadores del Silhak.",
      "color": "green",
      "emoji": "🌿"
    },
    "bukin": {
      "name": "Bukin (facción septentrional)",
      "desc": "Llevas tus convicciones a la acción y te atreves a impulsar reformas y cambios.",
      "traits": [
        "Acción",
        "Reforma",
        "Determinación",
        "Resultados"
      ],
      "history": "Los Bukin surgieron de los Dongin y apoyaron a Gwanghaegun. Perdieron el poder en el golpe que llevó a Injo al trono y después quedaron apartados del centro del poder político.",
      "color": "red",
      "emoji": "⚡"
    },
    "noron": {
      "name": "Noron (doctrina antigua)",
      "desc": "Valoras la tradición y la legitimidad, y buscas estabilidad mediante la lógica y la organización.",
      "traits": [
        "Tradición",
        "Organización",
        "Conservadurismo",
        "Estabilidad"
      ],
      "history": "Los Noron surgieron de los Seoin y se organizaron en torno a Song Si-yeol. Dominaron durante mucho tiempo la política de la etapa final de Joseon.",
      "color": "purple",
      "emoji": "🏛️"
    },
    "soron": {
      "name": "Soron (doctrina joven)",
      "desc": "Escuchas distintas perspectivas y buscas cambios con flexibilidad y sentido práctico.",
      "traits": [
        "Flexibilidad",
        "Reforma",
        "Apertura",
        "Pragmatismo"
      ],
      "history": "Los Soron surgieron de los Seoin. Apoyaron a Gyeongjong frente a los Noron, pero su influencia política disminuyó a partir del reinado de Yeongjo.",
      "color": "teal",
      "emoji": "🌊"
    }
  }
}

// Stable references prevent the completion effect from recording again on a render (2026-10-27).
export function getFactionCopy(key: FactionKey, locale: string): Copy {
  if (locale === "ko" || locale === "en") return FACTIONS[key][locale]
  const translated = locale === "cn" ? "zh" : locale
  return translations[translated as TranslatedLocale]?.[key] ?? FACTIONS[key].en
}
