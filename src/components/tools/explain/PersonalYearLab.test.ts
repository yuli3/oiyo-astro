import { describe, expect, it } from 'vitest';

import { digitSteps } from './PersonalYearLab';
import { personalYearOf } from '@/lib/symbolic-tradition/numerology';

describe('digitSteps', () => {
  it('reduces to one digit', () => {
    expect(digitSteps(2027)).toEqual([{ text: '2+0+2+7=11', value: 11 }, { text: '1+1=2', value: 2 }]);
    expect(digitSteps(7)).toEqual([]);
  });
  it('matches personalYearOf for every month/day in 2027', () => {
    const last = (n: number) => { const s = digitSteps(n); return s.length ? s[s.length - 1].value : n; };
    for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d++) {
      const pad = (n: number) => String(n).padStart(2, '0');
      expect(last(last(m) + last(d) + last(2027))).toBe(personalYearOf(`2000-${pad(m)}-${pad(d)}`, '2027-06-01'));
    }
  });
});
