"use client";

/**
 * 우리 기운 — 모임을 한 덩어리로 읽어 보여 준다.
 *
 * 렌즈는 두 사람 사이를 본다. 사람이 넷·다섯이 되면 정작 궁금한 것은 쌍이
 * 아니라 우리다. 이 패널이 그 자리를 맡는다 — 어떤 기운이 몰렸고 무엇이
 * 비었는지, 그 빈자리를 누가 채우는지.
 *
 * 셈은 전부 lib/symbolic-tradition/group-synthesis.ts 에 있다. 여기서는 그
 * 결과를 읽기만 한다. 총점도 순위도 만들지 않는다.
 */
import { useMemo } from "react";

import { GROUP_ELEMENT_ORDER, type GroupMember, type GroupSynthesis } from "@/lib/symbolic-tradition/group-synthesis";
import { astroAgreement, groupAstro } from "@/lib/symbolic-tradition/group-astro";
import { dayMasterOf } from "@/lib/symbolic-tradition/group-flow";
import { groupEpithet } from "@/lib/symbolic-tradition/group-epithet";
import { ELEMENT_SYMBOLS } from "@/lib/talisman/symbols";
import type { FiveElement } from "@/lib/ontology/saju/types";

import AstroLayer from "./AstroLayer";
import ElementRings from "./ElementRings";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const EL_COLOR: Record<string, string> = {
  wood: "#3f7a53",
  fire: "#b4452f",
  earth: "#8a6c3d",
  metal: "#6f7780",
  water: "#2f4f6f",
};

const T: Record<Lang, Record<string, string>> = {
  ko: {
    agree: "{el} 기운이 오행에서도 별자리에서도 몰렸어요. 두 체계가 같은 말을 해요.",
    ringsAria: "모임의 오행 고리",
    ringsLegend: "굵은 고리는 많이 가진 기운, 끊긴 고리는 아무도 없는 기운이에요. 각자 자기 일간의 고리를 돌아요.",
    title: "우리 기운",
    polarityYang: "양이 뚜렷하게 앞서요 — 이 기질이 밖으로 크게 드러나는 모임이에요.",
    polarityYin: "음이 뚜렷하게 깊어요 — 이 기질이 안으로 쌓이는 모임이에요.",
    tagsTitle: "이 모임의 결",
    oddOne: "혼자 다른 결",
    pairShared: "둘 다 가진 기운",
    pairOnly: "{name}만 가진 기운",
    pairNeither: "둘 다 없는 기운",
    abundant: "몰린 기운",
    scarce: "얇은 기운",
    missing: "아무도 없는 기운",
    spreadEven: "다섯 기운이 고르게 퍼져 있어요",
    spreadLeaning: "한쪽으로 조금 기울어 있어요",
    spreadSkewed: "한쪽으로 뚜렷하게 쏠려 있어요",
    polarity: "음양",
    yang: "양",
    yin: "음",
    tiltBalanced: "양과 음이 비슷해요",
    tiltYang: "양이 우세해요 — 벌이는 힘이 큰 모임이에요",
    tiltYin: "음이 우세해요 — 머금고 살피는 힘이 큰 모임이에요",
    who: "누가 무엇을 넣나",
    supplies: "채움",
    sole: "이 사람뿐",
    nobody: "빈자리를 채우는 사람이 아직 없어요",
    careTitle: "조심할 점",
  },
  en: {
    agree: "{el} gathers in both the five elements and the zodiac — two systems saying the same thing.",
    ringsAria: "The group’s five-element rings",
    ringsLegend: "Thick rings are energies the group holds a lot of; broken rings are energies nobody has. Each person orbits the ring of their day master.",
    title: "Our energies",
    polarityYang: "Yang clearly leads — this temperament shows outwardly.",
    polarityYin: "Yin clearly runs deep — this temperament builds up inside.",
    tagsTitle: "This group’s grain",
    oddOne: "The one who differs",
    pairShared: "Both of you have",
    pairOnly: "Only {name} has",
    pairNeither: "Neither of you has",
    abundant: "Concentrated", scarce: "Thin", missing: "Nobody has it",
    spreadEven: "The five spread evenly",
    spreadLeaning: "Tilted a little to one side",
    spreadSkewed: "Clearly concentrated on one side",
    polarity: "Yin–yang", yang: "Yang", yin: "Yin",
    tiltBalanced: "Yang and yin are close",
    tiltYang: "Yang leads — a group that starts things",
    tiltYin: "Yin leads — a group that holds and watches",
    who: "Who brings what", supplies: "Fills", sole: "Only one",
    nobody: "Nobody fills the gaps yet",
    careTitle: "Worth watching",
  },
  ja: {
    agree: "{el}の気が五行でも星座でも集まっています。二つの体系が同じことを言っています。",
    ringsAria: "集まりの五行の環",
    ringsLegend: "太い環は多く持つ気、途切れた環は誰も持たない気です。それぞれ自分の日干の環を回ります。",
    title: "わたしたちの気",
    polarityYang: "陽がはっきり先行 — この気質が外に大きく出る集まりです。",
    polarityYin: "陰がはっきり深い — この気質が内に積もる集まりです。",
    tagsTitle: "この集まりの質",
    oddOne: "ひとりだけ違う質",
    pairShared: "二人とも持つ気",
    pairOnly: "{name}だけが持つ気",
    pairNeither: "二人とも持たない気",
    abundant: "偏った気", scarce: "薄い気", missing: "誰も持たない気",
    spreadEven: "五つが均等に散っています",
    spreadLeaning: "少し片寄っています",
    spreadSkewed: "はっきり片寄っています",
    polarity: "陰陽", yang: "陽", yin: "陰",
    tiltBalanced: "陽と陰が近いです",
    tiltYang: "陽が優勢 — 起こす力が大きい集まりです",
    tiltYin: "陰が優勢 — 含み見守る力が大きい集まりです",
    who: "誰が何を足すか", supplies: "補う", sole: "この人だけ",
    nobody: "空いた席を埋める人がまだいません",
    careTitle: "気をつけること",
  },
  zh: {
    agree: "{el}气在五行和星座中都很集中——两个体系说的是同一件事。",
    ringsAria: "组合的五行环",
    ringsLegend: "粗环是大家拥有较多的气，断开的环是谁都没有的气。每个人绕着自己日干的环转动。",
    title: "我们的气",
    polarityYang: "阳明显占先——这种气质向外显露。",
    polarityYin: "阴明显深沉——这种气质向内积累。",
    tagsTitle: "这个组合的质地",
    oddOne: "唯一不同的质地",
    pairShared: "两人都有的气",
    pairOnly: "只有{name}有的气",
    pairNeither: "两人都没有的气",
    abundant: "偏多的气", scarce: "偏薄的气", missing: "无人具备的气",
    spreadEven: "五行分布均匀",
    spreadLeaning: "略微偏向一侧",
    spreadSkewed: "明显偏向一侧",
    polarity: "阴阳", yang: "阳", yin: "阴",
    tiltBalanced: "阴阳相近",
    tiltYang: "阳占优 — 这是善于发起的组合",
    tiltYin: "阴占优 — 这是善于含蓄观察的组合",
    who: "谁带来什么", supplies: "补上", sole: "仅此一人",
    nobody: "目前还没有人补上空缺",
    careTitle: "需要留意",
  },
  fr: {
    agree: "L’élément {el} se concentre à la fois dans les cinq éléments et dans le zodiaque : deux systèmes disent la même chose.",
    ringsAria: "Les anneaux des cinq éléments du groupe",
    ringsLegend: "Les anneaux épais sont les énergies abondantes ; les anneaux brisés, celles que personne n’a. Chacun tourne sur l’anneau de son maître du jour.",
    title: "Nos énergies",
    polarityYang: "Le yang domine nettement : ce tempérament se montre au dehors.",
    polarityYin: "Le yin est nettement profond : ce tempérament s’accumule au dedans.",
    tagsTitle: "Le grain de ce groupe",
    oddOne: "Celui qui diffère",
    pairShared: "Vous l’avez tous les deux",
    pairOnly: "Seul·e {name} l’a",
    pairNeither: "Aucun de vous ne l’a",
    abundant: "Concentrée", scarce: "Mince", missing: "Personne ne l’a",
    spreadEven: "Les cinq se répartissent également",
    spreadLeaning: "Légèrement penché d’un côté",
    spreadSkewed: "Nettement concentré d’un côté",
    polarity: "Yin–yang", yang: "Yang", yin: "Yin",
    tiltBalanced: "Yang et yin sont proches",
    tiltYang: "Le yang domine — un groupe qui lance",
    tiltYin: "Le yin domine — un groupe qui garde et observe",
    who: "Qui apporte quoi", supplies: "Comble", sole: "Seul",
    nobody: "Personne ne comble encore les manques",
    careTitle: "À surveiller",
  },
  es: {
    agree: "El elemento {el} se concentra tanto en los cinco elementos como en el zodiaco: dos sistemas dicen lo mismo.",
    ringsAria: "Los anillos de los cinco elementos del grupo",
    ringsLegend: "Los anillos gruesos son las energías abundantes; los rotos, las que nadie tiene. Cada persona gira en el anillo de su tronco del día.",
    title: "Nuestras energías",
    polarityYang: "El yang domina con claridad: este temperamento se muestra hacia fuera.",
    polarityYin: "El yin es claramente profundo: este temperamento se acumula por dentro.",
    tagsTitle: "El grano de este grupo",
    oddOne: "Quien es distinto",
    pairShared: "Lo tenéis los dos",
    pairOnly: "Solo {name} lo tiene",
    pairNeither: "Ninguno lo tiene",
    abundant: "Concentrada", scarce: "Escasa", missing: "Nadie la tiene",
    spreadEven: "Los cinco se reparten por igual",
    spreadLeaning: "Algo inclinado a un lado",
    spreadSkewed: "Claramente concentrado en un lado",
    polarity: "Yin–yang", yang: "Yang", yin: "Yin",
    tiltBalanced: "Yang y yin están cerca",
    tiltYang: "Domina el yang: un grupo que inicia",
    tiltYin: "Domina el yin: un grupo que sostiene y observa",
    who: "Quién aporta qué", supplies: "Cubre", sole: "Solo esta persona",
    nobody: "Todavía nadie cubre los huecos",
    careTitle: "A tener en cuenta",
  },
};



/**
 * 쏠림이 가져오는 위험. 같은 기운이 몰리면 그 기운의 장점과 함께 그 기운의
 * 함정도 같이 커진다 — 모임 전체가 같은 자리에서 막힌다.
 */
const SKEW_CARE: Record<Lang, Record<string, string>> = {
  ko: {
    wood: "벌여 놓기만 하고 맺는 사람이 없을 수 있어요.",
    fire: "불이 세서 빨리 뜨거워지고 빨리 식어요.",
    earth: "안정을 택하다 새로 시작할 때를 놓치기 쉬워요.",
    metal: "옳고 그름을 자주 가르다 서로 날이 설 수 있어요.",
    water: "깊이 생각하다 결정을 미루기 쉬워요.",
  },
  en: {
    wood: "Plenty of starting, perhaps nobody to finish.",
    fire: "It heats fast and cools just as fast.",
    earth: "Choosing stability can mean missing the moment to begin.",
    metal: "Frequent judging of right and wrong can sharpen edges between you.",
    water: "Deep thinking can turn into postponed decisions.",
  },
  ja: {
    wood: "広げるばかりで締める人がいないかもしれません。",
    fire: "火が強く、早く熱くなり早く冷めます。",
    earth: "安定を選ぶうち、始める時機を逃しがちです。",
    metal: "是非をよく分けるうち、互いに角が立つことがあります。",
    water: "深く考えるうち、決定を先送りしがちです。",
  },
  zh: {
    wood: "都在开头，也许没人收尾。",
    fire: "火旺，热得快也凉得快。",
    earth: "偏向稳妥，容易错过起步的时机。",
    metal: "常分对错，彼此容易起棱角。",
    water: "想得深，容易把决定一再推后。",
  },
  fr: {
    wood: "Beaucoup de départs, peut-être personne pour conclure.",
    fire: "Ça chauffe vite et refroidit aussi vite.",
    earth: "Choisir la stabilité peut faire manquer le moment de commencer.",
    metal: "Trancher souvent le juste et le faux peut aiguiser les angles.",
    water: "Penser profond peut devenir remettre à plus tard.",
  },
  es: {
    wood: "Mucho empezar y quizá nadie que cierre.",
    fire: "Se calienta rápido y se enfría igual de rápido.",
    earth: "Elegir la estabilidad puede hacer perder el momento de empezar.",
    metal: "Separar tanto lo correcto de lo incorrecto puede afilar los bordes.",
    water: "Pensar hondo puede convertirse en aplazar decisiones.",
  },
};


/**
 * 모임에 없거나 얇은 기운이 부르는 것. 몰린 기운의 함정(SKEW_CARE)만 말하던
 * 것을 보강했다 — 없는 기운은 채울 사람이 아예 없다는 뜻이라 더 중요하다.
 * 원소 순서: 목 · 화 · 토 · 금 · 수.
 */
const THIN_CARE: Record<Lang, string[]> = {"ko": ["시작하는 힘이 비어요. 누가 먼저 판을 벌일지 정해 두세요.", "달아오르는 힘이 비어요. 분위기를 띄울 사람이 필요해요.", "받쳐 주는 바닥이 비어요. 약속과 살림을 맡을 사람을 정해 두세요.", "끊고 맺는 힘이 비어요. 결론을 낼 사람을 정해 두세요.", "한 번 더 생각하는 힘이 비어요. 속도를 늦출 사람이 필요해요."], "en": ["The starting force is missing. Decide who opens things.", "The warming force is missing. Someone needs to lift the mood.", "The ground beneath is missing. Name who keeps promises and house.", "The force that cuts and concludes is missing. Name who closes.", "The second-thought force is missing. Someone needs to slow things down."], "ja": ["始める力が空いています。誰が先に動くか決めておきましょう。", "温める力が空いています。場を盛り上げる人が要ります。", "支える土台が空いています。約束と切り盛りの担当を決めましょう。", "断ち結ぶ力が空いています。結論を出す人を決めましょう。", "もう一度考える力が空いています。速度を落とす人が要ります。"], "zh": ["起步的力量空着。先定好谁来开局。", "升温的力量空着。需要有人带动气氛。", "托底的力量空着。定好谁管约定和日常。", "决断收尾的力量空着。定好谁来下结论。", "再想一遍的力量空着。需要有人把速度放慢。"], "fr": ["La force de départ manque. Décidez qui lance.", "La force qui réchauffe manque. Il faut quelqu’un pour élever l’ambiance.", "Le socle manque. Nommez qui tient promesses et maison.", "La force qui tranche et conclut manque. Nommez qui clôt.", "La force du second regard manque. Il faut quelqu’un pour ralentir."], "es": ["Falta la fuerza de arranque. Decidid quién abre.", "Falta la fuerza que calienta. Hace falta quien suba el ánimo.", "Falta el suelo que sostiene. Nombrad quién lleva promesas y casa.", "Falta la fuerza que corta y concluye. Nombrad quién cierra.", "Falta la fuerza de pensarlo dos veces. Hace falta quien frene."]};

/**
 * 오행 밖의 체계에서 모임이 몰렸을 때의 한 줄. 몰림은 우연 확률 5% 미만일
 * 때만 선다(group-synthesis.ts). 마야 색 계열의 뜻은 드림스펠의 네 계열
 * (시작·정제·변형·성숙), 삼합은 각 국(局)의 오행에서 온다.
 */
const TAG_TEXT: Record<Lang, Record<string, Record<string, string>>> = {"ko": {"mayanColor": {"red": "마야 · 붉은 계열이 모였어요 — 시작하고 불붙이는 결", "white": "마야 · 흰 계열이 모였어요 — 다듬고 정리하는 결", "blue": "마야 · 푸른 계열이 모였어요 — 바꾸고 변형하는 결", "yellow": "마야 · 노란 계열이 모였어요 — 무르익혀 거두는 결"}, "zodiacTrine": {"0": "띠 · 원숭이·쥐·용(물의 삼합)이 모였어요 — 흐르고 모으는 결", "1": "띠 · 돼지·토끼·양(나무의 삼합)이 모였어요 — 자라고 넓히는 결", "2": "띠 · 호랑이·말·개(불의 삼합)가 모였어요 — 타오르고 밀어붙이는 결", "3": "띠 · 뱀·닭·소(쇠의 삼합)가 모였어요 — 다듬고 결단하는 결"}, "celticSeason": {"0": "켈트 · 겨울 나무가 모였어요 — 움츠려 준비하는 결", "1": "켈트 · 봄 나무가 모였어요 — 싹 틔우는 결", "2": "켈트 · 여름 나무가 모였어요 — 한창 뻗는 결", "3": "켈트 · 가을 나무가 모였어요 — 거두고 맺는 결"}, "lifePath": {"1": "수비학 · 생명수 1이 모였어요 — 시작하고 앞장서는 결", "2": "수비학 · 생명수 2가 모였어요 — 맞추고 잇는 결", "3": "수비학 · 생명수 3이 모였어요 — 표현하고 나누는 결", "4": "수비학 · 생명수 4가 모였어요 — 쌓고 다지는 결", "5": "수비학 · 생명수 5가 모였어요 — 움직이고 바꾸는 결", "6": "수비학 · 생명수 6이 모였어요 — 돌보고 책임지는 결", "7": "수비학 · 생명수 7이 모였어요 — 파고들어 묻는 결", "8": "수비학 · 생명수 8이 모였어요 — 이루고 거느리는 결", "9": "수비학 · 생명수 9가 모였어요 — 품고 마무리하는 결", "11": "수비학 · 생명수 11이 모였어요 — 직관으로 비추는 결", "22": "수비학 · 생명수 22가 모였어요 — 크게 짓는 결", "33": "수비학 · 생명수 33이 모였어요 — 가르치고 보살피는 결"}}, "en": {"mayanColor": {"red": "Mayan · red family gathered — the grain that starts and ignites", "white": "Mayan · white family gathered — the grain that refines and sorts", "blue": "Mayan · blue family gathered — the grain that changes and transforms", "yellow": "Mayan · yellow family gathered — the grain that ripens and harvests"}, "zodiacTrine": {"0": "Zodiac · Monkey, Rat, Dragon (water trine) gathered — flowing and collecting", "1": "Zodiac · Pig, Rabbit, Goat (wood trine) gathered — growing and widening", "2": "Zodiac · Tiger, Horse, Dog (fire trine) gathered — blazing and pushing", "3": "Zodiac · Snake, Rooster, Ox (metal trine) gathered — refining and deciding"}, "celticSeason": {"0": "Celtic · winter trees gathered — the grain that gathers in and prepares", "1": "Celtic · spring trees gathered — the grain that sprouts", "2": "Celtic · summer trees gathered — the grain in full reach", "3": "Celtic · autumn trees gathered — the grain that harvests and concludes"}, "lifePath": {"1": "Numerology · life path 1 gathered — starting and leading", "2": "Numerology · life path 2 gathered — attuning and connecting", "3": "Numerology · life path 3 gathered — expressing and sharing", "4": "Numerology · life path 4 gathered — building and steadying", "5": "Numerology · life path 5 gathered — moving and changing", "6": "Numerology · life path 6 gathered — caring and taking responsibility", "7": "Numerology · life path 7 gathered — digging in and questioning", "8": "Numerology · life path 8 gathered — achieving and directing", "9": "Numerology · life path 9 gathered — embracing and completing", "11": "Numerology · life path 11 gathered — lighting the way by intuition", "22": "Numerology · life path 22 gathered — building on a grand scale", "33": "Numerology · life path 33 gathered — teaching and nurturing"}}, "ja": {"mayanColor": {"red": "マヤ · 赤の系統が集まった — 始めて火をつける質", "white": "マヤ · 白の系統が集まった — 磨いて整える質", "blue": "マヤ · 青の系統が集まった — 変えて変容させる質", "yellow": "マヤ · 黄の系統が集まった — 熟して刈り取る質"}, "zodiacTrine": {"0": "干支 · 申子辰（水の三合）が集まった — 流れて集める質", "1": "干支 · 亥卯未（木の三合）が集まった — 育ち広げる質", "2": "干支 · 寅午戌（火の三合）が集まった — 燃えて押し進む質", "3": "干支 · 巳酉丑（金の三合）が集まった — 磨いて決断する質"}, "celticSeason": {"0": "ケルト · 冬の木が集まった — 身を縮めて備える質", "1": "ケルト · 春の木が集まった — 芽吹く質", "2": "ケルト · 夏の木が集まった — 盛んに伸びる質", "3": "ケルト · 秋の木が集まった — 刈り取り結ぶ質"}, "lifePath": {"1": "数秘術 · ライフパス1が集まった — 始めて先に立つ質", "2": "数秘術 · ライフパス2が集まった — 合わせてつなぐ質", "3": "数秘術 · ライフパス3が集まった — 表して分かち合う質", "4": "数秘術 · ライフパス4が集まった — 積み上げて固める質", "5": "数秘術 · ライフパス5が集まった — 動いて変える質", "6": "数秘術 · ライフパス6が集まった — 世話をして責任を負う質", "7": "数秘術 · ライフパス7が集まった — 掘り下げて問う質", "8": "数秘術 · ライフパス8が集まった — 成し遂げて率いる質", "9": "数秘術 · ライフパス9が集まった — 包み込んで締めくくる質", "11": "数秘術 · ライフパス11が集まった — 直感で照らす質", "22": "数秘術 · ライフパス22が集まった — 大きく築く質", "33": "数秘術 · ライフパス33が集まった — 教えて慈しむ質"}}, "zh": {"mayanColor": {"red": "玛雅 · 红色系聚集——开创点燃的质地", "white": "玛雅 · 白色系聚集——打磨整理的质地", "blue": "玛雅 · 蓝色系聚集——改变转化的质地", "yellow": "玛雅 · 黄色系聚集——成熟收获的质地"}, "zodiacTrine": {"0": "生肖 · 申子辰（水三合）聚集——流动汇聚", "1": "生肖 · 亥卯未（木三合）聚集——生长扩展", "2": "生肖 · 寅午戌（火三合）聚集——燃烧推进", "3": "生肖 · 巳酉丑（金三合）聚集——打磨决断"}, "celticSeason": {"0": "凯尔特 · 冬之树聚集——收敛准备", "1": "凯尔特 · 春之树聚集——萌发", "2": "凯尔特 · 夏之树聚集——正当伸展", "3": "凯尔特 · 秋之树聚集——收获收束"}, "lifePath": {"1": "数字命理 · 生命灵数 1 聚集——开创领先", "2": "数字命理 · 生命灵数 2 聚集——协调连接", "3": "数字命理 · 生命灵数 3 聚集——表达分享", "4": "数字命理 · 生命灵数 4 聚集——积累稳固", "5": "数字命理 · 生命灵数 5 聚集——行动变化", "6": "数字命理 · 生命灵数 6 聚集——照顾担当", "7": "数字命理 · 生命灵数 7 聚集——深究追问", "8": "数字命理 · 生命灵数 8 聚集——成就统领", "9": "数字命理 · 生命灵数 9 聚集——包容收尾", "11": "数字命理 · 生命灵数 11 聚集——以直觉照亮", "22": "数字命理 · 生命灵数 22 聚集——宏大建构", "33": "数字命理 · 生命灵数 33 聚集——教导关怀"}}, "fr": {"mayanColor": {"red": "Maya · famille rouge réunie — le grain qui lance et allume", "white": "Maya · famille blanche réunie — le grain qui affine et range", "blue": "Maya · famille bleue réunie — le grain qui change et transforme", "yellow": "Maya · famille jaune réunie — le grain qui mûrit et récolte"}, "zodiacTrine": {"0": "Zodiaque · Singe, Rat, Dragon (trigone de l’eau) — couler et rassembler", "1": "Zodiaque · Cochon, Lièvre, Chèvre (trigone du bois) — croître et s’étendre", "2": "Zodiaque · Tigre, Cheval, Chien (trigone du feu) — brûler et pousser", "3": "Zodiaque · Serpent, Coq, Bœuf (trigone du métal) — affiner et trancher"}, "celticSeason": {"0": "Celte · arbres d’hiver réunis — se replier et préparer", "1": "Celte · arbres de printemps réunis — germer", "2": "Celte · arbres d’été réunis — pleine extension", "3": "Celte · arbres d’automne réunis — récolter et conclure"}, "lifePath": {"1": "Numérologie · chemin de vie 1 réuni — lancer et mener", "2": "Numérologie · chemin de vie 2 réuni — s’accorder et relier", "3": "Numérologie · chemin de vie 3 réuni — exprimer et partager", "4": "Numérologie · chemin de vie 4 réuni — bâtir et consolider", "5": "Numérologie · chemin de vie 5 réuni — bouger et changer", "6": "Numérologie · chemin de vie 6 réuni — prendre soin et assumer", "7": "Numérologie · chemin de vie 7 réuni — creuser et questionner", "8": "Numérologie · chemin de vie 8 réuni — accomplir et diriger", "9": "Numérologie · chemin de vie 9 réuni — accueillir et achever", "11": "Numérologie · chemin de vie 11 réuni — éclairer par l’intuition", "22": "Numérologie · chemin de vie 22 réuni — bâtir en grand", "33": "Numérologie · chemin de vie 33 réuni — enseigner et prendre soin"}}, "es": {"mayanColor": {"red": "Maya · familia roja reunida — el grano que inicia y enciende", "white": "Maya · familia blanca reunida — el grano que pule y ordena", "blue": "Maya · familia azul reunida — el grano que cambia y transforma", "yellow": "Maya · familia amarilla reunida — el grano que madura y cosecha"}, "zodiacTrine": {"0": "Zodiaco · Mono, Rata, Dragón (trígono del agua) — fluir y reunir", "1": "Zodiaco · Cerdo, Conejo, Cabra (trígono de la madera) — crecer y ampliar", "2": "Zodiaco · Tigre, Caballo, Perro (trígono del fuego) — arder y empujar", "3": "Zodiaco · Serpiente, Gallo, Buey (trígono del metal) — pulir y decidir"}, "celticSeason": {"0": "Celta · árboles de invierno reunidos — recogerse y preparar", "1": "Celta · árboles de primavera reunidos — brotar", "2": "Celta · árboles de verano reunidos — en plena extensión", "3": "Celta · árboles de otoño reunidos — cosechar y cerrar"}, "lifePath": {"1": "Numerología · camino de vida 1 reunido — iniciar y liderar", "2": "Numerología · camino de vida 2 reunido — armonizar y unir", "3": "Numerología · camino de vida 3 reunido — expresar y compartir", "4": "Numerología · camino de vida 4 reunido — construir y afianzar", "5": "Numerología · camino de vida 5 reunido — moverse y cambiar", "6": "Numerología · camino de vida 6 reunido — cuidar y responsabilizarse", "7": "Numerología · camino de vida 7 reunido — profundizar y preguntar", "8": "Numerología · camino de vida 8 reunido — lograr y dirigir", "9": "Numerología · camino de vida 9 reunido — acoger y completar", "11": "Numerología · camino de vida 11 reunido — iluminar con la intuición", "22": "Numerología · camino de vida 22 reunido — construir en grande", "33": "Numerología · camino de vida 33 reunido — enseñar y cuidar"}}};

/** 혼자 다른 사람 칩에 쓰는 짧은 칸 이름. */
const CATEGORY_NAME: Record<Lang, Record<string, Record<string, string>>> = {"ko": {"mayanColor": {"red": "마야 붉은 계열", "white": "마야 흰 계열", "blue": "마야 푸른 계열", "yellow": "마야 노란 계열"}, "zodiacTrine": {"0": "띠 물의 삼합", "1": "띠 나무의 삼합", "2": "띠 불의 삼합", "3": "띠 쇠의 삼합"}, "celticSeason": {"0": "켈트 겨울", "1": "켈트 봄", "2": "켈트 여름", "3": "켈트 가을"}, "lifePath": {"1": "생명수 1", "2": "생명수 2", "3": "생명수 3", "4": "생명수 4", "5": "생명수 5", "6": "생명수 6", "7": "생명수 7", "8": "생명수 8", "9": "생명수 9", "11": "생명수 11", "22": "생명수 22", "33": "생명수 33"}}, "en": {"mayanColor": {"red": "Mayan red", "white": "Mayan white", "blue": "Mayan blue", "yellow": "Mayan yellow"}, "zodiacTrine": {"0": "water trine", "1": "wood trine", "2": "fire trine", "3": "metal trine"}, "celticSeason": {"0": "Celtic winter", "1": "Celtic spring", "2": "Celtic summer", "3": "Celtic autumn"}, "lifePath": {"1": "life path 1", "2": "life path 2", "3": "life path 3", "4": "life path 4", "5": "life path 5", "6": "life path 6", "7": "life path 7", "8": "life path 8", "9": "life path 9", "11": "life path 11", "22": "life path 22", "33": "life path 33"}}, "ja": {"mayanColor": {"red": "マヤ赤", "white": "マヤ白", "blue": "マヤ青", "yellow": "マヤ黄"}, "zodiacTrine": {"0": "水の三合", "1": "木の三合", "2": "火の三合", "3": "金の三合"}, "celticSeason": {"0": "ケルト冬", "1": "ケルト春", "2": "ケルト夏", "3": "ケルト秋"}, "lifePath": {"1": "ライフパス1", "2": "ライフパス2", "3": "ライフパス3", "4": "ライフパス4", "5": "ライフパス5", "6": "ライフパス6", "7": "ライフパス7", "8": "ライフパス8", "9": "ライフパス9", "11": "ライフパス11", "22": "ライフパス22", "33": "ライフパス33"}}, "zh": {"mayanColor": {"red": "玛雅红", "white": "玛雅白", "blue": "玛雅蓝", "yellow": "玛雅黄"}, "zodiacTrine": {"0": "水三合", "1": "木三合", "2": "火三合", "3": "金三合"}, "celticSeason": {"0": "凯尔特冬", "1": "凯尔特春", "2": "凯尔特夏", "3": "凯尔特秋"}, "lifePath": {"1": "生命灵数 1", "2": "生命灵数 2", "3": "生命灵数 3", "4": "生命灵数 4", "5": "生命灵数 5", "6": "生命灵数 6", "7": "生命灵数 7", "8": "生命灵数 8", "9": "生命灵数 9", "11": "生命灵数 11", "22": "生命灵数 22", "33": "生命灵数 33"}}, "fr": {"mayanColor": {"red": "maya rouge", "white": "maya blanc", "blue": "maya bleu", "yellow": "maya jaune"}, "zodiacTrine": {"0": "trigone de l’eau", "1": "trigone du bois", "2": "trigone du feu", "3": "trigone du métal"}, "celticSeason": {"0": "hiver celte", "1": "printemps celte", "2": "été celte", "3": "automne celte"}, "lifePath": {"1": "chemin de vie 1", "2": "chemin de vie 2", "3": "chemin de vie 3", "4": "chemin de vie 4", "5": "chemin de vie 5", "6": "chemin de vie 6", "7": "chemin de vie 7", "8": "chemin de vie 8", "9": "chemin de vie 9", "11": "chemin de vie 11", "22": "chemin de vie 22", "33": "chemin de vie 33"}}, "es": {"mayanColor": {"red": "maya rojo", "white": "maya blanco", "blue": "maya azul", "yellow": "maya amarillo"}, "zodiacTrine": {"0": "trígono del agua", "1": "trígono de la madera", "2": "trígono del fuego", "3": "trígono del metal"}, "celticSeason": {"0": "invierno celta", "1": "primavera celta", "2": "verano celta", "3": "otoño celta"}, "lifePath": {"1": "camino de vida 1", "2": "camino de vida 2", "3": "camino de vida 3", "4": "camino de vida 4", "5": "camino de vida 5", "6": "camino de vida 6", "7": "camino de vida 7", "8": "camino de vida 8", "9": "camino de vida 9", "11": "camino de vida 11", "22": "camino de vida 22", "33": "camino de vida 33"}}};

export default function CircleSynthesis({
  locale,
  synthesis,
  members,
}: {
  locale: string;
  synthesis: GroupSynthesis;
  members: GroupMember[];
}) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = T[lang];
  const epithet = groupEpithet(synthesis, lang);
  const { contributions, elements, polarity, spread } = synthesis;
  const astroLayer = useMemo(() => groupAstro(members), [members]);
  const agreement = astroAgreement(synthesis, astroLayer);
  const labels = Object.fromEntries(members.map((m) => [m.id, m.label]));
  const name = (element: FiveElement) =>
    ELEMENT_SYMBOLS[element].name[lang] ?? ELEMENT_SYMBOLS[element].name.en;
  const spreadLine = spread === "even" ? t.spreadEven : spread === "leaning" ? t.spreadLeaning : t.spreadSkewed;
  const tiltLine = polarity.tilt === "balanced" ? t.tiltBalanced : polarity.tilt === "yang" ? t.tiltYang : t.tiltYin;
  const polarityTotal = Math.max(1, polarity.yang + polarity.yin);
  // 조심할 점 — 몰린 기운의 함정과, 없는·얇은 기운이 부르는 빈자리를 함께 말한다.
  const cares = [
    ...elements.abundant.map((element) => ({ element, line: SKEW_CARE[lang][element] })),
    ...[...elements.missing, ...elements.scarce].map((element) => ({
      element,
      line: THIN_CARE[lang][GROUP_ELEMENT_ORDER.indexOf(element)],
    })),
  ].filter((item) => item.line);
  const helpers = contributions.filter((item) => item.supplies.length || item.sole.length || item.distinctions.length);
  const { pair, tags } = synthesis;
  const labelOf = (id: string) => contributions.find((item) => item.id === id)?.label ?? id;

  const chips = (label: string, list: FiveElement[], tone: string) =>
    list.length ? (
      <p className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-bold text-muted-foreground">{label}</span>
        {list.map((element) => (
          <span key={element} className={`rounded-full px-2 py-0.5 font-black ${tone}`}>
            {name(element)}
          </span>
        ))}
      </p>
    ) : null;

  return (
    <section className="mt-8 rounded-[2rem] border border-border bg-card p-4 sm:p-7">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t.title}</p>
      {/* 모임의 이름이 먼저 온다. 숫자는 그 이름의 근거로 아래에 따라붙는다. */}
      <h2 className="mt-1 text-2xl font-black leading-tight text-foreground sm:text-3xl">{epithet.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{epithet.line}</p>
      {/* B4 — 오행과 별자리가 같은 원소를 몰렸다고 할 때만 한 줄. */}
      {agreement && (
        <p className="mt-1 text-sm font-bold leading-relaxed text-primary-strong">{t.agree.replace("{el}", name(agreement))}</p>
      )}
      {/* 별명은 오행 축에서 나온다. 음양이 우연으로 보기 어려울 만큼 기울었으면
          같은 별명이라도 결이 달라서 한 줄로 덧붙인다. */}
      {polarity.pronounced && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {polarity.yang > polarity.yin ? t.polarityYang : t.polarityYin}
        </p>
      )}
      {tags.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold text-muted-foreground">{t.tagsTitle}</p>
          <ul className="mt-1 space-y-1">
            {tags.map((tag) => (
              <li key={`${tag.system}-${tag.category}`} className="text-xs leading-relaxed text-foreground">
                {TAG_TEXT[lang][tag.system]?.[tag.category]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* A1 오행 고리. 굵기는 양, 진하기는 기대값에서 벗어난 정도(막대 시절과
          같은 자), 끊긴 고리는 아무도 없는 기운. 사람은 자기 일간의 고리를 돈다. */}
      <div className="mt-4">
        <ElementRings
          elements={elements}
          people={members.map((m) => ({ id: m.id, label: m.label, dayMaster: dayMasterOf(m.profile) }))}
          elementName={name}
          ariaLabel={t.ringsAria}
        />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.ringsLegend}</p>
        {/* 숫자는 그림 아래 한 줄로. 기대값에서 크게 벗어난 기운만 진하게. */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {GROUP_ELEMENT_ORDER.map((element) => {
            const strong = Math.abs(elements.deviation[element]) >= 1.5;
            return (
              <span
                key={element}
                className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${strong ? "font-black text-white" : "font-bold text-foreground"}`}
                style={strong ? { backgroundColor: EL_COLOR[element] } : { boxShadow: `inset 0 0 0 1px ${EL_COLOR[element]}` }}
              >
                {name(element)} {elements.counts[element]}
              </span>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs font-bold text-foreground">{spreadLine}</p>

      <div className="mt-3 space-y-1.5">
        {chips(t.abundant, elements.abundant, "bg-primary/15 text-primary-strong")}
        {pair ? (
          // 둘뿐이면 좌표가 열여섯이라 "얇다"는 판정이 설 수 없다. 대신 누가
          // 무엇을 가졌는지로 말한다.
          <>
            {chips(t.pairShared, pair.shared, "bg-primary/10 text-primary-strong")}
            {Object.entries(pair.only).map(([id, list]) => (
              <div key={id}>{chips(t.pairOnly.replace("{name}", labelOf(id)), list, "bg-amber-100 text-amber-900")}</div>
            ))}
            {chips(t.pairNeither, pair.neither, "bg-red-50 text-red-800")}
          </>
        ) : (
          <>
            {chips(t.scarce, elements.scarce, "bg-muted text-muted-foreground")}
            {chips(t.missing, elements.missing, "bg-red-50 text-red-800")}
          </>
        )}
      </div>

      {cares.length > 0 && (
        <div className="mt-4 rounded-2xl bg-muted/40 p-3">
          <p className="text-[11px] font-bold text-muted-foreground">{t.careTitle}</p>
          <ul className="mt-1 space-y-1">
            {cares.map((item) => (
              <li key={`${item.element}-${item.line}`} className="flex gap-2 text-sm leading-relaxed text-foreground">
                <span className="mt-0.5 shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: EL_COLOR[item.element] }}>
                  {name(item.element)}
                </span>
                <span>{item.line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border p-3">
        <p className="text-[11px] font-bold text-muted-foreground">{t.polarity}</p>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-amber-500" style={{ width: `${(polarity.yang / polarityTotal) * 100}%` }} />
          <div className="h-full bg-slate-600" style={{ width: `${(polarity.yin / polarityTotal) * 100}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {t.yang} {polarity.yang} · {t.yin} {polarity.yin}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{tiltLine}</p>
      </div>

      {/* 별자리 층 B1~B3. B4 는 헤드라인 아래 한 줄. */}
      <AstroLayer lang={lang} astro={astroLayer} labels={labels} />

      <div className="mt-4">
        <p className="text-[11px] font-bold text-muted-foreground">{t.who}</p>
        {helpers.length ? (
          <ul className="mt-2 space-y-1.5">
            {helpers.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="font-black text-foreground">{item.label}</span>
                {item.supplies.map((element) => (
                  <span key={`s${element}`} className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary-strong">
                    {t.supplies} · {name(element)}
                  </span>
                ))}
                {item.sole.map((element) => (
                  <span key={`o${element}`} className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                    {t.sole} · {name(element)}
                  </span>
                ))}
                {/* 모두가 한쪽에 몰린 체계에서 혼자 다른 사람 — 모임에 다른 결을 넣는다. */}
                {item.distinctions.map((d) => (
                  <span key={`d${d.system}`} className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-900">
                    {t.oddOne} · {CATEGORY_NAME[lang][d.system]?.[d.category]}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">{t.nobody}</p>
        )}
      </div>
    </section>
  );
}
