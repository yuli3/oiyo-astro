// C3 Wave 0: the paid link and its disclosure are one indivisible surface.
// The canonical registry is intentionally disabled and empty until the human
// partner/public-activation gate is recorded.
import type { ReactNode } from 'react';
import canonicalRegistry from '../../../config/affiliate-activation-v1.registry.json';
import type { Locale } from '../../i18n';
import {
  AFFILIATE_DISCLOSURE_COPY,
  AFFILIATE_LINK_REL,
  findForbiddenClaims,
  resolveAffiliateActivation,
  validateAffiliateActivationRegistry,
  validateAffiliateHref,
} from '../../monetization/affiliate';

export interface AffiliateLinkProps {
  children: ReactNode;
  href: string;
  locale: Locale;
  pageKey: string;
  partnerId: string;
  position: string;
}

export function createAffiliateLink(registry: unknown) {
  const safeRegistry = validateAffiliateActivationRegistry(registry);
  return function RegistryBoundAffiliateLink({ children, href, locale, pageKey, partnerId, position }: AffiliateLinkProps) {
    const activation = resolveAffiliateActivation({ pageKey, partnerId, position }, safeRegistry);
    const safeHref = validateAffiliateHref(href, activation.partner);
    const visibleCopy = typeof children === 'string' ? children : '';
    if (visibleCopy && findForbiddenClaims(activation.partner.category, visibleCopy).length) {
      throw new TypeError('affiliate link 문구에 금지 claim이 포함되었습니다');
    }
    return (
      <span data-affiliate-link="v1" data-page-key={activation.pageKey} data-partner-id={activation.partner.partnerId}>
        <a href={safeHref} rel={AFFILIATE_LINK_REL}>{children}</a>
        <span role="note" className="mt-1 block text-xs text-muted-foreground" data-affiliate-disclosure="v1">
          {AFFILIATE_DISCLOSURE_COPY[locale]}
        </span>
      </span>
    );
  };
}

export const AffiliateLink = createAffiliateLink(canonicalRegistry);
