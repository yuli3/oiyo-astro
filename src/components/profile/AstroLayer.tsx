"use client";

/**
 * 우리의 별자리 — 우리 기운 안의 별자리 층(B1~B3). B4 한 줄은 우리 기운
 * 헤드라인 아래에 있다(CircleSynthesis).
 *
 * 층 순서: B1 원소×양태 격자와 해석 → B3 황도 바퀴와 각 → B2 해·달·상승.
 * 계산은 전부 group-astro 에서 받는다.
 *
 * 각(B3)은 태양궁 렌즈와 많이 겹친다(삼각의 95%가 같은 원소). 그래서 관점으로
 * 세지 않고 그림과 도형 이름으로만 쓴다.
 */
import { useState } from "react";

import { SIGN_INFO } from "@/lib/ontology/natal/signs";
import type { SignKey } from "@/lib/ontology/natal/calculator";
import {
  ASTRO_ELEMENTS,
  ASTRO_MODALITIES,
  type AstroElement,
  type AstroModality,
  type GroupAstro,
  type SunAspectKind,
} from "@/lib/symbolic-tradition/group-astro";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Copy {
  title: string;
  lead: string;
  el: Record<AstroElement, string>;
  mod: Record<AstroModality, string>;
  rich: Record<AstroElement, string>;
  empty: Record<AstroElement, string>;
  modRich: Record<AstroModality, string>;
  top: string;
  chanceCommon: string;
  chanceRare: string;
  wheel: string;
  wheelAria: string;
  aspect: Record<SunAspectKind, string>;
  grandTrine: string;
  tSquare: string;
  leanHarmonious: string;
  leanTense: string;
  noLongitude: string;
  triad: string;
  triadLead: string;
  sun: string;
  moon: string;
  rising: string;
  moonOr: string;
  triadNone: string;
  innerOuter: string;
}

const C: Record<Lang, Copy> = {
  ko: {
    title: "우리의 별자리",
    lead: "태양궁의 원소(불·흙·바람·물)와 움직이는 방식(여는·지키는·바꾸는 쪽)으로 사람을 놓았어요.",
    el: { fire: "불", earth: "흙", air: "바람", water: "물" },
    mod: { cardinal: "여는 쪽", fixed: "지키는 쪽", mutable: "바꾸는 쪽" },
    rich: {
      fire: "달아오르는 속도가 빨라요. 뜨거운 결론을 한 번 식혀 볼 사람이 있으면 좋아요.",
      earth: "현실적이고 꾸준해요. 새로운 걸 시도할 땐 누군가 먼저 등을 떠밀어 줘야 해요.",
      air: "말과 생각이 빨리 오가요. 이야기로 끝나지 않게 몸을 움직일 약속을 잡아 보세요.",
      water: "서로의 기분을 금방 알아채요. 분위기에 휩쓸려 결정을 미루기 쉬워요.",
    },
    empty: {
      fire: "먼저 불을 붙이는 결이 비어 있어요.",
      earth: "현실로 붙잡아 끝까지 끌고 가는 결이 비어 있어요.",
      air: "생각을 돌리고 말로 풀어 주는 결이 비어 있어요.",
      water: "서로의 감정을 먼저 알아채는 결이 비어 있어요.",
    },
    modRich: {
      cardinal: "여는 쪽이 몰려 벌이는 건 빠르지만, 이어 갈 사람이 적어요.",
      fixed: "지키는 쪽이 몰려 한번 정하면 오래가지만, 방향을 바꾸기 어려워요.",
      mutable: "바꾸는 쪽이 몰려 유연하지만, 끝을 맺기 어려워요.",
    },
    top: "{n}명 중 {k}명이 {el}이에요.",
    chanceCommon: "우연으로도 {pct}%는 나오는 정도라 드문 모임은 아니에요.",
    chanceRare: "우연으로는 {pct}%만 나오는 드문 모임이에요.",
    wheel: "황도 위의 우리",
    wheelAria: "황도 바퀴 위의 사람들과 그 사이의 각",
    aspect: { conjunction: "합 0°", sextile: "육각 60°", square: "사각 90°", trine: "삼각 120°", opposition: "대립 180°" },
    grandTrine: "{names} 세 사람이 대삼각을 이뤄요. 셋은 말이 잘 통하지만, 셋만의 리듬이 생기기 쉬워요.",
    tSquare: "{a} · {b} 두 사람이 서로 맞서고, 그 사이에서 {c}에게 긴장이 모여요. 부딪힘이 일을 밀어붙이는 힘이 되기도 해요.",
    leanHarmonious: "조화로운 각(삼각·육각)이 우연보다 눈에 띄게 많아요.",
    leanTense: "긴장된 각(사각·대립)이 우연보다 눈에 띄게 많아요.",
    noLongitude: "예전에 넣은 사람은 황도 위 자리가 없어요. 다시 넣으면 바퀴에 나타나요.",
    triad: "해·달·상승",
    triadLead: "해는 겉으로 드러나는 나, 달은 편할 때의 속마음, 상승궁은 처음 보이는 인상이에요.",
    sun: "해",
    moon: "달",
    rising: "상승",
    moonOr: " 또는 ",
    triadNone: "태어난 시각과 도시를 넣은 사람에게만 달·상승궁이 보여요.",
    innerOuter: "겉은 {outer}이 많은데 속(달)은 {inner}이 많은 모임이에요.",
  },
  en: {
    title: "Our zodiac",
    lead: "Everyone placed by sun-sign element (fire, earth, air, water) and mode (starting, holding, adapting).",
    el: { fire: "Fire", earth: "Earth", air: "Air", water: "Water" },
    mod: { cardinal: "Starting", fixed: "Holding", mutable: "Adapting" },
    rich: {
      fire: "You heat up fast. It helps to have someone who cools a hot conclusion once.",
      earth: "Practical and steady. Trying something new needs someone to give the first push.",
      air: "Words and ideas fly fast. Book something physical so it doesn’t stay just talk.",
      water: "You pick up each other’s moods quickly — and can drift along and postpone decisions.",
    },
    empty: {
      fire: "Nobody brings the spark that starts things.",
      earth: "Nobody brings the grip that carries things through to the end.",
      air: "Nobody brings the knack for turning ideas over and talking them out.",
      water: "Nobody brings the instinct for noticing feelings first.",
    },
    modRich: {
      cardinal: "Starters dominate: quick to launch, few to keep it going.",
      fixed: "Holders dominate: decisions last, but changing course is hard.",
      mutable: "Adapters dominate: flexible, but hard to wrap things up.",
    },
    top: "{k} of {n} are {el}.",
    chanceCommon: "Chance alone gives this {pct}% of the time, so it isn’t a rare group.",
    chanceRare: "Chance alone gives this only {pct}% of the time — a rare group.",
    wheel: "Us on the zodiac",
    wheelAria: "Everyone on the zodiac wheel and the angles between them",
    aspect: { conjunction: "Conjunction 0°", sextile: "Sextile 60°", square: "Square 90°", trine: "Trine 120°", opposition: "Opposition 180°" },
    grandTrine: "{names} form a grand trine. The three click easily — and can slip into a rhythm of their own.",
    tSquare: "{a} and {b} face off while {c} takes the strain between them. That friction can also push things forward.",
    leanHarmonious: "Easy angles (trines, sextiles) show up noticeably more than chance.",
    leanTense: "Tense angles (squares, oppositions) show up noticeably more than chance.",
    noLongitude: "People added earlier have no place on the wheel yet. Add them again to see them.",
    triad: "Sun · Moon · Rising",
    triadLead: "The sun is the self you show, the moon the heart at ease, the rising sign the first impression.",
    sun: "Sun",
    moon: "Moon",
    rising: "Rising",
    moonOr: " or ",
    triadNone: "Moon and rising signs appear only for people entered with a birth time and city.",
    innerOuter: "On the outside the group is mostly {outer}, but inside (moon) mostly {inner}.",
  },
  ja: {
    title: "わたしたちの星座",
    lead: "太陽星座の元素（火・地・風・水）と動き方（始める・保つ・変える）で並べました。",
    el: { fire: "火", earth: "地", air: "風", water: "水" },
    mod: { cardinal: "始める側", fixed: "保つ側", mutable: "変える側" },
    rich: {
      fire: "熱くなるのが早い集まりです。熱い結論を一度冷ましてくれる人がいると安心です。",
      earth: "現実的で着実です。新しいことには誰かが最初に背中を押す必要があります。",
      air: "言葉と考えがすばやく行き交います。話だけで終わらないよう体を動かす約束を。",
      water: "互いの気分にすぐ気づきます。雰囲気に流されて決断を先送りしがちです。",
    },
    empty: {
      fire: "最初に火をつける質が空いています。",
      earth: "現実につなぎとめて最後までやり抜く質が空いています。",
      air: "考えをめぐらせ言葉でほぐす質が空いています。",
      water: "互いの気持ちに先に気づく質が空いています。",
    },
    modRich: {
      cardinal: "始める側が多く、立ち上げは早いものの続ける人が少なめです。",
      fixed: "保つ側が多く、決めたことは長続きしますが方向転換は苦手です。",
      mutable: "変える側が多く、柔軟ですが締めくくるのが難しいです。",
    },
    top: "{n}人中{k}人が{el}です。",
    chanceCommon: "偶然でも{pct}%は起きる程度なので、珍しい集まりではありません。",
    chanceRare: "偶然では{pct}%しか起きない、珍しい集まりです。",
    wheel: "黄道の上のわたしたち",
    wheelAria: "黄道の輪の上の人々とその間の角度",
    aspect: { conjunction: "合 0°", sextile: "セクスタイル 60°", square: "スクエア 90°", trine: "トライン 120°", opposition: "オポジション 180°" },
    grandTrine: "{names}がグランドトラインを作っています。三人は話が合いますが、三人だけのリズムができやすいです。",
    tSquare: "{a}と{b}が向き合い、{c}がその間で緊張を受けます。ぶつかりが物事を押し進める力にもなります。",
    leanHarmonious: "調和の角度（トライン・セクスタイル）が偶然より目立って多いです。",
    leanTense: "緊張の角度（スクエア・オポジション）が偶然より目立って多いです。",
    noLongitude: "以前に入れた人には黄道上の位置がありません。入れ直すと輪に現れます。",
    triad: "太陽・月・アセンダント",
    triadLead: "太陽は外に見える自分、月はくつろいだときの本音、アセンダントは第一印象です。",
    sun: "太陽",
    moon: "月",
    rising: "ASC",
    moonOr: "または",
    triadNone: "出生時刻と都市を入れた人にだけ月・アセンダントが表示されます。",
    innerOuter: "外側は{outer}が多いのに、内側（月）は{inner}が多い集まりです。",
  },
  zh: {
    title: "我们的星座",
    lead: "按太阳星座的元素（火、土、风、水）和行动方式（开创、固守、变通）排列每个人。",
    el: { fire: "火", earth: "土", air: "风", water: "水" },
    mod: { cardinal: "开创", fixed: "固守", mutable: "变通" },
    rich: {
      fire: "升温很快。有人能把热烈的结论先冷却一下会更好。",
      earth: "务实而稳定。尝试新事物时需要有人先推一把。",
      air: "话语和想法来回很快。约点需要动起来的事，别只停留在聊天。",
      water: "很快就能察觉彼此的情绪，也容易随气氛拖延决定。",
    },
    empty: {
      fire: "缺少率先点火的质地。",
      earth: "缺少把事情落到实处、坚持到底的质地。",
      air: "缺少转动想法、用语言梳理的质地。",
      water: "缺少先察觉彼此情绪的质地。",
    },
    modRich: {
      cardinal: "开创的人多，起步快，但能接着做下去的人少。",
      fixed: "固守的人多，决定了就持久，但难以转向。",
      mutable: "变通的人多，灵活，但难以收尾。",
    },
    top: "{n}人中有{k}人是{el}象。",
    chanceCommon: "单凭偶然也有{pct}%的机会出现，并不算少见的组合。",
    chanceRare: "单凭偶然只有{pct}%的机会出现，是少见的组合。",
    wheel: "黄道上的我们",
    wheelAria: "黄道轮上的人们以及彼此之间的相位",
    aspect: { conjunction: "合相 0°", sextile: "六分相 60°", square: "四分相 90°", trine: "三分相 120°", opposition: "对分相 180°" },
    grandTrine: "{names}构成大三角。三人很谈得来，但容易形成只属于三人的节奏。",
    tSquare: "{a}和{b}彼此相对，{c}夹在中间承受张力。这种摩擦也可能成为推动事情的力量。",
    leanHarmonious: "和谐相位（三分、六分）明显多于偶然。",
    leanTense: "紧张相位（四分、对分）明显多于偶然。",
    noLongitude: "之前加入的人还没有黄道位置。重新加入后就会出现在轮上。",
    triad: "太阳・月亮・上升",
    triadLead: "太阳是外在的自己，月亮是放松时的内心，上升星座是第一印象。",
    sun: "太阳",
    moon: "月亮",
    rising: "上升",
    moonOr: "或",
    triadNone: "只有填写了出生时间和城市的人才会显示月亮与上升星座。",
    innerOuter: "外在多是{outer}象，内在（月亮）却多是{inner}象。",
  },
  fr: {
    title: "Notre zodiaque",
    lead: "Chacun placé selon l’élément de son signe solaire (feu, terre, air, eau) et sa manière d’agir (initier, tenir, adapter).",
    el: { fire: "Feu", earth: "Terre", air: "Air", water: "Eau" },
    mod: { cardinal: "Initier", fixed: "Tenir", mutable: "Adapter" },
    rich: {
      fire: "Vous vous échauffez vite. Il est bon d’avoir quelqu’un pour refroidir une conclusion trop brûlante.",
      earth: "Concrets et constants. Pour essayer du neuf, il faut que quelqu’un donne la première impulsion.",
      air: "Les idées fusent. Prévoyez quelque chose de concret pour que ça ne reste pas des paroles.",
      water: "Vous captez vite l’humeur des autres — et pouvez vous laisser porter en repoussant les décisions.",
    },
    empty: {
      fire: "Personne n’apporte l’étincelle qui lance les choses.",
      earth: "Personne n’apporte la prise qui mène les choses jusqu’au bout.",
      air: "Personne n’apporte l’art de retourner les idées et d’en parler.",
      water: "Personne n’apporte l’instinct de sentir d’abord les émotions.",
    },
    modRich: {
      cardinal: "Beaucoup d’initiateurs : on lance vite, peu de gens poursuivent.",
      fixed: "Beaucoup de gardiens : les décisions durent, mais changer de cap est difficile.",
      mutable: "Beaucoup d’adaptables : souples, mais conclure est difficile.",
    },
    top: "{k} sur {n} sont {el}.",
    chanceCommon: "Le hasard seul donne cela {pct} % du temps : ce n’est pas un groupe rare.",
    chanceRare: "Le hasard seul ne donne cela que {pct} % du temps : un groupe rare.",
    wheel: "Nous sur le zodiaque",
    wheelAria: "Chacun sur la roue du zodiaque et les angles entre eux",
    aspect: { conjunction: "Conjonction 0°", sextile: "Sextile 60°", square: "Carré 90°", trine: "Trigone 120°", opposition: "Opposition 180°" },
    grandTrine: "{names} forment un grand trigone. Le trio s’entend bien — et peut glisser dans un rythme à part.",
    tSquare: "{a} et {b} se font face et {c} encaisse la tension entre eux. Ce frottement peut aussi faire avancer les choses.",
    leanHarmonious: "Les angles faciles (trigones, sextiles) sont nettement plus nombreux que le hasard.",
    leanTense: "Les angles tendus (carrés, oppositions) sont nettement plus nombreux que le hasard.",
    noLongitude: "Les personnes ajoutées auparavant n’ont pas encore de place sur la roue. Ajoutez-les de nouveau.",
    triad: "Soleil · Lune · Ascendant",
    triadLead: "Le soleil est ce que l’on montre, la lune le cœur au repos, l’ascendant la première impression.",
    sun: "Soleil",
    moon: "Lune",
    rising: "Asc.",
    moonOr: " ou ",
    triadNone: "La lune et l’ascendant n’apparaissent que pour les personnes saisies avec une heure et une ville de naissance.",
    innerOuter: "À l’extérieur, le groupe est surtout {outer} ; à l’intérieur (lune), surtout {inner}.",
  },
  es: {
    title: "Nuestro zodiaco",
    lead: "Cada persona colocada según el elemento de su signo solar (fuego, tierra, aire, agua) y su forma de actuar (iniciar, sostener, adaptar).",
    el: { fire: "Fuego", earth: "Tierra", air: "Aire", water: "Agua" },
    mod: { cardinal: "Iniciar", fixed: "Sostener", mutable: "Adaptar" },
    rich: {
      fire: "Se calientan rápido. Ayuda tener a alguien que enfríe una conclusión demasiado caliente.",
      earth: "Prácticos y constantes. Para probar algo nuevo hace falta que alguien dé el primer empujón.",
      air: "Las ideas vuelan. Quedad para algo físico para que no se quede en palabras.",
      water: "Captan enseguida el ánimo del otro, y pueden dejarse llevar y aplazar decisiones.",
    },
    empty: {
      fire: "Nadie aporta la chispa que arranca las cosas.",
      earth: "Nadie aporta el agarre que lleva las cosas hasta el final.",
      air: "Nadie aporta el arte de darle vueltas a las ideas y hablarlas.",
      water: "Nadie aporta el instinto de notar primero las emociones.",
    },
    modRich: {
      cardinal: "Predominan quienes inician: se arranca rápido, pocos continúan.",
      fixed: "Predominan quienes sostienen: lo decidido dura, pero cambiar de rumbo cuesta.",
      mutable: "Predominan quienes se adaptan: flexibles, pero cuesta cerrar.",
    },
    top: "{k} de {n} son de {el}.",
    chanceCommon: "Solo por azar sale el {pct} % de las veces, así que no es un grupo raro.",
    chanceRare: "Solo por azar sale apenas el {pct} % de las veces: un grupo raro.",
    wheel: "Nosotros en el zodiaco",
    wheelAria: "Cada persona en la rueda del zodiaco y los ángulos entre ellas",
    aspect: { conjunction: "Conjunción 0°", sextile: "Sextil 60°", square: "Cuadratura 90°", trine: "Trígono 120°", opposition: "Oposición 180°" },
    grandTrine: "{names} forman un gran trígono. Los tres conectan fácil, y pueden caer en un ritmo propio.",
    tSquare: "{a} y {b} se enfrentan y {c} recibe la tensión entre ambos. Esa fricción también puede empujar las cosas.",
    leanHarmonious: "Los ángulos fáciles (trígonos, sextiles) aparecen claramente más que por azar.",
    leanTense: "Los ángulos tensos (cuadraturas, oposiciones) aparecen claramente más que por azar.",
    noLongitude: "Las personas añadidas antes aún no tienen lugar en la rueda. Vuelve a añadirlas.",
    triad: "Sol · Luna · Ascendente",
    triadLead: "El sol es lo que muestras, la luna el corazón en calma y el ascendente la primera impresión.",
    sun: "Sol",
    moon: "Luna",
    rising: "Asc.",
    moonOr: " o ",
    triadNone: "La luna y el ascendente solo aparecen para quienes tienen hora y ciudad de nacimiento.",
    innerOuter: "Por fuera el grupo es sobre todo {outer}; por dentro (luna), sobre todo {inner}.",
  },
};

const ASPECT_COLOR: Record<SunAspectKind, string> = {
  trine: "#3f7a53",
  sextile: "#3f6a94",
  square: "#b4452f",
  opposition: "#8a4fa0",
  conjunction: "#8a6c3d",
};

const SIGN_ORDER: SignKey[] = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

export const ASTRO_COPY = C;

export default function AstroLayer({
  lang,
  astro,
  labels,
}: {
  lang: Lang;
  astro: GroupAstro;
  labels: Record<string, string>;
}) {
  const t = C[lang];
  const [open, setOpen] = useState(false);
  const n = astro.triads.length;
  const signName = (sign: SignKey) => SIGN_INFO[sign].name[lang];
  const label = (id: string) => labels[id] ?? id;
  const pct = (p: number) => (p * 100).toFixed(p < 0.1 ? 1 : 0);

  const concentrated = astro.concentratedElement;
  const chanceLine = (concentrated ? t.chanceRare : t.chanceCommon).replace("{pct}", pct(astro.topElement.chance));
  const topLine = t.top.replace("{n}", String(n)).replace("{k}", String(astro.topElement.count)).replace("{el}", t.el[astro.topElement.element]);

  // 황도 바퀴 좌표 — 양자리 0° 가 왼쪽(점성 차트 관례), 반시계 방향.
  const point = (deg: number, r: number) => {
    const a = ((180 - deg) * Math.PI) / 180;
    return [r * Math.cos(a), -r * Math.sin(a)] as const;
  };
  const placed = astro.triads.filter((tr) => tr.sunLongitude !== null);
  const triads = astro.triads.filter((tr) => tr.ascendant !== null);

  return (
    <div className="mt-4 rounded-2xl border border-border p-3 sm:p-4">
      <p className="text-[11px] font-bold text-muted-foreground">{t.title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.lead}</p>

      {/* B1 원소×양태 격자 */}
      <div className="mt-3">
        <div className="grid grid-cols-[3.25rem_repeat(4,minmax(0,1fr))] gap-1 text-[11px]">
          <span />
          {ASTRO_ELEMENTS.map((element) => (
            <span key={element} className="text-center font-bold text-muted-foreground">{t.el[element]}</span>
          ))}
          {ASTRO_MODALITIES.map((modality) => (
            <div key={modality} className="contents">
              <span className="self-center font-bold text-muted-foreground">{t.mod[modality]}</span>
              {ASTRO_ELEMENTS.map((element) => {
                const ids = astro.grid.find((cell) => cell.element === element && cell.modality === modality)!.ids;
                return (
                  <div key={element} className={`flex min-h-10 flex-wrap content-start gap-0.5 rounded-lg p-1 ${ids.length ? "border border-border bg-card" : "border border-dashed border-border"}`}>
                    {ids.map((id) => (
                      <span key={id} className="max-w-full truncate rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary-strong">{label(id)}</span>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground">
        <span className="font-black">{topLine}</span>{" "}
        {concentrated ? t.rich[concentrated] : null}
      </p>
      {astro.concentratedModality && <p className="mt-1 text-sm leading-relaxed text-foreground">{t.modRich[astro.concentratedModality]}</p>}
      {n >= 4 && astro.emptyElements.map((element) => (
        <p key={element} className="mt-1 text-sm leading-relaxed text-foreground">{t.empty[element]}</p>
      ))}
      <p className="mt-2 border-t border-border pt-2 text-[11px] leading-relaxed text-muted-foreground">{chanceLine}</p>

      {/* B3 황도 바퀴와 각 */}
      <p className="mt-4 text-[11px] font-bold text-muted-foreground">{t.wheel}</p>
      {placed.length >= 2 ? (
        <>
          <svg viewBox="-160 -160 320 320" className="mx-auto mt-2 block w-full max-w-xs" role="img" aria-label={t.wheelAria}>
            <circle r="150" fill="none" stroke="var(--border)" />
            <circle r="118" fill="none" stroke="var(--border)" />
            {SIGN_ORDER.map((sign, i) => {
              const [x1, y1] = point(i * 30, 118);
              const [x2, y2] = point(i * 30, 150);
              const [lx, ly] = point(i * 30 + 15, 134);
              return (
                <g key={sign}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--border)" />
                  <text x={lx} y={ly + 5} textAnchor="middle" fontSize="14" fill="var(--muted-foreground)">{`${SIGN_INFO[sign].emoji}︎`}</text>
                </g>
              );
            })}
            {astro.aspects.filter((s) => s.kind !== "conjunction").map((s) => {
              const a = placed.find((tr) => tr.id === s.a)!;
              const b = placed.find((tr) => tr.id === s.b)!;
              const [x1, y1] = point(a.sunLongitude!, 106);
              const [x2, y2] = point(b.sunLongitude!, 106);
              return (
                <line
                  key={`${s.a}-${s.b}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={ASPECT_COLOR[s.kind]}
                  strokeWidth={s.kind === "trine" ? 2 : 1.5}
                  strokeDasharray={s.kind === "square" || s.kind === "opposition" ? "4 4" : undefined}
                  opacity={0.85}
                />
              );
            })}
            {placed.map((tr) => {
              const [x, y] = point(tr.sunLongitude!, 106);
              const [lx, ly] = point(tr.sunLongitude!, 86);
              return (
                <g key={tr.id}>
                  <circle cx={x} cy={y} r="5.5" fill="var(--primary-strong)" stroke="var(--card)" strokeWidth="1.5" />
                  <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--foreground)">{label(tr.id)}</text>
                </g>
              );
            })}
          </svg>
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            {(["trine", "sextile", "square", "opposition", "conjunction"] as SunAspectKind[]).map((kind) => (
              <span key={kind} className="inline-flex items-center gap-1">
                <span className="inline-block h-0 w-4 border-t-2" style={{ borderColor: ASPECT_COLOR[kind], borderTopStyle: kind === "square" || kind === "opposition" ? "dashed" : "solid" }} />
                {t.aspect[kind]}
              </span>
            ))}
          </div>
          {astro.patterns.map((pattern) => (
            <p key={`${pattern.kind}-${pattern.ids.join("-")}`} className="mt-2 text-sm leading-relaxed text-foreground">
              {pattern.kind === "grand-trine"
                ? t.grandTrine.replace("{names}", pattern.ids.map(label).join(" · "))
                : t.tSquare.replace("{a}", label(pattern.ids[0])).replace("{b}", label(pattern.ids[1])).replace("{c}", label(pattern.ids[2]))}
            </p>
          ))}
          {astro.aspectLean && (
            <p className="mt-1 text-sm leading-relaxed text-foreground">{astro.aspectLean === "harmonious" ? t.leanHarmonious : t.leanTense}</p>
          )}
          {placed.length < n && <p className="mt-1 text-[11px] text-muted-foreground">{t.noLongitude}</p>}
        </>
      ) : (
        <p className="mt-1 text-[11px] text-muted-foreground">{t.noLongitude}</p>
      )}

      {/* B2 해·달·상승 — 시각과 도시를 넣은 사람만 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-4 flex min-h-10 w-full items-center justify-between rounded-xl border border-border px-3 text-left text-xs font-black text-foreground"
      >
        {t.triad}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-2">
          <p className="text-xs leading-relaxed text-muted-foreground">{t.triadLead}</p>
          {triads.length ? (
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {triads.map((tr) => (
                <li key={tr.id} className="rounded-xl border border-border px-3 py-2 text-xs">
                  <p className="font-black text-foreground">{label(tr.id)}</p>
                  <p className="mt-0.5 text-foreground">{t.sun} {signName(tr.sun)}</p>
                  <p className="text-foreground">{t.moon} {tr.moon.map(signName).join(t.moonOr)}</p>
                  <p className="text-foreground">{t.rising} {signName(tr.ascendant!)}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {triads.length < n && <p className="mt-2 text-[11px] text-muted-foreground">{t.triadNone}</p>}
          {astro.innerOuter && (
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {t.innerOuter.replace("{outer}", t.el[astro.innerOuter.outer]).replace("{inner}", t.el[astro.innerOuter.inner])}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
