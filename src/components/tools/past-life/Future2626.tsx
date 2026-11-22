import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { CONDITION, ITEMS, SITES, formatDig, makeDig, parseDig, type Dig } from "../../../lib/future-2626";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "future-2626" as const;

const C = {
  draw: { ko: "2626년 박물관으로", en: "Go to the museum, 2626", ja: "2626年の博物館へ", zh: "前往2626年的博物馆", fr: "Au musée, en 2626", es: "Al museo, en 2626" },
  again: { ko: "다른 유물 발굴하기", en: "Dig up something else", ja: "別の遺物を発掘", zh: "再挖一批", fr: "Fouiller encore", es: "Excavar otra vez" },
  heroKicker: { ko: "600년 뒤 박물관, 내 물건이 유물이 됐어요", en: "600 years on, your things are museum pieces", ja: "600年後の博物館、私の物が遺物に", zh: "六百年后，你的东西成了博物馆文物", fr: "Dans 600 ans, vos affaires sont au musée", es: "Dentro de 600 años, tus cosas están en un museo" },
  hall: { ko: "제21세기관 · 특별전 「검은 거울의 시대」", en: "21st-Century Hall · special exhibition 'The Age of Black Mirrors'", ja: "21世紀館・特別展「黒い鏡の時代」", zh: "21世纪馆·特展《黑镜时代》", fr: "Salle du XXIe siècle · exposition « L'âge des miroirs noirs »", es: "Sala del siglo XXI · muestra «La era de los espejos negros»" },
  label: { ko: "유물 번호", en: "Object no.", ja: "遺物番号", zh: "文物编号", fr: "Objet n°", es: "Objeto n.º" },
  site: { ko: "출토지", en: "Found at", ja: "出土地", zh: "出土地点", fr: "Lieu de découverte", es: "Hallazgo" },
  date: { ko: "추정 연대", en: "Estimated date", ja: "推定年代", zh: "推定年代", fr: "Datation", es: "Datación" },
  dateV: { ko: "21세기 전반", en: "Early 21st century", ja: "21世紀前半", zh: "21世纪前半叶", fr: "Début du XXIe siècle", es: "Principios del siglo XXI" },
  material: { ko: "재질", en: "Material", ja: "材質", zh: "材质", fr: "Matériau", es: "Material" },
  real: { ko: "(사실은: {name})", en: "(Actually: {name})", ja: "（実は：{name}）", zh: "（其实是：{name}）", fr: "(En fait : {name})", es: "(En realidad: {name})" },
  aboutTitle: { ko: "거꾸로 타임슬립", en: "Time-slip in reverse", ja: "逆さまのタイムスリップ", zh: "反向穿越", fr: "Voyage temporel à l'envers", es: "Viaje en el tiempo al revés" },
  about: { ko: "다른 회차는 실제 기록으로 과거의 나를 뽑지만, 이번 회차는 반대로 지금의 내가 먼 미래에 어떻게 읽힐지 상상해요. 오늘 우리가 옛 유물을 보며 '제사용 그릇일 것'이라 추측하듯, 600년 뒤 사람들도 우리 물건을 엉뚱하게 해석할지 몰라요. 설명은 모두 지어낸 농담이에요.", en: "Other episodes draw your past self from real records. This one runs the other way: how might people read us 600 years from now? Just as we guess an ancient pot was 'probably ritual', future curators may get our things gloriously wrong. Every label here is an invented joke.", ja: "他の回は実際の記録で過去の私を引きますが、今回は逆に、今の私が遠い未来にどう読まれるかを想像します。ラベルはすべて作り話の冗談です。", zh: "其他各集用真实记录抽出过去的你，这一集反过来，想象六百年后的人如何解读我们。所有说明都是编出来的玩笑。", fr: "Les autres épisodes tirent votre passé de vrais registres ; celui-ci imagine comment on nous lira dans 600 ans. Toutes les étiquettes sont des plaisanteries inventées.", es: "Los demás episodios sacan tu pasado de registros reales; este imagina cómo nos leerán dentro de 600 años. Todas las etiquetas son bromas inventadas." },
  cardKicker: { ko: "2626 · 미래 박물관 속 내 물건", en: "2626 · My things in a future museum", ja: "2626・未来の博物館の私の物", zh: "2626·未来博物馆里的我的东西", fr: "2626 · Mes affaires au musée du futur", es: "2626 · Mis cosas en un museo del futuro" },
  badge: { ko: "미래 고고학", en: "Future archaeology", ja: "未来考古学", zh: "未来考古学", fr: "Archéologie du futur", es: "Arqueología del futuro" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Future2626({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [mode, setMode] = useState<Mode>("birthday");
  const [dig, setDig] = useState<Dig | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseDig(window.location.search);
    if (shared) setDig(shared);
  }, []);

  function draw(rand: () => number, how: string) {
    const next = makeDig(rand);
    funnel(how);
    warp.start(() => {
      setDig(next);
      setRound((r) => r + 1);
      setShareQuery(formatDig(next));
      stampEpisode(EP);
    });
  }

  const items = dig ? dig.items.map((k, n) => ({ item: ITEMS[k]!, guess: ITEMS[k]!.guesses[dig.guesses[n]]!, no: `2626-${dig.no + n}` })) : [];

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={2626} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, "random")}>
          {pick(dig ? C.again : C.draw, l)}
        </Button>
      )}

      {dig && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-5xl">{items.map((x) => x.item.emoji).join(" ")}</p>
            <p className="mt-3 text-sm font-bold text-foreground">{pick(C.hall, l)}</p>
          </section>

          {items.map((x) => (
            <Panel key={x.no} label={`${pick(C.label, l)} ${x.no}`}>
              <p className="text-lg font-black leading-snug text-foreground">{pick(x.guess, l)}</p>
              <dl className="timeslip-census">
                <div><dt>{pick(C.site, l)}</dt><dd>{pick(SITES[dig.site]!, l)}</dd></div>
                <div><dt>{pick(C.date, l)}</dt><dd>{pick(C.dateV, l)}</dd></div>
                <div><dt>{pick(C.material, l)}</dt><dd>{pick(x.item.material, l)}</dd></div>
              </dl>
              <p className="pt-2 text-xs text-muted-foreground">
                {pick(CONDITION[dig.cond]!, l)} · {fill(pick(C.real, l), { name: `${x.item.emoji} ${pick(x.item.name, l)}` })}
              </p>
            </Panel>
          ))}

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.about, l)}</p>
          </Panel>

          <SaveCard
            l={l}
            testId={EP}
            filename="oiyo-future-2626"
            spec={{
              kicker: pick(C.cardKicker, l),
              title: items.map((x) => x.item.emoji).join(" "),
              subtitle: pick(C.hall, l),
              badge: pick(C.badge, l),
              lines: items.map((x) => `${x.no} · ${pick(x.item.name, l)}`),
              footer: `oiyo.net · 2626 · ${pick(SITES[dig.site]!, l)}`,
              accent: "#2d4a6b",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
