import abcjs from 'abcjs';
import { describe, expect, it } from 'vitest';
import { generatePassage, passageToAbc, seededRandom } from './music';
import { createSchedule } from './audio';
import { METER_NAMES, resolveMeter } from './meter';
import { eventTicks, type KeyName, type Difficulty } from './types';

const keys: KeyName[] = ['C','G','D','A','E','B','F#','F','Bb','Eb','Ab','Db','Gb','Cb','C#'];
const levels: Difficulty[] = ['beginner','intermediate','advanced','expert'];
describe('real notation parser and sampled playback use the same score', () => {
  for (const key of keys) it(key + ': all difficulties and all 13 meters preserve attacks, pitch and timing', () => {
    for (const difficulty of levels) for (const timeSignature of METER_NAMES) {
      const metric = resolveMeter(timeSignature);
      const passage = generatePassage({key,difficulty,meter:4,timeSignature,measures:8,tempo:137,articulation:'mixed',articulationComplexity:'patterned',dynamics:'expressive',restFrequency:'medium'},seededRandom(187));
      const tune = abcjs.parseOnly(passageToAbc(passage))[0];
      expect(tune.warnings ?? []).toEqual([]);
      const renderedNotes = tune.setUpAudio({}).tracks[0].filter(event => event.cmd === 'note');
      const schedule = createSchedule(passage,137);
      expect(renderedNotes.length).toBe(schedule.notes.length);
      // abcjs rounds tuplet multipliers to six decimals; allow < 0.05 ms.
      renderedNotes.forEach((note,index) => {
        expect(note.pitch - 2).toBe(schedule.notes[index].midi);
        expect(note.start * 384 / metric.beatTicks * 60 / 137).toBeCloseTo(schedule.notes[index].time,4);
        expect(note.duration * 384 / metric.beatTicks * 60 / 137).toBeCloseTo(schedule.notes[index].duration,4);
      });
      expect(schedule.duration).toBeCloseTo(8 * metric.barTicks / metric.beatTicks * 60 /137,8);
      expect(passage.bars.every(bar => bar.reduce((total,event)=>total+eventTicks(event),0)===metric.barTicks)).toBe(true);
    }
  });
});
