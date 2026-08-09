import { getRelatedReading } from '../../lib/related-reading';
import type { ReadingTopic } from '../../lib/related-reading';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';

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
    <section className="mt-3 rounded-xl border border-border bg-card p-4" aria-labelledby="related-reading-heading">
      <p id="related-reading-heading" className="text-[11px] font-black uppercase tracking-widest text-primary">
        {HEADING[(locale as Locale)] ?? HEADING.en}
      </p>
      <ItemGroup className="mt-3 gap-2">
        {links.map((l) => (
          <Item key={l.href} asChild variant="outline" size="sm">
            <a href={l.href} rel="noopener">
              <ItemContent>
                <ItemTitle>{l.label}</ItemTitle>
              </ItemContent>
              <ItemActions aria-hidden="true">→</ItemActions>
            </a>
          </Item>
        ))}
      </ItemGroup>
    </section>
  );
}
