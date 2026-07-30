"use client";

import { m } from "framer-motion";
import { Activity, Hash, Heart, Sparkles, User } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ResultCard } from "@/components/ui/ResultCard";
import type { NumerologyResult } from "@/lib/ontology/numerology/types";
import { cn } from "@/lib/system/utils";

interface NumerologySectionProps {
  className?: string;
  result: NumerologyResult;
}

export function NumerologySection({
  className,
  result,
}: NumerologySectionProps) {
  const t = useTranslations("numerology");

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto space-y-12 py-20 px-6",
        className,
      )}
    >
      <m.div
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <Badge className="bg-green-100 text-green-600 border-green-200 px-6 py-2 uppercase tracking-[0.3em] font-black shadow-sm">
          {t("intro.badge")}
        </Badge>
        <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter text-[#064e3b] uppercase">
          The Divine Code
        </h2>
        <p className="text-xl text-green-800 font-serif italic max-w-2xl mx-auto">
          {t("intro.quote")}
        </p>
      </m.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResultCard
          description={result.meanings.lifePathMeaning?.description?.en}
          icon={<Activity className="w-6 h-6" />}
          subtitle={result.meanings.lifePathMeaning?.name?.en || "..."}
          title={t("results.lifePath")}
          value={result.numbers.lifePathNumber.toString()}
          variant="green"
        />
        <ResultCard
          delay={0.1}
          description={result.meanings.expressionMeaning?.description?.en}
          icon={<Sparkles className="w-6 h-6" />}
          subtitle={result.meanings.expressionMeaning?.name?.en || "..."}
          title={t("results.expression")}
          value={result.numbers.expressionNumber.toString()}
          variant="amber"
        />
        <ResultCard
          delay={0.2}
          description={result.meanings.soulUrgeMeaning?.description?.en}
          icon={<Heart className="w-6 h-6" />}
          subtitle={result.meanings.soulUrgeMeaning?.name?.en || "..."}
          title={t("results.soulUrge")}
          value={result.numbers.soulUrgeNumber.toString()}
          variant="teal"
        />
        <ResultCard
          delay={0.3}
          description={result.meanings.personalityMeaning?.description?.en}
          icon={<User className="w-6 h-6" />}
          subtitle={result.meanings.personalityMeaning?.name?.en || "..."}
          title={t("results.personality")}
          value={result.numbers.personalityNumber.toString()}
          variant="orange"
        />
      </div>

      {result.overallAnalysis.vibrationalResonance && (
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-white/40 border-green-500/10 p-10 rounded-[3rem] backdrop-blur-3xl text-center space-y-4 shadow-xl shadow-green-900/5">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] flex items-center justify-center gap-2 text-green-800/40">
              <Hash className="w-4 h-4" />
              {t("results.vibrationalResonance")}
            </h3>
            <p className="text-2xl md:text-3xl font-serif italic text-[#064e3b] leading-tight">
              &quot;{result.overallAnalysis.vibrationalResonance.description.en}
              &quot;
            </p>
          </Card>
        </m.div>
      )}
    </div>
  );
}

// Local ResultCard component simplified to use the SSOT one in the parent.
// Or we just update the import at top and remove this function.
// For now, I will empty this file's bottom part and update the import in next step.
