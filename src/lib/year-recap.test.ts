import { describe, expect, it } from 'vitest';

import { buildYearRecap, recapKeywordIndex } from './year-recap';
import type { StoredTestResult } from './user/test-results';

const r = (testId: string, label: string, createdAt: string): StoredTestResult => ({
  id: `${testId}:${createdAt}`,
  kind: 'psychometric',
  testId,
  title: testId,
  resultLabel: label,
  createdAt,
});

describe('year recap', () => {
  const list = [
    r('mbti', 'INFJ', '2026-03-01T00:00:00Z'),
    r('mbti', 'ENFP', '2026-10-01T00:00:00Z'),
    r('love-language', 'time', '2026-05-01T00:00:00Z'),
    r('tarot', 'Star', '2025-12-31T00:00:00Z'),
    r('grit', 'done', '2026-06-01T00:00:00Z'),
  ];

  it('keeps only this year and the latest result per test', () => {
    const recap = buildYearRecap(list, 2026);
    expect(recap.totalRuns).toBe(4);
    expect(recap.distinctTests).toBe(2);
    expect(recap.items.map((i) => i.resultLabel)).toEqual(['ENFP', 'time']);
  });

  it('gives the same keyword for the same results, regardless of order', () => {
    const a = buildYearRecap(list, 2026).items;
    expect(recapKeywordIndex(a, 12)).toBe(recapKeywordIndex([...a].reverse(), 12));
    expect(recapKeywordIndex(a, 12)).toBeGreaterThanOrEqual(0);
    expect(recapKeywordIndex(a, 12)).toBeLessThan(12);
  });
});
