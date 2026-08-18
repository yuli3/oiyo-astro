"use client";

import { Copy, Download, Image as ImageIcon, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  assembleOntologyExport,
  collectResultPermalinkState,
  ONTOLOGY_EXPORT_PERMALINK_TOOL_ID,
  type OntologyExport,
} from "@/lib/ontology/export";
import {
  captureExportPng,
  collectExportLabelKeys,
  serializeExportCsv,
  serializeExportJson,
  serializeExportMarkdown,
  type ExportLabels,
} from "@/lib/ontology/export-serializers";
import { resolveNodeLabel } from "@/lib/ontology/graph/label";
import { writeResultHash } from "@/lib/result-permalink";
import { gaEvent } from "@/lib/analytics/ga-event";
import { Skeleton } from "@/components/ui/skeleton";

// Track D (Phase 1, step 5, final): export the full ontology profile —
// signals + full test history + every >= MIN_DISPLAY_SCORE recommendation +
// a 2-hop graph snapshot (`assembleOntologyExport()`, `@/lib/ontology/export`)
// — into 5 formats. No shadcn Popover in this repo yet (checked before
// building); a plain inline panel keeps this self-contained rather than
// adding a new UI-kit dependency for one consumer.
type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const LANGS: Lang[] = ["ko", "en", "ja", "zh", "fr", "es"];

type Format = "json" | "csv" | "md";
const FORMATS: Format[] = ["md", "json", "csv"];
const FORMAT_EXT: Record<Format, string> = { json: "json", csv: "csv", md: "md" };
const FORMAT_MIME: Record<Format, string> = { json: "application/json", csv: "text/csv", md: "text/markdown" };

const UI: Record<
  Lang,
  {
    title: string;
    sub: string;
    formats: Record<Format, string>;
    copy: string;
    copied: string;
    download: string;
    share: string;
    shareCopied: string;
    shareUnavailable: string;
    png: string;
    pngBusy: string;
    pngUnavailable: string;
    privacyNote: string;
    localOnly: string;
  }
> = {
  ko: {
    title: "내 존재론 프로필 내보내기",
    sub: "지금까지 모은 신호·테스트 기록·추천·관계 스냅샷을 통째로 저장하세요.",
    formats: { md: "리포트", json: "JSON", csv: "CSV" },
    copy: "복사",
    copied: "복사됨",
    download: "다운로드",
    share: "공유 링크",
    shareCopied: "링크를 복사했어요!",
    shareUnavailable: "공유 링크를 만들기엔 신호가 너무 많아요. 다운로드로 공유해 주세요.",
    png: "카드 이미지 저장",
    pngBusy: "이미지 만드는 중…",
    pngUnavailable: "이미지를 만들지 못했어요. 다시 시도해 주세요.",
    privacyNote: "이 파일/링크에는 생년월일 등 입력한 정보가 포함될 수 있습니다.",
    localOnly: "🔒 이 브라우저에서만 생성 · 서버 전송 없음",
  },
  en: {
    title: "Export my ontology profile",
    sub: "Save every signal, test history, recommendation, and relationship snapshot you've gathered so far.",
    formats: { md: "Report", json: "JSON", csv: "CSV" },
    copy: "Copy",
    copied: "Copied",
    download: "Download",
    share: "Share link",
    shareCopied: "Link copied!",
    shareUnavailable: "Too many signals for a share link — download instead.",
    png: "Save card as image",
    pngBusy: "Generating image…",
    pngUnavailable: "Couldn't generate the image — try again.",
    privacyNote: "This file/link may contain information you entered, such as your birth date.",
    localOnly: "🔒 Generated locally in this browser only — nothing is uploaded",
  },
  ja: {
    title: "存在論プロフィールを書き出す",
    sub: "これまでの信号・テスト履歴・おすすめ・関係スナップショットをまとめて保存します。",
    formats: { md: "レポート", json: "JSON", csv: "CSV" },
    copy: "コピー",
    copied: "コピーしました",
    download: "ダウンロード",
    share: "共有リンク",
    shareCopied: "リンクをコピーしました!",
    shareUnavailable: "信号が多すぎて共有リンクを作れません。ダウンロードしてください。",
    png: "カード画像を保存",
    pngBusy: "画像を作成中…",
    pngUnavailable: "画像を作成できませんでした。もう一度お試しください。",
    privacyNote: "このファイル・リンクには生年月日など入力した情報が含まれる場合があります。",
    localOnly: "🔒 このブラウザ内でのみ生成 · サーバー送信なし",
  },
  zh: {
    title: "导出我的存在论资料",
    sub: "保存到目前为止收集的所有信号、测试记录、推荐与关系快照。",
    formats: { md: "报告", json: "JSON", csv: "CSV" },
    copy: "复制",
    copied: "已复制",
    download: "下载",
    share: "分享链接",
    shareCopied: "链接已复制!",
    shareUnavailable: "信号太多，无法生成分享链接，请改用下载。",
    png: "保存卡片图片",
    pngBusy: "正在生成图片…",
    pngUnavailable: "图片生成失败，请重试。",
    privacyNote: "此文件/链接可能包含您输入的信息，例如出生日期。",
    localOnly: "🔒 仅在此浏览器本地生成 · 不会上传",
  },
  fr: {
    title: "Exporter mon profil ontologique",
    sub: "Enregistrez tous les signaux, l'historique des tests, les recommandations et l'aperçu relationnel accumulés.",
    formats: { md: "Rapport", json: "JSON", csv: "CSV" },
    copy: "Copier",
    copied: "Copié",
    download: "Télécharger",
    share: "Lien de partage",
    shareCopied: "Lien copié !",
    shareUnavailable: "Trop de signaux pour un lien de partage — téléchargez plutôt.",
    png: "Enregistrer la carte en image",
    pngBusy: "Génération de l’image…",
    pngUnavailable: "Impossible de générer l’image — réessayez.",
    privacyNote: "Ce fichier/lien peut contenir les informations saisies, comme votre date de naissance.",
    localOnly: "🔒 Généré localement dans ce navigateur uniquement — rien n’est envoyé",
  },
  es: {
    title: "Exportar mi perfil ontológico",
    sub: "Guarda todas las señales, el historial de tests, las recomendaciones y el resumen de relaciones reunidos hasta ahora.",
    formats: { md: "Informe", json: "JSON", csv: "CSV" },
    copy: "Copiar",
    copied: "Copiado",
    download: "Descargar",
    share: "Enlace para compartir",
    shareCopied: "¡Enlace copiado!",
    shareUnavailable: "Demasiadas señales para un enlace — descarga el archivo en su lugar.",
    png: "Guardar tarjeta como imagen",
    pngBusy: "Generando imagen…",
    pngUnavailable: "No se pudo generar la imagen — inténtalo de nuevo.",
    privacyNote: "Este archivo/enlace puede contener información que ingresaste, como tu fecha de nacimiento.",
    localOnly: "🔒 Generado localmente en este navegador únicamente — nada se envía",
  },
};

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function OntologyExportPopover({ locale }: { locale: string }) {
  const lang = (LANGS.includes(locale as Lang) ? locale : "en") as Lang;
  const t = UI[lang];

  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<OntologyExport | null>(null);
  const [labels, setLabels] = useState<ExportLabels>({});
  const [format, setFormat] = useState<Format>("md");
  const [copied, setCopied] = useState(false);
  const [shareState, setShareState] = useState<"copied" | "idle" | "unavailable">("idle");
  const [pngState, setPngState] = useState<"busy" | "failed" | "idle">("idle");

  // Signals/test-results/recommendations only exist client-side — assemble
  // once after mount, same hydration-guard idiom as RecommendationCards.
  useEffect(() => {
    setData(assembleOntologyExport());
    setHydrated(true);
  }, []);

  // Resolve every i18nKey/title-key the md serializer might render
  // (`collectExportLabelKeys`), same batch-resolve pattern as
  // RecommendationCards/OntologyRelationOrbit.
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    const keys = collectExportLabelKeys(data);
    Promise.all(keys.map(async (key) => [key, await resolveNodeLabel(lang, key)] as const)).then((entries) => {
      if (cancelled) return;
      const next: ExportLabels = {};
      for (const [key, value] of entries) if (value !== undefined) next[key] = value;
      setLabels(next);
    });
    return () => {
      cancelled = true;
    };
  }, [data, lang]);

  const content = useMemo(() => {
    if (!data) return "";
    switch (format) {
      case "json":
        return serializeExportJson(data);
      case "csv":
        return serializeExportCsv(data);
      case "md":
        return serializeExportMarkdown(data, labels);
    }
  }, [data, format, labels]);

  const summaryLine = (key: string) => labels[key] ?? key;

  async function handleCopy() {
    gaEvent("ontology_export", { format });
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function handleDownload() {
    gaEvent("ontology_export", { format });
    const filename = `oiyo-ontology.${FORMAT_EXT[format]}`;
    download(content, filename, FORMAT_MIME[format]);
  }

  // T6/#32 reuse: encode a light subset (signals only — the full export
  // blows past `encodeResult`'s ~1500-char guard) into a `#r=` permalink.
  // `writeResultHash` returns null on the size guard or server-side call —
  // surfaced as a disabled/explained state, never a crash.
  function handleShare() {
    gaEvent("ontology_export", { format: "permalink" });
    const state = collectResultPermalinkState();
    const url = writeResultHash(ONTOLOGY_EXPORT_PERMALINK_TOOL_ID, state);
    if (!url) {
      setShareState("unavailable");
      return;
    }
    if (navigator.share) {
      navigator.share({ title: t.title, url });
      return;
    }
    navigator.clipboard.writeText(url);
    setShareState("copied");
    window.setTimeout(() => setShareState("idle"), 1400);
  }

  async function handleDownloadPng() {
    gaEvent("ontology_export", { format: "png" });
    setPngState("busy");
    const blob = await captureExportPng("ontology-export-summary-card");
    if (!blob) {
      setPngState("failed");
      return;
    }
    setPngState("idle");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "oiyo-ontology-summary.png";
    link.click();
    URL.revokeObjectURL(url);
  }

  // Renders a placeholder instead of null while waiting to hydrate — this
  // section used to render nothing at all here, which on a long page reads
  // as "the export button doesn't exist" rather than "still loading."
  if (!hydrated || !data) {
    return (
      <div
        aria-busy="true"
        className="rounded-[28px] border border-green-100 bg-white p-4 shadow-sm sm:p-5"
      >
        <Skeleton className="h-24 rounded-2xl bg-green-50" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FORMATS.map((f) => (
            <Skeleton key={f} className="h-7 w-16 bg-green-50" />
          ))}
        </div>
        <Skeleton className="mt-3 h-9 w-32 rounded-lg bg-green-100" />
      </div>
    );
  }

  const topRecommendations = [...data.recommendations].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  return (
    <div className="rounded-[28px] border border-green-100 bg-white p-4 shadow-sm sm:p-5">
      {/* PNG capture target — a compact visual summary, deliberately separate
          from the controls/raw-text preview below so the exported image
          isn't cluttered with buttons. */}
      <div id="ontology-export-summary-card" className="mt-3 rounded-2xl border border-green-100 bg-gradient-to-b from-green-50 to-white p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-green-500">OIYO · {data.exportedAt.slice(0, 10)}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.signals.mbti && <span className="rounded-full bg-green-700 px-2.5 py-1 text-[11px] font-black text-white">{data.signals.mbti.type}</span>}
          {data.signals.riasec && <span className="rounded-full bg-green-700 px-2.5 py-1 text-[11px] font-black text-white">{data.signals.riasec.code}</span>}
          {data.signals.enneagram && <span className="rounded-full bg-green-700 px-2.5 py-1 text-[11px] font-black text-white">Ennea {data.signals.enneagram}</span>}
          {data.signals.zodiac && <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-black text-green-800">{data.signals.zodiac}</span>}
          {data.signals.saju && <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-black text-green-800">{data.signals.saju.element}</span>}
          {!data.signals.mbti && !data.signals.riasec && !data.signals.enneagram && !data.signals.zodiac && !data.signals.saju && (
            <span className="text-[11px] text-green-500">—</span>
          )}
        </div>
        {topRecommendations.length > 0 && (
          <ul className="mt-2.5 space-y-1">
            {topRecommendations.map((rec) => (
              <li key={rec.id} className="flex items-center justify-between text-xs text-green-800">
                <span className="truncate">{summaryLine(rec.title)}</span>
                <span className="ml-2 shrink-0 font-black text-green-600">{rec.matchScore}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Format picker + actions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {FORMATS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
              format === f ? "bg-green-700 text-white" : "border border-green-200 text-green-800 hover:bg-green-50"
            }`}
          >
            {t.formats[f]}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-green-400">{t.localOnly}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-xs font-bold text-green-800 hover:bg-green-50">
          <Copy className="h-3.5 w-3.5" /> {copied ? t.copied : t.copy}
        </button>
        <button type="button" onClick={handleDownload} className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white hover:bg-green-800">
          <Download className="h-3.5 w-3.5" /> {t.download}
        </button>
        <button type="button" onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-xs font-bold text-green-800 hover:bg-green-50">
          <Share2 className="h-3.5 w-3.5" /> {shareState === "copied" ? t.shareCopied : t.share}
        </button>
        <button type="button" onClick={handleDownloadPng} disabled={pngState === "busy"} className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-xs font-bold text-green-800 hover:bg-green-50 disabled:opacity-50">
          <ImageIcon className="h-3.5 w-3.5" /> {pngState === "busy" ? t.pngBusy : t.png}
        </button>
      </div>

      {shareState === "unavailable" && <p className="mt-2 text-xs text-amber-600">{t.shareUnavailable}</p>}
      {pngState === "failed" && <p className="mt-2 text-xs text-amber-600">{t.pngUnavailable}</p>}
      <p className="mt-2 text-xs text-amber-600">{t.privacyNote}</p>

      <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">{content}</pre>
    </div>
  );
}
