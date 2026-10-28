import { describe, it, expect } from 'vitest';
import { nextAction } from './small-next-action';
describe('optional next action', () => {
 it('offers a lighter action when capacity is low at each duration', () => {
  expect([1,5,15].map(m => nextAction('low', m as 1|5|15))).toEqual(['pause','clear','reflect']);
  expect([1,5,15].map(m => nextAction('available', m as 1|5|15))).toEqual(['choose','start','prepare']);
 });
});
