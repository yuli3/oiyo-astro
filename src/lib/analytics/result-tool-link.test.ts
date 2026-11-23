import { describe, expect, it } from 'vitest';
import { pickTestTool, testIdFromPath } from './result-tool-link';

describe('pickTestTool', () => {
  it('only runs on test pages without a tool link of their own', () => {
    expect(pickTestTool('saju/fortune', 'ko', 6)).toBeNull();
    expect(pickTestTool('chinese-zodiac', 'ko', 6)).toBeNull();
    expect(pickTestTool('gift-style-test', 'ko', 6)).toBeNull();
    expect(pickTestTool('mbti-love-test', 'ko', 6)?.key).toBe('pay');
  });

  it('matches the tool to the test', () => {
    expect(pickTestTool('money-personality-test', 'en', 12)?.href).toContain('https://tools.oiyo.net/en/compound-interest-calculator/?');
    expect(pickTestTool('travel-style-test', 'ja', 6)?.href).toContain('/ja/travel-budget-calculator/');
    expect(pickTestTool('work-life-balance-test', 'fr', 6)?.href).toContain('/fr/annual-leave-calculator/');
    // en has no own-country leave tool, so it falls back to US take-home pay.
    expect(pickTestTool('workaholic-test', 'en', 6)?.href).toContain('/en/us-take-home-pay-calculator-2026/');
  });

  it('uses local take-home pay, and year-end settlement in ko/ja from November to January', () => {
    expect(pickTestTool('hsp-test', 'zh', 12)?.href).toContain('/zh/china-salary-calculator/');
    expect(pickTestTool('hsp-test', 'es', 6)?.href).toContain('/es/spain-salary-calculator/');
    expect(pickTestTool('hsp-test', 'ko', 12)?.href).toContain('/ko/year-end-settlement-calculator/');
    expect(pickTestTool('hsp-test', 'ja', 1)?.key).toBe('yearEnd');
    expect(pickTestTool('hsp-test', 'ko', 4)?.href).toContain('/ko/salary-calculator/');
  });

  it('tags links for GA4', () => {
    const url = new URL(pickTestTool('fomo-test', 'ko', 6)!.href);
    expect(url.searchParams.get('utm_campaign')).toBe('result_to_tool');
    expect(url.searchParams.get('utm_content')).toBe('fomo-test');
    expect(testIdFromPath('/ko/fomo-test/')).toBe('fomo-test');
  });
});
