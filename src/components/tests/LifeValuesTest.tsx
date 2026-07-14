import { useRef, useState } from "react";

import {
  LIFE_VALUE_IDS,
  LIFE_VALUES_INSTRUMENT,
  buildLifeValuesResult,
  lifeValueCardCopy,
} from "@/assessments";
import { gaEvent } from "@/lib/analytics/ga-event";
import { recordAssessmentResult } from "@/assessments";
import { recordTestResult } from "@/lib/user/test-results";

type Locale = "ko" | "en" | "ja" | "zh" | "fr" | "es";
type ValueId = (typeof LIFE_VALUE_IDS)[number];
type Bucket = "important" | "maybe" | "not-now";

const LOCALES: Locale[] = ["ko", "en", "ja", "zh", "fr", "es"];

const COPY: Record<Locale, {
  title: string; subtitle: string; intro: string; start: string; sortTitle: string; sortHelp: string;
  bucket: Record<Bucket, string>; assigned: string; needFive: string; continue: string; topTitle: string;
  topHelp: string; selected: string; add: string; remove: string; up: string; down: string; finish: string;
  result: string; current: string; lifePrompt: string; workPrompt: string; actionPrompt: string; action: string;
  restart: string; share: string; copied: string; disclaimer: string; private: string;
}> = {
  ko: { title: "삶·일 가치관 카드 정렬", subtitle: "지금 나에게 중요한 방향을 직접 고릅니다", intro: "18장의 카드를 세 묶음으로 나눈 뒤, 가장 중요한 다섯 가지를 직접 선택하고 순서를 정합니다. 정답이나 좋은 가치의 순위는 없습니다.", start: "카드 정렬 시작", sortTitle: "각 카드를 지금의 나와 비교해 보세요", sortHelp: "‘중요함’은 5~9장으로 골라 주세요. 상황이 달라지면 선택도 달라질 수 있습니다.", bucket: { important: "중요함", maybe: "고민됨", "not-now": "지금은 아님" }, assigned: "분류", needFive: "중요함 카드를 5~9장 선택하고 모든 카드를 분류해 주세요.", continue: "Top 5 고르기", topTitle: "가장 중요한 다섯 가지를 고르세요", topHelp: "후보 중 다섯 장을 선택한 뒤 위·아래 버튼으로 직접 순서를 정하세요.", selected: "선택", add: "Top 5에 추가", remove: "선택 해제", up: "위로", down: "아래로", finish: "내 가치 나침반 보기", result: "지금 선택한 가치 나침반", current: "이것은 고정 성격이 아니라 현재의 우선순위입니다.", lifePrompt: "삶에서 이 가치가 살아 있었던 순간은 언제였나요?", workPrompt: "일이나 배움에서 이 가치를 더 존중하려면 무엇이 달라져야 하나요?", actionPrompt: "이번 주 작은 행동", action: "가장 중요한 가치와 맞는 10분짜리 행동 하나를 정해 일정에 넣어 보세요.", restart: "다시 정렬", share: "Top 5 공유", copied: "복사됨", disclaimer: "OIYO가 만든 자기성찰 활동이며 심리검사·진단·직업 적합도·검증된 가치 척도가 아닙니다.", private: "전체 분류는 분석 서버로 전송하지 않으며, 저장 결과도 선택한 Top 5 중심입니다." },
  en: { title: "Life & Work Values Card Sort", subtitle: "Choose the directions that matter to you now", intro: "Sort 18 cards into three groups, then choose and order your top five. There is no correct result or hierarchy of good values.", start: "Start card sort", sortTitle: "Compare each card with what matters now", sortHelp: "Place 5–9 cards in Important. Your choices may change with context.", bucket: { important: "Important", maybe: "Unsure", "not-now": "Not now" }, assigned: "Sorted", needFive: "Sort every card and place 5–9 in Important.", continue: "Choose Top 5", topTitle: "Choose your five priorities", topHelp: "Select five candidates, then use the up and down buttons to order them.", selected: "Selected", add: "Add to Top 5", remove: "Remove", up: "Move up", down: "Move down", finish: "See my value compass", result: "Values I chose today", current: "These are current priorities, not fixed personality traits.", lifePrompt: "When has this value felt alive in your life?", workPrompt: "What would honoring it more in work or learning change?", actionPrompt: "One small action this week", action: "Schedule one ten-minute action that supports your first value.", restart: "Sort again", share: "Share Top 5", copied: "Copied", disclaimer: "An OIYO-authored reflection activity—not a psychological test, diagnosis, career-fit judgment, or validated values scale.", private: "The full sort is not sent to analytics; any saved result focuses on your chosen Top 5." },
  ja: { title: "人生・仕事の価値観カードソート", subtitle: "今の自分に大切な方向を選びます", intro: "18枚を三つに分け、最も大切な五つを選んで順番を決めます。正解や良い価値の序列はありません。", start: "カードソートを始める", sortTitle: "今の自分に照らして分類してください", sortHelp: "「大切」は5〜9枚。状況が変われば選択も変わります。", bucket: { important: "大切", maybe: "迷う", "not-now": "今は違う" }, assigned: "分類", needFive: "全カードを分類し、「大切」を5〜9枚選んでください。", continue: "Top 5を選ぶ", topTitle: "最も大切な五つを選ぶ", topHelp: "五枚を選び、上下ボタンで順番を決めます。", selected: "選択", add: "Top 5に追加", remove: "解除", up: "上へ", down: "下へ", finish: "価値観を見る", result: "今選んだ価値観", current: "固定した性格ではなく、現在の優先順位です。", lifePrompt: "この価値が生きていたのはいつですか？", workPrompt: "仕事や学びで尊重するには何を変えますか？", actionPrompt: "今週の小さな行動", action: "一番の価値に沿う10分の行動を予定に入れましょう。", restart: "もう一度", share: "Top 5を共有", copied: "コピー済み", disclaimer: "OIYO独自の自己省察活動で、心理検査・診断・職業適合・検証済み尺度ではありません。", private: "全分類は分析サーバーに送信されず、保存結果も選択したTop 5が中心です。" },
  zh: { title: "生活与工作价值观卡片排序", subtitle: "选择此刻对你重要的方向", intro: "把18张卡分成三组，再选出最重要的五项并排序。这里没有标准答案，也没有更高级的价值。", start: "开始卡片排序", sortTitle: "根据现在的自己分类", sortHelp: "请把5至9张放入“重要”。情境改变时选择也可能改变。", bucket: { important: "重要", maybe: "犹豫", "not-now": "现在不重要" }, assigned: "已分类", needFive: "请完成所有分类，并选择5至9张重要卡片。", continue: "选择前五项", topTitle: "选择最重要的五项", topHelp: "选出五张，再用上下按钮亲自排序。", selected: "已选择", add: "加入前五", remove: "取消", up: "上移", down: "下移", finish: "查看价值指南针", result: "我现在选择的价值", current: "这是当前优先顺序，不是固定人格。", lifePrompt: "这个价值曾在生活中的何时真正出现？", workPrompt: "在工作或学习中更尊重它，需要改变什么？", actionPrompt: "本周一个小行动", action: "为第一价值安排一个十分钟的小行动。", restart: "重新排序", share: "分享前五项", copied: "已复制", disclaimer: "这是OIYO原创的自我反思活动，不是心理测验、诊断、职业匹配或已验证量表。", private: "完整分类不会发送到分析服务器；保存结果也以所选前五项为主。" },
  fr: { title: "Tri de cartes des valeurs de vie et de travail", subtitle: "Choisissez les directions importantes aujourd’hui", intro: "Classez 18 cartes en trois groupes, puis choisissez et ordonnez vos cinq priorités. Il n’existe ni bonne réponse ni hiérarchie des bonnes valeurs.", start: "Commencer", sortTitle: "Classez chaque carte selon votre situation actuelle", sortHelp: "Placez 5 à 9 cartes dans Important. Le contexte peut changer vos choix.", bucket: { important: "Important", maybe: "J’hésite", "not-now": "Pas maintenant" }, assigned: "Classées", needFive: "Classez toutes les cartes et placez-en 5 à 9 dans Important.", continue: "Choisir le Top 5", topTitle: "Choisissez vos cinq priorités", topHelp: "Sélectionnez cinq cartes puis ordonnez-les avec les boutons.", selected: "Sélection", add: "Ajouter au Top 5", remove: "Retirer", up: "Monter", down: "Descendre", finish: "Voir ma boussole", result: "Valeurs choisies aujourd’hui", current: "Ce sont des priorités actuelles, pas des traits fixes.", lifePrompt: "Quand cette valeur a-t-elle été vivante dans votre vie ?", workPrompt: "Que faudrait-il changer pour mieux la respecter au travail ou en apprentissage ?", actionPrompt: "Une petite action cette semaine", action: "Planifiez une action de dix minutes au service de votre première valeur.", restart: "Recommencer", share: "Partager le Top 5", copied: "Copié", disclaimer: "Activité de réflexion originale OIYO, ni test psychologique, ni diagnostic, ni jugement d’orientation, ni échelle validée.", private: "Le tri complet n’est pas envoyé à l’analyse ; le résultat enregistré se concentre sur le Top 5 choisi." },
  es: { title: "Clasificación de tarjetas de valores de vida y trabajo", subtitle: "Elige las direcciones importantes para ti ahora", intro: "Clasifica 18 tarjetas en tres grupos y después elige y ordena tus cinco prioridades. No hay una respuesta correcta ni valores superiores.", start: "Comenzar", sortTitle: "Clasifica cada tarjeta según tu momento actual", sortHelp: "Coloca entre 5 y 9 en Importante. El contexto puede cambiar tus elecciones.", bucket: { important: "Importante", maybe: "Tengo dudas", "not-now": "Ahora no" }, assigned: "Clasificadas", needFive: "Clasifica todas y coloca entre 5 y 9 en Importante.", continue: "Elegir Top 5", topTitle: "Elige tus cinco prioridades", topHelp: "Selecciona cinco y ordénalas con los botones.", selected: "Selección", add: "Añadir al Top 5", remove: "Quitar", up: "Subir", down: "Bajar", finish: "Ver mi brújula", result: "Valores que elegí hoy", current: "Son prioridades actuales, no rasgos fijos.", lifePrompt: "¿Cuándo estuvo vivo este valor en tu vida?", workPrompt: "¿Qué cambiaría al respetarlo más en el trabajo o aprendizaje?", actionPrompt: "Una pequeña acción esta semana", action: "Programa una acción de diez minutos que apoye tu primer valor.", restart: "Clasificar de nuevo", share: "Compartir Top 5", copied: "Copiado", disclaimer: "Actividad de reflexión original de OIYO; no es test psicológico, diagnóstico, ajuste profesional ni escala validada.", private: "La clasificación completa no se envía a analítica; el resultado guardado se centra en el Top 5 elegido." },
};

const EXTRA_COPY: Record<Locale, { editCandidates: string; shareFailed: string }> = {
  ko: { editCandidates: "후보 분류 수정", shareFailed: "공유하지 못했습니다. 다시 시도해 주세요." },
  en: { editCandidates: "Edit candidate sort", shareFailed: "Could not share. Please try again." },
  ja: { editCandidates: "候補の分類を修正", shareFailed: "共有できませんでした。もう一度お試しください。" },
  zh: { editCandidates: "修改候选分类", shareFailed: "无法分享，请重试。" },
  fr: { editCandidates: "Modifier le tri des candidates", shareFailed: "Partage impossible. Veuillez réessayer." },
  es: { editCandidates: "Editar clasificación de candidatas", shareFailed: "No se pudo compartir. Inténtalo de nuevo." },
};

function localizedLocale(value?: string): Locale {
  const normalized = value?.toLowerCase() ?? "en";
  return (LOCALES.includes(normalized as Locale) ? normalized : "en") as Locale;
}

export default function LifeValuesTest({ locale: localeProp }: { locale?: string }) {
  const locale = localizedLocale(localeProp);
  const t = COPY[locale];
  const started = useRef(false);
  const [stage, setStage] = useState<"intro" | "sort" | "rank" | "result">("intro");
  const [buckets, setBuckets] = useState<Partial<Record<ValueId, Bucket>>>({});
  const [ranked, setRanked] = useState<ValueId[]>([]);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [shareError, setShareError] = useState(false);

  const important = LIFE_VALUE_IDS.filter((id) => buckets[id] === "important");
  const assignedCount = Object.keys(buckets).length;
  const sortReady = assignedCount === LIFE_VALUE_IDS.length && important.length >= 5 && important.length <= 9;

  function start() {
    if (!started.current) {
      gaEvent("test_started", { test_id: "life-values-card-sort", instrument_version: LIFE_VALUES_INSTRUMENT.version });
      started.current = true;
    }
    setStage("sort");
  }

  function assign(id: ValueId, bucket: Bucket) {
    if (bucket === "important" && buckets[id] !== "important" && important.length >= 9) return;
    setBuckets((current) => ({ ...current, [id]: bucket }));
    setRanked((current) => current.filter((value) => value !== id));
  }

  function beginRanking() {
    if (!sortReady) return;
    setRanked(important.length === 5 ? [...important] : []);
    setStage("rank");
  }

  function toggleTop(id: ValueId) {
    setRanked((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : current.length < 5 ? [...current, id] : current);
  }

  function move(id: ValueId, delta: -1 | 1) {
    const from = ranked.indexOf(id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= ranked.length) return;
    setRanked((current) => {
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setAnnouncement(`${lifeValueCardCopy(id, locale)[0]}: ${to + 1}`);
  }

  function finish() {
    if (ranked.length !== 5) return;
    const responses = Object.fromEntries(LIFE_VALUE_IDS.map((id) => {
      const index = ranked.indexOf(id);
      return [id, index < 0 ? 0 : index + 1];
    }));
    const result = buildLifeValuesResult(responses, {
      locale,
      sourcePath: `/${locale}/life-values-test`,
    });
    recordAssessmentResult(result);
    recordTestResult({
      kind: "preference",
      locale,
      result: { topValues: ranked },
      resultLabel: ranked.map((id) => lifeValueCardCopy(id, locale)[0]).join(" · "),
      sourcePath: `/${locale}/life-values-test`,
      testId: "life-values-card-sort",
      title: t.title,
    });
    gaEvent("test_completed", { test_id: "life-values-card-sort", instrument_version: LIFE_VALUES_INSTRUMENT.version });
    setStage("result");
  }

  function restart() {
    setBuckets({});
    setRanked([]);
    setStage("intro");
    started.current = false;
  }

  async function share() {
    const text = ranked.map((id, index) => `${index + 1}. ${lifeValueCardCopy(id, locale)[0]}`).join(" · ");
    setShareError(false);
    try {
      if (navigator.share) await navigator.share({ title: t.title, text, url: window.location.href });
      else {
        await navigator.clipboard.writeText(`${t.title}: ${text} ${window.location.href}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
      gaEvent("share_click", { test_id: "life-values-card-sort" });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setShareError(true);
    }
  }

  if (stage === "intro") return <section className="space-y-5 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
    <div className="text-center"><p className="text-sm font-semibold text-emerald-700">VALUE CARDS</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{t.title}</h1><p className="mt-2 text-slate-600">{t.subtitle}</p></div>
    <p className="rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">{t.intro}</p>
    <p className="text-sm leading-6 text-slate-500">{t.disclaimer}</p><p className="text-xs leading-5 text-slate-500">{t.private}</p>
    <button type="button" onClick={start} className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">{t.start}</button>
  </section>;

  if (stage === "sort") return <section className="space-y-6">
    <header><h1 className="text-2xl font-bold text-slate-950">{t.sortTitle}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{t.sortHelp}</p><p className="mt-2 text-sm font-semibold text-emerald-800">{t.assigned}: {assignedCount}/{LIFE_VALUE_IDS.length} · {t.bucket.important}: {important.length}/5–9</p></header>
    <div className="grid gap-4 md:grid-cols-2">{LIFE_VALUE_IDS.map((id) => {
      const selected = buckets[id];
      const card = lifeValueCardCopy(id, locale);
      return <article key={id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="font-bold text-slate-950">{card[0]}</h2><p className="mt-1 min-h-10 text-sm leading-5 text-slate-600">{card[1]}</p><div className="mt-4 grid grid-cols-3 gap-2">{(["important", "maybe", "not-now"] as Bucket[]).map((bucket) => <button type="button" key={bucket} aria-label={`${card[0]}: ${t.bucket[bucket]}`} aria-pressed={selected === bucket} disabled={bucket === "important" && selected !== "important" && important.length >= 9} onClick={() => assign(id, bucket)} className={`min-h-11 rounded-lg border px-2 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 ${selected === bucket ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"}`}>{t.bucket[bucket]}</button>)}</div></article>;
    })}</div>
    {!sortReady && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{t.needFive}</p>}
    <button type="button" disabled={!sortReady} onClick={beginRanking} className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{t.continue}</button>
  </section>;

  if (stage === "rank") return <section className="space-y-6">
    <header><h1 className="text-2xl font-bold text-slate-950">{t.topTitle}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{t.topHelp}</p><p className="mt-2 font-semibold text-emerald-800">{t.selected}: {ranked.length}/5</p></header>
    <div className="grid gap-3 md:grid-cols-2">{important.map((id) => { const card = lifeValueCardCopy(id, locale); return <button type="button" key={id} aria-pressed={ranked.includes(id)} onClick={() => toggleTop(id)} className={`rounded-xl border p-4 text-left ${ranked.includes(id) ? "border-emerald-700 bg-emerald-50" : "border-slate-200 bg-white"}`}><span className="font-bold text-slate-950">{card[0]}</span><span className="mt-1 block text-sm text-slate-600">{card[1]}</span><span className="mt-2 block text-xs font-semibold text-emerald-800">{ranked.includes(id) ? t.remove : t.add}</span></button>; })}</div>
    {ranked.length === 5 && <ol className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">{ranked.map((id, index) => { const title = lifeValueCardCopy(id, locale)[0]; return <li key={id} className="flex items-center gap-3 rounded-xl bg-white p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 font-bold text-white">{index + 1}</span><span className="flex-1 font-semibold text-slate-900">{title}</span><button type="button" disabled={index === 0} onClick={() => move(id, -1)} aria-label={`${title} ${t.up}`} className="rounded border px-2 py-1 text-sm disabled:opacity-30">↑</button><button type="button" disabled={index === ranked.length - 1} onClick={() => move(id, 1)} aria-label={`${title} ${t.down}`} className="rounded border px-2 py-1 text-sm disabled:opacity-30">↓</button></li>; })}</ol>}
    <p aria-live="polite" className="sr-only">{announcement}</p>
    <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setStage("sort")} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">{EXTRA_COPY[locale].editCandidates}</button><button type="button" disabled={ranked.length !== 5} onClick={finish} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-40">{t.finish}</button></div>
  </section>;

  return <section className="space-y-6"><header className="text-center"><p className="text-sm font-semibold text-emerald-700">{t.result}</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{t.title}</h1><p className="mt-2 text-sm text-slate-600">{t.current}</p></header>
    <ol className="space-y-4">{ranked.map((id, index) => { const card = lifeValueCardCopy(id, locale); return <li key={id} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 font-bold text-white">{index + 1}</span><div><h2 className="font-bold text-slate-950">{card[0]}</h2><p className="text-sm text-slate-600">{card[1]}</p></div></div>{index < 3 && <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2"><p className="rounded-lg bg-slate-50 p-3">{t.lifePrompt}</p><p className="rounded-lg bg-slate-50 p-3">{t.workPrompt}</p></div>}</li>; })}</ol>
    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5"><h2 className="font-bold text-violet-950">{t.actionPrompt}</h2><p className="mt-2 text-sm leading-6 text-violet-900">{t.action}</p></div>
    <p className="text-sm leading-6 text-slate-500">{t.disclaimer}</p>{shareError && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{EXTRA_COPY[locale].shareFailed}</p>}<div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={restart} className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700">{t.restart}</button><button type="button" onClick={share} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">{copied ? t.copied : t.share}</button></div>
  </section>;
}
