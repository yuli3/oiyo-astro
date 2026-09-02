"use client";

import { useMemo, useState } from "react";

import { ProfileNameField } from "@/components/shared/BirthDateField";
import { ProfileInputDialog } from "@/components/shared/ProfileInputDialog";
import { analyzeNameEnergy, type PrimalElement } from "@/lib/ontology/onomancy/analysis";
import { analyzeSaju, calculateSaju, STANDARD_MERIDIAN_KST } from "@/lib/ontology/saju/logic";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";
import { useUserStore } from "@/lib/user/store/user-store";
import type { Locale } from "@/i18n";

/**
 * The name reading, finally reachable.
 *
 * analyzeNameEnergy, the six-locale verdict copy in onomancy.json and the
 * sound-to-element table have all existed for months with nothing rendering
 * them: the ontology card pointed at /ontology, i.e. the page the visitor was
 * already on, and the namespace was not even in the i18n loader's file list.
 * This is the surface those pieces were waiting for.
 *
 * Deliberately not reusing SonicOracle, the component originally written for
 * this: it imports next-intl (not installed — it survives only because no
 * page imports it) and paints a near-black card with a violet waveform, which
 * the light, olive design rules rule out.
 *
 * Two honesty constraints shape what is shown:
 *  - analyzeNameEnergy returns balanceScore 80 when there is nothing missing
 *    to fill, which is a number with no evidence behind it. A score appears
 *    only when a birth chart actually names missing elements.
 *  - It reads one axis, the initial-sound element. Stroke count, character
 *    origin element and Hanja meaning are not in it, and the page says so
 *    rather than implying a complete reading.
 */

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

export interface OnomancyCopy {
  verdicts: { excellent: string; good: string; fair: string; caution: string };
  narrative: string;
  missingForce: string;
}

const ELEMENTS: PrimalElement[] = ["wood", "fire", "earth", "metal", "water"];

const ELEMENT_LABEL: Record<Lang, Record<PrimalElement, string>> = {
  ko: { wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)" },
  en: { wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water" },
  ja: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" },
  zh: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" },
  fr: { wood: "Bois", fire: "Feu", earth: "Terre", metal: "Métal", water: "Eau" },
  es: { wood: "Madera", fire: "Fuego", earth: "Tierra", metal: "Metal", water: "Agua" },
};

const ELEMENT_TONE: Record<PrimalElement, string> = {
  wood: "bg-chart-1/12 text-chart-1 border-chart-1/30",
  fire: "bg-chart-3/12 text-chart-3 border-chart-3/30",
  earth: "bg-chart-5/15 text-chart-4 border-chart-5/40",
  metal: "bg-chart-2/12 text-chart-2 border-chart-2/30",
  water: "bg-chart-4/12 text-chart-4 border-chart-4/30",
};

const UI: Record<Lang, {
  nameLabel: string; soundTitle: string; soundSub: string;
  carries: string; absent: string; none: string;
  fillTitle: string; fillSub: string; fillNothing: string; needBirth: string; addBirth: string;
  scoreLabel: string; empty: string;
}> = {
  ko: {
    nameLabel: "이름", soundTitle: "이름의 소리 오행", soundSub: "각 글자의 첫소리가 어떤 기운으로 분류되는지",
    carries: "이름이 지닌 기운", absent: "이름에 없는 기운", none: "없음",
    fillTitle: "사주와 겹쳐 보기", fillSub: "사주에서 비어 있는 기운을 이름이 채우는지",
    fillNothing: "사주에 비어 있는 오행이 없습니다. 채울 것이 없으므로 점수를 매기지 않습니다.",
    needBirth: "생년월일을 입력하면 사주에서 부족한 기운을 이름이 채우는지 함께 봅니다.",
    addBirth: "생년월일 입력", scoreLabel: "채움 정도",
    empty: "이름을 입력하면 소리 오행을 읽어드립니다.",
  },
  en: {
    nameLabel: "Name", soundTitle: "The elements in your name's sounds", soundSub: "How each syllable's initial sound is classified",
    carries: "Elements present", absent: "Elements absent", none: "None",
    fillTitle: "Against your chart", fillSub: "Whether the name supplies what the chart lacks",
    fillNothing: "Your chart is missing no element, so there is nothing to fill and no score to give.",
    needBirth: "Add a birth date to see whether your name supplies what your chart lacks.",
    addBirth: "Add birth date", scoreLabel: "Supplied",
    empty: "Enter a name to read its sound elements.",
  },
  ja: {
    nameLabel: "名前", soundTitle: "名前の音の五行", soundSub: "各文字の頭音がどの気に分類されるか",
    carries: "名前が持つ気", absent: "名前にない気", none: "なし",
    fillTitle: "四柱と重ねて見る", fillSub: "四柱に欠けた気を名前が補うか",
    fillNothing: "四柱に欠けている五行がありません。補うものがないため点数は出しません。",
    needBirth: "生年月日を入力すると、四柱に足りない気を名前が補うかを一緒に見られます。",
    addBirth: "生年月日を入力", scoreLabel: "補い度",
    empty: "名前を入力すると音の五行を読みます。",
  },
  zh: {
    nameLabel: "姓名", soundTitle: "姓名读音的五行", soundSub: "每个字的声母归入哪种气",
    carries: "姓名具备的气", absent: "姓名缺少的气", none: "无",
    fillTitle: "与八字对照", fillSub: "姓名是否补足八字所缺",
    fillNothing: "八字没有缺失的五行，无可补足，因此不给出分数。",
    needBirth: "填写出生日期后，可一并查看姓名是否补足八字所缺之气。",
    addBirth: "填写出生日期", scoreLabel: "补足程度",
    empty: "填写姓名后即可读取其声音五行。",
  },
  fr: {
    nameLabel: "Nom", soundTitle: "Les éléments dans les sons du nom", soundSub: "Comment l'attaque de chaque syllabe est classée",
    carries: "Éléments présents", absent: "Éléments absents", none: "Aucun",
    fillTitle: "Face à votre thème", fillSub: "Si le nom apporte ce qui manque au thème",
    fillNothing: "Aucun élément ne manque à votre thème : rien à compléter, donc aucun score.",
    needBirth: "Ajoutez une date de naissance pour voir si votre nom apporte ce qui manque à votre thème.",
    addBirth: "Ajouter la date", scoreLabel: "Apporté",
    empty: "Saisissez un nom pour lire ses éléments sonores.",
  },
  es: {
    nameLabel: "Nombre", soundTitle: "Los elementos en los sonidos del nombre", soundSub: "Cómo se clasifica el sonido inicial de cada sílaba",
    carries: "Elementos presentes", absent: "Elementos ausentes", none: "Ninguno",
    fillTitle: "Frente a tu carta", fillSub: "Si el nombre aporta lo que le falta a la carta",
    fillNothing: "A tu carta no le falta ningún elemento: no hay nada que completar, así que no damos puntuación.",
    needBirth: "Añade una fecha de nacimiento para ver si tu nombre aporta lo que falta en tu carta.",
    addBirth: "Añadir fecha", scoreLabel: "Aportado",
    empty: "Escribe un nombre para leer sus elementos sonoros.",
  },
};

const asLang = (locale: string): Lang =>
  (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;

function verdictKey(score: number): keyof OnomancyCopy["verdicts"] {
  if (score >= 85) return "excellent";
  if (score >= 60) return "good";
  if (score >= 35) return "fair";
  return "caution";
}

export default function NameEnergyReading({ copy, locale }: { copy: OnomancyCopy; locale: Locale }) {
  const lang = asLang(locale);
  const ui = UI[lang];
  const labels = ELEMENT_LABEL[lang];

  const storedName = useUserStore((state) => state.profile.name) ?? "";
  const gender = useUserStore((state) => state.profile.gender);
  const { parsed } = useProfilePrefill();
  const [name, setName] = useState(storedName);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Missing elements come from the chart, so they only exist once a birth date
  // does. Without one the reading stays descriptive rather than scored.
  const missing = useMemo<PrimalElement[]>(() => {
    if (!parsed) return [];
    const birth = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, parsed.hour ?? 12, parsed.minute ?? 0));
    try {
      const saju = calculateSaju(birth, false, gender === "female" ? "female" : "male", STANDARD_MERIDIAN_KST);
      return analyzeSaju(saju).missingElements as unknown as PrimalElement[];
    } catch {
      return [];
    }
  }, [parsed, gender]);

  const reading = useMemo(() => (name.trim() ? analyzeNameEnergy(name, missing) : null), [name, missing]);

  const present = reading ? ELEMENTS.filter((e) => reading.elementsFound.includes(e)) : [];
  const absent = reading ? ELEMENTS.filter((e) => !reading.elementsFound.includes(e)) : [];
  const filled = missing.filter((e) => present.includes(e));
  const scored = reading !== null && missing.length > 0;

  const chip = (element: PrimalElement) => (
    <span key={element} className={`rounded-full border px-3 py-1 text-sm font-bold ${ELEMENT_TONE[element]}`}>
      {labels[element]}
    </span>
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      <ProfileNameField label={ui.nameLabel} locale={locale} value={name} onChange={setName} />

      {!reading ? (
        <p className="rounded-2xl border border-dashed border-green-200 bg-card px-4 py-6 text-center text-sm font-bold text-slate-500">
          {ui.empty}
        </p>
      ) : (
        <>
          <section className="rounded-[28px] border border-green-100 bg-card p-5">
            <h2 className="text-sm font-black text-slate-950">{ui.soundTitle}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{ui.soundSub}</p>

            <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-green-600">{ui.carries}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {present.length > 0 ? present.map(chip) : <span className="text-sm text-slate-400">{ui.none}</span>}
            </div>

            <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-slate-400">{ui.absent}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {absent.length > 0 ? absent.map(chip) : <span className="text-sm text-slate-400">{ui.none}</span>}
            </div>
          </section>

          <section className="rounded-[28px] border border-green-100 bg-card p-5">
            <h2 className="text-sm font-black text-slate-950">{ui.fillTitle}</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">{ui.fillSub}</p>

            {!parsed ? (
              <div className="mt-4 rounded-2xl border border-dashed border-green-200 px-4 py-4 text-center">
                <p className="text-sm font-bold text-slate-500 [word-break:keep-all]">{ui.needBirth}</p>
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className="mt-3 h-11 w-full rounded-2xl bg-primary text-sm font-black text-primary-foreground transition hover:bg-green-800 active:scale-[0.98]"
                >
                  {ui.addBirth}
                </button>
              </div>
            ) : !scored ? (
              <p className="mt-4 text-sm leading-6 text-slate-600 [word-break:keep-all]">{ui.fillNothing}</p>
            ) : (
              <>
                <p className="mt-4 text-[11px] font-black uppercase tracking-wider text-green-600">{copy.missingForce}</p>
                <div className="mt-2 flex flex-wrap gap-2">{missing.map(chip)}</div>

                <div className="mt-5 flex items-center gap-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-green-600">{ui.scoreLabel}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-subtle">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                      style={{ width: `${reading.balanceScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-green-800">{reading.balanceScore}%</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {filled.length}/{missing.length}
                </p>

                <p className="mt-5 rounded-2xl bg-surface-subtle px-4 py-3 text-sm font-bold leading-6 text-green-900 [word-break:keep-all]">
                  {copy.verdicts[verdictKey(reading.balanceScore)]}
                </p>
              </>
            )}
          </section>

          <p className="px-1 text-xs leading-5 text-slate-500 [word-break:keep-all]">{copy.narrative}</p>
        </>
      )}

      <ProfileInputDialog locale={locale} onClose={() => setDialogOpen(false)} open={dialogOpen} />
    </div>
  );
}
