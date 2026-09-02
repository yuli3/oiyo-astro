import { useState } from 'react';
import type { Locale } from '../../i18n';

/**
 * Money Parking Guide — pick your goal, see which vehicle fits + why.
 * Educational (not investment advice). ko-first; en fallback.
 */

interface Vehicle {
  key: string;
  name: string;
  liquidity: string; // 유동성
  risk: string;      // 위험
  note: string;      // 특징
  goals: string[];   // matching goal keys
}

const VEHICLES: Partial<Record<Locale, Vehicle[]>> = {
  ko: [
    { key: 'parking', name: '파킹통장', liquidity: '즉시', risk: '매우 낮음', note: '수시 입출금 + 일반 통장보다 높은 금리. 비상금·대기자금에.', goals: ['emergency', 'short'] },
    { key: 'cma', name: 'CMA', liquidity: '높음', risk: '낮음', note: '증권사 계좌, 하루만 맡겨도 이자. 대기·단기 자금에. (RP형 등 종류 확인)', goals: ['emergency', 'short'] },
    { key: 'deposit', name: '예·적금', liquidity: '만기까지 묶임', risk: '매우 낮음', note: '원금 보장(예금자보호 한도 내). 단기 목돈 모으기에. 중도해지 시 이자 손해.', goals: ['short'] },
    { key: 'irp', name: 'IRP / 연금저축', liquidity: '낮음(연금 인출)', risk: '선택 상품에 따라', note: '세액공제 + 과세이연. 노후 장기 자금에. 중도해지 불이익.', goals: ['retire'] },
    { key: 'etf', name: 'ETF / 투자', liquidity: '높음(거래소)', risk: '있음(원금손실 가능)', note: '장기 성장 추구. 잃어도 되는 여유·장기 자금만. 분산·적립 권장.', goals: ['invest'] },
    { key: 'isa', name: 'ISA', liquidity: '중간', risk: '담는 상품에 따라', note: '비과세 한도 + 분리과세. 예금·ETF 등을 한 계좌에 담아 절세.', goals: ['short', 'invest'] },
  ],
  en: [
    { key: 'parking', name: 'High-yield Savings', liquidity: 'Instant', risk: 'Very low', note: 'Withdraw anytime, better rate than a checking account. For emergency/idle cash.', goals: ['emergency', 'short'] },
    { key: 'cma', name: 'Cash Mgmt Account (CMA)', liquidity: 'High', risk: 'Low', note: 'Brokerage account that pays daily interest. For idle/short-term cash.', goals: ['emergency', 'short'] },
    { key: 'deposit', name: 'Term Deposit', liquidity: 'Locked to maturity', risk: 'Very low', note: 'Principal protected (within insurance limit). For short-term goals.', goals: ['short'] },
    { key: 'irp', name: 'Retirement Account (IRP/Pension)', liquidity: 'Low (pension withdrawal)', risk: 'Depends on holdings', note: 'Tax deduction + tax-deferral. For long-term retirement money.', goals: ['retire'] },
    { key: 'etf', name: 'ETF / Investing', liquidity: 'High (exchange)', risk: 'Yes (can lose principal)', note: 'For long-term growth with money you can afford to risk. Diversify & DCA.', goals: ['invest'] },
  ],
};

interface UiLabels {
  title: string; subtitle: string; goalQ: string;
  goals: { key: string; label: string }[];
  recFor: string; liquidity: string; risk: string; all: string;
  disclaimer: string;
}
const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '내 돈 어디에 둘까? — 자금 보관처 가이드',
    subtitle: '목적을 고르면 어울리는 보관처를 알려드립니다. 투자 권유가 아닌 교육용 안내입니다.',
    goalQ: '이 돈의 목적은?',
    goals: [
      { key: 'emergency', label: '비상금(즉시 인출)' },
      { key: 'short', label: '단기 목돈(1~3년)' },
      { key: 'retire', label: '노후·장기' },
      { key: 'invest', label: '불려보기(투자)' },
    ],
    recFor: '추천 보관처', liquidity: '유동성', risk: '위험', all: '전체 보기',
    disclaimer: '교육용 일반 정보이며 투자·금융 권유가 아닙니다. 상품·세제·예금자보호 한도는 변동되므로 각 금융사·공식 사이트에서 확인하세요.',
  },
  en: {
    title: 'Where should your money go? — Parking Guide',
    subtitle: 'Pick a goal to see which vehicle fits. Educational, not investment advice.',
    goalQ: 'What is this money for?',
    goals: [
      { key: 'emergency', label: 'Emergency (instant)' },
      { key: 'short', label: 'Short-term (1–3y)' },
      { key: 'retire', label: 'Retirement / long-term' },
      { key: 'invest', label: 'Grow it (invest)' },
    ],
    recFor: 'Recommended', liquidity: 'Liquidity', risk: 'Risk', all: 'Show all',
    disclaimer: 'General educational info, not financial advice. Products, tax rules, and insurance limits change — verify with each institution and official sources.',
  },
};

interface Props { locale: Locale; }

export default function MoneyParkingGuide({ locale }: Props) {
  const t = L[locale] ?? L.en!;
  const vehicles = VEHICLES[locale] ?? VEHICLES.en!;
  const [goal, setGoal] = useState<string>('');

  const shown = goal ? vehicles.filter((v) => v.goals.includes(goal)) : vehicles;

  return (
    <div className="rounded-2xl border border-green-100 bg-card p-5">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>

      <div className="mt-5">
        <span className="text-sm font-bold uppercase tracking-wider text-green-800">{t.goalQ}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => setGoal('')}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${goal === '' ? 'border-green-600 bg-primary text-primary-foreground' : 'border-green-200 bg-card text-green-800 hover:border-green-400'}`}>{t.all}</button>
          {t.goals.map((g) => (
            <button key={g.key} type="button" onClick={() => setGoal(g.key)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${goal === g.key ? 'border-green-600 bg-primary text-primary-foreground' : 'border-green-200 bg-card text-green-800 hover:border-green-400'}`}>{g.label}</button>
          ))}
        </div>
      </div>

      {goal && <p className="mt-4 text-sm font-semibold text-green-800">{t.recFor}:</p>}
      <div className="mt-3 grid gap-3">
        {shown.map((v) => (
          <div key={v.key} className="rounded-xl border border-green-100 bg-card p-4">
            <div className="font-bold text-foreground">{v.name}</div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-green-600">
              <span>{t.liquidity}: <b className="text-green-800">{v.liquidity}</b></span>
              <span>{t.risk}: <b className="text-green-800">{v.risk}</b></span>
            </div>
            <p className="mt-2 text-sm leading-6 text-green-700">{v.note}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">{t.disclaimer}</p>
    </div>
  );
}
