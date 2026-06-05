"use client";

import { m } from "framer-motion";
import { Calendar, Clock, Fingerprint, User } from "lucide-react";
import React, { useState } from "react";

import { useNamespacedFallback } from "@/lib/i18n/use-namespaced-fallback";
import { useUserProfile } from "@/lib/user/context/UserContext";
import { cn } from "@/lib/utils";

interface SajuInputFormProps {
  onSaved?: () => void;
  variant?: "default" | "drawer";
}

export function SajuInputForm({
  onSaved,
  variant = "default",
}: SajuInputFormProps) {
  const t = useNamespacedFallback("ontology.dashboard", "dashboard");
  const { profile, setProfileData } = useUserProfile();
  const isDrawer = variant === "drawer";

  const [formData, setFormData] = useState({
    birthDate: profile?.birthDate || "",
    birthTime: profile?.birthTime || "00:00",
    gender: (profile?.gender as "female" | "male") || "female",
    name: profile?.name || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate slight delay for effect
    await new Promise((resolve) => setTimeout(resolve, 800));

    setProfileData({
      birthDate: formData.birthDate, // YYYY-MM-DD
      birthTime: formData.birthTime || "00:00", // HH:MM
      gender: formData.gender,
      name: formData.name,
    });

    setIsSubmitting(false);
    onSaved?.();
  };

  const containerClasses = isDrawer
    ? "w-full max-w-xl mx-auto p-0 relative"
    : "w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden";

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      className={containerClasses}
      initial={{ opacity: 0, y: 20 }}
    >
      {/* Background Decorative - Hide in drawer for minimalism */}
      {!isDrawer && (
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Fingerprint className="w-32 h-32" />
        </div>
      )}

      <div
        className={cn("relative z-10 text-center mb-8", isDrawer && "mb-10")}
      >
        <h2 className="font-serif text-3xl font-black text-slate-900 mb-2">
          {t("sajuForm.title")}
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          {t("sajuForm.description")}
        </p>
      </div>

      <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="space-y-2 text-left">
          <label
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1"
            htmlFor="saju-name"
          >
            {t("sajuForm.name")}
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-sm"
              id="saju-name"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("sajuForm.name")}
              required
              type="text"
              value={formData.name}
            />
          </div>
        </div>

        {/* Birth Date & Time Row - Better for desktop, stack for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Birth Date */}
          <div className="space-y-2 text-left">
            <label
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1"
              htmlFor="saju-birth-date"
            >
              {t("sajuForm.birthDate")}
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-slate-900 shadow-sm"
                id="saju-birth-date"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthDate: e.target.value,
                  }))
                }
                required
                type="date"
                value={formData.birthDate}
              />
            </div>
          </div>

          {/* Birth Time */}
          <div className="space-y-2 text-left">
            <label
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1"
              htmlFor="saju-birth-time"
            >
              {t("sajuForm.birthTime")}{" "}
              <span className="text-slate-400 normal-case tracking-normal opacity-70 font-medium ml-1 text-[10px]">
                {t("sajuForm.timeHint")}
              </span>
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-slate-900 shadow-sm"
                id="saju-birth-time"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    birthTime: e.target.value,
                  }))
                }
                type="time"
                value={formData.birthTime}
              />
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2 text-left">
          <label
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1"
            id="gender-label"
          >
            {t("sajuForm.gender")}
          </label>
          <div
            aria-labelledby="gender-label"
            className="grid grid-cols-2 gap-4"
            role="radiogroup"
          >
            <button
              aria-checked={formData.gender === "female"}
              className={cn(
                "py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all focus:outline-none focus:ring-4 focus:ring-green-500/20",
                formData.gender === "female"
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm",
              )}
              onClick={() =>
                setFormData((prev) => ({ ...prev, gender: "female" }))
              }
              role="radio"
              type="button"
            >
              {t("sajuForm.female")}
            </button>
            <button
              aria-checked={formData.gender === "male"}
              className={cn(
                "py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all focus:outline-none focus:ring-4 focus:ring-green-500/20",
                formData.gender === "male"
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:border-slate-300 shadow-sm",
              )}
              onClick={() =>
                setFormData((prev) => ({ ...prev, gender: "male" }))
              }
              role="radio"
              type="button"
            >
              {t("sajuForm.male")}
            </button>
          </div>
        </div>

        <button
          className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? "..." : t("beginJourney")}
        </button>
      </form>
    </m.div>
  );
}
