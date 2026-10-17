"use client";

/**
 * Wrapper for the saju Five Elements (오행) orbit visualization.
 *
 * - Lazy: three/@react-three bundles load only when the panel scrolls into view.
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio is capped.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "@/hooks/useMotion";

const OrbitScene = lazy(() => import("./FiveElementsOrbitScene"));

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, { hint: string; legend: string; reset: string }> = {
  ko: {
    hint: "드래그해 오행의 상생·상극 관계를 돌려보세요.",
    legend: "바깥 고리 = 상생 · 안쪽 별 = 상극 · 빛 알갱이 = 상생 흐름",
    reset: "3D 정면 보기",
  },
  en: {
    hint: "Drag to rotate the generating and controlling cycles.",
    legend: "Outer ring = generates · inner star = controls · particles = generating flow",
    reset: "Reset View",
  },
  ja: {
    hint: "ドラッグして相生・相剋の関係を回してみましょう。",
    legend: "外側の輪＝相生・内側の星＝相剋・光の粒＝相生の流れ",
    reset: "正面に戻す",
  },
  zh: {
    hint: "拖动查看五行相生相克的关系。",
    legend: "外环＝相生 · 内星＝相克 · 光点＝相生之流",
    reset: "重置视角",
  },
  fr: {
    hint: "Faites glisser pour explorer génération et contrôle.",
    legend: "Anneau extérieur = génère · étoile intérieure = contrôle · particules = flux",
    reset: "Réinitialiser la vue",
  },
  es: {
    hint: "Arrastra para ver la generación y el control de los elementos.",
    legend: "Anillo exterior = genera · estrella interior = controla · partículas = flujo",
    reset: "Centrar vista",
  },
};

function useInView<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);
  return [ref, inView];
}

export interface FiveElementsOrbitProps {
  locale: string;
  elementCount: Record<string, number>;
  dominantElement: string;
  missingElements: string[];
}

export default function FiveElementsOrbit({ locale, elementCount, dominantElement, missingElements }: FiveElementsOrbitProps) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const copy = COPY[lang];
  const reducedMotion = useReducedMotion();
  const [containerRef, inView] = useInView<HTMLDivElement>();
  const [isNarrow, setIsNarrow] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    setIsNarrow(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsNarrow(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const handleResetView = () => {
    setSceneKey((k) => k + 1);
  };

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          type="button"
          onClick={handleResetView}
          className="flex items-center gap-1 rounded-lg border border-border bg-secondary/80 px-2 py-1 text-xs font-medium text-secondary-foreground backdrop-blur transition hover:bg-accent"
          title={copy.reset}
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden sm:inline">{copy.reset}</span>
        </button>
      </div>

      <div ref={containerRef} className="h-56 w-full sm:h-64">
        {inView && (
          <Suspense fallback={null}>
            <OrbitScene
              key={sceneKey}
              elementCount={elementCount}
              dominantElement={dominantElement}
              missingElements={missingElements}
              animate={!reducedMotion}
              maxDpr={isNarrow ? 1.25 : 2}
            />
          </Suspense>
        )}
      </div>
      <p className="px-3 py-2 text-xs font-medium text-muted-foreground border-t border-border/60">
        {copy.hint} · {copy.legend}
      </p>
    </div>
  );
}
