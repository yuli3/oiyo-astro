import { useState } from "react";
import type { Locale } from "../../../i18n";
import { REPUBLICAN_DAYS } from "../../../data/republican-days";
import { DECADE_DAYS, ISLAMIC_MONTHS, REPUBLICAN_MONTHS, allCalendars, daysBetween, hebrewMonthName, jdn, parseYmd, roman, type AllCalendars, type Ymd } from "../../../lib/birthday-calendars";
import { CopyLink, Panel, Sources, numberFormat, pick, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "birthday-calendars" as const;

const C = {
  go: { ko: "옛 달력 7개로 바꾸기", en: "Convert to 7 old calendars", ja: "7つの暦に変換", zh: "换算成7种历法", fr: "Convertir en 7 calendriers", es: "Convertir a 7 calendarios" },
  heroKicker: { ko: "프랑스 혁명력으로 내 생일은", en: "In the French Republican calendar, your birthday is", ja: "フランス革命暦であなたの誕生日は", zh: "按法国共和历，你的生日是", fr: "Dans le calendrier républicain, votre anniversaire est", es: "En el calendario republicano francés, tu cumpleaños es" },
  dayOf: { ko: "{name}의 날", en: "the day of the {name}", ja: "「{name}」の日", zh: "“{name}”之日", fr: "le jour « {name} »", es: "el día «{name}»" },
  kindPlant: { ko: "혁명력은 성인 이름 대신 365일마다 농작물·꽃·나무 이름을 붙였어요.", en: "The Republic replaced saints' days with crops, flowers and trees.", ja: "革命暦は聖人の名の代わりに、作物・花・木の名を日ごとに付けました。", zh: "共和历用农作物、花和树取代了圣人名。", fr: "La République a remplacé les saints par des plantes, des fleurs et des arbres.", es: "La República cambió los santos por cultivos, flores y árboles." },
  kindAnimal: { ko: "5로 끝나는 날(5·15·25일)은 동물 이름이에요.", en: "Days ending in 5 are named after animals.", ja: "5で終わる日（5・15・25日）は動物の名です。", zh: "以5结尾的日子（5、15、25日）以动物命名。", fr: "Les jours en 5 portent un nom d'animal.", es: "Los días acabados en 5 llevan nombre de animal." },
  kindTool: { ko: "10으로 끝나는 날(10·20·30일)은 농기구 이름이에요.", en: "Days ending in 0 are named after farm tools.", ja: "0で終わる日（10・20・30日）は農具の名です。", zh: "以0结尾的日子（10、20、30日）以农具命名。", fr: "Les jours en 0 portent un nom d'outil.", es: "Los días acabados en 0 llevan nombre de herramienta." },
  kindMineral: { ko: "겨울인 니보즈 달은 식물 대신 광물 이름을 붙였어요.", en: "Nivôse, the snow month, names minerals instead of plants.", ja: "冬のニヴォーズ月は植物の代わりに鉱物の名です。", zh: "冬季的雪月以矿物代替植物命名。", fr: "Nivôse, mois de la neige, nomme des minéraux.", es: "Nivoso, el mes de la nieve, nombra minerales." },
  kindFete: { ko: "한 해 끝 5~6일은 달에 속하지 않는 축제일(상퀼로티드)이에요.", en: "The last 5 or 6 days of the year belong to no month: they are festivals (sansculottides).", ja: "年末の5～6日はどの月にも属さない祝祭日（サンキュロティド）です。", zh: "年末5至6天不属于任何月份，是节庆日（无套裤汉日）。", fr: "Les 5 ou 6 derniers jours, hors des mois, sont les sansculottides.", es: "Los 5 o 6 últimos días, fuera de los meses, son los sansculótidos." },
  decade: { ko: "열흘 주의 {n}번째 날, {name}", en: "Day {n} of the ten-day week: {name}", ja: "10日週の{n}日目、{name}", zh: "十日周的第{n}天：{name}", fr: "{name}, {n}e jour de la décade", es: "{name}, día {n} de la década" },
  ganzhiT: { ko: "60갑자", en: "Sexagenary cycle", ja: "干支", zh: "干支纪年", fr: "Cycle sexagésimal", es: "Ciclo sexagenario" },
  ganzhiBody: { ko: "{year}년({animal}띠, 입춘 기준) {day}일에 태어났어요.", en: "Born in a {year} year ({animal}, from the start of spring) on a {day} day.", ja: "{year}年（{animal}年、立春基準）の{day}の日に生まれました。", zh: "生于{year}年（属{animal}，以立春为界）的{day}日。", fr: "Né une année {year} ({animal}, depuis le début du printemps), un jour {day}.", es: "Naciste en un año {year} ({animal}, desde el inicio de la primavera), un día {day}." },
  ganzhiSplit: { ko: "설날 기준으로는 {lunar}년이라 띠가 달라져요. 입춘과 설 사이에 태어난 사람만 생기는 일이에요.", en: "By lunar new year it is still {lunar}, so your animal differs: it only happens between the start of spring and lunar new year.", ja: "旧正月基準では{lunar}年で、干支が変わります。立春と旧正月の間の生まれだけに起きます。", zh: "按春节算则是{lunar}年，生肖不同。只有生在立春与春节之间才会这样。", fr: "Au Nouvel An lunaire, c'est encore {lunar} : votre animal change.", es: "Según el Año Nuevo lunar aún es {lunar}: tu animal cambia." },
  mayaT: { ko: "마야 장주기력", en: "Maya Long Count", ja: "マヤ長期暦", zh: "玛雅长纪历", fr: "Compte long maya", es: "Cuenta larga maya" },
  mayaBody: { ko: "기원전 3114년 8월 11일 창조일부터 {days}일째. 2012년 12월 21일에 13.0.0.0.0으로 한 바퀴를 돌았어요.", en: "Day {days} since creation on 11 August 3114 BC. The count rolled over to 13.0.0.0.0 on 21 December 2012.", ja: "紀元前3114年8月11日の創造の日から{days}日目。2012年12月21日に13.0.0.0.0になりました。", zh: "自公元前3114年8月11日创世日起第{days}天。2012年12月21日走到13.0.0.0.0。", fr: "{days}e jour depuis la création, le 11 août 3114 av. J.-C. Le compte est passé à 13.0.0.0.0 le 21 décembre 2012.", es: "Día {days} desde la creación, el 11 de agosto de 3114 a. C. La cuenta llegó a 13.0.0.0.0 el 21 de diciembre de 2012." },
  julianT: { ko: "율리우스력", en: "Julian calendar", ja: "ユリウス暦", zh: "儒略历", fr: "Calendrier julien", es: "Calendario juliano" },
  julianBody: { ko: "지금 달력보다 {gap}일 늦어요. 러시아 정교회가 1월 7일에 성탄절을 지내는 이유예요. 천문학이 쓰는 율리우스일로는 {jdn}일이에요.", en: "{gap} days behind ours, which is why Russian Orthodox Christmas falls on 7 January. As an astronomer's Julian Day: {jdn}.", ja: "今の暦より{gap}日遅れています。ロシア正教のクリスマスが1月7日なのはこのため。天文学のユリウス日では{jdn}。", zh: "比现行历法晚{gap}天，所以俄罗斯东正教在1月7日过圣诞。天文学儒略日为{jdn}。", fr: "{gap} jours de retard : d'où le Noël orthodoxe russe le 7 janvier. En jour julien des astronomes : {jdn}.", es: "{gap} días de retraso: por eso la Navidad ortodoxa rusa cae el 7 de enero. En día juliano astronómico: {jdn}." },
  islamicT: { ko: "이슬람력 (히즈라력)", en: "Islamic (Hijri) calendar", ja: "イスラム暦（ヒジュラ暦）", zh: "伊斯兰历（希吉来历）", fr: "Calendrier hégirien", es: "Calendario islámico (hégira)" },
  islamicBody: { ko: "달만 따르는 달력이라 1년이 354일이에요. 그래서 이슬람력 생일은 해마다 11일쯤 앞당겨져요. 계산식(표 방식) 날짜라 실제 초승달 관측과 하루 이틀 다를 수 있어요.", en: "A purely lunar year of 354 days, so a Hijri birthday comes about 11 days earlier each year. This is the arithmetic (tabular) date; sighting the crescent can shift it by a day or two.", ja: "月だけに従う暦で1年は354日。ヒジュラ暦の誕生日は毎年11日ほど早まります。計算式（表）による日付で、実際の新月観測と1～2日ずれることがあります。", zh: "纯阴历一年354天，所以希吉来历生日每年提前约11天。此为算术（表格）日期，与实际观月可能差一两天。", fr: "Une année purement lunaire de 354 jours : l'anniversaire hégirien avance d'environ 11 jours par an. Date arithmétique ; l'observation du croissant peut la décaler d'un jour ou deux.", es: "Un año puramente lunar de 354 días: el cumpleaños hégira se adelanta unos 11 días al año. Fecha aritmética; la observación de la luna puede moverla uno o dos días." },
  hebrewT: { ko: "히브리력", en: "Hebrew calendar", ja: "ヘブライ暦", zh: "希伯来历", fr: "Calendrier hébraïque", es: "Calendario hebreo" },
  hebrewBody: { ko: "달과 해를 함께 맞추려고 19년에 7번 윤달(아다르 2월)을 넣어요. 하루는 해 질 녘에 시작하니, 저녁에 태어났다면 하루 뒤 날짜예요.", en: "It keeps moon and sun together by adding a leap month (Adar II) seven times every 19 years. Days begin at sunset, so an evening birth falls on the next date.", ja: "月と太陽を合わせるため、19年に7回の閏月（第2アダル）を入れます。1日は日没に始まるので、夕方生まれなら翌日の日付です。", zh: "为兼顾月亮与太阳，19年中加7次闰月（亚达月二）。一天从日落开始，傍晚出生则算下一天。", fr: "Il accorde lune et soleil en ajoutant un mois (Adar II) sept fois en 19 ans. Le jour commence au coucher du soleil : né le soir, c'est le lendemain.", es: "Ajusta luna y sol añadiendo un mes (Adar II) siete veces cada 19 años. El día empieza al ponerse el sol: si naciste de noche, es la fecha siguiente." },
  japanT: { ko: "일본 연호", en: "Japanese era", ja: "元号", zh: "日本年号", fr: "Ère japonaise", es: "Era japonesa" },
  japanBody: { ko: "일왕이 바뀔 때마다 연호가 바뀌고, 첫해는 '원년'이라고 불러요. 일본 관공서 서류에는 지금도 이 연도를 써요.", en: "The era changes with each emperor and its first year is called gannen. Japanese government forms still use it.", ja: "天皇が代わるごとに元号が変わり、最初の年は「元年」。役所の書類では今もこの年を書きます。", zh: "每换一位天皇就换年号，第一年称“元年”。日本政府文件至今使用。", fr: "L'ère change avec chaque empereur ; sa première année se dit gannen. Les formulaires officiels l'emploient encore.", es: "La era cambia con cada emperador; su primer año se llama gannen. Los formularios oficiales aún la usan." },
  livedT: { ko: "오늘까지 산 날", en: "Days lived so far", ja: "今日まで生きた日数", zh: "至今活了多少天", fr: "Jours vécus", es: "Días vividos" },
  lived: { ko: "{n}일째 살고 있어요. 다음 기념일은 {next}일째 되는 {date}이에요.", en: "You are on day {n}. Your next round number is day {next}, on {date}.", ja: "今日で{n}日目。次の節目は{next}日目の{date}です。", zh: "今天是第{n}天。下一个整数纪念日是第{next}天，在{date}。", fr: "Vous en êtes au jour {n}. Prochain cap : le jour {next}, le {date}.", es: "Vas por el día {n}. Próximo hito: el día {next}, el {date}." },
  aboutT: { ko: "왜 달력이 이렇게 많을까요", en: "Why so many calendars?", ja: "なぜ暦はこんなに多いのか", zh: "为什么有这么多历法", fr: "Pourquoi tant de calendriers ?", es: "¿Por qué tantos calendarios?" },
  about: { ko: "달력은 해, 달, 왕, 혁명, 신의 창조 가운데 무엇을 기준으로 삼느냐에 따라 달라져요. 프랑스 혁명정부는 1793년 성인과 왕의 흔적을 지우려고 열흘 주, 30일짜리 달, 식물과 농기구 이름의 날을 만들었고, 나폴레옹이 1805년 말에 폐지했어요. 여기 혁명력 날짜는 롬(Romme)의 윤년 규칙으로 계산해서, 춘분으로 해를 나누는 방식과 하루 다를 수 있어요.", en: "Calendars differ by what they count from: the sun, the moon, a king, a revolution, or creation. In 1793 the French Republic, erasing saints and kings, made ten-day weeks, 30-day months and days named for plants and tools; Napoleon abolished it at the end of 1805. Republican dates here use Romme's leap-year rule and may differ by a day from the equinox rule.", ja: "暦は太陽・月・王・革命・天地創造のどれを基準にするかで変わります。フランス革命政府は1793年、聖人と王の跡を消すため10日週・30日の月・植物と農具の名の日を作り、ナポレオンが1805年末に廃止しました。ここの革命暦はロンムの閏年規則で計算しており、秋分基準と1日ずれることがあります。", zh: "历法因起算依据不同而不同：太阳、月亮、君王、革命或创世。1793年法兰西共和国为抹去圣人和国王的痕迹，创造了十日周、30天的月份和以植物、农具命名的日子；拿破仑在1805年底废止。这里的共和历按罗姆闰年规则计算，与秋分规则可能差一天。", fr: "Un calendrier dépend de ce qu'il compte : le soleil, la lune, un roi, une révolution ou la création. En 1793, pour effacer saints et rois, la République crée la décade, des mois de 30 jours et des jours nommés d'après les plantes et les outils ; Napoléon l'abolit fin 1805. Les dates suivent ici la règle de Romme et peuvent différer d'un jour de la règle de l'équinoxe.", es: "Un calendario depende de lo que cuenta: el sol, la luna, un rey, una revolución o la creación. En 1793, para borrar santos y reyes, la República creó la década, meses de 30 días y días con nombres de plantas y herramientas; Napoleón lo abolió a finales de 1805. Las fechas siguen la regla de Romme y pueden diferir un día de la del equinoccio." },
  cardKicker: { ko: "내 생일, 옛 달력 7개로", en: "My birthday in 7 calendars", ja: "誕生日を7つの暦で", zh: "我的生日，7种历法", fr: "Mon anniversaire en 7 calendriers", es: "Mi cumpleaños en 7 calendarios" },
  badge: { ko: "프랑스 혁명력", en: "French Republican calendar", ja: "フランス革命暦", zh: "法国共和历", fr: "Calendrier républicain", es: "Calendario republicano" },
  src1: { ko: "위키백과: 프랑스 혁명력", en: "Wikipedia: French Republican calendar", ja: "Wikipedia：フランス革命暦", zh: "维基百科：法国共和历", fr: "Wikipédia : Calendrier républicain", es: "Wikipedia: Calendario republicano francés" },
  src2: { ko: "포밀랩 달력 변환기", en: "Fourmilab calendar converter", ja: "Fourmilab暦変換", zh: "Fourmilab历法换算", fr: "Convertisseur Fourmilab", es: "Conversor Fourmilab" },
  src3: { ko: "위키백과: 마야 장주기력", en: "Wikipedia: Long Count calendar", ja: "Wikipedia：長期暦", zh: "维基百科：长纪历", fr: "Wikipédia : Compte long", es: "Wikipedia: Cuenta larga" },
  src4: { ko: "위키백과: 히브리력", en: "Wikipedia: Hebrew calendar", ja: "Wikipedia：ヘブライ暦", zh: "维基百科：希伯来历", fr: "Wikipédia : Calendrier hébraïque", es: "Wikipedia: Calendario hebreo" },
  src5: { ko: "위키백과: 이슬람력(표 방식)", en: "Wikipedia: Tabular Islamic calendar", ja: "Wikipedia：表式イスラム暦", zh: "维基百科：表格伊斯兰历", fr: "Wikipédia : Calendrier hégirien tabulaire", es: "Wikipedia: Calendario islámico tabular" },
} satisfies Record<string, Six>;

const ANIMALS: Six[] = [
  { ko: "쥐", en: "Rat", ja: "子（ねずみ）", zh: "鼠", fr: "Rat", es: "Rata" },
  { ko: "소", en: "Ox", ja: "丑（うし）", zh: "牛", fr: "Buffle", es: "Buey" },
  { ko: "호랑이", en: "Tiger", ja: "寅（とら）", zh: "虎", fr: "Tigre", es: "Tigre" },
  { ko: "토끼", en: "Rabbit", ja: "卯（うさぎ）", zh: "兔", fr: "Lapin", es: "Conejo" },
  { ko: "용", en: "Dragon", ja: "辰（たつ）", zh: "龙", fr: "Dragon", es: "Dragón" },
  { ko: "뱀", en: "Snake", ja: "巳（へび）", zh: "蛇", fr: "Serpent", es: "Serpiente" },
  { ko: "말", en: "Horse", ja: "午（うま）", zh: "马", fr: "Cheval", es: "Caballo" },
  { ko: "양", en: "Goat", ja: "未（ひつじ）", zh: "羊", fr: "Chèvre", es: "Cabra" },
  { ko: "원숭이", en: "Monkey", ja: "申（さる）", zh: "猴", fr: "Singe", es: "Mono" },
  { ko: "닭", en: "Rooster", ja: "酉（とり）", zh: "鸡", fr: "Coq", es: "Gallo" },
  { ko: "개", en: "Dog", ja: "戌（いぬ）", zh: "狗", fr: "Chien", es: "Perro" },
  { ko: "돼지", en: "Pig", ja: "亥（いのしし）", zh: "猪", fr: "Cochon", es: "Cerdo" },
];

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

/** Day name in the reader's language: French for fr, Korean gloss for ko, English gloss otherwise. */
export function dayName(m: number, d: number, l: L): string {
  const fr = REPUBLICAN_DAYS.fr[m - 1]![d - 1]!;
  if (l === "fr") return fr;
  const gloss = (l === "ko" ? REPUBLICAN_DAYS.ko : REPUBLICAN_DAYS.en)[m - 1]![d - 1]!;
  return `${gloss} (${fr})`;
}

function kindNote(m: number, d: number) {
  if (m === 13) return C.kindFete;
  if (d % 10 === 0) return C.kindTool;
  if (d % 5 === 0) return C.kindAnimal;
  if (m === 4) return C.kindMineral;
  return C.kindPlant;
}

function republicanText(r: NonNullable<AllCalendars["republican"]>, l: L): string {
  const y = roman(r.y);
  if (r.m === 13) return l === "fr" ? `${r.d}e jour complémentaire de l'an ${y}` : `An ${y}, Sansculottides ${r.d}`;
  return l === "fr" ? `${r.d} ${REPUBLICAN_MONTHS[r.m - 1]} an ${y}` : `${r.d} ${REPUBLICAN_MONTHS[r.m - 1]}, an ${y}`;
}

const pad = (n: number) => String(n).padStart(2, "0");
const ymdText = (g: Ymd) => `${g.y}-${pad(g.m)}-${pad(g.d)}`;
function fromJdnGregorian(j: number): Ymd {
  const t = new Date(Date.UTC(2000, 0, 1) + (j - 2451545) * 86400000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export default function BirthdayCalendars({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [birth, setBirth] = useState<Ymd | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  function go(value: string) {
    const g = parseYmd(value);
    if (!g) return;
    funnel("birthday");
    warp.start(() => {
      setBirth(g);
      setRound((r) => r + 1);
      stampEpisode(EP);
    });
  }

  const all = birth ? allCalendars(birth) : null;
  const r = all?.republican ?? null;
  const today = new Date();
  const todayYmd: Ymd = { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
  const lived = birth ? daysBetween(birth, todayYmd) + 1 : 0;
  const step = lived < 10000 ? 1000 : 5000;
  const next = (Math.floor(lived / step) + 1) * step;
  const nextDate = birth && all ? ymdText(fromJdnGregorian(all.jdn + next - 1)) : "";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1793} l={l} onDone={warp.finish} />}
      <BirthdayPicker l={l} cta={pick(C.go, l)} onSubmit={go} />

      {birth && all && r && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-2 text-base font-bold text-foreground" lang="fr">{republicanText(r, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{fill(pick(C.dayOf, l), { name: dayName(r.m, r.d, l) })}</p>
            {r.m !== 13 && <p className="mt-2 text-sm text-muted-foreground">{fill(pick(C.decade, l), { n: ((r.d - 1) % 10) + 1, name: DECADE_DAYS[(r.d - 1) % 10]! })}</p>}
            <p className="mt-4 text-base leading-relaxed text-foreground">{pick(kindNote(r.m, r.d), l)}</p>
          </section>

          <Panel label={pick(C.ganzhiT, l)}>
            <p className="text-2xl font-black text-foreground">{all.ganzhi.year.lichun.hanja}年 {all.ganzhi.day.hanja}日</p>
            <p className="leading-relaxed">{fill(pick(C.ganzhiBody, l), { year: all.ganzhi.year.lichun.hanja, animal: pick(ANIMALS[all.ganzhi.year.lichun.animal]!, l), day: all.ganzhi.day.hanja })}</p>
            {!all.ganzhi.year.agree && <p className="text-xs leading-relaxed text-muted-foreground">{fill(pick(C.ganzhiSplit, l), { lunar: all.ganzhi.year.lunar.hanja })}</p>}
          </Panel>

          <Panel label={pick(C.mayaT, l)}>
            <p className="text-2xl font-black text-foreground">{all.maya.longCount}</p>
            <p className="font-bold">{all.maya.tzolkin.n} {all.maya.tzolkin.name} · {all.maya.haab.d} {all.maya.haab.month}</p>
            <p className="leading-relaxed">{fill(pick(C.mayaBody, l), { days: fmt.format(all.maya.days) })}</p>
          </Panel>

          <Panel label={pick(C.julianT, l)}>
            <p className="text-2xl font-black text-foreground">{ymdText(all.julian)}</p>
            <p className="leading-relaxed">{fill(pick(C.julianBody, l), { gap: all.jdn - jdn(all.julian), jdn: fmt.format(all.jdn) })}</p>
          </Panel>

          <Panel label={pick(C.islamicT, l)}>
            <p className="text-2xl font-black text-foreground">{all.islamic.d} {ISLAMIC_MONTHS[all.islamic.m - 1]} {all.islamic.y} AH</p>
            <p className="leading-relaxed">{pick(C.islamicBody, l)}</p>
          </Panel>

          <Panel label={pick(C.hebrewT, l)}>
            <p className="text-2xl font-black text-foreground">{all.hebrew.d} {hebrewMonthName(all.hebrew.y, all.hebrew.m)} {all.hebrew.y}</p>
            <p className="leading-relaxed">{pick(C.hebrewBody, l)}</p>
          </Panel>

          {all.japan && (
            <Panel label={pick(C.japanT, l)}>
              <p className="text-2xl font-black text-foreground" lang="ja">{all.japan.text}</p>
              <p className="leading-relaxed">{pick(C.japanBody, l)}</p>
            </Panel>
          )}

          {lived > 0 && (
            <Panel label={pick(C.livedT, l)}>
              <p className="leading-relaxed">{fill(pick(C.lived, l), { n: fmt.format(lived), next: fmt.format(next), date: nextDate })}</p>
            </Panel>
          )}

          <Panel label={pick(C.aboutT, l)}>
            <p className="text-sm leading-relaxed">{pick(C.about, l)}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: l === "fr" ? "https://fr.wikipedia.org/wiki/Calendrier_r%C3%A9publicain" : "https://en.wikipedia.org/wiki/French_Republican_calendar" },
              { label: pick(C.src2, l), url: "https://www.fourmilab.ch/documents/calendar/" },
              { label: pick(C.src3, l), url: "https://en.wikipedia.org/wiki/Mesoamerican_Long_Count_calendar" },
              { label: pick(C.src4, l), url: "https://en.wikipedia.org/wiki/Hebrew_calendar" },
              { label: pick(C.src5, l), url: "https://en.wikipedia.org/wiki/Tabular_Islamic_calendar" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-birthday-calendars-${ymdText(birth)}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: fill(pick(C.dayOf, l), { name: (l === "ko" ? REPUBLICAN_DAYS.ko : l === "fr" ? REPUBLICAN_DAYS.fr : REPUBLICAN_DAYS.en)[r.m - 1]![r.d - 1]! }),
              subtitle: republicanText(r, l),
              badge: pick(C.badge, l),
              lines: [
                `${all.ganzhi.year.lichun.hanja}年 ${all.ganzhi.day.hanja}日`,
                `Maya ${all.maya.longCount}`,
                `${all.islamic.d} ${ISLAMIC_MONTHS[all.islamic.m - 1]} ${all.islamic.y} · ${all.hebrew.d} ${hebrewMonthName(all.hebrew.y, all.hebrew.m)} ${all.hebrew.y}`,
                ...(all.japan ? [all.japan.text] : []),
              ],
              footer: `oiyo.net · ${ymdText(birth)}`,
              accent: "#1f3a6b",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
