/**
 * Test result → tool link (2026-11-23).
 *
 * Test result pages get many visits but earn little per ad view, while the
 * money calculators on tools.oiyo.net earn several times more. Under the
 * share button of a test result we show one small, related calculator link
 * (ResultToolLink.tsx). This file only decides which tool to offer.
 *
 * Every locale points to its own country's tool where one exists
 * (ja → Japanese take-home pay, en → US take-home pay, and so on).
 */

export type ToolLocale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';
export type ToolKey = 'pay' | 'yearEnd' | 'compound' | 'leave' | 'travel';

export interface ToolLink {
  key: ToolKey;
  href: string;
  lead: string;
  label: string;
}

const TOOLS_ORIGIN = 'https://tools.oiyo.net';

const PAY_SLUG: Record<ToolLocale, string> = {
  ko: 'salary-calculator',
  en: 'us-take-home-pay-calculator-2026',
  ja: 'japan-salary-calculator',
  zh: 'china-salary-calculator',
  fr: 'france-salary-calculator',
  es: 'spain-salary-calculator',
};

type Copy = { lead: string; label: string };
const PAY: Record<ToolLocale, Copy> = {
  ko: { lead: '결과를 봤다면 이제 현실 체크', label: '내 월급 실수령액 계산해 보기' },
  en: { lead: 'Now a reality check', label: 'See your real take-home pay (US 2026)' },
  ja: { lead: '結果のあとは現実チェック', label: '給与の手取り額を計算してみる' },
  zh: { lead: '看完结果，来点现实', label: '算算你的税后实发工资' },
  fr: { lead: 'Et maintenant, un peu de concret', label: 'Calculez votre salaire net réel' },
  es: { lead: 'Ahora, un poco de realidad', label: 'Calcula tu salario neto real' },
};

const COPY: Record<ToolLocale, Partial<Record<ToolKey, Copy>>> = {
  ko: {
    yearEnd: { lead: '연말정산 시즌이에요', label: '13월의 월급, 환급액 미리 계산하기' },
    compound: { lead: '내 돈 성향을 알았다면', label: '복리 계산기로 10년 뒤 내 돈 보기' },
    leave: { lead: '쉬고 싶다면 남은 연차부터', label: '연차 계산기로 내 연차 확인하기' },
    travel: { lead: '떠나기 전에', label: '여행 경비 계산기로 예산 짜기' },
  },
  en: {
    compound: { lead: 'Know your money style? Now the numbers', label: 'Compound interest: your money in 10 years' },
    travel: { lead: 'Before you go', label: 'Plan your trip with the travel budget calculator' },
  },
  ja: {
    yearEnd: { lead: '年末調整の季節です', label: '年末調整の還付金をシミュレーション' },
    compound: { lead: 'お金のタイプがわかったら', label: '複利計算機で10年後の資産を見る' },
    leave: { lead: '休みたいなら、まず有給から', label: '有給休暇の付与日数を計算する' },
    travel: { lead: '出発の前に', label: '旅行予算計算機で予算を立てる' },
  },
  zh: {
    compound: { lead: '了解了理财性格之后', label: '用复利计算机看看10年后的存款' },
    leave: { lead: '想休息？先看年假', label: '年休假计算器：算算法定年假' },
    travel: { lead: '出发之前', label: '用旅行预算计算器做预算' },
  },
  fr: {
    compound: { lead: 'Votre profil financier, maintenant les chiffres', label: 'Intérêts composés : votre épargne dans 10 ans' },
    leave: { lead: 'Envie de repos ? Comptez vos congés', label: 'Calculateur de congés payés' },
    travel: { lead: 'Avant de partir', label: 'Calculez le budget de votre voyage' },
  },
  es: {
    compound: { lead: 'Ya conoces tu perfil, ahora los números', label: 'Interés compuesto: tus ahorros en 10 años' },
    leave: { lead: '¿Necesitas descansar? Mira tus vacaciones', label: 'Calculadora de días de vacaciones' },
    travel: { lead: 'Antes de viajar', label: 'Calcula el presupuesto de tu viaje' },
  },
};

const SLUG: Partial<Record<ToolKey, string>> = {
  yearEnd: 'year-end-settlement-calculator',
  compound: 'compound-interest-calculator',
  leave: 'annual-leave-calculator',
  travel: 'travel-budget-calculator',
};

const MONEY_TEST = /money|spending|risk-tolerance|economics|business-type|entrepreneur|invest/;
const WORK_REST_TEST = /work-life|workaholic|winter-break|winter-hibernation|burnout|lethargy/;
const TRAVEL_TEST = /travel/;
/** These pages already link to a tool of their own (Secret Santa draw). */
const HAS_OWN_TOOL = new Set(['christmas-personality-test', 'gift-style-test']);

export function isYearEndSeason(locale: ToolLocale, month: number): boolean {
  return (locale === 'ko' || locale === 'ja') && (month === 11 || month === 12 || month === 1);
}

export function toToolLocale(locale: string): ToolLocale {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as ToolLocale) ? (locale as ToolLocale) : 'en';
}

/** "/ko/money-personality-test/" → "money-personality-test". */
export function testIdFromPath(pathname: string): string {
  return pathname.replace(/^\/(?:en|ko|ja|zh|fr|es)(?=\/|$)/, '').replace(/^\/+|\/+$/g, '');
}

/** month is 1-12. Returns null on pages that are not a test, or that already link to a tool. */
export function pickTestTool(testId: string, locale: string, month: number): ToolLink | null {
  if (!/-test$/.test(testId) || testId.includes('/') || HAS_OWN_TOOL.has(testId)) return null;
  const l = toToolLocale(locale);
  let key: ToolKey = isYearEndSeason(l, month) ? 'yearEnd' : 'pay';
  if (MONEY_TEST.test(testId)) key = 'compound';
  else if (TRAVEL_TEST.test(testId)) key = 'travel';
  else if (WORK_REST_TEST.test(testId) && COPY[l].leave) key = 'leave';
  const copy = key === 'pay' ? PAY[l] : COPY[l][key] ?? PAY[l];
  if (!COPY[l][key]) key = 'pay';
  const slug = key === 'pay' ? PAY_SLUG[l] : SLUG[key];
  const params = new URLSearchParams({
    utm_source: 'oiyo.net',
    utm_medium: 'result_card',
    utm_campaign: 'result_to_tool',
    utm_content: testId,
  });
  return { key, href: `${TOOLS_ORIGIN}/${l}/${slug}/?${params.toString()}`, ...copy };
}
