import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { DAMAGE, PICKS, PROPOSALS, byId, dayKey, formatPicks, parsePicks, rankOf, score, type Outcome, type Rank } from "../../../lib/hanyang-fire-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "hanyang-fire-1426" as const;

const P: Record<string, Six> = {
  relief: { ko: "집 잃은 사람에게 식량 나누고 다친 사람 치료하기", en: "Feed those who lost their homes and treat the burned", ja: "焼け出された人に食糧を配り、負傷者を治療する", zh: "给失去家园的人分粮，治疗烧伤者", fr: "Nourrir les sinistrés et soigner les brûlés", es: "Alimentar a quienes perdieron su casa y curar a los heridos" },
  firewall: { ko: "길가 행랑 사이에 불 막는 담 쌓기", en: "Build firewalls between the street-side row houses", ja: "通り沿いの行廊に防火壁を築く", zh: "在沿街行廊之间砌防火墙", fr: "Bâtir des murs coupe-feu entre les galeries", es: "Levantar cortafuegos entre las galerías de la calle" },
  roads: { ko: "길을 넓혀 불길이 못 건너게 하기", en: "Widen the roads so fire cannot jump across", ja: "道を広げて火が渡れないようにする", zh: "拓宽道路，让火跳不过去", fr: "Élargir les rues pour que le feu ne les franchisse pas", es: "Ensanchar las calles para que el fuego no las cruce" },
  wells: { ko: "집 몇 채마다 우물 하나씩 파기", en: "Dig a well for every few houses", ja: "数軒ごとに井戸を掘る", zh: "每几户挖一口井", fr: "Creuser un puits pour quelques maisons", es: "Cavar un pozo cada pocas casas" },
  tools: { ko: "종묘·궁궐·종루에 불 끄는 도구 갖춰 두기", en: "Store firefighting tools at the shrine, palace and bell tower", ja: "宗廟・宮殿・鐘楼に消火道具を備える", zh: "在宗庙、宫中、钟楼备好灭火器具", fr: "Ranger des outils anti-feu au sanctuaire, au palais et au beffroi", es: "Guardar herramientas contra incendios en el santuario, el palacio y el campanario" },
  watch: { ko: "동네마다 밤에 돌아가며 불침번 서기", en: "Neighbourhood night watch in turns", ja: "町ごとに夜の見張りを交代で立てる", zh: "各坊轮流守夜", fr: "Veille de nuit tournante dans chaque quartier", es: "Guardia nocturna por turnos en cada barrio" },
  jars: { ko: "다섯 집마다 물 채운 독 두기", en: "A water jar for every five houses", ja: "五軒ごとに水瓶を置く", zh: "每五户放一口水缸", fr: "Une jarre d'eau pour cinq maisons", es: "Una tinaja de agua cada cinco casas" },
  agency: { ko: "불만 맡는 관청 따로 만들기", en: "Create an office just for fire prevention", ja: "火災だけを担う役所をつくる", zh: "专设管火的官署", fr: "Créer un bureau dédié aux incendies", es: "Crear una oficina solo para incendios" },
  tiles: { ko: "초가 대신 기와를 싸게 구워 나눠 주기", en: "Fire cheap roof tiles to replace thatch", ja: "藁葺きの代わりに瓦を安く焼いて配る", zh: "廉价烧瓦，替换茅草屋顶", fr: "Cuire des tuiles bon marché pour remplacer le chaume", es: "Cocer tejas baratas para sustituir la paja" },
  bell: { ko: "종루에서 망보다 불나면 종 치기", en: "Watch from the bell tower and ring when fire breaks out", ja: "鐘楼で見張り、火事なら鐘を鳴らす", zh: "在钟楼瞭望，起火就敲钟", fr: "Guetter depuis le beffroi et sonner l'alarme", es: "Vigilar desde el campanario y tocar la campana" },
  pass: { ko: "밤에 불 끄러 가는 사람에게 통행패 주기", en: "Night passes for people rushing to a fire", ja: "夜に消火へ駆けつける人に通行札を渡す", zh: "给夜里赶去救火的人发通行牌", fr: "Laissez-passer de nuit pour ceux qui courent éteindre", es: "Salvoconductos nocturnos para quien corre a apagar" },
  noWine: { ko: "불조심하게 술을 금하기", en: "Ban alcohol so people are careful with fire", ja: "火の用心に酒を禁じる", zh: "禁酒以防火", fr: "Interdire l'alcool par prudence", es: "Prohibir el alcohol por precaución" },
  insurance: { ko: "집집마다 화재보험 들기", en: "Fire insurance for every household", ja: "各家に火災保険", zh: "家家买火灾保险", fr: "Une assurance incendie pour chaque foyer", es: "Seguro contra incendios para cada hogar" },
  pump: { ko: "물을 뿜는 손 펌프 만들기", en: "Build a hand pump that sprays water", ja: "水を噴く手押しポンプをつくる", zh: "造能喷水的手压泵", fr: "Construire une pompe à main", es: "Construir una bomba manual de agua" },
};

const OUT: Record<Outcome, { emoji: string; label: Six }> = {
  adopted: { emoji: "✅", label: { ko: "{m}월 {d}일 실제로 정함", en: "Adopted on lunar {m}/{d}", ja: "{m}月{d}日に実際に決定", zh: "{m}月{d}日实际采纳", fr: "Adopté le {d}/{m} lunaire", es: "Adoptado el {d}/{m} lunar" } },
  declined: { emoji: "🤔", label: { ko: "{m}월 {d}일 올라왔지만 세종이 미룸", en: "Proposed on {m}/{d}, but Sejong put it off", ja: "{m}月{d}日に上がったが世宗が見送り", zh: "{m}月{d}日有人提出，世宗暂缓", fr: "Proposé le {d}/{m}, Sejong l'a ajourné", es: "Propuesto el {d}/{m}, Sejong lo aplazó" } },
  absent: { emoji: "🌀", label: { ko: "1426년 실록에는 없는 생각", en: "Not in the 1426 Annals", ja: "1426年の実録にはない発想", zh: "1426年实录里没有的想法", fr: "Absent des Annales de 1426", es: "No aparece en los Anales de 1426" } },
};

const RANK: Record<Rank, { emoji: string; title: Six; body: Six }> = {
  sage: { emoji: "🏯", title: { ko: "금화도감 제조감", en: "Fire Bureau director material", ja: "禁火都監の提調の器", zh: "禁火都监提调之才", fr: "Étoffe d'un directeur du Bureau du feu", es: "Madera de director de la Oficina del Fuego" }, body: { ko: "고른 방안이 모두 세종 조정이 실제로 정한 것과 같아요. 불이 난 지 보름 남짓 만에 나온 대책을 미리 알고 있었던 셈이에요.", en: "Every pick matches what Sejong's court actually decided within about two weeks.", ja: "選んだ案はすべて世宗の朝廷が実際に決めたものと同じです。", zh: "你选的全是世宗朝廷实际定下的对策。", fr: "Chaque choix correspond à une décision réelle de la cour.", es: "Cada elección coincide con lo que decidió la corte." } },
  official: { emoji: "📜", title: { ko: "한성부 판관감", en: "Seoul magistrate material", ja: "漢城府判官の器", zh: "汉城府判官之才", fr: "Étoffe de magistrat de Hanyang", es: "Madera de magistrado de Hanyang" }, body: { ko: "거의 다 실제 대책과 맞아요. 하나는 그때 조정과 생각이 달랐어요.", en: "Almost all match the real measures; one went another way.", ja: "ほとんどが実際の対策と一致。一つは違いました。", zh: "几乎都与实际对策一致，只有一个不同。", fr: "Presque tout correspond ; un choix diffère.", es: "Casi todo coincide; uno fue distinto." } },
  clerk: { emoji: "🖌️", title: { ko: "금화도감 녹사감", en: "Fire Bureau clerk material", ja: "禁火都監の録事の器", zh: "禁火都监录事之才", fr: "Étoffe de greffier du Bureau du feu", es: "Madera de escribano de la Oficina del Fuego" }, body: { ko: "절반쯤 맞았어요. 나머지는 그때 조정이 다르게 판단했거나 아직 없던 생각이에요.", en: "About half match; the rest the court judged differently, or had not yet imagined.", ja: "半分ほど一致。残りは朝廷の判断が違ったか、まだない発想でした。", zh: "大约一半相符，其余是朝廷判断不同或当时还没有的想法。", fr: "Environ la moitié correspond.", es: "Más o menos la mitad coincide." } },
  dreamer: { emoji: "🌀", title: { ko: "시대를 앞서간 회귀자", en: "A returner ahead of the times", ja: "時代を先取りした回帰者", zh: "超前时代的回归者", fr: "Un revenant en avance sur son temps", es: "Un retornado adelantado a su tiempo" }, body: { ko: "고른 방안이 1426년 조정의 생각과 많이 달라요. 지금 우리에겐 익숙한 생각이 그때는 아직 없었어요.", en: "Your picks are far from the 1426 court's thinking: ideas familiar to us did not exist yet.", ja: "1426年の朝廷の考えとはかなり違います。", zh: "和1426年朝廷的想法差得较远。", fr: "Vos choix sont loin de la pensée de 1426.", es: "Tus elecciones están lejos del pensamiento de 1426." } },
};

const C = {
  sceneTitle: { ko: "눈을 떠 보니 1426년 2월 15일 한낮", en: "You wake up: noon, lunar 2/15, 1426", ja: "目を開けると1426年2月15日の昼", zh: "睁开眼，是1426年二月十五日正午", fr: "Vous vous réveillez : midi, 15e jour du 2e mois, 1426", es: "Despiertas: mediodía del día 15 del mes 2, 1426" },
  scene: { ko: "서북풍이 거세게 불어요. 한성 남쪽 인순부 종 장룡의 집에서 시작된 불이 경시서와 북쪽 행랑으로 번지고 있어요. 지금 알고 있는 것으로 조정에 올릴 불 대책 {n}가지를 골라 보세요.", en: "A strong north-west wind is blowing. A fire that began in a house south of the city is spreading to the market office and the northern row houses. Pick {n} fire measures to send to the court.", ja: "北西の風が強く吹いています。漢城南の家から出た火が京市署と北の行廊へ広がっています。朝廷に上げる防火策を{n}つ選んでください。", zh: "西北风大作。汉城南边一户人家起火，正烧向京市署和北边行廊。选{n}条防火对策上奏朝廷。", fr: "Un fort vent du nord-ouest souffle. Un feu parti d'une maison au sud gagne le bureau du marché. Choisissez {n} mesures à proposer à la cour.", es: "Sopla un fuerte viento del noroeste. Un fuego nacido en una casa al sur se extiende hacia la oficina del mercado. Elige {n} medidas para la corte." },
  chosen: { ko: "{k}/{n} 골랐어요", en: "{k}/{n} chosen", ja: "{k}/{n}選択", zh: "已选{k}/{n}", fr: "{k}/{n} choisies", es: "{k}/{n} elegidas" },
  submit: { ko: "조정에 올리기", en: "Send to the court", ja: "朝廷に上げる", zh: "上奏朝廷", fr: "Envoyer à la cour", es: "Enviar a la corte" },
  random: { ko: "아무거나 5가지", en: "Any 5", ja: "おまかせ5つ", zh: "随机5条", fr: "5 au hasard", es: "5 al azar" },
  kicker: { ko: "1426 한양 대화재 · 내가 올린 대책", en: "The 1426 Hanyang fire · my measures", ja: "1426漢陽大火・私の対策", zh: "1426汉阳大火·我的对策", fr: "Le grand incendie de 1426 · mes mesures", es: "El gran incendio de 1426 · mis medidas" },
  matched: { ko: "{t}가지 중 {n}가지가 실제 대책과 같아요", en: "{n} of {t} match the real measures", ja: "{t}つ中{n}つが実際の対策と一致", zh: "{t}条中有{n}条与实际对策相同", fr: "{n} sur {t} correspondent aux vraies mesures", es: "{n} de {t} coinciden con las medidas reales" },
  mine: { ko: "내가 올린 대책", en: "My measures", ja: "私の対策", zh: "我的对策", fr: "Mes mesures", es: "Mis medidas" },
  firstDay: { ko: "가장 빠른 것은 불난 지 {n}일 만에 정해졌어요", en: "The earliest was decided {n} days after the fire", ja: "最も早いものは火事から{n}日後に決まりました", zh: "最早的一条在火灾后{n}天定下", fr: "La plus rapide fut décidée {n} jours après", es: "La más rápida se decidió {n} días después" },
  timelineTitle: { ko: "실제로는 이렇게 흘러갔어요", en: "What really happened", ja: "実際にはこう進みました", zh: "实际是这样发展的", fr: "Ce qui s'est vraiment passé", es: "Lo que pasó de verdad" },
  damageTitle: { ko: "그날의 피해", en: "The damage", ja: "その日の被害", zh: "当日的损失", fr: "Les dégâts", es: "Los daños" },
  damage: { ko: "2월 15일 불로 행랑 {row}칸과 중부 {c}호·남부 {s}호·동부 {e}호, 모두 {t}호가 탔어요. 남자 {men}명, 여자 {women}명이 목숨을 잃었고, 실록은 불에 스러진 젖먹이와 늙고 병든 이는 그 수에 넣지 못했다고 적었어요. 이튿날 전옥서 서쪽에서 또 불이 나 {sd}여 호가 더 탔어요.", en: "On 2/15, {row} bays of row houses and {t} homes burned (central {c}, south {s}, east {e}). {men} men and {women} women died; the Annals note that infants and the old and sick who perished were not counted. The next day another fire burned over {sd} more homes.", ja: "2月15日の火事で行廊{row}間と{t}戸（中部{c}・南部{s}・東部{e}）が焼けました。男{men}人、女{women}人が亡くなり、乳児や老病者は数に入っていないと実録は記します。翌日も火が出て{sd}余戸が焼けました。", zh: "二月十五日的火烧毁行廊{row}间、民宅{t}户（中部{c}、南部{s}、东部{e}）。男{men}人、女{women}人罹难，实录说烧死的婴儿和老病者未计入。次日又起火，再烧{sd}余户。", fr: "Le 15, {row} travées de galeries et {t} maisons ont brûlé. {men} hommes et {women} femmes sont morts ; les Annales précisent que nourrissons, vieillards et malades ne sont pas comptés. Le lendemain, un autre feu a détruit plus de {sd} maisons.", es: "El día 15 ardieron {row} tramos de galerías y {t} casas. Murieron {men} hombres y {women} mujeres; los Anales señalan que no se contaron bebés, ancianos ni enfermos. Al día siguiente otro fuego quemó más de {sd} casas." },
  queen: { ko: "임금은 도성 밖 행차 중이었고, 한양에 남은 중궁(소헌왕후)이 \"돈과 곡식, 관청은 못 구하더라도 종묘와 창덕궁은 힘을 다해 지키라\"고 일렀어요. 종묘는 무사했어요.", en: "The king was away; Queen Soheon told the officials to save the royal shrine and Changdeok Palace above all. The shrine survived.", ja: "王は行幸中で、残った中宮（昭憲王后）が「宗廟と昌徳宮だけは力を尽くして守れ」と命じました。宗廟は無事でした。", zh: "国王出巡在外，留守的中宫（昭宪王后）命令\"宗庙与昌德宫须尽力救之\"。宗庙得以保全。", fr: "Le roi était absent ; la reine Soheon ordonna de sauver avant tout le sanctuaire et le palais Changdeok. Le sanctuaire fut épargné.", es: "El rey estaba fuera; la reina Soheon ordenó salvar ante todo el santuario y el palacio Changdeok. El santuario se salvó." },
  readDay: { ko: "그날 실록", en: "That day", ja: "その日の実録", zh: "那天的实录", fr: "Ce jour", es: "Ese día" },
  again: { ko: "다시 고르기", en: "Choose again", ja: "選び直す", zh: "重新选择", fr: "Recommencer", es: "Elegir de nuevo" },
  note: { ko: "날짜는 음력이에요. 실록에 나온 대책만 '실제'로 셌어요.", en: "Dates are lunar. Only measures recorded in the Annals count as real.", ja: "日付は旧暦です。実録にある対策だけを「実際」と数えました。", zh: "日期为农历。只把实录记载的对策算作\"实际\"。", fr: "Dates lunaires. Seules les mesures des Annales comptent.", es: "Fechas lunares. Solo cuentan las medidas de los Anales." },
  cardKicker: { ko: "1426 · 한양 대화재로 회귀", en: "1426 · Back to the Hanyang fire", ja: "1426・漢陽大火へ回帰", zh: "1426·回到汉阳大火", fr: "1426 · Retour au grand incendie", es: "1426 · Regreso al gran incendio" },
  badge: { ko: "회귀", en: "Return", ja: "回帰", zh: "回归", fr: "Retour", es: "Regreso" },
  src: { ko: "세종실록 8년 2~3월(위키문헌)", en: "Sejong Sillok, year 8, months 2–3 (Wikisource)", ja: "世宗実録8年2〜3月（ウィキソース）", zh: "世宗实录八年二至三月（维基文库）", fr: "Sejong Sillok, an 8, mois 2–3 (Wikisource)", es: "Sejong Sillok, año 8, meses 2–3 (Wikisource)" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
const outLabel = (id: string, l: ReturnType<typeof toL>) => {
  const p = byId(id)!;
  return `${OUT[p.outcome].emoji} ${fill(pick(OUT[p.outcome].label, l), { m: p.m ?? "", d: p.d ?? "" })}`;
};

export default function HanyangFire1426({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [sel, setSel] = useState<string[]>([]);
  const [done, setDone] = useState<string[] | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parsePicks(window.location.search);
    if (shared) setDone(shared);
  }, []);

  function toggle(id: string) {
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < PICKS ? [...s, id] : s));
  }

  function submit(ids: string[], how: string) {
    funnel(how);
    warp.start(() => {
      setDone(ids);
      setRound((r) => r + 1);
      setShareQuery(formatPicks(ids));
      stampEpisode(EP);
    });
  }

  function random() {
    const ids = PROPOSALS.map((p) => p.id).sort(() => Math.random() - 0.5).slice(0, PICKS);
    setSel(ids);
    submit(ids, "random");
  }

  const s = done ? score(done) : null;
  const rank = s ? RANK[rankOf(s)] : null;
  const sorted = done ? [...done].sort((a, b) => dayKey(byId(a)!) - dayKey(byId(b)!)) : [];
  const timeline = [...PROPOSALS].filter((p) => p.m).sort((a, b) => dayKey(a) - dayKey(b));

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1426} l={l} onDone={warp.finish} />}
      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="text-lg font-black text-foreground">🔥 {pick(C.sceneTitle, l)}</h2>
        <p className="text-sm leading-relaxed">{fill(pick(C.scene, l), { n: PICKS })}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PROPOSALS.map((p) => {
            const on = sel.includes(p.id);
            return (
              <label key={p.id} className={`flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm ${on ? "border-primary bg-primary/10 font-bold text-foreground" : "border-border bg-background"}`}>
                <input type="checkbox" className="mt-1 size-4" checked={on} disabled={!on && sel.length >= PICKS} onChange={() => toggle(p.id)} />
                <span>{pick(P[p.id]!, l)}</span>
              </label>
            );
          })}
        </div>
        <p className="text-sm font-bold text-foreground">{fill(pick(C.chosen, l), { k: sel.length, n: PICKS })}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" size="lg" className="flex-1" disabled={sel.length !== PICKS} onClick={() => submit(sel, "picked")}>
            {pick(C.submit, l)}
          </Button>
          <Button type="button" size="lg" variant="outline" onClick={random}>
            {pick(C.random, l)}
          </Button>
        </div>
      </section>

      {done && s && rank && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.kicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-foreground">
              {rank.emoji} {pick(rank.title, l)}
            </p>
            <p className="mt-2 text-lg font-bold">{fill(pick(C.matched, l), { n: s.adopted, t: PICKS })}</p>
            {s.firstDay !== null && <p className="mt-1 text-sm">{fill(pick(C.firstDay, l), { n: s.firstDay })}</p>}
            <p className="mt-3 text-sm">{pick(rank.body, l)}</p>
          </section>

          <Panel label={pick(C.mine, l)}>
            <ul className="space-y-3">
              {sorted.map((id) => {
                const p = byId(id)!;
                return (
                  <li key={id} className="rounded-lg bg-muted px-3 py-2">
                    <p className="font-bold text-foreground">{pick(P[id]!, l)}</p>
                    <p className="text-sm">{outLabel(id, l)}</p>
                    {p.quote && <p className="font-serif text-xs text-muted-foreground">{p.quote}</p>}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel label={pick(C.timelineTitle, l)}>
            <ol className="space-y-2 border-l-2 border-border pl-4">
              {timeline.map((p) => (
                <li key={p.id} className={done.includes(p.id) ? "font-bold text-foreground" : "text-muted-foreground"}>
                  <a className="underline" href={`/${locale}/sillok-1426/?c=l&m=${p.m}&d=${p.d}`}>
                    {p.m}/{p.d}
                  </a>{" "}
                  {OUT[p.outcome].emoji} {pick(P[p.id]!, l)}
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted-foreground">{pick(C.note, l)}</p>
          </Panel>

          <Panel label={pick(C.damageTitle, l)}>
            <p className="text-sm leading-relaxed">
              {fill(pick(C.damage, l), {
                row: DAMAGE.rowHouses,
                c: fmt.format(DAMAGE.houses.central),
                s: DAMAGE.houses.south,
                e: DAMAGE.houses.east,
                t: fmt.format(DAMAGE.housesTotal),
                men: DAMAGE.dead.men,
                women: DAMAGE.dead.women,
                sd: DAMAGE.secondDay,
              })}
            </p>
            <p className="text-sm leading-relaxed">{pick(C.queen, l)}</p>
            <a className="text-sm font-bold underline" href={`/${locale}/sillok-1426/?c=l&m=2&d=15`}>
              {pick(C.readDay, l)} 2/15 →
            </a>
          </Panel>

          <Sources l={l} items={[{ label: pick(C.src, l), url: "https://zh.wikisource.org/wiki/%E6%9C%9D%E9%AE%AE%E7%8E%8B%E6%9C%9D%E5%AF%A6%E9%8C%84/%E4%B8%96%E5%AE%97%E5%AF%A6%E9%8C%84/%E5%85%AB%E5%B9%B4" }]} />

          <SaveCard
            l={l}
            testId={EP}
            filename="oiyo-hanyang-fire-1426"
            spec={{
              kicker: pick(C.cardKicker, l),
              title: `${rank.emoji} ${pick(rank.title, l)}`,
              subtitle: fill(pick(C.matched, l), { n: s.adopted, t: PICKS }),
              badge: pick(C.badge, l),
              lines: sorted.map((id) => `${OUT[byId(id)!.outcome].emoji} ${pick(P[id]!, l)}`),
              footer: "oiyo.net · 1426",
              accent: "#9a3412",
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setSel([]);
              setDone(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {pick(C.again, l)}
          </Button>
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
