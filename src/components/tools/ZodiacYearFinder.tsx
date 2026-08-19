import { useMemo, useState } from "react";
import type { Locale } from "../../i18n";
import {
  ANIMALS,
  BRANCHES as BRANCHES_KO,
  STEMS as STEMS_KO,
  lichunOf,
  lunarNewYearOf,
  sexagenaryOf,
  zodiacYearOf,
} from "../../lib/almanac/zodiac-year";

// 띠 이름은 로케일마다 다르다. 계산 모듈은 한국어 이름만 알고 있으므로
// 인덱스(자=0)로 받아 여기서 옮긴다.
const ANIMAL_NAMES: Record<Locale, readonly string[]> = {
  ko: ANIMALS,
  en: ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"],
  ja: ["子（ねずみ）", "丑（うし）", "寅（とら）", "卯（うさぎ）", "辰（たつ）", "巳（へび）", "午（うま）", "未（ひつじ）", "申（さる）", "酉（とり）", "戌（いぬ）", "亥（いのしし）"],
  zh: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],
  fr: ["Rat", "Bœuf", "Tigre", "Lapin", "Dragon", "Serpent", "Cheval", "Chèvre", "Singe", "Coq", "Chien", "Cochon"],
  es: ["Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"],
};

type Copy = {
  title: string;
  subtitle: string;
  birth: string;
  year: string;
  month: string;
  day: string;
  agreeTitle: string;
  agreeNote: (from: string) => string;
  splitTitle: string;
  splitNote: (lichun: string, lunar: string) => string;
  convSolar: string;
  convSolarWhy: string;
  convLichun: string;
  convLichunWhy: string;
  convLunar: string;
  convLunarWhy: string;
  colConv: string;
  colYear: string;
  colSexagenary: string;
  colAnimal: string;
  whyTitle: string;
  whyBody: string;
  tableTitle: string;
  tableNote: string;
  invalid: string;
};

const COPY: Record<Locale, Copy> = {
  ko: {
    title: "내 띠 확정하기",
    subtitle: "조견표는 연도만 적습니다. 1월과 2월생은 그 표들이 서로 다른 답을 냅니다.",
    birth: "생년월일",
    year: "년", month: "월", day: "일",
    agreeTitle: "세 관례가 모두 같습니다",
    agreeNote: (f) => `${f} 이후 출생이라 양력·입춘·음력설 어느 기준으로도 같은 해입니다.`,
    splitTitle: "기준에 따라 답이 갈립니다",
    splitNote: (l, n) => `이 해의 입춘은 ${l}, 음력 설날은 ${n}입니다. 생일이 그 앞이면 아직 지난 해의 띠입니다.`,
    convSolar: "양력 기준",
    convSolarWhy: "1월 1일에 바뀝니다. 시중 조견표 대부분이 이것입니다.",
    convLichun: "입춘 기준",
    convLichunWhy: "태양 황경이 315°가 될 때 바뀝니다. 사주가 쓰는 기준입니다.",
    convLunar: "음력설 기준",
    convLunarWhy: "음력 정월 초하루에 바뀝니다. 설·춘절이 쓰는 기준입니다.",
    colConv: "기준", colYear: "간지 연도", colSexagenary: "간지", colAnimal: "띠",
    whyTitle: "왜 답이 여럿인가",
    whyBody: "띠는 60갑자의 지지를 따르고, 갑자의 해가 언제 바뀌는지는 쓰는 곳마다 다릅니다. 달력은 1월 1일에, 사주는 입춘에, 명절은 음력 정월 초하루에 해를 바꿉니다. 세 날짜가 모두 1월 하순에서 2월 하순 사이에 흩어져 있어서, 그 구간에 태어난 사람만 답이 갈립니다. 2월 21일 이후 출생이면 어느 기준을 써도 같습니다.",
    tableTitle: "앞뒤 해",
    tableNote: "간지는 60년마다 같은 조합이 돌아옵니다.",
    invalid: "실제 날짜를 입력해 주세요.",
  },
  en: {
    title: "Which zodiac year were you born in",
    subtitle: "Reference tables print the year and stop. For January and February births, those tables disagree.",
    birth: "Date of birth",
    year: "Year", month: "Month", day: "Day",
    agreeTitle: "All three conventions agree",
    agreeNote: (f) => `Born after ${f}, so the solar, lichun and lunar-new-year reckonings all land on the same year.`,
    splitTitle: "The conventions disagree here",
    splitNote: (l, n) => `That year lichun falls on ${l} and lunar new year on ${n}. A birthday before either one still belongs to the previous year.`,
    convSolar: "Solar (1 Jan)",
    convSolarWhy: "Turns on 1 January. What most printed tables assume.",
    convLichun: "Lichun",
    convLichunWhy: "Turns when the sun reaches 315° of ecliptic longitude. What saju and bazi use.",
    convLunar: "Lunar new year",
    convLunarWhy: "Turns on the first day of the first lunar month — the holiday.",
    colConv: "Convention", colYear: "Zodiac year", colSexagenary: "Sexagenary", colAnimal: "Animal",
    whyTitle: "Why there is more than one answer",
    whyBody: "The animal comes from the earthly branch of the sexagenary cycle, and when that cycle turns over depends on who is counting. Civil calendars turn on 1 January, saju and bazi turn at lichun, and the holiday turns at the first new moon of the lunar year. Those dates scatter between late January and late February, so only births in that window get different answers. From 21 February onward every convention agrees.",
    tableTitle: "Neighbouring years",
    tableNote: "The same sexagenary combination returns every sixty years.",
    invalid: "Enter a real calendar date.",
  },
  ja: {
    title: "自分の干支を確定する",
    subtitle: "早見表は年だけを載せます。1月・2月生まれは、その表ごとに答えが変わります。",
    birth: "生年月日",
    year: "年", month: "月", day: "日",
    agreeTitle: "三つの基準がすべて一致します",
    agreeNote: (f) => `${f} 以降の生まれなので、新暦・立春・旧正月のどれで数えても同じ年です。`,
    splitTitle: "基準によって答えが分かれます",
    splitNote: (l, n) => `この年の立春は ${l}、旧正月は ${n} です。誕生日がその前なら、まだ前年の干支です。`,
    convSolar: "新暦基準",
    convSolarWhy: "1月1日に変わります。市販の早見表はたいていこれです。",
    convLichun: "立春基準",
    convLichunWhy: "太陽黄経が315°になる時に変わります。四柱推命が使う基準です。",
    convLunar: "旧正月基準",
    convLunarWhy: "旧暦一月一日に変わります。春節・旧正月が使う基準です。",
    colConv: "基準", colYear: "干支の年", colSexagenary: "干支", colAnimal: "十二支",
    whyTitle: "なぜ答えが複数あるのか",
    whyBody: "十二支は六十干支の地支に従い、その周期がいつ改まるかは数える側によって違います。暦は1月1日に、四柱推命は立春に、節句は旧暦一月一日に年を改めます。三つの日付が1月下旬から2月下旬に散らばっているため、その区間に生まれた人だけ答えが分かれます。2月21日以降の生まれなら、どの基準でも同じです。",
    tableTitle: "前後の年",
    tableNote: "同じ干支の組み合わせは六十年ごとに戻ってきます。",
    invalid: "実在する日付を入力してください。",
  },
  zh: {
    title: "确定你的生肖年",
    subtitle: "对照表只写年份。一月和二月出生的人，各家表格给出的答案并不相同。",
    birth: "出生日期",
    year: "年", month: "月", day: "日",
    agreeTitle: "三种算法完全一致",
    agreeNote: (f) => `出生于 ${f} 之后，按公历、立春或农历新年计算都落在同一年。`,
    splitTitle: "按不同算法，答案会分歧",
    splitNote: (l, n) => `该年立春为 ${l}，农历新年为 ${n}。生日在其之前，仍属上一年的生肖。`,
    convSolar: "公历（1月1日）",
    convSolarWhy: "在1月1日更替。多数印制对照表采用这种算法。",
    convLichun: "立春",
    convLichunWhy: "太阳黄经到达 315° 时更替。四柱八字采用这种算法。",
    convLunar: "农历新年",
    convLunarWhy: "在农历正月初一更替，即春节。",
    colConv: "算法", colYear: "生肖年", colSexagenary: "干支", colAnimal: "生肖",
    whyTitle: "为什么会有多个答案",
    whyBody: "生肖取自六十干支中的地支，而这一周期何时更替取决于由谁来数。民用历法在1月1日更替，四柱八字在立春更替，节日则在农历正月初一更替。这三个日期分散在一月下旬至二月下旬之间，因此只有在这段时间出生的人才会得到不同答案。2月21日之后出生的，各种算法一致。",
    tableTitle: "前后年份",
    tableNote: "相同的干支组合每六十年回归一次。",
    invalid: "请输入真实存在的日期。",
  },
  fr: {
    title: "Déterminer votre année zodiacale",
    subtitle: "Les tableaux impriment l'année et s'arrêtent là. Pour les naissances de janvier et février, ils se contredisent.",
    birth: "Date de naissance",
    year: "Année", month: "Mois", day: "Jour",
    agreeTitle: "Les trois conventions concordent",
    agreeNote: (f) => `Né après le ${f} : les comptes solaire, lichun et nouvel an lunaire tombent sur la même année.`,
    splitTitle: "Ici les conventions divergent",
    splitNote: (l, n) => `Cette année-là, lichun tombe le ${l} et le nouvel an lunaire le ${n}. Un anniversaire antérieur appartient encore à l'année précédente.`,
    convSolar: "Solaire (1er janv.)",
    convSolarWhy: "Change au 1er janvier. Ce que supposent la plupart des tableaux.",
    convLichun: "Lichun",
    convLichunWhy: "Change quand le soleil atteint 315° de longitude écliptique. Convention du saju et du bazi.",
    convLunar: "Nouvel an lunaire",
    convLunarWhy: "Change au premier jour du premier mois lunaire — la fête.",
    colConv: "Convention", colYear: "Année zodiacale", colSexagenary: "Cycle sexagésimal", colAnimal: "Animal",
    whyTitle: "Pourquoi plusieurs réponses",
    whyBody: "L'animal provient de la branche terrestre du cycle sexagésimal, et le moment où ce cycle bascule dépend de qui compte. Le calendrier civil bascule au 1er janvier, le saju et le bazi à lichun, la fête au premier jour du mois lunaire. Ces dates s'échelonnent de fin janvier à fin février : seules les naissances dans cette fenêtre reçoivent des réponses différentes. À partir du 21 février, toutes les conventions s'accordent.",
    tableTitle: "Années voisines",
    tableNote: "La même combinaison sexagésimale revient tous les soixante ans.",
    invalid: "Saisissez une date réelle.",
  },
  es: {
    title: "Determina tu año zodiacal",
    subtitle: "Las tablas imprimen el año y ahí terminan. Para nacimientos de enero y febrero, esas tablas se contradicen.",
    birth: "Fecha de nacimiento",
    year: "Año", month: "Mes", day: "Día",
    agreeTitle: "Las tres convenciones coinciden",
    agreeNote: (f) => `Nacido después del ${f}: los cómputos solar, lichun y de año nuevo lunar caen en el mismo año.`,
    splitTitle: "Aquí las convenciones discrepan",
    splitNote: (l, n) => `Ese año lichun cae el ${l} y el año nuevo lunar el ${n}. Un cumpleaños anterior pertenece todavía al año previo.`,
    convSolar: "Solar (1 ene.)",
    convSolarWhy: "Cambia el 1 de enero. Lo que asumen la mayoría de las tablas.",
    convLichun: "Lichun",
    convLichunWhy: "Cambia cuando el sol alcanza los 315° de longitud eclíptica. Convención del saju y el bazi.",
    convLunar: "Año nuevo lunar",
    convLunarWhy: "Cambia el primer día del primer mes lunar: la festividad.",
    colConv: "Convención", colYear: "Año zodiacal", colSexagenary: "Ciclo sexagesimal", colAnimal: "Animal",
    whyTitle: "Por qué hay más de una respuesta",
    whyBody: "El animal procede de la rama terrestre del ciclo sexagesimal, y cuándo gira ese ciclo depende de quién cuente. El calendario civil gira el 1 de enero, el saju y el bazi en lichun, y la festividad el primer día del mes lunar. Esas fechas se reparten entre finales de enero y finales de febrero, así que solo los nacimientos en esa ventana reciben respuestas distintas. Desde el 21 de febrero todas las convenciones coinciden.",
    tableTitle: "Años vecinos",
    tableNote: "La misma combinación sexagesimal vuelve cada sesenta años.",
    invalid: "Introduce una fecha real.",
  },
};

// 간지도 로케일마다 표기가 다르다. 한국어 음(경오)만 내보내면 영어·프랑스어
// 사용자가 읽을 수 없다. 한자는 동아시아 3개 로케일에서 그대로 쓰이고,
// 서구 로케일에는 병음 로마자 표기가 통용된다.
const STEM_CHAR = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_CHAR = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEM_ROMAN = ["jia", "yi", "bing", "ding", "wu", "ji", "geng", "xin", "ren", "gui"];
const BRANCH_ROMAN = ["zi", "chou", "yin", "mao", "chen", "si", "wu", "wei", "shen", "you", "xu", "hai"];

/** 그 로케일 독자가 읽을 수 있는 간지 표기. */
function sexagenaryLabel(locale: Locale, year: number): string {
  const n = ((year - 4) % 60 + 60) % 60;
  const si = n % 10;
  const bi = n % 12;
  if (locale === "ko") return `${STEMS_KO[si]}${BRANCHES_KO[bi]}`;
  if (locale === "ja" || locale === "zh") return `${STEM_CHAR[si]}${BRANCH_CHAR[bi]}`;
  // 서구 로케일: 한자를 병기해 원문을 잃지 않되, 읽을 수 있는 표기를 앞에 둔다.
  return `${STEM_ROMAN[si]}-${BRANCH_ROMAN[bi]} (${STEM_CHAR[si]}${BRANCH_CHAR[bi]})`;
}

const LOCALE_TAG: Record<Locale, string> = {
  ko: "ko-KR", en: "en-US", ja: "ja-JP", zh: "zh-CN", fr: "fr-FR", es: "es-ES",
};

export default function ZodiacYearFinder({ locale = "ko" }: { locale?: Locale }) {
  const t = COPY[locale] ?? COPY.ko;
  const names = ANIMAL_NAMES[locale] ?? ANIMAL_NAMES.en;
  const [y, setY] = useState("1990");
  const [m, setM] = useState("2");
  const [d, setD] = useState("10");

  const parsed = useMemo(() => {
    const yy = Number(y), mm = Number(m), dd = Number(d);
    if (!Number.isInteger(yy) || yy < 1900 || yy > 2100) return null;
    if (!Number.isInteger(mm) || mm < 1 || mm > 12) return null;
    if (!Number.isInteger(dd) || dd < 1 || dd > 31) return null;
    const date = new Date(Date.UTC(yy, mm - 1, dd));
    // 2월 30일 같은 입력은 Date 가 넘겨버리므로 되돌아온 값으로 확인한다.
    if (date.getUTCMonth() !== mm - 1 || date.getUTCDate() !== dd) return null;
    return date;
  }, [y, m, d]);

  const result = useMemo(() => (parsed ? zodiacYearOf(parsed) : null), [parsed]);

  const fmt = (date: Date) =>
    new Intl.DateTimeFormat(LOCALE_TAG[locale] ?? "en-US", {
      month: "long", day: "numeric", timeZone: "UTC",
    }).format(date);

  const rows = result
    ? ([
        ["solar", t.convSolar, t.convSolarWhy],
        ["lichun", t.convLichun, t.convLichunWhy],
        ["lunarNewYear", t.convLunar, t.convLunarWhy],
      ] as const).map(([key, label, why]) => ({
        key, label, why, ...result.byConvention[key],
      }))
    : [];

  const neighbours = parsed
    ? Array.from({ length: 5 }, (_, i) => sexagenaryOf(parsed.getUTCFullYear() - 2 + i))
    : [];

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900">{t.title}</h2>
      <p className="mt-2 leading-7 text-slate-600">{t.subtitle}</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.birth}
        </label>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {([[y, setY, t.year, 1900, 2100], [m, setM, t.month, 1, 12], [d, setD, t.day, 1, 31]] as const).map(
            ([val, set, label, min, max]) => (
              <div key={label}>
                <span className="text-xs text-slate-500">{label}</span>
                <input
                  type="number" inputMode="numeric" min={min} max={max}
                  value={val} onChange={(e) => set(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 tabular-nums"
                />
              </div>
            ),
          )}
        </div>
      </div>

      {!result && <p className="mt-4 text-sm text-rose-600">{t.invalid}</p>}

      {result && (
        <>
          <div
            className={`mt-6 rounded-2xl p-5 ${
              result.agree ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            <h3 className="font-bold text-slate-900">
              {result.agree ? t.agreeTitle : t.splitTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {result.agree
                ? t.agreeNote(fmt(result.lunarNewYear))
                : t.splitNote(fmt(result.lichun), fmt(result.lunarNewYear))}
            </p>
            {result.agree && (
              <p className="mt-4 text-3xl font-black text-slate-900">
                {sexagenaryLabel(locale, result.byConvention.solar.year)} · {names[result.byConvention.solar.animalIndex]}
              </p>
            )}
          </div>

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">{t.colConv}</th>
                <th className="py-2 text-right">{t.colYear}</th>
                <th className="py-2 text-right">{t.colSexagenary}</th>
                <th className="py-2 text-right">{t.colAnimal}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-slate-100 align-top">
                  <td className="py-3">
                    <span className="font-semibold text-slate-900">{r.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{r.why}</span>
                  </td>
                  <td className="py-3 text-right tabular-nums">{r.year}</td>
                  <td className="py-3 text-right font-semibold tabular-nums">{sexagenaryLabel(locale, r.year)}</td>
                  <td className="py-3 text-right font-semibold">{names[r.animalIndex]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8">
            <h3 className="font-bold text-slate-900">{t.whyTitle}</h3>
            <p className="mt-2 leading-7 text-slate-700">{t.whyBody}</p>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-slate-900">{t.tableTitle}</h3>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
              {neighbours.map((n) => (
                <li key={n.year} className="rounded-lg bg-slate-50 px-3 py-2 text-center">
                  <span className="block tabular-nums text-slate-500">{n.year}</span>
                  <span className="block font-semibold text-slate-900">{sexagenaryLabel(locale, n.year)}</span>
                  <span className="block text-slate-600">{names[n.animalIndex]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500">{t.tableNote}</p>
          </div>
        </>
      )}
    </section>
  );
}
