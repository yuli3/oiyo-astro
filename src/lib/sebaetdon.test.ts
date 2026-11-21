import { describe, expect, it } from 'vitest';
import { BLESSINGS, billsFor, planSebaetdon, SEOL_DATE, SEOL_HOLIDAYS, SEOL_YEAR } from './sebaetdon';

describe('sebaetdon', () => {
  it('2027 설날 is Sunday 7 February and the holiday runs 6-9 Feb', () => {
    const d = new Date(Date.UTC(SEOL_YEAR, SEOL_DATE.month - 1, SEOL_DATE.day));
    expect(d.getUTCDay()).toBe(0);
    expect(SEOL_HOLIDAYS).toEqual(['2027-02-06', '2027-02-07', '2027-02-08', '2027-02-09']);
    // 대체공휴일 2/9 는 화요일
    expect(new Date('2027-02-09T00:00:00Z').getUTCDay()).toBe(2);
  });

  it('splits one envelope into bills', () => {
    expect(billsFor(30000)).toEqual({ 50000: 0, 10000: 3, 5000: 0, 1000: 0 });
    expect(billsFor(150000)).toEqual({ 50000: 3, 10000: 0, 5000: 0, 1000: 0 });
    expect(billsFor(150000, false)).toEqual({ 50000: 0, 10000: 15, 5000: 0, 1000: 0 });
    expect(billsFor(16000)).toEqual({ 50000: 0, 10000: 1, 5000: 1, 1000: 1 });
  });

  it('rejects amounts that are not whole thousands', () => {
    expect(() => billsFor(1500)).toThrow(RangeError);
    expect(() => billsFor(-1000)).toThrow(RangeError);
  });

  it('plans totals and new-bill counts across groups', () => {
    const r = planSebaetdon([
      { groupId: 'elementary', count: 3, amount: 30000 },
      { groupId: 'teen', count: 2, amount: 50000 },
      { groupId: 'parents', count: 2, amount: 200000 },
      { groupId: 'adult', count: 0, amount: 100000 },
    ]);
    expect(r.envelopes).toBe(7);
    expect(r.total).toBe(90000 + 100000 + 400000);
    expect(r.bills).toEqual({ 50000: 10, 10000: 9, 5000: 0, 1000: 0 });
    expect(r.byGroup).toHaveLength(3);
  });

  it('has blessings for every recipient kind', () => {
    for (const g of ['child', 'teen', 'adult', 'elder'] as const) {
      expect(BLESSINGS.some((b) => b.forGroup === g)).toBe(true);
    }
  });
});
