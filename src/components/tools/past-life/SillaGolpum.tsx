import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { GOLPUM_CAP, SILLA_RANKS, compareSilla, drawSilla, formatSilla, parseSilla, sillaOneIn, sillaRobe, type Golpum, type SillaLife, type SillaRobe } from "../../../lib/past-life-eras";
import { ArtifactImage, ArtifactNote } from "./TimeslipArtifacts";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, oneInText, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, FriendBanner, FriendCompare, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, isOwn, rarityLabel, rememberOwn, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "silla-golpum" as const;

const SOURCES = [
  { label: "한국민족문화대백과사전 「골품제도」", url: "https://encykorea.aks.ac.kr/Article/E0004196" },
  { label: "한국민족문화대백과사전 「경위」", url: "https://encykorea.aks.ac.kr/Article/E0002728" },
];

const GOLPUM: Record<Golpum, Six> = {
  jingol: { ko: "진골", en: "True bone (jingol)", ja: "真骨", zh: "真骨", fr: "Os véritable (jingol)", es: "Hueso verdadero (jingol)" },
  yuk: { ko: "6두품", en: "Head rank 6", ja: "六頭品", zh: "六头品", fr: "Rang de tête 6", es: "Rango de cabeza 6" },
  o: { ko: "5두품", en: "Head rank 5", ja: "五頭品", zh: "五头品", fr: "Rang de tête 5", es: "Rango de cabeza 5" },
  sa: { ko: "4두품", en: "Head rank 4", ja: "四頭品", zh: "四头品", fr: "Rang de tête 4", es: "Rango de cabeza 4" },
  pyeongmin: { ko: "평민(3~1두품)", en: "Commoner (head ranks 3–1)", ja: "平民（三〜一頭品）", zh: "平民（三至一头品）", fr: "Roturier (rangs 3 à 1)", es: "Plebeyo (rangos 3 a 1)" },
};

const ROBE: Record<SillaRobe, { cls: string; name: Six }> = {
  purple: { cls: "fill-silla-purple", name: { ko: "자색(紫) 공복", en: "Purple robe", ja: "紫の公服", zh: "紫色公服", fr: "Robe pourpre", es: "Túnica púrpura" } },
  crimson: { cls: "fill-silla-crimson", name: { ko: "비색(緋) 공복", en: "Crimson robe", ja: "緋の公服", zh: "绯色公服", fr: "Robe cramoisie", es: "Túnica carmesí" } },
  blue: { cls: "fill-silla-blue", name: { ko: "청색(靑) 공복", en: "Blue robe", ja: "青の公服", zh: "青色公服", fr: "Robe bleue", es: "Túnica azul" } },
  yellow: { cls: "fill-silla-yellow", name: { ko: "황색(黃) 공복", en: "Yellow robe", ja: "黄の公服", zh: "黄色公服", fr: "Robe jaune", es: "Túnica amarilla" } },
};
const STRIPE: Record<SillaRobe, string> = { purple: "bg-silla-purple", crimson: "bg-silla-crimson", blue: "bg-silla-blue", yellow: "bg-silla-yellow" };

const COMMONER_CLOTHES: Six = {
  ko: "평민의 삼베옷",
  en: "A commoner's hemp clothes",
  ja: "平民の麻の服",
  zh: "平民的麻布衣",
  fr: "Vêtements de chanvre d'un roturier",
  es: "Ropa de cáñamo de un plebeyo",
};

const C = {
  draw: { ko: "골품 받기", en: "Receive my bone rank", ja: "骨品を受け取る", zh: "领取骨品", fr: "Recevoir mon rang", es: "Recibir mi rango" },
  again: { ko: "다시 태어나기", en: "Be born again", ja: "もう一度生まれる", zh: "再投胎一次", fr: "Renaître", es: "Renacer" },
  you: { ko: "8세기 서라벌, 당신은", en: "In 8th-century Gyeongju you are", ja: "8世紀の徐羅伐、あなたは", zh: "8世纪的徐罗伐，你是", fr: "À Gyeongju au VIIIe siècle, vous êtes", es: "En la Gyeongju del siglo VIII eres" },
  rank: { ko: "오른 관등", en: "Rank reached", ja: "到達した官位", zh: "达到的官等", fr: "Rang atteint", es: "Rango alcanzado" },
  noRank: { ko: "관등 없음 · 서라벌 백성", en: "No rank · a commoner of the capital", ja: "官位なし・都の民", zh: "无官等·王都百姓", fr: "Sans rang · roturier de la capitale", es: "Sin rango · plebeyo de la capital" },
  noRankNote: { ko: "골품제 안의 평민은 경주에 사는 사람으로 한정됐고, 경위 관등은 4두품부터 받을 수 있었어요. 노비는 골품 밖이었어요.", en: "Commoners inside the bone-rank system were Gyeongju residents; capital ranks began at head rank 4. Slaves were outside the system.", ja: "骨品制の平民は慶州に住む人に限られ、京位は四頭品から。奴婢は骨品の外でした。", zh: "骨品制内的平民仅限住在庆州的人，京位从四头品开始。奴婢在骨品之外。", fr: "Les roturiers du système vivaient à Gyeongju ; les rangs de la capitale commençaient au rang 4. Les esclaves en étaient exclus.", es: "Los plebeyos del sistema vivían en Gyeongju; los rangos empezaban en el rango 4. Los esclavos quedaban fuera." },
  wallTitle: { ko: "골품의 벽", en: "The bone-rank wall", ja: "骨品の壁", zh: "骨品之墙", fr: "Le mur du rang", es: "El muro del rango" },
  noWall: { ko: "타고난 그릇만큼 올라갔어요. 골품의 벽에 막히지 않았어요.", en: "You rose as far as your talent went. The wall never stopped you.", ja: "器のぶんだけ昇りました。骨品の壁には阻まれませんでした。", zh: "凭本事升到了应有的位置，没有被骨品挡住。", fr: "Vous êtes monté selon votre talent. Le mur ne vous a pas arrêté.", es: "Subiste según tu talento. El muro no te frenó." },
  ladder: { ko: "17관등 사다리", en: "The 17-rank ladder", ja: "17官位のはしご", zh: "17官等阶梯", fr: "L'échelle des 17 rangs", es: "La escalera de 17 rangos" },
  dreamMark: { ko: "그릇", en: "talent", ja: "器", zh: "才干", fr: "talent", es: "talento" },
  youMark: { ko: "나", en: "you", ja: "わたし", zh: "我", fr: "vous", es: "tú" },
  capMark: { ko: "상한", en: "ceiling", ja: "上限", zh: "上限", fr: "plafond", es: "techo" },
  robe: { ko: "입을 공복", en: "Your court robe", ja: "着る公服", zh: "穿的公服", fr: "Votre robe", es: "Tu túnica" },
  robeNote: { ko: "공복 색은 관등으로 정해졌어요: 대아찬 이상 자색, 급찬 이상 비색, 나마 이상 청색, 조위 이상 황색.", en: "Robe colour followed rank: purple to rank 5, crimson to 9, blue to 11, yellow to 17.", ja: "公服の色は官位で決まりました。大阿飡以上は紫、級飡以上は緋、奈麻以上は青、造位以上は黄。", zh: "公服颜色按官等：大阿飡以上紫，级飡以上绯，奈麻以上青，造位以上黄。", fr: "Couleur selon le rang : pourpre jusqu'au 5e, cramoisi au 9e, bleu au 11e, jaune au 17e.", es: "Color según el rango: púrpura hasta el 5.º, carmesí al 9.º, azul al 11.º, amarillo al 17.º." },
  weightNote: { ko: "골품별 인구 기록은 남아 있지 않아요. 그래서 골품은 OIYO가 정한 놀이용 비율(진골 5 · 6두품 10 · 5두품 15 · 4두품 20 · 평민 30)로 뽑고, 타고난 그릇은 17관등 중 하나를 고르게 뽑아요. 관등 상한과 공복 색은 실제 제도 그대로예요.", en: "No population counts survive for the bone ranks, so they are drawn with OIYO's play weights (5 · 10 · 15 · 20 · 30), and talent is any of the 17 ranks with equal odds. The ceilings and robe colours are the real rules.", ja: "骨品別の人口記録は残っていません。骨品はOIYOが決めた遊び用の比率（5・10・15・20・30）で、器は17官位から均等に引きます。上限と公服の色は実際の制度どおりです。", zh: "骨品人口没有记录，骨品按OIYO设定的游戏比例（5·10·15·20·30）抽取，才干在17官等中均等抽取。上限与公服颜色依真实制度。", fr: "Aucun chiffre de population ne subsiste : les rangs d'os suivent des poids de jeu OIYO (5 · 10 · 15 · 20 · 30) et le talent est tiré parmi les 17 rangs. Plafonds et couleurs sont les vraies règles.", es: "No hay cifras de población: los rangos siguen pesos de juego de OIYO (5 · 10 · 15 · 20 · 30) y el talento se sortea entre los 17 rangos. Techos y colores son las reglas reales." },
  junghi: { ko: "통일 뒤에는 중위제가 생겨 6두품도 아찬 안에서 중아찬~4중아찬까지 오를 수 있었지만, 아찬 위로는 끝내 못 갔어요.", en: "After unification a sub-step system let head rank 6 climb to '4th-tier achan', but never above achan.", ja: "統一後は重位制で六頭品も重阿飡〜四重阿飡まで進めましたが、阿飡の上には行けませんでした。", zh: "统一后有重位制，六头品可升至重阿飡至四重阿飡，但始终超不过阿飡。", fr: "Après l'unification, des sous-échelons permirent au rang 6 d'aller jusqu'au « 4e achan », jamais au-dessus.", es: "Tras la unificación, subescalones permitieron al rango 6 llegar al «4.º achan», nunca más arriba." },
  cardKicker: { ko: "1300년 전 · 신라 서라벌", en: "Silla · 8th century", ja: "1300年前・新羅", zh: "1300年前·新罗", fr: "Silla · VIIIe siècle", es: "Silla · siglo VIII" },
  boss: { ko: "당신의 관등이 더 높아요!", en: "You outrank your friend!", ja: "あなたのほうが上の官位！", zh: "你的官等更高！", fr: "Vous êtes au-dessus !", es: "¡Tu rango es más alto!" },
  junior: { ko: "친구의 관등이 더 높아요.", en: "Your friend outranks you.", ja: "友だちのほうが上の官位です。", zh: "朋友的官等更高。", fr: "Votre ami est au-dessus.", es: "Tu amigo está por encima." },
  peer: { ko: "같은 자리, 동료예요.", en: "Same standing: colleagues.", ja: "同じ位、同僚です。", zh: "同一位置，是同僚。", fr: "Même rang : collègues.", es: "Mismo rango: colegas." },
} satisfies Record<string, Six>;

function rankName(rank: number, l: L) {
  const r = SILLA_RANKS[rank - 1];
  return l === "ja" || l === "zh" ? r.hanja : l === "ko" ? r.ko : `${r.ko} (${r.hanja})`;
}

function wallText(life: SillaLife, l: L): string {
  const cap = GOLPUM_CAP[life.golpum]!;
  const g = pick(GOLPUM[life.golpum], l);
  const d = rankName(life.dream, l);
  const c = rankName(cap, l);
  return {
    ko: `타고난 그릇은 ${d}감이었지만 ${g}라서 ${c}에서 멈췄어요. ${life.wall}칸이 막혔어요.`,
    en: `Your talent was worth ${d}, but as ${g} you stopped at ${c}: ${life.wall} ranks blocked.`,
    ja: `器は${d}でしたが、${g}なので${c}で止まりました。${life.wall}段がふさがれました。`,
    zh: `才干够得上${d}，但因为是${g}，止步于${c}，被挡住了${life.wall}级。`,
    fr: `Votre talent valait ${d}, mais en ${g} vous vous arrêtez à ${c} : ${life.wall} rangs bloqués.`,
    es: `Tu talento valía ${d}, pero como ${g} te detuviste en ${c}: ${life.wall} rangos bloqueados.`,
  }[l];
}

function Ladder({ life, l }: { life: SillaLife; l: L }) {
  const cap = GOLPUM_CAP[life.golpum];
  return (
    <ol className="space-y-1">
      {SILLA_RANKS.map((r, i) => {
        const n = i + 1;
        const blocked = cap !== null && n < cap;
        const marks = [n === life.dream ? `★ ${pick(C.dreamMark, l)}` : "", n === life.rank ? `● ${pick(C.youMark, l)}` : "", cap !== null && n === cap && cap !== 1 ? `┃ ${pick(C.capMark, l)}` : ""].filter(Boolean).join(" ");
        return (
          <li key={r.ko} className={`flex min-h-8 items-center gap-2 rounded-md px-2 text-sm ${n === life.rank ? "bg-primary/10 font-black text-foreground" : blocked ? "text-muted-foreground line-through" : "text-foreground"}`}>
            <span className={`h-4 w-1.5 shrink-0 rounded-full ${STRIPE[sillaRobe(n)]}`} aria-hidden="true" />
            <span className="w-6 shrink-0 tabular-nums text-muted-foreground">{n}</span>
            <span>{l === "ja" || l === "zh" ? r.hanja : `${r.ko} ${r.hanja}`}</span>
            {marks && <span className="ml-auto text-xs font-bold text-primary">{marks}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export default function SillaGolpum({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("random");
  const [life, setLife] = useState<SillaLife | null>(null);
  const [friend, setFriend] = useState<SillaLife | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseSilla(window.location.search);
    if (shared) {
      setLife(shared);
      if (!isOwn(EP, formatSilla(shared))) setFriend(shared);
    }
  }, []);

  function show(next: SillaLife, how: string) {
    funnel(how);
    warp.start(() => {
      setLife(next);
      setRound((r) => r + 1);
      setShareQuery(formatSilla(next));
      rememberOwn(EP, formatSilla(next));
      stampEpisode(EP);
    });
  }

  const title = (x: SillaLife) => (x.rank === null ? pick(C.noRank, l) : rankName(x.rank, l));
  const verdict = (v: "me" | "friend" | "same") => pick(v === "me" ? C.boss : v === "friend" ? C.junior : C.peer, l);
  const robe = life?.rank ? sillaRobe(life.rank) : null;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={2026} to={726} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["random", "birthday"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} onSubmit={(b) => show(drawSilla(birthdayRandom(EP, b)), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => show(drawSilla(), "random")}>
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
              mine={{ label: `${pick(GOLPUM[life.golpum], l)} · ${title(life)}`, n: sillaOneIn(life) }}
              friend={{ label: `${pick(GOLPUM[friend.golpum], l)} · ${title(friend)}`, n: sillaOneIn(friend) }}
              verdict={verdict(compareSilla(life, friend))}
            />
          )}
          <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-muted p-6 sm:flex-row sm:items-end sm:justify-center">
            {robe ? (
              <ArtifactImage file={`robes/silla-${robe}.webp`} alt={ROBE[robe].name[l]} />
            ) : (
              <ArtifactImage file="robes/silla-commoner.webp" alt={pick(COMMONER_CLOTHES, l)} />
            )}
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-muted-foreground">{pick(C.you, l)}</p>
              <p className="mt-1 text-xl font-bold text-foreground">{pick(GOLPUM[life.golpum], l)}</p>
              <p className="font-serif text-4xl font-black text-foreground">{title(life)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{robe ? ROBE[robe].name[l] : pick(COMMONER_CLOTHES, l)}</p>
            </div>
          </section>
          {(robe || life.rank === null) && <ArtifactNote l={l} />}
          <RarityBadge n={sillaOneIn(life)} l={l} fmt={fmt} />

          <Panel label={pick(C.wallTitle, l)}>
            {life.rank === null ? (
              <p>{pick(C.noRankNote, l)}</p>
            ) : life.wall > 0 ? (
              <p className="text-lg font-bold">{wallText(life, l)}</p>
            ) : (
              <p className="text-lg font-bold">{pick(C.noWall, l)}</p>
            )}
            {life.golpum === "yuk" && life.rank === 6 && <p className="pt-1 text-xs text-muted-foreground">{pick(C.junghi, l)}</p>}
            <Sources l={l} items={SOURCES.slice(0, 1)} />
          </Panel>

          {life.rank !== null && (
            <Panel label={pick(C.ladder, l)}>
              <Ladder life={life} l={l} />
              <p className="pt-2 text-xs text-muted-foreground">{pick(C.robeNote, l)}</p>
              <Sources l={l} items={SOURCES} />
            </Panel>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">{pick(C.weightNote, l)}</p>

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-silla-${life.golpum}-${life.rank ?? 0}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: title(life),
              subtitle: pick(GOLPUM[life.golpum], l),
              badge: `★ ${rarityLabel(sillaOneIn(life), l)} · ${oneInText(sillaOneIn(life), l, fmt)}`,
              lines: [life.rank === null ? pick(C.noRank, l) : life.wall > 0 ? wallText(life, l) : pick(C.noWall, l), ...(robe ? [ROBE[robe].name[l]] : [pick(COMMONER_CLOTHES, l)])],
              footer: "oiyo.net · 1300",
              accent: "#6b3d8f",
              art: robe ? `robes/silla-${robe}.webp` : "robes/silla-commoner.webp",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
