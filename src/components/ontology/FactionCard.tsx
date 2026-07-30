"use client";

import { Landmark, Shield, Users, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import type { FactionAnalysis } from "@/lib/ontology/chosun-faction/logic";
import { cn } from "@/lib/system/utils";

interface FactionCardProps {
  analysis: FactionAnalysis;
  className?: string;
}

export function FactionCard({ analysis, className }: FactionCardProps) {
  const t = useTranslations("chosun");

  return (
    <div
      className={cn(
        "bg-white rounded-[40px] border border-slate-100 shadow-lg p-8 group hover:shadow-2xl transition-all duration-500 overflow-hidden relative",
        className,
      )}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
        <Landmark className="w-48 h-48" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              {t("subtitle")}
            </h3>
            <p className="text-xl font-black text-slate-900">{t("title")}</p>
          </div>
        </div>

        <div className="flex-1 space-y-8">
          <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              {t("labels.faction")}
            </h4>
            <div className="text-4xl font-black text-slate-900 mb-4">
              {t(`factions.${analysis.faction}.name`)}
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              {t(`factions.${analysis.faction}.description`)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t("labels.innate")}
              </span>
              <div className="text-sm font-bold text-slate-900">
                {t(`factions.${analysis.innateFaction}.name`)}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {t("labels.behavioral")}
              </span>
              <div className="text-sm font-bold text-slate-900">
                {t(`factions.${analysis.behavioralFaction}.name`)}
              </div>
            </div>
          </div>

          {analysis.divergence > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {t("labels.comparison")}
                </span>
                <span className="text-xs font-black text-rose-500">
                  {analysis.divergence}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all duration-1000"
                  style={{ width: `${analysis.divergence}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {analysis.traits.map((trait) => (
            <span
              className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-600 rounded-full uppercase tracking-widest"
              key={trait}
            >
              #{t(`traits.${trait}`)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
