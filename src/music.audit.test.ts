import abcjs from 'abcjs';
import { describe, expect, it } from 'vitest';
import { generatePassage, passageToAbc, seededRandom } from './music';
import { createSchedule } from './audio';
import { DEFAULT_OPTIONS, type KeyName } from './types';

// 5 keys × 2 meters × 2 difficulties × 4 lengths × 15 seeds = 1,200 cases.
// Decode with the real notation library instead of testing our serializer against itself.
describe('1,200-exercise deterministic music/notation/playback audit', () => {
  for (const key of ['C', 'G', 'D', 'F', 'Bb'] as KeyName[]) {
    for (const meter of [3, 4] as const) {
      for (const difficulty of ['beginner', 'intermediate'] as const) {
        it(`${key}, ${meter}/4, ${difficulty}: 60 seeded configurations`, () => {
          for (const measures of [1, 4, 8, 32]) for (let seed = 0; seed < 15; seed++) {
            const tempo = [30, 40, 80, 180, 240][seed % 5];
            const options = { key, meter, difficulty, measures, tempo };
            const source = generatePassage(options, seededRandom(seed));
            expect(source).toEqual(generatePassage(options, seededRandom(seed)));
            expect(source.options).toEqual(options);
            expect(source.bars).toHaveLength(measures);
            const tonic = { C: 0, G: 7, D: 2, F: 5, Bb: 10 }[key];
            for (const bar of source.bars) {
              expect(bar.reduce((sum, n) => sum + n.beats, 0)).toBe(meter);
              let beat = 0;
              for (const note of bar) {
                expect(Number.isInteger(note.midi)).toBe(true);
                expect(note.midi).toBeGreaterThanOrEqual(difficulty === 'beginner' ? 55 : 52);
                expect(note.midi).toBeLessThanOrEqual(difficulty === 'beginner' ? 79 : 84);
                expect([0, 2, 4, 5, 7, 9, 11]).toContain((note.midi - tonic + 12) % 12);
                expect(difficulty === 'beginner' ? [1, 2] : [0.5, 1, 2]).toContain(note.beats);
                if (beat % 1 !== 0) expect(note.beats).toBe(0.5);
                if (meter === 4 && beat === 1) expect(note.beats).not.toBe(2);
                beat += note.beats;
              }
            }
            expect(source.bars.at(-1)!.at(-1)!.midi % 12).toBe(tonic);
            const tune = abcjs.parseOnly(passageToAbc(source))[0];
            expect(tune.warnings ?? []).toEqual([]);
            const decoded = tune.setUpAudio({}).tracks[0].filter(event => event.cmd === 'note');
            const flattened = source.bars.flat();
            const schedule = createSchedule(source, tempo);
            expect(decoded).toHaveLength(flattened.length);
            expect(schedule.notes).toHaveLength(flattened.length);
            expect(schedule.duration).toBeCloseTo(measures * meter * 60 / tempo, 8);
            decoded.forEach((event, index) => {
              expect(event.pitch).toBe(flattened[index].midi);
              expect(event.duration * 4).toBe(flattened[index].beats);
              expect(schedule.notes[index].midi).toBe(event.pitch - 2);
              expect(schedule.notes[index].duration).toBeCloseTo(event.duration * 4 * 60 / tempo, 8);
              expect(schedule.notes[index].time).toBeCloseTo(event.start * 4 * 60 / tempo, 8);
            });
          }
        }, 15000);
      }
    }
  }
});

it('rejects prototype keys and malformed random sources', () => {
  expect(() => generatePassage({ ...DEFAULT_OPTIONS, key: 'constructor' as KeyName })).toThrow('Invalid');
  for (const value of [NaN, Infinity, -0.1, 1]) {
    expect(() => generatePassage(DEFAULT_OPTIONS, () => value)).toThrow('Random source');
  }
});

it('the notation parser preserves rest silence and subsequent sounding timing', () => {
  const source = { options: DEFAULT_OPTIONS, bars: [[{ midi: 72, beats: 1 }, { midi: -1, beats: 1 }, { midi: 67, beats: 2 }]] };
  const parsed = abcjs.parseOnly(passageToAbc(source))[0].setUpAudio({});
  const notes = parsed.tracks[0].filter(event => event.cmd === 'note');
  expect(notes.map(note => [note.pitch, note.start * 4, note.duration * 4])).toEqual([[72, 0, 1], [67, 2, 2]]);
  expect(createSchedule(source, 60).notes.map(note => [note.midi, note.time, note.duration])).toEqual([[70, 0, 1], [65, 2, 2]]);
});
