"use client";

import { motion as m } from "framer-motion";
import { BookOpen, Flower, Mountain, Sparkles } from "lucide-react";
import { useLocale, useMessages, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BRANCH_IDS, BRANCHES } from "@/manifest/data/saju/branches";

type Tab = "branches" | "stems";

const SEASON_LABELS: Record<string, Record<string, string>> = {
  ko: { WINTER: "겨울", SPRING: "봄", SUMMER: "여름", AUTUMN: "가을" },
  en: { WINTER: "Winter", SPRING: "Spring", SUMMER: "Summer", AUTUMN: "Autumn" },
  ja: { WINTER: "冬", SPRING: "春", SUMMER: "夏", AUTUMN: "秋" },
  zh: { WINTER: "冬", SPRING: "春", SUMMER: "夏", AUTUMN: "秋" },
  fr: { WINTER: "Hiver", SPRING: "Printemps", SUMMER: "Été", AUTUMN: "Automne" },
  es: { WINTER: "Invierno", SPRING: "Primavera", SUMMER: "Verano", AUTUMN: "Otoño" },
};

const STEM_KEYS = [
  "GAP",
  "EUL",
  "BYEONG",
  "JEONG",
  "MU",
  "GI",
  "GYEONG",
  "SIN",
  "IM",
  "GYE",
];
const BRANCH_KEYS = [
  "JA",
  "CHUK",
  "IN",
  "MYO",
  "JIN",
  "SA",
  "O",
  "MI",
  "SIN",
  "YU",
  "SUL",
  "HAE",
];

export function EncyclopediaClient() {
  const t = useTranslations("universal");
  const messages = useMessages() as any;
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>("stems");

  // saju-daymaster.json is keyed directly by stem id (GAP, EUL, ...) at the top level.
  const stemsData = messages["saju-daymaster"] || {};

  // Earthly branches come from the manifest SSOT (branches.ts), not the i18n
  // saju.json blob — that file's `branches` key uses pinyin ids (zi, chou, ...)
  // and mistranslated placeholder names, not the JA/CHUK/... ids this page needs.
  const elementDescriptions = messages["elements"] || {};
  const branchesData = useMemo(() => {
    const out: Record<string, { name: string; animal: string; season: string; time: string; meaning: string }> = {};
    for (const id of BRANCH_IDS) {
      const b = BRANCHES[id];
      const seasonLabels = SEASON_LABELS[locale] ?? SEASON_LABELS.en;
      out[id] = {
        name: b.short[locale as keyof typeof b.short] ?? b.short.en,
        animal: b.animal[locale as keyof typeof b.animal] ?? b.animal.en,
        season: seasonLabels[b.season] ?? b.season,
        time: b.timeRange,
        meaning: elementDescriptions[b.element]?.description ?? "",
      };
    }
    return out;
  }, [locale, elementDescriptions]);

  return (
    <div className="min-h-screen bg-[#f0f9f1] p-6 lg:p-12 space-y-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <m.div
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/50 text-green-800 text-xs font-bold uppercase tracking-widest border border-green-200/50"
          initial={{ opacity: 0, y: 20 }}
        >
          <BookOpen className="w-4 h-4" />
          <span>Saju Encyclopedia</span>
        </m.div>
        <m.h2
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-[#064e3b] font-serif tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
        >
          Codex of Destiny
        </m.h2>
        <m.p
          animate={{ opacity: 1, y: 0 }}
          className="text-green-800/80 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
        >
          Explore the fundamental archetypes of the 10 Heavenly Stems and 12
          Earthly Branches that weave the fabric of time and fate.
        </m.p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        <TabButton
          active={activeTab === "stems"}
          icon={Sparkles}
          label="Heavenly Stems"
          onClick={() => setActiveTab("stems")}
        />
        <TabButton
          active={activeTab === "branches"}
          icon={Mountain}
          label="Earthly Branches"
          onClick={() => setActiveTab("branches")}
        />
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {activeTab === "stems" &&
          STEM_KEYS.map((key, index) => {
            const data = stemsData[key];
            if (!data) return null;

            return (
              <ItemCard
                content={
                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-green-900/80">
                      {data.lifePurpose}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.strengths?.slice(0, 3).map((s: string) => (
                        <Badge
                          className="text-[10px] border-green-200 bg-surface-subtle text-green-700"
                          key={s}
                          variant="outline"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                }
                detailContent={<StemDetail data={data} />}
                index={index}
                key={key}
                subtitle={data.nature}
                title={data.name}
              />
            );
          })}

        {activeTab === "branches" &&
          BRANCH_KEYS.map((key, index) => {
            const data = branchesData[key];
            if (!data) return null;

            return (
              <ItemCard
                content={
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between text-xs text-green-700/70 border-b border-green-100 pb-2">
                      <span>Time</span>
                      <span className="font-mono font-medium text-green-900">
                        {data.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">
                        Essence
                      </span>
                      <span className="font-serif italic text-lg text-[#064e3b]">
                        {data.meaning}
                      </span>
                    </div>
                  </div>
                }
                detailContent={
                  <div className="p-6 space-y-6">
                    <h3 className="text-2xl font-black text-green-900">
                      {data.name} ({data.animal})
                    </h3>
                    <div className="grid gap-4 text-green-800">
                      <div className="p-4 bg-surface-subtle rounded-xl">
                        <p className="font-bold text-green-900 mb-1">
                          Time of Day
                        </p>
                        <p>{data.time}</p>
                      </div>
                      <div className="p-4 bg-surface-subtle rounded-xl">
                        <p className="font-bold text-green-900 mb-1">Season</p>
                        <p>{data.season}</p>
                      </div>
                      <div className="p-4 bg-surface-subtle rounded-xl">
                        <p className="font-bold text-green-900 mb-1">
                          Archetype
                        </p>
                        <p className="text-xl font-serif italic">
                          {data.meaning}
                        </p>
                      </div>
                    </div>
                  </div>
                }
                index={index}
                key={key}
                subtitle={`${data.animal} • ${data.season}`}
                title={data.name}
              />
            );
          })}
      </div>
    </div>
  );
}

function ItemCard({ content, detailContent, index, subtitle, title }: any) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <m.div
          animate={{ opacity: 1, y: 0 }}
          className="group relative bg-white/60 backdrop-blur-md border border-white/60 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all cursor-pointer overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ y: -5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-black text-[#064e3b] font-serif">
                {title}
              </h3>
              <Flower className="w-5 h-5 text-green-200 group-hover:text-green-500 transition-colors" />
            </div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-4">
              {subtitle}
            </p>
            {content}
          </div>
        </m.div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] p-0 border-none bg-white/95 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <div className="h-full overflow-y-auto">{detailContent}</div>
      </DialogContent>
    </Dialog>
  );
}

function StemDetail({ data }: { data: any }) {
  return (
    <div className="max-w-3xl mx-auto p-8 lg:p-12 space-y-10">
      <div className="text-center space-y-4">
        <Badge className="bg-green-100 text-green-700 border-green-200 pointer-events-none">
          Heavenly Stem
        </Badge>
        <h2 className="text-5xl font-black text-[#064e3b] font-serif">
          {data.name}
        </h2>
        <p className="text-xl text-green-800 italic font-medium">
          {data.nature}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
          <h3 className="text-lg font-bold text-[#064e3b] mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Traits
          </h3>
          <ul className="space-y-3">
            {data.traits?.map((trait: string, i: number) => (
              <li
                className="text-sm text-green-800 leading-relaxed pl-4 border-l-2 border-green-200"
                key={i}
              >
                {trait}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-green-900 uppercase tracking-wider mb-3">
              Strengths
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.strengths?.map((s: string) => (
                <Badge
                  className="bg-[#064e3b] text-white hover:bg-primary-strong"
                  key={s}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-green-900 uppercase tracking-wider mb-3">
              Weaknesses
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.weaknesses?.map((w: string) => (
                <Badge
                  className="border-red-200 text-red-700 bg-red-50"
                  key={w}
                  variant="outline"
                >
                  {w}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#064e3b] to-green-900 p-8 rounded-3xl text-white text-center shadow-xl shadow-green-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <h3 className="text-sm font-bold text-green-300 uppercase tracking-widest mb-4 relative z-10">
          Life Purpose
        </h3>
        <p className="text-xl md:text-2xl font-serif leading-relaxed relative z-10">
          &quot;{data.lifePurpose}&quot;
        </p>
      </div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }: any) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 border shadow-sm",
        active
          ? "bg-[#064e3b] text-white border-[#064e3b] shadow-green-900/20 shadow-lg scale-105"
          : "bg-card text-green-900 border-white hover:bg-surface-subtle hover:border-green-200",
      )}
      onClick={onClick}
    >
      <Icon
        className={cn("w-4 h-4", active ? "text-green-300" : "text-green-600")}
      />
      {label}
    </button>
  );
}
