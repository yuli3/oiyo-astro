import type { Locale } from "../../../i18n";
import type { LifeCategories } from "../../../lib/ontology/saju/categories";
import {
  CATEGORIES_C,
  ELEMENT_NAME,
  tt,
  YONGSIN_C,
} from "../../../lib/ontology/saju/yongsin-content";
import { YONGSIN_ATTRS } from "../../../lib/ontology/saju/yongsin";
import type { FiveElement } from "../../../lib/ontology/saju/types";

const C = CATEGORIES_C;

const STANCE_STYLE: Record<string, string> = {
  favorable: "border-emerald-200 bg-emerald-50",
  unfavorable: "border-amber-200 bg-amber-50",
  neutral: "border-gray-200 bg-white",
};

export default function LifeCategoriesSection({
  locale,
  analysis,
}: {
  locale: Locale;
  analysis: LifeCategories;
}) {
  const { wealth, career, love, health } = analysis;
  const el = (e: FiveElement) => tt(ELEMENT_NAME[e], locale);
  const roleName = (r: string) => tt(C.roleName[r], locale);
  const lvl = (l: string) => tt(C.level[l], locale);
  const stance = (s: string) => tt(C.stance[s], locale);

  const Meta = ({ role, level, st }: { role: string; level: string; st: string }) => (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
      <span className="rounded bg-white/70 border border-gray-200 px-1.5 py-0.5 font-medium text-gray-700">{roleName(role)}</span>
      <span className="text-gray-400">·</span>
      <span className="text-gray-600">{lvl(level)}</span>
      <span className="text-gray-400">·</span>
      <span className="font-semibold text-gray-700">{stance(st)}</span>
    </div>
  );

  // career field chips by favorable element
  const careerAttrs = YONGSIN_ATTRS[analysis.yongsin.yongsin];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">{tt(C.sectionHeading, locale)}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* 재물 */}
        <div className={`rounded-xl border p-4 ${STANCE_STYLE[wealth.stance]}`}>
          <p className="text-sm font-bold text-gray-900">💰 {tt(C.wealth.title, locale)}</p>
          <Meta role={wealth.role} level={wealth.level} st={wealth.stance} />
          <p className="mt-2 text-[13px] leading-relaxed text-gray-700">
            {wealth.toneKey === "wealth.overwhelmed"
              ? tt(C.wealth.overwhelmed, locale)
              : tt(C.wealth.guide[wealth.stance], locale)}
          </p>
        </div>

        {/* 진로 */}
        <div className={`rounded-xl border p-4 ${STANCE_STYLE[career.stance]}`}>
          <p className="text-sm font-bold text-gray-900">🧭 {tt(C.career.title, locale)}</p>
          <Meta role={career.role} level={career.level} st={career.stance} />
          <p className="mt-2 text-[13px] leading-relaxed text-gray-700">{tt(C.career.mode[career.mode], locale)}</p>
          <p className="mt-2 text-[11px] font-semibold text-gray-500">{tt(C.career.fieldsLabel, locale)}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {careerAttrs.careerKeys.slice(0, 4).map((k) => (
              <span key={k} className="rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[11px] text-gray-700">
                {tt(YONGSIN_C.careerName[k], locale)}
              </span>
            ))}
          </div>
        </div>

        {/* 연애 */}
        <div className={`rounded-xl border p-4 ${STANCE_STYLE[love.stance]}`}>
          <p className="text-sm font-bold text-gray-900">💕 {tt(C.love.title, locale)}</p>
          <Meta role={love.role} level={love.level} st={love.stance} />
          <p className="mt-2 text-[13px] leading-relaxed text-gray-700">{tt(C.love.guide[love.stance], locale)}</p>
          <p className="mt-2 text-[11px] text-gray-500">
            {tt(C.love.palaceLabel, locale)}: <span className="font-semibold text-gray-700">{el(love.spousePalaceElement)}</span>
          </p>
        </div>

        {/* 건강 */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-bold text-gray-900">🌿 {tt(C.health.title, locale)}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded bg-white/70 border border-gray-200 px-1.5 py-0.5 font-medium text-gray-700">{el(health.focusElement)}</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-700">{tt(C.health.imbalance[health.imbalance], locale)}</p>
          <p className="mt-2 text-[11px] text-gray-500">
            {tt(C.health.organLabel, locale)}: <span className="font-semibold text-gray-700">{tt(C.health.organ[health.organKey], locale)}</span>
          </p>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-gray-400">{tt(C.disclaimer, locale)}</p>
    </div>
  );
}
