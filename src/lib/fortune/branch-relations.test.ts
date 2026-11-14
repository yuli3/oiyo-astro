import { describe, expect, it } from 'vitest';

import { relationBetween, relationsOf } from './branch-relations';
import { relationTo2027 } from '../new-year-2027';

describe('branch relations', () => {
  it('is symmetric', () => {
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) expect(relationBetween(a, b)).toEqual(relationBetween(b, a));
  });
  it('goat (未) matches the 2027 relation table', () => {
    const r = relationsOf(7);
    expect(r.trine.sort((x, y) => x - y)).toEqual([3, 11]);
    expect(r.pair).toEqual([6]);
    expect(r.clash).toEqual([1]);
    expect(r.harm).toEqual([0]);
    expect(r.punish.sort((x, y) => x - y)).toEqual([1, 10]);
    for (let a = 0; a < 12; a++) {
      const rel = relationTo2027(a);
      const between = relationBetween(a, 7);
      if (rel === 'harmony') expect(between.some((k) => k === 'trine' || k === 'pair')).toBe(true);
      if (rel === 'clash') expect(between).toContain('clash');
      if (rel === 'harm') expect(between).toContain('harm');
      if (rel === 'punish') expect(between).toContain('punish');
      if (rel === 'none') expect(between).toEqual([]);
    }
  });
  it('every animal has one clash and one pair', () => {
    for (let a = 0; a < 12; a++) {
      expect(relationsOf(a).clash).toHaveLength(1);
      expect(relationsOf(a).pair).toHaveLength(1);
      expect(relationsOf(a).trine).toHaveLength(2);
    }
  });
});
