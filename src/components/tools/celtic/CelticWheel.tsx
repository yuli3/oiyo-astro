"use client";

/**
 * Wrapper for the Celtic tree (Ogham) calendar wheel visualization.
 *
 * - Lazy: three/@react-three bundles load only when the panel scrolls into view.
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio is capped.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";

const WheelScene = lazy(() => import("./CelticWheelScene"));

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, { hint: string }> = {
  ko: { hint: "드래그해 켈트 나무 달력을 돌려보세요. 밝은 별이 당신의 나무입니다." },
  en: { hint: "Drag to rotate the Celtic tree calendar. The bright node is your tree." },
  ja: { hint: "ドラッグしてケルトの樹木暦を回してみましょう。明るい星があなたの木です。" },
  zh: { hint: "拖动查看凯尔特树历。最亮的星是你的树。" },
  fr: { hint: "Faites glisser pour explorer le calendrier des arbres celtiques. Le point lumineux est votre arbre." },
  es: { hint: "Arrastra para explorar el calendario de árboles celtas. El punto brillante es tu árbol." },
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

export interface CelticWheelProps {
  locale: string;
  total: number;
  myIndex: number;
}

export default function CelticWheel({ locale, total, myIndex }: CelticWheelProps) {
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
    <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-900 bg-[#0f1a08]">
      <div ref={containerRef} className="h-56 w-full sm:h-64">
        {inView && (
          <Suspense fallback={null}>
            <WheelScene total={total} myIndex={myIndex} animate={!reducedMotion} maxDpr={isNarrow ? 1.25 : 2} />
          </Suspense>
        )}
      </div>
      <p className="px-3 py-2 text-[11px] font-medium text-emerald-200">{copy.hint}</p>
    </div>
  );
}
