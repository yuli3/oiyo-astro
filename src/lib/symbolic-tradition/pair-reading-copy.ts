/**
 * 두 사람 읽기의 여섯 언어 문장. 판단은 pair-reading 이 키로 내고, 여기는
 * 그 키를 문장으로만 옮긴다.
 *
 * 한국어 조사는 이름 끝 글자로 고른다 — "{a:이/가}" 는 "민지가 / 준호가 /
 * 친구 1이" 처럼 붙는다. 사람 이름은 사용자가 정하므로 문장에 박아 둘 수 없다.
 */

export type PairLang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

// ─── 조사 ───────────────────────────────────────────────────────────────────

const DIGIT_FINAL = new Set(["0", "1", "3", "6", "7", "8"]); // 영·일·삼·육·칠·팔

function hasFinalConsonant(word: string): boolean {
  const ch = word.trim().slice(-1);
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (/[0-9]/.test(ch)) return DIGIT_FINAL.has(ch);
  return /[lmnr]/i.test(ch);
}

/** "이/가" 처럼 받침 있을 때/없을 때 짝을 받아 하나를 고른다 */
export function josa(word: string, pair: string): string {
  const [withFinal, without] = pair.split("/");
  // 대명사는 주격에서 모양이 바뀐다: 나가 → 내가, 너가 → 네가. 기본 별칭이 "나"라 자주 나온다.
  if (without === "가" && (word === "나" || word === "너")) return word === "나" ? "내가" : "네가";
  return word + (hasFinalConsonant(word) ? withFinal : without);
}

/** "{a}" "{a:이/가}" 토큰을 채운다 */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)(?::([^}]+))?\}/g, (_, key: string, pair?: string) => {
    const v = values[key] ?? "";
    return pair ? josa(v, pair) : v;
  });
}

// ─── 이름 (C1) ──────────────────────────────────────────────────────────────

export const PAIR_NAME: Record<PairLang, Record<string, string>> = {
  ko: {
    "combo:GAP-GI": "큰 나무와 기름진 밭", "combo:EUL-GYEONG": "덩굴과 칼", "combo:BYEONG-SIN": "해와 보석",
    "combo:JEONG-IM": "끌려서 묶인 촛불과 강물", "combo:MU-GYE": "산과 이슬비",
    "el:wood-wood": "나란히 자라는 두 나무", "el:wood-fire": "장작과 불꽃", "el:wood-earth": "뿌리와 흙",
    "el:wood-metal": "나무와 도끼", "el:wood-water": "물을 머금은 나무", "el:fire-fire": "한데 붙은 두 불꽃",
    "el:fire-earth": "화덕과 흙", "el:fire-metal": "대장간의 불과 쇠", "el:fire-water": "불과 물",
    "el:earth-earth": "이어진 두 언덕", "el:earth-metal": "광맥을 품은 산", "el:earth-water": "둑과 강",
    "el:metal-metal": "부딪혀 울리는 두 종", "el:metal-water": "바위에서 솟는 샘", "el:water-water": "합쳐 흐르는 두 물줄기",
  },
  en: {
    "combo:GAP-GI": "The tall tree and the rich field", "combo:EUL-GYEONG": "The vine and the blade", "combo:BYEONG-SIN": "The sun and the jewel",
    "combo:JEONG-IM": "Candle and river, drawn together", "combo:MU-GYE": "The mountain and the drizzle",
    "el:wood-wood": "Two trees growing side by side", "el:wood-fire": "Kindling and flame", "el:wood-earth": "Roots and soil",
    "el:wood-metal": "The tree and the axe", "el:wood-water": "A tree drinking from the stream", "el:fire-fire": "Two flames that merge",
    "el:fire-earth": "The hearth and the clay", "el:fire-metal": "Forge fire and iron", "el:fire-water": "Fire and water",
    "el:earth-earth": "Two hills that join", "el:earth-metal": "The mountain holding ore", "el:earth-water": "The bank and the river",
    "el:metal-metal": "Two bells that ring when they meet", "el:metal-water": "A spring rising from rock", "el:water-water": "Two streams that flow as one",
  },
  ja: {
    "combo:GAP-GI": "大樹と肥えた畑", "combo:EUL-GYEONG": "蔓と刃", "combo:BYEONG-SIN": "太陽と宝石",
    "combo:JEONG-IM": "惹かれ合う灯火と大河", "combo:MU-GYE": "山と霧雨",
    "el:wood-wood": "並んで育つ二本の木", "el:wood-fire": "薪と炎", "el:wood-earth": "根と土",
    "el:wood-metal": "木と斧", "el:wood-water": "水を含む木", "el:fire-fire": "一つになる二つの炎",
    "el:fire-earth": "炉と土", "el:fire-metal": "鍛冶場の火と鉄", "el:fire-water": "火と水",
    "el:earth-earth": "連なる二つの丘", "el:earth-metal": "鉱脈を抱く山", "el:earth-water": "堤と川",
    "el:metal-metal": "触れて鳴る二つの鐘", "el:metal-water": "岩から湧く泉", "el:water-water": "合わさって流れる二筋の水",
  },
  zh: {
    "combo:GAP-GI": "大树与沃土", "combo:EUL-GYEONG": "藤蔓与刀锋", "combo:BYEONG-SIN": "太阳与宝石",
    "combo:JEONG-IM": "相互吸引的烛火与江河", "combo:MU-GYE": "高山与细雨",
    "el:wood-wood": "并肩生长的两棵树", "el:wood-fire": "柴薪与火焰", "el:wood-earth": "树根与土壤",
    "el:wood-metal": "树木与斧头", "el:wood-water": "饮水的树", "el:fire-fire": "合在一起的两团火",
    "el:fire-earth": "炉火与陶土", "el:fire-metal": "铁匠铺的火与铁", "el:fire-water": "水火之间",
    "el:earth-earth": "相连的两座山丘", "el:earth-metal": "藏着矿脉的山", "el:earth-water": "堤岸与河流",
    "el:metal-metal": "相碰而鸣的两口钟", "el:metal-water": "岩间涌出的泉", "el:water-water": "汇流的两道水",
  },
  fr: {
    "combo:GAP-GI": "Le grand arbre et le champ fertile", "combo:EUL-GYEONG": "La vigne et la lame", "combo:BYEONG-SIN": "Le soleil et le joyau",
    "combo:JEONG-IM": "La bougie et le fleuve, attirés l’un vers l’autre", "combo:MU-GYE": "La montagne et la bruine",
    "el:wood-wood": "Deux arbres qui poussent côte à côte", "el:wood-fire": "Le bois et la flamme", "el:wood-earth": "Les racines et la terre",
    "el:wood-metal": "L’arbre et la hache", "el:wood-water": "L’arbre qui boit au ruisseau", "el:fire-fire": "Deux flammes qui se rejoignent",
    "el:fire-earth": "Le foyer et l’argile", "el:fire-metal": "Le feu de la forge et le fer", "el:fire-water": "Le feu et l’eau",
    "el:earth-earth": "Deux collines qui se rejoignent", "el:earth-metal": "La montagne qui garde le minerai", "el:earth-water": "La digue et la rivière",
    "el:metal-metal": "Deux cloches qui sonnent en se touchant", "el:metal-water": "La source qui jaillit du rocher", "el:water-water": "Deux ruisseaux qui ne font plus qu’un",
  },
  es: {
    "combo:GAP-GI": "El gran árbol y el campo fértil", "combo:EUL-GYEONG": "La enredadera y la hoja", "combo:BYEONG-SIN": "El sol y la joya",
    "combo:JEONG-IM": "La vela y el río, atraídos", "combo:MU-GYE": "La montaña y la llovizna",
    "el:wood-wood": "Dos árboles que crecen juntos", "el:wood-fire": "La leña y la llama", "el:wood-earth": "Raíces y tierra",
    "el:wood-metal": "El árbol y el hacha", "el:wood-water": "El árbol que bebe del arroyo", "el:fire-fire": "Dos llamas que se juntan",
    "el:fire-earth": "El fogón y el barro", "el:fire-metal": "El fuego de la fragua y el hierro", "el:fire-water": "Fuego y agua",
    "el:earth-earth": "Dos colinas unidas", "el:earth-metal": "La montaña que guarda el mineral", "el:earth-water": "El dique y el río",
    "el:metal-metal": "Dos campanas que suenan al tocarse", "el:metal-water": "El manantial que brota de la roca", "el:water-water": "Dos arroyos que fluyen juntos",
  },
};

// ─── 한 벌의 문장 ───────────────────────────────────────────────────────────

export interface PairCopy {
  pageTitle: string;
  back: string;
  notFound: string;
  pick: string;
  relation: Record<"combining" | "same" | "generating" | "controlling", string>;
  signal: Record<"same-moon" | "same-kin" | "speed-contrast" | "day-branch-harmony" | "day-branch-clash", string>;
  orbitCaption: Record<"combining" | "same" | "generating" | "controlling", string>;
  scenesTitle: string;
  sceneTitle: { talk: string; decide: string; recover: string };
  talk: Record<"contrast" | "both-yang" | "both-yin" | "similar", string>;
  decide: Record<"combining" | "same" | "generating" | "controlling", string>;
  recover: Record<"only" | "gap" | "full", string>;
  elementJob: Record<string, string>;
  lensesTitle: string;
  lensesLead: string;
  help: string;
  care: string;
  ask: string;
  evidenceTitle: string;
  evidenceLead: string;
  ev: {
    dayStem: string;
    pillarBranch: Record<"year" | "month" | "day" | "hour", string>;
    stemRelation: Record<"combining" | "same" | "generating" | "controlling", string>;
    branchRelation: Record<"six-harmony" | "clash" | "punishment" | "harm", string>;
    noBranchRelation: string;
    yinyang: string;
    yinyangValue: string;
    only: string;
    neither: string;
    moon: string;
    moonShared: string;
    moonOr: string;
    sun: string;
    sunAspect: string;
    sunNone: string;
    aspect: Record<"conjunction" | "sextile" | "square" | "trine" | "opposition", string>;
    mayan: string;
    mayanSame: string;
    mayanColor: string;
    mayanOther: string;
    celtic: string;
    celticRelation: Record<"same-tree" | "same-season" | "facing-season" | "distinct", string>;
    hexagram: string;
    hexChanged: string;
    hexNone: string;
    egyptian: string;
    egyptianSame: string;
  };
  calendarTitle: string;
  calendarLead: string;
  calA: string;
  calBoth: string;
  alternating: string;
  both: string;
  mixed: string;
  patternTitle: string;
  patternLead: string;
  limitsTitle: string;
  limitBase: string;
  limitFull: string;
  limitNoHour: string;
  limitMoon: string;
  limitNoAstro: string;
  listJoin: string;
  cta: string;
  ctaPair: string;
}

export const PAIR_COPY_FULL: Record<PairLang, PairCopy> = {
  ko: {
    pageTitle: "두 사람 보기",
    back: "우리의 지도로 돌아가기",
    notFound: "이 브라우저의 원에서 두 사람을 찾지 못했어요. 우리의 지도에서 두 사람을 골라 주세요.",
    pick: "누구와 누구를 볼까요?",
    relation: {
      combining: "오행으로는 맞서는 짝인데, 음과 양이 서로를 찾아 하나로 묶여요(천간합).",
      same: "같은 기운을 타고나서 설명이 짧아도 통해요.",
      generating: "한쪽의 기운이 다른 쪽을 키우는 사이예요.",
      controlling: "서로의 넘치는 부분을 눌러 주는 사이예요.",
    },
    signal: {
      "same-kin": "마야 달력으로는 같은 색에 같은 음조, 박자가 똑같아요.",
      "same-moon": "속마음을 뜻하는 달은 같은 궁에 있어요.",
      "day-branch-harmony": "일지가 육합이라 생활의 결이 잘 붙어요.",
      "day-branch-clash": "일지가 충이라 생활 리듬이 자주 엇갈려요.",
      "speed-contrast": "다만 한 사람은 빠르고 한 사람은 느려요. 속도가 정반대예요.",
    },
    orbitCaption: {
      combining: "끈으로 이어진 채 서로를 도는 쌍성",
      same: "나란히 달리는 두 별",
      generating: "{giver}에게서 {receiver}에게 빛이 흘러요",
      controlling: "가까워질 때마다 튕겨 나가는 두 별",
    },
    scenesTitle: "차이가 드러나는 세 장면",
    sceneTitle: { talk: "대화할 때 · 음양", decide: "정할 때 · 일간", recover: "회복할 때 · 오행" },
    talk: {
      contrast: "{fast:이/가} \"일단 해 보자\"고 할 때, {slow}에게는 \"준비도 없이?\"로 들려요. {slow}의 침묵은 반대가 아니라 아직 생각 중이라는 뜻이에요.",
      "both-yang": "둘 다 먼저 말을 꺼내는 편이라 대화가 빨라요. 끝까지 듣는 순서를 정해 두면 덜 부딪혀요.",
      "both-yin": "둘 다 먼저 꺼내기보다 기다리는 편이에요. 중요한 이야기는 날을 정해 두지 않으면 계속 미뤄져요.",
      similar: "말의 속도가 비슷해서 대화 리듬이 잘 맞아요. 다만 비슷한 만큼 같은 주제를 함께 피하기도 해요.",
    },
    decide: {
      combining: "누가 이기느냐보다 \"둘이 같이 정한 것\"으로 만들 때 오래가요. 묶이는 짝이라 한쪽이 혼자 정하면 다른 쪽이 서운해해요.",
      same: "판단 기준이 닮아 결정이 빨라요. 같은 기준이라 같은 실수도 함께 하니, 가끔은 바깥 의견을 들어 보세요.",
      generating: "{giver:이/가} 방향을 잡아 주면 {receiver:이/가} 힘을 얻어요. 주는 쪽만 계속 주면 비워지니, {receiver:이/가} 고맙다는 말로 돌려주세요.",
      controlling: "{checker:이/가} {checked}의 넘치는 계획을 잡아 줘요. 잡아 주는 말이 잦아지면 {checked:이/가} 움츠러드니, 먼저 좋은 점을 짚고 말해 주세요.",
    },
    recover: {
      only: "{element} 기운은 {holder}에게만 있어요. {job} 일은 {holder:이/가} 맡을 때 둘 다 편해져요.",
      gap: "둘 다 {element} 기운이 없어요. {job} 일은 둘 다 서툴러서, 그런 때는 다른 사람의 도움을 받는 게 좋아요.",
      full: "다섯 기운을 둘이서 다 갖췄어요. 힘들 때 서로에게 없는 것을 빌려 올 수 있는 짝이에요.",
    },
    elementJob: { wood: "새로 시작하는", fire: "분위기를 띄우는", earth: "붙잡아 버티는", metal: "정리하고 끊어 내는", water: "가만히 돌아보는" },
    lensesTitle: "아홉 관점으로 본 두 사람",
    lensesLead: "관점마다 다른 질문을 해요. 하나의 점수로 합치지 않고 전부 보여 드려요.",
    help: "서로 돕는 점",
    care: "조심할 점",
    ask: "오늘 물어볼 것",
    evidenceTitle: "무엇을 계산했나",
    evidenceLead: "해석 없이 사실만 적었어요. 해석이 이상하다 싶을 때 여기서 확인할 수 있어요.",
    ev: {
      dayStem: "일간",
      pillarBranch: { year: "연지", month: "월지", day: "일지", hour: "시지" },
      stemRelation: { combining: "천간합", same: "같은 기운", generating: "상생", controlling: "상극" },
      branchRelation: { "six-harmony": "육합", clash: "충", punishment: "형", harm: "해" },
      noBranchRelation: "특별한 관계 없음",
      yinyang: "음양",
      yinyangValue: "양 {yang} · 음 {yin}",
      only: "{name}에게만 있는 기운",
      neither: "둘 다 없는 기운",
      moon: "달",
      moonShared: "둘 다 {sign}",
      moonOr: " 또는 ",
      sun: "태양",
      sunAspect: "{deg}° 떨어져 {aspect}",
      sunNone: "{deg}° 떨어져 각 없음",
      aspect: { conjunction: "합", sextile: "육각", square: "사각", trine: "삼각", opposition: "대립" },
      mayan: "마야",
      mayanSame: "같은 색 계열 · 같은 음조 {tone}",
      mayanColor: "같은 색 계열 · 음조 {a} · {b}",
      mayanOther: "다른 색 계열 · 음조 {a} · {b}",
      celtic: "켈트",
      celticRelation: {"same-tree": "같은 나무", "same-season": "같은 계절의 나무", "facing-season": "마주 보는 계절", distinct: "다른 계절"},
      hexagram: "출생 괘",
      hexChanged: "변괘",
      hexNone: "시각이 없어 세우지 않음",
      egyptian: "이집트 12신 (현대 달력)",
      egyptianSame: "같은 신",
    },
    calendarTitle: "둘의 달력",
    calendarLead: "오늘부터 4주. 칸 색은 그날 누가 기운을 받는지예요.",
    calA: "{name} 받는 날",
    calBoth: "둘 다 받는 날",
    alternating: "둘이 동시에 받는 날이 한 번도 없어요. 한 사람이 힘을 받을 때 다른 사람은 쉬는 리듬이라, 번갈아 앞에 서면 좋아요.",
    both: "둘 다 받는 날이 {n}일 있어요. 미뤄 둔 약속이나 큰 이야기는 그날로 잡아 보세요.",
    mixed: "받는 날이 서로 다르게 흩어져 있어요. 각자 받는 날에 맞춰 일을 나눠 보세요.",
    patternTitle: "둘의 무늬",
    patternLead: "두 사람의 좌표를 궤도로 옮겨 꼬리를 남겼어요. 이 두 사람에게서만 나오는 무늬예요.",
    limitsTitle: "이 읽기의 한계",
    limitBase: "이 읽기는 전통 상징을 대화 소재로 옮긴 것이고, 관계의 성패를 재는 측정이 아니에요.",
    limitFull: "두 사람 모두 시각과 도시가 있어 여덟 글자와 달·상승궁까지 봤어요.",
    limitNoHour: "{names}의 태어난 시각이 없어 시주와 상승궁은 빼고 읽었어요.",
    limitMoon: "{names}의 달은 그날 궁이 바뀌어 후보가 둘이에요.",
    limitNoAstro: "{names}의 별자리 좌표가 없어요(예전에 넣은 사람). 다시 넣으면 달·태양 줄이 생겨요.",
    listJoin: " · ",
    cta: "두 사람 자세히 보기",
    ctaPair: "{a} · {b} 자세히 보기",
  },
  en: {
    pageTitle: "The two of you",
    back: "Back to Our map",
    notFound: "We couldn’t find these two in this browser’s circle. Pick two people from Our map.",
    pick: "Which two would you like to read?",
    relation: {
      combining: "By the five elements they check each other, yet yin and yang seek each other and bind into one (a stem combination).",
      same: "Born with the same energy, so short explanations land.",
      generating: "One side’s energy feeds the other.",
      controlling: "Each checks the other where it runs over.",
    },
    signal: {
      "same-kin": "On the Mayan calendar they share a colour and a tone — the same beat.",
      "same-moon": "The moon, the heart at ease, sits in the same sign.",
      "day-branch-harmony": "Their day branches form a six-harmony, so everyday life fits easily.",
      "day-branch-clash": "Their day branches clash, so daily rhythms often cross.",
      "speed-contrast": "But one is fast and the other slow — opposite speeds.",
    },
    orbitCaption: {
      combining: "A binary star, tethered as it circles",
      same: "Two stars running side by side",
      generating: "Light flows from {giver} to {receiver}",
      controlling: "Two stars that bounce apart whenever they near",
    },
    scenesTitle: "Three scenes where the difference shows",
    sceneTitle: { talk: "Talking · yin–yang", decide: "Deciding · day master", recover: "Recovering · five elements" },
    talk: {
      contrast: "When {fast} says “let’s just try it,” {slow} hears “with no preparation?” {slow}’s silence isn’t a no — it means still thinking.",
      "both-yang": "You both speak up first, so talk moves fast. Agreeing to hear each other out prevents collisions.",
      "both-yin": "You both wait rather than raise things. Important talks keep slipping unless you set a day.",
      similar: "Your speaking pace is alike, so conversations flow. Being alike, you also avoid the same topics together.",
    },
    decide: {
      combining: "It lasts when it’s “what we decided together,” not who won. You are a binding pair, so deciding alone hurts the other.",
      same: "Your yardsticks are alike, so decisions come fast. You also make the same mistakes — ask an outside view now and then.",
      generating: "When {giver} sets the direction, {receiver} gains strength. If only one gives, that side empties — {receiver}, say thanks out loud.",
      controlling: "{checker} reins in {checked}’s overflowing plans. Too many reins make {checked} shrink — name the good part first.",
    },
    recover: {
      only: "Only {holder} has {element}. Things that call for {job} go easier for both when {holder} takes them.",
      gap: "Neither of you has {element}. You both find {job} hard, so lean on someone else at those times.",
      full: "Between you, all five energies are present. When it’s hard, you can borrow what the other lacks.",
    },
    elementJob: { wood: "starting fresh", fire: "lifting the mood", earth: "holding steady", metal: "sorting and cutting loose", water: "quiet reflection" },
    lensesTitle: "The two of you through nine lenses",
    lensesLead: "Each lens asks a different question. Nothing is merged into one score — here is all of it.",
    help: "How you help each other",
    care: "What to watch",
    ask: "A question for today",
    evidenceTitle: "What was calculated",
    evidenceLead: "Facts only, no interpretation. Check here when a reading seems off.",
    ev: {
      dayStem: "Day stem",
      pillarBranch: { year: "Year branch", month: "Month branch", day: "Day branch", hour: "Hour branch" },
      stemRelation: { combining: "stem combination", same: "same energy", generating: "generating", controlling: "controlling" },
      branchRelation: { "six-harmony": "six-harmony", clash: "clash", punishment: "punishment", harm: "harm" },
      noBranchRelation: "no special relation",
      yinyang: "Yin–yang",
      yinyangValue: "yang {yang} · yin {yin}",
      only: "Only {name} has",
      neither: "Neither has",
      moon: "Moon",
      moonShared: "both {sign}",
      moonOr: " or ",
      sun: "Sun",
      sunAspect: "{deg}° apart · {aspect}",
      sunNone: "{deg}° apart · no aspect",
      aspect: { conjunction: "conjunction", sextile: "sextile", square: "square", trine: "trine", opposition: "opposition" },
      mayan: "Mayan",
      mayanSame: "same colour family · same tone {tone}",
      mayanColor: "same colour family · tones {a} · {b}",
      mayanOther: "different colour families · tones {a} · {b}",
      celtic: "Celtic",
      celticRelation: {"same-tree": "same tree", "same-season": "trees of the same season", "facing-season": "facing seasons", distinct: "different seasons"},
      hexagram: "Birth hexagram",
      hexChanged: "changing to",
      hexNone: "not cast (no birth time)",
      egyptian: "Egyptian 12 deities (modern calendar)",
      egyptianSame: "the same deity",
    },
    calendarTitle: "Your calendar together",
    calendarLead: "The next four weeks. Colour shows who receives energy that day.",
    calA: "{name} receives",
    calBoth: "Both receive",
    alternating: "You never receive on the same day. When one is lifted the other rests — take turns leading.",
    both: "You both receive on {n} days. Put postponed plans or big talks on those days.",
    mixed: "Your receiving days are scattered differently. Split tasks to match each one’s days.",
    patternTitle: "Your pattern",
    patternLead: "Each person’s coordinates became an orbit that leaves a trail. Only these two make this pattern.",
    limitsTitle: "Limits of this reading",
    limitBase: "This turns traditional symbols into material for conversation. It does not measure whether a relationship will succeed.",
    limitFull: "Both entered a birth time and city, so all eight characters plus moon and rising were read.",
    limitNoHour: "No birth time for {names}, so the hour pillar and rising sign were left out.",
    limitMoon: "The moon changed sign that day for {names}, so there are two candidates.",
    limitNoAstro: "{names} has no zodiac coordinates (added earlier). Add them again for moon and sun lines.",
    listJoin: " · ",
    cta: "Read the two of you",
    ctaPair: "Read {a} · {b}",
  },
  ja: {
    pageTitle: "ふたりを見る",
    back: "私たちの地図に戻る",
    notFound: "このブラウザの円にふたりが見つかりません。私たちの地図からふたりを選んでください。",
    pick: "誰と誰を見ますか？",
    relation: {
      combining: "五行では抑え合う組み合わせですが、陰と陽が互いを求めて一つに結びます（干合）。",
      same: "同じ気を生まれ持ち、短い説明でも通じます。",
      generating: "一方の気がもう一方を育てる間柄です。",
      controlling: "互いのあふれる部分を抑え合う間柄です。",
    },
    signal: {
      "same-kin": "マヤ暦では同じ色・同じ音、拍子がそっくりです。",
      "same-moon": "本音を表す月は同じ星座にあります。",
      "day-branch-harmony": "日支が六合で、暮らしの質がよくなじみます。",
      "day-branch-clash": "日支が冲で、生活のリズムがよくすれ違います。",
      "speed-contrast": "ただし一人は速く一人はゆっくり。速さが正反対です。",
    },
    orbitCaption: {
      combining: "糸でつながったまま互いを回る連星",
      same: "並んで走る二つの星",
      generating: "{giver}から{receiver}へ光が流れます",
      controlling: "近づくたびにはじかれる二つの星",
    },
    scenesTitle: "違いが表れる三つの場面",
    sceneTitle: { talk: "話すとき · 陰陽", decide: "決めるとき · 日干", recover: "回復するとき · 五行" },
    talk: {
      contrast: "{fast}が「とりあえずやってみよう」と言うと、{slow}には「準備もなしに？」と聞こえます。{slow}の沈黙は反対ではなく、まだ考えているという意味です。",
      "both-yang": "ふたりとも先に話を切り出すので会話が速いです。最後まで聞く順番を決めておくとぶつかりにくくなります。",
      "both-yin": "ふたりとも切り出すより待つほうです。大事な話は日を決めないと先送りになります。",
      similar: "話す速さが似ていて会話のリズムが合います。似ているぶん、同じ話題を一緒に避けることもあります。",
    },
    decide: {
      combining: "どちらが勝つかより「ふたりで決めたこと」にすると長続きします。結びつく組み合わせなので、一方が一人で決めるともう一方が寂しがります。",
      same: "判断の基準が似ていて決断が速いです。同じ基準ゆえ同じ失敗もするので、ときどき外の意見を聞いてみてください。",
      generating: "{giver}が方向を示すと{receiver}が力を得ます。与える側ばかりだと空になるので、{receiver}は感謝を言葉で返してください。",
      controlling: "{checker}が{checked}のあふれる計画を引き締めます。引き締めが続くと{checked}が縮こまるので、まず良い点を伝えてから話してください。",
    },
    recover: {
      only: "{element}の気は{holder}だけにあります。{job}ことは{holder}が担うとふたりとも楽になります。",
      gap: "ふたりとも{element}の気がありません。{job}ことはどちらも苦手なので、そんなときは他の人の助けを借りましょう。",
      full: "五つの気をふたりでそろえています。つらいときは相手にないものを借りられる組み合わせです。",
    },
    elementJob: { wood: "新しく始める", fire: "場を盛り上げる", earth: "踏ん張って支える", metal: "整理して断ち切る", water: "静かに振り返る" },
    lensesTitle: "九つの視点で見たふたり",
    lensesLead: "視点ごとに違う問いを立てます。一つの点数にまとめず、すべてお見せします。",
    help: "助け合える点",
    care: "気をつける点",
    ask: "今日聞いてみること",
    evidenceTitle: "何を計算したか",
    evidenceLead: "解釈なしで事実だけを書きました。解釈がおかしいと感じたらここで確かめられます。",
    ev: {
      dayStem: "日干",
      pillarBranch: { year: "年支", month: "月支", day: "日支", hour: "時支" },
      stemRelation: { combining: "干合", same: "同じ気", generating: "相生", controlling: "相剋" },
      branchRelation: { "six-harmony": "六合", clash: "冲", punishment: "刑", harm: "害" },
      noBranchRelation: "特別な関係なし",
      yinyang: "陰陽",
      yinyangValue: "陽 {yang} · 陰 {yin}",
      only: "{name}だけにある気",
      neither: "ふたりともない気",
      moon: "月",
      moonShared: "ふたりとも{sign}",
      moonOr: "または",
      sun: "太陽",
      sunAspect: "{deg}°離れて{aspect}",
      sunNone: "{deg}°離れてアスペクトなし",
      aspect: { conjunction: "コンジャンクション", sextile: "セクスタイル", square: "スクエア", trine: "トライン", opposition: "オポジション" },
      mayan: "マヤ",
      mayanSame: "同じ色の系統 · 同じ音 {tone}",
      mayanColor: "同じ色の系統 · 音 {a} · {b}",
      mayanOther: "違う色の系統 · 音 {a} · {b}",
      celtic: "ケルト",
      celticRelation: {"same-tree": "同じ木", "same-season": "同じ季節の木", "facing-season": "向かい合う季節", distinct: "違う季節"},
      hexagram: "生まれの卦",
      hexChanged: "之卦",
      hexNone: "時刻がないため立てない",
      egyptian: "エジプト12神（現代の暦）",
      egyptianSame: "同じ神",
    },
    calendarTitle: "ふたりの暦",
    calendarLead: "今日から4週間。色はその日に誰が気を受けるかです。",
    calA: "{name}が受ける日",
    calBoth: "ふたりとも受ける日",
    alternating: "ふたりが同時に受ける日は一度もありません。一人が力を受けるとき、もう一人は休むリズムなので、交代で前に立つとよいです。",
    both: "ふたりとも受ける日が{n}日あります。先送りにしていた約束や大事な話はその日に。",
    mixed: "受ける日がそれぞれ別々に散らばっています。各自の受ける日に合わせて役割を分けましょう。",
    patternTitle: "ふたりの模様",
    patternLead: "ふたりの座標を軌道に移して軌跡を残しました。このふたりにしか出ない模様です。",
    limitsTitle: "この読みの限界",
    limitBase: "この読みは伝統的な象徴を会話の材料にしたもので、関係の成否を測るものではありません。",
    limitFull: "ふたりとも時刻と都市があり、八字と月・アセンダントまで見ました。",
    limitNoHour: "{names}の出生時刻がないため、時柱とアセンダントは除いて読みました。",
    limitMoon: "{names}の月はその日に星座が変わるため候補が二つあります。",
    limitNoAstro: "{names}には星座の座標がありません（以前に入れた人）。入れ直すと月・太陽の行が出ます。",
    listJoin: "・",
    cta: "ふたりを詳しく見る",
    ctaPair: "{a}・{b}を詳しく見る",
  },
  zh: {
    pageTitle: "两个人",
    back: "返回我们的地图",
    notFound: "在此浏览器的关系圈里找不到这两个人。请从我们的地图中选两个人。",
    pick: "要看谁和谁？",
    relation: {
      combining: "按五行本是相克的一对，但阴与阳彼此寻找、合而为一（天干合）。",
      same: "生来同一种气，说得少也能懂。",
      generating: "一方的气滋养另一方。",
      controlling: "彼此压住对方过盛的部分。",
    },
    signal: {
      "same-kin": "在玛雅历里是同一色系、同一调性，节拍一模一样。",
      "same-moon": "代表内心的月亮落在同一星座。",
      "day-branch-harmony": "日支六合，生活的质地很契合。",
      "day-branch-clash": "日支相冲，生活节奏常常错开。",
      "speed-contrast": "不过一个快一个慢，速度正好相反。",
    },
    orbitCaption: {
      combining: "被一根线牵着、彼此环绕的双星",
      same: "并肩奔跑的两颗星",
      generating: "光从{giver}流向{receiver}",
      controlling: "一靠近就弹开的两颗星",
    },
    scenesTitle: "差异显现的三个场景",
    sceneTitle: { talk: "交谈时 · 阴阳", decide: "做决定时 · 日干", recover: "恢复时 · 五行" },
    talk: {
      contrast: "{fast}说“先试试看”时，{slow}听到的是“一点准备都没有？”。{slow}的沉默不是反对，而是还在想。",
      "both-yang": "两人都爱先开口，对话节奏很快。约好先听完对方再说，就少些碰撞。",
      "both-yin": "两人都更愿意等而不是先提。重要的话不定个日子就会一拖再拖。",
      similar: "说话速度相近，对话节奏合拍。也正因相似，会一起回避同样的话题。",
    },
    decide: {
      combining: "比起谁赢，做成“我们一起决定的”才会长久。你们是相合的一对，一方独自决定会让另一方失落。",
      same: "判断标准相似，决定很快。标准相同也会犯同样的错，偶尔听听外人的意见。",
      generating: "{giver}定下方向时，{receiver}就有了力量。只有一方付出会被掏空，{receiver}要把感谢说出口。",
      controlling: "{checker}会收住{checked}过满的计划。收得太频繁，{checked}会退缩，先说好的地方再提意见。",
    },
    recover: {
      only: "{element}气只有{holder}有。需要{job}的事交给{holder}，两人都会轻松。",
      gap: "两人都没有{element}气。{job}的事都不擅长，那时不妨请别人帮忙。",
      full: "两人合起来五种气都齐了。难的时候可以向对方借自己没有的东西。",
    },
    elementJob: { wood: "重新开始", fire: "活跃气氛", earth: "稳住坚持", metal: "整理割舍", water: "静静回顾" },
    lensesTitle: "九种视角下的两个人",
    lensesLead: "每个视角问的是不同的问题。我们不合成一个分数，全部展示出来。",
    help: "彼此帮助之处",
    care: "需要留意之处",
    ask: "今天可以问的问题",
    evidenceTitle: "计算了什么",
    evidenceLead: "只写事实，不做解读。觉得解读奇怪时可以在这里核对。",
    ev: {
      dayStem: "日干",
      pillarBranch: { year: "年支", month: "月支", day: "日支", hour: "时支" },
      stemRelation: { combining: "天干合", same: "同气", generating: "相生", controlling: "相克" },
      branchRelation: { "six-harmony": "六合", clash: "冲", punishment: "刑", harm: "害" },
      noBranchRelation: "无特别关系",
      yinyang: "阴阳",
      yinyangValue: "阳 {yang} · 阴 {yin}",
      only: "只有{name}有的气",
      neither: "两人都没有的气",
      moon: "月亮",
      moonShared: "都是{sign}",
      moonOr: "或",
      sun: "太阳",
      sunAspect: "相距{deg}° · {aspect}",
      sunNone: "相距{deg}° · 无相位",
      aspect: { conjunction: "合相", sextile: "六分相", square: "四分相", trine: "三分相", opposition: "对分相" },
      mayan: "玛雅",
      mayanSame: "同一色系 · 同一调性 {tone}",
      mayanColor: "同一色系 · 调性 {a} · {b}",
      mayanOther: "不同色系 · 调性 {a} · {b}",
      celtic: "凯尔特",
      celticRelation: {"same-tree": "同一棵树", "same-season": "同一季节的树", "facing-season": "相对的季节", distinct: "不同季节"},
      hexagram: "出生卦",
      hexChanged: "变卦",
      hexNone: "没有时间，不起卦",
      egyptian: "埃及十二神（现代历）",
      egyptianSame: "同一位神",
    },
    calendarTitle: "两个人的日历",
    calendarLead: "从今天起四周。颜色表示当天谁得到助力。",
    calA: "{name}得助的日子",
    calBoth: "两人都得助",
    alternating: "两人从没有同一天得到助力。一人得力时另一人休息，轮流站到前面会很好。",
    both: "两人都得助的日子有{n}天。拖着的约定或重要的话就放在那几天。",
    mixed: "得助的日子各自分散。按各自的日子分工吧。",
    patternTitle: "两个人的纹样",
    patternLead: "把两人的坐标化成轨道并留下轨迹。只有这两个人才会画出这个纹样。",
    limitsTitle: "这份解读的局限",
    limitBase: "这份解读把传统象征当作对话素材，并不衡量关系的成败。",
    limitFull: "两人都有出生时间和城市，八个字和月亮、上升星座都看了。",
    limitNoHour: "{names}没有出生时间，所以略去了时柱和上升星座。",
    limitMoon: "{names}的月亮在那天换了星座，因此有两个候选。",
    limitNoAstro: "{names}没有星座坐标（之前加入的人）。重新加入就会出现月亮和太阳的行。",
    listJoin: "、",
    cta: "详细看这两个人",
    ctaPair: "详细看{a}・{b}",
  },
  fr: {
    pageTitle: "Vous deux",
    back: "Retour à Notre carte",
    notFound: "Ces deux personnes ne sont pas dans le cercle de ce navigateur. Choisissez-en deux dans Notre carte.",
    pick: "Quelles deux personnes lire ?",
    relation: {
      combining: "Selon les cinq éléments, ils se contrarient ; pourtant le yin et le yang se cherchent et s’unissent (union des troncs).",
      same: "Nés avec la même énergie : peu d’explications suffisent.",
      generating: "L’énergie de l’un nourrit l’autre.",
      controlling: "Chacun retient l’autre là où il déborde.",
    },
    signal: {
      "same-kin": "Dans le calendrier maya, même couleur et même ton : le même rythme.",
      "same-moon": "La lune, le cœur au repos, est dans le même signe.",
      "day-branch-harmony": "Leurs branches du jour forment une harmonie : le quotidien s’accorde bien.",
      "day-branch-clash": "Leurs branches du jour se heurtent : les rythmes quotidiens se croisent souvent.",
      "speed-contrast": "Mais l’un est rapide et l’autre lent — des vitesses opposées.",
    },
    orbitCaption: {
      combining: "Une étoile double, reliée par un fil",
      same: "Deux étoiles qui courent côte à côte",
      generating: "La lumière va de {giver} à {receiver}",
      controlling: "Deux étoiles qui rebondissent dès qu’elles s’approchent",
    },
    scenesTitle: "Trois scènes où la différence se voit",
    sceneTitle: { talk: "En parlant · yin-yang", decide: "En décidant · maître du jour", recover: "En récupérant · cinq éléments" },
    talk: {
      contrast: "Quand {fast} dit « essayons toujours », {slow} entend « sans rien préparer ? ». Le silence de {slow} n’est pas un refus : il réfléchit encore.",
      "both-yang": "Vous prenez tous deux la parole en premier : ça va vite. Convenir de s’écouter jusqu’au bout évite les heurts.",
      "both-yin": "Vous attendez tous deux plutôt que de lancer le sujet. Les discussions importantes glissent si vous ne fixez pas de jour.",
      similar: "Votre rythme de parole se ressemble : la conversation coule. Mais vous évitez aussi les mêmes sujets ensemble.",
    },
    decide: {
      combining: "Ça tient quand c’est « ce que nous avons décidé ensemble », pas qui a gagné. Vous êtes un duo uni : décider seul blesse l’autre.",
      same: "Vos critères se ressemblent : vous décidez vite. Vous faites aussi les mêmes erreurs — demandez parfois un avis extérieur.",
      generating: "Quand {giver} donne la direction, {receiver} prend de la force. Si un seul donne, il s’épuise : {receiver}, dites merci à voix haute.",
      controlling: "{checker} tempère les plans débordants de {checked}. Trop de freins font se replier {checked} : commencez par ce qui est bien.",
    },
    recover: {
      only: "Seul·e {holder} a l’élément {element}. Ce qui demande de {job} se passe mieux quand {holder} s’en charge.",
      gap: "Aucun de vous n’a l’élément {element}. Pour vous deux, {job} est difficile : appuyez-vous alors sur quelqu’un d’autre.",
      full: "À vous deux, les cinq énergies sont présentes. Quand c’est dur, chacun peut emprunter ce qui manque à l’autre.",
    },
    elementJob: { wood: "repartir de zéro", fire: "réchauffer l’ambiance", earth: "tenir bon", metal: "trier et trancher", water: "prendre du recul" },
    lensesTitle: "Vous deux à travers neuf perspectives",
    lensesLead: "Chaque perspective pose une autre question. Rien n’est fondu en un score : voici tout.",
    help: "Ce qui vous aide",
    care: "À surveiller",
    ask: "Une question pour aujourd’hui",
    evidenceTitle: "Ce qui a été calculé",
    evidenceLead: "Des faits, sans interprétation. Vérifiez ici si une lecture vous semble étrange.",
    ev: {
      dayStem: "Tronc du jour",
      pillarBranch: { year: "Branche de l’année", month: "Branche du mois", day: "Branche du jour", hour: "Branche de l’heure" },
      stemRelation: { combining: "union des troncs", same: "même énergie", generating: "génération", controlling: "contrôle" },
      branchRelation: { "six-harmony": "harmonie", clash: "heurt", punishment: "punition", harm: "nuisance" },
      noBranchRelation: "pas de relation particulière",
      yinyang: "Yin-yang",
      yinyangValue: "yang {yang} · yin {yin}",
      only: "Seul·e {name} a",
      neither: "Aucun des deux n’a",
      moon: "Lune",
      moonShared: "tous deux {sign}",
      moonOr: " ou ",
      sun: "Soleil",
      sunAspect: "{deg}° d’écart · {aspect}",
      sunNone: "{deg}° d’écart · pas d’aspect",
      aspect: { conjunction: "conjonction", sextile: "sextile", square: "carré", trine: "trigone", opposition: "opposition" },
      mayan: "Maya",
      mayanSame: "même famille de couleur · même ton {tone}",
      mayanColor: "même famille de couleur · tons {a} · {b}",
      mayanOther: "familles de couleur différentes · tons {a} · {b}",
      celtic: "Celte",
      celticRelation: {"same-tree": "même arbre", "same-season": "arbres de la même saison", "facing-season": "saisons opposées", distinct: "saisons différentes"},
      hexagram: "Hexagramme de naissance",
      hexChanged: "devient",
      hexNone: "non tiré (pas d’heure de naissance)",
      egyptian: "12 divinités égyptiennes (calendrier moderne)",
      egyptianSame: "la même divinité",
    },
    calendarTitle: "Votre calendrier à deux",
    calendarLead: "Les quatre prochaines semaines. La couleur montre qui reçoit l’énergie ce jour-là.",
    calA: "{name} reçoit",
    calBoth: "Les deux reçoivent",
    alternating: "Vous ne recevez jamais le même jour. Quand l’un est porté, l’autre se repose : passez-vous le relais.",
    both: "Vous recevez tous deux {n} jours. Placez-y les projets repoussés ou les grandes discussions.",
    mixed: "Vos jours de réception sont dispersés différemment. Répartissez les tâches selon les jours de chacun.",
    patternTitle: "Votre motif",
    patternLead: "Les coordonnées de chacun deviennent une orbite qui laisse une trace. Seuls ces deux-là font ce motif.",
    limitsTitle: "Limites de cette lecture",
    limitBase: "Cette lecture fait des symboles traditionnels une matière à conversation. Elle ne mesure pas la réussite d’une relation.",
    limitFull: "Tous deux ont une heure et une ville de naissance : les huit caractères, la lune et l’ascendant ont été lus.",
    limitNoHour: "Pas d’heure de naissance pour {names} : le pilier de l’heure et l’ascendant ont été omis.",
    limitMoon: "La lune a changé de signe ce jour-là pour {names} : il y a deux candidats.",
    limitNoAstro: "{names} n’a pas de coordonnées zodiacales (ajout ancien). Ajoutez de nouveau pour les lignes lune et soleil.",
    listJoin: " · ",
    cta: "Lire vous deux",
    ctaPair: "Lire {a} · {b}",
  },
  es: {
    pageTitle: "Vosotros dos",
    back: "Volver a Nuestro mapa",
    notFound: "No encontramos a estas dos personas en el círculo de este navegador. Elige dos en Nuestro mapa.",
    pick: "¿A quiénes quieres leer?",
    relation: {
      combining: "Por los cinco elementos se frenan, pero el yin y el yang se buscan y se unen en uno (combinación de troncos).",
      same: "Nacidos con la misma energía: bastan pocas explicaciones.",
      generating: "La energía de uno alimenta al otro.",
      controlling: "Cada uno frena al otro donde se desborda.",
    },
    signal: {
      "same-kin": "En el calendario maya comparten color y tono: el mismo compás.",
      "same-moon": "La luna, el corazón en calma, está en el mismo signo.",
      "day-branch-harmony": "Sus ramas del día forman una armonía: el día a día encaja bien.",
      "day-branch-clash": "Sus ramas del día chocan: los ritmos diarios se cruzan a menudo.",
      "speed-contrast": "Pero uno es rápido y el otro lento: velocidades opuestas.",
    },
    orbitCaption: {
      combining: "Una estrella doble, atada mientras gira",
      same: "Dos estrellas que corren juntas",
      generating: "La luz fluye de {giver} a {receiver}",
      controlling: "Dos estrellas que rebotan cada vez que se acercan",
    },
    scenesTitle: "Tres escenas donde se nota la diferencia",
    sceneTitle: { talk: "Al hablar · yin-yang", decide: "Al decidir · tronco del día", recover: "Al recuperarse · cinco elementos" },
    talk: {
      contrast: "Cuando {fast} dice «probemos ya», {slow} oye «¿sin preparar nada?». El silencio de {slow} no es un no: sigue pensando.",
      "both-yang": "Los dos habláis primero, así que la charla va rápido. Acordar escucharse hasta el final evita choques.",
      "both-yin": "Los dos esperáis en vez de sacar el tema. Las charlas importantes se aplazan si no fijáis un día.",
      similar: "Vuestro ritmo al hablar se parece: la conversación fluye. Por lo mismo, también evitáis los mismos temas.",
    },
    decide: {
      combining: "Dura cuando es «lo que decidimos juntos», no quién ganó. Sois una pareja que se une: decidir solo duele al otro.",
      same: "Vuestros criterios se parecen: decidís rápido. También cometéis los mismos errores; pedid a veces una opinión externa.",
      generating: "Cuando {giver} marca el rumbo, {receiver} gana fuerza. Si solo uno da, se vacía: {receiver}, di gracias en voz alta.",
      controlling: "{checker} frena los planes desbordados de {checked}. Demasiados frenos hacen que {checked} se encoja: empieza por lo bueno.",
    },
    recover: {
      only: "Solo {holder} tiene {element}. Lo que pide {job} va mejor cuando lo asume {holder}.",
      gap: "Ninguno tiene {element}. A los dos os cuesta {job}: en esos momentos apoyaos en otra persona.",
      full: "Entre los dos están las cinco energías. Cuando cuesta, podéis tomar prestado lo que le falta al otro.",
    },
    elementJob: { wood: "empezar de nuevo", fire: "animar el ambiente", earth: "aguantar firme", metal: "ordenar y cortar", water: "reflexionar en calma" },
    lensesTitle: "Vosotros dos a través de nueve perspectivas",
    lensesLead: "Cada perspectiva hace otra pregunta. Nada se funde en una puntuación: aquí está todo.",
    help: "En qué os ayudáis",
    care: "Qué vigilar",
    ask: "Una pregunta para hoy",
    evidenceTitle: "Qué se calculó",
    evidenceLead: "Solo hechos, sin interpretación. Compruébalo aquí si una lectura te parece rara.",
    ev: {
      dayStem: "Tronco del día",
      pillarBranch: { year: "Rama del año", month: "Rama del mes", day: "Rama del día", hour: "Rama de la hora" },
      stemRelation: { combining: "combinación de troncos", same: "misma energía", generating: "generación", controlling: "control" },
      branchRelation: { "six-harmony": "armonía", clash: "choque", punishment: "castigo", harm: "daño" },
      noBranchRelation: "sin relación especial",
      yinyang: "Yin-yang",
      yinyangValue: "yang {yang} · yin {yin}",
      only: "Solo {name} tiene",
      neither: "Ninguno tiene",
      moon: "Luna",
      moonShared: "ambos {sign}",
      moonOr: " o ",
      sun: "Sol",
      sunAspect: "{deg}° de separación · {aspect}",
      sunNone: "{deg}° de separación · sin aspecto",
      aspect: { conjunction: "conjunción", sextile: "sextil", square: "cuadratura", trine: "trígono", opposition: "oposición" },
      mayan: "Maya",
      mayanSame: "misma familia de color · mismo tono {tone}",
      mayanColor: "misma familia de color · tonos {a} · {b}",
      mayanOther: "familias de color distintas · tonos {a} · {b}",
      celtic: "Celta",
      celticRelation: {"same-tree": "el mismo árbol", "same-season": "árboles de la misma estación", "facing-season": "estaciones opuestas", distinct: "estaciones distintas"},
      hexagram: "Hexagrama natal",
      hexChanged: "se transforma en",
      hexNone: "no se traza (sin hora de nacimiento)",
      egyptian: "12 deidades egipcias (calendario moderno)",
      egyptianSame: "la misma deidad",
    },
    calendarTitle: "Vuestro calendario",
    calendarLead: "Las próximas cuatro semanas. El color muestra quién recibe energía ese día.",
    calA: "{name} recibe",
    calBoth: "Los dos reciben",
    alternating: "Nunca recibís el mismo día. Cuando uno se eleva, el otro descansa: turnaos para ir delante.",
    both: "Los dos recibís {n} días. Pon ahí los planes aplazados o las charlas importantes.",
    mixed: "Vuestros días de recibir están repartidos de forma distinta. Repartid las tareas según los días de cada uno.",
    patternTitle: "Vuestro patrón",
    patternLead: "Las coordenadas de cada uno se convierten en una órbita que deja estela. Solo estos dos hacen este patrón.",
    limitsTitle: "Límites de esta lectura",
    limitBase: "Esta lectura convierte símbolos tradicionales en material para conversar. No mide si una relación saldrá bien.",
    limitFull: "Ambos tienen hora y ciudad de nacimiento: se leyeron los ocho caracteres, la luna y el ascendente.",
    limitNoHour: "Sin hora de nacimiento para {names}: se omitieron el pilar de la hora y el ascendente.",
    limitMoon: "La luna cambió de signo ese día para {names}: hay dos candidatos.",
    limitNoAstro: "{names} no tiene coordenadas zodiacales (añadido antes). Vuelve a añadirlo para ver luna y sol.",
    listJoin: " · ",
    cta: "Leer a los dos",
    ctaPair: "Leer {a} · {b}",
  },
};
