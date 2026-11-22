import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { GROUPS, TOTAL_K, drawGroup, formatCensus, groupById, lineOf, makeEntry, oneIn, parseCensus, type Entry, type Sex } from "../../../lib/census-1850";
import { ageFromBirthday } from "../../../lib/joseon-1789";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "census-1850" as const;

const C = {
  sexLabel: { ko: "센서스에 어떻게 적힐까요?", en: "How should you be entered?", ja: "国勢調査にどう書かれる？", zh: "在普查表上如何登记？", fr: "Comment être recensé ?", es: "¿Cómo te registran?" },
  female: { ko: "여자", en: "Female", ja: "女", zh: "女", fr: "Femme", es: "Mujer" },
  male: { ko: "남자", en: "Male", ja: "男", zh: "男", fr: "Homme", es: "Hombre" },
  fate: { ko: "운명에 맡기기", en: "Leave it to fate", ja: "運命にまかせる", zh: "听天由命", fr: "Au hasard", es: "Al azar" },
  draw: { ko: "1850 센서스 속 나 찾기", en: "Find me in the 1850 census", ja: "1850年国勢調査の中の私を探す", zh: "在1850年普查中找到我", fr: "Me trouver dans le recensement de 1850", es: "Encontrarme en el censo de 1850" },
  again: { ko: "다시 뽑기", en: "Draw again", ja: "もう一度", zh: "再抽一次", fr: "Recommencer", es: "Otra vez" },
  heroKicker: { ko: "1850년 6월 1일, 미국 센서스 속 나", en: "You on census day, June 1, 1850", ja: "1850年6月1日、アメリカ国勢調査の中の私", zh: "1850年6月1日，美国普查中的我", fr: "Vous au jour du recensement, 1er juin 1850", es: "Tú en el día del censo, 1 de junio de 1850" },
  lineTitle: { ko: "조사원이 적은 나의 한 줄", en: "Your line, as the marshal wrote it", ja: "調査員が書いた私の一行", zh: "调查员写下的我的一行", fr: "Votre ligne, de la main de l'agent", es: "Tu línea, escrita por el empadronador" },
  slaveTitle: { ko: "노예 명부(제2표)의 한 줄", en: "Your line on the slave schedule", ja: "奴隷台帳（第2表）の一行", zh: "奴隶表（第二表）上的一行", fr: "Votre ligne sur le registre des esclaves", es: "Tu línea en el registro de esclavos" },
  colName: { ko: "이름", en: "Name", ja: "名前", zh: "姓名", fr: "Nom", es: "Nombre" },
  colOwner: { ko: "소유주 이름", en: "Name of slave owner", ja: "所有者の名", zh: "奴隶主姓名", fr: "Nom du propriétaire", es: "Nombre del dueño" },
  colAge: { ko: "나이", en: "Age", ja: "年齢", zh: "年龄", fr: "Âge", es: "Edad" },
  colSex: { ko: "성별", en: "Sex", ja: "性別", zh: "性别", fr: "Sexe", es: "Sexo" },
  colColor: { ko: "피부색", en: "Color", ja: "肌の色", zh: "肤色", fr: "Couleur", es: "Color" },
  colTrade: { ko: "직업(15세 넘는 남자만)", en: "Occupation (males over 15)", ja: "職業（15歳超の男性のみ）", zh: "职业（仅15岁以上男性）", fr: "Profession (hommes de plus de 15 ans)", es: "Oficio (varones mayores de 15)" },
  colValue: { ko: "부동산 가치", en: "Value of real estate", ja: "不動産の価値", zh: "不动产价值", fr: "Valeur des biens fonciers", es: "Valor de bienes raíces" },
  colBirth: { ko: "태어난 곳", en: "Place of birth", ja: "出生地", zh: "出生地", fr: "Lieu de naissance", es: "Lugar de nacimiento" },
  colNumber: { ko: "번호", en: "Number", ja: "番号", zh: "编号", fr: "Numéro", es: "Número" },
  blankOwner: { ko: "(주인의 이름)", en: "(the owner's name)", ja: "（所有者の名）", zh: "（奴隶主的名字）", fr: "(nom du propriétaire)", es: "(nombre del dueño)" },
  noName: { ko: "내 이름이 적힐 칸은 없어요. 노예 명부는 주인 이름 아래 번호와 나이·성별·피부색만 적었어요. 노예였던 사람들이 이름으로 처음 센서스에 오른 건 해방 뒤인 1870년이에요.", en: "There is no column for your name. The slave schedule gave the owner's name, then a number, age, sex and colour. The formerly enslaved first appear by name in the 1870 census, after emancipation.", ja: "あなたの名を書く欄はありません。奴隷台帳には所有者の名の下に番号・年齢・性別・肌の色だけが書かれました。名前で国勢調査に載るのは、解放後の1870年が最初です。", zh: "没有写你名字的栏。奴隶表只在奴隶主姓名下记编号、年龄、性别和肤色。曾被奴役的人第一次以名字出现在普查中，是解放后的1870年。", fr: "Il n'y a pas de colonne pour votre nom : seulement le propriétaire, puis un numéro, l'âge, le sexe et la couleur. Les anciens esclaves apparaissent par leur nom pour la première fois en 1870.", es: "No hay columna para tu nombre: solo el dueño, luego un número, edad, sexo y color. Las personas antes esclavizadas aparecen con su nombre por primera vez en el censo de 1870." },
  invented: { ko: "이름·태어난 곳·직업·금액은 놀이용으로 지어낸 예시예요. 실제 기록 속 개인이 아니에요.", en: "Name, birthplace, trade and dollar value are invented for the game, not a real record.", ja: "名前・出生地・職業・金額は遊びのための架空の例で、実在の記録ではありません。", zh: "姓名、出生地、职业和金额均为游戏虚构，并非真实记录。", fr: "Nom, lieu de naissance, métier et montant sont inventés, pas un vrai registre.", es: "Nombre, lugar de nacimiento, oficio y valor son inventados, no un registro real." },
  noTrade: { ko: "여자와 15세 이하 아이는 직업 칸을 비워 뒀어요. 1850년 조사표가 15세 넘는 남자에게만 직업을 물었거든요.", en: "Women and children had no occupation entry: the 1850 form asked it only of males over 15.", ja: "女性と15歳以下の子どもは職業欄が空欄です。1850年の調査票は15歳超の男性にだけ職業を尋ねました。", zh: "女性和15岁以下儿童的职业栏留空：1850年的表格只问15岁以上男性的职业。", fr: "Femmes et enfants n'avaient pas de profession : le formulaire ne la demandait qu'aux hommes de plus de 15 ans.", es: "Mujeres y niños no tenían oficio anotado: el formulario solo lo pedía a varones mayores de 15." },
  shareTitle: { ko: "1850년 미국 사람 2,319만 명은 이렇게 나뉘었어요", en: "How 23.2 million Americans were divided in 1850", ja: "1850年アメリカの2319万人の内訳", zh: "1850年美国2319万人的构成", fr: "Les 23,2 millions d'Américains de 1850", es: "Los 23,2 millones de estadounidenses de 1850" },
  me: { ko: "← 나", en: "← you", ja: "← 私", zh: "← 我", fr: "← vous", es: "← tú" },
  aboutTitle: { ko: "1850년 센서스는 무엇이 달랐나", en: "What was new in 1850", ja: "1850年の国勢調査は何が新しかったか", zh: "1850年普查有何不同", fr: "Ce qui change en 1850", es: "Qué cambió en 1850" },
  about: { ko: "그 전까지 센서스는 집주인 이름만 적고 나머지 식구는 머릿수로 셌어요. 1850년에 처음으로 자유인 한 사람 한 사람의 이름·나이·성별·직업을 적고, 태어난 곳도 물었어요. 조사원 3,231명이 6월 1일 기준으로 집집마다 다니며 13개 항목을 적었어요. 하지만 노예 320만 명은 이 '한 사람씩'에서 빠졌어요.", en: "Before 1850 only the head of house was named and everyone else was a tally. In 1850, for the first time, every free person was listed by name, age, sex and occupation, and asked where they were born. 3,231 enumerators went door to door with 13 questions, as of June 1. But the 3.2 million enslaved were left out of this \"one by one\".", ja: "それまでの調査は戸主の名だけを書き、ほかの家族は人数で数えました。1850年に初めて自由人一人ひとりの名前・年齢・性別・職業を記し、出生地も尋ねました。調査員3,231人が6月1日時点で一軒ずつ回り13項目を書きました。しかし奴隷320万人はこの「一人ひとり」から外されました。", zh: "此前普查只写户主姓名，其他家人只计人数。1850年首次逐一记录每个自由人的姓名、年龄、性别、职业，并询问出生地。3231名调查员以6月1日为准挨家挨户填写13个项目。但320万奴隶被排除在这“逐一”之外。", fr: "Avant 1850, seul le chef de famille était nommé. En 1850, pour la première fois, chaque personne libre est inscrite par nom, âge, sexe et métier, avec son lieu de naissance : 3 231 agents, 13 questions, au 1er juin. Mais les 3,2 millions d'esclaves restent exclus de ce « un par un ».", es: "Antes de 1850 solo se nombraba al cabeza de familia. En 1850, por primera vez, cada persona libre figura con nombre, edad, sexo, oficio y lugar de nacimiento: 3.231 empadronadores, 13 preguntas, al 1 de junio. Pero los 3,2 millones de esclavizados quedaron fuera de ese «uno por uno»." },
  cardKicker: { ko: "1850 · 미국 센서스 속 나", en: "1850 · Me in the U.S. census", ja: "1850・アメリカ国勢調査の中の私", zh: "1850·美国普查中的我", fr: "1850 · Moi dans le recensement", es: "1850 · Yo en el censo" },
  badge: { ko: "제7회 미국 센서스", en: "Seventh U.S. Census", ja: "第7回アメリカ国勢調査", zh: "第七次美国人口普查", fr: "7e recensement des États-Unis", es: "Séptimo censo de EE. UU." },
  src1: { ko: "미국 인구조사국: 1850 주요 사실", en: "U.S. Census Bureau: 1850 fast facts", ja: "米国勢調査局：1850年の概要", zh: "美国人口普查局：1850年概况", fr: "U.S. Census Bureau : chiffres de 1850", es: "Oficina del Censo: datos de 1850" },
  src2: { ko: "미국 인구조사국: 1850 조사표와 지침", en: "U.S. Census Bureau: 1850 questionnaire", ja: "米国勢調査局：1850年の調査票", zh: "美国人口普查局：1850年调查表", fr: "U.S. Census Bureau : questionnaire de 1850", es: "Oficina del Censo: cuestionario de 1850" },
  src3: { ko: "퓨 리서치: 1850년 이후 이민자 출신국", en: "Pew Research: immigrant origins since 1850", ja: "ピュー・リサーチ：1850年以降の移民の出身国", zh: "皮尤研究中心：1850年以来的移民来源", fr: "Pew Research : origines des immigrés depuis 1850", es: "Pew Research: origen de los inmigrantes desde 1850" },
  src4: { ko: "위키백과: 1850년 미국 센서스", en: "Wikipedia: 1850 United States census", ja: "ウィキペディア：1850年アメリカ国勢調査", zh: "维基百科：1850年美国人口普查", fr: "Wikipédia : recensement de 1850", es: "Wikipedia: censo de 1850" },
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

function Ledger({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="timeslip-census">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function Census1850({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [sex, setSex] = useState<Sex | "fate">("fate");
  const [entry, setEntry] = useState<Entry | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseCensus(window.location.search);
    if (shared) setEntry(shared);
  }, []);

  function draw(rand: () => number, age: number, how: string) {
    const g = drawGroup(rand);
    const sx: Sex = sex === "fate" ? (rand() < 0.5 ? "f" : "m") : sex;
    const next = makeEntry(g, sx, age, rand);
    funnel(how);
    warp.start(() => {
      setEntry(next);
      setRound((r) => r + 1);
      setShareQuery(formatCensus(next));
      stampEpisode(EP);
    });
  }

  const group = entry ? groupById(entry.group) : null;
  const line = entry ? lineOf(entry) : null;
  const enslaved = entry?.group === "enslaved";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1850} l={l} onDone={warp.finish} />}
      <SexPicker value={sex} onChange={setSex} l={l} />
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, `${b}|${sex}`), Math.min(ageFromBirthday(b), 99), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, 1 + Math.floor(Math.random() * 70), "random")}>
          {pick(entry ? C.again : C.draw, l)}
        </Button>
      )}

      {entry && group && line && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(group.name, l)}</p>
            {/* No rarity badge for an enslaved result: a "how rare" score would make a game of it (series rule, 11-12 notes). */}
            {!enslaved && (
              <div className="mt-3">
                <RarityBadge n={oneIn(group)} l={l} fmt={fmt} />
              </div>
            )}
            <p className="mt-4 text-base leading-relaxed text-foreground">{pick(group.life, l)}</p>
          </section>

          {enslaved ? (
            <Panel label={pick(C.slaveTitle, l)}>
              <Ledger
                rows={[
                  [pick(C.colOwner, l), pick(C.blankOwner, l)],
                  [pick(C.colNumber, l), "1"],
                  [pick(C.colAge, l), String(line.age)],
                  [pick(C.colSex, l), line.sex],
                  [pick(C.colColor, l), line.color],
                ]}
              />
              <p className="pt-3 text-sm leading-relaxed text-foreground">{pick(C.noName, l)}</p>
            </Panel>
          ) : (
            <Panel label={pick(C.lineTitle, l)}>
              <Ledger
                rows={[
                  [pick(C.colName, l), line.name ?? ""],
                  [pick(C.colAge, l), String(line.age)],
                  [pick(C.colSex, l), line.sex],
                  [pick(C.colColor, l), line.color],
                  [pick(C.colTrade, l), line.trade],
                  [pick(C.colValue, l), line.value],
                  [pick(C.colBirth, l), line.birth],
                ]}
              />
              <p className="pt-3 text-xs leading-relaxed text-muted-foreground">
                {!line.trade && `${pick(C.noTrade, l)} `}
                {pick(C.invented, l)}
              </p>
            </Panel>
          )}

          <Panel label={pick(C.shareTitle, l)}>
            <ul className="space-y-1 text-sm">
              {GROUPS.map((g) => (
                <li key={g.id} className={g.id === entry.group ? "font-bold text-primary" : "text-muted-foreground"}>
                  {pick(g.name, l)} {((g.k / TOTAL_K) * 100).toFixed(1)}%{g.id === entry.group && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.about, l)}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://www.census.gov/programs-surveys/decennial-census/decade/decennial-facts.1850.html" },
              { label: pick(C.src2, l), url: "https://www.census.gov/programs-surveys/decennial-census/technical-documentation/questionnaires/1850.html" },
              { label: pick(C.src3, l), url: "https://www.pewresearch.org/short-reads/2024/07/22/how-the-origins-of-americas-immigrants-have-changed-since-1850/" },
              { label: pick(C.src4, l), url: "https://en.wikipedia.org/wiki/1850_United_States_census" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-census-1850-${entry.group}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: pick(group.name, l),
              subtitle: enslaved ? fill(pick(C.ageLine, l), { a: line.age }) : `${line.name} · ${fill(pick(C.ageLine, l), { a: line.age })} · ${line.birth}`,
              badge: pick(C.badge, l),
              lines: [pick(group.life, l)],
              footer: "oiyo.net · 1850",
              accent: "#1f3a5f",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
