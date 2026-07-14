"use client";

import { m } from "framer-motion";
import { RefreshCw, Scroll, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { birthCivilToInstant } from "@/lib/ontology/kernel/time";
import { earthlyBranches, heavenlyStems } from "@/lib/ontology/saju/data";
import { analyzeSaju, calculateSaju } from "@/lib/ontology/saju/logic";
import { SajuResult as SajuResultType } from "@/lib/ontology/saju/types";

interface SajuResult extends SajuResultType {
  elements: Record<string, number>;
}

import { useUserProfile } from "@/lib/user/context/UserContext";

export function ProclaimersDesk() {
  const t = useTranslations("fortune.selfSaju");
  const tOntology = useTranslations();
  const { setBirthDate: setGlobalBirthDate } = useUserProfile();

  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12"); // hour only for simplicity
  const [result, setResult] = useState<null | SajuResult>(null);

  const calculate = () => {
    if (!birthDate) return;

    // Sync with global user context
    setGlobalBirthDate(birthDate);

    // birthDate is a "YYYY-MM-DD" wall-clock date at the birthplace; resolve it
    // against the birthplace standard time, not the visitor's browser timezone.
    const [y, m, d] = birthDate.split("-").map(Number);
    if (!y || !m || !d) return;
    const date = birthCivilToInstant({
      day: d,
      hour: parseInt(birthTime),
      minute: 0,
      month: m,
      year: y,
    });

    // Use standard ontology engine
    const saju = calculateSaju(date, false, "male");
    const analysis = analyzeSaju(saju);

    setResult({
      ...saju,
      elements: analysis.elementCounts,
    });
  };

  const renderPillar = (p: any, label: string) => {
    const stemData =
      heavenlyStems[p.heavenlyStem as keyof typeof heavenlyStems];
    const branchData =
      earthlyBranches[p.earthlyBranch as keyof typeof earthlyBranches];

    return (
      <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm border border-green-50/50 min-w-[80px]">
        <div className="text-xs text-green-600/60 font-bold uppercase mb-2">
          {label}
        </div>
        <div
          className={`text-2xl font-bold mb-1 ${getElementColor(stemData.element)}`}
        >
          {tOntology(`${stemData.key}.name` as any)}
        </div>
        <div
          className={`text-2xl font-bold ${getElementColor(branchData.element)}`}
        >
          {tOntology(`${branchData.key}.name` as any)}
        </div>
        <div className="text-[10px] text-green-600/60 mt-2">
          {tOntology(`${stemData.key}.meaning` as any)}
        </div>
      </div>
    );
  };

  const getElementColor = (el: string) => {
    switch (el) {
      case "earth":
        return "text-yellow-600";
      case "fire":
        return "text-red-500";
      case "metal":
        return "text-green-600/60";
      case "water":
        return "text-teal-600";
      case "wood":
        return "text-green-600";
      default:
        return "text-green-950";
    }
  };

  const getElementBg = (el: string) => {
    switch (el) {
      case "earth":
        return "bg-yellow-500";
      case "fire":
        return "bg-red-500";
      case "metal":
        return "bg-green-600/60";
      case "water":
        return "bg-teal-500";
      case "wood":
        return "bg-green-500";
      default:
        return "bg-green-800/50";
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-green-900/10">
        <div className="text-center mb-12 space-y-4">
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-1 uppercase tracking-widest font-black">
            The Proclaimer&apos;s Desk
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black italic text-[#064e3b] font-serif">
            {t("title")}
          </h2>
          <p className="text-green-800 text-lg">{t("description")}</p>
        </div>

        <div className="max-w-xl mx-auto space-y-8">
          {!result ? (
            <m.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
            >
              <InputGroup label={t("inputs.birthDate")}>
                <Input
                  className="h-14 text-lg bg-white/60 border-green-100 rounded-2xl"
                  onChange={(e) => setBirthDate(e.target.value)}
                  type="date"
                  value={birthDate}
                />
              </InputGroup>

              <InputGroup label={t("inputs.birthTime")}>
                <Select onValueChange={setBirthTime} value={birthTime}>
                  <SelectTrigger className="h-14 text-lg bg-white/60 border-green-100 rounded-2xl">
                    <SelectValue placeholder="Select hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}:00 ~ {i}:59
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InputGroup>

              <Button
                className="w-full h-16 text-xl font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-lg shadow-amber-200 transition-all hover:scale-[1.02]"
                disabled={!birthDate}
                onClick={calculate}
              >
                {t("inputs.calculate")} <Scroll className="w-5 h-5 ml-2" />
              </Button>
            </m.div>
          ) : (
            <m.div
              animate={{ opacity: 1 }}
              className="space-y-8"
              initial={{ opacity: 0 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {renderPillar(result.hour, t("result.time"))}
                {renderPillar(result.day, t("result.day"))}
                {renderPillar(result.month, t("result.month"))}
                {renderPillar(result.year, t("result.year"))}
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 border border-green-50/50">
                <h3 className="font-bold text-green-900 mb-6 flex items-center gap-2 text-lg">
                  <div className="w-2 h-6 bg-amber-500 rounded-full" />
                  {t("result.fiveElements")}
                </h3>

                <div className="space-y-4">
                  {(Object.entries(result.elements) as [string, number][]).map(
                    ([el, count]) => (
                      <div className="flex items-center gap-4" key={el}>
                        <span
                          className={`w-16 text-sm font-bold capitalize ${getElementColor(el)}`}
                        >
                          {t(`result.${el}`)}
                        </span>
                        <div className="flex-1 h-4 bg-green-50 rounded-full overflow-hidden">
                          <m.div
                            animate={{ width: `${(count / 8) * 100}%` }}
                            className={`h-full ${getElementBg(el)}`}
                            initial={{ width: 0 }}
                          />
                        </div>
                        <span className="w-6 text-sm font-bold text-green-600/60 text-right">
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <Button
                  className="rounded-full hover:bg-green-50 text-green-700"
                  onClick={() => setResult(null)}
                  variant="ghost"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("inputs.calculate")} Again
                </Button>
              </div>
            </m.div>
          )}
        </div>
      </div>
    </div>
  );
}
