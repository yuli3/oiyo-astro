"use client";

import { useMemo } from "react";
import { calculateCelticTree } from "@/lib/ontology/celtic/calculator";
import { calculateMayanKin } from "@/lib/ontology/mayan/calculator";
import { calculateZiWeiCoordinates } from "@/lib/ontology/ziwei/calculator";
import { CITIES } from "@/lib/ontology/natal/signs";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const COPY: Record<Lang, { title: string; sub: string; needDate: string; needTime: string; ziwei: string; mayan: string; celtic: string; bureau: string; life: string; kin: string; tone: string; tree: string; note: string }> = {
  ko: { title: "세 전통으로 읽는 나의 좌표", sub: "온톨로지에 저장한 출생 정보를 자미두수·마야 촐킨·켈트 나무 달력으로 함께 읽습니다.", needDate: "생년월일을 저장하면 결과가 열립니다.", needTime: "자미두수는 태어난 시각까지 있어야 정확히 계산됩니다.", ziwei: "자미두수", mayan: "마야 촐킨", celtic: "켈트 나무", bureau: "오행국", life: "명궁", kin: "킨", tone: "은하의 톤", tree: "수호 나무", note: "세 체계는 서로 다른 문화의 상징 언어입니다. 성격을 단정하기보다 자기 성찰의 관점으로 활용하세요." },
  en: { title: "Your coordinates in three traditions", sub: "Read your saved birth profile through Zi Wei Dou Shu, Mayan Tzolkin, and the Celtic tree calendar.", needDate: "Save your birth date to unlock these results.", needTime: "Zi Wei Dou Shu also needs your birth time for a precise chart.", ziwei: "Zi Wei Dou Shu", mayan: "Mayan Tzolkin", celtic: "Celtic tree", bureau: "Five-element bureau", life: "Life palace", kin: "Kin", tone: "Galactic tone", tree: "Guardian tree", note: "These are symbolic languages from different traditions. Use them as prompts for reflection, not fixed labels." },
  ja: { title: "三つの伝統で読む座標", sub: "保存した出生情報を紫微斗数・マヤ暦・ケルト樹木暦で読みます。", needDate: "生年月日を保存すると結果が開きます。", needTime: "紫微斗数の精密計算には出生時刻も必要です。", ziwei: "紫微斗数", mayan: "マヤ・ツォルキン", celtic: "ケルト樹木", bureau: "五行局", life: "命宮", kin: "KIN", tone: "銀河の音", tree: "守護樹", note: "異なる文化の象徴言語です。固定的な性格分類ではなく内省にご利用ください。" },
  zh: { title: "三种传统中的你的坐标", sub: "用紫微斗数、玛雅卓尔金历与凯尔特树历读取已保存的出生信息。", needDate: "保存出生日期后即可查看结果。", needTime: "紫微斗数的精确计算还需要出生时间。", ziwei: "紫微斗数", mayan: "玛雅卓尔金", celtic: "凯尔特树历", bureau: "五行局", life: "命宫", kin: "KIN", tone: "银河音调", tree: "守护树", note: "它们是不同文化的象征语言，请用于自我反思而非固定定性。" },
  fr: { title: "Vos coordonnées selon trois traditions", sub: "Lisez votre naissance via Zi Wei Dou Shu, le Tzolkin maya et le calendrier celtique des arbres.", needDate: "Enregistrez votre date de naissance pour voir les résultats.", needTime: "Zi Wei Dou Shu exige aussi l’heure de naissance pour un calcul précis.", ziwei: "Zi Wei Dou Shu", mayan: "Tzolkin maya", celtic: "Arbre celtique", bureau: "Bureau des cinq éléments", life: "Palais de vie", kin: "Kin", tone: "Ton galactique", tree: "Arbre gardien", note: "Ces traditions sont des langages symboliques, à utiliser comme pistes de réflexion." },
  es: { title: "Tus coordenadas en tres tradiciones", sub: "Lee tu nacimiento con Zi Wei Dou Shu, Tzolkin maya y el calendario celta de árboles.", needDate: "Guarda tu fecha de nacimiento para ver los resultados.", needTime: "Zi Wei Dou Shu también requiere la hora para un cálculo preciso.", ziwei: "Zi Wei Dou Shu", mayan: "Tzolkin maya", celtic: "Árbol celta", bureau: "Oficina de cinco elementos", life: "Palacio de vida", kin: "Kin", tone: "Tono galáctico", tree: "Árbol guardián", note: "Son lenguajes simbólicos de distintas culturas; úsalos para reflexionar, no como etiquetas fijas." },
};

export function HeritageCoordinates({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = COPY[lang];
  const { parsed, profile } = useProfilePrefill();
  const result = useMemo(() => {
    if (!parsed) return null;
    const local = new Date(parsed.year, parsed.month - 1, parsed.day, parsed.hour ?? 12, parsed.minute ?? 0);
    const mayan = calculateMayanKin(local);
    const celtic = calculateCelticTree(local);
    const city = CITIES.find((item) => item.id === profile.birthCityId);
    const ziwei = parsed.hour === null ? null : calculateZiWeiCoordinates(local, city?.lon ?? 135);
    return { celtic, mayan, ziwei };
  }, [parsed, profile.birthCityId]);

  return (
    <section id="heritage-coordinates" className="mt-8 rounded-[28px] border border-green-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-black text-green-950">🧿 {t.title}</h2>
      <p className="mt-1 text-xs leading-5 text-green-600">{t.sub}</p>
      {!result ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800">{t.needDate}</p> : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl bg-violet-50 p-4"><p className="text-xs font-black text-violet-600">⭐ {t.ziwei}</p>{result.ziwei ? <><p className="mt-2 text-sm font-black text-slate-950">{t.bureau} · {result.ziwei.bureau.name}</p><p className="mt-1 text-xs text-slate-600">{t.life} · {result.ziwei.lifePalace.earthlyBranch}{result.ziwei.lifePalace.stars[0] ? ` · ${result.ziwei.lifePalace.stars[0].name}` : ""}</p></> : <p className="mt-2 text-xs leading-5 text-amber-700">{t.needTime}</p>}</article>
          <article className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-black text-amber-700">🗿 {t.mayan}</p><p className="mt-2 text-sm font-black text-slate-950">{t.kin} {result.mayan?.kinNumber ?? 0} · {result.mayan?.kinName[lang === "ko" ? "ko" : "en"]}</p><p className="mt-1 text-xs text-slate-600">{t.tone} {result.mayan?.tone.number} · {result.mayan?.seal.mayanName}</p></article>
          <article className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-black text-emerald-700">🌲 {t.celtic}</p><p className="mt-2 text-sm font-black text-slate-950">{t.tree} · {result.celtic.name}</p><p className="mt-1 text-xs text-slate-600">{result.celtic.ogham} · {result.celtic.celticName}</p></article>
        </div>
      )}
      <p className="mt-3 text-[11px] leading-5 text-slate-400">{t.note}</p>
    </section>
  );
}
