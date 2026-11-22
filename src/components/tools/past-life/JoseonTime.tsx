import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { ANIMALS, BRANCHES, HANJA, KAK_NAMES, formatPick, hhmm, joseonTime, parsePick, solarToKst, type JoseonTime as JT, type Pick } from "../../../lib/joseon-time";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "joseon-time" as const;

const C = {
  now: { ko: "지금 시각", en: "Right now", ja: "今の時刻", zh: "现在", fr: "Maintenant", es: "Ahora" },
  pickMode: { ko: "시각 고르기", en: "Pick a time", ja: "時刻を選ぶ", zh: "选择时间", fr: "Choisir une heure", es: "Elegir hora" },
  go: { ko: "조선 시각으로 바꾸기", en: "Convert to Joseon time", ja: "朝鮮の時刻に変換", zh: "换算成朝鲜时刻", fr: "Convertir en heure de Joseon", es: "Convertir a la hora de Joseon" },
  timeLabel: { ko: "시각 (한국 표준시)", en: "Time (Korea Standard Time)", ja: "時刻（韓国標準時）", zh: "时间（韩国标准时间）", fr: "Heure (heure de Corée)", es: "Hora (hora de Corea)" },
  dateLabel: { ko: "날짜 (해 뜨고 지는 시각에 쓰여요)", en: "Date (sets sunrise and sunset)", ja: "日付（日の出・日の入りに使います）", zh: "日期（用于日出日落）", fr: "Date (pour le lever et le coucher du soleil)", es: "Fecha (para el amanecer y el ocaso)" },
  kicker: { ko: "한양 앙부일구가 가리키는 지금", en: "What the Hanyang sundial would show", ja: "漢陽の仰釜日晷が指す今", zh: "汉阳仰釜日晷所指的此刻", fr: "Ce qu'indiquerait le cadran solaire de Hanyang", es: "Lo que marcaría el reloj de sol de Hanyang" },
  solarNote: { ko: "표준시 {kst} = 한양 태양시 {solar}. 표준시는 동경 135°에 맞춰져 있어 서울의 해보다 30분쯤 앞서요.", en: "{kst} standard time is {solar} Hanyang solar time. Korean standard time follows 135°E, so it runs about 30 minutes ahead of Seoul's sun.", ja: "標準時{kst}は漢陽の太陽時で{solar}。標準時は東経135°基準なので、ソウルの太陽より約30分早く進んでいます。", zh: "标准时间{kst}相当于汉阳太阳时{solar}。韩国标准时以东经135°为准，比首尔的太阳早约30分钟。", fr: "{kst} (heure légale) correspond à {solar} en temps solaire de Hanyang : l'heure légale suit le 135°E, soit environ 30 min d'avance sur le soleil de Séoul.", es: "Las {kst} (hora oficial) son las {solar} en hora solar de Hanyang: la hora oficial sigue el meridiano 135°E y va unos 30 minutos por delante del sol de Seúl." },
  jagyeokTitle: { ko: "자격루라면", en: "If you were by the water clock", ja: "自撃漏なら", zh: "如果在自击漏旁", fr: "Près de l'horloge à eau", es: "Junto al reloj de agua" },
  struck: { ko: "{ago}분 전 {inst} 소리가 났어요 — {label}", en: "{ago} min ago it sounded the {inst}: {label}", ja: "{ago}分前に{inst}が鳴りました — {label}", zh: "{ago}分钟前响过{inst}——{label}", fr: "Il y a {ago} min, le {inst} a sonné : {label}", es: "Hace {ago} min sonó el {inst}: {label}" },
  jagyeokNote: { ko: "1434년(세종 16) 경복궁 보루각의 자격루는 나무 인형이 시(時)에는 종, 밤의 경(更)에는 북, 점(點)에는 징을 쳤어요.", en: "In 1434 the self-striking water clock at Gyeongbokgung had wooden figures strike a bell for each hour, a drum for each night watch and a gong for each point.", ja: "1434年（世宗16年）景福宮報漏閣の自撃漏は、木の人形が時には鐘、夜の更には太鼓、点には鉦を打ちました。", zh: "1434年（世宗十六年）景福宫报漏阁的自击漏，由木偶在时辰敲钟、夜间更次击鼓、点次敲钲。", fr: "En 1434, l'horloge à eau automatique du palais Gyeongbok faisait frapper par des figurines une cloche à chaque heure, un tambour à chaque veille et un gong à chaque point.", es: "En 1434, el reloj de agua automático del palacio Gyeongbok tenía figuras que tocaban una campana cada hora, un tambor cada vigilia y un gong cada punto." },
  nightNow: { ko: "지금은 밤 {g}경 {j}점이에요.", en: "It is now watch {g}, point {j} of the night.", ja: "今は夜の{g}更{j}点です。", zh: "现在是夜里{g}更{j}点。", fr: "C'est la {g}e veille, {j}e point de la nuit.", es: "Es la vigilia {g}, punto {j} de la noche." },
  dayNow: { ko: "지금은 낮이라 경점이 없어요. 밤은 해 진 뒤 2.5각부터 해 뜨기 2.5각 전까지를 5경 25점으로 나눴어요.", en: "It is daytime, so there are no watches. The night, from 2.5 kak after sunset to 2.5 kak before sunrise, was split into 5 watches of 5 points.", ja: "今は昼なので更点はありません。夜は日没2.5刻後から日の出2.5刻前までを5更25点に分けました。", zh: "现在是白天，没有更点。夜晚从日落后2.5刻到日出前2.5刻，分为五更二十五点。", fr: "Il fait jour : pas de veilles. La nuit, de 2,5 kak après le coucher à 2,5 kak avant le lever, comptait 5 veilles de 5 points.", es: "Es de día: no hay vigilias. La noche, de 2,5 kak tras el ocaso a 2,5 kak antes del alba, tenía 5 vigilias de 5 puntos." },
  duskNow: { ko: "해는 졌지만 아직 밤의 경점이 시작되기 전(또는 끝난 뒤)의 어스름이에요.", en: "The sun is down, but the night watches have not begun (or have already ended): twilight.", ja: "日は沈みましたが、夜の更点の前（または後）の薄明です。", zh: "太阳已落，但还在更点开始之前（或结束之后）的暮色里。", fr: "Le soleil est couché, mais les veilles n'ont pas commencé (ou sont finies) : c'est le crépuscule.", es: "El sol se ha puesto, pero las vigilias aún no empiezan (o ya terminaron): es el crepúsculo." },
  bell: { ko: "종", en: "bell", ja: "鐘", zh: "钟", fr: "cloche", es: "campana" },
  drum: { ko: "북", en: "drum", ja: "太鼓", zh: "鼓", fr: "tambour", es: "tambor" },
  gong: { ko: "징", en: "gong", ja: "鉦", zh: "钲", fr: "gong", es: "gong" },
  curfewTitle: { ko: "인정과 파루", en: "Injeong and Paru: the curfew bells", ja: "人定と罷漏", zh: "人定与罢漏", fr: "Injeong et Paru, les cloches du couvre-feu", es: "Injeong y Paru, las campanas del toque de queda" },
  curfewLine: { ko: "이날 인정(종 28번, 도성 문 닫힘)은 {in}쯤, 파루(33번, 문 열림)는 {pa}쯤이에요(표준시).", en: "That day Injeong (28 strokes, gates shut) falls about {in} and Paru (33 strokes, gates open) about {pa} (standard time).", ja: "この日の人定（28打、城門閉鎖）は約{in}、罷漏（33打、開門）は約{pa}（標準時）。", zh: "这一天的人定（敲28下，关城门）约在{in}，罢漏（33下，开城门）约在{pa}（标准时间）。", fr: "Ce jour-là, Injeong (28 coups, portes fermées) tombe vers {in} et Paru (33 coups, portes ouvertes) vers {pa} (heure légale).", es: "Ese día, Injeong (28 toques, puertas cerradas) cae hacia las {in} y Paru (33 toques, puertas abiertas) hacia las {pa} (hora oficial)." },
  curfewOn: { ko: "🚫 지금은 통행금지 시간이에요. 도성 안을 돌아다니면 순라군에게 붙잡혀요.", en: "🚫 Curfew is on. Walk the city now and the night patrol would stop you.", ja: "🚫 今は通行禁止の時間。都城を歩けば巡邏に捕まります。", zh: "🚫 现在是宵禁时间，在城里走动会被巡逻兵拦下。", fr: "🚫 Couvre-feu : la patrouille de nuit vous arrêterait.", es: "🚫 Toque de queda: la ronda nocturna te detendría." },
  curfewOff: { ko: "✅ 지금은 도성 문이 열려 있는 시간이에요.", en: "✅ The city gates are open now.", ja: "✅ 今は城門が開いている時間です。", zh: "✅ 现在城门开着。", fr: "✅ Les portes de la ville sont ouvertes.", es: "✅ Las puertas de la ciudad están abiertas." },
  curfewNote: { ko: "인정은 1경 3점, 파루는 5경 3점에 쳤어요. 흔히 '밤 10시쯤·새벽 4시쯤'이라고 소개되지만, 이 규칙으로 계산하면 계절에 따라 달라지고 인정은 그보다 이른 때가 많아요. 왜 차이가 나는지는 아직 확인하지 못했어요.", en: "Injeong rang at watch 1, point 3, and Paru at watch 5, point 3. They are often described as 'about 10 p.m.' and 'about 4 a.m.'; computed from the rule they shift with the seasons, and Injeong usually comes earlier. We have not yet confirmed why the two differ.", ja: "人定は1更3点、罷漏は5更3点に打ちました。よく「夜10時頃・明け方4時頃」と紹介されますが、規則で計算すると季節で変わり、人定はそれより早いことが多いです。差の理由は未確認です。", zh: "人定在一更三点，罢漏在五更三点。常说是“晚上十点左右、凌晨四点左右”，但按规则计算会随季节变化，人定通常更早。差异原因尚未查明。", fr: "Injeong sonnait à la 1re veille, 3e point, et Paru à la 5e veille, 3e point. On dit souvent « vers 22 h » et « vers 4 h » ; calculées selon la règle, elles varient avec les saisons et Injeong tombe souvent plus tôt. La raison de l'écart n'est pas encore vérifiée.", es: "Injeong sonaba en la vigilia 1, punto 3, y Paru en la vigilia 5, punto 3. Se suele decir «hacia las 22 h» y «hacia las 4 h»; calculadas por la regla, cambian con las estaciones e Injeong suele ser antes. Aún no hemos confirmado el motivo de la diferencia." },
  kakTitle: { ko: "100각과 96각", en: "100 kak or 96 kak", ja: "100刻と96刻", zh: "百刻与九十六刻", fr: "100 kak ou 96 kak", es: "100 kak o 96 kak" },
  kakLine: { ko: "1654년 시헌력부터는 한 시가 8각(1각 15분)이라 지금은 '{si96}'이에요. 세종 때는 하루 100각(1각 14.4분)이라 한 시가 8⅓각이었고, 이 시에 들어선 지 {k}각째예요.", en: "From the Shixian calendar (1654) a double hour had 8 kak of 15 minutes, so now is '{si96}'. Under Sejong a day had 100 kak of 14.4 minutes, 8⅓ to a double hour, and we are in kak {k} of this one.", ja: "1654年の時憲暦からは1時が8刻（1刻15分）なので今は「{si96}」。世宗の頃は1日100刻（1刻14.4分）で1時は8⅓刻、この時に入って{k}刻目です。", zh: "1654年时宪历起一个时辰8刻（每刻15分钟），现在是“{si96}”。世宗时一天100刻（每刻14.4分钟），一个时辰8⅓刻，现在是这个时辰的第{k}刻。", fr: "Avec le calendrier Shixian (1654), une heure double comptait 8 kak de 15 min : il est « {si96} ». Sous Sejong, la journée avait 100 kak de 14,4 min, soit 8⅓ par heure double : nous sommes au kak {k}.", es: "Con el calendario Shixian (1654), una hora doble tenía 8 kak de 15 min: ahora es «{si96}». Con Sejong el día tenía 100 kak de 14,4 min, 8⅓ por hora doble: estamos en el kak {k}." },
  aboutTitle: { ko: "어떻게 계산하나요", en: "How it is worked out", ja: "計算方法", zh: "怎么算的", fr: "Méthode", es: "Cómo se calcula" },
  about: { ko: "한국 표준시를 서울의 경도와 균시차로 한양 태양시로 바꾼 뒤, 자시(23시)부터 2시간씩 12시로 나눴어요. 해 뜨고 지는 시각은 천문 근사식으로 계산해 몇 분쯤 차이가 날 수 있어요. 밤 경점은 세종 때 규칙(해 진 뒤 2.5각부터)을 썼고, 시헌력 후기 규칙(태양 고도 −18°)은 쓰지 않았어요.", en: "Korean standard time is converted to Hanyang apparent solar time using Seoul's longitude and the equation of time, then split into 12 double hours from the Rat hour (23:00). Sunrise and sunset come from an astronomical approximation and may be a few minutes off. Night watches use Sejong's rule (from 2.5 kak after sunset), not the later −18° twilight rule.", ja: "韓国標準時をソウルの経度と均時差で漢陽の太陽時に直し、子の刻（23時）から2時間ずつ12に分けました。日の出・日の入りは近似式なので数分ずれることがあります。夜の更点は世宗の頃の規則を使いました。", zh: "先用首尔经度和均时差把韩国标准时换成汉阳视太阳时，再从子时（23点）起每两小时分为十二时辰。日出日落用天文近似式计算，可能差几分钟。夜间更点用世宗时的规则。", fr: "L'heure légale coréenne est convertie en temps solaire vrai de Hanyang (longitude de Séoul et équation du temps), puis découpée en 12 heures doubles depuis l'heure du Rat (23 h). Lever et coucher du soleil sont approchés à quelques minutes près. Les veilles suivent la règle de Sejong.", es: "La hora oficial coreana se pasa a hora solar verdadera de Hanyang (longitud de Seúl y ecuación del tiempo) y se divide en 12 horas dobles desde la hora de la Rata (23 h). El amanecer y el ocaso son aproximados a unos minutos. Las vigilias siguen la regla de Sejong." },
  src1: { ko: "한국민족문화대백과 「십이시」", en: "Encyclopedia of Korean Culture: twelve hours", ja: "韓国民族文化大百科「十二時」", zh: "韩国民族文化大百科《十二时》", fr: "Encyclopédie de la culture coréenne : douze heures", es: "Enciclopedia de la cultura coreana: doce horas" },
  src2: { ko: "한국민족문화대백과 「96각」", en: "Encyclopedia of Korean Culture: 96 kak", ja: "韓国民族文化大百科「96刻」", zh: "韩国民族文化大百科《九十六刻》", fr: "Encyclopédie de la culture coréenne : 96 kak", es: "Enciclopedia de la cultura coreana: 96 kak" },
  src3: { ko: "실록위키 「인정」", en: "Sillok Wiki: Injeong", ja: "実録ウィキ「人定」", zh: "实录维基《人定》", fr: "Sillok Wiki : Injeong", es: "Sillok Wiki: Injeong" },
  src4: { ko: "한국민족문화대백과 「자격루」", en: "Encyclopedia of Korean Culture: Jagyeongnu", ja: "韓国民族文化大百科「自撃漏」", zh: "韩国民族文化大百科《自击漏》", fr: "Encyclopédie de la culture coréenne : Jagyeongnu", es: "Enciclopedia de la cultura coreana: Jagyeongnu" },
  src5: { ko: "한국천문연구원 천문학습관", en: "Korea Astronomy and Space Science Institute", ja: "韓国天文研究院", zh: "韩国天文研究院", fr: "Institut coréen d'astronomie", es: "Instituto Coreano de Astronomía" },
  cardKicker: { ko: "1434 · 지금 시각을 조선 시각으로", en: "1434 · Now, in Joseon time", ja: "1434・今を朝鮮の時刻で", zh: "1434·此刻的朝鲜时刻", fr: "1434 · Maintenant, à l'heure de Joseon", es: "1434 · Ahora, en hora de Joseon" },
  badge: { ko: "앙부일구", en: "Sundial", ja: "仰釜日晷", zh: "仰釜日晷", fr: "Cadran solaire", es: "Reloj de sol" },
} satisfies Record<string, Six>;

const ANIMAL_NAMES: Record<Exclude<L, "ko">, readonly string[]> = {
  en: ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"],
  ja: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
  zh: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
  fr: ["du Rat", "du Bœuf", "du Tigre", "du Lièvre", "du Dragon", "du Serpent", "du Cheval", "de la Chèvre", "du Singe", "du Coq", "du Chien", "du Cochon"],
  es: ["de la Rata", "del Buey", "del Tigre", "del Conejo", "del Dragón", "de la Serpiente", "del Caballo", "de la Cabra", "del Mono", "del Gallo", "del Perro", "del Cerdo"],
};
const KAK_NUM = ["1", "2", "3", "4"];

function siLocal(t: JT, l: L): string {
  const h = t.half === "초" ? 0 : 1;
  switch (l) {
    case "ko":
      return `${BRANCHES[t.si]}시 ${t.half}${KAK_NAMES[t.kak96]}각`;
    case "ja":
      return `${HANJA[t.si]}の刻 ${h ? "正" : "初"}${"初一二三"[t.kak96]}刻`;
    case "zh":
      return `${HANJA[t.si]}时${h ? "正" : "初"}${"初一二三"[t.kak96]}刻`;
    case "en":
      return `Hour of the ${ANIMAL_NAMES.en[t.si]} (${HANJA[t.si]}), ${h ? "second" : "first"} half, kak ${KAK_NUM[t.kak96]}`;
    case "fr":
      return `Heure ${ANIMAL_NAMES.fr[t.si]} (${HANJA[t.si]}), ${h ? "2de" : "1re"} moitié, kak ${KAK_NUM[t.kak96]}`;
    default:
      return `Hora ${ANIMAL_NAMES.es[t.si]} (${HANJA[t.si]}), ${h ? "2.ª" : "1.ª"} mitad, kak ${KAK_NUM[t.kak96]}`;
  }
}

function siShort(si: number, l: L): string {
  if (l === "ko") return `${BRANCHES[si]}시`;
  if (l === "ja") return `${HANJA[si]}の刻`;
  if (l === "zh") return `${HANJA[si]}时`;
  if (l === "en") return `Hour of the ${ANIMAL_NAMES.en[si]}`;
  return `${l === "fr" ? "Heure" : "Hora"} ${ANIMAL_NAMES[l][si]}`;
}

function strikeLabel(t: JT, l: L): string {
  if (t.last.kind === "bell" || !t.night) return siShort(t.si, l);
  if (l === "ko") return t.last.label;
  return fill(pick(C.nightNow, l), { g: t.night.gyeong, j: t.night.jeom }).replace(/[.。]$/, "");
}

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

function seoulNow(): Pick {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", month: "2-digit", day: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (k: string) => Number(parts.find((p) => p.type === k)?.value ?? 0);
  return { kst: g("hour") * 60 + g("minute"), month: g("month"), day: g("day") };
}

export default function JoseonTime({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [mode, setMode] = useState<"now" | "pick">("now");
  const [shown, setShown] = useState<Pick | null>(null);
  const [live, setLive] = useState(false);
  const [timeIn, setTimeIn] = useState("21:00");
  const [dateIn, setDateIn] = useState("");
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parsePick(window.location.search);
    if (shared) setShown(shared);
    const n = seoulNow();
    setDateIn(`2026-${String(n.month).padStart(2, "0")}-${String(n.day).padStart(2, "0")}`);
  }, []);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setShown(seoulNow()), 20000);
    return () => window.clearInterval(id);
  }, [live]);

  function go() {
    let next: Pick;
    if (mode === "now") next = seoulNow();
    else {
      const [hh, mm] = timeIn.split(":").map(Number);
      const [, mo, dd] = dateIn.split("-").map(Number);
      next = { kst: (hh ?? 0) * 60 + (mm ?? 0), month: mo || 1, day: dd || 1 };
    }
    funnel(mode);
    warp.start(() => {
      setShown(next);
      setLive(mode === "now");
      setRound((r) => r + 1);
      setShareQuery(formatPick(next));
      stampEpisode(EP);
    });
  }

  const t = shown ? joseonTime(shown.kst, shown.month, shown.day) : null;
  const k = (m: number) => hhmm(solarToKst(m, t?.eqTime ?? 0));
  const ago = t ? Math.round((((t.solar - t.last.at) % 1440) + 1440) % 1440) : 0;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1434} l={l} onDone={warp.finish} />}
      <div className="grid grid-cols-2 gap-2" role="tablist">
        {(["now", "pick"] as const).map((m) => (
          <Button key={m} role="tab" aria-selected={mode === m} variant={mode === m ? "default" : "outline"} onClick={() => setMode(m)}>
            {pick(m === "now" ? C.now : C.pickMode, l)}
          </Button>
        ))}
      </div>
      {mode === "pick" && (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4">
          <label className="space-y-1 text-sm font-bold text-foreground">
            <span className="block">{pick(C.timeLabel, l)}</span>
            <input type="time" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base" />
          </label>
          <label className="space-y-1 text-sm font-bold text-foreground">
            <span className="block">{pick(C.dateLabel, l)}</span>
            <input type="date" value={dateIn} onChange={(e) => setDateIn(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base" />
          </label>
        </div>
      )}
      <Button size="lg" className="w-full" onClick={go} disabled={mode === "pick" && (!timeIn || !dateIn)}>
        {pick(C.go, l)}
      </Button>

      {t && shown && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.kicker, l)}</p>
            <p className="mt-3 text-6xl" aria-hidden="true">{ANIMALS[t.si]}</p>
            <p className="mt-3 text-3xl font-black text-foreground">{siLocal(t, l)}</p>
            <p className="mt-3 text-xs text-muted-foreground">{fill(pick(C.solarNote, l), { kst: hhmm(shown.kst), solar: hhmm(t.solar) })}</p>
          </section>

          <Panel label={pick(C.jagyeokTitle, l)}>
            <p className="text-lg font-black leading-snug text-foreground">
              {fill(pick(C.struck, l), { ago, inst: pick(C[t.last.kind], l), label: strikeLabel(t, l) })}
            </p>
            <p className="text-sm">{t.night ? fill(pick(C.nightNow, l), { g: t.night.gyeong, j: t.night.jeom }) : pick(t.dusk ? C.duskNow : C.dayNow, l)}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.jagyeokNote, l)}</p>
          </Panel>

          <Panel label={pick(C.curfewTitle, l)}>
            <p className="text-base font-bold text-foreground">{pick(t.curfew ? C.curfewOn : C.curfewOff, l)}</p>
            <p className="text-sm">{fill(pick(C.curfewLine, l), { in: k(t.injeong), pa: k(t.paru) })}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.curfewNote, l)}</p>
          </Panel>

          <Panel label={pick(C.kakTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.kakLine, l), { si96: siLocal(t, l), k: t.kak100 + 1 })}</p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.about, l)}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://encykorea.aks.ac.kr/Article/E0080838" },
              { label: pick(C.src2, l), url: "https://encykorea.aks.ac.kr/Article/E0080839" },
              { label: pick(C.src3, l), url: "https://dh.aks.ac.kr/sillokwiki/index.php/%EC%9D%B8%EC%A0%95(%E4%BA%BA%E5%AE%9A)" },
              { label: pick(C.src4, l), url: "https://encykorea.aks.ac.kr/Article/E0047854" },
              { label: pick(C.src5, l), url: "https://astro.kasi.re.kr/learning/pageView/5385" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename="oiyo-joseon-time"
            spec={{
              kicker: pick(C.cardKicker, l),
              title: `${ANIMALS[t.si]} ${siLocal(t, l)}`,
              subtitle: fill(pick(C.solarNote, l), { kst: hhmm(shown.kst), solar: hhmm(t.solar) }).split(/[.。]/)[0]!,
              badge: pick(C.badge, l),
              lines: [
                t.night ? fill(pick(C.nightNow, l), { g: t.night.gyeong, j: t.night.jeom }) : pick(t.dusk ? C.duskNow : C.dayNow, l).split(/[.。]/)[0]!,
                pick(t.curfew ? C.curfewOn : C.curfewOff, l).split(/[.。]/)[0]!,
              ],
              footer: `oiyo.net · 1434 · ${k(t.injeong)} / ${k(t.paru)}`,
              accent: "#8a5a2b",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
