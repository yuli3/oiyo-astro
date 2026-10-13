import { useState } from "react";
import type { Locale } from "../../i18n";
import { displayCountryName, type ReincarnationCountry as Country } from "../../lib/reincarnation";
import {
  LIFE_STATS_META,
  lifeMap,
  lifeStatsFor,
  oneInChildren,
  phaseYears,
  type LifePhase,
  type LifeStats,
} from "../../lib/reincarnation-life";
import ReincarnationStages from "./ReincarnationStages";

/**
 * 환생 결과 아래에 붙는 "그다음 삶": 탄생 카드, 인생 지도 100칸, 같은 1초에 태어난 4명.
 * 2026-10-13 세운이 고른 1in8b.life 참고 1차 묶음. 나라 평균을 보여 줄 뿐 한 사람의
 * 삶을 예측하지 않는다. 아동 사망 같은 무거운 숫자는 꾸미지 않고 숫자 그대로 쓴다.
 */

interface Props {
  locale: Locale;
  country: Country;
  home: Country;
  sameSecond: Country[];
  onSelect: (row: Country) => void;
}

type Copy = Record<Locale, string>;

const COPY = {
  card: { ko: "탄생 카드", en: "Birth card", ja: "誕生カード", zh: "出生卡", fr: "Carte de naissance", es: "Tarjeta de nacimiento" },
  cardNote: {
    ko: "이 나라에서 태어난 사람의 평균이에요. 한 사람의 삶을 예측하지 않아요.",
    en: "These are averages for people born in this country. They do not predict any one life.",
    ja: "この国で生まれた人の平均です。一人の人生を予測するものではありません。",
    zh: "这是该国出生者的平均值，不预测任何一个人的人生。",
    fr: "Ce sont des moyennes pour ce pays. Elles ne prédisent aucune vie en particulier.",
    es: "Son promedios de este país. No predicen ninguna vida concreta.",
  },
  lifeExpectancy: { ko: "기대수명", en: "Life expectancy", ja: "平均寿命", zh: "预期寿命", fr: "Espérance de vie", es: "Esperanza de vida" },
  childMortality: { ko: "5살이 되기 전", en: "Before age 5", ja: "5歳になる前", zh: "5岁之前", fr: "Avant 5 ans", es: "Antes de los 5 años" },
  schooling: { ko: "평균 교육", en: "Schooling", ja: "平均教育年数", zh: "平均受教育", fr: "Scolarité", es: "Escolaridad" },
  dailyIncome: { ko: "하루 소득 중간값", en: "Median daily income", ja: "1日の所得の中央値", zh: "每日收入中位数", fr: "Revenu médian par jour", es: "Ingreso diario mediano" },
  internet: { ko: "인터넷 사용", en: "Internet use", ja: "インターネット利用", zh: "使用互联网", fr: "Usage d’Internet", es: "Uso de internet" },
  years: { ko: "{n}년", en: "{n} years", ja: "{n}年", zh: "{n}年", fr: "{n} ans", es: "{n} años" },
  childOneIn: { ko: "아이 {n}명 중 1명이 세상을 떠나요", en: "1 in {n} children dies", ja: "子ども{n}人に1人が亡くなります", zh: "每{n}个孩子中有1个夭折", fr: "1 enfant sur {n} meurt", es: "Muere 1 de cada {n} niños" },
  people: { ko: "인구의 {n}%", en: "{n}% of people", ja: "人口の{n}%", zh: "人口的{n}%", fr: "{n} % de la population", es: "{n}% de la población" },
  dollars: { ko: "하루 ${n}", en: "${n} a day", ja: "1日${n}", zh: "每天${n}", fr: "{n} $ par jour", es: "${n} al día" },
  incomeYear: { ko: "{y}년 조사, 2021년 물가 기준", en: "{y} survey, 2021 prices", ja: "{y}年調査・2021年価格", zh: "{y}年调查，2021年价格", fr: "enquête {y}, prix 2021", es: "encuesta {y}, precios de 2021" },
  noData: { ko: "자료 없음", en: "No data", ja: "データなし", zh: "无数据", fr: "Pas de données", es: "Sin datos" },
  homeValue: { ko: "{home}: {v}", en: "{home}: {v}", ja: "{home}: {v}", zh: "{home}：{v}", fr: "{home} : {v}", es: "{home}: {v}" },
  save: { ko: "카드 이미지 저장·공유", en: "Save or share the card", ja: "カード画像を保存・共有", zh: "保存或分享卡片", fr: "Enregistrer ou partager la carte", es: "Guardar o compartir la tarjeta" },
  map: { ko: "인생 지도 100칸", en: "Life in 100 squares", ja: "人生マップ100マス", zh: "人生地图100格", fr: "Une vie en 100 cases", es: "La vida en 100 casillas" },
  mapNote: {
    ko: "1칸이 1년이에요. 평균 기대수명과 평균 교육 연수로만 나눈 그림이라, 실제 삶은 이보다 짧거나 길어요.",
    en: "One square is one year, split only by average life expectancy and schooling. Real lives run shorter or longer.",
    ja: "1マスが1年です。平均寿命と平均教育年数だけで分けた図で、実際の人生はこれより短くも長くもなります。",
    zh: "一格是一年，只按平均寿命和平均受教育年数划分，真实人生会更短或更长。",
    fr: "Une case par an, découpée seulement selon l’espérance de vie et la scolarité moyennes. Les vraies vies sont plus courtes ou plus longues.",
    es: "Cada casilla es un año, dividida solo por la esperanza de vida y la escolaridad medias. Las vidas reales son más cortas o más largas.",
  },
  early: { ko: "어린 시절", en: "Early years", ja: "幼少期", zh: "幼年", fr: "Petite enfance", es: "Primera infancia" },
  school: { ko: "학교", en: "School", ja: "学校", zh: "上学", fr: "École", es: "Escuela" },
  work: { ko: "일하는 시기", en: "Working years", ja: "働く時期", zh: "工作期", fr: "Vie active", es: "Vida laboral" },
  later: { ko: "65세 뒤", en: "After 65", ja: "65歳以降", zh: "65岁以后", fr: "Après 65 ans", es: "Después de los 65" },
  beyond: { ko: "평균 수명 뒤", en: "Past the average", ja: "平均寿命の先", zh: "超过平均寿命", fr: "Au-delà de la moyenne", es: "Más allá del promedio" },
  sameSecond: { ko: "같은 1초에 태어난 4명", en: "Four others born in the same second", ja: "同じ1秒に生まれた4人", zh: "同一秒出生的另外4人", fr: "Quatre autres nés la même seconde", es: "Otros cuatro nacidos en el mismo segundo" },
  sameSecondNote: {
    ko: "세계에서는 1초에 아기가 약 4명 태어나요. 출생 비중대로 뽑은 같은 순간의 다른 삶이에요.",
    en: "About four babies are born every second. These are other lives from that same moment, drawn by birth share.",
    ja: "世界では1秒に約4人の赤ちゃんが生まれます。出生比重で選んだ、同じ瞬間の別の人生です。",
    zh: "全球每秒约有4个婴儿出生。这是按出生比重抽出的同一时刻的其他人生。",
    fr: "Environ quatre bébés naissent chaque seconde. Voici d’autres vies du même instant, tirées selon la part des naissances.",
    es: "Nacen unos cuatro bebés por segundo. Estas son otras vidas de ese mismo instante, sorteadas según la proporción de nacimientos.",
  },
  storyBorn: { ko: "당신은 {country}에서 태어났어요.", en: "You were born in {country}.", ja: "あなたは{country}に生まれました。", zh: "你出生在{country}。", fr: "Cette fois, vous naissez : {country}.", es: "Naciste en {country}." },
  storyLife: { ko: "이곳 사람들은 평균 {n}년을 살아요.", en: "People here live {n} years on average.", ja: "ここの人は平均{n}年生きます。", zh: "这里的人平均活{n}岁。", fr: "Ici, on vit en moyenne {n} ans.", es: "Aquí la gente vive {n} años de media." },
  storyLonger: { ko: "{home}보다 {d}년 길어요.", en: "That’s {d} years longer than {home}.", ja: "{home}より{d}年長いです。", zh: "比{home}长{d}年。", fr: "C’est {d} ans de plus que pour {home}.", es: "Son {d} años más que en {home}." },
  storyShorter: { ko: "{home}보다 {d}년 짧아요.", en: "That’s {d} years shorter than {home}.", ja: "{home}より{d}年短いです。", zh: "比{home}短{d}年。", fr: "C’est {d} ans de moins que pour {home}.", es: "Son {d} años menos que en {home}." },
  storyChildHigh: {
    ko: "같은 해 태어난 아이 {n}명 중 1명은 다섯 살 생일을 맞지 못해요.",
    en: "Of the children born the same year, 1 in {n} won’t reach a fifth birthday.",
    ja: "同じ年に生まれた子どもの{n}人に1人は、5歳の誕生日を迎えられません。",
    zh: "同年出生的孩子里，每{n}个就有1个活不到5岁生日。",
    fr: "Parmi les enfants nés la même année, 1 sur {n} n’atteindra pas ses cinq ans.",
    es: "De los niños nacidos ese año, 1 de cada {n} no llegará a cumplir cinco años.",
  },
  storyChildLow: {
    ko: "다섯 살 전에 세상을 떠나는 아이는 {n}명 중 1명뿐이에요.",
    en: "Only 1 child in {n} dies before age five.",
    ja: "5歳になる前に亡くなる子どもは{n}人に1人だけです。",
    zh: "5岁前夭折的孩子只有{n}分之一。",
    fr: "Seul 1 enfant sur {n} meurt avant cinq ans.",
    es: "Solo 1 de cada {n} niños muere antes de los cinco años.",
  },
  storyAdult: {
    ko: "어른이 되면 하루 ${x} 정도로 살아가고, 열 명 중 {k}명은 인터넷을 써요.",
    en: "As an adult you’d live on about ${x} a day, and {k} in 10 people around you use the internet.",
    ja: "大人になると1日${x}ほどで暮らし、10人中{k}人がインターネットを使います。",
    zh: "长大后每天大约靠${x}生活，身边10个人里有{k}个上网。",
    fr: "Adulte, vous vivriez avec environ {x} $ par jour, et {k} personnes sur 10 autour de vous utilisent Internet.",
    es: "De adulto vivirías con unos ${x} al día, y {k} de cada 10 personas a tu alrededor usan internet.",
  },
  source: { ko: "출처", en: "Source", ja: "出典", zh: "来源", fr: "Source", es: "Fuente" },
} satisfies Record<string, Copy>;

const PHASES: LifePhase[] = ["early", "school", "work", "later", "beyond"];

// 캔버스 이미지에는 CSS 토큰을 쓸 수 없어 같은 계열의 값을 적는다(global.css chart-3/8/2/7, muted).
const PHASE_HEX: Record<LifePhase, string> = {
  early: "#b39f4a",
  school: "#3f87a3",
  work: "#5e9a6a",
  later: "#c4853f",
  beyond: "#e4e9da",
};

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

function num(n: number, locale: Locale, digits = 1): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale, { maximumFractionDigits: digits }).format(n);
}

type StatLine = { key: keyof typeof COPY; value: string | null; sub?: string };

function statLines(stats: LifeStats, locale: Locale): StatLine[] {
  const children = oneInChildren(stats.childMortality);
  return [
    {
      key: "lifeExpectancy",
      value: stats.lifeExpectancy !== undefined ? fill(COPY.years[locale], { n: num(stats.lifeExpectancy, locale) }) : null,
    },
    { key: "childMortality", value: children !== null ? fill(COPY.childOneIn[locale], { n: num(children, locale, 0) }) : null },
    { key: "schooling", value: stats.schooling !== undefined ? fill(COPY.years[locale], { n: num(stats.schooling, locale) }) : null },
    {
      key: "dailyIncome",
      value: stats.dailyIncome !== undefined ? fill(COPY.dollars[locale], { n: num(stats.dailyIncome, locale, stats.dailyIncome < 10 ? 2 : 0) }) : null,
      sub: stats.dailyIncomeYear ? fill(COPY.incomeYear[locale], { y: String(stats.dailyIncomeYear) }) : undefined,
    },
    { key: "internet", value: stats.internet !== undefined ? fill(COPY.people[locale], { n: num(stats.internet, locale, 0) }) : null },
  ];
}

// 2026-10-13 세운: "흥미·호기심을 높이되 자연스러운 문체". 표보다 먼저 읽히는 두세 문장.
// 아동 사망은 50명 중 1명보다 흔하면 그대로 말하고, 드물면 "뿐"으로 말한다. 꾸미지 않는다.
function story(stats: LifeStats, homeStats: LifeStats, name: string, homeName: string, isHome: boolean, locale: Locale): string[] {
  const out = [fill(COPY.storyBorn[locale], { country: name })];
  if (stats.lifeExpectancy !== undefined) {
    let line = fill(COPY.storyLife[locale], { n: num(stats.lifeExpectancy, locale, 0) });
    const diff = homeStats.lifeExpectancy !== undefined ? Math.round(stats.lifeExpectancy - homeStats.lifeExpectancy) : 0;
    if (!isHome && Math.abs(diff) >= 1) {
      line += ` ${fill((diff > 0 ? COPY.storyLonger : COPY.storyShorter)[locale], { home: homeName, d: String(Math.abs(diff)) })}`;
    }
    out.push(line);
  }
  const children = oneInChildren(stats.childMortality);
  if (children !== null) {
    out.push(fill((children <= 50 ? COPY.storyChildHigh : COPY.storyChildLow)[locale], { n: num(children, locale, 0) }));
  }
  if (stats.dailyIncome !== undefined && stats.internet !== undefined) {
    out.push(fill(COPY.storyAdult[locale], {
      x: num(stats.dailyIncome, locale, stats.dailyIncome < 10 ? 1 : 0),
      k: String(Math.round(stats.internet / 10)),
    }));
  }
  return out;
}

function phaseClass(phase: LifePhase | null): string {
  if (phase === "early") return "bg-chart-3";
  if (phase === "school") return "bg-chart-8";
  if (phase === "work") return "bg-chart-2";
  if (phase === "later") return "bg-chart-7";
  return "bg-muted";
}

function LifeGrid({ label, summary, cells }: { label: string; summary: string; cells: (LifePhase | null)[] }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 truncate text-xs font-semibold text-muted-foreground">{label}</figcaption>
      <div role="img" aria-label={`${label}: ${summary}`} className="grid grid-cols-10 gap-0.5">
        {cells.map((cell, age) => (
          <span key={age} className={`aspect-square rounded-sm ${phaseClass(cell)}`} />
        ))}
      </div>
    </figure>
  );
}

// 교육 연수가 없는 나라는 학교 칸이 0이 아니라 "모름"이다. 0으로 적으면 학교를 안 간다고 읽힌다.
function yearsLabel(stats: LifeStats, cells: (LifePhase | null)[], phase: LifePhase, locale: Locale): string {
  if (phase === "school" && stats.schooling === undefined) return COPY.noData[locale];
  return String(phaseYears(cells, phase));
}

function summarize(cells: (LifePhase | null)[], locale: Locale): string {
  return PHASES.map((phase) => `${COPY[phase][locale]} ${phaseYears(cells, phase)}`).join(", ");
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function shareCard(locale: Locale, name: string, lines: StatLine[], cells: (LifePhase | null)[]) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#f7f8f2";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 60, 60, W - 120, H - 120, 40);
  ctx.fill();

  ctx.fillStyle = "#6b7a5c";
  ctx.font = "600 34px sans-serif";
  ctx.fillText(COPY.card[locale], 120, 150);
  ctx.fillStyle = "#1f2a1a";
  ctx.font = "800 84px sans-serif";
  ctx.fillText(name.length > 16 ? `${name.slice(0, 15)}…` : name, 120, 250);

  let y = 340;
  for (const line of lines) {
    ctx.fillStyle = "#6b7a5c";
    ctx.font = "500 30px sans-serif";
    ctx.fillText(COPY[line.key][locale], 120, y);
    ctx.fillStyle = "#1f2a1a";
    ctx.font = "700 40px sans-serif";
    ctx.fillText(line.value ?? COPY.noData[locale], 120, y + 48);
    y += 110;
  }

  // 인생 지도 100칸: 오른쪽 아래 10×10.
  const size = 34;
  const gap = 4;
  const gx = W - 120 - (size * 10 + gap * 9);
  const gy = 340;
  cells.forEach((cell, i) => {
    ctx.fillStyle = PHASE_HEX[cell ?? "beyond"];
    roundRect(ctx, gx + (i % 10) * (size + gap), gy + Math.floor(i / 10) * (size + gap), size, size, 6);
    ctx.fill();
  });
  ctx.fillStyle = "#6b7a5c";
  ctx.font = "500 26px sans-serif";
  ctx.fillText(COPY.map[locale], gx, gy + 10 * (size + gap) + 30);

  ctx.fillStyle = "#4d7a2a";
  ctx.font = "800 44px sans-serif";
  ctx.fillText("OIYO", 120, H - 130);
  ctx.fillStyle = "#8a9680";
  ctx.font = "500 28px sans-serif";
  ctx.fillText("oiyo.net", 250, H - 130);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const file = new File([blob], "oiyo-birth-card.png", { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (data: unknown) => boolean };
  if (nav.canShare && nav.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: `${COPY.card[locale]} · ${name}`, url: window.location.href } as ShareData);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "oiyo-birth-card.png";
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ReincarnationLife({ locale, country, home, sameSecond, onSelect }: Props) {
  const [busy, setBusy] = useState(false);
  const name = displayCountryName(country.iso2, locale, country.name);
  const homeName = displayCountryName(home.iso2, locale, home.name);
  const stats = lifeStatsFor(country.iso3);
  const lines = statLines(stats, locale);
  const homeStats = lifeStatsFor(home.iso3);
  const homeLines = statLines(homeStats, locale);
  const cells = lifeMap(stats);
  const homeCells = lifeMap(homeStats);
  const isHome = country.iso3 === home.iso3;

  async function save() {
    setBusy(true);
    try {
      await shareCard(locale, name, lines, cells);
    } catch {
      /* 공유 취소 또는 미지원 */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="reincarnation-birth-card">
        <p id="reincarnation-birth-card" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {COPY.card[locale]} · {name}
        </p>
        <div className="mt-2 space-y-1 text-base leading-relaxed text-foreground">
          {story(stats, homeStats, name, homeName, isHome, locale).map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {lines.map((line, i) => (
            <div key={line.key} className="rounded-xl bg-surface-subtle p-3">
              <dt className="text-xs text-muted-foreground">{COPY[line.key][locale]}</dt>
              <dd className="mt-0.5 text-lg font-bold text-foreground">{line.value ?? COPY.noData[locale]}</dd>
              {line.sub && <dd className="text-xs text-muted-foreground">{line.sub}</dd>}
              {!isHome && homeLines[i]?.value && (
                <dd className="mt-1 text-xs text-muted-foreground">
                  {fill(COPY.homeValue[locale], { home: homeName, v: homeLines[i].value ?? "" })}
                </dd>
              )}
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">{COPY.cardNote[locale]}</p>
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="mt-3 min-h-11 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-subtle disabled:opacity-60"
        >
          {COPY.save[locale]}
        </button>
      </section>

      <ReincarnationStages locale={locale} country={country} home={home} />

      <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="reincarnation-life-map">
        <h3 id="reincarnation-life-map" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {COPY.map[locale]}
        </h3>
        <div className={`mt-3 grid gap-4 ${isHome ? "max-w-xs" : "grid-cols-2"}`}>
          <LifeGrid label={name} summary={summarize(cells, locale)} cells={cells} />
          {!isHome && <LifeGrid label={homeName} summary={summarize(homeCells, locale)} cells={homeCells} />}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {PHASES.map((phase) => (
            <li key={phase} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-3 rounded-sm ${phaseClass(phase)}`} />
              {COPY[phase][locale]} {yearsLabel(stats, cells, phase, locale)}
              {!isHome && ` · ${yearsLabel(homeStats, homeCells, phase, locale)}`}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">{COPY.mapNote[locale]}</p>
      </section>

      {sameSecond.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="reincarnation-same-second">
          <h3 id="reincarnation-same-second" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {COPY.sameSecond[locale]}
          </h3>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {sameSecond.map((row, i) => {
              const life = lifeStatsFor(row.iso3).lifeExpectancy;
              return (
                <li key={`${row.iso3}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(row)}
                    className="flex min-h-11 w-full items-baseline justify-between gap-2 rounded-xl border border-border px-3 py-2 text-left text-sm hover:bg-surface-subtle"
                  >
                    <span className="font-semibold text-foreground">{displayCountryName(row.iso2, locale, row.name)}</span>
                    {life !== undefined && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {COPY.lifeExpectancy[locale]} {fill(COPY.years[locale], { n: num(life, locale) })}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">{COPY.sameSecondNote[locale]}</p>
        </section>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        {COPY.source[locale]}: {LIFE_STATS_META.source}
      </p>
    </div>
  );
}
