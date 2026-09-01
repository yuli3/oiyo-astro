import { useState } from "react";
import { resolveYearStem } from "@/lib/ontology/saju/year-stem";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";
import type { Locale } from "../../i18n";

interface Props { locale: Locale; }

type Element = "Wood" | "Fire" | "Earth" | "Metal" | "Water";
type Tier = "great" | "good" | "mid" | "low" | "poor";
type Category = "overall" | "love" | "money" | "health";

const ELEMENTS_LIST: Element[] = ["Wood", "Fire", "Earth", "Metal", "Water"];
const CATEGORIES: Category[] = ["overall", "love", "money", "health"];
const TIERS: Tier[] = ["great", "good", "mid", "low", "poor"];

const STEM_ELEMENT: Element[] = ["Wood","Wood","Fire","Fire","Earth","Earth","Metal","Metal","Water","Water"];
function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function todaySeed(stemIdx: number): number {
  const d = new Date();
  const dateNum = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return (dateNum * 13 + stemIdx * 7919) >>> 0;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

const ELEM_NAMES: Record<Element, Record<Locale, string>> = {
  Wood:  { ko: "목(木)", en: "Wood 木", ja: "木", zh: "木", fr: "Bois 木", es: "Madera 木" },
  Fire:  { ko: "화(火)", en: "Fire 火", ja: "火", zh: "火", fr: "Feu 火",  es: "Fuego 火" },
  Earth: { ko: "토(土)", en: "Earth 土", ja: "土", zh: "土", fr: "Terre 土", es: "Tierra 土" },
  Metal: { ko: "금(金)", en: "Metal 金", ja: "金", zh: "金", fr: "Métal 金", es: "Metal 金" },
  Water: { ko: "수(水)", en: "Water 水", ja: "水", zh: "水", fr: "Eau 水",  es: "Agua 水" },
};

const ELEM_EMOJIS: Record<Element, string> = { Wood: "🌿", Fire: "🔥", Earth: "🌍", Metal: "⚙️", Water: "💧" };

const ELEM_COLORS: Record<Element, { bg: string; text: string; border: string; star: string }> = {
  Wood:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  star: "text-green-500" },
  Fire:  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    star: "text-red-500" },
  Earth: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  star: "text-amber-500" },
  Metal: { bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-300",   star: "text-gray-500" },
  Water: { bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   star: "text-green-500" },
};

const TIER_STARS: Record<Tier, string> = {
  great: "★★★★★", good: "★★★★☆", mid: "★★★☆☆", low: "★★☆☆☆", poor: "★☆☆☆☆",
};

const CAT_ICONS: Record<Category, string> = { overall: "🔮", love: "❤️", money: "💰", health: "💪" };

const CAT_LABELS: Record<Locale, Record<Category, string>> = {
  ko: { overall: "전체운", love: "애정운", money: "재물운", health: "건강운" },
  en: { overall: "Overall", love: "Love", money: "Money", health: "Health" },
  ja: { overall: "全体運", love: "恋愛運", money: "金運", health: "健康運" },
  zh: { overall: "综合运势", love: "爱情运", money: "财运", health: "健康运" },
  fr: { overall: "Général", love: "Amour", money: "Argent", health: "Santé" },
  es: { overall: "General", love: "Amor", money: "Dinero", health: "Salud" },
};

type EPool = Record<Element, Record<Category, Record<Tier, string[]>>>;

function makeElemPool(fn: (el: Element, cat: Category, tier: Tier) => string[]): EPool {
  const pool = {} as EPool;
  for (const el of ELEMENTS_LIST) {
    pool[el] = {} as Record<Category, Record<Tier, string[]>>;
    for (const cat of CATEGORIES) {
      pool[el][cat] = {} as Record<Tier, string[]>;
      for (const tier of TIERS) {
        pool[el][cat][tier] = fn(el, cat, tier);
      }
    }
  }
  return pool;
}

// ─── Korean fortune texts ──────────────────────────────────────────────────────
const KO_ELEM_FLAVOR: Record<Element, { adj: string; power: string; keyword: string }> = {
  Wood:  { adj: "성장 지향적인", power: "목(木)의 기운", keyword: "창의와 도전" },
  Fire:  { adj: "열정적인",      power: "화(火)의 기운", keyword: "열정과 인기" },
  Earth: { adj: "안정적인",      power: "토(土)의 기운", keyword: "신뢰와 기반" },
  Metal: { adj: "결단력 있는",   power: "금(金)의 기운", keyword: "집중과 성취" },
  Water: { adj: "지혜로운",      power: "수(水)의 기운", keyword: "통찰과 유연" },
};

const koPool = makeElemPool((el, cat, tier) => {
  const { adj, power, keyword } = KO_ELEM_FLAVOR[el];
  const pools: Record<Category, Record<Tier, string[]>> = {
    overall: {
      great: [
        `${power}이 최고조입니다! ${keyword}의 에너지가 넘쳐 모든 일이 뜻대로 풀립니다.`,
        `${adj} 기운이 빛나는 날입니다. 새로운 도전에 과감하게 나서세요.`,
        `오늘은 운이 강하게 돕습니다. 중요한 일을 시작하기에 최적입니다.`,
      ],
      good: [
        `${power}이 좋은 흐름을 보입니다. 자신감을 갖고 앞으로 나아가세요.`,
        `${adj} 기운이 하루를 긍정적으로 이끕니다. 목표를 향해 꾸준히 나아가세요.`,
        `좋은 기회가 찾아오는 날입니다. 놓치지 마세요.`,
      ],
      mid: [
        `${power}이 평온하게 흐릅니다. 꾸준한 노력이 힘을 발휘하는 날입니다.`,
        `무리하지 않고 안정적으로 하루를 보내기에 좋습니다.`,
        `큰 변화보다 일상의 충실함이 빛나는 날입니다.`,
      ],
      low: [
        `${power}이 약해진 날입니다. 중요한 결정은 미루고 에너지를 아껴두세요.`,
        `오늘은 조용히 관찰하며 때를 기다리는 것이 현명합니다.`,
        `무리한 시도보다 현상 유지에 집중하세요.`,
      ],
      poor: [
        `${power}이 많이 떨어진 날입니다. 안정을 취하며 재충전에 집중하세요.`,
        `어려운 기운이 감돕니다. 도전보다 수성이 현명한 날입니다.`,
        `인내심을 갖고 이 시기를 지혜롭게 헤쳐나가세요.`,
      ],
    },
    love: {
      great: [
        `${adj} 매력이 최고조입니다! 고백이나 특별한 만남을 계획해 보세요.`,
        `사랑하는 사람과의 관계가 한층 깊어지는 날입니다.`,
        `새로운 인연이 찾아올 가능성이 높습니다. 마음을 열어두세요.`,
      ],
      good: [
        `애정운이 좋습니다. 솔직한 감정 표현이 관계를 발전시킵니다.`,
        `따뜻한 사랑의 기운이 흐릅니다. 가까운 사람에게 감사를 전해보세요.`,
        `상대방과의 이해가 깊어지는 하루입니다.`,
      ],
      mid: [
        `애정운은 평범합니다. 일상적인 다정함으로 충분한 날입니다.`,
        `큰 변화보다 소소한 관심이 빛나는 날입니다.`,
        `상대방의 말에 귀 기울이는 것이 관계를 지켜줍니다.`,
      ],
      low: [
        `오해가 생기기 쉬운 날입니다. 신중하게 말하고 상대방의 말을 잘 들으세요.`,
        `감정적인 결정은 자제하고 차분함을 유지하세요.`,
        `혼자만의 시간을 가지며 마음을 정리하는 것이 도움이 됩니다.`,
      ],
      poor: [
        `연애운이 많이 낮습니다. 무리한 시도는 역효과가 날 수 있습니다.`,
        `갈등을 피하고 잠시 거리를 두는 것이 현명합니다.`,
        `오늘은 자기 자신을 돌보는 날로 삼으세요.`,
      ],
    },
    money: {
      great: [
        `재물운이 대길합니다! 투자나 중요한 계약을 진행하기 좋은 날입니다.`,
        `기대치 않던 수입이나 좋은 기회가 찾아올 수 있습니다.`,
        `금전적으로 유리한 흐름입니다. 과감하게 기회를 잡으세요.`,
      ],
      good: [
        `재물운이 좋습니다. 합리적인 소비와 투자를 고려해 보세요.`,
        `금전적 긍정 에너지가 흐릅니다. 재정 계획을 세우기 좋은 날입니다.`,
        `수입과 지출의 균형이 잘 맞는 하루가 될 것입니다.`,
      ],
      mid: [
        `재물운은 평범합니다. 불필요한 지출을 줄이고 절약에 신경 쓰세요.`,
        `현상 유지가 최선인 날입니다. 큰 변화는 피하세요.`,
        `오늘은 재정 점검을 하기에 좋은 날입니다.`,
      ],
      low: [
        `재물운이 약합니다. 큰 지출이나 투자는 미루는 것이 좋습니다.`,
        `예상치 못한 지출이 생길 수 있으니 여유 자금을 확인하세요.`,
        `충동구매는 피하고 검소하게 하루를 보내세요.`,
      ],
      poor: [
        `재물운이 매우 좋지 않습니다. 금전 거래를 최소화하세요.`,
        `사기나 손실에 주의하고 중요한 재정 결정은 미루세요.`,
        `오늘은 지갑을 닫고 방어적인 자세를 유지하세요.`,
      ],
    },
    health: {
      great: [
        `건강운이 최상입니다! 활발한 운동이나 새로운 건강 루틴을 시작해 보세요.`,
        `몸과 마음이 최상의 상태입니다. 에너지가 넘치는 하루를 보내세요.`,
        `오래 미뤄온 건강 검진이나 운동 계획을 실천하기에 좋은 날입니다.`,
      ],
      good: [
        `건강운이 좋습니다. 규칙적인 운동과 균형 잡힌 식사를 유지하세요.`,
        `활기찬 하루를 보낼 수 있습니다. 좋은 컨디션을 적극 활용하세요.`,
        `수분 섭취와 가벼운 스트레칭이 도움이 되는 날입니다.`,
      ],
      mid: [
        `건강운은 보통입니다. 규칙적인 생활 습관을 유지하세요.`,
        `특별한 문제는 없지만 충분한 휴식을 취하는 것이 좋습니다.`,
        `과로를 피하고 몸의 신호에 귀 기울이세요.`,
      ],
      low: [
        `건강운이 다소 낮습니다. 과격한 운동은 피하고 충분히 쉬세요.`,
        `스트레스 관리에 특별히 신경 쓰는 날입니다.`,
        `따뜻한 음식과 충분한 수면으로 몸을 돌보세요.`,
      ],
      poor: [
        `건강에 주의가 필요한 날입니다. 무리는 절대 금물입니다.`,
        `면역력이 약해질 수 있습니다. 따뜻하게 입고 충분히 쉬세요.`,
        `오늘은 안정을 취하며 몸을 회복시키는 것이 최선입니다.`,
      ],
    },
  };
  return pools[cat][tier];
});

// ─── English ──────────────────────────────────────────────────────────────────
const EN_ELEM_FLAVOR: Record<Element, { adj: string; power: string; theme: string }> = {
  Wood:  { adj: "growth-oriented", power: "Wood energy", theme: "creativity and new beginnings" },
  Fire:  { adj: "passionate",      power: "Fire energy", theme: "passion and charisma" },
  Earth: { adj: "grounded",        power: "Earth energy", theme: "stability and trust" },
  Metal: { adj: "decisive",        power: "Metal energy", theme: "focus and achievement" },
  Water: { adj: "wise",            power: "Water energy", theme: "wisdom and flow" },
};

const enPool = makeElemPool((el, cat, tier) => {
  const { adj, power, theme } = EN_ELEM_FLAVOR[el];
  const pools: Record<Category, Record<Tier, string[]>> = {
    overall: {
      great: [`${power} is at its peak! ${theme} flows through everything you do today.`,`Your ${adj} nature shines bright. Take bold action — the universe supports you.`,`A rare high-luck day. Move confidently toward what matters most.`],
      good:  [`Good ${power} today. Pursue your goals with steady confidence.`,`Positive momentum supports your ${adj} spirit. Make the most of it.`,`A favorable day for progress. Trust your instincts.`],
      mid:   [`${power} flows calmly. Consistency beats ambition today.`,`A steady, unremarkable day. Stay grounded and patient.`,`Moderate energy — focus on routine tasks and small wins.`],
      low:   [`${power} dips today. Save bold moves for a better day.`,`Energy feels scattered. Stick to essentials and conserve your strength.`,`Not ideal for major decisions. Observe and gather information.`],
      poor:  [`${power} is at its low point. Rest and recover today.`,`Challenges may arise — stay resilient and play it safe.`,`A day for quiet reflection, not bold action. Recharge for better days.`],
    },
    love: {
      great: [`Your ${adj} charm is irresistible today! Perfect time for confessions or dates.`,`Deep emotional bonds form effortlessly. Share your feelings openly.`,`A new connection could change everything. Stay open and receptive.`],
      good:  [`Love flows warmly today. Express gratitude to those you care about.`,`Heartfelt conversations deepen your connections.`,`Quality time with a loved one brings joy and closeness.`],
      mid:   [`Love energy is steady. Simple affection goes a long way today.`,`No dramatic moments — just comfortable, warm connection.`,`Your relationship is stable. Appreciate the quiet moments.`],
      low:   [`Misunderstandings may arise. Listen more than you speak today.`,`Emotions are sensitive — avoid confrontations and heated discussions.`,`Take time for yourself. Solitude and reflection help more than chasing connection.`],
      poor:  [`Love fortune is very low. Avoid risky romantic moves today.`,`Miscommunication risk is high. Think carefully before you speak.`,`Step back from relationship pressures. Focus on self-care today.`],
    },
    money: {
      great: [`${power} brings financial luck! Seize investment opportunities or close important deals.`,`Unexpected income or a great offer may arrive today.`,`Money flows in your direction. Act strategically and boldly.`],
      good:  [`Good financial energy today. Smart spending leads to gains.`,`A pleasant financial surprise may be waiting.`,`Income and outflow balance nicely. A stable, positive day.`],
      mid:   [`Financial energy is average. Avoid unnecessary spending.`,`Maintain your budget and focus on saving over spending.`,`Review your finances calmly. Plan for the future.`],
      low:   [`Be cautious with money today. Delay major purchases or investments.`,`Financial energy is weak. Double-check all transactions.`,`Avoid lending money or making new financial commitments today.`],
      poor:  [`Financial fortune is very low. Play defense today.`,`Risk of loss is elevated — avoid gambling or speculation.`,`Keep spending to a minimum. Protect what you have.`],
    },
    health: {
      great: [`Health is at its peak! Start a new fitness routine or health practice.`,`Body and mind are in perfect harmony. Enjoy vigorous activity.`,`Vitality surges — a great day for a health check-up or outdoor exercise.`],
      good:  [`Health energy is good. Keep up your healthy habits.`,`Light and energetic today — make the most of this feeling.`,`Moderate exercise and good sleep amplify your well-being.`],
      mid:   [`Health is average. Stick to your routine and rest when tired.`,`No major concerns — avoid overexertion and stay hydrated.`,`Balance activity with adequate rest today.`],
      low:   [`Health energy is low. Skip intense workouts and rest instead.`,`Pay attention to stress management — your body needs gentleness today.`,`Nourish yourself with warm food and get to bed early.`],
      poor:  [`Health warning signs today. Rest fully and avoid all strain.`,`Immune defenses may be down. Dress warmly and avoid crowded places.`,`Listen to your body carefully — it's asking for rest and recovery.`],
    },
  };
  return pools[cat][tier];
});

// ─── Japanese template ─────────────────────────────────────────────────────────
const jaTpl: Record<Category, Record<Tier, (n: string) => string[]>> = {
  overall: {
    great: (n) => [`${n}のエネルギーが最高潮！今日は積極的に動いて大きな成果を掴みましょう。`,`${n}の気が輝いています。新しい挑戦に果敢に臨む日です。`,`運勢が強くあなたを後押しします。重要なことを始めるのに最適。`],
    good:  (n) => [`${n}の流れが良好です。自信を持って前進しましょう。`,`ポジティブな気運が一日を包みます。チャンスを逃さないで。`,`目標に向かって着実に進める日です。`],
    mid:   (n) => [`${n}の気が穏やかに流れています。着実な努力が輝く日。`,`無理せず安定した一日を過ごすのに良い日です。`,`大きな変化より日常の充実が大切な日です。`],
    low:   (n) => [`${n}の気が弱まった日。重要な決断は先送りにしましょう。`,`静かに観察しながら時を待つのが賢明です。`,`現状維持に集中してエネルギーを蓄えましょう。`],
    poor:  (n) => [`${n}の気がかなり下がっています。安静にして充電しましょう。`,`困難な気が漂います。守りに徹するのが賢明な日。`,`忍耐を持ってこの時期を乗り越えてください。`],
  },
  love: {
    great: (n) => [`${n}の魅力が最高潮！告白や特別な出会いの計画をしましょう。`,`愛する人との関係が一層深まる日です。`,`新しい縁が訪れる可能性が高いです。心を開いておきましょう。`],
    good:  (n) => [`恋愛運が良好です。素直な感情表現が関係を発展させます。`,`温かな愛のエネルギーが流れています。感謝を伝えてみましょう。`,`相手への理解が深まる一日です。`],
    mid:   (n) => [`恋愛運は平凡です。日常的な優しさで十分な日。`,`小さな気遣いが関係を守ってくれます。`,`相手の言葉にしっかり耳を傾けましょう。`],
    low:   (n) => [`誤解が生じやすい日です。慎重に言葉を選びましょう。`,`感情的な決断は控え、落ち着きを保ちましょう。`,`一人の時間を持ち、心を整理することが助けになります。`],
    poor:  (n) => [`恋愛運がかなり低い日。無理な試みは逆効果です。`,`衝突を避け、少し距離を置くのが賢明です。`,`今日は自分自身を大切にする日にしましょう。`],
  },
  money: {
    great: (n) => [`${n}の財運が大吉！投資や重要な契約を進めるのに良い日。`,`予期せぬ収入や良い機会が訪れるかもしれません。`,`金銭的に有利な流れです。チャンスを積極的に掴みましょう。`],
    good:  (n) => [`財運が良好です。合理的な消費と投資を検討してみましょう。`,`金銭的なポジティブエネルギーが流れています。`,`収支のバランスが取れた良い一日になるでしょう。`],
    mid:   (n) => [`財運は普通です。不要な出費を減らし節約を心がけましょう。`,`現状維持が最善な日。大きな変化は避けて。`,`今日は財政の見直しをするのに良い日です。`],
    low:   (n) => [`財運が弱い日。大きな支出や投資は延期しましょう。`,`予期せぬ出費に備えて余裕資金を確認してください。`,`衝動買いを避け、質素に過ごしましょう。`],
    poor:  (n) => [`財運がとても低い日。金銭取引は最小限にしましょう。`,`詐欺や損失に注意して、重要な財政決断は延期を。`,`今日は財布を閉じて守りの姿勢を保ちましょう。`],
  },
  health: {
    great: (n) => [`健康運が最高！活発な運動や新しい健康ルーティンを始めましょう。`,`心身ともに最高の状態です。エネルギーに満ちた一日を。`,`ずっと先延ばしにしていた健康診断や運動計画を実践する日。`],
    good:  (n) => [`健康運が良好です。定期的な運動とバランスの取れた食事を続けましょう。`,`活気に満ちた一日。良いコンディションを最大限に活用して。`,`水分補給と軽いストレッチが今日の体に良いです。`],
    mid:   (n) => [`健康運は普通。規則正しい生活習慣を維持しましょう。`,`特別な問題はありませんが、十分な休息を取るのが良いです。`,`過労を避けて体のサインに耳を傾けましょう。`],
    low:   (n) => [`健康運がやや低下。激しい運動は避けて十分に休みましょう。`,`ストレス管理に特に気をつける日です。`,`温かい食事と十分な睡眠で体を労わってください。`],
    poor:  (n) => [`健康に注意が必要な日。無理は絶対に禁物です。`,`免疫力が低下するかもしれません。暖かくして十分に休んで。`,`今日は安静にして体を回復させることが最善です。`],
  },
};

// ─── Chinese Simplified ────────────────────────────────────────────────────────
const zhTpl: Record<Category, Record<Tier, (n: string) => string[]>> = {
  overall: {
    great: (n) => [`${n}之气达到顶峰！今天积极行动，收获丰硕成果。`,`${n}光芒四射，勇于挑战，是开创新事的最佳时机。`,`今天运势强劲地支持你，是展开重要事项的最佳日子。`],
    good:  (n) => [`${n}运势良好，充满自信地前进吧。`,`积极的气运环绕你一整天，抓住每个机会。`,`朝着目标稳步迈进的好日子。`],
    mid:   (n) => [`${n}之气平稳流动，踏实努力才是正道。`,`平稳度过一天，安稳生活是今天的关键。`,`与其大动，不如专注日常充实。`],
    low:   (n) => [`${n}之气减弱，重要决定应延后，积蓄能量。`,`静观其变，等待时机才是明智之举。`,`专注维持现状，保存实力。`],
    poor:  (n) => [`${n}之气大幅下降，静养充电是今天的主旋律。`,`艰难的气场环绕，以守为攻才是上策。`,`保持耐心，智慧地度过这段时期。`],
  },
  love: {
    great: (n) => [`${n}的魅力达到顶峰！告白或特别约会正当其时。`,`与所爱之人的关系将更加深厚。`,`新缘分到来的可能性很高，保持开放的心态。`],
    good:  (n) => [`感情运良好，坦诚表达感情有助于关系发展。`,`温暖的爱意流淌，向身边的人传达感谢吧。`,`彼此理解加深的一天。`],
    mid:   (n) => [`感情运平平，日常的温柔足以维系关系。`,`细小的关心能守护好关系。`,`认真倾听对方的话语是关键。`],
    low:   (n) => [`容易产生误解，措辞需谨慎。`,`避免感情冲动，保持冷静。`,`独处片刻整理心情会有所帮助。`],
    poor:  (n) => [`感情运较低，勉强尝试可能适得其反。`,`避免冲突，保持适当距离是明智之举。`,`今天以关爱自己为主吧。`],
  },
  money: {
    great: (n) => [`${n}财运大吉！适合推进投资或重要合同。`,`可能迎来意外收入或好机会。`,`财务上处于有利态势，积极把握机会。`],
    good:  (n) => [`财运良好，考虑合理消费与投资。`,`财务正能量流动，适合制定财务计划。`,`收支均衡的美好一天。`],
    mid:   (n) => [`财运普通，减少不必要支出，注意节约。`,`维持现状是今天的最佳策略。`,`今天适合进行财务检查。`],
    low:   (n) => [`财运偏弱，大额支出或投资应延后。`,`留意意外支出，确认备用资金。`,`避免冲动消费，节俭度过今天。`],
    poor:  (n) => [`财运极低，尽量减少金融交易。`,`谨防诈骗或损失，重要财务决定应延后。`,`今天关闭钱包，保持守势。`],
  },
  health: {
    great: (n) => [`健康运最佳！开始积极运动或新的健康习惯吧。`,`身心俱佳，活力充沛的一天。`,`今天是付诸实践一直拖延的健康计划的好日子。`],
    good:  (n) => [`健康运良好，保持规律运动和均衡饮食。`,`精力充沛的一天，充分利用好状态。`,`补充水分和轻度拉伸对今天的身体大有裨益。`],
    mid:   (n) => [`健康运普通，保持规律生活习惯。`,`没有特别问题，但充足休息是关键。`,`避免过劳，倾听身体的信号。`],
    low:   (n) => [`健康运略低，避免剧烈运动，充分休息。`,`特别注意管理压力的一天。`,`用温热食物和充足睡眠来照顾好自己。`],
    poor:  (n) => [`健康需要格外注意，切勿勉强。`,`免疫力可能下降，注意保暖，充分休息。`,`今天静养恢复身体是最佳选择。`],
  },
};

// ─── French template ───────────────────────────────────────────────────────────
const frTpl: Record<Category, Record<Tier, (n: string) => string[]>> = {
  overall: {
    great: (n) => [`L'énergie ${n} est au sommet aujourd'hui ! Passez à l'action et récoltez les fruits.`,`Le ${n} rayonne. C'est le moment idéal pour relever de nouveaux défis.`,`La chance vous soutient fortement. Commencez ce qui compte le plus.`],
    good:  (n) => [`L'énergie ${n} est favorable. Avancez avec confiance.`,`Une dynamique positive entoure votre journée. Saisissez les opportunités.`,`Une bonne journée pour progresser vers vos objectifs.`],
    mid:   (n) => [`L'énergie ${n} coule paisiblement. La constance prime sur l'ambition aujourd'hui.`,`Une journée stable — restez ancré(e) et patient(e).`,`Concentrez-vous sur les tâches quotidiennes et les petites victoires.`],
    low:   (n) => [`L'énergie ${n} faiblit aujourd'hui. Gardez les grands gestes pour un meilleur jour.`,`L'énergie semble dispersée. Restez concentré(e) sur l'essentiel.`,`Pas idéal pour les grandes décisions. Observez et recueillez des informations.`],
    poor:  (n) => [`L'énergie ${n} est au plus bas. Reposez-vous et rechargez vos batteries.`,`Des défis peuvent surgir — restez résilient(e) et jouez la sécurité.`,`Une journée de réflexion calme. Préparez-vous pour de meilleurs jours.`],
  },
  love: {
    great: (n) => [`Votre charme ${n} est irrésistible ! Parfait pour les confessions ou les rendez-vous.`,`Des liens profonds se forment sans effort. Exprimez vos sentiments ouvertement.`,`Une nouvelle connexion pourrait tout changer. Restez ouvert(e).`],
    good:  (n) => [`L'amour coule chaleureusement aujourd'hui. Exprimez votre gratitude.`,`Des conversations sincères approfondissent vos liens.`,`Du temps de qualité avec un être cher apporte joie et proximité.`],
    mid:   (n) => [`L'énergie amoureuse est stable. La simple affection fait beaucoup.`,`Pas de moments dramatiques — juste une connexion confortable et chaleureuse.`,`Appréciez les moments calmes ensemble.`],
    low:   (n) => [`Des malentendus peuvent surgir. Écoutez plus que vous ne parlez.`,`Les émotions sont sensibles — évitez les confrontations.`,`Prenez du temps pour vous. La solitude aide plus que de courir après les connexions.`],
    poor:  (n) => [`La fortune amoureuse est très basse. Évitez les gestes romantiques risqués.`,`Le risque de mauvaise communication est élevé. Réfléchissez avant de parler.`,`Éloignez-vous des pressions relationnelles. Prenez soin de vous aujourd'hui.`],
  },
  money: {
    great: (n) => [`L'énergie ${n} apporte de la chance financière ! Saisissez les opportunités.`,`Un revenu inattendu ou une excellente offre peut arriver.`,`L'argent coule dans votre direction. Agissez stratégiquement.`],
    good:  (n) => [`Bonne énergie financière. Une dépense intelligente mène à des gains.`,`Une agréable surprise financière peut vous attendre.`,`Les revenus et les dépenses s'équilibrent bien.`],
    mid:   (n) => [`L'énergie financière est moyenne. Évitez les dépenses inutiles.`,`Maintenez votre budget et concentrez-vous sur les économies.`,`Examinez calmement vos finances et planifiez.`],
    low:   (n) => [`Soyez prudent(e) avec l'argent. Retardez les achats ou investissements majeurs.`,`L'énergie financière est faible. Vérifiez bien toutes les transactions.`,`Évitez de prêter de l'argent ou de nouveaux engagements financiers.`],
    poor:  (n) => [`La fortune financière est très basse. Adoptez une posture défensive.`,`Le risque de perte est élevé — évitez le jeu ou la spéculation.`,`Limitez vos dépenses au minimum. Protégez ce que vous avez.`],
  },
  health: {
    great: (n) => [`La santé est au sommet ! Commencez une nouvelle routine de fitness ou pratique de santé.`,`Le corps et l'esprit sont en harmonie parfaite. Profitez d'une activité vigoureuse.`,`La vitalité déborde — parfait pour un bilan de santé ou de l'exercice en plein air.`],
    good:  (n) => [`La santé est en bonne forme. Maintenez vos habitudes saines.`,`Léger(ère) et énergique — profitez au maximum de cette sensation.`,`Un exercice modéré et un bon sommeil amplifient votre bien-être.`],
    mid:   (n) => [`La santé est moyenne. Respectez votre routine et reposez-vous quand fatigué(e).`,`Pas de préoccupations majeures — évitez l'excès d'effort.`,`Équilibrez l'activité avec un repos adéquat.`],
    low:   (n) => [`L'énergie de santé est faible. Sautez les entraînements intenses et reposez-vous.`,`Gérez votre stress — votre corps a besoin de douceur aujourd'hui.`,`Nourrissez-vous d'aliments chauds et couchez-vous tôt.`],
    poor:  (n) => [`Des signaux d'alerte santé aujourd'hui. Reposez-vous pleinement.`,`Les défenses immunitaires peuvent être basses. Habillez-vous chaudement.`,`Écoutez attentivement votre corps — il demande du repos et de la récupération.`],
  },
};

// ─── Spanish template ──────────────────────────────────────────────────────────
const esTpl: Record<Category, Record<Tier, (n: string) => string[]>> = {
  overall: {
    great: (n) => [`¡La energía ${n} está en su punto máximo hoy! Actúa con valentía.`,`Tu naturaleza ${n} brilla intensamente. Da el primer paso sin dudar.`,`La suerte te apoya fuertemente. Comienza lo que más importa.`],
    good:  (n) => [`La energía ${n} es favorable hoy. Avanza con confianza.`,`El impulso positivo envuelve tu día. No dejes escapar las oportunidades.`,`Un buen día para progresar hacia tus objetivos.`],
    mid:   (n) => [`La energía ${n} fluye tranquilamente. La constancia es clave hoy.`,`Un día estable — mantente arraigado/a y paciente.`,`Concéntrate en las tareas cotidianas y en los pequeños logros.`],
    low:   (n) => [`La energía ${n} disminuye hoy. Guarda los grandes movimientos para un mejor día.`,`La energía parece dispersa. Quédate con lo esencial.`,`No ideal para grandes decisiones. Observa y recoge información.`],
    poor:  (n) => [`La energía ${n} está en su punto más bajo. Descansa y recupérate.`,`Pueden surgir desafíos — mantente resiliente y juega a lo seguro.`,`Un día de reflexión tranquila. Prepárate para días mejores.`],
  },
  love: {
    great: (n) => [`¡Tu encanto ${n} es irresistible hoy! Perfecto para confesiones o citas.`,`Los lazos profundos se forman sin esfuerzo. Expresa tus sentimientos abiertamente.`,`Una nueva conexión podría cambiarlo todo. Permanece abierto/a.`],
    good:  (n) => [`El amor fluye cálidamente hoy. Expresa tu gratitud.`,`Las conversaciones sinceras profundizan tus vínculos.`,`El tiempo de calidad con un ser querido trae alegría y cercanía.`],
    mid:   (n) => [`La energía amorosa es estable. El simple afecto recorre un largo camino.`,`Sin momentos dramáticos — solo una conexión cómoda y cálida.`,`Aprecia los momentos tranquilos juntos.`],
    low:   (n) => [`Pueden surgir malentendidos. Escucha más de lo que hablas.`,`Las emociones son sensibles — evita las confrontaciones.`,`Tómate tiempo para ti. La soledad ayuda más que perseguir conexiones.`],
    poor:  (n) => [`La fortuna amorosa es muy baja. Evita los movimientos románticos arriesgados.`,`El riesgo de mala comunicación es alto. Piensa antes de hablar.`,`Aléjate de las presiones relacionales. Cuídate hoy.`],
  },
  money: {
    great: (n) => [`¡La energía ${n} trae suerte financiera! Aprovecha las oportunidades de inversión.`,`Pueden llegarte ingresos inesperados o una excelente oferta.`,`El dinero fluye en tu dirección. Actúa estratégicamente.`],
    good:  (n) => [`Buena energía financiera hoy. El gasto inteligente lleva a ganancias.`,`Puede estar esperándote una agradable sorpresa financiera.`,`Ingresos y gastos se equilibran bien.`],
    mid:   (n) => [`La energía financiera es promedio. Evita el gasto innecesario.`,`Mantén tu presupuesto y concéntrate en ahorrar.`,`Revisa tus finanzas con calma y planifica.`],
    low:   (n) => [`Ten cuidado con el dinero hoy. Pospón las compras o inversiones importantes.`,`La energía financiera es débil. Verifica bien todas las transacciones.`,`Evita prestar dinero o hacer nuevos compromisos financieros.`],
    poor:  (n) => [`La fortuna financiera es muy baja hoy. Adopta una postura defensiva.`,`El riesgo de pérdida es elevado — evita apuestas o especulaciones.`,`Limita tus gastos al mínimo. Protege lo que tienes.`],
  },
  health: {
    great: (n) => [`¡La salud está en su punto máximo! Comienza una nueva rutina de fitness.`,`Cuerpo y mente en perfecta armonía. Disfruta de la actividad vigorosa.`,`La vitalidad se desborda — perfecto para un chequeo de salud o ejercicio al aire libre.`],
    good:  (n) => [`La salud está en buena forma. Mantén tus hábitos saludables.`,`Ligero/a y enérgico/a hoy — aprovecha al máximo esta sensación.`,`El ejercicio moderado y el buen sueño amplifican tu bienestar.`],
    mid:   (n) => [`La salud es promedio. Sigue tu rutina y descansa cuando estés cansado/a.`,`Sin grandes preocupaciones — evita el exceso de esfuerzo.`,`Equilibra la actividad con el descanso adecuado.`],
    low:   (n) => [`La energía de salud es baja. Omite los entrenamientos intensos y descansa.`,`Gestiona el estrés — tu cuerpo necesita gentileza hoy.`,`Aliméntate con comidas calientes y acuéstate temprano.`],
    poor:  (n) => [`Señales de advertencia de salud hoy. Descansa completamente.`,`Las defensas inmunes pueden estar bajas. Vístete abrigado/a.`,`Escucha atentamente a tu cuerpo — pide descanso y recuperación.`],
  },
};

// ─── Build all locale pools ────────────────────────────────────────────────────
const ALL_POOLS: Record<Locale, EPool> = (() => {
  function makeFromTpl(tpl: Record<Category, Record<Tier, (n: string) => string[]>>, names: Record<Element, string>): EPool {
    return makeElemPool((el, cat, tier) => tpl[cat][tier](names[el]));
  }
  const jaNames: Record<Element, string> = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" };
  const zhNames: Record<Element, string> = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" };
  const frNames: Record<Element, string> = { Wood: "Bois", Fire: "Feu", Earth: "Terre", Metal: "Métal", Water: "Eau" };
  const esNames: Record<Element, string> = { Wood: "Madera", Fire: "Fuego", Earth: "Tierra", Metal: "Metal", Water: "Agua" };
  return {
    ko: koPool,
    en: enPool,
    ja: makeFromTpl(jaTpl, jaNames),
    zh: makeFromTpl(zhTpl, zhNames),
    fr: makeFromTpl(frTpl, frNames),
    es: makeFromTpl(esTpl, esNames),
  };
})();

// ─── UI labels ────────────────────────────────────────────────────────────────
const UI: Record<Locale, {
  title: string; subtitle: string;
  birthYear: string; calcBtn: string; resetBtn: string;
  stemLabel: string; elemLabel: string;
  todayLabel: string;
  yearOnlyNote: string;
}> = {
  ko: { title: "사주 오늘의 운세", subtitle: "생년으로 보는 오행 기반 오늘 운세", birthYear: "태어난 해", calcBtn: "운세 보기", resetBtn: "초기화", stemLabel: "연주(年柱)", elemLabel: "주요 오행", todayLabel: "오늘", yearOnlyNote: "태어난 해만으로 계산했습니다. 사주의 연주는 입춘(2월 4일 무렵)에 바뀌므로, 1~2월 초 출생이면 실제와 다를 수 있습니다. 정확한 값은 사주 계산기에서 생년월일로 확인하세요." },
  en: { title: "Saju Daily Fortune", subtitle: "Today's fortune based on your birth year element", birthYear: "Birth Year", calcBtn: "Read Fortune", resetBtn: "Reset", stemLabel: "Year Pillar", elemLabel: "Element", todayLabel: "Today", yearOnlyNote: "Calculated from the birth year alone. The Saju year pillar turns at Ipchun (around February 4), so a birth in January or early February may differ. Use the Saju calculator with a full birth date for the accurate value." },
  ja: { title: "四柱今日の運勢", subtitle: "生まれ年の五行に基づく今日の運勢", birthYear: "生まれ年", calcBtn: "運勢を見る", resetBtn: "リセット", stemLabel: "年柱", elemLabel: "主要五行", todayLabel: "今日", yearOnlyNote: "生まれ年のみで計算しました。四柱の年柱は立春（2月4日頃）に変わるため、1月〜2月初旬生まれは実際と異なる場合があります。正確な値は四柱計算機で生年月日からご確認ください。" },
  zh: { title: "四柱今日运势", subtitle: "根据出生年份五行推算今日运势", birthYear: "出生年份", calcBtn: "查看运势", resetBtn: "重置", stemLabel: "年柱", elemLabel: "五行", todayLabel: "今天", yearOnlyNote: "仅根据出生年份计算。四柱的年柱在立春（2月4日前后）更替，因此1月至2月初出生者可能与实际不同。请在四柱计算器中输入完整出生日期以获得准确值。" },
  fr: { title: "Fortune Saju du Jour", subtitle: "Fortune du jour basée sur l'élément de votre année de naissance", birthYear: "Année de naissance", calcBtn: "Lire la fortune", resetBtn: "Réinitialiser", stemLabel: "Pilier Année", elemLabel: "Élément", todayLabel: "Aujourd'hui", yearOnlyNote: "Calculé à partir de la seule année de naissance. Le pilier de l’année change à Ipchun (vers le 4 février) : une naissance en janvier ou début février peut donc différer. Utilisez le calculateur Saju avec la date complète." },
  es: { title: "Fortuna Saju del Día", subtitle: "Fortuna de hoy basada en el elemento de tu año de nacimiento", birthYear: "Año de nacimiento", calcBtn: "Leer fortuna", resetBtn: "Reiniciar", stemLabel: "Pilar Año", elemLabel: "Elemento", todayLabel: "Hoy", yearOnlyNote: "Calculado solo con el año de nacimiento. El pilar del año cambia en Ipchun (hacia el 4 de febrero), así que un nacimiento en enero o principios de febrero puede diferir. Usa la calculadora Saju con la fecha completa." },
};

const STEM_NAMES: Record<Locale, string[]> = {
  ko: ['갑','을','병','정','무','기','경','신','임','계'],
  en: ['Jiǎ','Yǐ','Bǐng','Dīng','Wù','Jǐ','Gēng','Xīn','Rén','Guǐ'],
  ja: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  zh: ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'],
  fr: ['Jiǎ','Yǐ','Bǐng','Dīng','Wù','Jǐ','Gēng','Xīn','Rén','Guǐ'],
  es: ['Jiǎ','Yǐ','Bǐng','Dīng','Wù','Jǐ','Gēng','Xīn','Rén','Guǐ'],
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SajuFortune({ locale }: Props) {
  const ui = UI[locale] ?? UI.en;
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | null>(null);
  // 프로필에 생년월일이 있으면 연주를 절기 기준으로 정확히 낸다. 없으면 연도만
  // 쓰므로 입춘 경계(1/1~2/4 출생)가 적용되지 않고, 그 사실을 결과에 알린다.
  const { parsed } = useProfilePrefill();
  const [result, setResult] = useState<{ el: Element; stemIdx: number; solarAccurate: boolean; fortunes: Record<Category, { tier: Tier; text: string }> } | null>(null);
  const [today, setToday] = useState("");

  const yearOptions = Array.from({ length: currentYear - 1923 }, (_, i) => currentYear - i);

  function calculate() {
    if (!year) return;
    const { stemIdx, solarAccurate } = resolveYearStem(year, parsed);
    const el = STEM_ELEMENT[stemIdx];
    const rand = seededRand(todaySeed(stemIdx));
    const pool = ALL_POOLS[locale] ?? ALL_POOLS.en;

    const fortunes = {} as Record<Category, { tier: Tier; text: string }>;
    for (const cat of CATEGORIES) {
      const tierIdx = Math.floor(rand() * 5);
      const tier = TIERS[tierIdx];
      const texts = pool[el][cat][tier];
      const text = texts[Math.floor(rand() * texts.length)];
      fortunes[cat] = { tier, text };
    }
    setResult({ el, stemIdx, solarAccurate, fortunes });
    setToday(getToday());
  }

  const colors = result ? ELEM_COLORS[result.el] : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">{ui.title}</h1>
        <p className="text-sm text-gray-500">{ui.subtitle}</p>
      </div>

      {!result ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">{ui.birthYear}</label>
          <select
            value={year ?? ""}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="">—</option>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={calculate}
            disabled={!year}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {ui.calcBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Element badge */}
          <div className={`${colors!.bg} ${colors!.border} border rounded-2xl p-5 text-center space-y-2`}>
            <div className="text-4xl">{ELEM_EMOJIS[result.el]}</div>
            <div className={`text-2xl font-bold ${colors!.text}`}>{ELEM_NAMES[result.el][locale]}</div>
            <div className="text-sm text-gray-500">
              {ui.stemLabel}: {STEM_NAMES[locale][result.stemIdx]}({year}) &nbsp;|&nbsp; {ui.todayLabel}: {today}
            </div>
          </div>

            {!result.solarAccurate && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">
                {ui.yearOnlyNote}
              </p>
            )}
          {/* Fortune cards */}
          {CATEGORIES.map((cat) => {
            const { tier, text } = result.fortunes[cat];
            return (
              <div key={cat} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    {CAT_ICONS[cat]} {CAT_LABELS[locale][cat]}
                  </span>
                  <span className={`text-sm font-mono ${colors!.star}`}>{TIER_STARS[tier]}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
              </div>
            );
          })}

          <button
            onClick={() => { setResult(null); setYear(null); }}
            className="w-full border border-gray-300 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            {ui.resetBtn}
          </button>
        </div>
      )}
    </div>
  );
}
