// C3 Wave 0: disclosure rendered adjacent to every affiliate link.
// Not wired into any route yet — public exposure is a human gate.
import type { Locale } from '../../i18n';
import { AFFILIATE_DISCLOSURE_COPY } from '../../monetization/affiliate';

export function AffiliateDisclosure({ locale }: { locale: Locale }) {
  return (
    <p
      role="note"
      className="mt-1 text-xs text-muted-foreground"
      data-affiliate-disclosure="v1"
    >
      {AFFILIATE_DISCLOSURE_COPY[locale]}
    </p>
  );
}
