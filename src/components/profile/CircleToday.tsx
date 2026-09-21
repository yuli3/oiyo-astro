"use client";

/**
 * 오늘의 우리 — 모임의 오늘 컨디션.
 *
 * 우리 기운(고정 좌표)과 일부러 카드를 나눈다. 섞으면 "우리"가 매일 달라지는
 * 것처럼 읽힌다.
 *
 * 오늘 날짜는 **마운트 뒤에** 잡는다. 정적 사이트라 HTML 이 빌드 시점에
 * 굳는데, 그때의 날짜를 찍어 두면 캐시된 화면이 어제·지난주를 오늘이라고
 * 말한다. 서버에서 렌더하지 않고 클라이언트에서 한 번 계산한다.
 */
import { useEffect, useState } from "react";

import { groupToday, type GroupToday } from "@/lib/symbolic-tradition/group-today";
import { PAIR_COPY } from "@/lib/symbolic-tradition/pair-copy";
import { GROUP_ELEMENT_ORDER, type GroupMember, type GroupSynthesis } from "@/lib/symbolic-tradition/group-synthesis";
import { ELEMENT_SYMBOLS } from "@/lib/talisman/symbols";
import type { FiveElement } from "@/lib/ontology/saju/types";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const EL_COLOR: Record<string, string> = {
  wood: "#3f7a53", fire: "#b4452f", earth: "#8a6c3d", metal: "#6f7780", water: "#2f4f6f",
};

const T: Record<Lang, Record<string, string>> = {
  ko: {
    title: "오늘의 우리",
    titleFillsGap: "빈자리에 손님이 드는 날",
    titleEasesPeak: "기울었던 배가 균형을 찾는 날",
    titleDoublesDown: "잘하는 걸 더 잘하게 되는 날",
    titleFeedsPeak: "순풍에 돛 단 날",
    titleNeutral: "잔잔한 물결의 날",
    seasonProsperous: "오늘의 {el} 기운은 계절을 만나 가장 힘이 셉니다.",
    seasonRising: "계절이 오늘의 {el} 기운을 밀어 줘 힘이 오릅니다.",
    seasonResting: "오늘의 {el} 기운은 계절을 돕느라 힘이 빠져 있어요.",
    seasonConfined: "오늘의 {el} 기운은 계절에 맞서느라 묶여 있어요.",
    seasonDead: "오늘의 {el} 기운은 계절에 눌려 약합니다.",
    stancePeer: "같은 기운의 날",
    stanceSupport: "받는 날",
    stanceOutput: "내주는 날",
    stancePressure: "눌리는 날",
    stanceWealth: "다루는 날",
    doPeer: "혼자 밀어붙이기 쉬운 날이에요. 도움을 먼저 청해 보세요.",
    doSupport: "받기 좋은 날이에요. 조언을 듣거나 배운 것을 바로 써 보세요.",
    doOutput: "표현이 잘 풀리는 날이에요. 미뤄 둔 말이나 만들던 것을 내놓아 보세요.",
    doPressure: "약속과 규칙이 무겁게 느껴질 수 있어요. 무리한 일정은 줄이세요.",
    doWealth: "정리하고 챙기기 좋은 날이에요. 끝내지 못한 일을 마무리해 보세요.",
    dayMaster: "일간",
    lens: "눈에 띄는 관점",
    try: "오늘 해 볼 것",
    tryFillsGap: "늘 미루던 이야기 하나를 꺼내 보세요. 오늘은 받아 줄 기운이 있어요.",
    tryEasesPeak: "평소 한 사람이 도맡던 역할을 오늘은 돌려 맡아 보세요.",
    tryDoublesDown: "잘하는 일에 몰아 쓰되, 결정은 하루 미뤄 두세요.",
    tryFeedsPeak: "속도가 붙는 날이에요. 멈출 신호를 미리 하나 정해 두세요.",
    tryNeutral: "특별한 걸 하려 하기보다 평소대로 만나 보세요.",
    yourDay: "오늘의 기운이 우리 분포 어디에 꽂히나",
    dayIs: "오늘의 기운",
    who: "오늘 각자",
    fillsGap: "오늘은 우리에게 가장 모자란 기운이 들어오는 날이에요. 미뤄 둔 이야기를 꺼내기 좋아요.",
    easesPeak: "우리에게 몰려 있던 기운을 오늘이 눌러 줘요. 평소보다 한쪽으로 쏠리지 않아요.",
    doublesDown: "우리가 이미 센 쪽에 오늘이 더 얹혀요. 잘하던 건 더 잘되고, 늘 걸리던 데서 더 걸려요.",
    feedsPeak: "오늘 기운이 우리의 센 쪽을 더 키워요. 속도가 붙는 대신 브레이크가 약해져요.",
    neutral: "오늘은 특별히 밀거나 당기는 기운이 없어요. 평소의 우리로 흘러가요.",
  },
  en: {
    title: "Us today",
    titleFillsGap: "A guest fills the empty seat",
    titleEasesPeak: "The tilted boat finds its balance",
    titleDoublesDown: "What you do well gets even better",
    titleFeedsPeak: "Wind in your sails",
    titleNeutral: "A day of calm water",
    seasonProsperous: "Today’s {el} meets its season and is at full strength.",
    seasonRising: "The season lifts today’s {el}; its strength is rising.",
    seasonResting: "Today’s {el} spends itself feeding the season and runs low.",
    seasonConfined: "Today’s {el} is tied up pushing against the season.",
    seasonDead: "The season presses down on today’s {el}; it is weak.",
    stancePeer: "Same-energy day",
    stanceSupport: "Receiving day",
    stanceOutput: "Giving day",
    stancePressure: "Under-pressure day",
    stanceWealth: "Handling day",
    doPeer: "Easy to push on alone today. Ask for help first.",
    doSupport: "Good for receiving. Take advice, or use what you just learned.",
    doOutput: "Expression flows today. Say the thing you held back, or ship what you were making.",
    doPressure: "Promises and rules may feel heavy. Cut back an overloaded schedule.",
    doWealth: "Good for sorting and collecting. Finish something left undone.",
    dayMaster: "Day master",
    lens: "Standout lens",
    try: "Try today",
    tryFillsGap: "Raise the conversation you keep putting off. Today there’s room to receive it.",
    tryEasesPeak: "Swap the role one person usually carries.",
    tryDoublesDown: "Lean into what you do well, but sleep on the big decision.",
    tryFeedsPeak: "Momentum builds today. Agree on a stop signal first.",
    tryNeutral: "Don’t force anything special — just meet as you usually do.",
    yourDay: "Where today lands on your group", dayIs: "Today’s energy", who: "Each of you today",
    fillsGap: "Today brings the energy this group has least of. A good day to raise what you’ve been putting off.",
    easesPeak: "Today presses down on what this group has too much of. Less one-sided than usual.",
    doublesDown: "Today piles onto what this group is already strong in. What works works harder; what snags, snags harder.",
    feedsPeak: "Today feeds the group’s strong side. More momentum, weaker brakes.",
    neutral: "Nothing pushes or pulls today. The group runs as it usually does.",
  },
  ja: {
    title: "今日のわたしたち",
    titleFillsGap: "空いた席に客が来る日",
    titleEasesPeak: "傾いた舟が釣り合いを取る日",
    titleDoublesDown: "得意なことがさらに冴える日",
    titleFeedsPeak: "順風満帆の日",
    titleNeutral: "凪の日",
    seasonProsperous: "今日の{el}の気は季節に出会い、最も力が強い。",
    seasonRising: "季節が今日の{el}の気を押し上げ、力が増している。",
    seasonResting: "今日の{el}の気は季節を助けて力が抜けている。",
    seasonConfined: "今日の{el}の気は季節に逆らって縛られている。",
    seasonDead: "今日の{el}の気は季節に押さえられて弱い。",
    stancePeer: "同じ気の日",
    stanceSupport: "受け取る日",
    stanceOutput: "渡す日",
    stancePressure: "抑えられる日",
    stanceWealth: "扱う日",
    doPeer: "一人で押し切りやすい日。先に助けを求めてみましょう。",
    doSupport: "受け取るのに良い日。助言を聞くか、学んだことをすぐ使ってみましょう。",
    doOutput: "表現がよく通る日。言いそびれたことや作りかけのものを出してみましょう。",
    doPressure: "約束や決まりが重く感じられるかも。無理な予定は減らしましょう。",
    doWealth: "整理して取りまとめるのに良い日。やり残しを片づけましょう。",
    dayMaster: "日干",
    lens: "目立つ視点",
    try: "今日やってみること",
    tryFillsGap: "ずっと先送りにしていた話を一つ出してみましょう。今日は受け止める気があります。",
    tryEasesPeak: "いつも一人が担う役を、今日は交代してみましょう。",
    tryDoublesDown: "得意なことに注ぎつつ、決定は一日寝かせましょう。",
    tryFeedsPeak: "勢いがつく日です。止まる合図を先に一つ決めておきましょう。",
    tryNeutral: "特別なことをしようとせず、いつも通り会ってみましょう。",
    yourDay: "今日の気は分布のどこに刺さるか", dayIs: "今日の気", who: "今日のそれぞれ",
    fillsGap: "今日は、この集まりに最も足りない気が入る日です。先送りにしていた話を出すのに向きます。",
    easesPeak: "偏っていた気を今日が抑えてくれます。いつもより片寄りません。",
    doublesDown: "もともと強い側に今日が重なります。得意はより得意に、詰まる所はより詰まります。",
    feedsPeak: "今日の気が強い側をさらに育てます。勢いが増す代わりにブレーキが弱まります。",
    neutral: "今日は特に押しも引きもありません。いつもの流れです。",
  },
  zh: {
    title: "今天的我们",
    titleFillsGap: "空位迎来客人的一天",
    titleEasesPeak: "倾斜的船找回平衡的一天",
    titleDoublesDown: "擅长的事更出彩的一天",
    titleFeedsPeak: "一帆风顺的一天",
    titleNeutral: "风平浪静的一天",
    seasonProsperous: "今日的{el}之气逢其时令，力量最盛。",
    seasonRising: "时令托起今日的{el}之气，力量上升。",
    seasonResting: "今日的{el}之气为生时令而泄力，偏弱。",
    seasonConfined: "今日的{el}之气与时令相抗，受困。",
    seasonDead: "今日的{el}之气被时令所克，最弱。",
    stancePeer: "同气之日",
    stanceSupport: "受益之日",
    stanceOutput: "付出之日",
    stancePressure: "受压之日",
    stanceWealth: "掌控之日",
    doPeer: "容易一个人硬撑，先开口求助。",
    doSupport: "适合接受。听听建议，或把刚学到的马上用起来。",
    doOutput: "表达顺畅的一天。把憋着的话说出来，或把做到一半的东西拿出来。",
    doPressure: "约定和规矩可能显得沉重，减掉过满的日程。",
    doWealth: "适合整理收拢。把没做完的事收个尾。",
    dayMaster: "日干",
    lens: "突出视角",
    try: "今天可以试试",
    tryFillsGap: "把一直拖着的话题拿出来一个。今天有接得住的气。",
    tryEasesPeak: "平常一个人包揽的角色，今天换人来做。",
    tryDoublesDown: "把力气用在擅长的事上，但重大决定缓一天。",
    tryFeedsPeak: "势头会起来。先约定一个停下来的信号。",
    tryNeutral: "别刻意做什么特别的事，照常见面就好。",
    yourDay: "今日之气落在我们分布的哪里", dayIs: "今日之气", who: "今天的各位",
    fillsGap: "今天进来的，正是这个组合最缺的气。适合把一直拖着的话题摊开。",
    easesPeak: "今天压住了偏多的那股气，比平时不那么一边倒。",
    doublesDown: "今天叠在本来就强的一侧。顺的更顺，卡的更卡。",
    feedsPeak: "今日之气让强的一侧更旺。势头更足，刹车更弱。",
    neutral: "今天没有特别的推拉，照平常的样子走。",
  },
  fr: {
    title: "Nous aujourd’hui",
    titleFillsGap: "Un invité occupe la place vide",
    titleEasesPeak: "Le bateau penché retrouve l’équilibre",
    titleDoublesDown: "Ce que vous faites bien s’améliore encore",
    titleFeedsPeak: "Vent en poupe",
    titleNeutral: "Une journée d’eau calme",
    seasonProsperous: "L’énergie {el} du jour rencontre sa saison : pleine force.",
    seasonRising: "La saison porte l’énergie {el} du jour : sa force monte.",
    seasonResting: "L’énergie {el} du jour s’épuise à nourrir la saison.",
    seasonConfined: "L’énergie {el} du jour est entravée à lutter contre la saison.",
    seasonDead: "La saison écrase l’énergie {el} du jour : elle est faible.",
    stancePeer: "Jour de même énergie",
    stanceSupport: "Jour où l’on reçoit",
    stanceOutput: "Jour où l’on donne",
    stancePressure: "Jour sous pression",
    stanceWealth: "Jour où l’on gère",
    doPeer: "Facile de foncer seul aujourd’hui. Demandez de l’aide d’abord.",
    doSupport: "Bon pour recevoir. Écoutez un conseil ou appliquez ce que vous venez d’apprendre.",
    doOutput: "L’expression coule. Dites ce que vous reteniez, livrez ce que vous prépariez.",
    doPressure: "Promesses et règles peuvent peser. Allégez un agenda trop plein.",
    doWealth: "Bon pour trier et récolter. Terminez une chose laissée en suspens.",
    dayMaster: "Maître du jour",
    lens: "Perspective marquante",
    try: "À essayer",
    tryFillsGap: "Sortez la conversation que vous repoussez. Aujourd’hui, il y a de la place pour la recevoir.",
    tryEasesPeak: "Échangez le rôle qu’une seule personne porte d’habitude.",
    tryDoublesDown: "Misez sur ce que vous faites bien, mais laissez la grande décision à demain.",
    tryFeedsPeak: "L’élan monte. Convenez d’abord d’un signal d’arrêt.",
    tryNeutral: "Ne forcez rien : voyez-vous comme d’habitude.",
    yourDay: "Où tombe l’énergie du jour dans votre groupe", dayIs: "L’énergie du jour", who: "Chacun aujourd’hui",
    fillsGap: "Aujourd’hui apporte ce qui manque le plus au groupe. Bon jour pour sortir ce qu’on remet à plus tard.",
    easesPeak: "Aujourd’hui tempère ce dont le groupe a trop. Moins unilatéral que d’habitude.",
    doublesDown: "Aujourd’hui s’ajoute au point déjà fort. Ce qui marche marche mieux ; ce qui coince coince plus.",
    feedsPeak: "L’énergie du jour nourrit le côté fort. Plus d’élan, moins de freins.",
    neutral: "Rien ne pousse ni ne tire aujourd’hui. Le groupe suit son cours habituel.",
  },
  es: {
    title: "Nosotros hoy",
    titleFillsGap: "Un invitado ocupa el asiento vacío",
    titleEasesPeak: "El barco inclinado recupera el equilibrio",
    titleDoublesDown: "Lo que hacéis bien sale aún mejor",
    titleFeedsPeak: "Viento en popa",
    titleNeutral: "Un día de agua en calma",
    seasonProsperous: "La energía {el} de hoy encuentra su estación: fuerza plena.",
    seasonRising: "La estación impulsa la energía {el} de hoy: su fuerza sube.",
    seasonResting: "La energía {el} de hoy se gasta alimentando la estación.",
    seasonConfined: "La energía {el} de hoy queda atada luchando contra la estación.",
    seasonDead: "La estación aplasta la energía {el} de hoy: está débil.",
    stancePeer: "Día de la misma energía",
    stanceSupport: "Día de recibir",
    stanceOutput: "Día de dar",
    stancePressure: "Día bajo presión",
    stanceWealth: "Día de gestionar",
    doPeer: "Hoy es fácil tirar solo. Pide ayuda primero.",
    doSupport: "Bueno para recibir. Escucha un consejo o usa lo que acabas de aprender.",
    doOutput: "La expresión fluye. Di lo que callabas o saca lo que estabas haciendo.",
    doPressure: "Promesas y normas pueden pesar. Recorta una agenda demasiado llena.",
    doWealth: "Bueno para ordenar y recoger. Termina algo que dejaste a medias.",
    dayMaster: "Tronco del día",
    lens: "Perspectiva destacada",
    try: "Para probar hoy",
    tryFillsGap: "Sacad la conversación que venís aplazando. Hoy hay espacio para recibirla.",
    tryEasesPeak: "Cambiad el papel que suele cargar una sola persona.",
    tryDoublesDown: "Apostad por lo que hacéis bien, pero dejad la gran decisión para mañana.",
    tryFeedsPeak: "Hoy se coge impulso. Pactad antes una señal para parar.",
    tryNeutral: "No forcéis nada especial: quedad como siempre.",
    yourDay: "Dónde cae la energía de hoy en el grupo", dayIs: "La energía de hoy", who: "Cada uno hoy",
    fillsGap: "Hoy llega justo lo que más le falta al grupo. Buen día para sacar lo que venís aplazando.",
    easesPeak: "Hoy aprieta lo que al grupo le sobra. Menos unilateral que de costumbre.",
    doublesDown: "Hoy se suma al lado ya fuerte. Lo que funciona funciona más; lo que se atasca, más.",
    feedsPeak: "La energía de hoy alimenta el lado fuerte. Más impulso, menos freno.",
    neutral: "Hoy nada empuja ni tira. El grupo va como suele ir.",
  },
};

const EFFECT_KEY = {
  "fills-gap": "fillsGap",
  "eases-peak": "easesPeak",
  "doubles-down": "doublesDown",
  "feeds-peak": "feedsPeak",
  neutral: "neutral",
} as const;

const cap = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

/** 로컬 달력 기준 오늘. toISOString 은 UTC 라 한국 새벽에 어제가 나온다. */
function localCivilDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function CircleToday({
  locale,
  members,
  synthesis,
}: {
  locale: string;
  members: GroupMember[];
  synthesis: GroupSynthesis;
}) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = T[lang];
  const [today, setToday] = useState<GroupToday | null>(null);

  useEffect(() => {
    // 탭을 열어 둔 채 날이 바뀌면 어제를 오늘이라고 말하게 된다. 그래서
    // 다음 자정에 한 번, 그리고 탭으로 돌아올 때마다 날짜를 다시 본다.
    const refresh = () => setToday(groupToday(synthesis, members, localCivilDate()));
    refresh();
    let timer: ReturnType<typeof setTimeout>;
    const scheduleMidnight = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5);
      timer = setTimeout(() => { refresh(); scheduleMidnight(); }, next.getTime() - now.getTime());
    };
    scheduleMidnight();
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [members, synthesis]);

  if (!today) return null;

  const name = (element: FiveElement) =>
    ELEMENT_SYMBOLS[element].name[lang] ?? ELEMENT_SYMBOLS[element].name.en;

  return (
    <section className="mt-6 rounded-[2rem] border border-border bg-card p-4 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-black text-foreground">{t.title}</h2>
        <time className="text-[11px] font-bold text-muted-foreground" dateTime={today.date}>{today.date}</time>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-bold text-muted-foreground">{t.dayIs}</span>
        <span
          className="rounded-full px-3 py-1 text-sm font-black text-white"
          style={{ backgroundColor: EL_COLOR[today.element] }}
        >
          {name(today.element)}
        </span>
      </div>

      {/* 오늘치 이름. 우리 기운의 별명처럼 한 줄로 먼저 말하고, 설명이 따라온다. */}
      <p className="mt-3 text-xl font-black leading-snug text-foreground">
        {t[`title${cap(EFFECT_KEY[today.effect])}`]}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">{t[EFFECT_KEY[today.effect]]}</p>
      {/* 같은 원소라도 계절에 따라 세기가 다르다(월령). 월지는 절기 기준이다. */}
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {t[`season${cap(today.season.strength)}`].replace("{el}", name(today.element))}
      </p>

      {/* 오늘의 기운이 모임 분포 어디에 꽂히는지. 막대는 우리 기운과 같은
          자(기저 비율 대비 편차)를 쓰고, 오늘의 원소만 테두리로 짚는다. */}
      <div className="mt-4">
        <p className="text-[11px] font-bold text-muted-foreground">{t.yourDay}</p>
        <div className="mt-2 grid grid-cols-5 items-end gap-1.5" style={{ height: "4.5rem" }}>
          {GROUP_ELEMENT_ORDER.map((element) => {
            const off = synthesis.elements.deviation[element];
            const height = Math.max(12, Math.min(100, 50 + off * 20));
            const isToday = element === today.element;
            return (
              <div key={element} className="flex h-full flex-col items-center justify-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ${isToday ? "ring-2 ring-offset-2 ring-foreground" : ""}`}
                  style={{ backgroundColor: EL_COLOR[element], height: `${height}%`, opacity: isToday ? 1 : 0.4 }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1 grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold text-muted-foreground">
          {GROUP_ELEMENT_ORDER.map((element) => (
            <span key={element} className={element === today.element ? "text-foreground" : ""}>{name(element)}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-muted/40 p-3">
        <p className="text-[11px] font-bold text-muted-foreground">{t.try}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{t[`try${cap(EFFECT_KEY[today.effect])}`]}</p>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-bold text-muted-foreground">{t.who}</p>
        <ul className="mt-2 space-y-1.5">
          {today.members.map((item) => {
            // 오늘과 이 사람 사이에서 가장 할 말이 있는 관점 하나. 해설은
            // 쌍 해설(PAIR_COPY)을 그대로 쓴다 — 오늘도 참가자이므로 사람끼리
            // 쓰던 문구가 그대로 맞고, 새로 쓸 것이 없다.
            const copy = PAIR_COPY[lang][`${item.highlight.id}:${item.highlight.relation}`];
            return (
              <li key={item.id} className="rounded-xl border border-border px-3 py-2">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="min-w-0 truncate font-black text-foreground">{item.label}</span>
                  {/* 이 사람의 일간. 오늘과의 관계는 이 글자와 오늘 일간 사이에서 나온다. */}
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black text-white"
                    style={{ backgroundColor: EL_COLOR[item.dayMaster] }}
                    title={t.dayMaster}
                  >
                    {name(item.dayMaster)}
                  </span>
                  <span className="ml-auto shrink-0 font-black text-primary-strong">{t[`stance${cap(item.stance)}`]}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-foreground">{t[`do${cap(item.stance)}`]}</p>
                {copy && (
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {t.lens} · {copy.label}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
