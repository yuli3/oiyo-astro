import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { ORDERS, POPULATION_EW, TOTAL, drawPerson, formatCensus1911, makePerson, oneIn, orderById, parseCensus1911, scheduleOf, type Person, type Schedule } from "../../../lib/census-1911";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "census-1911" as const;

const C = {
  draw: { ko: "1911년 센서스 밤으로", en: "Go to census night, 1911", ja: "1911年の国勢調査の夜へ", zh: "前往1911年普查之夜", fr: "Vers la nuit du recensement de 1911", es: "A la noche del censo de 1911" },
  again: { ko: "다른 집 조사표 보기", en: "Another household", ja: "別の家の調査票", zh: "换一户人家", fr: "Un autre foyer", es: "Otro hogar" },
  heroKicker: { ko: "1911년 4월 2일 밤, 잉글랜드·웨일스 센서스 속 나", en: "You on census night, 2 April 1911, England and Wales", ja: "1911年4月2日の夜、イングランド・ウェールズ国勢調査の中の私", zh: "1911年4月2日夜，英格兰和威尔士普查中的我", fr: "Vous, nuit du recensement du 2 avril 1911", es: "Tú en la noche del censo, 2 de abril de 1911" },
  sexM: { ko: "남자", en: "Male", ja: "男性", zh: "男", fr: "Homme", es: "Hombre" },
  sexF: { ko: "여자", en: "Female", ja: "女性", zh: "女", fr: "Femme", es: "Mujer" },
  oneOf: { ko: "10세 이상 {n}명 가운데 {k}명이 이 무리였어요.", en: "{k} of {n} people aged ten and over were in this group.", ja: "10歳以上{n}人のうち{k}人がこのグループでした。", zh: "十岁以上的{n}人中有{k}人属于这一类。", fr: "{k} des {n} personnes de dix ans et plus.", es: "{k} de las {n} personas de diez años o más." },
  lineTitle: { ko: "가구 조사표의 내 줄", en: "Your line on the household schedule", ja: "世帯調査票の私の行", zh: "住户普查表上的我这一行", fr: "Votre ligne sur le bulletin de ménage", es: "Tu línea en la hoja del hogar" },
  lineNote: { ko: "1911년은 가구주가 직접 쓴 조사표 원본이 남아 있는 첫 센서스예요. 결혼한 여성에게는 결혼 햇수와 낳은 자녀·살아 있는 자녀·죽은 자녀를 처음으로 물었어요. 이름·마을·나이·자녀 수는 놀이용으로 지어낸 예시예요.", en: "1911 is the first census whose original schedules, filled in by each householder, survive. It was also the first to ask married women how long they had been married and how many children were born alive, still living, or had died. Names, places, ages and children are invented for the game.", ja: "1911年は世帯主が自分で書いた調査票の原本が残る最初の国勢調査。既婚女性に結婚年数と、生まれた子・生きている子・亡くなった子の数を初めて尋ねました。名前・町・年齢・子の数は遊び用の架空の例です。", zh: "1911年是第一次保留住户亲手填写的原始表格的普查，也是第一次询问已婚女性结婚年数和生育、存活、夭折子女数。姓名、地点、年龄和子女数为虚构示例。", fr: "1911 est le premier recensement dont les bulletins remplis par les chefs de ménage sont conservés, et le premier à demander aux femmes mariées la durée du mariage et le nombre d'enfants nés vivants, vivants et décédés. Noms, lieux, âges et enfants sont inventés.", es: "1911 es el primer censo cuyas hojas originales, rellenadas por cada cabeza de familia, se conservan, y el primero que preguntó a las mujeres casadas los años de matrimonio y los hijos nacidos vivos, vivos y fallecidos. Nombres, lugares, edades e hijos son inventados." },
  orderTitle: { ko: "1911년 직업 대분류 (10세 이상)", en: "1911 occupational orders (aged 10+)", ja: "1911年の職業大分類（10歳以上）", zh: "1911年职业大类（10岁以上）", fr: "Grands groupes de métiers en 1911 (10 ans et plus)", es: "Grandes grupos de oficios en 1911 (10 años o más)" },
  orderNote: { ko: "Vision of Britain의 1911년 직업 대분류 표(천 명 단위)예요. 큰 무리 9개만 따로 보이고 나머지는 '그 밖의 일'로 묶었어요. 직업이 없는 남자(학생·은퇴자)는 표에 수가 없어 뺐어요.", en: "1911 occupational orders from Vision of Britain, in thousands. The nine largest are shown and the rest grouped as other work. Men with no occupation (schoolboys, retired) are left out because the table gives no count.", ja: "Vision of Britainの1911年職業大分類表（千人単位）。大きい9つを示し、残りは「その他」にまとめました。職業のない男性（学生・引退者）は数がないため除きました。", zh: "数据来自Vision of Britain的1911年职业大类表（单位千人），只列出最大的9类，其余并为“其他”。无职业男性（学生、退休者）因表中无数字而未计入。", fr: "Grands groupes de 1911 d'après Vision of Britain, en milliers ; les neuf plus grands, le reste regroupé. Les hommes sans profession ne sont pas comptés, faute de chiffre.", es: "Grandes grupos de 1911 según Vision of Britain, en miles; los nueve mayores y el resto agrupado. Los hombres sin ocupación no se cuentan por falta de cifra." },
  men: { ko: "남", en: "M", ja: "男", zh: "男", fr: "H", es: "H" },
  women: { ko: "여", en: "F", ja: "女", zh: "女", fr: "F", es: "M" },
  me: { ko: "← 나", en: "← you", ja: "← 私", zh: "← 我", fr: "← vous", es: "← tú" },
  boycottTitle: { ko: "\"투표권이 없으면 조사도 없다\"", en: "\"No vote, no census\"", ja: "「投票権なくして調査なし」", zh: "“没有选票，就没有普查”", fr: "« No vote, no census »", es: "«No vote, no census»" },
  boycott: { ko: "그날 밤 여성 참정권 운동가들은 조사를 거부했어요. 퍼트니 히스에서 캠핑을 하고, 런던 앨드위치 스케이트장에서 밤새 롤러스케이트를 탔어요. 소피아 둘립 싱 공주는 조사표에 \"여자는 셈에 들지 않으니, 세어지기를 거부한다\"라고 적었어요. 에밀리 와일딩 데이비슨은 국회의사당 지하 예배당 벽장에 숨어, 조사표에 '웨스트민스터 홀 지하에 숨어 있다 발견됨'으로 적혔어요. 몇 명이 거부했는지는 믿을 만한 집계가 없어요.", en: "That night suffragettes refused to be counted. They camped on Putney Heath and roller-skated all night at the Aldwych rink. Princess Sophia Duleep Singh wrote across her form: \"No vote, no census, as women do not count, they refuse to be counted.\" Emily Wilding Davison hid in a cupboard in the chapel under the Houses of Parliament and was recorded as \"Found hiding in crypt of Westminster Hall\". There is no reliable count of how many refused.", ja: "その夜、女性参政権運動家たちは調査を拒みました。パトニー・ヒースで野営し、ロンドンのオールドウィッチのスケート場で夜通し滑りました。ソフィア・デュリープ・シン王女は調査票に「女は数に入らないのだから、数えられることを拒む」と書き、エミリー・ワイルディング・デイヴィソンは国会議事堂地下の礼拝堂の物置に隠れ「ウェストミンスター・ホールの地下で隠れているのを発見」と記録されました。拒否した人数の信頼できる集計はありません。", zh: "那一夜，争取选举权的女性拒绝被统计。她们在帕特尼荒地露营，在伦敦奥德维奇溜冰场通宵溜冰。索菲亚·杜利普·辛格公主在表上写道：“女性不算数，所以拒绝被计数。”艾米莉·怀尔丁·戴维森藏在议会大厦地下礼拜堂的壁橱里，被记为“在威斯敏斯特厅地下室被发现藏匿”。拒绝人数没有可靠统计。", fr: "Cette nuit-là, des suffragettes refusèrent d'être comptées : camping à Putney Heath, patins à roulettes toute la nuit à l'Aldwych. La princesse Sophia Duleep Singh écrivit : « No vote, no census, as women do not count, they refuse to be counted. » Emily Wilding Davison, cachée dans un placard de la chapelle sous le Parlement, fut inscrite « Found hiding in crypt of Westminster Hall ». Aucun décompte fiable des refus n'existe.", es: "Esa noche, las sufragistas se negaron a ser contadas: acamparon en Putney Heath y patinaron toda la noche en el Aldwych. La princesa Sophia Duleep Singh escribió: «No vote, no census, as women do not count, they refuse to be counted.» Emily Wilding Davison, escondida en un armario de la capilla bajo el Parlamento, fue anotada como «Found hiding in crypt of Westminster Hall». No hay un recuento fiable de cuántas se negaron." },
  boycottOn: { ko: "나도 조사를 거부하기", en: "Refuse to be counted", ja: "私も調査を拒む", zh: "我也拒绝被统计", fr: "Refuser d'être comptée", es: "Negarme a ser contada" },
  boycottOff: { ko: "조사표에 다시 적기", en: "Fill in the form after all", ja: "やはり調査票に書く", zh: "还是填写表格", fr: "Remplir quand même", es: "Rellenarla al final" },
  boycottLine: { ko: "내 칸에는 이렇게 적혀요", en: "Your line now reads", ja: "私の欄にはこう書かれます", zh: "你这一栏写着", fr: "Votre ligne indique", es: "Tu línea dice" },
  aboutTitle: { ko: "1911년, 3,607만 명의 밤", en: "1911: one night, 36 million people", ja: "1911年、3607万人の夜", zh: "1911年，3607万人的一夜", fr: "1911 : une nuit, 36 millions de personnes", es: "1911: una noche, 36 millones de personas" },
  about: { ko: "센서스는 4월 2일 일요일 밤, 그 집에서 잠든 모든 사람을 셌어요. 잉글랜드·웨일스 인구는 {pop}명이었어요. 조사표는 원래 100년 뒤인 2012년에 공개될 예정이었지만, 정보공개 청구 덕분에 2009년 1월에 앞당겨 공개됐어요. 지금은 누구나 집안 어른의 손글씨를 찾아볼 수 있어요.", en: "The census counted everyone who slept in each home on the night of Sunday 2 April. England and Wales had {pop} people. The schedules were due to open after a hundred years, in 2012, but a freedom-of-information request brought them out in January 2009. Today anyone can look up a great-grandparent's handwriting.", ja: "国勢調査は4月2日日曜の夜、その家で眠ったすべての人を数えました。イングランド・ウェールズの人口は{pop}人。調査票は100年後の2012年に公開予定でしたが、情報公開請求により2009年1月に前倒しで公開されました。", zh: "普查统计4月2日星期日夜里在每户过夜的所有人。英格兰和威尔士人口为{pop}人。原定百年后的2012年公开，因信息公开申请提前到2009年1月公开。", fr: "Le recensement comptait chaque personne ayant dormi au foyer la nuit du dimanche 2 avril : {pop} habitants en Angleterre et au pays de Galles. Prévus pour 2012, les bulletins furent ouverts dès janvier 2009 après une demande d'accès à l'information.", es: "El censo contó a todos los que durmieron en cada casa la noche del domingo 2 de abril: {pop} personas en Inglaterra y Gales. Previstas para 2012, las hojas se abrieron en enero de 2009 tras una solicitud de acceso a la información." },
  cardKicker: { ko: "1911 · 영국 센서스 속 나", en: "1911 · Me in the census", ja: "1911・英国国勢調査の中の私", zh: "1911·英国普查中的我", fr: "1911 · Moi au recensement", es: "1911 · Yo en el censo" },
  badge: { ko: "센서스 1911", en: "Census 1911", ja: "国勢調査 1911", zh: "普查 1911", fr: "Recensement 1911", es: "Censo 1911" },
  src1: { ko: "Vision of Britain: 1911 직업 대분류(남녀)", en: "Vision of Britain: 1911 occupational orders by sex", ja: "Vision of Britain：1911年職業大分類", zh: "Vision of Britain：1911年职业大类", fr: "Vision of Britain : groupes de métiers 1911", es: "Vision of Britain: grupos de oficios 1911" },
  src2: { ko: "IPUMS: 1911 가구 조사표 원본", en: "IPUMS: 1911 household schedule", ja: "IPUMS：1911年世帯調査票", zh: "IPUMS：1911年住户普查表", fr: "IPUMS : bulletin de ménage 1911", es: "IPUMS: hoja del hogar 1911" },
  src3: { ko: "영국 국립기록원: No vote, no census", en: "The National Archives: No vote, no census", ja: "英国国立公文書館：No vote, no census", zh: "英国国家档案馆：No vote, no census", fr: "The National Archives : No vote, no census", es: "The National Archives: No vote, no census" },
  src4: { ko: "영국 의회: 에밀리 와일딩 데이비슨의 조사표", en: "UK Parliament: Emily Wilding Davison's census form", ja: "英国議会：デイヴィソンの調査票", zh: "英国议会：戴维森的普查表", fr: "Parlement britannique : le bulletin d'E. W. Davison", es: "Parlamento británico: la hoja de E. W. Davison" },
} satisfies Record<string, Six>;

const COL: Record<keyof Schedule, Six> = {
  name: { ko: "이름", en: "Name and surname", ja: "氏名", zh: "姓名", fr: "Nom", es: "Nombre" },
  relation: { ko: "가구주와의 관계", en: "Relationship to head", ja: "世帯主との続柄", zh: "与户主关系", fr: "Lien avec le chef", es: "Relación con el cabeza" },
  age: { ko: "나이", en: "Age last birthday", ja: "年齢", zh: "年龄", fr: "Âge", es: "Edad" },
  marriage: { ko: "결혼 상태", en: "Particulars as to marriage", ja: "婚姻", zh: "婚姻状况", fr: "État matrimonial", es: "Estado civil" },
  years: { ko: "결혼 햇수", en: "Completed years of marriage", ja: "結婚年数", zh: "结婚年数", fr: "Années de mariage", es: "Años de matrimonio" },
  born: { ko: "낳은 자녀", en: "Children born alive", ja: "生まれた子", zh: "活产子女", fr: "Enfants nés vivants", es: "Hijos nacidos vivos" },
  living: { ko: "살아 있는 자녀", en: "Children still living", ja: "生存している子", zh: "存活子女", fr: "Enfants vivants", es: "Hijos vivos" },
  died: { ko: "죽은 자녀", en: "Children who have died", ja: "亡くなった子", zh: "夭折子女", fr: "Enfants décédés", es: "Hijos fallecidos" },
  occupation: { ko: "직업", en: "Personal occupation", ja: "職業", zh: "职业", fr: "Profession", es: "Ocupación" },
  industry: { ko: "업종", en: "Industry or service", ja: "業種", zh: "行业", fr: "Branche", es: "Rama" },
  status: { ko: "고용주·피고용인·자영", en: "Employer, worker or own account", ja: "雇用主・被雇用者・自営", zh: "雇主/雇员/自营", fr: "Patron, salarié, à son compte", es: "Patrón, asalariado o por cuenta propia" },
  atHome: { ko: "집에서 일하는지", en: "Working at home", ja: "自宅で働くか", zh: "是否在家工作", fr: "Travaille à domicile", es: "Trabaja en casa" },
  birthplace: { ko: "출생지", en: "Birthplace", ja: "出生地", zh: "出生地", fr: "Lieu de naissance", es: "Lugar de nacimiento" },
};

const REFUSAL = "No vote, no census.";

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Census1911({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [person, setPerson] = useState<Person | null>(null);
  const [boycott, setBoycott] = useState(false);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseCensus1911(window.location.search);
    if (shared) setPerson(shared);
  }, []);

  function draw(rand: () => number, how: string) {
    const { order, sex } = drawPerson(rand);
    const next = makePerson(order, sex, rand);
    funnel(how);
    warp.start(() => {
      setPerson(next);
      setBoycott(false);
      setRound((r) => r + 1);
      setShareQuery(formatCensus1911(next));
      stampEpisode(EP);
    });
  }

  const order = person ? orderById(person.order) : null;
  const sched = person ? scheduleOf(person) : null;
  const female = person?.sex === "f";
  const refused = female && boycott;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1911} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, "random")}>
          {pick(person ? C.again : C.draw, l)}
        </Button>
      )}

      {person && order && sched && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(order.name, l)}</p>
            <p className="mt-1 text-sm font-bold text-muted-foreground">{pick(female ? C.sexF : C.sexM, l)}</p>
            <div className="mt-3">
              <RarityBadge n={oneIn(order, person.sex)} l={l} fmt={fmt} />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{fill(pick(C.oneOf, l), { n: fmt.format(TOTAL * 1000), k: fmt.format((female ? order.f : order.m) * 1000) })}</p>
            <p className="mt-3 text-base leading-relaxed text-foreground">{pick(order.life, l)}</p>
          </section>

          <Panel label={pick(C.lineTitle, l)}>
            <dl className="timeslip-census" lang="en">
              {(Object.keys(COL) as (keyof Schedule)[]).map((k) => (
                <div key={k}>
                  <dt>{pick(COL[k], l)}</dt>
                  <dd>{refused ? (k === "name" ? REFUSAL : "") : sched[k]}</dd>
                </div>
              ))}
            </dl>
            <p className="pt-3 text-xs leading-relaxed text-muted-foreground">{pick(C.lineNote, l)}</p>
          </Panel>

          {female && (
            <Panel label={pick(C.boycottTitle, l)}>
              <p className="text-sm leading-relaxed">{pick(C.boycott, l)}</p>
              {refused && (
                <p className="pt-2 text-sm font-bold text-primary">
                  {pick(C.boycottLine, l)}: <span lang="en">{REFUSAL}</span>
                </p>
              )}
              <Button variant="outline" className="mt-3 w-full" aria-pressed={boycott} onClick={() => setBoycott((b) => !b)}>
                {pick(boycott ? C.boycottOff : C.boycottOn, l)}
              </Button>
            </Panel>
          )}

          <Panel label={pick(C.orderTitle, l)}>
            <ul className="space-y-1 text-sm">
              {ORDERS.map((o) => (
                <li key={o.id} className={o.id === person.order ? "font-bold text-primary" : "text-muted-foreground"}>
                  {pick(o.name, l)}: {pick(C.men, l)} {fmt.format(o.m * 1000)} · {pick(C.women, l)} {fmt.format(o.f * 1000)}
                  {o.id === person.order && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.orderNote, l)}</p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.about, l), { pop: fmt.format(POPULATION_EW) })}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://visionofbritain.org.uk/unit/10001043/cube/OCC_ORD1911_SEX" },
              { label: pick(C.src2, l), url: "https://international.ipums.org/international-action/source_documents/enum_form_uk1911a_tag.xml" },
              { label: pick(C.src3, l), url: "https://blog.nationalarchives.gov.uk/no-vote-no-census-the-1911-suffrage-census-protests" },
              { label: pick(C.src4, l), url: "https://www.parliament.uk/about/living-heritage/transformingsociety/electionsvoting/womenvote/case-studies-women-parliament/ewd/1911-census-form/" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-census-1911-${order.id}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: refused ? REFUSAL : sched.name,
              subtitle: pick(order.name, l),
              badge: pick(C.badge, l),
              lines: refused
                ? ["\"As women do not count, they refuse to be counted.\"", "2 April 1911"]
                : [`${sched.relation} · ${sched.age} · ${sched.marriage}`, sched.occupation || "—", sched.birthplace],
              footer: `oiyo.net · 1911 · ${fmt.format(POPULATION_EW)}`,
              accent: "#5a2a3a",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
