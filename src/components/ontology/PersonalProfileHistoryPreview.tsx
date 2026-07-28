"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  clearPersonalProfileHistory,
  comparePersonalProfileHistory,
  deletePersonalProfileHistoryPoint,
  listAssessmentResults,
  loadPersonalProfileHistory,
  personalProfileHistoryFreshness,
  projectPersonalProfileSnapshot,
  recordPersonalProfileSnapshot,
  serializePersonalProfileHistory,
  withPersonalProfileHistoryUxState,
  type PersonalProfileHistoryResult,
  type PersonalProfileHistoryUxState,
} from "@/assessments";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, {
  clear: string;
  capture: string;
  captureHint: string;
  compare: string;
  delete: string;
  empty: string;
  export: string;
  local: string;
  measured: string;
  retry: string;
  scoringMismatch: string;
  status: Record<PersonalProfileHistoryUxState, string>;
  title: string;
  warning: string;
}> = {
  ko: { title: "검사 변화 기록 (로컬 프리뷰)", local: "이 브라우저에만 저장 · 프로필 데이터 서버 전송 없음", capture: "현재 결과 명시적으로 저장", captureHint: "삭제한 기록은 자동으로 다시 만들지 않습니다. 이 버튼을 눌러야 현재 결과를 새로 기록합니다.", empty: "비교할 검사 기록이 아직 없습니다.", compare: "동일 검사·동일 버전의 두 시점 비교", measured: "측정", warning: "차이는 시점별 자기보고 신호이며 성격이 변했다는 증명이 아닙니다.", export: "기록 JSON 내보내기", clear: "전체 삭제", delete: "삭제", retry: "다시 시도", scoringMismatch: "채점 버전이 달라 수치 비교를 중단했습니다.", status: { ready: "기록을 사용할 수 있습니다.", empty: "저장된 기록이 없습니다.", "storage-disabled": "이 브라우저에서 로컬 저장소를 사용할 수 없습니다.", "read-failed": "로컬 기록을 읽지 못했습니다.", corrupt: "로컬 기록이 손상되었습니다. 자동으로 덮어쓰지 않았습니다.", "write-failed": "로컬 기록을 저장하지 못했습니다.", "delete-failed": "로컬 기록을 삭제하지 못했습니다.", "export-failed": "JSON 파일을 내보내지 못했습니다." } },
  en: { title: "Assessment history (local preview)", local: "Profile data stays in this browser · no profile-data server transmission", capture: "Explicitly save current results", captureHint: "Deleted history is not recreated automatically. Use this button to record current results again.", empty: "No assessment history is available to compare yet.", compare: "Two points from the same assessment and version", measured: "Measured", warning: "Differences are point-in-time self-report evidence, not proof that personality changed.", export: "Export history JSON", clear: "Delete all", delete: "Delete", retry: "Try again", scoringMismatch: "Numeric comparison stopped because the scoring versions differ.", status: { ready: "History is available.", empty: "No history is stored.", "storage-disabled": "Local storage is unavailable in this browser.", "read-failed": "The local history could not be read.", corrupt: "The local history is corrupt and was not overwritten automatically.", "write-failed": "The local history could not be saved.", "delete-failed": "The local history could not be deleted.", "export-failed": "The JSON file could not be exported." } },
  ja: { title: "検査の変化記録（ローカルプレビュー）", local: "プロフィールデータはこのブラウザだけに保存・サーバー送信なし", capture: "現在の結果を明示的に保存", captureHint: "削除した履歴は自動で復元されません。このボタンを押した場合だけ現在の結果を再記録します。", empty: "比較できる検査履歴はまだありません。", compare: "同じ検査・同じ版の2時点比較", measured: "測定", warning: "差は各時点の自己報告シグナルであり、性格が変化した証明ではありません。", export: "履歴JSONを書き出す", clear: "すべて削除", delete: "削除", retry: "再試行", scoringMismatch: "採点バージョンが異なるため数値比較を中止しました。", status: { ready: "履歴を利用できます。", empty: "保存された履歴はありません。", "storage-disabled": "このブラウザではローカルストレージを利用できません。", "read-failed": "ローカル履歴を読み込めませんでした。", corrupt: "ローカル履歴が破損しているため、自動で上書きしませんでした。", "write-failed": "ローカル履歴を保存できませんでした。", "delete-failed": "ローカル履歴を削除できませんでした。", "export-failed": "JSONファイルを書き出せませんでした。" } },
  zh: { title: "测验变化记录（本地预览）", local: "个人资料仅存于此浏览器 · 不向服务器传输个人资料", capture: "明确保存当前结果", captureHint: "已删除的历史不会自动恢复。只有点击此按钮才会重新记录当前结果。", empty: "目前还没有可比较的测验记录。", compare: "同一测验、同一版本的两个时间点", measured: "测量", warning: "差异只是不同时间点的自我报告信号，并不能证明人格发生了变化。", export: "导出历史 JSON", clear: "全部删除", delete: "删除", retry: "重试", scoringMismatch: "由于评分版本不同，已停止数值比较。", status: { ready: "历史记录可用。", empty: "没有已保存的历史记录。", "storage-disabled": "此浏览器无法使用本地存储。", "read-failed": "无法读取本地历史记录。", corrupt: "本地历史记录已损坏，系统没有自动覆盖。", "write-failed": "无法保存本地历史记录。", "delete-failed": "无法删除本地历史记录。", "export-failed": "无法导出 JSON 文件。" } },
  fr: { title: "Historique des évaluations (aperçu local)", local: "Les données de profil restent dans ce navigateur · aucun envoi au serveur", capture: "Enregistrer explicitement les résultats actuels", captureHint: "Un historique supprimé n’est pas recréé automatiquement. Seul ce bouton permet de réenregistrer les résultats actuels.", empty: "Aucun historique n’est encore disponible pour comparaison.", compare: "Deux moments de la même évaluation et version", measured: "Mesuré", warning: "Les écarts sont des signaux auto-rapportés ponctuels, pas la preuve d’un changement de personnalité.", export: "Exporter l’historique JSON", clear: "Tout supprimer", delete: "Supprimer", retry: "Réessayer", scoringMismatch: "La comparaison numérique est interrompue car les versions de notation diffèrent.", status: { ready: "L’historique est disponible.", empty: "Aucun historique n’est enregistré.", "storage-disabled": "Le stockage local est indisponible dans ce navigateur.", "read-failed": "Impossible de lire l’historique local.", corrupt: "L’historique local est corrompu et n’a pas été remplacé automatiquement.", "write-failed": "Impossible d’enregistrer l’historique local.", "delete-failed": "Impossible de supprimer l’historique local.", "export-failed": "Impossible d’exporter le fichier JSON." } },
  es: { title: "Historial de evaluaciones (vista local)", local: "Los datos del perfil permanecen en este navegador · no se envían al servidor", capture: "Guardar explícitamente los resultados actuales", captureHint: "El historial eliminado no se recrea automáticamente. Solo este botón vuelve a registrar los resultados actuales.", empty: "Aún no hay historial para comparar.", compare: "Dos momentos de la misma evaluación y versión", measured: "Medido", warning: "Las diferencias son señales autoinformadas puntuales, no prueban un cambio de personalidad.", export: "Exportar historial JSON", clear: "Borrar todo", delete: "Borrar", retry: "Reintentar", scoringMismatch: "La comparación numérica se detuvo porque las versiones de puntuación son distintas.", status: { ready: "El historial está disponible.", empty: "No hay historial guardado.", "storage-disabled": "El almacenamiento local no está disponible en este navegador.", "read-failed": "No se pudo leer el historial local.", corrupt: "El historial local está dañado y no se sobrescribió automáticamente.", "write-failed": "No se pudo guardar el historial local.", "delete-failed": "No se pudo borrar el historial local.", "export-failed": "No se pudo exportar el archivo JSON." } },
};

const FRESHNESS_COPY: Record<Lang, { current: string; stale: string; interval: (days: number) => string }> = {
  ko: { current: "현재 신호", stale: "365일 초과 · 오래된 신호", interval: (days) => `${days}일 간격` },
  en: { current: "Current signal", stale: "Over 365 days · stale signal", interval: (days) => `${days}-day interval` },
  ja: { current: "現在のシグナル", stale: "365日超 · 古いシグナル", interval: (days) => `${days}日間隔` },
  zh: { current: "当前信号", stale: "超过365天 · 旧信号", interval: (days) => `间隔${days}天` },
  fr: { current: "Signal actuel", stale: "Plus de 365 jours · signal ancien", interval: (days) => `Intervalle de ${days} jours` },
  es: { current: "Señal actual", stale: "Más de 365 días · señal antigua", interval: (days) => `Intervalo de ${days} días` },
};

export interface PersonalProfileHistoryDownloadEnvironment {
  createAnchor(): Pick<HTMLAnchorElement, "click" | "download" | "href" | "rel">;
  createObjectUrl(blob: Blob): string;
  revokeObjectUrl(url: string): void;
}

export function browserDownload(
  content: string,
  environment: PersonalProfileHistoryDownloadEnvironment = {
    createAnchor: () => document.createElement("a"),
    createObjectUrl: (blob) => URL.createObjectURL(blob),
    revokeObjectUrl: (url) => URL.revokeObjectURL(url),
  },
) {
  const url = environment.createObjectUrl(new Blob([content], { type: "application/json;charset=utf-8" }));
  try {
    const anchor = environment.createAnchor();
    anchor.href = url;
    anchor.download = "oiyo-personal-profile-history-v1.json";
    anchor.rel = "noopener";
    anchor.click();
  } finally {
    environment.revokeObjectUrl(url);
  }
}

export function PersonalProfileHistoryPreview({ locale }: { locale: Lang }) {
  const t = COPY[locale];
  const freshnessCopy = FRESHNESS_COPY[locale];
  const [result, setResult] = useState<PersonalProfileHistoryResult | null>(null);
  const [observedAt] = useState(() => new Date());

  const sync = useCallback(() => {
    setResult(loadPersonalProfileHistory());
  }, []);

  const capture = useCallback(() => {
    const snapshot = projectPersonalProfileSnapshot(listAssessmentResults());
    setResult(recordPersonalProfileSnapshot(snapshot));
  }, []);

  useEffect(() => {
    sync();
    const onStorage = () => sync();
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [sync]);

  const comparisons = useMemo(() => {
    if (!result?.ok) return [];
    const keys = new Set(result.store.entries.map((entry) => `${entry.assessmentId}\u0000${entry.instrumentVersion}`));
    return [...keys].map((key) => {
      const [assessmentId, instrumentVersion] = key.split("\u0000");
      return comparePersonalProfileHistory(result.store, assessmentId, instrumentVersion, observedAt);
    }).filter((comparison) => comparison.status !== "insufficient-history");
  }, [observedAt, result]);

  if (!result) return null;
  const statusText = result.ux.state === "ready" || result.ux.state === "empty" ? null : t.status[result.ux.state];
  const exportHistory = () => {
    try {
      browserDownload(serializePersonalProfileHistory(result.store));
      if (result.ux.state === "export-failed") setResult(withPersonalProfileHistoryUxState(result, "ready"));
    } catch {
      setResult(withPersonalProfileHistoryUxState(result, "export-failed"));
    }
  };
  const retry = result.ux.state === "export-failed" ? exportHistory : sync;

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="profile-history-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="profile-history-title" className="text-lg font-black text-slate-900">{t.title}</h2>
          <p className="mt-1 text-xs font-semibold text-green-700">{t.local}</p>
        </div>
        {result.ux.canRetry && (
          <button type="button" onClick={retry} className="min-h-11 rounded-xl border border-slate-300 px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">
            {t.retry}
          </button>
        )}
      </div>

      {statusText && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{statusText}</p>}
      {result.store.entries.length === 0 && <p className="mt-4 text-sm text-slate-600">{t.empty}</p>}

      {comparisons.map((comparison) => (
        <article key={`${comparison.assessmentId}:${comparison.instrumentVersion}`} className="mt-4 rounded-xl bg-slate-50 p-3">
          <h3 className="font-black text-slate-800">{comparison.assessmentId}</h3>
          <p className="text-xs text-slate-500">
            {t.compare} · {comparison.instrumentVersion}
            {comparison.newer && comparison.older ? ` · ${freshnessCopy.interval(Math.max(0, Math.round((Date.parse(comparison.newer.measuredAt) - Date.parse(comparison.older.measuredAt)) / 86_400_000)))}` : ""}
          </p>
          {comparison.status === "scoring-version-mismatch" ? (
            <p className="mt-2 text-sm text-amber-800">{t.scoringMismatch}</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {comparison.changes.map((change) => (
                <li key={change.constructId}>
                  <span className="font-bold">{change.constructId}</span>
                  {change.kind === "numeric" ? `: ${String(change.olderValue)} → ${String(change.newerValue)} (${change.numericDelta! >= 0 ? "+" : ""}${change.numericDelta})` : `: ${String(change.olderValue ?? "—")} → ${String(change.newerValue ?? "—")}`}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-xs font-semibold text-slate-600">{t.warning}</p>
        </article>
      ))}

      {result.store.entries.length > 0 && (
        <div className="mt-4 space-y-2">
          {result.store.entries.map((entry) => (
            <div key={entry.historyId} className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs">
              <span>
                <strong>{entry.assessmentId}</strong> · {t.measured} {entry.measuredAt.slice(0, 10)} · {entry.instrumentVersion}
                <span className={`ml-2 inline-flex rounded-full px-2 py-1 font-bold ${personalProfileHistoryFreshness(entry.measuredAt, observedAt).state === "stale" ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-800"}`}>
                  {personalProfileHistoryFreshness(entry.measuredAt, observedAt).state === "stale" ? freshnessCopy.stale : freshnessCopy.current}
                </span>
              </span>
              <button type="button" onClick={() => setResult(deletePersonalProfileHistoryPoint(entry.historyId))} className="min-h-11 rounded-lg px-3 font-bold text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">{t.delete}</button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={capture} className="min-h-11 rounded-xl border border-green-300 px-4 text-sm font-bold text-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">{t.capture}</button>
        {result.ux.canExport && (
          <button type="button" onClick={exportHistory} className="min-h-11 rounded-xl bg-green-700 px-4 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">{t.export}</button>
        )}
        {result.ux.canClear && (
          <button type="button" onClick={() => setResult(clearPersonalProfileHistory())} className="min-h-11 rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700">{t.clear}</button>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-500">{t.captureHint}</p>
    </section>
  );
}
