"use client";

import { Suspense, lazy, useState } from "react";
import { RotateCw, Sparkles, Compass, ShieldCheck, Info } from "lucide-react";
import type { ElementKey } from "./SajuElementCube3DScene";
import { ELEMENT_NAMES } from "./SajuElementCube3DScene";

const SajuElementCube3DScene = lazy(() => import("./SajuElementCube3DScene"));

export type Locale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: Locale;
  elementCount?: Record<string, number>;
  dominantElement?: string;
  missingElements?: string[];
  dayMaster?: string;
}

const DEFAULT_COUNTS: Record<ElementKey, number> = {
  Wood: 2,
  Fire: 3,
  Earth: 1,
  Metal: 0,
  Water: 2,
};

const I18N_TEXT: Record<Locale, {
  title: string;
  subtitle: string;
  rotateHint: string;
  toggleAutoRotate: string;
  resetFocus: string;
  allElements: string;
  dominantTag: string;
  missingTag: string;
  analysisTitle: string;
  adviceTitle: string;
  loadingText: string;
  elementMeanings: Record<ElementKey, { trait: string; advice: string }>;
}> = {
  ko: {
    title: "사주 오행 3D 에너지 큐브 & 토템 뷰어",
    subtitle: "내 사주팔자 8글자의 오행(목·화·토·금·수) 분포와 균형을 3D 신성 큐브 토템으로 입체 시각화합니다.",
    rotateHint: "드래그하여 큐브를 360도 회전하거나, 각 오행 블록을 탭하여 세부 기운을 확인하세요.",
    toggleAutoRotate: "자동 회전",
    resetFocus: "전체 보기",
    allElements: "전체 오행",
    dominantTag: "가장 강한 기운 (태과)",
    missingTag: "부족한 기운 (과소/결핍)",
    analysisTitle: "오행 상생·상극 에너지 해석",
    adviceTitle: "용신(개운) 일상 처방",
    loadingText: "3D 오행 토템 큐브를 로딩 중입니다...",
    elementMeanings: {
      Wood: { trait: "성장, 창의성, 인자함, 기획력", advice: "초록색 소품, 식물 가꾸기, 아침 산책이 기운을 보강합니다." },
      Fire: { trait: "열정, 확산, 직관, 표현력", advice: "붉은색 계열, 유산소 운동, 밝은 조명이 에너지를 북돋웁니다." },
      Earth: { trait: "포용, 신뢰, 중재, 안정감", advice: "황토색/베이지색, 도예, 규칙적인 식습관이 안정을 줍니다." },
      Metal: { trait: "결단, 절제, 정의, 실행력", advice: "흰색/메탈 액세서리, 정돈된 공간, 명상이 집중을 돕습니다." },
      Water: { trait: "지혜, 유연성, 통찰, 깊은 사고", advice: "검은색/푸른색, 수영, 충분한 수분 섭취가 통찰을 키웁니다." },
    },
  },
  en: {
    title: "Saju 3D Five Elements Totem Cube",
    subtitle: "Visualize the five elements (Wood, Fire, Earth, Metal, Water) of your Four Pillars destiny blueprint in an interactive 3D sacred totem cube.",
    rotateHint: "Drag to rotate the cube in 360 degrees or tap any element block to inspect details.",
    toggleAutoRotate: "Auto Rotate",
    resetFocus: "View All",
    allElements: "All Elements",
    dominantTag: "Dominant Element",
    missingTag: "Deficient Element",
    analysisTitle: "Elemental Dynamic Analysis",
    adviceTitle: "Favorable Element Lifestyle Advice",
    loadingText: "Loading 3D Elemental Totem...",
    elementMeanings: {
      Wood: { trait: "Growth, creativity, benevolence, visionary planning", advice: "Green hues, plants, and morning walks strengthen this energy." },
      Fire: { trait: "Passion, expression, intuition, dynamic action", advice: "Warm red tones, active cardio, and bright light revitalize this energy." },
      Earth: { trait: "Nurturance, trust, mediation, grounded balance", advice: "Beige tones, ceramic crafts, and routine stability nurture this energy." },
      Metal: { trait: "Decisiveness, discipline, justice, sharp focus", advice: "Silver/white accents, clean minimalist spaces, and reflection enhance clarity." },
      Water: { trait: "Wisdom, adaptability, deep insight, inner calm", advice: "Dark blue/black hues, hydration, and water activities replenish insight." },
    },
  },
  ja: {
    title: "四柱推命 五行 3D エネルギーキューブ・トーテム",
    subtitle: "生年月日の五行（木・火・土・金・水）のバランスをインタラクティブな3Dキューブで立体可視化します。",
    rotateHint: "ドラッグで360度回転、各要素をタップしてエネルギーを確認できます。",
    toggleAutoRotate: "自動回転",
    resetFocus: "全体表示",
    allElements: "全体五行",
    dominantTag: "最も強い気運",
    missingTag: "不足している気運",
    analysisTitle: "五行エネルギー分析",
    adviceTitle: "開運ライフスタイル処方",
    loadingText: "3D五行キューブを読み込み中...",
    elementMeanings: {
      Wood: { trait: "成長、創造性、仁愛、計画力", advice: "緑色の小物、観葉植物、朝の散策が運気を高めます。" },
      Fire: { trait: "情熱、表現力、直感、行動力", advice: "赤系カラー、適度な運動、明るい照明が活力を与えます。" },
      Earth: { trait: "包容力、信頼、調整、安定感", advice: "ベージュ色、陶芸、規則正しい食習慣が安心感をもたらします。" },
      Metal: { trait: "決断力、節制、正義、実行力", advice: "白やシルバーの装飾、整理整頓された空間が集中を助けます。" },
      Water: { trait: "知恵、柔軟性、洞察、思考力", advice: "黒や青系、水分補給、水辺の散策がインスピレーションを育みます。" },
    },
  },
  zh: {
    title: "八字五行 3D 能量图腾魔方",
    subtitle: "将生辰八字中的五行（木·火·土·金·水）强弱平衡转化为交互式 3D 神圣图腾魔方立体展示。",
    rotateHint: "拖动可全方位旋转魔方，点击对应元素方块可查看能量解析。",
    toggleAutoRotate: "自动旋转",
    resetFocus: "重置视角",
    allElements: "全部五行",
    dominantTag: "最旺五行",
    missingTag: "缺失五行",
    analysisTitle: "五行生克格局分析",
    adviceTitle: "用神开运生活建议",
    loadingText: "正在加载 3D 五行图腾魔方...",
    elementMeanings: {
      Wood: { trait: "生发、仁爱、创造力、规划力", advice: "绿色植物、晨间散步有助于生发木气。" },
      Fire: { trait: "热情、礼仪、直觉、明辨力", advice: "红色系装饰、充沛采光与有氧运动可助燃火势。" },
      Earth: { trait: "包容、诚信、中正、稳重感", advice: "黄色或米色基调、规律起居能增强土性能量。" },
      Metal: { trait: "果敢、义理、节制、执行力", advice: "白色/金属饰品、极简整洁的居室有助于收敛金气。" },
      Water: { trait: "智慧、通达、灵动、深邃思考", advice: "黑色/深蓝配饰、充足水分摄入利于滋润水气。" },
    },
  },
  fr: {
    title: "Cube Totem 3D des Cinq Éléments du Saju",
    subtitle: "Visualisez la distribution et l'harmonie des cinq éléments énergétiques dans un totem 3D interactif.",
    rotateHint: "Faites glisser pour tourner le cube à 360° ou touchez un bloc pour inspecter l'énergie correspondante.",
    toggleAutoRotate: "Rotation auto",
    resetFocus: "Vue globale",
    allElements: "Tous les éléments",
    dominantTag: "Élément Dominant",
    missingTag: "Élément Déficitaire",
    analysisTitle: "Analyse Énergétique des Cinq Éléments",
    adviceTitle: "Conseils d'Harmonisation Quotidienne",
    loadingText: "Chargement du cube totem 3D...",
    elementMeanings: {
      Wood: { trait: "Croissance, créativité, bienveillance", advice: "Nuances de vert, plantes et marche matinale revitalisent le Bois." },
      Fire: { trait: "Passion, dynamisme, intuition vive", advice: "Tonalités chaudes, sport et lumière vive renforcent le Feu." },
      Earth: { trait: "Ancrage, loyauté, conciliation", advice: "Tons terreux, poterie et rythme de vie stable nourrissent la Terre." },
      Metal: { trait: "Détermination, clarté, rigueur", advice: "Touches argentées ou blanches et espaces ordonnés soutiennent le Métal." },
      Water: { trait: "Sagesse, adaptabilité, profondeur", advice: "Teintes bleu nuit, hydratation et calme restaurent l'Eau." },
    },
  },
  es: {
    title: "Cubo Tótem 3D de los Cinco Elementos del Saju",
    subtitle: "Visualiza el equilibrio de los cinco elementos (Madera, Fuego, Tierra, Metal, Agua) en un cubo sagrado 3D interactivo.",
    rotateHint: "Arrastra para rotar el cubo en 360 grados o pulsa cualquier elemento para explorar sus cualidades.",
    toggleAutoRotate: "Rotación auto",
    resetFocus: "Ver todo",
    allElements: "Todos los elementos",
    dominantTag: "Elemento Dominante",
    missingTag: "Elemento Deficiente",
    analysisTitle: "Dinámica de los Cinco Elementos",
    adviceTitle: "Consejos para el Equilibrio Diario",
    loadingText: "Cargando el tótem 3D...",
    elementMeanings: {
      Wood: { trait: "Crecimiento, creatividad, empatía", advice: "Verdes naturales, plantas y paseos matinales potencian la Madera." },
      Fire: { trait: "Pasión, lucidez, intuición activa", advice: "Colores cálidos, ejercicio aeróbico y buena luz estimulan el Fuego." },
      Earth: { trait: "Estabilidad, lealtad, contención", advice: "Tonos tierra y hábitos regulares nutren la Tierra." },
      Metal: { trait: "Determinación, justicia, enfoque nítido", advice: "Detalles metálicos, blanco y orden fortalecen el Metal." },
      Water: { trait: "Sabiduría, fluidez, profundidad reflexiva", advice: "Tonos oscuros, hidratación y sosiego nutren el Agua." },
    },
  },
};

export default function SajuElementCube3D({
  locale = "ko",
  elementCount = DEFAULT_COUNTS,
  dominantElement = "Fire",
  missingElements = ["Metal"],
  dayMaster = "Wood",
}: Props) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [focusedElement, setFocusedElement] = useState<ElementKey | null>(null);

  const t = I18N_TEXT[locale] ?? I18N_TEXT.ko;
  const elementsList: ElementKey[] = ["Wood", "Fire", "Earth", "Metal", "Water"];

  const totalCount = Object.values(elementCount).reduce((a, b) => a + b, 0) || 8;

  const currentFocus = focusedElement ?? (dominantElement as ElementKey);
  const focusData = t.elementMeanings[currentFocus] ?? t.elementMeanings.Wood;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-1.5 text-primary">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-foreground">{t.title}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              autoRotate
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{t.toggleAutoRotate}</span>
          </button>

          {focusedElement && (
            <button
              type="button"
              onClick={() => setFocusedElement(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted text-foreground border border-border hover:bg-muted/80"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.resetFocus}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-muted/20">
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <RotateCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">{t.loadingText}</span>
            </div>
          }
        >
          <SajuElementCube3DScene
            elementCount={elementCount}
            dominantElement={dominantElement}
            focusedElement={focusedElement}
            onSelectElement={(el) => setFocusedElement(el)}
            autoRotate={autoRotate}
          />
        </Suspense>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="rounded-lg bg-background/80 backdrop-blur px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
            {t.rotateHint}
          </span>
          <span className="rounded-lg bg-primary/90 text-primary-foreground px-2.5 py-1 text-xs font-bold shadow-sm">
            일간: {dayMaster}
          </span>
        </div>
      </div>

      {/* Element Distribution Selector Tabs */}
      <div className="grid grid-cols-5 gap-2">
        {elementsList.map((el) => {
          const count = elementCount[el] ?? 0;
          const pct = Math.round((count / totalCount) * 100);
          const isSelected = focusedElement === el;
          const nameObj = ELEMENT_NAMES[el];

          return (
            <button
              key={el}
              type="button"
              onClick={() => setFocusedElement(isSelected ? null : el)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:bg-muted/40"
              }`}
            >
              <span className="text-xs font-bold text-foreground">
                {nameObj.hanja} {locale === "ko" ? nameObj.ko.split(" ")[0] : nameObj.en}
              </span>
              <span className="text-sm font-black text-foreground font-mono mt-1">
                {count}개
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Energy Analysis Details */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground">
              {ELEMENT_NAMES[currentFocus].ko} ({ELEMENT_NAMES[currentFocus].hanja}) — {t.analysisTitle}
            </h4>
          </div>
          {dominantElement === currentFocus && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {t.dominantTag}
            </span>
          )}
          {missingElements.includes(currentFocus) && (
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {t.missingTag}
            </span>
          )}
        </div>

        <p className="text-xs text-foreground font-medium leading-relaxed">
          <strong>고유 특성:</strong> {focusData.trait}
        </p>

        <div className="border-t border-border/60 pt-2 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>{focusData.advice}</span>
        </div>
      </div>
    </div>
  );
}
