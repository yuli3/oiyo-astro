type Locale = 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'es';

export interface NextStepLink {
  href: string;
  label: string;
  external?: boolean;
  /** restrict to specific locales (e.g. ko-only wiki dictionaries) */
  locales?: string[];
}

interface Props {
  locale: string;
  links: NextStepLink[];
}

const HEADING: Record<Locale, string> = {
  ko: '결과와 이어서 보기',
  en: 'Next steps',
  ja: '結果のつづき',
  zh: '接下来看看',
  fr: 'Pour aller plus loin',
  es: 'Siguientes pasos',
};

/**
 * "What now?" links under a test result — keeps the visitor moving through
 * the family (oiyo try → wiki look-up → blog learn) instead of dead-ending.
 */
export default function ResultNextSteps({ locale, links }: Props) {
  const visible = links.filter((l) => !l.locales || l.locales.includes(locale));
  if (visible.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-lime-200 bg-lime-50/60 p-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-lime-700">
        {HEADING[(locale as Locale)] ?? HEADING.en}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {visible.map((l) => (
          <a
            key={l.href}
            href={l.href}
            {...(l.external ? { rel: 'noopener' } : {})}
            className="inline-flex items-center rounded-lg border border-lime-300 bg-white px-3 py-1.5 text-sm font-medium text-lime-900 transition-colors hover:border-lime-500 hover:text-lime-700"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
