import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import {
  BOOK_EN, PASSERS, POLICY, QUOTA, RHYMES, SEJONG_CHOICE, formatGwageo, makeClassicQuiz, parseGwageo, rankOf, shuffle,
  type Bi, type Book, type PolicyId, type Rank,
} from "../../../lib/gwageo-1426";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { CopyLink, Panel, Sources, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "gwageo-1426" as const;

const C = {
  start: { ko: "시험장에 들어가기", en: "Enter the exam hall", ja: "試験場に入る", zh: "进入考场", fr: "Entrer dans la salle d'examen", es: "Entrar al examen" },
  startNote: { ko: "세종 8년(1426) 병오년 식년 문과 회시. 초시를 통과한 240명 가운데 33명만 붙어요.", en: "The 1426 triennial civil exam, second round: of 240 first-round passers, only 33 get through.", ja: "世宗8年（1426）丙午の式年文科・会試。初試合格者240人のうち33人だけが受かります。", zh: "世宗八年（1426）丙午式年文科会试：初试通过的240人中只录取33人。", fr: "Examen civil de 1426, second tour : sur 240 candidats, 33 seulement passent.", es: "Examen civil de 1426, segunda ronda: de 240 candidatos solo pasan 33." },
  stage1: { ko: "초장 · 경서 강경", en: "Round 1 · Classics recital", ja: "初場・経書の講経", zh: "初场·讲经", fr: "1er tour · Les classiques", es: "1.ª ronda · Los clásicos" },
  stage1q: { ko: "이 구절은 어느 책에 나오나요?", en: "Which book is this line from?", ja: "この句はどの書物の一節？", zh: "这句出自哪部经书？", fr: "De quel livre vient ce passage ?", es: "¿De qué libro es este pasaje?" },
  stage2: { ko: "중장 · 부(賦) 짓기", en: "Round 2 · Rhymed prose", ja: "中場・賦を作る", zh: "中场·作赋", fr: "2e tour · Prose rimée", es: "2.ª ronda · Prosa rimada" },
  stage2q: { ko: "'{g}' 운에 맞는 글자를 고르세요", en: "Pick the character that rhymes in the '{g}' group", ja: "「{g}」韻に合う字を選んでください", zh: "选出属于「{g}」韵的字", fr: "Choisissez le caractère de la rime « {g} »", es: "Elige el carácter de la rima «{g}»" },
  tempt: { ko: "대독관이 슬쩍 다가와 속삭여요. \"운이 틀린 글자, 두 자만 고쳐 드릴까요?\"", en: "An examiner leans over and whispers: \"Shall I fix two characters that break the rhyme?\"", ja: "対読官がそっと近づいてささやきます。「韻を外した字、二字だけ直しましょうか」", zh: "对读官悄悄靠过来：“错韵的字，我帮你改两个？”", fr: "Un examinateur chuchote : « Je corrige deux caractères mal rimés ? »", es: "Un examinador susurra: «¿Te corrijo dos caracteres mal rimados?»" },
  temptYes: { ko: "고쳐 달라고 한다", en: "Accept", ja: "直してもらう", zh: "请他改", fr: "Accepter", es: "Aceptar" },
  temptNo: { ko: "거절한다", en: "Refuse", ja: "断る", zh: "拒绝", fr: "Refuser", es: "Rechazar" },
  stage3: { ko: "종장 · 세종의 책문(전시, 4월 11일 근정전)", en: "Final · King Sejong's policy question (palace exam, 4/11)", ja: "終場・世宗の策問（殿試、4月11日 勤政殿）", zh: "终场·世宗策问（殿试，四月十一日勤政殿）", fr: "Finale · La question du roi Sejong (11e jour, 4e mois)", es: "Final · La pregunta del rey Sejong (día 11, mes 4)" },
  stage3q: { ko: "1426년 실제 책문이에요. 함길도 경원을 어떻게 해야 할까요? 세 주장 가운데 하나를 골라 답안을 쓰세요.", en: "This is the real 1426 question: what to do with Gyeongwon on the northern frontier? Argue for one of the three views.", ja: "1426年の実際の策問です。咸吉道の慶源をどうすべきか。三つの説から一つを選んで答案を書いてください。", zh: "这是1426年真实的策问：咸吉道庆源该如何处置？从三种主张中选一种作答。", fr: "Vraie question de 1426 : que faire de Gyeongwon, à la frontière nord ? Défendez l'une des trois thèses.", es: "Pregunta real de 1426: ¿qué hacer con Gyeongwon, en la frontera norte? Defiende una de las tres tesis." },
  progress: { ko: "{n} / 7", en: "{n} / 7", ja: "{n} / 7", zh: "{n} / 7", fr: "{n} / 7", es: "{n} / 7" },
  heroKicker: { ko: "1426년 4월 13일 방방(합격 발표)", en: "Results posted, 1426 (4th month, 13th day)", ja: "1426年4月13日 放榜", zh: "1426年四月十三日放榜", fr: "Résultats, 1426 (4e mois, 13e jour)", es: "Resultados, 1426 (mes 4, día 13)" },
  score: { ko: "초장 {a}/3 · 중장 {b}/3", en: "Round 1 {a}/3 · Round 2 {b}/3", ja: "初場 {a}/3・中場 {b}/3", zh: "初场 {a}/3 · 中场 {b}/3", fr: "1er tour {a}/3 · 2e tour {b}/3", es: "1.ª {a}/3 · 2.ª {b}/3" },
  listTitle: { ko: "1426년 실제 급제자 명단 속 나", en: "You on the real 1426 pass list", ja: "1426年の実際の合格者名簿の中の私", zh: "1426年真实及第名单中的我", fr: "Vous sur la vraie liste de 1426", es: "Tú en la lista real de 1426" },
  me: { ko: "나", en: "You", ja: "わたし", zh: "我", fr: "Vous", es: "Tú" },
  sejongTitle: { ko: "세종은 실제로 어떻게 했을까요?", en: "What did Sejong actually do?", ja: "世宗は実際どうした？", zh: "世宗实际怎么做？", fr: "Qu'a fait Sejong en réalité ?", es: "¿Qué hizo Sejong en realidad?" },
  sejong: { ko: "세종은 \"조종의 옛 땅을 조금이라도 줄일 수 없다\"며 물러서지 않았어요. 1432년 영북진을 세우고, 1434년부터 김종서가 6진을 쌓으며 경원부를 오히려 북쪽 회질가로 옮겼어요. 지금 두만강 국경선이 이때 굳어졌어요.", en: "Sejong refused to give up \"the old land of our ancestors\". He set up Yeongbuk in 1432, and from 1434 Kim Jong-seo built the Six Garrisons, moving Gyeongwon further north. The Tumen border took shape then.", ja: "世宗は「祖宗の旧地は少しも減らせない」と退きませんでした。1432年に寧北鎮を置き、1434年から金宗瑞が六鎮を築いて慶源府をさらに北へ移しました。", zh: "世宗说“祖宗旧地不可稍减”，没有退让。1432年设宁北镇，1434年起金宗瑞筑六镇，把庆源府反而北移。图们江边界由此确立。", fr: "Sejong refusa de céder « la vieille terre des ancêtres » : en 1432 il fonda Yeongbuk, puis dès 1434 Kim Jong-seo bâtit les Six Garnisons et repoussa Gyeongwon vers le nord.", es: "Sejong se negó a ceder «la vieja tierra de los ancestros»: en 1432 fundó Yeongbuk y desde 1434 Kim Jong-seo levantó las Seis Guarniciones, llevando Gyeongwon más al norte." },
  yourPick: { ko: "내 답안: {p}", en: "Your answer: {p}", ja: "私の答案：{p}", zh: "我的答案：{p}", fr: "Votre réponse : {p}", es: "Tu respuesta: {p}" },
  matched: { ko: "세종이 실제로 고른 길과 같아요. 가산점 1점.", en: "Same path Sejong took: +1 point.", ja: "世宗が実際に選んだ道と同じ。加点1。", zh: "与世宗实际的选择相同，加1分。", fr: "Le choix de Sejong : +1 point.", es: "Lo que eligió Sejong: +1 punto." },
  again: { ko: "다시 응시하기", en: "Sit it again", ja: "もう一度受験する", zh: "再考一次", fr: "Repasser l'examen", es: "Volver a presentarse" },
  original: { ko: "책문 원문(일부)", en: "Original question (excerpt)", ja: "策問原文（抜粋）", zh: "策问原文（节选）", fr: "Texte original (extrait)", es: "Texto original (extracto)" },
  cardKicker: { ko: "1426 · 과거시험 보러 가기", en: "1426 · Sitting the civil exam", ja: "1426・科挙を受けに行く", zh: "1426·去考科举", fr: "1426 · Passer l'examen", es: "1426 · Presentar el examen" },
  badge: { ko: "병오 식년 문과", en: "1426 civil exam", ja: "丙午式年文科", zh: "丙午式年文科", fr: "Examen de 1426", es: "Examen de 1426" },
  srcSillok: { ko: "『세종실록』 8년(위키문헌)", en: "Sejong Sillok, year 8 (Wikisource)", ja: "『世宗実録』8年（ウィキソース）", zh: "《世宗实录》八年（维基文库）", fr: "Annales de Sejong, an 8 (Wikisource)", es: "Anales de Sejong, año 8 (Wikisource)" },
  srcSedb: { ko: "문과 급제자 데이터베이스: 1426년 식년시", en: "Civil exam passers database: 1426", ja: "文科及第者DB：1426年", zh: "文科及第者数据库：1426年", fr: "Base des lauréats : 1426", es: "Base de aprobados: 1426" },
  srcYukjin: { ko: "한국민족문화대백과 「육진」", en: "Encyclopedia of Korean Culture: Six Garrisons", ja: "韓国民族文化大百科「六鎮」", zh: "韩国民族文化大百科“六镇”", fr: "Encyclopédie de la culture coréenne : six garnisons", es: "Enciclopedia de la cultura coreana: seis guarniciones" },
} satisfies Record<string, Six>;

const RANK: Record<Rank, { title: Six; body: Six }> = {
  jangwon: {
    title: { ko: "장원 급제!", en: "Top of the list!", ja: "状元及第！", zh: "状元及第！", fr: "Premier du classement !", es: "¡Primero de la lista!" },
    body: { ko: "이해 실제 장원 황보량 자리예요. 근정전에서 어사화와 술을 받고, 광흥창 부사로 첫 벼슬을 시작해요.", en: "You take the place of the real top scorer, Hwangbo Ryang: flower and wine from the king in Geunjeongjeon, then a first post at the Gwangheung granary.", ja: "この年の実際の状元・皇甫良の席です。勤政殿で御賜花と酒を賜り、広興倉副使として初任官。", zh: "这是当年真实状元皇甫良的位置：在勤政殿受赐花与酒，初任广兴仓副使。", fr: "La place du vrai lauréat, Hwangbo Ryang : fleur et vin du roi, puis un premier poste au grenier Gwangheung.", es: "El puesto del verdadero primero, Hwangbo Ryang: flor y vino del rey y un primer cargo en el granero Gwangheung." },
  },
  eul: {
    title: { ko: "을과 급제", en: "Passed in the first class (eulgwa)", ja: "乙科及第", zh: "乙科及第", fr: "Reçu en première classe", es: "Aprobado en primera clase" },
    body: { ko: "이해 을과는 단 3명이었어요. 조전·양계원과 나란히 첫 벼슬을 받아요.", en: "Only three made this class in 1426. You stand with Jo Jeon and Yang Gye-won.", ja: "この年の乙科はわずか3人。趙篆・楊繼元と並びます。", zh: "当年乙科只有3人，你与赵篆、杨继元并列。", fr: "Trois reçus seulement cette année-là ; vous voici avec Jo Jeon et Yang Gye-won.", es: "Solo tres ese año; estás junto a Jo Jeon y Yang Gye-won." },
  },
  byeong: {
    title: { ko: "병과 급제", en: "Passed in the second class (byeonggwa)", ja: "丙科及第", zh: "丙科及第", fr: "Reçu en deuxième classe", es: "Aprobado en segunda clase" },
    body: { ko: "병과 7명 안에 들었어요. 같은 해 생원시 장원 신석견도 병과였어요.", en: "One of seven. Sin Seok-gyeon, top of that spring's licentiate exam, was here too.", ja: "丙科7人の一人。同年の生員試首席・辛石堅も丙科でした。", zh: "丙科7人之一。同年生员试第一的辛石坚也在丙科。", fr: "L'un des sept. Sin Seok-gyeon, premier de l'examen de licence ce printemps, y figure aussi.", es: "Uno de siete. Sin Seok-gyeon, primero del examen de licenciado esa primavera, también." },
  },
  dong: {
    title: { ko: "동진사 급제", en: "Passed (dongjinsa)", ja: "同進士及第", zh: "同进士及第", fr: "Reçu (dongjinsa)", es: "Aprobado (dongjinsa)" },
    body: { ko: "마지막 줄이지만 급제는 급제예요. 같은 동진사 10위 정창손은 훗날 영의정까지 올랐어요.", en: "Last tier, still a pass. Jeong Chang-son, 10th in this tier, later became chief state councillor.", ja: "最後の列でも及第は及第。同進士10位の鄭昌孫は後に領議政になりました。", zh: "虽是末等，也是及第。同进士第十名郑昌孙后来官至领议政。", fr: "Dernier rang, mais reçu. Jeong Chang-son, 10e de ce rang, devint plus tard Premier ministre.", es: "Último nivel, pero aprobado. Jeong Chang-son, 10.º de este nivel, llegó a primer ministro." },
  },
  fail: {
    title: { ko: "낙방", en: "Failed", ja: "落第", zh: "落第", fr: "Recalé", es: "Suspendido" },
    body: { ko: "회시는 240명 중 33명만 붙는 시험이었어요. 3년 뒤 식년시를 기약해요.", en: "Only 33 of 240 got through this round. See you at the next triennial exam.", ja: "会試は240人中33人だけ。3年後の式年試を期しましょう。", zh: "会试240人只取33人，三年后再来。", fr: "33 reçus sur 240. Rendez-vous dans trois ans.", es: "Solo 33 de 240. Hasta dentro de tres años." },
  },
  caught: {
    title: { ko: "부정행위 적발", en: "Caught cheating", ja: "不正発覚", zh: "舞弊被抓", fr: "Pris en flagrant délit", es: "Pillado haciendo trampa" },
    body: { ko: "실제로 이해 회시에서 어변미가 대독관에게 운 틀린 글자를 고쳐 달라고 했다가 들켜 장 60대·도형 1년을 받았어요(두 등급 감형). 답안지를 바꿔 쓴 이군거는 장 80대였어요.", en: "This really happened in 1426: Eo Byeon-mi had an examiner fix his rhymes and got 60 strokes and a year of penal labour (reduced two degrees). Yi Gun-geo, who swapped a sheet, got 80 strokes.", ja: "実際この年、魚変尾が対読官に字を直させて発覚し、杖六十・徒一年（二等減刑）。答案をすり替えた李君挙は杖八十でした。", zh: "当年真实案例：鱼变尾请对读官改错韵之字被发现，判杖六十、徒一年（减二等）。调换答卷的李君举杖八十。", fr: "C'est arrivé en 1426 : Eo Byeon-mi fit corriger ses rimes et reçut 60 coups et un an de travaux forcés (peine réduite).", es: "Pasó en 1426: Eo Byeon-mi hizo corregir sus rimas y recibió 60 azotes y un año de trabajos (pena reducida)." },
  },
};

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
const bi = (b: Bi, l: L) => (l === "ko" ? b.ko : b.en);
const bookName = (b: Book, l: L) => (l === "ko" || l === "ja" || l === "zh" ? b : BOOK_EN[b]);

const CHAEKMUN = "或謂公險以南，國之舊封，宜置軍民，以守疆域，或謂慶源郡，三面受敵，而人民鮮少，艱於禦侮……宜罷慶源之守，移於鏡城，或謂慶源置兵，太宗成憲，不可更改。是三說者，果孰得而孰失歟？";

type Phase = "intro" | "classics" | "rhymes" | "tempt" | "policy" | "done";

export default function Gwageo1426({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [phase, setPhase] = useState<Phase>("intro");
  const [quiz, setQuiz] = useState(() => makeClassicQuiz());
  const [rhymes, setRhymes] = useState(() => RHYMES.map((r) => ({ ...r, options: shuffle(r.options) })));
  const [i, setI] = useState(0);
  const [classics, setClassics] = useState(0);
  const [rhymeScore, setRhymeScore] = useState(0);
  const [cheated, setCheated] = useState(false);
  const [result, setResult] = useState<{ rank: Rank; policy: PolicyId | null; a: number; b: number } | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseGwageo(window.location.search);
    if (shared) {
      setResult({ ...shared, a: -1, b: -1 });
      setPhase("done");
    }
  }, []);

  function begin() {
    funnel("start");
    setQuiz(makeClassicQuiz());
    setRhymes(RHYMES.map((r) => ({ ...r, options: shuffle(r.options) })));
    setI(0);
    setClassics(0);
    setRhymeScore(0);
    setCheated(false);
    setResult(null);
    setPhase("classics");
  }

  function answerClassic(b: Book) {
    if (b === quiz[i].book) setClassics((x) => x + 1);
    if (i < 2) setI(i + 1);
    else {
      setI(0);
      setPhase("rhymes");
    }
  }

  function answerRhyme(c: string) {
    if (c === rhymes[i].answer) setRhymeScore((x) => x + 1);
    if (i < 2) setI(i + 1);
    else setPhase("tempt");
  }

  function finish(policy: PolicyId) {
    const rank = rankOf({ classics, rhymes: rhymeScore, policy, cheated });
    warp.start(() => {
      setResult({ rank, policy, a: classics, b: rhymeScore });
      setPhase("done");
      setRound((x) => x + 1);
      setShareQuery(formatGwageo(rank, policy));
      stampEpisode(EP);
    });
  }

  const step = phase === "classics" ? i : phase === "rhymes" ? 3 + i : phase === "tempt" || phase === "policy" ? 6 : 7;
  const r = result;
  const policyText = r?.policy ? bi(POLICY.find((p) => p.id === r.policy)!, l) : "";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1426} l={l} onDone={warp.finish} />}

      {(phase === "intro" || phase === "done") && (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{pick(C.startNote, l)}</p>
          <Button size="lg" className="w-full" onClick={begin}>
            {pick(phase === "done" ? C.again : C.start, l)}
          </Button>
        </section>
      )}

      {phase !== "intro" && phase !== "done" && (
        <section className="space-y-4 rounded-2xl border border-border bg-card p-4" aria-live="polite">
          <Progress value={(step / 7) * 100} aria-label={fill(pick(C.progress, l), { n: step })} />
          {phase === "classics" && (
            <>
              <p className="text-sm font-bold text-muted-foreground">{pick(C.stage1, l)} · {i + 1}/3</p>
              <p className="text-base font-bold text-foreground">{pick(C.stage1q, l)}</p>
              <p lang="zh-Hant" className="font-serif text-2xl font-black leading-relaxed text-foreground">{quiz[i].text}</p>
              <p className="text-sm text-muted-foreground">{bi(quiz[i].gloss, l)}</p>
              <div className="grid grid-cols-2 gap-2">
                {quiz[i].options.map((b) => (
                  <Button key={b} variant="outline" className="min-h-11" onClick={() => answerClassic(b)}>
                    {bookName(b, l)}
                  </Button>
                ))}
              </div>
            </>
          )}
          {phase === "rhymes" && (
            <>
              <p className="text-sm font-bold text-muted-foreground">{pick(C.stage2, l)} · {i + 1}/3</p>
              <p className="text-base font-bold text-foreground">{fill(pick(C.stage2q, l), { g: rhymes[i].group })}</p>
              <div className="grid grid-cols-4 gap-2">
                {rhymes[i].options.map((c) => (
                  <Button key={c} variant="outline" className="min-h-14" onClick={() => answerRhyme(c)}>
                    <span lang="zh-Hant" className="font-serif text-2xl">{c}</span>
                  </Button>
                ))}
              </div>
            </>
          )}
          {phase === "tempt" && (
            <>
              <p className="text-base font-bold leading-relaxed text-foreground">{pick(C.tempt, l)}</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="min-h-11" onClick={() => { setCheated(true); setPhase("policy"); }}>{pick(C.temptYes, l)}</Button>
                <Button className="min-h-11" onClick={() => setPhase("policy")}>{pick(C.temptNo, l)}</Button>
              </div>
            </>
          )}
          {phase === "policy" && (
            <>
              <p className="text-sm font-bold text-muted-foreground">{pick(C.stage3, l)}</p>
              <p className="text-base leading-relaxed text-foreground">{pick(C.stage3q, l)}</p>
              <p lang="zh-Hant" className="font-serif text-sm leading-loose text-muted-foreground">{CHAEKMUN}</p>
              <div className="space-y-2">
                {POLICY.map((p) => (
                  <Button key={p.id} variant="outline" className="min-h-11 w-full justify-start whitespace-normal text-left" onClick={() => finish(p.id)}>
                    {bi(p, l)}
                  </Button>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {phase === "done" && r && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(RANK[r.rank].title, l)}</p>
            {r.a >= 0 && <p className="mt-2 text-sm text-muted-foreground">{fill(pick(C.score, l), { a: r.a, b: r.b })}</p>}
            <p className="mt-4 text-base leading-relaxed text-foreground">{pick(RANK[r.rank].body, l)}</p>
          </section>

          {r.rank !== "fail" && r.rank !== "caught" && (
            <Panel label={pick(C.listTitle, l)}>
              <ol className="space-y-1 text-sm">
                {(["eul", "byeong", "dong"] as const).map((tier) => (
                  <li key={tier} className="space-y-1">
                    <p className="pt-2 font-bold text-foreground">
                      {tier === "eul" ? `乙科 ${QUOTA.eul}` : tier === "byeong" ? `丙科 ${QUOTA.byeong}` : `同進士 ${QUOTA.dong}`}
                    </p>
                    <p className="text-muted-foreground">
                      {(r.rank === tier || (r.rank === "jangwon" && tier === "eul")) && <strong className="text-primary">{pick(C.me, l)} · </strong>}
                      {PASSERS[tier].map((p) => `${p.ko}(${p.hanja})`).join(" · ")} …
                    </p>
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          {r.policy && (
            <Panel label={pick(C.sejongTitle, l)}>
              <p className="text-sm text-muted-foreground">{fill(pick(C.yourPick, l), { p: policyText })}</p>
              {r.policy === SEJONG_CHOICE && <p className="pt-1 text-sm font-bold text-primary">{pick(C.matched, l)}</p>}
              <p className="pt-2 text-base leading-relaxed">{pick(C.sejong, l)}</p>
              <p className="pt-3 text-xs font-bold text-muted-foreground">{pick(C.original, l)}</p>
              <p lang="zh-Hant" className="font-serif text-sm leading-loose text-muted-foreground">{CHAEKMUN}</p>
            </Panel>
          )}

          <Sources
            l={l}
            items={[
              { label: pick(C.srcSillok, l), url: "https://zh.wikisource.org/w/index.php?title=%E6%9C%9D%E9%AE%AE%E7%8E%8B%E6%9C%9D%E5%AF%A6%E9%8C%84/%E4%B8%96%E5%AE%97%E5%AF%A6%E9%8C%84/%E5%85%AB%E5%B9%B4&oldid=2122908" },
              { label: pick(C.srcSedb, l), url: "https://dh.aks.ac.kr/~sonamu5/wiki/index.php/SEDB:1426%EB%85%84(%E4%B8%96%E5%AE%97_8)_%E4%B8%99%E5%8D%88_%EC%8B%9D%EB%85%84%EC%8B%9C(%E5%BC%8F%E5%B9%B4%E8%A9%A6)_%EB%AC%B8%EA%B3%BC(%E6%96%87%E7%A7%91)" },
              { label: pick(C.srcYukjin, l), url: "https://encykorea.aks.ac.kr/Article/E0042168" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-gwageo-1426-${r.rank}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: pick(RANK[r.rank].title, l),
              subtitle: r.a >= 0 ? fill(pick(C.score, l), { a: r.a, b: r.b }) : pick(C.badge, l),
              badge: pick(C.badge, l),
              lines: [pick(RANK[r.rank].body, l)],
              footer: "oiyo.net · 1426",
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
