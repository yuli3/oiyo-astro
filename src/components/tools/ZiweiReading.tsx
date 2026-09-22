"use client";

import { calculateZiWeiCoordinates } from "@/lib/ontology/ziwei/calculator";
import { MAIN_STARS } from "@/lib/ontology/ziwei/data";
import type { Element } from "@/lib/ontology/ziwei/types";
import { resolveBirthInstant, resolveBirthRecord } from "@/lib/user/birth-record";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";
import { BirthDateField } from "@/components/shared/BirthDateField";
import { ziweiStarName } from "@/lib/symbolic-tradition/symbol-names";
import { ZIWEI_BRANCHES } from "@/lib/symbolic-tradition/ziwei-coordinates";
import { BRANCHES } from "@/manifest/data/saju/branches";
import ZiWeiWheel from "./ziwei/ZiWeiWheel";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const COPY: Record<Lang, { birthDate: string; needTime: string; needCity: string; bureau: string; life: string; auxTitle: string; star: string; empty: string }> = {
  ko: { birthDate: "생년월일", needTime: "생년월일은 저장돼 있지만, 자미두수는 태어난 시각까지 있어야 계산됩니다. 내 지도에서 시각을 입력해 주세요.", needCity: "자미두수는 태어난 시각을 출생지의 시간으로 셈해요. 내 지도에서 출생도시를 골라 주세요.", bureau: "오행국", life: "명궁", auxTitle: "명궁의 주성", star: "지지", empty: "주성 없음(공궁) — 마주 보는 궁의 별을 빌려 읽어요" },
  en: { birthDate: "Birth date", needTime: "Your birth date is saved, but Zi Wei Dou Shu also needs your birth time. Add it on the ontology page.", needCity: "Zi Wei Dou Shu reads your birth time in the local time of your birthplace. Please choose your birth city on My Map.", bureau: "Five-element bureau", life: "Life palace", auxTitle: "Major stars in the life palace", star: "Earthly branch", empty: "No major star (empty palace) — tradition borrows the stars of the facing palace" },
  ja: { birthDate: "生年月日", needTime: "生年月日は保存されていますが、紫微斗数の計算には出生時刻も必要です。「私の地図」で時刻を入力してください。", needCity: "紫微斗数は出生時刻を出生地の時刻で計算します。「私の地図」で出生都市を選んでください。", bureau: "五行局", life: "命宮", auxTitle: "命宮の主星", star: "地支", empty: "主星なし（空宮）— 向かい合う宮の星を借りて読みます" },
  zh: { birthDate: "出生日期", needTime: "已保存出生日期，但紫微斗数还需要出生时间。请在本体页面中输入时间。", needCity: "紫微斗数按出生地的当地时间计算出生时刻。请在“我的地图”中选择出生城市。", bureau: "五行局", life: "命宫", auxTitle: "命宫主星", star: "地支", empty: "无主星（空宫）——借对宫之星来读" },
  fr: { birthDate: "Date de naissance", needTime: "Votre date de naissance est enregistrée, mais Zi Wei Dou Shu a aussi besoin de l'heure de naissance. Ajoutez-la sur la page d'ontologie.", needCity: "Le Zi Wei Dou Shu lit l’heure de naissance à l’heure locale du lieu de naissance. Choisissez votre ville de naissance dans Ma carte.", bureau: "Bureau des cinq éléments", life: "Palais de vie", auxTitle: "Étoiles majeures du palais de vie", star: "Branche terrestre", empty: "Aucune étoile majeure (palais vide) — la tradition emprunte les étoiles du palais opposé" },
  es: { birthDate: "Fecha de nacimiento", needTime: "Tu fecha de nacimiento está guardada, pero Zi Wei Dou Shu también necesita la hora de nacimiento. Agrégala en la página de ontología.", needCity: "El Zi Wei Dou Shu lee la hora de nacimiento en la hora local del lugar de nacimiento. Elige tu ciudad de nacimiento en Mi mapa.", bureau: "Oficina de cinco elementos", life: "Palacio de vida", auxTitle: "Estrellas mayores del palacio de vida", star: "Rama terrestre", empty: "Sin estrella mayor (palacio vacío) — la tradición toma prestadas las estrellas del palacio opuesto" },
};

/**
 * 오행국 이름. 엔진은 "Fire 6 Bureau" 같은 영어 문자열을 들고 있어 여섯 언어
 * 모두 그대로 보였다. 한자권은 火六局 꼴로, 서양어는 원소 이름으로 적는다.
 */
const BUREAU_ELEMENT: Record<Element, Record<Lang, string>> = {
  Wood: { ko: "목(木)", en: "Wood", ja: "木", zh: "木", fr: "Bois", es: "Madera" },
  Fire: { ko: "화(火)", en: "Fire", ja: "火", zh: "火", fr: "Feu", es: "Fuego" },
  Earth: { ko: "토(土)", en: "Earth", ja: "土", zh: "土", fr: "Terre", es: "Tierra" },
  Metal: { ko: "금(金)", en: "Metal", ja: "金", zh: "金", fr: "Métal", es: "Metal" },
  Water: { ko: "수(水)", en: "Water", ja: "水", zh: "水", fr: "Eau", es: "Agua" },
};
const HAN_NUMBER: Record<number, string> = { 2: "二", 3: "三", 4: "四", 5: "五", 6: "六" };

function bureauLabel(element: Element, number: number, lang: Lang): string {
  const name = BUREAU_ELEMENT[element][lang];
  if (lang === "ja" || lang === "zh") return `${name}${HAN_NUMBER[number] ?? number}局`;
  if (lang === "ko") return `${name} ${number}국`;
  return `${name} ${number}`;
}

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

  // 출생 순간은 저장된 출생 기록(출생지 시간대·당시 UTC 차이)에서 정한다.
  // 예전에는 브라우저의 지역 시간으로 날짜를 만들고, 도시가 없으면 동경 135°로
  // 가정했다 — 보는 사람의 시간대가 출생지와 다르거나 도시를 검색으로 고르면
  // 시지가 어긋날 수 있었다(자미두수는 시지가 명궁을 정한다).
  const record = resolveBirthRecord(profile);
  const resolution = record ? resolveBirthInstant(record) : null;
  if (!resolution || resolution.status !== "resolved") {
    return (
      <div className="rounded-2xl bg-amber-50 p-5 text-sm leading-6 text-amber-800">{t.needCity}</div>
    );
  }
  const result = calculateZiWeiCoordinates(resolution.instant, resolution.longitude);
  // 엔진의 별 자료에는 이름이 없어 `stars.find((s) => s.name)` 은 늘 빈손이었다
  // — "명궁의 별" 줄이 한 번도 뜬 적이 없다. 이름은 symbol-names 가 가진다.
  const branchId = ZIWEI_BRANCHES[result.lifePalace.index];
  const branchHan = BRANCHES[branchId]?.short.zh ?? branchId;
  const majors = result.lifePalace.stars
    .filter((star) => MAIN_STARS.some((main) => main.id === star.id))
    .map((star) => ziweiStarName(star.id, lang));

  return (
    <div className="rounded-2xl bg-violet-50 p-5">
      <p className="text-sm font-black text-violet-950">{t.bureau} · {bureauLabel(result.bureau.element, result.bureau.number, lang)}</p>
      <p className="mt-2 text-sm text-violet-800">{t.life} ({t.star}) · {branchHan}</p>
      <p className="mt-1 text-sm text-violet-800">
        {t.auxTitle} · {majors.length ? majors.join(" · ") : <span className="text-violet-500">{t.empty}</span>}
      </p>
      <ZiWeiWheel locale={lang} palaces={result.palaces} lifeKey={result.lifePalace.key} />
    </div>
  );
}
