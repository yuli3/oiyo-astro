import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { computeNatalChart } from './ontology/natal/calculator';
import { normalizeAngle } from './ontology/kernel/math';

const locales = ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const;
// WHY (2026-10-10): French and Spanish use a decimal comma here. Compare localized strings
// against the same calculated values rather than forcing English typography.
const localizedDecimal = (value: string, locale: typeof locales[number]) => locale === 'fr' || locale === 'es' ? value.replace('.', ',') : value;
const years = [2000, 2010, 2020];
const keys = ['sun', 'moon', 'ascendant', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;
const separation = (a: number, b: number) => {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
};

describe('astrology lesson worked examples', () => {
  it('Chinese normalization wording excludes 360 degrees and matches the calculation interval', () => {
    const source = readFileSync('src/content/articles/zh/academy-astrology-basics-ch5.mdx', 'utf8');
    // WHY (2026-10-10): 以下 includes its endpoint in Chinese. The disclosed
    // normalized interval must be half-open, even though 360° and 0° coincide.
    expect(source).toContain('0° ≤ λ < 360°');
    expect(source).not.toContain('0°以上、360°以下');
    for (const value of [-361, -1, 0, 359, 360, 721]) {
      const normalized = normalizeAngle(value);
      expect(normalized).toBeGreaterThanOrEqual(0);
      expect(normalized).toBeLessThan(360);
    }
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(-1)).toBe(359);
  });
  // WHY (2026-10-10): translated examples previously used different charts and
  // asserted aspects without degrees. Check the actual prose tables against
  // the named engine, not just fixtures. This does not validate ephemeris accuracy.
  for (const locale of locales) {
    it(`${locale}: all six chapters retain metadata, adjacent chapters and supporting sources`, () => {
      const series = new Set<string>();
      for (let chapter = 1; chapter <= 6; chapter++) {
        const source = readFileSync(`src/content/articles/${locale}/academy-astrology-basics-ch${chapter}.mdx`, 'utf8');
        expect(source).toContain(`locale: ${locale}\n`);
        expect(source).toContain(`chapter: ${chapter}\n`);
        expect(source).toContain('topic: astrology');
        const name = source.match(/^series: (.+)$/m)?.[1];
        expect(name).toBeTruthy();
        series.add(name!);
        const reference = chapter === 3 ? 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' : 'https://www.astro.com/swisseph/swisseph.htm';
        expect(source).toContain(reference);
        if (chapter > 1) expect(source).toContain(`/${locale}/academy-astrology-basics-ch${chapter - 1}/`);
        if (chapter < 6) expect(source).toContain(`/${locale}/academy-astrology-basics-ch${chapter + 1}/`);
        expect(source).not.toContain('```');
      }
      expect(series.size).toBe(1);
    });

    it(`${locale}: chapter 3 keeps orbital periods distinct from sign-residence estimates`, () => {
      const source = readFileSync(`src/content/articles/${locale}/academy-astrology-basics-ch3.mdx`, 'utf8');
      const labels = {
        ko: ['수성', '금성', '지구', '달', '화성', '목성', '토성', '천왕성', '해왕성', '명왕성'],
        en: ['Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
        ja: ['水星', '金星', '地球', '月', '火星', '木星', '土星', '天王星', '海王星', '冥王星'],
        zh: ['水星', '金星', '地球', '月亮', '火星', '木星', '土星', '天王星', '海王星', '冥王星'],
        fr: ['Mercure', 'Vénus', 'Terre', 'Lune', 'Mars', 'Jupiter', 'Saturne', 'Uranus', 'Neptune', 'Pluton'],
        es: ['Mercurio', 'Venus', 'Tierra', 'Luna', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón'],
      };
      // WHY (2026-10-10): match the disclosed NASA table in days, not rough
      // year-to-sign divisions that previously differed across languages.
      const periods = ['88.0', '224.7', '365.2', '27.3', '687.0', '4331', '10747', '30589', '59800', '90560'];
      labels[locale].forEach((label, index) => {
        expect(source).toContain(`| ${label} | ${localizedDecimal(periods[index], locale)} |`);
      });
      expect(source).toContain('https://nssdc.gsfc.nasa.gov/planetary/factsheet/');
      expect(source).not.toContain('| 滞在期間 |');
    });

    it(`${locale}: chapter 6 tables reproduce the disclosed engine and Whole Sign rule`, () => {
      const source = readFileSync(`src/content/articles/${locale}/academy-astrology-basics-ch6.mdx`, 'utf8');
      const rows = [...source.matchAll(/^\| ([^|]+) \| (\d+(?:[.,]\d+)?)° \/ ([^|]+) \| (\d+) \|$/gm)];
      // WHY (2026-10-10): correct numbers attached to the wrong translated body
      // still misteach the example. Check row identity, not only row order/count.
      const names = {
        ko: ['태양', '달', '상승점', '수성', '금성', '화성', '목성', '토성', '천왕성', '해왕성', '명왕성'],
        en: ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'],
        ja: ['太陽', '月', 'アセンダント', '水星', '金星', '火星', '木星', '土星', '天王星', '海王星', '冥王星'],
        zh: ['太阳', '月亮', '上升点', '水星', '金星', '火星', '木星', '土星', '天王星', '海王星', '冥王星'],
        fr: ['Soleil', 'Lune', 'Ascendant', 'Mercure', 'Vénus', 'Mars', 'Jupiter', 'Saturne', 'Uranus', 'Neptune', 'Pluton'],
        es: ['Sol', 'Luna', 'Ascendente', 'Mercurio', 'Venus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutón'],
      };
      // WHY (2026-10-10): translated sign names must describe the same 30-degree
      // bin as the displayed longitude. A numerically correct table can still
      // teach the wrong sign if only degrees and houses are compared.
      const signs = {
        ko: ['양', '황소', '쌍둥이', '게', '사자', '처녀', '천칭', '전갈', '사수', '염소', '물병', '물고기'],
        en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
        ja: ['牡羊', '牡牛', '双子', '蟹', '獅子', '乙女', '天秤', '蠍', '射手', '山羊', '水瓶', '魚'],
        zh: ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼'],
        fr: ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'],
        es: ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'],
      };
      expect(rows).toHaveLength(33);
      years.forEach((year, caseIndex) => {
        const chart = computeNatalChart({ date: new Date(`${year}-01-01T12:00:00Z`), latitude: 37.5665, longitude: 126.978 });
        keys.forEach((key, bodyIndex) => {
          const row = rows[caseIndex * keys.length + bodyIndex];
          expect(row[1]).toBe(names[locale][bodyIndex]);
          expect(row[2]).toBe(localizedDecimal(chart[key].longitude.toFixed(3), locale));
          expect(row[3]).toBe(signs[locale][Math.floor(chart[key].longitude / 30)]);
          const house = (Math.floor(chart[key].longitude / 30) - Math.floor(chart.ascendant.longitude / 30) + 12) % 12 + 1;
          expect(Number(row[4])).toBe(house);
        });
      });
      expect(source).not.toContain('```');
      expect(source).toContain(`/${locale}/natal/chart/`);
    });

    it(`${locale}: chapter 5 discloses matching numerical rules`, () => {
      const source = readFileSync(`src/content/articles/${locale}/academy-astrology-basics-ch5.mdx`, 'utf8');
      expect(source).toContain('Δ = min(d, 360° − d)');
      expect(source).toContain('ε = |Δ − A|');
      expect(source).toContain('ε ≤ o');
      expect(source).toContain('| 60° | 4° |');
      expect(source).not.toContain('```');
    });
  }

  it('chapter 6 narrative angles agree with the displayed three-decimal inputs', () => {
    const checks = [
      [280.373, 271.907, 8.466], [223.318, 40.376, 177.058],
      [280.964, 278.487, 2.477], [280.964, 110.752, 170.212],
      [280.519, 275.188, 5.331], [280.519, 276.805, 3.714],
      [280.519, 291.451, 10.932], [280.519, 292.408, 11.889],
      [291.451, 292.408, 0.957], [352.075, 346.299, 5.776],
    ];
    for (const [a, b, expected] of checks) {
      expect(separation(a, b)).toBeCloseTo(expected, 6);
      for (const locale of locales) {
        const source = readFileSync(`src/content/articles/${locale}/academy-astrology-basics-ch6.mdx`, 'utf8');
        expect(source).toContain(`${localizedDecimal(expected.toFixed(3), locale)}°`);
      }
    }
    expect(separation(359, 1)).toBe(2);
    expect(separation(1, 29)).toBe(28);
    expect(separation(125, 242)).toBe(117);
  });
});
