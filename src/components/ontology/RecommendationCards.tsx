"use client";

import { useEffect, useMemo, useState } from "react";

import type { RecommendationContext, RecommendationCategory, Recommendation } from "@/lib/engines/recommendation/contracts";
import { explainMatch, findDefinition, type MatchSignal } from "@/lib/engines/recommendation/reasoning";
import { RecommendationService } from "@/lib/engines/recommendation/service";
import { resolveNodeLabel } from "@/lib/ontology/graph/label";
import { getNode } from "@/lib/ontology/graph/nodes";
import { collectSignals } from "@/lib/ontology/signals";
import { prefersReducedMotion } from "@/hooks/useMotion";

// Lane 5 "당신을 위한 추천": the result cards the design doc calls for —
// matchScore + a "why" reasoning line built from the actual signals that
// drove the match (not the static `reasoning.primarySource` tag — see
// `@/lib/engines/recommendation/reasoning.ts`) + a "다음 탐색" deep link into
// `OntologyRelationOrbit` (Lane 4). One card per category, highest matchScore
// first (`RecommendationService.generateRecommendations()` already sorts each
// category descending).
type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const LANGS: Lang[] = ["ko", "en", "ja", "zh", "fr", "es"];

/** `RecommendationCategory` -> the plural field it lives under on `RecommendationResult`. */
const CATEGORY_RESULT_KEY: Record<string, keyof ReturnType<typeof RecommendationService.generateRecommendations>> = {
  career: "careers",
  hobby: "hobbies",
  mythology: "mythology",
  psychology: "psychology",
  science: "science",
  spirituality: "spirituality",
};
const CATEGORY_ORDER: RecommendationCategory[] = ["career", "hobby", "psychology", "mythology", "science", "spirituality"];

const EMPTY_COPY: Record<Lang, { title: string; description: string }> = {
  ko: { title: "아직 추천할 게 없어요", description: "생년월일을 저장하거나 테스트를 하나 완료하면 맞춤 추천이 열립니다." },
  en: { title: "Nothing to recommend yet", description: "Save your birth date or finish a test to unlock personal picks." },
  ja: { title: "まだおすすめがありません", description: "生年月日を保存するかテストを完了すると、おすすめが開きます。" },
  zh: { title: "暂时还没有推荐", description: "保存出生日期或完成一项测试后即可获得个性化推荐。" },
  fr: { title: "Rien à recommander pour l'instant", description: "Enregistrez votre naissance ou terminez un test pour débloquer les suggestions." },
  es: { title: "Aún no hay recomendaciones", description: "Guarda tu fecha de nacimiento o completa un test para recibir sugerencias." },
};

interface CardEntry {
  rec: Recommendation;
  /** Signals behind the match, ranked by contribution — `[]` for graph-fallback recommendations (no backing `RecommendationDefinition` to explain). */
  signals: MatchSignal[];
  /** Ontology graph node id to focus the relation-orbit on when "다음 탐색" is clicked — from the top signal, or (graph-fallback recs) the id itself. `undefined` when neither applies. */
  exploreNodeId?: string;
}

function graphFallbackNodeId(recId: string, category: string): string | undefined {
  const prefix = `${category}-graph-`;
  return recId.startsWith(prefix) ? recId.slice(prefix.length) : undefined;
}

export function RecommendationCards({ locale }: { locale: string }) {
  const lang = (LANGS.includes(locale as Lang) ? locale : "en") as Lang;

  const [hydrated, setHydrated] = useState(false);
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [openWhy, setOpenWhy] = useState<Record<string, boolean>>({});

  // Signals only exist client-side — build recommendations once after mount,
  // same hydration-guard idiom as ProfileMindmap/OntologyRelationOrbit.
  useEffect(() => {
    const ctx: RecommendationContext = { interpretation: {}, signals: collectSignals() };
    const result = RecommendationService.generateRecommendations(ctx);

    const entries: CardEntry[] = [];
    for (const category of CATEGORY_ORDER) {
      const list = result[CATEGORY_RESULT_KEY[category]];
      const top = list[0];
      if (!top) continue;

      const def = findDefinition(top.id);
      const signals = def ? explainMatch(def, ctx) : [];
      const exploreNodeId = signals.find((s) => s.nodeId)?.nodeId ?? graphFallbackNodeId(top.id, category);

      entries.push({ rec: top, signals, exploreNodeId });
    }
    setCards(entries);
    setHydrated(true);
  }, []);

  // Resolve every i18n key this render needs (UI chrome + card copy + node
  // labels for signal values) in one batch, same pattern as
  // OntologyRelationOrbit's ring-label resolution. A raw-key flash before
  // this resolves is expected and harmless.
  useEffect(() => {
    const keys = new Set<string>([
      "recommendations.cards.sectionTitle",
      "recommendations.cards.sectionSubtitle",
      "recommendations.cards.matchLabel",
      "recommendations.cards.why",
      "recommendations.cards.explore",
      "recommendations.cards.emptyTitle",
      "recommendations.cards.emptyDescription",
      "recommendations.cards.reasonTemplate",
      "recommendations.cards.reasonFallback",
    ]);
    for (const { rec, signals } of cards) {
      keys.add(rec.title);
      keys.add(`recommendations.cards.categories.${rec.category}`);
      for (const s of signals) {
        keys.add(`recommendations.cards.sources.${s.source}`);
        if (s.nodeId) {
          const node = getNode(s.nodeId);
          if (node) keys.add(node.i18nKey);
        }
      }
    }

    let cancelled = false;
    Promise.all([...keys].map(async (key) => [key, await resolveNodeLabel(lang, key)] as const)).then((entries) => {
      if (cancelled) return;
      setTexts((prev) => {
        const next = { ...prev };
        for (const [key, value] of entries) if (value !== undefined) next[key] = value;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [cards, lang]);

  const tt = (key: string) => texts[key] ?? key;

  const reasonFor = useMemo(
    () => (entry: CardEntry) => {
      if (entry.signals.length === 0) return tt("recommendations.cards.reasonFallback");
      const chunks = entry.signals.map((s) => {
        const sourceLabel = tt(`recommendations.cards.sources.${s.source}`);
        const node = s.nodeId ? getNode(s.nodeId) : undefined;
        const valueLabel = node ? tt(node.i18nKey) : s.value;
        return `${sourceLabel} ${valueLabel}`;
      });
      return tt("recommendations.cards.reasonTemplate").replace("{signals}", chunks.join(" + "));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texts],
  );

  const explore = (nodeId: string | undefined) => {
    if (!nodeId) return;
    window.dispatchEvent(new CustomEvent("oiyo:orbit-focus", { detail: { nodeId } }));
    document.getElementById("relation-orbit")?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  };

  // First-time visitors with no signals yet: RecommendationService already
  // filters every definition below `MIN_DISPLAY_SCORE` and the graph
  // fallback returns `[]` for a signal-less profile, so `cards` is
  // legitimately empty — show guidance instead of fabricating a match.
  if (hydrated && cards.length === 0) {
    return (
      <div className="rounded-[28px] border border-green-100 bg-white p-5 text-center shadow-sm">
        <p className="text-sm font-black text-green-900">{texts["recommendations.cards.emptyTitle"] ?? EMPTY_COPY[lang].title}</p>
        <p className="mt-1 text-xs text-green-600">{texts["recommendations.cards.emptyDescription"] ?? EMPTY_COPY[lang].description}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((entry) => {
        const { rec } = entry;
        const isOpen = !!openWhy[rec.id];
        return (
          <div key={rec.id} className="rounded-[28px] border border-green-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-green-500">
                  {tt(`recommendations.cards.categories.${rec.category}`)}
                </p>
                <p className="mt-0.5 truncate text-sm font-black text-green-950">{tt(rec.title)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-green-700 px-2.5 py-1 text-[11px] font-black text-white">
                {tt("recommendations.cards.matchLabel")} {rec.matchScore}
              </span>
            </div>

            <details className="mt-2" open={isOpen} onToggle={(e) => setOpenWhy((prev) => ({ ...prev, [rec.id]: e.currentTarget.open }))}>
              <summary className="cursor-pointer text-xs font-bold text-green-600">{tt("recommendations.cards.why")}</summary>
              <p className="mt-1 text-xs leading-5 text-green-700">{reasonFor(entry)}</p>
            </details>

            {entry.exploreNodeId ? (
              <button
                type="button"
                onClick={() => explore(entry.exploreNodeId)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-black text-green-700 hover:text-green-900"
              >
                {tt("recommendations.cards.explore")} →
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
