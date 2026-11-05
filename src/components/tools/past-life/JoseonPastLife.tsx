import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import {
  JOSEON_GROUP_VECTORS,
  JOSEON_POSTS,
  JOSEON_PROVINCES,
  JOSEON_SOURCES,
  PROVINCE_SOURCES,
  ROBE_SOURCES,
  type JoseonPost,
  type JoseonProvince,
  type Robe,
  type Vector,
} from "../../../data/past-life-1426";
import { birthdayRandom, compareRank, drawProvince, nearest, oneIn, parseRank, postShare, provinceShare, robeFor, seededRandom, tabletFor, weightedPick } from "../../../lib/past-life-1426";
import generated from "../../../data/past-life-1426-generated.json";
import SceneArtwork from "./SceneArtwork";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, TraitPicker, numberFormat, oneInText, pick, setShareQuery, toL, useFunnel, type L } from "./shared";
import { BirthdayPicker, FriendBanner, FriendCompare, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, isOwn, rarityLabel, rememberOwn, stampEpisode, useWarp, type Mode } from "./timeslip";

interface JoseonLife {
  post: JoseonPost;
  province: JoseonProvince;
}

interface Stipend { rice: number; beans: number; wheat: number; silk: number; cloth: number; url: string }
const STIPENDS = generated.stipends as unknown as Record<string, Stipend>;
function stipendFor(rank: string): Stipend | null {
  const m = /^(정|종)\d품/.exec(rank);
  return m ? STIPENDS[m[0]] ?? null : null;
}

const C = {
  draw: { ko: "호패 받기", en: "Receive my hopae", ja: "号牌を受け取る", zh: "领取号牌", fr: "Recevoir mon hopae", es: "Recibir mi hopae" },
  again: { ko: "다시 태어나기", en: "Be born again", ja: "もう一度生まれる", zh: "再投胎一次", fr: "Renaître", es: "Renacer" },
  hopaeCaption: { ko: "호패는 태종 13년(1413)부터 16세 이상 남자가 차던 신분패예요. 그림은 결과를 보여주는 재현이에요.", en: "The hopae was the identity tag Korean men aged 16+ wore from 1413. This drawing is a reconstruction of your result.", ja: "号牌は1413年から16歳以上の男子が身につけた身分札です。図は結果を見せる再現です。", zh: "号牌是1413年起16岁以上男子佩带的身份牌。图为根据结果的再现。", fr: "Le hopae était la plaque d'identité portée par les hommes de 16 ans et plus dès 1413. Ce dessin est une reconstitution.", es: "El hopae era la placa de identidad que llevaban los hombres de 16 años o más desde 1413. Este dibujo es una recreación." },
  office: { ko: "당신의 관직", en: "Your office", ja: "あなたの官職", zh: "你的官职", fr: "Votre charge", es: "Tu cargo" },
  seats: { ko: "정원", en: "Seats", ja: "定員", zh: "编制", fr: "Postes", es: "Plazas" },
  home: { ko: "당신의 고향", en: "Your home province", ja: "あなたの故郷", zh: "你的故乡", fr: "Votre province", es: "Tu provincia" },
  registered: { ko: "지리지에 적힌 인구(口)", en: "People on the gazetteer register", ja: "地理志に記された口数", zh: "地理志登记人口", fr: "Personnes inscrites au registre", es: "Personas en el registro" },
  tribute: { ko: "고향이 나라에 바치던 공물", en: "What your province sent as tribute", ja: "故郷が納めた貢物", zh: "故乡上缴的贡物", fr: "Le tribut de votre province", es: "El tributo de tu provincia" },
  robe: { ko: "조회 때 입을 관복", en: "Your court robe", ja: "朝会で着る官服", zh: "上朝穿的官服", fr: "Votre robe de cour", es: "Tu túnica de corte" },
  stipend: { ko: "1년 녹봉", en: "Yearly stipend", ja: "年間の禄俸", zh: "每年俸禄", fr: "Traitement annuel", es: "Estipendio anual" },
  stipendNote: { ko: "1438년(세종 20) 녹과 기준이라 1426년보다 12년 뒤 규정이에요. 쌀은 중미·조미·전미를 합친 값이에요.", en: "From the 1438 stipend table, 12 years after 1426. Rice adds three grades of rice.", ja: "1438年の禄科基準で、1426年より12年後の規定です。米は三種の合計です。", zh: "依据1438年禄科，比1426年晚12年。米为三种米合计。", fr: "Barème de 1438, douze ans après 1426. Le riz additionne trois qualités.", es: "Tabla de 1438, doce años después de 1426. El arroz suma tres calidades." },
  rice: { ko: "쌀", en: "rice", ja: "米", zh: "米", fr: "riz", es: "arroz" },
  beans: { ko: "콩", en: "soybeans", ja: "大豆", zh: "黄豆", fr: "soja", es: "soja" },
  wheat: { ko: "밀", en: "wheat", ja: "小麦", zh: "小麦", fr: "blé", es: "trigo" },
  silk: { ko: "명주", en: "silk", ja: "紬", zh: "绸", fr: "soie", es: "seda" },
  cloth: { ko: "베", en: "hemp cloth", ja: "布", zh: "布", fr: "toile", es: "tela" },
  seok: { ko: "석", en: "seok", ja: "石", zh: "石", fr: "seok", es: "seok" },
  pil: { ko: "필", en: "bolts", ja: "疋", zh: "匹", fr: "pièces", es: "piezas" },
  cardKicker: { ko: "1426년 · 세종 8년 · 나의 호패", en: "1426 · Joseon · My hopae", ja: "1426年・世宗8年・わたしの号牌", zh: "1426年·世宗八年·我的号牌", fr: "1426 · Joseon · Mon hopae", es: "1426 · Joseon · Mi hopae" },
  boss: { ko: "당신이 상관이에요!", en: "You outrank your friend!", ja: "あなたが上官です！", zh: "你是上司！", fr: "Vous êtes son supérieur !", es: "¡Eres su superior!" },
  junior: { ko: "친구가 상관이에요. 예를 갖추세요.", en: "Your friend outranks you. Bow politely.", ja: "友だちが上官です。礼を尽くして。", zh: "朋友是你的上司，记得行礼。", fr: "Votre ami vous est supérieur. Saluez-le.", es: "Tu amigo es tu superior. Haz una reverencia." },
  peer: { ko: "같은 품계, 동료예요.", en: "Same rank: colleagues.", ja: "同じ品階、同僚です。", zh: "同品阶，是同僚。", fr: "Même rang : collègues.", es: "Mismo rango: colegas." },
  registerNote: { ko: "지리지의 口는 세금·군역 대상 위주라 실제 인구보다 훨씬 적어요. 그래서 '장부에 적힌 사람 중 어디 출신인가'로 뽑아요.", en: "The gazetteer counted mostly people liable for tax and service, far fewer than the real population, so this draws from people on the register.", ja: "地理志の口は課税・軍役対象が中心で実人口よりずっと少ないため、「帳簿に載った人」から引きます。", zh: "地理志的口数以纳税服役者为主，远少于实际人口，所以按“登记在册的人”抽取。", fr: "Le registre comptait surtout les assujettis à l'impôt, bien moins que la population réelle : le tirage porte sur les inscrits.", es: "El registro contaba sobre todo a quienes pagaban tributo, muchos menos que la población real: el sorteo es entre los inscritos." },
} as const;

const ROBE: Record<Robe, { hex: string; name: Record<L, string> }> = {
  red: { hex: "var(--color-joseon-red)", name: { ko: "홍포(붉은 관복)", en: "Red robe (hongpo)", ja: "紅袍（赤い官服）", zh: "红袍", fr: "Robe rouge (hongpo)", es: "Túnica roja (hongpo)" } },
  blue: { hex: "var(--color-joseon-blue)", name: { ko: "청포(푸른 관복)", en: "Blue robe (cheongpo)", ja: "青袍（青い官服）", zh: "青袍", fr: "Robe bleue (cheongpo)", es: "Túnica azul (cheongpo)" } },
  green: { hex: "var(--color-joseon-green)", name: { ko: "녹포(초록 관복)", en: "Green robe (nokpo)", ja: "緑袍（緑の官服）", zh: "绿袍", fr: "Robe verte (nokpo)", es: "Túnica verde (nokpo)" } },
};
const TABLET: Record<"ivory" | "wood", Record<L, string>> = {
  ivory: { ko: "상아 홀(象笏)", en: "ivory tablet", ja: "象牙の笏", zh: "象牙笏", fr: "tablette d'ivoire", es: "tablilla de marfil" },
  wood: { ko: "나무 홀(木笏)", en: "wooden tablet", ja: "木の笏", zh: "木笏", fr: "tablette de bois", es: "tablilla de madera" },
};

const HAN_DIGITS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
function rankHanja(rank: string): string {
  const r = parseRank(rank);
  if (!r) return "武職";
  return `${r.senior ? "正" : "從"}${HAN_DIGITS[r.grade]}品`;
}

function format(life: JoseonLife) {
  return `j=${life.post.id}&p=${life.province.id}`;
}
function parse(search: string): JoseonLife | null {
  const q = new URLSearchParams(search);
  const post = JOSEON_POSTS.find((p) => p.id === q.get("j"));
  const province = JOSEON_PROVINCES.find((p) => p.id === q.get("p"));
  return post && province ? { post, province } : null;
}

function drawRandom(random: () => number = Math.random): JoseonLife {
  return { post: weightedPick(JOSEON_POSTS, (p) => p.seats, random), province: drawProvince(random) };
}
function drawMatched(v: Vector, source: string): JoseonLife {
  const random = seededRandom(`joseon|${source}|${v.principle},${v.tradition},${v.action}`);
  const group = nearest(v, JOSEON_GROUP_VECTORS);
  return { post: weightedPick(JOSEON_POSTS.filter((p) => p.group === group), (p) => p.seats, random), province: drawProvince(random) };
}

function VerticalText({ x, y, text, size, fill }: { x: number; y: number; text: string; size: number; fill: string }) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor="middle" fontFamily="'Gowun Batang', serif" fontWeight={700}>
      {[...text].map((ch, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * 1.08}>
          {ch}
        </tspan>
      ))}
    </text>
  );
}

function Hopae({ life }: { life: JoseonLife }) {
  const office = life.post.hanja.length > 5 ? life.post.hanja.slice(0, 5) : life.post.hanja;
  return (
    <svg viewBox="0 0 160 360" className="h-80 w-auto drop-shadow-xl" role="img" aria-label={`${life.province.hanja} ${life.post.hanja} ${rankHanja(life.post.rank)}`}>
      <defs>
        <linearGradient id="hopae-wood" x1="0" x2="1">
          <stop offset="0" stopColor="var(--color-joseon-wood-1)" />
          <stop offset="0.5" stopColor="var(--color-joseon-wood-2)" />
          <stop offset="1" stopColor="var(--color-joseon-wood-3)" />
        </linearGradient>
      </defs>
      <path d="M80 4 C70 30 60 30 52 40" stroke="var(--color-joseon-red)" strokeWidth="4" fill="none" />
      <path d="M80 4 C90 30 100 30 108 40" stroke="var(--color-joseon-red)" strokeWidth="4" fill="none" />
      <rect x="20" y="36" width="120" height="316" rx="18" fill="url(#hopae-wood)" stroke="var(--color-joseon-rim)" strokeWidth="3" />
      <circle cx="80" cy="58" r="7" fill="var(--color-joseon-ink)" />
      <path d="M30 90 Q80 82 130 90 M30 300 Q80 310 130 300" stroke="var(--color-joseon-rim)" strokeWidth="1.5" fill="none" opacity="0.6" />
      <VerticalText x={112} y={102} text={office} size={30} fill="var(--color-joseon-ink)" />
      <VerticalText x={74} y={102} text={rankHanja(life.post.rank)} size={22} fill="var(--color-joseon-ink)" />
      <VerticalText x={44} y={102} text={life.province.hanja} size={18} fill="var(--color-joseon-ink)" />
      <text x="80" y="334" fontSize="13" fill="var(--color-joseon-ink)" textAnchor="middle" fontFamily="'Gowun Batang', serif">宣德元年</text>
      <rect x="96" y="262" width="34" height="34" rx="4" fill="none" stroke="var(--color-joseon-red)" strokeWidth="2.5" />
      <text x="113" y="285" fontSize="14" fill="var(--color-joseon-red)" textAnchor="middle" fontFamily="'Gowun Batang', serif">印</text>
    </svg>
  );
}

export default function JoseonPastLife({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("random");
  const [life, setLife] = useState<JoseonLife | null>(null);
  const [friend, setFriend] = useState<JoseonLife | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel("joseon-1426");
  const warp = useWarp();

  useEffect(() => {
    const shared = parse(window.location.search);
    if (shared) {
      setLife(shared);
      if (!isOwn("joseon-1426", format(shared))) setFriend(shared);
    }
  }, []);

  function show(next: JoseonLife, how: string) {
    funnel(how);
    warp.start(() => {
      setLife(next);
      setRound((r) => r + 1);
      setShareQuery(format(next));
      rememberOwn("joseon-1426", format(next));
      stampEpisode("joseon-1426");
    });
  }
  const postName = (p: JoseonPost) => (l === "ko" ? p.ko : l === "ja" || l === "zh" ? p.hanja : p.en);
  const provinceName = (p: JoseonProvince) => (l === "ko" ? p.ko : l === "ja" || l === "zh" ? p.hanja : p.en);
  const verdictText = (v: "me" | "friend" | "same" | null) =>
    v === "me" ? pick(C.boss, l) : v === "friend" ? pick(C.junior, l) : v === "same" ? pick(C.peer, l) : null;

  const robe = life ? robeFor(life.post.rank) : null;
  const tablet = life ? tabletFor(life.post.rank) : null;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={2026} to={1426} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} />
      {mode === "random" ? (
        <Button size="lg" className="w-full" onClick={() => show(drawRandom(), "random")}>
          {life && life !== friend ? pick(C.again, l) : pick(C.draw, l)}
        </Button>
      ) : mode === "birthday" ? (
        <BirthdayPicker l={l} onSubmit={(b) => show(drawRandom(birthdayRandom("joseon-1426", b)), "birthday")} />
      ) : (
        <TraitPicker l={l} onSubmit={(v, source) => show(drawMatched(v, source), `trait-${source}`)} />
      )}

      {!life && <SceneArtwork scene="joseonArrival" locale={locale} />}

      {life && friend && life === friend && <FriendBanner l={l} />}

      {life && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          {friend && life !== friend && (
            <FriendCompare
              l={l}
              fmt={fmt}
              testId="joseon-1426"
              mine={{ label: postName(life.post), n: oneIn(postShare(life.post)) }}
              friend={{ label: postName(friend.post), n: oneIn(postShare(friend.post)) }}
              verdict={verdictText(compareRank(life.post.rank, friend.post.rank))}
            />
          )}
          <SceneArtwork scene="joseonArrival" locale={locale} />
          <div className="flex items-end justify-center gap-4 rounded-3xl border border-border bg-muted p-6">
            <Hopae life={life} />
          </div>
          <RarityBadge n={oneIn(postShare(life.post))} l={l} fmt={fmt} />
          <p className="text-center text-xs text-muted-foreground">{pick(C.hopaeCaption, l)}</p>

          <Panel label={pick(C.office, l)}>
            <p className="text-2xl font-black">{l === "ko" ? life.post.ko : l === "ja" || l === "zh" ? life.post.hanja : life.post.en}</p>
            <p className="text-muted-foreground">
              {life.post.hanja} · {l === "ko" ? life.post.rank : life.post.rankEn}
            </p>
            <p>
              {pick(C.seats, l)} {fmt.format(life.post.seats)} · {oneInText(oneIn(postShare(life.post)), l, fmt)}
            </p>
            <Sources l={l} items={JOSEON_SOURCES} />
          </Panel>

          {stipendFor(life.post.rank) && (() => {
            const st = stipendFor(life.post.rank)!;
            const unit = (n: number, u: "seok" | "pil") => `${fmt.format(n)}${l === "ko" || l === "ja" || l === "zh" ? "" : " "}${pick(C[u], l)}`;
            const items: [keyof Stipend, number, "seok" | "pil"][] = [["rice", st.rice, "seok"], ["beans", st.beans, "seok"], ["wheat", st.wheat, "seok"], ["silk", st.silk, "pil"], ["cloth", st.cloth, "pil"]];
            return (
              <Panel label={pick(C.stipend, l)}>
                <ul className="flex flex-wrap gap-2">
                  {items.filter(([, n]) => n > 0).map(([k, n, u]) => (
                    <li key={k} className="rounded-full border border-border bg-background px-3 py-1">
                      {pick(C[k as "rice" | "beans" | "wheat" | "silk" | "cloth"], l)} {unit(n, u)}
                    </li>
                  ))}
                </ul>
                <p className="pt-2 text-xs text-muted-foreground">{pick(C.stipendNote, l)}</p>
                <Sources l={l} items={[{ label: "한국민족문화대백과사전", url: st.url }]} />
              </Panel>
            );
          })()}

          {robe && (
            <Panel label={pick(C.robe, l)}>
              <p className="text-lg font-bold">
                {ROBE[robe].name[l]}
                {tablet ? ` · ${TABLET[tablet][l]}` : ""}
              </p>
              <Sources l={l} items={ROBE_SOURCES} />
            </Panel>
          )}

          <Panel label={pick(C.home, l)}>
            <p className="text-2xl font-black">{l === "ko" ? life.province.ko : l === "ja" || l === "zh" ? life.province.hanja : life.province.en}</p>
            <p>
              {pick(C.registered, l)} {fmt.format(life.province.people)} · {oneInText(oneIn(provinceShare(life.province)), l, fmt)}
            </p>
            <p className="pt-2 font-bold">{pick(C.tribute, l)}</p>
            <ul className="flex flex-wrap gap-2">
              {life.province.tribute.map((item) => (
                <li key={item.hanja} className="rounded-full border border-border bg-background px-3 py-1">
                  {l === "ja" || l === "zh" ? item.hanja : `${item.hanja} · ${item[l === "ko" ? "ko" : l === "fr" ? "fr" : l === "es" ? "es" : "en"]}`}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.registerNote, l)}</p>
            <Sources l={l} items={PROVINCE_SOURCES} />
          </Panel>

          <SaveCard
            l={l}
            testId="joseon-1426"
            filename={`oiyo-joseon-1426-${life.post.id}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: postName(life.post),
              subtitle: `${life.post.hanja} · ${l === "ko" ? life.post.rank : life.post.rankEn}`,
              badge: `★ ${rarityLabel(oneIn(postShare(life.post)), l)} · ${oneInText(oneIn(postShare(life.post)), l, fmt)}`,
              lines: [`${pick(C.home, l)}: ${provinceName(life.province)}`, ...(robe ? [`${pick(C.robe, l)}: ${ROBE[robe].name[l]}`] : [])],
              footer: "oiyo.net · 600",
              accent: "#8c2f2b",
            }}
          />
          <CopyLink l={l} testId="joseon-1426" />
          <SeriesNext l={l} locale={locale} current="joseon-1426" round={round} />
        </div>
      )}
    </div>
  );
}
