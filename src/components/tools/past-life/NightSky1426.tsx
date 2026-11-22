import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { joseonTime } from "../../../lib/joseon-time";
import { PHASE_EMOJI, SOLAR_TERMS_HANJA, SOLAR_TERMS_KO, eclipticOf, elongation, phaseKey, skyAt, termIndex, visible, type Body, type Sky } from "../../../lib/night-sky-1426";
import { SHUO_1426, formatNight, parseNight, type NightQuery } from "../../../lib/night-sky-1426-share";
import { dayGanzhi, jdn, monthStarts, solarToLunar } from "../../../lib/sillok-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "night-sky-1426" as const;
const STARTS = monthStarts(SHUO_1426);

const C = {
  go: { ko: "1426년 그날 밤하늘 보기", en: "See that night's sky in 1426", ja: "1426年のその夜空を見る", zh: "看1426年那晚的星空", fr: "Voir le ciel de cette nuit de 1426", es: "Ver el cielo de esa noche de 1426" },
  again: { ko: "다른 밤 보기", en: "Another night", ja: "別の夜", zh: "换一晚", fr: "Une autre nuit", es: "Otra noche" },
  kicker: { ko: "1426년 {m}월 {d}일 밤, 한양", en: "Hanyang, the night of {d}/{m}/1426", ja: "1426年{m}月{d}日の夜、漢陽", zh: "1426年{m}月{d}日夜，汉阳", fr: "Hanyang, nuit du {d}/{m}/1426", es: "Hanyang, noche del {d}/{m}/1426" },
  lunar: { ko: "실록 달력으로 세종 8년 {lm}월 {ld}일 {gz}일", en: "Sejong year 8, lunar month {lm} day {ld} ({gz}) in the Sillok calendar", ja: "実録の暦で世宗8年{lm}月{ld}日（{gz}）", zh: "按实录历法为世宗八年{lm}月{ld}日（{gz}）", fr: "An 8 de Sejong, mois lunaire {lm}, jour {ld} ({gz}) selon le calendrier des Annales", es: "Año 8 de Sejong, mes lunar {lm}, día {ld} ({gz}) según el calendario de los Anales" },
  outside: { ko: "이날은 세종 8년 음력 달력 바깥이라 음력 날짜는 생략했어요.", en: "This day falls outside Sejong's 8th lunar year, so no lunar date is shown.", ja: "この日は世宗8年の旧暦の外なので旧暦日は省きました。", zh: "这一天在世宗八年农历之外，略去农历日期。", fr: "Ce jour tombe hors de l'an 8 lunaire : pas de date lunaire.", es: "Este día cae fuera del año 8 lunar: sin fecha lunar." },
  term: { ko: "절기로는 {t} 무렵", en: "Near the solar term {t}", ja: "節気は{t}の頃", zh: "节气在{t}前后", fr: "Vers le terme solaire {t}", es: "Cerca del término solar {t}" },
  evening: { ko: "인정 종이 울릴 무렵 ({t})", en: "When the curfew bell rang ({t})", ja: "人定の鐘が鳴る頃（{t}）", zh: "人定钟响时（{t}）", fr: "Au son de la cloche du couvre-feu ({t})", es: "Al sonar la campana del toque de queda ({t})" },
  dawn: { ko: "파루 종이 울릴 무렵 ({t})", en: "When the dawn bell rang ({t})", ja: "罷漏の鐘が鳴る頃（{t}）", zh: "罢漏钟响时（{t}）", fr: "Au son de la cloche de l'aube ({t})", es: "Al sonar la campana del alba ({t})" },
  none: { ko: "이 시각 지평선 위에 밝은 행성은 없어요.", en: "No bright planet is above the horizon at this hour.", ja: "この時刻、地平線の上に明るい惑星はありません。", zh: "此刻地平线上没有明亮的行星。", fr: "Aucune planète brillante au-dessus de l'horizon.", es: "Ningún planeta brillante sobre el horizonte." },
  at: { ko: "{dir} 하늘, 고도 {alt}°", en: "{dir}, {alt}° up", ja: "{dir}の空、高度{alt}°", zh: "{dir}天空，高度{alt}°", fr: "{dir}, à {alt}° de haut", es: "{dir}, a {alt}° de altura" },
  fiveTitle: { ko: "오성(五星)", en: "The five stars", ja: "五星", zh: "五星", fr: "Les cinq astres", es: "Los cinco astros" },
  five: { ko: "조선은 맨눈에 보이는 다섯 행성을 오성이라 부르고 진성·태백·형혹·세성·전성이라는 이름을 썼어요. 달이 몇 날인지는 실록의 날짜가 그대로 알려 줘요. 음력 초하루는 그믐달이 사라진 날, 보름은 둥근 달이에요.", en: "Joseon called the five naked-eye planets the Five Stars: Chenxing (Mercury), Taibai (Venus), Yinghuo (Mars), Suixing (Jupiter) and Zhenxing (Saturn). The lunar date in the Annals tells you the moon's age directly: day 1 is new moon, day 15 is full.", ja: "朝鮮では肉眼で見える5惑星を五星と呼び、辰星・太白・熒惑・歳星・塡星と名付けました。月の満ち欠けは実録の日付がそのまま教えてくれます。", zh: "朝鲜把肉眼可见的五颗行星称为五星：辰星、太白、荧惑、岁星、填星。实录的农历日期直接告诉你月相：初一是朔，十五是望。", fr: "Joseon appelait les cinq planètes visibles à l'œil nu les Cinq Astres. La date lunaire des Annales donne directement l'âge de la Lune : le 1er est la nouvelle lune, le 15 la pleine lune.", es: "Joseon llamaba a los cinco planetas visibles los Cinco Astros. La fecha lunar de los Anales da la edad de la Luna: el día 1 es luna nueva, el 15 luna llena." },
  aboutTitle: { ko: "어떻게 계산하나요", en: "How it is worked out", ja: "計算方法", zh: "怎么算的", fr: "Méthode", es: "Cómo se calcula" },
  about: { ko: "행성은 NASA JPL이 공개한 근사 궤도 요소(기원전 3000년~서기 3000년용), 달은 Meeus의 근사식으로 위치를 구하고 한양에서 본 고도·방위로 바꿨어요. 600년 전이라 위치는 1~2°쯤 어긋날 수 있어요. 날짜는 '계절상 같은 날'이 되도록 그레고리력을 거꾸로 늘려 썼고, 인정·파루 시각은 「지금 시각을 조선 시각으로」와 같은 규칙으로 계산했어요. 달 날짜(초하루)가 실록 달력과 맞는지 시험으로 확인했어요.", en: "Planet positions come from NASA JPL's approximate orbital elements (valid 3000 BC–AD 3000) and the Moon from Meeus's approximation, converted to altitude and azimuth from Hanyang; six centuries back they may be 1–2° off. Dates use the proleptic Gregorian calendar (same point in the seasons). We check that new moons fall on the first day of each Sillok month.", ja: "惑星はNASA JPLの近似軌道要素、月はMeeusの近似式で求め、漢陽から見た高度・方位に直しました。600年前なので1〜2°ずれることがあります。新月が実録の各月1日に来ることをテストで確認しています。", zh: "行星位置用NASA JPL的近似轨道根数，月亮用Meeus近似式，再换算为汉阳的高度和方位。六百年前的位置可能差1到2度。已用测试确认朔日与实录历法一致。", fr: "Planètes : éléments orbitaux approchés du JPL (NASA) ; Lune : formule approchée de Meeus ; conversion en hauteur et azimut depuis Hanyang. Six siècles en arrière, l'écart peut atteindre 1–2°. Les nouvelles lunes tombent bien le 1er de chaque mois des Annales.", es: "Planetas: elementos orbitales aproximados del JPL (NASA); Luna: fórmula aproximada de Meeus; convertidos a altura y azimut desde Hanyang. Seis siglos atrás el error puede ser de 1–2°. Las lunas nuevas coinciden con el día 1 de cada mes de los Anales." },
  sillokLink: { ko: "그날 실록 기사 보기", en: "Read that day in the Annals", ja: "その日の実録を見る", zh: "看那天的实录", fr: "Lire ce jour dans les Annales", es: "Leer ese día en los Anales" },
  src1: { ko: "NASA JPL 행성 근사 위치", en: "NASA JPL approximate planet positions", ja: "NASA JPL 惑星の近似位置", zh: "NASA JPL 行星近似位置", fr: "NASA JPL, positions approchées", es: "NASA JPL, posiciones aproximadas" },
  src2: { ko: "세종실록 8년(위키문헌)", en: "Sejong Sillok, year 8 (Wikisource)", ja: "世宗実録8年（ウィキソース）", zh: "世宗实录八年（维基文库）", fr: "Sejong Sillok, an 8 (Wikisource)", es: "Sejong Sillok, año 8 (Wikisource)" },
  cardKicker: { ko: "1426 · 내 생일 밤 한양 하늘", en: "1426 · Hanyang sky on my birthday", ja: "1426・誕生日の夜の漢陽の空", zh: "1426·生日那晚的汉阳星空", fr: "1426 · Le ciel de Hanyang à mon anniversaire", es: "1426 · El cielo de Hanyang en mi cumpleaños" },
  badge: { ko: "오성 관측", en: "Sky watch", ja: "五星観測", zh: "五星观测", fr: "Ciel", es: "Cielo" },
} satisfies Record<string, Six>;

const PHASES: Record<keyof typeof PHASE_EMOJI, Six> = {
  new: { ko: "그믐·초승 무렵의 어두운 달", en: "new moon", ja: "新月", zh: "新月", fr: "nouvelle lune", es: "luna nueva" },
  waxingCrescent: { ko: "초승달", en: "waxing crescent", ja: "三日月", zh: "峨眉月", fr: "premier croissant", es: "luna creciente" },
  firstQuarter: { ko: "상현달", en: "first quarter", ja: "上弦の月", zh: "上弦月", fr: "premier quartier", es: "cuarto creciente" },
  waxingGibbous: { ko: "차오르는 달", en: "waxing gibbous", ja: "十三夜の月", zh: "盈凸月", fr: "gibbeuse croissante", es: "gibosa creciente" },
  full: { ko: "보름달", en: "full moon", ja: "満月", zh: "满月", fr: "pleine lune", es: "luna llena" },
  waningGibbous: { ko: "기우는 달", en: "waning gibbous", ja: "寝待月", zh: "亏凸月", fr: "gibbeuse décroissante", es: "gibosa menguante" },
  lastQuarter: { ko: "하현달", en: "last quarter", ja: "下弦の月", zh: "下弦月", fr: "dernier quartier", es: "cuarto menguante" },
  waningCrescent: { ko: "그믐달", en: "waning crescent", ja: "有明の月", zh: "残月", fr: "dernier croissant", es: "luna menguante" },
};

const NAMES: Record<Exclude<Body, "sun">, Six & { hanja: string; emoji: string }> = {
  moon: { hanja: "月", emoji: "", ko: "달", en: "Moon", ja: "月", zh: "月亮", fr: "Lune", es: "Luna" },
  mercury: { hanja: "辰星", emoji: "☿", ko: "진성(수성)", en: "Mercury (Chenxing)", ja: "辰星（水星）", zh: "辰星（水星）", fr: "Mercure (Chenxing)", es: "Mercurio (Chenxing)" },
  venus: { hanja: "太白", emoji: "♀", ko: "태백(금성)", en: "Venus (Taibai)", ja: "太白（金星）", zh: "太白（金星）", fr: "Vénus (Taibai)", es: "Venus (Taibai)" },
  mars: { hanja: "熒惑", emoji: "♂", ko: "형혹(화성)", en: "Mars (Yinghuo)", ja: "熒惑（火星）", zh: "荧惑（火星）", fr: "Mars (Yinghuo)", es: "Marte (Yinghuo)" },
  jupiter: { hanja: "歲星", emoji: "♃", ko: "세성(목성)", en: "Jupiter (Suixing)", ja: "歳星（木星）", zh: "岁星（木星）", fr: "Jupiter (Suixing)", es: "Júpiter (Suixing)" },
  saturn: { hanja: "塡星", emoji: "♄", ko: "전성(토성)", en: "Saturn (Zhenxing)", ja: "塡星（土星）", zh: "填星（土星）", fr: "Saturne (Zhenxing)", es: "Saturno (Zhenxing)" },
};

const DIRS: Record<L, string[]> = {
  ko: ["북쪽", "북동쪽", "동쪽", "남동쪽", "남쪽", "남서쪽", "서쪽", "북서쪽"],
  en: ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"],
  ja: ["北", "北東", "東", "南東", "南", "南西", "西", "北西"],
  zh: ["北方", "东北", "东方", "东南", "南方", "西南", "西方", "西北"],
  fr: ["Nord", "Nord-est", "Est", "Sud-est", "Sud", "Sud-ouest", "Ouest", "Nord-ouest"],
  es: ["Norte", "Noreste", "Este", "Sureste", "Sur", "Suroeste", "Oeste", "Noroeste"],
};
const dirOf = (az: number, l: L) => DIRS[l][Math.round(az / 45) % 8]!;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(Math.round(m) % 60).padStart(2, "0")}`;

type Night = {
  q: NightQuery;
  lunar: { lm: number; ld: number; gz: string } | null;
  phase: keyof typeof PHASE_EMOJI;
  term: number;
  evening: { sky: Sky; kst: string };
  dawn: { sky: Sky; kst: string };
};

function compute(q: NightQuery): Night {
  const l = solarToLunar(q.month, q.day, STARTS);
  const dayJ = l.outside ? jdn(1426, q.month, q.day) : l.jdn;
  const t = joseonTime(0, q.month, q.day);
  const at = (solarMin: number, next: boolean) => {
    const base = dayJ + (next ? 1 : 0) - 0.5;
    const ut = solarMin - 4 * 126.978 - t.eqTime;
    return base + ut / 1440;
  };
  const toKst = (m: number) => hhmm((((m + 540 - 4 * 126.978 - t.eqTime) % 1440) + 1440) % 1440);
  const eveJd = at(t.injeong, t.injeong < 720);
  const dawnJd = at(t.paru, t.paru < 720);
  const sun = eclipticOf("sun", eveJd).lon;
  const moon = eclipticOf("moon", eveJd).lon;
  return {
    q,
    lunar: l.outside ? null : { lm: l.month, ld: l.day, gz: dayGanzhi(l.jdn) },
    phase: phaseKey(elongation(moon, sun)),
    term: termIndex(sun),
    evening: { sky: skyAt(eveJd), kst: toKst(t.injeong) },
    dawn: { sky: skyAt(dawnJd), kst: toKst(t.paru) },
  };
}

function SkyChart({ sky, phase, l, title }: { sky: Sky; phase: keyof typeof PHASE_EMOJI; l: L; title: string }) {
  const W = 340;
  const H = 150;
  // Panorama centred on south: x from azimuth 0..360 (north at both edges), y from altitude.
  const x = (az: number) => ((az % 360) / 360) * W;
  const y = (alt: number) => H - 20 - (Math.max(0, alt) / 90) * (H - 30);
  const shown = sky.objects.filter(visible);
  return (
    <figure className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl" role="img" aria-label={title}>
        <defs>
          <linearGradient id={`sky-${title.length}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1430" />
            <stop offset="1" stopColor="#24345e" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#sky-${title.length})`} />
        <rect y={H - 20} width={W} height={20} fill="#1a1410" />
        {[0, 90, 180, 270].map((az, i) => (
          <text key={az} x={Math.min(W - 8, Math.max(8, x(az)))} y={H - 6} fill="#d8c9a8" fontSize="10" textAnchor="middle">
            {DIRS[l][i * 2]}
          </text>
        ))}
        {shown.map((o) => (
          <g key={o.body}>
            {o.body === "moon" ? (
              <text x={x(o.az)} y={y(o.alt) + 6} fontSize="18" textAnchor="middle">
                {PHASE_EMOJI[phase]}
              </text>
            ) : (
              <circle cx={x(o.az)} cy={y(o.alt)} r={o.body === "venus" || o.body === "jupiter" ? 3.5 : 2.5} fill={o.body === "mars" ? "#ff9a6b" : "#fff6d8"} />
            )}
            <text x={x(o.az)} y={y(o.alt) - 9} fill="#f3e6c4" fontSize="10" textAnchor="middle">
              {NAMES[o.body as Exclude<Body, "sun">].hanja}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="text-xs text-muted-foreground">{title}</figcaption>
    </figure>
  );
}

export default function NightSky1426({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [mode, setMode] = useState<Mode>("birthday");
  const [night, setNight] = useState<Night | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseNight(window.location.search);
    if (shared) setNight(compute(shared));
  }, []);

  function show(q: NightQuery, how: string) {
    const next = compute(q);
    funnel(how);
    warp.start(() => {
      setNight(next);
      setRound((r) => r + 1);
      setShareQuery(formatNight(q));
      stampEpisode(EP);
    });
  }

  function randomDay() {
    const doy = 1 + Math.floor(Math.random() * 365);
    const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
    const m = cum.findIndex((c) => c >= doy);
    show({ month: m, day: doy - cum[m - 1]! }, "random");
  }

  const planetLines = (sky: Sky) =>
    sky.objects
      .filter((o) => o.body !== "moon" && visible(o))
      .map((o) => `${NAMES[o.body as Exclude<Body, "sun">][l]} · ${fill(pick(C.at, l), { dir: dirOf(o.az, l), alt: Math.round(o.alt) })}`);

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1426} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.go, l)} onSubmit={(b) => show({ month: Number(b.slice(5, 7)), day: Number(b.slice(8, 10)) }, "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={randomDay}>
          {pick(night ? C.again : C.go, l)}
        </Button>
      )}

      {night && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{fill(pick(C.kicker, l), { m: night.q.month, d: night.q.day })}</p>
            <p className="mt-3 text-6xl" aria-hidden="true">{PHASE_EMOJI[night.phase]}</p>
            <p className="mt-2 text-2xl font-black text-foreground">{pick(PHASES[night.phase], l)}</p>
            <p className="mt-2 text-sm text-foreground">{night.lunar ? fill(pick(C.lunar, l), night.lunar) : pick(C.outside, l)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{fill(pick(C.term, l), { t: l === "ko" ? `${SOLAR_TERMS_KO[night.term]}(${SOLAR_TERMS_HANJA[night.term]})` : SOLAR_TERMS_HANJA[night.term]! })}</p>
          </section>

          {([["evening", C.evening], ["dawn", C.dawn]] as const).map(([k, label]) => {
            const v = night[k];
            const lines = planetLines(v.sky);
            const title = fill(pick(label, l), { t: v.kst });
            return (
              <Panel key={k} label={title}>
                <SkyChart sky={v.sky} phase={night.phase} l={l} title={title} />
                {lines.length ? (
                  <ul className="space-y-1 text-sm">
                    {lines.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm">{pick(C.none, l)}</p>
                )}
              </Panel>
            );
          })}

          <Panel label={pick(C.fiveTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.five, l)}</p>
            <p className="pt-1 text-sm">
              <a className="font-bold underline" href={`/${locale}/sillok-1426/?c=s&m=${night.q.month}&d=${night.q.day}`}>
                {pick(C.sillokLink, l)} →
              </a>
            </p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.about, l)}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html" },
              { label: pick(C.src2, l), url: "https://zh.wikisource.org/w/index.php?title=%E6%9C%9D%E9%AE%AE%E7%8E%8B%E6%9C%9D%E5%AF%A6%E9%8C%84/%E4%B8%96%E5%AE%97%E5%AF%A6%E9%8C%84/%E5%85%AB%E5%B9%B4&oldid=2122908" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename="oiyo-night-sky-1426"
            spec={{
              kicker: pick(C.cardKicker, l),
              title: `${PHASE_EMOJI[night.phase]} ${pick(PHASES[night.phase], l)}`,
              subtitle: night.lunar ? fill(pick(C.lunar, l), night.lunar) : fill(pick(C.kicker, l), { m: night.q.month, d: night.q.day }),
              badge: pick(C.badge, l),
              lines: [...planetLines(night.evening.sky), ...planetLines(night.dawn.sky)].slice(0, 3),
              footer: `oiyo.net · 1426 · ${SOLAR_TERMS_HANJA[night.term]}`,
              accent: "#24345e",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
