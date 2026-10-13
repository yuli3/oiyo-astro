import { describe, expect, it } from 'vitest';
import { getCautionText, getTestSourceNote } from './test-source-notes';

describe('typing measurement source note', () => {
  it('uses a measurement-specific explanation in all six languages', () => {
    const note = getTestSourceNote('/typing-speed-test/');
    expect(note?.caution).toBe('performance');
    for (const locale of ['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const) {
      expect(note?.basisByLocale?.[locale]).toHaveLength(2);
      expect(getCautionText('performance', locale)).toContain('WPM');
      expect(getCautionText('performance', locale)).not.toBe(getCautionText('style', locale));
    }
  });
  it('does not reclassify genuine style tests', () => {
    expect(getTestSourceNote('/conflict-style-test/')?.caution).toBe('style');
  });
});
