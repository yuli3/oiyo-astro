"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/useMotion";
import { collectAssessmentSignals } from "@/assessments";
import { MINDMAP_CATS, MINDMAP_STORAGE_KEY, type MindmapCat, type MindmapLang } from "@/lib/ontology/mindmap-data";
import { hasRecommendationSource, recommendLeaves, type LeafRecommendation } from "@/lib/ontology/mindmap-recommend";
import { TREE_HEIGHT, TREE_WIDTH, leafId, litLeaves, splitLabel, toggleLeaf, treeLayout, type TreePoint } from "@/lib/ontology/mindmap-tree";

// Lane 3 "실제 나의 것": a radial tree, read like a game's tech tree (2026-10-08, 세운).
// "나" sits in the middle, five branches grow from it, and every chip is a leaf on its branch.
// The overview shows the whole tree with the chosen leaves lit, so the shape of what a person
// has picked is visible at a glance. Tapping a branch opens it upward and its leaves can be
// switched on and off. Nothing is locked: this is a place to choose, not to earn.
//
// An earlier single-arc fan was dropped because six or seven labels overlap on a 320px stage.
// The open branch now uses two staggered arcs (see treeLayout). A list view carries the same
// choices for screen readers and for anyone who prefers plain buttons.
// Stored in oiyo:profile:v1 as before: { chosen: { [category]: label[] } }.
type Lang = MindmapLang;
type Cat = MindmapCat;
const KEY = MINDMAP_STORAGE_KEY;
const CATS = MINDMAP_CATS;

const UI: Record<Lang, { center: string; saved: string; count: (n: number) => string; hint: string; back: string; tree: string; list: string; view: string; suggested: string; why: string; noTests: string; tests: string }> = {
  ko: { center: "나", saved: "저장됨", count: (n) => `${n}개 선택`, hint: "가지를 눌러 펼쳐 보세요", back: "‘나’를 누르면 전체로 돌아가요", tree: "트리", list: "목록", view: "보기 방식", suggested: "추천", why: "점선은 내 검사 결과와 닿아 있는 잎이에요", noTests: "검사를 하면 닿아 있는 잎이 점선으로 표시돼요.", tests: "검사 보러 가기" },
  en: { center: "Me", saved: "Saved", count: (n) => `${n} selected`, hint: "Tap a branch to open it", back: "Tap “Me” to see the whole tree", tree: "Tree", list: "List", view: "View", suggested: "suggested", why: "Dashed rings are leaves your test results point at", noTests: "Take a test and the leaves it points at get a dashed ring.", tests: "See the tests" },
  ja: { center: "私", saved: "保存", count: (n) => `${n}個選択`, hint: "枝をタップして開きましょう", back: "「私」を押すと全体に戻ります", tree: "ツリー", list: "リスト", view: "表示方法", suggested: "おすすめ", why: "点線は検査結果とつながる葉です", noTests: "検査を受けると、結果とつながる葉が点線で表示されます。", tests: "検査を見る" },
  zh: { center: "我", saved: "已保存", count: (n) => `已选 ${n}`, hint: "点一根枝条展开看看", back: "点“我”回到整棵树", tree: "树", list: "列表", view: "显示方式", suggested: "推荐", why: "虚线圈是与你的测试结果相连的叶子", noTests: "做了测试后，与结果相连的叶子会以虚线圈显示。", tests: "去看测试" },
  fr: { center: "Moi", saved: "Enregistré", count: (n) => `${n} choisis`, hint: "Touchez une branche pour l’ouvrir", back: "Touchez « Moi » pour revoir tout l’arbre", tree: "Arbre", list: "Liste", view: "Affichage", suggested: "suggéré", why: "Les anneaux en pointillé sont les feuilles liées à vos résultats", noTests: "Passez un test : les feuilles liées à vos résultats apparaîtront en pointillé.", tests: "Voir les tests" },
  es: { center: "Yo", saved: "Guardado", count: (n) => `${n} elegidos`, hint: "Toca una rama para abrirla", back: "Toca «Yo» para ver todo el árbol", tree: "Árbol", list: "Lista", view: "Vista", suggested: "sugerido", why: "Los anillos punteados son hojas ligadas a tus resultados", noTests: "Haz un test y las hojas ligadas a tus resultados aparecerán con un anillo punteado.", tests: "Ver los tests" },
};

// 가지마다 색 — 켠 잎이 어느 갈래에서 왔는지 전체 보기에서도 보인다.
const CAT_COLORS: Record<string, string> = {
  interest: "#16a34a",
  activity: "#0ea5e9",
  environment: "#65a30d",
  relation: "#e11d48",
  goal: "#8b5cf6",
};
const IDLE_LINE = "#cfd5c2";

// How a recommendation names its source in the one-line reason under an open branch.
const VALUE_LABEL: Record<string, Record<Lang, string>> = {
  security: { ko: "안정", en: "security", ja: "安定", zh: "安定", fr: "sécurité", es: "seguridad" },
  achievement: { ko: "성취", en: "achievement", ja: "達成", zh: "成就", fr: "réussite", es: "logro" },
  autonomy: { ko: "자율", en: "autonomy", ja: "自律", zh: "自主", fr: "autonomie", es: "autonomía" },
  service: { ko: "봉사", en: "service", ja: "奉仕", zh: "服务", fr: "service", es: "servicio" },
  creativity: { ko: "창의", en: "creativity", ja: "創造", zh: "创造", fr: "créativité", es: "creatividad" },
  status: { ko: "지위", en: "status", ja: "地位", zh: "地位", fr: "statut", es: "estatus" },
};
const VALUES_NAME: Record<Lang, string> = { ko: "직업가치", en: "Work values", ja: "仕事の価値観", zh: "职业价值", fr: "Valeurs au travail", es: "Valores laborales" };
function sourceLabel(rec: LeafRecommendation, lang: Lang): string {
  if (rec.source === "riasec") return `RIASEC ${rec.key}`;
  if (rec.source === "mbti") return `MBTI ${rec.key}`;
  if (rec.source === "big5") return rec.key.endsWith("-") ? `Big Five ${rec.key.slice(0, -1)}↓` : `Big Five ${rec.key}↑`;
  return `${VALUES_NAME[lang]} · ${VALUE_LABEL[rec.key]?.[lang] ?? rec.key}`;
}
// "RIASEC A → 창작, 글쓰기" rather than the source repeated once per leaf.
function reasonGroups(recs: readonly LeafRecommendation[], lang: Lang): { label: string; leaves: number[] }[] {
  const groups: { label: string; leaves: number[] }[] = [];
  for (const rec of recs) {
    const label = sourceLabel(rec, lang);
    const group = groups.find((item) => item.label === label);
    if (group) group.leaves.push(rec.leaf);
    else groups.push({ label, leaves: [rec.leaf] });
  }
  return groups;
}
const BRANCHES = CATS.map((cat) => ({ id: cat.id, leaves: cat.chips.ko.length }));
const TWEEN_MS = 460;

export function ProfileMindmap({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = UI[lang];
  const reducedMotion = useReducedMotion();
  const [sel, setSel] = useState<Record<string, string[]>>({});
  const [hydrated, setHydrated] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [asList, setAsList] = useState(false);
  // Recommendations are worked out from the test results on this device each time; nothing is stored.
  const [recs, setRecs] = useState<LeafRecommendation[]>([]);
  const [hasTests, setHasTests] = useState(true);
  useEffect(() => {
    try {
      const signals = collectAssessmentSignals();
      setRecs(recommendLeaves(signals));
      setHasTests(hasRecommendationSource(signals));
    } catch {
      setRecs([]);
    }
  }, []);
  const recByLeaf = useMemo(() => new Map(recs.map((rec) => [leafId(rec.branch, rec.leaf), rec])), [recs]);

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) { const p = JSON.parse(s); if (p && typeof p === "object" && p.chosen) setSel(p.chosen); } } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      const prev = JSON.parse(localStorage.getItem(KEY) || "{}");
      localStorage.setItem(KEY, JSON.stringify({ ...prev, chosen: sel, updatedAt: Date.now() }));
      window.dispatchEvent(new Event("oiyo:profile-updated"));
    } catch {}
  }, [sel, hydrated]);

  const lit = useMemo(() => Object.fromEntries(CATS.map((cat) => [cat.id, litLeaves(sel[cat.id], cat.chips)])) as Record<string, Set<number>>, [sel]);
  const total = useMemo(() => Object.values(lit).reduce((sum, leaves) => sum + leaves.size, 0), [lit]);
  const popRef = useRef<string | null>(null);
  const toggle = (cat: Cat, index: number) => {
    if (!lit[cat.id].has(index)) popRef.current = leafId(cat.id, index);
    setSel((current) => ({ ...current, [cat.id]: toggleLeaf(current[cat.id], index, lang, cat.chips) }));
  };

  // Positions are tweened by hand on the SVG nodes: a React render per frame for forty nodes
  // would be wasteful, and SVG line endpoints do not take CSS transitions.
  const nodes = useRef<Record<string, SVGGElement | null>>({});
  const labels = useRef<Record<string, SVGTextElement | null>>({});
  const lines = useRef<Record<string, SVGLineElement | null>>({});
  const current = useRef<Record<string, TreePoint>>(treeLayout(BRANCHES, null));
  const frame = useRef(0);

  const paint = useCallback(() => {
    const points = current.current;
    for (const [id, point] of Object.entries(points)) {
      const node = nodes.current[id];
      if (node) {
        node.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) scale(${point.scale.toFixed(3)})`);
        node.setAttribute("opacity", point.opacity.toFixed(3));
      }
      labels.current[id]?.setAttribute("opacity", point.label.toFixed(3));
    }
    for (const branch of BRANCHES) {
      const from = points.me, to = points[branch.id];
      const trunk = lines.current[branch.id];
      if (trunk && from && to) {
        trunk.setAttribute("x1", from.x.toFixed(2)); trunk.setAttribute("y1", from.y.toFixed(2));
        trunk.setAttribute("x2", to.x.toFixed(2)); trunk.setAttribute("y2", to.y.toFixed(2));
        trunk.setAttribute("opacity", to.opacity.toFixed(3));
      }
      for (let leaf = 0; leaf < branch.leaves; leaf += 1) {
        const id = leafId(branch.id, leaf);
        const twig = lines.current[id], end = points[id];
        if (!twig || !to || !end) continue;
        twig.setAttribute("x1", to.x.toFixed(2)); twig.setAttribute("y1", to.y.toFixed(2));
        twig.setAttribute("x2", end.x.toFixed(2)); twig.setAttribute("y2", end.y.toFixed(2));
        twig.setAttribute("opacity", end.opacity.toFixed(3));
      }
    }
  }, []);

  // Place the nodes before the first paint, and again whenever the tree is shown after the list.
  // The positions are not in JSX on purpose: React would write them back on every render.
  useLayoutEffect(() => { if (!asList) paint(); }, [asList, paint]);

  useEffect(() => {
    const from = current.current;
    const to = treeLayout(BRANCHES, focus);
    cancelAnimationFrame(frame.current);
    if (reducedMotion) { current.current = to; paint(); return; }
    const started = performance.now();
    const ease = (p: number) => 1 - (1 - p) ** 3.2;
    const step = (now: number) => {
      const p = Math.min(1, (now - started) / TWEEN_MS), e = ease(p);
      const next: Record<string, TreePoint> = {};
      for (const [id, b] of Object.entries(to)) {
        const a = from[id] ?? b;
        next[id] = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, scale: a.scale + (b.scale - a.scale) * e, opacity: a.opacity + (b.opacity - a.opacity) * e, label: a.label + (b.label - a.label) * e };
      }
      current.current = next;
      paint();
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [focus, reducedMotion, paint]);

  // A leaf that was just switched on swells for a moment, like a node being unlocked.
  useEffect(() => {
    const id = popRef.current;
    popRef.current = null;
    const node = id ? nodes.current[id] : null;
    const point = id ? current.current[id] : null;
    if (!node || !point || reducedMotion) return;
    const started = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - started) / 380);
      const swell = 1 + 0.32 * Math.sin(Math.PI * p) * (1 - p * 0.4);
      node.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)}) scale(${(point.scale * swell).toFixed(3)})`);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [sel, reducedMotion]);

  const press = (action: () => void) => ({
    onClick: action,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
    },
  });
  const focused = CATS.find((cat) => cat.id === focus) ?? null;
  // Leaves already switched on need no nudge, so their reason is not repeated.
  const focusedRecs = focused ? recs.filter((rec) => rec.branch === focused.id && !lit[focused.id].has(rec.leaf)) : [];

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-primary">{total > 0 ? `✓ ${t.saved} · ${t.count(total)}` : t.count(0)}</span>
        <div role="group" aria-label={t.view} className="inline-flex overflow-hidden rounded-full border border-border">
          <button type="button" aria-pressed={!asList} onClick={() => setAsList(false)} className={"min-h-10 px-4 text-xs font-bold " + (!asList ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>{t.tree}</button>
          <button type="button" aria-pressed={asList} onClick={() => setAsList(true)} className={"min-h-10 px-4 text-xs font-bold " + (asList ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}>{t.list}</button>
        </div>
      </div>

      {asList ? (
        <div className="space-y-4">
          {CATS.map((cat) => (
            <div key={cat.id}>
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-primary">{cat.label[lang]}</p>
              <div className="flex flex-wrap gap-2">
                {cat.chips[lang].map((chip, index) => {
                  const on = lit[cat.id].has(index);
                  return (
                    <button
                      key={chip}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(cat, index)}
                      className={"min-h-10 rounded-full border px-3.5 text-xs font-bold transition " + (on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground")}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 ${TREE_WIDTH} ${TREE_HEIGHT}`} role="group" aria-label={t.view} className="mx-auto block h-auto w-full max-w-sm touch-manipulation select-none">
            <g aria-hidden="true">
              {CATS.map((cat) => {
                const has = lit[cat.id].size > 0;
                return (
                  <g key={cat.id}>
                    <line ref={(el) => { lines.current[cat.id] = el; }} stroke={has ? CAT_COLORS[cat.id] : IDLE_LINE} strokeWidth={has ? 2.4 : 1.4} strokeLinecap="round" />
                    {cat.chips.ko.map((_, index) => {
                      const on = lit[cat.id].has(index);
                      return <line key={index} ref={(el) => { lines.current[leafId(cat.id, index)] = el; }} stroke={on ? CAT_COLORS[cat.id] : IDLE_LINE} strokeWidth={on ? 2.2 : 1.1} strokeDasharray={on ? undefined : "2 5"} strokeLinecap="round" />;
                    })}
                  </g>
                );
              })}
            </g>

            {CATS.map((cat) =>
              cat.chips[lang].map((chip, index) => {
                const id = leafId(cat.id, index);
                const on = lit[cat.id].has(index);
                const open = focus === cat.id;
                const parts = splitLabel(chip);
                const suggested = !on && recByLeaf.has(id);
                return (
                  <g
                    key={id}
                    ref={(el) => { nodes.current[id] = el; }}
                    role="button"
                    aria-pressed={on}
                    aria-label={suggested ? `${chip} (${t.suggested})` : chip}
                    aria-hidden={open ? undefined : true}
                    tabIndex={open ? 0 : -1}
                    pointerEvents={open ? "auto" : "none"}
                    className="cursor-pointer outline-none"
                    {...press(() => toggle(cat, index))}
                  >
                    <circle r={22} fill="transparent" />
                    {on ? <circle r={21} fill={CAT_COLORS[cat.id]} opacity={0.2} /> : null}
                    {suggested ? <circle r={20} fill="none" stroke={CAT_COLORS[cat.id]} strokeWidth={1.6} strokeDasharray="3.5 3.5" /> : null}
                    <circle r={15} fill={on ? CAT_COLORS[cat.id] : undefined} stroke={on ? CAT_COLORS[cat.id] : undefined} strokeWidth={1.5} className={on ? undefined : "fill-card stroke-border"} />
                    {on ? <path d="M-5.5 0.5 L-1.5 4.5 L6 -4" fill="none" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="stroke-primary-foreground" /> : null}
                    <text ref={(el) => { labels.current[id] = el; }} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-foreground">
                      {parts.map((part, line) => <tspan key={part} x={0} y={27 + line * 11}>{part}</tspan>)}
                    </text>
                  </g>
                );
              }),
            )}

            {CATS.map((cat, index) => {
              const count = lit[cat.id].size;
              const open = focus === cat.id;
              const label = cat.label[lang] + (count > 0 ? ` · ${count}` : "");
              return (
                <g
                  key={cat.id}
                  ref={(el) => { nodes.current[cat.id] = el; }}
                  role="button"
                  aria-expanded={open}
                  aria-label={label}
                  tabIndex={0}
                  className="cursor-pointer outline-none"
                  {...press(() => setFocus(open ? null : cat.id))}
                >
                  <circle r={28} fill="transparent" />
                  {count > 0 || open ? <circle r={26} fill={CAT_COLORS[cat.id]} opacity={0.16} /> : null}
                  <circle r={21} fill={open ? CAT_COLORS[cat.id] : undefined} stroke={count > 0 || open ? CAT_COLORS[cat.id] : undefined} strokeWidth={1.6} className={open ? undefined : count > 0 ? "fill-card" : "fill-card stroke-border"} />
                  <text textAnchor="middle" y={4.5} fontSize={13} fontWeight={700} fill={!open && count > 0 ? CAT_COLORS[cat.id] : undefined} className={open ? "fill-primary-foreground" : count > 0 ? undefined : "fill-primary"}>{index + 1}</text>
                  <text ref={(el) => { labels.current[cat.id] = el; }} textAnchor="middle" y={36} fontSize={11} fontWeight={700} className="fill-foreground">{label}</text>
                </g>
              );
            })}

            <g
              ref={(el) => { nodes.current.me = el; }}
              role="button"
              aria-label={focus ? t.back : t.center}
              tabIndex={focus ? 0 : -1}
              className={focus ? "cursor-pointer outline-none" : "outline-none"}
              {...press(() => setFocus(null))}
            >
              <circle r={31} className="fill-primary" />
              <text textAnchor="middle" y={5} fontSize={15} fontWeight={700} className="fill-primary-foreground">{t.center}</text>
            </g>
          </svg>
          <p aria-live="polite" className="mt-1 min-h-5 text-center text-xs font-bold text-muted-foreground">
            {focused ? `${focused.label[lang]} · ${lit[focused.id].size}/${focused.chips.ko.length} — ${t.back}` : t.hint}
          </p>
          {focused && focusedRecs.length > 0 ? (
            <p className="mt-1 text-center text-xs leading-relaxed text-muted-foreground">
              {t.why} · {reasonGroups(focusedRecs, lang).map((group) => `${group.label} → ${group.leaves.map((leaf) => focused.chips[lang][leaf]).join(", ")}`).join(" · ")}
            </p>
          ) : null}
          {!focused && !hasTests ? (
            <p className="mt-1 text-center text-xs leading-relaxed text-muted-foreground">
              {t.noTests} <a href={`/${lang}/tests/`} className="font-bold text-primary underline underline-offset-2">{t.tests}</a>
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
