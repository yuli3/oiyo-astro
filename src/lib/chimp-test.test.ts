import { describe, expect, it } from 'vitest';
import { isChimpLevelComplete } from './chimp-test';

describe('chimp memory level completion', () => {
  it('completes when the final expected tile is selected', () => {
    expect(isChimpLevelComplete(4, 4)).toBe(true);
  });

  it('does not complete before the final tile', () => {
    expect(isChimpLevelComplete(3, 4)).toBe(false);
  });
});
