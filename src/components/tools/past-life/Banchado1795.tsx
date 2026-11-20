import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { DAYS, DRAWN, HORSES, RETINUE, SLOTS, drawSlot, formatBanchado, oneIn, parseBanchado, type Slot } from "../../../lib/banchado-1795";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "banchado-1795" as const;

const C = {
  draw: { ko: "행렬 속 내 자리 뽑기", en: "Find my place in the procession", ja: "行列の中の自分を引く", zh: "抽出我在队列中的位置", fr: "Trouver ma place dans le cortège", es: "Encontrar mi lugar en el cortejo" },
  again: { ko: "다시 뽑기", en: "Draw again", ja: "もう一度", zh: "再抽一次", fr: "Recommencer", es: "Otra vez" },
  heroKicker: { ko: "1795년 윤2월, 화성 가는 길의 나", en: "You on the road to Hwaseong, spring 1795", ja: "1795年閏2月、華城へ向かう私", zh: "1795年闰二月，去华城路上的我", fr: "Vous, en route vers Hwaseong, printemps 1795", es: "Tú, camino de Hwaseong, primavera de 1795" },
  horseYes: { ko: "말을 타고 가요", en: "You ride a horse", ja: "馬に乗って進みます", zh: "骑马前行", fr: "Vous allez à cheval", es: "Vas a caballo" },
  horseNo: { ko: "걸어서 가요", en: "You go on foot", ja: "歩いて進みます", zh: "步行前往", fr: "Vous allez à pied", es: "Vas a pie" },
  horseMaybe: { ko: "그림 속 사람 {p}명에 말 {h}필. 직책에 따라 말을 타기도, 걸어가기도 해요.", en: "{p} people and {h} horses in the picture: some ride, some walk.", ja: "絵の中に{p}人と馬{h}頭。職によって騎馬も徒歩もあります。", zh: "画中{p}人、马{h}匹，依职务有骑马也有步行。", fr: "{p} personnes et {h} chevaux : certains montent, d'autres marchent.", es: "{p} personas y {h} caballos: unos montan, otros caminan." },
  listTitle: { ko: "반차도 1,779명은 이렇게 나뉘어요", en: "How the 1,779 in the picture break down", ja: "班次図1,779人の内訳", zh: "班次图1,779人的构成", fr: "Les 1 779 personnages du tableau", es: "Los 1.779 personajes del cuadro" },
  kingNote: { ko: "정조는 그림 밖(1명)", en: "King Jeongjo: not drawn (1)", ja: "正祖は絵の外（1人）", zh: "正祖不在画中（1人）", fr: "Le roi : hors du tableau (1)", es: "El rey: fuera del cuadro (1)" },
  me: { ko: "← 나", en: "← you", ja: "← 私", zh: "← 我", fr: "← vous", es: "← tú" },
  daysTitle: { ko: "7박 8일 여정", en: "The eight-day journey", ja: "7泊8日の旅程", zh: "七夜八天的行程", fr: "Le voyage de huit jours", es: "El viaje de ocho días" },
  day: { ko: "{n}일째", en: "Day {n}", ja: "{n}日目", zh: "第{n}天", fr: "Jour {n}", es: "Día {n}" },
  bridge: { ko: "한강은 배 36척을 이어 만든 340m 배다리로 건넜어요. 정약용 등이 11일 만에 놓았어요. 그림 밖까지 합치면 행렬에 딸린 사람은 약 {r}명이었어요.", en: "The Han was crossed on a 340 m bridge of 36 boats, built in 11 days with Jeong Yak-yong among the planners. Counting everyone on the lists, about {r} people went.", ja: "漢江は船36隻をつないだ340mの舟橋で渡りました。丁若鏞らが11日で架けました。名簿全体では約{r}人が随行しました。", zh: "以36艘船连成的340米浮桥渡过汉江，丁若镛等人用11天建成。名册上随行者约{r}人。", fr: "On franchit le Han sur un pont de 36 bateaux (340 m), bâti en 11 jours. Au total, environ {r} personnes suivaient.", es: "Se cruzó el Han por un puente de 36 barcas (340 m) hecho en 11 días. En total iban unas {r} personas." },
  enNote: { ko: "", en: "", ja: "旅程の説明は英語です。", zh: "行程说明为英文。", fr: "Le détail du voyage est en anglais.", es: "El detalle del viaje está en inglés." },
  cardKicker: { ko: "1795 · 화성 행차 반차도 속 나", en: "1795 · Me in the Hwaseong procession", ja: "1795・華城行幸の班次図の中の私", zh: "1795·华城行幸班次图中的我", fr: "1795 · Moi dans le cortège de Hwaseong", es: "1795 · Yo en el cortejo de Hwaseong" },
  badge: { ko: "원행을묘정리의궤", en: "Wonhaeng Eulmyo Jeongni Uigwe", ja: "園幸乙卯整理儀軌", zh: "园幸乙卯整理仪轨", fr: "Uigwe de 1795", es: "Uigwe de 1795" },
  src1: { ko: "한국일보, 「정조대왕 화성행차도 병풍식 책자로」(2000)", en: "Hankook Ilbo (2000), procession facts", ja: "韓国日報（2000）", zh: "韩国日报（2000）", fr: "Hankook Ilbo (2000)", es: "Hankook Ilbo (2000)" },
  src2: { ko: "문화저널21, 「원행을묘정리의궤」", en: "Munhwa Journal 21: the 1795 uigwe", ja: "文化ジャーナル21", zh: "文化杂志21", fr: "Munhwa Journal 21", es: "Munhwa Journal 21" },
  src3: { ko: "경기일보, 정조의 화성 행차 7박 8일(2015)", en: "Kyeonggi Ilbo (2015), day by day", ja: "京畿日報（2015）", zh: "京畿日报（2015）", fr: "Kyeonggi Ilbo (2015)", es: "Kyeonggi Ilbo (2015)" },
  src4: { ko: "반차도 해설(나인·악대·가마 인원)", en: "Banchado commentary (court ladies, band, palanquins)", ja: "班次図解説", zh: "班次图解说", fr: "Commentaire du banchado", es: "Comentario del banchado" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Banchado1795({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseBanchado(window.location.search);
    if (shared) setSlot(shared);
  }, []);

  function show(next: Slot, how: string) {
    funnel(how);
    warp.start(() => {
      setSlot(next);
      setRound((r) => r + 1);
      setShareQuery(formatBanchado(next.id));
      stampEpisode(EP);
    });
  }

  const horseText = slot ? (slot.horse === true ? pick(C.horseYes, l) : slot.horse === false ? pick(C.horseNo, l) : fill(pick(C.horseMaybe, l), { p: fmt.format(DRAWN), h: fmt.format(HORSES) })) : "";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1795} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => show(drawSlot(birthdayRandom(EP, b)), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => show(drawSlot(), "random")}>
          {pick(slot ? C.again : C.draw, l)}
        </Button>
      )}

      {slot && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(slot.name, l)}</p>
            <div className="mt-3">
              <RarityBadge n={oneIn(slot)} l={l} fmt={fmt} />
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground">{pick(slot.does, l)}</p>
            <p className="mt-3 text-sm text-muted-foreground">{horseText}</p>
          </section>

          <Panel label={pick(C.listTitle, l)}>
            <ul className="space-y-1 text-sm">
              {SLOTS.map((s) => (
                <li key={s.id} className={s.id === slot.id ? "font-bold text-primary" : "text-muted-foreground"}>
                  {s.id === "king" ? pick(C.kingNote, l) : `${pick(s.name, l)} ${fmt.format(s.n)}`}
                  {s.id === slot.id && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel label={pick(C.daysTitle, l)}>
            <ol className="space-y-2 text-sm leading-relaxed">
              {DAYS.map((d, i) => (
                <li key={i}>
                  <span className="font-bold text-foreground">{fill(pick(C.day, l), { n: i + 1 })}</span> · {l === "ko" ? d.ko : d.en}
                </li>
              ))}
            </ol>
            <p className="pt-3 text-sm leading-relaxed">{fill(pick(C.bridge, l), { r: fmt.format(RETINUE) })}</p>
            {pick(C.enNote, l) && <p className="pt-2 text-xs text-muted-foreground">{pick(C.enNote, l)}</p>}
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://www.hankookilbo.com/news/article/200009080099156952" },
              { label: pick(C.src2, l), url: "http://www.mhj21.com/news/articleView.html?idxno=8595" },
              { label: pick(C.src3, l), url: "https://www.kyeonggi.com/article/201511030744245" },
              { label: pick(C.src4, l), url: "https://m.cafe.daum.net/ibara/GLmZ/50" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-banchado-1795-${slot.id}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: pick(slot.name, l),
              subtitle: horseText,
              badge: pick(C.badge, l),
              lines: [pick(slot.does, l)],
              footer: "oiyo.net · 1795",
              accent: "#2f5d50",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
