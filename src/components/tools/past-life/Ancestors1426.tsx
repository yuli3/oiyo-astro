import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import {
  BASE_YEAR, GEN_YEARS, ORDINARY_CHILDREN, POP, REGIONS, formatAncestors, parseAncestors, summary,
  type AncestorQuery, type GenYears, type Region,
} from "../../../lib/ancestors-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "ancestors-1426" as const;

const HOME: Record<L, Region> = { ko: "joseon", ja: "japan", zh: "ming", en: "england", fr: "france", es: "spain" };

const REGION: Record<Region, Six> = {
  joseon: { ko: "조선", en: "Joseon Korea", ja: "朝鮮", zh: "朝鲜", fr: "Joseon (Corée)", es: "Joseon (Corea)" },
  japan: { ko: "일본(무로마치)", en: "Japan (Muromachi)", ja: "日本（室町）", zh: "日本（室町）", fr: "Japon (Muromachi)", es: "Japón (Muromachi)" },
  ming: { ko: "명나라", en: "Ming China", ja: "明", zh: "明朝", fr: "Chine des Ming", es: "China Ming" },
  england: { ko: "잉글랜드", en: "England", ja: "イングランド", zh: "英格兰", fr: "Angleterre", es: "Inglaterra" },
  france: { ko: "프랑스", en: "France", ja: "フランス", zh: "法国", fr: "France", es: "Francia" },
  spain: { ko: "스페인(카스티야·아라곤)", en: "Spain (Castile and Aragon)", ja: "スペイン（カスティーリャ・アラゴン）", zh: "西班牙（卡斯蒂利亚·阿拉贡）", fr: "Espagne (Castille et Aragon)", es: "España (Castilla y Aragón)" },
};

const SOURCES: Record<Region | "model", { label: string; url: string }[]> = {
  joseon: [{ label: "김재호, 「조선시대의 인구 — 장기 변동」 (한국경제, 2014)", url: "https://sgsg.hankyung.com/article/2014051670741" }],
  japan: [{ label: "Farris (2006), via Demographic history of Japan before the Meiji Restoration", url: "https://en.wikipedia.org/wiki/Demographic_history_of_Japan_before_the_Meiji_Restoration" }],
  ming: [{ label: "Population history of China (modern estimate for 1400)", url: "https://en.wikipedia.org/wiki/Population_history_of_China" }],
  england: [{ label: "Broadberry, Campbell & van Leeuwen, English medieval population (Table 6, 1430)", url: "https://warwick.ac.uk/fac/soc/economics/seminars/seminars/conferences/venice3/programme/english_medieval_population.pdf" }],
  france: [{ label: "Larousse, « France : population »", url: "https://www.larousse.fr/encyclopedie/divers/France_population/185980" }],
  spain: [{ label: "Breve historia de la España moderna 1474–1808 (Alianza), cap. 1", url: "https://www.alianzaeditorial.es/primer_capitulo/breve-historia-de-la-espana-moderna-1474-1808.pdf" }],
  model: [
    { label: "Rohde, Olson & Chang (2004), Nature — press release", url: "https://www.eurekalert.org/news-releases/745823" },
    { label: "Identical ancestors point (Chang's model)", url: "https://en.wikipedia.org/wiki/Identical_ancestors_point" },
  ],
};

const C = {
  regionLabel: { ko: "어느 땅의 1426년으로 갈까요?", en: "Which land in 1426?", ja: "どこの1426年へ？", zh: "去哪片土地的1426年？", fr: "Quelle terre en 1426 ?", es: "¿Qué tierra en 1426?" },
  genLabel: { ko: "한 세대를 몇 년으로 볼까요?", en: "Years per generation", ja: "一世代を何年とする？", zh: "一代按多少年算？", fr: "Années par génération", es: "Años por generación" },
  genUnit: { ko: "년", en: " yrs", ja: "年", zh: "年", fr: " ans", es: " años" },
  genNote: { ko: "세대 길이는 가정이에요. 짧게 잡을수록 세대가 늘고 조상 칸이 빠르게 불어나요.", en: "Generation length is an assumption. Shorter generations mean more of them and far more slots.", ja: "世代の長さは仮定です。短いほど世代が増え、枠が急に増えます。", zh: "代际长度是假设。越短代数越多，祖先格子增长越快。", fr: "La durée d'une génération est une hypothèse : plus elle est courte, plus les cases explosent.", es: "La duración de una generación es una suposición: cuanto más corta, más casillas." },
  go: { ko: "내 조상 세어 보기", en: "Count my ancestors", ja: "祖先を数える", zh: "数一数我的祖先", fr: "Compter mes ancêtres", es: "Contar mis antepasados" },
  heroKicker: { ko: "{year}년생 당신, 1426년까지", en: "Born {year}, back to 1426:", ja: "{year}年生まれのあなた、1426年まで", zh: "{year}年出生的你，回到1426年", fr: "Né(e) en {year}, jusqu'en 1426 :", es: "Nacido en {year}, hasta 1426:" },
  heroGen: { ko: "{g}세대 위", en: "{g} generations up", ja: "{g}世代さかのぼる", zh: "往上{g}代", fr: "{g} générations", es: "{g} generaciones" },
  heroSlots: { ko: "족보 칸 {n}칸", en: "{n} slots in your tree", ja: "家系図の枠 {n}", zh: "家谱格子 {n} 个", fr: "{n} cases dans l'arbre", es: "{n} casillas en tu árbol" },
  realTitle: { ko: "칸은 많지만, 사람은 겹쳐요", en: "Many slots, overlapping people", ja: "枠は多いが、人は重なる", zh: "格子很多，人却重叠", fr: "Beaucoup de cases, des gens qui se répètent", es: "Muchas casillas, personas repetidas" },
  realBody: { ko: "모델로 계산하면 서로 다른 조상은 약 {n}명이에요. 같은 사람이 평균 {x}칸에 들어가요.", en: "The model gives about {n} distinct ancestors: on average each fills {x} slots.", ja: "モデルでは異なる祖先は約{n}人。一人が平均{x}枠に入ります。", zh: "按模型计算，不同的祖先约{n}人，平均每人占{x}个格子。", fr: "Le modèle donne environ {n} ancêtres distincts : chacun occupe en moyenne {x} cases.", es: "El modelo da unos {n} antepasados distintos: cada uno ocupa de media {x} casillas." },
  realShare: { ko: "1426년 {region} 인구 약 {pop}명 가운데 {pct}가 당신의 조상이에요.", en: "That is {pct} of the roughly {pop} people of {region} in 1426.", ja: "1426年の{region}の人口約{pop}人のうち{pct}があなたの祖先です。", zh: "约占1426年{region}人口{pop}人的{pct}。", fr: "Soit {pct} des quelque {pop} habitants de {region} en 1426.", es: "Es el {pct} de unos {pop} habitantes de {region} en 1426." },
  oneIn: { ko: "그때 사람 {n}명 중 1명꼴", en: "about 1 in {n} people alive then", ja: "当時の{n}人に1人", zh: "当时约每{n}人中有1人", fr: "environ 1 personne sur {n}", es: "alrededor de 1 de cada {n} personas" },
  chartTitle: { ko: "세대를 거슬러 올라갈수록", en: "Generation by generation", ja: "世代をさかのぼるほど", zh: "一代代往上", fr: "Génération après génération", es: "Generación tras generación" },
  chartSlots: { ko: "족보 칸(2ⁿ)", en: "Slots (2ⁿ)", ja: "家系図の枠（2ⁿ）", zh: "格子（2ⁿ）", fr: "Cases (2ⁿ)", es: "Casillas (2ⁿ)" },
  chartReal: { ko: "서로 다른 조상(모델)", en: "Distinct ancestors (model)", ja: "異なる祖先（モデル）", zh: "不同祖先（模型）", fr: "Ancêtres distincts (modèle)", es: "Antepasados distintos (modelo)" },
  chartPop: { ko: "1426년 인구", en: "Population in 1426", ja: "1426年の人口", zh: "1426年人口", fr: "Population en 1426", es: "Población en 1426" },
  chartNote: { ko: "세로축은 10배씩 늘어나는 눈금이에요. 두 선이 갈라지는 곳부터 같은 조상이 여러 번 나와요.", en: "The vertical axis grows tenfold per step. Where the lines part, the same ancestors start to repeat.", ja: "縦軸は10倍ずつの目盛り。2本の線が離れるところから同じ祖先が何度も現れます。", zh: "纵轴每格放大10倍。两条线分开处起，同一祖先开始重复出现。", fr: "L'axe vertical est multiplié par dix à chaque graduation. Là où les courbes se séparent, les mêmes ancêtres reviennent.", es: "El eje vertical se multiplica por diez en cada marca. Donde las líneas se separan, los mismos antepasados se repiten." },
  farTitle: { ko: "1,000년 전으로 가면", en: "Go back 1,000 years", ja: "1000年前まで行くと", zh: "回到1000年前", fr: "Remontez 1 000 ans", es: "Retrocede 1.000 años" },
  farBody: { ko: "{g}세대 위, 족보 칸은 {slots}칸으로 그때 인구의 {x}배예요. 칸을 채우려면 같은 사람이 수천, 수만 번 들어가야 해요. 모델상 그때 사람 {pct}가 당신의 조상이에요.", en: "{g} generations up the tree has {slots} slots, {x} times the population then. The same people must fill them thousands of times over; in the model {pct} of everyone then is your ancestor.", ja: "{g}世代上で枠は{slots}、当時の人口の{x}倍。同じ人が何千回も入らないと埋まりません。モデルでは当時の人の{pct}があなたの祖先です。", zh: "往上{g}代，格子有{slots}个，是当时人口的{x}倍。同一个人要重复出现成千上万次。按模型，当时{pct}的人都是你的祖先。", fr: "À {g} générations, l'arbre compte {slots} cases, {x} fois la population d'alors. Les mêmes personnes doivent les remplir des milliers de fois ; dans le modèle, {pct} des gens d'alors sont vos ancêtres.", es: "A {g} generaciones, el árbol tiene {slots} casillas, {x} veces la población de entonces. Las mismas personas deben llenarlas miles de veces; en el modelo, el {pct} de la gente de entonces es antepasado tuyo." },
  farNote: { ko: "1426년보다 앞선 인구는 1426년 값으로 고정했어요.", en: "Population before 1426 is held at the 1426 value.", ja: "1426年より前の人口は1426年の値に固定しています。", zh: "1426年以前的人口固定为1426年的数值。", fr: "Avant 1426, la population est fixée à sa valeur de 1426.", es: "Antes de 1426, la población se fija en el valor de 1426." },
  famousTitle: { ko: "세종의 후손일 확률", en: "Odds you descend from King Sejong", ja: "世宗の子孫である確率", zh: "你是世宗后代的概率", fr: "Chances de descendre du roi Sejong", es: "Probabilidad de descender del rey Sejong" },
  famousBody: { ko: "세종은 1426년 조선의 왕이었고 자녀가 22명(18남 4녀)이었어요. 무작위로 짝을 맺는 모델에서는 당신이 세종의 후손일 확률이 {pct}예요.", en: "Sejong ruled Joseon in 1426 and had 22 children (18 sons, 4 daughters). In a random-mating model the chance you descend from him is {pct}.", ja: "世宗は1426年の朝鮮の王で、子は22人（18男4女）。無作為に結婚するモデルでは、あなたが世宗の子孫である確率は{pct}です。", zh: "世宗是1426年的朝鲜国王，有22个子女（18男4女）。在随机婚配模型中，你是世宗后代的概率为{pct}。", fr: "Sejong régnait sur Joseon en 1426 et eut 22 enfants (18 fils, 4 filles). Dans un modèle d'unions au hasard, la probabilité que vous descendiez de lui est de {pct}.", es: "Sejong reinaba en Joseon en 1426 y tuvo 22 hijos (18 varones, 4 mujeres). En un modelo de uniones al azar, la probabilidad de que desciendas de él es del {pct}." },
  ordinaryTitle: { ko: "1426년의 평범한 한 사람이라면", en: "An ordinary person of 1426", ja: "1426年のふつうの一人なら", zh: "如果是1426年的普通人", fr: "Une personne ordinaire de 1426", es: "Una persona corriente de 1426" },
  ordinaryBody: { ko: "자녀 {c}명을 두고 후손이 끊기지 않은 {region} 사람이라면, 그 사람이 당신의 조상일 확률은 {pct}예요.", en: "Someone in {region} with {c} children whose line never broke would be your ancestor with probability {pct}.", ja: "子が{c}人いて子孫が途絶えなかった{region}の人なら、その人があなたの祖先である確率は{pct}です。", zh: "一个有{c}个子女、后代从未断绝的{region}人，是你祖先的概率为{pct}。", fr: "Une personne de {region} ayant eu {c} enfants et une lignée jamais interrompue serait votre ancêtre avec une probabilité de {pct}.", es: "Alguien de {region} con {c} hijos y una línea nunca interrumpida sería antepasado tuyo con una probabilidad del {pct}." },
  commonTitle: { ko: "모두의 공통 조상은 언제?", en: "When is everyone's common ancestor?", ja: "みんなの共通祖先はいつ？", zh: "所有人的共同祖先在何时？", fr: "À quand l'ancêtre commun de tous ?", es: "¿Cuándo vivió el antepasado común de todos?" },
  commonBody: { ko: "같은 모델(Chang)에서 {region} 사람 모두의 가장 가까운 공통 조상은 {mrca}년 무렵에 살았어요. {iap}년 무렵으로 가면, 그때 후손을 남긴 사람은 모두가 지금 모든 사람의 조상이에요.", en: "In the same model (Chang), the most recent common ancestor of everyone from {region} lived around {mrca}. By about {iap}, everyone then who left descendants is an ancestor of everyone now.", ja: "同じモデル（Chang）では、{region}の人みんなの最も近い共通祖先は{mrca}年ごろ。{iap}年ごろまで行くと、子孫を残した人は全員が今のすべての人の祖先です。", zh: "在同一模型（Chang）中，{region}所有人最近的共同祖先生活在{mrca}年前后。到约{iap}年，当时留下后代的人都是今天所有人的祖先。", fr: "Dans le même modèle (Chang), l'ancêtre commun le plus récent de tous les habitants de {region} vivait vers {mrca}. Vers {iap}, toute personne ayant laissé une descendance est l'ancêtre de tous aujourd'hui.", es: "En el mismo modelo (Chang), el antepasado común más reciente de toda la gente de {region} vivió hacia {mrca}. Hacia {iap}, todo el que dejó descendencia es antepasado de todos hoy." },
  caveat: { ko: "이 숫자는 모두 '아무하고나 짝을 맺는' 단순 모델이에요. 실제로는 마을·신분·바다로 덜 섞여서 겹침은 더 일찍, 공통 조상은 더 늦게 나타나요. 실제 족보나 본관을 보여주지 않아요.", en: "All of this is a simple 'anyone may marry anyone' model. Real people mixed less (villages, classes, seas), so overlaps come sooner and common ancestors later. No real genealogy is used.", ja: "これは「誰とでも結婚しうる」単純なモデルです。実際は村・身分・海で混ざりにくく、重なりはより早く、共通祖先はより遅く現れます。実際の族譜は使いません。", zh: "以上都是“任何人都可能和任何人结婚”的简单模型。现实中因村落、身份、海洋而混合较少，重叠更早出现，共同祖先更晚。不使用真实家谱。", fr: "Tout ceci repose sur un modèle simple où « chacun peut épouser n'importe qui ». En réalité on se mélangeait moins (villages, rangs, mers) : les recoupements arrivent plus tôt et l'ancêtre commun plus tard. Aucune généalogie réelle n'est utilisée.", es: "Todo esto es un modelo simple en el que «cualquiera puede casarse con cualquiera». En realidad la gente se mezclaba menos (aldeas, clases, mares): las repeticiones llegan antes y el antepasado común después. No se usa ninguna genealogía real." },
  popNote: { ko: "인구는 반올림한 추정치예요. 지금 인구도 반올림 값이고, 그 사이 세대 인구는 두 값 사이를 고르게 늘린 가정이에요.", en: "Populations are rounded estimates; generations in between grow smoothly from one to the other (an assumption).", ja: "人口は丸めた推計値。間の世代は二つの値の間でなめらかに増える仮定です。", zh: "人口为四舍五入的估计值，中间各代按两端数值平滑增长（假设）。", fr: "Les populations sont des estimations arrondies ; entre les deux, la croissance est supposée régulière.", es: "Las poblaciones son estimaciones redondeadas; entre ambas, el crecimiento se supone regular." },
  cardKicker: { ko: "1426 · 내 조상은 몇 명?", en: "1426 · How many ancestors?", ja: "1426・祖先は何人？", zh: "1426·我的祖先有多少？", fr: "1426 · Combien d'ancêtres ?", es: "1426 · ¿Cuántos antepasados?" },
  cardTitle: { ko: "조상 약 {n}명", en: "About {n} ancestors", ja: "祖先 約{n}人", zh: "祖先约{n}人", fr: "Environ {n} ancêtres", es: "Unos {n} antepasados" },
  modelBadge: { ko: "모델 계산", en: "Model estimate", ja: "モデル計算", zh: "模型估算", fr: "Estimation par modèle", es: "Estimación por modelo" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

function pctText(x: number, l: L): string {
  const nf = new Intl.NumberFormat(l === "zh" ? "zh-CN" : l, { style: "percent", maximumFractionDigits: x < 0.01 ? 2 : x < 0.1 ? 1 : 0 });
  if (x >= 0.995) return `${nf.format(0.99)}+`;
  return nf.format(x);
}

function compact(n: number, l: L): string {
  return new Intl.NumberFormat(l === "zh" ? "zh-CN" : l, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function Chart({ curve, g, region, year, gen, l }: { curve: number[]; g: number; region: Region; year: number; gen: number; l: L }) {
  const W = 320;
  const H = 200;
  const pad = 28;
  const last = curve.length - 1;
  const top = Math.ceil(Math.log10(2 ** last));
  const x = (k: number) => pad + (k / last) * (W - pad - 8);
  const y = (v: number) => H - pad - (Math.log10(Math.max(1, v)) / top) * (H - pad - 8);
  const path = (vals: number[]) => vals.map((v, k) => `${k ? "L" : "M"}${x(k).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const slotVals = curve.map((_, k) => 2 ** k);
  const popY = y(POP[region].then);
  const ticks = [0, 3, 6, 9, 12].filter((t) => t <= top);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={pick(C.chartTitle, l)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad} x2={W - 8} y1={y(10 ** t)} y2={y(10 ** t)} className="stroke-border" strokeWidth={1} />
            <text x={pad - 4} y={y(10 ** t) + 3} textAnchor="end" fontSize={8} className="fill-muted-foreground">{t === 0 ? "1" : `10${["", "", "", "³", "", "", "⁶", "", "", "⁹", "", "", "¹²"][t]}`}</text>
          </g>
        ))}
        <line x1={pad} x2={W - 8} y1={popY} y2={popY} className="stroke-destructive" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={x(g)} x2={x(g)} y1={8} y2={H - pad} className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="2 3" />
        <path d={path(slotVals)} fill="none" className="stroke-muted-foreground" strokeWidth={2} strokeDasharray="5 4" />
        <path d={path(curve)} fill="none" className="stroke-primary" strokeWidth={3} />
        <circle cx={x(g)} cy={y(curve[g])} r={4} className="fill-primary" />
        <text x={x(0)} y={H - 10} fontSize={9} className="fill-muted-foreground">{year}</text>
        <text x={x(g)} y={H - 10} fontSize={9} textAnchor="middle" className="fill-foreground">{BASE_YEAR}</text>
        <text x={x(last)} y={H - 10} fontSize={9} textAnchor="end" className="fill-muted-foreground">{year - last * gen}</text>
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-muted-foreground">
        <span><span aria-hidden="true">┅ </span>{pick(C.chartSlots, l)}</span>
        <span className="text-primary"><span aria-hidden="true">━ </span>{pick(C.chartReal, l)}</span>
        <span className="text-destructive"><span aria-hidden="true">┄ </span>{pick(C.chartPop, l)}</span>
      </figcaption>
    </figure>
  );
}

export default function Ancestors1426({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [region, setRegion] = useState<Region>(HOME[l]);
  const [gen, setGen] = useState<GenYears>(28);
  const [query, setQuery] = useState<AncestorQuery | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseAncestors(window.location.search);
    if (shared) {
      setQuery(shared);
      setRegion(shared.region);
      setGen(shared.gen);
    }
  }, []);

  function show(year: number) {
    funnel("birthday");
    const next = { year, gen, region };
    warp.start(() => {
      setQuery(next);
      setRound((r) => r + 1);
      setShareQuery(formatAncestors(next));
      stampEpisode(EP);
    });
  }

  const s = query ? summary(query) : null;
  const regionName = query ? pick(REGION[query.region], l) : "";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={BASE_YEAR} l={l} onDone={warp.finish} />}

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-bold text-foreground">{pick(C.regionLabel, l)}</p>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <Button key={r} variant={r === region ? "default" : "outline"} aria-pressed={r === region} className="min-h-11" onClick={() => setRegion(r)}>
              {pick(REGION[r], l)}
            </Button>
          ))}
        </div>
        <p className="pt-2 text-sm font-bold text-foreground">{pick(C.genLabel, l)}</p>
        <div className="flex gap-2">
          {GEN_YEARS.map((g) => (
            <Button key={g} variant={g === gen ? "default" : "outline"} aria-pressed={g === gen} className="min-h-11 flex-1" onClick={() => setGen(g)}>
              {g}
              {pick(C.genUnit, l)}
            </Button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{pick(C.genNote, l)}</p>
      </section>

      <BirthdayPicker l={l} cta={pick(C.go, l)} onSubmit={(b) => show(Number(b.slice(0, 4)))} />

      {query && s && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{fill(pick(C.heroKicker, l), { year: query.year })}</p>
            <p className="mt-2 text-lg font-bold text-foreground">{fill(pick(C.heroGen, l), { g: s.g })}</p>
            <p className="mt-1 font-serif text-4xl font-black text-foreground">{fill(pick(C.heroSlots, l), { n: fmt.format(s.slots) })}</p>
            <p className="mt-3 text-base font-black text-primary">{fill(pick(C.cardTitle, l), { n: fmt.format(s.distinct) })}</p>
          </section>

          <Panel label={pick(C.realTitle, l)}>
            <p>{fill(pick(C.realBody, l), { n: fmt.format(s.distinct), x: s.overlap.toFixed(2) })}</p>
            <p className="text-lg font-bold">{fill(pick(C.realShare, l), { region: regionName, pop: fmt.format(POP[query.region].then), pct: pctText(s.shareOfThen, l) })}</p>
            <p>{fill(pick(C.oneIn, l), { n: fmt.format(Math.max(1, Math.round(1 / s.shareOfThen))) })}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.popNote, l)}</p>
            <Sources l={l} items={SOURCES[query.region]} />
          </Panel>

          <Panel label={pick(C.chartTitle, l)}>
            <Chart curve={s.curve} g={s.g} region={query.region} year={query.year} gen={query.gen} l={l} />
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.chartNote, l)}</p>
          </Panel>

          {s.famous !== null && (
            <Panel label={pick(C.famousTitle, l)}>
              <p className="text-3xl font-black">{pctText(s.famous, l)}</p>
              <p>{fill(pick(C.famousBody, l), { pct: pctText(s.famous, l) })}</p>
            </Panel>
          )}

          <Panel label={pick(C.ordinaryTitle, l)}>
            <p className="text-3xl font-black">{pctText(s.ordinary, l)}</p>
            <p>{fill(pick(C.ordinaryBody, l), { c: ORDINARY_CHILDREN, region: regionName, pct: pctText(s.ordinary, l) })}</p>
          </Panel>

          <Panel label={pick(C.farTitle, l)}>
            <p>{fill(pick(C.farBody, l), { g: s.far, slots: compact(s.farSlots, l), x: fmt.format(Math.round(s.farSlots / POP[query.region].then)), pct: pctText(s.farDistinct / POP[query.region].then, l) })}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.farNote, l)}</p>
          </Panel>

          <Panel label={pick(C.commonTitle, l)}>
            <p>{fill(pick(C.commonBody, l), { region: regionName, mrca: s.mrcaYear, iap: s.iapYear })}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.caveat, l)}</p>
            <Sources l={l} items={SOURCES.model} />
          </Panel>

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-ancestors-1426-${query.region}-${query.year}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: fill(pick(C.cardTitle, l), { n: compact(s.distinct, l) }),
              subtitle: `${regionName} · ${fill(pick(C.heroGen, l), { g: s.g })}`,
              badge: s.famous !== null ? `${pick(C.famousTitle, l)} ${pctText(s.famous, l)}` : `${pctText(s.shareOfThen, l)} · ${pick(C.modelBadge, l)}`,
              lines: [fill(pick(C.heroSlots, l), { n: fmt.format(s.slots) }), fill(pick(C.oneIn, l), { n: fmt.format(Math.max(1, Math.round(1 / s.shareOfThen))) })],
              footer: "oiyo.net · 1426",
              accent: "#2f5d50",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
