import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { ageFromBirthday } from "../../../lib/joseon-1789";
import { STATUSES, drawStatus, formatNinbetsu, kanjiAge, kanjiKoku,
  makeEntry, oneIn, parseNinbetsu, statusById, type Entry, type Sex } from "../../../lib/ninbetsu-edo";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "ninbetsu-edo" as const;

const C = {
  sexLabel: { ko: "인별장에 어떻게 적힐까요?", en: "How should you be entered?", ja: "人別帳にどう書かれる？", zh: "在人别帐上如何登记？", fr: "Comment être inscrit ?", es: "¿Cómo te inscriben?" },
  female: { ko: "여자", en: "Woman", ja: "女", zh: "女", fr: "Femme", es: "Mujer" },
  male: { ko: "남자", en: "Man", ja: "男", zh: "男", fr: "Homme", es: "Hombre" },
  fate: { ko: "운명에 맡기기", en: "Leave it to fate", ja: "運命にまかせる", zh: "听天由命", fr: "Au hasard", es: "Al azar" },
  draw: { ko: "인별장 속 나 찾기", en: "Find me in the register", ja: "人別帳の中の私を探す", zh: "在人别帐中找到我", fr: "Me trouver dans le registre", es: "Encontrarme en el registro" },
  again: { ko: "다시 뽑기", en: "Draw again", ja: "もう一度", zh: "再抽一次", fr: "Recommencer", es: "Otra vez" },
  heroKicker: { ko: "에도 시대 종문인별개장 속 나", en: "You in an Edo-period temple register", ja: "江戸時代の宗門人別改帳の中の私", zh: "江户时代宗门人别改帐中的我", fr: "Vous dans un registre d'Edo", es: "Tú en un registro de Edo" },
  entryTitle: { ko: "나의 인별장 한 줄", en: "Your line in the register", ja: "私の人別帳の一行", zh: "我在人别帐上的一行", fr: "Votre ligne au registre", es: "Tu línea en el registro" },
  invented: { ko: "이름·절·소출은 놀이용으로 지어낸 예시예요. 실제 장부는 집주인을 맨 앞에, 가족과 하인을 뒤에 적고 단나데라(檀那寺)가 도장을 찍었어요.", en: "The name, temple and holding are invented for the game. Real registers listed the head of house first, then family and servants, each certified by their family temple's seal.", ja: "名前・寺・持高は遊びのための架空の例です。実際の帳面は戸主を筆頭に家族・奉公人を記し、檀那寺が印を押しました。", zh: "名字、寺院和持高为游戏虚构。真实帐册以户主为首，依次记家人与仆役，由檀那寺盖印担保。", fr: "Nom, temple et récolte sont inventés. Les vrais registres listaient le chef de famille, puis famille et domestiques, sous le sceau du temple.", es: "Nombre, templo y cosecha son inventados. Los registros reales listaban al cabeza de familia, luego familia y criados, con el sello del templo." },
  shareTitle: { ko: "에도 시대 사람들은 이렇게 나뉘었어요", en: "How Edo-period people were divided", ja: "江戸時代の身分構成", zh: "江户时代的身份构成", fr: "La société d'Edo", es: "La sociedad de Edo" },
  shareNote: { ko: "백과사전의 범위(예: 무사 5~6%)의 가운데 값을 썼어요.", en: "Midpoints of the encyclopedia ranges (e.g. samurai 5–6%).", ja: "百科事典の幅（例：士5～6%）の中間値です。", zh: "取百科全书区间（如武士5～6%）的中间值。", fr: "Valeurs médianes des fourchettes de l'encyclopédie.", es: "Valores medios de los rangos de la enciclopedia." },
  me: { ko: "← 나", en: "← you", ja: "← 私", zh: "← 我", fr: "← vous", es: "← tú" },
  aboutTitle: { ko: "종문인별개장이란", en: "What was the temple register?", ja: "宗門人別改帳とは", zh: "什么是宗门人别改帐", fr: "Qu'était ce registre ?", es: "¿Qué era este registro?" },
  about: { ko: "기독교를 금지하려고 모든 사람을 어느 절의 신도로 등록하게 한 장부예요. 1634년 히라도의 기록이 가장 이르고, 1671년 막부가 모든 번에 작성을 명령해 원칙적으로 해마다 만들었어요. 사실상의 호적·인구조사 역할을 하다가 1871년 호적법, 1872년 임신호적으로 이어졌어요.", en: "To stamp out Christianity, everyone had to be registered as a parishioner of a Buddhist temple. The earliest dates from 1634 in Hirado; in 1671 the shogunate ordered every domain to keep one, in principle yearly. It served as the census until the 1871 Family Registration Law and the 1872 register.", ja: "キリシタン禁制のため、すべての人をいずれかの寺の檀家として登録させた帳面です。1634年の平戸の帳面が最も早く、1671年（寛文11）に幕府が諸藩に作成を命じ、原則として毎年作られました。事実上の戸籍・人口調査となり、1871年の戸籍法、1872年の壬申戸籍へ引き継がれました。", zh: "为禁止基督教，规定所有人都须登记为某寺院的檀家。最早见于1634年平户，1671年幕府命令各藩编制，原则上每年编造。它实际上充当户籍和人口调查，后由1871年户籍法和1872年壬申户籍取代。", fr: "Pour interdire le christianisme, chacun devait être inscrit auprès d'un temple. Le plus ancien date de 1634 (Hirado) ; dès 1671, tous les domaines durent en tenir un, en principe chaque année, jusqu'à l'état civil de 1871–1872.", es: "Para prohibir el cristianismo, todos debían inscribirse en un templo. El más antiguo es de 1634 (Hirado); desde 1671 todos los dominios debían llevarlo, en principio cada año, hasta el registro civil de 1871–1872." },
  cardKicker: { ko: "에도 · 인별장 속 나", en: "Edo · Me in the temple register", ja: "江戸・人別帳の中の私", zh: "江户·人别帐中的我", fr: "Edo · Moi au registre", es: "Edo · Yo en el registro" },
  badge: { ko: "종문인별개장", en: "Shūmon ninbetsu aratamechō", ja: "宗門人別改帳", zh: "宗门人别改帐", fr: "Registre des temples", es: "Registro de templos" },
  src1: { ko: "일본대백과전서 「에도시대」(코토뱅크)", en: "Nihon Daihyakka Zensho: Edo period (Kotobank)", ja: "日本大百科全書「江戸時代」（コトバンク）", zh: "日本大百科全书“江户时代”（Kotobank）", fr: "Nihon Daihyakka : époque d'Edo", es: "Nihon Daihyakka: período Edo" },
  src2: { ko: "「종문인별개장」 사전 항목(코토뱅크)", en: "Shūmon ninbetsu aratamechō entries (Kotobank)", ja: "「宗門人別改帳」（コトバンク）", zh: "“宗门人别改帐”词条（Kotobank）", fr: "Entrées « shūmon ninbetsu » (Kotobank)", es: "Entradas «shūmon ninbetsu» (Kotobank)" },
  ageLine: { ko: "{a}세", en: "age {a}", ja: "{a}歳", zh: "{a}岁", fr: "{a} ans", es: "{a} años" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

function SexPicker({ value, onChange, l }: { value: Sex | "fate"; onChange: (v: Sex | "fate") => void; l: L }) {
  const opts: [Sex | "fate", Six][] = [["f", C.female], ["m", C.male], ["fate", C.fate]];
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-foreground">{pick(C.sexLabel, l)}</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup">
        {opts.map(([v, label]) => (
          <Button key={v} role="radio" aria-checked={value === v} variant={value === v ? "default" : "outline"} onClick={() => onChange(v)}>
            {pick(label, l)}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** One register column, a character per line so it reads top-down on any font (no vertical-text glyph fallbacks). */
function Col({ text, seal }: { text: string; seal?: boolean }) {
  return (
    <p className={seal ? "seal" : undefined}>
      {[...text].map((ch, i) => (
        <span key={i}>{ch}</span>
      ))}
    </p>
  );
}

function RegisterLine({ e }: { e: Entry }) {
  const s = statusById(e.status)!;
  const head = s.jaLabel;
  return (
    <div className="timeslip-ninbetsu" lang="ja">
      <Col text={`一　${e.temple}　旦那`} />
      <Col text={`${head}　${e.name}　年${kanjiAge(e.age)}`} />
      {e.koku !== null && <Col text={`持高　${kanjiKoku(e.koku)}`} />}
      <Col text="印" seal />
    </div>
  );
}

export default function NinbetsuEdo({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [sex, setSex] = useState<Sex | "fate">("fate");
  const [entry, setEntry] = useState<Entry | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseNinbetsu(window.location.search);
    if (shared) setEntry(shared);
  }, []);

  function draw(rand: () => number, age: number, how: string) {
    const st = drawStatus(rand);
    const sx: Sex = sex === "fate" ? (rand() < 0.5 ? "f" : "m") : sex;
    const next = makeEntry(st, sx, age, rand);
    funnel(how);
    warp.start(() => {
      setEntry(next);
      setRound((r) => r + 1);
      setShareQuery(formatNinbetsu(next));
      stampEpisode(EP);
    });
  }

  const status = entry ? statusById(entry.status) : null;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1800} l={l} onDone={warp.finish} />}
      <SexPicker value={sex} onChange={setSex} l={l} />
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, `${b}|${sex}`), Math.min(ageFromBirthday(b), 99), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, 5 + Math.floor(Math.random() * 60), "random")}>
          {pick(entry ? C.again : C.draw, l)}
        </Button>
      )}

      {entry && status && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(status.name, l)}</p>
            <div className="mt-3">
              <RarityBadge n={oneIn(status)} l={l} fmt={fmt} />
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground">{pick(status.life, l)}</p>
          </section>

          <Panel label={pick(C.entryTitle, l)}>
            <RegisterLine e={entry} />
            <p className="pt-3 text-xs leading-relaxed text-muted-foreground">
              {entry.name} · {fill(pick(C.ageLine, l), { a: entry.age })} · {pick(C.invented, l)}
            </p>
          </Panel>

          <Panel label={pick(C.shareTitle, l)}>
            <ul className="space-y-1 text-sm">
              {STATUSES.map((s) => (
                <li key={s.id} className={s.id === entry.status ? "font-bold text-primary" : "text-muted-foreground"}>
                  {pick(s.name, l)} {(s.permille / 10).toFixed(1)}%{s.id === entry.status && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.shareNote, l)}</p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.about, l)}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://kotobank.jp/word/%E6%B1%9F%E6%88%B8%E6%99%82%E4%BB%A3-36918" },
              { label: pick(C.src2, l), url: "https://kotobank.jp/word/%E5%AE%97%E9%96%80%E4%BA%BA%E5%88%A5%E6%94%B9%E5%B8%B3-841801" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-ninbetsu-edo-${entry.status}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: pick(status.name, l),
              subtitle: `${entry.temple} · ${entry.name} · ${fill(pick(C.ageLine, l), { a: entry.age })}`,
              badge: pick(C.badge, l),
              lines: [pick(status.life, l)],
              footer: "oiyo.net · 江戸",
              accent: "#5a3a6b",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
