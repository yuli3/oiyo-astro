"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";

import { FiveElement } from "@/lib/ontology/saju/types";

interface ElementalBarChartProps {
  distribution: Record<FiveElement, number>;
}

const ELEMENT_COLORS: Record<FiveElement, string> = {
  [FiveElement.EARTH]: "bg-amber-500",
  [FiveElement.FIRE]: "bg-rose-500",
  [FiveElement.METAL]: "bg-slate-400",
  [FiveElement.WATER]: "bg-sky-500",
  [FiveElement.WOOD]: "bg-green-500",
};

const ELEMENT_NAMES_KO: Record<FiveElement, string> = {
  [FiveElement.EARTH]: "토(土)",
  [FiveElement.FIRE]: "화(火)",
  [FiveElement.METAL]: "금(金)",
  [FiveElement.WATER]: "수(水)",
  [FiveElement.WOOD]: "목(木)",
};

const ELEMENT_NAMES_EN: Record<FiveElement, string> = {
  [FiveElement.EARTH]: "Earth",
  [FiveElement.FIRE]: "Fire",
  [FiveElement.METAL]: "Metal",
  [FiveElement.WATER]: "Water",
  [FiveElement.WOOD]: "Wood",
};

export function ElementalBarChart({ distribution }: ElementalBarChartProps) {
  const tU = useTranslations("universal");
  // Fallback if useTranslations context is missing or partial
  const getName = (el: FiveElement) => ELEMENT_NAMES_KO[el] || el;

  const elements = [
    FiveElement.WOOD,
    FiveElement.FIRE,
    FiveElement.EARTH,
    FiveElement.METAL,
    FiveElement.WATER,
  ];

  return (
    <div className="w-full space-y-3 bg-white/50 p-6 rounded-3xl backdrop-blur-md">
      <h3 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-4">
        {tU("sections.blueprint")}
      </h3>
      {elements.map((el) => (
        <div className="flex items-center gap-3" key={el}>
          <div className="w-12 text-xs font-bold shrink-0 text-slate-600">
            {getName(el)}
          </div>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
            <m.div
              animate={{ width: `${distribution[el]}%` }}
              className={`absolute inset-y-0 left-0 rounded-full ${ELEMENT_COLORS[el]}`}
              initial={{ width: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="w-8 text-xs font-mono text-right opacity-60">
            {distribution[el]}%
          </div>
        </div>
      ))}
    </div>
  );
}
