"use client";

/**
 * Wrapper for the tarot spread's ambient Three.js arc visualization.
 *
 * - Lazy: three/@react-three bundles load only when the panel scrolls into view.
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio is capped.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useMotion";

const SpreadScene = lazy(() => import("./TarotSpreadScene"));

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, { hint: string }> = {
  ko: { hint: "카드를 뒤집으면 여기 있는 에너지 배열도 함께 밝아집니다." },
  en: { hint: "Flip a card and its energy here lights up too." },
  ja: { hint: "カードをめくると、ここのエネルギーも輝きます。" },
  zh: { hint: "翻开卡牌，这里对应的能量也会亮起。" },
  fr: { hint: "Retournez une carte et son énergie s'illumine ici aussi." },
  es: { hint: "Voltea una carta y su energía también se ilumina aquí." },
};

interface SpreadCardState {
  reversed: boolean;
  revealed: boolean;
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

export interface TarotSpreadProps {
  locale: string;
  cards: SpreadCardState[];
}

export default function TarotSpread({ locale, cards }: TarotSpreadProps) {
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
            <SpreadScene cards={cards} animate={!reducedMotion} maxDpr={isNarrow ? 1.25 : 2} />
          </Suspense>
        )}
      </div>
      <p className="px-3 py-2 text-[11px] font-medium text-emerald-200">{copy.hint}</p>
    </div>
  );
}
