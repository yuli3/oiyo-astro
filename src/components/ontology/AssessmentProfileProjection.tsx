"use client";

import { useEffect, useState } from "react";
import { listAssessmentResults, projectPersonalProfileSnapshot, type PersonalProfileSnapshot } from "@/assessments";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const COPY: Record<Lang, { title: string; description: string; empty: string; local: string; lane: Record<string, string>; confidence: string; stale: string; measured: string }> = {
  ko: { title: "검사에서 모인 나의 좌표", description: "서로 다른 검사를 한 점수로 합치지 않고, 특성·선호·흥미·가치·성찰 신호를 각각 보여줍니다.", empty: "아직 표시할 정본 검사 결과가 없습니다.", local: "읽기 전용 · 이 브라우저의 결과만 사용 · 서버 전송 없음", lane: { trait: "특성", preference: "선호", interest: "흥미", "chosen-value": "선택한 가치", "reflective-signal": "성찰 신호" }, confidence: "근거 신뢰도", stale: "오래된 신호", measured: "측정" },
  en: { title: "Coordinates from your assessments", description: "Traits, preferences, interests, chosen values, and reflective signals stay in separate lanes instead of becoming one score.", empty: "No canonical assessment evidence is available yet.", local: "Read-only · this browser only · no server transmission", lane: { trait: "Trait", preference: "Preference", interest: "Interest", "chosen-value": "Chosen value", "reflective-signal": "Reflective signal" }, confidence: "Evidence confidence", stale: "Stale signal", measured: "Measured" },
  ja: { title: "検査から集まった座標", description: "特性・選好・興味・選んだ価値・内省シグナルを一つの点数にせず、別々に表示します。", empty: "表示できる正規の検査エビデンスはまだありません。", local: "読み取り専用・このブラウザのみ・サーバー送信なし", lane: { trait: "特性", preference: "選好", interest: "興味", "chosen-value": "選んだ価値", "reflective-signal": "内省シグナル" }, confidence: "エビデンス信頼度", stale: "古いシグナル", measured: "測定" },
  zh: { title: "测验汇集的个人坐标", description: "特质、偏好、兴趣、所选价值与反思信号保持独立，不合并成一个总分。", empty: "目前没有可显示的规范测验证据。", local: "只读 · 仅限此浏览器 · 不向服务器传输", lane: { trait: "特质", preference: "偏好", interest: "兴趣", "chosen-value": "所选价值", "reflective-signal": "反思信号" }, confidence: "证据可信度", stale: "旧信号", measured: "测量" },
  fr: { title: "Coordonnées issues de vos évaluations", description: "Traits, préférences, intérêts, valeurs choisies et signaux réflexifs restent séparés au lieu de former un score unique.", empty: "Aucune preuve d’évaluation canonique n’est encore disponible.", local: "Lecture seule · ce navigateur uniquement · aucun envoi au serveur", lane: { trait: "Trait", preference: "Préférence", interest: "Intérêt", "chosen-value": "Valeur choisie", "reflective-signal": "Signal réflexif" }, confidence: "Confiance de la preuve", stale: "Signal ancien", measured: "Mesuré" },
  es: { title: "Coordenadas de tus evaluaciones", description: "Rasgos, preferencias, intereses, valores elegidos y señales reflexivas permanecen separados, sin convertirse en una puntuación total.", empty: "Aún no hay evidencia canónica de evaluaciones para mostrar.", local: "Solo lectura · solo este navegador · sin envío al servidor", lane: { trait: "Rasgo", preference: "Preferencia", interest: "Interés", "chosen-value": "Valor elegido", "reflective-signal": "Señal reflexiva" }, confidence: "Confianza de la evidencia", stale: "Señal antigua", measured: "Medido" },
};

const displayValue = (value: number | string | string[]) => Array.isArray(value) ? value.join(" · ") : String(value);

export function AssessmentProfileProjection({ locale }: { locale: Lang }) {
  const t = COPY[locale];
  const [snapshot, setSnapshot] = useState<PersonalProfileSnapshot | null>(null);
  useEffect(() => setSnapshot(projectPersonalProfileSnapshot(listAssessmentResults())), []);
  if (!snapshot) return null;
  const populated = snapshot.lanes.filter((lane) => lane.projections.length > 0);
  return (
    <section className="mt-8 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm" aria-labelledby="assessment-profile-title">
      <h2 id="assessment-profile-title" className="text-lg font-black text-emerald-950">{t.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-700">{t.description}</p>
      <p className="mt-1 text-xs font-semibold text-emerald-700">{t.local}</p>
      {populated.length === 0 ? <p className="mt-4 text-sm text-slate-600">{t.empty}</p> : <div className="mt-4 space-y-3">
        {populated.map((lane) => <details key={lane.id} className="rounded-xl border border-slate-200 bg-slate-50" open>
          <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-black text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">{t.lane[lane.id]} <span className="ml-2 text-xs font-semibold text-slate-500">({lane.projections.length})</span></summary>
          <ul className="space-y-2 border-t border-slate-200 p-3">{lane.projections.map((projection) => <li key={`${projection.sourceAssessmentId}:${projection.constructId}`} className="rounded-lg bg-white p-3 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2"><span className="font-bold text-slate-900">{projection.constructId}</span><span className="text-slate-700">{displayValue(projection.value)}</span></div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600"><span>{t.confidence}: {Math.round(projection.confidence * 100)}%</span><span>{t.measured}: {projection.measuredAt.slice(0, 10)}</span>{projection.freshness === "stale" && <strong className="text-amber-800">{t.stale}</strong>}</div>
          </li>)}</ul>
        </details>)}
      </div>}
    </section>
  );
}
