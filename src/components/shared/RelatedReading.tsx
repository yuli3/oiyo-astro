import { getRelatedReading } from '../../lib/related-reading';
import type { ReadingTopic } from '../../lib/related-reading';

type Locale = 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'es';

interface Props {
  locale: string;
  topic: ReadingTopic;
}

const HEADING: Record<Locale, string> = {
  ko: '더 깊이 읽기',
  en: 'Read deeper',
  ja: 'さらに深く読む',
  zh: '深入阅读',
  fr: 'Lire plus loin',
  es: 'Leer más',
};

/**
 * Data-driven blog/wiki recommendations under a test result.
 * Links come from the central verified map in lib/related-reading.ts —
 * never hand-write external slugs in test components.
 */
export default function RelatedReading({ locale, topic }: Props) {
  const links = getRelatedReading(topic, locale);
  if (links.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">
        {HEADING[(locale as Locale)] ?? HEADING.en}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            rel="noopener"
            className="inline-flex items-center rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 transition-colors hover:border-amber-500 hover:text-amber-700"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
