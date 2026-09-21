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
import { useEffect, useMemo, useState } from "react";

import { groupPeriod, groupToday, seasonBand, type GroupToday } from "@/lib/symbolic-tradition/group-today";
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
    tabToday: "오늘",
    tabWeek: "이번 주",
    tabMonth: "이번 달",
    weekTitle: "이번 주의 우리",
    monthTitle: "이번 달의 우리",
    periodTop: "가장 많은 날 · {title} {n}일",
    strongLine: "계절이 기운을 밀어 주는 날 {n}일 / {total}일",
    pickDay: "날짜를 누르면 그날을 자세히 볼 수 있어요.",
    periodWho: "이 기간의 각자",
    none: "없음",
    dayCount: "{n}일",
    dayIsOther: "그날의 기운",
    whoOther: "그날 각자",
    tryOther: "그날 해 볼 것",
    qPeerStrong: "같은 기운이 세서 경쟁심이 붙기 쉬워요.",
    qPeerWeak: "같은 기운이 은은해 편하게 어울리기 좋아요.",
    qSupportStrong: "계절이 밀어 줘 받을 것이 많아요.",
    qSupportWeak: "다만 기운이 약해 기대만큼 크진 않아요.",
    qOutputStrong: "받는 쪽 기운이 세서 많이 내주게 돼요. 쉬는 틈을 두세요.",
    qOutputWeak: "내줄 부담이 가벼워 가볍게 시작하기 좋아요.",
    qPressureStrong: "누르는 힘이 세요. 버티는 것만으로 충분해요.",
    qPressureWeak: "누르는 힘이 약해 생각보다 부담이 덜해요.",
    qWealthStrong: "다룰 것이 커서 벅찰 수 있어요. 욕심을 줄이세요.",
    qWealthWeak: "다루기 쉬워 손대는 만큼 정리돼요.",
    titleFillsGap: "빈자리에 손님이 드는 날",
    titleEasesPeak: "기울었던 배가 균형을 찾는 날",
    titleDoublesDown: "잘하는 걸 더 잘하게 되는 날",
    titleFeedsPeak: "순풍에 돛 단 날",
    titleNeutral: "잔잔한 물결의 날",
    seasonProsperous: "{el} 기운이 계절을 만나 가장 힘이 셉니다.",
    seasonRising: "계절이 {el} 기운을 밀어 줘 힘이 오릅니다.",
    seasonResting: "{el} 기운이 계절을 돕느라 힘이 빠져 있어요.",
    seasonConfined: "{el} 기운이 계절에 맞서느라 묶여 있어요.",
    seasonDead: "{el} 기운이 계절에 눌려 약합니다.",
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
    yourDay: "기운이 우리 분포 어디에 꽂히나",
    dayIs: "오늘의 기운",
    who: "오늘 각자",
    fillsGap: "우리에게 가장 모자란 기운이 들어오는 날이에요. 미뤄 둔 이야기를 꺼내기 좋아요.",
    easesPeak: "몰려 있던 기운이 눌리는 날이에요. 평소보다 한쪽으로 쏠리지 않아요.",
    doublesDown: "우리가 이미 센 쪽에 한 겹 더 얹히는 날이에요. 잘하던 건 더 잘되고, 늘 걸리던 데서 더 걸려요.",
    feedsPeak: "우리의 센 쪽이 더 커지는 날이에요. 속도가 붙는 대신 브레이크가 약해져요.",
    neutral: "특별히 밀거나 당기는 기운이 없는 날이에요. 평소의 우리로 흘러가요.",
  },
  en: {
    title: "Us today",
    tabToday: "Today",
    tabWeek: "This week",
    tabMonth: "This month",
    weekTitle: "Us this week",
    monthTitle: "Us this month",
    periodTop: "Most days · {title} ({n})",
    strongLine: "Days the season lifts the energy: {n} of {total}",
    pickDay: "Tap a date to see that day in full.",
    periodWho: "Each of you this period",
    none: "None",
    dayCount: "{n} days",
    dayIsOther: "That day’s energy",
    whoOther: "Each of you that day",
    tryOther: "Try that day",
    qPeerStrong: "The shared energy runs strong, so rivalry comes easily.",
    qPeerWeak: "The shared energy is gentle — easy company.",
    qSupportStrong: "The season backs it up; there’s plenty to receive.",
    qSupportWeak: "The energy is weak, though, so expect less than usual.",
    qOutputStrong: "The receiving side is strong and asks a lot. Leave room to rest.",
    qOutputWeak: "Light demands — a good day to start small.",
    qPressureStrong: "The pressure is strong. Holding steady is enough.",
    qPressureWeak: "The pressure is weak; lighter than it looks.",
    qWealthStrong: "A lot to handle; it may overwhelm. Scale back.",
    qWealthWeak: "Easy to handle; whatever you touch gets sorted.",
    titleFillsGap: "A guest fills the empty seat",
    titleEasesPeak: "The tilted boat finds its balance",
    titleDoublesDown: "What you do well gets even better",
    titleFeedsPeak: "Wind in your sails",
    titleNeutral: "A day of calm water",
    seasonProsperous: "{el} meets its season and is at full strength.",
    seasonRising: "The season lifts {el}; its strength is rising.",
    seasonResting: "{el} spends itself feeding the season and runs low.",
    seasonConfined: "{el} is tied up pushing against the season.",
    seasonDead: "The season presses down on {el}; it is weak.",
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
    yourDay: "Where the day’s energy lands on your group", dayIs: "Today’s energy", who: "Each of you today",
    fillsGap: "A day that brings the energy this group has least of. Good for raising what you’ve been putting off.",
    easesPeak: "A day that presses down on what this group has too much of. Less one-sided than usual.",
    doublesDown: "A day that piles onto what this group is already strong in. What works works harder; what snags, snags harder.",
    feedsPeak: "A day that feeds the group’s strong side. More momentum, weaker brakes.",
    neutral: "Nothing pushes or pulls on this day. The group runs as it usually does.",
  },
  ja: {
    title: "今日のわたしたち",
    tabToday: "今日",
    tabWeek: "今週",
    tabMonth: "今月",
    weekTitle: "今週のわたしたち",
    monthTitle: "今月のわたしたち",
    periodTop: "最も多い日 · {title} {n}日",
    strongLine: "季節が気を押す日 {n}日 / {total}日",
    pickDay: "日付を押すとその日を詳しく見られます。",
    periodWho: "この期間のそれぞれ",
    none: "なし",
    dayCount: "{n}日",
    dayIsOther: "その日の気",
    whoOther: "その日のそれぞれ",
    tryOther: "その日やってみること",
    qPeerStrong: "同じ気が強く、張り合いやすい。",
    qPeerWeak: "同じ気が穏やかで、気楽に付き合える。",
    qSupportStrong: "季節が後押しし、受け取るものが多い。",
    qSupportWeak: "ただ気が弱く、期待ほどではない。",
    qOutputStrong: "受け手の気が強く、多く渡すことになる。休む間を取ろう。",
    qOutputWeak: "渡す負担が軽く、軽く始めるのに向く。",
    qPressureStrong: "抑える力が強い。持ちこたえるだけで十分。",
    qPressureWeak: "抑える力が弱く、思ったより負担が軽い。",
    qWealthStrong: "扱うものが大きく、手に余るかも。欲を減らそう。",
    qWealthWeak: "扱いやすく、手をつけた分だけ片づく。",
    titleFillsGap: "空いた席に客が来る日",
    titleEasesPeak: "傾いた舟が釣り合いを取る日",
    titleDoublesDown: "得意なことがさらに冴える日",
    titleFeedsPeak: "順風満帆の日",
    titleNeutral: "凪の日",
    seasonProsperous: "{el}の気は季節に出会い、最も力が強い。",
    seasonRising: "季節が{el}の気を押し上げ、力が増している。",
    seasonResting: "{el}の気は季節を助けて力が抜けている。",
    seasonConfined: "{el}の気は季節に逆らって縛られている。",
    seasonDead: "{el}の気は季節に押さえられて弱い。",
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
    yourDay: "気は分布のどこに刺さるか", dayIs: "今日の気", who: "今日のそれぞれ",
    fillsGap: "この集まりに最も足りない気が入る日です。先送りにしていた話を出すのに向きます。",
    easesPeak: "偏っていた気が抑えられる日です。いつもより片寄りません。",
    doublesDown: "もともと強い側にもう一層重なる日です。得意はより得意に、詰まる所はより詰まります。",
    feedsPeak: "強い側がさらに育つ日です。勢いが増す代わりにブレーキが弱まります。",
    neutral: "特に押しも引きもない日です。いつもの流れです。",
  },
  zh: {
    title: "今天的我们",
    tabToday: "今天",
    tabWeek: "本周",
    tabMonth: "本月",
    weekTitle: "本周的我们",
    monthTitle: "本月的我们",
    periodTop: "最多的一天 · {title} {n}天",
    strongLine: "时令托起气的日子 {n}天 / {total}天",
    pickDay: "点日期可查看那一天的详情。",
    periodWho: "这段时间的各位",
    none: "无",
    dayCount: "{n}天",
    dayIsOther: "那天之气",
    whoOther: "那天的各位",
    tryOther: "那天可以试试",
    qPeerStrong: "同气偏旺，容易较劲。",
    qPeerWeak: "同气温和，相处自在。",
    qSupportStrong: "时令助力，能得到的多。",
    qSupportWeak: "只是气偏弱，没有预期那么多。",
    qOutputStrong: "接受方气旺，要付出很多，留出休息。",
    qOutputWeak: "付出负担轻，适合小步开始。",
    qPressureStrong: "压力很强，撑住就够了。",
    qPressureWeak: "压力偏弱，比想象中轻松。",
    qWealthStrong: "要掌控的太多，可能吃力，少贪一点。",
    qWealthWeak: "容易掌控，动手多少就理顺多少。",
    titleFillsGap: "空位迎来客人的一天",
    titleEasesPeak: "倾斜的船找回平衡的一天",
    titleDoublesDown: "擅长的事更出彩的一天",
    titleFeedsPeak: "一帆风顺的一天",
    titleNeutral: "风平浪静的一天",
    seasonProsperous: "{el}之气逢其时令，力量最盛。",
    seasonRising: "时令托起{el}之气，力量上升。",
    seasonResting: "{el}之气为生时令而泄力，偏弱。",
    seasonConfined: "{el}之气与时令相抗，受困。",
    seasonDead: "{el}之气被时令所克，最弱。",
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
    yourDay: "气落在我们分布的哪里", dayIs: "今日之气", who: "今天的各位",
    fillsGap: "这个组合最缺的气进来的一天。适合把一直拖着的话题摊开。",
    easesPeak: "偏多的那股气被压住的一天，比平时不那么一边倒。",
    doublesDown: "本来就强的一侧再叠一层的一天。顺的更顺，卡的更卡。",
    feedsPeak: "强的一侧更旺的一天。势头更足，刹车更弱。",
    neutral: "没有特别推拉的一天，照平常的样子走。",
  },
  fr: {
    title: "Nous aujourd’hui",
    tabToday: "Aujourd’hui",
    tabWeek: "Cette semaine",
    tabMonth: "Ce mois-ci",
    weekTitle: "Nous cette semaine",
    monthTitle: "Nous ce mois-ci",
    periodTop: "Le plus fréquent · {title} ({n})",
    strongLine: "Jours où la saison porte l’énergie : {n} sur {total}",
    pickDay: "Touchez une date pour voir ce jour en détail.",
    periodWho: "Chacun sur la période",
    none: "Aucun",
    dayCount: "{n} j",
    dayIsOther: "L’énergie de ce jour",
    whoOther: "Chacun ce jour-là",
    tryOther: "À essayer ce jour-là",
    qPeerStrong: "L’énergie commune est forte : la rivalité vient vite.",
    qPeerWeak: "L’énergie commune est douce : compagnie facile.",
    qSupportStrong: "La saison soutient : il y a beaucoup à recevoir.",
    qSupportWeak: "L’énergie est faible, attendez-vous à moins.",
    qOutputStrong: "Le côté qui reçoit est fort et demande beaucoup. Gardez du repos.",
    qOutputWeak: "Peu d’exigences : bon jour pour commencer petit.",
    qPressureStrong: "La pression est forte. Tenir suffit.",
    qPressureWeak: "La pression est faible, plus légère qu’elle n’en a l’air.",
    qWealthStrong: "Beaucoup à gérer, cela peut déborder. Réduisez.",
    qWealthWeak: "Facile à gérer : ce que vous touchez se range.",
    titleFillsGap: "Un invité occupe la place vide",
    titleEasesPeak: "Le bateau penché retrouve l’équilibre",
    titleDoublesDown: "Ce que vous faites bien s’améliore encore",
    titleFeedsPeak: "Vent en poupe",
    titleNeutral: "Une journée d’eau calme",
    seasonProsperous: "L’énergie {el} rencontre sa saison : pleine force.",
    seasonRising: "La saison porte l’énergie {el} : sa force monte.",
    seasonResting: "L’énergie {el} s’épuise à nourrir la saison.",
    seasonConfined: "L’énergie {el} est entravée à lutter contre la saison.",
    seasonDead: "La saison écrase l’énergie {el} : elle est faible.",
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
    fillsGap: "Un jour qui apporte ce qui manque le plus au groupe. Bon pour sortir ce qu’on remet à plus tard.",
    easesPeak: "Un jour qui tempère ce dont le groupe a trop. Moins unilatéral que d’habitude.",
    doublesDown: "Un jour qui s’ajoute au point déjà fort. Ce qui marche marche mieux ; ce qui coince coince plus.",
    feedsPeak: "Un jour qui nourrit le côté fort. Plus d’élan, moins de freins.",
    neutral: "Rien ne pousse ni ne tire ce jour-là. Le groupe suit son cours habituel.",
  },
  es: {
    title: "Nosotros hoy",
    tabToday: "Hoy",
    tabWeek: "Esta semana",
    tabMonth: "Este mes",
    weekTitle: "Nosotros esta semana",
    monthTitle: "Nosotros este mes",
    periodTop: "Lo más frecuente · {title} ({n})",
    strongLine: "Días en que la estación impulsa la energía: {n} de {total}",
    pickDay: "Toca una fecha para ver ese día en detalle.",
    periodWho: "Cada uno en el periodo",
    none: "Ninguno",
    dayCount: "{n} días",
    dayIsOther: "La energía de ese día",
    whoOther: "Cada uno ese día",
    tryOther: "Para probar ese día",
    qPeerStrong: "La energía compartida es fuerte: la rivalidad sale fácil.",
    qPeerWeak: "La energía compartida es suave: compañía fácil.",
    qSupportStrong: "La estación respalda: hay mucho que recibir.",
    qSupportWeak: "La energía es débil, espera menos de lo habitual.",
    qOutputStrong: "El lado que recibe es fuerte y pide mucho. Deja tiempo para descansar.",
    qOutputWeak: "Pocas exigencias: buen día para empezar poco a poco.",
    qPressureStrong: "La presión es fuerte. Aguantar basta.",
    qPressureWeak: "La presión es débil, más ligera de lo que parece.",
    qWealthStrong: "Mucho que gestionar, puede desbordar. Reduce.",
    qWealthWeak: "Fácil de gestionar: lo que tocas se ordena.",
    titleFillsGap: "Un invitado ocupa el asiento vacío",
    titleEasesPeak: "El barco inclinado recupera el equilibrio",
    titleDoublesDown: "Lo que hacéis bien sale aún mejor",
    titleFeedsPeak: "Viento en popa",
    titleNeutral: "Un día de agua en calma",
    seasonProsperous: "La energía {el} encuentra su estación: fuerza plena.",
    seasonRising: "La estación impulsa la energía {el}: su fuerza sube.",
    seasonResting: "La energía {el} se gasta alimentando la estación.",
    seasonConfined: "La energía {el} queda atada luchando contra la estación.",
    seasonDead: "La estación aplasta la energía {el}: está débil.",
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
    yourDay: "Dónde cae la energía del día en el grupo", dayIs: "La energía de hoy", who: "Cada uno hoy",
    fillsGap: "Un día que trae justo lo que más le falta al grupo. Bueno para sacar lo que venís aplazando.",
    easesPeak: "Un día que aprieta lo que al grupo le sobra. Menos unilateral que de costumbre.",
    doublesDown: "Un día que se suma al lado ya fuerte. Lo que funciona funciona más; lo que se atasca, más.",
    feedsPeak: "Un día que alimenta el lado fuerte. Más impulso, menos freno.",
    neutral: "Ese día nada empuja ni tira. El grupo va como suele ir.",
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

type Copy = Record<string, string>;
type Tab = "today" | "week" | "month";

/** 날짜를 "9/23(화)" 처럼. 요일은 로케일로 낸다. */
function shortDate(civil: string, lang: Lang): string {
  const [y, m, d] = civil.split("-").map(Number);
  let weekday = "";
  try {
    weekday = new Intl.DateTimeFormat(lang, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
  } catch { /* 요일 없이 */ }
  return weekday ? `${m}/${d}(${weekday})` : `${m}/${d}`;
}

/**
 * 하루치 상세. 오늘 보기와, 주간·월간 달력에서 고른 날이 같은 조각을 쓴다 —
 * 날짜만 다를 뿐 같은 계산(groupToday)이므로 화면도 하나면 된다.
 */
function DayDetail({ day, isToday, synthesis, t, lang }: {
  day: GroupToday; isToday: boolean; synthesis: GroupSynthesis; t: Copy; lang: Lang;
}) {
  const name = (element: FiveElement) => ELEMENT_SYMBOLS[element].name[lang] ?? ELEMENT_SYMBOLS[element].name.en;
  const band = seasonBand(day.season.strength);
  return (
    <div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-muted-foreground">{isToday ? t.dayIs : t.dayIsOther}</span>
        <span className="rounded-full px-3 py-1 text-sm font-black text-white" style={{ backgroundColor: EL_COLOR[day.element] }}>
          {name(day.element)}
        </span>
        <time className="ml-auto text-[11px] font-bold text-muted-foreground" dateTime={day.date}>{shortDate(day.date, lang)}</time>
      </div>

      {/* 그날의 이름. 우리 기운의 별명처럼 한 줄로 먼저 말하고, 설명이 따라온다. */}
      <p className="mt-3 text-xl font-black leading-snug text-foreground">{t[`title${cap(EFFECT_KEY[day.effect])}`]}</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">{t[EFFECT_KEY[day.effect]]}</p>
      {/* 같은 원소라도 계절에 따라 세기가 다르다(월령). 월지는 절기 기준이다. */}
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {t[`season${cap(day.season.strength)}`].replace("{el}", name(day.element))}
      </p>

      {/* 그날의 기운이 모임 분포 어디에 꽂히는지. 막대는 우리 기운과 같은
          자(기저 비율 대비 편차)를 쓰고, 그날의 원소만 테두리로 짚는다. */}
      <div className="mt-4">
        <p className="text-[11px] font-bold text-muted-foreground">{t.yourDay}</p>
        <div className="mt-2 grid grid-cols-5 items-end gap-1.5" style={{ height: "4.5rem" }}>
          {GROUP_ELEMENT_ORDER.map((element) => {
            const off = synthesis.elements.deviation[element];
            const height = Math.max(12, Math.min(100, 50 + off * 20));
            const on = element === day.element;
            return (
              <div key={element} className="flex h-full flex-col items-center justify-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ${on ? "ring-2 ring-offset-2 ring-foreground" : ""}`}
                  style={{ backgroundColor: EL_COLOR[element], height: `${height}%`, opacity: on ? 1 : 0.4 }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1 grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold text-muted-foreground">
          {GROUP_ELEMENT_ORDER.map((element) => (
            <span key={element} className={element === day.element ? "text-foreground" : ""}>{name(element)}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-muted/40 p-3">
        <p className="text-[11px] font-bold text-muted-foreground">{isToday ? t.try : t.tryOther}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{t[`try${cap(EFFECT_KEY[day.effect])}`]}</p>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-bold text-muted-foreground">{isToday ? t.who : t.whoOther}</p>
        <ul className="mt-2 space-y-1.5">
          {day.members.map((item) => {
            // 가장 드문 관점 하나. 해설은 쌍 해설(PAIR_COPY)을 그대로 쓴다.
            const copy = PAIR_COPY[lang][`${item.highlight.id}:${item.highlight.relation}`];
            return (
              <li key={item.id} className="rounded-xl border border-border px-3 py-2">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="min-w-0 truncate font-black text-foreground">{item.label}</span>
                  {/* 이 사람의 일간. 그날과의 관계는 이 글자와 그날 일간 사이에서 나온다. */}
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: EL_COLOR[item.dayMaster] }} title={t.dayMaster}>
                    {name(item.dayMaster)}
                  </span>
                  <span className="ml-auto shrink-0 font-black text-primary-strong">{t[`stance${cap(item.stance)}`]}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-foreground">{t[`do${cap(item.stance)}`]}</p>
                {/* 같은 관계라도 그날 기운이 계절에서 센가 약한가에 따라 뜻이 달라진다 —
                    받는 날에 기운이 약하면 받을 것이 적고, 눌리는 날에 약하면 부담이 덜하다. */}
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t[`q${cap(item.stance)}${cap(band)}`]}</p>
                {copy && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{t.lens} · {copy.label}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** 월요일 시작 요일 머리. 2024-01-01 이 월요일이다. */
function weekdayHeads(lang: Lang): string[] {
  return Array.from({ length: 7 }, (_, index) => {
    try {
      return new Intl.DateTimeFormat(lang, { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + index)));
    } catch {
      return "";
    }
  });
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
  const [todayDate, setTodayDate] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    // 탭을 열어 둔 채 날이 바뀌면 어제를 오늘이라고 말하게 된다. 그래서
    // 다음 자정에 한 번, 그리고 탭으로 돌아올 때마다 날짜를 다시 본다.
    const refresh = () => setTodayDate(localCivilDate());
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
  }, []);

  const period = useMemo(
    () => (todayDate && tab !== "today" ? groupPeriod(synthesis, members, tab, todayDate) : null),
    [todayDate, tab, synthesis, members],
  );
  const focusDate = tab === "today" ? todayDate : selected ?? todayDate;
  const day = useMemo(() => {
    if (!focusDate) return null;
    // 기간 보기라면 이미 계산한 날을 재사용한다.
    return period?.days.find((item) => item.date === focusDate) ?? groupToday(synthesis, members, focusDate);
  }, [focusDate, period, synthesis, members]);

  if (!todayDate || !day) return null;

  const name = (element: FiveElement) => ELEMENT_SYMBOLS[element].name[lang] ?? ELEMENT_SYMBOLS[element].name.en;
  const title = tab === "today" ? t.title : tab === "week" ? t.weekTitle : t.monthTitle;
  const tabs: Tab[] = ["today", "week", "month"];

  // 가장 많은 작용 — 기간 전체의 인상
  const topEffect = period
    ? (Object.entries(period.effectCounts) as [keyof typeof EFFECT_KEY, number][]).reduce((best, cur) => (cur[1] > best[1] ? cur : best))
    : null;

  // 월간 달력은 월요일에서 시작하므로 1일 앞에 빈칸을 둔다.
  const leading = period && period.kind === "month"
    ? ((new Date(`${period.dates[0]}T00:00:00Z`).getUTCDay() || 7) - 1)
    : 0;

  return (
    <section className="mt-6 rounded-[2rem] border border-border bg-card p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-foreground">{title}</h2>
        <div className="flex gap-1 rounded-full bg-muted/50 p-1">
          {tabs.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setSelected(null); }}
              className={`min-h-9 rounded-full px-3 text-xs font-black ${tab === key ? "bg-primary-strong text-white" : "text-muted-foreground"}`}
            >
              {t[`tab${cap(key)}`]}
            </button>
          ))}
        </div>
      </div>

      {period && topEffect && (
        <div className="mt-4">
          <p className="text-sm font-black text-foreground">
            {t.periodTop.replace("{title}", t[`title${cap(EFFECT_KEY[topEffect[0]])}`]).replace("{n}", String(topEffect[1]))}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.strongLine.replace("{n}", String(period.strongDays)).replace("{total}", String(period.dates.length))}
          </p>

          {/* 달력. 칸 색은 그날 일간의 오행, 진하기는 계절 세기다 — 진할수록 계절이
              그날 기운을 밀어 준다. 누르면 아래 상세가 그날로 바뀐다. */}
          <div className="mt-3 grid max-w-md grid-cols-7 gap-1">
            {weekdayHeads(lang).map((head, index) => (
              <span key={`h${index}`} className="text-center text-[10px] font-bold text-muted-foreground">{head}</span>
            ))}
            {Array.from({ length: leading }, (_, index) => <span key={`b${index}`} />)}
            {period.days.map((item) => {
              const strong = seasonBand(item.season.strength) === "strong";
              const isToday = item.date === todayDate;
              const isPicked = item.date === focusDate;
              return (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => setSelected(item.date)}
                  title={`${shortDate(item.date, lang)} · ${t[`title${cap(EFFECT_KEY[item.effect])}`]}`}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg text-[11px] font-black ${isPicked ? "ring-2 ring-foreground" : isToday ? "ring-1 ring-foreground/50" : ""}`}
                  style={{ backgroundColor: EL_COLOR[item.element], opacity: strong ? 0.95 : 0.4, color: "white" }}
                >
                  {Number(item.date.slice(8))}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{t.pickDay}</p>

          {/* 사람별로 받는 날·눌리는 날을 날짜로 — 기간 보기의 쓸모는 "언제"다. */}
          <div className="mt-4">
            <p className="text-[11px] font-bold text-muted-foreground">{t.periodWho}</p>
            <ul className="mt-2 space-y-1.5">
              {period.members.map((member) => (
                <li key={member.id} className="rounded-xl border border-border px-3 py-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-black text-foreground">{member.label}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: EL_COLOR[member.dayMaster] }}>
                      {name(member.dayMaster)}
                    </span>
                  </div>
                  {(["support", "pressure"] as const).map((stance) => (
                    <p key={stance} className="mt-1 leading-relaxed">
                      <span className="font-bold text-primary-strong">{t[`stance${cap(stance)}`]}</span>{" "}
                      <span className="text-foreground">
                        {member.stanceDays[stance].length ? member.stanceDays[stance].map((date) => shortDate(date, lang)).join(" · ") : t.none}
                      </span>
                    </p>
                  ))}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {(["peer", "output", "wealth"] as const)
                      .map((stance) => `${t[`stance${cap(stance)}`]} ${t.dayCount.replace("{n}", String(member.stanceDays[stance].length))}`)
                      .join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <hr className="my-5 border-border" />
        </div>
      )}

      <DayDetail day={day} isToday={day.date === todayDate} synthesis={synthesis} t={t} lang={lang} />
    </section>
  );
}
