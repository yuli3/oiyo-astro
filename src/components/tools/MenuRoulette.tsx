import { useState, useMemo, useCallback } from 'react';
import type { Locale } from '../../i18n';

/**
 * Payday Menu Roulette — can't decide what to eat? Spin for a meal.
 * Filter by meal time and cuisine; plus a "small payday treat" idea.
 * ko-first; other locales fall back to en pools/labels.
 */

interface MenuItem {
  name: string;
  emoji: string;
  cuisine: string; // cuisine key
}

const CUISINES_KO = ['한식', '중식', '일식', '양식', '분식', '아시안', '카페'];
const CUISINES_EN = ['Korean', 'Chinese', 'Japanese', 'Western', 'Snack', 'Asian', 'Cafe'];

const MENUS: Partial<Record<Locale, MenuItem[]>> = {
  ko: [
    { name: '김치찌개', emoji: '🍲', cuisine: '한식' }, { name: '제육볶음', emoji: '🥘', cuisine: '한식' },
    { name: '비빔밥', emoji: '🍚', cuisine: '한식' }, { name: '삼겹살', emoji: '🥓', cuisine: '한식' },
    { name: '냉면', emoji: '🍜', cuisine: '한식' }, { name: '순두부찌개', emoji: '🍲', cuisine: '한식' },
    { name: '짜장면', emoji: '🍜', cuisine: '중식' }, { name: '짬뽕', emoji: '🍜', cuisine: '중식' },
    { name: '탕수육', emoji: '🍖', cuisine: '중식' }, { name: '마라탕', emoji: '🌶️', cuisine: '중식' },
    { name: '초밥', emoji: '🍣', cuisine: '일식' }, { name: '라멘', emoji: '🍜', cuisine: '일식' },
    { name: '돈카츠', emoji: '🍱', cuisine: '일식' }, { name: '규동', emoji: '🍚', cuisine: '일식' },
    { name: '파스타', emoji: '🍝', cuisine: '양식' }, { name: '스테이크', emoji: '🥩', cuisine: '양식' },
    { name: '피자', emoji: '🍕', cuisine: '양식' }, { name: '햄버거', emoji: '🍔', cuisine: '양식' },
    { name: '떡볶이', emoji: '🌶️', cuisine: '분식' }, { name: '김밥', emoji: '🍙', cuisine: '분식' },
    { name: '라면', emoji: '🍜', cuisine: '분식' }, { name: '쌀국수', emoji: '🍜', cuisine: '아시안' },
    { name: '팟타이', emoji: '🍜', cuisine: '아시안' }, { name: '커리', emoji: '🍛', cuisine: '아시안' },
    { name: '샌드위치', emoji: '🥪', cuisine: '카페' }, { name: '샐러드', emoji: '🥗', cuisine: '카페' },
    { name: '브런치', emoji: '🍳', cuisine: '카페' }, { name: '디저트 세트', emoji: '🍰', cuisine: '카페' },
  ],
  en: [
    { name: 'Kimchi Stew', emoji: '🍲', cuisine: 'Korean' }, { name: 'Bibimbap', emoji: '🍚', cuisine: 'Korean' },
    { name: 'Korean BBQ', emoji: '🥓', cuisine: 'Korean' }, { name: 'Cold Noodles', emoji: '🍜', cuisine: 'Korean' },
    { name: 'Jjajangmyeon', emoji: '🍜', cuisine: 'Chinese' }, { name: 'Mala Soup', emoji: '🌶️', cuisine: 'Chinese' },
    { name: 'Sweet & Sour Pork', emoji: '🍖', cuisine: 'Chinese' }, { name: 'Sushi', emoji: '🍣', cuisine: 'Japanese' },
    { name: 'Ramen', emoji: '🍜', cuisine: 'Japanese' }, { name: 'Tonkatsu', emoji: '🍱', cuisine: 'Japanese' },
    { name: 'Pasta', emoji: '🍝', cuisine: 'Western' }, { name: 'Steak', emoji: '🥩', cuisine: 'Western' },
    { name: 'Pizza', emoji: '🍕', cuisine: 'Western' }, { name: 'Burger', emoji: '🍔', cuisine: 'Western' },
    { name: 'Tteokbokki', emoji: '🌶️', cuisine: 'Snack' }, { name: 'Gimbap', emoji: '🍙', cuisine: 'Snack' },
    { name: 'Pho', emoji: '🍜', cuisine: 'Asian' }, { name: 'Pad Thai', emoji: '🍜', cuisine: 'Asian' },
    { name: 'Curry', emoji: '🍛', cuisine: 'Asian' }, { name: 'Sandwich', emoji: '🥪', cuisine: 'Cafe' },
    { name: 'Salad', emoji: '🥗', cuisine: 'Cafe' }, { name: 'Brunch', emoji: '🍳', cuisine: 'Cafe' },
  ],
};

const TREATS: Partial<Record<Locale, string[]>> = {
  ko: ['좋아하는 디저트 하나', '평소 미루던 영화 한 편', '버스 대신 택시 한 번', '책 한 권', '꽃 한 송이', '향초/입욕제', '안 쓰던 근육 운동 한 세트', '친구에게 커피 한 잔 쏘기'],
  en: ['a favorite dessert', 'a movie you’ve put off', 'a taxi instead of the bus', 'a new book', 'a single flower', 'a scented candle', 'one workout set', 'buy a friend a coffee'],
};

interface UiLabels {
  title: string;
  subtitle: string;
  meal: string;
  meals: string[];
  cuisine: string;
  all: string;
  spin: string;
  again: string;
  result: string;
  treatTitle: string;
  treatLead: string;
}

const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '월급날 메뉴 룰렛', subtitle: '뭐 먹지 고민될 때, 룰렛이 정해드립니다. 오늘은 나에게 한 끼 선물.',
    meal: '끼니', meals: ['점심', '저녁', '야식', '카페'], cuisine: '종류', all: '전체',
    spin: '🎰 돌리기', again: '다시 돌리기', result: '오늘은 이걸로!',
    treatTitle: '🎁 월급날 작은 사치', treatLead: '한 끼에 더해, 오늘 나에게 줄 작은 선물:',
  },
  en: {
    title: 'Payday Menu Roulette', subtitle: "Can't decide what to eat? Let the roulette pick. Treat yourself today.",
    meal: 'Meal', meals: ['Lunch', 'Dinner', 'Late-night', 'Cafe'], cuisine: 'Cuisine', all: 'All',
    spin: '🎰 Spin', again: 'Spin again', result: "Today, let's go with this!",
    treatTitle: '🎁 A small payday treat', treatLead: 'On top of a meal, a little gift for yourself today:',
  },
};

interface Props {
  locale: Locale;
}

export default function MenuRoulette({ locale }: Props) {
  const t = L[locale] ?? L.en!;
  const menus = MENUS[locale] ?? MENUS.en!;
  const treats = TREATS[locale] ?? TREATS.en!;
  const cuisines = locale === 'ko' ? CUISINES_KO : CUISINES_EN;

  const [cuisine, setCuisine] = useState<string>('');
  const [result, setResult] = useState<MenuItem | null>(null);
  const [treat, setTreat] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const pool = useMemo(
    () => (cuisine ? menus.filter((m) => m.cuisine === cuisine) : menus),
    [menus, cuisine],
  );

  const spin = useCallback(() => {
    if (pool.length === 0) return;
    setSpinning(true);
    let ticks = 0;
    const timer = setInterval(() => {
      setResult(pool[Math.floor(Math.random() * pool.length)]);
      ticks += 1;
      if (ticks > 12) {
        clearInterval(timer);
        setResult(pool[Math.floor(Math.random() * pool.length)]);
        setTreat(treats[Math.floor(Math.random() * treats.length)]);
        setSpinning(false);
      }
    }, 80);
  }, [pool, treats]);

  const btn = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
      active ? 'border-green-600 bg-green-600 text-white' : 'border-green-200 bg-white text-green-800 hover:border-green-400'
    }`;

  return (
    <div className="rounded-2xl border border-green-100 bg-white p-5">
      <h1 className="text-2xl font-bold text-green-950">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>

      <div className="mt-5">
        <span className="text-sm font-bold uppercase tracking-wider text-green-800">{t.cuisine}</span>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={btn(cuisine === '')} onClick={() => setCuisine('')}>{t.all}</button>
          {cuisines.map((cz) => (
            <button key={cz} type="button" className={btn(cuisine === cz)} onClick={() => setCuisine(cz)}>{cz}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <div className={`text-6xl ${spinning ? 'animate-pulse' : ''}`}>{result ? result.emoji : '🍽️'}</div>
        <div className="mt-3 text-2xl font-extrabold text-green-950 min-h-[2rem]">{result ? result.name : '—'}</div>
        {result && !spinning && <p className="mt-1 text-sm font-semibold text-green-600">{t.result}</p>}
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        className="mt-5 w-full rounded-full bg-green-700 px-5 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {result ? t.again : t.spin}
      </button>

      {treat && !spinning && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-white p-5">
          <h2 className="text-sm font-bold text-green-900">{t.treatTitle}</h2>
          <p className="mt-1 text-sm text-green-700">{t.treatLead}</p>
          <p className="mt-2 text-lg font-bold text-green-800">{treat}</p>
        </div>
      )}
    </div>
  );
}
