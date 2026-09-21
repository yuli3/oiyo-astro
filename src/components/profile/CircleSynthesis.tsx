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
import { GROUP_ELEMENT_ORDER, type GroupSynthesis } from "@/lib/symbolic-tradition/group-synthesis";
import { ELEMENT_SYMBOLS } from "@/lib/talisman/symbols";
import type { FiveElement } from "@/lib/ontology/saju/types";

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
    title: "우리 기운",
    lead: "모인 사람들의 좌표를 한데 합쳐 읽었어요. 점수도 순위도 없어요.",
    abundant: "몰린 기운",
    scarce: "얇은 기운",
    missing: "아무도 없는 기운",
    none: "두드러지는 쪽이 없어요",
    spreadEven: "다섯 기운이 고르게 퍼져 있어요",
    spreadLeaning: "한쪽으로 조금 기울어 있어요",
    spreadSkewed: "한쪽으로 뚜렷하게 쏠려 있어요",
    polarity: "음양",
    yang: "양",
    yin: "음",
    tiltBalanced: "양과 음이 비슷해요",
    tiltYang: "양이 우세해요 — 벌이는 힘이 큰 모임이에요",
    tiltYin: "음이 우세해요 — 머금고 살피는 힘이 큰 모임이에요",
    astro: "별자리 쏠림",
    astroLead: "태양궁의 원소와 행동 양식이에요",
    who: "누가 무엇을 넣나",
    supplies: "채움",
    sole: "이 사람뿐",
    nobody: "빈자리를 채우는 사람이 아직 없어요",
    careTitle: "조심할 점",
  },
  en: {
    title: "Our energies",
    lead: "Everyone’s coordinates, read as one. No score, no ranking.",
    abundant: "Concentrated", scarce: "Thin", missing: "Nobody has it",
    none: "Nothing stands out",
    spreadEven: "The five spread evenly",
    spreadLeaning: "Tilted a little to one side",
    spreadSkewed: "Clearly concentrated on one side",
    polarity: "Yin–yang", yang: "Yang", yin: "Yin",
    tiltBalanced: "Yang and yin are close",
    tiltYang: "Yang leads — a group that starts things",
    tiltYin: "Yin leads — a group that holds and watches",
    astro: "Zodiac tilt", astroLead: "Sun-sign element and modality",
    who: "Who brings what", supplies: "Fills", sole: "Only one",
    nobody: "Nobody fills the gaps yet",
    careTitle: "Worth watching",
  },
  ja: {
    title: "わたしたちの気",
    lead: "集まった人の座標をひとつに合わせて読みました。点数も順位もありません。",
    abundant: "偏った気", scarce: "薄い気", missing: "誰も持たない気",
    none: "際立つものはありません",
    spreadEven: "五つが均等に散っています",
    spreadLeaning: "少し片寄っています",
    spreadSkewed: "はっきり片寄っています",
    polarity: "陰陽", yang: "陽", yin: "陰",
    tiltBalanced: "陽と陰が近いです",
    tiltYang: "陽が優勢 — 起こす力が大きい集まりです",
    tiltYin: "陰が優勢 — 含み見守る力が大きい集まりです",
    astro: "星座の偏り", astroLead: "太陽星座の元素と行動様式",
    who: "誰が何を足すか", supplies: "補う", sole: "この人だけ",
    nobody: "空いた席を埋める人がまだいません",
    careTitle: "気をつけること",
  },
  zh: {
    title: "我们的气",
    lead: "把在场每个人的坐标合在一起读。没有分数，也没有排名。",
    abundant: "偏多的气", scarce: "偏薄的气", missing: "无人具备的气",
    none: "没有特别突出的",
    spreadEven: "五行分布均匀",
    spreadLeaning: "略微偏向一侧",
    spreadSkewed: "明显偏向一侧",
    polarity: "阴阳", yang: "阳", yin: "阴",
    tiltBalanced: "阴阳相近",
    tiltYang: "阳占优 — 这是善于发起的组合",
    tiltYin: "阴占优 — 这是善于含蓄观察的组合",
    astro: "星座倾向", astroLead: "太阳星座的元素与行动方式",
    who: "谁带来什么", supplies: "补上", sole: "仅此一人",
    nobody: "目前还没有人补上空缺",
    careTitle: "需要留意",
  },
  fr: {
    title: "Nos énergies",
    lead: "Les coordonnées de chacun, lues comme un tout. Ni score ni classement.",
    abundant: "Concentrée", scarce: "Mince", missing: "Personne ne l’a",
    none: "Rien ne ressort",
    spreadEven: "Les cinq se répartissent également",
    spreadLeaning: "Légèrement penché d’un côté",
    spreadSkewed: "Nettement concentré d’un côté",
    polarity: "Yin–yang", yang: "Yang", yin: "Yin",
    tiltBalanced: "Yang et yin sont proches",
    tiltYang: "Le yang domine — un groupe qui lance",
    tiltYin: "Le yin domine — un groupe qui garde et observe",
    astro: "Penchant du zodiaque", astroLead: "Élément et modalité du signe solaire",
    who: "Qui apporte quoi", supplies: "Comble", sole: "Seul",
    nobody: "Personne ne comble encore les manques",
    careTitle: "À surveiller",
  },
  es: {
    title: "Nuestras energías",
    lead: "Las coordenadas de cada uno, leídas como un todo. Sin puntuación ni ranking.",
    abundant: "Concentrada", scarce: "Escasa", missing: "Nadie la tiene",
    none: "Nada destaca",
    spreadEven: "Los cinco se reparten por igual",
    spreadLeaning: "Algo inclinado a un lado",
    spreadSkewed: "Claramente concentrado en un lado",
    polarity: "Yin–yang", yang: "Yang", yin: "Yin",
    tiltBalanced: "Yang y yin están cerca",
    tiltYang: "Domina el yang: un grupo que inicia",
    tiltYin: "Domina el yin: un grupo que sostiene y observa",
    astro: "Inclinación zodiacal", astroLead: "Elemento y modalidad del signo solar",
    who: "Quién aporta qué", supplies: "Cubre", sole: "Solo esta persona",
    nobody: "Todavía nadie cubre los huecos",
    careTitle: "A tener en cuenta",
  },
};

const ASTRO_ELEMENT: Record<Lang, Record<string, string>> = {
  ko: { fire: "불", earth: "흙", air: "바람", water: "물" },
  en: { fire: "Fire", earth: "Earth", air: "Air", water: "Water" },
  ja: { fire: "火", earth: "地", air: "風", water: "水" },
  zh: { fire: "火", earth: "土", air: "风", water: "水" },
  fr: { fire: "Feu", earth: "Terre", air: "Air", water: "Eau" },
  es: { fire: "Fuego", earth: "Tierra", air: "Aire", water: "Agua" },
};

const ASTRO_MODALITY: Record<Lang, Record<string, string>> = {
  ko: { cardinal: "여는 쪽", fixed: "지키는 쪽", mutable: "바꾸는 쪽" },
  en: { cardinal: "Starting", fixed: "Holding", mutable: "Adapting" },
  ja: { cardinal: "始める", fixed: "保つ", mutable: "変える" },
  zh: { cardinal: "开创", fixed: "固守", mutable: "变通" },
  fr: { cardinal: "Initier", fixed: "Tenir", mutable: "Adapter" },
  es: { cardinal: "Iniciar", fixed: "Sostener", mutable: "Adaptar" },
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

export default function CircleSynthesis({
  locale,
  synthesis,
}: {
  locale: string;
  synthesis: GroupSynthesis;
}) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = T[lang];
  const { astro, contributions, elements, polarity, spread } = synthesis;
  const name = (element: FiveElement) =>
    ELEMENT_SYMBOLS[element].name[lang] ?? ELEMENT_SYMBOLS[element].name.en;
  const peak = Math.max(...GROUP_ELEMENT_ORDER.map((e) => elements.counts[e]), 1);
  const spreadLine = spread === "even" ? t.spreadEven : spread === "leaning" ? t.spreadLeaning : t.spreadSkewed;
  const tiltLine = polarity.tilt === "balanced" ? t.tiltBalanced : polarity.tilt === "yang" ? t.tiltYang : t.tiltYin;
  const polarityTotal = Math.max(1, polarity.yang + polarity.yin);
  const cares = elements.abundant.map((element) => SKEW_CARE[lang][element]).filter(Boolean);
  const helpers = contributions.filter((item) => item.supplies.length || item.sole.length);

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
      <h2 className="text-lg font-black text-foreground">{t.title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.lead}</p>

      {/* 오행 막대. 기대값에서 많이 벗어난 것일수록 진하게 둔다. */}
      <div className="mt-4 space-y-2">
        {GROUP_ELEMENT_ORDER.map((element) => {
          const count = elements.counts[element];
          const off = elements.deviation[element];
          const strong = Math.abs(off) >= 1.5;
          return (
            <div key={element} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs font-black" style={{ color: EL_COLOR[element] }}>
                {name(element)}
              </span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    backgroundColor: EL_COLOR[element],
                    opacity: strong ? 1 : 0.45,
                    width: `${(count / peak) * 100}%`,
                  }}
                />
              </div>
              <span className="w-7 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">
                {count}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs font-bold text-foreground">{spreadLine}</p>

      <div className="mt-3 space-y-1.5">
        {chips(t.abundant, elements.abundant, "bg-primary/15 text-primary-strong")}
        {chips(t.scarce, elements.scarce, "bg-muted text-muted-foreground")}
        {chips(t.missing, elements.missing, "bg-red-50 text-red-800")}
        {!elements.abundant.length && !elements.scarce.length && !elements.missing.length && (
          <p className="text-xs text-muted-foreground">{t.none}</p>
        )}
      </div>

      {cares.length > 0 && (
        <div className="mt-4 rounded-2xl bg-muted/40 p-3">
          <p className="text-[11px] font-bold text-muted-foreground">{t.careTitle}</p>
          <ul className="mt-1 space-y-1">
            {cares.map((line) => (
              <li key={line} className="text-sm leading-relaxed text-foreground">{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border p-3">
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
        <div className="rounded-2xl border border-border p-3">
          <p className="text-[11px] font-bold text-muted-foreground">{t.astro}</p>
          <p className="mt-2 text-sm font-black text-foreground">
            {ASTRO_ELEMENT[lang][astro.topElement]} · {ASTRO_MODALITY[lang][astro.topModality]}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t.astroLead}</p>
        </div>
      </div>

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
