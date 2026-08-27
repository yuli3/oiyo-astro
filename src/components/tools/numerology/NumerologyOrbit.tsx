"use client";

/**
 * Wrapper for the numerology result set's Three.js orbit visualization.
 *
 * - Lazy: three/@react-three bundles load only when the panel scrolls into view.
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio is capped.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { NumerologyNode } from "./NumerologyOrbitScene";

const OrbitScene = lazy(() => import("./NumerologyOrbitScene"));

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, { hint: string }> = {
  ko: { hint: "숫자가 클수록 별이 커집니다. 금빛 별은 마스터 넘버입니다." },
  en: { hint: "Bigger numbers make bigger stars. Gold stars are master numbers." },
  ja: { hint: "数字が大きいほど星も大きくなります。金色の星はマスターナンバーです。" },
  zh: { hint: "数字越大，星星越大。金色星星是大师数字。" },
  fr: { hint: "Plus le nombre est grand, plus l'étoile est grande. Les étoiles dorées sont les nombres maîtres." },
  es: { hint: "Cuanto mayor sea el número, más grande será la estrella. Las estrellas doradas son números maestros." },
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

export interface NumerologyOrbitProps {
  locale: string;
  nodes: NumerologyNode[];
}

export default function NumerologyOrbit({ locale, nodes }: NumerologyOrbitProps) {
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

  if (nodes.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-950 bg-[#140f24]">
      <div ref={containerRef} className="h-56 w-full sm:h-64">
        {inView && (
          <Suspense fallback={null}>
            <OrbitScene nodes={nodes} animate={!reducedMotion} maxDpr={isNarrow ? 1.25 : 2} />
          </Suspense>
        )}
      </div>
      <p className="px-3 py-2 text-[11px] font-medium text-violet-200">{copy.hint}</p>
    </div>
  );
}
