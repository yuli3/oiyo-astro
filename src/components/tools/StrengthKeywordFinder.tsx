import { useState, useMemo, useCallback } from 'react';
import type { Locale } from '../../i18n';

/**
 * Strength Keyword Finder — pick inspiring verbs & nouns that resonate,
 * and assemble your "strength keyword" card. Reflection tool (no scoring).
 * ko-first; other locales fall back to the en word pool / labels.
 */

interface Pools {
  verbs: string[];
  nouns: string[];
}

// ── Word pools (ko rich, en fallback) ─────────────────────────────────────────
const POOLS: Partial<Record<Locale, Pools>> = {
  ko: {
    verbs: [
      '만들다', '잇다', '돌보다', '분석하다', '설득하다', '가르치다', '연결하다', '이끌다',
      '치유하다', '발견하다', '정리하다', '상상하다', '실험하다', '버티다', '지키다', '나누다',
      '디자인하다', '계획하다', '관찰하다', '응원하다', '협상하다', '기록하다', '도전하다', '조율하다',
      '듣다', '설명하다', '몰입하다', '개선하다', '연구하다', '표현하다', '복구하다', '성장하다',
    ],
    nouns: [
      '질서', '자유', '연결', '성장', '정직', '용기', '호기심', '균형',
      '공감', '책임', '창의', '끈기', '신뢰', '진정성', '배움', '평온',
      '모험', '정밀함', '유머', '리더십', '봉사', '독립', '협력', '아름다움',
      '효율', '깊이', '안정', '변화', '집중', '관대함', '열정', '지혜',
    ],
  },
  en: {
    verbs: [
      'create', 'connect', 'care', 'analyze', 'persuade', 'teach', 'lead', 'heal',
      'discover', 'organize', 'imagine', 'experiment', 'endure', 'protect', 'share', 'design',
      'plan', 'observe', 'encourage', 'negotiate', 'record', 'challenge', 'listen', 'explain',
      'focus', 'improve', 'research', 'express', 'restore', 'grow',
    ],
    nouns: [
      'order', 'freedom', 'connection', 'growth', 'honesty', 'courage', 'curiosity', 'balance',
      'empathy', 'responsibility', 'creativity', 'persistence', 'trust', 'authenticity', 'learning', 'calm',
      'adventure', 'precision', 'humor', 'leadership', 'service', 'independence', 'collaboration', 'beauty',
      'efficiency', 'depth', 'stability', 'change', 'focus', 'wisdom',
    ],
  },
};

interface UiLabels {
  title: string;
  subtitle: string;
  verbsLabel: string;
  nounsLabel: string;
  pickHint: string;
  shuffle: string;
  reveal: string;
  reset: string;
  cardTitle: string;
  cardLead: string;
  empty: string;
  copy: string;
  copied: string;
  reflectTitle: string;
  reflect: string[];
}

const L: Partial<Record<Locale, UiLabels>> = {
  ko: {
    title: '강점 키워드 찾기',
    subtitle: '끌리는 동사와 명사를 골라보세요. 정답은 없습니다 — 고른 단어가 곧 지금의 당신입니다.',
    verbsLabel: '끌리는 동사 (행동)',
    nounsLabel: '끌리는 명사 (가치)',
    pickHint: '마음이 가는 단어를 자유롭게 누르세요(여러 개 가능).',
    shuffle: '🎲 다른 단어 보기',
    reveal: '✨ 나의 강점 키워드 보기',
    reset: '다시 고르기',
    cardTitle: '✨ 나의 강점 키워드',
    cardLead: '당신이 고른 단어들이 모인 지금의 당신입니다.',
    empty: '먼저 끌리는 단어를 골라주세요.',
    copy: '키워드 복사',
    copied: '복사됐어요!',
    reflectTitle: '아직도 모르는 나에게',
    reflect: [
      '이 단어들이 잘 드러나는 순간은 언제였나요?',
      '고르지 않은 단어 중, 오히려 키우고 싶은 건 무엇인가요?',
      '이 강점을 더 쓸 수 있는 자리는 어디일까요?',
    ],
  },
  en: {
    title: 'Find Your Strength Keywords',
    subtitle: 'Pick the verbs and nouns that pull at you. There is no right answer — the words you choose are who you are now.',
    verbsLabel: 'Verbs that resonate (actions)',
    nounsLabel: 'Nouns that resonate (values)',
    pickHint: 'Tap any words that feel like you (multiple allowed).',
    shuffle: '🎲 Show other words',
    reveal: '✨ Reveal my strength keywords',
    reset: 'Start over',
    cardTitle: '✨ My Strength Keywords',
    cardLead: 'The words you chose, gathered into who you are now.',
    empty: 'Pick a few words that resonate first.',
    copy: 'Copy keywords',
    copied: 'Copied!',
    reflectTitle: 'For the you still undiscovered',
    reflect: [
      'When did these words show up most clearly?',
      'Among the words you did not pick, which would you like to grow?',
      'Where could you use these strengths more?',
    ],
  },
};

interface Props {
  locale: Locale;
}

export default function StrengthKeywordFinder({ locale }: Props) {
  const t = L[locale] ?? L.en!;
  const pool = POOLS[locale] ?? POOLS.en!;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0);

  // Show a window of words; shuffle reveals a different slice (the "undiscovered").
  const visible = useMemo(() => {
    const rot = (arr: string[]) => {
      const k = (seed * 8) % arr.length;
      return [...arr.slice(k), ...arr.slice(0, k)];
    };
    return { verbs: rot(pool.verbs).slice(0, 20), nouns: rot(pool.nouns).slice(0, 20) };
  }, [pool, seed]);

  const toggle = useCallback((w: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(w) ? next.delete(w) : next.add(w);
      return next;
    });
    setRevealed(false);
  }, []);

  const chosen = [...selected];
  const copyText = () => {
    navigator.clipboard
      .writeText(`${t.cardTitle}: ${chosen.join(' · ')} — oiyo.net`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      });
  };

  const chip = (w: string) => {
    const on = selected.has(w);
    return (
      <button
        key={w}
        type="button"
        onClick={() => toggle(w)}
        aria-pressed={on}
        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
          on
            ? 'border-green-600 bg-green-600 text-white'
            : 'border-green-200 bg-card text-green-800 hover:border-green-400'
        }`}
      >
        {w}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-green-100 bg-card p-5">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-2 leading-7 text-green-700">{t.subtitle}</p>
      <p className="mt-1 text-sm text-green-600/80">{t.pickHint}</p>

      <div className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-green-800">{t.verbsLabel}</h2>
        <div className="mt-2 flex flex-wrap gap-2">{visible.verbs.map(chip)}</div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-green-800">{t.nounsLabel}</h2>
        <div className="mt-2 flex flex-wrap gap-2">{visible.nouns.map(chip)}</div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="rounded-full border border-green-200 bg-card px-4 py-2 text-sm font-semibold text-green-800 hover:border-green-400"
        >
          {t.shuffle}
        </button>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t.reveal}
        </button>
        {selected.size > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelected(new Set());
              setRevealed(false);
            }}
            className="rounded-full border border-green-200 bg-card px-4 py-2 text-sm font-medium text-green-700 hover:border-green-400"
          >
            {t.reset}
          </button>
        )}
      </div>

      {revealed && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-surface-subtle p-5">
          {chosen.length === 0 ? (
            <p className="text-green-800">{t.empty}</p>
          ) : (
            <>
              <h3 className="text-lg font-bold text-foreground">{t.cardTitle}</h3>
              <p className="mt-1 text-sm text-green-700">{t.cardLead}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {chosen.map((w) => (
                  <span key={w} className="rounded-full bg-green-700 px-3 py-1 text-sm font-semibold text-white">
                    {w}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={copyText}
                className="mt-4 rounded-full border border-green-300 bg-card px-4 py-1.5 text-sm font-semibold text-green-800 hover:border-green-500"
              >
                {copied ? t.copied : t.copy}
              </button>

              <div className="mt-5 border-t border-green-200 pt-4">
                <h4 className="text-sm font-bold text-green-900">{t.reflectTitle}</h4>
                <ul className="mt-2 space-y-1.5 text-sm leading-6 text-green-800">
                  {t.reflect.map((q) => (
                    <li key={q}>• {q}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
