import { describe, expect, it } from 'vitest';
import { generatePassage, passageToAbc, seededRandom } from './music';
import { DEFAULT_OPTIONS, type KeyName } from './types';

describe('musical generation', () => {
  for (const key of ['C', 'G', 'D', 'F', 'Bb'] as KeyName[]) {
    for (const meter of [3, 4] as const) {
      for (const difficulty of ['beginner', 'intermediate'] as const) {
        it(`${key} ${meter}/4 ${difficulty} produces complete diatonic measures`, () => {
          const tonic = { C: 0, G: 7, D: 2, F: 5, Bb: 10 }[key];
          for (let seed = 0; seed < 30; seed++) {
            const passage = generatePassage({ ...DEFAULT_OPTIONS, key, meter, difficulty, measures: 8 }, seededRandom(seed));
            expect(passage.bars).toHaveLength(8);
            for (const bar of passage.bars) {
              expect(bar.reduce((sum, n) => sum + n.beats, 0)).toBe(meter);
              for (const note of bar) {
                expect(note.midi).toBeGreaterThanOrEqual(difficulty === 'beginner' ? 55 : 52);
                expect(note.midi).toBeLessThanOrEqual(difficulty === 'beginner' ? 79 : 84);
                expect([0, 2, 4, 5, 7, 9, 11]).toContain((note.midi - tonic + 12) % 12);
                expect(note.beats).toBeGreaterThan(0);
                if (difficulty === 'beginner') expect(Number.isInteger(note.beats)).toBe(true);
              }
            }
            expect(passage.bars.at(-1)!.at(-1)!.midi % 12).toBe(tonic);
          }
        });
      }
    }
  }
  it('reproduces seeds and varies distinct seeds', () => {
    expect(generatePassage(DEFAULT_OPTIONS, seededRandom(42))).toEqual(generatePassage(DEFAULT_OPTIONS, seededRandom(42)));
    expect(generatePassage(DEFAULT_OPTIONS, seededRandom(42))).not.toEqual(generatePassage(DEFAULT_OPTIONS, seededRandom(43)));
  });
  it('emits written notation with key, meter, tempo and final barline', () => {
    const abc = passageToAbc(generatePassage({ ...DEFAULT_OPTIONS, key: 'Bb', meter: 3 }, seededRandom(1)));
    expect(abc).toContain('K:Bb clef=treble');
    expect(abc).toContain('M:3/4');
    expect(abc).toContain('Q:1/4=80');
    expect(abc.endsWith('|]')).toBe(true);
  });
  it('spells Bb and Eb via key signature without redundant accidentals', () => {
    const abc = passageToAbc({ options: { ...DEFAULT_OPTIONS, key: 'Bb' }, bars: [[{ midi: 70, beats: 2 }, { midi: 75, beats: 2 }]] });
    expect(abc).toContain('B4 e4 |]');
  });
  it('rejects malformed options instead of looping or producing empty pitches', () => {
    expect(() => generatePassage({ ...DEFAULT_OPTIONS, measures: NaN })).toThrow();
    expect(() => generatePassage({ ...DEFAULT_OPTIONS, tempo: 0 })).toThrow();
  });
});

it('beams eighth notes within beats and separates successive beats', () => {
  const abc = passageToAbc({ options: DEFAULT_OPTIONS, bars: [[60, 62, 64, 65].map(midi => ({ midi, beats: 0.5 }))] });
  expect(abc).toContain('C1D1 E1F1 |]');
});
it('serializes rests without beaming through them', () => {
  const abc = passageToAbc({ options: DEFAULT_OPTIONS, bars: [[{ midi: 60, beats: 0.5 }, { midi: -1, beats: 0.5 }, { midi: -1, beats: 1 }, { midi: 64, beats: 2 }]] });
  expect(abc).toContain('C1 z1 z2 E4 |]');
});
it('does not beam eighths across a beat boundary after an offbeat quarter', () => {
  const abc = passageToAbc({ options: DEFAULT_OPTIONS, bars: [[{ midi: 60, beats: 0.5 }, { midi: 62, beats: 1 }, { midi: 64, beats: 0.5 }, { midi: 65, beats: 0.5 }, { midi: 67, beats: 0.5 }]] });
  expect(abc).toContain('C1 D2 E1 F1G1 |]');
});
