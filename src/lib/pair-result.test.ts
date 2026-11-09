import { describe, expect, it } from 'vitest';

import { buildPairUrl, compareMbti, isLoveLang, isMbtiCode, readPairCode } from './pair-result';

describe('pair-result', () => {
  it('reads only valid pair codes', () => {
    expect(readPairCode('?pair=INFJ', isMbtiCode)).toBe('INFJ');
    expect(readPairCode('?pair=XXXX', isMbtiCode)).toBeNull();
    expect(readPairCode('?type=INFJ', isMbtiCode)).toBeNull();
    expect(readPairCode('?pair=time', isLoveLang)).toBe('time');
    expect(readPairCode('?pair=money', isLoveLang)).toBeNull();
  });

  it('builds a link that starts the test instead of showing a result', () => {
    expect(buildPairUrl('https://oiyo.net', '/ko/mbti/test/', 'ENFP')).toBe('https://oiyo.net/ko/mbti/test/?pair=ENFP');
  });

  it('compares MBTI letters per dimension', () => {
    const rows = compareMbti('INFJ', 'enfp');
    expect(rows.map((r) => r.same)).toEqual([false, true, true, false]);
    expect(rows[0]).toEqual({ dim: 'EI', mine: 'I', theirs: 'E', same: false });
  });
});
