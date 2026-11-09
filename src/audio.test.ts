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

// Integer-tick expressions preserve score time while changing performance only.
describe('expressive schedule', () => {
  it('merges a cross-bar tie into a single attack and keeps rest time', () => {
    const score: Passage = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 1, ticks: 96, tieToNext: true }], [{ midi: 72, beats: 0.75, ticks: 72 }, { kind: 'rest', midi: -1, beats: 0.25, ticks: 24 }, { midi: 67, beats: 1, ticks: 96 }]] };
    expect(createSchedule(score, 60)).toEqual({ notes: [{ midi: 70, time: 0, duration: 1.75 }, { midi: 65, time: 2, duration: 1 }], duration: 3 });
  });
  it('rejects broken ties and inconsistent tick durations', () => {
    expect(() => createSchedule({ ...passage, bars: [[{ midi: 72, beats: 1, tieToNext: true }, { midi: 74, beats: 1 }]] }, 60)).toThrow('Ties');
    expect(() => createSchedule({ ...passage, bars: [[{ midi: 72, beats: 1, ticks: 95 }]] }, 60)).toThrow('duration');
  });
  it('maps staccato, tenuto, accents and marcato without changing score timing', () => {
    const score: Passage = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 1, articulation: 'staccato' }, { midi: 72, beats: 1, articulation: 'tenuto' }, { midi: 72, beats: 1, articulation: 'accent' }, { midi: 72, beats: 1, articulation: 'marcato' }]] };
    const schedule = createSchedule(score, 60);
    expect(schedule.notes.map(n => n.duration)).toEqual([1, 1, 1, 1]);
    expect(schedule.notes.map(n => n.soundingDuration)).toEqual([0.5, 1, 0.94, 0.75]);
    expect(schedule.notes[2].gain).toBeGreaterThan(0.62);
    expect(schedule.notes[3].gain).toBeGreaterThan(schedule.notes[2].gain!);
    expect(schedule.duration).toBe(4);
  });
  it('interpolates dynamics by elapsed ticks, then sustains the ending dynamic', () => {
    const score: Passage = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 1, dynamic: 'pp', hairpinStart: 'crescendo' }, { midi: 74, beats: 2 }, { midi: 76, beats: 1, dynamic: 'ff', hairpinEnd: true }, { midi: 77, beats: 1 }]] };
    const notes = createSchedule(score, 60).notes;
    expect(notes[0].gain).toBe(0.25);
    expect(notes[1].gain).toBeCloseTo(0.25 + (0.92 - 0.25) / 3);
    expect(notes[2].gain).toBe(0.92);
    expect(notes[3].gain).toBe(0.92);
  });
  it('keeps slurs separate from ties: slurred notes still have separate attacks', () => {
    const score: Passage = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 1, slurStart: true }, { midi: 74, beats: 1, slurEnd: true }]] };
    const notes = createSchedule(score, 60).notes;
    expect(notes).toHaveLength(2);
    expect(notes.map(n => n.soundingDuration)).toEqual([1, 1]);
  });
});

it('includes internal tie-chain dynamic changes in gain automation', () => {
  const score: Passage = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 2, tieToNext: true, dynamic: 'pp', hairpinStart: 'crescendo' }, { midi: 72, beats: 2, dynamic: 'ff', hairpinEnd: true }]] };
  const notes = createSchedule(score, 60).notes;
  expect(notes).toHaveLength(1);
  expect(notes[0].gainAutomation?.[0]).toEqual({ time: 0, gain: 0.25, linear: false });
  expect(notes[0].gainAutomation?.[1]).toEqual({ time: 2, gain: 0.92, linear: true });
  expect(notes[0].gainAutomation?.at(-1)?.gain).toBeCloseTo(0.92);
  expect(notes[0].duration).toBe(4);
});
