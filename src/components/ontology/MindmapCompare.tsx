import { MINDMAP_CATS, type MindmapLang } from "@/lib/ontology/mindmap-data";
import type { CompareRow, Comparison } from "@/lib/ontology/mindmap-compare";
import type { LeafRecommendation } from "@/lib/ontology/mindmap-recommend";

// "타고난 나와 내가 느끼는 나" under the tree (2026-10-10): the lit leaves beside the leaves the
// measured tests point at. Logic in mindmap-compare.ts; this file only words and draws it.
type Lang = MindmapLang;
type Group = "match" | "cross" | "own" | "wait";

const TEXT: Record<Lang, {
  title: string; lead: string; empty: string; on: string; foot: string;
  head: (match: number, lit: number) => string;
  opposite: (source: string) => string; elsewhere: string; unmeasured: string;
  groups: Record<Group, { title: string; text: string }>;
}> = {
  ko: {
    title: "타고난 나와 내가 느끼는 나", lead: "검사로 본 성향과 내가 켠 잎을 나란히 놓았어요", empty: "잎을 하나 켜면 검사 결과와 견주어 드려요.", on: "켜기",
    foot: "검사는 성향을 재고, 잎은 지금 내가 느끼는 것을 담아요. 어긋남은 오류가 아니라 서로 다른 것을 본 결과예요. 사주·별자리 같은 상징 체계는 여기에 쓰지 않아요.",
    head: (m, n) => (m === n ? `켠 잎 ${n}개가 모두 검사 결과와 만나요.` : m > 0 ? `켠 잎 ${n}개 중 ${m}개가 검사 결과와 만나요.` : `켠 잎 ${n}개가 모두 검사 결과 바깥에 있어요.`),
    opposite: (s) => `${s}의 반대쪽`, elsewhere: "내 결과는 여기를 가리키지 않아요", unmeasured: "이 잎을 재는 검사가 없어요",
    groups: {
      cross: { title: "반대쪽을 골랐어요", text: "검사는 한쪽을 가리키는데 나는 맞은편을 켰어요. 틀린 것이 아니에요. 타고난 성향과 지금 느끼는 내가 다를 수 있어요." },
      match: { title: "만나는 곳", text: "검사도 가리키고 나도 켠 잎이에요." },
      own: { title: "내가 따로 고른 곳", text: "검사 결과에는 없지만 내가 켠 잎이에요. 검사가 재지 않는 나이기도 해요." },
      wait: { title: "검사만 가리키는 곳", text: "결과는 가리키지만 아직 켜지 않았어요. 맞으면 켜고, 아니면 그대로 두세요." },
    },
  },
  en: {
    title: "The me I was born with, the me I feel", lead: "Your measured tendencies beside the leaves you switched on", empty: "Switch on a leaf and it will be set beside your test results.", on: "Switch on",
    foot: "Tests measure tendencies; leaves hold what you feel now. A mismatch is not an error, just two different views. Symbolic systems such as saju or zodiac signs are not used here.",
    head: (m, n) => (m === n ? `All ${n} lit leaves meet your test results.` : m > 0 ? `${m} of your ${n} lit leaves meet your test results.` : `All ${n} lit leaves sit outside your test results.`),
    opposite: (s) => `opposite of ${s}`, elsewhere: "Your results point elsewhere", unmeasured: "No test measures this leaf",
    groups: {
      cross: { title: "You picked the other side", text: "The tests point one way and you switched on the opposite. That is not wrong: your tendencies and how you feel now can differ." },
      match: { title: "Where they meet", text: "The tests point here and you switched it on." },
      own: { title: "Your own picks", text: "Not in your results, but you switched it on. It may be a part of you no test measures." },
      wait: { title: "Only the tests point here", text: "Your results point here but it is not on yet. Switch it on if it fits, or leave it." },
    },
  },
  ja: {
    title: "生まれ持った私と、私が感じる私", lead: "検査で見た傾向と、選んだ葉を並べました", empty: "葉を一つ選ぶと、検査結果と見比べられます。", on: "選ぶ",
    foot: "検査は傾向を測り、葉はいま感じていることを表します。ずれは誤りではなく、違うものを見た結果です。四柱推命や星座などの象徴体系はここでは使いません。",
    head: (m, n) => (m === n ? `選んだ葉${n}個すべてが検査結果と重なります。` : m > 0 ? `選んだ葉${n}個のうち${m}個が検査結果と重なります。` : `選んだ葉${n}個はすべて検査結果の外にあります。`),
    opposite: (s) => `${s}の反対側`, elsewhere: "結果はここを指していません", unmeasured: "この葉を測る検査はありません",
    groups: {
      cross: { title: "反対側を選びました", text: "検査は一方を指していますが、あなたは反対側を選びました。間違いではありません。生まれ持った傾向と今の気持ちは違うことがあります。" },
      match: { title: "重なるところ", text: "検査も指していて、あなたも選んだ葉です。" },
      own: { title: "自分で選んだところ", text: "検査結果にはありませんが、あなたが選んだ葉です。検査では測れないあなたかもしれません。" },
      wait: { title: "検査だけが指すところ", text: "結果は指していますが、まだ選んでいません。合えば選び、違えばそのままで。" },
    },
  },
  zh: {
    title: "天生的我与我感受到的我", lead: "把测试看到的倾向和你点亮的叶子放在一起", empty: "点亮一片叶子，就能与测试结果对照。", on: "点亮",
    foot: "测试衡量倾向，叶子记录你此刻的感受。不一致不是错误，只是看的东西不同。这里不使用四柱、星座等象征体系。",
    head: (m, n) => (m === n ? `点亮的 ${n} 片叶子都与测试结果相交。` : m > 0 ? `点亮的 ${n} 片叶子中有 ${m} 片与测试结果相交。` : `点亮的 ${n} 片叶子都在测试结果之外。`),
    opposite: (s) => `与${s}相反`, elsewhere: "你的结果没有指向这里", unmeasured: "没有测试衡量这片叶子",
    groups: {
      cross: { title: "你选了另一边", text: "测试指向一边，你却点亮了另一边。这没有错：天生的倾向和此刻的感受可以不同。" },
      match: { title: "相交之处", text: "测试指向这里，你也点亮了。" },
      own: { title: "你自己选的", text: "结果里没有，但你点亮了。也许是测试量不到的你。" },
      wait: { title: "只有测试指向的", text: "结果指向这里，但你还没点亮。合适就点亮，不合适就保持原样。" },
    },
  },
  fr: {
    title: "Le moi inné et le moi ressenti", lead: "Vos tendances mesurées à côté des feuilles que vous avez allumées", empty: "Allumez une feuille pour la comparer à vos résultats.", on: "Allumer",
    foot: "Les tests mesurent des tendances ; les feuilles disent ce que vous ressentez maintenant. Un écart n’est pas une erreur, juste deux regards différents. Les systèmes symboliques (saju, signes du zodiaque) ne sont pas utilisés ici.",
    head: (m, n) => (m === n ? `Vos ${n} feuilles allumées rejoignent toutes vos résultats.` : m > 0 ? `${m} de vos ${n} feuilles allumées rejoignent vos résultats.` : `Vos ${n} feuilles allumées sont toutes hors de vos résultats.`),
    opposite: (s) => `à l’opposé de ${s}`, elsewhere: "Vos résultats pointent ailleurs", unmeasured: "Aucun test ne mesure cette feuille",
    groups: {
      cross: { title: "Vous avez choisi l’autre côté", text: "Les tests pointent d’un côté et vous avez allumé l’autre. Ce n’est pas une erreur : vos tendances et ce que vous ressentez peuvent différer." },
      match: { title: "Points de rencontre", text: "Les tests pointent ici et vous l’avez allumée." },
      own: { title: "Vos propres choix", text: "Absente de vos résultats, mais vous l’avez allumée. Peut-être une part de vous qu’aucun test ne mesure." },
      wait: { title: "Seuls les tests pointent ici", text: "Vos résultats pointent ici, mais elle n’est pas encore allumée. Allumez-la si elle vous correspond." },
    },
  },
  es: {
    title: "El yo innato y el yo que siento", lead: "Tus tendencias medidas junto a las hojas que encendiste", empty: "Enciende una hoja y la compararemos con tus resultados.", on: "Encender",
    foot: "Los tests miden tendencias; las hojas recogen lo que sientes ahora. Una diferencia no es un error, solo dos miradas distintas. Aquí no se usan sistemas simbólicos como el saju o el zodiaco.",
    head: (m, n) => (m === n ? `Tus ${n} hojas encendidas coinciden con tus resultados.` : m > 0 ? `${m} de tus ${n} hojas encendidas coinciden con tus resultados.` : `Tus ${n} hojas encendidas quedan fuera de tus resultados.`),
    opposite: (s) => `lo opuesto a ${s}`, elsewhere: "Tus resultados señalan otra parte", unmeasured: "Ningún test mide esta hoja",
    groups: {
      cross: { title: "Elegiste el otro lado", text: "Los tests señalan un lado y encendiste el contrario. No está mal: tus tendencias y lo que sientes ahora pueden diferir." },
      match: { title: "Donde coinciden", text: "Los tests señalan aquí y la encendiste." },
      own: { title: "Elegidas por ti", text: "No está en tus resultados, pero la encendiste. Quizá sea una parte de ti que ningún test mide." },
      wait: { title: "Solo los tests señalan aquí", text: "Tus resultados señalan aquí, pero aún no la encendiste. Enciéndela si encaja." },
    },
  },
};

// Same hues as the tree's branches so the groups read as part of the map.
const COLORS: Record<Group, string> = { match: "#16a34a", own: "#0ea5e9", cross: "#e11d48", wait: "#a3a995" };
const ORDER: Group[] = ["cross", "match", "own", "wait"];

export function MindmapCompare({ lang, comparison, sourceLabel, onLight }: {
  lang: Lang;
  comparison: Comparison;
  sourceLabel: (rec: LeafRecommendation) => string;
  onLight: (branch: string, leaf: number) => void;
}) {
  const t = TEXT[lang];
  const { lit, match, own, cross } = comparison;
  const note = (group: Group, row: CompareRow) => {
    const sources = [...new Set(row.because.map(sourceLabel))];
    if (group === "cross") return t.opposite(sources[0] ?? "");
    if (sources.length) return sources.join(" · ");
    return row.measured ? t.elsewhere : t.unmeasured;
  };
  const name = (row: CompareRow) => {
    const cat = MINDMAP_CATS.find((item) => item.id === row.branch);
    return { leaf: cat?.chips[lang][row.leaf] ?? row.id, branch: cat?.label[lang] ?? row.branch };
  };
  // Bar segments as SVG rects: the widths are data, and the lint forbids inline styles.
  let x = 0;
  const bar = (["match", "own", "cross"] as const).map((group) => {
    const width = lit ? (comparison[group].length / lit) * 100 : 0;
    const rect = { group, x, width };
    x += width;
    return rect;
  });

  return (
    <section aria-live="polite" className="mt-4 border-t border-border pt-4">
      <h3 className="text-sm font-black text-foreground">{t.title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{t.lead}</p>
      {lit === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.empty}</p>
      ) : (
        <>
          <p className="mt-3 text-base font-bold leading-snug text-foreground">{t.head(match.length, lit)}</p>
          <svg viewBox="0 0 100 4" preserveAspectRatio="none" role="img" aria-label={`${t.groups.match.title} ${match.length} · ${t.groups.own.title} ${own.length} · ${t.groups.cross.title} ${cross.length}`} className="mt-2 block h-3 w-full overflow-hidden rounded-full">
            <rect width={100} height={4} className="fill-border" />
            {bar.map((rect) => (rect.width > 0 ? <rect key={rect.group} x={rect.x} width={rect.width} height={4} fill={COLORS[rect.group]} /> : null))}
          </svg>
          {ORDER.map((group) => {
            const rows = comparison[group];
            if (!rows.length) return null;
            return (
              <div key={group} className="mt-3 border-t border-border pt-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <svg viewBox="0 0 10 10" aria-hidden="true" className="size-2.5 shrink-0"><circle cx={5} cy={5} r={5} fill={COLORS[group]} /></svg>
                  {t.groups[group].title} · {rows.length}
                </h4>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{t.groups[group].text}</p>
                <ul className="mt-1.5 divide-y divide-dotted divide-border">
                  {rows.map((row) => {
                    const label = name(row);
                    return (
                      <li key={row.id} className="flex min-h-10 items-center justify-between gap-2 py-1.5">
                        <span className="text-sm">
                          <span className="font-bold text-foreground">{label.leaf}</span> <span className="text-xs text-muted-foreground">{label.branch}</span>
                        </span>
                        <span className="flex items-center gap-2 text-right">
                          <span className="text-xs leading-snug text-muted-foreground">{note(group, row)}</span>
                          {group === "wait" ? (
                            <button type="button" onClick={() => onLight(row.branch, row.leaf)} className="min-h-10 shrink-0 rounded-full border border-primary px-3 text-xs font-bold text-primary">
                              {t.on}
                            </button>
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.foot}</p>
        </>
      )}
    </section>
  );
}
