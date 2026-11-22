import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { CLASSES, DRAW_TOTAL, TOTAL_1872, classById, drawClass, entryOf, formatJinshin, makeHouse, oneIn, parseJinshin, type Entry, type House } from "../../../lib/jinshin-1872";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "jinshin-1872" as const;

const C = {
  draw: { ko: "1872년 호적에 오르기", en: "Enter the 1872 register", ja: "明治5年の戸籍に載る", zh: "登入1872年户籍", fr: "Entrer au registre de 1872", es: "Entrar en el registro de 1872" },
  again: { ko: "다른 집 호적 보기", en: "Another household", ja: "別の家の戸籍", zh: "换一户", fr: "Un autre foyer", es: "Otro hogar" },
  heroKicker: { ko: "1872년 일본 임신호적 속 우리 집", en: "Your household in Japan's 1872 Jinshin koseki", ja: "明治5年、壬申戸籍の中のわが家", zh: "1872年日本壬申户籍里的我家", fr: "Votre foyer dans le koseki Jinshin de 1872", es: "Tu hogar en el koseki Jinshin de 1872" },
  entryTitle: { ko: "호적의 우리 집 기록", en: "Your household's entry", ja: "戸籍のわが家の記録", zh: "户籍上的我家", fr: "L'inscription de votre foyer", es: "La inscripción de tu hogar" },
  entryNote: { ko: "임신호적은 나라 전체에 통일된 양식이 없어 지역마다 모양이 달랐어요. 이 기록은 주소·족칭(族稱)·직업·호주·식구·절·수호신(氏神)을 담은 재구성 예시예요. 이름·마을·나이는 놀이용으로 지어냈고, 평민의 직업은 농업 약 80%를 기준으로 고른 예시예요.", en: "There was no national standard form, so layouts varied by region. This is a reconstruction with the address, status (族称), occupation, head, family, temple and tutelary shrine (氏神). Names, places and ages are invented, and commoners' occupations assume roughly 80% farming.", ja: "壬申戸籍には全国統一の様式がなく、地域ごとに形が違いました。これは住所・族称・職業・戸主・家族・寺・氏神を入れた再構成の例です。名前・村・年齢は遊び用の架空で、平民の職業は農業約8割を目安にしています。", zh: "壬申户籍没有全国统一格式，各地样式不同。这是一份包含住址、族称、职业、户主、家人、寺院和氏神的重构示例；姓名、村落、年龄为虚构，平民职业以约八成务农为准。", fr: "Pas de formulaire national : la présentation variait. Ceci est une reconstitution (adresse, statut, métier, chef, famille, temple, sanctuaire). Noms, lieux et âges inventés ; environ 80 % de paysans chez les roturiers.", es: "No había formulario nacional: el diseño variaba. Esto es una reconstrucción (dirección, estatus, oficio, cabeza, familia, templo, santuario). Nombres, lugares y edades inventados; cerca del 80 % de campesinos entre los plebeyos." },
  shareTitle: { ko: "1872년 첫 전국 호적 집계", en: "The first national count, 1872", ja: "明治5年、初の全国戸籍集計", zh: "1872年首次全国户籍统计", fr: "Le premier décompte national, 1872", es: "El primer recuento nacional, 1872" },
  shareNote: { ko: "합계 {total}명(일본 전국 호적표). 황족 29명과 가라후토(사할린) 사람 2,358명은 뽑기에서 뺐어요.", en: "Total {total} (national koseki table). The 29 members of the imperial family and the 2,358 people of Karafuto (Sakhalin) are not drawn.", ja: "合計{total}人（日本全国戸籍表）。皇族29人と樺太人員2,358人は抽選から外しました。", zh: "合计{total}人（日本全国户籍表）。皇族29人与桦太（萨哈林）人员2,358人不参与抽取。", fr: "Total {total}. La famille impériale (29) et les habitants de Karafuto (2 358) ne sont pas tirés.", es: "Total {total}. La familia imperial (29) y los habitantes de Karafuto (2.358) no se sortean." },
  me: { ko: "← 우리 집", en: "← you", ja: "← わが家", zh: "← 我家", fr: "← vous", es: "← tú" },
  sealTitle: { ko: "왜 지금은 볼 수 없을까", en: "Why no one can read it today", ja: "なぜ今は見られないのか", zh: "为什么如今无法查阅", fr: "Pourquoi il est aujourd'hui scellé", es: "Por qué hoy está sellado" },
  seal: { ko: "1871년 '해방령'으로 신분 차별은 법에서 사라졌지만, 일부 호적에는 옛 차별 신분을 짐작하게 하는 표시가 남았어요. 이 기록이 결혼이나 취직 때 뒷조사에 쓰이자, 일본 법무성은 1968년 3월 29일 임신호적을 봉인하고 열람을 금지했어요. 이 놀이는 그런 신분을 결과로 뽑지 않아요. 차별 신분이었던 사람 대부분도 호적에는 평민으로 적혔다고 해요.", en: "The 1871 emancipation edict abolished outcast status in law, yet some entries kept marks that hinted at it. When the register was used for background checks before marriages and hiring, the Ministry of Justice sealed it on 29 March 1968. This game never draws such a status; most people of outcast descent were in fact entered simply as commoners.", ja: "1871年の解放令で身分差別は法から消えましたが、一部の戸籍には旧身分をうかがわせる記載が残りました。それが結婚や就職の身元調べに使われたため、法務省は1968年3月29日に壬申戸籍を封印し閲覧を禁じました。この遊びはそのような身分を結果として引きません。被差別部落の人々の多くも戸籍上は平民と記されていたといわれます。", zh: "1871年的“解放令”在法律上废除了贱民身份，但部分户籍仍留有暗示旧身份的记载。这些记录被用于婚嫁和求职的背景调查，日本法务省遂于1968年3月29日封存壬申户籍、禁止查阅。本游戏不会抽出这类身份；据说多数受歧视者在户籍上也只记为平民。", fr: "L'édit de 1871 abolit en droit le statut de paria, mais certaines inscriptions en gardaient la trace. Utilisé pour des enquêtes avant mariage ou embauche, le registre fut scellé le 29 mars 1968. Ce jeu ne tire jamais un tel statut.", es: "El edicto de 1871 abolió legalmente el estatus de paria, pero algunas inscripciones conservaban rastros. Usado en investigaciones antes de bodas o empleos, el registro fue sellado el 29 de marzo de 1968. Este juego nunca sortea ese estatus." },
  aboutTitle: { ko: "온 나라 사람을 한 장부에", en: "A whole country in one register", ja: "全国の人を一つの帳簿に", zh: "全国人口一册登记", fr: "Tout un pays dans un registre", es: "Todo un país en un registro" },
  about: { ko: "1871년 4월 호적법이 나오고, 1872년(임신년) 2월 1일부터 시행됐어요. 마을을 묶은 '구(區)'마다 호장(戶長)이 집집을 돌며 식구를 적었어요. 첫 집계는 {total}명이었어요. 평민은 1870년에 성을 쓸 수 있게 됐지만, 성이 꼭 있어야 하게 된 건 1875년이라, 이때는 성을 아직 정하지 않은 집도 있었을 거예요.", en: "The Family Register Act of April 1871 took effect on 1 February 1872, the year of jinshin. In each ward (区) a headman (戸長) went house to house writing down the family. The first total was {total}. Commoners could take surnames from 1870 but were not required to until 1875, so some households may still have had none.", ja: "1871年4月に戸籍法が出され、明治5年（壬申）2月1日に施行されました。区ごとに戸長が家々を回って家族を書き上げ、最初の集計は{total}人。平民は1870年に苗字を許されましたが、必ず名乗るのは1875年からで、まだ苗字を決めていない家もあったでしょう。", zh: "1871年4月颁布户籍法，1872年（壬申年）2月1日施行。各“区”的户长挨家挨户登记人口，首次统计为{total}人。平民1870年获准用姓，1875年起才必须有姓，当时或许还有人家没有定姓。", fr: "Loi d'avril 1871, en vigueur le 1er février 1872 (année jinshin). Dans chaque circonscription, un chef recensait les foyers : {total} au total. Les roturiers pouvaient prendre un nom depuis 1870, obligatoirement depuis 1875.", es: "Ley de abril de 1871, vigente desde el 1 de febrero de 1872 (año jinshin). En cada distrito un jefe anotaba los hogares: {total} en total. Los plebeyos podían tomar apellido desde 1870 y fue obligatorio en 1875." },
  cardKicker: { ko: "1872 · 임신호적 속 우리 집", en: "1872 · My Jinshin koseki entry", ja: "1872・壬申戸籍の中のわが家", zh: "1872·壬申户籍里的我家", fr: "1872 · Mon koseki Jinshin", es: "1872 · Mi koseki Jinshin" },
  badge: { ko: "임신호적 1872", en: "Jinshin koseki 1872", ja: "壬申戸籍 1872", zh: "壬申户籍 1872", fr: "Koseki 1872", es: "Koseki 1872" },
  src1: { ko: "위키백과(일본어): 임신호적", en: "Wikipedia (ja): Jinshin koseki", ja: "Wikipedia：壬申戸籍", zh: "维基百科（日语）：壬申户籍", fr: "Wikipédia (ja) : koseki Jinshin", es: "Wikipedia (ja): koseki Jinshin" },
  src2: { ko: "일본 국립공문서관: 그날의 기록", en: "National Archives of Japan", ja: "国立公文書館：あの日の記録", zh: "日本国立公文书馆", fr: "Archives nationales du Japon", es: "Archivo Nacional de Japón" },
  src3: { ko: "일본 총무성 통계국: 통계 150년 연표", en: "Statistics Bureau of Japan: 150 years timeline", ja: "総務省統計局：統計150年年表", zh: "日本总务省统计局：统计150年年表", fr: "Bureau statistique du Japon", es: "Oficina de Estadística de Japón" },
  src4: { ko: "일본 법무성: 호적 제도", en: "Ministry of Justice of Japan: koseki", ja: "法務省：戸籍", zh: "日本法务省：户籍", fr: "Ministère de la Justice du Japon", es: "Ministerio de Justicia de Japón" },
} satisfies Record<string, Six>;

const COL: Record<keyof Entry, Six> = {
  address: { ko: "주소", en: "Address", ja: "住所", zh: "住址", fr: "Adresse", es: "Dirección" },
  status: { ko: "족칭·직업", en: "Status and occupation", ja: "族称・職業", zh: "族称·职业", fr: "Statut et métier", es: "Estatus y oficio" },
  head: { ko: "호주", en: "Head", ja: "戸主", zh: "户主", fr: "Chef", es: "Cabeza" },
  wife: { ko: "처", en: "Wife", ja: "妻", zh: "妻", fr: "Épouse", es: "Esposa" },
  children: { ko: "자녀", en: "Children", ja: "子", zh: "子女", fr: "Enfants", es: "Hijos" },
  temple: { ko: "절 (종파)", en: "Temple", ja: "寺", zh: "寺院", fr: "Temple", es: "Templo" },
  shrine: { ko: "수호신 (氏神)", en: "Tutelary shrine", ja: "氏神", zh: "氏神", fr: "Sanctuaire", es: "Santuario" },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Jinshin1872({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [house, setHouse] = useState<House | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseJinshin(window.location.search);
    if (shared) setHouse(shared);
  }, []);

  function draw(rand: () => number, how: string) {
    const next = makeHouse(drawClass(rand), rand);
    funnel(how);
    warp.start(() => {
      setHouse(next);
      setRound((r) => r + 1);
      setShareQuery(formatJinshin(next));
      stampEpisode(EP);
    });
  }

  const cls = house ? classById(house.cls) : null;
  const entry = house ? entryOf(house) : null;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1872} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, "random")}>
          {pick(house ? C.again : C.draw, l)}
        </Button>
      )}

      {house && cls && entry && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(cls.name, l)}</p>
            <div className="mt-3">
              <RarityBadge n={oneIn(cls)} l={l} fmt={fmt} />
            </div>
            <p className="mt-3 text-sm font-bold text-foreground" lang="ja">{entry.address}</p>
            <p className="mt-3 text-base leading-relaxed text-foreground">{pick(cls.life, l)}</p>
          </section>

          <Panel label={pick(C.entryTitle, l)}>
            <dl className="timeslip-census" lang="ja">
              {(Object.keys(COL) as (keyof Entry)[]).filter((k) => entry[k]).map((k) => (
                <div key={k}>
                  <dt>{pick(COL[k], l)}</dt>
                  <dd>{entry[k]}</dd>
                </div>
              ))}
            </dl>
            <p className="pt-3 text-xs leading-relaxed text-muted-foreground">{pick(C.entryNote, l)}</p>
          </Panel>

          <Panel label={pick(C.shareTitle, l)}>
            <ul className="space-y-1 text-sm">
              {CLASSES.map((c) => (
                <li key={c.id} className={c.id === house.cls ? "font-bold text-primary" : "text-muted-foreground"}>
                  {pick(c.name, l)} {fmt.format(c.n)} ({((c.n / DRAW_TOTAL) * 100).toFixed(2)}%){c.id === house.cls && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">{fill(pick(C.shareNote, l), { total: fmt.format(TOTAL_1872) })}</p>
          </Panel>

          <Panel label={pick(C.sealTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.seal, l)}</p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.about, l), { total: fmt.format(TOTAL_1872) })}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://ja.wikipedia.org/wiki/壬申戸籍" },
              { label: pick(C.src2, l), url: "https://www.archives.go.jp/naj_news/11/anohi.html" },
              { label: pick(C.src3, l), url: "https://www.stat.go.jp/museum/toukei150/nenpyo/" },
              { label: pick(C.src4, l), url: "https://www.moj.go.jp/MINJI/minji36-02.html" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-jinshin-1872-${cls.id}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: entry.head.replace("戸主 ", ""),
              subtitle: pick(cls.name, l),
              badge: pick(C.badge, l),
              lines: [entry.address, entry.status, `${entry.temple} · ${entry.shrine}`],
              footer: `oiyo.net · 明治五年 · ${fmt.format(TOTAL_1872)}`,
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
