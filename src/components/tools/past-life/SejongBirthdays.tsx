import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { FIRST_YEAR, LAST_YEAR, MILESTONES, formatQuery, parseQuery, summarize, wikisourceUrl, type BirthdayRow, type MonthFile, type Query } from "../../../lib/sejong-birthdays";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "sejong-birthdays" as const;
const cache = new Map<number, Promise<MonthFile>>();
const load = (m: number) => {
  let p = cache.get(m);
  if (!p) {
    p = fetch(`/data/sejong-birthday/${String(m).padStart(2, "0")}.json`).then((r) => r.json() as Promise<MonthFile>);
    cache.set(m, p);
  }
  return p;
};

const C = {
  go: { ko: "32년치 실록 펼치기", en: "Open 32 years of the Annals", ja: "32年分の実録を開く", zh: "翻开32年的实录", fr: "Ouvrir 32 ans d'Annales", es: "Abrir 32 años de Anales" },
  again: { ko: "다른 날 펼치기", en: "Try another day", ja: "別の日を開く", zh: "换一天", fr: "Un autre jour", es: "Otro día" },
  kicker: { ko: "세종 재위 32년, 해마다 양력 {m}월 {d}일", en: "Every {m}/{d} of Sejong's 32-year reign", ja: "世宗在位32年、毎年の{m}月{d}日", zh: "世宗在位32年，每年的{m}月{d}日", fr: "Chaque {d}/{m} des 32 ans de règne de Sejong", es: "Cada {d}/{m} de los 32 años de reinado de Sejong" },
  hero: { ko: "{n}번 실록에 남았어요", en: "Recorded in {n} of the years", ja: "{n}回実録に残りました", zh: "有{n}年载入实录", fr: "Consigné {n} années", es: "Registrado en {n} años" },
  heroSub: { ko: "{span}년 가운데 {n}해, 기사 {e}건", en: "{n} of {span} years · {e} entries", ja: "{span}年中{n}年・記事{e}件", zh: "{span}年中{n}年·记事{e}条", fr: "{n} années sur {span} · {e} articles", es: "{n} de {span} años · {e} entradas" },
  busiest: { ko: "가장 바빴던 생일: {y}년(세종 {r}년) · 기사 {c}건", en: "Busiest: {y} (Sejong {r}) · {c} entries", ja: "いちばん忙しい誕生日：{y}年（世宗{r}年）・記事{c}件", zh: "最忙的生日：{y}年（世宗{r}年）·{c}条", fr: "Le plus chargé : {y} (Sejong {r}) · {c} articles", es: "El más ajetreado: {y} (Sejong {r}) · {c} entradas" },
  timeline: { ko: "해마다 그날", en: "That day, year by year", ja: "毎年のその日", zh: "每年的那一天", fr: "Ce jour, année après année", es: "Ese día, año tras año" },
  lunar: { ko: "세종 {r}년 음력 {leap}{m}월 {d}일 · 기사 {c}건", en: "Sejong {r}, lunar {leap}{m}/{d} · {c} entries", ja: "世宗{r}年 旧暦{leap}{m}月{d}日・記事{c}件", zh: "世宗{r}年 农历{leap}{m}月{d}日·{c}条", fr: "Sejong {r}, lunaire {leap}{d}/{m} · {c} articles", es: "Sejong {r}, lunar {leap}{d}/{m} · {c} entradas" },
  leap: { ko: "윤", en: "leap ", ja: "閏", zh: "闰", fr: "intercalaire ", es: "intercalar " },
  read: { ko: "원문", en: "Text", ja: "原文", zh: "原文", fr: "Texte", es: "Texto" },
  read1426: { ko: "1426년 실록에서 자세히", en: "Details in the 1426 Annals", ja: "1426年実録で詳しく", zh: "在1426年实录里细看", fr: "Détails (1426)", es: "Detalles (1426)" },
  missing: { ko: "기록 없는 해 {n}번: {years}", en: "No entry in {n} years: {years}", ja: "記録のない年{n}回：{years}", zh: "无记录的年份{n}个：{years}", fr: "Aucun article {n} années : {years}", es: "Sin entrada en {n} años: {years}" },
  missingWhy: { ko: "실록은 날마다 쓰지 않았고, 1419년 음력 설 전과 1450년 2월 17일(세종 승하) 뒤는 세종실록 밖이에요.", en: "The Annals did not record every day; dates before the 1419 lunar new year or after Sejong's death (lunar 2/17, 1450) fall outside them.", ja: "実録は毎日書かれたわけではなく、1419年の旧正月前と1450年2月17日（世宗の死去）以後は世宗実録の外です。", zh: "实录并非每天都有记事；1419年农历新年前和1450年二月十七日（世宗薨逝）之后不在世宗实录内。", fr: "Les Annales n'écrivaient pas chaque jour ; avant le Nouvel An lunaire 1419 ou après la mort de Sejong (1450), hors Annales.", es: "Los Anales no registraban cada día; antes del Año Nuevo lunar de 1419 o tras la muerte de Sejong (1450) quedan fuera." },
  howTitle: { ko: "어떻게 맞추나요", en: "How dates are matched", ja: "日付の合わせ方", zh: "日期怎么对", fr: "Correspondance des dates", es: "Cómo se cuadran las fechas" },
  how: { ko: "위키문헌의 세종실록 원년~32년 원문 {days}일치, 기사 {entries}건을 날짜별로 정리했어요. 기사 첫머리의 일진(예: 丙申)으로 날짜를 하루 단위로 맞추고, 양력은 그레고리력을 그대로 거꾸로 늘린 날짜라 계절상 같은 날이에요. 원문 일진대로 따르면 세종 19년 11월이 31일이 되는 곳이 한 군데 있어 원문을 그대로 따랐어요.", en: "We sorted {days} dated days ({entries} entries) of the Sejong Sillok on Wikisource. Each day is matched by its day ganzhi; solar dates are proleptic Gregorian, so they fall at the same point in the seasons.", ja: "ウィキソースの世宗実録元年〜32年、{days}日分・記事{entries}件を日付ごとに整理し、日辰で一日単位に合わせました。陽暦は先発グレゴリオ暦で、季節上同じ日です。", zh: "整理了维基文库世宗实录元年至三十二年共{days}天、{entries}条记事，按日辰逐日对应；阳历为外推格里历，季节上是同一天。", fr: "{days} jours datés ({entries} articles) des Annales de Sejong sur Wikisource, alignés par le cycle sexagésimal ; dates grégoriennes proleptiques.", es: "{days} días fechados ({entries} entradas) de los Anales de Sejong en Wikisource, alineados por el ciclo sexagenario; fechas gregorianas prolépticas." },
  cardKicker: { ko: "1419–1450 · 다른 해의 내 생일 실록", en: "1419–1450 · My birthday across Sejong's reign", ja: "1419–1450・別の年の誕生日の実録", zh: "1419–1450·其他年份的生日实录", fr: "1419–1450 · Mon anniversaire sous Sejong", es: "1419–1450 · Mi cumpleaños bajo Sejong" },
  badge: { ko: "세종 32년", en: "Sejong 32 yrs", ja: "世宗32年", zh: "世宗32年", fr: "Sejong 32 ans", es: "Sejong 32 años" },
  src: { ko: "세종실록 원년~32년(위키문헌)", en: "Sejong Sillok, years 1–32 (Wikisource)", ja: "世宗実録元年〜32年（ウィキソース）", zh: "世宗实录元年至三十二年（维基文库）", fr: "Sejong Sillok, ans 1–32 (Wikisource)", es: "Sejong Sillok, años 1–32 (Wikisource)" },
} satisfies Record<string, Six>;

const MILE: Record<string, Six> = {
  jiphyeon: { ko: "집현전을 넓힌 해", en: "Year the Hall of Worthies was expanded", ja: "集賢殿を拡充した年", zh: "扩充集贤殿之年", fr: "Année de l'agrandissement du Jiphyeonjeon", es: "Año en que se amplió el Jiphyeonjeon" },
  rain: { ko: "측우기를 만든 해", en: "Year the rain gauge was made", ja: "測雨器をつくった年", zh: "制作测雨器之年", fr: "Année du pluviomètre", es: "Año del pluviómetro" },
  hangul: { ko: "훈민정음을 만든 해", en: "Year Hangul was created", ja: "訓民正音を創った年", zh: "创制训民正音之年", fr: "Année de la création du hangul", es: "Año de la creación del hangul" },
  hangulOut: { ko: "훈민정음을 펴낸 해", en: "Year Hangul was proclaimed", ja: "訓民正音を頒布した年", zh: "颁布训民正音之年", fr: "Année de la promulgation du hangul", es: "Año de la promulgación del hangul" },
  death: { ko: "세종이 세상을 떠난 해", en: "Year Sejong died", ja: "世宗が亡くなった年", zh: "世宗薨逝之年", fr: "Année de la mort de Sejong", es: "Año de la muerte de Sejong" },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

type Result = { q: Query; rows: BirthdayRow[] };

export default function SejongBirthdays({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [res, setRes] = useState<Result | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseQuery(window.location.search);
    if (shared) void load(shared.month).then((f) => setRes({ q: shared, rows: f[String(shared.day)] ?? [] }));
  }, []);

  async function show(q: Query, how: string) {
    const f = await load(q.month);
    funnel(how);
    warp.start(() => {
      setRes({ q, rows: f[String(q.day)] ?? [] });
      setRound((r) => r + 1);
      setShareQuery(formatQuery(q));
      stampEpisode(EP);
    });
  }

  function randomDay() {
    const doy = 1 + Math.floor(Math.random() * 365);
    const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    const m = cum.findIndex((c) => c >= doy);
    void show({ month: m, day: doy - cum[m - 1]! }, "random");
  }

  const s = res ? summarize(res.rows) : null;
  const have = new Set(res?.rows.map((r) => r[0]));
  const missing: number[] = [];
  const leapDay = res?.q.month === 2 && res.q.day === 29;
  let span = 0;
  for (let y = FIRST_YEAR; y <= LAST_YEAR; y += 1) {
    if (leapDay && y % 4 !== 0) continue;
    span += 1;
    if (!have.has(y)) missing.push(y);
  }
  const label = (r: BirthdayRow) => fill(pick(C.lunar, l), { r: r[1], leap: r[3] ? pick(C.leap, l) : "", m: r[2], d: r[4], c: r[5] });

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1419} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.go, l)} onSubmit={(b) => void show({ month: Number(b.slice(5, 7)), day: Number(b.slice(8, 10)) }, "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={randomDay}>
          {pick(res ? C.again : C.go, l)}
        </Button>
      )}

      {res && s && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{fill(pick(C.kicker, l), { m: res.q.month, d: res.q.day })}</p>
            <p className="mt-3 text-3xl font-black text-foreground">📜 {fill(pick(C.hero, l), { n: s.years })}</p>
            <p className="mt-2 text-sm">{fill(pick(C.heroSub, l), { span, n: s.years, e: fmt.format(s.entries) })}</p>
            {s.busiest && <p className="mt-2 text-sm text-foreground">{fill(pick(C.busiest, l), { y: s.busiest[0], r: s.busiest[1], c: s.busiest[5] })}</p>}
          </section>

          <Panel label={pick(C.timeline, l)}>
            <ol className="space-y-3">
              {res.rows.map((r) => {
                const mile = MILESTONES[r[0]];
                return (
                  <li key={r[0]} className="rounded-lg bg-muted px-3 py-2">
                    <p className="font-bold text-foreground">
                      {r[0]}
                      {mile && <span className="ml-2 rounded bg-hanja-mark px-1.5 text-xs text-foreground dark:bg-hanja-mark-dark">{pick(MILE[mile]!, l)}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{label(r)}</p>
                    <p className="mt-1 font-serif text-sm leading-relaxed">{r[6]}</p>
                    <p className="text-xs">
                      <a className="underline" href={wikisourceUrl(r)} rel="noopener" target="_blank">
                        {pick(C.read, l)} →
                      </a>
                      {r[0] === 1426 && (
                        <>
                          {" · "}
                          <a className="underline" href={`/${locale}/sillok-1426/?c=l&m=${r[2]}&d=${r[4]}`}>
                            {pick(C.read1426, l)} →
                          </a>
                        </>
                      )}
                    </p>
                  </li>
                );
              })}
            </ol>
            {missing.length > 0 && <p className="text-xs text-muted-foreground">{fill(pick(C.missing, l), { n: missing.length, years: missing.join(", ") })}</p>}
            <p className="text-xs text-muted-foreground">{pick(C.missingWhy, l)}</p>
          </Panel>

          <Panel label={pick(C.howTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.how, l), { days: fmt.format(10293), entries: fmt.format(33151) })}</p>
          </Panel>

          <Sources l={l} items={[{ label: pick(C.src, l), url: "https://zh.wikisource.org/wiki/%E6%9C%9D%E9%AE%AE%E7%8E%8B%E6%9C%9D%E5%AF%A6%E9%8C%84/%E4%B8%96%E5%AE%97%E5%AF%A6%E9%8C%84" }]} />

          <SaveCard
            l={l}
            testId={EP}
            filename="oiyo-sejong-birthdays"
            spec={{
              kicker: pick(C.cardKicker, l),
              title: `${res.q.month}/${res.q.day} · ${fill(pick(C.hero, l), { n: s.years })}`,
              subtitle: fill(pick(C.heroSub, l), { span, n: s.years, e: fmt.format(s.entries) }),
              badge: pick(C.badge, l),
              lines: res.rows.filter((r) => MILESTONES[r[0]] || r === s.busiest).slice(0, 4).map((r) => `${r[0]} · ${r[6].slice(0, 22)}…`),
              footer: "oiyo.net · 1419–1450",
              accent: "#1e3a5f",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
