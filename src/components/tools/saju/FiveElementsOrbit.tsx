"use client";

/**
 * Wrapper for the saju Five Elements (오행) orbit visualization.
 *
 * - Lazy: three/@react-three bundles load only when the panel scrolls into view.
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio is capped.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";

const OrbitScene = lazy(() => import("./FiveElementsOrbitScene"));

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, { hint: string; legend: string }> = {
  ko: { hint: "드래그해 오행의 상생·상극 관계를 돌려보세요.", legend: "바깥 고리 = 상생 · 안쪽 별 = 상극" },
  en: { hint: "Drag to rotate the generating and controlling cycles.", legend: "Outer ring = generates · inner star = controls" },
  ja: { hint: "ドラッグして相生・相剋の関係を回してみましょう。", legend: "外側の輪＝相生・内側の星＝相剋" },
  zh: { hint: "拖动查看五行相生相克的关系。", legend: "外环＝相生 · 内星＝相克" },
  fr: { hint: "Faites glisser pour explorer génération et contrôle.", legend: "Anneau extérieur = génère · étoile intérieure = contrôle" },
  es: { hint: "Arrastra para ver la generación y el control de los elementos.", legend: "Anillo exterior = genera · estrella interior = controla" },
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useInView<T extends HTMLElement>(): [React.RefObject<T>, boolean] {
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

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    setIsNarrow(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsNarrow(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-gray-800 bg-[#0b1220]">
      <div ref={containerRef} className="h-56 w-full sm:h-64">
        {inView && (
          <Suspense fallback={null}>
            <OrbitScene
              elementCount={elementCount}
              dominantElement={dominantElement}
              missingElements={missingElements}
              animate={!reducedMotion}
              maxDpr={isNarrow ? 1.25 : 2}
            />
          </Suspense>
        )}
      </div>
      <p className="px-3 py-2 text-[11px] font-medium text-gray-400">{copy.hint} · {copy.legend}</p>
    </div>
  );
}
