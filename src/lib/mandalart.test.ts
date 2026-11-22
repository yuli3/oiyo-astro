import { describe, expect, it } from 'vitest';
import { cellText, emptyMandalart, filledCount, gridRows, normalizeMandalart, wrapText } from './mandalart';

describe('mandalart', () => {
  const m = emptyMandalart();
  m.goal = 'G';
  m.subs = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'];
  m.actions[0][0] = 'a00';
  m.actions[7][7] = 'a77';

  it('mirrors sub-goals in the center block and in each outer block center', () => {
    expect(cellText(m, 4, 4)).toBe('G');
    expect(cellText(m, 4, 0)).toBe('s0');
    expect(cellText(m, 4, 5)).toBe('s4');
    expect(cellText(m, 0, 4)).toBe('s0');
    expect(cellText(m, 5, 4)).toBe('s4');
    expect(cellText(m, 8, 4)).toBe('s7');
  });

  it('lays out the 9x9 grid: center is the goal, corners are first/last actions', () => {
    const rows = gridRows(m);
    expect(rows[4][4]).toBe('G');
    expect(rows[0][0]).toBe('a00');
    expect(rows[8][8]).toBe('a77');
    expect(rows[1][1]).toBe('s0');
    expect(rows[3][3]).toBe('s0');
  });

  it('counts 73 distinct cells', () => {
    expect(filledCount(emptyMandalart())).toEqual({ filled: 0, total: 73 });
    expect(filledCount(m).filled).toBe(11);
  });

  it('normalizes untrusted stored data', () => {
    const n = normalizeMandalart({ goal: 'x'.repeat(100), subs: [1, 'ok'], actions: [['a', null]] });
    expect(n.goal.length).toBe(40);
    expect(n.subs.slice(0, 2)).toEqual(['', 'ok']);
    expect(n.actions[0].slice(0, 2)).toEqual(['a', '']);
    expect(n.actions).toHaveLength(8);
    expect(normalizeMandalart('garbage')).toEqual(emptyMandalart());
  });

  it('wraps CJK without spaces and Latin by words, with ellipsis', () => {
    expect(wrapText('주3회30분걷기', 4, 4)).toEqual(['주3회3', '0분걷기']);
    expect(wrapText('Walk 30 min 3x a week', 10, 4)).toEqual(['Walk 30', 'min 3x a', 'week']);
    expect(wrapText('abcdefghij', 3, 2)).toEqual(['abc', 'de…']);
  });
});
