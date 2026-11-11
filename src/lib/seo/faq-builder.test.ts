import { describe, it, expect } from 'vitest';
import { buildFaqJsonLd } from './faq-builder';
import type { TestSourceNote } from '../../data/test-source-notes';

describe('buildFaqJsonLd', () => {
  it('returns null when no custom FAQ and no testSourceNote is present', () => {
    const res = buildFaqJsonLd({
      title: 'Home',
      locale: 'ko',
      testSourceNote: null,
    });
    expect(res).toBeNull();
  });

  it('builds FAQPage from custom FAQ items', () => {
    const customFaq = [
      { question: 'What is Oiyo?', answer: 'An interactive self-exploration platform.' },
    ];
    const res = buildFaqJsonLd({
      title: 'About',
      locale: 'en',
      customFaq,
    });
    expect(res).not.toBeNull();
    expect(res?.['@type']).toBe('FAQPage');
    expect(res?.mainEntity).toHaveLength(1);
    expect(res?.mainEntity[0].name).toBe('What is Oiyo?');
    expect(res?.mainEntity[0].acceptedAnswer.text).toBe('An interactive self-exploration platform.');
  });

  it('automatically synthesizes 3-question FAQPage from testSourceNote in Korean', () => {
    const note: TestSourceNote = {
      basis: ['Adult ADHD Self-Report Scale (ASRS v1.1)', 'WHO CIDI'],
      caution: 'clinical',
    };
    const res = buildFaqJsonLd({
      title: 'ADHD 자가 진단 테스트',
      locale: 'ko',
      testSourceNote: note,
    });
    expect(res).not.toBeNull();
    expect(res?.['@type']).toBe('FAQPage');
    expect(res?.mainEntity).toHaveLength(3);
    expect(res?.mainEntity[0].name).toContain('학술적·이론적 배경');
    expect(res?.mainEntity[0].acceptedAnswer.text).toContain('ASRS v1.1');
    expect(res?.mainEntity[2].name).toContain('진료를 대체할 수 있나요');
    expect(res?.mainEntity[2].acceptedAnswer.text).toContain('선별(Screening)');
  });

  it('supports multilingual localization (English, Japanese)', () => {
    const note: TestSourceNote = {
      basis: ['Big Five / Five-Factor Model', 'IPIP inventory'],
      caution: 'reflection',
    };
    const resEn = buildFaqJsonLd({
      title: 'Big 5 Personality Test',
      locale: 'en',
      testSourceNote: note,
    });
    expect(resEn?.mainEntity[0].name).toContain('theoretical and academic basis for Big 5 Personality Test');
    expect(resEn?.mainEntity[0].acceptedAnswer.text).toContain('Big Five / Five-Factor Model');

    const resJa = buildFaqJsonLd({
      title: 'ビッグファイブ診断',
      locale: 'ja',
      testSourceNote: note,
    });
    expect(resJa?.mainEntity[0].name).toContain('ビッグファイブ診断の学術的・理論的背景は何ですか');
  });
});
