import { describe, expect, it } from 'vitest';
import { eventTicks } from './types';

describe('exact musical clock', () => {
  it.each([[4,384],[3,288],[2,192],[1.5,144],[1,96],[0.75,72],[0.5,48],[0.375,36],[0.25,24],[0.125,12]])('represents %s beats as %s integer ticks', (beats,ticks) => {
    expect(eventTicks({kind:'note',midi:60,beats,ticks})).toBe(ticks);
    expect(eventTicks({kind:'rest',midi:-1,beats,ticks})).toBe(ticks);
  });
  it('rejects inconsistent clocks and nonpositive values', () => {
    for (const beats of [0,-1,NaN,Infinity,0.1]) expect(() => eventTicks({midi:60,beats})).toThrow();
    expect(() => eventTicks({midi:60,beats:1,ticks:48})).toThrow();
  });
});
