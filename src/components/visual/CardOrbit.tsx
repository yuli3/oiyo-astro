"use client";

/**
 * Drop-in wrapper for CardOrbitScene — cards orbiting like planets.
 * Domain-agnostic asset: pass any card list (astrology/saju/palja/celtic/
 * maya/numerology/...), the caller owns labels and copy.
 *
 * - Lazy: three/@react-three bundles load only once the panel scrolls
 *   into view (same idiom as CompatibilityOrbit.tsx).
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio capped on narrow screens.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";

import type { CardOrbitItem } from "./CardOrbitScene";

const OrbitScene = lazy(() => import("./CardOrbitScene"));

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

/** Mount the scene only once the placeholder scrolls into view. */
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

export interface CardOrbitProps {
  cards: CardOrbitItem[];
  /** Optional legend rendered below the canvas: card id -> display label. */
  legend?: Record<string, string>;
  /** Tailwind height classes for the canvas container. Default matches CompatibilityOrbit. */
  heightClassName?: string;
}

export default function CardOrbit({ cards, legend, heightClassName = "h-[22rem] w-full sm:h-[28rem]" }: CardOrbitProps) {
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

  if (cards.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-lime-200 bg-[#0b1220]">
      <div ref={containerRef} className={heightClassName}>
        {inView && (
          <Suspense fallback={null}>
            <OrbitScene cards={cards} animate={!reducedMotion} maxDpr={isNarrow ? 1.25 : 2} />
          </Suspense>
        )}
      </div>
      {legend && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-4 pt-3 sm:px-5">
          {cards.map((card) => (
            <li key={card.id} className="flex items-center gap-1.5 text-xs font-black text-lime-100">
              <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: card.color, boxShadow: `0 0 6px ${card.color}` }} />
              {legend[card.id] ?? card.id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
