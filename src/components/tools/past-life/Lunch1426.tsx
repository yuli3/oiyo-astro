import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { DISHES, ING, SOURCES, byId, formatLunch, judge, parseLunch, type Bi, type Dish, type IngId, type SourceKey } from "../../../lib/lunch-1426";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { CopyLink, Panel, Sources, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp } from "./timeslip";

const EP = "lunch-1426" as const;

const C = {
  pickLabel: { ko: "오늘 점심 메뉴를 고르세요", en: "Pick today's lunch", ja: "今日のランチを選んでください", zh: "选一道今天的午餐", fr: "Choisissez votre déjeuner", es: "Elige tu almuerzo de hoy" },
  heroKicker: { ko: "1426년으로 가져간 오늘 점심", en: "Today's lunch, carried back to 1426", ja: "1426年に持ち込んだ今日のランチ", zh: "把今天的午餐带回1426年", fr: "Votre déjeuner, ramené en 1426", es: "Tu almuerzo, llevado a 1426" },
  survive: { ko: "재료 생존율", en: "Ingredients that survive", ja: "食材の生存率", zh: "食材存活率", fr: "Ingrédients qui survivent", es: "Ingredientes que sobreviven" },
  none: { ko: "사라진 재료", en: "Gone in 1426", ja: "消えた食材", zh: "1426年还没有的", fr: "Absents en 1426", es: "Ausentes en 1426" },
  rare: { ko: "있지만 귀했던 재료", en: "Existed, but scarce", ja: "あったが貴重だった食材", zh: "有但很珍贵的", fr: "Existaient, mais rares", es: "Existían, pero escasos" },
  ok: { ko: "그대로 있던 재료", en: "Already there", ja: "そのままあった食材", zh: "当时就有的", fr: "Déjà là", es: "Ya existían" },
  then: { ko: "1426년 버전 점심", en: "The 1426 version", ja: "1426年版ランチ", zh: "1426年版午餐", fr: "La version 1426", es: "La versión de 1426" },
  rareHalf: { ko: "귀했던 재료는 절반만 쳐서 계산했어요.", en: "Scarce ingredients count as half.", ja: "貴重な食材は半分として計算しました。", zh: "珍贵食材按一半计算。", fr: "Les ingrédients rares comptent pour moitié.", es: "Los ingredientes escasos cuentan la mitad." },
  again: { ko: "다른 메뉴도 가져가 보기", en: "Try another dish", ja: "別のメニューも試す", zh: "换一道试试", fr: "Essayer un autre plat", es: "Probar otro plato" },
  cardKicker: { ko: "1426 · 오늘 점심을 600년 전으로", en: "1426 · Lunch, 600 years ago", ja: "1426・今日のランチを600年前へ", zh: "1426·把午餐带回600年前", fr: "1426 · Déjeuner il y a 600 ans", es: "1426 · Almuerzo hace 600 años" },
  badge: { ko: "점심 타임슬립", en: "Lunch timeslip", ja: "ランチ・タイムスリップ", zh: "午餐穿越", fr: "Déjeuner temporel", es: "Almuerzo en el tiempo" },
  general: { ko: "아메리카 작물 일반", en: "American crops in general", ja: "アメリカ大陸の作物", zh: "美洲作物概况", fr: "Plantes des Amériques", es: "Cultivos americanos" },
  noteOther: { ko: "", en: "Ingredient notes are in English.", ja: "食材の説明は英語です。", zh: "食材说明为英文。", fr: "Les notes sur les ingrédients sont en anglais.", es: "Las notas de ingredientes están en inglés." },
} satisfies Record<string, Six>;

const TIERS: { min: number; label: Six }[] = [
  { min: 0.9, label: { ko: "거의 그대로 먹을 수 있어요", en: "You could eat it almost as is", ja: "ほぼそのまま食べられます", zh: "几乎可以原样吃到", fr: "Presque identique", es: "Casi igual" } },
  { min: 0.6, label: { ko: "조금만 바꾸면 돼요", en: "A few swaps and you're fine", ja: "少し変えれば大丈夫", zh: "稍作替换就行", fr: "Quelques substitutions suffisent", es: "Con unos cambios basta" } },
  { min: 0.35, label: { ko: "절반쯤 사라져요", en: "About half of it vanishes", ja: "半分ほど消えます", zh: "大约消失一半", fr: "La moitié disparaît", es: "Desaparece la mitad" } },
  { min: 0, label: { ko: "거의 다 사라져요", en: "Almost nothing survives", ja: "ほとんど消えます", zh: "几乎全部消失", fr: "Presque rien ne survit", es: "Casi nada sobrevive" } },
];
const tierOf = (score: number) => TIERS.find((t) => score >= t.min)!.label;

const bi = (b: Bi, l: L) => (l === "ko" ? b.ko : b.en);

function IngList({ ids, l, mark }: { ids: IngId[]; l: L; mark: string }) {
  return (
    <ul className="space-y-2">
      {ids.map((id) => (
        <li key={id} className="text-sm leading-relaxed">
          <span className="font-bold text-foreground">
            {mark} {bi(ING[id].name, l)}
          </span>
          {ING[id].note.ko !== "그때도 먹었어요." && <span className="text-muted-foreground"> · {bi(ING[id].note, l)}</span>}
        </li>
      ))}
    </ul>
  );
}

export default function Lunch1426({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [dish, setDish] = useState<Dish | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseLunch(window.location.search);
    if (shared) setDish(byId(shared));
  }, []);

  function choose(d: Dish) {
    funnel(d.id);
    warp.start(() => {
      setDish(d);
      setRound((x) => x + 1);
      setShareQuery(formatLunch(d.id));
      stampEpisode(EP);
    });
  }

  const v = dish ? judge(dish) : null;
  const pct = v ? Math.round(v.score * 100) : 0;
  const srcKeys = dish
    ? Array.from(new Set(dish.ing.map((i) => ("src" in ING[i] ? (ING[i] as { src?: SourceKey }).src : undefined)).filter((x): x is SourceKey => !!x)))
    : [];
  if (!srcKeys.includes("foreign")) srcKeys.push("foreign");

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1426} l={l} onDone={warp.finish} />}

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-bold text-foreground">{pick(dish ? C.again : C.pickLabel, l)}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DISHES.map((d) => (
            <Button
              key={d.id}
              variant={dish?.id === d.id ? "default" : "outline"}
              aria-pressed={dish?.id === d.id}
              className="min-h-11 justify-start whitespace-normal text-left"
              onClick={() => choose(d)}
            >
              <span aria-hidden="true">{d.emoji}</span> {pick(d.name, l)}
            </Button>
          ))}
        </div>
      </section>

      {dish && v && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-4xl" aria-hidden="true">{dish.emoji}</p>
            <p className="mt-2 text-2xl font-black text-foreground">{pick(dish.name, l)}</p>
            <p className="mt-4 text-sm font-bold text-muted-foreground">{pick(C.survive, l)}</p>
            <p className="text-5xl font-black text-primary">{pct}%</p>
            <div className="mx-auto mt-3 max-w-xs">
              <Progress value={pct} aria-label={pick(C.survive, l)} />
            </div>
            <p className="mt-3 text-lg font-bold text-foreground">{pick(tierOf(v.score), l)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{pick(C.rareHalf, l)}</p>
          </section>

          <Panel label={pick(C.then, l)}>
            <p className="text-lg font-bold leading-relaxed">{bi(dish.then, l)}</p>
          </Panel>

          {v.none.length > 0 && (
            <Panel label={`${pick(C.none, l)} (${v.none.length})`}>
              <IngList ids={v.none} l={l} mark="✕" />
            </Panel>
          )}
          {v.rare.length > 0 && (
            <Panel label={`${pick(C.rare, l)} (${v.rare.length})`}>
              <IngList ids={v.rare} l={l} mark="△" />
            </Panel>
          )}
          {v.ok.length > 0 && (
            <Panel label={`${pick(C.ok, l)} (${v.ok.length})`}>
              <IngList ids={v.ok} l={l} mark="○" />
            </Panel>
          )}
          {l !== "ko" && l !== "en" && <p className="text-xs text-muted-foreground">{pick(C.noteOther, l)}</p>}

          <Sources l={l} items={srcKeys.map((k) => ({ label: k === "americas" ? `${SOURCES[k].label} (${pick(C.general, l)})` : SOURCES[k].label, url: SOURCES[k].url }))} />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-lunch-1426-${dish.id}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: `${pick(dish.name, l)} · ${pct}%`,
              subtitle: pick(tierOf(v.score), l),
              badge: pick(C.badge, l),
              lines: [bi(dish.then, l)],
              footer: "oiyo.net · 1426",
              accent: "#8a5a2b",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
