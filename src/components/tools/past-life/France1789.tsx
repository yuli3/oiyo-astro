import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { birthdayRandom, oneIn } from "../../../lib/past-life-1426";
import { FR_DEPUTIES, FR_PEOPLE, compareFrance, deputyChance, drawFrance, formatFrance, frEstate, frOneIn, parseFrance, type FrGroup, type FrLife } from "../../../lib/past-life-eras";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, oneInText, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, FriendBanner, FriendCompare, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, isOwn, rarityLabel, rememberOwn, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "france-1789" as const;

const SOURCES = [
  { label: "Lefebvre, The Coming of the French Revolution (via World History Encyclopedia)", url: "https://worldhistory.org/article/1960/the-three-estates-of-pre-revolutionary-france" },
  { label: "Estates General of 1789 (Wikipedia)", url: "https://en.wikipedia.org/wiki/Estates_General_of_1789" },
];

const ESTATE: Record<1 | 2 | 3, Six> = {
  1: { ko: "제1신분 · 성직자", en: "First Estate · clergy", ja: "第一身分・聖職者", zh: "第一等级·教士", fr: "Premier ordre · clergé", es: "Primer estado · clero" },
  2: { ko: "제2신분 · 귀족", en: "Second Estate · nobility", ja: "第二身分・貴族", zh: "第二等级·贵族", fr: "Second ordre · noblesse", es: "Segundo estado · nobleza" },
  3: { ko: "제3신분 · 평민", en: "Third Estate · commoners", ja: "第三身分・平民", zh: "第三等级·平民", fr: "Tiers état", es: "Tercer estado · plebeyos" },
};

const GROUP: Record<FrGroup, { name: Six; day: Six }> = {
  clergy: {
    name: { ko: "성직자", en: "Cleric", ja: "聖職者", zh: "教士", fr: "Membre du clergé", es: "Clérigo" },
    day: { ko: "7월 14일 아침, 당신은 본당에서 미사를 드려요. 저녁 무렵 파리에서 바스티유가 함락됐다는 소문이 마을까지 번져 와요. 십일조를 걷던 교회의 앞날이 흔들리기 시작해요.", en: "On the morning of 14 July you say Mass in your parish. By evening a rumour arrives from Paris: the Bastille has fallen. The Church that collects the tithe starts to look uncertain.", ja: "7月14日の朝、あなたは教区でミサをあげます。夕方、パリでバスティーユが陥落したという噂が届きます。十分の一税を集める教会の先行きが揺らぎ始めます。", zh: "7月14日早晨，你在本堂做弥撒。傍晚，巴士底狱陷落的传闻从巴黎传来。收什一税的教会前途开始动摇。", fr: "Le matin du 14 juillet, vous célébrez la messe dans votre paroisse. Le soir, une rumeur arrive de Paris : la Bastille est tombée. L'Église de la dîme vacille.", es: "La mañana del 14 de julio dices misa en tu parroquia. Al anochecer llega un rumor de París: ha caído la Bastilla. La Iglesia del diezmo empieza a tambalearse." },
  },
  nobility: {
    name: { ko: "귀족", en: "Noble", ja: "貴族", zh: "贵族", fr: "Noble", es: "Noble" },
    day: { ko: "7월 14일, 당신은 영지의 저택에서 소작료 장부를 봐요. 파리 소식이 닿자 하인들이 수군거려요. 몇 주 뒤 시골에서는 '대공포'가 번지고, 8월 4일 밤 귀족의 특권이 폐지돼요.", en: "On 14 July you check the rent books at your country house. When news from Paris arrives the servants whisper. Weeks later the Great Fear sweeps the countryside, and on the night of 4 August noble privileges are abolished.", ja: "7月14日、あなたは領地の館で小作料の帳簿を見ています。パリの知らせに使用人がざわめきます。数週間後、地方に「大恐怖」が広がり、8月4日の夜、貴族の特権が廃止されます。", zh: "7月14日，你在庄园宅邸查看地租账本。巴黎的消息传来，仆人们窃窃私语。几周后乡村爆发“大恐慌”，8月4日夜贵族特权被废除。", fr: "Le 14 juillet, vous vérifiez les registres de redevances au château. La nouvelle de Paris fait chuchoter les domestiques. Quelques semaines plus tard, la Grande Peur gagne les campagnes, et dans la nuit du 4 août les privilèges sont abolis.", es: "El 14 de julio revisas los libros de rentas en tu casa de campo. Al llegar la noticia de París, los criados murmuran. Semanas después el Gran Miedo recorre el campo y la noche del 4 de agosto se abolen los privilegios." },
  },
  bourgeoisie: {
    name: { ko: "부르주아(상인·법률가)", en: "Bourgeois (merchant or lawyer)", ja: "ブルジョワ（商人・法律家）", zh: "资产阶级（商人·律师）", fr: "Bourgeois (négociant ou homme de loi)", es: "Burgués (comerciante o abogado)" },
    day: { ko: "7월 14일, 당신은 도시의 카페에서 신문을 읽어요. 네케르 해임 소식에 분노한 군중이 무기를 찾아 나서고, 오후에 바스티유가 무너져요. 당신 같은 사람들이 새 의회를 이끌게 돼요.", en: "On 14 July you read the papers in a town café. Angry at Necker's dismissal, crowds hunt for weapons; in the afternoon the Bastille falls. People like you will lead the new assembly.", ja: "7月14日、あなたは町のカフェで新聞を読みます。ネッケル罷免に怒った群衆が武器を探し、午後にバスティーユが落ちます。あなたのような人々が新しい議会を率いていきます。", zh: "7月14日，你在城里的咖啡馆读报。因内克尔被免职而愤怒的人群四处寻找武器，下午巴士底狱陷落。像你这样的人将领导新的议会。", fr: "Le 14 juillet, vous lisez les gazettes au café. Furieuse du renvoi de Necker, la foule cherche des armes ; l'après-midi, la Bastille tombe. Des gens comme vous mèneront la nouvelle Assemblée.", es: "El 14 de julio lees la prensa en un café. Furiosa por la destitución de Necker, la multitud busca armas; por la tarde cae la Bastilla. Gente como tú dirigirá la nueva asamblea." },
  },
  peasants: {
    name: { ko: "농민", en: "Peasant", ja: "農民", zh: "农民", fr: "Paysan", es: "Campesino" },
    day: { ko: "7월 14일, 당신은 밀밭에서 일해요. 지난해 흉작으로 빵값이 치솟아 있어요. 파리 소식은 며칠 늦게 닿고, 곧 영주의 장부를 불태우는 '대공포'가 이웃 마을까지 번져요.", en: "On 14 July you work the wheat fields. Last year's bad harvest has sent bread prices soaring. News from Paris arrives days later, and soon the Great Fear, burning manor records, reaches the next village.", ja: "7月14日、あなたは麦畑で働いています。昨年の凶作でパンの値段は高騰。パリの知らせは数日遅れで届き、やがて領主の帳簿を焼く「大恐怖」が隣村まで広がります。", zh: "7月14日，你在麦田劳作。去年歉收，面包价格飞涨。巴黎的消息几天后才传到，很快烧毁领主账簿的“大恐慌”蔓延到邻村。", fr: "Le 14 juillet, vous travaillez aux blés. La mauvaise récolte de l'an passé a fait flamber le pain. La nouvelle de Paris arrive des jours plus tard, et bientôt la Grande Peur, qui brûle les terriers, atteint le village voisin.", es: "El 14 de julio trabajas en los trigales. La mala cosecha del año anterior disparó el pan. La noticia de París llega días después y pronto el Gran Miedo, que quema los registros señoriales, alcanza el pueblo vecino." },
  },
  urban: {
    name: { ko: "도시 장인·노동자", en: "Town artisan or worker", ja: "都市の職人・労働者", zh: "城市工匠·工人", fr: "Artisan ou ouvrier des villes", es: "Artesano u obrero urbano" },
    day: { ko: "7월 14일, 당신은 파리 생탕투안 거리의 작업장에 있어요. 오전에 앵발리드에서 총을 챙긴 군중이 오후에 바스티유로 몰려가요. 당신도 그 행렬 속에 있을지 몰라요.", en: "On 14 July you are in a workshop in the Faubourg Saint-Antoine. In the morning crowds seize muskets at the Invalides; in the afternoon they march on the Bastille. You may well be among them.", ja: "7月14日、あなたはパリのサン＝タントワーヌ街の工房にいます。午前に廃兵院で銃を手にした群衆が、午後バスティーユへ押し寄せます。あなたもその列にいるかもしれません。", zh: "7月14日，你在巴黎圣安托万区的作坊里。上午人群在荣军院夺取枪支，下午涌向巴士底狱。你也许就在队伍中。", fr: "Le 14 juillet, vous êtes à l'atelier, faubourg Saint-Antoine. Le matin, la foule prend des fusils aux Invalides ; l'après-midi, elle marche sur la Bastille. Vous en êtes peut-être.", es: "El 14 de julio estás en un taller del arrabal de Saint-Antoine. Por la mañana la multitud toma fusiles en los Inválidos; por la tarde marcha sobre la Bastilla. Quizá estés entre ellos." },
  },
};

const C = {
  draw: { ko: "1789년으로 가기", en: "Go to 1789", ja: "1789年へ行く", zh: "前往1789年", fr: "Partir en 1789", es: "Ir a 1789" },
  again: { ko: "다시 태어나기", en: "Be born again", ja: "もう一度生まれる", zh: "再投胎一次", fr: "Renaître", es: "Renacer" },
  you: { ko: "1789년 프랑스 왕국, 당신은", en: "In the Kingdom of France, 1789, you are", ja: "1789年フランス王国、あなたは", zh: "1789年法兰西王国，你是", fr: "Royaume de France, 1789. Vous êtes", es: "Reino de Francia, 1789. Eres" },
  share: { ko: "이 무리의 인구", en: "People in this group", ja: "この集団の人口", zh: "该群体人口", fr: "Effectif de ce groupe", es: "Personas en este grupo" },
  deputyTitle: { ko: "5월 5일, 베르사유 삼부회", en: "5 May, the Estates-General at Versailles", ja: "5月5日、ヴェルサイユの三部会", zh: "5月5日，凡尔赛三级会议", fr: "5 mai, les États généraux à Versailles", es: "5 de mayo, los Estados Generales en Versalles" },
  deputyYes: { ko: "당신은 대표로 뽑혀 베르사유에 갔어요!", en: "You were elected a deputy and went to Versailles!", ja: "あなたは代表に選ばれ、ヴェルサイユへ行きました！", zh: "你被选为代表，前往凡尔赛！", fr: "Vous êtes élu député et partez pour Versailles !", es: "¡Te eligieron diputado y fuiste a Versalles!" },
  deputyNo: { ko: "대표로 뽑히지는 않았어요. 소식은 신문과 소문으로 들었어요.", en: "You were not elected. You followed it through papers and rumours.", ja: "代表には選ばれませんでした。新聞と噂で知りました。", zh: "你没有当选代表，只能从报纸和传闻得知消息。", fr: "Vous n'êtes pas élu. Vous suivez tout par les gazettes et les rumeurs.", es: "No te eligieron. Lo seguiste por la prensa y los rumores." },
  deputyOdds: { ko: "이 신분에서 대표가 될 확률", en: "Odds of being a deputy in this estate", ja: "この身分で代表になる確率", zh: "该等级当选代表的概率", fr: "Chances d'être député dans cet ordre", es: "Probabilidad de ser diputado en este estado" },
  deputyNote: { ko: "선출 대표는 성직자 302 · 귀족 289 · 제3신분 611명이에요. 제3신분은 같은 비율로 뽑았어요(실제 대표의 절반은 법률가였어요).", en: "Deputies elected: 302 clergy, 289 nobles, 611 Third Estate. The Third Estate uses one rate for all groups (in reality half its deputies were lawyers).", ja: "選出代表は聖職者302・貴族289・第三身分611人。第三身分は同じ比率で引きます（実際は半分が法律家）。", zh: "当选代表：教士302、贵族289、第三等级611人。第三等级按同一比例抽取（实际上一半是律师）。", fr: "Députés élus : 302 du clergé, 289 nobles, 611 du tiers. Le tiers utilise un même taux pour tous (en réalité la moitié étaient des hommes de loi).", es: "Diputados: 302 del clero, 289 nobles, 611 del tercer estado. El tercer estado usa una misma tasa (en realidad la mitad eran abogados)." },
  day: { ko: "1789년 7월 14일, 당신의 하루", en: "Your 14 July 1789", ja: "1789年7月14日、あなたの一日", zh: "1789年7月14日，你的一天", fr: "Votre 14 juillet 1789", es: "Tu 14 de julio de 1789" },
  dayNote: { ko: "장면은 그날의 일반적인 모습을 바탕으로 쓴 이야기예요.", en: "The scene is a story based on what that day was generally like.", ja: "場面はその日の一般的な様子をもとにした物語です。", zh: "场景是根据当天的一般情况写的故事。", fr: "La scène est un récit fondé sur ce que fut généralement ce jour.", es: "La escena es un relato basado en cómo fue en general ese día." },
  popNote: { ko: "인구는 Lefebvre의 추정(전체 약 2,700만, 성직자 10만 이하, 귀족 약 40만, 부르주아 약 200만, 농민 약 80%)이고, 도시 장인·노동자는 남은 수를 계산한 값이에요.", en: "Population is Lefebvre's estimate (about 27M; clergy ≤100k, nobles ~400k, bourgeois ~2M, peasants ~80%); town workers are the computed remainder.", ja: "人口はルフェーヴルの推計（約2,700万、聖職者10万以下、貴族約40万、ブルジョワ約200万、農民約80%）。都市の職人・労働者は残りの計算値です。", zh: "人口为勒费弗尔的估计（约2700万，教士不超过10万，贵族约40万，资产阶级约200万，农民约80%），城市工匠与工人为剩余计算值。", fr: "Population selon Lefebvre (environ 27 M ; clergé ≤ 100 000, noblesse ~400 000, bourgeoisie ~2 M, paysans ~80 %) ; artisans et ouvriers des villes = reste calculé.", es: "Población según Lefebvre (unos 27 M; clero ≤100 000, nobleza ~400 000, burguesía ~2 M, campesinos ~80 %); los trabajadores urbanos son el resto calculado." },
  cardKicker: { ko: "1789 · 프랑스 왕국", en: "1789 · Kingdom of France", ja: "1789・フランス王国", zh: "1789·法兰西王国", fr: "1789 · Royaume de France", es: "1789 · Reino de Francia" },
  boss: { ko: "당신의 신분이 더 높아요!", en: "Your estate ranks higher!", ja: "あなたの身分のほうが上！", zh: "你的等级更高！", fr: "Votre ordre est au-dessus !", es: "¡Tu estado está por encima!" },
  junior: { ko: "친구의 신분이 더 높아요.", en: "Your friend's estate ranks higher.", ja: "友だちの身分のほうが上です。", zh: "朋友的等级更高。", fr: "L'ordre de votre ami est au-dessus.", es: "El estado de tu amigo está por encima." },
  peer: { ko: "같은 신분이에요.", en: "Same estate.", ja: "同じ身分です。", zh: "同一等级。", fr: "Même ordre.", es: "Mismo estado." },
} satisfies Record<string, Six>;

export default function France1789({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("random");
  const [life, setLife] = useState<FrLife | null>(null);
  const [friend, setFriend] = useState<FrLife | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseFrance(window.location.search);
    if (shared) {
      setLife(shared);
      if (!isOwn(EP, formatFrance(shared))) setFriend(shared);
    }
  }, []);

  function show(next: FrLife, how: string) {
    funnel(how);
    warp.start(() => {
      setLife(next);
      setRound((r) => r + 1);
      setShareQuery(formatFrance(next));
      rememberOwn(EP, formatFrance(next));
      stampEpisode(EP);
    });
  }

  const label = (x: FrLife) => `${pick(GROUP[x.group].name, l)}${x.deputy ? " · ★" : ""}`;
  const verdict = (v: "me" | "friend" | "same") => pick(v === "me" ? C.boss : v === "friend" ? C.junior : C.peer, l);

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={2026} to={1789} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["random", "birthday"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} onSubmit={(b) => show(drawFrance(birthdayRandom(EP, b)), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => show(drawFrance(), "random")}>
          {life && life !== friend ? pick(C.again, l) : pick(C.draw, l)}
        </Button>
      )}

      {life && friend && life === friend && <FriendBanner l={l} />}

      {life && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          {friend && life !== friend && (
            <FriendCompare
              l={l}
              fmt={fmt}
              testId={EP}
              mine={{ label: label(life), n: frOneIn(life) }}
              friend={{ label: label(friend), n: frOneIn(friend) }}
              verdict={verdict(compareFrance(life, friend))}
            />
          )}
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-md">
            <div className="flex h-3" aria-hidden="true">
              <span className="flex-1 bg-fr-blue" />
              <span className="flex-1 bg-background" />
              <span className="flex-1 bg-fr-red" />
            </div>
            <div className="p-6 text-center">
              <p className="text-sm font-bold text-muted-foreground">{pick(C.you, l)}</p>
              <p className="mt-2 font-serif text-4xl font-black text-foreground">{pick(GROUP[life.group].name, l)}</p>
              <p className="mt-1 text-lg font-bold text-muted-foreground">{pick(ESTATE[frEstate(life.group)], l)}</p>
              {life.deputy && <p className="mt-3 text-base font-black text-primary">★ {pick(C.deputyYes, l)}</p>}
            </div>
          </section>
          <RarityBadge n={frOneIn(life)} l={l} fmt={fmt} />

          <Panel label={pick(C.share, l)}>
            <p className="text-2xl font-black">{fmt.format(FR_PEOPLE[life.group])}</p>
            <p>{oneInText(oneIn(FR_PEOPLE[life.group] / 27_000_000), l, fmt)}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.popNote, l)}</p>
            <Sources l={l} items={SOURCES.slice(0, 1)} />
          </Panel>

          <Panel label={pick(C.deputyTitle, l)}>
            <p className="text-lg font-bold">{pick(life.deputy ? C.deputyYes : C.deputyNo, l)}</p>
            <p>
              {pick(C.deputyOdds, l)}: {oneInText(oneIn(deputyChance(life.group)), l, fmt)} ({fmt.format(FR_DEPUTIES[frEstate(life.group)])})
            </p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.deputyNote, l)}</p>
            <Sources l={l} items={SOURCES.slice(1)} />
          </Panel>

          <Panel label={pick(C.day, l)}>
            <p className="leading-relaxed">{pick(GROUP[life.group].day, l)}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.dayNote, l)}</p>
          </Panel>

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-france-1789-${life.group}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: pick(GROUP[life.group].name, l),
              subtitle: pick(ESTATE[frEstate(life.group)], l),
              badge: `★ ${rarityLabel(frOneIn(life), l)} · ${oneInText(frOneIn(life), l, fmt)}`,
              lines: [pick(life.deputy ? C.deputyYes : C.deputyNo, l)],
              footer: "oiyo.net · 1789",
              accent: "#1f3f8f",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
