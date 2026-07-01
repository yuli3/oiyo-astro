"use client";

import { useEffect, useMemo, useState } from "react";

// Lane 3 "실제 나의 것": tactile chip-based profile builder (mindmap spirit).
// Central "나" → categories → selectable chips. Avoids a blank text box.
// Stored in oiyo:profile:v1 (new key, no collision with existing stores).
type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const KEY = "oiyo:profile:v1";

type Cat = { id: string; label: Record<Lang, string>; chips: Record<Lang, string[]> };
const CATS: Cat[] = [
  { id: "interest", label: { ko: "관심", en: "Interests", ja: "関心", zh: "兴趣", fr: "Intérêts", es: "Intereses" },
    chips: { ko: ["글쓰기", "정리", "탐험", "분석", "창작", "배움", "수집"], en: ["Writing", "Organizing", "Exploring", "Analyzing", "Creating", "Learning", "Collecting"], ja: ["書く", "整理", "探検", "分析", "創作", "学び", "収集"], zh: ["写作", "整理", "探索", "分析", "创作", "学习", "收藏"], fr: ["Écrire", "Organiser", "Explorer", "Analyser", "Créer", "Apprendre", "Collectionner"], es: ["Escribir", "Organizar", "Explorar", "Analizar", "Crear", "Aprender", "Coleccionar"] } },
  { id: "activity", label: { ko: "활동", en: "Activities", ja: "活動", zh: "活动", fr: "Activités", es: "Actividades" },
    chips: { ko: ["운동", "여행", "요리", "독서", "음악", "게임", "명상"], en: ["Exercise", "Travel", "Cooking", "Reading", "Music", "Gaming", "Meditation"], ja: ["運動", "旅行", "料理", "読書", "音楽", "ゲーム", "瞑想"], zh: ["运动", "旅行", "烹饪", "阅读", "音乐", "游戏", "冥想"], fr: ["Sport", "Voyage", "Cuisine", "Lecture", "Musique", "Jeux", "Méditation"], es: ["Ejercicio", "Viajar", "Cocinar", "Leer", "Música", "Juegos", "Meditación"] } },
  { id: "environment", label: { ko: "환경", en: "Environment", ja: "環境", zh: "环境", fr: "Environnement", es: "Entorno" },
    chips: { ko: ["자연", "도시", "바다", "산", "카페", "집", "야외"], en: ["Nature", "City", "Sea", "Mountains", "Café", "Home", "Outdoors"], ja: ["自然", "都市", "海", "山", "カフェ", "家", "屋外"], zh: ["自然", "城市", "海", "山", "咖啡馆", "家", "户外"], fr: ["Nature", "Ville", "Mer", "Montagne", "Café", "Maison", "Plein air"], es: ["Naturaleza", "Ciudad", "Mar", "Montaña", "Café", "Casa", "Aire libre"] } },
  { id: "relation", label: { ko: "관계", en: "Relationships", ja: "関係", zh: "关系", fr: "Relations", es: "Relaciones" },
    chips: { ko: ["혼자", "팀", "가족", "소수 친구", "커뮤니티", "멘토"], en: ["Solo", "Team", "Family", "Few friends", "Community", "Mentor"], ja: ["一人", "チーム", "家族", "少数の友人", "コミュニティ", "メンター"], zh: ["独处", "团队", "家庭", "少数朋友", "社群", "导师"], fr: ["Seul", "Équipe", "Famille", "Quelques amis", "Communauté", "Mentor"], es: ["Solo", "Equipo", "Familia", "Pocos amigos", "Comunidad", "Mentor"] } },
  { id: "goal", label: { ko: "목표", en: "Goals", ja: "目標", zh: "目标", fr: "Objectifs", es: "Metas" },
    chips: { ko: ["성장", "안정", "자유", "영향력", "숙련", "연결", "의미"], en: ["Growth", "Stability", "Freedom", "Impact", "Mastery", "Connection", "Meaning"], ja: ["成長", "安定", "自由", "影響力", "熟達", "つながり", "意味"], zh: ["成长", "稳定", "自由", "影响力", "精通", "连接", "意义"], fr: ["Croissance", "Stabilité", "Liberté", "Impact", "Maîtrise", "Connexion", "Sens"], es: ["Crecimiento", "Estabilidad", "Libertad", "Impacto", "Maestría", "Conexión", "Sentido"] } },
];

const UI: Record<Lang, { center: string; saved: string; count: (n: number) => string }> = {
  ko: { center: "나", saved: "저장됨", count: (n) => `${n}개 선택` },
  en: { center: "Me", saved: "Saved", count: (n) => `${n} selected` },
  ja: { center: "私", saved: "保存", count: (n) => `${n}個選択` },
  zh: { center: "我", saved: "已保存", count: (n) => `已选 ${n}` },
  fr: { center: "Moi", saved: "Enregistré", count: (n) => `${n} choisis` },
  es: { center: "Yo", saved: "Guardado", count: (n) => `${n} elegidos` },
};

export function ProfileMindmap({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = UI[lang];
  const [sel, setSel] = useState<Record<string, string[]>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) { const p = JSON.parse(s); if (p && typeof p === "object" && p.chosen) setSel(p.chosen); } } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      const prev = JSON.parse(localStorage.getItem(KEY) || "{}");
      localStorage.setItem(KEY, JSON.stringify({ ...prev, chosen: sel, updatedAt: Date.now() }));
      window.dispatchEvent(new Event("oiyo:profile-updated"));
    } catch {}
  }, [sel, hydrated]);

  const total = useMemo(() => Object.values(sel).reduce((a, c) => a + c.length, 0), [sel]);
  const toggle = (cat: string, chip: string) =>
    setSel((s) => {
      const cur = s[cat] ?? [];
      return { ...s, [cat]: cur.includes(chip) ? cur.filter((x) => x !== chip) : [...cur, chip] };
    });

  return (
    <div className="rounded-[28px] border border-green-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-sm font-black text-white">{t.center}</span>
        <span className="text-xs font-bold text-green-700">{total > 0 ? `✓ ${t.saved} · ${t.count(total)}` : t.count(0)}</span>
      </div>
      <div className="space-y-4">
        {CATS.map((cat) => (
          <div key={cat.id}>
            <p className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-green-500">{cat.label[lang]}</p>
            <div className="flex flex-wrap gap-2">
              {cat.chips[lang].map((chip) => {
                const on = (sel[cat.id] ?? []).includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggle(cat.id, chip)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs font-bold transition " +
                      (on ? "border-green-600 bg-green-600 text-white" : "border-green-200 bg-white text-green-800 hover:border-green-400")
                    }
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
