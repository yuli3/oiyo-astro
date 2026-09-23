"use client";

import { motion as m } from "framer-motion";
import { BookOpen, Flower, Mountain, Sparkles } from "lucide-react";
import { useLocale, useMessages } from "next-intl";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BRANCH_IDS, BRANCHES } from "@/manifest/data/saju/branches";

type Tab = "branches" | "stems";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

/**
 * 화면 문구. 2026-09-23 까지 제목·탭·항목 이름이 영어로 박혀 있어서, 한국어
 * 페이지에도 "Codex of Destiny", "Heavenly Stems" 가 떴다. 본문(천간 설명·
 * 오행 뜻)은 여섯 언어가 있는데 껍데기만 영어였다.
 *
 * 제목도 새로 쓴다 — "운명의 서(Codex of Destiny)" 는 이 페이지가 하는 일을
 * 부풀린다. 실제로 담긴 것은 사주가 시간을 적는 스물두 글자의 뜻풀이다.
 *
 * `Archetype` 이라 적혀 있던 자리는 오행 설명을 보여 주고 있었다. 이름을
 * 내용에 맞게 "기운(오행)" 으로 고친다.
 */
const COPY: Record<Lang, {
  eyebrow: string; title: string; lead: string;
  tabStems: string; tabBranches: string;
  time: string; essence: string; timeOfDay: string; season: string; element: string;
  stemBadge: string; traits: string; strengths: string; weaknesses: string; lifePurpose: string;
}> = {
  ko: {
    eyebrow: "사주 백과사전", title: "열 천간과 열두 지지",
    lead: "사주는 시간을 스물두 글자로 적어요. 글자마다 어떤 성질을 말하는지 하나씩 펼쳐 놨어요.",
    tabStems: "천간 (하늘의 열 글자)", tabBranches: "지지 (땅의 열두 글자)",
    time: "시간", essence: "기운", timeOfDay: "하루 중 시간", season: "계절", element: "기운(오행)",
    stemBadge: "천간", traits: "성질", strengths: "강점", weaknesses: "조심할 점", lifePurpose: "삶의 방향",
  },
  en: {
    eyebrow: "Saju encyclopedia", title: "The ten stems and twelve branches",
    lead: "Saju writes time in twenty-two characters. Here is what each one is said to carry.",
    tabStems: "Heavenly stems (the ten)", tabBranches: "Earthly branches (the twelve)",
    time: "Hours", essence: "Element", timeOfDay: "Hours of the day", season: "Season", element: "Element",
    stemBadge: "Heavenly stem", traits: "Nature", strengths: "Strengths", weaknesses: "Watch for", lifePurpose: "Direction",
  },
  ja: {
    eyebrow: "四柱の百科", title: "十干と十二支",
    lead: "四柱は時間を二十二の文字で書きます。それぞれが何を表すのかを並べました。",
    tabStems: "十干（天の十文字）", tabBranches: "十二支（地の十二文字）",
    time: "時刻", essence: "気", timeOfDay: "一日の時刻", season: "季節", element: "五行",
    stemBadge: "十干", traits: "性質", strengths: "強み", weaknesses: "注意点", lifePurpose: "向かう先",
  },
  zh: {
    eyebrow: "四柱百科", title: "十天干与十二地支",
    lead: "四柱用二十二个字来记录时间。这里逐一展开每个字所代表的性质。",
    tabStems: "天干（天之十字）", tabBranches: "地支（地之十二字）",
    time: "时辰", essence: "气", timeOfDay: "一日时辰", season: "季节", element: "五行",
    stemBadge: "天干", traits: "性质", strengths: "长处", weaknesses: "留意", lifePurpose: "方向",
  },
  fr: {
    eyebrow: "Encyclopédie du Saju", title: "Les dix tiges et les douze branches",
    lead: "Le Saju écrit le temps en vingt-deux caractères. Voici ce que chacun porte, un par un.",
    tabStems: "Tiges célestes (les dix)", tabBranches: "Branches terrestres (les douze)",
    time: "Heures", essence: "Élément", timeOfDay: "Heures du jour", season: "Saison", element: "Élément",
    stemBadge: "Tige céleste", traits: "Nature", strengths: "Forces", weaknesses: "À surveiller", lifePurpose: "Direction",
  },
  es: {
    eyebrow: "Enciclopedia del Saju", title: "Los diez tallos y las doce ramas",
    lead: "El Saju escribe el tiempo con veintidós caracteres. Aquí se despliega, uno a uno, lo que cada uno expresa.",
    tabStems: "Tallos celestes (los diez)", tabBranches: "Ramas terrestres (las doce)",
    time: "Horas", essence: "Elemento", timeOfDay: "Horas del día", season: "Estación", element: "Elemento",
    stemBadge: "Tallo celeste", traits: "Naturaleza", strengths: "Fortalezas", weaknesses: "Atención", lifePurpose: "Dirección",
  },
};



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
  const messages = useMessages() as any;
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>("stems");
  const t = COPY[(["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang];

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
          <span>{t.eyebrow}</span>
        </m.div>
        <m.h2
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black text-[#064e3b] font-serif tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
        >
          {t.title}
        </m.h2>
        <m.p
          animate={{ opacity: 1, y: 0 }}
          className="text-green-800/80 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
        >
          {t.lead}
        </m.p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        <TabButton
          active={activeTab === "stems"}
          icon={Sparkles}
          label={t.tabStems}
          onClick={() => setActiveTab("stems")}
        />
        <TabButton
          active={activeTab === "branches"}
          icon={Mountain}
          label={t.tabBranches}
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
                detailContent={<StemDetail copy={t} data={data} />}
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
                      <span>{t.time}</span>
                      <span className="font-mono font-medium text-green-900">
                        {data.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">
                        {t.essence}
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
                          {t.timeOfDay}
                        </p>
                        <p>{data.time}</p>
                      </div>
                      <div className="p-4 bg-surface-subtle rounded-xl">
                        <p className="font-bold text-green-900 mb-1">{t.season}</p>
                        <p>{data.season}</p>
                      </div>
                      <div className="p-4 bg-surface-subtle rounded-xl">
                        <p className="font-bold text-green-900 mb-1">
                          {t.element}
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

function StemDetail({ copy, data }: { copy: (typeof COPY)[Lang]; data: any }) {
  return (
    <div className="max-w-3xl mx-auto p-8 lg:p-12 space-y-10">
      <div className="text-center space-y-4">
        <Badge className="bg-green-100 text-green-700 border-green-200 pointer-events-none">
          {copy.stemBadge}
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
            <Sparkles className="w-4 h-4" /> {copy.traits}
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
              {copy.strengths}
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
              {copy.weaknesses}
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
          {copy.lifePurpose}
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
