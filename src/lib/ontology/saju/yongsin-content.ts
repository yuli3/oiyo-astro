/**
 * 용신/기신 + 항목별 분석 표시 콘텐츠 (6개국어).
 * ko/en 작성 완료 — ja/zh/fr/es는 codex 위임 번역(en 폴백 동작).
 * 코드/키는 yongsin.ts·categories.ts가 생성, 텍스트는 여기서.
 */
import type { Locale } from "../../../i18n";
import { FiveElement } from "./types";

type L<T> = Partial<Record<Locale, T>>;
export const tt = <T>(m: L<T>, locale: Locale): T => (m[locale] ?? m.en) as T;

export const ELEMENT_NAME: Record<FiveElement, L<string>> = {
  [FiveElement.WOOD]: { ko: "목(木)", en: "Wood (木)", ja: "木", zh: "木", fr: "Bois (木)", es: "Madera (木)" },
  [FiveElement.FIRE]: { ko: "화(火)", en: "Fire (火)", ja: "火", zh: "火", fr: "Feu (火)", es: "Fuego (火)" },
  [FiveElement.EARTH]: { ko: "토(土)", en: "Earth (土)", ja: "土", zh: "土", fr: "Terre (土)", es: "Tierra (土)" },
  [FiveElement.METAL]: { ko: "금(金)", en: "Metal (金)", ja: "金", zh: "金", fr: "Métal (金)", es: "Metal (金)" },
  [FiveElement.WATER]: { ko: "수(水)", en: "Water (水)", ja: "水", zh: "水", fr: "Eau (水)", es: "Agua (水)" },
};

// ── 용신 섹션 콘텐츠 ──
export const YONGSIN_C = {
  heading: { ko: "용신(用神) — 사주를 균형 잡는 오행", en: "Yongsin — the element that balances the chart", ja: "用神 — 命式を整える五行", zh: "用神 — 平衡八字的五行", fr: "Yongsin — l'élément qui équilibre le thème", es: "Yongsin — el elemento que equilibra la carta" } as L<string>,
  concept: {
    ko: "용신은 '나한테 이로운 오행'이라는 이름보다, 이 사주가 숨 쉴 구멍을 가리킵니다. 일간(나)이 너무 꽉 차 있으면 빼 주는 기운을, 비어 있으면 채워 주는 기운을 고릅니다. 색·방위·직업을 외우라는 주문이 아니라, 내가 오래 버티는 리듬이 어디에 있는지 보는 눈입니다.",
    en: "Yongsin is less a lucky element than the chart's breathing hole. If the Day Master (you) is packed too tight, we pick what lets air out; if it is thin, we pick what feeds it. Colors and careers are not charms — they are hints at the rhythm you can actually sustain.",
    ja: "用神(用神)は、命式全体のバランスを最もよく整える有利な五行です。日干(自分)の強弱を見て、強すぎれば力を抜き、弱すぎれば支える五行を選びます。この気を暮らしに取り入れると、流れが穏やかになります。",
    zh: "用神(用神)是最能平衡整个四柱的有利五行。我们判断日干(自己)的强弱，若过强就选能泄其气的五行，若过弱就选能扶助它的五行。生活中靠近这种能量，整体流动会更顺畅。",
    fr: "Le Yongsin est l'élément qui équilibre le mieux l'ensemble du thème. On observe si le Maître du jour (vous) est fort ou faible, puis on choisit l'élément qui évacue un excès de force ou soutient une faiblesse. Se rapprocher de cette énergie rend le flux plus souple.",
    es: "El Yongsin es el elemento que mejor equilibra toda tu carta. Observamos si tu Maestro del Dia (tu) es fuerte o debil, y elegimos el elemento que drena un yo demasiado fuerte o sostiene uno demasiado debil. Acercarte a esta energia suaviza tu flujo.",
  } as L<string>,
  disclaimer: {
    ko: "부억용신(扶抑用神) 기준입니다. 조후·병약·통관 등 다른 유파는 결과가 다를 수 있으며, 참고용입니다.",
    en: "Based on the 'support-suppress' (扶抑) school. Other schools (climatic, disease-cure, mediation) may differ; for reference only.",
    ja: "扶抑用神(扶抑用神)を基準にしています。調候・病薬・通関など他の流派では結果が異なる場合があり、参考用です。",
    zh: "基于扶抑用神(扶抑用神)体系。调候、病药、通关等其他流派的结果可能不同；仅供参考。",
    fr: "Fondé sur l'école dite de soutien-suppression (扶抑). D'autres écoles (climat, maladie-remède, médiation) peuvent donner un résultat différent ; à titre indicatif seulement.",
    es: "Basado en la escuela de apoyo-supresión (扶抑). Otras escuelas (climática, enfermedad-remedio, mediación) pueden diferir; solo como referencia.",
  } as L<string>,
  hourCaveat: {
    ko: "출생 시(時)를 입력하지 않아 정오 기준 근사값입니다. 시를 입력하면 더 정확합니다.",
    en: "Birth hour not entered — approximated at noon. Enter your hour for higher accuracy.",
    ja: "出生時刻(時)が未入力のため、正午基準の近似値です。時刻を入力すると精度が上がります。",
    zh: "未输入出生时辰(时)，因此按正午近似计算。输入时辰后会更准确。",
    fr: "L'heure de naissance n'a pas été saisie : l'estimation est faite à midi. Saisissez l'heure pour plus de précision.",
    es: "No se ingresó la hora de nacimiento: se aproxima al mediodía. Ingresa la hora para mayor precisión.",
  } as L<string>,
  strengthLabel: {
    strong: { ko: "신강(身强)", en: "Strong Self", ja: "身強(身强)", zh: "身强(身强)", fr: "Soi fort (身强)", es: "Yo fuerte (身强)" } as L<string>,
    balanced: { ko: "중화(中和)", en: "Balanced", ja: "中和(中和)", zh: "中和(中和)", fr: "Équilibré (中和)", es: "Equilibrado (中和)" } as L<string>,
    weak: { ko: "신약(身弱)", en: "Weak Self", ja: "身弱(身弱)", zh: "身弱(身弱)", fr: "Soi faible (身弱)", es: "Yo débil (身弱)" } as L<string>,
  },
  strengthDesc: {
    strong: { ko: "나를 밀어주는 기운이 이미 많습니다. 더 쌓기보다 밖으로 쓰는 쪽이 이롭습니다. 말하지 않은 채 버티다 한 번에 터지는 버릇이 있다면, 식상처럼 '내보내는 일'이 숨구멍이 됩니다.", en: "Plenty already stands behind you. Adding more of the same often ends in a delayed blow-up. Work that sends energy outward — making, teaching, speaking — is the vent, not another pile.", ja: "日干を助ける気が十分にあります。そのエネルギーを外へ放つ五行が有利です。", zh: "扶助日干的能量充足。能把这股能量向外释放的五行对你有利。", fr: "Votre Maître du jour reçoit beaucoup de soutien. Les éléments qui libèrent cette énergie vers l'extérieur vous aident.", es: "Tu Maestro del Día recibe bastante apoyo. Te ayudan los elementos que liberan esa energía hacia afuera." } as L<string>,
    balanced: { ko: "비교적 균형이 잡혀 있습니다. 부족한 쪽을 살짝 보완하는 오행이 이롭습니다.", en: "Fairly balanced. An element that gently fills the lacking side helps you.", ja: "比較的バランスが取れています。足りない側をそっと補う五行が有利です。", zh: "整体较为平衡。能轻轻补足不足一侧的五行对你有利。", fr: "L'ensemble est assez équilibré. Un élément qui comble doucement le côté manquant vous aide.", es: "Hay bastante equilibrio. Te ayuda un elemento que complete suavemente el lado que falta." } as L<string>,
    weak: { ko: "나를 받쳐 주는 기둥이 얇습니다. 더 잘하라는 잔소리보다, 누가·무엇이 나를 길러 주는지가 먼저입니다. 혼자 버틴 시간이 길다면, 인성·비겁처럼 '채우는 쪽'을 생활에 들이는 질문을 적어 가면 됩니다.", en: "The pillars under you run thin. Before 'try harder', ask what actually feeds you. If you have been holding the room alone, Resource and Peer are not extras — they are the missing meal.", ja: "日干を助ける気が不足しています。自分を育ててくれる五行が有利です。", zh: "日干缺少扶助。能滋养你的五行对你有利。", fr: "Votre Maître du jour manque de soutien. Les éléments qui vous nourrissent vous aident.", es: "A tu Maestro del Día le falta apoyo. Te ayudan los elementos que te nutren." } as L<string>,
  },
  // Deliberately distinct from `heading` above (which also contains "이로운
  // 기운") — this label sits directly under that title in the same card, and
  // repeating the exact phrase read as a duplicate rather than two things.
  favorableHeading: { ko: "도움 되는 오행", en: "Elements that help", ja: "助けになる五行", zh: "有帮助的五行", fr: "Éléments qui aident", es: "Elementos que ayudan" } as L<string>,
  unfavorableHeading: { ko: "주의할 기운", en: "Energy to watch", ja: "注意したい気", zh: "需要留意的能量", fr: "Énergie à surveiller", es: "Energía a vigilar" } as L<string>,
  yongsinLabel: { ko: "용신", en: "Yongsin (primary)", ja: "用神(主)", zh: "用神(主要)", fr: "Yongsin (principal)", es: "Yongsin (principal)" } as L<string>,
  huisinLabel: { ko: "희신", en: "Huisin (secondary)", ja: "喜神(補助)", zh: "喜神(辅助)", fr: "Huisin (secondaire)", es: "Huisin (secundario)" } as L<string>,
  gisinLabel: { ko: "기신", en: "Gisin (avoid)", ja: "忌神(避ける)", zh: "忌神(避免)", fr: "Gisin (à éviter)", es: "Gisin (evitar)" } as L<string>,
  gusinLabel: { ko: "구신", en: "Gusin (secondary)", ja: "仇神(補助)", zh: "仇神(次要)", fr: "Gusin (secondaire)", es: "Gusin (secundario)" } as L<string>,
  reason: {
    "strong-drain": { ko: "일간이 강해 식상(食傷)으로 기운을 자연스럽게 풀어주는 것이 좋습니다.", en: "Your self is strong, so the Output element that releases energy suits you best.", ja: "日干が強いため、食傷(食傷)で気を自然に発散させるのがよいでしょう。", zh: "日干偏强，适合用食伤(食伤)自然地释放能量。", fr: "Votre soi est fort ; l'élément Production (食傷), qui libère l'énergie, vous convient le mieux.", es: "Tu yo es fuerte, por eso te conviene el elemento de Producción (食傷), que libera la energía." } as L<string>,
    "strong-wealth": { ko: "인성이 강해 일간이 단단하니, 재성(財星)으로 자원을 다스리는 것이 좋습니다.", en: "A resource-heavy strong self is best balanced by the Wealth element.", ja: "印星が強く日干がしっかりしているため、財星(財星)で資源を扱うのがよいでしょう。", zh: "印星较强使日干稳固，适合用财星(财星)来管理资源。", fr: "Un soi fort, très soutenu par la Ressource, s'équilibre le mieux avec l'élément Richesse (財星).", es: "Un yo fuerte con mucho Recurso se equilibra mejor con el elemento Riqueza (財星)." } as L<string>,
    "strong-control": { ko: "비겁이 강하니, 관성(官星)으로 절제와 질서를 더하는 것이 좋습니다.", en: "With strong peers, the Authority element that adds discipline suits you.", ja: "比劫が強いため、官星(官星)で節制と秩序を加えるのがよいでしょう。", zh: "比劫偏强，适合用官星(官星)增加节制与秩序。", fr: "Avec des Pairs forts, l'élément Autorité (官星), qui ajoute discipline et ordre, vous convient.", es: "Con Pares fuertes, te conviene el elemento Autoridad (官星), que aporta disciplina y orden." } as L<string>,
    "weak-resource": { ko: "일간이 약하니, 인성(印星)으로 나를 길러 채우는 것이 좋습니다.", en: "A weak self is best nourished by the Resource element.", ja: "日干が弱いため、印星(印星)で自分を育て補うのがよいでしょう。", zh: "日干偏弱，适合用印星(印星)来滋养并补足自己。", fr: "Un soi faible est mieux nourri par l'élément Ressource (印星).", es: "Un yo débil se nutre mejor con el elemento Recurso (印星)." } as L<string>,
    "weak-peer": { ko: "일간이 약하니, 비겁(比劫)으로 같은 편의 힘을 더하는 것이 좋습니다.", en: "A weak self is reinforced by the Peer element.", ja: "日干が弱いため、比劫(比劫)で同じ側の力を加えるのがよいでしょう。", zh: "日干偏弱，适合用比劫(比劫)增强同类的力量。", fr: "Un soi faible est renforcé par l'élément Pair (比劫).", es: "Un yo débil se refuerza con el elemento Par (比劫)." } as L<string>,
    "balanced-temper": { ko: "균형이 잡혀 있어, 흐름을 부드럽게 잇는 오행이 좋습니다.", en: "Being balanced, an element that bridges the flow suits you.", ja: "バランスが取れているため、流れをなめらかにつなぐ五行が合います。", zh: "整体平衡，适合能柔和衔接气流的五行。", fr: "Comme l'ensemble est équilibré, un élément qui relie le flux en douceur vous convient.", es: "Al estar equilibrado, te conviene un elemento que conecte el flujo con suavidad." } as L<string>,
  } as Record<string, L<string>>,
  elementFavorable: {
    wood: { ko: "성장·기획·배움의 기운. 새로 시작하고 뻗어나가는 일에 힘이 붙습니다.", en: "Growth, planning and learning. Starting and expanding gains momentum.", ja: "成長・企画・学びの気。新しく始め、伸びていくことに勢いがつきます。", zh: "成长、规划、学习的能量。开始新事物、向外拓展会更有动力。", fr: "Énergie de croissance, de planification et d'apprentissage. Les débuts et l'expansion prennent de l'élan.", es: "Energía de crecimiento, planificación y aprendizaje. Empezar y expandirte gana impulso." } as L<string>,
    fire: { ko: "표현·열정·확산의 기운. 알리고 빛나는 일, 사람을 끄는 일에 유리합니다.", en: "Expression, passion, visibility. Promoting and shining draw people in.", ja: "表現・情熱・拡散の気。知らせること、輝くこと、人を惹きつけることに有利です。", zh: "表达、热情、扩散的能量。适合宣传、发光发热、吸引他人的事。", fr: "Énergie d'expression, de passion et de visibilité. Promouvoir, rayonner et attirer les gens devient favorable.", es: "Energía de expresión, pasión y visibilidad. Favorece promocionar, brillar y atraer personas." } as L<string>,
    earth: { ko: "안정·신뢰·중재의 기운. 지키고 쌓고 사이를 잇는 일에 든든합니다.", en: "Stability, trust, mediation. Keeping, accumulating and connecting feel solid.", ja: "安定・信頼・仲介の気。守ること、積み重ねること、間をつなぐことに強みがあります。", zh: "稳定、信任、调和的能量。守成、积累、连接彼此会更稳固。", fr: "Énergie de stabilité, de confiance et de médiation. Préserver, accumuler et relier devient solide.", es: "Energía de estabilidad, confianza y mediación. Sostener, acumular y conectar se siente firme." } as L<string>,
    metal: { ko: "결단·원칙·정리의 기운. 매듭짓고 다듬고 판단하는 일에 강합니다.", en: "Decisiveness, principle, refinement. Concluding, polishing and judging are strong.", ja: "決断・原則・整理の気。締めくくること、磨くこと、判断することに強みがあります。", zh: "决断、原则、整理的能量。擅长收尾、打磨与判断。", fr: "Énergie de décision, de principe et de clarification. Conclure, affiner et juger sont des forces.", es: "Energía de decisión, principios y orden. Eres fuerte al cerrar, pulir y juzgar." } as L<string>,
    water: { ko: "지혜·유연·흐름의 기운. 궁리하고 적응하고 연결하는 일에 능합니다.", en: "Wisdom, flexibility, flow. Thinking, adapting and connecting come easily.", ja: "知恵・柔軟性・流れの気。考え、適応し、つなぐことが得意です。", zh: "智慧、灵活、流动的能量。善于思考、适应与连接。", fr: "Énergie de sagesse, de souplesse et de flux. Réfléchir, s'adapter et relier vient facilement.", es: "Energía de sabiduría, flexibilidad y flujo. Pensar, adaptarte y conectar se te da con facilidad." } as L<string>,
  } as Record<string, L<string>>,
  elementUnfavorable: {
    wood: { ko: "과하면 욕심·산만함으로 흐를 수 있어 절제가 필요합니다.", en: "In excess it can scatter into over-ambition; temper it.", ja: "過ぎると欲張りや散漫さに流れやすいため、節制が必要です。", zh: "过多时容易变成贪心或分散，需要有所节制。", fr: "En excès, elle peut se disperser en ambition excessive ; tempérez-la.", es: "En exceso, puede dispersarse en ambición desmedida; modérala." } as L<string>,
    fire: { ko: "과하면 들뜸·소진으로 흐를 수 있어 식히는 균형이 필요합니다.", en: "In excess it can overheat into burnout; cool it down.", ja: "過ぎると高ぶりや消耗に流れやすいため、冷ますバランスが必要です。", zh: "过多时容易兴奋过度并消耗，需要降温平衡。", fr: "En excès, elle peut surchauffer jusqu'à l'épuisement ; rafraîchissez-la.", es: "En exceso, puede sobrecalentarse hasta el agotamiento; enfríala." } as L<string>,
    earth: { ko: "과하면 고집·정체로 흐를 수 있어 환기가 필요합니다.", en: "In excess it can harden into stubbornness; let air in.", ja: "過ぎると頑固さや停滞に流れやすいため、風通しが必要です。", zh: "过多时容易变成固执与停滞，需要保持通透。", fr: "En excès, elle peut se durcir en entêtement ; aérez-la.", es: "En exceso, puede endurecerse en terquedad; dale aire." } as L<string>,
    metal: { ko: "과하면 냉정·경직으로 흐를 수 있어 부드러움이 필요합니다.", en: "In excess it can turn cold and rigid; soften it.", ja: "過ぎると冷たさや硬直に流れやすいため、柔らかさが必要です。", zh: "过多时容易变得冷淡僵硬，需要柔和下来。", fr: "En excès, elle peut devenir froide et rigide ; adoucissez-la.", es: "En exceso, puede volverse fría y rígida; suavízala." } as L<string>,
    water: { ko: "과하면 불안·우유부단으로 흐를 수 있어 중심이 필요합니다.", en: "In excess it can drift into worry and indecision; find your center.", ja: "過ぎると不安や優柔不断に流れやすいため、中心軸が必要です。", zh: "过多时容易流向不安与优柔寡断，需要找回中心。", fr: "En excès, elle peut dériver vers l'inquiétude et l'indécision ; retrouvez votre centre.", es: "En exceso, puede derivar en preocupación e indecisión; encuentra tu centro." } as L<string>,
  } as Record<string, L<string>>,
  attrsHeading: { ko: "용신을 키우는 일상", en: "Everyday ways to lean into Yongsin", ja: "用神を育てる暮らし", zh: "在日常中养用神", fr: "Le quotidien pour nourrir le Yongsin", es: "El día a día para cultivar el Yongsin" } as L<string>,
  labels: {
    color: { ko: "색", en: "Color", ja: "色", zh: "颜色", fr: "Couleur", es: "Color" } as L<string>,
    direction: { ko: "방위", en: "Direction", ja: "方位", zh: "方位", fr: "Direction", es: "Dirección" } as L<string>,
    numbers: { ko: "숫자", en: "Numbers", ja: "数字", zh: "数字", fr: "Nombres", es: "Números" } as L<string>,
    season: { ko: "계절", en: "Season", ja: "季節", zh: "季节", fr: "Saison", es: "Estación" } as L<string>,
    career: { ko: "직업 분야", en: "Fields", ja: "職業分野", zh: "职业领域", fr: "Domaines", es: "Campos" } as L<string>,
    food: { ko: "음식", en: "Food", ja: "食べ物", zh: "食物", fr: "Aliments", es: "Alimentos" } as L<string>,
  },
  colorName: {
    green: { ko: "초록", en: "Green", ja: "緑", zh: "绿色", fr: "Vert", es: "Verde" }, red: { ko: "빨강", en: "Red", ja: "赤", zh: "红色", fr: "Rouge", es: "Rojo" }, yellow: { ko: "노랑", en: "Yellow", ja: "黄色", zh: "黄色", fr: "Jaune", es: "Amarillo" }, white: { ko: "흰색", en: "White", ja: "白", zh: "白色", fr: "Blanc", es: "Blanco" }, black: { ko: "검정·남색", en: "Black/Navy", ja: "黒・紺", zh: "黑色/藏蓝", fr: "Noir/bleu marine", es: "Negro/azul marino" },
  } as Record<string, L<string>>,
  directionName: {
    east: { ko: "동쪽", en: "East", ja: "東", zh: "东方", fr: "Est", es: "Este" }, south: { ko: "남쪽", en: "South", ja: "南", zh: "南方", fr: "Sud", es: "Sur" }, center: { ko: "중앙", en: "Center", ja: "中央", zh: "中央", fr: "Centre", es: "Centro" }, west: { ko: "서쪽", en: "West", ja: "西", zh: "西方", fr: "Ouest", es: "Oeste" }, north: { ko: "북쪽", en: "North", ja: "北", zh: "北方", fr: "Nord", es: "Norte" },
  } as Record<string, L<string>>,
  seasonName: {
    spring: { ko: "봄", en: "Spring", ja: "春", zh: "春季", fr: "Printemps", es: "Primavera" }, summer: { ko: "여름", en: "Summer", ja: "夏", zh: "夏季", fr: "Été", es: "Verano" }, transition: { ko: "환절기", en: "Transitions", ja: "季節の変わり目", zh: "换季", fr: "Transitions saisonnières", es: "Transiciones estacionales" }, autumn: { ko: "가을", en: "Autumn", ja: "秋", zh: "秋季", fr: "Automne", es: "Otoño" }, winter: { ko: "겨울", en: "Winter", ja: "冬", zh: "冬季", fr: "Hiver", es: "Invierno" },
  } as Record<string, L<string>>,
  foodName: {
    wood: { ko: "신맛·푸른 채소", en: "Sour foods, green vegetables", ja: "酸味・緑の野菜", zh: "酸味食物、绿色蔬菜", fr: "Aliments acides, légumes verts", es: "Alimentos ácidos, verduras verdes" }, fire: { ko: "쓴맛·붉은 음식", en: "Bitter foods, red foods", ja: "苦味・赤い食べ物", zh: "苦味食物、红色食物", fr: "Aliments amers, aliments rouges", es: "Alimentos amargos, alimentos rojos" }, earth: { ko: "단맛·뿌리채소", en: "Sweet foods, root vegetables", ja: "甘味・根菜", zh: "甜味食物、根茎类蔬菜", fr: "Aliments doux, légumes-racines", es: "Alimentos dulces, tubérculos" }, metal: { ko: "매운맛·흰 음식", en: "Pungent foods, white foods", ja: "辛味・白い食べ物", zh: "辛味食物、白色食物", fr: "Aliments piquants, aliments blancs", es: "Alimentos picantes, alimentos blancos" }, water: { ko: "짠맛·검은 음식", en: "Salty foods, dark foods", ja: "塩味・黒い食べ物", zh: "咸味食物、深色食物", fr: "Aliments salés, aliments foncés", es: "Alimentos salados, alimentos oscuros" },
  } as Record<string, L<string>>,
  careerName: {
    education: { ko: "교육", en: "Education", ja: "教育", zh: "教育", fr: "Éducation", es: "Educación" }, publishing: { ko: "출판·콘텐츠", en: "Publishing", ja: "出版・コンテンツ", zh: "出版/内容", fr: "Édition et contenus", es: "Edición y contenidos" }, design: { ko: "디자인", en: "Design", ja: "デザイン", zh: "设计", fr: "Design", es: "Diseño" }, wellness: { ko: "웰니스", en: "Wellness", ja: "ウェルネス", zh: "健康养生", fr: "Bien-être", es: "Bienestar" },
    media: { ko: "미디어", en: "Media", ja: "メディア", zh: "媒体", fr: "Médias", es: "Medios" }, marketing: { ko: "마케팅", en: "Marketing", ja: "マーケティング", zh: "营销", fr: "Marketing", es: "Marketing" }, entertainment: { ko: "엔터테인먼트", en: "Entertainment", ja: "エンターテインメント", zh: "娱乐", fr: "Divertissement", es: "Entretenimiento" }, it: { ko: "IT", en: "IT", ja: "IT", zh: "IT", fr: "IT", es: "TI" },
    realestate: { ko: "부동산", en: "Real estate", ja: "不動産", zh: "房地产", fr: "Immobilier", es: "Bienes raíces" }, agriculture: { ko: "농업·식품", en: "Agriculture", ja: "農業・食品", zh: "农业/食品", fr: "Agriculture et alimentation", es: "Agricultura y alimentación" }, consulting: { ko: "컨설팅", en: "Consulting", ja: "コンサルティング", zh: "咨询", fr: "Conseil", es: "Consultoría" }, civil: { ko: "공공·행정", en: "Public sector", ja: "公共・行政", zh: "公共/行政", fr: "Secteur public", es: "Sector público" },
    finance: { ko: "금융", en: "Finance", ja: "金融", zh: "金融", fr: "Finance", es: "Finanzas" }, law: { ko: "법률", en: "Law", ja: "法律", zh: "法律", fr: "Droit", es: "Derecho" }, engineering: { ko: "엔지니어링", en: "Engineering", ja: "エンジニアリング", zh: "工程", fr: "Ingénierie", es: "Ingeniería" }, medicine: { ko: "의료", en: "Medicine", ja: "医療", zh: "医疗", fr: "Médecine", es: "Medicina" },
    trade: { ko: "무역", en: "Trade", ja: "貿易", zh: "贸易", fr: "Commerce international", es: "Comercio" }, logistics: { ko: "물류", en: "Logistics", ja: "物流", zh: "物流", fr: "Logistique", es: "Logística" }, research: { ko: "연구", en: "Research", ja: "研究", zh: "研究", fr: "Recherche", es: "Investigación" }, hospitality: { ko: "관광·서비스", en: "Hospitality", ja: "観光・サービス", zh: "旅游/服务", fr: "Tourisme et services", es: "Turismo y servicios" },
  } as Record<string, L<string>>,
};

// ── 항목별 분석 콘텐츠 ──
export const CATEGORIES_C = {
  sectionHeading: { ko: "항목별 사주 분석", en: "Life-Domain Analysis", ja: "項目別四柱分析", zh: "分项四柱分析", fr: "Analyse par domaines de vie", es: "Análisis por áreas de vida" } as L<string>,
  roleName: {
    bigyeop: { ko: "비겁(比劫)", en: "Peer", ja: "比劫(比劫)", zh: "比劫(比劫)", fr: "Pair (比劫)", es: "Par (比劫)" }, insung: { ko: "인성(印星)", en: "Resource", ja: "印星(印星)", zh: "印星(印星)", fr: "Ressource (印星)", es: "Recurso (印星)" }, siksang: { ko: "식상(食傷)", en: "Output", ja: "食傷(食傷)", zh: "食伤(食伤)", fr: "Production (食傷)", es: "Producción (食傷)" }, jaesung: { ko: "재성(財星)", en: "Wealth", ja: "財星(財星)", zh: "财星(财星)", fr: "Richesse (財星)", es: "Riqueza (財星)" }, gwansung: { ko: "관성(官星)", en: "Authority", ja: "官星(官星)", zh: "官星(官星)", fr: "Autorité (官星)", es: "Autoridad (官星)" },
  } as Record<string, L<string>>,
  level: {
    strong: { ko: "강함", en: "Strong", ja: "強い", zh: "强", fr: "Fort", es: "Fuerte" }, moderate: { ko: "보통", en: "Moderate", ja: "普通", zh: "中等", fr: "Modéré", es: "Moderado" }, weak: { ko: "약함", en: "Weak", ja: "弱い", zh: "弱", fr: "Faible", es: "Débil" }, absent: { ko: "없음", en: "Absent", ja: "なし", zh: "缺失", fr: "Absent", es: "Ausente" },
  } as Record<string, L<string>>,
  stance: {
    favorable: { ko: "이로움", en: "Favorable", ja: "有利", zh: "有利", fr: "Favorable", es: "Favorable" }, unfavorable: { ko: "주의", en: "Caution", ja: "注意", zh: "注意", fr: "Prudence", es: "Precaución" }, neutral: { ko: "중립", en: "Neutral", ja: "中立", zh: "中性", fr: "Neutre", es: "Neutral" },
  } as Record<string, L<string>>,
  wealth: {
    title: { ko: "재물운", en: "Wealth", ja: "財運", zh: "财运", fr: "Richesse", es: "Riqueza" } as L<string>,
    intro: { ko: "재성은 '돈 별'이라기보다, 내가 세상과 물건을 다루는 손입니다. 벌고 쓰고 남기는 리듬이 여기서 읽힙니다.", en: "The Wealth star is less a money badge than the hand you use on the world — earning, spending, keeping.", ja: "財は財星(財星)で読みます。", zh: "财富通过财星(财星)来看。", fr: "La richesse se lit à travers l'étoile de Richesse (財星).", es: "La riqueza se interpreta mediante la estrella de Riqueza (財星)." } as L<string>,
    guide: {
      favorable: { ko: "재성이 용신과 어울려 노력이 재물로 잘 이어집니다. 실속 있는 투자·관리에 강점이 있습니다.", en: "Wealth aligns with your favorable element, so effort converts to money well. You manage and invest substantively.", ja: "財星が用神と調和し、努力が財につながりやすい配置です。実のある投資や管理に強みがあります。", zh: "财星与用神相合，努力容易转化为财富。你在务实投资与管理上有优势。", fr: "La Richesse s'accorde avec votre élément favorable, donc l'effort se convertit bien en argent. Vous avez des forces en gestion et en investissement concrets.", es: "La Riqueza se alinea con tu elemento favorable, por eso el esfuerzo se convierte bien en dinero. Tienes fortaleza para invertir y gestionar con sentido práctico." } as L<string>,
      unfavorable: { ko: "재물 욕심이 균형을 흔들 수 있습니다. 무리한 확장보다 분수에 맞는 관리가 유리합니다.", en: "Chasing money may unbalance you. Steady management beats overreach.", ja: "財への欲がバランスを揺らしやすいです。無理な拡大より、身の丈に合った管理が有利です。", zh: "对财富的欲望可能扰乱平衡。与其过度扩张，不如按自身条件稳健管理。", fr: "La poursuite de l'argent peut vous déséquilibrer. Une gestion régulière vaut mieux qu'une expansion excessive.", es: "Perseguir el dinero puede desequilibrarte. Una gestión constante supera el exceso de ambición." } as L<string>,
      neutral: { ko: "재물은 꾸준함으로 쌓이는 구조입니다. 큰 한 방보다 반복되는 흐름을 만드세요.", en: "Wealth builds through consistency. Favor repeatable flows over a big break.", ja: "財は継続によって積み上がる構造です。一発逆転より、繰り返せる流れを作りましょう。", zh: "财富属于靠持续积累的结构。与其追求一次爆发，不如打造可重复的流动。", fr: "La richesse se construit par la constance. Privilégiez des flux répétables plutôt qu'un grand coup.", es: "La riqueza se construye con constancia. Prioriza flujos repetibles antes que un gran golpe de suerte." } as L<string>,
    },
    overwhelmed: { ko: "재성이 강한데 일간이 약해 '재다신약'입니다. 돈을 다룰 체력(인성·비겁)을 먼저 키우면 재물이 내 것이 됩니다.", en: "Strong wealth with a weak self ('wealth overwhelms the self'). Build your own capacity (Resource/Peer) first, then wealth becomes yours.", ja: "財星が強く日干が弱い「財多身弱」です。お金を扱う体力(印星・比劫)を先に育てると、財が自分のものになります。", zh: "财星强而日干弱，属于“财多身弱”。先培养驾驭金钱的承载力(印星、比劫)，财富才会真正为你所有。", fr: "Richesse forte avec un soi faible : c'est le cas où la richesse submerge le soi. Développez d'abord votre capacité personnelle (Ressource/Pair), puis la richesse devient vraiment vôtre.", es: "Riqueza fuerte con un yo débil: la riqueza abruma al yo. Primero desarrolla tu propia capacidad (Recurso/Par), y entonces la riqueza se vuelve tuya." } as L<string>,
  },
  career: {
    title: { ko: "진로·직업운", en: "Career", ja: "進路・仕事運", zh: "职业与事业运", fr: "Carrière", es: "Carrera" } as L<string>,
    intro: { ko: "직업은 적성 검사 한 줄이 아닙니다. 사주에서 가장 크게 울리는 십성이, 일을 할 때 내가 어느 자리에 있어야 숨이 덜 막히는지를 가리킵니다.", en: "Career here is not a job-title quiz. The loudest ten-god in the chart is the seat where your work-breath comes easier.", ja: "職業傾向は、最も目立つ十星から読みます。", zh: "职业倾向通过最突出的十神来看。", fr: "Le style de carrière se lit à partir du dix-dieu le plus marqué.", es: "El estilo profesional se interpreta a partir del diez-dios más destacado." } as L<string>,
    mode: {
      official: { ko: "관성이 우세 — 조직·전문직·공직처럼 질서와 책임이 분명한 길이 맞습니다.", en: "Authority-led — organizations, professions and public roles with clear order suit you.", ja: "官星が優勢 — 組織・専門職・公職のように秩序と責任が明確な道が合います。", zh: "官星占优 — 适合组织、专业岗位、公职等秩序与责任明确的道路。", fr: "Dominante Autorité : les organisations, professions et fonctions publiques avec un ordre clair vous conviennent.", es: "Dominio de Autoridad: te convienen organizaciones, profesiones y roles públicos con orden claro." } as L<string>,
      creative: { ko: "식상이 우세 — 창작·표현·창업처럼 결과물을 내보이는 길이 맞습니다.", en: "Output-led — creative, expressive and entrepreneurial paths that ship work suit you.", ja: "食傷が優勢 — 創作・表現・起業のように成果物を外へ出す道が合います。", zh: "食伤占优 — 适合创作、表达、创业等把成果展示出来的道路。", fr: "Dominante Production : les voies créatives, expressives et entrepreneuriales qui livrent un résultat vous conviennent.", es: "Dominio de Producción: te convienen caminos creativos, expresivos y emprendedores que muestran resultados." } as L<string>,
      academic: { ko: "인성이 우세 — 학문·연구·자격처럼 배우고 쌓는 길이 맞습니다.", en: "Resource-led — academic, research and credential paths that accumulate knowledge suit you.", ja: "印星が優勢 — 学問・研究・資格のように学び積み上げる道が合います。", zh: "印星占优 — 适合学术、研究、资格认证等学习并积累的道路。", fr: "Dominante Ressource : les voies académiques, de recherche et de certification qui accumulent le savoir vous conviennent.", es: "Dominio de Recurso: te convienen caminos académicos, de investigación y credenciales que acumulan conocimiento." } as L<string>,
      peer: { ko: "비겁이 우세 — 동업·전문가 네트워크처럼 같은 편과 함께하는 길이 맞습니다.", en: "Peer-led — partnerships and expert networks where you work alongside equals suit you.", ja: "比劫が優勢 — 共同事業・専門家ネットワークのように仲間と共に進む道が合います。", zh: "比劫占优 — 适合合伙、专家网络等与同伴并肩前行的道路。", fr: "Dominante Pair : les partenariats et réseaux d'experts où vous travaillez avec des égaux vous conviennent.", es: "Dominio de Par: te convienen asociaciones y redes de expertos donde trabajas junto a iguales." } as L<string>,
    },
    fieldsLabel: { ko: "추천 분야(용신 기준)", en: "Suggested fields (by favorable element)", ja: "おすすめ分野(用神基準)", zh: "推荐领域(按用神)", fr: "Domaines suggérés (selon l'élément favorable)", es: "Campos sugeridos (según el elemento favorable)" } as L<string>,
  },
  love: {
    title: { ko: "연애·결혼운", en: "Love & Marriage", ja: "恋愛・結婚運", zh: "恋爱与婚姻运", fr: "Amour et mariage", es: "Amor y matrimonio" } as L<string>,
    intro: { ko: "배우자성(남=재성, 여=관성)과 일지(배우자궁)로 봅니다.", en: "Read through the spouse star (men=Wealth, women=Authority) and the Day branch (spouse palace).", ja: "配偶者星(男性=財星、女性=官星)と日支(配偶者宮)で読みます。", zh: "通过配偶星(男=财星，女=官星)与日支(配偶宫)来看。", fr: "Se lit à travers l'étoile du conjoint (hommes=Richesse, femmes=Autorité) et la branche du jour (palais du conjoint).", es: "Se interpreta mediante la estrella de pareja (hombres=Riqueza, mujeres=Autoridad) y la rama del Día (palacio de pareja)." } as L<string>,
    guide: {
      favorable: { ko: "인연의 기운이 용신과 어울려 관계가 힘이 됩니다. 솔직함이 좋은 인연을 부릅니다.", en: "Your relationship energy aligns with your favorable element; bonds empower you. Honesty draws good ties.", ja: "縁の気が用神と調和し、関係が力になります。率直さがよい縁を引き寄せます。", zh: "缘分之气与用神相合，关系会成为力量。真诚会带来好的缘分。", fr: "Votre énergie relationnelle s'accorde avec votre élément favorable ; les liens vous renforcent. La sincérité attire de bonnes relations.", es: "Tu energía de relación se alinea con tu elemento favorable; los vínculos te fortalecen. La sinceridad atrae buenas conexiones." } as L<string>,
      unfavorable: { ko: "관계에서 균형이 흔들리기 쉽습니다. 기대를 낮추고 속도를 맞추면 안정됩니다.", en: "Balance can wobble in relationships. Lower expectations and match pace to steady it.", ja: "関係の中でバランスが揺れやすいです。期待を下げ、歩調を合わせると安定します。", zh: "关系中的平衡容易摇晃。降低期待并配合节奏，会更稳定。", fr: "L'équilibre peut vaciller dans les relations. Abaissez les attentes et ajustez le rythme pour le stabiliser.", es: "El equilibrio puede tambalearse en las relaciones. Baja expectativas y acompasa el ritmo para estabilizarlo." } as L<string>,
      neutral: { ko: "인연은 천천히 무르익는 편입니다. 익숙함 속에서 신뢰를 쌓으세요.", en: "Bonds ripen slowly for you. Build trust within familiarity.", ja: "縁はゆっくり熟していくタイプです。慣れ親しんだ中で信頼を積み重ねましょう。", zh: "你的缘分多半慢慢成熟。请在熟悉感中积累信任。", fr: "Les liens mûrissent lentement pour vous. Construisez la confiance dans la familiarité.", es: "Tus vínculos maduran lentamente. Construye confianza dentro de lo familiar." } as L<string>,
    },
    palaceLabel: { ko: "배우자궁(일지)", en: "Spouse palace (Day branch)", ja: "配偶者宮(日支)", zh: "配偶宫(日支)", fr: "Palais du conjoint (branche du jour)", es: "Palacio de pareja (rama del Día)" } as L<string>,
  },
  health: {
    title: { ko: "건강운", en: "Health", ja: "健康運", zh: "健康运", fr: "Santé", es: "Salud" } as L<string>,
    intro: { ko: "오행의 균형으로 봅니다. 치우친 오행이 약한 장부를 알려줍니다.", en: "Read through five-element balance; the skewed element flags a vulnerable organ system.", ja: "五行のバランスで読みます。偏った五行が弱りやすい臓腑を示します。", zh: "通过五行平衡来看。偏颇的五行会提示较脆弱的脏腑系统。", fr: "Se lit à travers l'équilibre des cinq éléments ; l'élément désaxé signale un système organique vulnérable.", es: "Se interpreta mediante el equilibrio de los cinco elementos; el elemento desviado señala un sistema orgánico vulnerable." } as L<string>,
    imbalance: {
      excess: { ko: "특정 오행이 과합니다. 그 기운이 향하는 장부에 무리가 가지 않게 균형을 살피세요.", en: "One element is excessive. Keep its organ system from overstrain by rebalancing.", ja: "特定の五行が過剰です。その気が向かう臓腑に負担がかからないよう、バランスを見直しましょう。", zh: "某个五行过旺。请注意重新平衡，避免其对应的脏腑系统过度受压。", fr: "Un élément est excessif. Rééquilibrez pour éviter de surcharger le système organique associé.", es: "Un elemento está en exceso. Reequilibra para evitar sobrecargar su sistema orgánico asociado." } as L<string>,
      deficient: { ko: "특정 오행이 부족합니다. 해당 장부를 평소에 따뜻하게 보살피세요.", en: "One element is deficient. Gently care for the related organ system day to day.", ja: "特定の五行が不足しています。対応する臓腑を日頃からやさしくいたわりましょう。", zh: "某个五行不足。日常请温和照顾对应的脏腑系统。", fr: "Un élément est déficient. Prenez soin en douceur du système organique associé au quotidien.", es: "Un elemento está deficiente. Cuida con suavidad el sistema orgánico relacionado día a día." } as L<string>,
      missing: { ko: "한 오행이 비어 있습니다. 그 기운(음식·습관)을 의식적으로 채우면 좋습니다.", en: "One element is missing. Consciously fill that energy through food and habits.", ja: "ひとつの五行が空いています。その気を食べ物や習慣で意識的に補うとよいでしょう。", zh: "有一个五行为空。建议通过食物与习惯有意识地补充这种能量。", fr: "Un élément est absent. Comblez consciemment cette énergie par l'alimentation et les habitudes.", es: "Falta un elemento. Llena conscientemente esa energía mediante alimentos y hábitos." } as L<string>,
      balanced: { ko: "오행이 비교적 고릅니다. 지금의 생활 리듬을 꾸준히 유지하세요.", en: "Elements are fairly even. Keep your current rhythm steady.", ja: "五行は比較的そろっています。今の生活リズムを着実に保ちましょう。", zh: "五行较为均衡。请持续保持现在的生活节奏。", fr: "Les éléments sont assez réguliers. Maintenez votre rythme de vie actuel.", es: "Los elementos están bastante equilibrados. Mantén estable tu ritmo de vida actual." } as L<string>,
    },
    organ: {
      liver: { ko: "간·담(눈·근육·스트레스)", en: "Liver/Gallbladder (eyes, tendons, stress)", ja: "肝・胆(目・筋肉・ストレス)", zh: "肝·胆(眼·筋肉·压力)", fr: "Foie/Vésicule (yeux, tendons, stress)", es: "Hígado/Vesícula (ojos, tendones, estrés)" }, heart: { ko: "심장·소장(혈액·수면)", en: "Heart/Small intestine (blood, sleep)", ja: "心臓・小腸(血液・睡眠)", zh: "心·小肠(血液·睡眠)", fr: "Cœur/Intestin grêle (sang, sommeil)", es: "Corazón/Intestino delgado (sangre, sueño)" }, spleen: { ko: "비장·위(소화·식습관)", en: "Spleen/Stomach (digestion, diet)", ja: "脾臓・胃(消化・食習慣)", zh: "脾·胃(消化·饮食)", fr: "Rate/Estomac (digestion, alimentation)", es: "Bazo/Estómago (digestión, dieta)" }, lung: { ko: "폐·대장(호흡·피부)", en: "Lung/Large intestine (breath, skin)", ja: "肺・大腸(呼吸・皮膚)", zh: "肺·大肠(呼吸·皮肤)", fr: "Poumon/Gros intestin (respiration, peau)", es: "Pulmón/Intestino grueso (respiración, piel)" }, kidney: { ko: "신장·방광(체력·생식·뼈)", en: "Kidney/Bladder (stamina, bones)", ja: "腎臓・膀胱(体力・生殖・骨)", zh: "肾·膀胱(体力·生殖·骨)", fr: "Rein/Vessie (énergie, reproduction, os)", es: "Riñón/Vejiga (vitalidad, huesos)" },
    } as Record<string, L<string>>,
    organLabel: { ko: "살펴볼 장부", en: "Watch this system", ja: "見ておきたい臓腑", zh: "需留意的脏腑", fr: "Système à surveiller", es: "Sistema a vigilar" } as L<string>,
  },
  disclaimer: { ko: "전통 명리 이론에 기반한 참고용 해석이며 의학·재무 자문이 아닙니다.", en: "Reference interpretation based on traditional theory; not medical or financial advice.", ja: "伝統的な命理理論に基づく参考解釈であり、医療・財務の助言ではありません。", zh: "基于传统命理理论的参考解读，并非医疗或财务建议。", fr: "Interprétation de référence fondée sur la théorie traditionnelle ; ni avis médical ni financier.", es: "Interpretación de referencia basada en la teoría tradicional; no es consejo médico ni financiero." } as L<string>,
};
