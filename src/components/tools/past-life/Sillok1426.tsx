import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import {
  formatSillok, fromJdn, lunarToJdn, monthLength, monthStarts, nearestRecorded, parseSillok, solarToLunar, weatherNear, type SillokQuery, type WeatherKind, type WeatherNote,
} from "../../../lib/sillok-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "sillok-1426" as const;
const DATA_URL = "/data/sillok-1426.json";
const SOURCE = "https://zh.wikisource.org/w/index.php?title=%E6%9C%9D%E9%AE%AE%E7%8E%8B%E6%9C%9D%E5%AF%A6%E9%8C%84/%E4%B8%96%E5%AE%97%E5%AF%A6%E9%8C%84/%E5%85%AB%E5%B9%B4&oldid=";

type Day = { gz: string; n: number; t: string; ko: string; en: string };
type Data = { oldid: number; shuo: string[]; days: Record<string, Day>; w?: WeatherNote[] };

let cache: Promise<Data> | null = null;
const load = () => (cache ??= fetch(DATA_URL).then((r) => r.json() as Promise<Data>));

const MONTH_HANJA = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];

const C = {
  kindLabel: { ko: "어떤 생일로 찾을까요?", en: "Which birthday?", ja: "どの誕生日で探す？", zh: "用哪个生日查找？", fr: "Quel anniversaire ?", es: "¿Qué cumpleaños?" },
  solar: { ko: "양력 생일", en: "Solar (usual) birthday", ja: "新暦の誕生日", zh: "阳历生日", fr: "Date habituelle", es: "Fecha habitual" },
  lunar: { ko: "음력 생일", en: "Lunar birthday", ja: "旧暦の誕生日", zh: "农历生日", fr: "Date lunaire", es: "Fecha lunar" },
  go: { ko: "그날 실록 펼치기", en: "Open that day's annals", ja: "その日の実録を開く", zh: "翻开那天的实录", fr: "Ouvrir les annales du jour", es: "Abrir los anales de ese día" },
  month: { ko: "월", en: "Month", ja: "月", zh: "月", fr: "Mois", es: "Mes" },
  day: { ko: "일", en: "Day", ja: "日", zh: "日", fr: "Jour", es: "Día" },
  lunarNote: { ko: "음력 날짜를 세종 8년의 같은 음력 날짜에 그대로 맞춰요. 이 해에는 윤달이 없어요.", en: "Your lunar date is matched to the same lunar date of Sejong's 8th year (no leap month that year).", ja: "旧暦の日付を世宗8年の同じ旧暦日に合わせます（この年は閏月なし）。", zh: "农历日期直接对应世宗八年的同一农历日（当年无闰月）。", fr: "La date lunaire est reportée telle quelle sur l'an 8 de Sejong (sans mois intercalaire).", es: "La fecha lunar se lleva tal cual al año 8 de Sejong (sin mes intercalar)." },
  loading: { ko: "실록을 펼치는 중…", en: "Opening the annals…", ja: "実録を開いています…", zh: "正在翻开实录…", fr: "Ouverture des annales…", es: "Abriendo los anales…" },
  heroKicker: { ko: "당신의 생일, 600년 전 그날", en: "Your birthday, 600 years ago", ja: "あなたの誕生日、600年前のその日", zh: "你的生日，600年前的那一天", fr: "Votre anniversaire, il y a 600 ans", es: "Tu cumpleaños, hace 600 años" },
  date: { ko: "세종 8년 {m}월 {d}일", en: "Sejong year 8, month {m}, day {d}", ja: "世宗8年{m}月{d}日", zh: "世宗八年{m}月{d}日", fr: "An 8 de Sejong, mois {m}, jour {d}", es: "Año 8 de Sejong, mes {m}, día {d}" },
  solarDate: { ko: "양력으로 {y}년 {m}월 {d}일", en: "{y}-{m2}-{d2} in today's calendar", ja: "新暦で{y}年{m}月{d}日", zh: "阳历{y}年{m}月{d}日", fr: "{d}/{m}/{y} dans notre calendrier", es: "{d}/{m}/{y} en nuestro calendario" },
  near: { ko: "이날은 실록에 기사가 없어요. 가장 가까운 {dir} {n}일 {which}의 기록이에요.", en: "Nothing was recorded that day; here is the closest entry, {n} day(s) {dirEn}.", ja: "この日は記事がありません。最も近い{n}日{dirJa}の記録です。", zh: "这一天没有记载，以下是最近的{n}天{dirZh}的记录。", fr: "Rien ce jour-là : voici l'entrée la plus proche, {n} jour(s) {dirFr}.", es: "Nada ese día: esta es la entrada más cercana, {n} día(s) {dirEs}." },
  outside: { ko: "음력 한 해(354일)가 양력보다 11일 짧아서, 이 생일은 세종 8년 바깥에 떨어져요. 가장 가까운 날을 보여드려요.", en: "The lunar year is 11 days shorter than ours, so this birthday falls just outside Sejong's 8th year; here is the closest day.", ja: "旧暦の1年は11日短く、この誕生日は世宗8年の外にあたります。最も近い日を示します。", zh: "农历一年比阳历短11天，这个生日落在世宗八年之外，显示最接近的一天。", fr: "L'année lunaire compte 11 jours de moins : cette date tombe hors de l'an 8, voici le jour le plus proche.", es: "El año lunar tiene 11 días menos: esta fecha cae fuera del año 8; este es el día más cercano." },
  summaryTitle: { ko: "그날 실록에는", en: "That day the annals record", ja: "その日の実録には", zh: "那天的实录记载", fr: "Ce jour-là, les annales notent", es: "Ese día los anales anotan" },
  original: { ko: "원문", en: "Original text", ja: "原文", zh: "原文", fr: "Texte original", es: "Texto original" },
  count: { ko: "이날 실록 기사는 모두 {n}건이에요. 그중 하나를 골라 풀었어요.", en: "{n} entries that day; one is summarised here.", ja: "この日の記事は全{n}件。そのうち一つを要約しました。", zh: "当天共有{n}条记载，这里摘译其中一条。", fr: "{n} entrées ce jour-là ; l'une est résumée ici.", es: "{n} entradas ese día; aquí se resume una." },
  summaryNote: { ko: "풀이는 원문을 쉽게 줄인 것이에요. 정확한 번역은 국사편찬위원회 조선왕조실록에서 확인하세요.", en: "The summary is a plain paraphrase; check the Sillok translations of the National Institute of Korean History for exact wording.", ja: "要約は原文をやさしく言い換えたものです。正確な訳は国史編纂委員会の朝鮮王朝実録で。", zh: "摘译为通俗转述，准确译文请查阅韩国国史编纂委员会《朝鲜王朝实录》。", fr: "Résumé libre ; la traduction exacte se trouve sur le site de l'Institut national d'histoire coréenne.", es: "Resumen libre; la traducción exacta está en el sitio del Instituto Nacional de Historia Coreana." },
  sillokLink: { ko: "조선왕조실록(국사편찬위원회)", en: "Annals of the Joseon Dynasty (NIKH)", ja: "朝鮮王朝実録（国史編纂委員会）", zh: "朝鲜王朝实录（国史编纂委员会）", fr: "Annales de Joseon (NIKH)", es: "Anales de Joseon (NIKH)" },
  sourceLabel: { ko: "『세종실록』 8년 원문(위키문헌)", en: "Sejong Sillok, year 8 (Wikisource text)", ja: "『世宗実録』8年（ウィキソース）", zh: "《世宗实录》八年（维基文库）", fr: "Annales de Sejong, an 8 (Wikisource)", es: "Anales de Sejong, año 8 (Wikisource)" },
  cardKicker: { ko: "1426 · 내 생일의 실록", en: "1426 · My birthday in the annals", ja: "1426・誕生日の実録", zh: "1426·我生日那天的实录", fr: "1426 · Mon anniversaire dans les annales", es: "1426 · Mi cumpleaños en los anales" },
  weatherTitle: { ko: "그 무렵 한양 날씨", en: "Hanyang weather around that day", ja: "その頃の漢陽の天気", zh: "那几天汉阳的天气", fr: "Le temps à Hanyang ces jours-là", es: "El tiempo en Hanyang esos días" },
  weatherWhen: { ko: "{m}월 {d}일 · {rel}", en: "month {m}, day {d} · {rel}", ja: "{m}月{d}日・{rel}", zh: "{m}月{d}日·{rel}", fr: "mois {m}, jour {d} · {rel}", es: "mes {m}, día {d} · {rel}" },
  sameDay: { ko: "바로 그날", en: "that very day", ja: "まさにその日", zh: "就在当天", fr: "le jour même", es: "ese mismo día" },
  before: { ko: "{n}일 전", en: "{n} days before", ja: "{n}日前", zh: "{n}天前", fr: "{n} jours avant", es: "{n} días antes" },
  after: { ko: "{n}일 뒤", en: "{n} days after", ja: "{n}日後", zh: "{n}天后", fr: "{n} jours après", es: "{n} días después" },
  weatherNote: { ko: "실록에 짧게 남은 날씨·지진·기우제 기록 52건 가운데 생일 앞뒤 열흘 안의 것을 모았어요. 이 해 봄에는 가뭄이 길어 4월 내내 비를 빌었고, 5월 말부터 큰비가 내려 6월 4일에는 한양 19호가 물에 떠내려갔어요.", en: "From 52 short weather, earthquake and rain-prayer notices in the Annals, those within ten days of your birthday. That spring a long drought had the court praying for rain all through the 4th month; heavy rain followed from late in the 5th, and on 6/4 nineteen houses in Hanyang were swept away.", ja: "実録に短く残る天気・地震・祈雨の記録52件から、誕生日の前後10日以内のものを集めました。この年の春は日照りが続き4月はずっと雨乞いをし、5月末から大雨が降り、6月4日には漢陽の19戸が流されました。", zh: "从实录中52条简短的天气、地震、祈雨记录里，挑出生日前后十天内的。这年春天久旱，四月一直祈雨；五月底起大雨，六月四日汉阳有19户被冲走。", fr: "Parmi 52 brèves notes de météo, séismes et prières pour la pluie, celles à moins de dix jours de votre anniversaire. Ce printemps-là, la sécheresse fit prier pour la pluie tout le 4e mois ; de fortes pluies suivirent et, le 4 du 6e mois, dix-neuf maisons de Hanyang furent emportées.", es: "De 52 breves notas de tiempo, terremotos y rogativas por la lluvia, las que caen a menos de diez días de tu cumpleaños. Esa primavera la sequía hizo rezar por lluvia todo el 4.º mes; luego vinieron lluvias fuertes y el día 4 del 6.º mes diecinueve casas de Hanyang fueron arrastradas." },
  badge: { ko: "세종실록", en: "Sejong Sillok", ja: "世宗実録", zh: "世宗实录", fr: "Annales de Sejong", es: "Anales de Sejong" },
} satisfies Record<string, Six>;

const WEATHER: Record<WeatherKind, { emoji: string; label: Six }> = {
  pray: { emoji: "🙏", label: { ko: "기우제", en: "Prayer for rain", ja: "雨乞い", zh: "祈雨", fr: "Prière pour la pluie", es: "Rogativa por la lluvia" } },
  thanks: { emoji: "🎐", label: { ko: "비 내린 뒤 감사 제사", en: "Thanksgiving rite after rain", ja: "雨の後の報祀", zh: "雨后报祀", fr: "Rite d'action de grâce", es: "Rito de gracias" } },
  quake: { emoji: "🫨", label: { ko: "지진", en: "Earthquake", ja: "地震", zh: "地震", fr: "Séisme", es: "Terremoto" } },
  hail: { emoji: "🧊", label: { ko: "우박", en: "Hail", ja: "雹", zh: "冰雹", fr: "Grêle", es: "Granizo" } },
  storm: { emoji: "🌊", label: { ko: "큰비", en: "Heavy rain", ja: "大雨", zh: "大雨", fr: "Pluie diluvienne", es: "Lluvia torrencial" } },
  thunder: { emoji: "⛈️", label: { ko: "천둥 번개", en: "Thunder and lightning", ja: "雷", zh: "雷电", fr: "Orage", es: "Tormenta" } },
  fog: { emoji: "🌫️", label: { ko: "짙은 안개", en: "Thick fog", ja: "濃霧", zh: "大雾", fr: "Brouillard épais", es: "Niebla espesa" } },
  wind: { emoji: "💨", label: { ko: "큰바람", en: "Gale", ja: "大風", zh: "大风", fr: "Grand vent", es: "Vendaval" } },
  drought: { emoji: "🏜️", label: { ko: "가뭄 걱정", en: "Drought worries", ja: "日照りの心配", zh: "忧旱", fr: "Inquiétude de sécheresse", es: "Preocupación por la sequía" } },
  rain: { emoji: "🌧️", label: { ko: "비", en: "Rain", ja: "雨", zh: "雨", fr: "Pluie", es: "Lluvia" } },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

type Result = { q: SillokQuery; month: number; day: number; offset: number; outside: boolean; jdn: number; entry: Day; weather: { note: WeatherNote; delta: number }[] };

function resolve(q: SillokQuery, data: Data): Result | null {
  const starts = monthStarts(data.shuo);
  let month = q.month;
  let day = q.day;
  let outside = false;
  if (q.kind === "solar") {
    const l = solarToLunar(q.month, q.day, starts);
    month = l.month;
    day = l.day;
    outside = l.outside;
  } else {
    day = Math.min(day, monthLength(month, starts));
  }
  const near = nearestRecorded(month, day, starts, (k) => k in data.days);
  if (!near) return null;
  const weather = data.w ? weatherNear(lunarToJdn(month, day, starts), data.w, starts) : [];
  return { q, month: near.month, day: near.day, offset: near.offset, outside, jdn: lunarToJdn(near.month, near.day, starts), entry: data.days[`${near.month}-${near.day}`], weather };
}

const summaryOf = (e: Day, l: L) => (l === "ko" ? e.ko : e.en);

export default function Sillok1426({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [kind, setKind] = useState<"solar" | "lunar">("solar");
  const [lm, setLm] = useState(1);
  const [ld, setLd] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseSillok(window.location.search);
    if (shared) load().then((d) => setResult(resolve(shared, d)));
  }, []);

  function show(q: SillokQuery) {
    funnel(q.kind);
    setBusy(true);
    load()
      .then((d) => {
        const r = resolve(q, d);
        warp.start(() => {
          setResult(r);
          setRound((x) => x + 1);
          setShareQuery(formatSillok(q));
          stampEpisode(EP);
        });
      })
      .finally(() => setBusy(false));
  }

  const r = result;
  const solar = r ? fromJdn(r.jdn) : null;
  const dateText = r ? fill(pick(C.date, l), { m: r.month, d: r.day }) : "";
  const hanjaDate = r ? `世宗八年 ${MONTH_HANJA[r.month - 1]}月 ${r.day}日 ${r.entry.gz}` : "";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1426} l={l} onDone={warp.finish} />}

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-bold text-foreground">{pick(C.kindLabel, l)}</p>
        <div className="flex gap-2">
          {(["solar", "lunar"] as const).map((k) => (
            <Button key={k} variant={k === kind ? "default" : "outline"} aria-pressed={k === kind} className="min-h-11 flex-1" onClick={() => setKind(k)}>
              {pick(k === "solar" ? C.solar : C.lunar, l)}
            </Button>
          ))}
        </div>
      </section>

      {kind === "solar" ? (
        <BirthdayPicker l={l} cta={pick(C.go, l)} onSubmit={(b) => show({ kind: "solar", month: Number(b.slice(5, 7)), day: Number(b.slice(8, 10)) })} />
      ) : (
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-sm font-bold text-foreground">{pick(C.month, l)}</span>
              <select value={lm} onChange={(e) => setLm(Number(e.target.value))} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base">
                {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-bold text-foreground">{pick(C.day, l)}</span>
              <select value={ld} onChange={(e) => setLd(Number(e.target.value))} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base">
                {Array.from({ length: 30 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </label>
          </div>
          <Button size="lg" className="w-full" disabled={busy} onClick={() => show({ kind: "lunar", month: lm, day: ld })}>
            {pick(C.go, l)}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">{pick(C.lunarNote, l)}</p>
        </div>
      )}

      {busy && <p className="text-sm text-muted-foreground">{pick(C.loading, l)}</p>}

      {r && solar && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 font-serif text-2xl font-black text-foreground">{hanjaDate}</p>
            <p className="mt-2 text-xl font-black text-primary">{dateText}</p>
            <p className="mt-1 text-sm text-muted-foreground">{fill(pick(C.solarDate, l), { y: solar.y, m: solar.m, d: solar.d, m2: String(solar.m).padStart(2, "0"), d2: String(solar.d).padStart(2, "0") })}</p>
            {r.outside && <p className="mt-3 text-xs text-muted-foreground">{pick(C.outside, l)}</p>}
            {r.offset !== 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                {fill(pick(C.near, l), {
                  n: Math.abs(r.offset),
                  dir: r.offset < 0 ? "앞" : "뒤",
                  which: r.offset < 0 ? "전" : "후",
                  dirEn: r.offset < 0 ? "earlier" : "later",
                  dirJa: r.offset < 0 ? "前" : "後",
                  dirZh: r.offset < 0 ? "前" : "后",
                  dirFr: r.offset < 0 ? "plus tôt" : "plus tard",
                  dirEs: r.offset < 0 ? "antes" : "después",
                })}
              </p>
            )}
          </section>

          <Panel label={pick(C.summaryTitle, l)}>
            <p className="text-lg font-bold leading-relaxed">{summaryOf(r.entry, l)}</p>
            <p className="pt-2 text-xs text-muted-foreground">{fill(pick(C.count, l), { n: r.entry.n })}</p>
          </Panel>

          <Panel label={pick(C.original, l)}>
            <p lang="zh-Hant" className="font-serif text-base leading-loose">{r.entry.t}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.summaryNote, l)}</p>
          </Panel>

          {r.weather.length > 0 && (
            <Panel label={pick(C.weatherTitle, l)}>
              <ul className="space-y-3">
                {r.weather.map(({ note, delta }) => (
                  <li key={`${note[0]}-${note[1]}-${note[3].slice(0, 8)}`} className="space-y-1">
                    <p className="text-sm font-bold text-foreground">
                      {WEATHER[note[2]].emoji} {pick(WEATHER[note[2]].label, l)}{" "}
                      <span className="font-normal text-muted-foreground">
                        {fill(pick(C.weatherWhen, l), { m: note[0], d: note[1], rel: delta === 0 ? pick(C.sameDay, l) : fill(pick(delta < 0 ? C.before : C.after, l), { n: Math.abs(delta) }) })}
                      </span>
                    </p>
                    <p lang="zh-Hant" className="font-serif text-sm leading-relaxed">{note[3]}</p>
                  </li>
                ))}
              </ul>
              <p className="pt-2 text-xs text-muted-foreground">{pick(C.weatherNote, l)}</p>
            </Panel>
          )}

          <Sources
            l={l}
            items={[
              { label: pick(C.sourceLabel, l), url: `${SOURCE}2122908` },
              { label: pick(C.sillokLink, l), url: "https://sillok.history.go.kr/" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-sillok-1426-${r.month}-${r.day}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: dateText,
              subtitle: `${r.entry.gz} · ${fill(pick(C.solarDate, l), { y: solar.y, m: solar.m, d: solar.d, m2: String(solar.m).padStart(2, "0"), d2: String(solar.d).padStart(2, "0") })}`,
              badge: pick(C.badge, l),
              lines: [summaryOf(r.entry, l)],
              footer: "oiyo.net · 1426",
              accent: "#3d4f6b",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
