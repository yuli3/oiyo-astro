import { describe, expect, it } from 'vitest';

import { scoreLoneliness } from './loneliness-score';

const reversed = [false, true, false, true, false, true, false, false, true, false];

describe('scoreLoneliness', () => {
  it('keeps the all-min reverse-scored fixture', () => {
    expect(scoreLoneliness(Array(10).fill(0), reversed)).toEqual({ level: 'moderate', score: 22 });
  });

  it('keeps the all-max reverse-scored fixture', () => {
    expect(scoreLoneliness(Array(10).fill(3), reversed)).toEqual({ level: 'moderate', score: 28 });
  });

  it('keeps connected and high mixed fixtures', () => {
    const connected = reversed.map((isReversed) => (isReversed ? 3 : 0));
    const high = reversed.map((isReversed) => (isReversed ? 0 : 3));
    expect(scoreLoneliness(connected, reversed)).toEqual({ level: 'connected', score: 10 });
    expect(scoreLoneliness(high, reversed)).toEqual({ level: 'high', score: 40 });
  });
});
