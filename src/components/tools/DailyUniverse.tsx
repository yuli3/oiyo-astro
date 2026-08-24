import { useEffect, useState } from "react";
import type { Locale } from "../../i18n";
import { getDailyPillar } from "../../lib/almanac/saju-math";
import type { Element } from "../../lib/almanac/saju-math";
import { Skeleton } from "../ui/skeleton";

interface Props {
  locale: Locale;
}

// ─── Day pillar display data ──────────────────────────────────────────────────
const STEM_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCH_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const STEM_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCH_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
// wiki.oiyo.net 일주 사전 slug (ko 전용)
const STEM_SLUG = ["gap", "eul", "byeong", "jeong", "mu", "gi", "gyeong", "sin", "im", "gye"];
const BRANCH_SLUG = ["ja", "chuk", "in", "myo", "jin", "sa", "o", "mi", "sin", "yu", "sul", "hae"];
const BRANCH_EMOJI = ["🐭", "🐮", "🐯", "🐰", "🐉", "🐍", "🐎", "🐑", "🐒", "🐓", "🐕", "🐷"];

const ELEMENT_LABEL: Record<Element, Partial<Record<string, string>>> = {
  Wood: { ko: "목(木)", en: "Wood", ja: "木", zh: "木", fr: "Bois", es: "Madera" },
  Fire: { ko: "화(火)", en: "Fire", ja: "火", zh: "火", fr: "Feu", es: "Fuego" },
  Earth: { ko: "토(土)", en: "Earth", ja: "土", zh: "土", fr: "Terre", es: "Tierra" },
  Metal: { ko: "금(金)", en: "Metal", ja: "金", zh: "金", fr: "Métal", es: "Metal" },
  Water: { ko: "수(水)", en: "Water", ja: "水", zh: "水", fr: "Eau", es: "Agua" },
};

// 일진 오행별 오늘의 가이드
const DAY_GUIDE: Record<Element, Partial<Record<string, string>>> = {
  Wood: {
    ko: "자라나는 나무의 기운 — 새로운 일을 시작하거나 배움을 넓히기 좋은 날입니다.",
    en: "The energy of growing wood — a good day to start something new or learn.",
    ja: "伸びゆく木の気 — 新しいことを始めたり学びを広げるのに良い日です。",
    zh: "生长之木的能量 — 适合开始新事物或扩展学习的一天。",
    fr: "L'énergie du bois qui pousse — une bonne journée pour commencer ou apprendre.",
    es: "La energía de la madera que crece — buen día para empezar algo nuevo o aprender.",
  },
  Fire: {
    ko: "타오르는 불의 기운 — 표현하고 알리고 만나기에 좋은 활동적인 날입니다.",
    en: "The energy of blazing fire — an active day for expressing, sharing, meeting.",
    ja: "燃え上がる火の気 — 表現し、伝え、出会うのに良い活動的な日です。",
    zh: "燃烧之火的能量 — 适合表达、分享、会面的活跃日子。",
    fr: "L'énergie du feu ardent — une journée active pour s'exprimer et rencontrer.",
    es: "La energía del fuego ardiente — un día activo para expresar y conectar.",
  },
  Earth: {
    ko: "든든한 땅의 기운 — 약속을 지키고 기반을 다지기 좋은 안정의 날입니다.",
    en: "The energy of steady earth — a stable day for keeping promises and building foundations.",
    ja: "どっしりした土の気 — 約束を守り基盤を固めるのに良い安定の日です。",
    zh: "稳固之土的能量 — 适合履行承诺、夯实基础的安定日子。",
    fr: "L'énergie de la terre stable — une journée pour tenir parole et consolider.",
    es: "La energía de la tierra firme — un día estable para cumplir y consolidar.",
  },
  Metal: {
    ko: "단단한 금의 기운 — 정리하고 결단하고 마무리 짓기에 좋은 날입니다.",
    en: "The energy of firm metal — a good day for deciding, organizing, finishing.",
    ja: "硬い金の気 — 整理し、決断し、締めくくるのに良い日です。",
    zh: "坚硬之金的能量 — 适合整理、决断、收尾的一天。",
    fr: "L'énergie du métal ferme — une journée pour décider, ranger, conclure.",
    es: "La energía del metal firme — buen día para decidir, ordenar y concluir.",
  },
  Water: {
    ko: "흐르는 물의 기운 — 듣고 읽고 생각을 깊게 하기 좋은 차분한 날입니다.",
    en: "The energy of flowing water — a calm day for listening, reading, reflecting.",
    ja: "流れる水の気 — 聞き、読み、考えを深めるのに良い穏やかな日です。",
    zh: "流动之水的能量 — 适合倾听、阅读、深思的平静日子。",
    fr: "L'énergie de l'eau qui coule — une journée calme pour écouter et réfléchir.",
    es: "La energía del agua que fluye — un día tranquilo para escuchar y reflexionar.",
  },
};

// ─── Zodiac (sun sign) ────────────────────────────────────────────────────────
type ZodiacElement = "fire" | "earth" | "air" | "water";
interface Sign {
  id: string;
  symbol: string;
  el: ZodiacElement;
  // [startMonth, startDay] — sign runs from this date to next sign's start - 1
  from: [number, number];
  name: Partial<Record<string, string>>;
}
const SIGNS: Sign[] = [
  { id: "aries", symbol: "♈", el: "fire", from: [3, 21], name: { ko: "양자리", en: "Aries", ja: "牡羊座", zh: "白羊座", fr: "Bélier", es: "Aries" } },
  { id: "taurus", symbol: "♉", el: "earth", from: [4, 20], name: { ko: "황소자리", en: "Taurus", ja: "牡牛座", zh: "金牛座", fr: "Taureau", es: "Tauro" } },
  { id: "gemini", symbol: "♊", el: "air", from: [5, 21], name: { ko: "쌍둥이자리", en: "Gemini", ja: "双子座", zh: "双子座", fr: "Gémeaux", es: "Géminis" } },
  { id: "cancer", symbol: "♋", el: "water", from: [6, 22], name: { ko: "게자리", en: "Cancer", ja: "蟹座", zh: "巨蟹座", fr: "Cancer", es: "Cáncer" } },
  { id: "leo", symbol: "♌", el: "fire", from: [7, 23], name: { ko: "사자자리", en: "Leo", ja: "獅子座", zh: "狮子座", fr: "Lion", es: "Leo" } },
  { id: "virgo", symbol: "♍", el: "earth", from: [8, 23], name: { ko: "처녀자리", en: "Virgo", ja: "乙女座", zh: "处女座", fr: "Vierge", es: "Virgo" } },
  { id: "libra", symbol: "♎", el: "air", from: [9, 23], name: { ko: "천칭자리", en: "Libra", ja: "天秤座", zh: "天秤座", fr: "Balance", es: "Libra" } },
  { id: "scorpio", symbol: "♏", el: "water", from: [10, 24], name: { ko: "전갈자리", en: "Scorpio", ja: "蠍座", zh: "天蝎座", fr: "Scorpion", es: "Escorpio" } },
  { id: "sagittarius", symbol: "♐", el: "fire", from: [11, 23], name: { ko: "사수자리", en: "Sagittarius", ja: "射手座", zh: "射手座", fr: "Sagittaire", es: "Sagitario" } },
  { id: "capricorn", symbol: "♑", el: "earth", from: [12, 22], name: { ko: "염소자리", en: "Capricorn", ja: "山羊座", zh: "摩羯座", fr: "Capricorne", es: "Capricornio" } },
  { id: "aquarius", symbol: "♒", el: "air", from: [1, 20], name: { ko: "물병자리", en: "Aquarius", ja: "水瓶座", zh: "水瓶座", fr: "Verseau", es: "Acuario" } },
  { id: "pisces", symbol: "♓", el: "water", from: [2, 19], name: { ko: "물고기자리", en: "Pisces", ja: "魚座", zh: "双鱼座", fr: "Poissons", es: "Piscis" } },
];

function currentSign(d: Date): Sign {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  // Find the last sign whose start date is <= today (calendar wrap handled below)
  let found = SIGNS[SIGNS.length - 3]; // capricorn covers early January before Aquarius
  for (const s of SIGNS) {
    const [sm, sd] = s.from;
    if (m > sm || (m === sm && day >= sd)) found = s;
  }
  // January 1-19 falls in Capricorn (which starts Dec 22 of the previous year)
  if (m === 1 && day < 20) found = SIGNS.find((s) => s.id === "capricorn")!;
  return found;
}

const ZODIAC_LINE: Record<ZodiacElement, Partial<Record<string, string>>> = {
  fire: {
    ko: "태양이 불의 별자리를 지나는 시기 — 추진력과 용기가 응원받는 하늘입니다.",
    en: "The Sun travels a fire sign — a sky that favors drive and courage.",
    ja: "太陽が火のサインを通る時期 — 推進力と勇気が後押しされる空です。",
    zh: "太阳行经火象星座 — 天空助力行动力与勇气。",
    fr: "Le Soleil traverse un signe de feu — un ciel qui favorise l'élan et le courage.",
    es: "El Sol transita un signo de fuego — un cielo que favorece el impulso y el coraje.",
  },
  earth: {
    ko: "태양이 흙의 별자리를 지나는 시기 — 꾸준함과 실속이 응원받는 하늘입니다.",
    en: "The Sun travels an earth sign — a sky that favors steadiness and substance.",
    ja: "太陽が土のサインを通る時期 — 着実さと実りが後押しされる空です。",
    zh: "太阳行经土象星座 — 天空助力踏实与收获。",
    fr: "Le Soleil traverse un signe de terre — un ciel qui favorise la constance.",
    es: "El Sol transita un signo de tierra — un cielo que favorece la constancia.",
  },
  air: {
    ko: "태양이 바람의 별자리를 지나는 시기 — 대화와 아이디어가 응원받는 하늘입니다.",
    en: "The Sun travels an air sign — a sky that favors conversation and ideas.",
    ja: "太陽が風のサインを通る時期 — 会話とアイデアが後押しされる空です。",
    zh: "太阳行经风象星座 — 天空助力交流与灵感。",
    fr: "Le Soleil traverse un signe d'air — un ciel qui favorise les échanges et les idées.",
    es: "El Sol transita un signo de aire — un cielo que favorece el diálogo y las ideas.",
  },
  water: {
    ko: "태양이 물의 별자리를 지나는 시기 — 직감과 공감이 응원받는 하늘입니다.",
    en: "The Sun travels a water sign — a sky that favors intuition and empathy.",
    ja: "太陽が水のサインを通る時期 — 直感と共感が後押しされる空です。",
    zh: "太阳行经水象星座 — 天空助力直觉与共情。",
    fr: "Le Soleil traverse un signe d'eau — un ciel qui favorise l'intuition et l'empathie.",
    es: "El Sol transita un signo de agua — un cielo que favorece la intuición y la empatía.",
  },
};

// ─── Daily tarot (same seed/draw order as TarotDailyCard → same card) ────────
interface TarotCard {
  name: Partial<Record<string, string>>;
  keywords: Partial<Record<string, string[]>>;
  upright: Partial<Record<string, string>>;
  reversed: Partial<Record<string, string>>;
}

function getTodaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}
function lt(obj: Partial<Record<string, string>> | undefined, locale: string): string {
  if (!obj) return "";
  return obj[locale] ?? obj["en"] ?? Object.values(obj)[0] ?? "";
}

// ─── UI strings ───────────────────────────────────────────────────────────────
const UI: Record<string, {
  title: string; subtitle: string; sajuLabel: string; zodiacLabel: string; tarotLabel: string;
  dayPillar: string; element: string; wikiLink: string; sunNow: string; luckySign: string;
  upright: string; reversed: string; fullReading: string; comeback: string;
}> = {
  ko: { title: "오늘의 우주", subtitle: "일진·별자리·타로가 알려주는 오늘의 흐름", sajuLabel: "오늘의 일진", zodiacLabel: "오늘의 하늘", tarotLabel: "오늘의 타로", dayPillar: "일진", element: "오행", wikiLink: "이 일주 자세히 보기", sunNow: "현재 태양궁", luckySign: "오늘의 행운 별자리", upright: "정방향", reversed: "역방향", fullReading: "카드 전체 리딩 보기", comeback: "내일의 우주는 또 달라요 — 매일 새 기운을 확인하세요" },
  en: { title: "Today's Universe", subtitle: "Your daily flow through Saju, stars and tarot", sajuLabel: "Day Energy", zodiacLabel: "Today's Sky", tarotLabel: "Today's Tarot", dayPillar: "Day pillar", element: "Element", wikiLink: "About this day pillar", sunNow: "Sun is now in", luckySign: "Lucky sign of the day", upright: "Upright", reversed: "Reversed", fullReading: "Open full reading", comeback: "Tomorrow's universe will be different — check back daily" },
  ja: { title: "今日の宇宙", subtitle: "日辰・星座・タロットが伝える今日の流れ", sajuLabel: "今日の日辰", zodiacLabel: "今日の空", tarotLabel: "今日のタロット", dayPillar: "日柱", element: "五行", wikiLink: "この日柱について", sunNow: "太陽は現在", luckySign: "今日のラッキー星座", upright: "正位置", reversed: "逆位置", fullReading: "フルリーディングを見る", comeback: "明日の宇宙はまた違います — 毎日チェック" },
  zh: { title: "今日宇宙", subtitle: "日辰、星座与塔罗告诉你今天的流向", sajuLabel: "今日日辰", zodiacLabel: "今日天象", tarotLabel: "今日塔罗", dayPillar: "日柱", element: "五行", wikiLink: "了解此日柱", sunNow: "太阳目前位于", luckySign: "今日幸运星座", upright: "正位", reversed: "逆位", fullReading: "查看完整解读", comeback: "明天的宇宙又会不同 — 每天回来看看" },
  fr: { title: "L'Univers du Jour", subtitle: "Votre flux quotidien : Saju, étoiles et tarot", sajuLabel: "Énergie du Jour", zodiacLabel: "Ciel du Jour", tarotLabel: "Tarot du Jour", dayPillar: "Pilier du jour", element: "Élément", wikiLink: "Sur ce pilier du jour", sunNow: "Le Soleil est en", luckySign: "Signe chanceux du jour", upright: "À l'endroit", reversed: "Renversée", fullReading: "Lecture complète", comeback: "L'univers de demain sera différent — revenez chaque jour" },
  es: { title: "El Universo de Hoy", subtitle: "Tu flujo diario: Saju, estrellas y tarot", sajuLabel: "Energía del Día", zodiacLabel: "Cielo de Hoy", tarotLabel: "Tarot de Hoy", dayPillar: "Pilar del día", element: "Elemento", wikiLink: "Sobre este pilar del día", sunNow: "El Sol está en", luckySign: "Signo de la suerte de hoy", upright: "Al derecho", reversed: "Invertida", fullReading: "Ver lectura completa", comeback: "El universo de mañana será distinto — vuelve cada día" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DailyUniverse({ locale }: Props) {
  const [tarot, setTarot] = useState<{ card: TarotCard; reversed: boolean } | null>(null);

  const today = new Date();
  const pillar = getDailyPillar(today);
  const stemIdx = pillar.ganZhiIndex % 10;
  const branchIdx = pillar.ganZhiIndex % 12;
  const ganjiHanja = STEM_HANJA[stemIdx] + BRANCH_HANJA[branchIdx];
  const ganjiKo = STEM_KO[stemIdx] + BRANCH_KO[branchIdx];
  const iljuSlug = STEM_SLUG[stemIdx] + BRANCH_SLUG[branchIdx];

  const sign = currentSign(today);
  const luckySign = SIGNS[getTodaySeed() % 12];

  const ui = UI[locale] ?? UI.en;

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tarot/data.json")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const all: TarotCard[] = [...(data.major_arcana ?? []), ...(data.minor_arcana?.cards ?? [])];
        if (!all.length) return;
        const rand = seededRand(getTodaySeed());
        const idx = Math.floor(rand() * all.length);
        setTarot({ card: all[idx], reversed: rand() > 0.5 });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const dateStr = (() => {
    try {
      return today.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    } catch {
      return today.toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
    }
  })();

  const cardBase =
    "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 flex flex-col gap-3";
  const labelBase = "font-mono text-[11px] tracking-widest uppercase text-amber-300/80";

  return (
    <section
      className="relative overflow-hidden rounded-3xl px-5 py-10 md:px-10"
      style={{ background: "linear-gradient(135deg, #07050d 0%, #0a0716 55%, #07050d 100%)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 15% 20%, rgba(255,255,255,.6), transparent 60%), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,.4), transparent 60%), radial-gradient(1px 1px at 65% 15%, rgba(255,255,255,.55), transparent 60%), radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,.45), transparent 60%), radial-gradient(1px 1px at 25% 85%, rgba(255,255,255,.5), transparent 60%)",
        }}
      />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-100">{ui.title}</h1>
          <p className="mt-2 text-sm text-white/60">{ui.subtitle}</p>
          <p className="mt-1 text-xs text-white/40">{dateStr}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 일진 */}
          <div className={cardBase}>
            <span className={labelBase}>☯ {ui.sajuLabel}</span>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-serif text-amber-100">{ganjiHanja}</span>
              <div className="text-sm text-white/80">
                <div>
                  {locale === "ko" ? `${ganjiKo}일` : `${ui.dayPillar} ${ganjiHanja}`}{" "}
                  <span aria-hidden="true">{BRANCH_EMOJI[branchIdx]}</span>
                </div>
                <div className="text-white/50 text-xs mt-0.5">
                  {ui.element}: {lt(ELEMENT_LABEL[pillar.element], locale)}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70">{lt(DAY_GUIDE[pillar.element], locale)}</p>
            {locale === "ko" && (
              <a
                href={`https://wiki.oiyo.net/ko/meaning-of-saju-ilju-${iljuSlug}/`}
                className="mt-auto text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
              >
                {ui.wikiLink} →
              </a>
            )}
          </div>

          {/* 별자리 */}
          <div className={cardBase}>
            <span className={labelBase}>✦ {ui.zodiacLabel}</span>
            <div className="flex items-center gap-3">
              <span className="text-4xl text-amber-100" aria-hidden="true">{sign.symbol}</span>
              <div className="text-sm text-white/80">
                <div>{ui.sunNow}</div>
                <div className="font-semibold text-amber-100">{lt(sign.name, locale)}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70">{lt(ZODIAC_LINE[sign.el], locale)}</p>
            <div className="mt-auto text-xs text-white/50">
              {ui.luckySign}: <span className="text-amber-300">{luckySign.symbol} {lt(luckySign.name, locale)}</span>
            </div>
          </div>

          {/* 타로 */}
          <div className={cardBase}>
            <span className={labelBase}>🜂 {ui.tarotLabel}</span>
            {tarot ? (
              <>
                <div className="text-sm text-white/80">
                  <span className="font-semibold text-amber-100">{lt(tarot.card.name, locale)}</span>
                  <span className="ml-2 text-xs rounded-full border border-white/20 px-2 py-0.5 text-white/60">
                    {tarot.reversed ? ui.reversed : ui.upright}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  {lt(tarot.reversed ? tarot.card.reversed : tarot.card.upright, locale)}
                </p>
              </>
            ) : (
              <Skeleton aria-hidden="true" className="h-16 rounded-lg bg-white/5" />
            )}
            <a
              href={`/${locale}/tarot/reading/`}
              className="mt-auto text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors"
            >
              {ui.fullReading} →
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/40">{ui.comeback}</p>
      </div>
    </section>
  );
}
