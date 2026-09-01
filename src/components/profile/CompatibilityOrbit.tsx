"use client";

/**
 * Orbit visualization layer for multi-person compatibility views.
 *
 * - Lazy: three/@react-three bundles load only when the panel scrolls into view.
 * - Deterministic: layout derives from birth-data harmony scores (orbit-layout.ts).
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio is capped and touch orbit controls are enabled
 *   by the underlying OrbitControls.
 */

import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";

import {
  buildPairLayout,
  buildSystemLayout,
  type OrbitLayout,
} from "@/lib/symbolic-tradition/orbit-layout";
import { useReducedMotion } from "@/hooks/useMotion";

const OrbitScene = lazy(() => import("./CompatibilityOrbitScene"));

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, { title: string; hint: string; legend: string }> = {
  ko: { title: "궤도로 보는 우리", hint: "가까울수록 밝게 빛나는 관계입니다. 드래그해 돌려보세요.", legend: "행성 색 · 이름" },
  en: { title: "Us in orbit", hint: "Closer and brighter means stronger harmony. Drag to look around.", legend: "Planet color · name" },
  ja: { title: "軌道で見るみんな", hint: "近くて明るいほど相性が良いサイン。ドラッグで回せます。", legend: "惑星の色・名前" },
  zh: { title: "轨道中的我们", hint: "越近越亮代表越合拍。拖动即可环视。", legend: "行星颜色 · 名字" },
  fr: { title: "Nous en orbite", hint: "Plus c'est proche et lumineux, plus l'harmonie est forte. Faites glisser pour tourner.", legend: "Couleur · prénom" },
  es: { title: "Nosotros en órbita", hint: "Más cerca y más brillante significa más armonía. Arrastra para mirar.", legend: "Color · nombre" },
};

export interface CompatibilityOrbitPerson {
  id: string;
  label: string;
  /** 0-100 harmony score with the center person (or the other person in pair mode). */
  score: number;
}

interface Props {
  locale: string;
  /** Center person id (system mode). Omitted for pair mode. */
  centerId?: string;
  people: CompatibilityOrbitPerson[];
  /** "pair" for two-person views, "system" for 3+. */
  mode: "pair" | "system";
}

/** Mount children only once the placeholder scrolls into view. */
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

export default function CompatibilityOrbit({ locale, centerId, people, mode }: Props) {
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

  const layout = useMemo<OrbitLayout | null>(() => {
    if (mode === "pair") {
      if (people.length !== 2) return null;
      return buildPairLayout(
        { id: people[0].id, label: people[0].label, score: people[0].score },
        { id: people[1].id, label: people[1].label, score: people[1].score },
      );
    }
    if (people.length < 2) return null;
    return buildSystemLayout(
      centerId ?? "",
      people
        .filter((person) => person.id !== centerId)
        .map(({ id, label, score }) => ({ id, label, score })),
    );
  }, [centerId, mode, people]);

  if (!layout) return null;

  return (
    <section aria-label={copy.title} className="mt-4 overflow-hidden rounded-3xl border border-lime-200 bg-[#0b1220]">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4 sm:px-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-lime-200">{copy.title}</h3>
        <p className="text-[11px] font-bold text-lime-300/70">{copy.hint}</p>
      </div>
      <div ref={containerRef} className="mt-2 h-[22rem] w-full sm:h-[28rem]">
        {inView && (
          <Suspense fallback={null}>
            <OrbitScene
              layout={layout}
              animate={!reducedMotion}
              maxDpr={isNarrow ? 1.25 : 2}
            />
          </Suspense>
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-4 pt-1 sm:px-5" aria-label={copy.legend}>
        {layout.bodies.map((body) => (
          <li key={body.id} className="flex items-center gap-1.5 text-xs font-black text-lime-100">
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: body.color, boxShadow: `0 0 6px ${body.color}` }} />
            {body.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
