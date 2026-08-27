"use client";

import { calculateCelticTree } from "@/lib/ontology/celtic/calculator";
import { CELTIC_TREES } from "@/lib/ontology/celtic/types";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";
import { BirthDateField } from "@/components/shared/BirthDateField";
import CelticWheel from "./celtic/CelticWheel";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const COPY: Record<Lang, { birthDate: string; tree: string }> = {
  ko: { birthDate: "생년월일", tree: "수호 나무" },
  en: { birthDate: "Birth date", tree: "Guardian tree" },
  ja: { birthDate: "生年月日", tree: "守護樹" },
  zh: { birthDate: "出生日期", tree: "守护树" },
  fr: { birthDate: "Date de naissance", tree: "Arbre gardien" },
  es: { birthDate: "Fecha de nacimiento", tree: "Árbol guardián" },
};

export default function CelticReading({ locale = "ko" }: { locale?: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = COPY[lang];
  const { parsed } = useProfilePrefill();

  if (!parsed) {
    return (
      <div className="rounded-2xl bg-emerald-50 p-5">
        <BirthDateField id="celtic-birth-date" locale={locale} label={t.birthDate} value="" onChange={() => {}} className="w-full" />
      </div>
    );
  }

  const local = new Date(parsed.year, parsed.month - 1, parsed.day, parsed.hour ?? 12, parsed.minute ?? 0);
  const result = calculateCelticTree(local);

  return (
    <div className="rounded-2xl bg-emerald-50 p-5">
      <p className="text-sm font-black text-emerald-950">{t.tree} · {result.name}</p>
      <p className="mt-2 text-sm text-emerald-800">{result.ogham} · {result.celticName}</p>
      <CelticWheel
        locale={lang}
        total={CELTIC_TREES.length}
        myIndex={CELTIC_TREES.findIndex((sign) => sign.id === result.id)}
      />
    </div>
  );
}
