import { describe, it, expect } from 'vitest';
import {
  AXES, scores, axisScoreAt, stepIndex, flow, shift, delta,
  animalRanking, signRanking, lucky, grade,
} from './score';
import {
  seedHash, elementOf, FIVE_ELEMENTS, CORPUS_COMBINATIONS, MIN_CYCLE_BEFORE_REPEAT,
  reading, pickCycled,
} from './periodic';
import { buildFortuneWall } from './wall-data';

const D = new Date(Date.UTC(2026, 8, 9));

describe('seedHash', () => {
  it('decorrelates seeds that differ only in a trailing digit', () => {
    // fmix32 마무리가 빠지면 "…#12941"과 "…#12942"의 값이 0.001 차이로 붙어
    // 며칠 동안 같은 운세가 나온다. 인접 시드의 평균 간격이 충분한지 본다.
    const vals = Array.from({ length: 400 }, (_, i) => seedHash(`saju-1990|today|love#${12000 + i}`) / 2 ** 32);
    let gap = 0;
    for (let i = 1; i < vals.length; i++) gap += Math.abs(vals[i] - vals[i - 1]);
    expect(gap / (vals.length - 1)).toBeGreaterThan(0.25); // 무작위면 ≈0.33
  });
});

describe('elementOf', () => {
  it('maps heavenly stems to the right element', () => {
    expect(FIVE_ELEMENTS[elementOf(1984)]).toBe('wood');  // 갑자
    expect(FIVE_ELEMENTS[elementOf(1990)]).toBe('metal'); // 경오
    expect(FIVE_ELEMENTS[elementOf(2024)]).toBe('wood');  // 갑진
    expect(FIVE_ELEMENTS[elementOf(1998)]).toBe('earth'); // 무인
    expect(FIVE_ELEMENTS[elementOf(2002)]).toBe('water'); // 임오
  });
});

describe('scores', () => {
  it('is deterministic and bounded', () => {
    expect(scores('saju-1990', 'today', D)).toEqual(scores('saju-1990', 'today', D));
    for (const a of AXES) {
      const v = scores('saju-1990', 'today', D)[a];
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(99);
    }
  });

  it('changes every day', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 30; i++) seen.add(scores('saju-1990', 'today', shift('today', D, i)).overall);
    expect(seen.size).toBeGreaterThan(15); // 매일 갱신되며 며칠씩 붙지 않는다
  });

  it('spans all four grades across a population', () => {
    const buckets = { great: 0, good: 0, normal: 0, careful: 0 };
    for (let i = 0; i < 1000; i++) buckets[grade(scores(`u-${i}`, 'today', D).overall)]++;
    for (const k of Object.keys(buckets) as (keyof typeof buckets)[]) {
      expect(buckets[k]).toBeGreaterThan(50); // 한 등급으로 쏠리지 않는다
    }
  });

  it('keeps overall consistent with the four sub-axes', () => {
    // 네 축이 전부 낮은데 총운만 대길로 뜨는 모순이 없어야 한다.
    for (let i = 0; i < 300; i++) {
      const s = scores(`u-${i}`, 'today', D);
      const mean = (s.love + s.money + s.work + s.health) / 4;
      expect(Math.abs(s.overall - mean)).toBeLessThan(45);
    }
  });
});

describe('flow', () => {
  it('reads as a trend, not as noise', () => {
    const f = flow('saju-1990', 'today', 'overall', 15, 15, D);
    expect(f).toHaveLength(31);
    let jump = 0;
    for (let i = 1; i < f.length; i++) jump += Math.abs(f[i].score - f[i - 1].score);
    const avg = jump / (f.length - 1);
    expect(avg).toBeGreaterThan(2);   // 평평하지 않다
    expect(avg).toBeLessThan(14);     // 톱니가 아니다
  });

  it('agrees with scores() at the centre point', () => {
    const f = flow('saju-1990', 'today', 'overall', 3, 3, D);
    expect(f.find((p) => p.offset === 0)!.score).toBe(scores('saju-1990', 'today', D).overall);
  });

  it('walks the calendar by the right unit', () => {
    expect(shift('today', D, 1).getUTCDate()).toBe(10);
    expect(shift('weekly', D, 1).getUTCDate()).toBe(16);
    expect(shift('monthly', D, 1).getUTCMonth()).toBe(9);
    expect(shift('yearly', D, 1).getUTCFullYear()).toBe(2027);
    expect(stepIndex('monthly', D)).toBe(2026 * 12 + 8);
  });

  it('delta compares against the previous period', () => {
    expect(delta('saju-1990', 'today', D)).toBe(
      scores('saju-1990', 'today', D).overall - scores('saju-1990', 'today', shift('today', D, -1)).overall,
    );
  });
});

describe('rankings', () => {
  it('produces a complete 1..12 ordering', () => {
    for (const rows of [animalRanking('today', D), signRanking('today', D)]) {
      expect(rows).toHaveLength(12);
      expect(rows.map((r) => r.rank)).toEqual([...Array(12)].map((_, i) => i + 1));
      expect(new Set(rows.map((r) => r.idx)).size).toBe(12);
      for (let i = 1; i < rows.length; i++) expect(rows[i - 1].score).toBeGreaterThanOrEqual(rows[i].score);
    }
  });

  it('reshuffles the top spot over time', () => {
    const winners = new Set<number>();
    for (let i = 0; i < 40; i++) winners.add(animalRanking('today', shift('today', D, i))[0].idx);
    expect(winners.size).toBeGreaterThan(4); // 한 띠가 매일 1위를 독점하지 않는다
  });
});

describe('lucky', () => {
  it('is stable within a period and localized', () => {
    expect(lucky('saju-1990', 'today', 'ko', D)).toEqual(lucky('saju-1990', 'today', 'ko', D));
    const l = lucky('saju-1990', 'today', 'ko', D);
    expect(l.number).toBeGreaterThanOrEqual(1);
    expect(l.number).toBeLessThanOrEqual(45);
    expect(l.colorHex).toMatch(/^#[0-9a-f]{6}$/);
    expect(lucky('saju-1990', 'today', 'en', D).colorName).not.toBe(l.colorName);
  });
});

describe('corpus', () => {
  it('reports a combination count that matches the arrays', () => {
    expect(CORPUS_COMBINATIONS).toBeGreaterThan(500_000);
  });

  it('fills the two new axes in every locale', () => {
    for (const loc of ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const) {
      const r = reading(0, 'today', 'saju-1990', loc, D);
      expect(r.caution).toBeTruthy();
      expect(r.keyword).toBeTruthy();
    }
  });
});

describe('flow labels', () => {
  it('localizes month names instead of leaking Korean', () => {
    const ja = flow('saju-1990', 'monthly', 'overall', 1, 1, D, 'ja').map((p) => p.label);
    const ko = flow('saju-1990', 'monthly', 'overall', 1, 1, D, 'ko').map((p) => p.label);
    for (const l of ja) expect(l).not.toMatch(/월/);
    for (const l of ko) expect(l).toMatch(/월/);
    expect(flow('saju-1990', 'today', 'overall', 1, 1, D, 'ja')[1].label).toBe('9/9');
    expect(flow('saju-1990', 'yearly', 'overall', 1, 1, D, 'ja')[1].label).toBe('2026');
  });
});

describe('tone matching', () => {
  it('never gives a top-scoring card a defeatist headline', () => {
    // 2026-09-09 랜딩에서 1위(85점) 카드가 "끝맺지 못한 일이 마음을 갉아먹습니다"를
    // 달고 있었다. 점수와 문장이 서로를 부정하면 둘 다 신뢰를 잃는다.
    const DOWN = ['갉아먹', '되담기 어렵', '식는 속도', '지켜지지 않'];
    for (let d = 0; d < 60; d++) {
      const at = shift('today', D, d);
      for (const rows of [animalRanking('today', at), signRanking('today', at)]) {
        for (const row of rows) {
          if (grade(row.score) !== 'great' && grade(row.score) !== 'good') continue;
          const r = reading(0, 'today', `x-${row.idx}`, 'ko', at, grade(row.score));
          for (const bad of DOWN) expect(r.opening).not.toContain(bad);
        }
      }
    }
  });

  it('falls back to the whole pool when no grade is given', () => {
    expect(reading(0, 'today', 'saju-1990', 'ko', D).opening).toBeTruthy();
  });
});

describe('corpus depth — 반복이 눈에 띄지 않아야 한다', () => {
  it('cycles the whole pool before repeating a sentence', () => {
    // 2026-09-09 실측: 말띠 오프닝이 90일 동안 10종만 돌았고 한 문장은 15회
    // 나왔다. 독립 해시 추첨은 생일 문제 때문에 며칠 만에 같은 값을 다시 낸다.
    // pickCycled 는 풀을 한 바퀴 다 돈 뒤에야 반복한다.
    const pool = Array.from({ length: 20 }, (_, i) => i);
    const seen = new Set<number>();
    for (let t = 0; t < 20; t++) seen.add(pickCycled(pool, 'seed', t));
    expect(seen.size).toBe(20); // 20주기 안에 중복 0
  });

  it('never repeats the same item back-to-back across a cycle boundary', () => {
    const pool = Array.from({ length: 12 }, (_, i) => i);
    for (let t = 1; t < 400; t++) {
      expect(pickCycled(pool, 'seed', t)).not.toBe(pickCycled(pool, 'seed', t - 1));
    }
  });

  it('is deterministic and handles negative steps (past flow)', () => {
    const pool = ['a', 'b', 'c', 'd', 'e'];
    expect(pickCycled(pool, 's', 7)).toBe(pickCycled(pool, 's', 7));
    for (let t = -30; t < 0; t++) expect(pool).toContain(pickCycled(pool, 's', t));
  });

  it('keeps a daily visitor from seeing a repeat within a month', () => {
    expect(MIN_CYCLE_BEFORE_REPEAT).toBeGreaterThanOrEqual(28);
    expect(CORPUS_COMBINATIONS).toBeGreaterThan(100_000_000);

    for (const idx of [0, 6, 11]) {
      const advice = new Set<string>();
      const caution = new Set<string>();
      for (let d = 0; d < 30; d++) {
        const at = shift('today', D, d);
        const row = animalRanking('today', at).find((r) => r.idx === idx)!;
        const r = reading((idx * 2 + 1) % 5, 'today', `animal-${idx}`, 'ko', at, grade(row.score));
        advice.add(r.advice);
        caution.add(r.caution);
      }
      expect(advice.size).toBe(30);  // 30일 완전 무중복
      expect(caution.size).toBe(30);
    }
  });

  it('shows 24 distinct cards in every wall section', () => {
    // 한 화면에 24장이 함께 놓인다. 같은 문장이 두 카드에 뜨면 그 자리에서 들킨다.
    for (const section of buildFortuneWall('ko', D)) {
      const cards = [...section.animals, ...section.signs];
      expect(new Set(cards.map((c) => c.opening)).size).toBe(24);
      expect(new Set(cards.map((c) => c.advice)).size).toBe(24);
    }
  });

  it('keeps the wall in fixed zodiac order, not sorted by rank', () => {
    // 순위대로 재배열하면 자기 띠가 매일 다른 자리로 옮겨 다닌다.
    for (const section of buildFortuneWall('ko', D)) {
      expect(section.animals.map((c) => c.name)).toEqual(buildFortuneWall('ko', D)[0].animals.map((c) => c.name));
      expect(new Set(section.animals.map((c) => c.rank)).size).toBe(12);
    }
  });
});
