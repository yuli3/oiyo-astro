"use client";

import { m } from "framer-motion";
import { ArrowRight, Brain, Heart, Sparkles, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { SmartLink } from "./SmartLink";

interface Test {
  color: string;
  description: string;
  icon: React.ReactNode;
  id: string;
  link: string;
  subtitle: string;
  title: string;
}

interface TestSelectionProps {
  availableTests: Test[];
  results?: any;
}

export function TestSelection({ availableTests, results }: TestSelectionProps) {
  const tU = useTranslations("universal");
  const tD = useTranslations("dashboard");
  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[450px] gap-4">
      {availableTests.map((test, index) => {
        // Simple heuristic for bento grid weights
        const isFeatured = test.id === "mbti" || test.id === "tci";
        const isWide = test.id === "enneagram" || test.id === "vitality";

        return (
          <m.div
            animate={{ opacity: 1, y: 0 }}
            className={`group relative overflow-hidden rounded-[2.5rem] border border-black/5 bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10 ${
              isFeatured
                ? "lg:col-span-2 lg:row-span-2"
                : isWide
                  ? "lg:col-span-2"
                  : ""
            }`}
            initial={{ opacity: 0, y: 20 }}
            key={test.id}
            transition={{ delay: index * 0.05 }}
          >
            {/* Background Texture/Gradient */}
            <div
              className={`absolute inset-0 opacity-[0.03] pointer-events-none ${test.color.split(" ")[1]}`}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-transparent opacity-50" />

            <div className="relative h-full flex flex-col">
              <CardContent className="flex-1 p-8 space-y-4">
                <div
                  className={`inline-flex p-3 rounded-2xl ${test.color} group-hover:scale-110 transition-transform duration-500 ring-4 ring-white`}
                >
                  {test.icon}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-green-800/40 uppercase tracking-[0.3em]">
                    {test.subtitle}
                  </p>
                  <h3
                    className={`font-serif italic font-black text-green-950 tracking-tighter leading-tight ${isFeatured ? "text-3xl" : "text-xl"}`}
                  >
                    {test.title}
                  </h3>
                </div>

                {/* Result Logic */}
                {(() => {
                  const branchKey = test.id === "bigfive" ? "ocean" : test.id;
                  const result =
                    results?.branches?.[branchKey] ||
                    results?.branches?.psychology?.[branchKey];
                  if (!result)
                    return (
                      <p
                        className={`text-green-900/60 font-medium leading-relaxed line-clamp-4 ${isFeatured ? "text-base" : "text-sm"}`}
                      >
                        {test.description}
                      </p>
                    );

                  let displayValue = "";
                  if (test.id === "mbti") displayValue = result.type;
                  if (test.id === "enneagram")
                    displayValue = `${result.type}w${result.wing}`;
                  if (test.id === "bigfive")
                    displayValue = tD("status.analyzed");
                  if (test.id === "riasec") displayValue = result.code;
                  if (
                    test.id === "tci" ||
                    test.id === "hsp" ||
                    test.id === "resilience"
                  )
                    displayValue = tD("status.verified");

                  return (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                      <Sparkles className="w-3 h-3" />
                      <span>{displayValue || tD("status.completed")}</span>
                    </div>
                  );
                })()}
              </CardContent>

              <CardFooter className="p-6 pt-0 mt-auto">
                <SmartLink
                  className="flex items-center justify-between w-full p-4 bg-green-600 text-white hover:bg-green-700 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all group/btn shadow-lg shadow-green-600/20 border-none"
                  contextHints={[test.id as any]}
                  displayText={tU("labels.takeTest")}
                  targetRoute={`/${locale}${test.link}`}
                />
              </CardFooter>
            </div>
          </m.div>
        );
      })}
    </div>
  );
}
