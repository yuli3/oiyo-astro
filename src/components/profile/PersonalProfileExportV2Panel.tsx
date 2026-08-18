"use client";

import { Copy, Download, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  buildPersonalProfileExportV2,
  deliverPersonalProfileExport,
  listAssessmentResults,
  projectPersonalProfileSnapshot,
  type PersonalProfileDeliveryAdapter,
  type PersonalProfileExportFormat,
  type PersonalProfileExportV2,
  type PersonalProfileObsidianFile,
} from "@/assessments";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, {
  title: string; description: string; boundary: string; copy: string; save: string;
  empty: string; ready: (count: number) => string; outcomes: Record<string, string>; failed: string;
}> = {
  ko: { title: "검사 근거 내보내기 v2", description: "완료한 검사에서 파생된 현재 시점의 근거만 JSON·Markdown·Obsidian으로 저장합니다.", boundary: "직접 작성한 메모와 원문 응답은 포함하지 않으며 서버로 보내지 않습니다.", copy: "복사", save: "저장", empty: "완료된 검사 근거가 없어 빈 근거 상태로 내보냅니다.", ready: (n) => `${n}개 근거 좌표 준비됨`, outcomes: { downloaded: "파일을 저장했습니다.", copied: "내용을 복사했습니다.", "saved-files": "Obsidian 폴더를 저장했습니다.", "copied-index": "폴더 저장을 지원하지 않아 Obsidian 인덱스를 복사했습니다." }, failed: "저장하거나 복사하지 못했습니다. 브라우저 권한을 확인해 주세요." },
  en: { title: "Assessment evidence export v2", description: "Save point-in-time evidence derived from completed assessments as JSON, Markdown, or an Obsidian bundle.", boundary: "User-authored notes and raw responses are excluded. Nothing is sent to a server.", copy: "Copy", save: "Save", empty: "No completed assessment evidence is available; the export will record an empty evidence state.", ready: (n) => `${n} evidence coordinates ready`, outcomes: { downloaded: "File saved.", copied: "Content copied.", "saved-files": "Obsidian folder saved.", "copied-index": "Folder saving is unavailable, so the Obsidian index was copied." }, failed: "Unable to save or copy. Check browser permissions." },
  ja: { title: "検査エビデンスの書き出し v2", description: "完了した検査から導いた現時点のエビデンスを JSON・Markdown・Obsidian で保存します。", boundary: "自分で書いたメモと生の回答は含めず、サーバーにも送信しません。", copy: "コピー", save: "保存", empty: "完了した検査エビデンスがないため、空の状態として書き出します。", ready: (n) => `${n}件のエビデンス座標`, outcomes: { downloaded: "ファイルを保存しました。", copied: "内容をコピーしました。", "saved-files": "Obsidianフォルダを保存しました。", "copied-index": "フォルダ保存が使えないため、Obsidianインデックスをコピーしました。" }, failed: "保存またはコピーできませんでした。ブラウザの権限を確認してください。" },
  zh: { title: "测验证据导出 v2", description: "将已完成测验推导出的当前证据保存为 JSON、Markdown 或 Obsidian。", boundary: "不包含自行填写的笔记和原始回答，也不会发送到服务器。", copy: "复制", save: "保存", empty: "暂无已完成的测验证据，将导出空证据状态。", ready: (n) => `已准备 ${n} 个证据坐标`, outcomes: { downloaded: "文件已保存。", copied: "内容已复制。", "saved-files": "Obsidian 文件夹已保存。", "copied-index": "浏览器不支持文件夹保存，已复制 Obsidian 索引。" }, failed: "无法保存或复制，请检查浏览器权限。" },
  fr: { title: "Export des preuves d’évaluation v2", description: "Enregistrez les preuves ponctuelles dérivées des évaluations terminées en JSON, Markdown ou Obsidian.", boundary: "Les notes personnelles et réponses brutes sont exclues. Rien n’est envoyé au serveur.", copy: "Copier", save: "Enregistrer", empty: "Aucune preuve d’évaluation terminée : l’export indiquera un état vide.", ready: (n) => `${n} coordonnées de preuve prêtes`, outcomes: { downloaded: "Fichier enregistré.", copied: "Contenu copié.", "saved-files": "Dossier Obsidian enregistré.", "copied-index": "L’enregistrement de dossier est indisponible ; l’index Obsidian a été copié." }, failed: "Impossible d’enregistrer ou copier. Vérifiez les autorisations du navigateur." },
  es: { title: "Exportación de evidencia v2", description: "Guarda evidencia puntual derivada de evaluaciones completadas como JSON, Markdown u Obsidian.", boundary: "Se excluyen las notas propias y respuestas sin procesar. Nada se envía al servidor.", copy: "Copiar", save: "Guardar", empty: "No hay evidencia de evaluaciones completadas; la exportación registrará un estado vacío.", ready: (n) => `${n} coordenadas de evidencia listas`, outcomes: { downloaded: "Archivo guardado.", copied: "Contenido copiado.", "saved-files": "Carpeta de Obsidian guardada.", "copied-index": "No se puede guardar la carpeta; se copió el índice de Obsidian." }, failed: "No se pudo guardar ni copiar. Revisa los permisos del navegador." },
};

interface WritableFileHandle { createWritable(): Promise<{ write(content: string): Promise<void>; close(): Promise<void> }> }
interface WritableDirectoryHandle {
  getDirectoryHandle(name: string, options: { create: true }): Promise<WritableDirectoryHandle>;
  getFileHandle(name: string, options: { create: true }): Promise<WritableFileHandle>;
}

async function saveObsidianFiles(root: string, files: readonly PersonalProfileObsidianFile[]): Promise<boolean> {
  const picker = (window as typeof window & { showDirectoryPicker?: () => Promise<WritableDirectoryHandle> }).showDirectoryPicker;
  if (!picker) return false;
  const selected = await picker.call(window);
  const rootHandle = await selected.getDirectoryHandle(root, { create: true });
  for (const file of files) {
    const parts = file.path.split("/");
    let directory = rootHandle;
    for (const part of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(part, { create: true });
    const handle = await directory.getFileHandle(parts.at(-1)!, { create: true });
    const writable = await handle.createWritable();
    await writable.write(file.content);
    await writable.close();
  }
  return true;
}

function browserAdapter(includeDownload: boolean): PersonalProfileDeliveryAdapter {
  return {
    copyText: (text) => navigator.clipboard.writeText(text).then(() => true),
    ...(includeDownload ? {
      createObjectUrl: (blob: Blob) => URL.createObjectURL(blob),
      download: (url: string, filename: string) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.rel = "noopener";
        link.click();
        return true;
      },
      revokeObjectUrl: (url: string) => URL.revokeObjectURL(url),
      saveFiles: saveObsidianFiles,
    } : {}),
  };
}

const FORMATS: PersonalProfileExportFormat[] = ["json", "markdown", "obsidian"];

export default function PersonalProfileExportV2Panel({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const t = COPY[lang];
  const [data, setData] = useState<PersonalProfileExportV2 | null>(null);
  const [format, setFormat] = useState<PersonalProfileExportFormat>("json");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setData(buildPersonalProfileExportV2(projectPersonalProfileSnapshot(listAssessmentResults())));
  }, []);

  const evidenceCount = useMemo(() => data?.sections.assessmentDerived.lanes.reduce((sum, lane) => sum + lane.projections.length, 0) ?? 0, [data]);

  async function deliver(download: boolean) {
    if (!data) return;
    setMessage("");
    try {
      const result = await deliverPersonalProfileExport(format, data, browserAdapter(download));
      setMessage(t.outcomes[result.outcome] ?? result.outcome);
    } catch {
      setMessage(t.failed);
    }
  }

  return (
    <section className="mx-auto mt-8 max-w-6xl rounded-2xl border border-green-200 bg-green-50/40 p-4 sm:p-6" aria-labelledby="profile-export-v2-title">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-green-700" aria-hidden="true" />
        <div>
          <h2 id="profile-export-v2-title" className="text-xl font-black text-slate-950">{t.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{t.description}</p>
          <p className="mt-1 text-xs leading-5 text-green-800">{t.boundary}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-800" aria-live="polite">{evidenceCount ? t.ready(evidenceCount) : t.empty}</p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label={t.title}>
        {FORMATS.map((item) => (
          <button key={item} type="button" onClick={() => setFormat(item)} aria-pressed={format === item}
            className={`min-h-11 rounded-lg px-3 py-2 text-sm font-bold ${format === item ? "bg-green-700 text-white" : "border border-green-200 bg-white text-green-800"}`}>
            {item === "obsidian" ? "Obsidian" : item.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => deliver(false)} disabled={!data} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-bold text-green-800 disabled:opacity-50"><Copy className="h-4 w-4" aria-hidden="true" />{t.copy}</button>
        <button type="button" onClick={() => deliver(true)} disabled={!data} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Download className="h-4 w-4" aria-hidden="true" />{t.save}</button>
      </div>
      {message && <p className="mt-3 text-sm font-semibold text-slate-700" role="status">{message}</p>}
    </section>
  );
}
