import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { CATEGORIES, LI_HEADS, LI_SIZE, PLACES, POPULATION_1393, W_TOTAL, categoryById, drawCategory, entryOf, formatHuangce, makeHousehold, parseHuangce, type Household } from "../../../lib/huangce-1391";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "huangce-1391" as const;

const C = {
  draw: { ko: "1391년 황책에 오르기", en: "Enter the 1391 register", ja: "1391年の黄冊に載る", zh: "登入1391年黄册", fr: "Entrer au registre de 1391", es: "Entrar en el registro de 1391" },
  again: { ko: "다른 집 황책 보기", en: "Another household", ja: "別の家の黄冊", zh: "换一户", fr: "Un autre foyer", es: "Otro hogar" },
  heroKicker: { ko: "1391년 명나라 황책 속 우리 집", en: "Your household in the 1391 Ming Yellow Register", ja: "1391年、明の黄冊の中のわが家", zh: "1391年明代黄册里的我家", fr: "Votre foyer dans le registre jaune des Ming, 1391", es: "Tu hogar en el registro amarillo Ming, 1391" },
  head: { ko: "올해 우리 집은 이장(里長)이에요", en: "This year your household is the li head (里长)", ja: "今年わが家は里長です", zh: "今年我家当里长", fr: "Cette année, votre foyer est chef de li (里长)", es: "Este año tu hogar es jefe del li (里长)" },
  member: { ko: "우리 집은 갑수(甲首) 열 집 중 하나예요", en: "Your household is one of ten in a jia (甲首)", ja: "わが家は甲首10戸の一つです", zh: "我家是一甲十户中的甲首户", fr: "Votre foyer est l'un des dix d'un jia (甲首)", es: "Tu hogar es uno de los diez de un jia (甲首)" },
  entryTitle: { ko: "황책의 우리 집 기록 (사주식)", en: "Your household's entry (four columns)", ja: "黄冊のわが家の記録（四柱式）", zh: "黄册上的我家（四柱式）", fr: "L'inscription de votre foyer (quatre colonnes)", es: "La inscripción de tu hogar (cuatro columnas)" },
  entryNote: { ko: "실제 황책은 집마다 구관(舊管, 지난번 기록)·신수(新收, 새로 들어옴)·개제(開除, 빠짐)·실재(實在, 지금)를 적고, 남자는 16~60세 성정(成丁)과 그 밖의 불성정으로, 여자는 대구·소구로 나눴어요. 숫자는 고치기 어렵게 壹·贰·叁 같은 갖은자로 썼어요. 이름·마을·식구·재산은 놀이용으로 지어낸 예시예요.", en: "Real registers recorded each household in four columns: 旧管 (last time), 新收 (added), 开除 (removed) and 实在 (now). Men were split into 成丁 (16 to 60) and the rest, women into adults and children, and numbers were written in hard-to-alter formal numerals (壹, 贰, 叁…). Names, places, family and property are invented for the game.", ja: "実際の黄冊は戸ごとに旧管・新収・開除・実在の四柱で書き、男子は16〜60歳の成丁と不成丁、女子は大口・小口に分けました。数字は改ざんしにくい壹・贰・叁などの大字。名前・村・家族・財産は遊び用の架空の例です。", zh: "真实黄册每户按旧管、新收、开除、实在四柱登记，男子分成丁（十六至六十岁）与不成丁，妇女分大口、小口，数字用不易涂改的大写（壹贰叁……）。姓名、乡里、人口和产业为虚构示例。", fr: "Les vrais registres notaient chaque foyer en quatre colonnes : 旧管 (précédent), 新收 (ajouts), 开除 (retraits), 实在 (actuel), hommes de 16 à 60 ans (成丁) à part, chiffres en numéraux formels difficiles à falsifier. Noms, lieux, famille et biens sont inventés.", es: "Los registros reales anotaban cada hogar en cuatro columnas: 旧管 (anterior), 新收 (altas), 开除 (bajas) y 实在 (actual), con los hombres de 16 a 60 años (成丁) aparte y cifras en numerales formales difíciles de alterar. Nombres, lugares, familia y bienes son inventados." },
  colOld: { ko: "구관 (지난 기록)", en: "旧管 · last register", ja: "旧管（前回）", zh: "旧管", fr: "旧管 · précédent", es: "旧管 · anterior" },
  colNew: { ko: "신수 (새로 들어옴)", en: "新收 · added", ja: "新収（増加）", zh: "新收", fr: "新收 · ajouts", es: "新收 · altas" },
  colGone: { ko: "개제 (빠짐)", en: "开除 · removed", ja: "開除（減少）", zh: "开除", fr: "开除 · retraits", es: "开除 · bajas" },
  colNow: { ko: "실재 (지금)", en: "实在 · now", ja: "実在（現在）", zh: "实在", fr: "实在 · actuel", es: "实在 · actual" },
  colProp: { ko: "사산 (재산)", en: "事产 · property", ja: "事産（財産）", zh: "事产", fr: "事产 · biens", es: "事产 · bienes" },
  lijiaTitle: { ko: "110집이 한 마을, 이갑제", en: "110 households to a li: the lijia system", ja: "110戸で1里、里甲制", zh: "一百一十户为一里：里甲制", fr: "110 foyers par li : le lijia", es: "110 hogares por li: el lijia" },
  lijia: { ko: "명나라는 {n}집을 한 리(里)로 묶었어요. 식구와 땅이 많은 {h}집이 해마다 돌아가며 이장을 맡고, 나머지 100집은 10집씩 10갑으로 나뉘어 한 해에 한 갑씩 세금 걷기와 마을 일을 맡았어요. 10년에 한 바퀴를 돌면 다시 황책을 새로 만들었어요.", en: "The Ming grouped {n} households into a li. The {h} largest took turns as li head each year, and the other 100 formed ten jia of ten, one jia serving each year to collect taxes and keep order. When the ten-year cycle came round, the register was compiled anew.", ja: "明は{n}戸を1里にまとめました。人と土地の多い{h}戸が毎年交代で里長を務め、残り100戸は10戸ずつ10甲に分かれ、毎年1甲ずつ徴税や村の務めを担いました。10年で一巡すると黄冊を作り直しました。", zh: "明朝以{n}户为一里，推丁粮多者{h}户轮流充当里长，其余百户分为十甲，每甲十户，每年一甲应役催征。十年一轮，黄册随之重造。", fr: "Les Ming regroupaient {n} foyers en un li : les {h} plus riches étaient tour à tour chefs, les 100 autres formaient dix jia de dix, un jia servant chaque année. Tous les dix ans, le registre était refait.", es: "Los Ming agrupaban {n} hogares en un li: los {h} más ricos se turnaban como jefes y los otros 100 formaban diez jia de diez, uno por año. Cada diez años se rehacía el registro." },
  catTitle: { ko: "대물림되는 호적", en: "Hereditary household status", ja: "世襲の戸籍", zh: "世袭的户籍", fr: "Un statut héréditaire", es: "Una condición hereditaria" },
  catNote: { ko: "명 초 군호는 전체의 약 20%, 군호와 장호를 합치면 약 23%로 봐요(연구자 추산). 이를 바탕으로 민 77·군 20·장 3으로 뽑아요. 소금을 굽는 조호(灶戶), 유호·의호, 승려·도사 같은 호적도 있었지만 믿을 만한 비율이 없어 뽑기에서는 뺐어요. 호적은 바꿀 수 없었어요.", en: "Military households were about 20% in the early Ming, and military plus artisan about 23% (a scholar's estimate), so the draw uses civilian 77, military 20, artisan 3. Salt-making (灶户), Confucian, physician and clergy households also existed but have no reliable share, so they are not drawn. Status could not be changed.", ja: "明初の軍戸は約20%、軍戸と匠戸の合計は約23%（研究者の推計）。そこで民77・軍20・匠3で引きます。塩を作る灶戸、儒戸・医戸、僧・道士の戸籍もありましたが、信頼できる比率がないため除きました。戸籍は変えられませんでした。", zh: "明初军户约占20%，军匠合计约23%（学者估算），故按民77、军20、匠3抽取。灶户、儒户、医户及僧道等户籍也存在，但缺乏可靠比例，未纳入抽取。户籍不得更改。", fr: "Environ 20 % de foyers militaires au début des Ming, 23 % avec les artisans (estimation) : tirage civil 77, militaire 20, artisan 3. Sauniers (灶户), lettrés, médecins et clergé existaient mais sans part fiable. Le statut était immuable.", es: "Cerca del 20 % de hogares militares a inicios de los Ming, 23 % con los artesanos (estimación): sorteo civil 77, militar 20, artesano 3. Salineros (灶户), letrados, médicos y clero existían, pero sin cifras fiables. La condición era inmutable." },
  me: { ko: "← 우리 집", en: "← you", ja: "← わが家", zh: "← 我家", fr: "← vous", es: "← tú" },
  aboutTitle: { ko: "호수 위 섬에 쌓인 170만 권", en: "1.7 million volumes on a lake island", ja: "湖の島に積まれた170万冊", zh: "湖心岛上的一百七十万册", fr: "1,7 million de volumes sur une île", es: "1,7 millones de volúmenes en una isla" },
  about: { ko: "황책은 1381년에 처음, 1391년에 두 번째로 만들어졌고 1642년까지 10년마다 다시 만들어졌어요. 호부에 올라간 책은 표지가 노란색이라 '황책'이라 불렀어요. 책은 남경 현무호(후호) 섬의 창고에 보관했는데, 불을 막으려고 섬에서는 등불도 못 켜게 했어요. 명 말에는 170만 권이 넘었지만 1645년 전란 때 거의 다 사라졌어요. 1393년 인구는 {pop}명이었어요.", en: "The registers were first compiled in 1381, again in 1391, then every ten years to 1642; the copies sent to the Ministry of Revenue had yellow covers. They were kept in storehouses on the islands of Xuanwu Lake (Houhu) in Nanjing, where even lamps were banned to prevent fire. By the late Ming there were more than 1.7 million volumes; almost all were lost in the fighting of 1645. The 1393 count was {pop} people.", ja: "黄冊は1381年に初めて、1391年に2回目が作られ、1642年まで10年ごとに作り直されました。戸部に上げる冊は表紙が黄色でした。南京・玄武湖（後湖）の島の倉庫に保管され、火を防ぐため島では灯りも禁止。明末には170万冊を超えましたが、1645年の戦乱でほぼ失われました。1393年の人口は{pop}人。", zh: "黄册1381年首造，1391年再造，此后每十年一造，直到1642年；上呈户部的册子封面为黄色。册籍藏于南京玄武湖（后湖）湖心岛的册库，岛上禁止烟火。明末逾一百七十万册，1645年战乱中几乎全部毁失。1393年人口{pop}人。", fr: "Registres compilés en 1381, puis 1391, puis tous les dix ans jusqu'en 1642 ; les exemplaires envoyés au ministère avaient une couverture jaune. Conservés sur les îles du lac Xuanwu à Nankin, où même les lampes étaient interdites, plus de 1,7 million de volumes furent presque tous perdus en 1645. En 1393 : {pop} habitants.", es: "Compilados en 1381, de nuevo en 1391 y luego cada diez años hasta 1642; las copias del ministerio tenían cubierta amarilla. Guardados en las islas del lago Xuanwu de Nankín, donde hasta las lámparas estaban prohibidas, más de 1,7 millones de volúmenes se perdieron casi todos en 1645. En 1393: {pop} personas." },
  cardKicker: { ko: "1391 · 명나라 황책 속 우리 집", en: "1391 · My Ming Yellow Register entry", ja: "1391・明の黄冊の中のわが家", zh: "1391·明代黄册里的我家", fr: "1391 · Mon foyer au registre jaune", es: "1391 · Mi hogar en el registro amarillo" },
  badge: { ko: "황책 1391", en: "Yellow Register 1391", ja: "黄冊 1391", zh: "黄册 1391", fr: "Registre jaune 1391", es: "Registro amarillo 1391" },
  src1: { ko: "위키백과: 황책(Yellow Registers)", en: "Wikipedia: Yellow Registers", ja: "Wikipedia：黄冊", zh: "维基百科：黄册", fr: "Wikipédia : registres jaunes", es: "Wikipedia: registros amarillos" },
  src2: { ko: "栾成显: 명청 호적 제도와 문서", en: "Luan Chengxian: Ming–Qing household registers", ja: "欒成顕：明清戸籍制度と文書", zh: "栾成显：明清户籍制度的演变与其所造文书", fr: "Luan Chengxian : registres Ming-Qing", es: "Luan Chengxian: registros Ming-Qing" },
  src3: { ko: "叶锦花: 명대 호적 제도의 '상'과 '변'", en: "Ye Jinhua: continuity and change in Ming household registration", ja: "葉錦花：明代戸籍制度の「常」と「変」", zh: "叶锦花：明代户籍制度中的“常”与“变”", fr: "Ye Jinhua : le registre des Ming", es: "Ye Jinhua: el registro de los Ming" },
  src4: { ko: "위키백과: 명나라 군대(군호 비율)", en: "Wikipedia: Ming army (military households)", ja: "Wikipedia：明軍", zh: "维基百科：明朝军队", fr: "Wikipédia : armée Ming", es: "Wikipedia: ejército Ming" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Huangce1391({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [house, setHouse] = useState<Household | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseHuangce(window.location.search);
    if (shared) setHouse(shared);
  }, []);

  function draw(rand: () => number, how: string) {
    const next = makeHousehold(drawCategory(rand), rand);
    funnel(how);
    warp.start(() => {
      setHouse(next);
      setRound((r) => r + 1);
      setShareQuery(formatHuangce(next));
      stampEpisode(EP);
    });
  }

  const cat = house ? categoryById(house.cat) : null;
  const entry = house ? entryOf(house) : null;
  const cols: [Six, string[]][] = entry ? [[C.colOld, entry.old], [C.colNew, entry.neu], [C.colGone, entry.gone], [C.colNow, entry.now], [C.colProp, entry.property]] : [];

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1391} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, "random")}>
          {pick(house ? C.again : C.draw, l)}
        </Button>
      )}

      {house && cat && entry && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(cat.name, l)}</p>
            <div className="mt-3">
              <RarityBadge n={Math.round(W_TOTAL / cat.w)} l={l} fmt={fmt} />
            </div>
            <p className="mt-3 text-sm font-bold text-foreground">
              <span lang="zh">{PLACES[house.place]}</span> · {pick(house.head ? C.head : C.member, l)}
            </p>
            <p className="mt-3 text-base leading-relaxed text-foreground">{pick(cat.duty, l)}</p>
          </section>

          <Panel label={pick(C.entryTitle, l)}>
            <p className="font-bold text-foreground" lang="zh">{entry.title}</p>
            <dl className="timeslip-census" lang="zh">
              {cols.map(([label, lines]) => (
                <div key={label.en}>
                  <dt>{pick(label, l)}</dt>
                  <dd>{lines.join(" / ")}</dd>
                </div>
              ))}
            </dl>
            <p className="pt-3 text-xs leading-relaxed text-muted-foreground">{pick(C.entryNote, l)}</p>
          </Panel>

          <Panel label={pick(C.lijiaTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.lijia, l), { n: LI_SIZE, h: LI_HEADS })}</p>
          </Panel>

          <Panel label={pick(C.catTitle, l)}>
            <ul className="space-y-1 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.id} className={c.id === house.cat ? "font-bold text-primary" : "text-muted-foreground"}>
                  {pick(c.name, l)} {c.w}%{c.id === house.cat && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.catNote, l)}</p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.about, l), { pop: fmt.format(POPULATION_1393) })}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://en.wikipedia.org/wiki/Yellow_Registers" },
              { label: pick(C.src2, l), url: "https://ming.cnhis.ncnu.edu.tw/wp-content/uploads/2007/10/Pp19.pdf" },
              { label: pick(C.src3, l), url: "https://www.cssn.cn/skgz/bwyc/202411/t20241127_5805279.shtml" },
              { label: pick(C.src4, l), url: "https://en.wikipedia.org/wiki/Ming_army" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-huangce-1391-${cat.id}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: entry.title.split("系")[0]!.replace("一户", ""),
              subtitle: pick(cat.name, l),
              badge: pick(C.badge, l),
              lines: [PLACES[house.place]!, entry.now[0]!, entry.property.join(" · ")],
              footer: `oiyo.net · 1391 · ${house.head ? "里长" : "甲首"}`,
              accent: "#8a6a12",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
