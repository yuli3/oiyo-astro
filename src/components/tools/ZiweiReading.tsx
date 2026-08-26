"use client";

import { calculateZiWeiCoordinates } from "@/lib/ontology/ziwei/calculator";
import { CITIES } from "@/lib/ontology/natal/signs";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";
import { BirthDateField } from "@/components/shared/BirthDateField";
import ZiWeiWheel from "./ziwei/ZiWeiWheel";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const COPY: Record<Lang, { birthDate: string; needTime: string; bureau: string; life: string; auxTitle: string; star: string }> = {
  ko: { birthDate: "생년월일", needTime: "생년월일은 저장돼 있지만, 자미두수는 태어난 시각까지 있어야 계산됩니다. 온톨로지에서 시각을 입력해 주세요.", bureau: "오행국", life: "명궁", auxTitle: "명궁의 별", star: "지지" },
  en: { birthDate: "Birth date", needTime: "Your birth date is saved, but Zi Wei Dou Shu also needs your birth time. Add it on the ontology page.", bureau: "Five-element bureau", life: "Life palace", auxTitle: "Star in the life palace", star: "Earthly branch" },
  ja: { birthDate: "生年月日", needTime: "生年月日は保存されていますが、紫微斗数の計算には出生時刻も必要です。オントロジーページで時刻を入力してください。", bureau: "五行局", life: "命宮", auxTitle: "命宮の星", star: "地支" },
  zh: { birthDate: "出生日期", needTime: "已保存出生日期，但紫微斗数还需要出生时间。请在本体页面中输入时间。", bureau: "五行局", life: "命宫", auxTitle: "命宫之星", star: "地支" },
  fr: { birthDate: "Date de naissance", needTime: "Votre date de naissance est enregistrée, mais Zi Wei Dou Shu a aussi besoin de l'heure de naissance. Ajoutez-la sur la page d'ontologie.", bureau: "Bureau des cinq éléments", life: "Palais de vie", auxTitle: "Étoile du palais de vie", star: "Branche terrestre" },
  es: { birthDate: "Fecha de nacimiento", needTime: "Tu fecha de nacimiento está guardada, pero Zi Wei Dou Shu también necesita la hora de nacimiento. Agrégala en la página de ontología.", bureau: "Oficina de cinco elementos", life: "Palacio de vida", auxTitle: "Estrella del palacio de vida", star: "Rama terrestre" },
};

export default function ZiweiReading({ locale = "ko" }: { locale?: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = COPY[lang];
  const { parsed, profile } = useProfilePrefill();

  if (!parsed) {
    return (
      <div className="rounded-2xl bg-violet-50 p-5">
        <BirthDateField id="ziwei-birth-date" locale={locale} label={t.birthDate} value="" onChange={() => {}} className="w-full" />
      </div>
    );
  }

  if (parsed.hour === null) {
    return (
      <div className="rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-800">{t.needTime}</div>
    );
  }

  const local = new Date(parsed.year, parsed.month - 1, parsed.day, parsed.hour, parsed.minute ?? 0);
  const city = CITIES.find((item) => item.id === profile.birthCityId);
  const result = calculateZiWeiCoordinates(local, city?.lon ?? 135);
  const namedStar = result.lifePalace.stars.find((star) => star.name);

  return (
    <div className="rounded-2xl bg-violet-50 p-5">
      <p className="text-sm font-black text-violet-950">{t.bureau} · {result.bureau.name}</p>
      <p className="mt-2 text-sm text-violet-800">{t.life} ({t.star}) · {result.lifePalace.earthlyBranch}</p>
      {namedStar && <p className="mt-1 text-sm text-violet-800">{t.auxTitle} · {namedStar.name}</p>}
      <ZiWeiWheel locale={lang} palaces={result.palaces} lifeKey={result.lifePalace.key} />
    </div>
  );
}
