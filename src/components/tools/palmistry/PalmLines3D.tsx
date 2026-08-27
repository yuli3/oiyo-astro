"use client";

/**
 * Wrapper for the palm-lines 3D trace visualization.
 *
 * - Lazy: three/@react-three bundles load only when the panel scrolls into view.
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio is capped.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { PalmLineId } from "../../../lib/ontology/palmistry/palm-lines";
import type { PalmLineDef } from "./PalmLinesScene";

const LinesScene = lazy(() => import("./PalmLinesScene"));

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, { hint: string }> = {
  ko: { hint: "선택한 선이 앞으로 떠올라 빛납니다. 실제 손금 모양 그대로예요." },
  en: { hint: "The selected line lifts forward and glows — traced from the real palm shape." },
  ja: { hint: "選んだ線が手前に浮かび上がって輝きます。実際の手相の形そのままです。" },
  zh: { hint: "选中的线会浮起并发光——形状完全来自真实手相。" },
  fr: { hint: "La ligne sélectionnée s'avance et s'illumine — tracée depuis la vraie forme de la paume." },
  es: { hint: "La línea seleccionada se eleva y brilla, trazada desde la forma real de la palma." },
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

export interface PalmLines3DProps {
  locale: string;
  lines: PalmLineDef[];
  active: PalmLineId;
}

export default function PalmLines3D({ locale, lines, active }: PalmLines3DProps) {
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
    <div className="mt-4 overflow-hidden rounded-2xl border border-violet-950 bg-[#0f0b17]">
      <div ref={containerRef} className="h-56 w-full sm:h-64">
        {inView && (
          <Suspense fallback={null}>
            <LinesScene lines={lines} active={active} animate={!reducedMotion} maxDpr={isNarrow ? 1.25 : 2} />
          </Suspense>
        )}
      </div>
      <p className="px-3 py-2 text-[11px] font-medium text-violet-200">{copy.hint}</p>
    </div>
  );
}
