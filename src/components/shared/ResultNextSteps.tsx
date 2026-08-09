import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item';

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
    <section className="mt-6 rounded-xl border border-border bg-card p-4" aria-labelledby="result-next-steps-heading">
      <p id="result-next-steps-heading" className="text-[11px] font-black uppercase tracking-widest text-primary">
        {HEADING[(locale as Locale)] ?? HEADING.en}
      </p>
      <ItemGroup className="mt-3 gap-2">
        {visible.map((l) => (
          <Item key={l.href} asChild variant="outline" size="sm">
            <a href={l.href} {...(l.external ? { rel: 'noopener' } : {})}>
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
