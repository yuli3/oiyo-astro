import { useState, useMemo } from 'react';
import type { Locale } from '../../i18n';

/**
 * 해외금융계좌 신고 대상 자가진단 (Korea overseas financial account reporting check).
 * Korea requires residents to report overseas financial accounts when the
 * aggregate balance on ANY month-end day exceeds ₩500M. This tool converts
 * per-account foreign balances to KRW, aggregates them, and (optionally) finds
 * the peak month-end to determine the reporting obligation and basis date.
 *
 * Privacy: all input stays in memory only — nothing is saved or transmitted.
 */

interface Props { locale: Locale; }
type L<T> = Partial<Record<Locale, T>>;
const tt = <T,>(m: L<T>, locale: Locale): T => (m[locale] ?? m.en) as T;

const THRESHOLD = 500_000_000; // ₩5억

interface Account { id: number; type: string; currency: string; fx: string; amount: string; }

// Representative currencies (subset of NTS 고시환율 list). fx = KRW per 1 unit.
const CURRENCIES = ['USD', 'CNH', 'JPY(100)', 'EUR', 'GBP', 'HKD', 'AUD', 'CAD', 'CHF', 'SGD', 'VND(100)', 'THB', 'KRW'];

const TYPES: L<{ key: string; label: string }[]> = {
  ko: [
    { key: 'deposit', label: '예금·적금' }, { key: 'stock', label: '주식(해외주식·RSU 등)' },
    { key: 'fund', label: '펀드·증권' }, { key: 'bond', label: '채권' },
    { key: 'insurance', label: '보험' }, { key: 'crypto', label: '가상자산' },
    { key: 'derivative', label: '파생상품' }, { key: 'other', label: '기타 금융자산' },
  ],
  en: [
    { key: 'deposit', label: 'Deposit/Savings' }, { key: 'stock', label: 'Stock (foreign equity, RSU…)' },
    { key: 'fund', label: 'Fund/Securities' }, { key: 'bond', label: 'Bond' },
    { key: 'insurance', label: 'Insurance' }, { key: 'crypto', label: 'Virtual asset' },
    { key: 'derivative', label: 'Derivative' }, { key: 'other', label: 'Other financial asset' },
  ],
};

const T: Record<string, L<string>> = {
  title: { ko: '해외금융계좌 신고 대상 자가진단', en: 'Overseas Financial Account Reporting Checker' },
  intro: {
    ko: '거주자·내국법인은 보유한 모든 해외금융계좌(예금·주식·펀드·보험·가상자산 등)의 합계가 매월 말일 중 하루라도 5억원을 초과하면, 다음 해 6월에 신고할 의무가 있습니다. 계좌를 입력해 합계와 신고 여부를 확인해 보세요.',
    en: 'Korean residents and domestic corporations must report all overseas financial accounts (deposits, stocks, funds, insurance, virtual assets…) when the aggregate exceeds ₩500M on any month-end day. Enter accounts to check your total and obligation.',
  },
  account: { ko: '계좌', en: 'Account' },
  type: { ko: '자산 유형', en: 'Asset type' },
  currency: { ko: '통화', en: 'Currency' },
  fx: { ko: '환율(원/외화)', en: 'FX (KRW/unit)' },
  amount: { ko: '잔액(외화)', en: 'Balance (foreign)' },
  krw: { ko: '원화 환산', en: 'KRW value' },
  add: { ko: '+ 계좌 추가', en: '+ Add account' },
  remove: { ko: '삭제', en: 'Remove' },
  total: { ko: '합계(원화)', en: 'Total (KRW)' },
  thresholdNote: { ko: '신고 기준: 5억원 초과', en: 'Threshold: over ₩500M' },
  over: { ko: '이 시점 합계가 5억원을 초과합니다 → 신고 대상일 수 있습니다.', en: 'This total exceeds ₩500M → you may be required to report.' },
  under: { ko: '이 시점 합계는 5억원 이하입니다.', en: 'This total is at or below ₩500M.' },
  peakTitle: { ko: '월별 피크 찾기 (선택)', en: 'Find the peak month (optional)' },
  peakSub: {
    ko: '실제 신고 기준은 “매월 말일 합계 중 최댓값”입니다. 각 월말의 전체 해외계좌 합계(원화)를 넣으면 최대 월을 찾아줍니다.',
    en: 'The official test uses the maximum across all month-end totals. Enter each month-end aggregate (KRW) to find the peak.',
  },
  peakResult: { ko: '최대 월말 합계', en: 'Peak month-end total' },
  basisDate: { ko: '신고 기준일', en: 'Reporting basis date' },
  monthEnd: { ko: '월말', en: 'month-end' },
  reportYes: { ko: '신고 대상입니다', en: 'Reporting required' },
  reportNo: { ko: '신고 대상이 아닙니다', en: 'Not required' },
  reportYesDesc: {
    ko: '매월 말일 중 합계가 5억원을 초과하는 달이 있습니다. 가장 큰 달의 말일이 신고 기준일이며, 그 날 보유한 계좌를 다음 해 6월 1~30일에 홈택스로 신고하세요.',
    en: 'At least one month-end total exceeds ₩500M. The largest month-end is the basis date; report the accounts held that day via Hometax in June of the following year.',
  },
  reportNoDesc: { ko: '어느 월말에도 합계가 5억원을 넘지 않으면 신고 의무가 없습니다.', en: 'If no month-end total exceeds ₩500M, there is no obligation.' },
  disclaimer: {
    ko: '이 도구는 일반적인 정보 제공용 자가진단이며 세무 자문이나 공식 판정이 아닙니다. 환율은 매월 말일의 기준환율(국세청 고시)을 사용해야 하고, 차명·공동·법인 계좌 등 세부 규정이 있습니다. 정확한 신고는 국세청 안내와 세무 전문가를 확인하세요.',
    en: 'This is general-information self-assessment, not tax advice or an official determination. Use the official month-end reference FX rate; special rules apply to nominee/joint/corporate accounts. Confirm with the NTS and a tax professional.',
  },
  official: { ko: '국세청 해외금융계좌 신고 안내', en: 'NTS overseas account reporting guide' },
};

const MONTHS_KO = ['1월말', '2월말', '3월말', '4월말', '5월말', '6월말', '7월말', '8월말', '9월말', '10월말', '11월말', '12월말'];

function fmt(n: number): string {
  if (!isFinite(n)) return '0';
  return Math.round(n).toLocaleString('ko-KR');
}

export default function ForeignAccountReportChecker({ locale }: Props) {
  const t = (k: string) => tt(T[k], locale);
  const types = tt(TYPES, locale);
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, type: 'stock', currency: 'USD', fx: '1380', amount: '' },
  ]);
  const [nextId, setNextId] = useState(2);
  const [months, setMonths] = useState<string[]>(Array(12).fill(''));
  const [showPeak, setShowPeak] = useState(false);

  const krwOf = (a: Account) => (parseFloat(a.amount) || 0) * (parseFloat(a.fx) || 0);
  const total = useMemo(() => accounts.reduce((s, a) => s + krwOf(a), 0), [accounts]);
  const over = total > THRESHOLD;

  const peak = useMemo(() => {
    let maxVal = -1, maxIdx = -1;
    months.forEach((m, i) => { const v = parseFloat(m.replace(/,/g, '')) || 0; if (v > maxVal) { maxVal = v; maxIdx = i; } });
    return { maxVal, maxIdx };
  }, [months]);
  const peakOver = peak.maxVal > THRESHOLD;
  const anyMonthEntered = months.some((m) => (parseFloat(m.replace(/,/g, '')) || 0) > 0);

  const update = (id: number, k: keyof Account, v: string) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, [k]: v } : a)));
  const addAcct = () => { setAccounts((p) => [...p, { id: nextId, type: 'deposit', currency: 'USD', fx: '1380', amount: '' }]); setNextId((n) => n + 1); };
  const removeAcct = (id: number) => setAccounts((p) => (p.length > 1 ? p.filter((a) => a.id !== id) : p));

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-5">
      <h1 className="text-2xl font-bold text-green-950">{t('title')}</h1>
      <p className="mt-3 leading-7 text-green-800">{t('intro')}</p>

      {/* Accounts */}
      <div className="mt-6 space-y-3">
        {accounts.map((a, i) => (
          <div key={a.id} className="rounded-xl border border-green-100 bg-green-50/50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-green-800">{t('account')} {i + 1}</span>
              <button type="button" onClick={() => removeAcct(a.id)} className="text-xs text-green-400 hover:text-red-500">{t('remove')}</button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <label className="text-xs text-green-700">
                {t('type')}
                <select value={a.type} onChange={(e) => update(a.id, 'type', e.target.value)} className="mt-1 w-full rounded-lg border border-green-200 bg-white px-2 py-1.5 text-sm text-green-950">
                  {types.map((ty) => <option key={ty.key} value={ty.key}>{ty.label}</option>)}
                </select>
              </label>
              <label className="text-xs text-green-700">
                {t('currency')}
                <select value={a.currency} onChange={(e) => update(a.id, 'currency', e.target.value)} className="mt-1 w-full rounded-lg border border-green-200 bg-white px-2 py-1.5 text-sm text-green-950">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="text-xs text-green-700">
                {t('fx')}
                <input inputMode="decimal" value={a.fx} onChange={(e) => update(a.id, 'fx', e.target.value)} className="mt-1 w-full rounded-lg border border-green-200 bg-white px-2 py-1.5 text-sm text-green-950" />
              </label>
              <label className="text-xs text-green-700">
                {t('amount')}
                <input inputMode="decimal" value={a.amount} onChange={(e) => update(a.id, 'amount', e.target.value)} placeholder="0" className="mt-1 w-full rounded-lg border border-green-200 bg-white px-2 py-1.5 text-sm text-green-950" />
              </label>
            </div>
            <div className="mt-2 text-right text-sm text-green-600">{t('krw')}: <span className="font-semibold text-green-800">₩{fmt(krwOf(a))}</span></div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addAcct} className="mt-3 rounded-full border border-green-300 px-4 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50">{t('add')}</button>

      {/* Total + verdict */}
      <div className={`mt-5 rounded-2xl border p-4 ${over ? 'border-amber-300 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-green-800">{t('total')}</span>
          <span className="text-2xl font-bold text-green-950">₩{fmt(total)}</span>
        </div>
        <p className="mt-1 text-xs text-green-600">{t('thresholdNote')}</p>
        <p className={`mt-2 text-sm font-medium ${over ? 'text-amber-800' : 'text-green-700'}`}>{over ? t('over') : t('under')}</p>
      </div>

      {/* Peak finder */}
      <button type="button" onClick={() => setShowPeak((s) => !s)} className="mt-5 text-sm font-semibold text-green-700 underline">
        {showPeak ? '▾ ' : '▸ '}{t('peakTitle')}
      </button>
      {showPeak && (
        <div className="mt-3 rounded-2xl border border-green-100 bg-green-50/40 p-4">
          <p className="text-xs leading-5 text-green-700">{t('peakSub')}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {months.map((m, i) => (
              <label key={i} className="text-xs text-green-700">
                {locale === 'ko' ? MONTHS_KO[i] : `${i + 1} ${t('monthEnd')}`}
                <input inputMode="decimal" value={m} onChange={(e) => setMonths((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))} placeholder="₩0" className="mt-1 w-full rounded-lg border border-green-200 bg-white px-2 py-1.5 text-sm text-green-950" />
              </label>
            ))}
          </div>
          {anyMonthEntered && (
            <div className="mt-3 rounded-xl bg-white p-3 text-sm">
              <p className="text-green-700">{t('peakResult')}: <span className="font-bold text-green-950">₩{fmt(peak.maxVal)}</span> ({locale === 'ko' ? MONTHS_KO[peak.maxIdx] : `${peak.maxIdx + 1} ${t('monthEnd')}`})</p>
              <p className={`mt-1 font-semibold ${peakOver ? 'text-amber-800' : 'text-green-700'}`}>{peakOver ? `✅ ${t('reportYes')}` : `${t('reportNo')}`}</p>
              {peakOver && <p className="mt-1 text-xs leading-5 text-green-700">{t('basisDate')}: {locale === 'ko' ? MONTHS_KO[peak.maxIdx] : `${peak.maxIdx + 1} ${t('monthEnd')}`} · {t('reportYesDesc')}</p>}
              {!peakOver && <p className="mt-1 text-xs leading-5 text-green-700">{t('reportNoDesc')}</p>}
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">{t('disclaimer')}</p>
      <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2235&cntntsId=7720" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-medium text-green-700 underline">{t('official')} →</a>
    </div>
  );
}
