"use client";

import { calculateMayanKin } from "@/lib/ontology/mayan/calculator";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";
import { BirthDateField } from "@/components/shared/BirthDateField";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const COPY: Record<Lang, { birthDate: string; kin: string; tone: string }> = {
  ko: { birthDate: "생년월일", kin: "킨", tone: "은하의 톤" },
  en: { birthDate: "Birth date", kin: "Kin", tone: "Galactic tone" },
  ja: { birthDate: "生年月日", kin: "KIN", tone: "銀河の音" },
  zh: { birthDate: "出生日期", kin: "KIN", tone: "银河音调" },
  fr: { birthDate: "Date de naissance", kin: "Kin", tone: "Ton galactique" },
  es: { birthDate: "Fecha de nacimiento", kin: "Kin", tone: "Tono galáctico" },
};

export default function MayanReading({ locale = "ko" }: { locale?: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = COPY[lang];
  const { parsed } = useProfilePrefill();

  if (!parsed) {
    return (
      <div className="rounded-2xl bg-amber-50 p-5">
        <BirthDateField id="mayan-birth-date" locale={locale} label={t.birthDate} value="" onChange={() => {}} className="w-full" />
      </div>
    );
  }

  const local = new Date(parsed.year, parsed.month - 1, parsed.day, parsed.hour ?? 12, parsed.minute ?? 0);
  const result = calculateMayanKin(local);

  return (
    <div className="rounded-2xl bg-amber-50 p-5">
      <p className="text-sm font-black text-amber-950">{t.kin} {result.kinNumber} · {result.kinName[lang === "ko" ? "ko" : "en"]}</p>
      <p className="mt-2 text-sm text-amber-800">{t.tone} {result.tone.number} · {result.seal.mayanName}</p>
    </div>
  );
}
