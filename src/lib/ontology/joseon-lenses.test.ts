import {describe,it,expect} from 'vitest';
import {responseLens,birthSymbolLens,closestSymbolicFactions,compareLenses} from './joseon-lenses';
const scores={dongin:0,seoin:0,namin:0,bukin:0,noron:0,soron:0};
describe('editorial Joseon comparison, not a personality measurement',()=>{
 it('keeps missing, empty, negative, fractional and unknown input absent',()=>{
  expect(responseLens(scores)).toBeNull(); expect(responseLens({...scores,dongin:-1})).toBeNull(); expect(responseLens({...scores,dongin:1.5})).toBeNull(); expect(responseLens({...scores,other:1})).toBeNull();
  expect(birthSymbolLens({wood:8})).toBeNull(); expect(birthSymbolLens({wood:1,fire:1,earth:1,metal:1,water:1})).toBeNull();
 });
 it('uses the complete canonical eight-character tally deterministically',()=>{
  const counts={wood:2,fire:2,earth:2,metal:1,water:1};
  expect(birthSymbolLens(counts)).toEqual(birthSymbolLens(counts));
  expect(birthSymbolLens({wood:0,fire:0,earth:0,metal:8,water:0})).toEqual({principle:1,tradition:1,action:0});
 });
 it('response distribution retains the existing faction scoring without changing it',()=>{
  const input={...scores,dongin:8};const copy={...input};
  expect(responseLens(input)).toEqual({principle:1,tradition:0,action:-1});expect(input).toEqual(copy);
  expect(closestSymbolicFactions({principle:1,tradition:0,action:-1})).toEqual(['dongin']);
 });
 it('preserves tied axes and rejects out-of-range vectors instead of inventing certainty',()=>{
  expect(compareLenses({principle:0,tradition:0,action:0},{principle:1,tradition:1,action:0}).largestDifferenceAxes).toEqual(['principle','tradition']);
  expect(compareLenses({principle:0,tradition:0,action:0},{principle:0,tradition:0,action:0}).identical).toBe(true);
  expect(closestSymbolicFactions({principle:Infinity,tradition:0,action:0})).toEqual([]);
 });
});
