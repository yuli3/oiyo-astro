import { BookOpen, BriefcaseBusiness, Compass, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import {
  READ_ONLY_PILOT_SEEDS,
  browserJsonFetcher,
  OntologyPlatformArtifactLoader,
  type OntologyPlatformLocale,
  type ReadOnlyPilotRelation,
  type ReadOnlyPilotView,
} from "../../lib/ontology/platform/read-only-pilot";

const COPY: Record<OntologyPlatformLocale, {
  title: string; note: string; choose: string; actions: string; contexts: string;
  curated: string; derived: string; examples: string; exampleEvidence: string; source: string; noExamples: string; noContext: string; exploratory: string; loading: string; unavailable: string;
}> = {
  ko: { title: "관계 데이터 읽기 전용 미리보기", note: "개인 점수·저장·직업 추천 없이, 정규화된 관계와 근거 수준만 살펴봅니다.", choose: "예시 취미 선택", actions: "연결된 행동", contexts: "살펴볼 업무환경", curated: "편집 검토", derived: "탐색용 낮은 신뢰", examples: "직업 예시", exampleEvidence: "원천 카탈로그의 예시", source: "원천", noExamples: "표시할 직업 예시가 아직 없습니다.", noContext: "표시할 업무환경 관계가 아직 없습니다.", exploratory: "직업 예시는 업무환경을 이해하기 위한 원천 카탈로그 예시일 뿐입니다. 적합성·채용·소득 또는 개인 결론을 제시하지 않습니다.", loading: "관계 데이터를 불러오는 중입니다.", unavailable: "관계 데이터를 지금 표시할 수 없습니다." },
  en: { title: "Read-only relationship preview", note: "It shows normalized relationships and their evidence level—without a personal score, saving, or career recommendation.", choose: "Choose an example hobby", actions: "Connected actions", contexts: "Work contexts to explore", curated: "Editorially reviewed", derived: "Exploratory, lower confidence", examples: "Occupation examples", exampleEvidence: "Example from the source catalog", source: "Source", noExamples: "No occupation example is available yet.", noContext: "No work-context relationship is available yet.", exploratory: "This is for exploration only. It does not make a career-fit or personal conclusion. Occupation examples only illustrate a work context from the source catalog; they do not determine hiring or income.", loading: "Loading relationship data.", unavailable: "Relationship data is unavailable right now." },
  ja: { title: "関係データの読み取り専用プレビュー", note: "個人スコア・保存・職業推薦なしで、正規化された関係と根拠水準だけを確認します。", choose: "例の趣味を選択", actions: "つながる行動", contexts: "探索する仕事環境", curated: "編集レビュー済み", derived: "探索用・低い確信度", examples: "職業の例", exampleEvidence: "出典カタログの例", source: "出典", noExamples: "表示できる職業の例はまだありません。", noContext: "表示できる仕事環境の関係はまだありません。", exploratory: "職業の例は出典カタログにある仕事環境の説明用です。適性・採用・収入や個人への結論を示しません。", loading: "関係データを読み込んでいます。", unavailable: "現在、関係データを表示できません。" },
  zh: { title: "只读关系数据预览", note: "不提供个人评分、保存或职业推荐，只展示规范化关系及其证据等级。", choose: "选择示例爱好", actions: "关联行为", contexts: "可探索的工作环境", curated: "编辑审核", derived: "探索用途，较低置信度", examples: "职业示例", exampleEvidence: "来源目录中的示例", source: "来源", noExamples: "暂时没有可显示的职业示例。", noContext: "暂时没有可显示的工作环境关系。", exploratory: "职业示例仅用于说明来源目录中的工作环境，不判断匹配度、招聘、收入或个人结论。", loading: "正在加载关系数据。", unavailable: "暂时无法显示关系数据。" },
  fr: { title: "Aperçu en lecture seule des relations", note: "Il présente les relations normalisées et leur niveau de preuve, sans score personnel, sauvegarde ni recommandation de carrière.", choose: "Choisir un loisir exemple", actions: "Actions associées", contexts: "Contextes de travail à explorer", curated: "Revu par l’équipe éditoriale", derived: "Exploratoire, confiance plus faible", examples: "Exemples de métiers", exampleEvidence: "Exemple du catalogue source", source: "Source", noExamples: "Aucun exemple de métier n’est encore disponible.", noContext: "Aucune relation de contexte de travail n’est encore disponible.", exploratory: "Les exemples de métiers illustrent seulement un contexte de travail du catalogue source. Ils ne déterminent ni adéquation, ni embauche, ni revenu, ni conclusion personnelle.", loading: "Chargement des données de relations.", unavailable: "Les données de relations sont indisponibles pour le moment." },
  es: { title: "Vista previa de relaciones de solo lectura", note: "Muestra relaciones normalizadas y su nivel de evidencia, sin puntuación personal, guardado ni recomendación profesional.", choose: "Elige un hobby de ejemplo", actions: "Acciones conectadas", contexts: "Contextos de trabajo para explorar", curated: "Revisado editorialmente", derived: "Exploratorio, menor confianza", examples: "Ejemplos de ocupaciones", exampleEvidence: "Ejemplo del catálogo fuente", source: "Fuente", noExamples: "Aún no hay un ejemplo de ocupación disponible.", noContext: "Aún no hay una relación de contexto laboral para mostrar.", exploratory: "Los ejemplos de ocupaciones solo ilustran un contexto laboral del catálogo fuente. No determinan ajuste, contratación, ingresos ni una conclusión personal.", loading: "Cargando datos de relaciones.", unavailable: "Los datos de relaciones no están disponibles ahora." },
};

export function OntologyPlatformReadOnlyPilot({ locale }: { locale: OntologyPlatformLocale }) {
  const [seedId, setSeedId] = useState<typeof READ_ONLY_PILOT_SEEDS[number]>(READ_ONLY_PILOT_SEEDS[0]);
  const [views, setViews] = useState<Partial<Record<typeof READ_ONLY_PILOT_SEEDS[number], ReadOnlyPilotView>>>({});
  const [failed, setFailed] = useState(false);
  const text = COPY[locale];
  const loader = useMemo(() => new OntologyPlatformArtifactLoader(browserJsonFetcher), []);
  useEffect(() => {
    let active = true;
    setViews({}); setFailed(false);
    Promise.all(READ_ONLY_PILOT_SEEDS.map(async (id) => [id, await loader.readOnlyPilotView(locale, id)] as const))
      .then((entries) => { if (active) setViews(Object.fromEntries(entries.filter(([, view]) => view)) as typeof views); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [loader, locale]);
  const view = views[seedId];

  const badge = (provenance: "curated" | "derived") => provenance === "curated" ? text.curated : text.derived;
  return (
    <section className="mt-8 rounded-3xl border border-green-200 bg-green-50/60 p-4 text-slate-950 shadow-sm sm:p-6" aria-labelledby="ontology-platform-pilot-title">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-green-700 text-white" aria-hidden="true"><Compass size={23} /></span>
        <div><h2 id="ontology-platform-pilot-title" className="text-lg font-black">{text.title}</h2><p className="mt-1 text-sm leading-6 text-slate-700">{text.note}</p></div>
      </div>
      <fieldset className="mt-5"><legend className="text-sm font-bold text-slate-900">{text.choose}</legend><div className="mt-2 flex flex-wrap gap-2">
        {READ_ONLY_PILOT_SEEDS.map((id) => {
          const option = views[id];
          return <button key={id} type="button" disabled={!option} onClick={() => setSeedId(id)} aria-pressed={id === seedId} className="min-h-11 rounded-xl border border-green-700 bg-white px-3 text-sm font-bold text-green-900 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 aria-pressed:bg-green-700 aria-pressed:text-white">{option?.seed.label ?? text.loading}</button>;
        })}
      </div></fieldset>
      {view ? <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <RelationList icon={<Sparkles size={18} />} title={text.actions} relations={view.actions} badge={badge} />
        <RelationList icon={<BookOpen size={18} />} title={text.contexts} relations={view.contexts} badge={badge} empty={text.noContext} />
      </div> : <p className="mt-5 min-h-16 animate-pulse rounded-2xl border border-green-200 bg-white px-4 py-5 text-sm text-slate-600" role="status" aria-live="polite">{failed ? text.unavailable : text.loading}</p>}
      {view && <OccupationExamples contexts={view.contexts} examplesByContext={view.occupationExamplesByContext} text={text} />}
      <p className="mt-5 rounded-xl border border-green-200 bg-white/80 px-3 py-2 text-sm leading-6 text-slate-700">{text.exploratory}</p>
    </section>
  );
}

function RelationList({ icon, title, relations, badge, empty }: { icon: ReactNode; title: string; relations: ReadOnlyPilotRelation[]; badge: (provenance: "curated" | "derived") => string; empty?: string }) {
  return <div className="rounded-2xl border border-green-200 bg-white p-4"><h3 className="flex items-center gap-2 font-black text-slate-950"><span aria-hidden="true">{icon}</span>{title}</h3>{relations.length ? <ul className="mt-3 space-y-2">{relations.map((relation) => <li key={relation.targetId} className="rounded-xl bg-slate-50 px-3 py-2"><p className="font-bold text-slate-900">{relation.label}</p><p className="mt-1 text-xs text-slate-600">{badge(relation.provenance)} · {Math.round(relation.confidence * 100)}%</p></li>)}</ul> : <p className="mt-3 text-sm text-slate-600">{empty}</p>}</div>;
}

function OccupationExamples({ contexts, examplesByContext, text }: { contexts: ReadOnlyPilotRelation[]; examplesByContext: Readonly<Record<string, import("../../lib/ontology/platform/read-only-pilot").ReadOnlyPilotOccupationExample[]>>; text: typeof COPY[OntologyPlatformLocale] }) {
  return <section className="mt-4 rounded-2xl border border-green-200 bg-white p-4" aria-labelledby="ontology-platform-occupation-examples"><h3 id="ontology-platform-occupation-examples" className="flex items-center gap-2 font-black text-slate-950"><BriefcaseBusiness size={18} aria-hidden="true" />{text.examples}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{text.exampleEvidence}</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{contexts.map((context) => <div key={context.targetId} className="rounded-xl bg-slate-50 px-3 py-2"><p className="text-sm font-bold text-slate-900">{context.label}</p>{(examplesByContext[context.targetId] ?? []).length ? <ul className="mt-2 space-y-2">{examplesByContext[context.targetId].map((example) => <li key={example.targetId} className="text-sm text-slate-700"><p><span className="font-semibold">{example.label}</span><span className="ml-1 text-xs text-slate-500">· {Math.round(example.confidence * 100)}%</span></p><p className="mt-0.5 break-all text-xs text-slate-500">{text.source}: {example.sourceIds.join(", ")}</p></li>)}</ul> : <p className="mt-2 text-sm text-slate-600">{text.noExamples}</p>}</div>)}</div></section>;
}
