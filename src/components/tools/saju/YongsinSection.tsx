import type { Locale } from "../../../i18n";
import type { LifeCategories } from "../../../lib/ontology/saju/categories";
import {
  ELEMENT_NAME,
  tt,
  YONGSIN_C,
} from "../../../lib/ontology/saju/yongsin-content";
import { YONGSIN_ATTRS } from "../../../lib/ontology/saju/yongsin";
import type { FiveElement } from "../../../lib/ontology/saju/types";

const C = YONGSIN_C;

export default function YongsinSection({
  locale,
  analysis,
  hourKnown,
}: {
  locale: Locale;
  analysis: LifeCategories;
  hourKnown: boolean;
}) {
  const { strength, yongsin } = analysis;
  const el = (e: FiveElement) => tt(ELEMENT_NAME[e], locale);
  const attrs = YONGSIN_ATTRS[yongsin.yongsin];

  const Chip = ({ e, role, label, tone }: { e: FiveElement; role: "fav" | "bad"; label: string; tone?: string }) => (
    <div className={`rounded-xl border p-3 ${role === "fav" ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-xs font-semibold ${role === "fav" ? "text-emerald-700" : "text-rose-700"}`}>{label}</span>
        <span className="text-lg font-bold text-gray-900">{el(e)}</span>
      </div>
      {tone && <p className="mt-1 text-[11px] leading-relaxed text-gray-600">{tone}</p>}
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border border-gray-200 p-5 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{tt(C.heading, locale)}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{tt(C.concept, locale)}</p>
      </div>

      {/* Strength badge */}
      <div className="rounded-xl bg-surface-subtle border border-green-100 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            {tt(C.strengthLabel[strength.category], locale)}
          </span>
          <span className="text-xs text-green-700">
            {Math.round(strength.ratio * 100)}% {locale === "ko" ? "신강도" : "self-strength"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-green-900">
          {tt(C.strengthDesc[strength.category], locale)}
        </p>
      </div>

      {/* Favorable */}
      <div>
        <p className="text-sm font-bold text-emerald-700 mb-2">✓ {tt(C.favorableHeading, locale)}</p>
        <div className="grid grid-cols-2 gap-2">
          <Chip e={yongsin.yongsin} role="fav" label={tt(C.yongsinLabel, locale)} tone={tt(C.elementFavorable[yongsin.yongsin], locale)} />
          <Chip e={yongsin.huisin} role="fav" label={tt(C.huisinLabel, locale)} />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-gray-500">→ {tt(C.reason[yongsin.reason], locale)}</p>
      </div>

      {/* Unfavorable */}
      <div>
        <p className="text-sm font-bold text-rose-700 mb-2">△ {tt(C.unfavorableHeading, locale)}</p>
        <div className="grid grid-cols-2 gap-2">
          <Chip e={yongsin.gisin} role="bad" label={tt(C.gisinLabel, locale)} tone={tt(C.elementUnfavorable[yongsin.gisin], locale)} />
          <Chip e={yongsin.gusin} role="bad" label={tt(C.gusinLabel, locale)} />
        </div>
      </div>

      {/* Lucky attributes (by yongsin) */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm font-bold text-gray-800 mb-3">{tt(C.attrsHeading, locale)}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <Row label={tt(C.labels.color, locale)} value={`${tt(C.colorName[attrs.colorKey], locale)}`} swatch={attrs.colorHex} />
          <Row label={tt(C.labels.direction, locale)} value={tt(C.directionName[attrs.directionKey], locale)} />
          <Row label={tt(C.labels.numbers, locale)} value={attrs.numbers.join(", ")} />
          <Row label={tt(C.labels.season, locale)} value={tt(C.seasonName[attrs.seasonKey], locale)} />
          <Row label={tt(C.labels.food, locale)} value={tt(C.foodName[attrs.foodKey], locale)} />
        </div>
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">{tt(C.labels.career, locale)}</p>
          <div className="flex flex-wrap gap-1.5">
            {attrs.careerKeys.map((k) => (
              <span key={k} className="rounded-full bg-card border border-gray-200 px-2.5 py-0.5 text-xs text-gray-700">
                {tt(C.careerName[k], locale)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!hourKnown && (
        <p className="text-[11px] leading-relaxed text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {tt(C.hourCaveat, locale)}
        </p>
      )}
      <p className="text-[11px] leading-relaxed text-gray-400">{tt(C.disclaimer, locale)}</p>
    </div>
  );
}

function Row({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="flex items-center gap-1.5 font-semibold text-gray-900">
        {swatch && <span className="inline-block h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: swatch }} />}
        {value}
      </span>
    </div>
  );
}
