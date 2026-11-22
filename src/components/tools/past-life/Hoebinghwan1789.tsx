import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { MAX_SKILLS, SKILLS, ending, formatRun, makeRun, parseRun, score, skillById, type Ending, type Run, type SkillId, type Trope, type Verdict } from "../../../lib/hoebinghwan-1789";
import { ageFromBirthday, registerLine, registerName, type Status } from "../../../lib/joseon-1789";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "hoebinghwan-1789" as const;

const TROPES: Record<Trope, { name: Six; how: Six }> = {
  possess: {
    name: { ko: "빙의", en: "Possession", ja: "憑依", zh: "附身", fr: "Possession", es: "Posesión" },
    how: { ko: "1789년을 사는 누군가의 몸에서 눈을 떠요.", en: "You wake up in the body of someone living in 1789.", ja: "1789年を生きる誰かの体で目覚めます。", zh: "你在1789年某个人的身体里醒来。", fr: "Vous vous réveillez dans le corps de quelqu'un de 1789.", es: "Despiertas en el cuerpo de alguien de 1789." },
  },
  reborn: {
    name: { ko: "환생", en: "Rebirth", ja: "転生", zh: "转生", fr: "Renaissance", es: "Renacimiento" },
    how: { ko: "기억을 가진 채 1789년에 아기로 태어나요. 기술은 자라서야 쓸 수 있어요.", en: "You are born in 1789 with your memories; your skills wait until you grow up.", ja: "記憶を持ったまま1789年に赤ん坊として生まれます。技術は育ってから使えます。", zh: "带着记忆在1789年出生，技能要等长大才用得上。", fr: "Vous naissez en 1789 avec vos souvenirs ; vos talents attendront.", es: "Naces en 1789 con tus recuerdos; tus habilidades tendrán que esperar." },
  },
  slip: {
    name: { ko: "타임슬립", en: "Time slip", ja: "タイムスリップ", zh: "穿越", fr: "Saut dans le temps", es: "Salto en el tiempo" },
    how: { ko: "지금 모습 그대로 1789년 한양 길바닥에 떨어져요.", en: "You land in a 1789 Hanyang street exactly as you are now.", ja: "いまの姿のまま1789年の漢陽の路上に落ちます。", zh: "以现在的样子掉在1789年汉阳的街头。", fr: "Vous tombez dans une rue de Hanyang en 1789, tel que vous êtes.", es: "Caes en una calle de Hanyang en 1789, tal como eres." },
  },
};

const STATUS_NAME: Record<Status, Six> = {
  yangban: { ko: "양반", en: "yangban (gentry)", ja: "両班", zh: "两班", fr: "yangban (noblesse)", es: "yangban (nobleza)" },
  sangmin: { ko: "상민", en: "commoner", ja: "常民", zh: "常民", fr: "roturier", es: "plebeyo" },
  nobi: { ko: "노비", en: "nobi (enslaved)", ja: "奴婢", zh: "奴婢", fr: "nobi (esclave)", es: "nobi (esclavo)" },
};

const VERDICT: Record<Verdict, Six> = {
  works: { ko: "통함", en: "Works", ja: "通じる", zh: "管用", fr: "Utile", es: "Sirve" },
  partly: { ko: "반쯤", en: "Partly", ja: "半分", zh: "一半", fr: "En partie", es: "A medias" },
  useless: { ko: "못 씀", en: "Useless", ja: "使えない", zh: "没用", fr: "Inutile", es: "Inútil" },
};

const ENDINGS: Record<Ending, { title: Six; body: Six }> = {
  days3: {
    title: { ko: "사흘 만에 들통", en: "Found out in three days", ja: "三日でばれる", zh: "三天就露馅", fr: "Démasqué en trois jours", es: "Descubierto en tres días" },
    body: { ko: "말투도 셈법도 이상한 사람. 웹소설 주인공처럼 되려면 준비가 더 필요해요.", en: "Odd speech, odd sums. A web-novel hero needs more prep than this.", ja: "話し方も計算も妙な人。ウェブ小説の主人公になるにはもっと準備が要ります。", zh: "说话和算账都怪怪的。想当网文主角，还得多准备。", fr: "Parler et compter bizarrement : un héros de roman en ligne se prépare mieux.", es: "Hablas y cuentas raro: un héroe de novela web se prepara mejor." },
  },
  year1: {
    title: { ko: "한 해는 버팀", en: "You last a year", ja: "一年はもつ", zh: "撑过一年", fr: "Vous tenez un an", es: "Aguantas un año" },
    body: { ko: "먹고살 길은 찾았지만 아직 아슬아슬해요.", en: "You found a way to eat, but it is touch and go.", ja: "食べていく道は見つけたものの、まだ危なっかしい。", zh: "找到了糊口的路，但仍岌岌可危。", fr: "Vous mangez, mais c'est juste.", es: "Comes, pero por poco." },
  },
  years10: {
    title: { ko: "십 년 자리 잡기", en: "Settled in ten years", ja: "十年で定着", zh: "十年站稳脚跟", fr: "Installé en dix ans", es: "Asentado en diez años" },
    body: { ko: "현대 지식 한두 개가 제대로 먹혀서, 동네에서 이름이 알려져요.", en: "One or two modern skills really land; the neighbourhood knows your name.", ja: "現代の知識が一つ二つ効いて、町で名が知られます。", zh: "一两项现代技能真管用，邻里都知道你的名字。", fr: "Un ou deux savoirs modernes portent : le quartier vous connaît.", es: "Uno o dos saberes modernos funcionan: el barrio sabe tu nombre." },
  },
  lifetime: {
    title: { ko: "천수를 누림", en: "A full life", ja: "天寿を全う", zh: "安享天年", fr: "Une vie entière", es: "Una vida plena" },
    body: { ko: "몸도 자리도 기술도 맞아떨어졌어요. 조용히 오래 사는 회빙환 결말이에요.", en: "Body, place and skills all fit. The quiet long-life ending.", ja: "体も立場も技術も噛み合いました。静かに長生きする結末です。", zh: "身体、身份和技能都对上了，是安稳长寿的结局。", fr: "Corps, rang et talents s'accordent : la fin paisible.", es: "Cuerpo, rango y habilidades encajan: el final tranquilo." },
  },
  legend: {
    title: { ko: "전설이 됨", en: "You become a legend", ja: "伝説になる", zh: "成为传说", fr: "Vous devenez une légende", es: "Te vuelves leyenda" },
    body: { ko: "웹소설 그대로의 결말. 정조 시대에 이름 석 자를 남겨요(물론 놀이 속에서만).", en: "The full web-novel ending: your name lives on in Jeongjo's age (in the game, anyway).", ja: "ウェブ小説そのままの結末。正祖の時代に名を残します（遊びの中で）。", zh: "网文式结局：在正祖时代留下名字（当然只在游戏里）。", fr: "La fin de roman : votre nom reste sous Jeongjo (dans le jeu).", es: "El final de novela: tu nombre queda en la era de Jeongjo (en el juego)." },
  },
};

const C = {
  tropeLabel: { ko: "어떻게 넘어갈까요?", en: "How do you cross over?", ja: "どうやって渡る？", zh: "怎么穿越？", fr: "Comment passer ?", es: "¿Cómo cruzas?" },
  skillLabel: { ko: "가져갈 현대 기술 (최대 3개)", en: "Modern skills you bring (up to 3)", ja: "持っていく現代の技術（最大3つ）", zh: "带去的现代技能（最多3项）", fr: "Talents modernes emportés (3 max)", es: "Habilidades modernas que llevas (máx. 3)" },
  draw: { ko: "1789년으로 넘어가기", en: "Cross over to 1789", ja: "1789年へ渡る", zh: "穿越到1789年", fr: "Passer en 1789", es: "Cruzar a 1789" },
  again: { ko: "다시 넘어가기", en: "Cross over again", ja: "もう一度渡る", zh: "再穿越一次", fr: "Recommencer", es: "Otra vez" },
  heroKicker: { ko: "1789년 정조 13년, 나의 회빙환", en: "Your crossing to 1789, King Jeongjo's 13th year", ja: "1789年 正祖13年、私の転生譚", zh: "1789年正祖十三年，我的穿越", fr: "Votre passage en 1789, 13e année de Jeongjo", es: "Tu cruce a 1789, año 13 de Jeongjo" },
  bodyTitle: { ko: "내 몸과 자리", en: "Your body and place", ja: "私の体と立場", zh: "我的身体与身份", fr: "Votre corps et votre rang", es: "Tu cuerpo y tu lugar" },
  bodyPossess: { ko: "{status} {name}, {age}세의 몸에 들어왔어요.", en: "You are now {name}, a {status} aged {age}.", ja: "{status}の{name}、{age}歳の体に入りました。", zh: "你进入了{status}{name}（{age}岁）的身体。", fr: "Vous voici {name}, {status}, {age} ans.", es: "Ahora eres {name}, {status}, de {age} años." },
  bodyReborn: { ko: "{status} 집안의 아기로 태어났어요. 호적엔 이렇게 오를 거예요.", en: "You are born into a {status} household. The register will read:", ja: "{status}の家に赤ん坊として生まれました。戸籍にはこう載ります。", zh: "你出生在{status}之家，户籍上会这样写：", fr: "Vous naissez dans un foyer {status}. Le registre dira :", es: "Naces en un hogar {status}. El registro dirá:" },
  bodySlip: { ko: "호적에도 없고, 열여섯 살 넘은 남자라면 꼭 차야 하는 호패도 없는 낯선 사람이에요. 의심부터 받아요.", en: "You are in no register and carry no hopae, the ID tag every man over sixteen had to wear. Suspicion comes first.", ja: "戸籍にもなく、16歳を超えた男性なら必ず持つ号牌もない見知らぬ人。まず疑われます。", zh: "户籍上没有你，也没有十六岁以上男子必须佩戴的号牌。先被怀疑。", fr: "Absent des registres, sans hopae, la plaque que tout homme de plus de seize ans devait porter : on se méfie.", es: "No estás en ningún registro ni llevas hopae, la placa que todo varón de más de dieciséis debía portar: desconfían." },
  shareNote: { ko: "몸의 신분은 1789년 대구 호적의 비율(양반 38%, 상민 46%, 노비 16%)로 뽑아요.", en: "The body's status follows the 1789 Daegu registers: yangban 38%, commoners 46%, nobi 16%.", ja: "体の身分は1789年大邱戸籍の割合（両班38%・常民46%・奴婢16%）で引きます。", zh: "身体的身份按1789年大邱户籍比例抽取（两班38%、常民46%、奴婢16%）。", fr: "Le rang suit les registres de Daegu en 1789 : yangban 38 %, roturiers 46 %, nobi 16 %.", es: "El rango sigue los registros de Daegu de 1789: yangban 38 %, plebeyos 46 %, nobi 16 %." },
  skillsTitle: { ko: "가져간 기술, 1789년에 통할까", en: "Do your skills work in 1789?", ja: "持っていった技術は1789年に通じる？", zh: "带去的技能在1789年管用吗", fr: "Vos talents servent-ils en 1789 ?", es: "¿Sirven tus habilidades en 1789?" },
  noSkills: { ko: "아무 기술도 안 가져갔어요. 맨몸이에요.", en: "You brought nothing. Bare hands.", ja: "何も持っていきませんでした。身一つです。", zh: "什么都没带，赤手空拳。", fr: "Rien emporté : mains nues.", es: "No llevaste nada: manos vacías." },
  scoreTitle: { ko: "생존 점수 {s}점", en: "Survival score {s}", ja: "生存スコア {s}点", zh: "生存分数 {s}", fr: "Score de survie : {s}", es: "Puntuación de supervivencia: {s}" },
  scoreNote: { ko: "재미용 점수예요. 몸의 신분(양반 3·상민 2·노비 1·타임슬립 0)에 기술 점수(통함 2·반쯤 1·못 씀 0)를 더하고, 환생은 기술을 절반만 쳐요. 실제 역사 속 생존 가능성을 계산한 게 아니에요.", en: "A play score: the body's footing (yangban 3, commoner 2, nobi 1, time slip 0) plus skills (works 2, partly 1, useless 0), halved for rebirth. It is not a historical survival estimate.", ja: "遊びのスコアです。体の身分（両班3・常民2・奴婢1・タイムスリップ0）に技術点（通じる2・半分1・使えない0）を足し、転生は技術を半分に数えます。歴史的な生存確率ではありません。", zh: "游戏分数：身份（两班3、常民2、奴婢1、穿越0）加技能分（管用2、一半1、没用0），转生的技能分减半。并非真实的历史生存概率。", fr: "Score de jeu : rang (yangban 3, roturier 2, nobi 1, saut 0) plus talents (2, 1, 0), divisés par deux pour une renaissance. Pas une estimation historique.", es: "Puntuación de juego: rango (yangban 3, plebeyo 2, nobi 1, salto 0) más habilidades (2, 1, 0), a la mitad si renaces. No es una estimación histórica." },
  cardKicker: { ko: "1789 · 회빙환 시뮬레이터", en: "1789 · Isekai simulator", ja: "1789・転生シミュレーター", zh: "1789·穿越模拟器", fr: "1789 · Simulateur d'isekai", es: "1789 · Simulador isekai" },
  badge: { ko: "정조 13년", en: "Jeongjo year 13", ja: "正祖13年", zh: "正祖十三年", fr: "An 13 de Jeongjo", es: "Año 13 de Jeongjo" },
  src1: { ko: "1789 호적 속 나 (신분 비율 출처 포함)", en: "Me in the 1789 register (status share sources)", ja: "1789年の戸籍の中の私（出典）", zh: "1789户籍中的我（比例出处）", fr: "Moi dans le registre de 1789 (sources)", es: "Yo en el registro de 1789 (fuentes)" },
  src2: { ko: "위키백과: 신해통공", en: "Korean Wikipedia: Sinhae Tonggong (1791)", ja: "韓国語版ウィキペディア：辛亥通共", zh: "韩文维基百科：辛亥通共", fr: "Wikipédia coréen : Sinhae Tonggong", es: "Wikipedia coreana: Sinhae Tonggong" },
  src3: { ko: "위키백과: 고구마·감자의 전래", en: "Korean Wikipedia: sweet potato and potato", ja: "韓国語版ウィキペディア：サツマイモ・ジャガイモ", zh: "韩文维基百科：红薯与土豆", fr: "Wikipédia coréen : patate douce et pomme de terre", es: "Wikipedia coreana: boniato y papa" },
  src4: { ko: "위키백과: 사역원·호패", en: "Korean Wikipedia: Sayeogwon and hopae", ja: "韓国語版ウィキペディア：司訳院・号牌", zh: "韩文维基百科：司译院与号牌", fr: "Wikipédia coréen : Sayeogwon et hopae", es: "Wikipedia coreana: Sayeogwon y hopae" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

function TropePicker({ value, onChange, l }: { value: Trope; onChange: (t: Trope) => void; l: L }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-foreground">{pick(C.tropeLabel, l)}</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup">
        {(Object.keys(TROPES) as Trope[]).map((t) => (
          <Button key={t} role="radio" aria-checked={value === t} variant={value === t ? "default" : "outline"} onClick={() => onChange(t)}>
            {pick(TROPES[t].name, l)}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{pick(TROPES[value].how, l)}</p>
    </div>
  );
}

function SkillPicker({ value, onChange, l }: { value: SkillId[]; onChange: (v: SkillId[]) => void; l: L }) {
  const toggle = (id: SkillId) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else if (value.length < MAX_SKILLS) onChange([...value, id]);
  };
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-foreground">
        {pick(C.skillLabel, l)} · {value.length}/{MAX_SKILLS}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SKILLS.map((s) => {
          const on = value.includes(s.id);
          return (
            <Button key={s.id} aria-pressed={on} variant={on ? "default" : "outline"} disabled={!on && value.length >= MAX_SKILLS} onClick={() => toggle(s.id)}>
              {s.icon} {pick(s.name, l)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default function Hoebinghwan1789({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [mode, setMode] = useState<Mode>("birthday");
  const [trope, setTrope] = useState<Trope>("possess");
  const [skills, setSkills] = useState<SkillId[]>([]);
  const [run, setRun] = useState<Run | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseRun(window.location.search);
    if (shared) {
      setRun(shared);
      setTrope(shared.trope);
      setSkills(shared.skills);
    }
  }, []);

  function go(rand: () => number, age: number, how: string) {
    const next = makeRun(trope, skills, age, rand);
    funnel(how);
    warp.start(() => {
      setRun(next);
      setRound((r) => r + 1);
      setShareQuery(formatRun(next));
      stampEpisode(EP);
    });
  }

  const sc = run ? score(run) : 0;
  const end = run ? ENDINGS[ending(sc)] : null;
  const body = run?.body ?? null;
  const name = body ? registerName(body) : null;
  const statusName = body ? pick(STATUS_NAME[body.status], l) : "";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1789} l={l} onDone={warp.finish} />}
      <TropePicker value={trope} onChange={setTrope} l={l} />
      <SkillPicker value={skills} onChange={setSkills} l={l} />
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => go(birthdayRandom(EP, `${b}|${trope}`), ageFromBirthday(b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => go(Math.random, 16 + Math.floor(Math.random() * 45), "random")}>
          {pick(run ? C.again : C.draw, l)}
        </Button>
      )}

      {run && end && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">
              {pick(C.heroKicker, l)} · {pick(TROPES[run.trope].name, l)}
            </p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(end.title, l)}</p>
            <p className="mt-4 text-base leading-relaxed text-foreground">{pick(end.body, l)}</p>
          </section>

          <Panel label={pick(C.bodyTitle, l)}>
            {run.trope === "slip" || !body || !name ? (
              <p className="text-sm leading-relaxed">{pick(C.bodySlip, l)}</p>
            ) : (
              <div className="space-y-2 text-sm leading-relaxed">
                <p>
                  {run.trope === "possess"
                    ? fill(pick(C.bodyPossess, l), { status: statusName, name: l === "ko" ? name.ko : `${name.ko} (${name.hanja})`, age: body.age })
                    : fill(pick(C.bodyReborn, l), { status: statusName })}
                </p>
                <p className="font-serif text-base text-foreground" lang="ko">{registerLine(body)}</p>
              </div>
            )}
            <p className="pt-2 text-xs text-muted-foreground">
              {pick(C.shareNote, l)}
            </p>
          </Panel>

          <Panel label={pick(C.skillsTitle, l)}>
            {run.skills.length === 0 ? (
              <p className="text-sm">{pick(C.noSkills, l)}</p>
            ) : (
              <ul className="space-y-3">
                {run.skills.map((id) => {
                  const s = skillById(id)!;
                  return (
                    <li key={id} className="text-sm leading-relaxed">
                      <p className="font-bold text-foreground">
                        {s.icon} {pick(s.name, l)} · <span className={s.verdict === "works" ? "text-primary" : "text-muted-foreground"}>{pick(VERDICT[s.verdict], l)}</span>
                      </p>
                      <p className="text-muted-foreground">{pick(s.why, l)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel label={fill(pick(C.scoreTitle, l), { s: sc })}>
            <p className="text-xs leading-relaxed text-muted-foreground">{pick(C.scoreNote, l)}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: `https://oiyo.net/${locale}/joseon-1789/` },
              { label: pick(C.src2, l), url: "https://ko.wikipedia.org/wiki/%EC%8B%A0%ED%95%B4%ED%86%B5%EA%B3%B5" },
              { label: pick(C.src3, l), url: "https://ko.wikipedia.org/wiki/%EA%B3%A0%EA%B5%AC%EB%A7%88" },
              { label: pick(C.src3, l), url: "https://ko.wikipedia.org/wiki/%EA%B0%90%EC%9E%90" },
              { label: pick(C.src4, l), url: "https://ko.wikipedia.org/wiki/%EC%82%AC%EC%97%AD%EC%9B%90" },
              { label: pick(C.src4, l), url: "https://ko.wikipedia.org/wiki/%ED%98%B8%ED%8C%A8" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-hoebinghwan-1789-${run.trope}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: pick(end.title, l),
              subtitle: `${pick(TROPES[run.trope].name, l)}${body ? ` · ${statusName}` : ""} · ${fill(pick(C.scoreTitle, l), { s: sc })}`,
              badge: pick(C.badge, l),
              lines: [pick(end.body, l)],
              footer: "oiyo.net · 1789",
              accent: "#2f4a3a",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
