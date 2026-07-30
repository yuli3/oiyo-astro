"use client";

import { m } from "framer-motion";
import {
  Brain,
  Calendar,
  Heart,
  Infinity,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { PartnerPartialProfile } from "../types";

interface ResonanceFormProps {
  isLoading?: boolean;
  onCalculate: (partner: PartnerPartialProfile) => void;
}

export function ResonanceForm({ isLoading, onCalculate }: ResonanceFormProps) {
  const t = useTranslations("resonance");
  const [partner, setPartner] = useState<PartnerPartialProfile>({
    birthDate: "",
    bloodType: "",
    gender: undefined,
    mbti: "",
    name: "",
  });

  // Calculate local confidence for UI feedback
  const confidence = useMemo(() => {
    let score = 10; // Base spiritual connection
    if (partner.name) score += 20;
    if (partner.birthDate) score += 40;
    if (partner.mbti) score += 20;
    if (partner.bloodType) score += 10;
    return Math.min(score, 100);
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner.name) return;
    onCalculate(partner);
  };

  return (
    <form
      className="space-y-8 p-8 md:p-12 rounded-[2.5rem] bg-green-950/50 border border-white/10 backdrop-blur-xl font-sans"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-serif italic">
              <Sparkles className="w-5 h-5 text-amber-400" />
              {t("offeringTitle")}
            </h3>
            <p className="text-green-600/60 text-sm">
              {t("offeringDescription")}
            </p>
          </div>

          <div className="text-right space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">
              {t("confidenceMeter")}
            </span>
            <div className="w-32 h-2 bg-green-900 rounded-full overflow-hidden">
              <m.div
                animate={{ width: `${confidence}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-green-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              />
            </div>
            <div className="text-[10px] font-bold text-amber-500">
              {confidence}% {t("revealed")}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-green-600/60 flex items-center gap-2 ml-1 text-xs uppercase tracking-widest font-black">
            <User className="w-4 h-4" /> {t("nameLabel")}
          </Label>
          <Input
            className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-white"
            onChange={(e) => setPartner({ ...partner, name: e.target.value })}
            placeholder={t("namePlaceholder")}
            required
            value={partner.name}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-green-600/60 flex items-center gap-2 ml-1 text-xs uppercase tracking-widest font-black">
            <Calendar className="w-4 h-4" /> {t("birthLabel")}
          </Label>
          <Input
            className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-amber-500/50 transition-all text-white"
            onChange={(e) =>
              setPartner({ ...partner, birthDate: e.target.value })
            }
            type="date"
            value={partner.birthDate}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-green-600/60 flex items-center gap-2 ml-1 text-xs uppercase tracking-widest font-black">
            <Brain className="w-4 h-4" /> {t("mbtiLabel")}
          </Label>
          <Select
            onValueChange={(v) => setPartner({ ...partner, mbti: v })}
            value={partner.mbti}
          >
            <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-amber-500/50 text-white">
              <SelectValue placeholder={t("mbtiPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="bg-green-950 border-white/10 text-green-100">
              {[
                "INTJ",
                "INTP",
                "ENTJ",
                "ENTP",
                "INFJ",
                "INFP",
                "ENFJ",
                "ENFP",
                "ISTJ",
                "ISFJ",
                "ESTJ",
                "ESFJ",
                "ISTP",
                "ISFP",
                "ESTP",
                "ESFP",
              ].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-green-600/60 flex items-center gap-2 ml-1 text-xs uppercase tracking-widest font-black">
            <Heart className="w-4 h-4" /> {t("bloodLabel")}
          </Label>
          <Select
            onValueChange={(v) => setPartner({ ...partner, bloodType: v })}
            value={partner.bloodType}
          >
            <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl focus:ring-amber-500/50 text-white">
              <SelectValue placeholder={t("bloodPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="bg-green-950 border-white/10 text-green-100">
              {["A", "B", "O", "AB"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4">
        <Button
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-[#064e3b] font-black text-lg shadow-xl shadow-amber-500/20 gap-2 group transition-all"
          disabled={!partner.name || isLoading}
          type="submit"
        >
          {isLoading ? (
            <Zap className="w-6 h-6 animate-spin" />
          ) : (
            <Infinity className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
          {isLoading ? t("calculating") : t("calculateButton")}
        </Button>
      </div>
    </form>
  );
}
