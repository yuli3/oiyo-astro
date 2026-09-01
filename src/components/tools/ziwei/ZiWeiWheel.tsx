"use client";

/**
 * Wrapper for the Zi Wei Dou Shu (자미두수) 12-palace wheel visualization.
 *
 * - Lazy: three/@react-three bundles load only when the panel scrolls into view.
 * - Accessible: prefers-reduced-motion renders a single static frame.
 * - Mobile: device pixel ratio is capped.
 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";

import type { Palace, PalaceKey } from "@/lib/ontology/ziwei/types";
import { useReducedMotion } from "@/hooks/useMotion";

const WheelScene = lazy(() => import("./ZiWeiWheelScene"));

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const PALACE_NAME: Record<PalaceKey, Record<Lang, string>> = {
  life: { ko: "명궁", en: "Life", ja: "命宮", zh: "命宫", fr: "Vie", es: "Vida" },
  siblings: { ko: "형제궁", en: "Siblings", ja: "兄弟宮", zh: "兄弟宫", fr: "Fratrie", es: "Hermanos" },
  spouse: { ko: "부부궁", en: "Spouse", ja: "夫妻宮", zh: "夫妻宫", fr: "Conjoint", es: "Cónyuge" },
  children: { ko: "자녀궁", en: "Children", ja: "子女宮", zh: "子女宫", fr: "Enfants", es: "Hijos" },
  wealth: { ko: "재백궁", en: "Wealth", ja: "財帛宮", zh: "财帛宫", fr: "Richesse", es: "Riqueza" },
  health: { ko: "질액궁", en: "Health", ja: "疾厄宮", zh: "疾厄宫", fr: "Santé", es: "Salud" },
  travel: { ko: "천이궁", en: "Travel", ja: "遷移宮", zh: "迁移宫", fr: "Voyages", es: "Viajes" },
  friends: { ko: "교우궁", en: "Friends", ja: "交友宮", zh: "交友宫", fr: "Amis", es: "Amigos" },
  career: { ko: "관록궁", en: "Career", ja: "官祿宮", zh: "官禄宫", fr: "Carrière", es: "Carrera" },
  property: { ko: "전택궁", en: "Property", ja: "田宅宮", zh: "田宅宫", fr: "Patrimoine", es: "Propiedad" },
  mental: { ko: "복덕궁", en: "Wellbeing", ja: "福德宮", zh: "福德宫", fr: "Bien-être", es: "Bienestar" },
  parents: { ko: "부모궁", en: "Parents", ja: "父母宮", zh: "父母宫", fr: "Parents", es: "Padres" },
};

const COPY: Record<Lang, { hint: string }> = {
  ko: { hint: "드래그해 12궁을 돌려보세요. 밝은 별이 명궁입니다." },
  en: { hint: "Drag to rotate the 12 palaces. The brightest node is the life palace." },
  ja: { hint: "ドラッグして十二宮を回してみましょう。一番明るい星が命宮です。" },
  zh: { hint: "拖动查看十二宫。最亮的星是命宫。" },
  fr: { hint: "Faites glisser pour explorer les douze palais. Le plus lumineux est le palais de vie." },
  es: { hint: "Arrastra para explorar los doce palacios. El más brillante es el palacio de vida." },
};

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

export interface ZiWeiWheelProps {
  locale: string;
  palaces: Record<PalaceKey, Palace>;
  lifeKey: PalaceKey;
}

export default function ZiWeiWheel({ locale, palaces, lifeKey }: ZiWeiWheelProps) {
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
    <div className="mt-3 overflow-hidden rounded-2xl border border-violet-900 bg-[#1e1033]">
      <div ref={containerRef} className="h-64 w-full sm:h-72">
        {inView && (
          <Suspense fallback={null}>
            <WheelScene
              palaces={palaces}
              lifeKey={lifeKey}
              animate={!reducedMotion}
              maxDpr={isNarrow ? 1.25 : 2}
            />
          </Suspense>
        )}
      </div>
      <p className="px-3 py-2 text-[11px] font-medium text-violet-200">{copy.hint}</p>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 px-3 pb-3 text-[10px] font-medium text-violet-300" aria-hidden="true">
        {Object.values(palaces)
          .filter((palace) => palace.stars.length > 0)
          .map((palace) => (
            <li key={palace.key}>
              {PALACE_NAME[palace.key][lang]} · {palace.stars.length}
            </li>
          ))}
      </ul>
    </div>
  );
}
