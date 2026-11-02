import { describe, it, expect } from 'vitest';
import { validRoom, parseAction, chooseSeat, applyAction, publicMembers } from './protocol.mjs';

describe('sanctuary public room rules',()=>{
  it('bounds rooms and scenes to avoid arbitrary object creation',()=>{
    expect(validRoom('temple','0')).toBe(true);expect(validRoom('fire',7)).toBe(true);expect(validRoom('fireworks','3')).toBe(true);expect(validRoom('cosmos','0')).toBe(true);
    for(const [scene,room] of [['temple','8'],['temple','00'],['other','1'],['water','-1']])expect(validRoom(scene,room)).toBe(false);
  });
  it('accepts only bounded typed gestures and seat commands',()=>{
    expect(parseAction('{"id":"a","type":"gesture","gesture":"bow"}')?.gesture).toBe('bow');
    expect(parseAction('{"id":"b","type":"seat","seat":11}')?.seat).toBe(11);
    for(const raw of ['{}','[]','null','not json','{"id":"a","type":"seat","seat":12}','{"id":"a","type":"gesture","gesture":"bow","text":"hello"}','a'.repeat(257)])expect(parseAction(raw)).toBeNull();
    expect(parseAction(new ArrayBuffer(10))).toBeNull();
  });
  it('never overbooks a seat and stops at capacity',()=>{
    const members=Array.from({length:12},(_,seat)=>({id:String(seat),seat}));
    expect(chooseSeat(members)).toBe(-1);expect(chooseSeat(members.slice(1))).toBe(0);
    expect(chooseSeat(members.slice(1),11)).toBe(0);
  });
  it('deduplicates gestures, throttles clicks and preserves occupied seats',()=>{
    const member={id:'one',seat:0,lastAction:0,recent:[]};
    const action=parseAction('{"id":"a","type":"gesture","gesture":"petal"}');
    const first=applyAction(member,[member],action,1000).member;
    expect(first.recent).toEqual(['a']);
    expect(applyAction(first,[first],action,2000)).toEqual({duplicate:true});
    expect(applyAction(first,[first],{id:'b',type:'gesture',gesture:'bow'},1200)).toEqual({error:'slow_down'});
    expect(applyAction(first,[first,{id:'two',seat:1}],{id:'c',type:'seat',seat:1},2000)).toEqual({error:'occupied'});
    expect(applyAction(first,[first],{id:'d',type:'seat',seat:2},2000).member.seat).toBe(2);
  });
  it('exposes neither timing nor ticket history in presence',()=>{
    expect(publicMembers([{id:'a',seat:0,lastAction:123,recent:['secret']}])).toEqual([{id:'a',seat:0}]);
  });
});
