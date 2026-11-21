import { describe, expect, it } from 'vitest';

import { animalFor, BIRTH_YEARS, birthRank, formatBirths, makeBornYearCard } from './born-year';

describe('born-year', () => {
  it('covers 1950-2024 without gaps', () => {
    expect(BIRTH_YEARS).toHaveLength(75);
    BIRTH_YEARS.forEach((b, i) => expect(b.year).toBe(1950 + i));
  });

  it('keeps known figures from the official series', () => {
    expect(BIRTH_YEARS.find((b) => b.year === 1971)?.births).toBe(1024773);
    expect(BIRTH_YEARS.find((b) => b.year === 2023)?.tfr).toBe(0.721);
    expect(BIRTH_YEARS.find((b) => b.year === 2024)?.births).toBe(238300);
  });

  it('ranks 1960 first and 2023 last', () => {
    expect(birthRank(1960)).toBe(1);
    expect(birthRank(2023)).toBe(75);
  });

  it('builds a card with ratio and zodiac', () => {
    const c = makeBornYearCard(1990);
    expect(c.vsLatest).toBe(2.7);
    expect(c.animal.name).toBe('말');
    expect(c.decade).toMatchObject({ from: 1990, to: 1999 });
    expect(animalFor(1984).name).toBe('쥐');
    expect(animalFor(2027).name).toBe('양');
  });

  it('formats exact and approximate counts', () => {
    expect(formatBirths({ year: 2014, births: 435435 })).toBe('43만 5,435명');
    expect(formatBirths({ year: 2003, births: 495000, approx: true })).toBe('약 49만 5천 명');
  });
});
