import { describe, it, expect } from 'vitest';
import { buildMetaDescription } from './meta-description';

describe('buildMetaDescription', () => {
  it('preserves sufficiently long and well-formed descriptions', () => {
    const desc = '버겐 일중독 척도(BWAS) 기반 14문항 자가진단 — 강박적 몰입과 일-삶 침범 수준을 측정하여 맞춤형 번아웃 회복 솔루션을 즉시 무료로 확인하세요.';
    const result = buildMetaDescription({
      title: '워커홀릭 자가진단',
      description: desc,
      locale: 'ko',
      pathname: '/ko/workaholic-test/',
    });
    expect(result).toBe(desc);
  });

  it('expands missing description into informative golden-range description', () => {
    const result = buildMetaDescription({
      title: '수면 패턴 진단',
      locale: 'ko',
      pathname: '/ko/sleep-test/',
    });
    expect(result.length).toBeGreaterThanOrEqual(75);
    expect(result.length).toBeLessThanOrEqual(145);
    expect(result).toContain('수면 패턴 진단');
    expect(result).toContain('무료');
  });

  it('prevents title duplication when description equals title', () => {
    const result = buildMetaDescription({
      title: '나의 업적 달성 현황',
      description: '나의 업적 달성 현황',
      locale: 'ko',
      pathname: '/ko/achievements/',
    });
    expect(result).not.toBe('나의 업적 달성 현황');
    expect(result.length).toBeGreaterThanOrEqual(75);
    expect(result).toContain('나의 업적 달성 현황');
  });

  it('expands ultra-short dream descriptions into golden-range informative text', () => {
    const shortDesc = '돼지 꿈 — 재물과 행운';
    const result = buildMetaDescription({
      title: '돼지 꿈해몽',
      description: shortDesc,
      locale: 'ko',
      pathname: '/ko/dream/pig/',
    });
    expect(result.length).toBeGreaterThanOrEqual(75);
    expect(result).toContain('돼지 꿈');
    expect(result).toContain('무의식');
  });

  it('handles multilingual locales properly', () => {
    const enResult = buildMetaDescription({
      title: 'Workaholic Self-Test',
      locale: 'en',
      pathname: '/en/workaholic-test/',
    });
    expect(enResult.length).toBeGreaterThanOrEqual(95);
    expect(enResult).toContain('Workaholic Self-Test');
    expect(enResult).toContain('free');

    const jaResult = buildMetaDescription({
      title: '睡眠パターン診断',
      locale: 'ja',
      pathname: '/ja/sleep-test/',
    });
    expect(jaResult.length).toBeGreaterThanOrEqual(75);
    expect(jaResult).toContain('睡眠パターン診断');
    expect(jaResult).toContain('無料');
  });
});
