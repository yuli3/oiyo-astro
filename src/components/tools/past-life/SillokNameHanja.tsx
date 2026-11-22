import { useState } from "react";
import type { Locale } from "../../../i18n";
import { dayParts, lookup, parseName, perTenThousand, tierOf, type CharData, type Found, type Tier } from "../../../lib/sillok-name-hanja";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, toL, useFunnel, type Six } from "./shared";
import { SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "sillok-name-hanja" as const;
const DATA_URL = "/data/sillok-1426-chars.json";
let cache: Promise<CharData> | null = null;
const load = () => (cache ??= fetch(DATA_URL).then((r) => r.json() as Promise<CharData>));

const C = {
  label: { ko: "이름 한자 (최대 4자)", en: "Your name in Chinese characters (up to 4)", ja: "名前の漢字（4字まで）", zh: "名字的汉字（最多4个）", fr: "Votre nom en caractères chinois (4 max.)", es: "Tu nombre en caracteres chinos (máx. 4)" },
  placeholder: { ko: "예: 民秀", en: "e.g. 民秀", ja: "例：民秀", zh: "例：民秀", fr: "ex. 民秀", es: "p. ej. 民秀" },
  go: { ko: "실록에서 찾기", en: "Search the Annals", ja: "実録で探す", zh: "在实录里找", fr: "Chercher dans les Annales", es: "Buscar en los Anales" },
  examples: { ko: "예시로 해 보기", en: "Try an example", ja: "例で試す", zh: "试试例子", fr: "Essayer un exemple", es: "Probar un ejemplo" },
  hangul: { ko: "한글은 빼고 한자만 찾았어요. 이름 한자를 모르면 휴대폰 한자 변환으로 입력해 보세요.", en: "Hangul was skipped; only Chinese characters are searched.", ja: "ハングルは除き、漢字だけを探しました。", zh: "已忽略韩文，只查汉字。", fr: "Le hangul est ignoré ; seuls les caractères chinois sont cherchés.", es: "Se omitió el hangul; solo se buscan caracteres chinos." },
  empty: { ko: "한자를 한 글자 이상 넣어 주세요.", en: "Enter at least one Chinese character.", ja: "漢字を1字以上入力してください。", zh: "请至少输入一个汉字。", fr: "Saisissez au moins un caractère chinois.", es: "Escribe al menos un carácter chino." },
  privacy: { ko: "이름은 이 기기에서만 찾고, 결과 링크에도 들어가지 않아요.", en: "Your name is searched on this device only and never goes into the link.", ja: "名前はこの端末内だけで検索し、リンクにも入りません。", zh: "名字只在本机查找，也不会放进链接。", fr: "Votre nom est cherché sur cet appareil et n'entre pas dans le lien.", es: "Tu nombre se busca solo en este dispositivo y no va en el enlace." },
  kicker: { ko: "1426 『세종실록』 속 내 이름 한자", en: "My name's characters in the 1426 Sejong Sillok", ja: "1426『世宗実録』の中の私の名前の漢字", zh: "1426《世宗实录》里我名字的汉字", fr: "Les caractères de mon nom dans les Annales de 1426", es: "Los caracteres de mi nombre en los Anales de 1426" },
  times: { ko: "{n}번", en: "{n} times", ja: "{n}回", zh: "{n}次", fr: "{n} fois", es: "{n} veces" },
  rank: { ko: "{kinds}종 가운데 {r}위 · 1만 자에 {p}번", en: "rank {r} of {kinds} · {p} per 10,000 characters", ja: "{kinds}種中{r}位・1万字に{p}回", zh: "{kinds}种中第{r}位·每万字{p}次", fr: "rang {r} sur {kinds} · {p} pour 10 000 caractères", es: "puesto {r} de {kinds} · {p} por cada 10.000 caracteres" },
  first: { ko: "처음 나온 곳: 음력 {m}월 {d}일, 그날 {s}번째 기사", en: "First seen: lunar month {m}, day {d}, entry {s} of that day", ja: "初出：旧暦{m}月{d}日、その日の{s}番目の記事", zh: "首次出现：农历{m}月{d}日，当天第{s}条", fr: "Première apparition : mois lunaire {m}, jour {d}, {s}e article du jour", es: "Primera aparición: mes lunar {m}, día {d}, entrada {s} del día" },
  readDay: { ko: "그날 실록 보기", en: "Read that day", ja: "その日の実録", zh: "看那天的实录", fr: "Lire ce jour", es: "Leer ese día" },
  absent: { ko: "1426년 한 해 실록에는 한 번도 나오지 않는 글자예요.", en: "This character never appears in the Annals for 1426.", ja: "1426年の実録には一度も出てこない字です。", zh: "这个字在1426年的实录里一次也没出现。", fr: "Ce caractère n'apparaît jamais dans les Annales de 1426.", es: "Este carácter no aparece nunca en los Anales de 1426." },
  aboutTitle: { ko: "어떻게 세나요", en: "How it is counted", ja: "数え方", zh: "怎么数的", fr: "Méthode", es: "Cómo se cuenta" },
  about: { ko: "위키문헌에 실린 『세종실록』 세종 8년(1426) 기사 {entries}건, 한자 {total}자({kinds}종)를 한 글자씩 셌어요. 날마다 첫 기사 앞에 붙는 일진(예: 丙申)은 날짜 표시라 빼고 셌어요. 원문 표기를 따르므로 為·爲처럼 모양이 다른 글자는 서로 바꿔서도 찾아봐요.", en: "We counted every character in the {entries} entries of the Sejong Sillok for year 8 (1426) on Wikisource: {total} characters, {kinds} distinct. The day stamp (e.g. 丙申) that opens each day is skipped. Variant forms such as 為/爲 are tried both ways.", ja: "ウィキソースの『世宗実録』世宗8年（1426）の記事{entries}件、漢字{total}字（{kinds}種）を一字ずつ数えました。各日の冒頭の日辰は日付なので除外しました。", zh: "逐字统计了维基文库《世宗实录》世宗八年（1426）的{entries}条记事，共{total}字（{kinds}种）。每天开头的日辰是日期，未计入。", fr: "Nous avons compté chaque caractère des {entries} articles des Annales de Sejong, an 8 (1426), sur Wikisource : {total} caractères, {kinds} distincts. Le cachet de date du jour est exclu.", es: "Contamos cada carácter de las {entries} entradas de los Anales de Sejong, año 8 (1426), en Wikisource: {total} caracteres, {kinds} distintos. Se excluye el sello de fecha del día." },
  src: { ko: "세종실록 8년(위키문헌)", en: "Sejong Sillok, year 8 (Wikisource)", ja: "世宗実録8年（ウィキソース）", zh: "世宗实录八年（维基文库）", fr: "Sejong Sillok, an 8 (Wikisource)", es: "Sejong Sillok, año 8 (Wikisource)" },
  cardKicker: { ko: "1426 · 실록 속 내 이름 한자", en: "1426 · My name in the Annals", ja: "1426・実録の中の名前の漢字", zh: "1426·实录里的名字汉字", fr: "1426 · Mon nom dans les Annales", es: "1426 · Mi nombre en los Anales" },
  badge: { ko: "실록 검색", en: "Annals search", ja: "実録検索", zh: "实录检索", fr: "Annales", es: "Anales" },
} satisfies Record<string, Six>;

const TIERS: Record<Tier, { title: Six; body: Six; emoji: string }> = {
  regular: { emoji: "📜", title: { ko: "실록 단골 이름", en: "An Annals regular", ja: "実録の常連の名前", zh: "实录常客", fr: "Un habitué des Annales", es: "Un habitual de los Anales" }, body: { ko: "이름의 모든 글자가 1426년 실록에 100번 넘게 나와요. 임금과 신하가 날마다 쓰던 글자예요.", en: "Every character appears over 100 times in 1426: words the court used daily.", ja: "名前のどの字も1426年の実録に100回以上出てきます。", zh: "名字的每个字在1426年的实录里都出现了100次以上。", fr: "Chaque caractère apparaît plus de 100 fois en 1426.", es: "Cada carácter aparece más de 100 veces en 1426." } },
  guest: { emoji: "🖌️", title: { ko: "실록 손님 이름", en: "An Annals guest", ja: "実録の客人の名前", zh: "实录访客", fr: "Un invité des Annales", es: "Un invitado de los Anales" }, body: { ko: "가장 드문 글자도 10번 넘게 나와요. 자주는 아니어도 꾸준히 등장하는 글자예요.", en: "Even the rarest character appears over 10 times.", ja: "いちばん珍しい字でも10回以上出てきます。", zh: "最少见的字也出现了10次以上。", fr: "Même le plus rare apparaît plus de 10 fois.", es: "Incluso el más raro aparece más de 10 veces." } },
  rare: { emoji: "💎", title: { ko: "실록 귀한 손님 이름", en: "A rare visitor", ja: "実録の珍客の名前", zh: "实录稀客", fr: "Un visiteur rare", es: "Un visitante raro" }, body: { ko: "한 해 동안 열 번이 안 되게 나오는 글자가 들어 있어요. 찾아보는 재미가 있는 이름이에요.", en: "One character appears fewer than ten times all year.", ja: "1年で10回未満しか出てこない字が入っています。", zh: "有个字一年里出现不到十次。", fr: "Un caractère apparaît moins de dix fois dans l'année.", es: "Un carácter aparece menos de diez veces en el año." } },
  absent: { emoji: "✨", title: { ko: "실록에 없는 글자가 있는 이름", en: "A character the Annals never used", ja: "実録にない字のある名前", zh: "含实录未见之字", fr: "Un caractère absent des Annales", es: "Un carácter ausente de los Anales" }, body: { ko: "1426년 실록에 한 번도 쓰이지 않은 글자가 있어요. 세종 때 기록관도 이 해에는 쓸 일이 없던 글자예요.", en: "One character never appears in 1426: the court's scribes had no use for it that year.", ja: "1426年の実録に一度も使われなかった字があります。", zh: "有个字在1426年的实录里从未用过。", fr: "Un caractère n'est jamais employé en 1426.", es: "Un carácter no se usa nunca en 1426." } },
};

const EXAMPLES = ["民秀", "賢恩", "英德", "智允"];
const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

function Snippet({ text, ch }: { text: string; ch: string }) {
  const i = text.indexOf(ch);
  if (i < 0) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, i)}
      <mark className="rounded bg-hanja-mark px-0.5 text-foreground dark:bg-hanja-mark-dark">{ch}</mark>
      {text.slice(i + ch.length)}
    </span>
  );
}

export default function SillokNameHanja({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ found: Found[]; hangul: boolean; data: CharData } | null>(null);
  const [error, setError] = useState(false);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  async function search(value: string, how: string) {
    const { chars, hangul } = parseName(value);
    if (!chars.length) {
      setError(true);
      return;
    }
    setError(false);
    const data = await load();
    const found = lookup(chars, data);
    funnel(how);
    warp.start(() => {
      setResult({ found, hangul, data });
      setRound((r) => r + 1);
      stampEpisode(EP);
    });
  }

  const tier = result ? TIERS[tierOf(result.found)] : null;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1426} l={l} onDone={warp.finish} />}
      <form
        className="space-y-3 rounded-2xl border border-border bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void search(input, "typed");
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-bold text-foreground">{pick(C.label, l)}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={pick(C.placeholder, l)}
            maxLength={12}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-serif text-2xl"
            autoComplete="off"
          />
        </label>
        <Button type="submit" size="lg" className="w-full">
          {pick(C.go, l)}
        </Button>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{pick(C.examples, l)}:</span>
          {EXAMPLES.map((x) => (
            <Button key={x} type="button" size="sm" variant="outline" onClick={() => { setInput(x); void search(x, "example"); }}>
              {x}
            </Button>
          ))}
        </div>
        {error && <p className="text-sm font-bold text-destructive">{pick(C.empty, l)}</p>}
        <p className="text-xs text-muted-foreground">{pick(C.privacy, l)}</p>
      </form>

      {result && tier && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.kicker, l)}</p>
            <p className="mt-3 font-serif text-5xl font-black tracking-widest text-foreground">{result.found.map((f) => f.ch).join("")}</p>
            <p className="mt-3 text-2xl font-black text-foreground">
              {tier.emoji} {pick(tier.title, l)}
            </p>
            <p className="mt-2 text-sm">{pick(tier.body, l)}</p>
            {result.hangul && <p className="mt-2 text-xs text-muted-foreground">{pick(C.hangul, l)}</p>}
          </section>

          {result.found.map((f, i) => {
            const label = `${f.ch} · ${f.row ? fill(pick(C.times, l), { n: fmt.format(f.row[0]) }) : "0"}`;
            if (!f.row) {
              return (
                <Panel key={`${f.ch}-${i}`} label={label}>
                  <p className="text-sm">{pick(C.absent, l)}</p>
                </Panel>
              );
            }
            const [count, rank, day, seq, snippet] = f.row;
            const d = dayParts(day);
            return (
              <Panel key={`${f.ch}-${i}`} label={label}>
                <p className="text-sm text-foreground">{fill(pick(C.rank, l), { kinds: fmt.format(result.data.kinds), r: fmt.format(rank), p: perTenThousand(count, result.data.total).toFixed(1) })}</p>
                <p className="text-sm">{fill(pick(C.first, l), { m: d.month, d: d.day, s: seq })}</p>
                <p className="rounded-lg bg-muted px-3 py-2 font-serif text-base leading-relaxed">
                  <Snippet text={snippet} ch={f.ch} />
                </p>
                <a className="text-sm font-bold underline" href={`/${locale}/sillok-1426/?c=l&m=${d.month}&d=${d.day}`}>
                  {pick(C.readDay, l)} →
                </a>
              </Panel>
            );
          })}

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.about, l), { entries: fmt.format(result.data.entries), total: fmt.format(result.data.total), kinds: fmt.format(result.data.kinds) })}</p>
          </Panel>

          <Sources l={l} items={[{ label: pick(C.src, l), url: `https://zh.wikisource.org/w/index.php?title=%E6%9C%9D%E9%AE%AE%E7%8E%8B%E6%9C%9D%E5%AF%A6%E9%8C%84/%E4%B8%96%E5%AE%97%E5%AF%A6%E9%8C%84/%E5%85%AB%E5%B9%B4&oldid=${result.data.oldid}` }]} />

          <SaveCard
            l={l}
            testId={EP}
            filename="oiyo-sillok-name-hanja"
            spec={{
              kicker: pick(C.cardKicker, l),
              title: result.found.map((f) => f.ch).join(""),
              subtitle: `${tier.emoji} ${pick(tier.title, l)}`,
              badge: pick(C.badge, l),
              lines: result.found.map((f) => `${f.ch} · ${f.row ? fill(pick(C.times, l), { n: fmt.format(f.row[0]) }) : "0"}`),
              footer: `oiyo.net · 1426 · ${fmt.format(result.data.total)}`,
              accent: "#7a2e2e",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
