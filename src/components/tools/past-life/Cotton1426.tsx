import { useState } from "react";
import type { Locale } from "../../../i18n";
import { ANCHORS, convertMarket, convertOfficial, doeOfWon, DU_PER_PIL, KG_PER_DU, LITERS_PER_DU, nice, salaryDoePerMonth, SALARY_SEOK, UNITS, wonOfDoe, type Unit } from "../../../lib/cotton-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, toL, useFunnel, type Six } from "./shared";
import { SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "cotton-1426" as const;
const DEFAULT_RICE = 3000;

const UNIT: Record<Unit, Six> = {
  pil: { ko: "면포 필", en: "bolts of cotton", ja: "綿布（匹）", zh: "棉布（匹）", fr: "pièces de coton", es: "piezas de algodón" },
  du: { ko: "쌀 두(말)", en: "du of rice", ja: "米（斗）", zh: "米（斗）", fr: "du de riz", es: "du de arroz" },
  jang: { ko: "저화 장", en: "paper notes", ja: "楮貨（枚）", zh: "楮货（张）", fr: "billets de papier", es: "billetes de papel" },
  mun: { ko: "동전 문", en: "copper coins (mun)", ja: "銅銭（文）", zh: "铜钱（文）", fr: "sapèques (mun)", es: "monedas (mun)" },
};
const SHORT: Record<Unit, Six> = {
  pil: { ko: "필", en: "bolts", ja: "匹", zh: "匹", fr: "pièces", es: "piezas" },
  du: { ko: "두", en: "du", ja: "斗", zh: "斗", fr: "du", es: "du" },
  jang: { ko: "장", en: "notes", ja: "枚", zh: "张", fr: "billets", es: "billetes" },
  mun: { ko: "문", en: "mun", ja: "文", zh: "文", fr: "mun", es: "mun" },
};

const C = {
  salaryLabel: { ko: "내 한 달 월급 (원)", en: "My monthly pay (KRW)", ja: "私の月給（ウォン）", zh: "我的月薪（韩元）", fr: "Mon salaire mensuel (KRW)", es: "Mi sueldo mensual (KRW)" },
  riceLabel: { ko: "요즘 쌀 1kg 값 (원)", en: "Rice price today, per kg (KRW)", ja: "いまの米1kgの値段（ウォン）", zh: "现在大米每公斤价格（韩元）", fr: "Prix du riz aujourd'hui, au kg (KRW)", es: "Precio del arroz hoy, por kg (KRW)" },
  riceHint: { ko: "3,000원은 예시값이에요. 장 본 영수증 값으로 바꿔 보세요.", en: "3,000 is just an example; use your own receipt.", ja: "3,000ウォンは例です。実際の値段に変えてみてください。", zh: "3,000韩元只是示例，可改成你买的价格。", fr: "3 000 est un exemple ; mettez votre propre prix.", es: "3.000 es un ejemplo; usa tu propio precio." },
  go: { ko: "1426년 면포로 바꾸기", en: "Convert to 1426 cotton", ja: "1426年の綿布に換える", zh: "换成1426年的棉布", fr: "Convertir en coton de 1426", es: "Convertir a algodón de 1426" },
  examples: { ko: "예시", en: "Examples", ja: "例", zh: "示例", fr: "Exemples", es: "Ejemplos" },
  privacy: { ko: "월급은 이 기기에서만 계산하고 링크에도 넣지 않아요.", en: "Your pay stays on this device and never goes into the link.", ja: "月給はこの端末内だけで計算し、リンクにも入れません。", zh: "月薪只在本机计算，不会放进链接。", fr: "Votre salaire reste sur cet appareil et n'entre pas dans le lien.", es: "Tu sueldo se queda en este dispositivo y no va en el enlace." },
  empty: { ko: "월급을 숫자로 넣어 주세요.", en: "Enter your pay as a number.", ja: "月給を数字で入れてください。", zh: "请输入数字。", fr: "Saisissez un nombre.", es: "Escribe un número." },
  kicker: { ko: "1426년 한양이라면 내 월급은", en: "In 1426 Hanyang, my monthly pay is", ja: "1426年の漢陽なら私の月給は", zh: "如果在1426年的汉阳，我的月薪是", fr: "À Hanyang en 1426, mon salaire vaut", es: "En Hanyang en 1426, mi sueldo vale" },
  pilBig: { ko: "면포 {n}필", en: "{n} bolts of cotton", ja: "綿布{n}匹", zh: "棉布{n}匹", fr: "{n} pièces de coton", es: "{n} piezas de algodón" },
  riceLine: { ko: "쌀 {du}두(약 {kg}kg)", en: "{du} du of rice (about {kg} kg)", ja: "米{du}斗（約{kg}kg）", zh: "米{du}斗（约{kg}公斤）", fr: "{du} du de riz (env. {kg} kg)", es: "{du} du de arroz (unos {kg} kg)" },
  rankTop: { ko: "정1품 영의정 녹봉(곡물)의 {p}%", en: "{p}% of a first-rank minister's grain stipend", ja: "正一品の禄俸（穀物）の{p}%", zh: "正一品俸禄（谷物）的{p}%", fr: "{p} % du traitement en grain d'un ministre du 1er rang", es: "{p} % del estipendio en grano de un ministro de primer rango" },
  rankBottom: { ko: "종9품 말단 관원 녹봉(곡물)의 {x}배", en: "{x}× a ninth-rank clerk's grain stipend", ja: "従九品の禄俸（穀物）の{x}倍", zh: "从九品俸禄（谷物）的{x}倍", fr: "{x} fois le traitement en grain d'un agent du 9e rang", es: "{x} veces el estipendio en grano de un funcionario de noveno rango" },
  converterTitle: { ko: "1426 환전소", en: "1426 money changer", ja: "1426両替所", zh: "1426兑换处", fr: "Bureau de change 1426", es: "Casa de cambio 1426" },
  amount: { ko: "얼마", en: "Amount", ja: "数量", zh: "数量", fr: "Montant", es: "Cantidad" },
  official: { ko: "나라가 정한 값", en: "Official rate", ja: "公定", zh: "官定", fr: "Taux officiel", es: "Tasa oficial" },
  market: { ko: "시장에서 통하던 값", en: "Street rate", ja: "市中の相場", zh: "市面行情", fr: "Taux de la rue", es: "Tasa de la calle" },
  marketNote: { ko: "저화와 동전은 나라가 정한 값보다 훨씬 싸게 돌았어요. 1425년 4월엔 쌀 1되에 동전 3문, 1427년 1월엔 7~8문이었어요. 1426년은 그 사이로 보고 범위로 보여 드려요.", en: "Notes and coins traded far below the official rate: 3 mun per doe of rice in April 1425, 7–8 mun in January 1427. We show 1426 as that range.", ja: "楮貨と銅銭は公定よりずっと安く出回りました。1425年4月は米1升に銅銭3文、1427年1月は7〜8文。1426年はその間として幅で示します。", zh: "楮货和铜钱实际远低于官价：1425年4月米1升合3文，1427年1月合7～8文。1426年按两者之间给出范围。", fr: "Billets et pièces circulaient bien sous le taux officiel : 3 mun le doe de riz en avril 1425, 7–8 en janvier 1427. 1426 est montré comme cette fourchette.", es: "Billetes y monedas circulaban muy por debajo de lo oficial: 3 mun por doe de arroz en abril de 1425, 7–8 en enero de 1427. Mostramos 1426 como ese rango." },
  pricesTitle: { ko: "1426년 실록 속 면포 값", en: "Cotton prices in the 1426 Annals", ja: "1426年実録の綿布の値", zh: "1426年实录里的棉布价", fr: "Le coton dans les Annales de 1426", es: "El algodón en los Anales de 1426" },
  today: { ko: "요즘 돈 약 {w}", en: "about {w} today", ja: "今のお金で約{w}", zh: "约合今天{w}", fr: "env. {w} aujourd'hui", es: "unos {w} hoy" },
  months: { ko: "내 월급 {n}달 치", en: "{n} months of my pay", ja: "私の月給{n}か月分", zh: "我{n}个月的工资", fr: "{n} mois de mon salaire", es: "{n} meses de mi sueldo" },
  days: { ko: "내 월급 약 {n}일 치", en: "about {n} days of my pay", ja: "私の月給の約{n}日分", zh: "约我{n}天的工资", fr: "env. {n} jours de mon salaire", es: "unos {n} días de mi sueldo" },
  readDay: { ko: "그날 실록", en: "That day", ja: "その日の実録", zh: "那天的实录", fr: "Ce jour", es: "Ese día" },
  howTitle: { ko: "어떻게 계산하나요", en: "How it is calculated", ja: "計算のしかた", zh: "怎么算的", fr: "Méthode", es: "Cómo se calcula" },
  how: { ko: "월급 → 쌀(요즘 쌀값) → 면포 순서로 바꿔요. 면포 1필 = 쌀 5두는 1450년 이전 서울·경기 시세라서 1426년 한 해의 값은 아니에요. 세종 때 1두는 약 5.96L이고, 1L를 0.8kg으로 잡은 무게는 우리 추정이에요. 1426년 실제 돈 노릇은 삼베(정포)가 더 많이 했어요. 녹봉은 1485년 『경국대전』 숫자이고, 1석은 15두로 잡았어요.", en: "Pay → rice (today's price) → cotton. 1 bolt = 5 du of rice is the pre-1450 Seoul rate, not a 1426 quote. One du was about 5.96 L; the 0.8 kg/L weight is our estimate. In 1426 hemp cloth was still the main cloth money. Stipends are from the 1485 Gyeongguk Daejeon, with 1 seok = 15 du (some say 20).", ja: "月給→米（いまの米価）→綿布の順に換算します。綿布1匹＝米5斗は1450年以前のソウル・京畿の相場で、1426年単年の値ではありません。世宗代の1斗は約5.96L、1L＝0.8kgの重さは推定です。1426年は麻布（正布）が主な布貨でした。禄俸は1485年『経国大典』の数字で、1石＝15斗としました（20斗説あり）。", zh: "按月薪→大米（今天米价）→棉布换算。棉布1匹=米5斗是1450年以前首尔·京畿的行情，不是1426年当年的价。世宗时1斗约5.96升，按每升0.8公斤是我们的估计。1426年主要的布货其实是麻布（正布）。俸禄采用1485年《经国大典》的数字，1石按15斗（也有20斗说）。", fr: "Salaire → riz (prix actuel) → coton. 1 pièce = 5 du de riz est le taux de Séoul avant 1450, pas une cote de 1426. Un du valait environ 5,96 L ; 0,8 kg/L est notre estimation. En 1426, la toile de chanvre restait la principale monnaie-tissu. Les traitements viennent du Gyeongguk Daejeon (1485), avec 1 seok = 15 du (certains disent 20).", es: "Sueldo → arroz (precio actual) → algodón. 1 pieza = 5 du de arroz es la tasa de Seúl antes de 1450, no un precio de 1426. Un du era unos 5,96 L; 0,8 kg/L es nuestra estimación. En 1426 la tela de cáñamo seguía siendo la principal moneda-tela. Los estipendios son del Gyeongguk Daejeon (1485), con 1 seok = 15 du (algunos dicen 20)." },
  ruleSrc: { ko: "공정 비율: 실록 1426년 1월 19일 기사(저화 1장 = 쌀 1두 = 동전 40문)", en: "Official rule: Annals, 1426 lunar 1/19 (1 note = 1 du = 40 mun)", ja: "公定比率：実録1426年1月19日（楮貨1枚＝米1斗＝銅銭40文）", zh: "官定比例：实录1426年正月十九日（楮货1张=米1斗=铜钱40文）", fr: "Règle officielle : Annales, 1426, 1/19 lunaire (1 billet = 1 du = 40 mun)", es: "Regla oficial: Anales, 1426, 1/19 lunar (1 billete = 1 du = 40 mun)" },
  cardKicker: { ko: "1426 · 면포 환율 계산기", en: "1426 · Cotton exchange", ja: "1426・綿布レート計算", zh: "1426·棉布汇率计算器", fr: "1426 · Change en coton", es: "1426 · Cambio en algodón" },
  badge: { ko: "면포 환율", en: "Cotton rate", ja: "綿布レート", zh: "棉布汇率", fr: "Taux coton", es: "Tasa algodón" },
} satisfies Record<string, Six>;

const ANCHOR_LABEL: Record<string, Six> = {
  horseSmall: { ko: "여진 사람이 바친 작은 말(하등) 답례", en: "Return gift for a small horse (lowest grade)", ja: "女真の献上した小馬（下等）への返礼", zh: "女真所献小马（下等）的回赐", fr: "Contre-don pour un petit cheval (dernier rang)", es: "Regalo por un caballo pequeño (grado bajo)" },
  horseBig: { ko: "큰 말(상등) 답례", en: "Return gift for a big horse (top grade)", ja: "大馬（上等）への返礼", zh: "大马（上等）的回赐", fr: "Contre-don pour un grand cheval (premier rang)", es: "Regalo por un caballo grande (grado alto)" },
  wedding: { ko: "귀화인 우신에게 장가 밑천으로 (면포·정포 각 2필)", en: "To a naturalized man, U Sin, to marry (2 each of cotton and hemp)", ja: "帰化人の禹信に結婚の元手として（綿布・正布各2匹）", zh: "赐归化人禹信娶妻（棉布、正布各2匹）", fr: "À U Sin, naturalisé, pour se marier (2 de coton et 2 de chanvre)", es: "A U Sin, naturalizado, para casarse (2 de algodón y 2 de cáñamo)" },
  embezzle: { ko: "당진 만호가 몰래 쓴 진영의 면포", en: "Cotton a Dangjin commander used privately", ja: "唐津万戸が私用した営の綿布", zh: "唐津万户私用的营中棉布", fr: "Coton détourné par un commandant de Dangjin", es: "Algodón que usó en secreto un comandante de Dangjin" },
  bowl: { ko: "몰래 놋그릇 부어 만든 사람을 잡아 알린 상", en: "Reward for reporting illegal bronze casting", ja: "密かに鍮器を鋳た者を捕えて告げた賞", zh: "举报私铸铜器者的赏", fr: "Prime pour dénoncer une fonte illicite de bronze", es: "Premio por denunciar fundición ilegal de bronce" },
  arson: { ko: "불 지른 사람을 잡아 알린 상", en: "Reward for catching an arsonist", ja: "放火犯を捕えて告げた賞", zh: "抓获举报纵火者的赏", fr: "Prime pour la capture d'un incendiaire", es: "Premio por atrapar a un incendiario" },
};

const EXAMPLES = [2_100_000, 3_000_000, 5_000_000];
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
const num = (s: string) => Number(s.replace(/[^\d.]/g, ""));

function Converter({ l, fmt }: { l: ReturnType<typeof toL>; fmt: Intl.NumberFormat }) {
  const [n, setN] = useState("1");
  const [from, setFrom] = useState<Unit>("pil");
  const v = num(n) || 0;
  return (
    <Panel label={pick(C.converterTitle, l)}>
      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-1">
          <span className="block text-xs text-muted-foreground">{pick(C.amount, l)}</span>
          <input inputMode="decimal" value={n} onChange={(e) => setN(e.target.value)} className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-base" />
        </label>
        <div className="flex flex-wrap gap-1">
          {UNITS.map((u) => (
            <Button key={u} type="button" size="sm" variant={u === from ? "default" : "outline"} onClick={() => setFrom(u)}>
              {pick(UNIT[u], l)}
            </Button>
          ))}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="py-1" />
            <th className="py-1">{pick(C.official, l)}</th>
            <th className="py-1">{pick(C.market, l)}</th>
          </tr>
        </thead>
        <tbody>
          {UNITS.filter((u) => u !== from).map((u) => {
            const [lo, hi] = convertMarket(v, from, u);
            const m = nice(lo) === nice(hi) ? fmt.format(nice(lo)) : `${fmt.format(nice(lo))}–${fmt.format(nice(hi))}`;
            return (
              <tr key={u} className="border-t border-border">
                <td className="py-2 font-bold">{pick(UNIT[u], l)}</td>
                <td className="py-2">{fmt.format(nice(convertOfficial(v, from, u)))}</td>
                <td className="py-2">{m}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground">{pick(C.marketNote, l)}</p>
    </Panel>
  );
}

export default function Cotton1426({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const won = new Intl.NumberFormat(l === "zh" ? "zh-CN" : l, { style: "currency", currency: "KRW", maximumFractionDigits: 0 });
  const [pay, setPay] = useState("");
  const [rice, setRice] = useState(String(DEFAULT_RICE));
  const [result, setResult] = useState<{ pay: number; rice: number } | null>(null);
  const [error, setError] = useState(false);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  function run(p: number, how: string) {
    const r = num(rice) || DEFAULT_RICE;
    if (!(p > 0)) {
      setError(true);
      return;
    }
    setError(false);
    funnel(how);
    warp.start(() => {
      setResult({ pay: p, rice: r });
      setRound((x) => x + 1);
      stampEpisode(EP);
    });
  }

  const doe = result ? doeOfWon(result.pay, result.rice) : 0;
  const pil = doe / 10 / DU_PER_PIL;
  const topPct = result ? (doe / salaryDoePerMonth(SALARY_SEOK.top)) * 100 : 0;
  const bottomX = result ? doe / salaryDoePerMonth(SALARY_SEOK.bottom) : 0;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1426} l={l} onDone={warp.finish} />}
      <form
        className="space-y-3 rounded-2xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(num(pay), "typed");
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-bold text-foreground">{pick(C.salaryLabel, l)}</span>
          <input value={pay} onChange={(e) => setPay(e.target.value)} inputMode="numeric" placeholder="3,000,000" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-2xl" autoComplete="off" />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-bold text-foreground">{pick(C.riceLabel, l)}</span>
          <input value={rice} onChange={(e) => setRice(e.target.value)} inputMode="numeric" className="block w-40 rounded-lg border border-border bg-background px-3 py-2 text-base" />
          <span className="block text-xs text-muted-foreground">{pick(C.riceHint, l)}</span>
        </label>
        <Button type="submit" size="lg" className="w-full">
          {pick(C.go, l)}
        </Button>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{pick(C.examples, l)}:</span>
          {EXAMPLES.map((x) => (
            <Button key={x} type="button" size="sm" variant="outline" onClick={() => { setPay(fmt.format(x)); run(x, "example"); }}>
              {won.format(x)}
            </Button>
          ))}
        </div>
        {error && <p className="text-sm font-bold text-destructive">{pick(C.empty, l)}</p>}
        <p className="text-xs text-muted-foreground">{pick(C.privacy, l)}</p>
      </form>

      {result && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.kicker, l)}</p>
            <p className="mt-3 text-5xl font-black text-foreground">🧵 {fill(pick(C.pilBig, l), { n: fmt.format(nice(pil)) })}</p>
            <p className="mt-3 text-base">{fill(pick(C.riceLine, l), { du: fmt.format(nice(doe / 10)), kg: fmt.format(nice((doe / 10) * KG_PER_DU)) })}</p>
            <p className="mt-3 text-sm">{fill(pick(C.rankTop, l), { p: fmt.format(nice(topPct)) })}</p>
            <p className="text-sm">{fill(pick(C.rankBottom, l), { x: fmt.format(nice(bottomX)) })}</p>
          </section>

          <Panel label={pick(C.pricesTitle, l)}>
            <ul className="space-y-3">
              {ANCHORS.map((a) => {
                const w = wonOfDoe(a.pil * DU_PER_PIL * 10, result.rice);
                return (
                  <li key={a.id} className="rounded-lg bg-muted px-3 py-2 text-sm">
                    <p className="font-bold text-foreground">
                      {pick(ANCHOR_LABEL[a.id]!, l)} · {fill(pick(C.pilBig, l), { n: fmt.format(a.pil) })}
                    </p>
                    <p>
                      {fill(pick(C.today, l), { w: won.format(Math.round(w / 1000) * 1000) })} · {w >= result.pay ? fill(pick(C.months, l), { n: fmt.format(nice(w / result.pay)) }) : fill(pick(C.days, l), { n: fmt.format(Math.max(1, Math.round((w / result.pay) * 30))) })}
                    </p>
                    <p className="font-serif text-xs text-muted-foreground">
                      {a.text} ·{" "}
                      <a className="underline" href={`/${locale}/sillok-1426/?c=l&m=${a.m}&d=${a.d}`}>
                        {pick(C.readDay, l)} {a.m}/{a.d}
                      </a>
                    </p>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Converter l={l} fmt={fmt} />

          <Panel label={pick(C.howTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.how, l)}</p>
            <p className="text-xs text-muted-foreground">
              {pick(C.ruleSrc, l)} · 1{pick(SHORT.du, l)} ≈ {LITERS_PER_DU}L
            </p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: "世宗實錄 八年 (Wikisource)", url: "https://zh.wikisource.org/wiki/%E6%9C%9D%E9%AE%AE%E7%8E%8B%E6%9C%9D%E5%AF%A6%E9%8C%84/%E4%B8%96%E5%AE%97%E5%AF%A6%E9%8C%84/%E5%85%AB%E5%B9%B4" },
              { label: "이헌창, 「비금속 상품 화폐의 성장」 『한국문화사』 8", url: "https://contents.history.go.kr/mobile/km/view.do?levelId=km_008_0030_0010_0030" },
              { label: "이헌창, 「조선 전기 지폐·주화 통용책의 좌절」", url: "https://contents.history.go.kr/mobile/km/view.do?levelId=km_008_0030_0020_0010" },
              { label: "국립중앙박물관 「조선통보」", url: "https://www.museum.go.kr/site/main/relic/search/view?relicId=2082" },
              { label: "한국민족문화대백과 「말」", url: "https://encykorea.aks.ac.kr/Article/E0017800" },
              { label: "한국민족문화대백과 「녹패」", url: "https://encykorea.aks.ac.kr/Article/E0013002" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename="oiyo-cotton-1426"
            spec={{
              kicker: pick(C.cardKicker, l),
              title: fill(pick(C.pilBig, l), { n: fmt.format(nice(pil)) }),
              subtitle: fill(pick(C.rankTop, l), { p: fmt.format(nice(topPct)) }),
              badge: pick(C.badge, l),
              lines: [fill(pick(C.riceLine, l), { du: fmt.format(nice(doe / 10)), kg: fmt.format(nice((doe / 10) * KG_PER_DU)) }), fill(pick(C.rankBottom, l), { x: fmt.format(nice(bottomX)) })],
              footer: "oiyo.net · 1426",
              accent: "#5b4a2e",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
