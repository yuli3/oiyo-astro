import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { ADMITTED_FY1907, APPLIED_FY1907, ELLIS_1907, ORIGINS, OVER_50_SHARE, RECORD_DAY, TOTAL, TURNED_BACK_FY1907, drawOrigin, formatEllis, makePassenger, manifestLine, oneIn, originById, parseEllis, type ManifestLine, type Passenger } from "../../../lib/ellis-1907";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "ellis-1907" as const;

const C = {
  draw: { ko: "1907년 배에 오르기", en: "Board the ship, 1907", ja: "1907年の船に乗る", zh: "登上1907年的船", fr: "Embarquer en 1907", es: "Subir al barco de 1907" },
  again: { ko: "다른 배 타기", en: "Take another ship", ja: "別の船に乗る", zh: "换一艘船", fr: "Un autre bateau", es: "Otro barco" },
  heroKicker: { ko: "1907년 엘리스섬, 승객 명부 속 나", en: "You on a 1907 Ellis Island passenger list", ja: "1907年エリス島、乗客名簿の中の私", zh: "1907年埃利斯岛，乘客名单中的我", fr: "Vous sur une liste de passagers, Ellis Island 1907", es: "Tú en una lista de pasajeros, Ellis Island 1907" },
  sailed: { ko: "{port}에서 배를 타고 뉴욕항에 들어왔어요.", en: "You sailed from {port} into New York harbour.", ja: "{port}から船でニューヨーク港に入りました。", zh: "你从{port}乘船驶入纽约港。", fr: "Parti de {port}, vous entrez dans le port de New York.", es: "Zarpaste de {port} y entraste en el puerto de Nueva York." },
  lineTitle: { ko: "승객 명부의 내 줄", en: "Your line on the manifest", ja: "乗客名簿の私の行", zh: "乘客名单上的我这一行", fr: "Votre ligne sur la liste", es: "Tu línea en la lista" },
  lineNote: { ko: "1907년 양식에는 29칸이 있었어요. 그중 12칸을 골라 보여줘요. 이름·나이·직업·돈 같은 칸의 내용은 놀이용으로 지어낸 예시예요.", en: "The 1907 form had 29 columns; here are 12. Names, ages, callings and money are invented for the game.", ja: "1907年の様式は29欄。そのうち12欄を表示します。名前・年齢・職業・所持金などは遊び用の架空の例です。", zh: "1907年的表格有29栏，这里显示其中12栏。姓名、年龄、职业、钱款等为虚构示例。", fr: "Le formulaire de 1907 comptait 29 colonnes ; en voici 12. Noms, âges, métiers et sommes sont inventés.", es: "El formulario de 1907 tenía 29 columnas; aquí hay 12. Nombres, edades, oficios y dinero son inventados." },
  raceNote: { ko: "원래 양식에는 '인종 또는 민족(Race or people)' 칸도 있었어요. 이 분류는 1924년 출신국별 이민 할당법의 근거로 쓰였고, 지금은 과학적 근거가 없는 구분으로 봐요. 여기서는 그 칸을 채우지 않아요.", en: "The real form also had a 'Race or people' column. Its categories later fed the 1924 national-origins quotas and have no scientific basis; we leave it blank here.", ja: "本来の様式には「人種または民族」欄もありました。この分類は1924年の出身国別割当法の根拠に使われ、今では科学的根拠のない区分とされます。ここでは空欄にします。", zh: "原表还有“种族或民族”一栏，这一分类后来成为1924年按原籍国配额法的依据，现已被视为没有科学根据。这里不填写该栏。", fr: "Le vrai formulaire avait aussi une colonne « Race or people », dont les catégories ont servi aux quotas de 1924 ; nous la laissons vide.", es: "El formulario real tenía una columna «Race or people», cuyas categorías sirvieron para las cuotas de 1924; aquí la dejamos vacía." },
  moneyTitle: { ko: "주머니 속 돈", en: "Money in your pocket", ja: "ポケットのお金", zh: "口袋里的钱", fr: "L'argent en poche", es: "El dinero del bolsillo" },
  money: { ko: "명부는 '50달러를 가졌는가, 아니면 얼마인가'를 물었어요. 1907년 입국자가 가져온 돈은 1인당 평균 20달러 가까이였고, 50달러 이상을 보인 사람은 {pct}에 그쳤어요. 돈이 없으면 '나라의 짐이 될 사람'으로 의심받았어요.", en: "The form asked: 'In possession of $50, and if less, how much?' In 1907 immigrants averaged almost $20, and only {pct} showed $50 or more. Too little and an inspector could suspect you would become a public charge.", ja: "名簿は「50ドルを持っているか、なければいくらか」と尋ねました。1907年の入国者は平均20ドル近く、50ドル以上を示したのは{pct}だけ。少なすぎると「公共の負担になる者」と疑われました。", zh: "名单问：“是否持有50美元，若不足，有多少？”1907年入境者人均近20美元，出示50美元以上的只有{pct}。钱太少会被怀疑将成为“公共负担”。", fr: "Le formulaire demandait : « 50 $ en poche, sinon combien ? » En 1907, la moyenne était de près de 20 $, et seuls {pct} montraient 50 $ ou plus. Trop peu, et l'on vous soupçonnait de devenir une charge publique.", es: "El formulario preguntaba: «¿Tiene 50 $? Si no, ¿cuánto?» En 1907 la media era de casi 20 $, y solo {pct} mostraba 50 $ o más. Con muy poco, podían sospechar que serías una carga pública." },
  shareTitle: { ko: "1907년 미국에 들어온 사람들의 출신국", en: "Where 1907's immigrants came from", ja: "1907年の移民の出身国", zh: "1907年移民的来源国", fr: "D'où venaient les immigrants de 1907", es: "De dónde venían los inmigrantes de 1907" },
  shareNote: { ko: "1907 회계연도 이민국장 보고서의 출신국별 입국자 수예요. 일본·중국·캐나다·서인도제도처럼 태평양이나 육로, 다른 항구로 들어온 나라는 뺐어요.", en: "FY1907 arrivals by country (Commissioner-General of Immigration). Japan, China, Canada and the West Indies, who came by the Pacific, overland or to other ports, are left out.", ja: "1907会計年度の移民局長報告による出身国別の入国者数。太平洋・陸路・他の港から入った日本・中国・カナダ・西インド諸島は除きました。", zh: "1907财年移民局长报告中按国家统计的入境人数，未计入经太平洋、陆路或其他港口入境的日本、中国、加拿大和西印度群岛。", fr: "Arrivées de l'exercice 1907 par pays ; Japon, Chine, Canada et Antilles (Pacifique, voie terrestre, autres ports) exclus.", es: "Llegadas del año fiscal 1907 por país; se excluyen Japón, China, Canadá y las Antillas (Pacífico, tierra u otros puertos)." },
  me: { ko: "← 나", en: "← you", ja: "← 私", zh: "← 我", fr: "← vous", es: "← tú" },
  aboutTitle: { ko: "1907년, 엘리스섬이 가장 붐빈 해", en: "1907, Ellis Island's busiest year", ja: "1907年、エリス島がいちばん混んだ年", zh: "1907年，埃利斯岛最繁忙的一年", fr: "1907, l'année record d'Ellis Island", es: "1907, el año récord de Ellis Island" },
  about: { ko: "1907년 한 해에 {ellis}명이 엘리스섬을 거쳤어요. 4월 17일 하루에만 {day}명이 들어온 기록도 이 해에 나왔어요. 3등석 승객은 작은 배로 섬에 옮겨져 계단을 오르는 동안 의사의 눈길을 받고, 큰 홀에서 명부의 질문에 다시 답했어요. 그해 입국을 신청한 {applied}명 가운데 {back}명(약 1%)이 병이나 '나라의 짐이 될 우려', 미리 맺은 노동 계약 때문에 돌려보내졌어요.", en: "In 1907, {ellis} people passed through Ellis Island; on 17 April alone, a record {day}. Steerage passengers were ferried to the island, watched by doctors as they climbed the stairs, and asked the manifest's questions again in the Great Hall. Of {applied} applicants that year, {back} (about 1%) were sent back for disease, risk of becoming a public charge, or a labour contract signed in advance.", ja: "1907年の1年間に{ellis}人がエリス島を通り、4月17日には1日{day}人の記録も生まれました。三等船客は小舟で島に運ばれ、階段を上る間に医師に観察され、大広間で名簿の質問にもう一度答えました。その年の申請者{applied}人のうち{back}人（約1%）が病気・公共の負担の恐れ・事前の労働契約で送り返されました。", zh: "1907年共有{ellis}人经过埃利斯岛，4月17日单日就创下{day}人的纪录。统舱乘客被小船送上岛，爬楼梯时医生在旁观察，再在大厅里重新回答名单上的问题。当年{applied}名申请者中有{back}人（约1%）因疾病、可能成为公共负担或事先签了劳务合同而被遣返。", fr: "En 1907, {ellis} personnes passent par Ellis Island, dont un record de {day} le 17 avril. Débarqués par bac, les passagers de troisième classe montaient l'escalier sous l'œil des médecins puis répondaient de nouveau aux questions dans la grande salle. Sur {applied} demandeurs, {back} (environ 1 %) furent refoulés : maladie, risque de charge publique ou contrat de travail signé d'avance.", es: "En 1907 pasaron {ellis} personas por Ellis Island, con un récord de {day} el 17 de abril. Los pasajeros de tercera llegaban en barcaza, subían la escalera bajo la mirada de los médicos y repetían las respuestas en el gran salón. De {applied} solicitantes, {back} (alrededor del 1 %) fueron devueltos por enfermedad, riesgo de ser carga pública o contrato laboral previo." },
  cardKicker: { ko: "1907 · 엘리스섬 승객 명부 속 나", en: "1907 · Me on an Ellis Island manifest", ja: "1907・エリス島の乗客名簿の中の私", zh: "1907·埃利斯岛乘客名单中的我", fr: "1907 · Moi à Ellis Island", es: "1907 · Yo en Ellis Island" },
  badge: { ko: "엘리스섬 1907", en: "Ellis Island 1907", ja: "エリス島 1907", zh: "埃利斯岛 1907", fr: "Ellis Island 1907", es: "Ellis Island 1907" },
  src1: { ko: "미국 국립기록원: 1907년 승객 명부 양식", en: "NARA: 1907 passenger manifest form", ja: "米国国立公文書館：1907年乗客名簿様式", zh: "美国国家档案馆：1907年乘客名单表格", fr: "NARA : formulaire de 1907", es: "NARA: formulario de 1907" },
  src2: { ko: "1907 이민국장 보고서 요약(아이오와주 역사자료)", en: "FY1907 Commissioner-General report, press summary (Iowa history)", ja: "1907年移民局長報告の要約（アイオワ州）", zh: "1907年移民局长报告摘要（爱荷华州）", fr: "Rapport 1907, résumé de presse (Iowa)", es: "Informe de 1907, resumen de prensa (Iowa)" },
  src3: { ko: "미국이민위원회: 1907년과 2017년", en: "American Immigration Council: 1907 v. 2017", ja: "米国移民評議会：1907年と2017年", zh: "美国移民委员会：1907与2017", fr: "American Immigration Council : 1907 et 2017", es: "American Immigration Council: 1907 y 2017" },
  src4: { ko: "자유의 여신상-엘리스섬 재단", en: "Statue of Liberty–Ellis Island Foundation", ja: "自由の女神＝エリス島財団", zh: "自由女神像-埃利斯岛基金会", fr: "Fondation Statue de la Liberté–Ellis Island", es: "Fundación Estatua de la Libertad–Ellis Island" },
} satisfies Record<string, Six>;

const COL: Record<string, Six> = {
  name: { ko: "이름", en: "Full name", ja: "氏名", zh: "姓名", fr: "Nom", es: "Nombre" },
  age: { ko: "나이", en: "Age", ja: "年齢", zh: "年龄", fr: "Âge", es: "Edad" },
  sex: { ko: "성별", en: "Sex", ja: "性別", zh: "性别", fr: "Sexe", es: "Sexo" },
  married: { ko: "결혼", en: "Married or single", ja: "既婚/未婚", zh: "婚否", fr: "Marié(e)", es: "Estado civil" },
  calling: { ko: "직업", en: "Calling or occupation", ja: "職業", zh: "职业", fr: "Métier", es: "Oficio" },
  read: { ko: "읽기/쓰기", en: "Able to read / write", ja: "読み書き", zh: "能否读写", fr: "Lire / écrire", es: "Leer / escribir" },
  nationality: { ko: "국적", en: "Nationality", ja: "国籍", zh: "国籍", fr: "Nationalité", es: "Nacionalidad" },
  residence: { ko: "마지막 거주지", en: "Last residence", ja: "最後の居住地", zh: "最后居住地", fr: "Dernière résidence", es: "Última residencia" },
  destination: { ko: "최종 목적지", en: "Final destination", ja: "最終目的地", zh: "最终目的地", fr: "Destination finale", es: "Destino final" },
  paidBy: { ko: "뱃삯을 낸 사람", en: "By whom passage paid", ja: "渡航費の支払者", zh: "船费由谁支付", fr: "Passage payé par", es: "Pasaje pagado por" },
  money: { ko: "가진 돈", en: "$50, and if less, how much", ja: "所持金", zh: "所带钱款", fr: "Somme en poche", es: "Dinero" },
  joining: { ko: "만나러 가는 사람", en: "Going to join", ja: "合流する人", zh: "前往投奔", fr: "Va rejoindre", es: "Va a reunirse con" },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Ellis1907({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [pass, setPass] = useState<Passenger | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseEllis(window.location.search);
    if (shared) setPass(shared);
  }, []);

  function draw(rand: () => number, how: string) {
    const next = makePassenger(drawOrigin(rand), rand);
    funnel(how);
    warp.start(() => {
      setPass(next);
      setRound((r) => r + 1);
      setShareQuery(formatEllis(next));
      stampEpisode(EP);
    });
  }

  const origin = pass ? originById(pass.origin) : null;
  const line = pass ? manifestLine(pass) : null;
  const pct = `${Math.round(OVER_50_SHARE * 100)}%`;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1907} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, "random")}>
          {pick(pass ? C.again : C.draw, l)}
        </Button>
      )}

      {pass && origin && line && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(origin.name, l)}</p>
            <div className="mt-3">
              <RarityBadge n={oneIn(origin)} l={l} fmt={fmt} />
            </div>
            <p className="mt-3 text-sm font-bold text-foreground">{fill(pick(C.sailed, l), { port: line.port })}</p>
            <p className="mt-3 text-base leading-relaxed text-foreground">{pick(origin.life, l)}</p>
          </section>

          <Panel label={pick(C.lineTitle, l)}>
            <dl className="timeslip-census" lang="en">
              {(Object.keys(COL) as (keyof ManifestLine)[]).map((k) => (
                <div key={k}>
                  <dt>{pick(COL[k]!, l)}</dt>
                  <dd>{line[k]}</dd>
                </div>
              ))}
            </dl>
            <p className="pt-3 text-xs leading-relaxed text-muted-foreground">{pick(C.lineNote, l)}</p>
            <p className="pt-1 text-xs leading-relaxed text-muted-foreground">{pick(C.raceNote, l)}</p>
          </Panel>

          <Panel label={pick(C.moneyTitle, l)}>
            <p className="text-2xl font-black text-foreground">{line.money}</p>
            <p className="leading-relaxed">{fill(pick(C.money, l), { pct })}</p>
          </Panel>

          <Panel label={pick(C.shareTitle, l)}>
            <ul className="space-y-1 text-sm">
              {ORIGINS.map((o) => (
                <li key={o.id} className={o.id === pass.origin ? "font-bold text-primary" : "text-muted-foreground"}>
                  {pick(o.name, l)} {fmt.format(o.n)} ({((o.n / TOTAL) * 100).toFixed(1)}%){o.id === pass.origin && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.shareNote, l)}</p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.about, l), { ellis: fmt.format(ELLIS_1907), day: fmt.format(RECORD_DAY), applied: fmt.format(APPLIED_FY1907), back: fmt.format(TURNED_BACK_FY1907) })}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://www.archives.gov/files/research/genealogy/charts-forms/1907-immigration.pdf" },
              { label: pick(C.src2, l), url: "https://history.iowa.gov/sites/default/files/history-education-pss-america-banner-year-transcription.pdf" },
              { label: pick(C.src3, l), url: "https://www.americanimmigrationcouncil.org/report/immigration-1907-v-2017/" },
              { label: pick(C.src4, l), url: "https://www.ellisisland.org/ellis-island/overview-history/" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-ellis-1907-${origin.id}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: line.name,
              subtitle: pick(origin.name, l),
              badge: pick(C.badge, l),
              lines: [`${line.calling} · ${line.age} · ${line.residence}`, `${line.port} → ${line.destination}`, `${line.money}`],
              footer: `oiyo.net · 1907 · ${fmt.format(ADMITTED_FY1907)}`,
              accent: "#1f4a5a",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
