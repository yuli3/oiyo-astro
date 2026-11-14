import { describe, expect, it } from 'vitest';
import { animalOf } from './periodic';
import { birthYearsOf, buildFortuneWall } from './wall-data';

const AT = new Date(Date.UTC(2026, 9, 8));

describe('birthYearsOf', () => {
  it('lists the tiger years a newspaper column would: 50, 62, 74, 86, 98, 10', () => {
    expect(birthYearsOf(2, AT)).toEqual([1950, 1962, 1974, 1986, 1998, 2010]);
  });

  it('gives every animal five or six years, all of that animal', () => {
    for (let animal = 0; animal < 12; animal += 1) {
      const years = birthYearsOf(animal, AT);
      expect(years.length).toBeGreaterThanOrEqual(5);
      expect(years.length).toBeLessThanOrEqual(6);
      expect(years.every((year) => animalOf(year) === animal)).toBe(true);
    }
  });

  it('moves with the calendar year', () => {
    expect(birthYearsOf(2, new Date(Date.UTC(2038, 0, 1)))).toEqual([1962, 1974, 1986, 1998, 2010, 2022]);
  });
});

describe('buildFortuneWall birth-year lines', () => {
  it('puts year lines on animal cards only', () => {
    const [today] = buildFortuneWall('ko', AT);
    expect(today.animals.every((card) => (card.years?.length ?? 0) >= 5)).toBe(true);
    expect(today.signs.every((card) => card.years === undefined)).toBe(true);
    expect(today.animals[2].years!.map((row) => row.label)).toEqual(['50년생', '62년생', '74년생', '86년생', '98년생', '10년생']);
  });

  it('labels years in full outside Korean', () => {
    expect(buildFortuneWall('en', AT)[0].animals[2].years![2].label).toBe('1974');
    expect(buildFortuneWall('ja', AT)[0].animals[2].years![2].label).toBe('1974年生まれ');
  });

  it('does not repeat a line inside one period, and scores stay in range', () => {
    for (const section of buildFortuneWall('ko', AT)) {
      const lines = section.animals.flatMap((card) => card.years!.map((row) => row.line));
      const cardAdvice = [...section.animals, ...section.signs].map((card) => card.advice.replace(/^[^:：]{1,14}[:：]\s*/, ''));
      expect(new Set(lines).size).toBe(lines.length);
      expect(lines.some((line) => cardAdvice.includes(line))).toBe(false);
      for (const card of section.animals) for (const row of card.years!) {
        expect(row.score).toBeGreaterThanOrEqual(1);
        expect(row.score).toBeLessThanOrEqual(99);
      }
    }
  });

  it('drops the corpus label from a year line in every language', () => {
    for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es']) {
      const rows = buildFortuneWall(locale, AT)[0].animals.flatMap((card) => card.years!);
      expect(rows.every((row) => row.line.length > 4 && !/^(조언|Advice|アドバイス|建议|Conseil|Consejo)\s*[:：]/.test(row.line))).toBe(true);
    }
  });

  it('is stable for the same day', () => {
    expect(buildFortuneWall('ko', AT)).toEqual(buildFortuneWall('ko', AT));
  });
});
