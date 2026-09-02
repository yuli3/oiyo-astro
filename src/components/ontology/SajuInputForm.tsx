"use client";

import { m } from "framer-motion";
import { Calendar, Clock, Fingerprint, MapPin, User } from "lucide-react";
import { useLocale } from "next-intl";
import React, { useState } from "react";

import { useNamespacedFallback } from "@/lib/i18n/use-namespaced-fallback";
import { CITIES, type NatalLocale } from "@/lib/ontology/natal/signs";
import { useUserProfile } from "@/lib/user/context/UserContext";
import {
  createBirthRecord,
  resolveBirthRecord,
  resolveZonedCivilTime,
} from "@/lib/user/birth-record";
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
  const locale = useLocale() as NatalLocale;
  const { profile, saveBirthRecord, setProfileData } = useUserProfile();
  const birthRecord = resolveBirthRecord(profile);
  const isDrawer = variant === "drawer";

  const [formData, setFormData] = useState({
    birthDate: birthRecord?.civilDate || "",
    birthTime: birthRecord?.civilTime || "",
    city: CITIES.find((city) => city.zoneId === birthRecord?.zoneId && city.lon === birthRecord?.longitude)?.id || "",
    gender: (profile?.gender as "female" | "male") || "female",
    name: profile?.name || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocationError("");

    const city = CITIES.find((candidate) => candidate.id === formData.city);
    if (!city) {
      setLocationError({
        ko: "정확한 시간대 계산을 위해 출생 도시를 선택해 주세요.",
        en: "Choose a birth city so the historical time zone can be resolved.",
        ja: "当時のタイムゾーンを確認するため、出生都市を選択してください。",
        zh: "请选择出生城市，以便确定当时的时区。",
        fr: "Choisissez la ville de naissance pour déterminer le fuseau horaire historique.",
        es: "Elige la ciudad de nacimiento para resolver la zona horaria histórica.",
      }[locale] || "Choose a birth city.");
      setIsSubmitting(false);
      return;
    }

    const zoneResolution = resolveZonedCivilTime({
      civilDate: formData.birthDate,
      civilTime: formData.birthTime || "12:00",
      zoneId: city.zoneId,
    });
    if (zoneResolution.status !== "resolved") {
      setLocationError({
        ko: "이 시각은 출생지의 서머타임 전환과 겹칩니다. 인접한 정확한 시각을 확인하거나 시간을 비워 주세요.",
        en: "This time overlaps a daylight-saving transition. Confirm a nearby time or leave birth time empty.",
        ja: "この時刻はサマータイム切替と重なります。近い正確な時刻を確認するか、時刻を空欄にしてください。",
        zh: "该时间与夏令时切换重叠。请确认邻近准确时间，或将出生时间留空。",
        fr: "Cette heure chevauche un changement d’heure. Confirmez une heure voisine ou laissez l’heure vide.",
        es: "Esta hora coincide con un cambio horario. Confirma una hora cercana o deja la hora vacía.",
      }[locale] || "Confirm an unambiguous birth time.");
      setIsSubmitting(false);
      return;
    }

    // Simulate slight delay for effect
    await new Promise((resolve) => setTimeout(resolve, 800));

    saveBirthRecord(createBirthRecord({
      civilDate: formData.birthDate,
      civilTime: formData.birthTime || null,
      longitude: city.lon,
      needsConfirmation: false,
      provenance: "user-confirmed-v2",
      utcOffsetMinutesAtBirth: zoneResolution.offsetMinutes,
      zoneId: city.zoneId,
    }));
    setProfileData({
      gender: formData.gender,
      name: formData.name,
    });

    setIsSubmitting(false);
    onSaved?.();
  };

  const containerClasses = isDrawer
    ? "w-full max-w-xl mx-auto p-0 relative"
    : "w-full max-w-md mx-auto bg-card rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 relative overflow-hidden";

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

        <div className="space-y-2 text-left">
          <label
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1"
            htmlFor="saju-birth-city"
          >
            {{ ko: "출생지", en: "Birthplace", ja: "出生地", zh: "出生地", fr: "Lieu de naissance", es: "Lugar de nacimiento" }[locale] || "Birthplace"}
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
            <select
              className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-slate-900 shadow-sm"
              id="saju-birth-city"
              onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
              required
              value={formData.city}
            >
              <option value="">{{ ko: "도시 선택", en: "Select a city", ja: "都市を選択", zh: "选择城市", fr: "Choisir une ville", es: "Elegir una ciudad" }[locale] || "Select a city"}</option>
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>{city.label[locale] || city.label.en}</option>
              ))}
            </select>
          </div>
          {locationError && <p className="text-sm font-medium text-rose-600" role="alert">{locationError}</p>}
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
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-card hover:border-slate-300 shadow-sm",
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
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-card hover:border-slate-300 shadow-sm",
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
          className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-primary-strong transition-all shadow-xl shadow-green-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? "..." : t("beginJourney")}
        </button>
      </form>
    </m.div>
  );
}
