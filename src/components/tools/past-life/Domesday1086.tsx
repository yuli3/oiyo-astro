import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { CLASSES, MILLS, PLACES, RECORDED, classById, drawClass, entryOf, formatDomesday, makeManor, oneIn, parseDomesday, type Manor } from "../../../lib/domesday-1086";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "domesday-1086" as const;

const C = {
  draw: { ko: "둠즈데이 북 속 나 찾기", en: "Find me in Domesday Book", ja: "ドゥームズデイ・ブックの中の私を探す", zh: "在末日审判书中找到我", fr: "Me trouver dans le Domesday Book", es: "Encontrarme en el Domesday Book" },
  again: { ko: "다시 뽑기", en: "Draw again", ja: "もう一度", zh: "再抽一次", fr: "Recommencer", es: "Otra vez" },
  heroKicker: { ko: "1086년 잉글랜드, 둠즈데이 북 속 나", en: "You in England's great survey, 1086", ja: "1086年イングランド、ドゥームズデイ・ブックの中の私", zh: "1086年英格兰，末日审判书中的我", fr: "Vous dans le grand inventaire de 1086", es: "Tú en el gran censo de Inglaterra, 1086" },
  entryTitle: { ko: "내가 사는 장원의 기록", en: "The entry for your manor", ja: "私の住む荘園の記録", zh: "我所在庄园的记录", fr: "L'article de votre manoir", es: "La entrada de tu feudo" },
  youAre: { ko: "나는 이 줄의 '{what}' {n}명 가운데 한 명이에요. 둠즈데이 북은 농민을 셌지만 이름은 적지 않았어요. 이름이 남은 건 땅을 가진 영주들뿐이에요.", en: "You are one of the {n} {what} in this line. Domesday counted peasants but never named them; only the landholders have names.", ja: "私はこの行の「{what}」{n}人のうちの一人。ドゥームズデイ・ブックは農民を数えましたが、名前は記しませんでした。名が残るのは土地を持つ領主だけです。", zh: "我是这一行“{what}”{n}人中的一个。末日审判书清点了农民，却没有写下名字；留下名字的只有领主。", fr: "Vous êtes l'un des {n} « {what} » de cette ligne. Le Domesday comptait les paysans sans jamais les nommer ; seuls les seigneurs ont un nom.", es: "Eres uno de los {n} «{what}» de esta línea. El Domesday contaba a los campesinos sin nombrarlos; solo los señores tienen nombre." },
  invented: { ko: "장원 이름·숫자·금액은 놀이용으로 지어낸 예시예요. 문장 형식은 현대 영어 번역본(필리모어판)의 말투를 따랐어요. 원본은 라틴어예요.", en: "The manor, its numbers and values are invented; the wording follows the modern Phillimore translation. The original is in Latin.", ja: "荘園名・数・金額は遊びのための架空の例です。文の形は現代英訳（フィリモア版）にならいました。原本はラテン語です。", zh: "庄园名称、数字和金额为游戏虚构；句式仿照现代英译本（Phillimore版），原本为拉丁文。", fr: "Manoir, chiffres et valeurs sont inventés ; la tournure suit la traduction Phillimore. L'original est en latin.", es: "Feudo, cifras y valores son inventados; la redacción sigue la traducción Phillimore. El original está en latín." },
  shareTitle: { ko: "둠즈데이 북에 기록된 26만 8,984명은 이렇게 나뉘었어요", en: "How the 268,984 people recorded were divided", ja: "記録された26万8984人の内訳", zh: "记录在册的268,984人的构成", fr: "Les 268 984 personnes recensées", es: "Las 268.984 personas registradas" },
  shareNote: { ko: "H. C. 다비의 집계예요. 한 사람이 한 가구의 가장이라, 실제 인구는 120만~160만 명으로 봐요.", en: "H. C. Darby's tallies. Each is a head of household, so England held perhaps 1.2–1.6 million people.", ja: "H・C・ダービーの集計。一人が一世帯の長なので、実際の人口は120万～160万人とみられます。", zh: "H. C. 达比的统计。每人代表一户户主，实际人口约120万至160万。", fr: "Décomptes de H. C. Darby ; chacun est un chef de foyer, pour 1,2 à 1,6 million d'habitants.", es: "Recuentos de H. C. Darby; cada uno es cabeza de familia, para 1,2 a 1,6 millones de habitantes." },
  me: { ko: "← 나", en: "← you", ja: "← 私", zh: "← 我", fr: "← vous", es: "← tú" },
  aboutTitle: { ko: "둠즈데이 북이란", en: "What was Domesday Book?", ja: "ドゥームズデイ・ブックとは", zh: "什么是末日审判书", fr: "Qu'est-ce que le Domesday Book ?", es: "¿Qué es el Domesday Book?" },
  about: { ko: "노르만 정복 20년 뒤, 정복왕 윌리엄이 잉글랜드의 모든 땅을 조사하게 했어요. 장원마다 1066년과 1086년의 주인, 땅의 크기, 쟁기, 농민 수, 목초지·숲·방앗간, 그리고 땅의 값을 적었어요. 앵글로색슨 연대기는 '소 한 마리, 돼지 한 마리도 빠뜨리지 않았다'고 투덜댔죠. 마을 {places}곳, 방앗간 {mills}개가 기록됐고, 런던·윈체스터와 북쪽 끝 몇 고을은 빠졌어요. 이름은 '최후의 심판의 날(둠즈데이)'처럼 뒤집을 수 없는 기록이라는 뜻이에요.", en: "Twenty years after the Conquest, William I had every holding in England surveyed: who held it in 1066 and in 1086, its size, its ploughs, its peasants, meadow, wood and mills, and what it was worth. The Anglo-Saxon Chronicle grumbled that not even an ox, a cow or a swine was left out. It names {places} places and {mills} mills; London, Winchester and the far north were never written up. People called it Domesday, the day of judgement, because there was no appeal against it.", ja: "ノルマン征服から20年後、ウィリアム1世はイングランドのすべての土地を調べさせました。荘園ごとに1066年と1086年の保有者、広さ、犂、農民の数、牧草地・森・水車、そして価値を記しました。アングロサクソン年代記は「牛一頭、豚一匹も漏らさなかった」とこぼしています。{places}の地名と{mills}の水車が記され、ロンドン・ウィンチェスターと北の果ては書かれませんでした。名は「最後の審判の日」、覆せない記録という意味です。", zh: "诺曼征服二十年后，威廉一世下令调查英格兰的每一块土地：1066年和1086年的持有人、面积、犁、农民人数、草地、林地、磨坊，以及价值。《盎格鲁-撒克逊编年史》抱怨说连一头牛、一头猪都没漏掉。书中记录了{places}个地名和{mills}座磨坊；伦敦、温切斯特和最北部未被写入。人们称它为“末日审判”，意思是不可推翻的记录。", fr: "Vingt ans après la Conquête, Guillaume Ier fait inventorier chaque domaine : détenteurs en 1066 et 1086, surface, charrues, paysans, prés, bois, moulins et valeur. La Chronique anglo-saxonne se plaint que pas un bœuf, une vache ou un porc n'y échappe. {places} lieux et {mills} moulins ; Londres, Winchester et l'extrême nord manquent. « Domesday », le jour du Jugement : un registre sans appel.", es: "Veinte años después de la Conquista, Guillermo I mandó inventariar cada propiedad: quién la tenía en 1066 y 1086, tamaño, arados, campesinos, prados, bosques, molinos y valor. La Crónica anglosajona se quejaba de que no se escapó ni un buey, ni una vaca, ni un cerdo. {places} lugares y {mills} molinos; faltan Londres, Winchester y el extremo norte. «Domesday», el día del Juicio: un registro sin apelación." },
  cardKicker: { ko: "1086 · 둠즈데이 북 속 나", en: "1086 · Me in Domesday Book", ja: "1086・ドゥームズデイ・ブックの中の私", zh: "1086·末日审判书中的我", fr: "1086 · Moi dans le Domesday Book", es: "1086 · Yo en el Domesday Book" },
  badge: { ko: "둠즈데이 북", en: "Domesday Book", ja: "ドゥームズデイ・ブック", zh: "末日审判书", fr: "Domesday Book", es: "Domesday Book" },
  src1: { ko: "위키백과: 둠즈데이 북", en: "Wikipedia: Domesday Book", ja: "ウィキペディア：ドゥームズデイ・ブック", zh: "维基百科：末日审判书", fr: "Wikipédia : Domesday Book", es: "Wikipedia: Domesday Book" },
  src2: { ko: "영국 국립기록원: 둠즈데이", en: "The National Archives: Domesday", ja: "英国国立公文書館：ドゥームズデイ", zh: "英国国家档案馆：末日审判书", fr: "The National Archives : Domesday", es: "The National Archives: Domesday" },
  src3: { ko: "오픈 둠즈데이(원문 지도)", en: "Open Domesday", ja: "オープン・ドゥームズデイ", zh: "Open Domesday", fr: "Open Domesday", es: "Open Domesday" },
  src4: { ko: "복스홀 역사: 1086년 브릭스턴 헌드레드의 노예", en: "Vauxhall History: slavery in the Brixton hundred, 1086", ja: "ヴォクスホール史：1086年の奴隷", zh: "沃克斯豪尔历史：1086年的奴隶", fr: "Vauxhall History : l'esclavage en 1086", es: "Vauxhall History: esclavitud en 1086" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Domesday1086({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [manor, setManor] = useState<Manor | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseDomesday(window.location.search);
    if (shared) setManor(shared);
  }, []);

  function draw(rand: () => number, how: string) {
    const next = makeManor(drawClass(rand), rand);
    funnel(how);
    warp.start(() => {
      setManor(next);
      setRound((r) => r + 1);
      setShareQuery(formatDomesday(next));
      stampEpisode(EP);
    });
  }

  const cls = manor ? classById(manor.cls) : null;
  const entry = manor ? entryOf(manor) : null;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1086} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, "random")}>
          {pick(manor ? C.again : C.draw, l)}
        </Button>
      )}

      {manor && cls && entry && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(cls.name, l)}</p>
            {/* No rarity badge for a slave result: a "how rare" score would make a game of it. */}
            {cls.id !== "slave" && (
              <div className="mt-3">
                <RarityBadge n={oneIn(cls)} l={l} fmt={fmt} />
              </div>
            )}
            <p className="mt-4 text-base leading-relaxed text-foreground">{pick(cls.life, l)}</p>
          </section>

          <Panel label={pick(C.entryTitle, l)}>
            <div className="timeslip-domesday" lang="en-GB">
              <p className="place">{entry.place}</p>
              <p>{entry.text}</p>
            </div>
            <p className="pt-3 text-sm leading-relaxed text-foreground">{fill(pick(C.youAre, l), { n: entry.count, what: cls.id === "other" ? "priest" : cls.plural })}</p>
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">{pick(C.invented, l)}</p>
          </Panel>

          <Panel label={pick(C.shareTitle, l)}>
            <ul className="space-y-1 text-sm">
              {CLASSES.map((c) => (
                <li key={c.id} className={c.id === manor.cls ? "font-bold text-primary" : "text-muted-foreground"}>
                  {pick(c.name, l)} {(c.permille / 10).toFixed(1)}%{c.id === manor.cls && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.shareNote, l)}</p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.about, l), { places: fmt.format(PLACES), mills: fmt.format(MILLS) })}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://en.wikipedia.org/wiki/Domesday_Book" },
              { label: pick(C.src2, l), url: "https://www.nationalarchives.gov.uk/domesday/" },
              { label: pick(C.src3, l), url: "https://opendomesday.org/" },
              { label: pick(C.src4, l), url: "https://vauxhallhistory.org/slavery-in-the-brixton-hundred-1086/" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-domesday-1086-${manor.cls}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: pick(cls.name, l),
              subtitle: entry.place,
              badge: pick(C.badge, l),
              lines: [pick(cls.life, l)],
              footer: `oiyo.net · 1086 · ${fmt.format(RECORDED)}`,
              accent: "#6b2a2a",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
