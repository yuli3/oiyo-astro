import { useState, useMemo, useCallback } from 'react';
import type { Locale } from '../../i18n';

/**
 * Lotto Win Simulator — "if you won, what would you do?" Spend a jackpot
 * across a catalog (home/car/travel/giving/saving) and watch the balance.
 * For-fun retention tool. ko-first (KRW); en fallback (USD-ish scaled).
 */

interface Item { name: string; emoji: string; price: number; cat: string; }

// ko: KRW won. Prices are illustrative.
const CATALOG: Partial<Record<Locale, Item[]>> = {
  ko: [
    { name: '서울 아파트', emoji: '🏢', price: 1_500_000_000, cat: '집' },
    { name: '지방 아파트', emoji: '🏠', price: 400_000_000, cat: '집' },
    { name: '전세 보증금', emoji: '🔑', price: 300_000_000, cat: '집' },
    { name: '수입 스포츠카', emoji: '🏎️', price: 200_000_000, cat: '차' },
    { name: '국산 SUV', emoji: '🚙', price: 50_000_000, cat: '차' },
    { name: '세계일주', emoji: '🌍', price: 100_000_000, cat: '여행' },
    { name: '해외여행 1주', emoji: '✈️', price: 5_000_000, cat: '여행' },
    { name: '최신 노트북', emoji: '💻', price: 3_000_000, cat: '전자기기' },
    { name: '대형 OLED TV', emoji: '📺', price: 4_000_000, cat: '전자기기' },
    { name: '명품 시계', emoji: '⌚', price: 20_000_000, cat: '사치' },
    { name: '명품 가방', emoji: '👜', price: 8_000_000, cat: '사치' },
    { name: '부모님 효도', emoji: '🎁', price: 100_000_000, cat: '가족' },
    { name: '기부', emoji: '💛', price: 100_000_000, cat: '나눔' },
    { name: '예금/저축', emoji: '🏦', price: 500_000_000, cat: '저축' },
    { name: '주식·ETF 투자', emoji: '📈', price: 300_000_000, cat: '저축' },
  ],
  en: [
    { name: 'City Apartment', emoji: '🏢', price: 1_500_000, cat: 'Home' },
    { name: 'Suburb House', emoji: '🏠', price: 400_000, cat: 'Home' },
    { name: 'Sports Car', emoji: '🏎️', price: 200_000, cat: 'Car' },
    { name: 'SUV', emoji: '🚙', price: 50_000, cat: 'Car' },
    { name: 'World Trip', emoji: '🌍', price: 100_000, cat: 'Travel' },
    { name: '1-week Trip', emoji: '✈️', price: 5_000, cat: 'Travel' },
    { name: 'Laptop', emoji: '💻', price: 3_000, cat: 'Tech' },
    { name: 'OLED TV', emoji: '📺', price: 4_000, cat: 'Tech' },
    { name: 'Luxury Watch', emoji: '⌚', price: 20_000, cat: 'Luxury' },
    { name: 'Gift for Parents', emoji: '🎁', price: 100_000, cat: 'Family' },
    { name: 'Donation', emoji: '💛', price: 100_000, cat: 'Giving' },
    { name: 'Savings', emoji: '🏦', price: 500_000, cat: 'Saving' },
    { name: 'Invest (ETF)', emoji: '📈', price: 300_000, cat: 'Saving' },
  ],
};

const JACKPOTS: Partial<Record<Locale, { label: string; amount: number }[]>> = {
  ko: [
    { label: '1등 (실수령 약 13억)', amount: 1_300_000_000 },
    { label: '2등 (약 4천만)', amount: 40_000_000 },
    { label: '연금복권 (월 700×20년)', amount: 1_680_000_000 },
  ],
  en: [
    { label: 'Jackpot (~$1.3M)', amount: 1_300_000 },
    { label: '2nd prize (~$40K)', amount: 40_000 },
  ],
};

interface UiLabels {
  title: string; subtitle: string; pickJackpot: string; balance: string;
  spent: string; over: string; result: string; reset: string; nothingLeft: string; bought: string;
}
const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '로또 당첨 시뮬레이터', subtitle: '당첨되면 뭐부터 할까? 당첨금을 골라 마음껏 써보세요.',
    pickJackpot: '당첨 등수', balance: '남은 금액', spent: '쓴 금액', over: '예산 초과!',
    result: '내 당첨금 사용 내역', reset: '초기화', nothingLeft: '잔액이 부족해요', bought: '구매함',
  },
  en: {
    title: 'Lotto Win Simulator', subtitle: 'If you won, what first? Pick a prize and spend it however you like.',
    pickJackpot: 'Prize tier', balance: 'Balance', spent: 'Spent', over: 'Over budget!',
    result: 'Your spending', reset: 'Reset', nothingLeft: 'Not enough balance', bought: 'bought',
  },
};

interface Props { locale: Locale; }

export default function LottoWinSimulator({ locale }: Props) {
  const t = L[locale] ?? L.en!;
  const catalog = CATALOG[locale] ?? CATALOG.en!;
  const jackpots = JACKPOTS[locale] ?? JACKPOTS.en!;
  const currency = locale === 'ko' ? '원' : '$';
  const numLocale = locale === 'ko' ? 'ko-KR' : 'en-US';

  const [jackpot, setJackpot] = useState(jackpots[0].amount);
  const [cart, setCart] = useState<Record<string, number>>({});

  const spent = useMemo(
    () => catalog.reduce((s, it) => s + (cart[it.name] ?? 0) * it.price, 0),
    [cart, catalog],
  );
  const balance = jackpot - spent;
  const fmt = (n: number) => new Intl.NumberFormat(numLocale).format(n);

  const add = useCallback((it: Item) => {
    setCart((c) => {
      if (balance < it.price) return c;
      return { ...c, [it.name]: (c[it.name] ?? 0) + 1 };
    });
  }, [balance]);
  const remove = (it: Item) => setCart((c) => {
    const n = (c[it.name] ?? 0) - 1;
    const next = { ...c };
    if (n <= 0) delete next[it.name]; else next[it.name] = n;
    return next;
  });

  const owned = catalog.filter((it) => (cart[it.name] ?? 0) > 0);

  return (
    <div className="rounded-2xl border border-green-100 bg-card p-5">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>

      {/* Jackpot picker */}
      <div className="mt-4">
        <span className="text-xs font-bold uppercase tracking-wider text-green-800">{t.pickJackpot}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {jackpots.map((j) => (
            <button key={j.label} type="button"
              onClick={() => { setJackpot(j.amount); setCart({}); }}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${jackpot === j.amount ? 'border-green-600 bg-primary text-primary-foreground' : 'border-green-200 bg-card text-green-800 hover:border-green-400'}`}>
              {j.label}
            </button>
          ))}
        </div>
      </div>

      {/* Balance bar */}
      <div className="sticky top-2 z-10 mt-4 rounded-2xl border border-green-200 bg-surface-subtle p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-green-800">{t.balance}</span>
          <span className={`font-mono text-2xl font-extrabold ${balance < 0 ? 'text-red-600' : 'text-green-900'}`}>{fmt(balance)}{currency}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-green-200">
          <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, (balance / jackpot) * 100))}%` }}></div>
        </div>
        <div className="mt-1 text-right text-xs text-green-600">{t.spent}: {fmt(spent)}{currency}</div>
      </div>

      {/* Catalog */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {catalog.map((it) => {
          const cnt = cart[it.name] ?? 0;
          const cant = balance < it.price;
          return (
            <div key={it.name} className="flex items-center justify-between rounded-xl border border-green-100 bg-card p-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-foreground">{it.emoji} {it.name}</div>
                <div className="text-xs text-green-600">{fmt(it.price)}{currency}{cnt > 0 ? ` · ×${cnt}` : ''}</div>
              </div>
              <div className="flex items-center gap-1">
                {cnt > 0 && (
                  <button type="button" onClick={() => remove(it)} className="h-8 w-8 rounded-full border border-green-200 text-green-700 hover:border-green-400">−</button>
                )}
                <button type="button" onClick={() => add(it)} disabled={cant}
                  className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-30">+</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result */}
      {owned.length > 0 && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-surface-subtle p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">{t.result}</h2>
            <button type="button" onClick={() => setCart({})} className="text-xs text-green-600 hover:text-green-800">{t.reset}</button>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-green-800">
            {owned.map((it) => (
              <li key={it.name} className="flex justify-between">
                <span>{it.emoji} {it.name} ×{cart[it.name]}</span>
                <span className="font-mono">{fmt(it.price * (cart[it.name] ?? 0))}{currency}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
