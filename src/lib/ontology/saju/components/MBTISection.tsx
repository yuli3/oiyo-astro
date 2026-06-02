"use client";

import { m } from "framer-motion";
import { useTranslations } from "next-intl";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/system/utils";

export function MBTISection({
  locale,
  result,
}: {
  locale: string;
  result: any;
}) {
  const profile = result.profile;
  const t = useTranslations("mbti");

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-20 px-6">
      <div className="text-center space-y-6">
        <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-6 py-2 uppercase tracking-[0.3em] font-black">
          {profile.nickname[locale] || profile.nickname.en}
        </Badge>
        <h2 className="text-6xl md:text-9xl font-black font-serif text-green-900 tracking-tighter italic">
          {result.type}
        </h2>
        <p className="text-2xl text-green-800 font-medium">
          {profile.name[locale] || profile.name.en}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Object.entries(result.dimensions).map(([key, val]: [string, any]) => (
          <Card
            className="p-8 rounded-[2rem] bg-white/60 border-green-100 text-center shadow-xl shadow-green-900/5"
            key={key}
          >
            <div className="text-xs font-black text-green-600 mb-2 uppercase tracking-widest">
              {key}
            </div>
            <div className="text-4xl font-black text-green-900">{val}%</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
