import abcjs from 'abcjs';
import { describe, expect, it } from 'vitest';
import { generatePassage, passageToAbc, seededRandom } from './music';
import { createSchedule } from './audio';
import { eventTicks, TICKS_PER_BEAT, type KeyName, type Difficulty } from './types';

const keys: KeyName[] = ['C','G','D','A','E','B','F#','F','Bb','Eb','Ab','Db','Gb'];
const levels: Difficulty[] = ['beginner','intermediate','advanced','expert'];
describe('real notation parser and sampled playback use the same score', () => {
  for (const key of keys) it(key + ': all difficulties and both meters preserve attacks, pitch and timing', () => {
    for (const difficulty of levels) for (const meter of [3,4] as const) {
      const passage = generatePassage({key,difficulty,meter,measures:8,tempo:137,articulation:'mixed',articulationComplexity:'patterned',dynamics:'expressive',restFrequency:'medium'},seededRandom(187));
      const tune = abcjs.parseOnly(passageToAbc(passage))[0];
      expect(tune.warnings ?? []).toEqual([]);
      const renderedNotes = tune.setUpAudio({}).tracks[0].filter(event => event.cmd === 'note');
      const schedule = createSchedule(passage,137);
      expect(renderedNotes.length).toBe(schedule.notes.length);
      renderedNotes.forEach((note,index) => {
        expect(note.pitch - 2).toBe(schedule.notes[index].midi);
        expect(note.start * 4 * 60 / 137).toBeCloseTo(schedule.notes[index].time,7);
        expect(note.duration * 4 * 60 / 137).toBeCloseTo(schedule.notes[index].duration,7);
      });
      expect(schedule.duration).toBeCloseTo(8 * meter * 60 /137,8);
      expect(passage.bars.every(bar => bar.reduce((total,event)=>total+eventTicks(event),0)===meter*TICKS_PER_BEAT)).toBe(true);
    }
  });
});
