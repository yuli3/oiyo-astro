/**
 * 모임에 이름을 붙인다 — "브레이크 없는 폭주기관차" 처럼.
 *
 * 왜 런타임 LLM 이 아닌가. oiyo 는 정적 사이트다. 런타임 생성은 워커·키·비용·
 * 지연을 부르고, 무엇보다 같은 입력에 같은 출력이라는 이 코드베이스의 원칙을
 * 깬다 — 공유 링크로 연 친구가 나와 다른 문구를 본다. 조합도 많지 않다.
 * 기억에 남는 별명은 상태 전체가 아니라 **가장 두드러진 한 가지**에 걸린다.
 *
 * 처음에는 축을 오행 하나로 줄였다(기저 비율에서 가장 크게 벗어난 오행과 그 방향).
 * 그러자 음양이나 띠가 뚜렷이 몰린 모임도 오행 이름을 받았다. 2026-09-25 세운 결정(D4)
 * 으로 음양·띠 삼합·태양 별자리 원소를 후보 축으로 더하고, 축마다 우연 확률로 재어
 * 가장 드문 쪽에서 고른다. 스물한 칸 전부 실제로 나온다(1960~2010 에서 9,000 모임, 2~8인):
 *
 *   flat 13.6 · metal+ 8.6 · water+ 8.4 · earth+ 8.2 · wood+ 7.6 · fire+ 7.6
 *   yin 6.5 · yang 6.3 · water- 5.1 · wood- 5.1 · metal- 5.0 · fire- 4.9 · earth- 4.3
 *   trine 1.1~1.5 (넷) · astro 0.7~1.4 (넷)
 *
 * 오행이 여전히 78% 를 맡는다 — 고리 그림과 조심할 점이 오행을 풀어 주기 때문이다.
 *
 * 문구는 강점과 대가를 함께 말한다. 강점만 말하면 아첨이고, 모두에게 같은
 * 칭찬을 하는 것은 관찰이 아니다.
 */
import type { Locale } from "@/i18n";
import { FiveElement } from "../ontology/saju/types";
import { GROUP_ELEMENT_ORDER, binomialTail, type GroupSynthesis } from "./group-synthesis";

/** 이보다 덜 벗어났으면 두드러지는 쪽이 없다고 본다. */
const FLAT_BELOW = 1;

export type AstroElement = "fire" | "earth" | "air" | "water";

export type GroupEpithetKey =
  | "flat"
  | `${FiveElement}-rich`
  | `${FiveElement}-thin`
  | "yang"
  | "yin"
  | `trine-${0 | 1 | 2 | 3}`
  | `astro-${AstroElement}`;

/** 별명을 어느 축에서 골랐는가. 화면이 같은 이야기를 두 번 하지 않게 쓴다. */
export type GroupEpithetAxis = "elements" | "polarity" | "zodiacTrine" | "astro";

export interface GroupEpithet {
  /** 한 줄 별명 */
  title: string;
  /** 왜 그런지, 그리고 그 대가 */
  line: string;
}

/** 표준정규 윗꼬리 P(Z ≥ z). 오행·음양의 편차가 표준편차 단위라 같은 자로 확률을 잰다. */
function normalTail(z: number): number {
  // Abramowitz–Stegun 7.1.26 — 소수 셋째 자리까지 맞으면 축 비교에는 충분하다.
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const erfc = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x);
  return z >= 0 ? erfc / 2 : 1 - erfc / 2;
}

/** 오행 밖의 축이 별명을 가져가려면 적어도 이만큼은 드물어야 한다(태그 문턱과 같은 5%). */
const AXIS_P = 0.05;

interface Candidate {
  axis: GroupEpithetAxis;
  key: GroupEpithetKey;
  /** 칸 수를 곱한 우연 확률. 작을수록 이 모임에서 두드러진다. */
  score: number;
}

/**
 * 축마다 "우연히 이만큼 몰릴 확률"을 재고 가장 드문 축에서 별명을 고른다.
 *
 * 2026-09-25 세운 결정(D4): 별명이 오행 한 축에서만 나와 음양·띠·별자리가 몰린
 * 모임도 오행 이름을 받았다. 축마다 칸 수가 달라(오행 다섯, 음양 둘, 삼합·원소
 * 넷) 칸이 많은 축이 "어느 칸이든 튄다"를 더 자주 만들므로 확률에 칸 수를 곱해
 * 맞춘다. 동점이면 오행을 남긴다 — 고리 그림과 조심할 점이 오행을 설명한다.
 */
function candidates(synthesis: GroupSynthesis): Candidate[] {
  let peak = GROUP_ELEMENT_ORDER[0];
  for (const element of GROUP_ELEMENT_ORDER) {
    if (Math.abs(synthesis.elements.deviation[element]) > Math.abs(synthesis.elements.deviation[peak])) {
      peak = element;
    }
  }
  const off = synthesis.elements.deviation[peak];
  const list: Candidate[] = [
    Math.abs(off) < FLAT_BELOW
      ? { axis: "elements", key: "flat", score: 1 }
      : { axis: "elements", key: off > 0 ? `${peak}-rich` : `${peak}-thin`, score: normalTail(Math.abs(off)) * 5 },
  ];

  const { yang, yin, pronounced } = synthesis.polarity;
  if (pronounced) {
    const pillars = Math.max(1, (yang + yin) / 2);
    const z = Math.abs(yang - yin) / 2 / Math.sqrt(pillars);
    list.push({ axis: "polarity", key: yang > yin ? "yang" : "yin", score: normalTail(z) * 2 });
  }

  const n = synthesis.memberCount;
  if (n >= 3) {
    for (const tag of synthesis.tags) {
      if (tag.system !== "zodiacTrine") continue;
      list.push({
        axis: "zodiacTrine",
        key: `trine-${Number(tag.category) as 0 | 1 | 2 | 3}`,
        score: binomialTail(n, tag.count, 0.25) * 4,
      });
    }
    const astro = synthesis.astro.elements;
    for (const element of ["fire", "earth", "air", "water"] as AstroElement[]) {
      const p = binomialTail(n, astro[element], 0.25);
      if (astro[element] >= 3 && p < AXIS_P) list.push({ axis: "astro", key: `astro-${element}`, score: p * 4 });
    }
  }
  return list;
}

function pick(synthesis: GroupSynthesis): Candidate {
  return candidates(synthesis).reduce((best, next) => (next.score < best.score ? next : best));
}

export function groupEpithetKey(synthesis: GroupSynthesis): GroupEpithetKey {
  return pick(synthesis).key;
}

export function groupEpithetAxis(synthesis: GroupSynthesis): GroupEpithetAxis {
  return pick(synthesis).axis;
}

const K = {
  flat: "flat",
  woodRich: `${FiveElement.WOOD}-rich`,
  woodThin: `${FiveElement.WOOD}-thin`,
  fireRich: `${FiveElement.FIRE}-rich`,
  fireThin: `${FiveElement.FIRE}-thin`,
  earthRich: `${FiveElement.EARTH}-rich`,
  earthThin: `${FiveElement.EARTH}-thin`,
  metalRich: `${FiveElement.METAL}-rich`,
  metalThin: `${FiveElement.METAL}-thin`,
  waterRich: `${FiveElement.WATER}-rich`,
  waterThin: `${FiveElement.WATER}-thin`,
} as const;

export const GROUP_EPITHET: Record<Locale, Record<GroupEpithetKey, GroupEpithet>> = {
  ko: {
    [K.flat]: { title: "좋은 게 좋은 사람들", line: "다섯 기운이 고르게 퍼져 누구도 튀지 않아요. 편한 대신, 판을 흔들 사람도 없어요." },
    [K.woodRich]: { title: "일단 벌이고 보는 모임", line: "새 판을 여는 데 거리낌이 없어요. 벌여 놓은 걸 맺어 줄 사람이 필요해요." },
    [K.woodThin]: { title: "시작 버튼이 없는 방", line: "다들 잘하는데 아무도 먼저 안 움직여요. 누가 총대를 멜지 미리 정해 두세요." },
    [K.fireRich]: { title: "브레이크 없는 폭주기관차", line: "불이 세서 금방 달아올라요. 금방 식기도 하니 쉬는 때를 정해 두세요." },
    [K.fireThin]: { title: "불 꺼진 난롯가", line: "차분한데 달아오르는 순간이 잘 안 와요. 분위기를 띄울 사람이 한 명은 필요해요." },
    [K.earthRich]: { title: "웬만해선 안 흔들리는 사람들", line: "무슨 일이 있어도 중심이 잡혀요. 대신 새로 시작할 때를 놓치기 쉬워요." },
    [K.earthThin]: { title: "벌여만 놓고 수습이 없는 모임", line: "아이디어는 넘치는데 받쳐 줄 바닥이 얇아요. 살림을 맡을 사람이 필요해요." },
    [K.metalRich]: { title: "원칙주의자 연합", line: "정리하고 맺는 힘이 확실해요. 서로 날이 서면 오래가니 조심해요." },
    [K.metalThin]: { title: "아무도 끊지 못하는 회의", line: "다들 배려하다 결론이 안 나요. 마무리를 맡을 사람을 정해 두세요." },
    [K.waterRich]: { title: "생각만 하다 밤새우는 모임", line: "깊이 보는 힘이 커요. 대신 결정을 자꾸 미루게 돼요." },
    [K.waterThin]: { title: "일단 지르고 보는 사람들", line: "추진력은 좋은데 한 번 더 생각할 자리가 비어요. 속도를 늦출 사람이 필요해요." },
    "yang": { title: "밖으로 뛰쳐나가는 사람들", line: "양이 뚜렷하게 앞서 움직임이 빠르고 겉으로 잘 드러나요. 대신 안에서 곱씹을 시간이 모자라요." },
    "yin": { title: "속으로 깊어지는 사람들", line: "음이 뚜렷하게 깊어 조용히 쌓아 가요. 대신 먼저 말을 꺼내는 사람이 드물어요." },
    "trine-0": { title: "머리 빠른 물길 동맹", line: "원숭이·쥐·용 띠(수국)가 몰렸어요. 판단이 빠르고 길을 잘 찾는 대신, 한곳에 오래 머무는 걸 답답해해요." },
    "trine-1": { title: "순한 얼굴의 고집쟁이들", line: "돼지·토끼·양 띠(목국)가 몰렸어요. 서로 다정하게 맞춰 주는 대신, 싫은 소리를 아무도 먼저 안 해요." },
    "trine-2": { title: "불붙으면 끝을 보는 삼총사", line: "호랑이·말·개 띠(화국)가 몰렸어요. 의리 있고 추진이 빠른 대신, 부딪히면 크게 부딪혀요." },
    "trine-3": { title: "끝까지 따져 보는 사람들", line: "뱀·닭·소 띠(금국)가 몰렸어요. 꼼꼼하고 한 번 정하면 흔들리지 않는 대신, 시작이 느려요." },
    "astro-fire": { title: "박수 소리가 큰 모임", line: "태양 별자리가 불(양·사자·궁수)에 몰렸어요. 신나게 불붙는 대신, 지루한 일은 서로 미뤄요." },
    "astro-earth": { title: "계획표부터 짜는 모임", line: "태양 별자리가 흙(황소·처녀·염소)에 몰렸어요. 현실적이고 믿음직한 대신, 즉흥 제안에는 굼떠요." },
    "astro-air": { title: "대화가 끊이지 않는 모임", line: "태양 별자리가 공기(쌍둥이·천칭·물병)에 몰렸어요. 생각이 활발히 오가는 대신, 실행이 말을 못 따라가요." },
    "astro-water": { title: "마음부터 읽는 모임", line: "태양 별자리가 물(게·전갈·물고기)에 몰렸어요. 서로의 기분을 잘 알아채는 대신, 서운함도 오래가요." },
  },
  en: {
    [K.flat]: { title: "Everyone gets along", line: "All five spread evenly, so nobody sticks out. Comfortable — and nobody to shake the table." },
    [K.woodRich]: { title: "Start first, ask later", line: "No hesitation about opening something new. You need someone to close what you open." },
    [K.woodThin]: { title: "A room with no start button", line: "Everyone is capable and nobody moves first. Decide in advance who takes the lead." },
    [K.fireRich]: { title: "A train with no brakes", line: "The fire runs hot fast — and cools just as fast. Agree on when you rest." },
    [K.fireThin]: { title: "A hearth gone cold", line: "Calm, but the moment rarely catches fire. You need one person to raise the temperature." },
    [K.earthRich]: { title: "Hard to knock over", line: "The centre holds no matter what. The cost is missing the moment to begin." },
    [K.earthThin]: { title: "All opening, no keeping", line: "Ideas everywhere, thin ground beneath them. Someone has to keep house." },
    [K.metalRich]: { title: "The society of principles", line: "Strong at sorting and concluding. Watch the edges — they cut and they last." },
    [K.metalThin]: { title: "A meeting nobody can end", line: "So much consideration that nothing concludes. Name who closes it." },
    [K.waterRich]: { title: "Up all night thinking", line: "Great depth of looking. The cost is decisions that keep sliding." },
    [K.waterThin]: { title: "Act now, think later", line: "Plenty of drive, but the second thought is missing. You need someone who slows it down." },
    "yang": { title: "Straight out the door", line: "Yang clearly leads, so you move fast and show it. The cost is too little time to mull things over." },
    "yin": { title: "Deepening on the inside", line: "Yin clearly runs deep, so you build quietly. The cost is that few people speak up first." },
    "trine-0": { title: "Quick minds, one current", line: "Monkey, Rat and Dragon years (the water trine) cluster here. Quick to judge and find a way — and restless when you have to stay put." },
    "trine-1": { title: "Gentle faces, stubborn hearts", line: "Pig, Rabbit and Goat years (the wood trine) cluster here. You accommodate each other kindly — and nobody says the hard thing first." },
    "trine-2": { title: "Once lit, all the way", line: "Tiger, Horse and Dog years (the fire trine) cluster here. Loyal and quick to push forward — and when you clash, you clash hard." },
    "trine-3": { title: "Checking it all to the end", line: "Snake, Rooster and Ox years (the metal trine) cluster here. Thorough and unshakeable once decided — and slow to start." },
    "astro-fire": { title: "The loudest applause", line: "Sun signs cluster in fire (Aries, Leo, Sagittarius). You catch fire with excitement — and pass the dull jobs to each other." },
    "astro-earth": { title: "Plan first, then go", line: "Sun signs cluster in earth (Taurus, Virgo, Capricorn). Practical and reliable — and slow to take up a spur-of-the-moment idea." },
    "astro-air": { title: "The conversation never stops", line: "Sun signs cluster in air (Gemini, Libra, Aquarius). Ideas fly back and forth — and action can't keep up with the talk." },
    "astro-water": { title: "Reading hearts first", line: "Sun signs cluster in water (Cancer, Scorpio, Pisces). You pick up each other's moods — and hurt feelings linger too." },
  },
  ja: {
    [K.flat]: { title: "まあまあで収まる人たち", line: "五つの気が均等で、誰も突出しません。楽な代わりに場を揺らす人もいません。" },
    [K.woodRich]: { title: "とりあえず広げる集まり", line: "新しく始めることに迷いがありません。広げたものを締める人が要ります。" },
    [K.woodThin]: { title: "スタートボタンのない部屋", line: "みな有能なのに誰も先に動きません。誰が先頭に立つか決めておきましょう。" },
    [K.fireRich]: { title: "ブレーキのない暴走機関車", line: "火が強く、すぐ熱くなりすぐ冷めます。休む時を決めておきましょう。" },
    [K.fireThin]: { title: "火の消えた囲炉裏", line: "穏やかですが、盛り上がる瞬間が来にくいです。場を温める人が一人要ります。" },
    [K.earthRich]: { title: "まず揺るがない人たち", line: "何があっても中心が保たれます。その分、始める時機を逃しがちです。" },
    [K.earthThin]: { title: "広げるだけで片づかない集まり", line: "案は溢れるのに支える土台が薄いです。切り盛りする人が要ります。" },
    [K.metalRich]: { title: "原則主義者の連合", line: "整理し締める力が確かです。互いに角が立つと長引くので注意を。" },
    [K.metalThin]: { title: "誰も終われない会議", line: "気遣いばかりで結論が出ません。締める役を決めておきましょう。" },
    [K.waterRich]: { title: "考えるうちに夜が明ける集まり", line: "深く見る力が大きいです。その分、決定を先送りしがちです。" },
    [K.waterThin]: { title: "まず動いてしまう人たち", line: "推進力はありますが、もう一度考える席が空いています。速度を落とす人が要ります。" },
    "yang": { title: "外へ飛び出す人たち", line: "陽がはっきり先行し、動きが速く外によく出ます。その分、内で噛みしめる時間が足りません。" },
    "yin": { title: "内へ深まる人たち", line: "陰がはっきり深く、静かに積み上げていきます。その分、先に口を開く人がまれです。" },
    "trine-0": { title: "頭の速い水脈同盟", line: "申・子・辰の年（水局）が集まっています。判断が速く道を見つけるのが得意な分、一か所にとどまるのを窮屈がります。" },
    "trine-1": { title: "穏やかな顔の頑固者たち", line: "亥・卯・未の年（木局）が集まっています。互いに優しく合わせる分、耳の痛いことを誰も先に言いません。" },
    "trine-2": { title: "火がつけば最後までの三銃士", line: "寅・午・戌の年（火局）が集まっています。義理堅く推進が速い分、ぶつかると大きくぶつかります。" },
    "trine-3": { title: "最後まで詰める人たち", line: "巳・酉・丑の年（金局）が集まっています。几帳面で一度決めたら揺らがない分、始まりが遅いです。" },
    "astro-fire": { title: "拍手の大きい集まり", line: "太陽星座が火（牡羊・獅子・射手）に集まっています。楽しく燃え上がる分、退屈な仕事は押しつけ合います。" },
    "astro-earth": { title: "まず計画表から作る集まり", line: "太陽星座が地（牡牛・乙女・山羊）に集まっています。現実的で頼もしい分、思いつきの提案には腰が重いです。" },
    "astro-air": { title: "会話が途切れない集まり", line: "太陽星座が風（双子・天秤・水瓶）に集まっています。考えが活発に行き交う分、実行が言葉に追いつきません。" },
    "astro-water": { title: "まず心を読む集まり", line: "太陽星座が水（蟹・蠍・魚）に集まっています。互いの気分によく気づく分、寂しさも長引きます。" },
  },
  zh: {
    [K.flat]: { title: "和和气气的一群人", line: "五行分布均匀，谁也不突出。舒服，但也没人来掀桌子。" },
    [K.woodRich]: { title: "先开场再说的组合", line: "开新局毫不犹豫。需要有人来收尾。" },
    [K.woodThin]: { title: "没有启动键的房间", line: "各个都行，却没人先动。先说好谁来带头。" },
    [K.fireRich]: { title: "没有刹车的火车", line: "火旺，热得快也凉得快。先约好什么时候休息。" },
    [K.fireThin]: { title: "熄了火的炉边", line: "沉静，却少了热起来的那一刻。需要有人把气氛带起来。" },
    [K.earthRich]: { title: "轻易撼不动的人们", line: "无论如何中心都稳。代价是容易错过起步的时机。" },
    [K.earthThin]: { title: "只铺开不收拾的组合", line: "点子很多，托底的却薄。需要有人管家。" },
    [K.metalRich]: { title: "原则派联盟", line: "整理与收束的力量很足。彼此起棱角会拖很久，留意。" },
    [K.metalThin]: { title: "没人能结束的会议", line: "都在体谅，结论出不来。指定一个收尾的人。" },
    [K.waterRich]: { title: "想着想着就天亮的组合", line: "看得深。代价是决定一再往后推。" },
    [K.waterThin]: { title: "先做了再说的人们", line: "冲劲够，却少了再想一遍的位置。需要有人把速度放慢。" },
    "yang": { title: "一出门就冲的人们", line: "阳明显占先，行动快、外露。代价是缺少在心里反复琢磨的时间。" },
    "yin": { title: "向内沉潜的人们", line: "阴明显深沉，默默积累。代价是很少有人先开口。" },
    "trine-0": { title: "脑子快的水路同盟", line: "猴、鼠、龙年（水局）聚在一起。判断快、会找路，但待在一处太久会觉得憋闷。" },
    "trine-1": { title: "面善心倔的一群人", line: "猪、兔、羊年（木局）聚在一起。彼此温和迁就，但难听的话谁也不先说。" },
    "trine-2": { title: "一点就燃到底的三剑客", line: "虎、马、狗年（火局）聚在一起。讲义气、推进快，但一碰撞就撞得很凶。" },
    "trine-3": { title: "凡事问到底的人们", line: "蛇、鸡、牛年（金局）聚在一起。细致，一旦定下就不动摇，但起步慢。" },
    "astro-fire": { title: "掌声最响的组合", line: "太阳星座集中在火象（白羊、狮子、射手）。热情一点就着，但枯燥的活儿互相推。" },
    "astro-earth": { title: "先排计划表的组合", line: "太阳星座集中在土象（金牛、处女、摩羯）。务实可靠，但对临时起意的提议反应慢。" },
    "astro-air": { title: "话题停不下来的组合", line: "太阳星座集中在风象（双子、天秤、水瓶）。想法往来活跃，但行动跟不上嘴。" },
    "astro-water": { title: "先读懂心思的组合", line: "太阳星座集中在水象（巨蟹、天蝎、双鱼）。能察觉彼此情绪，但委屈也会持续很久。" },
  },
  fr: {
    [K.flat]: { title: "Tout le monde s'entend", line: "Les cinq se répartissent également, personne ne dépasse. Confortable — et personne pour bousculer." },
    [K.woodRich]: { title: "On lance d'abord", line: "Aucune hésitation à ouvrir du neuf. Il faut quelqu'un pour refermer." },
    [K.woodThin]: { title: "Une pièce sans bouton marche", line: "Tous capables, personne ne bouge en premier. Décidez d'avance qui ouvre la marche." },
    [K.fireRich]: { title: "Un train sans freins", line: "Le feu monte vite et retombe aussi vite. Convenez du moment où l'on souffle." },
    [K.fireThin]: { title: "Un âtre éteint", line: "Calme, mais l'étincelle vient rarement. Il faut quelqu'un pour monter la température." },
    [K.earthRich]: { title: "Difficiles à faire vaciller", line: "Le centre tient quoi qu'il arrive. Le prix : manquer le moment de commencer." },
    [K.earthThin]: { title: "On ouvre tout, on ne range rien", line: "Des idées partout, un sol mince dessous. Quelqu'un doit tenir la maison." },
    [K.metalRich]: { title: "La ligue des principes", line: "Fort pour trier et conclure. Attention aux angles : ils coupent et ils durent." },
    [K.metalThin]: { title: "Une réunion que nul ne clôt", line: "Tant d'égards que rien ne se conclut. Nommez qui ferme." },
    [K.waterRich]: { title: "On y pense jusqu'à l'aube", line: "Grande profondeur de regard. Le prix : des décisions qui glissent." },
    [K.waterThin]: { title: "On agit, on pensera après", line: "De l'élan, mais la seconde pensée manque. Il faut quelqu'un qui ralentisse." },
    "yang": { title: "Toujours dehors", line: "Le yang domine nettement : vous bougez vite et cela se voit. Le prix : peu de temps pour ruminer." },
    "yin": { title: "Tout en profondeur", line: "Le yin est nettement profond : vous construisez en silence. Le prix : rares sont ceux qui parlent les premiers." },
    "trine-0": { title: "Esprits vifs, même courant", line: "Les années Singe, Rat et Dragon (le trigone de l'eau) se regroupent. Prompts à juger et à trouver la voie — et impatients de rester sur place." },
    "trine-1": { title: "Visages doux, cœurs têtus", line: "Les années Cochon, Lapin et Chèvre (le trigone du bois) se regroupent. Vous vous accommodez avec gentillesse — et personne ne dit le mot qui fâche." },
    "trine-2": { title: "Une fois allumés, jusqu'au bout", line: "Les années Tigre, Cheval et Chien (le trigone du feu) se regroupent. Loyaux et prompts à foncer — et quand ça heurte, ça heurte fort." },
    "trine-3": { title: "On vérifie jusqu'au bout", line: "Les années Serpent, Coq et Bœuf (le trigone du métal) se regroupent. Minutieux et inébranlables une fois décidés — et lents à démarrer." },
    "astro-fire": { title: "Les applaudissements les plus forts", line: "Les signes solaires se regroupent dans le feu (Bélier, Lion, Sagittaire). Vous vous enflammez vite — et vous vous renvoyez les tâches ennuyeuses." },
    "astro-earth": { title: "D'abord le planning", line: "Les signes solaires se regroupent dans la terre (Taureau, Vierge, Capricorne). Concrets et fiables — et lents à suivre une idée improvisée." },
    "astro-air": { title: "La conversation ne s'arrête jamais", line: "Les signes solaires se regroupent dans l'air (Gémeaux, Balance, Verseau). Les idées fusent — et l'action peine à suivre les paroles." },
    "astro-water": { title: "D'abord lire les cœurs", line: "Les signes solaires se regroupent dans l'eau (Cancer, Scorpion, Poissons). Vous captez les humeurs de chacun — et les blessures durent aussi." },
  },
  es: {
    [K.flat]: { title: "Aquí se lleva bien todo el mundo", line: "Los cinco se reparten por igual y nadie destaca. Cómodo, y sin nadie que mueva la mesa." },
    [K.woodRich]: { title: "Primero se empieza, luego se ve", line: "Ninguna duda en abrir algo nuevo. Hace falta quien cierre lo abierto." },
    [K.woodThin]: { title: "Una sala sin botón de arranque", line: "Todos capaces y nadie se mueve primero. Decidid de antemano quién abre paso." },
    [K.fireRich]: { title: "Un tren sin frenos", line: "El fuego sube rápido y baja igual de rápido. Pactad cuándo se descansa." },
    [K.fireThin]: { title: "Un hogar apagado", line: "Calma, pero la chispa rara vez prende. Hace falta alguien que suba la temperatura." },
    [K.earthRich]: { title: "Difíciles de tumbar", line: "El centro aguanta pase lo que pase. El precio: perder el momento de empezar." },
    [K.earthThin]: { title: "Se abre todo y no se recoge nada", line: "Ideas por todas partes y poco suelo debajo. Alguien tiene que llevar la casa." },
    [K.metalRich]: { title: "La liga de los principios", line: "Fuertes para ordenar y concluir. Cuidado con los filos: cortan y duran." },
    [K.metalThin]: { title: "Una reunión que nadie cierra", line: "Tanta consideración que no se concluye. Nombrad a quien cierra." },
    [K.waterRich]: { title: "Pensando hasta el amanecer", line: "Gran hondura de mirada. El precio: decisiones que se aplazan." },
    [K.waterThin]: { title: "Se actúa y luego se piensa", line: "Hay empuje, pero falta el segundo pensamiento. Hace falta quien baje la velocidad." },
    "yang": { title: "Siempre hacia fuera", line: "El yang domina con claridad: os movéis rápido y se nota. El precio: poco tiempo para darle vueltas a las cosas." },
    "yin": { title: "Hacia dentro, en hondo", line: "El yin es claramente profundo: construís en silencio. El precio: pocos hablan primero." },
    "trine-0": { title: "Mentes rápidas, una misma corriente", line: "Se juntan los años Mono, Rata y Dragón (el trígono del agua). Rápidos para juzgar y encontrar el camino, e inquietos cuando toca quedarse quietos." },
    "trine-1": { title: "Caras amables, corazones tercos", line: "Se juntan los años Cerdo, Conejo y Cabra (el trígono de la madera). Os adaptáis con cariño, y nadie dice primero lo que duele." },
    "trine-2": { title: "Cuando prenden, hasta el final", line: "Se juntan los años Tigre, Caballo y Perro (el trígono del fuego). Leales y rápidos para empujar, y cuando chocan, chocan fuerte." },
    "trine-3": { title: "Todo revisado hasta el final", line: "Se juntan los años Serpiente, Gallo y Buey (el trígono del metal). Minuciosos e inamovibles una vez decididos, y lentos para arrancar." },
    "astro-fire": { title: "El aplauso más fuerte", line: "Los signos solares se juntan en el fuego (Aries, Leo, Sagitario). Os encendéis con ganas, y os pasáis las tareas aburridas." },
    "astro-earth": { title: "Primero, el plan", line: "Los signos solares se juntan en la tierra (Tauro, Virgo, Capricornio). Prácticos y fiables, y lentos ante una idea improvisada." },
    "astro-air": { title: "La conversación nunca para", line: "Los signos solares se juntan en el aire (Géminis, Libra, Acuario). Las ideas van y vienen, y la acción no alcanza a las palabras." },
    "astro-water": { title: "Primero se leen los corazones", line: "Los signos solares se juntan en el agua (Cáncer, Escorpio, Piscis). Captáis el ánimo de cada uno, y los agravios también duran." },
  },
};

export function groupEpithet(synthesis: GroupSynthesis, locale: string): GroupEpithet {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Locale;
  return GROUP_EPITHET[lang][groupEpithetKey(synthesis)];
}
