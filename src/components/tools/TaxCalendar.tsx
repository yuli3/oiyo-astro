import { useState, useMemo } from 'react';
import type { Locale } from '../../i18n';

/* ────────────────────────────────────────────────────────────────────────────
 * TaxCalendar — Korean annual tax-filing timeline. National (국세) + local (지방세)
 * deadlines on a 12-month track, filterable by taxpayer type, with a live D-day to
 * the next deadline. ko-first; other locales fall back to en for chrome. YMYL: dates
 * are the standard statutory windows — a holiday/weekend pushes the last day to the
 * next business day, so the tool links to the official portals for confirmation.
 * ────────────────────────────────────────────────────────────────────────── */

type Payer = 'all' | 'individual' | 'soleprop' | 'corp';
type Kind = 'national' | 'local';

interface TaxEvent {
  id: string;
  month: number;        // 1-12 (the month whose deadline day anchors the marker)
  day: number;          // deadline day of month
  kind: Kind;
  payers: Payer[];      // who it applies to (besides 'all')
  name: Record<'ko' | 'en', string>;
  window: string;       // human window, e.g. "1/1–1/25"
  note: Record<'ko' | 'en', string>;
  link: string;         // official portal
}

const HOMETAX = 'https://www.hometax.go.kr';
const WETAX = 'https://www.wetax.go.kr';

const EVENTS: TaxEvent[] = [
  { id: 'vat-2-final', month: 1, day: 25, kind: 'national', payers: ['soleprop', 'corp'],
    name: { ko: '부가가치세 2기 확정신고', en: 'VAT 2nd-period final return' }, window: '1/1–1/25',
    note: { ko: '직전 하반기(7~12월) 부가세 확정신고·납부. 간이과세자는 연 1회 이때 신고.', en: 'Final VAT return/payment for Jul–Dec. Simplified-scheme filers file once a year here.' }, link: HOMETAX },
  { id: 'car-tax-prepay', month: 1, day: 31, kind: 'local', payers: ['all'],
    name: { ko: '자동차세 연납 신청', en: 'Vehicle tax annual-prepay option' }, window: '1월',
    note: { ko: '1월에 연세액을 한 번에 내면 일부 공제. 차량 소유자 대상(선택).', en: 'Pay the full year in January for a partial discount. Optional, for vehicle owners.' }, link: WETAX },
  { id: 'corp-tax', month: 3, day: 31, kind: 'national', payers: ['corp'],
    name: { ko: '법인세 신고', en: 'Corporate income tax' }, window: '~3/31',
    note: { ko: '12월 결산 법인 기준 사업연도 종료 후 3개월 이내. 결산월이 다르면 기한도 달라짐.', en: 'Within 3 months of fiscal year-end — 3/31 for December-closing companies.' }, link: HOMETAX },
  { id: 'vat-1-pre', month: 4, day: 25, kind: 'national', payers: ['corp'],
    name: { ko: '부가가치세 1기 예정신고', en: 'VAT 1st-period preliminary return' }, window: '4/1–4/25',
    note: { ko: '법인 사업자 예정신고. 개인 일반과세자는 고지 납부(신고 생략) 원칙.', en: 'Preliminary return for corporations; individuals are generally assessed by notice.' }, link: HOMETAX },
  { id: 'income-tax', month: 5, day: 31, kind: 'national', payers: ['individual', 'soleprop'],
    name: { ko: '종합소득세 신고', en: 'Comprehensive income tax' }, window: '5/1–5/31',
    note: { ko: '직전 연도 종합소득(사업·근로·이자·배당·연금·기타) 신고·납부. 성실신고 대상은 6/30.', en: 'File/pay prior-year comprehensive income. Honest-reporting filers: 6/30.' }, link: HOMETAX },
  { id: 'car-tax-1', month: 6, day: 30, kind: 'local', payers: ['all'],
    name: { ko: '자동차세 1기분', en: 'Vehicle tax (1st half)' }, window: '6/16–6/30',
    note: { ko: '정기분 상반기. 차량 소유자 대상.', en: 'Regular first-half installment for vehicle owners.' }, link: WETAX },
  { id: 'property-tax-1', month: 7, day: 31, kind: 'local', payers: ['all'],
    name: { ko: '재산세 1기분', en: 'Property tax (1st half)' }, window: '7/16–7/31',
    note: { ko: '주택 1/2·건축물·선박·항공기. 6/1 기준 소유자 대상.', en: 'Housing (½), buildings, ships, aircraft. Owner as of Jun 1.' }, link: WETAX },
  { id: 'vat-1-final', month: 7, day: 25, kind: 'national', payers: ['soleprop', 'corp'],
    name: { ko: '부가가치세 1기 확정신고', en: 'VAT 1st-period final return' }, window: '7/1–7/25',
    note: { ko: '상반기(1~6월) 부가세 확정신고·납부.', en: 'Final VAT return/payment for Jan–Jun.' }, link: HOMETAX },
  { id: 'resident-tax', month: 8, day: 31, kind: 'local', payers: ['soleprop', 'corp'],
    name: { ko: '주민세 사업소분', en: 'Resident tax (business-place)' }, window: '8/1–8/31',
    note: { ko: '7/1 기준 사업소를 둔 사업자. 지방자치단체에 납부.', en: 'Businesses with a place of business as of Jul 1.' }, link: WETAX },
  { id: 'property-tax-2', month: 9, day: 30, kind: 'local', payers: ['all'],
    name: { ko: '재산세 2기분', en: 'Property tax (2nd half)' }, window: '9/16–9/30',
    note: { ko: '주택 2/2·토지분. 6/1 기준 소유자 대상.', en: 'Housing (2nd ½) and land. Owner as of Jun 1.' }, link: WETAX },
  { id: 'vat-2-pre', month: 10, day: 25, kind: 'national', payers: ['corp'],
    name: { ko: '부가가치세 2기 예정신고', en: 'VAT 2nd-period preliminary return' }, window: '10/1–10/25',
    note: { ko: '법인 사업자 예정신고.', en: 'Preliminary return for corporations.' }, link: HOMETAX },
  { id: 'car-tax-2', month: 12, day: 31, kind: 'local', payers: ['all'],
    name: { ko: '자동차세 2기분', en: 'Vehicle tax (2nd half)' }, window: '12/16–12/31',
    note: { ko: '정기분 하반기. 차량 소유자 대상.', en: 'Regular second-half installment for vehicle owners.' }, link: WETAX },
];

interface UiLabels {
  title: string; subtitle: string;
  payer: Record<Payer, string>;
  next: string; dday: string; today: string;
  national: string; local: string;
  target: string; deadline: string; official: string;
  months: string[];
  disclaimer: string;
}

const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '세금 신고 캘린더', subtitle: '국세·지방세 연간 신고·납부 일정 한눈에',
    payer: { all: '전체', individual: '개인', soleprop: '개인사업자', corp: '법인' },
    next: '다음 마감', dday: 'D-', today: '오늘',
    national: '국세', local: '지방세',
    target: '대상', deadline: '기한', official: '공식 확인',
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    disclaimer: '기한 말일이 토·일·공휴일이면 다음 영업일로 순연됩니다. 예정신고·성실신고·결산월 등 개별 사정에 따라 달라질 수 있으니, 정확한 일정과 금액은 홈택스(국세)·위택스(지방세)에서 확인하세요. 개인화된 세무 자문이 아닙니다.',
  },
  en: {
    title: 'Korean Tax Calendar', subtitle: 'A year of national & local filing deadlines at a glance',
    payer: { all: 'All', individual: 'Individual', soleprop: 'Sole proprietor', corp: 'Corporation' },
    next: 'Next deadline', dday: 'D-', today: 'Today',
    national: 'National', local: 'Local',
    target: 'Applies to', deadline: 'Window', official: 'Official',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    disclaimer: 'If a deadline falls on a weekend or holiday it moves to the next business day. Preliminary/honest-reporting rules and fiscal year-end can change dates, so confirm exact schedules and amounts on Hometax (national) and Wetax (local). This is not personalized tax advice.',
  },
};

interface Props { locale: Locale }

export default function TaxCalendar({ locale }: Props) {
  const t = L[locale] ?? L.en!;
  const lang: 'ko' | 'en' = locale === 'ko' ? 'ko' : 'en';
  const [payer, setPayer] = useState<Payer>('all');

  const visible = useMemo(
    () => EVENTS.filter((e) => payer === 'all' || e.payers.includes('all') || e.payers.includes(payer)),
    [payer]
  );

  const next = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const cand = visible
      .map((e) => {
        let d = new Date(y, e.month - 1, e.day);
        if (d < now) d = new Date(y + 1, e.month - 1, e.day);
        return { e, d };
      })
      .sort((a, b) => a.d.getTime() - b.d.getTime());
    if (cand.length === 0) return null;
    const top = cand[0];
    const days = Math.ceil((top.d.getTime() - now.getTime()) / 86400000);
    return { ev: top.e, days };
  }, [visible]);

  const payers: Payer[] = ['all', 'individual', 'soleprop', 'corp'];

  return (
    <div className="not-prose my-8 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-black text-gray-900">{t.title}</h2>
        <p className="text-sm text-gray-500">{t.subtitle}</p>
      </div>

      {/* payer filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {payers.map((p) => (
          <button
            key={p}
            onClick={() => setPayer(p)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              payer === p ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
            }`}
          >
            {t.payer[p]}
          </button>
        ))}
      </div>

      {/* next deadline */}
      {next && (
        <div className="mx-auto max-w-md rounded-2xl bg-green-50 p-4 text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-green-700">{t.next}</div>
          <div className="mt-1 text-lg font-black text-gray-900">{next.ev.name[lang]}</div>
          <div className="text-sm text-green-700">
            {next.ev.window} · <b>{next.days === 0 ? t.today : `${t.dday}${next.days}`}</b>
          </div>
        </div>
      )}

      {/* 12-month timeline */}
      <div className="space-y-2">
        {t.months.map((mLabel, idx) => {
          const mo = idx + 1;
          const evs = visible.filter((e) => e.month === mo);
          return (
            <div key={mo} className={`flex gap-3 rounded-xl border p-2.5 ${evs.length ? 'border-gray-200 bg-white' : 'border-transparent bg-gray-50/50'}`}>
              <div className="w-12 shrink-0 pt-0.5 text-sm font-black text-gray-400">{mLabel}</div>
              <div className="flex flex-1 flex-wrap gap-2">
                {evs.length === 0 && <span className="text-xs text-gray-300">—</span>}
                {evs.map((e) => (
                  <a
                    key={e.id}
                    href={e.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                      e.kind === 'national'
                        ? 'border-green-200 bg-green-50 hover:bg-green-100'
                        : 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                    }`}
                    title={e.note[lang]}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded px-1 text-[10px] font-bold ${e.kind === 'national' ? 'bg-green-600 text-white' : 'bg-amber-500 text-white'}`}>
                        {e.kind === 'national' ? t.national : t.local}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{e.name[lang]}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">{t.deadline} {e.window} · {e.note[lang]}</div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mx-auto max-w-2xl text-center text-[11px] leading-relaxed text-gray-400">
        {t.disclaimer}
        {' '}<a href={HOMETAX} target="_blank" rel="noopener noreferrer" className="underline">Hometax</a>
        {' · '}<a href={WETAX} target="_blank" rel="noopener noreferrer" className="underline">Wetax</a>
      </p>
    </div>
  );
}
