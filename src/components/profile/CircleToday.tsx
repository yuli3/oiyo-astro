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
import type { GroupMember, GroupSynthesis } from "@/lib/symbolic-tradition/group-synthesis";
import { ELEMENT_SYMBOLS } from "@/lib/talisman/symbols";
import type { FiveElement } from "@/lib/ontology/saju/types";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const EL_COLOR: Record<string, string> = {
  wood: "#3f7a53", fire: "#b4452f", earth: "#8a6c3d", metal: "#6f7780", water: "#2f4f6f",
};

const T: Record<Lang, Record<string, string>> = {
  ko: {
    title: "오늘의 우리",
    dayIs: "오늘의 기운",
    who: "오늘 각자",
    aligned: "결이 같아요", fed: "받는 날", feeding: "내주는 날",
    pressed: "눌리는 날", pressing: "누르는 날",
    fillsGap: "오늘은 우리에게 가장 모자란 기운이 들어오는 날이에요. 미뤄 둔 이야기를 꺼내기 좋아요.",
    easesPeak: "우리에게 몰려 있던 기운을 오늘이 눌러 줘요. 평소보다 한쪽으로 쏠리지 않아요.",
    doublesDown: "우리가 이미 센 쪽에 오늘이 더 얹혀요. 잘하던 건 더 잘되고, 늘 걸리던 데서 더 걸려요.",
    feedsPeak: "오늘 기운이 우리의 센 쪽을 더 키워요. 속도가 붙는 대신 브레이크가 약해져요.",
    neutral: "오늘은 특별히 밀거나 당기는 기운이 없어요. 평소의 우리로 흘러가요.",
  },
  en: {
    title: "Us today", dayIs: "Today’s energy", who: "Each of you today",
    aligned: "Same grain", fed: "Receiving", feeding: "Giving",
    pressed: "Under pressure", pressing: "Applying pressure",
    fillsGap: "Today brings the energy this group has least of. A good day to raise what you’ve been putting off.",
    easesPeak: "Today presses down on what this group has too much of. Less one-sided than usual.",
    doublesDown: "Today piles onto what this group is already strong in. What works works harder; what snags, snags harder.",
    feedsPeak: "Today feeds the group’s strong side. More momentum, weaker brakes.",
    neutral: "Nothing pushes or pulls today. The group runs as it usually does.",
  },
  ja: {
    title: "今日のわたしたち", dayIs: "今日の気", who: "今日のそれぞれ",
    aligned: "同じ質", fed: "受け取る日", feeding: "渡す日",
    pressed: "抑えられる日", pressing: "抑える日",
    fillsGap: "今日は、この集まりに最も足りない気が入る日です。先送りにしていた話を出すのに向きます。",
    easesPeak: "偏っていた気を今日が抑えてくれます。いつもより片寄りません。",
    doublesDown: "もともと強い側に今日が重なります。得意はより得意に、詰まる所はより詰まります。",
    feedsPeak: "今日の気が強い側をさらに育てます。勢いが増す代わりにブレーキが弱まります。",
    neutral: "今日は特に押しも引きもありません。いつもの流れです。",
  },
  zh: {
    title: "今天的我们", dayIs: "今日之气", who: "今天的各位",
    aligned: "同质", fed: "受益之日", feeding: "付出之日",
    pressed: "被压之日", pressing: "施压之日",
    fillsGap: "今天进来的，正是这个组合最缺的气。适合把一直拖着的话题摊开。",
    easesPeak: "今天压住了偏多的那股气，比平时不那么一边倒。",
    doublesDown: "今天叠在本来就强的一侧。顺的更顺，卡的更卡。",
    feedsPeak: "今日之气让强的一侧更旺。势头更足，刹车更弱。",
    neutral: "今天没有特别的推拉，照平常的样子走。",
  },
  fr: {
    title: "Nous aujourd’hui", dayIs: "L’énergie du jour", who: "Chacun aujourd’hui",
    aligned: "Même grain", fed: "Reçoit", feeding: "Donne",
    pressed: "Sous pression", pressing: "Met la pression",
    fillsGap: "Aujourd’hui apporte ce qui manque le plus au groupe. Bon jour pour sortir ce qu’on remet à plus tard.",
    easesPeak: "Aujourd’hui tempère ce dont le groupe a trop. Moins unilatéral que d’habitude.",
    doublesDown: "Aujourd’hui s’ajoute au point déjà fort. Ce qui marche marche mieux ; ce qui coince coince plus.",
    feedsPeak: "L’énergie du jour nourrit le côté fort. Plus d’élan, moins de freins.",
    neutral: "Rien ne pousse ni ne tire aujourd’hui. Le groupe suit son cours habituel.",
  },
  es: {
    title: "Nosotros hoy", dayIs: "La energía de hoy", who: "Cada uno hoy",
    aligned: "Mismo grano", fed: "Recibe", feeding: "Da",
    pressed: "Bajo presión", pressing: "Presiona",
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
    // 달력 날짜를 로컬 기준으로 만든다. toISOString 은 UTC 라 한국 새벽에
    // 어제를 오늘이라고 말한다.
    const now = new Date();
    const civilDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    setToday(groupToday(synthesis, members, civilDate));
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

      <p className="mt-3 text-sm leading-relaxed text-foreground">{t[EFFECT_KEY[today.effect]]}</p>

      <div className="mt-4">
        <p className="text-[11px] font-bold text-muted-foreground">{t.who}</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {today.members.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-xs">
              <span className="min-w-0 truncate font-bold text-foreground">{item.label}</span>
              <span className="shrink-0 font-black text-primary-strong">{t[item.stance]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
