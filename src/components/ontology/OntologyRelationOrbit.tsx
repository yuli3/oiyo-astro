"use client";

import { useEffect, useMemo, useState } from "react";

import { resolveNodeLabel } from "@/lib/ontology/graph/label";
import { getNode } from "@/lib/ontology/graph/nodes";
import {
  type OrbitFocus,
  pushBreadcrumb,
  ringForFocus,
  seedIdsFromSignals,
  truncateBreadcrumb,
} from "@/lib/ontology/graph/orbit";
import { collectSignals } from "@/lib/ontology/signals";

// Lane 4 "관계 궤도": Focus+Orbit radial explorer (Phase 1 / Track A, step 4).
// Center = current focus ("나" at first, then whichever ring node was
// clicked). Exactly one ring is visible at a time — the design deliberately
// avoids a full-graph "조감도" (see company-brain design doc discussion,
// 2026-07-09: export covers that later, this screen is session-only
// exploration). Pure circle math (no d3/graph-lib) per the spec.
type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const LANGS: Lang[] = ["ko", "en", "ja", "zh", "fr", "es"];

const UI: Record<Lang, { center: string; empty: string }> = {
  ko: { center: "나", empty: "아직 연결할 신호가 없어요 — 테스트를 하나 해보세요" },
  en: { center: "Me", empty: "No signals to connect yet — try a test first" },
  ja: { center: "私", empty: "まだつながる信号がありません — まずテストを試してみて" },
  zh: { center: "我", empty: "还没有可连接的信号 — 先做个测试吧" },
  fr: { center: "Moi", empty: "Pas encore de signal à relier — essayez un test" },
  es: { center: "Yo", empty: "Aún no hay señales que conectar — prueba un test" },
};

const SIZE = 240;
const RADIUS = 88;
const CENTER = SIZE / 2;

export function OntologyRelationOrbit({ locale }: { locale: string }) {
  const lang = (LANGS.includes(locale as Lang) ? locale : "en") as Lang;
  const t = UI[lang];

  const [hydrated, setHydrated] = useState(false);
  const [seedIds, setSeedIds] = useState<string[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<OrbitFocus[]>([null]);
  const [labels, setLabels] = useState<Record<string, string>>({});

  // Signals only exist client-side (localStorage/zustand) — read them once
  // after mount, same hydration-guard idiom as ProfileMindmap.
  useEffect(() => {
    setSeedIds(seedIdsFromSignals(collectSignals()));
    setHydrated(true);
  }, []);

  const focus = breadcrumb[breadcrumb.length - 1];
  const ring = useMemo(() => ringForFocus(focus, seedIds), [focus, seedIds]);

  // Resolve localized labels for whatever's currently on screen (ring +
  // breadcrumb). Runs client-only too, so a brief raw-id flash before it
  // resolves is expected and harmless.
  useEffect(() => {
    const ids = new Set<string>();
    for (const id of ring) ids.add(id);
    for (const id of breadcrumb) if (id) ids.add(id);
    if (ids.size === 0) return;

    let cancelled = false;
    Promise.all(
      [...ids].map(async (id) => {
        const node = getNode(id);
        const label = node ? await resolveNodeLabel(lang, node.i18nKey) : undefined;
        return [id, label ?? id] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      setLabels((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });
    return () => {
      cancelled = true;
    };
  }, [ring, breadcrumb, lang]);

  const selectNode = (id: string) => setBreadcrumb((prev) => pushBreadcrumb(prev, id));
  const goToBreadcrumb = (index: number) => setBreadcrumb((prev) => truncateBreadcrumb(prev, index));

  const centerIcon = focus === null ? "🧭" : (getNode(focus)?.icon ?? "✨");
  const centerLabel = focus === null ? t.center : (labels[focus] ?? focus);
  const showEmpty = hydrated && focus === null && seedIds.length === 0;

  return (
    <div className="rounded-[28px] border border-green-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-700 text-2xl text-white shadow-sm transition-all duration-300">
            {centerIcon}
          </span>
          <span className="max-w-[92px] text-[11px] font-black leading-tight text-green-900 transition-all duration-300">
            {centerLabel}
          </span>
        </div>

        {ring.map((id, i) => {
          const node = getNode(id);
          const angle = (2 * Math.PI * i) / ring.length - Math.PI / 2;
          const x = CENTER + RADIUS * Math.cos(angle);
          const y = CENTER + RADIUS * Math.sin(angle);
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectNode(id)}
              className="absolute flex w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center transition-all duration-300"
              style={{ left: x, top: y }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-green-100 bg-white text-lg shadow-sm transition hover:border-green-400 hover:shadow">
                {node?.icon ?? "✨"}
              </span>
              <span className="line-clamp-2 text-[10px] font-bold leading-tight text-green-800">
                {labels[id] ?? id}
              </span>
            </button>
          );
        })}
      </div>

      {showEmpty ? <p className="mt-2 text-center text-xs font-bold text-green-500">{t.empty}</p> : null}

      <nav aria-label="breadcrumb" className="mt-4 flex flex-wrap items-center justify-center gap-1 text-[11px] font-bold text-green-600">
        {breadcrumb.map((id, i) => {
          const isLast = i === breadcrumb.length - 1;
          const label = id === null ? t.center : (labels[id] ?? id);
          return (
            <span key={`${id ?? "root"}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <span aria-hidden="true">→</span> : null}
              <button
                type="button"
                onClick={() => goToBreadcrumb(i)}
                disabled={isLast}
                className={isLast ? "text-green-900" : "hover:text-green-900 hover:underline"}
              >
                {label}
              </button>
            </span>
          );
        })}
      </nav>
    </div>
  );
}
