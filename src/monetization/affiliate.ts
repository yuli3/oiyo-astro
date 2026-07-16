// oiyo.affiliate v1 — affiliate foundation contracts (C3 Wave 0).
//
// Wave 0 only ships the guardrails: disclosure copy, partner due-diligence
// schema, a minimal click-event payload, and per-category forbidden claims.
// Real partner contracts, commissions, brand exposure, and any transfer of
// personal data are human gates. The first pilot category must be easily
// reversible (books/courses/hobby tools) — never high-risk tax/legal leads.
import type { Locale } from '../i18n';

export const AFFILIATE_SCHEMA = 'oiyo.affiliate' as const;
export const AFFILIATE_SCHEMA_VERSION = 1 as const;

// Links to partners must carry this rel so search engines see paid intent.
export const AFFILIATE_LINK_REL = 'sponsored nofollow' as const;

export type AffiliateCategoryId = 'books-courses' | 'hobby-tools' | 'tax-legal-leads' | 'finance-products' | 'health-services';

export interface AffiliateCategory {
  forbiddenClaims: readonly RegExp[];
  id: AffiliateCategoryId;
  pilotAllowed: boolean;
  reason: string;
}

// Claims that are never allowed in any affiliate copy, any category.
const UNIVERSAL_FORBIDDEN_CLAIMS: readonly RegExp[] = [
  /100\s*%|무조건|보장(?:합니다|된)/,
  /검사\s*결과상\s*(?:필요|필수)/,
  /지금\s*아니면|마감\s*임박/,
];

export const AFFILIATE_CATEGORIES: readonly AffiliateCategory[] = [
  {
    forbiddenClaims: [...UNIVERSAL_FORBIDDEN_CLAIMS, /이\s*책만\s*읽으면/],
    id: 'books-courses',
    pilotAllowed: true,
    reason: '저위험·되돌리기 쉬움 — 첫 pilot 후보',
  },
  {
    forbiddenClaims: [...UNIVERSAL_FORBIDDEN_CLAIMS],
    id: 'hobby-tools',
    pilotAllowed: true,
    reason: '저위험·되돌리기 쉬움',
  },
  {
    forbiddenClaims: [...UNIVERSAL_FORBIDDEN_CLAIMS, /환급\s*보장/, /세무\s*문제\s*해결/, /승소/],
    id: 'tax-legal-leads',
    pilotAllowed: false,
    reason: 'YMYL 고위험 — 별도 사람 게이트 전 pilot 금지',
  },
  {
    forbiddenClaims: [...UNIVERSAL_FORBIDDEN_CLAIMS, /수익\s*보장/, /원금\s*보장/, /고수익/],
    id: 'finance-products',
    pilotAllowed: false,
    reason: 'YMYL 고위험 — 개인화 투자자문 레드라인 인접',
  },
  {
    forbiddenClaims: [...UNIVERSAL_FORBIDDEN_CLAIMS, /치료|완치/, /진단/],
    id: 'health-services',
    pilotAllowed: false,
    reason: 'YMYL 고위험 — 비진단 경계와 충돌',
  },
];

export function getAffiliateCategory(id: string): AffiliateCategory {
  const category = AFFILIATE_CATEGORIES.find((entry) => entry.id === id);
  if (!category) throw new Error(`알 수 없는 제휴 카테고리: ${id}`);
  return category;
}

export function findForbiddenClaims(categoryId: AffiliateCategoryId, copyText: string): string[] {
  const category = getAffiliateCategory(categoryId);
  return category.forbiddenClaims.filter((pattern) => pattern.test(copyText)).map((pattern) => String(pattern));
}

// --- Partner due diligence -------------------------------------------------

export interface PartnerDueDiligence {
  category: AffiliateCategoryId;
  contractStatus: 'candidate' | 'reviewing' | 'approved-by-human' | 'rejected';
  dataSharedWithPartner: 'none';
  disclosurePlacement: 'adjacent-to-link';
  exitPlan: string;
  legalName: string;
  offering: string;
  partnerId: string;
  reviewedAt: string;
  reviewedBy: string;
  schema: typeof AFFILIATE_SCHEMA;
  schemaVersion: typeof AFFILIATE_SCHEMA_VERSION;
}

export function validatePartnerDueDiligence(value: unknown): PartnerDueDiligence {
  const record = value as Partial<PartnerDueDiligence> | null;
  if (!record || typeof record !== 'object') throw new TypeError('due diligence 레코드가 아닙니다');
  if (record.schema !== AFFILIATE_SCHEMA || record.schemaVersion !== AFFILIATE_SCHEMA_VERSION) {
    throw new TypeError('schema/version 불일치');
  }
  for (const field of ['partnerId', 'legalName', 'offering', 'exitPlan', 'reviewedBy'] as const) {
    if (typeof record[field] !== 'string' || !record[field]?.trim()) throw new TypeError(`${field}가 비었습니다`);
  }
  if (Number.isNaN(Date.parse(String(record.reviewedAt)))) throw new TypeError('reviewedAt이 올바른 시각이 아닙니다');
  getAffiliateCategory(String(record.category));
  if (record.dataSharedWithPartner !== 'none') {
    throw new TypeError('개인정보 전달은 계약될 수 없습니다 — dataSharedWithPartner는 none 고정');
  }
  if (record.disclosurePlacement !== 'adjacent-to-link') throw new TypeError('공시는 링크 인접 배치가 강제됩니다');
  if (!['candidate', 'reviewing', 'approved-by-human', 'rejected'].includes(String(record.contractStatus))) {
    throw new TypeError('contractStatus가 유효하지 않습니다');
  }
  return record as PartnerDueDiligence;
}

export function isPartnerLive(record: PartnerDueDiligence): boolean {
  // Only a human-approved contract in a pilot-allowed category may go live.
  return record.contractStatus === 'approved-by-human' && getAffiliateCategory(record.category).pilotAllowed;
}

// --- Click event (minimal payload) ------------------------------------------

const CLICK_EVENT_FORBIDDEN_KEYS = ['userId', 'email', 'resultId', 'score', 'answers', 'birth', 'name'] as const;

export interface AffiliateClickEvent {
  event: 'affiliate_click';
  pageKey: string;
  partnerId: string;
  position: string;
  schemaVersion: typeof AFFILIATE_SCHEMA_VERSION;
}

export function buildAffiliateClickEvent(input: { pageKey: string; partnerId: string; position: string }): AffiliateClickEvent {
  for (const field of ['pageKey', 'partnerId', 'position'] as const) {
    if (typeof input[field] !== 'string' || !input[field].trim()) throw new TypeError(`${field}가 비었습니다`);
  }
  const extraKeys = Object.keys(input).filter((key) => !['pageKey', 'partnerId', 'position'].includes(key));
  for (const key of extraKeys) {
    if (CLICK_EVENT_FORBIDDEN_KEYS.some((forbidden) => key.toLowerCase().includes(forbidden.toLowerCase()))) {
      throw new TypeError(`클릭 이벤트에 개인·결과 식별 필드는 담을 수 없습니다: ${key}`);
    }
  }
  return {
    event: 'affiliate_click',
    pageKey: input.pageKey.trim(),
    partnerId: input.partnerId.trim(),
    position: input.position.trim(),
    schemaVersion: AFFILIATE_SCHEMA_VERSION,
  };
}

// --- Disclosure copy (6 locales, rendered adjacent to every affiliate link) --

export const AFFILIATE_DISCLOSURE_COPY: Record<Locale, string> = {
  en: 'Affiliate link: OIYO may earn a commission if you buy through this link. The price you pay does not change. This is not personalized advice.',
  es: 'Enlace de afiliado: OIYO puede recibir una comisión si compras a través de este enlace. El precio que pagas no cambia. No es un consejo personalizado.',
  fr: "Lien affilié : OIYO peut percevoir une commission si vous achetez via ce lien. Le prix que vous payez ne change pas. Ceci n'est pas un conseil personnalisé.",
  ja: 'アフィリエイトリンク：このリンク経由で購入されると、OIYOが手数料を受け取る場合があります。お支払い価格は変わりません。個別のアドバイスではありません。',
  ko: '제휴 링크: 이 링크로 구매하면 OIYO가 수수료를 받을 수 있습니다. 지불 가격은 달라지지 않습니다. 개인 맞춤 조언이 아닙니다.',
  zh: '联盟链接：通过此链接购买时，OIYO 可能会获得佣金。您支付的价格不变。这不是个性化建议。',
};
