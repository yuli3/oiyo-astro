"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import React from "react";

import { PsychologicalRadar } from "@/components/shared/PsychologicalRadar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { THEME_COLORS } from "@/lib/system/theme";
import { TCI_DIMENSION_MAP } from "@/lib/tci/data";
import type { TCIDimension } from "@/lib/tci/types";

export function TCISection({
  locale,
  result,
}: {
  locale: string;
  result: any;
}) {
  const t = useTranslations("tci");

  const chartData = (Object.keys(result.percentiles) as TCIDimension[]).map(
    (key) => ({
      A: result.percentiles[key],
      fullMark: 100,
      subject: t(TCI_DIMENSION_MAP[key].labelKey),
    }),
  );

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-20 px-6">
      <div className="text-center space-y-6">
        <Badge className="bg-teal-100 text-teal-800 border-teal-200 text-lg px-6 py-2 uppercase tracking-[0.3em] font-black">
          {t("paradoxLabel")}: {result.paradoxKey || t("balanced")}
        </Badge>
        <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter text-[#064e3b] uppercase">
          The Biological Core
        </h2>
      </div>

      <Card className="p-10 bg-white/60 backdrop-blur-3xl border-teal-100 rounded-[3rem] shadow-2xl shadow-green-900/5">
        <div className="w-full h-[400px] flex items-center justify-center">
          <PsychologicalRadar color={THEME_COLORS.teal} data={chartData} />
        </div>
      </Card>
    </div>
  );
}
