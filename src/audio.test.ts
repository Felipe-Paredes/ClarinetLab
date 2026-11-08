import { describe, expect, it } from 'vitest';
import { createSchedule, writtenToSounding } from './audio';
import { DEFAULT_OPTIONS, type Passage } from './types';
const passage: Passage = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 1 }, { midi: -1, beats: 1 }, { midi: 67, beats: 2 }]] };
describe('clarinet playback schedule', () => {
  it('transposes written C5 to concert Bb4 and supports other instruments', () => {
    expect(writtenToSounding(72)).toBe(70);
    expect(writtenToSounding(67)).toBe(65);
    expect(writtenToSounding(52)).toBe(50);
    expect(writtenToSounding(72, { transposition: 0 })).toBe(72);
  });
  it('preserves exact timing and silence for rests', () => {
    expect(createSchedule(passage, 60)).toEqual({ notes: [{ midi: 70, time: 0, duration: 1 }, { midi: 65, time: 2, duration: 2 }], duration: 4 });
  });
  it('scales all timestamps and durations with tempo without changing source data', () => {
    const snapshot = JSON.stringify(passage);
    expect(createSchedule(passage, 120)).toEqual({ notes: [{ midi: 70, time: 0, duration: 0.5 }, { midi: 65, time: 1, duration: 1 }], duration: 2 });
    expect(JSON.stringify(passage)).toBe(snapshot);
  });
  it('rejects invalid tempos and durations', () => {
    for (const tempo of [0, -1, NaN, Infinity, 301]) expect(() => createSchedule(passage, tempo)).toThrow();
    expect(() => createSchedule({ ...passage, bars: [[{ midi: 72, beats: 0 }]] }, 80)).toThrow();
  });
});
