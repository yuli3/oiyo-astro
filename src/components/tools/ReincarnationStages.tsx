import { useEffect, useState } from "react";
import type { Locale } from "../../i18n";
import { displayCountryName, type ReincarnationCountry as Country } from "../../lib/reincarnation";
import {
  famousNames,
  lifeStops,
  STALE_SURVEY_YEAR,
  symbolFilePage,
  symbolImage,
  type NationalSymbol,
  type StageStats,
  type StopLine,
} from "../../lib/reincarnation-stages";
import CountryFlag from "./CountryFlag";

/**
 * 환생 결과의 "인생 정거장"(5·15·30·50·70세)과 "이 나라 첫인상".
 * 2026-10-13 세운: 공개 데이터를 최대한, 흥미와 호기심은 높게, 문체는 자연스럽게.
 * 통계 파일(약 115KB)은 결과를 연 뒤에만 따로 불러 첫 화면 번들에 넣지 않는다.
 * 생존 비율은 꾸미지 않고 "100명 중 N명"으로만 말한다.
 */

interface Props {
  locale: Locale;
  country: Country;
  home: Country;
}

type Copy = Record<Locale, string>;
type StagesFile = { source: string; asOf: string; countries: Record<string, StageStats> };

const COPY = {
  stops: { ko: "인생 정거장", en: "Life stops", ja: "人生の停留所", zh: "人生驿站", fr: "Les étapes d’une vie", es: "Las paradas de una vida" },
  stopsNote: {
    ko: "같은 해 이 나라에서 태어난 아이들이 평균적으로 지나가는 길이에요. 한 사람의 앞날을 점치지 않아요.",
    en: "The average path for children born here in the same year. It does not foretell anyone’s future.",
    ja: "同じ年にこの国で生まれた子どもたちが平均的にたどる道です。一人の未来を占うものではありません。",
    zh: "这是同年在这个国家出生的孩子平均会走的路，不预言任何一个人的未来。",
    fr: "Le parcours moyen des enfants nés ici la même année. Il ne prédit l’avenir de personne.",
    es: "El camino medio de los niños nacidos aquí el mismo año. No predice el futuro de nadie.",
  },
  medianValue: { ko: "{n}살", en: "{n}", ja: "{n}歳", zh: "{n}岁", fr: "{n} ans", es: "{n} años" },
  age: { ko: "{n}살", en: "Age {n}", ja: "{n}歳", zh: "{n}岁", fr: "{n} ans", es: "{n} años" },
  survive: {
    ko: "100명 중 {n}명이 {age}살 생일을 맞아요.",
    en: "Of every 100 babies, {n} live to see {age}.",
    ja: "100人中{n}人が{age}歳の誕生日を迎えます。",
    zh: "每100个孩子里，有{n}个能过{age}岁生日。",
    fr: "Sur 100 bébés, {n} fêtent leurs {age} ans.",
    es: "De cada 100 bebés, {n} llegan a cumplir {age} años.",
  },
  survive90: {
    ko: "아흔 살까지 사는 사람은 {n}명이에요.",
    en: "{n} make it to 90.",
    ja: "90歳まで生きるのは{n}人です。",
    zh: "活到90岁的有{n}个。",
    fr: "{n} atteignent 90 ans.",
    es: "{n} llegan a los 90.",
  },
  homeCount: { ko: "{home} {n}명", en: "{home}: {n}", ja: "{home}は{n}人", zh: "{home}是{n}个", fr: "{home} : {n}", es: "{home}: {n}" },
  electricity: {
    ko: "집에 전깃불이 들어오는 아이는 열 명 중 {k}명이에요.",
    en: "{k} in 10 children grow up with electricity at home.",
    ja: "家に電気が通っている子は10人中{k}人です。",
    zh: "10个孩子里有{k}个家里通了电。",
    fr: "{k} enfants sur 10 grandissent avec l’électricité à la maison.",
    es: "{k} de cada 10 niños crecen con electricidad en casa.",
  },
  school: {
    ko: "지금 학교에 들어가는 아이는 평균 {y}년 동안 공부하게 돼요.",
    en: "A child starting school now can expect {y} years of education.",
    ja: "いま入学する子は平均{y}年学ぶことになります。",
    zh: "现在入学的孩子平均会读{y}年书。",
    fr: "Un enfant qui entre à l’école aujourd’hui peut compter sur {y} ans d’études.",
    es: "Un niño que empieza la escuela hoy puede esperar {y} años de estudios.",
  },
  marriage: {
    ko: "첫 결혼은 보통 여자 {f}살, 남자 {m}살쯤 해요.",
    en: "People usually first marry around {f} for women and {m} for men.",
    ja: "初婚はだいたい女性{f}歳、男性{m}歳ごろです。",
    zh: "初婚年龄一般是女性{f}岁、男性{m}岁左右。",
    fr: "On se marie pour la première fois vers {f} ans pour les femmes, {m} ans pour les hommes.",
    es: "La primera boda suele llegar hacia los {f} años en las mujeres y los {m} en los hombres.",
  },
  survey: { ko: " ({y}년 조사)", en: " ({y} survey)", ja: "（{y}年調査）", zh: "（{y}年调查）", fr: " (enquête {y})", es: " (encuesta de {y})" },
  children: {
    ko: "엄마들은 평균 {a}살에 아이를 낳고, 한 사람이 평생 낳는 아이는 {c}명이에요.",
    en: "Mothers give birth at {a} on average, and each woman has {c} children over her life.",
    ja: "母親が出産する平均年齢は{a}歳、1人が生涯に産む子どもは{c}人です。",
    zh: "母亲平均{a}岁生孩子，每位女性一生平均生{c}个孩子。",
    fr: "Les mères accouchent en moyenne à {a} ans, et chaque femme a {c} enfants au cours de sa vie.",
    es: "Las madres dan a luz de media a los {a} años, y cada mujer tiene {c} hijos a lo largo de su vida.",
  },
  urban: {
    ko: "열 명 중 {k}명은 도시에 살아요.",
    en: "{k} in 10 people live in a city.",
    ja: "10人中{k}人が都市に住んでいます。",
    zh: "10个人里有{k}个住在城市。",
    fr: "{k} personnes sur 10 vivent en ville.",
    es: "{k} de cada 10 personas viven en una ciudad.",
  },
  work: {
    ko: "일하는 사람은 일주일에 평균 {w}시간쯤 일해요.",
    en: "Workers put in about {w} hours a week.",
    ja: "働く人は週に平均{w}時間ほど働きます。",
    zh: "上班的人平均每周工作{w}小时左右。",
    fr: "Les actifs travaillent environ {w} heures par semaine.",
    es: "Quien trabaja lo hace unas {w} horas a la semana.",
  },
  firstLook: { ko: "이 나라 첫인상", en: "First look", ja: "この国の第一印象", zh: "第一印象", fr: "Premières impressions", es: "Primeras impresiones" },
  temp: { ko: "연평균 기온", en: "Average temperature", ja: "年平均気温", zh: "年平均气温", fr: "Température moyenne", es: "Temperatura media" },
  kcal: { ko: "하루 식탁 열량", en: "Food per person per day", ja: "1日の食卓カロリー", zh: "每人每天的食物热量", fr: "Calories par personne et par jour", es: "Calorías por persona y día" },
  plate: { ko: "한 사람의 1년 식탁", en: "One person’s year of food", ja: "1人の1年分の食卓", zh: "一个人一年的饭桌", fr: "Une année d’assiette", es: "Un año de comida por persona" },
  rice: { ko: "쌀", en: "rice", ja: "米", zh: "大米", fr: "riz", es: "arroz" },
  wheat: { ko: "밀", en: "wheat", ja: "小麦", zh: "小麦", fr: "blé", es: "trigo" },
  meat: { ko: "고기", en: "meat", ja: "肉", zh: "肉", fr: "viande", es: "carne" },
  coffee: { ko: "커피", en: "coffee", ja: "コーヒー", zh: "咖啡", fr: "café", es: "café" },
  dataYear: { ko: "{y}년 자료", en: "{y} data", ja: "{y}年のデータ", zh: "{y}年数据", fr: "données {y}", es: "datos de {y}" },
  drive: { ko: "자동차 통행", en: "Cars drive on the", ja: "車の通行", zh: "行车方向", fr: "On roule", es: "Se circula" },
  left: { ko: "왼쪽", en: "left", ja: "左側", zh: "靠左", fr: "à gauche", es: "por la izquierda" },
  right: { ko: "오른쪽", en: "right", ja: "右側", zh: "靠右", fr: "à droite", es: "por la derecha" },
  median: { ko: "절반이 이 나이보다 어려요", en: "Half the people are younger than", ja: "半数がこの年齢より若い", zh: "一半人比这个年龄小", fr: "La moitié a moins de", es: "La mitad tiene menos de" },
  migrants: { ko: "다른 나라에서 태어난 이웃", en: "Neighbours born abroad", ja: "外国生まれの隣人", zh: "出生在国外的邻居", fr: "Voisins nés à l’étranger", es: "Vecinos nacidos en el extranjero" },
  symbols: { ko: "나라 상징", en: "National symbols", ja: "国のシンボル", zh: "国家象征", fr: "Symboles nationaux", es: "Símbolos nacionales" },
  emblem: { ko: "국장", en: "Emblem", ja: "国章", zh: "国徽", fr: "Emblème", es: "Escudo" },
  bird: { ko: "나라 새", en: "National bird", ja: "国鳥", zh: "国鸟", fr: "Oiseau national", es: "Ave nacional" },
  animal: { ko: "나라 동물", en: "National animal", ja: "国の動物", zh: "国家动物", fr: "Animal national", es: "Animal nacional" },
  flower: { ko: "나라 꽃", en: "National flower", ja: "国花", zh: "国花", fr: "Fleur nationale", es: "Flor nacional" },
  tree: { ko: "나라 나무", en: "National tree", ja: "国の木", zh: "国树", fr: "Arbre national", es: "Árbol nacional" },
  credits: { ko: "그림 출처", en: "Image credits", ja: "画像の出典", zh: "图片来源", fr: "Crédits des images", es: "Créditos de las imágenes" },
  famous: { ko: "이 나라에서 태어난 사람", en: "Also born here", ja: "この国で生まれた人", zh: "同样出生在这里", fr: "Nés ici aussi", es: "También nacieron aquí" },
  famousNote: {
    ko: "위키백과 언어판이 많은 예술가·과학자·작가·운동선수 순이에요.",
    en: "Artists, scientists, writers and athletes, ranked by Wikipedia language editions.",
    ja: "ウィキペディアの言語版が多い芸術家・科学者・作家・スポーツ選手の順です。",
    zh: "按维基百科语言版本数排列的艺术家、科学家、作家和运动员。",
    fr: "Artistes, scientifiques, écrivains et sportifs, classés par éditions linguistiques de Wikipédia.",
    es: "Artistas, científicos, escritores y deportistas, ordenados por ediciones de Wikipedia.",
  },
  names: { ko: "요즘 가장 많은 아기 이름", en: "Top baby names", ja: "最近いちばん多い赤ちゃんの名前", zh: "最常见的新生儿名字", fr: "Prénoms les plus donnés", es: "Nombres más puestos" },
  girlBoy: { ko: "여자 {f} · 남자 {m}", en: "{f} (girls) · {m} (boys)", ja: "女の子 {f} · 男の子 {m}", zh: "女孩 {f} · 男孩 {m}", fr: "{f} (filles) · {m} (garçons)", es: "{f} (niñas) · {m} (niños)" },
  nsw: { ko: "뉴사우스웨일스주 기준", en: "New South Wales only", ja: "ニューサウスウェールズ州のみ", zh: "仅新南威尔士州", fr: "Nouvelle-Galles du Sud uniquement", es: "Solo Nueva Gales del Sur" },
  engWales: { ko: "잉글랜드·웨일스 기준", en: "England and Wales only", ja: "イングランド・ウェールズのみ", zh: "仅英格兰和威尔士", fr: "Angleterre et pays de Galles uniquement", es: "Solo Inglaterra y Gales" },
  homeValue: { ko: "{home}: {v}", en: "{home}: {v}", ja: "{home}: {v}", zh: "{home}：{v}", fr: "{home} : {v}", es: "{home}: {v}" },
  source: { ko: "출처", en: "Source", ja: "出典", zh: "来源", fr: "Source", es: "Fuente" },
} satisfies Record<string, Copy>;

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

function num(n: number, locale: Locale, digits = 1): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale, { maximumFractionDigits: digits }).format(n);
}

function lineText(line: StopLine, locale: Locale, homeName: string): string {
  switch (line.kind) {
    case "survive": {
      const base =
        line.age === 90
          ? fill(COPY.survive90[locale], { n: String(line.n) })
          : fill(COPY.survive[locale], { n: String(line.n), age: String(line.age) });
      return line.home === undefined ? base : `${base} (${fill(COPY.homeCount[locale], { home: homeName, n: String(line.home) })})`;
    }
    case "electricity":
      return fill(COPY.electricity[locale], { k: String(line.k) });
    case "school":
      return fill(COPY.school[locale], { y: String(line.years) });
    case "marriage": {
      const base = fill(COPY.marriage[locale], { f: String(line.f), m: String(line.m) });
      // 결혼 조사는 나라마다 해가 다르다. 오래된 조사는 연도를 붙여 지금 값처럼 읽히지 않게 한다.
      return line.year < STALE_SURVEY_YEAR ? base.replace(/([.。])$/, `${fill(COPY.survey[locale], { y: String(line.year) })}$1`) : base;
    }
    case "children":
      return fill(COPY.children[locale], { a: String(line.age), c: num(line.count, locale) });
    case "urban":
      return fill(COPY.urban[locale], { k: String(line.k) });
    case "work":
      return fill(COPY.work[locale], { w: String(line.weekly) });
  }
}

// wide: 값이 길어 모바일 두 칸 격자에서 한 줄을 다 쓰는 카드.
type Fact = { key: keyof typeof COPY; value: string; sub?: string; home?: string; wide?: boolean };

function plate(stats: StageStats, locale: Locale): string | null {
  const food = stats.food;
  if (!food) return null;
  const parts = (["rice", "wheat", "meat", "coffee"] as const)
    // 커피를 거의 안 마시는 나라에서 "커피 0kg"은 정보가 아니다.
    .filter((item) => food[item] !== undefined && (item !== "coffee" || (food.coffee ?? 0) >= 0.5))
    .map((item) => `${COPY[item][locale]} ${num(food[item] ?? 0, locale, (food[item] ?? 0) < 10 ? 1 : 0)}kg`);
  return parts.length ? parts.join(" · ") : null;
}

function facts(stats: StageStats, homeStats: StageStats | undefined, locale: Locale): Fact[] {
  const out: Fact[] = [];
  const temp = (row?: StageStats) => (row?.temp !== undefined ? `${num(row.temp, locale)}°C` : undefined);
  const kcal = (row?: StageStats) => (row?.food?.kcal !== undefined ? `${num(row.food.kcal, locale, 0)} kcal` : undefined);
  const median = (row?: StageStats) => (row?.medianAge !== undefined ? fill(COPY.medianValue[locale], { n: num(row.medianAge, locale, 0) }) : undefined);
  const migrants = (row?: StageStats) => (row?.migrants !== undefined ? `${num(row.migrants, locale, row.migrants < 10 ? 1 : 0)}%` : undefined);

  const t = temp(stats);
  if (t) out.push({ key: "temp", value: t, home: temp(homeStats) });
  const k = kcal(stats);
  if (k) {
    const old = stats.food && stats.food.year < 2020 ? fill(COPY.dataYear[locale], { y: String(stats.food.year) }) : undefined;
    out.push({ key: "kcal", value: k, sub: old, home: kcal(homeStats) });
  }
  const p = plate(stats, locale);
  if (p) out.push({ key: "plate", value: p, home: homeStats ? (plate(homeStats, locale) ?? undefined) : undefined, wide: true });
  if (stats.drive) out.push({ key: "drive", value: COPY[stats.drive][locale], home: homeStats?.drive ? COPY[homeStats.drive][locale] : undefined });
  const m = median(stats);
  if (m) out.push({ key: "median", value: m, home: median(homeStats) });
  const g = migrants(stats);
  if (g) out.push({ key: "migrants", value: g, home: migrants(homeStats) });
  return out;
}

function symbolName(symbol: NationalSymbol, locale: Locale): string {
  if (symbol.kind === "emblem") return COPY.emblem[locale];
  return (locale === "ko" && symbol.ko) || symbol.en;
}

/**
 * 국장과 나라 새·동물·꽃·나무. 그림은 Wikimedia Commons 에서 바로 받고(퍼블릭 도메인·CC0·CC BY·
 * CC BY-SA 만), 저작자·라이선스·원본 문서를 접힌 "그림 출처"에 모두 적는다.
 */
function SymbolStrip({ symbols, locale, countryName }: { symbols: NationalSymbol[]; locale: Locale; countryName: string }) {
  // Commons 가 파일을 옮기거나 지우면 빈 칸 대신 그 그림을 뺀다.
  const [broken, setBroken] = useState<ReadonlySet<string>>(new Set());
  const shown = symbols.filter((symbol) => !broken.has(symbol.img));
  if (shown.length === 0) return null;
  return (
    <div className="mt-3">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {shown.map((symbol) => (
          <li key={symbol.img} className="overflow-hidden rounded-xl bg-surface-subtle">
            <div className="flex aspect-square items-center justify-center bg-card p-2">
              <img
                src={symbolImage(symbol)}
                alt={symbol.kind === "emblem" ? `${countryName} ${COPY.emblem[locale]}` : symbolName(symbol, locale)}
                className={`size-full ${symbol.kind === "emblem" ? "object-contain" : "rounded-lg object-cover"}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setBroken((prev) => new Set(prev).add(symbol.img))}
              />
            </div>
            <p className="px-3 pt-2 text-xs text-muted-foreground">{COPY[symbol.kind][locale]}</p>
            <p className="px-3 pb-2 text-sm font-bold leading-snug text-foreground">
              {symbol.kind === "emblem" ? countryName : symbolName(symbol, locale)}
            </p>
          </li>
        ))}
      </ul>
      <details className="mt-2 text-xs text-muted-foreground">
        <summary className="min-h-11 cursor-pointer py-3">{COPY.credits[locale]}</summary>
        <ul className="space-y-1 pb-1">
          {shown.map((symbol) => (
            <li key={symbol.img} className="break-words">
              {COPY[symbol.kind][locale]} · {symbolName(symbol, locale)}
              {symbol.by && <>: {symbol.by}</>},{" "}
              {symbol.licenceUrl ? (
                <a className="underline underline-offset-2" href={symbol.licenceUrl} target="_blank" rel="noopener noreferrer">
                  {symbol.licence}
                </a>
              ) : (
                symbol.licence
              )}
              ,{" "}
              <a className="underline underline-offset-2" href={symbolFilePage(symbol)} target="_blank" rel="noopener noreferrer">
                Wikimedia Commons
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default function ReincarnationStages({ locale, country, home }: Props) {
  const [file, setFile] = useState<StagesFile | null>(null);

  useEffect(() => {
    let alive = true;
    void import("../../data/reincarnation-life-stages.json").then((mod) => {
      if (alive) setFile(mod.default as StagesFile);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!file) return null;
  const stats = file.countries[country.iso3];
  if (!stats) return null;
  const isHome = country.iso3 === home.iso3;
  const homeStats = isHome ? undefined : file.countries[home.iso3];
  const homeName = displayCountryName(home.iso2, locale, home.name);
  const stops = lifeStops(stats, homeStats);
  const list = facts(stats, homeStats, locale);
  const people = famousNames(stats, locale === "ko");
  const names = stats.names?.f && stats.names.m ? stats.names : undefined;
  const symbols = stats.symbols ?? [];

  return (
    <>
      {stops.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="reincarnation-life-stops">
          <h3 id="reincarnation-life-stops" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {COPY.stops[locale]}
          </h3>
          <ol className="mt-3 space-y-3">
            {stops.map((stop) => (
              <li key={stop.age} className="flex gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-sm font-bold text-foreground">
                  {fill(COPY.age[locale], { n: String(stop.age) })}
                </span>
                <div className="min-w-0 space-y-1 pt-1 text-sm leading-relaxed text-foreground">
                  {stop.lines.map((line, i) => (
                    <p key={`${line.kind}-${i}`}>{lineText(line, locale, homeName)}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">{COPY.stopsNote[locale]}</p>
        </section>
      )}

      {symbols.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="reincarnation-symbols">
          <h3 id="reincarnation-symbols" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <CountryFlag iso2={country.iso2} className="h-3.5" />
            {COPY.symbols[locale]}
          </h3>
          <SymbolStrip symbols={symbols} locale={locale} countryName={displayCountryName(country.iso2, locale, country.name)} />
        </section>
      )}

      {(list.length > 0 || people.length > 0 || names) && (
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="reincarnation-first-look">
          <h3 id="reincarnation-first-look" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <CountryFlag iso2={country.iso2} className="h-3.5" />
            {COPY.firstLook[locale]}
          </h3>
          {/* 짧은 숫자는 모바일에서도 두 칸으로 놓아 한 화면에 더 많이 보이게 한다. */}
          <dl className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
            {list.map((fact) => (
              <div key={fact.key} className={`rounded-xl bg-surface-subtle p-3 ${fact.wide ? "col-span-2" : ""}`}>
                <dt className="text-xs text-muted-foreground">{COPY[fact.key][locale]}</dt>
                <dd className="mt-0.5 text-base font-bold tabular-nums text-foreground">{fact.value}</dd>
                {fact.sub && <dd className="text-xs text-muted-foreground">{fact.sub}</dd>}
                {fact.home && fact.home !== fact.value && (
                  <dd className="mt-1 text-xs text-muted-foreground">{fill(COPY.homeValue[locale], { home: homeName, v: fact.home })}</dd>
                )}
              </div>
            ))}
            {names && (
              <div className="col-span-2 rounded-xl bg-surface-subtle p-3 sm:col-span-1">
                <dt className="text-xs text-muted-foreground">
                  {COPY.names[locale]} · {names.year}
                </dt>
                <dd className="mt-0.5 text-base font-bold tabular-nums text-foreground">{fill(COPY.girlBoy[locale], { f: names.f ?? "", m: names.m ?? "" })}</dd>
                {country.iso3 === "AUS" && <dd className="text-xs text-muted-foreground">{COPY.nsw[locale]}</dd>}
                {country.iso3 === "GBR" && <dd className="text-xs text-muted-foreground">{COPY.engWales[locale]}</dd>}
              </div>
            )}
            {people.length > 0 && (
              <div className="col-span-2 rounded-xl bg-surface-subtle p-3">
                <dt className="text-xs text-muted-foreground">{COPY.famous[locale]}</dt>
                <dd className="mt-1">
                  <ul className="grid gap-2 sm:grid-cols-3">
                    {people.map((person) => (
                      <li key={person.name} className="min-w-0">
                        <span className="block text-base font-bold leading-snug text-foreground">{person.name}</span>
                        {person.reading && <span className="block text-xs text-muted-foreground">{person.reading}</span>}
                      </li>
                    ))}
                  </ul>
                </dd>
                <dd className="text-xs text-muted-foreground">{COPY.famousNote[locale]}</dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {COPY.source[locale]}: {file.source}
          </p>
        </section>
      )}
    </>
  );
}
